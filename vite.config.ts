import { Buffer } from 'node:buffer';
import { globSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
    brotliCompressSync,
    constants as zlibConstants,
    gzipSync
} from 'node:zlib';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssNormalize from 'postcss-normalize';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import { defineConfig, type Plugin, type UserConfig } from 'vite';

const allowedTargets = ['server', 'static'] as const;
type BuildTarget = (typeof allowedTargets)[number];

const isBuildTarget = (target: string | undefined): target is BuildTarget =>
    allowedTargets.includes(target as BuildTarget);

const SRC = path.join(import.meta.dirname, 'src/main/resources');
const OUT = path.join(import.meta.dirname, 'build/resources/main');
const STATIC_SRC = path.join(SRC, 'static');
const STATIC_OUT = path.join(OUT, 'static');

export default defineConfig(() => {
    const target = isBuildTarget(process.env.BUILD_TARGET)
        ? process.env.BUILD_TARGET
        : 'server';
    const isProduction = process.env.NODE_ENV !== 'development';

    const COMPRESSIBLE = /\.(?:js|css|svg|ttf|json|ico)$/;

    const assetPipeline = (): Plugin => ({
        name: 'standardidprovider:asset-pipeline',
        apply: 'build',
        generateBundle: {
            order: 'post',
            handler(_options, bundle) {
                const buildtime = JSON.stringify({
                    timeSinceEpoch: Date.now()
                });
                this.emitFile({
                    type: 'asset',
                    fileName: 'buildtime.json',
                    source: buildtime
                });

                if (!isProduction) {
                    return;
                }

                for (const chunk of Object.values(bundle)) {
                    if (
                        chunk.type === 'asset' &&
                        chunk.fileName.endsWith('.css') &&
                        typeof chunk.source === 'string'
                    ) {
                        chunk.source = chunk.source.replaceAll(
                            /\/\*\$vite\$:\d+\*\//g,
                            ''
                        );
                    }
                }

                const files = Object.entries(bundle).map(
                    ([fileName, chunk]) =>
                        [
                            fileName,
                            Buffer.from(
                                chunk.type === 'asset'
                                    ? chunk.source
                                    : chunk.code
                            )
                        ] as const
                );
                files.push(['buildtime.json', Buffer.from(buildtime)]);

                for (const [fileName, source] of files) {
                    if (!COMPRESSIBLE.test(fileName)) {
                        continue;
                    }

                    this.emitFile({
                        type: 'asset',
                        fileName: `${fileName}.gz`,
                        source: gzipSync(source, { level: 9 })
                    });
                    this.emitFile({
                        type: 'asset',
                        fileName: `${fileName}.br`,
                        source: brotliCompressSync(source, {
                            params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 }
                        })
                    });
                }
            }
        }
    });

    const copyStatic = (dirs: string[]): Plugin => ({
        name: 'standardidprovider:copy-static',
        apply: 'build',
        generateBundle() {
            const walk = (dir: string): string[] =>
                readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
                    const full = path.join(dir, entry.name);
                    return entry.isDirectory() ? walk(full) : full;
                });

            for (const dir of dirs) {
                for (const file of walk(path.join(STATIC_SRC, dir))) {
                    this.emitFile({
                        type: 'asset',
                        fileName: path
                            .relative(STATIC_SRC, file)
                            .split(path.sep)
                            .join('/'),
                        source: readFileSync(file)
                    });
                }
            }
        }
    });

    const serverEntries = Object.fromEntries(
        globSync('**/*.ts', {
            cwd: SRC,
            exclude: ['static/**', '**/*.d.ts']
        }).map((file) => [file.replace(/\.ts$/, ''), path.join(SRC, file)])
    );

    const CONFIGS: Record<BuildTarget, UserConfig> = {
        server: {
            root: SRC,
            mode: isProduction ? 'production' : 'development',
            build: {
                outDir: OUT,
                emptyOutDir: false,
                target: 'es2023',
                minify: false,
                sourcemap: false,
                lib: {
                    entry: serverEntries,
                    formats: ['cjs']
                },
                rollupOptions: {
                    external: /^\/lib\//,
                    output: {
                        entryFileNames: '[name].js',
                        preserveModules: true,
                        preserveModulesRoot: SRC
                    }
                }
            }
        },
        static: {
            root: STATIC_SRC,
            base: './',
            mode: isProduction ? 'production' : 'development',
            plugins: [copyStatic(['icons', 'images']), assetPipeline()],
            build: {
                outDir: STATIC_OUT,
                emptyOutDir: false,
                minify: isProduction,
                cssMinify: false,
                sourcemap: !isProduction,
                cssCodeSplit: false,
                assetsInlineLimit: 0,
                rollupOptions: {
                    input: path.join(STATIC_SRC, 'js/main.js'),
                    output: {
                        format: 'iife',
                        entryFileNames: 'js/_all.js',
                        assetFileNames(assetInfo) {
                            const assetName = assetInfo.names[0] ?? '';
                            if (assetName.endsWith('.css')) {
                                return 'styles/_all.css';
                            }

                            const original = assetInfo.originalFileNames[0];
                            return original
                                ? original.split(path.sep).join('/')
                                : '[name][extname]';
                        }
                    }
                }
            },
            resolve: {
                alias: {
                    '~enonic-admin-artifacts':
                        'enonic-admin-artifacts/index.less'
                }
            },
            css: {
                postcss: {
                    plugins: [
                        postcssNormalize(),
                        autoprefixer(),
                        postcssSortMediaQueries({ sort: 'desktop-first' }),
                        ...(isProduction ? [cssnano()] : [])
                    ]
                }
            }
        }
    };

    return CONFIGS[target];
});

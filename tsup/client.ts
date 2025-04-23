import type { Options } from '.';

// Import {compressPlugin} from '@liber-ufpe/esbuild-plugin-compress';
// import htmlPlugin from '@chialab/esbuild-plugin-html'

// import {constants} from "node:zlib";
import { globSync } from 'glob';
import { AND_BELOW, DIR_SRC_ASSETS } from './constants';
import { dict } from './dict';

export default function buildAssetConfig(): Options {
    const GLOB_EXTENSIONS_ASSETS = '{tsx,ts,jsx,js}';
    // Const GLOB_EXTENSIONS_ASSETS = '{tsx,ts,jsx,js,html,css}';

    const FILES_ASSETS = globSync(
        `${DIR_SRC_ASSETS}/${AND_BELOW}/*.${GLOB_EXTENSIONS_ASSETS}`,
        {
            posix: true
        }
    );

    const ASSETS_JS_ENTRY = dict(
        FILES_ASSETS.map((k) => [
            k.replace(`${DIR_SRC_ASSETS}/`, '').replace(/\.[^.]*$/, ''), // Name
            // .replace(/\.ts$/, '.mjs')
            k
        ])
    );
    // Console.log(ASSETS_JS_ENTRY);

    return {
        bundle: true,
        dts: false, // D.ts files are use useless at runtime
        entry: ASSETS_JS_ENTRY,

        esbuildPlugins: [
            // HtmlPlugin(),
            // compressPlugin({
            //   brotli: true,
            //   brotliOptions: {},
            //   deflate: false,
            //   deflateOptions: {level: constants.Z_BEST_COMPRESSION},
            //   excludes: [],
            //   gzip: true,
            //   gzipOptions: {level: constants.Z_BEST_COMPRESSION}
            // })
        ],

        // By default tsup bundles all imported modules, but dependencies
        // and peerDependencies in your packages.json are always excluded
        // external: [ // Must be loaded into global scope instead
        // ],

        format: ['esm'],

        loader: {
            '.css': 'text'
            // '.html': 'text',
        },
        // Metafile: true, // Needed by esbuild-plugin-compress

        minify: process.env.NODE_ENV !== 'development',
        // NoExternal: [],
        platform: 'browser',

        silent: ['QUIET', 'WARN'].includes(
            process.env.LOG_LEVEL_FROM_GRADLE || ''
        ),

        splitting: true,
        sourcemap: process.env.NODE_ENV !== 'development',
        tsconfig: `${DIR_SRC_ASSETS}/tsconfig.json`
    };
}

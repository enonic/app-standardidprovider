import {getResource, readText} from '/lib/xp/io';

export const readResource = (path: string) => {
    const resource = getResource(path);
    if (!resource || !resource.exists()) {
        throw new Error(
            `Resource empty or not found: ${path}`
        );
    }
    let content;
    try {
        content = readText(resource.getStream());
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`readResource failed for ${path}: ${errorMessage}`);
    }
    return content;
}

export const readJsonResource = (path: string) => {
    const content = readResource(path);
    let object;
    try {
        object = JSON.parse(content);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        throw new Error(`readJsonResource failed for ${path} and content ${content}: ${errorMessage}`);
    }
    return object;
}

export const readJsonResourceProperty = function (path: string, property: string) {
    return readJsonResource(path)[property];
}

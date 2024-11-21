const ioLib = require('/lib/xp/io');

exports.readResource = function (path) {
    const resource = ioLib.getResource(path);
    if (!resource || !resource.exists()) {
        throw new Error(
            `Resource empty or not found: ${path}`
        );
    }
    let content;
    try {
        content = ioLib.readText(resource.getStream());
    } catch (e) {
        log.error(e.message);
        throw new Error(`Error when readText(${path})!`);
    }
    return content;
}

exports.readJsonResource = function (path) {
    const content = exports.readResource(path);
    let object;
    try {
        object = JSON.parse(content);
    } catch (e) {
        log.error(e.message);
        log.info(`Dump from resource:${path} content:${content}`);
        throw new Error(`Error when JSON.parse(${path})`);
    }
    return object;
}

exports.readJsonResourceProperty = function (path, property) {
    return exports.readJsonResource(path)[property];
}

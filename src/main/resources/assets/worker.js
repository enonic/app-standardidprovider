async function generateRSAKeys() {
    const keyPair = await self.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048, // 4096
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );


    const privateKey = await exportPrivateKey(keyPair.privateKey);
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const kid = generateKid();

    postMessage({
        kid: kid,
        publicKey: publicKey,
        privateKey: privateKey,
    });
}

function arrayBufferToString(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function exportPrivateKey(key) {
    const exported = await self.crypto.subtle.exportKey("pkcs8", key);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = self.btoa(exportedAsString);
    return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
}

async function exportPublicKey(key) {
    const exported = await self.crypto.subtle.exportKey("spki", key);
    const exportedAsString = arrayBufferToString(exported);
    const exportedAsBase64 = self.btoa(exportedAsString);
    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
}

function generateKid() {
    return self.crypto.randomUUID();
}

onmessage = function (event) {
    // console.log(event);
    generateRSAKeys();
}


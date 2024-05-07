document.addEventListener("DOMContentLoaded", () => {
    const publicKeyTextarea = document.getElementById("public-key");
    const messageInput = document.getElementById("message");
    const encryptButton = document.getElementById("encrypt-button");
    const encryptedResult = document.getElementById("encrypted-result");

    encryptButton.addEventListener("click", async () => {
        const publicKeyPem = publicKeyTextarea.value;
        const message = messageInput.value;

        try {
            const publicKey = await importPublicKey(publicKeyPem);
            const encryptedMessage = await encryptWithPublicKey(publicKey, message);

            // Mostrar el resultado cifrado en el textarea
            encryptedResult.value = encryptedMessage;
        } catch (error) {
            encryptedResult.value = "Error: " + error.message;
        }
    });

    async function importPublicKey(pem) {
        const publicKeyData = pemToDer(pem);
        return await crypto.subtle.importKey("spki", publicKeyData, {
            name: "RSA-OAEP",
            hash: "SHA-256"
        }, true, ["encrypt"]);
    }

    async function encryptWithPublicKey(publicKey, message) {
        const encodedMessage = new TextEncoder().encode(message);
        const encryptedBuffer = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encodedMessage);
        return bufferToBase64(encryptedBuffer);
    }

    function pemToDer(pem) {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.replace(pemHeader, "").replace(pemFooter, "").trim();
        return base64StringToArrayBuffer(pemContents);
    }

    function base64StringToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function bufferToBase64(buffer) {
        const binary = new Uint8Array(buffer);
        let base64 = "";
        for (let i = 0; i < binary.length; i++) {
            base64 += String.fromCharCode(binary[i]);
        }
        return window.btoa(base64);
    }
});
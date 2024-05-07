document.addEventListener("DOMContentLoaded", () => {
    const accesoSimetricoInput = document.getElementById("accesoSimetrico");
    const codigoAutentificacionHashInput = document.getElementById("codigoAutentificacionHash");
    const jsonInput = document.getElementById("message");
    const encryptButton = document.getElementById("encrypt-button");
    const encryptedResultJson = document.getElementById("encrypted-result-json");

    encryptButton.addEventListener("click", async () => {
        try {
            const keyBytes = getKeyFromInput(accesoSimetricoInput);

            const encryptionKey = await crypto.subtle.importKey(
                'raw',
                keyBytes,
                { name: 'AES-GCM', length: 128 },
                true,
                ['encrypt', 'decrypt']
            );

            const codigoAutentificacion = codigoAutentificacionHashInput.value;

            const encryptedJSON = await encryptJsonRecursively(JSON.parse(jsonInput.value), encryptionKey, codigoAutentificacion);

            // Convertimos el objeto JSON cifrado en una cadena para mostrarlo en el resultado
            const encryptedJSONString = JSON.stringify(encryptedJSON, null, 2);

            encryptedResultJson.value = encryptedJSONString;

        } catch (error) {
            encryptedResultJson.value = "Error: No se pudo realizar el cifrado " + error;
        }
    });
});

async function encryptJsonRecursively(json, encryptionKey, codigoAutentificacion) {
    if (Array.isArray(json)) {
        return Promise.all(json.map(item => encryptJsonRecursively(item, encryptionKey, codigoAutentificacion)));
    } else if (typeof json === 'object' && json !== null) {
        if (json.constructor === Object) {
            const encryptedObject = {};
            for (const key in json) {
                if (key.startsWith('-')) {
                    const encryptedKey = key.substring(1); // Quitar el guión "-"
                    encryptedObject[encryptedKey] = await encryptWithAESGCM(encryptionKey, json[key], codigoAutentificacion);
                } else {
                    encryptedObject[key] = await encryptJsonRecursively(json[key], encryptionKey, codigoAutentificacion);
                }
            }
            return encryptedObject;
        } else {
            // Si no es un objeto, como una cadena o número, mantenerlo tal cual
            return json;
        }
    } else {
        return json;
    }
}

async function encryptWithAESGCM(encryptionKey, message, codigoAutentificacion) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const messageBytes = new TextEncoder().encode(message);
    const authCodeBytes = new TextEncoder().encode(codigoAutentificacion);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
            additionalData: authCodeBytes, // Agregamos el código de autenticación como dato adicional
            tagLength: 128,
        },
        encryptionKey,
        messageBytes
    );

    // Convertimos los datos cifrados a Base64
    const encryptedBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted)));
    
    return encryptedBase64;
}

function getKeyFromInput(inputElement) {
    const key = inputElement.value;
    const keyBytes = new Uint8Array(key.length);
    for (let i = 0; i < key.length; i++) {
        keyBytes[i] = key.charCodeAt(i);
    }
    return keyBytes;
}

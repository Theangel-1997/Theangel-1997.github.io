document.addEventListener("DOMContentLoaded", () => {
    const accesoSimetricoInput = document.getElementById("accesoSimetrico");
    const codigoAutentificacionHashInput = document.getElementById("codigoAutentificacionHash");
    const jsonInput = document.getElementById("message");
    const encryptButton = document.getElementById("encrypt-button");
    const encryptedResultJson = document.getElementById("encrypted-result-json");
    const accesoSimetricoDecifradoInput = document.getElementById("accesoSimetricoDecifrado");
    const codigoAutentificacionHashDecifradoInput = document.getElementById("codigoAutentificacionHashDecifrado");
    const jsonInputDecifrar = document.getElementById("messajedecifrar");
    const desencryptButton = document.getElementById("desencrypt-button");
    const desencryptedResultJson = document.getElementById("desencrypted-result-json");

    // Declara la variable encoder
    const encoder = new TextEncoder();

    encryptButton.addEventListener("click", async () => {
        // Valida que los campos no estén vacíos
        if (
            accesoSimetricoInput.value.length === 0 ||
            codigoAutentificacionHashInput.value.length === 0 ||
            jsonInput.value.length === 0
        ) {
            alert("Favor de completar todos los campos.");
            return;
        }

        try {
            const accessKey = await importKeyFromString(accesoSimetricoInput.value);
            const associatedData = codigoAutentificacionHashInput.value;
            const jsonMessage = JSON.parse(jsonInput.value);

            const encryptedJson = await encryptJsonRecursively(accessKey, jsonMessage, associatedData);
            encryptedResultJson.value = JSON.stringify(encryptedJson);
        } catch (error) {
            encryptedResultJson.value = "Error: No se pudo realizar el cifrado " + error;
        }
    });

    desencryptButton.addEventListener("click", async () => {
        // Valida que los campos no estén vacíos
        if (
            accesoSimetricoDecifradoInput.value.length === 0 ||
            codigoAutentificacionHashDecifradoInput.value.length === 0 ||
            jsonInputDecifrar.value.length === 0
        ) {
            alert("Favor de completar todos los campos.");
            return;
        }

        try {
            const accessKey = await importKeyFromString(accesoSimetricoDecifradoInput.value);
            const associatedData = codigoAutentificacionHashDecifradoInput.value;
            const encryptedJson = JSON.parse(jsonInputDecifrar.value);

            const decryptedJson = await decryptJsonRecursively(accessKey, encryptedJson, associatedData);
            desencryptedResultJson.value = JSON.stringify(decryptedJson);
        } catch (error) {
            desencryptedResultJson.value = "Error: No se pudo realizar el descifrado " + error;
        }
    });



    async function importKeyFromString(keyString) {
        // Decodifica la clave desde Base64 a un ArrayBuffer
        const keyBytes = new Uint8Array(
            Array.prototype.map.call(atob(keyString), (c) => c.charCodeAt(0))
        );

        // Importa la clave como un CryptoKey
        return await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }

    async function encryptJsonRecursively(key, json, associatedData) {
        if (Array.isArray(json)) {
            return Promise.all(json.map(item => encryptJsonRecursively(key, item, associatedData)));
        } else if (typeof json === 'object' && json !== null) {
            if (json.constructor === Object) {
                const encryptedObject = {};
                for (const key in json) {
                    if (key.startsWith('-')) {
                        const encryptedKey = key.substring(1); // Quitar el guión "-"
                        encryptedObject[encryptedKey] = await encryptWithAESGCM(key, json[key], associatedData);
                    } else {
                        encryptedObject[key] = await encryptJsonRecursively(key, json[key], associatedData);
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

    async function decryptJsonRecursively(key, encryptedJson, associatedData) {
        if (Array.isArray(encryptedJson)) {
            return Promise.all(encryptedJson.map(item => decryptJsonRecursively(key, item, associatedData)));
        } else if (typeof encryptedJson === 'object' && encryptedJson !== null) {
            if (encryptedJson.constructor === Object) {
                const decryptedObject = {};
                for (const key in encryptedJson) {
                    if (key.startsWith('-')) {
                        const decryptedKey = key.substring(1); // Quitar el guión "-"
                        decryptedObject[decryptedKey] = await decryptWithAESGCM(key, encryptedJson[key], associatedData);
                    } else {
                        decryptedObject[key] = await decryptJsonRecursively(key, encryptedJson[key], associatedData);
                    }
                }
                return decryptedObject;
            } else {
                // Si no es un objeto, como una cadena o número, mantenerlo tal cual
                return encryptedJson;
            }
        } else {
            return encryptedJson;
        }
    }

    async function encryptWithAESGCM(key, data, associatedData) {
        const iv = crypto.getRandomValues(new Uint8Array(12)); // IV de 12 bytes (96 bits)

        const encryptedData = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
                additionalData: encoder.encode(associatedData),
                tagLength: 128, // Longitud del tag de autenticación (en bits)
            },
            key,
            encoder.encode(data)
        );

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedData)),
        };
    }

    async function decryptWithAESGCM(key, encryptedData, associatedData) {
        const iv = new Uint8Array(encryptedData.iv);
        const data = new Uint8Array(encryptedData.data);

        const decryptedData = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
                additionalData: encoder.encode(associatedData),
                tagLength: 128, // Longitud del tag de autenticación (en bits)
            },
            key,
            data
        );

        return decoder.decode(decryptedData);
    }
});


//codigo para el menu

document.addEventListener("DOMContentLoaded", function () {
    const servicesMenu = document.getElementById("services-menu");
    const dropdownMenu = document.getElementById("dropdown-menu");

    let timeoutId;

    servicesMenu.addEventListener("mouseenter", function () {
        clearTimeout(timeoutId); // Limpiar el temporizador actual si existe
        dropdownMenu.style.display = "block";
    });

    servicesMenu.addEventListener("mouseleave", function () {
        timeoutId = setTimeout(function () {
            dropdownMenu.style.display = "none";
        }, 50); // 2000 milisegundos = 2 segundos
    });
});
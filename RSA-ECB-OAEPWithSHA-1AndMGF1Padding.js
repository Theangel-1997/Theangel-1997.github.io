document.addEventListener("DOMContentLoaded", () => {

    //se obtiene los id de los elmentos del hml del form cifrado
    const publicKeyTextarea = document.getElementById("public-key");
    const jsonInput = document.getElementById("message");
    const encryptButton = document.getElementById("encrypt-button");
    const encryptedResultJson = document.getElementById("encrypted-result-json");

    //se obtiene los id de los elmentos del hml del form decifrado
    const privateKeyTextarea = document.getElementById("private-key");
    const jsonInputDecifrar = document.getElementById("messajedecifrar");
    const desencryptButton = document.getElementById("desencrypt-button");
    const desencryptedResultJson = document.getElementById("desencrypted-result-json");


    encryptButton.addEventListener("click", async () => {

        //se valida que los textarea no esten vacio
        if (publicKeyTextarea.value.length == 0) {
            alert("Favor de agregar la llave publica");
            return false;
        } else if (jsonInput.value.length == 0) {
            alert("Favor de agregar el json a cifrar");
            return false;
        } else {
            const publicKeyPem = publicKeyTextarea.value;
            const jsonMessage = jsonInput.value;

            try {
                const publicKey = await importPublicKey(publicKeyPem);
                const encryptedJson = await encryptJsonValues(jsonMessage, publicKey);

                // Mostrar el resultado JSON cifrado en el textarea
                encryptedResultJson.value = JSON.stringify(encryptedJson, null, 2);
            } catch (error) {
                encryptedResultJson.value = "Error: No se pudo realizar el cifrado " + error.message;
            }
        }

    });

    desencryptButton.addEventListener("click", async () => {
        //se valida que los textarea no esten vacio
        if (privateKeyTextarea.value.length == 0) {
            alert("Favor de agregar la llave privada");
            return false;
        } else if (jsonInputDecifrar.value.length == 0) {
            alert("Favor de agregar el json a decifrar");
            return false;
        } else {
            const privateKeyPem = privateKeyTextarea.value;
            const jsonMessagedes = jsonInputDecifrar.value;

            try {
                const privateKey = await importPrivateKey(privateKeyPem);
                const desencryptedJson = await desencryptJsonValues(jsonMessagedes, privateKey);

                // Mostrar el resultado JSON en claro en el textarea
                desencryptedResultJson.value = JSON.stringify(desencryptedJson, null, 2);
            } catch (error) {
                desencryptedResultJson.value = "Error: No se pudo realizar el decifrado" + error.message;
            }
        }
    });

    // Funciones de importPublicKey, pemToDer, base64StringToArrayBuffer, bufferToBase64 aquí...

    async function importPublicKey(pem) {
        const publicKeyData = pemToDer(pem);
        return await crypto.subtle.importKey("spki", publicKeyData, {
            name: "RSA-OAEP",
            hash: "SHA-1"
        }, true, ["encrypt"]);
    }

    async function importPrivateKey(pem) {
        const privateKeyData = pemToDerPrivate(pem);
        return await crypto.subtle.importKey("pkcs8", privateKeyData, {
            name: "RSA-OAEP",
            hash: "SHA-1"
        }, true, ["decrypt", "unwrapKey"]);
    }


    function pemToDer(pem) {
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = pem.replace(pemHeader, "").replace(pemFooter, "").trim();
        return base64StringToArrayBuffer(pemContents);
    }

    function pemToDerPrivate(pem) {
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
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

    function base64StringToArrayBuffer(base64) {
        const paddingLength = (4 - (base64.length % 4)) % 4;
        const paddedBase64 = base64 + '='.repeat(paddingLength);
        const binaryString = atob(paddedBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async function encryptJsonValues(jsonString, publicKey) {
        const jsonObject = JSON.parse(jsonString);
        return encryptJsonRecursively(jsonObject, publicKey);
    }

    async function desencryptJsonValues(jsonString, privateKey) {
        const jsonObject = JSON.parse(jsonString);
        return desencryptJsonRecursively(jsonObject, privateKey);
    }

    async function encryptJsonRecursively(json, publicKey) {
        if (Array.isArray(json)) {
            return Promise.all(json.map(item => encryptJsonRecursively(item, publicKey)));
        } else if (typeof json === 'object' && json !== null) {
            if (json.constructor === Object) {
                const encryptedObject = {};
                for (const key in json) {
                    if (key.startsWith('-')) {
                        const encryptedKey = key.substring(1); // Quitar el guión "-"
                        encryptedObject[encryptedKey] = await encryptWithPublicKey(publicKey, json[key]);
                    } else {
                        encryptedObject[key] = await encryptJsonRecursively(json[key], publicKey);
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

    async function desencryptJsonRecursively(json, privateKey) {
        if (Array.isArray(json)) {
            return Promise.all(json.map(item => desencryptJsonRecursively(item, privateKey)));
        } else if (typeof json === 'object' && json !== null) {
            if (json.constructor === Object) {
                const desencryptedObject = {};
                for (const key in json) {
                    if (key.startsWith('-')) {
                        const desencryptedKey = key.substring(1); // Quitar el guión "-"
                        desencryptedObject[desencryptedKey] = await decryptWithPrivateKey(privateKey, json[key]);
                    } else {
                        desencryptedObject[key] = await desencryptJsonRecursively(json[key], privateKey);
                    }
                }
                return desencryptedObject;
            } else {
                // Si no es un objeto, como una cadena o número, mantenerlo tal cual
                return json;
            }
        } else {
            return json;
        }
    }

    async function encryptWithPublicKey(publicKey, message) {
        const encodedMessage = new TextEncoder().encode(message);
        const encryptedBuffer = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encodedMessage);
        return bufferToBase64(encryptedBuffer);
    }

    async function decryptWithPrivateKey(privateKey, message) {
        const decodedMessage = base64StringToArrayBuffer(message);
        const decryptedBuffer = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, decodedMessage);
        const decryptedText = new TextDecoder().decode(decryptedBuffer);
        return decryptedText;
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
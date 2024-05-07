document.addEventListener("DOMContentLoaded", () => {

    const publicKeyTextarea = document.getElementById("public-key");
    const jsonInput = document.getElementById("message");
    const encryptButton = document.getElementById("encrypt-button");
    const encryptedResultJson = document.getElementById("encrypted-result-json");
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
            try {
                const publicKey = publicKeyTextarea.value;
                // Crea una instancia de JSEncrypt con la clave pública
                const crypt = new JSEncrypt();

                crypt.setPublicKey(publicKey);

                const jsonMessage = jsonInput.value;
                const jsonToEncrypt = JSON.parse(jsonMessage);

                if (typeof jsonToEncrypt === 'object' && jsonToEncrypt !== null) {
                    // Se valido que el json sea valido
                    const encryptedJson = await encryptJsonRecursively(jsonToEncrypt, crypt);
                    encryptedResultJson.value = JSON.stringify(encryptedJson, null, 2);
                } else {
                    throw new Error("La entrada no es un JSON válido.");
                }
            } catch (error) {
                encryptedResultJson.value = "Error: No se pudo realizar el cifrado " + error;
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
            try {
                // Obtiene la clave privada desde el textarea
                const privateKey = privateKeyTextarea.value;

                // Crea una instancia de JSEncrypt con la clave privada
                const crypt = new JSEncrypt();
                crypt.setPrivateKey(privateKey);

                const encryptedMessage = jsonInputDecifrar.value;

                if (typeof jsonInputDecifrar === 'object' && jsonInputDecifrar !== null) {
                    // Realizar descifrado recursivo para campos que comienzan con '-'
                    const decryptedJson = await desencryptJsonRecursively(JSON.parse(encryptedMessage), crypt);
                    desencryptedResultJson.value = JSON.stringify(decryptedJson, null, 2);
                } else {
                    throw new Error("La entrada no es un JSON válido.");
                }
            } catch (error) {
                desencryptedResultJson.value = "Error: No se pudo realizar el decifrado " + error;
            }
        }


    });

    async function encryptJsonRecursively(json, crypt) {
        if (Array.isArray(json)) {
            return Promise.all(json.map(item => encryptJsonRecursively(item, crypt)));
        } else if (typeof json === 'object' && json !== null) {
            if (json.constructor === Object) {
                const encryptedObject = {};
                for (const key in json) {
                    if (key.startsWith('-')) {
                        const encryptedKey = key.substring(1); // Quitar el guión "-"
                        encryptedObject[encryptedKey] = crypt.encrypt(json[key]);
                    } else {
                        encryptedObject[key] = await encryptJsonRecursively(json[key], crypt);
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

    async function desencryptJsonRecursively(json, crypt) {
        if (Array.isArray(json)) {
            return Promise.all(json.map(item => desencryptJsonRecursively(item, crypt)));
        } else if (typeof json === 'object' && json !== null) {
            if (json.constructor === Object) {
                const desencryptedObject = {};
                for (const key in json) {
                    if (key.startsWith('-')) {
                        const desencryptedKey = key.substring(1); // Quitar el guión "-"
                        desencryptedObject[desencryptedKey] = crypt.decrypt(json[key]);
                    } else {
                        desencryptedObject[key] = await desencryptJsonRecursively(json[key], crypt);
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
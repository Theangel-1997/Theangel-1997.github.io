crypto.subtle.generateKey(
    {
        name: "AES-GCM",
        length: 128
    },
    true,
    ["encrypt", "decrypt"]
)
    .then(keyPair => {
        // Convertir la clave a una representación hexadecimal
        return crypto.subtle.exportKey("raw", keyPair)
            .then(rawKey => {
                // Convierte el objeto ArrayBuffer a un array de bytes
                const keyArray = Array.from(new Uint8Array(rawKey));

                // Convierte el array de bytes a una cadena hexadecimal
                const keyHex = keyArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

                // Muestra la clave en formato hexadecimal
                console.log("Clave generada con éxito (Hex):", keyHex);
                // Imprimimos los datos cifrados
                encryptedResultJson.value = keyHex;
            });
    })
    .catch(err => {
        console.error("Error al generar la clave:", err);
    });

    clave 

    2dae94cd062e063e564acc7f909392e0
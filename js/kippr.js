// crypto API required
if (!window.crypto) {
  alert("Crypto API required for this application. Please update your browser.");
}

const encrypt = () => {
  const $plainText = document.getElementById("encrypt-plaintext")
  const $cipherLoad = document.getElementById("encrypt-cipherload")
  const $key = document.getElementById("encrypt-key")

  const plainText = $plainText.value;
  const encoder = new TextEncoder()
  const encoded = encoder.encode(plainText)

  const key = window.crypto.subtle.generateKey({
    name: "AES-GCM",
    length: 256
  }, true, [ "encrypt", "decrypt" ])

  // await key
  key.then(key => {
    // generate an iv
    const iv = window.crypto.getRandomValues(new Uint8Array(16))
    const cipher = window.crypto.subtle.encrypt({
      name: "AES-GCM",
      iv: iv
    }, key, encoded)

    // await ciphertext
    cipher.then(ct => {
      const cipherText = new Uint8Array(ct)
      const encodedCt = btoa(cipherText)
      const encodedIv = btoa(iv)
      const cipherLoad = encodedIv + ":" + encodedCt
      const exportKey = window.crypto.subtle.exportKey("raw", key)

      // await key
      exportKey.then(key => {
        const encodedKey = btoa(new Uint8Array(key))

        $cipherLoad.value = cipherLoad
        $key.value = encodedKey
      }).catch(e => console.error(e))
    }).catch(e => console.error(e))
  }).catch(e => console.error(e))
}

const decrypt = () => {
  const $cipherLoad = document.getElementById("decrypt-cipherload")
  const $key = document.getElementById("decrypt-key")
  const $plainText = document.getElementById("decrypt-plaintext")

  // get the iv and the ciphertext
  const fragments = $cipherLoad.value.split(":")
  const iv = new Uint8Array((atob(fragments[0]).split(",")))
  const cipherText = new Uint8Array((atob(fragments[1]).split(",")))

  // get an import the key
  const keyMaterial = new Uint8Array((atob($key.value).split(",")))
  const keyImport = window.crypto.subtle.importKey("raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    [ "encrypt", "decrypt" ])

    // await key
    keyImport.then(key => {
      const uncipher = window.crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: iv
      }, key, cipherText)

      // await plaintext
      uncipher.then(pt => {
        const plainText = String.fromCharCode.apply(null, new Uint8Array(pt))

        $plainText.value = plainText
      }).catch(e => console.error(e))
    }).catch(e => console.error(e))
}

const init = () => {
  // assign event handlers for form buttons
  document.getElementById("encrypt-submit").addEventListener("click", (e) => {
    e.preventDefault()
    encrypt()
  })
  document.getElementById("decrypt-submit").addEventListener("click", (e) => {
    e.preventDefault()
    decrypt()
  })
}

init()

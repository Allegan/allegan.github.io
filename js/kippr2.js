const showErrorBanner = (title, content) => {
  console.log(title + ": " + content)
}

const init = async () => {
  // encoders and decoders
  const textEncoder = new TextEncoder()
  const textDecoder = new TextDecoder()
  const encodeValue = (buff) => {
    let arr = []
    let buffer = new Uint8Array(buff)

    buffer.forEach(i => arr.push(i.toString(16)))

    return arr
      .map(i => (i.length === 1) ? "0" + i : i)
      .map(i => i.toUpperCase())
      .join("")
  }

  const decodeValue = (str) => {
    let buffer = str
      .split(/(.{2})/)
      .filter(i => i !== "")
      .map(i => parseInt(i, 16))

    return new Uint8Array(buffer)
  }

  const uint8ArrayToString = (buff) => {
    return String.fromCharCode.apply(null, new Uint8Array(buff))
  }

  // import/exporters
  const importKey = async (km) => {
    return window.crypto.subtle.importKey(
      "raw",
      km,
      "AES-GCM",
      true,
      ["encrypt", "decrypt"]
    )
  }

  const exportKey = async (key) => {
    return window.crypto.subtle.exportKey("raw", key)
  }

  // generators
  const generateEncryptionKey = async () => {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    )
  }

  // ui elements
  const form = {
    encrypt: {
      inKey: document.getElementById("encrypt-key"),
      plainText: document.getElementById("encrypt-plaintext"),
      submit: document.getElementById("encrypt-submit"),
      cipherText: document.getElementById("encrypt-cipherload"),
      exportKey: document.getElementById("encrypt-exportkey")
    },
    decrypt: {
      cipherText: document.getElementById("decrypt-cipherload"),
      inKey: document.getElementById("decrypt-key"),
      submit: document.getElementById("decrypt-submit"),
      plainText: document.getElementById("decrypt-plaintext")
    }
  }

  // encryption routine
  const encrypt = async () => {
    try {
      // read in values
      const inKey = form.encrypt.inKey.value
      const plainText = form.encrypt.plainText.value
      let key = undefined

      // encode the plaintext to Uint8Array
      const encodedText = textEncoder.encode(plainText)

      // generate an iv (rand is crypto secure here)
      const iv = window.crypto.getRandomValues(new Uint8Array(16))

      // check if there is a key
      // if so: validate and import
      // else: generate a new one
      if (inKey !== "") {
        let decodedKey = decodeValue(inKey)
        key = await importKey(decodedKey)
      } else {
        key = await generateEncryptionKey()
      }

      // encrypt encodedtext
      let cipherText = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        encodedText
      )

      // encode the iv and the ciphertext to hex
      const encodedCt = encodeValue(cipherText)
      const encodedIv = encodeValue(iv)
      const cipherLoad = JSON.stringify({
        iv: encodedIv,
        cipherText: encodedCt
      })

      // export and encode key
      const exportedKey = await exportKey(key)
      const encodedKey = encodeValue(exportedKey)

      // display
      form.encrypt.cipherText.value = cipherLoad
      form.encrypt.exportKey.value = encodedKey
    } catch (e) {
      showErrorBanner(e.name, e.message)
      return
    }
  }

  // decryption routine
  const decrypt = async () => {
    try {
      // read in values
      const inKey = form.decrypt.inKey.value
      const cipherLoad = form.encrypt.cipherText.value

      // parse iv and ciphertext
      const blob = JSON.parse(cipherLoad)
      const iv = decodeValue(blob.iv)
      const cipherText = decodeValue(blob.cipherText)

      // import key
      let decodedKey = decodeValue(inKey)
      const key = await importKey(decodedKey)

      // decrypt
      const encodedText = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        cipherText
      )

      // decode
      const plainText = uint8ArrayToString(encodedText)

      // display
      form.decrypt.plainText.value = plainText
    } catch (e) {
      showErrorBanner(e.name, e.message)
      return
    }
  }

  // event handlers
  form.encrypt.submit.addEventListener("click", async (e) => {
    try {
      e.preventDefault()
      encrypt()
    } catch (e) {
      showErrorBanner(e.name, e.message)
    }
  })

  form.decrypt.submit.addEventListener("click", async (e) => {
    try {
      e.preventDefault()
      decrypt()
    } catch (e) {
      showErrorBanner(e.name, e.message)
    }
  })
}

if (window.crypto) {
  init()
} else {
  showErrorBanner(
    "Crypto not supported!",
    "Please upgrade your browser to a newer version with support for the crypto API."
  )
}

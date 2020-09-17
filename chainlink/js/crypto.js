// used for the common, private, shared, and secret DH
// used for the iv
const generate32Random = () => {
  return window.crypto.getRandomValues(new Uint8Array(32))
}

// encode string to Uint8Array
const strToByteArray = (str) => {
  return (new TextEncoder()).encode(str)
}

// encode Uint8Array to string
const byteArrayToStr = (buff) => {
  return (new TextDecoder()).decode(buff)
}

// encode Uint8Array to hex string
const byteArrayToHexStr = (buff) => {
  let charArray = []

  buff.forEach(i => charArray.push(i.toString(16)))

  return charArray
    .map(i => (i.length === 1) ? "0" + i : i)
    .map(i => i.toUpperCase())
    .join("")
}

// encode hex string to Uint8Array
const hexStrToByteArray = (str) => {
  return new Uint8Array(str
    .split(/(.{2})/)
    .filter(i => i !== "")
    .map(i => parseInt(i, 16)))
}

// generate key
const generateKey = async () => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    [ "encrypt", "decrypt" ]
  )
}

// export key
const exportKey = async (key, secretKey) => {
  const iv = generate32Random()

  const wrappedKey = await window.crypto.subtle.wrapKey(
    "raw",
    key,
    secretKey,
    {
      name: "AES-GCM",
      iv: iv
    }
  )

  return {
    wrappedKey: new Uint8Array(wrappedKey),
    iv: iv
  }
}

// import key
const importKey = async (key, iv, secretKey) => {
  return window.crypto.subtle.unwrapKey(
    "raw",
    key,
    secretKey,
    {
      name: "AES-GCM",
      iv: iv
    },
    {
      name: "AES-GCM"
    },
    true,
    [ "encrypt", "decrypt" ]
  )
}

// secret to key
const secretToKey = async (secret) => {
  return window.crypto.subtle.importKey(
    "raw",
    secret,
    {
      name: "AES-GCM"
    },
    true,
    [ "wrapKey", "unwrapKey" ]
  )
}

// SHA-256 hash
const hashSHA = async (buff) => {
  const result = await window.crypto.subtle.digest("SHA-256", buff)

  return new Uint8Array(result)
}

// encrypt
const encrypt = async (buff, key) => {
  // generate iv
  const iv = generate32Random()

  const result = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    buff
  )

  return {
    cipherText: new Uint8Array(result),
    iv: iv
  }
}

// decrypt
const decrypt = async (buff, iv, key) => {
  const result = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    buff
  )
  
  return {
    plainText: new Uint8Array(result),
    iv: iv
  }
}

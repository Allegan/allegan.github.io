const form = {
  secret: document.getElementById("encrypt-secret"),
  key: document.getElementById("encrypt-key"),
  plaintext: document.getElementById("encrypt-plaintext"),
  submit: document.getElementById("encrypt-submit"),
  ciphertext: document.getElementById("encrypt-ciphertext")
}

// event listeners
form.submit.addEventListener("click", async (e) => {
  e.preventDefault()

  let secret = form.secret.value
  let key = form.key.value
  let plainText = form.plaintext.value

  // decode the secret
  let secretKey = hexStrToByteArray(secret)
  secretKey = await secretToKey(secretKey)

  // decode and import the cipherkey and iv
  let cipherKeyJson = hexStrToByteArray(key)
  cipherKeyJson = byteArrayToStr(cipherKeyJson)
  cipherKeyJson = JSON.parse(cipherKeyJson)

  let wrappedKey = hexStrToByteArray(cipherKeyJson.wrappedKey)
  let iv = hexStrToByteArray(cipherKeyJson.iv)
  let cipherKey = await importKey(wrappedKey, iv, secretKey)

  // encode the plaintext
  let encodedText = strToByteArray(plainText)

  // encrypt
  let result = await encrypt(encodedText, cipherKey)

  // json encode and hex
  result.cipherText = byteArrayToHexStr(result.cipherText)
  result.iv = byteArrayToHexStr(result.iv)

  let json = JSON.stringify(result)
  json = strToByteArray(json)
  json = byteArrayToHexStr(json)

  form.ciphertext.value = json
})

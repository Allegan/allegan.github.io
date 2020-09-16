const form = {
  secret: document.getElementById("decrypt-secret"),
  key: document.getElementById("decrypt-key"),
  ciphertext: document.getElementById("decrypt-ciphertext"),
  submit: document.getElementById("decrypt-submit"),
  plaintext: document.getElementById("decrypt-plaintext")
}

// event listeners
form.submit.addEventListener("click", async (e) => {
  e.preventDefault()

  let secret = form.secret.value
  let key = form.key.value
  let ct = form.ciphertext.value

  // decode and import the secretkey
  let secretKey = hexStrToByteArray(secret)
  secretKey = await secretToKey(secretKey)

  // decode the ciphertext and iv
  let cipherJson= hexStrToByteArray(ct)
  cipherJson = byteArrayToStr(cipherJson)
  cipherJson = JSON.parse(cipherJson)

  let cipherText = hexStrToByteArray(cipherJson.cipherText)
  let cipherIv = hexStrToByteArray(cipherJson.iv)

  // decode and import the cipherkey and iv
  let cipherKeyJson = hexStrToByteArray(key)
  cipherKeyJson = byteArrayToStr(cipherKeyJson)
  cipherKeyJson = JSON.parse(cipherKeyJson)

  let wrappedKey = hexStrToByteArray(cipherKeyJson.wrappedKey)
  let iv = hexStrToByteArray(cipherKeyJson.iv)
  let cipherKey = await importKey(wrappedKey, iv, secretKey)

  // decrypt
  let result = await decrypt(cipherText, cipherIv, cipherKey)

  // stringify
  let plainText = byteArrayToStr(result.plainText)

  form.plaintext.value = plainText
})

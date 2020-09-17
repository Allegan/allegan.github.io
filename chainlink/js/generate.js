const form = {
  shared: document.getElementById("generate-sharedsecret"),
  key: document.getElementById("generate-key"),
  submit: document.getElementById("generate-submit")
}

// event listeners
form.submit.addEventListener("click", async (e) => {
  e.preventDefault()

  let shared = form.shared.value
  let sharedKey = hexStrToByteArray(shared)
  let sharedEncKey = await secretToKey(sharedKey)
  let encKey = await generateKey()
  let exportedKey = await exportKey(encKey, sharedEncKey)

  // encode key and iv
  exportedKey.wrappedKey = byteArrayToHexStr(exportedKey.wrappedKey)
  exportedKey.iv = byteArrayToHexStr(exportedKey.iv)

  // jsonify
  let json = JSON.stringify(exportedKey)

  // encode as Uint8Array and turn to hex
  json = strToByteArray(json)
  json = byteArrayToHexStr(json)

  form.key.value = json
})

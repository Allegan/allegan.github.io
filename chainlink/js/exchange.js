const form = {
  step1: {
    secret: document.getElementById("exchange-secretkey"),
    submit: document.getElementById("exchange-generate-secretkey")
  },
  step2: {
    public: document.getElementById("exchange-publickey"),
    submit: document.getElementById("exchange-generate-publickey")
  },
  step3: {
    shared: document.getElementById("exchange-otherpublickey"),
    secret: document.getElementById("exchange-sharedkey"),
    submit: document.getElementById("exchange-calculate-sharedkey")
  }
}

// event listeners
form.step1.submit.addEventListener("click", (e) => {
  e.preventDefault()

  let secret = form.step1.secret.value

  if (secret === "") {
    let secretKey = byteArrayToHexStr(generate32Random())
    form.step1.secret.value = secretKey
  }
})

form.step2.submit.addEventListener("click", (e) => {
  e.preventDefault()

  let secret = form.step1.secret.value
  let secretKey = hexStrToByteArray(secret)
  let publicKey = X25519.getPublic(secretKey)
  let public = byteArrayToHexStr(publicKey)

  form.step2.public.value = public
})

form.step3.submit.addEventListener("click", async (e) => {
  e.preventDefault()

  let secret = form.step1.secret.value
  let public = form.step3.shared.value
  let secretKey = hexStrToByteArray(secret)
  let publicKey = hexStrToByteArray(public)
  let sharedKey = X25519.getSharedKey(secretKey, publicKey)

  // hash
  let sharedHash = await hashSHA(sharedKey)

  let shared = byteArrayToHexStr(sharedHash)

  form.step3.secret.value = shared
})

import { Form } from './modules/form.mjs'
import { importKey, encrypt, decrypt } from './modules/crypto.mjs'

const $elems = {
    title: document.getElementById('operation'),
    file: document.getElementById('input-file'),
    password: document.getElementById('password-input'),
    submit: document.getElementById('submit-button'),
    download: document.getElementById('download-button'),
    encryptRadio: document.getElementById('encrypt-radio'),
    decryptRadio: document.getElementById('decrypt-radio')
}

const readFileAsync = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = reject
    reader.onload = () => {
        const buff = new Uint8Array(reader.result)

        resolve(buff)
    }

    reader.readAsArrayBuffer(file)
})

let form = new Form($elems)
form.addFormAction(async (state) => {
    let result = {}
    let imported = undefined
    let file = await readFileAsync(state.file)

    switch (state.op) {
        case 'encrypt':
            imported = await importKey(state.pass)
            let cipherState = await encrypt(file, imported.key)
            
            cipherState.cipherText = TripleSec.convert.bytesToHex(cipherState.buff)
            cipherState.iv = TripleSec.convert.bytesToHex(cipherState.iv)
            cipherState.salt = TripleSec.convert.bytesToHex(imported.salt)
            delete cipherState.buff
            cipherState = JSON.stringify(cipherState)

            result.buff = TripleSec.convert.strToBytes(cipherState)
            result.filename = state.file.name + '.enc'
            break
        case 'decrypt':
            file = TripleSec.convert.bytesToStr(file)
            file = JSON.parse(file)
            file.cipherText = TripleSec.convert.hexToBytes(file.cipherText)
            file.iv = TripleSec.convert.hexToBytes(file.iv)
            file.salt = TripleSec.convert.hexToBytes(file.salt)

            imported = await importKey(state.pass, file.salt)
            let plainText = await decrypt(file.cipherText, imported.key, file.iv)
            
            result.buff = plainText.buff
            result.filename = state.file.name.slice(0, -4)
            break
    }

    form.setDownloadContent(result)
})
$(document).ready(() => {
    const $password = $('#password-input')
    const $submit = $('button[type=submit]')
    const $download = $('#download-button')

    const readFileAsync = file => new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onerror = reject
        reader.onload = () => {
            const buff = new Uint8Array(reader.result)

            resolve(buff)
        }

        reader.readAsArrayBuffer(file)
    })

    const encryptFile = async (password, blob) => {
        const tohex = TripleSec.convert.bytesToHex
        const encodedPassword = TripleSec.convert.strToBytes(password)
        const importedPassword = await TripleSec.import.password(encodedPassword)
        const derived = await TripleSec.derive.fromPassword(importedPassword)
        const cipher = await TripleSec.encrypt(blob, derived.key)

        const cipherStruct = {
            salt: tohex(derived.salt),
            cipherText: tohex(cipher.buff),
            iv: tohex(cipher.iv)
        }

        const cipherString = JSON.stringify(cipherStruct)

        return TripleSec.convert.strToBytes(cipherString)
    }

    const decryptFile = async (password, blob) => {
        const fromhex = TripleSec.convert.hexToBytes
        const cipherString = TripleSec.convert.bytesToStr(blob)
        let cipherStruct = JSON.parse(cipherString)

        cipherStruct.salt = fromhex(cipherStruct.salt)
        cipherStruct.cipherText = fromhex(cipherStruct.cipherText)
        cipherStruct.iv = fromhex(cipherStruct.iv)

        console.log(cipherStruct)

        const encodedPassword = TripleSec.convert.strToBytes(password)
        const importedPassword = await TripleSec.import.password(encodedPassword)
        const derived = await TripleSec.derive.fromPassword(importedPassword, cipherStruct.salt)
        const plain = await TripleSec.decrypt(cipherStruct.cipherText, derived.key, cipherStruct.iv)

        return plain.buff
    }

    $submit.click(async (e) => {
        e.preventDefault()

        let res;
        let filename;
        const operation = $('input:radio[name="operation"]:checked').val()
        const password = $password.val()
        const file = $('#input-file').prop('files')[0]
        const blob = await readFileAsync(file)

        switch (operation) {
            case "encrypt":
                res = await encryptFile(password, blob)
                filename = file.name + '.enc'
                break;
            case "decrypt":
                res = await decryptFile(password, blob)
                filename = file.name.slice(0, -4)
                break;
            default:
                console.log('Stop messing around.')
                return
        }

        const downloadBlob = new Blob([res], {
            type: "application/octet-stream"
        })
        $download.attr('href', window.URL.createObjectURL(downloadBlob))
        $download.attr('download', filename)
        $download.removeClass('disabled')
    })
})
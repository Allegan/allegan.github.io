export async function importKey (password, iv = undefined) {
    let salt = undefined

    if (typeof iv !== 'undefined')
        salt = iv

    let key = TripleSec.convert.strToBytes(password)
        key = await TripleSec.import.password(key)
        key = await TripleSec.derive.fromPassword(key, salt)

    return key
}

export async function encrypt (input, key, iv = undefined) {
    let cipherState = await TripleSec.encrypt(input, key, iv)

    return {
        buff: cipherState.buff,
        iv: cipherState.iv
    }
}

export async function decrypt (input, key, iv) {
    return await TripleSec.decrypt(input, key, iv)
}
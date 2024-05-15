const CryptoJs = require('crypto-js');
require('dotenv').config();
const encryption_key = process.env.encryption_key

const encryptString = (text) => {
    const encrypted = CryptoJs.AES.encrypt(text, encryption_key).toString();
    return encrypted
}

const decryptString = (encryptedText) => {
    const decrypted = CryptoJs.AES.decrypt(encryptedText, encryption_key)
    return decrypted.toString(CryptoJs.enc.Utf8);
}

const matchText = (normalText, encryptedText) => {
    const decryptedText = decryptString(encryptedText);
    return normalText === decryptedText;
}

module.exports = {
    encryptString,
    decryptString,
    matchText
}
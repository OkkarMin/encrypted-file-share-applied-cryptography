import CryptoJS from "crypto-js";

function encrypt(plainText: string, key: string) {
  return CryptoJS.AES.encrypt(plainText, key).toString();
}

function decrypt(cipherText: string, key: string) {
  return CryptoJS.AES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8);
}

export { encrypt, decrypt };

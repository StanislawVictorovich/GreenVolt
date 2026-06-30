import CryptoJS from 'crypto-js';

const FILE_MAGIC = 'GREENVOLT_CRM_ERP_BACKUP_V1';

export function encryptDatabaseSnapshot(snapshot, password) {
    if (!password || password.trim().length < 4) {
        throw new Error('Пароль для файла должен быть минимум 4 символа.');
    }

    const payload = JSON.stringify({
        magic: FILE_MAGIC,
        exportedAt: new Date().toISOString(),
        snapshot
    });

    return CryptoJS.AES.encrypt(payload, password).toString();
}

export function decryptDatabaseSnapshot(encryptedText, password) {
    if (!encryptedText) throw new Error('Файл пустой или повреждён.');
    if (!password) throw new Error('Введите пароль от файла.');

    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        throw new Error('Не удалось расшифровать файл. Проверь пароль.');
    }

    const parsed = JSON.parse(decrypted);
    if (parsed.magic !== FILE_MAGIC || !parsed.snapshot) {
        throw new Error('Это не файл базы GreenVolt CRM ERP или он повреждён.');
    }

    return parsed.snapshot;
}

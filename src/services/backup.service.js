import { decryptDatabaseSnapshot, encryptDatabaseSnapshot } from './crypto.service';

export function downloadEncryptedBackup(snapshot, password) {
  const encrypted = encryptDatabaseSnapshot(snapshot, password);
  const blob = new Blob([encrypted], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  link.href = url;
  link.download = `greenvolt-db-${stamp}.gverp`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function readBackupFile(file, password) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(decryptDatabaseSnapshot(String(reader.result || ''), password));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.readAsText(file);
  });
}

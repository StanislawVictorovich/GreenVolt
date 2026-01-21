(function (global) {
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function formatDateTime(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function uid(prefix) {
    prefix = prefix || 'id';
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function downloadText(filename, text, mime) {
    mime = mime || 'application/octet-stream';
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }

  function downloadJson(filename, obj) {
    downloadText(filename, JSON.stringify(obj, null, 2), 'application/json;charset=utf-8');
  }

  function readJsonFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Ошибка чтения файла')); };
      reader.onload = function () {
        try {
          resolve(JSON.parse(String(reader.result || '')));
        } catch (e) {
          reject(new Error('Файл не похож на JSON'));
        }
      };
      reader.readAsText(file);
    });
  }

  function money(n, currency) {
    currency = currency || 'UAH';
    if (n === null || typeof n === 'undefined' || n === '') return '';
    var num = Number(n);
    if (isNaN(num)) return '';
    return num.toFixed(2) + ' ' + currency;
  }

  function safeNumber(v, def) {
    var n = Number(v);
    return isNaN(n) ? (def || 0) : n;
  }

  global.AppUtils = {
    uid: uid,
    deepClone: deepClone,
    formatDateTime: formatDateTime,
    downloadJson: downloadJson,
    readJsonFile: readJsonFile,
    money: money,
    safeNumber: safeNumber
  };
})(window);

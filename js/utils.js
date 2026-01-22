(function () {
	function uid(prefix) {
		return (prefix || "id") + "_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
	}

	function toInt(v) {
		var n = parseInt(v, 10);
		return isNaN(n) ? 0 : n;
	}

	function toNum(v) {
		var n = parseFloat(v);
		return isNaN(n) ? 0 : n;
	}

	function round2(v) {
		return Math.round(v * 100) / 100;
	}

	function clone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	function downloadJson(filename, obj) {
		var data = JSON.stringify(obj, null, 2);
		var blob = new Blob([data], { type: "application/json" });
		var a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		a.click();
	}

	function readJsonFile(file, cb, errCb) {
		var r = new FileReader();
		r.onload = function () {
			try {
				cb(JSON.parse(r.result));
			} catch (e) {
				if (errCb) errCb(e);
			}
		};
		r.onerror = function (e) { if (errCb) errCb(e); };
		r.readAsText(file);
	}

	window.Utils = {
		uid: uid,
		toInt: toInt,
		toNum: toNum,
		round2: round2,
		clone: clone,
		downloadJson: downloadJson,
		readJsonFile: readJsonFile
	};
})(); 

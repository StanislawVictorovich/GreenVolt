(function () {
	function uid(prefix) {
		return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
	}

	function clone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	function download(name, data) {
		var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		var a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = name;
		a.click();
	}

	function read(file, cb) {
		var r = new FileReader();
		r.onload = function () {
			cb(JSON.parse(r.result));
		};
		r.readAsText(file);
	}

	window.Utils = {
		uid: uid,
		clone: clone,
		download: download,
		read: read
	};
})();

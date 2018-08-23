
export function onload(target) {
	if(target.complete) return Promise.resolve(target);

	return new Promise((resolve, reject) => {
		const events = [
			['load', onload], 
			['error', onerror]
		];

		function onload(e) {
			resolve(target);

			events.forEach(([type, listener]) => 
				target.removeEventListener(type, listener));
		}

		function onerror(err) {
			reject(err);

			events.forEach(([type, listener]) => 
				target.removeEventListener(type, listener));
		}

		events.forEach(([type, listener]) => 
			target.addEventListener(type, listener));
	});
}


export function loadImage(src) {
	const img = document.createElement('img');
	img.src = src;

	return onload(img);
}
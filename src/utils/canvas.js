export function getImageDataFrom(canvas, source) {
	const context = canvas.getContext('2d')
		, [w, h] = [
			source.naturalWidth || source.width,
			source.naturalHeight || source.height
		];

	canvas.width = w;
	canvas.height = h;

	context.drawImage(source, 0, 0);
	return context.getImageData(0, 0, w, h);
}

export function drawTo(canvas, source) {
	const context = canvas.getContext('2d');

	if(source instanceof ImageData) 
		return context.putImageData(source, 0, 0);

	context.drawImage(source, 0, 0);
}

export function getPixel(source, x, y) {
	const index = 4 * (y * source.width + x)
		, data = source.data

	return [
		data[index    ],
		data[index + 1],
		data[index + 2],
	];
}


export function getHueAngle(r, g, b) {
	const len = 0.5773502691896258
		, [ax, ay, az] = [len, len, -len]
		, [bx, by, bz] = [len, -len, -len]
		, x = ax * r + ay * g + az * b
		, y = bx * r + by * g + bz * b;

	return Math.atan2(y, x);
}
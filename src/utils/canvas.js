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


export function applySelectiveAdjust(original, source, dest, filter) {
	console.log('applySelectiveAdjust', original, source, dest, filter);

	const orgData = original.data
		, srcData = source.data
		, destData = dest.data
		, len = source.width * source.height * 4
		, t = filter.t
		, hue = filter.hue
		, width = source.width
		, height = source.height
		, radius = filter.radius * filter.radius
		, ox = filter.x
		, oy = filter.y
		, m = filter.colorMatrix
		, _a = m[0], _d = m[1], _g = m[2], _j = m[3]
		, _b = m[4], _e = m[5], _h = m[6], _k = m[7]
		, _c = m[8], _f = m[9], _i = m[10], _l = m[11];

	var r, g, b, hue2, f, 
		x, y, j, dx, dy,
		tr, tg, tb;

	for(var i = 0; i < len; i += 4) {
		r = srcData[i    ];
		g = srcData[i + 1];
		b = srcData[i + 2];

		j = i / 4
		x = j % width;
		y = j / width | 0;

		dx = ox - x;
		dy = oy - y;

		f = 1 - (dx * dx + dy * dy) / radius;

		if(f <= 0.01) {
			destData[i    ] = r;
			destData[i + 1] = g;
			destData[i + 2] = b;
			destData[i + 3] = srcData[i + 3];	

			continue;
		}

		hue2 = getHueAngle(orgData[i] / 255, orgData[i + 1] / 255, orgData[i + 2] / 255);
		f = f * Math.max(0, 1 - Math.abs(hue - hue2) / t);

		tr = _a*r + _d*g + _g*b + _j;
		tg = _b*r + _e*g + _h*b + _k;
		tb = _c*r + _f*g + _i*b + _l;

		destData[i] = r + f * (tr - r);
		destData[i + 1] = g + f * (tg - g);
		destData[i + 2] = b + f * (tb - b);
		destData[i + 3] = srcData[i + 3];
	}

	return dest;
}
import {curry, tap, zip, setProps} from './utils/functional';
import {onload, loadImage} from './utils/io';
import {zfill} from './utils/string';
import {getImageDataFrom, drawTo, getPixel} from './utils/canvas';
import {getHueAngle} from './utils/canvas';

window.zip = zip;
window.setProps = setProps;

onload(window)
	.then(init)
	.then(imgData => console.log(imgData));


function init() {
	const view = document.querySelector('#view')
		, uilayer = document.querySelector('#uilayer')
		, toImageData = curry(getImageDataFrom)(document.createElement('canvas'))
		, drawToView = curry(drawTo)(view);

	return loadImage('./img/sample.jpg')
		.then(toImageData)
		.then(tap(imgData => resizeView(imgData.width, imgData.height)))
		.then(tap(drawToView))
		.then(tap(source => initMouseEvent(view, uilayer, source)))
}

function resizeView(width, height) {
	const view = document.querySelector('#view')
		, uilayer = document.querySelector('#uilayer');

	view.width = width;
	view.height = height;

	uilayer.setAttribute('width', width);
	uilayer.setAttribute('height', height);
}

function shiftUntil(arr, len) {
	if(arr.length <= len) return arr;

	return shiftUntil(arr.slice(1), len);
}

function removeFirstChildUntil(el, len) {
	if(el.childElementCount <= len) return el;

	el.removeChild(el.firstElementChild);
	return removeFirstChildUntil(el, len);
}

function initMouseEvent(view, uilayer, source) {
	const dest = new ImageData(source.width, source.height)
		, filters = [];

	uilayer.addEventListener('click', e => {
		if(e.target != uilayer) return;

		const pixel = getPixel(source, e.offsetX, e.offsetY)
			, hue = getHueAngle(...pixel.map(n => n / 255.0));

		filters.push({
			x: e.offsetX,
			y: e.offsetY,
			hue: hue,
			t: 25 * Math.PI / 180,
			radius: 100,
			// colorMatrix: getBrightnessMat(0.3),
			// colorMatrix: getContrastMat(2),
			colorMatrix: getFlatColorMat4x3(1, 0, 0),
		});

		setBackgroundColor(...pixel);
		updateFilters(source, dest, shiftUntil(filters, 5));
		drawTo(view, dest);
		appendCircle(e.target, e.offsetX, e.offsetY);
		removeFirstChildUntil(e.target, 5);
	});
}

function getContrastMat(c) {
	const t = 128 * (1 - c);

	return [
		c, 0, 0, t,
		0, c, 0, t,
		0, 0, c, t,
	];
}

function getBrightnessMat(brightness) {
	const b = 256 * brightness

	return [
		1, 0, 0, b,
		0, 1, 0, b,
		0, 0, 1, b,
	]
}

function getFlatColorMat4x3(r, g, b) {
	return [
		0, 0, 0, r * 255 | 0,
		0, 0, 0, g * 255 | 0,
		0, 0, 0, b * 255 | 0,
	];
}

function updateFilters(source, dest, filters) {
	// filters.forEach(filter => applySelectiveAdjust(source, dest, filter));
	
	filters.reduce((imgData, filter) => 
		applySelectiveAdjust(source, imgData, dest, filter), source)
}

function applySelectiveAdjust(original, source, dest, filter) {
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


function setBackgroundColor(r, g, b) {
	document.body.style.background = 
		(r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function appendCircle(uilayer, x, y) {
	const namespace = 'http://www.w3.org/2000/svg'
		, circle = document.createElementNS(namespace, 'circle');

	setAttrs(circle, {
		cx: x,
		cy: y,
		r: 100,
		stroke: '#ccc',
		"stroke-width": '2px',
		fill: 'none',
		"pointer-events": 'visiblePoint'
	});

	uilayer.appendChild(circle);
}

function setAttrs(target, o) {
	for(let k in o) {
		target.setAttribute(k, o[k]);
	}
}

function doUntil(fa, fb) {
	return function nest(e) {
		const faResult = fa(e);

		if(fb(faResult)) return faResult;

		return nest(e);
	}
}







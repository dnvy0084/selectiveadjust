import {curry, tap, zip, setProps} from './utils/functional';
import {onload, loadImage} from './utils/io';
import {zfill} from './utils/string';
import {getImageDataFrom, drawTo, getPixel} from './utils/canvas';
import {getHueAngle} from './utils/canvas';
import SelectiveTool from './ui/SelectiveTool';
import SelectiveAdjust from './SelectiveAdjust';

onload(window).then(init)
	// .then(imgData => console.log(imgData));


function init() {
	const app = new SelectiveAdjust();
	app.setImageByURL('./img/sample.jpg');

	window.app = app;
	return;

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

window.onresize = function(e) {
	const view = document.querySelector('#view')
		, w = view.width
		, h = view.height;

	alignToCenter(w, h);
}

function alignToCenter(width, height) {
	const view = document.querySelector('#view')
		, uilayer = document.querySelector('#uilayer')
		, top = ((window.innerHeight - height) / 2) + 'px'
		, left = ((window.innerWidth - width) / 2) + 'px';

	view.style.top = uilayer.style.top = top;
	view.style.left = uilayer.style.left = left;
}

function resizeView(width, height) {
	const view = document.querySelector('#view')
		, uilayer = document.querySelector('#uilayer')

	view.width = width;
	view.height = height;

	uilayer.setAttribute('width', width);
	uilayer.setAttribute('height', height);

	alignToCenter(width, height);
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
		if(filters.length) return;
		if(e.target != uilayer) return;

		const pixel = getPixel(source, e.offsetX, e.offsetY)
			, hue = getHueAngle(...pixel.map(n => n / 255.0))
			, filter = {
				x: e.offsetX,
				y: e.offsetY,
				hue: hue,
				t: getRange(0),
				radius: 100,
				// colorMatrix: getBrightnessMat(0.3),
				// colorMatrix: getContrastMat(2),
				colorMatrix: getFlatColorMat4x3(1, 0, 0),	
			}

		filters.push(filter);
		setBackgroundColor(...pixel);
		// updateFilters(source, dest, shiftUntil(filters, 5));
		
		drawTo(view, dest);
		appendTool(e.target, e.offsetX, e.offsetY, filter, source, dest);
		removeFirstChildUntil(e.target, 5);
	});
}

function getRange(t) {
	const min = 20 * Math.PI / 180
		, max = 65 * Math.PI / 180
		, maxR = 1.5707963267948966
		, r = Math.abs(t);

	return min + (r / maxR) * (max - min);
}


function appendTool(svg, x, y, filter, source, dest) {
	const tool = new SelectiveTool();
	tool.x = x;
	tool.y = y;
	tool.radius = filter.radius;

	svg.appendChild(tool.g);

	tool.on('change', () => {
		filter.x = tool.x;
		filter.y = tool.y;
		filter.radius = tool.radius;
		filter.t = getRange(tool.radian);

		const pixel = getPixel(source, tool.x, tool.y);

		filter.hue = getHueAngle(...pixel.map(n => n / 255.0));

		applySelectiveAdjust(source, source, dest, filter);
		drawTo(view, dest);
	});

	window.filter = filter;

	let mat = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
	];

	tool.on('dragStart', () => {
		filter.colorMatrix = getFlatColorMat4x3(1, 0, 0);

		console.log('start');
	});

	tool.on('dragStop', () => {
		filter.colorMatrix = mat;
		applySelectiveAdjust(source, source, dest, filter);

		console.log('stop');
	})
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



function _curry(f) {
	return function(...range) {
		if(range.length >= f.length) 
			return f(...range);

		return _curry(f.bind(null, ...range));
	}
}

function _curry2(f) {
	function _fscope(...args) {
		return function(...rest) {
			if(args.length + rest.length >= f.length) 
				return f(...args, ...rest);

			return _fscope(...args, ...rest);
		}
	}

	return _fscope();
}

function range(a, b) {
	let [i, len] = typeof b === 'undefined' ? [0, a] : [a, b];

	return {
		[Symbol.iterator]() {
			return {
				next() {
					if(i >= len) return {done: true};

					return {value: i++, done: false};
				}
			}
		}
	}
}

function generateString(alphabetRange, len) {
	const a = 'A'.charCodeAt(0)
		, charCodes = [...range(len)]
			.map(n => a + (alphabetRange * Math.random() | 0));

	return String.fromCharCode(...charCodes);
}

function generateTask(width, height, alphabetRange) {
	const generateStringUntilRange = 
		_curry(generateString)(alphabetRange);

	return [...range(height)]
		.map(n => width)
		.map(generateStringUntilRange);
}

function toString(task) {
	const str = task
		.map(str => str.match(/./g).join(' '))
		.join('\n');

	console.log(str);
}

[...range(5, 10)]
	.map(n => generateTask(n, n, 4))
	.forEach(task => toString(task));
	


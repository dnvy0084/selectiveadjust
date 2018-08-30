import {curry, tap, zip, setProps} from './utils/functional';
import {maybe} from './utils/maybe';
import {onload, loadImage} from './utils/io';
import {zfill} from './utils/string';
import {getImageDataFrom, drawTo, getPixel} from './utils/canvas';
import {getHueAngle} from './utils/canvas';
import SelectiveTool from './ui/SelectiveTool';
import SelectiveAdjust from './SelectiveAdjust'
import {closest} from './utils/dom';

window.maybe = maybe;

onload(window)
	.then(initApp)
	.then(initGUI);


function initApp() {
	const app = new SelectiveAdjust();
	app.setImageByURL('./img/sample.jpg');

	window.app = app;
	return app;
}

function initGUI(app) {
	const gui = new dat.GUI()
		, controls = [
			[app, 'brightness', -255, 255],
			[app, 'contrast', 0.5, 2],
			[app, 'saturation', 0, 3],
			[app, 'hue', 0, 360],
		]
		.map(args => gui.add(...args).listen())
		.map(tap(control => control.onChange(onChange)));

	gui.domElement.classList.add('dat_gui');
	app.on('enterEditMode', onChangeEditMode);
	app.on('releaseEditMode', onChangeEditMode);

	function onChange(e) {
		app._changed = true;
	}

	function onChangeEditMode(e) {
		controls.map(c => c.updateDisplay());
	}
}




//====================================================================
//
// Algo Sample
//
//====================================================================

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

// [...range(5, 10)]
// 	.map(n => generateTask(n, n, 4))
// 	.forEach(task => toString(task));



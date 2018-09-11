import {curry, tap, zip, setProps} from './utils/functional';
import {maybe} from './utils/maybe';
import {onload, loadImage} from './utils/io';
import {zfill} from './utils/string';
import {getImageDataFrom, drawTo, getPixel} from './utils/canvas';
import {getHueAngle} from './utils/canvas';
import SelectiveTool from './ui/SelectiveTool';
import SelectiveAdjust from './SelectiveAdjust'
import {closest} from './utils/dom';

/**
 * window.onload시 앱 생성, UI 초기화. 
 */
onload(window)
	.then(initApp)
	.then(initGUI);


/**
 * 메인 클래스 생성. 샘플 이미지 로드
 */
function initApp() {
	const app = new SelectiveAdjust();
	app.setImageByURL('./img/sample.jpg');

	window.app = app;
	return app;
}

function initGUI(app) {
	Object.defineProperty(window, 'uiVisible', {
		get: function() {
			return app.uilayer.style.display != 'none';
		},

		set: function(value) {
			const display = value ? '' : 'none';

			app.uilayer.style.display = display;
		}
	});
	
	const gui = new dat.GUI()
		, controls = [
			[app, 'brightness', -255, 255],
			[app, 'contrast', 0.5, 2],
			[app, 'saturation', 0, 3],
			[app, 'hue', 0, 360],
			[app, 'appendable'],
			[window, 'uiVisible'],
		]
		.map(args => gui.add(...args).listen())
		.map(tap(control => control.onChange(onChange)));

	gui.domElement.classList.add('dat_gui');
	app.on('enterEditMode', onChangeEditMode);
	app.on('releaseEditMode', onChangeEditMode);
	app.on('appendModeChange', onChangeEditMode);

	function onChange(e) {
		app._changed = true;
	}

	function onChangeEditMode(e) {
		controls.map(c => c.updateDisplay());
	}
}
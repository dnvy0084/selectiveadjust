import {onload, loadImage} from './utils/io';
import {curry, tap, zip, setProps} from './utils/functional';
import {getImageDataFrom, drawTo, getPixel} from './utils/canvas';
import {getHueAngle, applySelectiveAdjust} from './utils/canvas';
import {setAttrs} from './utils/dom';
import Ticker from './ui/Ticker';
import {getContrastMat, getFlatColorMat4x3, identity} from './utils/matrix';
import SelectiveColorMatrix from './filter/SelectiveColorMatrix';
import SelectiveTool from './ui/SelectiveTool';

export default class SelectiveAdjust {
	constructor() {
		this.view = document.querySelector('#view');
		this.uilayer = document.querySelector('#uilayer');
		this._interative = true;

		this.bindEvents();
		this.addEvents();
	}

	bindEvents() {
		this.onLoadImage = this.onLoadImage.bind(this);
		this.onImageDataReady = this.onImageDataReady.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onUILayerClick = this.onUILayerClick.bind(this);
		this.onUpdate = this.onUpdate.bind(this);

		this.toImageData = curry(getImageDataFrom)(document.createElement('canvas'));
		this.drawToView = curry(drawTo)(this.view);
	}

	addEvents() {
		window.addEventListener('resize', this.onResize);
		uilayer.addEventListener('click', this.onUILayerClick);

		Ticker.instance.start();
		Ticker.instance.on('time', this.onUpdate);
	}

	addToolEvents(tool) {
		tool.on('dragStart', this.onDragStart.bind(this));
		tool.on('dragStop', this.onDragStop.bind(this));
		tool.on('change', this.onToolChanged.bind(this));
	}

	setImageByURL(url) {
		return loadImage(url)
			.then(tap(this.onLoadImage))
			.then(this.toImageData)
			.then(tap(this.onImageDataReady))
			.then(this.drawToView);
	}

	getSelectiveFilter(x, y) {
		const pixel = getPixel(this.source, x, y)
			, hue = getHueAngle(...pixel.map(n => n / 255.0))
			, filter = new SelectiveColorMatrix();

		filter.x = x;
		filter.y = y;
		filter.hue = hue;
		filter.range = getRange(0);
		filter.original = this.source;
		filter.radius = 100;
		filter.colorMatrix = identity();

		return filter;
	}

	resizeView(img = this.sourceImg) {
		this.view.width = img.width;
		this.view.height = img.height;

		setAttrs(this.uilayer, {
			width: img.width,
			height: img.height
		});

		this.alignToCenter(img);
	}

	alignToCenter(img) {
		const width = img.width
			, height = img.height
			, top = ((window.innerHeight - height) / 2) + 'px'
			, left = ((window.innerWidth - width) / 2) + 'px';

		view.style.top = 
		uilayer.style.top = top;

		view.style.left = 
		uilayer.style.left = left;
	}

	onLoadImage(img) {
		this.sourceImg = img;
		this.resizeView();
	}

	onImageDataReady(imgData) {
		this.source = imgData;
		this.dest = new ImageData(this.source.width, this.source.height);
		this.filters = [];
		this._changed = true;
	}

	onResize(e) {
		this.alignToCenter(this.sourceImg);
	}

	onUILayerClick(e) {
		if(!this.interative) return;
		if(this.filters.length > 0) return;

		const filter = this.getSelectiveFilter(e.offsetX, e.offsetY)
			, tool = new SelectiveTool();

		tool.x = filter.x;
		tool.y = filter.y;
		tool.radius = filter.radius;
		tool.filter = filter;

		this.addToolEvents(tool);
		this.uilayer.appendChild(tool.g);
		this.filters.push(filter);
		this._changed = true;
	}

	onUpdate(e) {
		if(!this._changed) return;

		const dest = this.filters.reduce((imgData, filter) => 
			filter.applyFilter(imgData, this.dest), this.source);

		this.drawToView(dest);
		this._changed = false;
	}



	onDragStart(tool) {
		tool.filter.selectable = true;
	}

	onDragStop(tool) {
		tool.filter.selectable = false;
		this._changed = true;
	}

	onToolChanged(tool) {
		const filter = tool.filter;

		filter.x = tool.x;
		filter.y = tool.y;
		filter.radius = tool.radius;
		filter.range = getRange(tool.radian);

		const pixel = getPixel(this.source, tool.x, tool.y);
		filter.hue = getHueAngle(...pixel.map(n => n / 255.0));

		this._changed = true;
	}


	get interative() {
		return this._interative;
	}
	
	set interative(value) {
		this._interative = value;
	}
}



function getRange(t) {
	const min = 20 * Math.PI / 180
		, max = 65 * Math.PI / 180
		, maxR = 1.5707963267948966
		, r = Math.abs(t);

	return min + (r / maxR) * (max - min);
}
import Ticker from './Ticker';
import EventEmitter from 'events';
import {closest} from '../utils/dom';

const ns = 'http://www.w3.org/2000/svg';

const  html = `
<circle class="center drag_move" cx="0" cy="0" r="10" pointer-events="fill"></circle>
<path class="crosshair" d="M0 -4 v 8 M-4 0 h 8" pointer-events="none"/>
<g class="hover" pointer-events="stroke">
	<circle class="hidden_area drag_area" cx="0" cy="0" r="100"></circle>
	<circle class="dotted_line drag_area" cx="0" cy="0" r="100"></circle>
	<circle class="rotation drag_rotation" cx="100" cy="0" r="5" pointer-events="fill"></circle>
</g>
`

export default class SelectiveTool extends EventEmitter {
	constructor() {
		super();
		this.g = document.createElementNS(ns, 'g');
		this.g.classList.add('selective_tool');
		this.g.innerHTML = html;

		this.center = this.g.querySelector('circle.center');
		this.dotLine = this.g.querySelector('g circle.dotted_line');
		this.hiddenArea = this.g.querySelector('g circle.hidden_area');
		this.circle = this.g.querySelector('g.hover');
		this.rotate = this.g.querySelector('circle.rotation');

		this.identity();
		this.bindListeners();
		this.addEvents();

		this.editing = false;
		this.interactiveEl = undefined;
	}

	identity() {
		this._x = 0;
		this._y = 0;
		this._radian = 0;
		this._changed = true;
		this._mat = [1, 0, 0, 1, 0, 0];
	}

	bindListeners() {
		[
			'onTime', 
			'onMoveStart', 
			'onRotate', 
			'onMouseDown',
			'onDocumentDown',
		].forEach(k => this[k] = this[k].bind(this));
	}

	addEvents() {
		Ticker.instance.on('time', this.onTime);
		this.center.addEventListener('mousedown', this.onMoveStart);
		this.rotate.addEventListener('mousedown', this.onRotate);
		this.g.addEventListener('mousedown', this.onMouseDown);
	}

	enterEditMode() {
		if(this.editing) return;

		this.editing = true;
	}

	onTime(ms) {
		if(!this._changed) return;
			
		this.update();
	}

	onMoveStart(e) {
		e.stopPropagation();

		const svg = closest(this.g, 'svg');
		if(!svg) return;

		let [x, y] = [e.offsetX, e.offsetY];

		this.startDrag(svg, e => {
			this.x += e.offsetX - x;
			this.y += e.offsetY - y;

			[x, y] = [e.offsetX, e.offsetY];
		});

		this.emit('dragStart', this);
		this.enterEditMode();
	}

	onMouseDown(e) {
		const svg = closest(this.g, 'svg');
		if(!svg) return;

		const {x, y} = this;

		this.startDrag(svg, e => {
			const dx = e.offsetX - x
				, dy = e.offsetY - y
				, len = Math.sqrt(dx * dx + dy * dy);

			this.radius = len;
		});

		this.emit('dragStart', this);
	}

	onRotate(e) {
		e.stopPropagation();

		const svg = closest(this.g, 'svg');
		if(!svg) return;

		const {x, y} = this;

		this.startDrag(svg, e => {
			const dx = e.offsetX - x
				, dy = e.offsetY - y
				, r = Math.atan2(dy, dx);

			this.radian = Math.max(-1.5707963267948966, Math.min(0, -r));
		});

		this.emit('dragStart', this);
	}

	startDrag(target, onDrag) {
		const onmove = e => onDrag(e)
			, onup = e => {
				target.removeEventListener('mousemove', onmove);
				body.removeEventListener('mouseup', onup);
				body.removeEventListener('mouseleave', onup);

				this.emit('dragStop', this);
			};

		const body = document.body;

		body.addEventListener('mouseup', onup);
		body.addEventListener('mouseleave', onup);
		target.addEventListener('mousemove', onmove);
	}

	update() {
		this.g.setAttribute(
			'transform', `matrix(${this.matrix.join(',')})`);

		this.emit('change', this);
	}


	onDocumentDown(e) {
		const g = closest(e.target, '.selective_tool')
			, h = this.interactiveEl ? closest(e.target, this.interactiveEl) : null;

		if(!g && !h) 
			return this.editing = false;		
	}


	get editing() {
		return this.circle.style.display != 'none';
	}
	
	set editing(value) {
		if(value) {
			this.circle.style.display = '';
			document.body.addEventListener('mousedown', this.onDocumentDown);
			this.emit('enterEditMode', this);
		}
		else {
			this.circle.style.display = 'none';
			document.body.removeEventListener('mousedown', this.onDocumentDown);
			this.emit('releaseEditMode', this);
		}
	}



	get radius() {
		return parseInt(this.dotLine.getAttribute('r'));
	}

	set radius(value) {
		this.dotLine.setAttribute('r', value);
		this.hiddenArea.setAttribute('r', value);
		this.rotate.setAttribute('cx', value);

		this.emit('change', this);
	}


	get matrix() {
		if(this._changed) {
			const t = this.radian
				, cos = Math.cos(t)
				, sin = Math.sin(t)
				, tx = this.x
				, ty = this.y;

			this._mat = [cos, -sin, sin, cos, tx, ty];
			this._changed = false;
		}

		return this._mat;
	}


	get x() {
		return this._x;
	}

	set x(value) {
		if(value == this._x) return;

		this._changed = true;
		this._x = value;
	}

	get y() {
		return this._y;
	}

	set y(value) {
		if(value == this._y) return;

		this._changed = true;
		this._y = value;
	}


	get rotation() {
		return this.radian * 180 / Math.PI;
	}

	set rotation(value) {
		this.radian = value * Math.PI / 180;
	}


	get radian() {
		return this._radian;
	}

	set radian(value) {
		if(value == this._radian) return;

		this._changed = true;
		this._radian = value;
	}
}
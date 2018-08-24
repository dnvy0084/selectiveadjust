import EventEmitter from 'events';

let _instance;

export default class Ticker extends EventEmitter {
	static get instance() {
		if(!_instance) 
			_instance = new Ticker();

		return _instance;
	}

	constructor() {
		super();
		this._running = false;
		this.onTime = this.onTime.bind(this);
	}

	start() {
		this._running = true;
		requestAnimationFrame(this.onTime);
	}

	stop() {
		this._running = false;
	}

	onTime(ms) {
		this.emit('time', ms);

		if(!this._running) return;

		requestAnimationFrame(this.onTime);
	}

	get running() {
		return this._running;
	}
}
function varify(value) {
	return !(value === null || typeof value === 'undefined');
}

class Just {
	static of(value) {
		if(varify(value)) 
			return new Just(value);

		return new Nothing();
	}

	constructor(value) {
		this._value = value;
	}

	map(f) {
		return Just.of(f(this._value));
	}

	pluck(key) {
		return Just.of(this._value[key]);
	}

	do(f) {
		return f(this._value);
	}

	get(other) {
		return this._value;
	}
}

class Nothing extends Just {
	constructor() {
		super();
	}

	map(f) {
		return this;
	}

	pluck(key) {
		return this;
	}

	do(f) {
		// nothing;
	}

	get(other) {
		return other;
	}
}

export function maybe(e) {
	return Just.of(e);
}
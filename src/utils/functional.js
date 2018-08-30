
export function curry(f) {
	return function(...rest) {
		if(rest.length >= f.length) 
			return f(...rest);

		return curry(f.bind(null, ...rest));
	}
}


export const tap = curry(function(f, e) {
	f(e);
	return e;
});


export function zip(...arrays) {
	const len = Math.max(...arrays.map(arr => arr.length))
		, zipped = [];

	for(let i = 0; i < len; i++) {
		zipped.push([...arrays.map(arr => arr[i])]);
	}

	return zipped;
}

export function setProps(target, props, values) {
	zip(props, values)
		.forEach(([prop, value]) => target[prop] = value);

	return target;
}


export function first(iter, condition) {
	for(let e of iter) {
		if(condition(e)) return e;
	}

	return null;
}


export const pluck = curry(
	function(key, target) {
		return target[key];
	}
);
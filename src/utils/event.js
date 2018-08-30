export function once(dispatcher, type, listener, ...rest) {
	function f(e) {
		listener(e);
		dispatcher.removeEventListener(type, e, ...rest);
	}

	dispatcher.addEventListener(type, f, ...rest);
}
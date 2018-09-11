
/**
 * events.EventEmitter의 once
 * dom element에 한번만 실행되는 이벤트를 add한다. 
 */
export function once(dispatcher, type, listener, ...rest) {
	function f(e) {
		listener(e);
		dispatcher.removeEventListener(type, e, ...rest);
	}

	dispatcher.addEventListener(type, f, ...rest);
}
/**
 * closest :: (HTMLElement, String) => HTMLElement || null;
 */
export function closest(target, selector) {
	if(!target.parentNode || target == document.body) 
		return null;

	if(target.matches(selector)) 
		return target;

	return closest(target.parentNode, selector);
}

export function setAttrs(target, attrs) {
	for(let k in attrs) {
		target.setAttribute(k, attrs[k]);
	}
}
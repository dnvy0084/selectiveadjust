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
import {onload, loadImage} from './utils/io';
import SelectiveTool from './ui/SelectiveTool';

onload(window).then(init);

function init() {
	const tool = new SelectiveTool();

	document.querySelector('#view').appendChild(tool.g);

	window.tool = tool;
}
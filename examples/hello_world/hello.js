importScripts('hello_constants.js');

onmessage = function(e) {
	switch(e.data) {
		case 'PARDOM':
			this.postMessage({ type: DOM_READ_TYPE, action: READ_INITIAL_STUFF });
		break;
		case INIT_DONE:
			this.postMessage({ type: REGISTER_EVENT_TYPE, action: ON_CLICK });
		break;
		case ON_CLICK:
			this.postMessage({ type: DOM_WRITE_TYPE, action: HELLO });
		break;
		default:
			console.log('[worker]', 'unhandled message', e.data);
	}
}

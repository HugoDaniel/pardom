/**
 * ParDom
 *
 * An extensible WebWorkers message scheduler
 * based on requestAnimationFrame.
 *
 * @author Hugo Gomes <mr.hugo.gomes@gmail.com>
 */
(function pardomIIFE(win) {
	'use strict';

	var raf = win.requestAnimationFrame;
	// ^ the default timer is always the "requestAnimationFrame"
	// present in the argument 
	/**
	 * Initialize a `ParDom`.
	 *
	 * @constructor
	 */
	function ParDom() {
		this.handlers = new Map();
		// ^ a handler for each message type
		// this is a Map(msgType, Map(message, function))
		this.workers = [];
		// ^ all the registered workers
		this.scheduled = [];
		// ^ the scheduled frames (an array of message types)
		this.actions = new Map();
		// ^ the messages to handle in the frame
		// this is a Map(msgType, [message object])
	}

	function scheduleMessage(pardom, msgObj, w) {
		const msg = msgObj;
		let isFrameNeeded = false;
		// are the messages of this type not scheduled to run ?
		if (pardom.scheduled.indexOf(msg.type) === -1) {
			// is it necessary to schedule a frame ?
			isFrameNeeded = pardom.scheduled.length === 0;
			pardom.scheduled.push(msg.type);
		}
		// set the origin worker (this can be used if a response is needed)
		msg.w = w;
		// push the message into the queue to be processed
		pardom.actions.get(msg.type).push(msg);
		// the frame() function gets called in rAF to handle the scheduled msgs
		if (isFrameNeeded) {
			(function frameIIFE() {
				function frame() {
					// get the oldest message type that was scheduled 
					const msgType = pardom.scheduled.shift();
					// if there are more message types scheduled 
					// request a new frame as soon as possible
					if (pardom.scheduled.length > 0) raf(frame);
					// get the list of actions scheduled
					// and the functions that are mapped to them
					const msgLst = pardom.actions.get(msgType);
					const functions = pardom.handlers.get(msgType);
					// execute each of them
					do {
						const curMsg = msgLst.pop();
						// get the function handler and call it
						const f = functions.get(curMsg.action);
						f(curMsg, pardom.workers);
						// ^ your code runs here
					} while (msgLst.length > 0);
				}
				raf(frame); // schedule it
			})();
		}
	}

	ParDom.prototype =
	{ constructor: ParDom
	, registerWorker: function _registerWorker(w, initMsg) {
		if(!w) return this.workers;
		// ^ assert that the worker exists
		const worker = w;
		this.workers.push(worker);
		worker.onmessage = e => {
			const msgType = e.data.type;
			if (msgType && this.handlers.has(msgType)) {
				scheduleMessage(this, e.data, e.currentTarget);
			}
		};
		// post the initialization message to the worker
		let msg = initMsg;
		if (!msg) msg = 'PARDOM';
		worker.postMessage(msg);
		// return all registered workers
		return this.workers;
	  }
	, registerMsg: function _registerMsg(msgType, msg, f) {
		if(!msgType || !msg || !f) return this.handlers;
		// initialize the handler object for this type of messages
		if (!this.handlers.has(msgType)) {
			this.handlers.set(msgType, new Map());
		}
		// set the function as the handler for this message
		this.handlers.get(msgType).set(msg, f);
		// update the actions map to have an array available
		// for the incoming message objects from the workers
		if (!this.actions.has(msgType)) {
			this.actions.set(msgType, []);
		}
		// return the updated handlers map
		return this.handlers;
	  }
	};

	// There should never be more than
	// one instance of `ParDom` in an app
	var exports = win.pardom = (win.pardom || new ParDom());
	// Expose to CJS & AMD
	if ((typeof define)[0] == 'f') define(function() { return exports; });
	else if ((typeof module)[0] == 'o') module.exports = exports;
})(this);

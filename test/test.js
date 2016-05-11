var expect = require('expect');
requestAnimationFrame = function(f) {
	setTimeout(f, 20);
}
var pardom = require('../pardom');
var Worker = require('webworker-threads').Worker;

// test workers:
var w1 = new Worker(function () {
	this.onmessage = function(event) {
		self.close();
  };
});
var w2 = new Worker(function() { 
	this.onmessage = function(event) {
		console.log('GOT SCHEDULE1');
		switch(event.data) {
			case 'SCHEDULE1':
				console.log('GOT SCHEDULE1');
				postMessage({ type: 'TYPE_E1', action: 'A1' });
			break;
			default:
				postMessage(event.data);
		}
		self.close();
  };
});
var w3 = new Worker(function() { 
	this.onmessage = function(event) {
		postMessage(event.data);
		self.close();
  };
});
describe('ParDom', function() {
	describe('#registerWorker()', function () {
		it('registers a worker successfully', function () {
			var originalLength = pardom.workers.length;
			var workers = pardom.registerWorker(w1);
			var newLength = workers.length;
			expect(newLength).toEqual(originalLength + 1);
		});

		it('sends a initialization message after worker is registered', function (done) {
			var customMsg = 'CUSTOM INIT MSG';
			w2.thread.once('message', function(msg) {
				var expectedMsg = 'PARDOM';
				if(msg !== expectedMsg) {
					console.log('>> ERROR IN WORKER w2: ', 
						'Expected ' + expectedMsg + ' and got ' + msg);
					expect(msg).toEqual(expectedMsg);
				}
				var workersLst = pardom.registerWorker(w3, customMsg);
			}.bind(this));
			w3.thread.once('message', function(msg) {
				var expectedMsg = customMsg
				if(msg !== expectedMsg) {
					console.log('>> ERROR IN WORKER w3: ', 
						'Expected ' + expectedMsg + ' and got ' + msg);
					expect(msg).toEqual(expectedMsg);
				}
				expect(msg).toEqual(customMsg);
				done();
			}.bind(this));
			var workers = pardom.registerWorker(w2);
		});
	});
	describe('#registerMsg()', function () {
		it('registers a message successfully', function () {
			var tmsg1 = 'TMSG1';
			var action1 = 'ACTION1';
			var msgs = pardom.registerMsg(tmsg1, action1, function(msg) {
				msg.w.postMessage(action1);
			});
			expect(msgs.has(tmsg1)).toEqual(true, 
				'Type of message not present in the Map');
			expect(msgs.get(tmsg1).has(action1)).toEqual(true, 
				'Message action not present in the Map');
			expect(msgs.get(tmsg1).get(action1)).toNotBe(undefined, 
				'Function not registered');
			expect(pardom.actions.has(tmsg1)).toEqual(true, 
				'Message type not present in the frame actions');
			expect(pardom.actions.get(tmsg1)).toNotBe(undefined,
				'Undefined frame action');
			expect(pardom.actions.get(tmsg1).length).toEqual(0, 
				'Frame actions without an array');
		});

		it('registers more than one message successfully', function () {
			var tmsg1 = 'TMSG1';
			var action1 = 'ACTION1';
			var action2 = 'ACTION1';
			pardom.registerMsg(tmsg1, action1, function(msg) {
				msg.w.postMessage(action1);
			});
			var msgs = pardom.registerMsg(tmsg1, action2, function(msg) {
				msg.w.postMessage(action2);
			});
			expect(msgs.has(tmsg1)).toEqual(true,
				'Type of message ' + tmsg1 + ' not present in the Map');
			expect(msgs.get(tmsg1).has(action1)).toEqual(true,
				'Message action ' + action1 + ' not present in the Map');
			expect(msgs.get(tmsg1).has(action2)).toEqual(true,
				'Message action ' + action2 + ' not present in the Map');
			expect(msgs.get(tmsg1).get(action1)).toNotBe(undefined,
				'Function not registered in ' + action1);
			expect(msgs.get(tmsg1).get(action2)).toNotBe(undefined,
				'Function not registered in ' + action2);
		});

		it('registers more than one message type successfully', function () {
			var tmsg1 = 'TYPE_MSG_1';
			var action1 = 'TYPEACTION1';
			var tmsg2 = 'TYPE_MSG_2';
			var action2 = 'TYPEACTION2';
			var action3 = 'TYPEACTION3';
			pardom.registerMsg(tmsg1, action1, function(msg) {
				msg.w.postMessage('EXECUTED' + action1);
			});
			pardom.registerMsg(tmsg2, action2, function(msg) {
				msg.w.postMessage('EXECUTED' + action2);
			});
			var msgs = pardom.registerMsg(tmsg2, action3, function(msg) {
				msg.w.postMessage('EXECUTED' + action3);
			});
			expect(msgs.has(tmsg1)).toEqual(true,
				'Type of message ' + tmsg1 + ' not present in the Map');
			expect(msgs.has(tmsg2)).toEqual(true,
				'Type of message ' + tmsg2 + ' not present in the Map');
			expect(msgs.get(tmsg1).has(action1)).toEqual(true,
				'Message action ' + action1 + ' not present in the Map');
			expect(msgs.get(tmsg2).has(action2)).toEqual(true,
				'Message action ' + action2 + ' not present in the Map');
			expect(msgs.get(tmsg2).has(action3)).toEqual(true,
				'Message action ' + action3 + ' not present in the Map');
			expect(msgs.get(tmsg1).get(action1)).toNotBe(undefined,
				'Function not registered in ' + action1);
			expect(msgs.get(tmsg2).get(action2)).toNotBe(undefined,
				'Function not registered in ' + action2);
			expect(msgs.get(tmsg2).get(action3)).toNotBe(undefined,
				'Function not registered in ' + action3);
		});
	});
	describe('#scheduleMessage()', function () {
		it('can execute a single message', function (done) {
			var runTestMsg = 'SCHEDULE1';
			var tmsg1 = 'TYPE_E1';
			var action1 = 'A1';
			pardom.registerMsg(tmsg1, action1, function(msg) {
				console.log("EXECUTING");
				// msg.w.postMessage('EXECUTED' + action1);
			});
			// assuming w2 is already registered from the #registerWorker tests
/*
			w2.thread.once('message', function(msg) {
				console.log("GOT MESSAGE!!", msg);
				done();
			});
*/
			w2.postMessage(runTestMsg);
		});

		it('can execute a two messages of the same type', function (done) {
			done();
		});

		it('can execute a two messages of different types', function (done) {
			done();
		});

		it('executes messages in the order that the types were defined', function (done) {
			done();
		});
	});
});

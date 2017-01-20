var expect = require('expect');
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
		postMessage(JSON.stringify(event.data));
		self.close();
  };
});
var w3 = new Worker(function() { 
	this.onmessage = function(event) {
		postMessage(JSON.stringify(event.data));
		self.close();
  };
});
// test workers for the scheduler tests:
var w4 = new Worker(function() {
	this.onmessage = function(event) {
		var obj1 = { type: 'TYPE_E1', action: 'A1' };
		switch(event.data) {
			case 'SCHEDULE1':
				postMessage(obj1);
			break;
		}
		self.close();
  };
});
var w5 = new Worker(function() {
	this.onmessage = function(event) {
		var obj2a = { type: 'TYPE_E2', action: 'A' };
		var obj2b = { type: 'TYPE_E2', action: 'B' };
		var obj2c = { type: 'TYPE_E2', action: 'C' };
		if(event.data === 'SCHEDULE2') {
				postMessage(obj2a);
				postMessage(obj2b);
				postMessage(obj2c);
		}
		self.close();
  };
});
var w6 = new Worker(function() {
	this.onmessage = function(event) {
		var objMsg = { type: 'TYPE_I', action: 'DONT_IGNORE' };
		var objIgnore = { type: 'TYPE_I', action: 'IGNORE' };
		var objFinish = { type: 'TYPE_I', action: 'FINISH' };
		if(event.data === 'SCHEDULE_IGNORE') {
				postMessage(objMsg);
				postMessage(objIgnore);
				postMessage(objFinish);
		}
		self.close();
  };
});
var w7 = new Worker(function() {
	this.onmessage = function(event) {
		var a = { type: 'TYPE_T1', action: 'A' };
		var b = { type: 'TYPE_T2', action: 'B' };
		var c = { type: 'TYPE_T1', action: 'C' };
		if(event.data === 'SCHEDULE_TYPES') {
				postMessage(a);
				postMessage(b);
				postMessage(c);
		}
		self.close();
  };
});

var w8 = new Worker(function() {
	this.onmessage = function(event) {
		var obj1 = { type: 'TYPE_E1_NONSTACK', action: 'A1' };
		switch(event.data) {
			case 'SCHEDULE1_NONSTACK':
				postMessage(obj1);
			break;
		}
		self.close();
  };
});
var w9 = new Worker(function() {
	this.onmessage = function(event) {
		var a = { type: 'TYPE_O3', action: 'A' };
		var b = { type: 'TYPE_O2', action: 'B' };
		var c = { type: 'TYPE_O1', action: 'C' };
		var d = { type: 'TYPE_O3', action: 'D' };
		if(event.data === 'SCHEDULE_ORDER') {
// while messages from type O3 are being processed, send O2 and O1 and expect
// them to be run in the order they were defined: O1 before O2
				postMessage(a);
				postMessage(b);
				postMessage(c);
				postMessage(d);
		}
		self.close();
  };
});
var w10 = new Worker(function() {
	this.onmessage = function(event) {
		var obj1 = { type: 'TYPE_E1_IMMEDIATE', action: 'A1' };
		switch(event.data) {
			case 'SCHEDULE1_IMMEDIATE':
				postMessage(obj1);
			break;
		}
		self.close();
  };
});

// Tests start here
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
				var expectedMsg = JSON.stringify('PARDOM');
				if(msg !== expectedMsg) {
					console.log('>> ERROR IN WORKER w2: ', 
						'Expected ' + expectedMsg + ' and got ' + msg);
					expect(msg).toEqual(expectedMsg);
				}
				var workersLst = pardom.registerWorker(w3, customMsg);
			}.bind(this));
			w3.thread.once('message', function(msg) {
				var expectedMsg = JSON.stringify(customMsg);
				if(msg !== expectedMsg) {
					console.log('>> ERROR IN WORKER w3: ', 
						'Expected ' + expectedMsg + ' and got ' + msg);
					expect(msg).toEqual(expectedMsg);
				}
				expect(msg).toEqual(expectedMsg);
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
			pardom.registerWorker(w4, runTestMsg);
			pardom.registerMsg(tmsg1, action1, function(msg) {
				done();
				// ^ message got executed
			});
		});
		it('can execute a non-stackable single message', function (done) {
			var runTestMsg = 'SCHEDULE1_NONSTACK';
			var tmsg1 = 'TYPE_E1_NONSTACK';
			var action1 = 'A1';
			pardom.registerWorker(w8, runTestMsg);
			pardom.registerMsg(tmsg1, action1, function(msg) {
				done();
				// ^ message got executed
			}, { dontStack: true });
		});
		it.only('can execute an immediate single message', function (done) {
			var runTestMsg = 'SCHEDULE1_IMMEDIATE';
			var tmsg1 = 'TYPE_E1_IMMEDIATE';
			var action1 = 'A1';
			pardom.registerWorker(w10, runTestMsg);
			pardom.registerMsg(tmsg1, action1, function(msg) {
				done();
				// ^ message got executed
			}, { immediate: true });
		});
		it('can execute different messages of the same type', function (done) {
			var runTestMsg = 'SCHEDULE2';
			var tmsg = 'TYPE_E2';
			var actionA = 'A';
			var actionB = 'B';
			var actionC = 'C';
			var hasRunActionA = false;
			var hasRunActionB = false;
			pardom.registerMsg(tmsg, actionA, function(msg) {
				expect(hasRunActionB).toBe(false,
				'Actions must be executed in the same order they were issued: ' + 
				'Running ACTION A after ACTION B');
				hasRunActionA = true;
			});
			pardom.registerMsg(tmsg, actionB, function(msg) {
				hasRunActionB = true;
				expect(hasRunActionA).toBe(true, 
				'Actions must be executed in the same order they were issued: ' + 
				'Running ACTION B before ACTION A');
			});
			pardom.registerMsg(tmsg, actionC, function(msg) {
				var baseMsg = 'Actions must be executed in the same order they were issued: ';
				expect(hasRunActionA).toBe(true, baseMsg +
				'Running ACTION C before ACTION A');
				expect(hasRunActionB).toBe(true, baseMsg +
				'Running ACTION C before ACTION B');
				done();
			});
			pardom.registerWorker(w5, runTestMsg);
		});

		it('ignores messages that are not registered', function (done) {
			var runTestMsg = 'SCHEDULE_IGNORE';
			var tmsg = 'TYPE_I';
			var action = 'DONT_IGNORE';
			var finish = 'FINISH';
			var hasRunAction = false;
			pardom.registerMsg(tmsg, action, function(msg) {
				hasRunAction = true;
			});
			pardom.registerMsg(tmsg, finish, function(msg) {
				expect(hasRunAction).toBe(true, 
				'Executing the last action out of order. ' + 
				'The first action must be executed before this one.');
				done();
			});
			pardom.registerWorker(w6, runTestMsg);
		});
		it('executes messages of different types in their own batch', function (done) {
			var runTestMsg = 'SCHEDULE_TYPES';
			var tmsg1 = 'TYPE_T1';
			var tmsg2 = 'TYPE_T2';
			var actionA = 'A';
			var actionB = 'B';
			var actionC = 'C';
			var hasRunA = false;
			var hasRunB = false;
			var hasRunC = false;
			pardom.registerMsg(tmsg1, actionA, function(msg) {
				hasRunA = true;
				expect(hasRunB || hasRunC).toBe(false, 
				'Executing the action A out of order. ' + 
				'Action A must be executed before every other action.');
			});
			pardom.registerMsg(tmsg1, actionC, function(msg) {
				hasRunC = true;
				expect(hasRunA).toBe(true, 
				'Executing the C action out of order. ' + 
				'Action A must be executed before this one.');
				expect(hasRunB).toBe(false, 
				'Executing the C action out of order. ' + 
				'Action B must be executed after this one.');
			});
			pardom.registerMsg(tmsg2, actionB, function(msg) {
				hasRunB = true;
				expect(hasRunA && hasRunC).toBe(true, 
				'Executing the B action out of order. ' + 
				'Actions A and C must be executed before this one.' + 
				'Their type was registered before ' + tmsg2);
				done();
			});
			pardom.registerWorker(w7, runTestMsg);
		});

		it('executes messages in the order that the types were sent', function (done) {
			var runTestMsg = 'SCHEDULE_ORDER';
			var tmsg1 = 'TYPE_O1';
			var tmsg2 = 'TYPE_O2';
			var tmsg3 = 'TYPE_O3';
			var actionA = 'A';
			var actionB = 'B';
			var actionC = 'C';
			var actionD = 'D';
			var hasRunA = false;
			var hasRunB = false;
			var hasRunC = false;
			var hasRunD = false;
			// check the code of w9
			pardom.registerMsg(tmsg1, actionC, function(msg) {
				hasRunC = true;
				expect(hasRunA && hasRunD && hasRunC).toBe(true,
				'Executing the action C out of order. ' +
				'Action C must be the last executed action.');
				done();
			});
			pardom.registerMsg(tmsg2, actionB, function(msg) {
				hasRunB = true;
				expect(hasRunA && hasRunD).toBe(true,
				'Executing the action B out of order. ' +
				'Action B must be executed after A and D.');
				expect(hasRunC).toBe(false,
				'Execuuting action B out of order. ' + 
				'Action B must be executed before C.');
			});
			pardom.registerMsg(tmsg3, actionA, function(msg) {
				hasRunA = true;
				expect(hasRunB || hasRunD || hasRunC).toBe(false,
				'Executing the action A out of order. ' +
				'Action A must be the first executed action.');
			});
			pardom.registerMsg(tmsg3, actionD, function(msg) {
				hasRunD = true;
				expect(hasRunA).toBe(true,
				'Executing the action D out of order. ' +
				'Action D must be executed after action A.');
				expect(hasRunB || hasRunC).toBe(false,
				'Executing the action D out of order. ' +
				'Action D must be executed before action B and action C.');
			});
			pardom.registerWorker(w9, runTestMsg);
		});
	});
});

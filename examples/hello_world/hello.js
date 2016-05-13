console.log("[worker]", "IN WORKER");

onmessage = function(e) {
	console.log("[worker]", "got message", e.data);
	// this.postMessage({ type: "MEH", action: "YESSIR", args: [1,2] });
}

setTimeout( function() {
	this.postMessage({ type: "BAM", action: "YESSIR", args: [4,5] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [3,3] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [7,7] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [10,20] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [7] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [1024] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [2048] });
	this.postMessage({ type: "BAM", action: "YESSIR", args: [4096] });
	this.postMessage({ type: "MEH", action: "YESSIR", args: [10,20] });
	this.postMessage({ type: "MEH", action: "YESSIR", args: [2000,20000] });
	this.postMessage({ type: "MEH", action: "YESSIR", args: [10,20] });
	this.postMessage({ type: "MEH", action: "YESSIR", args: [2000,20000] });
	this.postMessage({ type: "FOO", action: "BAR", args: [Math.random(), Math.random()] });
	this.postMessage({ type: "FOO", action: "BAR", args: [Math.random(), Math.random()] });
	this.postMessage({ type: "FOO", action: "BAR", args: [Math.random(), Math.random()] });
	this.postMessage({ type: "FOO", action: "BAR", args: [Math.random(), Math.random()] });
}.bind(this), 4000);

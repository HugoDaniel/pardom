With ParDom you can
-------------------

* Create JavaScript apps that are super fast and light on the memory
* Easily manage your code as it grows without compromising performance
* Push side-effects to the edge and keep the most important parts of your code pure.
* Commit to battle proven software engineering good practices such as:
	* KISS (Keeping It Super Simple)
	* DRY (Don't Repeat Yourself) 
	* YAGNI (You Aren't Gonna Need It).

How does it help you do all that ?
----------------------------------

* ParDom serially processes batches of messages sent by WebWorkers ([or similar interfaces](https://github.com/audreyt/node-webworker-threads))
* You run your code in its own threads
* Separate the IO and serialize it in pardom (stuff like DOM reads/writes)
* It uses requestAnimationFrame as the default timer function
* Plays well with the "Performance" and "Debugger" tools present in modern browsers

So whats the catch ?
--------------------

* You have to define a communication protocol between the workers and pardom
	* But I am working on a set of beautiful functions that abstract common use cases
* Experience required in writing code and defining PDU's
* Code is written in ES6, support for Safari is done by transpiling away stuff in dist/pardom.js
	* No Edge support (it might work though)
* No sugar added, just plain JavaScript code

ParDom
======

A simple JavaScript message scheduler.





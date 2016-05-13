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
* Separate and serialize IO in pardom (stuff like DOM reads/writes)
* It uses requestAnimationFrame as the default timer function
* Plays well with the "Performance" and "Debugger" tools present in modern browsers


ParDom
======

A simple JavaScript message scheduler.





OLD STUFF (DON'T READ THIS IF YOU ARE NOT ME)
===============================
Serialzy Parallel DOM accesses.

An extensible WebWorkers message scheduler based on requestAnimationFrame.


ParDom executes the functions associated to each message.

Messages are organized in batches according to their message type.

Each batch gets processed in a different frame.

The results are passed back to the workers as soon as they are available.

You define the types of messages and how they should be handled.

This allows you to paralelize all your application state handling while making 
sure that the critical serial parts are done in a orderly way (e.g. DOM reads 
and writes).

### Pro Tip

If you have a heavy function that requires more than a frame time 
(which is ~16ms at 60fps) then break it into smaller pieces and 
create another message type for them. By creating another message type
you are making sure it gets executed on its own frame (giving it the 
full time of the frame to operate).

Init
----


Messages
--------

Web Workers communicate via messages. 
ParDom serially processes batches of messages.
It keeps a batch of messages for each type of message.
It runs each message batch in its own frame.

To specify a handler for a message use `registerMsg`: 

`
pardom.registerMsg(TYPE, MSG, function(DETAIL, worker, workers) { });
`

TYPE can be any string you want, if more than one message of the same type is sent 
then their handler function will be execute on the same frame.

DETAIL is anything extra passed with each message.


Workers
-------

After you create your workers you can register them in ParDom.
ParDom will listen for messages from the registered worker and call 
the corresponding function for each registered message.

ParDom will send the initMessage to the worker after registration is done.
If no initMessage is specified a default message "PARDOM" is sent.
Use this if you want to start the code on the worker side immediately after 
registration.

`
pardom.registerWorker(worker, workerId, initMessage);
`

// TODO:
ParDom If the worker was closed or terminated unregister it


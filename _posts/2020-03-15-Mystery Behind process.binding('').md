---
layout: post
title: Mystery Behind process.binding('')...
published: true
date: '2020-03-15'
---



Today I was going through my StackOverflow questions to see what are questions I asked in the past and found this old question about NodeJs [SO Question](https://stackoverflow.com/questions/45811559/how-to-find-a-source-file-used-in-process-binding-in-node-source-code), Which I asked when I was learning NodeJs first time. surprisingly two and a half years later question remains unanswered. 

This was the time when I was trying to understand how NodeJS works and reading about its internals, after googling for hours I understood this masterpiece is not just a Javascript library built on top of V8 but it has many components which work together to become a runtime. This was the first time when I got to know about how async works in computers, IO multiplexers, and libuv.  

Even though I keep reading this stuff now and then for different languages and frameworks I work on, I feel there is still more to know. I would suggest any newcomer to NodeJS or anyone who wants to learn async should read about IO multiplexing or at least docs about abstractions built on top of it like [Libuv](https://github.com/libuv/libuv) for NodeJs OR [MIO](https://github.com/tokio-rs/mio) for Rust, they have a lot of useful information and it's worth reading.

Okay, that's enough chitchat lets get back to the topic, so as per normal programmer's habit I was digging through standard library function calls (_which are called core modules in NodeJS world_) to see how it works, and I reached the  source file of fs module and observed that each of the javascript function eventually calls the functions which are made on the binding object like [stat function call](https://github.com/nodejs/node/blob/ab8bf26994677a5f0823b3810668f6cfa18374d9/lib/fs.js#L882) and when I looked up from where it's coming it was coming from `const binding=process.binding('fs')` so what is it? I didn't have any idea about the structure of the Node project and never bothered to look at readme to understand, I just wanted to know about where it's coming so I decided to shamelessly ask a question on StackOverflow. seems nobody cared and even I also forgot since I was just playing around Node and not doing any serious work at that time.

**Finally, Time to reveal the mystery**. What happens is binding is "
The process object is created in C++ using the V8 API
Some native properties are bound to the object here" --  Lance Ball in his slides, the link is below. phew...

If that sounds too complicated, in simple words V8 is a javascript engine that allows us to execute javascript, it also helps to write an extension in C/C++ which can be exposed to javascript to call from OR you can think of it as glue code. Of course, it is much more than that and very very complicated.

The bottom line is process is the object in C++ and It has a binding object defined which has various functions attached, well we can assume that for simplicity, I have very limited knowledge about C++ :(  
To find out which file ultimately going to execute your code is to find a file under directory [Node Source tree](https://github.com/nodejs/node/tree/master/src), mapping of file name and module is fairly easy, for example, `node_file.cc` for fs module and `node_http2.cc` for HTTP module and so on.
you will see lines like `env->SetMethod(target, 'stat', Stat)`  which says stat function is bound to Stat C++ function in the current file and this is how functions are mapped, certainly there is very complicated setup for all this to work but to answer my question this much information is enough. 

But, After two years Node codebase is changed drastically and they have abstracted the way binding is exposed for calling. you can check out the old commit of Node repository, I have pulled old commit for you guys   [Node source tree (OLD)](https://github.com/nodejs/node/tree/ab8bf26994677a5f0823b3810668f6cfa18374d9) and [FS module source](https://github.com/nodejs/node/blob/ab8bf26994677a5f0823b3810668f6cfa18374d9/src/node_file.cc).  



Hopefully, you got at least some idea about how this mysterious process.binding() works. 

Thanks for reading.  




**References:**  

[https://github.com/nodejs/node](https://github.com/nodejs/node)  
[https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)  
[http://lanceball.com/process-bindings/#/](http://lanceball.com/process-bindings/#/)

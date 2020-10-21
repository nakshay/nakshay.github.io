---
layout: post
title: JVM and native code (JNI, JNA, libffi)
published: true
date: '2020-04-12'
---



A few days ago one of my friends sent me an interesting blog post on how default [hashCode()](https://srvaroa.github.io/jvm/java/openjdk/biased-locking/2017/01/30/hashCode.html) works, the author explains how native code behind this method generates hashcode using different techniques. After reading this blog I started reading about `native` keyword before the hashCode() which does all this.

All Java programmer knows that definition of such methods is implemented in native code (C/C++) but many of them are unsure how JVM links this native code at the run time, as there is no relation between java byte code and native machine code. Someone will say that's the magic of JNI but in the end, JNI also wants us to write some C++ code OR "glue code"  for it to work, so the question is still there, How JVM links this glue code which is written in another language than Java? 

There is another way to make native calls without the need of writing C++ glue code and that is [JNA](https://github.com/java-native-access/jna), we can use the native shared library and call its functions from Java, although JNA uses JNI under the hood the overhead of writing glue code is removed from java programmer which requires different expertise and is a way harder than writing Java code.

What JNI actually does is, it asks us to declare the signature of a native function in our java code prefaced with a native keyword, so at the run time it can invoke the appropriate functions with correct parameters, passing the wrong number/type of argument will give you runtime errors. In short, JNI uses the calling convention that defines where the function arguments will be found and what will be their types. A calling convention also defines where will be the return type found so the caller can read it on completion of function execution.

Defining this convention is called [ABI](https://en.wikipedia.org/wiki/Application_binary_interface). It's a contract between two binary programs to communicate with each other. So high-level languages like  Java, C#, Python has to follow the ABI conventions so they can communicate with low-level languages like C, C++. You can imagine a similar thing happens when we use system calls. Whenever we read or write files/sockets from our code the programming languages internally make a system call to the kernel which are mostly written in C and that all happen because of ABI. Kernel/OS exposes ABI to other programs so they can call these system calls to get the work done.  

One can think ABI similar to the API which we use to build a Web application, We can literally call any API on the web if we follow the calling conventions, like HTTP methods, headers, parameters, etc. here callee does not need to know the caller and vice-versa.

So how JNA allow us to call native functions without writing the glue code which we abide to write when using JNI? the answer is [libffi](https://sourceware.org/libffi/), libffi provides the interface by for various calling conventions to call functions from one language to another language also known as invoking a foreign function or FFI(foreign function interface), It's a very thin machine-dependent library which needs an extra layer of type conversion that its users must provide like JNA.

So at the end JVM converts its byte code to machine code and our glue code (JNI) provides an ABI for JVM for communication and that's how we can call native functions. 

## Update:

JVM does not directly convert all code to the machine code, although there are some exceptions where code executed repeatedly is converted into machine code by JIT. I will be writing a another post to cover how interpreted languages are executed and how they communicate with the native code. Stay tunned.


Hopefully, that was an interesting read than regular JNI examples.

Thanks for reading.

**References:**  

[https://www3.ntu.edu.sg/home/ehchua/programming/java/JavaNativeInterface.html](https://www3.ntu.edu.sg/home/ehchua/programming/java/JavaNativeInterface.html)
[https://www.techbeamers.com/write-a-simple-jna-program-in-java/](https://www.techbeamers.com/write-a-simple-jna-program-in-java/)
[https://en.wikipedia.org/wiki/Foreign_function_interface](https://en.wikipedia.org/wiki/Foreign_function_interface)
[https://sourceware.org/libffi/](https://sourceware.org/libffi/)

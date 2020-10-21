---
layout: post
title: Rust Lifetimes - A Dead Simple Explanation
published: true
date: '2020-05-03'
---

In today's post, I will be talking about "Rust Lifetimes" the most difficult topic almost everyone faces while learning Rust at the beginning. 

If you don't know about [Rust](https://www.rust-lang.org/), It's a next-gen system programming language, very useful to build fast and reliable software. It has all features (pointers, low-level memory access, etc) that traditional system programming languages provide like C/ C++, but Rust also provides memory safety guarantees that high-level languages provide like Java, C#, Python, etc. and all that comes without the overhead of [Garbage Collector](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)) also without manual memory management.

Rust achieves this by using the special compiler features like ownership, borrow checker, and lifetimes. Ownership feature makes sure that there is always a single owner for each resource during program execution, Borrow checker takes care of transferring ownership, and lifetimes make sure there are no dangling references and all references remain valid. 

It's relatively easy to understand ownership and borrowing, the real trouble begins when compiler starts yelling at you for lifetimes. There are a ton of videos and blog post all over the internet that explains lifetimes but they all seems confusing to me at some point. I will attempt to explain lifetimes in the simplest possible way since I am also in the learning phase and can relate to other learner's mindset. 

Most of this will be a summary from the rust [book](https://doc.rust-lang.org/book/title-page.html). with some of my personal experience.

Let's begin. 

**Dangling pointers**

If you have ever worked with C / C++ you must have heard a word called danging pointers/ reference, it means a pointer you are holding is pointing the wrong location, i.e it is pointing to a memory location where no valid data is present or data present which you don't intend to point.  It looks like a small bug but it can have serious consequences like data corruption, security risk, and so on. 

Let's start with an example in C.

 
```c
#include<stdio.h>
#include<stdlib.h>

int* my_function() {
    int value = 777;
    return &value; // return the address of stack variable "value" = 777
}

void other_function() {
    int value = 123; // allocates stack variable "value"=123
}

int main(){

    int *ptr = my_function();
    other_function();
    printf("value returned from function is %d ",*ptr);
}
```

I am sure you will start feeling good by reading C code after a long time but soon the smile on your face will disappear when you encounter the output line.

Output:   
``` value returned from function is 123 ```

Yeh... it's shocking to see the output line printing  123 which we are not even returning from an "other_function" function.  Okay now all of you serious about dangling pointers and their consequences, let's see how rust deals with dangling references.

Let's take a famous example from the rust book itself. 

```c
fn main() {
    {
        let r;
        {
            let x = 5;
            r = &x;
        }
        println!("r: {}", r);
    }
}
```

Of course, This code doesn’t compile and the rust compiler gives us a very detailed explanation of why.

```rust
$ cargo run
   Compiling chapter10 v0.1.0 (file:///projects/chapter10)
error[E0597]: `x` does not live long enough
  --> src/main.rs:7:17
   |
7  |             r = &x;
   |                 ^^ borrowed value does not live long enough
8  |         }
   |         - `x` dropped here while still borrowed
9  | 
10 |         println!("r: {}", r);
   |                           - borrow later used here

error: aborting due to previous error

For more information about this error, try `rustc --explain E0597`.
error: could not compile `chapter10`.

To learn more, run the command again with --verbose.
```

Here the Rust borrow checker kicks in and validates if all borrows are valid, below visualization from rust book will make it clear.

```rust
fn main() {
    {
        let r;                // ---------+-- 'a
                              //          |
        {                     //          |
            let x = 5;        // -+-- 'b  |
            r = &x;           //  |       |
        }                     // -+       |
                              //          |
        println!("r: {}", r); //          |
    }                         // ---------+
}
```

It clearly shows x does not live long enough to remain valid after the scope ends. Identifying lifetime is easy in code like this but it gets difficult when our code has functions that return references.  Unfortunately, Rust compiler is not smart enough to identify lifetimes of all parameters to functions and ```validate which one will live long enough to compare with returned reference.``` and this is why we need to explicitly annotate the lifetimes of parameter.


**Lifetime annotations**

So lifetime annotation is a very weird syntax that most of us have not seen in other languages and that is one of the reasons it seems difficult. Let's study it step by step.

The syntax to specify the lifetime in rust is ``` 'a ``` instead of "a" you can use anything but in general Rust programmers use short characters like a/b to annotate lifetimes. This is another reason people struggle to understand lifetimes. I suggest taking a longer, more explanatory names to annotate lifetime when learning. 

Let's see another example from rust book for lifetimes with functions.

```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }
    println!("The longest string is {}", result);
}

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```


If you run above code by removing ```'a``` from the function signature compiler will yell at you with an error ```expected named lifetime parameter``` and adding ```'a``` everywhere doesn't either solve the problem. 
Remember one important point ```annotating lifetime does not elongate the lifetime of a reference, It is just to give extra information to the compiler about refernce lifetime.```


If you replace the function body with the below code, the compiler will still complain.

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    x
}
```

But Why?  Isn't x is a reference to string1 which has a longer lifetime? what's wrong here?

Let's decipher below line one by one.   
```rust 
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
```

The ```<'a>``` after the function name "longer" says function signature will have a single lifetime annotation that is ```'a```, then ```'a``` after parameter x and y says, both parameters have the same lifetime.  so rust takes the ```smallest``` of two if there are three, four, or more parameter with ```'a``` lifetime, the compiler will take the shortest lifetime of them.

So let's make this crystal clear first. ```If there are two or more parameters annotated with the same lifetime parameter compiler takes the smallest lifetime out of them``` These are called input lifetimes.

Now let's move at the return part of the function signature, it also says ```'a```  lifetimes on the output parameters are called output lifetimes.

What does compiler complain about when lifetimes are mismatched?
The answer is ``` The lifetime of input parameters should be equal or greater than the lifetime of output parameters if they are annotated with same lifetime parameter``` in our case that is ```'a``` and since compiler takes the shortest lifetimes for a single lifetime parameter, our modified function also fails to compile.


Let's modify it a little bit to give a compiler an idea that two are having different lifetimes and we want to return only one of them, with a longer lifetime. 

```rust
 fn longest<'a,'b>(x: &'a str, y: &'b str) -> &'a str 
 ```

You could also remove the lifetime from parameter y since its never used or returned.

```rust
fn longest<'a>(x: &'a str, y: & str) -> &'a str  
```

```This also shows you dont require lifetime annotation for every parameter```

Lifetimes is a very powerful tool that Rust uses to make sure all references are valid, and very important topic if you want to learn Rust.  Also, it's not always required in our code to work, there are some rules by which compiler can guess the lifetimes on its own, and the programmer doesn't need to specify them, these rules are called ```lifetime elision rules```. we will see what lifetime elision in the next blog.

I hope you understood what lifetimes are and does in Rust, It is one of the fastest-growing languages and because of its safety, performance, and expressiveness many large companies are giving it a serious thought. 

If you are planning to write software that needs to be fast, secure, and robust then I would suggest giving Rust a try. 

Thanks for reading.

**References:**  
[Rust Book](https://doc.rust-lang.org/book/title-page.html)

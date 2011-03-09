#k.js -- A funny little dsl for JavaScript

Playing with Backbone.js events, using underscore.js, thinking about fabjs, and thinking about ruby's 'everything-is-an-object' inspired me to
make this 'dsl' for JavaScript. 

I wanted to make JavaScript more dynamic, and also try to use a subset of JavaScripts features at the
same time.
I did not want to use any inheritance. I aslo did not want to use the `this` variable.


I think of a dsl as 'Using a programming language in such a way that it looks like your using a
different programming language than the one you are using'

Examples here are in CoffeeScript (CoffeeScript is JavaScript without as many parans, or curlies, and
a few more differences)

##Intro

Start out with regular object

    person_raw = name: 'Drew'

wrap the raw object like you would in jQuery

    person = k person

You can chain calls together like underscore.js  
But you calls are chained by default. You don't need to and can't call `chain`
because they are always 'chained'  
Use `()` (as in call the function) to get the value

For example, this will equal the raw person


    person()
    # so
    person() == person_raw



##Getting Properties

    person("name")() # --> "Drew"


##Setting Properties

    person "age=", 27


##Chaining

    person("eye-color=", "blue")("hair-color=", "brown")
    person("eye-color")() # --> blue
    person("hair-color")() # --> blue


## Functions 

The first parameter of every function will be the raw object
This will probably change to be the wrapped object soon...

     person "dye-hair", (the_this, new_color) ->
        #wrapping with k for now
        k(the_this)('hair-color=', new_color)
        return person 

     #calling that function

     person "dye-hair", "green"
   
Functions are called automatically. If you want to get a function without calling it, use a `.` in
front

     hair_function = person ".dye-hair"
     hair_function("green")


#Meta object

Every object that is wrapped recieved an extra key called `__k`. This is used for finding that object's
Meta-Object. Every Object ever wrapped in `k` will have a meta object.

for example

    person('meta')()  # this returns the meta object
    person('meta')('some_value=', 'some value goes here')
    alert person('meta')('some_value')()

You can also get the meta object like this

    k.meta(raw_person)

    #so

    k.meta(raw_person).some_value = 'whatever'



#Events.

I copied the code from backbone.js, with my own tweaks  
Here is an example to bind the set function.

    person 'bind', 'set', (raw, var_name, value) ->
      person_view 'render'
      
There is a `method_missing` event, which is one of the reasons I started this.
put the return value into the `return_value` member of the meta object



    person 'bind', 'method_missing', (raw, info) ->
      k.meta(raw).return_value = 'here is the value you were missing'



There are events for

  1. `before_set`
  2. `set`
  3. `before_get`
  4. `get`
  5. `method_missing`


##TODO

  1. like jQuery, make `k(k(obj))` be the same as `k(obj)` so you cant double wrap
  2. Have the first parameter of functions be the wrapped object, not the raw object
  3. More documentation
  4. Possibly a `before_call` and `call` event




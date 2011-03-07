#TODO:

fix index2.coffee


    obj = name: 'Drew'

    obj = k obj

    obj '.name' # --> k("Drew")
    name = obj '.name'
    alert name() # --> alerts drew

    obj '.age', 26


    str = k("Drew  jajajaj")
    str('replace', 'j', 'h')('replace', 'h', 'o')('replace', 'Drew', 'Santa Claus')
    alert str()

    obj 'bind', 'before_set', (e) ->
      if e('.prop') == 'test'
        e ('meta')('.return_val', "this is a test")
        

    obj '.test', 'not a test'

    alert obj('.test')() # -> this is a test

  

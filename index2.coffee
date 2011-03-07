root = this #should be `window` on browser

k_maker = (var_name) ->
  idCounter = 0
  get_id = () ->
    return idCounter++
  _id = "__" + var_name
  meta_obj = {}
  m = meta = (obj) ->
    meta_obj[obj[_id]]
  init = (obj) ->
    if not(_id of obj)
      id = get_id()
      obj[_id] = id
      meta_obj[id] = {}
    
  bind = (o, event, callback) ->
    mo = m(o)
    mo._callbacks = mo._callbacks || {}
    calls = mo._callbacks or (mo._callbacks = {})
    list = mo._callbacks[event] or  (mo._callbacks[event] = [])
    list.push callback
    return o

  unbind = (o, event, callback) ->
    mo = m(o)
    if not event
      mo._callbacks = {}
    else if (calls = mo._callbacks) 
      if not callback
        calls[event] = []
      else
        list = calls[ev]
        if not list then return o
        for func, index in list
          if callback == func
            list.splice index, 1 
            break
    return o

  trigger =  (o, event, restOfArgs...) ->
    mo = m(o)
    calls = mo._callbacks
    if not calls then return o
    list = calls[event]
    ret = true
    if list
      for func, index in list
        func o, restOfArgs...
        if meta(o).stop_propagation == true
          delete meta(o).stop_propagation
          break
    allList = calls["all"]
    single_ret = true
    if allList
      for func, index in allList
        func o, event, restOfArgs...
    
  get = (obj, member) ->
    if not(member of obj)
      trigger obj, "error", key: member, message: "key doesnt exist"
      trigger func, "error", obj, key: member, message: "key doesn't exist"
      return func(obj)
    else
      ret = obj[member]
      return ret
  set = (obj, member, value) ->
    obj[member] = value
    return obj
  make_func = (chained) ->
    func1 = (obj) ->
      #add special handlers to turn numbers and strings into objects
      init(obj)
      ret = (args...) ->
        if args.length is 0
          return obj
        else if args.length == 1
          inner_ret = () ->
            trigger obj, "before_get", args...
            trigger func, "before_get", obj, args...
            if meta(obj).return_value
              return_value = meta(obj).return_value 
              delete meta(obj).return_value
            else
              return_value = get obj, args...
            trigger obj, "after_get", args...
            trigger func, "after_get", obj, args...
            return return_value
        else if args.length is 2
          inner_ret = () ->
            trigger obj, "before_set", args...
            trigger func, "before_set", obj, args...
            if not meta(obj).really_set
              return_value = set obj, args...
            if meta(obj).return_value
              return_value = meta(obj).return_value   
              delete meta(obj).return_value
            trigger obj, "after_set", args...
            trigger func, "after_set", args...
            return_value
        if true == chained
          console.log inner_ret()
          return func.c(inner_ret())
        else 
          return inner_ret()
      return ret
    init(func1)
    return func1
  func = make_func(false)
  func.c = make_func(true)
  func["previous" + var_name] = root[var_name]
  func.no_conflict = () ->
    root[var_name] = func["previous" + var_name]
    func
  func.meta = func.m = meta
  func.sub = k_maker
  func.bind = bind
  func.trigger = trigger
  func.unbind = unbind
  bind func, "before_get", (func, obj, var_name, args...) -> #left off here 
    if var_name in ["bind", "trigger", "unbind"]
      meta(obj).return_value = (args...) ->
        func[var_name](obj, args...)
      meta(obj).stop_propagation = true
  func

      
k = k_maker "k"
me = name: "drew"
# k(me)("age", 26)

if (typeof exports != "undefined")
  exports = k
  k.k = k
else
  root.k = k  

k.VERSION = '0.1.0'




        



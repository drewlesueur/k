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
    
  bind_before = (o, event, callback) ->
    mo = m(o)
    mo._callbacks = mo._callbacks || {}
    calls = mo._callbacks or (mo._callbacks = {})
    list = mo._callbacks[event] or  (mo._callbacks[event] = [])
    list.unshift callback
    return o
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
    
  s = (val, start, end) ->
    need_to_join = false
    ret = []
    if _.isString val
      val = val.split ""
      need_to_join = true
    
    if start >= 0
    else
      start = val.length + start
    
    if _.isUndefined(end)
      ret = val.slice start
    else
      if end < 0
        end = val.length + end
      else
        end = end + start
      ret = val.slice start, end

    if need_to_join
      ret.join ""
    else
      ret

  get = (obj, member) ->
    trigger obj, 'before_get', member
    trigger func, 'before_get', obj, member
    if "return_value" of meta(obj)
      ret = meta(obj).return_value
    else
      if not(member of obj)
        trigger obj, "method_missing", key: member, message: "key doesnt exist"
        trigger func, "method_missing", obj, key: member, message: "key doesn't exist"
        if "return_value" of meta(obj)
          ret = meta(obj).return_value
      else
        ret = obj[member]
    trigger obj, 'get', member
    trigger func, 'get', obj, member
    return ret

  set = (obj, member, value) ->
    trigger obj, 'before_set', member, value
    trigger func, 'before_set', obj, member, value

    if "really_set" of meta(obj) and meta(obj).really_set == false
      delete meta(obj).really_set
    else
      return_value = obj[member] = value
      
      
    if "return_value" of meta(obj)
      ret = meta(obj).return_value
    else
      ret =  return_value
    trigger obj, 'set', member, value
    trigger func, 'set', obj, member, value
    return ret
  wrapped_type = "this_is_A_wrapped_type"
  marked_as_wrapped = "marked_as_wrapped"
  valueify = (obj) ->
    if obj.type == wrapped_type
      return obj.value
    return obj
    
  make_func = () ->
    func1 = (obj) ->
      if _.isFunction(obj) and obj[marked_as_wrapped] == true
        return obj
      if not (typeof obj == "object")
        obj = 
          type: wrapped_type
          value: obj
      #add special handlers to turn numbers and strings into objects
      init(obj)
      ret = (args...) ->
        if args.length is 0
          return valueify obj
        else 
          # call a function here
          trigger obj, 'call', args...
          trigger func, 'call', obj, args...
          return_value = meta(obj).return_value
          delete meta(obj).return_value
          return func(return_value)

      ret[marked_as_wrapped] = true
      return ret
    init(func1)
    return func1
  func = make_func()
  func["previous" + var_name] = root[var_name]
  func.no_conflict = () ->
    root[var_name] = func["previous" + var_name]
    func
  func.meta = func.m = meta
  func.test = (obj) ->
    console.log obj[_id]
    console.log "tested!"
  func.sub = k_maker
  func.bind = bind
  func.bind_before = bind_before
  func.trigger = trigger
  func.unbind = unbind
  func.s = s
  func.mixin = (funcs) ->
    for func_name, function1 of funcs
      func[func_name] = function1 

  bind func, 'call', (func, obj, var_name, args...) ->

    # trigger a before_call event or something?!

    if s(var_name, -1, 1) == "="
      var_name = s(var_name, 0,-1)
      ret = set(obj, var_name, args[0])
    if s(var_name, 0, 1) == "."
      var_name = s(var_name, 1)
      ret = get(obj, var_name)
    
    else 
      ret = get(obj, var_name)
      if _.isFunction(ret)
        ret = ret(obj, args...)
        if _.isUndefined(ret)
          ret = obj
    meta(obj).return_value = ret


  bind func, "method_missing", (func, obj, info) -> 
    if var_name of func
      meta(obj).return_value = (obj, args...) ->
        func[var_name](valueify(obj), args...)


  func.bind_before func, "method_missing", (func, obj, info) ->
    metao = meta(obj)
    if (metao.type) 
      metao.return_value = metao.type[info.key]
      metao.stop_propagation = true
    
   


  return func

      
k = k_maker "k"



if (typeof exports != "undefined")
  exports = k
  k.k = k
else
  root.k = k  

k.VERSION = '0.1.0'




        



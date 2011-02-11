root = this
makeLikeUnderscore = () ->
  like_ = (o) ->
    like_.currentObject = o
    return like_.methods
  like_.methods =
    chain: () ->
      like_.chained = true
      like_.methods
    value: () ->
      like_.chained = false
      like_.currentObject
  like_.mixin = (funcs) ->
    for name, func of funcs
      do (name, func) ->
        like_[name] = func
        like_.methods[name] = (args...) ->
          ret = func(like_.currentObject, args...)
          if like_.chained
            like_.currentObject = ret
            like_.methods
          else
            ret
  return like_
k = makeLikeUnderscore()

if (typeof exports != "undefined")
  exports = k
  k.k = k
else
  root.k = k  

k.VERSION = '0.1.0'

k.mixin
  s: (val, start, end) ->
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

  startsWith: (str, with_what) ->
    k.s(str, 0, with_what.length) == with_what
  
  rnd: (low, high) -> Math.floor(Math.random() * (high-low+1)) + low

  time: () ->
    (new Date()).getTime()

  replaceBetween: (str, start, between, end) ->
    pos = str.indexOf start
    if pos is -1 then return str
    endpos = str.indexOf end, pos + start.length
    if endpos is -1 then return str
    return k.s(str, 0, pos + start.length) + between + k.s(str, endpos)
  trimLeft: (obj) ->
    obj.toString().replace(/^\s+/, "")
  trimRight: (obj) ->
    obj.toString().replace(/\s+$/, "")
  isNumeric: (str) ->
    k.s(str, 0, 1).match(/\d/)




# Drew LeSueur @drewlesueur
# An abstraction for calling multiple asynchronous
# functions at once, and calling a callback 
# with the "return values" of all functions
# when they are all done.
# requires underscore.js

k.mixin # underscore.js mixin
  do_these: (to_dos, callback) ->
    return_values = if _.isArray(to_dos) then [] else {}
    make_jobs_done = (id) ->
      return (ret) ->
        return_values[id] = ret
        all_done = true
        _.each to_dos, (func, id) ->
          if not(id of return_values)
            all_done = false
            _.breakLoop()
        if all_done is true
          callback(return_values)
    _.each to_dos, (to_do, id) ->
      jobs_done = make_jobs_done(id)
      to_do(jobs_done)

##  Example usage
# get_pics = (done) ->
#   API.getPictures "houses", (urls) ->
#     done urls
#
# get_videos = (done) ->
#   API2.login, "user", "password", (access) ->
#     access.getVideos (videos) ->
#       done videos
#           
# k.do_these [get_pics, get_videos], (ret) ->
#   console.log "pics are", ret[0]
#   console.log "videos are", ret[1]
#
##  OR 
#
# k.do_these {pics: get_pics, videos: get_videos}, (ret) ->
#   console.log "pics are ", ret.pics
#   console.log "videos are", ret.videos
#

k.mixin makeLikeUnderscore: makeLikeUnderscore
_p = k._p = window._p = makeLikeUnderscore()
k._p = _p
k.metaInfo = {}
k.mixin
  class: (obj) ->
    funcs = []
    props = []
    for key, val of obj
      if key of _p then continue
      if _.isFunction val
        funcs.push key
      else 
        props.push key
    k.addPolymorphicMethods funcs
    k.addPolymorphicProps props
    obj
  new: (type, o, extra) ->
    extra = extra || {}
    if type then extra.type = type
    o = o or {}
    metaO = k.meta(o)
    _.extend metaO, extra
    if metaO.type and metaO.type.initialize then metaO.type.initialize o
    o
  reverseMeta: (cid) -> k.metaInfo[cid].record #meybe do this a different way
  meta: (o) -> 
    metaO =  k.metaInfo[o.__cid]
    if metaO then return metaO
    cid = _.uniqueId()
    o.__cid = cid
    return k.metaInfo[cid] = record: o
    
k.addPolymorphicMethods = (methodNames) ->
  mixins = {}
  for name in methodNames
    do(name) -> mixins[name] = (o, args...) -> k.meta(o).type[name] o, args...
  _p.mixin mixins
k.addPolymorphicProps = (propNames) -> #static attributes
  mixins = {}
  for name in propNames
    mixins[name] = (o) -> k.meta(o).type[name]
  _p.mixin mixins
window._m = _m = k.meta


k.mixin
  bind: (o, event, callback) ->
    mo = _m(o)
    calls = mo._callbacks or (mo._callbacks = {})
    list = mo._callbacks[event] or  (mo._callbacks[event] = [])
    list.push callback

  unbind: (o, event, callback) ->
    mo = _m(o)
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

  trigger: (o, event, restOfArgs...) ->
    mo = _m(o)
    calls = mo._callbacks
    if not calls then return o
    list = calls[event]
    if list
      for func, index in list
        func o, restOfArgs...
    allList = calls["all"]
    if allList
      for func, index in allList
        func o, event, restOfArgs...


#simple array with adding and removing
  
k.mixin
  initialize: (o) ->
    _m(o)._byCid = {}
  add: (o, item) ->
    o.push item
    mo = _m(o)
    if not mo._byCid then mo._byCid = {}
    mo._byCid[item.__cid] = item
    k(o).trigger "add", item, o  
    return o
  remove: (o, item) ->
    mo = _m(o)
    if not mo._byCid then return
    if not (item.__cid of mo._byCid)
      return false
    for member, key in o
      if member.__cid == item.__cid
        o.splice key, 1 
        k(o).trigger "remove", item, o


#TODO: Polish and add in a bunch more backbone.js methods        

#jQuery or zepto extensions.
jQuery = jQuery || false
Zepto = Zepto || false

if not (jQuery || Zepto)
  return

library = jQuery || Zepto
do (library) ->
  $ = library
  $.fn.dragsimple = (options) ->
    el = this 
    console.log el
    $(el).bind "mousedown", (e) ->
      obj = this
      e.preventDefault()
      parent_offset_left = $(obj).parent().offset().left
      parent_offset_top = $(obj).parent().offset().top
      start_offset_left = e.pageX - $(obj).offset().left
      start_offset_top = e.pageY - $(obj).offset().top 
      if _.isFunction options.start
        options.start obj

      mousemove = (e) ->
        new_left = e.pageX - parent_offset_left - start_offset_left
        new_top = e.pageY - parent_offset_top - start_offset_top
        if _.isFunction options.xFilter
          new_left = options.xFilter x, obj
        if _.isFunction options.yFilter
          new_top = options.yFilter obj
        $(obj).css("left", (new_left) + "px")
        $(obj).css("top", (new_top) + "px")
        if _.isFunction options.drag
          options.drag obj

      mouseup = (e) ->
        $(document.body).unbind "mousemove", mousemove
        if _.isFunction options.stop
          options.stop obj
      
      $(document.body).bind "mousemove", mousemove
      $(document.body).bind "mouseup", mouseup
    return el

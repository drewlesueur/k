(function() {
  var exports, k, k_maker, me, root;
  var __slice = Array.prototype.slice;
  root = this;
  k_maker = function(var_name) {
    var bind, func, get, get_id, idCounter, init, m, make_func, meta, meta_obj, set, trigger, unbind, _id;
    idCounter = 0;
    get_id = function() {
      return idCounter++;
    };
    _id = "__" + var_name;
    meta_obj = {};
    m = meta = function(obj) {
      return meta_obj[obj[_id]];
    };
    init = function(obj) {
      var id;
      if (!(_id in obj)) {
        id = get_id();
        obj[_id] = id;
        return meta_obj[id] = {};
      }
    };
    bind = function(o, event, callback) {
      var calls, list, mo;
      mo = m(o);
      mo._callbacks = mo._callbacks || {};
      calls = mo._callbacks || (mo._callbacks = {});
      list = mo._callbacks[event] || (mo._callbacks[event] = []);
      list.push(callback);
      return o;
    };
    unbind = function(o, event, callback) {
      var calls, func, index, list, mo, _len;
      mo = m(o);
      if (!event) {
        mo._callbacks = {};
      } else if ((calls = mo._callbacks)) {
        if (!callback) {
          calls[event] = [];
        } else {
          list = calls[ev];
          if (!list) {
            return o;
          }
          for (index = 0, _len = list.length; index < _len; index++) {
            func = list[index];
            if (callback === func) {
              list.splice(index, 1);
              break;
            }
          }
        }
      }
      return o;
    };
    trigger = function() {
      var allList, calls, event, func, index, list, mo, o, restOfArgs, ret, single_ret, _len, _len2, _results;
      o = arguments[0], event = arguments[1], restOfArgs = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      mo = m(o);
      calls = mo._callbacks;
      if (!calls) {
        return o;
      }
      list = calls[event];
      ret = true;
      if (list) {
        for (index = 0, _len = list.length; index < _len; index++) {
          func = list[index];
          func.apply(null, [o].concat(__slice.call(restOfArgs)));
          if (meta(o).stop_propagation === true) {
            delete meta(o).stop_propagation;
            break;
          }
        }
      }
      allList = calls["all"];
      single_ret = true;
      if (allList) {
        _results = [];
        for (index = 0, _len2 = allList.length; index < _len2; index++) {
          func = allList[index];
          _results.push(func.apply(null, [o, event].concat(__slice.call(restOfArgs))));
        }
        return _results;
      }
    };
    get = function(obj, member) {
      var ret;
      if (!(member in obj)) {
        trigger(obj, "error", {
          key: member,
          message: "key doesnt exist"
        });
        trigger(func, "error", obj, {
          key: member,
          message: "key doesn't exist"
        });
        return func(obj);
      } else {
        ret = obj[member];
        return ret;
      }
    };
    set = function(obj, member, value) {
      obj[member] = value;
      return obj;
    };
    make_func = function(chained) {
      var func1;
      func1 = function(obj) {
        var ret;
        init(obj);
        ret = function() {
          var args, inner_ret;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (args.length === 0) {
            return obj;
          } else if (args.length === 1) {
            inner_ret = function() {
              var return_value;
              trigger.apply(null, [obj, "before_get"].concat(__slice.call(args)));
              trigger.apply(null, [func, "before_get", obj].concat(__slice.call(args)));
              if (meta(obj).return_value) {
                return_value = meta(obj).return_value;
                delete meta(obj).return_value;
              } else {
                return_value = get.apply(null, [obj].concat(__slice.call(args)));
              }
              trigger.apply(null, [obj, "after_get"].concat(__slice.call(args)));
              trigger.apply(null, [func, "after_get", obj].concat(__slice.call(args)));
              return return_value;
            };
          } else if (args.length === 2) {
            inner_ret = function() {
              var return_value;
              trigger.apply(null, [obj, "before_set"].concat(__slice.call(args)));
              trigger.apply(null, [func, "before_set", obj].concat(__slice.call(args)));
              if (!meta(obj).really_set) {
                return_value = set.apply(null, [obj].concat(__slice.call(args)));
              }
              if (meta(obj).return_value) {
                return_value = meta(obj).return_value;
                delete meta(obj).return_value;
              }
              trigger.apply(null, [obj, "after_set"].concat(__slice.call(args)));
              trigger.apply(null, [func, "after_set"].concat(__slice.call(args)));
              return return_value;
            };
          }
          if (true === chained) {
            console.log(inner_ret());
            return func.c(inner_ret());
          } else {
            return inner_ret();
          }
        };
        return ret;
      };
      init(func1);
      return func1;
    };
    func = make_func(false);
    func.c = make_func(true);
    func["previous" + var_name] = root[var_name];
    func.no_conflict = function() {
      root[var_name] = func["previous" + var_name];
      return func;
    };
    func.meta = func.m = meta;
    func.sub = k_maker;
    func.bind = bind;
    func.trigger = trigger;
    func.unbind = unbind;
    bind(func, "before_get", function() {
      var args, obj;
      func = arguments[0], obj = arguments[1], var_name = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
      if (var_name === "bind" || var_name === "trigger" || var_name === "unbind") {
        meta(obj).return_value = function() {
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return func[var_name].apply(func, [obj].concat(__slice.call(args)));
        };
        return meta(obj).stop_propagation = true;
      }
    });
    return func;
  };
  k = k_maker("k");
  me = {
    name: "drew"
  };
  if (typeof exports !== "undefined") {
    exports = k;
    k.k = k;
  } else {
    root.k = k;
  }
  k.VERSION = '0.1.0';
}).call(this);

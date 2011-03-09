(function() {
  var exports, k, k_maker, root;
  var __slice = Array.prototype.slice;
  root = this;
  k_maker = function(var_name) {
    var bind, bind_before, func, get, get_id, idCounter, init, m, make_func, meta, meta_obj, s, set, trigger, unbind, wrapped_type, _id;
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
    bind_before = function(o, event, callback) {
      var calls, list, mo;
      mo = m(o);
      mo._callbacks = mo._callbacks || {};
      calls = mo._callbacks || (mo._callbacks = {});
      list = mo._callbacks[event] || (mo._callbacks[event] = []);
      list.unshift(callback);
      return o;
    };
    bind = function(o, event, callback) {
      var calls, list, mo;
      console.log("the event is");
      console.log(o);
      console.log(event);
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
    s = function(val, start, end) {
      var need_to_join, ret;
      need_to_join = false;
      ret = [];
      if (_.isString(val)) {
        val = val.split("");
        need_to_join = true;
      }
      if (start >= 0) {} else {
        start = val.length + start;
      }
      if (_.isUndefined(end)) {
        ret = val.slice(start);
      } else {
        if (end < 0) {
          end = val.length + end;
        } else {
          end = end + start;
        }
        ret = val.slice(start, end);
      }
      if (need_to_join) {
        return ret.join("");
      } else {
        return ret;
      }
    };
    get = function(obj, member) {
      var ret;
      trigger(func, 'before_get', obj, member);
      trigger(obj, 'before_get', member);
      if ("return_value" in meta(obj)) {
        ret = meta(obj).return_value;
      } else {
        if (!(member in obj)) {
          trigger(obj, "method_missing", {
            key: member,
            message: "key doesnt exist"
          });
          trigger(func, "method_missing", obj, {
            key: member,
            message: "key doesn't exist"
          });
          if ("return_value" in meta(obj)) {
            ret = meta(obj).return_value;
          }
        } else {
          ret = obj[member];
        }
      }
      trigger(func, 'get', obj, member);
      trigger(obj, 'get', member);
      return ret;
    };
    set = function(obj, member, value) {
      var ret, return_value;
      trigger(func, 'before_set', obj, member, value);
      trigger(obj, 'before_set', member, value);
      if ("really_set" in meta(obj) && meta(obj).really_set === false) {
        delete meta(obj).really_set;
      } else {
        return_value = obj[member] = value;
      }
      if ("return_value" in meta(obj)) {
        ret = meta(obj).return_value;
      } else {
        ret = return_value;
      }
      trigger(func, 'set', obj, member, value);
      trigger(obj, 'set', member, value);
      return ret;
    };
    wrapped_type = "this_is_A_wrapped_type";
    make_func = function() {
      var func1;
      func1 = function(obj) {
        var ret;
        if (!(typeof obj === "object")) {
          obj = {
            type: wrapped_type,
            value: obj
          };
        }
        init(obj);
        ret = function() {
          var args, return_value;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (args.length === 0) {
            if (obj.type === wrapped_type) {
              return obj.value;
            }
            return obj;
          } else {
            trigger.apply(null, [func, 'call', obj].concat(__slice.call(args)));
            trigger.apply(null, [obj, 'call'].concat(__slice.call(args)));
            return_value = meta(obj).return_value;
            delete meta(obj).return_value;
            return func(return_value);
          }
        };
        return ret;
      };
      init(func1);
      return func1;
    };
    func = make_func();
    func["previous" + var_name] = root[var_name];
    func.no_conflict = function() {
      root[var_name] = func["previous" + var_name];
      return func;
    };
    func.meta = func.m = meta;
    func.test = function(obj) {
      console.log(obj[_id]);
      return console.log("tested!");
    };
    func.sub = k_maker;
    func.bind = bind;
    func.trigger = trigger;
    func.unbind = unbind;
    func.s = s;
    func.mixin = function(funcs) {
      var func_name, function1, _results;
      _results = [];
      for (func_name in funcs) {
        function1 = funcs[func_name];
        _results.push(func[func_name] = function1);
      }
      return _results;
    };
    bind(func, 'call', function() {
      var args, obj, ret;
      func = arguments[0], obj = arguments[1], var_name = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
      if (s(var_name, -1, 1) === "=") {
        var_name = s(var_name, 0, -1);
        ret = set(obj, var_name, args[0]);
      }
      if (s(var_name, 0, 1) === ".") {
        var_name = s(var_name, 1);
        ret = get(obj, var_name);
      } else {
        ret = get(obj, var_name);
        if (_.isFunction(ret)) {
          ret = ret.apply(null, [obj].concat(__slice.call(args)));
          if (_.isUndefined(ret)) {
            ret = obj;
          }
        }
      }
      return meta(obj).return_value = ret;
    });
    bind(func, "method_missing", function(func, obj, info) {
      if (var_name in func) {
        return meta(obj).return_value = function() {
          var args;
          obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return func[var_name].apply(func, [obj].concat(__slice.call(args)));
        };
      }
    });
    return func;
  };
  k = k_maker("k");
  if (typeof exports !== "undefined") {
    exports = k;
    k.k = k;
  } else {
    root.k = k;
  }
  k.VERSION = '0.1.0';
}).call(this);

(function() {
  var exports, k, library, m, makeLikeUnderscore, p, root;
  var __slice = Array.prototype.slice;
  root = this;
  makeLikeUnderscore = function(varName) {
    var like_;
    like_ = function(o) {
      like_.currentObject = o;
      return like_.methods;
    };
    like_.methods = {
      chain: function() {
        like_.chained = true;
        return like_.methods;
      },
      value: function() {
        like_.chained = false;
        return like_.currentObject;
      }
    };
    like_.mixin = function(funcs) {
      var func, name, _results;
      _results = [];
      for (name in funcs) {
        func = funcs[name];
        _results.push((function(name, func) {
          like_[name] = func;
          return like_.methods[name] = function() {
            var args, ret;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            ret = func.apply(null, [like_.currentObject].concat(__slice.call(args)));
            if (like_.chained) {
              like_.currentObject = ret;
              return like_.methods;
            } else {
              return ret;
            }
          };
        })(name, func));
      }
      return _results;
    };
    like_["previous" + varName] = root[varName];
    like_.noConflict = function() {
      root[varName] = like_["previous" + varName];
      return like_;
    };
    return like_;
  };
  k = makeLikeUnderscore();
  if (typeof exports !== "undefined") {
    exports = k;
    k.k = k;
  } else {
    root.k = k;
  }
  k.VERSION = '0.1.0';
  k.mixin({
    s: function(val, start, end) {
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
    },
    startsWith: function(str, with_what) {
      return k.s(str, 0, with_what.length) === with_what;
    },
    rnd: function(low, high) {
      return Math.floor(Math.random() * (high - low + 1)) + low;
    },
    time: function() {
      return (new Date()).getTime();
    },
    replaceBetween: function(str, start, between, end) {
      var endpos, pos;
      pos = str.indexOf(start);
      if (pos === -1) {
        return str;
      }
      endpos = str.indexOf(end, pos + start.length);
      if (endpos === -1) {
        return str;
      }
      return k.s(str, 0, pos + start.length) + between + k.s(str, endpos);
    },
    trimLeft: function(obj) {
      return obj.toString().replace(/^\s+/, "");
    },
    trimRight: function(obj) {
      return obj.toString().replace(/\s+$/, "");
    },
    isNumeric: function(str) {
      return k.s(str, 0, 1).match(/\d/);
    },
    capitalize: function(str) {
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    }
  });
  k.mixin({
    do_these: function(to_dos, callback) {
      var make_jobs_done, return_values;
      return_values = _.isArray(to_dos) ? [] : {};
      make_jobs_done = function(id) {
        return function(ret) {
          var all_done;
          return_values[id] = ret;
          all_done = true;
          _.each(to_dos, function(func, id) {
            if (!(id in return_values)) {
              all_done = false;
              return _.breakLoop();
            }
          });
          if (all_done === true) {
            return callback(return_values);
          }
        };
      };
      return _.each(to_dos, function(to_do, id) {
        var jobs_done;
        jobs_done = make_jobs_done(id);
        return to_do(jobs_done);
      });
    }
  });
  k.mixin({
    makeLikeUnderscore: makeLikeUnderscore
  });
  p = k.p = window.p = makeLikeUnderscore();
  k.p = p;
  k.metaInfo = {};
  k.mixin({
    "class": function(obj) {
      var funcs, key, props, val;
      funcs = [];
      props = [];
      for (key in obj) {
        val = obj[key];
        if (key in p) {
          continue;
        }
        if (_.isFunction(val)) {
          funcs.push(key);
        } else {
          props.push(key);
        }
      }
      k.addPolymorphicMethods(funcs);
      k.addPolymorphicProps(props);
      return obj;
    },
    "new": function() {
      var extra, metaO, o, rest, type, _ref;
      type = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      extra = {};
      if (type) {
        extra.type = type;
      }
      o = {};
      metaO = k.meta(o);
      _.extend(metaO, extra);
      if (metaO.type && metaO.type.initialize) {
        (_ref = metaO.type).initialize.apply(_ref, [o].concat(__slice.call(rest)));
      }
      return o;
    },
    reverseMeta: function(cid) {
      return k.metaInfo[cid].record;
    },
    meta: function(o) {
      var cid;
      if ((o.__cid != null) && k.metaInfo[o.__cid]) {
        return k.metaInfo[o.__cid];
      }
      cid = _.uniqueId();
      o.__cid = cid;
      return k.metaInfo[cid] = {
        record: o
      };
    }
  });
  k.addPolymorphicMethods = function(methodNames) {
    var mixins, name, _fn, _i, _len;
    mixins = {};
    _fn = function(name) {
      return mixins[name] = function() {
        var args, o, _ref;
        o = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = k.meta(o).type)[name].apply(_ref, [o].concat(__slice.call(args)));
      };
    };
    for (_i = 0, _len = methodNames.length; _i < _len; _i++) {
      name = methodNames[_i];
      _fn(name);
    }
    return p.mixin(mixins);
  };
  k.addPolymorphicProps = function(propNames) {
    var mixins, name, _i, _len;
    mixins = {};
    for (_i = 0, _len = propNames.length; _i < _len; _i++) {
      name = propNames[_i];
      mixins[name] = function(o) {
        return k.meta(o).type[name];
      };
    }
    return p.mixin(mixins);
  };
  window.m = m = k.meta;
  k.mixin({
    bind: function(o, event, callback) {
      var calls, list, mo;
      mo = m(o);
      mo._callbacks = mo._callbacks || {};
      calls = mo._callbacks || (mo._callbacks = {});
      list = mo._callbacks[event] || (mo._callbacks[event] = []);
      list.push(callback);
      return o;
    },
    unbind: function(o, event, callback) {
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
    },
    trigger: function() {
      var allList, calls, event, func, index, list, mo, o, restOfArgs, _len, _len2, _results;
      o = arguments[0], event = arguments[1], restOfArgs = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      mo = m(o);
      calls = mo._callbacks;
      if (!calls) {
        return o;
      }
      list = calls[event];
      if (list) {
        for (index = 0, _len = list.length; index < _len; index++) {
          func = list[index];
          func.apply(null, [o].concat(__slice.call(restOfArgs)));
        }
      }
      allList = calls["all"];
      if (allList) {
        _results = [];
        for (index = 0, _len2 = allList.length; index < _len2; index++) {
          func = allList[index];
          _results.push(func.apply(null, [o, event].concat(__slice.call(restOfArgs))));
        }
        return _results;
      }
    }
  });
  k.mixin({
    change: function(o, options) {
      k(o).trigger("change", o, options);
      m(o)._previousAttibutes = _.clone(o);
      return m(o).changed = false;
    },
    set: function(o, attrs, options) {
      var attr, val;
      options = options || {};
      if ((!options.silent) && p(o).validate && (!p(o)._performValidation(attrs, options))) {
        return false;
      }
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(o[attr], val)) {
          o[attr] = val;
          if (!options.silent) {
            m(o)._changed = true;
            k(o).trigger("change:" + attr, o, val, options);
          }
        }
      }
      if (!options.silent && m(o)._changed) {
        k(o).change(options);
      }
      return o;
    }
  });
  k.mixin({
    initialize: function(o) {
      return m(o)._byCid = {};
    },
    add: function(o, item) {
      var mo;
      o.push(item);
      mo = m(o);
      if (!mo._byCid) {
        mo._byCid = {};
      }
      mo._byCid[item.__cid] = item;
      k(o).trigger("add", item, o);
      return o;
    },
    remove: function(o, item) {
      var key, member, mo, _len, _results;
      mo = m(o);
      if (!mo._byCid) {
        return;
      }
      if (!(item.__cid in mo._byCid)) {
        return false;
      }
      _results = [];
      for (key = 0, _len = o.length; key < _len; key++) {
        member = o[key];
        _results.push(member.__cid === item.__cid ? (o.splice(key, 1), k(o).trigger("remove", item, o)) : void 0);
      }
      return _results;
    }
  });
  if (!(root['jQuery'] || root['Zepto'])) {
    return;
  }
  library = jQuery || Zepto;
  (function(library) {
    var $;
    $ = library;
    return $.fn.dragsimple = function(options) {
      var el;
      el = this;
      $(el).bind("mousedown", function(e) {
        var mousemove, mouseup, obj, parent_offset_left, parent_offset_top, start_offset_left, start_offset_top;
        obj = this;
        e.preventDefault();
        parent_offset_left = $(obj).parent().offset().left;
        parent_offset_top = $(obj).parent().offset().top;
        start_offset_left = e.pageX - $(obj).offset().left;
        start_offset_top = e.pageY - $(obj).offset().top;
        if (_.isFunction(options.start)) {
          options.start(obj);
        }
        mousemove = function(e) {
          var new_left, new_top;
          new_left = e.pageX - parent_offset_left - start_offset_left;
          new_top = e.pageY - parent_offset_top - start_offset_top;
          if (_.isFunction(options.xFilter)) {
            new_left = options.xFilter(x, obj);
          }
          if (_.isFunction(options.yFilter)) {
            new_top = options.yFilter(obj);
          }
          $(obj).css("left", new_left + "px");
          $(obj).css("top", new_top + "px");
          if (_.isFunction(options.drag)) {
            return options.drag(obj);
          }
        };
        mouseup = function(e) {
          $(document.body).unbind("mousemove", mousemove);
          if (_.isFunction(options.stop)) {
            return options.stop(obj);
          }
        };
        $(document.body).bind("mousemove", mousemove);
        return $(document.body).bind("mouseup", mouseup);
      });
      return el;
    };
  })(library);
}).call(this);

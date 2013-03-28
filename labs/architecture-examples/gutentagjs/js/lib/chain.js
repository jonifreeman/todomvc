;function chain(obs) {
  function chainer(f) { return chain(obs.selectMany(run(f))) }

  chainer.run = function() { obs.subscribe() }
  chainer.runner = function() { return function () { return obs.subscribe() }}

  function run(f) { 
    return function(x) {
      var ret = f(x)

      if (ret == undefined)                     return Rx.Observable.returnValue(x)
      else if (ret['subscribe'] != undefined)   return ret
      else if (typeof ret === "boolean") {
        if (ret)                                return Rx.Observable.returnValue(x)
        else                                    return Rx.Observable.never()
      } else                                    return Rx.Observable.returnValue(ret)
    }
  }

  return chainer
};

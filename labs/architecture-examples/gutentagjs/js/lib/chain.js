function chain() {
  var queue = []
  function chainer(func) {
    queue.push(func)
    return chainer
  }
  chainer.run = function () {return run(queue)}

  var withoutContext = null
  
  function run(queue /*, ...*/) {
    if (queue.length === 0) return 
    var skipFirst = 1
      , params = slice(arguments, skipFirst)
      , restOfQueue = queue.slice(skipFirst)
      , func = queue[0]
      , ctx = {
          shouldContinue: true
        , cancel: function () {this.shouldContinue = false}
        }

    if (isAsync(func, params)) {
      func.apply(ctx, params.concat([doneCallback(ctx, restOfQueue)]))
    } else {
      var ret = func.apply(ctx, params)
      if (ctx.shouldContinue) run(restOfQueue, ret)
    }
  }
  function isAsync(func, params) {
    return func.length > params.length
  }
  function slice(x, skipFromBeginning) {return [].slice.call(x, skipFromBeginning)}
  function doneCallback(ctx, queue) {return function (/*...*/) {
    if (ctx.shouldContinue) run.apply(withoutContext, [queue].concat(slice(arguments)))
  }}
  return chainer
}
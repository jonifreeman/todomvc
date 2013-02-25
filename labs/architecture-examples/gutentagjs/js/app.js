(function( window ) {
	'use strict';

  var $main = $('main')
    , $footer = $('footer')
    , $input = $('new-todo')
    , $itemList = $('todo-list')
    , $todoCountWrapper = $('todo-count')
    , $todoCount = $todoCountWrapper.firstChild

  var ENTER = 13

  chain()
   (hide($main))
   (hide($footer))
   .run()

  on($input, 'keyup')
    (map('which'))
    (filterKeyCode(ENTER))
    (inputValue)
    (filterNonEmpty)
    (createTodo)
    (show($main))
    (show($footer))
    (updateTodoCount)
    (pluralizeTodoCount)
    .run()

  function map(key) {return function (obj) {return obj[key]}}
  function filterKeyCode(code) {return function (eventCode) {if (code !== eventCode) this.cancel()}}
  function inputValue() {return $input.value.trim()}
  function filterNonEmpty(value) {
    if (value.length === 0) this.cancel()
    return value
  }
  function createTodo(text) {
    $itemList.innerHTML += '<li>' + text
  }
  function updateTodoCount() {$todoCount.innerHTML = $itemList.children.length}
  function pluralizeTodoCount() {
    if ($itemList.children.length === 1) setClass($todoCountWrapper, '')
    else setClass($todoCountWrapper, 'plural')
  }

  function $(id) {return document.getElementById(id)}
  function hide(elem) {return function () {
    elem.origDisplay = elem.style.display
    elem.style.display = 'none'
  }}
  function show(elem) {return function () {elem.style.display = elem.origDisplay || 'block'}}
  function setClass(elem, className) {elem.className = className}

  function on(elem, eventType, callback) {
    return chain() 
      (function (done) {
        elem.addEventListener(eventType, function (event) {done(event)}, false)
      })
  }

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

})( window );

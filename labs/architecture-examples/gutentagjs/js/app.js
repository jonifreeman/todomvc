(function( window ) {
	'use strict';

  var $main = $('main')
    , $footer = $('footer')
    , $input = $('new-todo')
    , $itemList = $('todo-list')
    , $todoCountWrapper = $('todo-count')
    , $todoCount = $todoCountWrapper.firstElementChild
    , $itemTemplate = $itemList.firstElementChild

  var ENTER = 13

  chain()
    (hide($main))
    (hide($footer))
    (function () {$itemList.removeChild($itemTemplate)})
    .run()

  on($input, 'keyup')
    (filterKeyCode(ENTER))
    (inputValue)
    (filterNonEmpty)
    (createTodo)
    (addTodoToList)
    (show($main))
    (show($footer))
    (updateTodoCount)
    (pluralizeTodoCount)
    .run()

  function filterKeyCode(code) {return function (event) {if (code !== event.which) this.cancel()}}
  function inputValue() {return $input.value.trim()}
  function filterNonEmpty(value) {
    if (value.length === 0) this.cancel()
    return value
  }
  function createTodo(text) {
    var $todo = $itemTemplate.cloneNode(true)
    setTodoLabel($todo, text)
    setTodoEditValue($todo, text)
    return $todo
  }
  function setTodoLabel($todo, text) {$todo.children[0].children[1].innerHTML = text}
  function setTodoEditValue($todo, text) {$todo.children[1].setAttribute('value', text)}
  function addTodoToList($todo) {$itemList.appendChild($todo)}
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
      (function (done) {elem.addEventListener(eventType, function (event) {done(event)}, false)})
  }

})( window );

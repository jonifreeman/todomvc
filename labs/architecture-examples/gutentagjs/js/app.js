(function( window ) {
	'use strict';

  var $main = $('main')
    , $footer = $('footer')
    , $input = $('new-todo')
    , $itemList = $('todo-list')
    , $todoCountWrapper = $('todo-count')
    , $completedCount = $('clear-completed')
    , $todoCount = $todoCountWrapper.firstElementChild
    , $itemTemplate = $itemList.firstElementChild

  var ENTER = 13

  chain()
    (hide($main))
    (hide($footer))
    (hide($completedCount))
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

  // TODO toggle complete on click

  on($itemList, 'click')
    (filterDestroyButton)
    (deleteTodoItem)
    (updateTodoCount)
    (pluralizeTodoCount)
    (toggleVisibility($main, $todoCount))
    (toggleVisibility($footer, $todoCount))
    (updateCompletedCount)
    .run()


  function filterDestroyButton(event) {
    if (event.target.tagName.toLowerCase() !== 'button' || event.target.className !== 'destroy') this.cancel()
    return event
  }
  function deleteTodoItem(event) {
    var todoItem = event.target.parentNode.parentNode
    todoItem.parentNode.removeChild(todoItem)
  }
  function updateCompletedCount() {$completedCount.innerHTML = document.getElementsByClassName('completed').length}
  function toggleVisibility($elem, $count) {
    return function () {
      if (toInt($count.innerHTML) > 0) show($elem)()
      else hide($elem)()
    }
  }
  function toInt(x) {return +x}

  // TODO edit on double click

  // TODO hide completed 

  // TODO router (all/active/completed)

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

  function on(elem, eventType) {
    return chain() 
      (function (done) {elem.addEventListener(eventType, function (event) {done(event)}, false)})
  }

})( window );

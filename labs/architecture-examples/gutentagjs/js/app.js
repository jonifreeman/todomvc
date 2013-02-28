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

  on($itemList, 'click', 'input.toggle')
    (toggleTodoCompleted)
    (updateCompletedCount)
    (toggleVisibility($completedCount, $completedCount))
    .run()

  on($itemList, 'click', 'button.destroy')
    (deleteTodoItem)
    (updateTodoCount)
    (pluralizeTodoCount)
    (toggleVisibility($main, $todoCount))
    (toggleVisibility($footer, $todoCount))
    (updateCompletedCount)
    .run()

  function toggleTodoCompleted(event) {
    var $todoItem = event.target.parentNode.parentNode
    if (hasClass($todoItem, 'completed')) setClass($todoItem, '')
    else setClass($todoItem, 'completed')
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
  function hasClass($elem, className) {return $elem.className.indexOf(className) >= 0}
  function setClass(elem, className) {elem.className = className}

  function on(elem, eventType, delegateSelector) {
    return chain() 
      (function (done) {elem.addEventListener(eventType, function (event) {done(event)}, false)})
      (function (event) {
        if (delegateSelector && !matchesQuerySelector(event.target, delegateSelector)) this.cancel()
        return event
      })
  }
  function matchesQuerySelector($elem, selector) {
    if (!selector) return false
    if (selector.indexOf('.') >= 0) return matches($elem, selector.split('.'), 'className')
    else if (selector.indexOf('#') >= 0) return matches($elem, selector.split('#'), 'id')
    else return ($elem.tagName.toLowerCase() === selector)
  }
  function matches($elem, parts, key) {
    if ( (parts[0] && $elem.tagName.toLowerCase() !== parts[0]) || $elem[key] !== parts[1]) return false
    else return true
  }


})( window );

(function( window ) {
	'use strict';

  var $main = $('main')
    , $footer = $('footer')
    , $input = $('new-todo')
    , $todoList = $('todo-list')
    , $todoCountWrapper = $('todo-count')
    , $completedCount = $('clear-completed')
    , $todoCount = $todoCountWrapper.firstElementChild
    , $todoTemplate = $todoList.firstElementChild

  var ENTER = 13

  chain()
    (hide($main))
    (hide($footer))
    (hide($completedCount))
    (function () {$todoList.removeChild($todoTemplate)})
    .run()

  on($input, 'keyup')
    (filterKeyCode(ENTER))
    (eventTarget)
    (inputValue)
    (filterNonEmpty)
    (createTodo)
    (addTodoToList)
    (clearInputValue)
    (updateDomToReflectCurrentCounts)
    .run()

  on($todoList, 'click', 'input.toggle')
    (mapTodoItem)
    (toggleTodo('completed'))
    (updateDomToReflectCurrentCounts)
    .run()

  on($todoList, 'click', 'button.destroy')
    (mapTodoItem)
    (deleteTodoItem)
    (updateDomToReflectCurrentCounts)
    .run()

  on($todoList, 'dblclick', 'label')
    (mapTodoItem)
    (toggleTodo('editing'))
    (selectTodoText)
    .run()

  on($todoList, 'keyup', 'input.edit')
    (filterKeyCode(ENTER))
    (eventTarget)
    (pair(parent, inputValue))
    (updateTodo)
    (toggleTodo('editing'))
    (deleteEmptyTodo)
    (updateDomToReflectCurrentCounts)
    .run()

  on($completedCount, 'click')
    (mapCompletedTodos)
    (each(deleteTodoItem))
    (updateDomToReflectCurrentCounts)
    .run()

  var countAndVisibilityDomUpdates = chain() 
    (updateTodoCount)
    (pluralizeTodoCount)
    (toggleVisibility($main, $todoCount))
    (toggleVisibility($footer, $todoCount))
    (updateCompletedCount)
    (toggleVisibility($completedCount, $completedCount))
  function updateDomToReflectCurrentCounts() {countAndVisibilityDomUpdates.run()}

  function mapTodoItem(event) {return event.target.parentNode.parentNode}
  function selectTodoText($todo) {$todo.lastElementChild.select()}

  function toggleTodo(className) {return function ($todo) {
    if (hasClass($todo, className)) removeClass($todo, className)
    else addClass($todo, className)
    return $todo
  }}

  function deleteTodoItem($todo) {$todo.parentNode.removeChild($todo)}
  function updateCompletedCount() {$completedCount.innerHTML = document.getElementsByClassName('completed').length}
  function toggleVisibility($elem, $count) {return function () {
    if (toInt($count.innerHTML) > 0) show($elem)()
    else hide($elem)()
  }}
  function toInt(x) {return +x}

  function pair(fst, snd) {return function (val, done) {done(fst(val), snd(val))}}
  function deleteEmptyTodo($todo) {if (!$todo.children[0].children[1].innerHTML) deleteTodoItem($todo)}

  function mapCompletedTodos() {return document.querySelectorAll('li.completed')}
  function each(func) {return function (arr) {[].forEach.call(arr, func)}}

  // TODO router (all/active/completed)

  function filterKeyCode(code) {return function (event) {
    if (code !== event.which) this.cancel()
    return event
  }}
  function eventTarget(event) {return event.target}
  function inputValue($input) {return $input.value.trim()}
  function filterNonEmpty(value) {
    if (value.length === 0) this.cancel()
    return value
  }
  function createTodo(text) {
    var $todo = $todoTemplate.cloneNode(true)
    return updateTodo($todo, text)
  }
  function updateTodo($todo, text) {
    setTodoLabel($todo, text)
    setTodoEditValue($todo, text)
    return $todo
  }
  function clearInputValue() {$input.value = ''}
  function setTodoLabel($todo, text) {$todo.children[0].children[1].innerHTML = text}
  function setTodoEditValue($todo, text) {$todo.children[1].setAttribute('value', text)}
  function addTodoToList($todo) {$todoList.appendChild($todo)}
  function updateTodoCount() {$todoCount.innerHTML = $todoList.children.length}
  function pluralizeTodoCount() {
    if ($todoList.children.length === 1) removeClass($todoCountWrapper, 'plural')
    else addClass($todoCountWrapper, 'plural')
  }

  function $(id) {return document.getElementById(id)}
  function hide($elem) {return function () {$elem.style.display = 'none'}}
  function show($elem) {return function () {$elem.style.display = 'block'}}
  function hasClass($elem, className) {return $elem.className.indexOf(className) >= 0}
  function addClass($elem, className) {if (!hasClass($elem, className)) $elem.className += ' ' + className}
  function removeClass($elem, className) {$elem.className = $elem.className.replace(className, '')}
  function parent($elem) {return $elem.parentNode}

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

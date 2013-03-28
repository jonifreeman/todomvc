(function() {
	'use strict';

  var todoElem = '#todo-list li'
    , completedTodo = 'li.completed'
    , $main = $('#main')
    , $footer = $('#footer')
    , $newTodo = $('#new-todo')
    , $todoList = $('#todo-list')
    , $todoCountWrapper = $('#todo-count')
    , $completedCount = $('#clear-completed')
    , $todoCount = $('#todo-count strong')
    , $todoTemplate = $(todoElem)
    , $completeAll = $('#toggle-all')
    , $filters = $('#filters')

  var ENTER = 13
    , APP_READY = 'app_ready'
    , STORAGE_KEY = 'todos-gutentagjs'

  var publish = function (eventName, data) {return function () {pubsub.publish(eventName, data)}}
    , subscribe = pubsub.subscribe

  domReady()
    (hide($main))
    (hide($footer))
    (hide($completedCount))
    (just($todoTemplate))
    (deleteTodo)
    (applyTodoFilter)
    (loadTodos)
    (map(jsonToTodo))
    (each(addTodoToList))
    (publish(APP_READY))
    .run()

  keyup($newTodo)
    (filterKey(ENTER))
    (eventTarget)
    (inputValue)
    (filterNonEmpty)
    (createTodo)
    (addTodoToList)
    (clearNewTodoInput)
    .run()

  click($todoList, 'input.toggle')
    (mapTodo)
    (toggleClass('completed'))
    (findChild('input.toggle'))
    (toggleCheckbox)
    .run()

  click($todoList, 'button.destroy')
    (mapTodo)
    (deleteTodo)
    .run()

  dblclick($todoList, 'label')
    (mapTodo)
    (toggleClass('editing'))
    (selectTodoText)
    .run()

  keyup($todoList, 'input.edit')
    (filterKey(ENTER))
    (eventTarget)
    (blurElem)
    .run()

  blur($todoList, 'input.edit')
    (eventTarget)
    (pair(parent, inputValue))
    (updateTodo)
    (toggleClass('editing'))
    (deleteEmptyTodo)
    .run()

  click($completedCount)
    (findAll(completedTodo))
    (each(deleteTodo))
    .run()

  click($completeAll)
    (findAll(todoElem))
    (each(markCompletion))
    (findAll('input.toggle'))
    (each(markCheckbox))
    .run()

  click($filters, 'a')
    (eventTarget)
    (clearTodoFilters)
    (applyTodoFilter)
    .run()

  domChildrenChange($todoList)
    (updateTodoCount)
    (pluralizeTodoCount)
    (toggleVisibility($main, todoElem))
    (toggleVisibility($footer, todoElem))
    (updateCompletedCount)
    (toggleVisibility($completedCount, completedTodo))
    (markCompleteAll)
    .run()

  subscribe(APP_READY,
    domChildrenChange($todoList)
      (findAll(todoElem))
      (map(todoToJson))
      (saveTodos)
      .runner())

  function createTodo(text) {
    var $todo = $todoTemplate.cloneNode(true)
    return updateTodo($todo, text)
  }
  function updateTodo($todo, text) {
    setTodoLabel($todo, text)
    setTodoEditValue($todo, text)
    return $todo
  }
  function setTodoLabel($todo, text) {$todo.querySelector('label').innerHTML = text}
  function setTodoEditValue($todo, text) {$todo.querySelector('input.edit').setAttribute('value', text)}
  function addTodoToList($todo) {$todoList.appendChild($todo)}
  function selectTodoText($todo) {$todo.lastElementChild.select(); return $todo}
  function deleteTodo($todo) {$todo.parentNode.removeChild($todo)}
  function deleteEmptyTodo($todo) {if (!$todo.querySelector('label').innerHTML) deleteTodo($todo)}
  function mapTodo(event) {return event.target.parentNode.parentNode}

  function clearNewTodoInput() {$newTodo.value = ''}
  function updateTodoCount() {$todoCount.innerHTML = numActiveTodos()}
  function pluralizeTodoCount() {numActiveTodos() === 1? removeClass($todoCountWrapper, 'plural'): addClass($todoCountWrapper, 'plural');}
  function updateCompletedCount() {$completedCount.innerHTML = countAll(completedTodo)}
  function toggleVisibility($elem, selector) {return function () {countAll(selector) > 0? show($elem)(): hide($elem)()}}

  function markCompletion($todo) {if ($completeAll.checked) {addClass($todo, 'completed'); $completeAll.checked = true} else removeClass($todo, 'completed')}
  function markCheckbox($box) {
    $box.checked = $completeAll.checked
    $box.checked? $box.setAttribute('checked', 'checked'): $box.removeAttribute('checked')
  }
  function markCompleteAll() {$completeAll.checked = (numActiveTodos() === 0)}
  function numActiveTodos() {return countAll(todoElem) - countAll(completedTodo)}

  function clearTodoFilters() {document.body.className = ''}
  function applyTodoFilter() { return Rx.Observable.returnValue([]).delay(1).subscribe(function() { addClass(document.body, location.href.split('#/')[1])})}

  function loadTodos() {return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')}
  function saveTodos(todos) {localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); console.log(JSON.stringify(todos))}
  function todoToJson($todo) {return {title: $todo.querySelector('label').innerHTML, completed: $todo.querySelector('.toggle').checked}}
  function jsonToTodo(json) {var $todo = createTodo(json.title); if (json.completed) setCompleted($todo); return $todo}
  function setCompleted($todo) {
    addClass($todo, 'completed')
    var $box = $todo.querySelector('.toggle')
    $box.checked = true
    toggleCheckbox($box)
  }

  function eventTarget(event) {return event.target}
  function inputValue($elem) {return $elem.value.trim()}
  function filterNonEmpty(value) {return value && value.length > 0}
  function filterKey(code) {return function (event) {return (code === event.which)}}

  function $(cssSelector) {return document.querySelector(cssSelector)}
  function parent($elem) {return $elem.parentNode}
  function hide($elem) {return function () {$elem.style.display = 'none'}}
  function show($elem) {return function () {$elem.style.display = 'block'}}
  function hasClass($elem, className) {return $elem.className.indexOf(className) >= 0}
  function addClass($elem, className) {if (!hasClass($elem, className)) $elem.className += ' ' + className}
  function removeClass($elem, className) {$elem.className = $elem.className.replace(className, '')}
  function toggleClass(className) {return function ($elem) {hasClass($elem, className)? removeClass($elem, className): addClass($elem, className); return $elem}}
  function toggleCheckbox($box) {$box.checked? $box.setAttribute('checked', 'checked'): $box.removeAttribute('checked')}
  function blurElem($elem) {$elem.blur(); return $elem}
  function findAll(selector) {return function() {return document.querySelectorAll(selector)}}
  function findChild(selector) {return function ($elem) {return $elem.querySelector(selector)}}
  function countAll(selector) {return document.querySelectorAll(selector).length}

  function on($elem, eventType, delegateSelector) {
    return chain(Rx.Observable.fromEvent($elem, eventType).where(function(event) { 
        return !delegateSelector || matchesQuerySelector(event.target, delegateSelector) 
      }))
  }
  function addEventListener($elem, eventType, eventHandlerCallback) {
    var useCapturePhase = (eventType === 'focus' || eventType === 'blur')
    $elem.addEventListener(eventType, eventHandlerCallback, useCapturePhase)
  }
  function matchesQuerySelector($elem, selector) {
    if (!selector) return false
    if (selector.indexOf('.') >= 0) return matches($elem, selector.split('.'), 'className')
    else if (selector.indexOf('#') >= 0) return matches($elem, selector.split('#'), 'id')
    else return ($elem.tagName.toLowerCase() === selector)
  }
  function matches($elem, parts, key) {return (!parts[0] || $elem.tagName.toLowerCase() === parts[0]) && $elem[key] === parts[1]}

  function click($elem, delegateSelector) {return on($elem, 'click', delegateSelector)}
  function dblclick($elem, delegateSelector) {return on($elem, 'dblclick', delegateSelector)}
  function keyup($elem, delegateSelector) {return on($elem, 'keyup', delegateSelector)}
  function blur($elem, delegateSelector) {return on($elem, 'blur', delegateSelector)}
  function domReady() {return on(document, 'DOMContentLoaded')}
  function domChildrenChange($elem, delegateSelector) {return on($elem, 'DOMSubtreeModified', delegateSelector)}

  function pair(fst, snd) {return function (val, done) {done(fst(val), snd(val))}}
  function each(func) {return function (arr) {slice(arr).forEach(func)}}
  function map(func) {return function (arr) {return slice(arr).map(func)}}
  function slice(arr) {return Array.prototype.slice.call(arr)}
  function just(x) {return function () {return x}}
})();

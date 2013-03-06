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
    (pubsub.publish(APP_READY))
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
    (simulateDomChange)
    .run()

  click($todoList, 'button.destroy')
    (mapTodo)
    (deleteTodo)
    .run()

  dblclick($todoList, 'label')
    (mapTodo)
    (toggleClass('editing'))
    (selectTodoText)
    (bindTodoEditBlurHandler)
    .run()

  keyup($todoList, 'input.edit')
    (filterKey(ENTER))
    (eventTarget)
    (updateTodoAndCloseEditMode)
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
    (simulateDomChange)
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

  pubsub.subscribe(APP_READY,
    domChildrenChange($todoList)
        (findAll(todoElem))
        (map(todoToJson))
        (saveTodos)
        .runner())

  function bindTodoEditBlurHandler($todo) {
    blur($todo.querySelector('input.edit'))
      (eventTarget)
      (updateTodoAndCloseEditMode)
      .run()
  }

  function updateTodoAndCloseEditMode($todoEditField) {
    chain()
      (just($todoEditField))
      (removeEventListener('blur'))
      (pair(parent, inputValue))
      (updateTodo)
      (toggleClass('editing'))
      (deleteEmptyTodo)
      .run()
    return $todoEditField
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
  function setTodoLabel($todo, text) {$todo.querySelector('label').innerHTML = text}
  function setTodoEditValue($todo, text) {$todo.querySelector('input.edit').setAttribute('value', text)}
  function addTodoToList($todo) {$todoList.appendChild($todo)}
  function selectTodoText($todo) {$todo.lastElementChild.select(); return $todo}
  function deleteTodo($todo) {$todo.parentNode.removeChild($todo)}
  function deleteEmptyTodo($todo) {if (!$todo.querySelector('label').innerHTML) deleteTodo($todo)}
  function mapTodo(event) {return event.target.parentNode.parentNode}

  function updateTodoCount() {$todoCount.innerHTML = numActiveTodos()}
  function pluralizeTodoCount() {numActiveTodos() === 1? removeClass($todoCountWrapper, 'plural'): addClass($todoCountWrapper, 'plural');}
  function updateCompletedCount() {$completedCount.innerHTML = countAll(completedTodo)}
  function toggleVisibility($elem, selector) {return function () {countAll(selector) > 0? show($elem)(): hide($elem)()}}

  function markCompletion($todo) {$completeAll.checked? addClass($todo, 'completed'): removeClass($todo, 'completed')}
  function markCheckbox($box) {$box.checked = $completeAll.checked}
  function markCompleteAll() {$completeAll.checked = (numActiveTodos() === 0)}
  function numActiveTodos() {return countAll(todoElem) - countAll(completedTodo)}

  function clearTodoFilters() {document.body.className = ''}
  function applyTodoFilter(done) {setTimeout(function () {addClass(document.body, location.href.split('#/')[1]);done()}, 1)}

  // TODO: use localstorage
  function loadTodos() {return [{title: 'jepa', completed: true},{title:'lol', completed:false}]}
  function saveTodos(todos) {console.log(todos)}
  function todoToJson($todo) {return {title: $todo.querySelector('label').innerHTML, completed: $todo.querySelector('.toggle').checked}}
  function jsonToTodo(json) {
    var $todo = createTodo(json.title)
    if (json.completed) setCompleted($todo)
    return $todo
  }
  function setCompleted($todo) {
    addClass($todo, 'completed')
    $todo.querySelector('.toggle').checked = true
  }

  function eventTarget(event) {return event.target}
  function inputValue($elem) {return $elem.value.trim()}
  function clearNewTodoInput() {$newTodo.value = ''}
  function filterNonEmpty(value) {if (!value || value.length === 0) this.cancel(); return value}
  function filterKey(code) {return function (event) {if (code !== event.which) this.cancel(); return event}}

  function $(cssSelector) {return document.querySelector(cssSelector)}
  function parent($elem) {return $elem.parentNode}
  function hide($elem) {return function () {$elem.style.display = 'none'}}
  function show($elem) {return function () {$elem.style.display = 'block'}}
  function hasClass($elem, className) {return $elem.className.indexOf(className) >= 0}
  function addClass($elem, className) {if (!hasClass($elem, className)) $elem.className += ' ' + className}
  function removeClass($elem, className) {$elem.className = $elem.className.replace(className, '')}
  function toggleClass(className) {return function ($elem) {hasClass($elem, className)? removeClass($elem, className): addClass($elem, className); return $elem}}
  function find(selector) {return function() {return document.querySelector(selector)}}
  function findAll(selector) {return function() {return document.querySelectorAll(selector)}}
  function countAll(selector) {return document.querySelectorAll(selector).length}

  function on($elem, eventType, delegateSelector) {
    return chain()
      (function (done) {addEventListener($elem, eventType, function (event) {done(event)})})
      (function (event) {
        if (delegateSelector && !matchesQuerySelector(event.target, delegateSelector)) this.cancel()
        return event
      })
  }
  function addEventListener($elem, eventType, eventHandlerCallback) {
    if ($elem.addEventListener) $elem.addEventListener(eventType, eventHandlerCallback, false)
    else if ($elem.attachEvent) $elem.attachEvent('on' + eventType, eventHandlerCallback)
    $elem.listeners = $elem.listeners || {}
    $elem.listeners[eventType] = eventHandlerCallback
  }
  function removeEventListener(eventType) {return function ($elem) {$elem.removeEventListener(eventType, $elem.listeners[eventType], false); return $elem}}
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
  function simulateDomChange() { // Needed as not all attribute changes cause the event to be fired
    var e = document.createEvent('MutationEvent')
    e.initMutationEvent('DOMSubtreeModified', false, false, window)
    $todoList.dispatchEvent(e)
  }
  function pair(fst, snd) {return function (val, done) {done(fst(val), snd(val))}}
  function each(func) {return function (arr) {slice(arr).forEach(func)}}
  function map(func) {return function (arr) {return slice(arr).map(func)}}
  function slice(arr) {return Array.prototype.slice.call(arr)}
  function just(x) {return function () {return x}}
})();

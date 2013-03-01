(function() {
	'use strict';

  var todoElem = '#todo-list li'
    , completedTodo = 'li.completed'
    , $main = $('#main')
    , $footer = $('#footer')
    , $input = $('#new-todo')
    , $todoList = $('#todo-list')
    , $todoCountWrapper = $('#todo-count')
    , $completedCount = $('#clear-completed')
    , $todoCount = $('#todo-count strong')
    , $todoTemplate = $(todoElem)
    , $completeAll = $('#toggle-all')

  var ENTER = 13

  chain()
    (hide($main))
    (hide($footer))
    (hide($completedCount))
    (just($todoTemplate))
    (deleteTodo)
    .run()

  click(document.body)
    (eventTarget)
    (ignore('input.edit'))
    (findAll('li.editing'))
    (each(toggleClass('editing')))
    .run()

  keyup($input)
    (filterKey(ENTER))
    (eventTarget)
    (inputValue)
    (filterNonEmpty)
    (createTodo)
    (addTodoToList)
    (clearInputValue)
    (updateDomToReflectCurrentCounts)
    .run()

  click($todoList, 'input.toggle')
    (mapTodo)
    (toggleClass('completed'))
    (updateDomToReflectCurrentCounts)
    .run()

  click($todoList, 'button.destroy')
    (mapTodo)
    (deleteTodo)
    (updateDomToReflectCurrentCounts)
    .run()

  dblclick($todoList, 'label')
    (mapTodo)
    (toggleClass('editing'))
    (selectTodoText)
    .run()

  keyup($todoList, 'input.edit')
    (filterKey(ENTER))
    (eventTarget)
    (pair(parent, inputValue))
    (updateTodo)
    (toggleClass('editing'))
    (deleteEmptyTodo)
    (updateDomToReflectCurrentCounts)
    .run()

  click($completedCount)
    (findAll(completedTodo))
    (each(deleteTodo))
    (updateDomToReflectCurrentCounts)
    .run()

  click($completeAll)
    (findAll(todoElem))
    (each(markCompletion))
    (findAll('input.toggle'))
    (each(markCheckbox))
    (updateDomToReflectCurrentCounts)
    .run()

  var countAndVisibilityDomUpdates = 
    chain() 
      (updateTodoCount)
      (pluralizeTodoCount)
      (toggleVisibility($main, todoElem))
      (toggleVisibility($footer, todoElem))
      (updateCompletedCount)
      (toggleVisibility($completedCount, completedTodo))
      (markCompleteAll)

  function updateDomToReflectCurrentCounts() {countAndVisibilityDomUpdates.run()}

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
  function selectTodoText($todo) {$todo.lastElementChild.select()}
  function deleteTodo($todo) {$todo.parentNode.removeChild($todo)}
  function deleteEmptyTodo($todo) {if (!$todo.querySelector('label').innerHTML) deleteTodo($todo)}
  function mapTodo(event) {return event.target.parentNode.parentNode}

  function updateTodoCount() {$todoCount.innerHTML = numActiveTodos()}
  function pluralizeTodoCount() {
    if (numActiveTodos() === 1) removeClass($todoCountWrapper, 'plural')
    else addClass($todoCountWrapper, 'plural')
  }
  function updateCompletedCount() {$completedCount.innerHTML = countAll(completedTodo)}
  function toggleVisibility($elem, selector) {return function () {
    if (countAll(selector) > 0) show($elem)()
    else hide($elem)()
  }}

  function mapChecked(event) {return event.target.checked}
  function markCompletion($todo) {
    if ($completeAll.checked) addClass($todo, 'completed')
    else removeClass($todo, 'completed')    
  }
  function markCheckbox($box) {$box.checked = ($completeAll.checked? true: false)}
  function markCompleteAll() {$completeAll.checked = (numActiveTodos() === 0? true: false)}
  function numActiveTodos() {return countAll(todoElem) - countAll(completedTodo)}

  // TODO router (all/active/completed)

  function eventTarget(event) {return event.target}
  function inputValue($input) {return $input.value.trim()}
  function clearInputValue() {$input.value = ''}
  function filterNonEmpty(value) {
    if (value.length === 0) this.cancel()
    return value
  }
  function filterKey(code) {return function (event) {
    if (code !== event.which) this.cancel()
    return event
  }}

  function toInt(x) {return +x}

  function $(cssSelector) {return document.querySelector(cssSelector)}
  function parent($elem) {return $elem.parentNode}
  function hide($elem) {return function () {$elem.style.display = 'none'}}
  function show($elem) {return function () {$elem.style.display = 'block'}}
  function hasClass($elem, className) {return $elem.className.indexOf(className) >= 0}
  function addClass($elem, className) {if (!hasClass($elem, className)) $elem.className += ' ' + className}
  function removeClass($elem, className) {$elem.className = $elem.className.replace(className, '')}
  function toggleClass(className) {return function ($elem) {
    if (hasClass($elem, className)) removeClass($elem, className)
    else addClass($elem, className)
    return $elem
  }}
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
  }
  function matchesQuerySelector($elem, selector) {
    if (!selector) return false
    if (selector.indexOf('.') >= 0) return matches($elem, selector.split('.'), 'className')
    else if (selector.indexOf('#') >= 0) return matches($elem, selector.split('#'), 'id')
    else return ($elem.tagName.toLowerCase() === selector)
  }
  function matches($elem, parts, key) {return (!parts[0] || $elem.tagName.toLowerCase() === parts[0]) && $elem[key] === parts[1]}
  function ignore(selector) {return function ($elem) {
    if (matchesQuerySelector($elem, selector)) this.cancel()
    return $elem
  }}

  function click($elem, delegateSelector) {return on($elem, 'click', delegateSelector)}
  function dblclick($elem, delegateSelector) {return on($elem, 'dblclick', delegateSelector)}
  function keyup($elem, delegateSelector) {return on($elem, 'keyup', delegateSelector)}
  function pair(fst, snd) {return function (val, done) {done(fst(val), snd(val))}}
  function each(func) {return function (arr) {[].forEach.call(arr, func)}}
  function just(x) {return function () {return x}}
})();

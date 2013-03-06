var pubsub = (function () {
  var pubsubs = {}

  return {
    publish: publish
  , subscribe: subscribe
  }
  function publish(name, data)   {return function () {var listeners = pubsubs[name] || []; listeners.forEach(function (func) {func(data)})}}
  function subscribe(name, func) {if (!pubsubs[name]) pubsubs[name] = []; pubsubs[name].push(func)}
})();
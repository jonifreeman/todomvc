var pubsub = (function () {
  var pubsubs = {}
  function publish(name, data)   {var listeners = pubsubs[name] || []; listeners.forEach(function (func) {func(data)})}
  function subscribe(name, func) {if (!pubsubs[name]) pubsubs[name] = []; pubsubs[name].push(func)}
  return {publish: publish, subscribe: subscribe}
})();
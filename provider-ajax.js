(function() {
  let model = window.model;
  let Ajax = window.Ajax;
  let KEYS = ['items', 'msg', 'filter'];
  let URL = 'http://127.0.0.1:3476';
  let MSG = 'Start server by `node examples/data/server.js` on project root';

  Object.assign(model, {
    init: function(callback) {
      Ajax.get(URL + '/init', {
        onSuccess: function(data) {
          console.log('inited', data);
          KEYS.forEach(function(key) {
            if (key in data) model.data[key] = data[key];
          });
          if (callback) callback();
        },
        onFailure: function() {
          console.error(MSG);
        }
      });
    },
    flush: function(callback) {
      Ajax.get(URL + '/flush?data=' + encodeURIComponent(JSON.stringify(model.data)), {
        onSuccess: function() {
          console.log('flushed');
          if (callback) callback();
        },
        onFailure: function() {
          console.error(MSG);
        }
      });
    }
  });
})();
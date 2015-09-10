/**
 * @file Plugin to embed Media items, OMBU Media style!
 */
(function() {

  CKEDITOR.plugins.add('ombumedia', {
    requires: 'widget',
    icons: 'ombumedia',
    init: function(editor) {

      /**
       * Toolbar Button.
       *
       * Added manually. The widget's `button` prop doesn't work well
       * with the toolbar configuration.
       *
       * @see https://www.drupal.org/node/2129915#comment-8494415
       */
      editor.ui.addButton('ombumedia', {
        label: 'Media',
        command: 'ombumedia',
      });

      /**
       * Widget definition.
       */
      editor.widgets.add('ombumedia', {
        button: 'Media',
        template: '<div data-ombumedia=""></div>',
        allowedContent: 'div[data-ombumedia];',
        requiredContent: 'div[data-ombumedia]',
        upcast: function(element) {
          return element && element.name == 'div' && element.attributes['data-ombumedia'];
        },

        // Populate widget data from DOM.
        init: function() {
          var widget = this;
          var settingsJson = widget.element.getAttribute('data-ombumedia') || '{}';
          var settings = JSON.parse(settingsJson) || {};
          for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
              widget.setData(key, settings[key]);
            }
          }
        },

        // Move widget data into DOM.
        data: function() {
          var widget = this;
          var settings = {};
          for (var key in widget.data) {
            if (widget.data.hasOwnProperty(key)) {
              settings[key] = widget.data[key];
            }
          }
          if (settings.hasOwnProperty('classes')) {
              delete settings.classes;
          }
          widget.element.setAttribute('data-ombumedia', JSON.stringify(settings));
        },

        // Triggered when widget is double clicked or the button is pushed.
        // Used instead of the widget dialog system.
        // @see https://stackoverflow.com/a/29509042/325018
        edit: function() {
          var widget = this;
          widget.editor.fire('saveSnapshot');

          // Set up popup options.

          Drupal.ombumedia.selectMedia({ type: 'image' }).then(selectSuccess, selectFail);

          function selectSuccess(data) {
            widget.editor.fire('saveSnapshot');
            for (var key in data) {
              if (data.hasOwnProperty(key)) {
                widget.setData(key, data[key]);
              }
            }
            widget.fire('data', widget.data);
            widget.editor.fire('saveSnapshot');
          }

          function selectFail() {}
        }
      });

    }
  });

})();

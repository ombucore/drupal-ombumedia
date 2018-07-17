/**
 * @file Plugin to embed Media items, OMBU Media style!
 */
(function() {

  function setWidgetData(widget, data) {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        widget.setData(key, data[key]);
      }
    }
  }

  function getWidgetData(widget) {
    var data = {};
    for (var key in widget.data) {
      if (widget.data.hasOwnProperty(key)) {
        data[key] = widget.data[key];
      }
    }
    if (data.hasOwnProperty('classes')) {
        delete data.classes;
    }
    return data;
  }

  var innerTemplate = new CKEDITOR.template(['',
      '<span>',
        '<span class="title"><strong>{type}</strong>: {title}</span>',
        '<span class="caption"><strong>Caption</strong>: {caption}</span>',
        '<span class="style"><strong>Style</strong>: {viewMode}</span>',
      '</span>',
  ''].join(''));

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  // Register the <ombumedia> element and mark it as block-level so that extra
  // empty paragraph tags aren't added around it.
  CKEDITOR.dtd['ombumedia'] = {};
  CKEDITOR.dtd['$block']['ombumedia'] = 1;

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
        label: 'Embed Media',
        command: 'ombumedia',
      });

      /**
       * Add the CSS.
       */
      editor.addContentsCss(Drupal.settings.ombumedia.path + '/js/ckeditor/plugin.css');

      /**
       * Widget definition.
       */
      editor.widgets.add('ombumedia', {
        button: 'Media',
        template: '<div data-ombumedia=""></div>',
        allowedContent: 'div[data-ombumedia];',
        requiredContent: 'div[data-ombumedia]',

        /**
         * Changes <ombumedia> tag to <div> while editing.
         */
        upcast: function(element) {
          if (element && element.name == 'ombumedia') {
            element.name = 'div';
            return element;
          }
        },

        /**
         * Changes <div> tag to <ombumedia> when done editing.
         */
        downcast: function(element) {
          if (element && element.name == 'div' && element.attributes['data-ombumedia']) {
            element.name = 'ombumedia';
            element.children = [];
            for (var key in element.attributes) {
              if (element.attributes.hasOwnProperty(key)) {
                if (key !== 'data-ombumedia') {
                  delete element.attributes[key];
                }
              }
            }
            return element;
          }
        },

        /**
         * Populate widget data from DOM.
         */
        init: function() {
          var widget = this;
          var dataJson = widget.element.getAttribute('data-ombumedia') || '{}';
          var data = JSON.parse(dataJson) || {};
          setWidgetData(widget, data);
        },

        /**
         * Move widget data into DOM.
         */
        data: function() {
          var widget = this;
          var data = getWidgetData(widget);
          widget.element.setAttribute('data-ombumedia', JSON.stringify(data));
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              widget.element.setAttribute('data-ombumedia-' + key, data[key]);
            }
          }

          var templateVars = {
            type: data.type ? capitalize(data.type) : '',
            title: data.title ? data.title : '',
            caption: data.caption ? data.caption : '',
            viewMode: data.position ? capitalize(data.position) : ''
          };

          if (templateVars.viewMode == 'Left50') {
            templateVars.viewMode = 'Left 50%';
          }

          if (templateVars.viewMode == 'Right50') {
            templateVars.viewMode = 'Right 50%';
          }

          if (templateVars.viewMode == 'Leftthumb') {
            templateVars.viewMode = 'Left Thumbnail';
          }

          if (templateVars.viewMode == 'Rightthumb') {
            templateVars.viewMode = 'Right Thumbnail';
          }

          widget.element.setHtml(innerTemplate.output(templateVars));
        },

        /**
         * Triggered when widget is double clicked or the button is pushed.
         * Used instead of the widget dialog system.
         * @see https://stackoverflow.com/a/29509042/325018
         */
        edit: function() {
          var widget = this;
          widget.editor.fire('saveSnapshot');

          var options = CKEDITOR.tools.extend({}, widget.data, widget.editor.config.ombumedia);
          delete options.classes;

          Drupal.ombumedia.selectMedia(options).then(selectSuccess, selectFail);

          function selectSuccess(data) {
            widget.editor.fire('saveSnapshot');
            setWidgetData(widget, data);
            widget.fire('data', widget.data);
            widget.editor.fire('saveSnapshot');
          }

          function selectFail() {
            // Delete it if we're adding a new widget and the workflow is
            // cancelled.
            if (!widget.data.fid) {
              widget.editor.widgets.del(widget);
            }
          }
        }

      });

    }
  });

})();

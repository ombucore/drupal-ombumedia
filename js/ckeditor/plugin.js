/**
 * @file Plugin to embed Media items, OMBU Media style!
 */
(function() {

  CKEDITOR.plugins.add('ombumedia', {
    requires: 'widget',
    icons: 'ombumedia',
    init: function(editor) {

      //editor.addCommand('foobar', {
        //exec: function(editor) {
        //}
      //});

      //editor.ui.addButton('ombumedia', {
        //label: 'Media',
        //command: 'foobar',
        //toolbar: 'ombumedia'
      //});

      console.log(editor);

      editor.widgets.add('ombumedia', {
        button: 'ombumedia',
        template: '<div data-ombumedia=""></div>',
        allowedContent: 'div[data-ombumedia];',
        requiredContent: 'div[data-ombumedia]',
        dialog: 'link',
        upcast: function(element) {
          return element && element.name == 'div' && element.attributes['data-ombumedia'];
        },
        init: function() {
          // Populate widget data from DOM.
          var widget = this;
        },
        data: function() {
          // Move widget data into DOM.
          var widget = this;
        }
      });

    }
  });

})();

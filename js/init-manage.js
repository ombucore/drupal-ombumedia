(function($) {
"use strict";

  Drupal.behaviors.ombumediaInitManage = {
    attach: function(context, settings) {
      $('.ombumedia-page[data-mode="manage"]', context)
        .once('ombumedia-init-manage')
        .each(function(index, el) {
          var options = {
            el: el,
            mode: 'manage'
          };
          var library = new Drupal.ombumedia.LibraryStatic(options);
        });
    }
  };

})(jQuery);

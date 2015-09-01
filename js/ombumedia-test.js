(function($) {
"use strict";

$(function() {

  $('.select-media').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia()
      .done(function(values) {
        console.log('resolved');
        $('dd.fid').text(values.fid);
        $('dd.view-mode').text(values.viewMode);
      })
      .fail(function() {
        console.log('rejected');
      });
  });

});

})(jQuery);

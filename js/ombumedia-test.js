(function($) {
"use strict";

$(function() {

  $('.select-media').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia().then(function(values) {
      $('dd.fid').text(values.fid);
      $('dd.view-mode').text(values.viewMode);
    });
  });

});

})(jQuery);

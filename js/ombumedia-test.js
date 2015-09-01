(function($) {
"use strict";

$(function() {

  function populateValues(values) {
    console.log('resolved');
    $('dd.fid').text(values.fid);
    $('dd.view-mode').text(values.viewMode);
  }

  $('.select-media-all').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia().then(populateValues);
  });

  $('.select-media-image').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      type: 'image'
    }).then(populateValues);
  });

  $('.select-media-document').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      type: 'document'
    }).then(populateValues);
  });

  $('.select-media-video').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      type: 'video'
    }).then(populateValues);
  });

});

})(jQuery);

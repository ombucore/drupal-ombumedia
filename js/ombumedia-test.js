(function($) {
"use strict";

$(function() {

  function populateValues(values) {
    console.log('resolved', values);
    $('dd.fid').text(values.fid);
    $('dd.view-mode').text(values.view_mode);
  }

  $('.select-media-all').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia().then(populateValues);
  });

  $('.select-media-image').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      types: ['image'],
      view_modes: {
        image: ['preview']
      }
    }).then(populateValues);
  });

  $('.select-media-image-video').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      types: ['image', 'video'],
      view_modes: {
        image: ['preview'],
        video: ['full']
      }
    }).then(populateValues);
  });

  $('.select-media-document').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      types: ['document']
    }).then(populateValues);
  });

  $('.select-media-video').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      fid: 35,
      types: ['video'],
      view_mode: 'preview'
    }).then(populateValues);
  });

  $('.select-media-image-wysiwyg').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      types: ['image'],
      view_modes: {
        image: ['preview'],
        video: ['preview', 'full']
      },
      wywiwyg_format: 'default',
    }).then(populateValues);
  });

});

})(jQuery);

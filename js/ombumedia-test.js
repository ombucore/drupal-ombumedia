(function($) {
"use strict";

$(function() {

  function populateValues(values) {
    console.log('resolved', values);
    $('dd.fid').text(values.fid);
    $('dd.view-mode').text(values.view_mode);
  }

  /**
   * Select any media and allow all enabled view modes.
   */
  $('.select-media-all').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia().then(populateValues);
  });

  /**
   * Select an Image and only allow the "preview" view mode.
   */
  $('.select-media-image').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      types: ['image'],
      view_modes: {
        image: ['preview']
      }
    }).then(populateValues);
  });

  /**
   * Select an Image or Video and only allow the "preview" view mode if an
   * image is selected and "full" if a video is selected.
   */
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

  /**
   * Select a Document and only allow any view mode.
   */
  $('.select-media-document').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      types: ['document']
    }).then(populateValues);
  });

  /**
   * Open up the configure form for the file with id 35 and pre-select the
   * 'preview' view mode.  If the user goes back to the library, only Videos
   * can be selected and can use any view mode.
   */
  $('.select-media-video').on('click', function(e) {
    e.preventDefault();
    Drupal.ombumedia.selectMedia({
      fid: 35,
      types: ['video'],
      view_mode: 'preview'
    }).then(populateValues);
  });

  /**
   * Select an Image and only allow the "preview" view mode. The
   * `wysiwyg_format` will help tell the backend that the selection is for rich
   * text embedding and allow modules to add extra fields or processing to the
   * configure form.
   */
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

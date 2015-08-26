(function($) {
"use strict";


/**
 * Locals.
 */
var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var stopPropagation = Drupal.ombumedia.util.stopPropagationWrapper;


/**
 * Container for Library functionality.
 *
 * @param {object} options - Configuration for this library.
 *   el: {DOMElement} - The root DOM element of the library with class '.ombumedia-page'.
 *   mode: {string} 'select', 'manage' - The mode to launch the library in.
 *   filters: {object} - An object of filters to pre-filter by. Most commonly
 *                       like `{type: 'document'}`.
 */
function Library(options) {
  this.initialize(options);
}

Library.prototype.initialize = function(options) {
  this.$root = $(options.el);
  this.$library = this.$root.find('.ombumedia-media-library');
  this.mode = (options.mode && options.mode == 'select') ? 'select' : 'manage';

  var $uploadDragZone = this.$root.find('.ombumedia-upload-drag');
  this.$library.on('dragover', preventDefault(stopPropagation(this.dragOver.bind(this))));
  $uploadDragZone.on('dragleave', preventDefault(stopPropagation(this.dragLeave.bind(this))));
  $uploadDragZone.on('drop', preventDefault(stopPropagation(this.uploadDroppedFile.bind(this))));

  this.$root.data('ombumedia-library', this);
};

Library.prototype.dragOver = function(e) {
  this.$library.addClass('drag-over');
};

Library.prototype.dragLeave = function(e) {
  this.$library.removeClass('drag-over');
};

Library.prototype.uploadDroppedFile = function(e) {
  this.dragLeave(e);
  this.$library.addClass('uploading');

  var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
  if (!files.length) {
    return;
  }
  var file = files[0];
  var formData = new FormData();
  formData.append('files[]', file);

  this.$library.find('.progress-text-filename').text(file.name);

  $.ajax({
    url: Drupal.settings.ombumedia.upload.url,
    type: 'POST',
    xhr: function() {
      var myXhr = $.ajaxSettings.xhr();
      if (myXhr.upload) {
        myXhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            var loaded = e.loaded;
            var total = e.total;
            var width = ((loaded / total) * 100) + '%';
            this.$library.find('.progress-bar .bar').css('width', width);
          }
        }.bind(this), false);
      }
      return myXhr;
    }.bind(this),
    data: formData,
    cache: false,
    contentType: false,
    processData: false
  })
  .done(function(data, textStatus, jQueryXHR) {
    if (data.file && data.file.fid) {
      this.fileEdit(data.file.fid);
    }
  }.bind(this));
};

/**
 * Subclass Interface.
 */
Library.prototype.uploadComplete = function(data, textStatus, jQueryXHR) {};
Library.prototype.filePreview = function(fid) {};
Library.prototype.fileEdit = function(fid) {};
Library.prototype.fileDelete = function(fid) {};
Library.prototype.fileSelect = function(fid) {};



/**
 * Ajax Library.
 */
function LibraryAjax(options) {
  this.initialize(options);
};

LibraryAjax.prototype = Object.create(Library.prototype);

LibraryAjax.fileEdit  = function(fid) {
  console.log('Not Implemented');
};


/**
 * Static Library.
 */
function LibraryStatic(options) {
  this.initialize(options);
}

LibraryStatic.prototype = Object.create(Library.prototype);

LibraryStatic.prototype.fileEdit = function(fid) {
  var dest = window.location.pathname.slice(1); // Remove preceding slash '/'.
  window.location = '/file/' + fid + '/edit?destination=' + dest;
};

LibraryStatic.prototype.fileDelete = function(fid) {
  var dest = window.location.pathname.slice(1); // Remove preceding slash '/'.
  window.location = '/file/' + fid + '/delete?destination=' + dest;
};


/**
 * Events for files in the grid.
 */
Drupal.behaviors.ombumediaGridFiles = {
  attach: function(context, settings) {
    $('.ombumedia-library-file', context)
      .once('ombumedia-library-file-processed')
      .on('click', preventDefault(Drupal.behaviors.ombumediaGridFiles.onClick));
  },
  onClick: function(e) {
    var $fileEl = $(e.currentTarget);
    var fid = $fileEl.attr('data-fid');
    var library = $fileEl.parents('.ombumedia-page').data('ombumedia-library');
    library.filePreview(fid);
  }
};


/**
 * Exports.
 */

Drupal.ombumedia = Drupal.ombumedia || {};
Drupal.ombumedia.LibraryStatic = LibraryStatic;
Drupal.ombumedia.LibraryAjax = LibraryAjax;

})(jQuery);

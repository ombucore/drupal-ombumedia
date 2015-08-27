(function($) {
"use strict";


/**
 * Locals.
 */
var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var stopPropagation = Drupal.ombumedia.util.stopPropagationWrapper;
var destPath = Drupal.ombumedia.util.destPath;
var fileUrl = Drupal.ombumedia.util.fileUrl;


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
Library.prototype.filePreview = function(fid) {
  console.log('filePreview not implemented');
};
Library.prototype.fileEdit = function(fid) {
  console.log('fileEdit not implemented');
};
Library.prototype.fileDelete = function(fid) {
  console.log('fileDelete not implemented');
};
Library.prototype.fileSelect = function(fid) {
  console.log('fileSelect not implemented');
};



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

LibraryStatic.prototype.filePreview = function(fid) {
  window.location = fileUrl(fid, 'preview');
};

LibraryStatic.prototype.fileEdit = function(fid) {
  window.location = fileUrl(fid, 'edit');
};

LibraryStatic.prototype.fileDelete = function(fid) {
  window.location = fileUrl(fid, 'delete');
};


/**
 * Events for files in the grid.
 */
Drupal.behaviors.ombumediaGridFiles = {
  attach: function(context, settings) {
    $('.ombumedia-library-file', context)
      .once('ombumedia-library-file')
      .find('a')
      .on('click', preventDefault(Drupal.behaviors.ombumediaGridFiles.actionClick));
  },
  actionClick: function(e) {
    var $actionLink = $(e.currentTarget);
    var library = $actionLink.parents('.ombumedia-page').data('ombumedia-library');
    var fid = $actionLink.attr('data-fid');
    var action = $actionLink.attr('href').slice(1);
    var libraryMethod = 'file' + action.slice(0, 1).toUpperCase() + action.slice(1);
    library[libraryMethod](fid);
  }
};


/**
 * Exports.
 */

Drupal.ombumedia = Drupal.ombumedia || {};
Drupal.ombumedia.LibraryStatic = LibraryStatic;
Drupal.ombumedia.LibraryAjax = LibraryAjax;

})(jQuery);

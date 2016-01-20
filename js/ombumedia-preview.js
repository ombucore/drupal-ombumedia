(function($) {
"use strict";

/**
 * Functionality inside the file selection pop-up.
 */


var preventDefault = Drupal.ombumedia.util.preventDefaultWrapper;
var fileUrl = Drupal.ombumedia.util.fileUrl;
var deparam = Drupal.ombumedia.util.deparam;
var destPath = Drupal.ombumedia.util.destPath;


/**
 * Initializes the preview functionality on media items.
 */
Drupal.behaviors.ombumediaPreviewPopup = {
  attach: function(context) {
    var $previewLinks = $('.ombumedia-library-file .launch-preview-popup', context).once('launch-preview-popup');

    if (!$previewLinks.length) {
      return;
    }

    $previewLinks.on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $link = $(this);
      $link.blur();
      launchPreviewPopup($link.attr('href'));
    });
  }
};


function launchPreviewPopup(url) {
  url = url + '?' + $.param({ render: 'ombumedia-popup'});

  var $iframe = $('<iframe class="ombumedia-modal-frame"/>');

  $iframe.attr('src', url);

  var dialogOptions = {
    modal: true,
    draggable: false,
    resizable: false,
    position: { my: "top center", at: "top center" },
    open: function(e, ui) {
      // Show/hide toolbar in parent nested dialog. Keeps close button working
      // correctly.
      if (window.parent !== window) {
        $('.ui-dialog-titlebar', window.parent.document).hide();
      }
      $('body').addClass('ui-dialog-open');
    },
    close: function(e, ui) {
      if (window.parent !== window) {
        $('.ui-dialog-titlebar', window.parent.document).show();
      }
      $('body').removeClass('ui-dialog-open');
      $(e.target).remove();
    },
    title: "Preview"
  };

  $iframe.dialog(dialogOptions);

  var $uiDialog = $iframe.parents('.ui-dialog:eq(0)');
  var $uiOverlay = $uiDialog.siblings('.ui-widget-overlay');

  $uiOverlay.addClass('ombumedia-ui-overlay');
  $uiOverlay.addClass('ombumedia-ui-overlay-preview');
  $uiDialog.addClass('ombumedia-ui-dialog');
  $uiDialog.addClass('ombumedia-ui-dialog-preview');

  $uiDialog.css({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: '0',
    width: 'auto',
    height: 'auto',
    background: 'transparent',
    border: 'none'
  });

  $iframe.css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'transparent'
  });

}


/**
 * Run inside the preview popup iframe.
 */
Drupal.behaviors.ombumediaPreviewTaxonomyLinks = {
  attach: function(context) {
    // Hook up taxonomy links to close th preview and filter the parent media
    // library.
    $('body.page-file-preview')
      .find('a[data-filter-field-name]')
      .filter(':not(.preview-taxonomy-links-processed)')
      .addClass('.preview-taxonomy-links-processed')
      .on('click', preventDefault(function(e) {
        try {
          var $a = $(this);
          var filterName = $a.attr('data-filter-field-name');
          var filterValue = $a.attr('data-filter-field-value');

          // Have to use parent window's jQuery so the event triggering works
          // correctly.
          var $filter = window.parent.jQuery(':input[name="' + filterName + '"]');
          $filter.val(filterValue);
          $filter.trigger('change');

          window.parent.jQuery('.ui-dialog-titlebar-close').trigger('click');
        }
        catch(e) {}
      }));
  }
};



})(jQuery);

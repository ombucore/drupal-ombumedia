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

/**
 */
Drupal.behaviors.ombumediaFixExposedFiltersFocus = {
  attach: function(context) {
    var $forms = $('form#views-exposed-form-ombumedia-manage-media, form#views-exposed-form-ombumedia-select-media', context)
                    .once('ombumedia-fix-exposed-filters-focus');

    if (!$forms.length) {
      return;
    }

    $forms.each(function(i, formEl) {
      var $form = $(formEl);
      var $formElements = $form.find('input, select');
      var $button = $form.find('input[type=submit], button[type=submit], input[type=image]');

      // If this is re-binding after ajax.
      refocusElement();

      $formElements
        .filter('[name="filename"]')
        .on('keypress', function(e) {
          // Block the <ENTER> key.
          if (e.keyCode == 13) {
            e.preventDefault();
          }
        });

      // Hidden button gets 'clicked' to start the ajax call.
      $button.on('click', ajaxStarted);

      // Called right after ajax starts.
      function ajaxStarted() {
        // Stash which element had focus previously.
        var $focusEl = $(document.activeElement);
        Drupal.behaviors.ombumediaFixExposedFiltersFocus.previousFocusedId = $focusEl.attr('id');

        // Put focus back on element after button was clicked.
        refocusElement();
      }

      function refocusElement() {
        if (!Drupal.behaviors.ombumediaFixExposedFiltersFocus.previousFocusedId) {
          return;
        }

        var $focusEl = $form.find('#' + Drupal.behaviors.ombumediaFixExposedFiltersFocus.previousFocusedId);
        $focusEl.focus();

        if ($focusEl.is('input[type="text"]')) {
          // Move the cursor to the end.
          if ($focusEl[0].setSelectionRange) {
            $focusEl[0].setSelectionRange(100, 100);
          }
          else {
            $focusEl.val($focusEl.val());
          }
        }
      }

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
      .addClass('preview-taxonomy-links-processed')
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

          closePreviewDialog();
        }
        catch(e) {}
      }));
  }
};

Drupal.behaviors.ombumediaPreviewEscapeKey = {
  attach: function(context) {
    $('body.page-file-preview')
      .filter(':not(.escape-key-processed)')
      .addClass('escape-key-processed')
      .on('keyup', preventDefault(function(e) {
        if (e.keyCode == 27) {
          closePreviewDialog();
        }
      }));
  }
};

Drupal.behaviors.ombumediaPreviewBackgroundClickClose = {
  attach: function(context) {
    var $previewBody = $('body.page-file-preview').filter(':not(.background-click-processed)');

    if (!$previewBody.length) {
      return;
    }

    $previewBody.addClass('background-click-processed');

    $(window).on('click', preventDefault(function(e) {
        var parentIsPreview = !!$(e.target).parents('.ombumedia-file-preview').length;
        if (!parentIsPreview) {
          closePreviewDialog();
        }
      }));
  }
};


function closePreviewDialog() {
  try {
    window.parent.jQuery('.ui-dialog-titlebar-close').trigger('click');
  }
  catch(e) {}
}


})(jQuery);

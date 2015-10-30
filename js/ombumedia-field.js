(function ($) {

  Drupal.behaviors.ombumediaField = {
    attach: function(context, settings) {
      $('.ombumedia-widget', context).once('ombumedia-widget').each(function() {

        // Wiring.

        var $container = $(this);
        var $fid = $('input.fid', $container);
        var $data = $('input.data', $container);

        var options = {
          types: $.parseJSON($container.attr('data-types')),
          view_modes: $.parseJSON($container.attr('data-view-modes'))
        };

        var $selectButton = $container.find('.select-media');
        var $changeButton = $container.find('.change-media');
        var $clearButton = $container.find('.clear-media');

        $selectButton.on('click', selectChangeClick)
        $changeButton.on('click', selectChangeClick)
        $clearButton.on('click', clearClick);

        updateButtonVisibility();


        // Functions.

        function selectChangeClick(e) {
          e.preventDefault();

          var selectOptions = $.extend({}, options);

          if ($fid.val() != 0) {
            selectOptions.fid = $fid.val();
          }

          try {
            var data = $.parseJSON($data.val());
            if (data.view_mode) {
              selectOptions.view_mode = data.view_mode;
            }
          } catch (error) {}

          Drupal.ombumedia.selectMedia(selectOptions).then(onMediaSelect);

        }

        function onMediaSelect(values) {
          $fid.val(values.fid);

          var data = $.extend({}, values);
          delete data.fid;
          $data.val(JSON.stringify(data));

          $.ajax({
            url: Drupal.settings.basePath + 'file/' + values.fid + '/field/preview'
          })
          .done(function(content) {
            $('.preview', $container).html($('.ombumedia-file-field-preview', content).html());
          })
          .fail(function() {});

          updateButtonVisibility();
        }

        function clearClick(e) {
          $data.val(JSON.stringify({}));
          $fid.val(0);
          $('.preview', $container).html('');

          updateButtonVisibility();
        }

        function updateButtonVisibility() {
          if ($fid.val() == 0) {
            $selectButton.show();
            $changeButton.hide();
            $clearButton.hide();
          }
          else {
            $selectButton.hide();
            $changeButton.show();
            $clearButton.show();
          }

        }

      });
    }
  };

})(jQuery);

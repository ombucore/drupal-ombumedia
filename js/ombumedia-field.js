(function ($) {

  Drupal.behaviors.ombumediaField = {
    attach: function(context, settings) {
      $('.ombumedia-widget', context).each(function() {
        var $container = $(this);
        var $fid = $('input.fid', $container);
        var $data = $('input.data', $container);

        var options = {
          types: $.parseJSON($container.attr('data-types')),
          view_modes: $.parseJSON($container.attr('data-view-modes'))
        };

        $('.select-media').on('click', function(e) {
          e.preventDefault();

          if ($fid.val() != 0) {
            options.fid = $fid.val();
          }

          try {
            var data = $.parseJSON($data.val());
            if (data.view_mode) {
              options.view_mode = data.view_mode;
            }
          } catch (error) {}

          Drupal.ombumedia.selectMedia(options).then(function(values) {
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
            .fail(function() {
            });

          });

        });

      });
    }
  };

})(jQuery);

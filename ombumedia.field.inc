<?php

/**
 * @file
 * Field widget hooks for OMBU Media feature.
 */

/**
 * Implements hook_element_info().
 */
function ombumedia_element_info() {
  $types = array();
  $types['media'] = array(
    '#input' => TRUE,
    '#process' => array('ombumedia_element_process'),
    '#element_validate' => array('ombumedia_element_validate'),
    '#theme_wrappers' => array('container'),
    '#extended' => FALSE,
    '#required' => FALSE,
    '#media_options' => array(
      'global' => array(
        // Example: array('image', 'audio');
        'types' => array(),
        // Example: array('http', 'ftp', 'flickr');
        'schemes' => array(),
      ),
    ),
    '#attributes' => array(
      'class' => array('ombumedia-widget', 'form-item'),
    ),
    '#attached' => array(
      'library' => array(
        array('ombumedia', 'ombumedia'),
      ),
      'js' => array(
        drupal_get_path('module', 'ombumedia') . '/js/ombumedia-field.js',
      ),
    ),
  );
  return $types;
}

/**
 * Process callback for the media form element.
 */
function ombumedia_element_process(&$element, &$form_state, $form) {
  $fid = isset($element['#value']['fid']) ? $element['#value']['fid'] : 0;
  $file = $fid ? file_load($fid) : FALSE;

  // Set some default element properties.
  $element['#file'] = $file;

  // Set options via data attributes.
  $element['#attributes']['data-types'] = join(',', $element['#media_options']['global']['types']);
  // @todo: support configurable view modes.
  $element['#attributes']['data-view-modes'] = '';

  $element['title'] = array(
    '#type' => 'item',
    '#title' => $element['#title'],
    '#description' => $element['#description'],
    '#required' => $element['#required'],
    '#weight' => -100,
  );
  if (isset($element['#title_display'])) {
    $element['title']['#title_display'] = $element['#title_display'];
  }

  // @todo This should load from the JS in case of a failed form submission.
  $element['preview'] = array(
    '#prefix' => '<div class="preview launcher">',
    '#suffix' => '</div>',
    '#weight' => 0,
    'content' => $file ? ombumedia_render_file_preview($file) : array(),
  );

  $element['select'] = array(
    '#type' => 'link',
    '#href' => '',
    // @todo: either need to conditionally set label or find a state agnostic
    // label.
    '#title' => t('Browse'),
    '#attributes' => array(
      'class' => array('button', 'select-media'),
    ),
    '#options' => array('fragment' => FALSE, 'external' => TRUE),
    '#weight' => 10,
  );

  $element['fid'] = array(
    '#type' => 'hidden',
    '#value' => $fid,
    '#attributes' => array('class' => array('fid')),
    '#weight' => 100,
  );

  $setting = array();
  $setting['media']['elements'][$element['#id']] = $element['#media_options'];

  return $element;
}

/**
 * Validate media form elements.
 *
 * The file type is validated during the upload process, but this is necessary
 * necessary in order to respect the #required property.
 */
function ombumedia_element_validate(&$element, &$form_state) {
  if ($element['#required']) {
    $has_value = FALSE;
    $widget_parents = $element['#array_parents'];
    array_pop($widget_parents);
    $items = drupal_array_get_nested_value($form_state['values'], $widget_parents);
    foreach ($items as $value) {
      if (is_array($value) && !empty($value['fid'])) {
        $has_value = TRUE;
      }
    }
    if (!$has_value) {
      form_error($element, t('%element_title is required.', array('%element_title' => $element['#title'])));
    }
  }
}

/**
 * Implements hook_field_widget_info().
 */
function ombumedia_field_widget_info() {
  return array(
    'ombumedia' => array(
      'label' => t('OMBU Media file selector'),
      'field types' => array('file', 'image'),
      'settings' => array(
        'allowed_types' => array('image'),
        'allowed_schemes' => array('public', 'private'),
      ),
      'behaviors' => array(
        'multiple values' => FIELD_BEHAVIOR_DEFAULT,
        'default value' => FIELD_BEHAVIOR_NONE,
      ),
    ),
  );
}

/**
 * Implements hook_field_widget_settings_form().
 */
function ombumedia_field_widget_settings_form($field, $instance) {
  $widget = $instance['widget'];
  $settings = $widget['settings'];
  $form = array();

  $streams = file_get_stream_wrappers(STREAM_WRAPPERS_VISIBLE);

  $form['allowed_types'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Allowed remote media types'),
    '#options' => file_entity_type_get_names(),
    '#default_value' => $settings['allowed_types'],
    '#description' => t('Media types which are allowed for this field when using remote streams.'),
    '#weight' => 1,
    '#access' => count(file_get_stream_wrappers(STREAM_WRAPPERS_VISIBLE | STREAM_WRAPPERS_LOCAL)) != count($streams),
  );

  $options = array();
  foreach ($streams as $scheme => $data) {
    $options[$scheme] = t('@scheme (@name)', array('@scheme' => $scheme . '://', '@name' => $data['name']));
  }
  $form['allowed_schemes'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Allowed URI schemes'),
    '#options' => $options,
    '#default_value' => $settings['allowed_schemes'],
    '#description' => t('URI schemes include public:// and private:// which are the Drupal files directories, and may also refer to remote sites.'),
    '#weight' => 2,
  );

  return $form;
}

/**
 * Implements hook_field_widget_form().
 */
function ombumedia_field_widget_form(&$form, &$form_state, $field, $instance, $langcode, $items, $delta, $element) {
  $field_settings = $instance['settings'];
  $widget_settings = $instance['widget']['settings'];

  // @todo The Field API supports automatic serialization / unserialization, so
  //   this should no longer be needed. After verifying with a module that uses
  //   the 'data' column, remove this.
  // @see media_field_widget_value()
  $current_value = array();
  if (isset($items[$delta])) {
    $current_value = $items[$delta];
    // @todo $items[$delta] is sometimes a loaded media entity (an object)
    //   rather than an array. This conflicts with Field API expectations (for
    //   example, it results in fatal errors when previewing a node with a
    //   multi-valued media field), so should be fixed. In the meantime, don't
    //   assume that $current_value is an array.
    if (is_array($current_value) && isset($current_value['data']) && is_string($current_value['data'])) {
      $current_value['data'] = unserialize($current_value['data']);
    }
  }

  $element += array(
    '#type' => 'media',
    '#collapsed' => TRUE,
    '#default_value' => $current_value,
    '#required' => $instance['required'],
    '#media_options' => array(
      'global' => array(
        'types' => array_filter($widget_settings['allowed_types']),
        'schemes' => $widget_settings['allowed_schemes'],
        'file_directory' => isset($field_settings['file_directory']) ? $field_settings['file_directory'] : '',
        'file_extensions' => isset($field_settings['file_extensions']) ? $field_settings['file_extensions'] : media_variable_get('file_extensions'),
        'max_filesize' => isset($field_settings['max_filesize']) ? $field_settings['max_filesize'] : 0,
        'uri_scheme' => !empty($field['settings']['uri_scheme']) ? $field['settings']['uri_scheme'] : file_default_scheme(),
      ),
    ),
  );

  if ($field['cardinality'] != 1) {
    $element['#title'] = check_plain($instance['label']);
    $element['#title_display'] = 'invisible';
  }

  if ($field['type'] == 'file') {
    $element['display'] = array(
      '#type' => 'value',
      '#value' => 1,
    );
  }

  // Add image field specific validators.
  if ($field['type'] == 'image') {
    if ($field_settings['min_resolution'] || $field_settings['max_resolution']) {
      $element['#media_options']['global']['min_resolution'] = $field_settings['min_resolution'];
      $element['#media_options']['global']['max_resolution'] = $field_settings['max_resolution'];
    }
  }

  return $element;
}

/**
 * Widget value.
 *
 * @todo Is this function ever called? If not, remove it. The Field API now
 *   supports automatic serialization / unserialization, so this should no
 *   longer be needed. After verifying with a module that uses the 'data'
 *   column, remove this.
 *
 * @see media_field_widget_form()
 */
function media_field_widget_value($element, $input, $form_state) {
  $return = $input;

  if (!is_array($return)) {
    $return = array();
  }

  if (isset($return['data'])) {
    $return['data'] = serialize($return['data']);
  }

  $return += array(
    'fid' => 0,
    'title' => '',
    'data' => NULL,
  );

  return $return;
}

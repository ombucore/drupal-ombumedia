<?php

/**
 * @file
 * Field widget hooks for OMBU Media feature.
 */

/**
 * Form Element Hooks
 */

/**
 * Implements hook_element_info().
 */
function ombumedia_element_info() {
  $types = array();
  $types['ombumedia'] = array(
    '#input' => TRUE,
    '#process' => array('ombumedia_element_process'),
    '#element_validate' => array('ombumedia_element_validate'),
    '#value_callback' => 'ombumedia_element_value_callback',
    '#theme_wrappers' => array('container'),
    '#extended' => FALSE,
    '#required' => FALSE,
    '#tree' => TRUE,
    '#media_options' => array(
      'global' => array(
        // Example: array('image', 'audio');
        'types' => array(),
        // Example: array('http', 'ftp', 'flickr');
        'schemes' => array(),
        // Example: array('default', 'teaser');
        'view_modes' => array(),
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
  $data = isset($element['#value']['data']) ? $element['#value']['data'] : array();
  $file = $fid ? file_load($fid) : FALSE;

  // Set some default element properties.
  $element['#file'] = $file;

  // Set options via data attributes.
  $element['#attributes']['data-types'] = drupal_json_encode(array_values($element['#media_options']['global']['types']));
  $view_modes = array();
  foreach ($element['#media_options']['global']['view_modes'] as $type => $modes) {
    $view_modes[$type] = array_values($modes);
  }
  $element['#attributes']['data-view-modes'] = !empty($view_modes) ? drupal_json_encode($view_modes) : "{}";

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
    'content' => $file ? ombumedia_page_file_field_preview($file) : array(),
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

  $element['data'] = array(
    '#type' => 'hidden',
    '#value' => !empty($data) ? drupal_json_encode($data) : "{}",
    '#attributes' => array('class' => array('data')),
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
 * Value callback for ombumedia elements.
 */
function ombumedia_element_value_callback($element, $input = FALSE, &$form_state) {
  if ($input !== FALSE) {
    if (isset($input['data'])) {
      $input['data'] = json_decode($input['data'], TRUE);
    }
    return $input;
  }
  elseif (!empty($element['#default_value'])) {
    return $element['#default_value'];
  }

  return;
}


/**
 * Field Hooks
 *
 * Borrowed from mediafield.module.
 */

/**
 * Implements hook_field_info().
 */
function ombumedia_field_info() {
  return array(
    'ombumedia' => array(
      'label' => t('Media asset'),
      'description' => t('This field stores media file along with display settings'),
      'settings' => array(),
      'instance_settings' => array(
        'file_extensions' => variable_get('ombumedia__file_extensions'),
      ),
      'default_widget' => 'ombumedia',
      'default_formatter' => 'ombumedia_render',
      'property_type' => 'field_item_file',
      'property_callbacks' => array('entity_metadata_field_file_callback'),
    ),
  );
}

/**
 * Implements hook_field_instance_settings_form().
 */
function ombumedia_field_instance_settings_form($field, $instance) {
  $settings = $instance['settings'];

  // Make the extension list a little more human-friendly by comma-separation.
  $extensions = str_replace(' ', ', ', $settings['file_extensions']);
  $form['file_extensions'] = array(
    '#type' => 'textfield',
    '#title' => t('Allowed file extensions for uploaded files'),
    '#default_value' => $extensions,
    '#description' => t('Separate extensions with a space or comma and do not include the leading dot.'),
    '#element_validate' => array('_file_generic_settings_extensions'),
    // By making this field required, we prevent a potential security issue
    // that would allow files of any type to be uploaded.
    '#required' => TRUE,
    '#maxlength' => 255,
  );

  return $form;
}

/**
 * Implements hook_field_is_empty().
 */
function ombumedia_field_is_empty($item, $field) {
  return empty($item['fid']);
}

/**
 * Implements hook_field_prepare_view().
 */
function ombumedia_field_prepare_view($entity_type, $entities, $field, $instances, $langcode, &$items) {
  // Collect all file IDs that need loading.
  $fids = array();
  foreach ($entities as $id => $entity) {
    // Load the files from the files table.
    foreach ($items[$id] as $delta => $item) {
      if (!empty($item['fid'])) {
        $fids[] = $item['fid'];
      }
    }
  }

  // Load the file entities.
  $files = file_load_multiple($fids);

  // Add the loaded file entities to the field item array.
  foreach ($entities as $id => $entity) {
    foreach ($items[$id] as $delta => $item) {
      // If the file does not exist, mark the entire item as empty.
      if (empty($files[$item['fid']])) {
        unset($items[$id][$delta]);
      }
      else {
        $items[$id][$delta]['file'] = $files[$item['fid']];
      }
    }
  }
}

/**
 * Implements hook_field_validate().
 *
 * Possible error codes:
 * - 'media_remote_file_type_not_allowed': The remote file is not an allowed
 *   file type.
 */
function ombumedia_field_validate($obj_type, $object, $field, $instance, $langcode, $items, &$errors) {
  $allowed_types = array_keys(array_filter($instance['widget']['settings']['allowed_types']));

    // @TODO: merge in stuff from media_uri_value
  foreach ($items as $delta => $item) {
    if (empty($item['fid'])) {
      return TRUE;
      //@TODO: make support for submiting with just a URI here?
    }

    $file = file_load($item['fid']);

    // Only validate allowed types if the file is remote and not local.
    if (!file_entity_file_is_local($file)) {
      if (!in_array($file->type, $allowed_types)) {
        $errors[$field['field_name']][$langcode][$delta][] = array(
          'error' => 'media_remote_file_type_not_allowed',
          'message' => t('%name: Only remote files with the following types are allowed: %types-allowed.', array('%name' => t($instance['label']), '%types-allowed' => !empty($allowed_types) ? implode(', ', $allowed_types) : t('no file types selected'))),
        );
      }
    }
  }
}

/**
 * Implements hook_field_widget_error().
 */
function ombumedia_field_widget_error($element, $error, $form, &$form_state) {
  form_error($element['fid'], $error['message']);
}

/**
 * Implements hook_field_load().
 */
function ombumedia_field_load($entity_type, $entities, $field, $instances, $langcode, &$items, $age) {
  foreach ($entities as $id => $entity) {
    foreach ($items[$id] as $delta => $item) {
      $items[$id][$delta]['data'] = unserialize($items[$id][$delta]['data']);
    }
  }
}

/**
 * Implements hook_field_presave().
 */
function ombumedia_field_presave($entity_type, $entity, $field, $instance, $langcode, &$items) {
  foreach ($items as $delta => $item) {
    $items[$delta]['data'] = serialize($items[$delta]['data']);
  }
}

/**
 * @todo The following hook_field_(insert|update|delete|delete_revision)
 *   implementations are nearly identical to the File module implementations of
 *   the same field hooks. The only differences are:
 *   - We pass 'media' rather than 'file' as the module argument to the
 *     file_usage_(add|delete)() functions.
 *   - We do not delete the file / media entity when its usage count goes to 0.
 *   We should submit a core patch to File module to make it flexible with
 *   respect to the above, so that we can reuse its implementation rather than
 *   duplicating it.
 */

/**
 * Implements hook_field_insert().
 */
function ombumedia_field_insert($entity_type, $entity, $field, $instance, $langcode, &$items) {
  list($id, $vid, $bundle) = entity_extract_ids($entity_type, $entity);

  // Add a new usage of each uploaded file.
  foreach ($items as $item) {
    $file = (object) $item;
    file_usage_add($file, 'ombumedia', $entity_type, $id);
  }
}

/**
 * Implements hook_field_update().
 *
 * Checks for files that have been removed from the object.
 */
function ombumedia_field_update($entity_type, $entity, $field, $instance, $langcode, &$items) {
  list($id, $vid, $bundle) = entity_extract_ids($entity_type, $entity);

  // On new revisions, all files are considered to be a new usage and no
  // deletion of previous file usages are necessary.
  if (!empty($entity->revision)) {
    foreach ($items as $item) {
      $file = (object) $item;
      file_usage_add($file, 'ombumedia', $entity_type, $id);
    }
    return;
  }

  // Build a display of the current FIDs.
  $current_fids = array();
  foreach ($items as $item) {
    $current_fids[] = $item['fid'];
  }

  // Compare the original field values with the ones that are being saved.
  $original_fids = array();
  if (!empty($entity->original->{$field['field_name']}[$langcode])) {
    foreach ($entity->original->{$field['field_name']}[$langcode] as $original_item) {
      $original_fids[] = $original_item['fid'];
      if (isset($original_item['fid']) && !in_array($original_item['fid'], $current_fids)) {
        // Decrement the file usage count by 1.
        $file = (object) $original_item;
        file_usage_delete($file, 'ombumedia', $entity_type, $id, 1);
      }
    }
  }

  // Add new usage entries for newly added files.
  foreach ($items as $item) {
    if (!in_array($item['fid'], $original_fids)) {
      $file = (object) $item;
      file_usage_add($file, 'ombumedia', $entity_type, $id);
    }
  }
}

/**
 * Implements hook_field_delete().
 */
function ombumedia_field_delete($entity_type, $entity, $field, $instance, $langcode, &$items) {
  list($id, $vid, $bundle) = entity_extract_ids($entity_type, $entity);

  // Delete all file usages within this entity.
  foreach ($items as $delta => $item) {
    $file = (object) $item;
    file_usage_delete($file, 'ombumedia', $entity_type, $id, 0);
  }
}

/**
 * Implements hook_field_delete_revision().
 */
function ombumedia_field_delete_revision($entity_type, $entity, $field, $instance, $langcode, &$items) {
  list($id, $vid, $bundle) = entity_extract_ids($entity_type, $entity);
  foreach ($items as $delta => $item) {
    // @TODO: Not sure if this is correct
    $file = (object)$item;
    if (file_usage_delete($file, 'ombumedia', $entity_type, $id, 1)) {
      $items[$delta] = NULL;
    }
  }
}

/**
 * Implements hook_field_instance_update().
 */
function ombumedia_field_update_instance($instance, $prior_instance) {
  // Clear the filter cache when updating instance settings for a media entity.
  if ($instance['entity_type'] == 'media') {
    // media_filter_invalidate_caches();
  }
}


/**
 * Field Widget Hooks
 */

/**
 * Implements hook_field_widget_info().
 */
function ombumedia_field_widget_info() {
  return array(
    'ombumedia' => array(
      'label' => t('OMBU Media file selector'),
      'field types' => array('file', 'image', 'ombumedia'),
      'settings' => array(
        'allowed_types' => array('image'),
        'allowed_schemes' => array('public', 'private'),
        'allowed_view_modes' => array('default'),
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
    '#access' => count(file_get_stream_wrappers(STREAM_WRAPPERS_VISIBLE | STREAM_WRAPPERS_LOCAL)) != count($streams),
  );

  // View modes only work with ombumedia field types, since file and image field
  // types can't store additional settings.
  if ($field['type'] == 'ombumedia') {
    $entity_info = entity_get_info('file');
    $types = array_keys($entity_info['bundles']);
    $form['allowed_view_modes'] = array(
      '#type' => 'fieldset',
      '#title' => t('Allowed view modes'),
      '#tree' => TRUE,
    );
    foreach ($types as $type) {
      $form['allowed_view_modes'][$type] = array(
        '#title' => ucwords($type),
        '#type' => 'select',
        '#multiple' => TRUE,
        '#options' => ombumedia_file_type_view_modes($type),
        '#default_value' => isset($settings['allowed_view_modes'][$type]) ? $settings['allowed_view_modes'][$type] : array(),
      );
    }
  }

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
    if (is_array($current_value) && isset($current_value['data'])) {
      if (is_string($current_value['data'])) {
        $current_value['data'] = unserialize($current_value['data']);
      }
    }
  }

  $element += array(
    '#type' => 'ombumedia',
    '#collapsed' => TRUE,
    '#default_value' => $current_value,
    '#required' => $instance['required'],
    '#media_options' => array(
      'global' => array(
        'types' => array_filter($widget_settings['allowed_types']),
        'view_modes' => array_filter($widget_settings['allowed_view_modes']),
        'schemes' => $widget_settings['allowed_schemes'],
        'file_directory' => isset($field_settings['file_directory']) ? $field_settings['file_directory'] : '',
        'file_extensions' => isset($field_settings['file_extensions']) ? $field_settings['file_extensions'] : variable_get('ombumedia__file_extensions'),
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
 * Field Formatter Hooks.
 */

/**
 * Implements hook_field_formatter_info().
 */
function ombumedia_field_formatter_info() {
  $formatters = array(
    'ombumedia_render' => array(
      'label' => t('OMBU Media Render'),
      'field types' => array('ombumedia'),
    ),
    'ombumedia_large_icon' => array(
      'label' => t('Large filetype icon'),
      'field types' => array('file'),
    ),
  );
  return $formatters;
}

/**
 * Implements hook_field_formatter_view().
 */
function ombumedia_field_formatter_view($entity_type, $entity, $field, $instance, $langcode, $items, $display) {
  $element = array();

  if ($display['type'] == 'ombumedia_render') {
    foreach ($items as $delta => $item) {
      $file = $item['file'];
      $data = $item['data'];
      $file->ombumedia_settings = $data;
      $file->ombumedia_settings['context'] = 'field';
      $element[$delta] = file_view($file, $data['view_mode']);
    }
  }
  elseif ($display['type'] == 'ombumedia_large_icon') {
    // Add height/width variable according to ombumedia_thumbnail image style
    // so that the output in media browser is consistent.
    // @todo is this the correct place to put this?
    $style = image_style_load('ombumedia_thumbnail');
    foreach ($items as $delta => $item) {
      $element[$delta] = array(
        '#theme' => 'ombumedia_formatter_large_icon',
        '#file' => (object) $item,
        '#attributes' => array(
          'width' => $style['effects'][0]['data']['width'],
          'height' => $style['effects'][0]['data']['height'],
        ),
      );
    }
  }

  return $element;
}

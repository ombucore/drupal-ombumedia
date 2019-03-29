<?php

/**
 * Page Callbacks.
 */

/**
 * Page callback for Manage Media page.
 */
function ombumedia_page_magage_media() {

  // zzml, needed below?
  $view = views_get_view('ombumedia');
  $view->set_display('manage_media');
  $view->build(); //zzml
  $view->init_query(); //zzml
  $view->validate(); //zzml
  $view->update(); //zzml
  $view->pre_execute();
  $view->execute();
  $view_rendered = $view->preview(); //zzml

  drupal_add_library('ombumedia', 'ombumedia');

  //zzml, needed?
  header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
  header("Pragma: no-cache"); // HTTP 1.0.
  header("Expires: 0");

  return $view_rendered;
}

/**
 * Page callback for Manage Media Add page.
 */
function ombumedia_page_magage_media_add() {
  drupal_add_library('ombumedia', 'ombumedia');
  drupal_set_title(t('Media'));

  $redirect = array(
    'action' => 'edit',
    'query' => array(
      'destination' => 'admin/dashboard/manage-media',
    ),
  );

  $build = array(
    '#prefix' => '<div class="ombumedia-add">',
    '#suffix' => '</div>',
//    'drag' => array(
//      '#markup' => '<h3>' . t('Drag a file to upload') . '</h3><h4>' . t('or') . '</h4>',
//    ),
    'upload' => array(
      'form' => drupal_get_form('ombumedia_file_entity_add', array(), $redirect),
    ),
    'add' => array(
      'form' => drupal_get_form('ombumedia_internet_add', array(), $redirect),
    ),
  );

  return $build;
}

/**
 * Page callback for Select Media page.
 */
function ombumedia_page_select_media() {
  $view = views_get_view('ombumedia');
  $view->set_display('select_media');
  if (isset($_GET['types'])) {
    $view->exposed_input['types_filter'] = $_GET['types'];
  }
  $view->pre_execute();
  $view->execute();

  $redirect = array(
    'action' => 'configure',
    'query' =>  drupal_get_query_parameters(),
  );

  $build = array(
    'tabs' => array(
      'library' => array(
        '#title' => t('Library'),
        '#markup' => $view->preview(),
      ),
      'add' => array(
        '#title' => t('Add'),
        '#prefix' => '<div class="ombumedia-add">',
        '#suffix' => '</div>',
        'drag' => array(
          '#markup' => '<h3>' . t('Drag a file to upload') . '</h3><h4>' . t('or') . '</h4>',
        ),
        'upload' => array(
          'form' => drupal_get_form('ombumedia_file_entity_add', array(), $redirect),
        ),
        'add' => array(
          'form' => drupal_get_form('ombumedia_internet_add', array(), $redirect),
        ),
      ),
    ),
  );

  drupal_add_library('ombumedia', 'ombumedia');

  return $build;
}

/**
 * Page callback for Media Ajax Upload page.
 */
function ombumedia_page_media_ajax_upload() {
  module_load_include('inc', 'file_entity', 'file_entity.pages');
  $errors = array();
  $validators = file_entity_get_upload_validators();
  if ($file = file_save_upload(0, $validators)) {

    $type_candidates = file_entity_get_filetype_candidates($file);

    if (count($type_candidates) >= 1) {

        if ($moved_file = file_move($file, 'public://' . file_uri_target($file->uri), FILE_EXISTS_RENAME)) {
          $type_candidates_keys = array_keys($type_candidates);
          $file = $moved_file;
          $file->type = reset($type_candidates_keys);;
        }
        else {
          $errors[] = 'Error saving file.';
        }

    }
    else {
      $errors[] = 'Unrecognized file type.';
    }

  }
  else {
    $messages = drupal_get_messages('error');
    if (!empty($messages['error'])) {
      $errors[] = $messages['error'];
    }
    else {
      $errors[] = 'Error saving file.';
    }
  }

  if (empty($errors)) {
    $file->display = TRUE;
    $file->status = FILE_STATUS_PERMANENT;
    file_save($file);
    $file = file_load($file->fid);
    drupal_json_output(array(
      'file' => (array) $file,
    ));

  }
  else {
    drupal_json_output(array('errors' => $errors));
  }
  drupal_exit();
}

/**
 * Page callback to preview an OMBU Media file rendered as 'full' so videos can
 * play and images are large.
 */
function ombumedia_page_file_preview($file) {
  if (!user_access('administer files') && (file_uri_scheme($file->uri) === 'private')) {
    return MENU_ACCESS_DENIED;
  }

  drupal_add_library('ombumedia', 'ombumedia');

  return theme('ombumedia_file_preview', array(
    'file' => $file,
  ));
}

/**
 * Page callback to configure the selected file.
 */
function ombumedia_page_file_configure($file) {
  if (!user_access('administer files') && (file_uri_scheme($file->uri) === 'private')) {
    return MENU_ACCESS_DENIED;
  }

  drupal_add_library('ombumedia', 'ombumedia');

  $form = drupal_get_form('ombumedia_file_entity_configure', $file->fid);

  return drupal_render($form);
}

/**
 * Page callback for a field to get a file preview.
 */
function ombumedia_page_file_field_preview($file, $view_mode = 'ombumedia_preview') {
  $output = array(
    '#prefix' => '<div class="ombumedia-file-field-preview">',
    '#suffix' => '</div>',
  );
  if ($file->type == 'document') {
    $preview = file_view_file($file, $view_mode);
    $preview['#prefix'] = '<div>';
    $preview['#suffix'] = '</div>';
    $output['preview'] = array(
      'preview' => $preview,
      'full' => file_view_file($file, 'full'),
    );
  }
  else {
    $output['preview'] = file_view_file($file, $view_mode);
  }

  return array('content' => $output);
}

/**
 * Page callback to test popping up a media modal.
 */
function ombumedia_page_test() {
  $path = drupal_get_path('module', 'ombumedia');
  drupal_add_library('ombumedia', 'ombumedia');
  drupal_add_js($path . '/js/ombumedia-test.js');

  $test_selection = <<<HEREDOC
<ul>
  <li><a href="#" class="select-media-all">Select Media</a></li>
  <li><a href="#" class="select-media-image">Select Image (view_modes: {image: ['preview']})</a></li>
  <li><a href="#" class="select-media-image-video">Select Image or Video</a></li>
  <li><a href="#" class="select-media-document">Select Document</a></li>
  <li><a href="#" class="select-media-video">Configure Video (fid: 35, view_mode: 'preview')</a></li>
  <li><a href="#" class="select-media-image-wysiwyg">Select Image for WYSIWYG format</a></li>
</ul>
<dl>
  <dt>FID</dt>
  <dd class="fid"></dd>
  <dt>View Mode</dt>
  <dd class="view-mode"></dd>
</dl>
HEREDOC;

  $form = drupal_get_form('ombumedia_page_test_form');

  $wysiwyg_test = variable_get('ombumedia_wysiwyg_test', array());
  $wysiwyg_test['format'] = isset($wysiwyg_test['format']) ? $wysiwyg_test['format'] : 'default';
  $wysiwyg_test['value'] = isset($wysiwyg_test['value']) ? $wysiwyg_test['value'] : '';

  return array(
    'test' => array('#markup' => $test_selection),
    'form' => $form,
    'wysiwyg' => array(
      '#markup' => check_markup($wysiwyg_test['value'], $wysiwyg_test['format'], '', FALSE),
    ),
  );
}

function ombumedia_page_test_form($form, &$form_state) {
  $rendered_wysiwyg = variable_get('ombumedia_wysiwyg_test', array());

  $form['ombumedia_wysiwyg_test'] = array(
    '#title' => t('WYSIWYG Integration'),
    '#type' => 'text_format',
    '#format' => isset($rendered_wysiwyg['format']) ? $rendered_wysiwyg['format'] : 'default',
    '#default_value' => isset($rendered_wysiwyg['value']) ? $rendered_wysiwyg['value'] : '',
  );

  $form = system_settings_form($form);

  $form['actions']['submit']['#value'] = t('Render HTML');

  return $form;
}

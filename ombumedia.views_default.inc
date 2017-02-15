<?php
/**
 * @file
 * ombumedia.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function ombumedia_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'ombumedia';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'file_managed';
  $view->human_name = 'ombumedia';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Manage Media';
  $handler->display->display_options['use_ajax'] = TRUE;
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'perm';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['query']['options']['distinct'] = TRUE;
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['exposed_form']['options']['autosubmit'] = TRUE;
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['pager']['options']['items_per_page'] = '50';
  $handler->display->display_options['pager']['options']['offset'] = '0';
  $handler->display->display_options['pager']['options']['id'] = '0';
  $handler->display->display_options['pager']['options']['quantity'] = '9';
  $handler->display->display_options['style_plugin'] = 'default';
  $handler->display->display_options['row_plugin'] = 'fields';
  /* Header: Global: Result summary */
  $handler->display->display_options['header']['result']['id'] = 'result';
  $handler->display->display_options['header']['result']['table'] = 'views';
  $handler->display->display_options['header']['result']['field'] = 'result';
  $handler->display->display_options['header']['result']['content'] = '<span class="result-summary">Displaying @start - @end of @total</span>';
  /* Footer: Global: Result summary */
  $handler->display->display_options['footer']['result']['id'] = 'result';
  $handler->display->display_options['footer']['result']['table'] = 'views';
  $handler->display->display_options['footer']['result']['field'] = 'result';
  $handler->display->display_options['footer']['result']['content'] = '<span class="result-summary">Displaying @start - @end of @total</span>';
  /* No results behavior: Global: Unfiltered text */
  $handler->display->display_options['empty']['area_text_custom']['id'] = 'area_text_custom';
  $handler->display->display_options['empty']['area_text_custom']['table'] = 'views';
  $handler->display->display_options['empty']['area_text_custom']['field'] = 'area_text_custom';
  $handler->display->display_options['empty']['area_text_custom']['empty'] = TRUE;
  $handler->display->display_options['empty']['area_text_custom']['content'] = '<em>No matching media<em>';
  /* Relationship: File: Entity translation: translations */
  $handler->display->display_options['relationships']['entity_translations']['id'] = 'entity_translations';
  $handler->display->display_options['relationships']['entity_translations']['table'] = 'file_managed';
  $handler->display->display_options['relationships']['entity_translations']['field'] = 'entity_translations';
  /* Field: File: Rendered */
  $handler->display->display_options['fields']['rendered']['id'] = 'rendered';
  $handler->display->display_options['fields']['rendered']['table'] = 'file_managed';
  $handler->display->display_options['fields']['rendered']['field'] = 'rendered';
  $handler->display->display_options['fields']['rendered']['label'] = '';
  $handler->display->display_options['fields']['rendered']['element_label_colon'] = FALSE;
  $handler->display->display_options['fields']['rendered']['file_view_mode'] = 'ombumedia_grid';
  /* Field: File: File ID */
  $handler->display->display_options['fields']['fid']['id'] = 'fid';
  $handler->display->display_options['fields']['fid']['table'] = 'file_managed';
  $handler->display->display_options['fields']['fid']['field'] = 'fid';
  $handler->display->display_options['fields']['fid']['label'] = '';
  $handler->display->display_options['fields']['fid']['exclude'] = TRUE;
  $handler->display->display_options['fields']['fid']['element_label_colon'] = FALSE;
  /* Field: File: Name */
  $handler->display->display_options['fields']['filename']['id'] = 'filename';
  $handler->display->display_options['fields']['filename']['table'] = 'file_managed';
  $handler->display->display_options['fields']['filename']['field'] = 'filename';
  $handler->display->display_options['fields']['filename']['label'] = '';
  $handler->display->display_options['fields']['filename']['element_label_colon'] = FALSE;
  $handler->display->display_options['fields']['filename']['link_to_file'] = FALSE;
  /* Field: File: Type */
  $handler->display->display_options['fields']['type']['id'] = 'type';
  $handler->display->display_options['fields']['type']['table'] = 'file_managed';
  $handler->display->display_options['fields']['type']['field'] = 'type';
  $handler->display->display_options['fields']['type']['label'] = '';
  $handler->display->display_options['fields']['type']['element_label_colon'] = FALSE;
  $handler->display->display_options['fields']['type']['machine_name'] = 0;
  /* Sort criterion: File: Upload date */
  $handler->display->display_options['sorts']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['sorts']['timestamp']['table'] = 'file_managed';
  $handler->display->display_options['sorts']['timestamp']['field'] = 'timestamp';
  $handler->display->display_options['sorts']['timestamp']['order'] = 'DESC';
  $handler->display->display_options['filter_groups']['groups'] = array(
    1 => 'AND',
    3 => 'AND',
    2 => 'OR',
  );
  /* Filter criterion: File: Name */
  $handler->display->display_options['filters']['filename']['id'] = 'filename';
  $handler->display->display_options['filters']['filename']['table'] = 'file_managed';
  $handler->display->display_options['filters']['filename']['field'] = 'filename';
  $handler->display->display_options['filters']['filename']['operator'] = 'contains';
  $handler->display->display_options['filters']['filename']['group'] = 1;
  $handler->display->display_options['filters']['filename']['exposed'] = TRUE;
  $handler->display->display_options['filters']['filename']['expose']['operator_id'] = 'filename_op';
  $handler->display->display_options['filters']['filename']['expose']['label'] = 'Name';
  $handler->display->display_options['filters']['filename']['expose']['operator'] = 'filename_op';
  $handler->display->display_options['filters']['filename']['expose']['identifier'] = 'filename';
  $handler->display->display_options['filters']['filename']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: File: Type */
  $handler->display->display_options['filters']['type']['id'] = 'type';
  $handler->display->display_options['filters']['type']['table'] = 'file_managed';
  $handler->display->display_options['filters']['type']['field'] = 'type';
  $handler->display->display_options['filters']['type']['group'] = 2;
  $handler->display->display_options['filters']['type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['operator_id'] = 'type_op';
  $handler->display->display_options['filters']['type']['expose']['label'] = 'Type';
  $handler->display->display_options['filters']['type']['expose']['operator'] = 'type_op';
  $handler->display->display_options['filters']['type']['expose']['identifier'] = 'types_filter';
  $handler->display->display_options['filters']['type']['expose']['multiple'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: File: Folder (field_media_folder) */
  $handler->display->display_options['filters']['field_media_folder_tid']['id'] = 'field_media_folder_tid';
  $handler->display->display_options['filters']['field_media_folder_tid']['table'] = 'field_data_field_media_folder';
  $handler->display->display_options['filters']['field_media_folder_tid']['field'] = 'field_media_folder_tid';
  $handler->display->display_options['filters']['field_media_folder_tid']['group'] = 3;
  $handler->display->display_options['filters']['field_media_folder_tid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_media_folder_tid']['expose']['operator_id'] = 'field_media_folder_tid_op';
  $handler->display->display_options['filters']['field_media_folder_tid']['expose']['label'] = 'Folder';
  $handler->display->display_options['filters']['field_media_folder_tid']['expose']['operator'] = 'field_media_folder_tid_op';
  $handler->display->display_options['filters']['field_media_folder_tid']['expose']['identifier'] = 'field_media_folder_tid';
  $handler->display->display_options['filters']['field_media_folder_tid']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  $handler->display->display_options['filters']['field_media_folder_tid']['type'] = 'select';
  $handler->display->display_options['filters']['field_media_folder_tid']['vocabulary'] = 'media_folders';
  $handler->display->display_options['filters']['field_media_folder_tid']['hierarchy'] = 1;
  /* Filter criterion: File: Tags (field_media_tags) */
  $handler->display->display_options['filters']['field_media_tags_tid']['id'] = 'field_media_tags_tid';
  $handler->display->display_options['filters']['field_media_tags_tid']['table'] = 'field_data_field_media_tags';
  $handler->display->display_options['filters']['field_media_tags_tid']['field'] = 'field_media_tags_tid';
  $handler->display->display_options['filters']['field_media_tags_tid']['value'] = '';
  $handler->display->display_options['filters']['field_media_tags_tid']['group'] = 3;
  $handler->display->display_options['filters']['field_media_tags_tid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_media_tags_tid']['expose']['operator_id'] = 'field_media_tags_tid_op';
  $handler->display->display_options['filters']['field_media_tags_tid']['expose']['label'] = 'Tags';
  $handler->display->display_options['filters']['field_media_tags_tid']['expose']['operator'] = 'field_media_tags_tid_op';
  $handler->display->display_options['filters']['field_media_tags_tid']['expose']['identifier'] = 'field_media_tags_tid';
  $handler->display->display_options['filters']['field_media_tags_tid']['expose']['multiple'] = TRUE;
  $handler->display->display_options['filters']['field_media_tags_tid']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  $handler->display->display_options['filters']['field_media_tags_tid']['reduce_duplicates'] = TRUE;
  $handler->display->display_options['filters']['field_media_tags_tid']['vocabulary'] = 'media_tags';
  /* Filter criterion: Entity translation: Locale */
  $handler->display->display_options['filters']['language']['id'] = 'language';
  $handler->display->display_options['filters']['language']['table'] = 'entity_translation';
  $handler->display->display_options['filters']['language']['field'] = 'language';
  $handler->display->display_options['filters']['language']['relationship'] = 'entity_translations';
  $handler->display->display_options['filters']['language']['exposed'] = TRUE;
  $handler->display->display_options['filters']['language']['expose']['operator_id'] = 'language_op';
  $handler->display->display_options['filters']['language']['expose']['label'] = 'Locale';
  $handler->display->display_options['filters']['language']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['language']['expose']['operator'] = 'language_op';
  $handler->display->display_options['filters']['language']['expose']['identifier'] = 'language';
  $handler->display->display_options['filters']['language']['expose']['multiple'] = TRUE;
  $handler->display->display_options['filters']['language']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Entity translation: Source */
  $handler->display->display_options['filters']['source']['id'] = 'source';
  $handler->display->display_options['filters']['source']['table'] = 'entity_translation';
  $handler->display->display_options['filters']['source']['field'] = 'source';
  $handler->display->display_options['filters']['source']['relationship'] = 'entity_translations';
  $handler->display->display_options['filters']['source']['exposed'] = TRUE;
  $handler->display->display_options['filters']['source']['expose']['operator_id'] = 'source_op';
  $handler->display->display_options['filters']['source']['expose']['label'] = 'Source';
  $handler->display->display_options['filters']['source']['expose']['operator'] = 'source_op';
  $handler->display->display_options['filters']['source']['expose']['identifier'] = 'source';
  $handler->display->display_options['filters']['source']['is_grouped'] = TRUE;
  $handler->display->display_options['filters']['source']['group_info']['label'] = 'Translation';
  $handler->display->display_options['filters']['source']['group_info']['identifier'] = 'source';
  $handler->display->display_options['filters']['source']['group_info']['group_items'] = array(
    1 => array(
      'title' => 'Source',
      'operator' => 'empty',
      'value' => array(
        'all' => 0,
        '***CURRENT_LANGUAGE***' => 0,
        '***DEFAULT_LANGUAGE***' => 0,
        'und' => 0,
        'en' => 0,
        'en-uk' => 0,
      ),
    ),
    2 => array(
      'title' => 'Translation',
      'operator' => 'not empty',
      'value' => array(
        'all' => 0,
        '***CURRENT_LANGUAGE***' => 0,
        '***DEFAULT_LANGUAGE***' => 0,
        'und' => 0,
        'en' => 0,
        'en-uk' => 0,
      ),
    ),
  );

  /* Display: Manage Media */
  $handler = $view->new_display('embed', 'Manage Media', 'manage_media');

  /* Display: Select Media */
  $handler = $view->new_display('embed', 'Select Media', 'select_media');
  $translatables['ombumedia'] = array(
    t('Master'),
    t('Manage Media'),
    t('more'),
    t('Apply'),
    t('Reset'),
    t('Sort by'),
    t('Asc'),
    t('Desc'),
    t('Items per page'),
    t('- All -'),
    t('Offset'),
    t('« first'),
    t('‹ previous'),
    t('next ›'),
    t('last »'),
    t('<span class="result-summary">Displaying @start - @end of @total</span>'),
    t('<em>No matching media<em>'),
    t('Translations'),
    t('Name'),
    t('Type'),
    t('Folder'),
    t('Tags'),
    t('Locale'),
    t('Source'),
    t('Translation'),
    t('Select Media'),
  );
  $export['ombumedia'] = $view;

  return $export;
}

<?php

?>
<div class="ombumedia-tabset ui-tabs">
  <div class="top">
    <ul class="ui-tabs-nav">
      <?php if ($library): ?>
        <li><a href="#library"><?php print t('Library'); ?></a></li>
      <?php endif; ?>
      <?php if ($add): ?>
        <li><a href="#add"><?php print t('Add'); ?></a></li>
      <?php endif; ?>
    </ul>
  </div>

  <?php if ($library): ?>
    <div id="library" class="ui-tabs-panel"><?php print $library; ?></div>
  <?php endif; ?>

  <?php if ($add): ?>
    <div id="add" class="ui-tabs-panel"><?php print $add; ?></div>
  <?php endif; ?>

</div>

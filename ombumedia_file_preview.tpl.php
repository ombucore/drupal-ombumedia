<?php

?>
<?php if (isset($back_link)): ?>
  <?php print $back_link; ?>
<?php endif; ?>
<h1><?php print $title; ?></h1>
<?php print render($preview); ?>
<hr>
<?php print render($usage); ?>

<?php use yii\helpers\Html; ?>

<h3><?php echo Html::a(Html::img('/img/new.png').'Новая схема', ['schema/new']); ?></h3>

<br/>
<h3>Схемы сетей</h3>
<?php foreach($schemas as $schema): ?>
	<?php echo Html::a($schema->name ? $schema->name.' ('.number_format($schema->id, 0, ".", " ").')' : 'Схема №'.$schema->id, ['schema/edit', 'id' => $schema->id]); ?>
	<?php echo Html::a(Html::img("/img/block_close.png"), null, ['href' => 'javascript:void(0);', 'data-schemaid' => $schema->id, 'class' => 'delete_schema']); ?>
	<br/>
	
<?php endforeach; ?>
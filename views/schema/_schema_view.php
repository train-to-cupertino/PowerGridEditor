<?php use yii\helpers\Html; ?>
<?php 
	// Папка
	if ($model->is_folder) {
		echo Html::a(
			$model->name ? 
			$model->name.' ('.number_format($model->id, 0, ".", " ").')' : 
			'Папка №'.$model->id, ['schema/list', 'folder_id' => $model->id]
		).'<br/>';
		
		echo Html::tag('div', 
			Html::a(Html::img($model->img_preview ? $model->img_preview : "/img/folder_128.png"), ['schema/list', 'folder_id' => $model->id]), 
		['style' => 'width: 128px; height: 128px;']);
		
		echo Html::img('/img/update_time_MODIFIED.svg', ['style' => 'width: 16px; height: 16px;', 'title' => 'Время последнего изменения'])." ".date('H:i d.m.y', $model->updated_at)."<br/>";
		echo Html::a(Html::img("/img/trash.svg", ['style' => 'width: 16px; height: 16px;', 'title' => 'Удалить папку'])." Удалить", null, ['href' => 'javascript:void(0);', 'data-schemaid' => $model->id, 'class' => 'delete_folder']);		
	// Файл схемы
	} else {
		echo Html::a(
			$model->name ? 
			$model->name.' ('.number_format($model->id, 0, ".", " ").')' : 
			'Схема №'.$model->id, ['schema/edit', 'id' => $model->id]
		).'<br/>';
		
		echo Html::tag('div', 
			Html::a(Html::img($model->img_preview ? $model->img_preview : "/img/schema_icon.png"/*, ['style' => 'width: 128px; height: 128px;']*/), ['schema/edit', 'id' => $model->id]), 
		['style' => 'width: 128px; height: 128px;']);
		
		echo Html::img('/img/update_time_MODIFIED.svg', ['style' => 'width: 16px; height: 16px;', 'title' => 'Время последнего изменения'])." ".date('H:i d.m.y', $model->updated_at)."<br/>";
		echo Html::a(Html::img("/img/trash.svg", ['style' => 'width: 16px; height: 16px;', 'title' => 'Удалить схему'])." Удалить", null, ['href' => 'javascript:void(0);', 'data-schemaid' => $model->id, 'class' => 'delete_schema']);		
	}
?>

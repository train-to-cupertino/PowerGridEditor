<?php 
	use yii\helpers\Html; 
	use yii\widgets\ListView; 
	use app\models\Pgschema;
?>

<h3><?php echo Html::a(Html::img('/img/new.png').'Новая схема', ['schema/new']); ?></h3>
<br/>
<h3>Схемы сетей</h3>


<?php 
if (($folder_id = Yii::$app->request->get('folder_id')) != 0) {
	$this_folder = Pgschema::find()->where('id = :id AND user_id = '.Yii::$app->user->id.' AND is_deleted = 0 AND is_folder = 1', [':id' => $folder_id])->limit(1)->one();
	if ($this_folder) {
		$parent_folder = Pgschema::find()->where('id = :id AND user_id = '.Yii::$app->user->id.' AND is_deleted = 0 AND is_folder = 1', [':id' => $this_folder->folder_id])->limit(1)->one();
		if ($parent_folder) {
			$parent_folder_id = $parent_folder->id;	
		} else {
			$parent_folder_id = 0;
		}
		
		echo Html::a('↑ Наверх', ['schema/list', 'folder_id' => $parent_folder_id]);
	}
}

echo ListView::widget([
    'dataProvider' => $dataProvider,
	'itemView' => '_schema_view',
    'pager' => [
        'lastPageLabel' => '>',
        'nextPageLabel' => '<',
		'options' => [ 'class' => 'pagination schema_list_pagination', ],
    ],

	'itemOptions' => [
		'tag' => 'div',
		'class' => 'schema_list_item',
	],				
]);
?>
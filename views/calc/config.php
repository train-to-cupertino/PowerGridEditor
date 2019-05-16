<?php use yii\helpers\Html;?>
<h1><?php echo 'Параметры расчета схемы #'.$schema->id;?></h1>

<?php echo Html::beginForm(['calc/do', 'id' => $schema->id], 'get'/*, ['enctype' => 'multipart/form-data']*/); ?>
<?php //echo Html::hiddenInput('schema_id', $schema->id, ['class' => '']); ?>
<table>
	<tr>
		<td>Напряжение источника, фаза A, Вольт: </td>
		<td><?php echo Html::textInput('voltage_a', Yii::$app->calc::DEFAULT_PHASE_A_VOLTAGE, ['class' => '']); ?></td>
	</tr>
	<tr>
		<td>Напряжение источника, фаза B, Вольт: </td>
		<td><?php echo Html::textInput('voltage_b', Yii::$app->calc::DEFAULT_PHASE_B_VOLTAGE, ['class' => '']); ?></td>
	</tr>
	<tr>
		<td>Напряжение источника, фаза C, Вольт: </td>
		<td><?php echo Html::textInput('voltage_c', Yii::$app->calc::DEFAULT_PHASE_C_VOLTAGE, ['class' => '']); ?></td>
	</tr>
	<tr>
		<td>Общее изменение нагрузки, о.е.: </td>
		<td><?php echo Html::textInput('total_load_change', Yii::$app->calc::DEFAULT_TOTAL_LOAD_CHANGE, ['class' => '']); ?></td>
	</tr>
	<tr>
		<td>Общее изменение коэф. заполнения, о.е.: </td>
		<td><?php echo Html::textInput('total_kzap_change', Yii::$app->calc::DEFAULT_TOTAL_KZAP_CHANGE, ['class' => '']); ?></td>
	<tr>
	</tr>
		<td>Количество дней для расчета: </td>
		<td><?php echo Html::textInput('total_days', Yii::$app->calc::DEFAULT_TOTAL_DAYS, ['class' => '']); ?></td>
	</tr>
	<tr colspan="2">
		<td><?php echo Html::submitButton('Выполнить расчет', ['class' => 'do_calc']); ?></td>
	</tr>
</table>
<?php echo Html::endForm() ?>
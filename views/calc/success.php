<?php use yii\helpers\Html; ?>

<h1>Результаты расчета схемы #<?php echo $schema->id; ?></h1>

<?php echo Html::a('Редактировать схему', ['schema/edit', 'id' => $schema->id], ['style' => 'margin-right: 20px;']); ?> 
<?php 
// Ссылка для сохранения в Excel
echo Html::a('Сохранить результаты в Excel', ['calc/exportexcel'], [
	'style' => 'margin-right: 20px;', 
    'data' => [
        'method' => 'post',
        'params' => [
            'calc_data' => $result_json,
        ],
    ],
]);
?>
<br/><br/>
<?php if(
		(isset($j_res['calc_data'])) && 
		(count($j_res['calc_data']) > 0)
	): ?>
<div class="view_only_app">
	<div class="view_only_tools">
		<div class="scale_container">
			Масштаб:&nbsp;
			<?php echo Html::dropDownList('schema_scale', 5, [10, 15, 25, 50, 75, 100, 125, 150, 200, 300], ['id' => 'schema_scale']); ?>%<br/>
		</div>
		<div style="padding: 0 0 0 10px;">
			Показать: 
			<input type="checkbox" checked="checked" name="show_loses" id="cb_show_loses">Потери 
			<input type="checkbox" checked="checked" name="show_voltages" id="cb_show_voltages">Падение напряжения 
			<input type="checkbox" checked="checked" name="show_amperages" id="cb_show_amperages">Токи
		</div>		
	</div>
	<div id="outer_container">
		<div id="svg_container" class="svg_container">
			
		</div>
	</div>
	<div id="param_container" style="overflow-y: scroll; border: 1px solid #808080; padding: 5px; background-color: #fafafa !important;">
		<!-- Некоторые важные параметры сети -->
		<div class="panel panel-default">
			<div class="panel-body">
				<b>Опора с мин. напряжением:</b> 
				<?php echo Html::tag(
					'span', 
					$j_res['calc_data']['powergrid']['minimumVoltageNodeIndex'], 
					['onclick' => 'pgApp.pg.findElemById("'.$j_res['calc_data']['powergrid']['minimumVoltageNodeIndex'].'").elem.accent();', 'class' => 'elem_link']); 
				?>
			</div>
		</div>
		<!-- Исходные данные линий -->
		<div class="panel panel-default">
			<div class="panel-heading"><b>Параметры линий</b></div>
			<table class="table table-bordered table-condensed table-hover">	
				<tr>
					<td>№ п/п</td>
					<td>Длина, м</td>
					<td>Сечение, мм²</td>
					<td>Сечение нейтрали, мм²</td>
				</tr>			
				<?php //echo "<pre>".print_r(json_decode($schema->json_code, 1), 1)."</pre>"; ?>
				<?php $row = 0; ?>
				<?php foreach(json_decode($schema->json_code, 1)['lines'] as $line_id => $line_data):?>
				<tr>
					<td><?php echo Html::tag('span', ++$row, ['onclick' => 'pgApp.pg.findElemById("'.$line_id.'").elem.accent();', 'class' => 'elem_link']) ; ?></td>
					<td><?php echo $line_data['length']; ?></td>
					<td><?php echo $line_data['intersection']; ?></td>
					<td><?php echo $line_data['intersectionNeutral']; ?></td>
				</tr>
				<?php endforeach; ?>
			</table>
		</div>
		<!-- Исходные данные нагрузок -->
		<div class="panel panel-default">
			<div class="panel-heading"><b>Параметры нагрузок</b></div>
			<table class="table table-bordered table-condensed table-hover">	
				<tr>
					<td>№ п/п</td>
					<td>Длина спуска, м</td>
					<td>Сечение, мм²</td>
					<td>Мощность, кВт</td>
				</tr>			
				<?php $row = 0; ?>
				<?php foreach(json_decode($schema->json_code, 1)['loads'] as $load_id => $load_data):?>
				<tr>
					<td><?php echo Html::tag('span', ++$row, ['onclick' => 'pgApp.pg.findElemById("'.$load_id.'").elem.accent();', 'class' => 'elem_link']) ; ?></td>
					<td><?php echo $load_data['length']; ?></td>
					<td><?php echo $load_data['intersection']; ?></td>
					<td><?php echo $load_data['power']; ?></td>
				</tr>
				<?php endforeach; ?>
			</table>
		</div>		
	</div>
</div>	
	
<div class="panel panel-default">
	<div class="panel-heading"><b>Общие данные</b></div>
	
	<table class="table table-bordered table-condensed table-hover">
			<tr>
				<td>Наименование параметра</td>
				<td>Значение параметра</td>
			</tr>
		<?php foreach($j_res['calc_data']['powergrid'] as $param_name => $param_value): ?>
			<tr>
				<td><?php echo Yii::$app->calc::getParamProp($param_name, 'translate')[Yii::$app->language]; ?></td>
				<td><?php echo $param_value; ?></td>
			</tr>
		<?php endforeach; ?>
	</table>
</div>	
<br/>
<div class="panel panel-default">
	<div class="panel-heading"><b>Линии</b></div>

	<table class="table table-bordered table-condensed table-hover">
		<?php foreach($j_res['calc_data']['lines'] as $line_name => $line_data): ?>
			<?php if ($line_name != "line_source"): ?>
				<tr style="background-color: #f5f5f5;">
					<td><?php echo Html::tag('span', $line_name, ['onclick' => 'window.scrollTo(0, $("#outer_container").offset().top); pgApp.pg.findElemById("'.$line_name.'").elem.accent();', 'class' => 'elem_link']) ; ?></td>
					<td>Напряжение, В</td>
					<td>Ток, А</td>
					<td>Потери, кВт</td>
				</tr>
				<tr>
					<td>Фаза А</td>
					<td><?php echo $line_data[0]['voltage']; ?></td>
					<td><?php echo $line_data[0]['amperage']; ?></td>
					<td><?php echo $line_data[0]['loses']; ?></td>
				</tr>
				<tr>
					<td>Фаза B</td>
					<td><?php echo $line_data[1]['voltage']; ?></td>
					<td><?php echo $line_data[1]['amperage']; ?></td>
					<td><?php echo $line_data[1]['loses']; ?></td>
				</tr>
				<tr>
					<td>Фаза C</td>
					<td><?php echo $line_data[2]['voltage']; ?></td>
					<td><?php echo $line_data[2]['amperage']; ?></td>
					<td><?php echo $line_data[2]['loses']; ?></td>
				</tr>
				<tr style="border-bottom-width: 2px;">
					<td>Нейтраль</td>
					<td><?php echo $line_data[3]['voltage']; ?></td>
					<td><?php echo $line_data[3]['amperage']; ?></td>
					<td><?php echo $line_data[3]['loses']; ?></td>
				</tr>				
			<?php endif; ?>
		<?php endforeach; ?>
	</table>		
</div>
<br/>
<div class="panel panel-default">
	<div class="panel-heading"><b>Нагрузки</b></div>

	<table class="table table-bordered table-condensed table-hover">
		<tr style="background-color: #f5f5f5;">
			<td>Нагрузка</td>
			<td>Напряжение, В</td>
			<td>Ток, А</td>
		</tr>	
		<?php foreach($j_res['calc_data']['loads'] as $load_name => $load_data): ?>
		<tr>
			<?php if ($schema_json && $schema_json['loads'] && $schema_json['loads'][$load_name]) {
				$load_descr = $schema_json['loads'][$load_name]['placement'];
			}; ?>
			<td><?php echo Html::tag('span', $load_name . (isset($load_descr) && $load_descr ? ' ('.$load_descr.') ' : ''), ['onclick' => 'window.scrollTo(0, $("#outer_container").offset().top); pgApp.pg.findElemById("'.$load_name.'").elem.accent();', 'class' => 'elem_link']) ; ?></td>
			<td><?php echo $load_data['voltage']; ?></td>
			<td><?php echo $load_data['amperage']; ?></td>
		</tr>				
		<?php endforeach; ?>
	</table>		
</div>

<?php endif; ?>
<?php use yii\helpers\Html; ?>

<?php //echo $schema->json_code; ?>
<div>
	<input type="text" name="schema_name" class="schema_name"/>
</div>

<div class="panel_tools">
	<?php 
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-save']), ['class' => 'tool_button menu_button', 'id' => 'action_save', 'title' => 'Сохранить']);
		
		echo Html::tag('div', '', ['class' => 'divider_tools']);
		
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-pointer']), ['class' => 'tool_button menu_button tool_selected', 'id' => 'tool_pointer', 'title' => 'Указатель']); 
		
		echo Html::tag('div', '', ['class' => 'divider_tools']);
		
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-node']), ['class' => 'tool_button menu_button', 'id' => 'tool_node', 'title' => 'Узел']); 
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-line']), ['class' => 'tool_button menu_button', 'id' => 'tool_line', 'title' => 'Линия']); 
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-load']), ['class' => 'tool_button menu_button', 'id' => 'tool_load', 'title' => 'Нагрузка']); 
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-source']), ['class' => 'tool_button menu_button', 'id' => 'tool_source', 'title' => 'Источник']);
		
		echo Html::tag('div', '', ['class' => 'divider_tools']);
		
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-rect']), ['class' => 'tool_button menu_button', 'id' => 'tool_rect', 'title' => 'Прямоугольник']);
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-ellipse']), ['class' => 'tool_button menu_button', 'id' => 'tool_ellipse', 'title' => 'Эллипс']);
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-label']), ['class' => 'tool_button menu_button', 'id' => 'tool_label', 'title' => 'Текст']);
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-polyline']), ['class' => 'tool_button menu_button', 'id' => 'tool_polyline', 'title' => 'Ломаная']);
		
		echo Html::tag('div', '', ['class' => 'divider_tools']);
		
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-undo']), ['class' => 'menu_button undo', 'id' => 'undo', 'title' => 'Отменить']);
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-redo']), ['class' => 'menu_button redo', 'id' => 'redo', 'title' => 'Повторить']);		
		
		echo Html::tag('div', '', ['class' => 'divider_tools']);
		
		echo Html::tag('div', 
				Html::tag('div', 
					Html::img('/img/editor_tools/scale.png', ['style' => 'margin: 0 4px 0 0;', 'title' => 'Масштаб']).
					Html::dropDownList('schema_scale', 5, [10, 15, 25, 50, 75, 100, 125, 150, 200, 300], ['id' => 'schema_scale', 'title' => 'Масштаб'])." %", 
				[]), 
			['class' => 'scale_container']);
			
		echo Html::tag('div', '', ['class' => 'divider_tools']);
		
		echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-calc']), ['class' => 'tool_button menu_button go_calc', 'title' => 'Расчет']);

        echo Html::button(Html::tag('div', '', ['class' => 'tool_icon icon-export-visio']), ['class' => 'tool_button menu_button export_visio', 'title' => 'Экспорт в Visio']);
	?>
</div>

<div>
	<div id="outer_container">
		<div id="svg_container" class="svg_container">
			
		</div>
	</div>
	<div id="param_container"></div>
</div>

<!-- Modal Calc Errors START -->
<div class="modal fade" id="modalCalcErrors" tabindex="-1" role="dialog" aria-labelledby="modalCalcErrorsLabel">
	<div class="modal-dialog modal-lg" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="modalCalcErrorsLabel">Ошибки исходных данных</h4>
			</div>
			<div class="modal-body" id="modalCalcErrorsBody">
				Ошибки отсутствуют
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>
			</div>
		</div>
	</div>
</div>
<!-- Modal Calc Errors END -->
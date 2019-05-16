<h1>Редактирование схемы #<?php echo $schema->id; ?></h1><br/>
<a href="javascript:void(0);" class="go_calc" style="display: inline-block; margin: 0 0 20px 0;">Расчет</a><br/>

<div>
	<input type="button" value="POINTER" id="tool_pointer" class="tool_button tool_selected"/>
	<input type="button" value="NODE" id="tool_node" class="tool_button"/>
	<input type="button" value="LINE" id="tool_line" class="tool_button"/>
	<input type="button" value="LOAD" id="tool_load" class="tool_button"/>
	<input type="button" value="SOURCE" id="tool_source" class="tool_button"/>
</div>
<div>
	<input type="button" value="RECT" id="tool_rect" class="tool_button"/>
	<input type="button" value="ELLIPSE" id="tool_ellipse" class="tool_button"/>
	<input type="button" value="POLYGON" id="tool_polygon" class="tool_button"/>
	<input type="button" value="POLYLINE" id="tool_polyline" class="tool_button"/>
	<input type="button" value="SEGMENT" id="tool_segment" class="tool_button"/>
	<input type="button" value="SELECT_ALL" id="select_all" class="select_all"/>
</div>
<div>
	<input type="button" value="UNDO" id="undo" class="undo"/>
	<input type="button" value="REDO" id="redo" class="redo"/>
</div>
<div>
	<input type="button" value="CLEAR" id="clear" class="clear"/>
</div>
<div>
	<input type="button" value="SAVE" id="action_save"/>
	<input type="button" value="TEST" id="action_test"/>
</div>
<div>
	<input type="button" value="SELECTED NODES" id="selected_nodes"/>
</div>
<div>
	<div id="svg_container" class="svg_container">
		
	</div>
	<div id="param_container"></div>
</div>

<textarea id="pg_json" style="width:800px; height: 400px;"></textarea>
// ID Svg контейнера
var svg_container_id = "svg_container";
var param_container_id = "param_container";


function initDraw(drw)
{
	drw.clear();
	
	var pattern = drw.pattern(40, 40, function(add) {	
		add.line(40, 0, 40, 40).style({"stroke-dasharray": "7 3", stroke: "rgba(240,240,240, 1.0)", "stroke-width": "1px"})
		add.line(0, 40, 40, 40).style({"stroke-dasharray": "7 3", stroke: "rgba(240,240,240, 1.0)", "stroke-width": "1px"})	
		
	});	
	
	// Установка шаблона сетки в качестве заливки
	var grid = drw.rect("100%", "100%").attr({fill: pattern, stroke: "#000000"});
}

// Объект SVG контейнер
var draw = SVG(svg_container_id).size(800, 600);

initDraw(draw);

// 
var svg_container_offset = $("#" + svg_container_id).offset();



function initParamForm()
{
	fillParamForm("");
}


function fillParamForm(form_html)
{
	$("#" + param_container_id).html(form_html);
}



// // ---------------- КОНСТАНТЫ ----------------- \\

// Debug mode
var DEBUG_MODE = true;
//var DEBUG_MODE = false;

// Используется для предотвращения рисования после двойного клика по svg контейнеру
var DBLCLICK_FIX = false;

// Минимальные ширина и высота прямоугольника
var MIN_RECT_WIDTH = 2;
var MIN_RECT_HEIGHT = 2;

// Минимальные ширина и высота эллипса
var MIN_ELLIPSE_WIDTH = 2;
var MIN_ELLIPSE_HEIGHT = 2;

// \\ --------------------------------------------- //


// Электрическая сеть
var powergrid = new PowerGrid(draw);


var tmp_rect = undefined;
var tmp_ellipse = undefined;
var tmp_polygon = undefined;


// Нажатие кнопки мыши
draw.on('mousedown', function(e){
	// Выбранный инструмент
	switch(getCurrentTool())
	{
		// Прямоугольник
		case "tool_rect":
			if (tmp_rect != undefined)
			{
				tmp_rect.draw('cancel', e);
				tmp_rect.remove();
				break;
			}
			tmp_rect = draw.rect().attr({stroke: "#000000", fill: "#ffffff", class: "pgrectangle"}).draw(e);
		break;
		
		// Эллипс
		case "tool_ellipse":
			if (tmp_ellipse != undefined)
			{
				tmp_ellipse.draw('cancel', e);
				tmp_ellipse.remove();
				break;
			}
			tmp_ellipse = draw.ellipse().attr({stroke: "#000000", fill: "#ffffff", class: "pgellipse"}).draw(e);
                if(e.keyCode == 17){
					tmp_ellipse.attr({rx: tmp_ellipse.attr("ry")})
                }						
		break;		
		
		// Полигон
		case "tool_polygon":
			if (tmp_polygon != undefined)
			{
				
			}
			else
			{
				tmp_polygon = draw.polygon().draw().attr({stroke: "#000000", fill: "#ffffff", class: "pgpolygon"});
				
				tmp_polygon.on('drawstart', function(e){
					document.addEventListener('keydown', function(e){
						if (getCurrentTool() == "tool_polygon")
						{
							if(e.keyCode == 13)
							{
								tmp_polygon.draw('done');
							}
						}
					});
				});		

				tmp_polygon.on('drawstop', function(){
					// remove listener
					powergrid.addRectangle(tmp_polygon);
					tmp_polygon = undefined;
				});				
			}
		break;
	
		// Указатель
		case "tool_pointer":
			powergrid.deselectAll();
		break;		

	}
});


// Отпускание кнопки мыши
draw.on('mouseup', function(e){
	switch(getCurrentTool())
	{
		// Узел
		case "tool_node":
			var offset = $("#" + svg_container_id).offset();
			var tmp_node = new PGNode(powergrid);
			tmp_node.setParamVal('x', e.pageX - offset.left);
			tmp_node.setParamVal('y', e.pageY - offset.top);
			
			// Добавляем действие в менеджер действий
			powergrid.actionManager.addAction(
				function(){
					powergrid.deleteNode(tmp_node.getParamVal('name'));
				},
				function()
				{
					powergrid.addNode(tmp_node);
				},
				"Добавить узел",
				"Удалить узел"
			);
			
			// Непосредственно добавляем узел
			powergrid.addNode(tmp_node);
		break;	
		
		
		// Прямоугольник
		case "tool_rect":
			tmp_rect.draw('stop');
			
			powergrid.deselectAll();
			
			if (
				tmp_rect.attr("width") >= MIN_RECT_WIDTH && 
				tmp_rect.attr("height") >= MIN_RECT_HEIGHT
			)
			{
				powergrid.addRectangle(tmp_rect);
			}
			else
			{
				tmp_rect.draw('cancel', e);
			}
			
			tmp_rect = undefined;
			
		break;
		
		// Эллипс
		case "tool_ellipse":
			tmp_ellipse.draw('stop');
			
			powergrid.deselectAll();
			
			if (
				tmp_ellipse.attr("rx") >= MIN_ELLIPSE_WIDTH && 
				tmp_ellipse.attr("ry") >= MIN_ELLIPSE_HEIGHT
			)
			{
				powergrid.addEllipse(tmp_ellipse);
			}
			else
			{
				tmp_ellipse.draw('cancel', e);
			}
			
			tmp_ellipse = undefined;
			
		break;		
	}		
});


// Сохранить схему
function save_schema(save_button, onAjaxSuccess)
{
	var save = powergrid.getJSON();

	// Сохранение через ajax в БД
	$.post(
		"/schema/save",
		{
			json_code: save,
			schema_id: current_schema_id
		},
	  
		onAjaxSuccess
	);	
}

// Обработчик нажатия на кнопку сохранения
$("#action_save").click(function(){
	var _this = $(this);
	_this.prop('disabled', true);
	
	// Сохранение через ajax в БД
	save_schema(_this, function (data) {
			// Здесь мы получаем данные, отправленные сервером и выводим их на экран.
			alert(data);

			if (_this)
				_this.prop('disabled', false);
		});
});


// Обработчик нажатия на кнопку очистки сети
$("#clear").click(function(){
	powergrid = new PowerGrid(draw);
	initDraw(draw);
});


// Обработчик нажатия на кнопку отмены действия
$("#undo").click(function(){
	powergrid.actionManager.undoAction();
});


// Обработчик нажатия на кнопку повтора действия
$("#redo").click(function(){
	powergrid.actionManager.redoAction();
});
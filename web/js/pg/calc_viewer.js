// Создаем приложение
var pgApp = new PGApp(true);

// Опции просмотрщика результатов расчета
var calcViewerOptions = {
	// Сноски линий
	linesNote: {
		// Показывать потери
		showLoses: true,	
		// Показывать падения напряжений
		showVoltage: true,
		// Показывать токи
		showAmperage: true,
	}
};


// Применяет изменения опций сносок линий
function applyLinesNoteOptions() {
	for(var line_id in pgApp.pg.lines) {
		var line = pgApp.pg.lines[line_id];
		if (line.graphics) {
			line.graphics.exec("details", function(elem) {
				elem.attr({ text: line.getDetailsText() });
			});
		}
	}
}


$(window).keydown(function(evt) {
	if (evt.which == 17) { // ctrl
		pgApp.ctrlPressed = true;
	}
	
	if (evt.which == 18) { // alt
		pgApp.altPressed = true;
	}
}).keyup(function(evt) {
	if (evt.which == 17) { // ctrl
		pgApp.ctrlPressed = false;
	}
	
	if (evt.which == 18) { // alt
		pgApp.altPressed = false;
	}	
});


$(document).ready(function() {
	// Обработчик выпадающего списка "Масштаб"
	$("#schema_scale").change(function() {
		//var value = (this.value);
		var text = $(this).find("option:selected").text();
		
		if (!isNaN(parseFloat(text)) && isFinite(text))
			pgApp.pg.changeScale(text / 100);
		else
			pgApp.pg.changeScale(1.0);
	});
	
	// Toggle fullscreen
	$("#toggle_fullscreen").click(function() {
		var docSize = {x: document.documentElement.clientWidth, y: document.documentElement.clientHeight };
		var enabled = $(this).data('enabled');
		//var toggle = enabled == "0" ? "1" : "0";
	
		return; // !!!
		if (!enabled)
		{
			$("#outer_container").
			addClass('fullscreen_enabled'). // 
			css({
				width: 1140,
				height: docSize.y - 50
			});
			
			var _outer = $("#outer_container").remove();

			$('.container').prepend(_outer);
		}
		else
		{
			$("#outer_container").
			removeClass('fullscreen_enabled').
			css({
				width: 800,
				height: 600
			});			
			
			var _outer = $("#outer_container").remove();
			//$(document).body
			$('.view_only_app').prepend(_outer);			
			
		}
		
		//$(this).data('enabled', toggle);
		$(this).data('enabled', !enabled);
	});
	
	// Снятие/установка галочки "Показывать потери"
	$("#cb_show_loses").click(function() {
		calcViewerOptions.linesNote.showLoses = $(this).prop('checked');
		applyLinesNoteOptions();
	});
	
	// Снятие/установка галочки "Показывать падения напряжения"
	$("#cb_show_voltages").click(function() {
		calcViewerOptions.linesNote.showVoltage = $(this).prop('checked');
		applyLinesNoteOptions();
	});
	
	// Снятие/установка галочки "Показывать падения напряжения"
	$("#cb_show_amperages").click(function() {
		calcViewerOptions.linesNote.showAmperage = $(this).prop('checked');
		applyLinesNoteOptions();
	});	
	
	
	pgApp.calcRes = calc_res;
	
	// Выполнение свмого приложения:
	
	// Загрузка JSON кода схемы
	var json_string_to_load = JSON.stringify(current_schema_code);
	
	
	// Очищаем SVG контейнер
	$("#svg_container").empty();
	
	// Загрузка схемы по ее JSON коду
	var pg_to_load = PowerGrid.fromJSON(json_string_to_load, "svg_container", "param_container", pgApp.pg.view_only);
			
	// Если удалось загрузить схему, то загружаем ее в приложение
	if (pg_to_load != null)
	{
		pgApp.pg = pg_to_load;
		pgApp.pg.updateSize();
	}

	// Освобождаем временную схему
	pg_to_load = null;
	// =============================
	
	pgApp.calcRes = calc_res;
});
class PGCalcResManager {

	// *************************************
	// * Работа с результатами расчета линии
	// *************************************

	constructor() {
	
	}

	// Координаты отображения блока с результатами расчета
	getLineCalcResBlockPosition(line) {		
		// Вершины ломаной линии
		//var _points = line.getPolylinePoints();
		var _points = line.vertexes.getPolylinePoints();
		
		// Количество вершин ломаной
		var _length = _points.length;
		
		// Индекс центральной вершины ломаной
		var _indx = Math.floor((_length - 2) / 2);
		if (_indx < 0) 
			_indx = 0;
		
		// Если заданы точки с индексами _indx и (_indx + 1) ...
		if (_points[_indx])
			if (_points[_indx + 1])
				// ... возвращаем координаты центра этого отрезка
				return { 
					x : Math.abs((_points[_indx][0] + _points[_indx + 1][0]) / 2), 
					y : Math.abs((_points[_indx][1] + _points[_indx + 1][1]) / 2) 
				};
		
		// Иначе возвращаем координаты центра первого звена ломаной
		_indx = 0;
		
		if (_points[_indx])
			if (_points[_indx + 1])		
			return { 
				x : Math.abs((_points[_indx][0] + _points[_inDdx + 1][0]) / 2), 
				y : Math.abs((_points[_indx][1] + _points[_indx + 1][1]) / 2) 
			};
			
		// В случае ошибки возвращаем [0, 0]
		return {x: 0, y : 0};
	}
	
	// Содержимое блока с результатами расчета
	getLineCalcResBlockContent(line, lineRes) {
		// !!! Проверка на корректность объекта lineRes с полученными данными
		var enabled = false;
		
		for (var i = 0; i <= 3; i++) {
			if (!(
				(lineRes[i].voltage == 0 || 
				lineRes[i].voltage == 'NaN') &&	
				(lineRes[i].amperage == 0 || 
				lineRes[i].amperage == 'NaN') &&	
				(lineRes[i].loses == 0 || 
				lineRes[i].loses == 'NaN')
			))
				enabled = true;
		}
		
		if (!enabled)
			return "Отключена";
		
		var phase = ["A", "B", "C", "N"];
		
		var res = line.getParamVal('length') + ' м; ' + line.getParamVal('intersection') + "/" + line.getParamVal('intersectionNeutral') + " мм²" + 
		'<table class="calculation_result_table">' +
					"<tr><td></td><td>В</td><td>А</td><td>КВт</td></tr>";
		
		for(var i = 0; i <= 3; i++)
			res += "<tr>" + 
				"<td>" + phase[i] + "</td>" + 
				"<td>" + lineRes[i].voltage + "</td>" + 
				"<td>" + lineRes[i].amperage + "</td>" + 
				"<td>" + lineRes[i].loses + "</td>" + 				
			"</tr>";
				
		res += "</table>";
				
		return res;
	}
	
	// Блок с результатами расчета
	getLineCalcResBlock(line, calcRes) {
		var _pos = this.getLineCalcResBlockPosition(line);
		
		var block_close = $("<div>", {
			class: "block_close",
			on : {
				click: function(event) {
					$(this).parent().remove();
				}
			}
		});
		
		var block = $('<div>', {
			class: "pgline_res",
			css: {
				// Положение подсказки
				'left': (_pos.x * line.pg.scale) + 'px', 
				'top': (_pos.y * line.pg.scale) + 'px', 
			},
			id: "pgline_res_" + line.id,
			on: {
				click: function(event) {
					$(".pgline_res").each(function() { $(this).css("z-index", "1"); });
					$(".pgload_res").each(function() { $(this).css("z-index", "1"); });
					$(this).css("z-index", "9999");
				}
			}
		})
		.append(block_close)
		.append(this.getLineCalcResBlockContent(line, pgApp.calcRes.calc_data.lines[line.id]));
		
		return block;
	}	
	
	
	// =====================================
	
	
	// ****************************************
	// * Работа с результатами расчета нагрузки
	// ****************************************
	
	getLoadCalcResBlockPosition(load) {
		var x = load.getParamVal('x');
		var y = load.getParamVal('y');
		
		return {x: x, y: y};
	}
	
	
	// Содержимое блока с результатами расчета
	getLoadCalcResBlockContent(load, loadRes) {
		// !!! Проверка на корректность объекта loadRes с полученными данными
		var enabled = false;
		
		if (!(
			(loadRes.voltage == 0 || 
			loadRes.voltage == 'NaN') &&	
			(loadRes.amperage == 0 || 
			loadRes.amperage == 'NaN')
		))
				enabled = true;
		
		if (!enabled)
			return "Отключена";
		
		return load.getParamVal('length') + " м; " + 
			load.getParamVal('intersection') + " мм²; " + 
			load.getParamVal('power') + " КВт; " + 
			"cos(φ) = " + load.getParamVal('cosphi') + "; " + 
			"Kzap = " + load.getParamVal('kzap') + "  " + 
			"<div style='height:6px;'></div><b>" + loadRes.voltage + "B " + loadRes.amperage + "A</b>";
	}	
	
	
	// Блок с результатами расчета
	getLoadCalcResBlock(load, calcRes) {
		var _pos = this.getLoadCalcResBlockPosition(load);
		
		var block_close = $("<div>", {
			class: "block_close",
			on : {
				click: function(event) {
					$(this).parent().remove();
				}
			}
		});
		
		var block = $('<div>', {
			class: "pgload_res",
			css: {
				// Положение подсказки
				'left': (_pos.x * load.pg.scale) + 'px', 
				'top': (_pos.y * load.pg.scale) + 'px', 
			},
			id: "pgload_res_" + load.id,
			on: {
				click: function(event) {
					$(".pgline_res").each(function() { $(this).css("z-index", "1"); });
					$(".pgload_res").each(function() { $(this).css("z-index", "1"); });
					$(this).css("z-index", "9999");
				}
			}
		})
		.append(block_close)
		.append(this.getLoadCalcResBlockContent(load, pgApp.calcRes.calc_data.loads[load.id]));
		
		return block;
	}
	
}
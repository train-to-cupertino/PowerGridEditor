// Создаем приложение
var pgApp = new PGApp(false);


// Отслеживание нажатий Ctrl и Alt
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
	
	window.onunload = function() {
		pgApp.savePgToDb(function (data) {
			// Обновляем превьюшку
			$.post(
				"/schema/updatepreview",
				{
					id: current_schema_id,
					svg: pgApp.pg.paper.toSVG()
				}
			);
		});		
	}
	
	window.onbeforeunload = function() {
		//return "Данные не сохранены. Точно перейти?";
		pgApp.savePgToDb(function (data) {
			// Обновляем превьюшку
			$.post(
				"/schema/updatepreview",
				{
					id: current_schema_id,
					svg: pgApp.pg.paper.toSVG()
				},
				function(data) {
					//console.log(data);
				}
			);
		});	  
	};


	// Экспорт в Visio
	$(".export_visio").click(function() {
        var svgString = $("#svg_container").html();
        pgApp.downloadVisioFile(svgString);
	});


	// Нажатие кнопки "Test"
	$(".test").click(function() {
		return;
        var svgString = $("#svg_container").html();
        pgApp.downloadVisioFile(svgString);
		return; // !!!


		/*
        // Выключить на всех фигурах FreeTransfrom == Выполнить unSelect на всех элементах
        pgApp.pg.unselectAll();
        // !!! TODO:
        // Убрать вершины ломаных, после экспорта вернуть
		// В линиях
		for(let key in pgApp.pg.lines) {
			let elem = pgApp.pg.lines[key];

			// Если поле vertexes является экземпляром класса PolylineVertexes
			if ((elem.vertexes) && (elem.vertexes instanceof PolylineVertexes)) {
				// Если vertexes.set является массивом
				if ((elem.vertexes.set) && (Array.isArray(elem.vertexes.set))) {
					for(let vrtx_key in elem.vertexes.set) {
						let vrtx = elem.vertexes.set[vrtx_key];
						// Если вершина является экземпляром класса PolylineVertex
						if (vrtx instanceof PolylineVertex) {
							// Установить нулевые размеры
							vrtx.graphics.exec("body", function(el) {
                                el.attr({ r: 0 });
							});
						}
					}
				}
			}
		}
		// В ломаных
        for(let key in pgApp.pg.figures) {
            let pgelem = pgApp.pg.figures[key];

            // Если тип фигуры - ломаная, и элемент фигуры является экземпляром класса Polyline
            if (pgelem.type === "polyline" && pgelem.elem && pgelem.elem instanceof Polyline) {
                // Если поле vertexes является экземпляром класса PolylineVertexes
                if ((pgelem.elem.vertexes) && (pgelem.elem.vertexes instanceof PolylineVertexes)) {
                    // Если vertexes.set является массивом
                    if ((pgelem.elem.vertexes.set) && (Array.isArray(pgelem.elem.vertexes.set))) {
                        for(let vrtx_key in pgelem.elem.vertexes.set) {
                            let vrtx = pgelem.elem.vertexes.set[vrtx_key];
                            // Если вершина является экземпляром класса PolylineVertex
                            if (vrtx instanceof PolylineVertex) {
                                // Установить нулевые размеры
                                vrtx.graphics.exec("body", function(el) {
                                    el.attr({ r: 0 });
                                });
                            }
                        }
                    }
                }
			}
        }
		// Установить масштаб 100%
        // -----------

		// SVG представление схемы
		//var svgString = pgApp.pg.paper.toSVG(); // Raphael's export function
		var svgString = $("#svg_container").html(); // Pure SVG code from SVG container
		
		// \\\.-*= FIX RAPHAEL TO VALID_SVG_FORMAT =*-.///
		svgString = svgString.replace(/stroke-dasharray=""/g, 'stroke-dasharray="none"');
		svgString = svgString.replace(/stroke-dasharray="-"/g, 'stroke-dasharray="3,1"');
		svgString = svgString.replace(/stroke-dasharray="\."/g, 'stroke-dasharray="1,1"');
		svgString = svgString.replace(/stroke-dasharray="-\."/g, 'stroke-dasharray="3,1,1,1"');
		svgString = svgString.replace(/stroke-dasharray="-\.\."/g, 'stroke-dasharray="3,1,1,1,1,1"');
		svgString = svgString.replace(/stroke-dasharray="\.\s"/g, 'stroke-dasharray="1,3"');
		svgString = svgString.replace(/stroke-dasharray="-\s"/g, 'stroke-dasharray="4,3"');
		svgString = svgString.replace(/stroke-dasharray="--"/g, 'stroke-dasharray="8,3"');
		svgString = svgString.replace(/stroke-dasharray="-\s\."/g, 'stroke-dasharray="4,3,1,3"');
		svgString = svgString.replace(/stroke-dasharray="--\."/g, 'stroke-dasharray="8,3,1,3"');
		svgString = svgString.replace(/stroke-dasharray="--\.\."/g, 'stroke-dasharray="8,3,1,3,1,3"');
		//console.log(svgString);
		// ---------------- FIX END ----------------------
		
		// --- Импорт в Visio ---
		$.post("/schema/visio", { svg_data: svgString })
		.done(function( data ) {

			// Временная ссылка
			var a = document.createElement('a');
			a.href = '/tmp_data/tmp_vsd/' + data;
			// Имитация клика по ссылке для открытия FileSaveDialog, чтобы пользователь выбрал место для сохранения файла на своем диске
			a.click();

			// Возврат стандартных размеров вершин ломаных
            // В линиях
            for(let key in pgApp.pg.lines) {
                let elem = pgApp.pg.lines[key];

                // Если поле vertexes является экземпляром класса PolylineVertexes
                if ((elem.vertexes) && (elem.vertexes instanceof PolylineVertexes)) {
                    // Если vertexes.set является массивом
                    if ((elem.vertexes.set) && (Array.isArray(elem.vertexes.set))) {
                        for(let vrtx_key in elem.vertexes.set) {
                            let vrtx = elem.vertexes.set[vrtx_key];
                            // Если вершина является экземпляром класса PolylineVertex
                            if (vrtx instanceof PolylineVertex) {
                                // Установить нулевые размеры
                                vrtx.graphics.exec("body", function(el) {
                                    el.attr({ r: PolylineVertex.defaultSize });
                                });
                            }
                        }
                    }
                }
            }
            // В ломаных
            for(let key in pgApp.pg.figures) {
                let pgelem = pgApp.pg.figures[key];

                // Если тип фигуры - ломаная, и элемент фигуры является экземпляром класса Polyline
                if (pgelem.type === "polyline" && pgelem.elem && pgelem.elem instanceof Polyline) {
                    // Если поле vertexes является экземпляром класса PolylineVertexes
                    if ((pgelem.elem.vertexes) && (pgelem.elem.vertexes instanceof PolylineVertexes)) {
                        // Если vertexes.set является массивом
                        if ((pgelem.elem.vertexes.set) && (Array.isArray(pgelem.elem.vertexes.set))) {
                            for(let vrtx_key in pgelem.elem.vertexes.set) {
                                let vrtx = pgelem.elem.vertexes.set[vrtx_key];
                                // Если вершина является экземпляром класса PolylineVertex
                                if (vrtx instanceof PolylineVertex) {
                                    // Установить нулевые размеры
                                    vrtx.graphics.exec("body", function(el) {
                                        el.attr({ r: PolylineVertex.defaultSize });
                                    });
                                }
                            }
                        }
                    }
                }
            }
		});		
		return;
		// --- --- ---


		/*
		// DOWNLOAD SVG FILE FUNCTION
		// Временная ссылка
		var a = document.createElement('a');
		// Имя файла, получаемого по ссылке
		a.download = 'mySvg.svg';
		// Тип файла
		a.type = 'image/svg+xml';
		// Инициализация BLOB содержимого
		blob = new Blob([svgString], {"type": "image/svg+xml"});
		// Установка BLOB содержимого на адрес ссылки
		a.href = (window.URL || webkitURL).createObjectURL(blob);
		// Имитация клика по ссылке для открытия FileSaveDialog, чтобы пользователь выбрал место для сохранения файла на своем диске
		a.click();
		// - - - - -
		*/

		/*
			// DOWNLOAD VISIO FILE NOT WORKING FUNCTION
			// Временная ссылка
			var a = document.createElement('a');
			// Имя файла, получаемого по ссылке
			a.download = 'myVSD.vsd';
			// Тип файла
			a.type = 'application/x-visio';
			// Инициализация BLOB содержимого
			blob = new Blob([data], {"type": "application/x-visio"});
			// Установка BLOB содержимого на адрес ссылки
			a.href = (window.URL || webkitURL).createObjectURL(blob);
			// Имитация клика по ссылке для открытия FileSaveDialog, чтобы пользователь выбрал место для сохранения файла на своем диске
			a.click();
		*/
	});


	$(".schema_name").change(function() {
		pgApp.pg.changeName($(this).val());
	});

	// Обработчик выпадающего списка "Масштаб"
	$("#schema_scale").change(function() {
		var text = $(this).find("option:selected").text();
		
		if (!isNaN(parseFloat(text)) && isFinite(text))
			pgApp.pg.changeScale(text / 100);
		else
			pgApp.pg.changeScale(1.0);
	});

	// Обработчик нажатия на кнопку выбора одного из инструментов
	$(".tool_button").click(function() {
		var _this = $(this);
		
		if (pgApp.pg.setCurrentTool(_this.attr("id")))
		{
			$(".tool_button").removeClass("tool_selected");
			_this.addClass("tool_selected");
		}
	});	
	
	// Обработчик нажатия на кнопку "Сохранение"
	$("#action_save").click(function() {
		/*
		var json_string_to_load = JSON.stringify(current_schema_code);
		//var pg_to_load = PowerGrid.fromJSON(json_string_to_load);
		var pg_to_load = PowerGrid.fromJSON(json_string_to_load, null, null);
		
		if (!pg_to_load)
		{
			alert("Возникла ошибка при сохранении схемы");
			return;
		}
		*/
		pgApp.savePgToDb(function (data) {
			/** !!! Обработчик результатов сохранения */
			var save_result = JSON.parse(data);
			
			if (save_result) {
				if (save_result.result) {
					// Обновляем превьюшку
					$.post(
						"/schema/updatepreview",
						{
							id: current_schema_id,
							svg: pgApp.pg.paper.toSVG()
						}
					);				
					
					alert('Сохранено');
					return;
				}
			}

			alert('Не сохранено');
			return;
		});
	});
	
	
	// Обработчик нажатия на кнопку отмены действия
	$("#undo").click(function(){
		pgApp.pg.actionManager.undoAction();
	});


	// Обработчик нажатия на кнопку повтора действия
	$("#redo").click(function(){
		pgApp.pg.actionManager.redoAction();
	});	
	
	
	// Обработчик кнопки "Тест"
	$("#action_test").click(function() {
		//pgApp.pg.changeScale(0.5);
	});
	
	// Обработчик кнопки "Масштаб"
	$("#action_scale_0_5").click(function() {
		pgApp.pg.changeScale(0.5);
	});	
	// Обработчик кнопки "Масштаб"
	$("#action_scale_1").click(function() {
		pgApp.pg.changeScale(1.0);
	});	
	// Обработчик кнопки "Масштаб"
	$("#action_scale_2").click(function() {
		pgApp.pg.changeScale(2.0);
	});		
	
	
	// Обработчик кнопки расчета
	$(".go_calc").click(function(){
		var calcErrors = pgApp.pg.getErrorsForCalc();

		if (calcErrors) {
			if (calcErrors.hasErrors && calcErrors.errors) {
				$("#modalCalcErrorsBody").html("");
				$("#modalCalcErrorsBody").append(pgApp.pg.getCalcErrorsPopupBody());
			
				$('#modalCalcErrors').modal('show');
				pgApp.pg.setCurrentTool('tool_pointer'); 		//  / 
				$(".tool_button").removeClass("tool_selected"); // <   Костыль, так как при открывании/закрывании вспл. окна узлы потом не ставятся
				$("#tool_pointer").addClass("tool_selected");	//  \
			} else {
				$(this)
				//.html(Math.random())
				.unbind("click");
				
				pgApp.savePgToDb(function (data) {
					document.location.href = "/calc/config?id=" + current_schema_id;
				});		
			}		
		}

			

	});	
	
	/*
	$("#svg_container").mousedown(function(e) {
		console.log('mousedown:');
		console.log(e);
	});	
	
	$("#svg_container").mousemove(function(e) {
		console.log('mousemove:');
		console.log(e);	
	});
	
	$("#svg_container").mouseup(function(e) {
		console.log('mouseup:');
		console.log(e);	
	});	
	*/
	
	
	// Выполнение свмого приложения:
	
	// Загрузка JSON кода схемы
	var json_string_to_load = JSON.stringify(current_schema_code);
	
	
	$("#svg_container").empty();
	// Загрузка схемы по ее JSON коду
	var pg_to_load = PowerGrid.fromJSON(json_string_to_load, "svg_container", "param_container", pgApp.pg.view_only);
	//var pg_to_load = PowerGrid.fromJSON(json_string_to_load, null, null);
	//pg_to_load.changeContainers("svg_container", "param_container");
	//var pg_to_load.param_container = "param_container";
			
	// Если удалось загрузить схему, то загружаем ее в приложение
	if (pg_to_load != null)
	{
		
		pgApp.pg = pg_to_load;
		pgApp.pg.updateSize();
		//pgApp.pg.changeContainers("svg_container", "param_container");
		// pg.container = ...
		// pg.paramcontainer = ...
	}

	// Освобождаем временную схему
	pg_to_load = null;
	
	
	//pgApp.pg = PowerGrid.fromJSON(json_string_to_load, "svg_container", "param_container");
	// =============================
	
});
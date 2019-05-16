Raphael.el.draggableDetails = function() {
	var me = this,
		pgelem = me.data("elem"),
		lx = 0,
		ly = 0,
		ox = 0,
		oy = 0,
		startX = 0,
		startY = 0,
		
	moveFnc = function(dx, dy) 
	{
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				// Текущие коорднаты
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;
				
				//pgelem.moveTo(lx, ly);
				pgelem.detailsMoveTo(lx, ly);
			break;
			
		}
	},
	  
	startFnc = function() {
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				// Начальные координаты - координаты нагрузки
				//ox = pgelem.getParamVal('x');
				//oy = pgelem.getParamVal('y');
				var bodyCenter = pgelem.getBodyCenter();
				ox = bodyCenter.x + pgelem.detailsOffset.x;
				oy = bodyCenter.y + pgelem.detailsOffset.y;
				
				// Fix на несрабатывание moveFnc
				lx = ox;
				ly = oy;			
				// End fix				
				
				//startX = pgelem.getParamVal('x');
				//startY = pgelem.getParamVal('y');				
				startX = bodyCenter.x + pgelem.detailsOffset.x;
				startY = bodyCenter.y + pgelem.detailsOffset.y;
				
				// Показываем текст с координатами
				//pgelem.graphics.exec("coords", function(elem) { elem.show() });
			break;
		}
	},
	  
	endFnc = function() 
	{
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":
				// Если начальные и конечные координаты совпадают, 
				// то действие не требует возврата/отмены 
				// (практически означает, что действия как такового не произошло)			
				if (lx != ox || ly != oy) {
					// Добавляем действие перемещения в менеджер действий
					/*
					pgelem.pg.actionManager.addAction(
					
						function(){
							pgelem.moveTo(startX, startY);
						},
							
						function() {
							pgelem.moveTo(lx, ly);
						},
						
						"Переместить сноску",
						
						"Переместить сноску"
					);
					*/
				}
				ox = lx;
				oy = ly;
				// Скрываем текст с координатами
				//pgelem.graphics.exec("coords", function(elem) { elem.hide() });
				pgelem.pg.updateSize();
			break;
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};

class PGLine extends PGElement
{
	constructor(_pg, startNode, finishNode)
	{
		// Схема, которой принадлжеит данная линия
		super(_pg);
		
		/**
			Параметры линии
			---------------
				Перечислены те, которые пользователю разрешено редактировать через форму (isEditableByUser: true),
			либо в будущем это, возможно, будет разрешено (в данный момент isEditableByUser: false)
			
				Остальные параметры, которые никогда нельзя менять пользователю через форму,
			перечислены в виде отдельных свойств
		*/
		
		this.param = {
			// Длина линии, м
			length: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Длина"
				},
				getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] }
			},
			
			// Сечение фазных проводов, мм^2
			intersection: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Сечение"
				},
				getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] }
			},
			
			// Сечение нейтрали, мм^2
			intersectionNeutral: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Сечение нейтрали"
				},
				getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] }
			},
			/*
			// Индуктивное сопротивление, Ом/км
			inductiveResistance: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Инд. сопр-е"
				},
				getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] }
			},
			*/
			
			inductiveResistance: {
				type: "set",
				//value: "Не выбрано",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					//ru: "Инд. сопр-е"
					ru: "Тип линии",
				},
				//getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] },
				getErrorsFunc: function (val) { return val <= 0 ? ["Необходимо выбрать значение параметра из списка предложенных!"] : [] },
				set: {
					"0": "Не выбрано",
					"0.1": "КЛ, СИП",
					"0.3": "ВЛ"
				}
				
			},
			
			// Цвет линии
			drawColor: {
				type: "color",
				value: "rgb(0, 0, 0)",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { elem.attr({ stroke: pgElem.param['drawColor'].value}); });
				},
				translate: {
					ru: "Цвет"
				}
			},
			/*
			// Цвет вершины ломаной
			vertexDrawColorOut: {
				type: "color",
				value: "rgba(0, 0, 0, 0.3)",
				isSaveable: true,
				isEditableByUser: false,
				onChange: function() {}
			},
			
			// Цвет вершины ломаной при наведении
			vertexDrawColorOver: {
				type: "color",
				value: "rgba(0, 0, 0, 0.0)",
				isSaveable: true,
				isEditableByUser: false,
				onChange: function() {}
			}
			*/
		};
		
		// -------------------------------------------------------------------------------
		
		// Генерация псевдослучайного идентификатора
		this.id = PGElement.getUniqueID("line_");
		
		
		// Начальный узел
		this.startNode = startNode;
		// Конечный узел
		this.finishNode = finishNode;
		
		
		// Вершины ломаной
		//this.vertexes = [];
		this.vertexes = new PolylineVertexes(this, "body");
		
		// Смещение сноски относительно центра ломаной
		this.detailsOffset = { x: PGLine.startDetailsOffset.x, y: PGLine.startDetailsOffset.y };
	}
	

	// Дополнительная первая точка ломаной, представляющей линию
	getFirstPolylinePointCoords() {
		return [this.startNode.getParamVal('x'), this.startNode.getParamVal('y')];
	}
	
	
	// Дополнительная последняя точка ломаной, представляющей линию
	getLastPolylinePointCoords() {
		return [this.finishNode.getParamVal('x'), this.finishNode.getParamVal('y')];
	}

	
	// Открытие формы редактирования параметров
	openParamForm() {
		super.openParamForm();
		
		var _this = this;
		
		$('<input>', {
			type: "button",
			value: "Удалить эту линию",
			/*style: "display: block;",*/
			class: "delete_elem_btn",
			on: {
				click: function(event){
					var _this_elem = _this;
					
					_this.pg.actionManager.addAction(
					
						function(){
							_this.pg.addLine(_this_elem, _this_elem.startNode, _this_elem.finishNode);
						},
						
						function() {
							_this.pg.deleteLine(_this_elem.id);
						},
						
						"Добавить линию",
						
						"Удалить линию"
					);
				
					_this.pg.deleteLine(_this.id);
					_this.pg.initParamForm();
				}				
			}
		}).appendTo("#" + _this.pg.param_container_id);			
	}


	// Отрисовка линии
	render() {	
		try {
			super.render();
		}
		catch(e) {
			return;
		}
		
		var _this = this;
		
		//this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.lines);
		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.line_vertexes);

		// Ломаная, представляющая непосредственно саму линию
		this.graphics.add("body", this.pg.paper
			//.polyline(_this.getPolylinePoints())
			.polyline(this.vertexes.getPolylinePoints())
			.attr({ 
				stroke: _this.getParamVal("drawColor"), 
				'stroke-width': 2, 
				class: "pgline " + _this.id, 
				'stroke-linecap': "round", 
				'stroke-linejoin': "round"
				/* , fill: "transparent" */
			})
			.click(function(e){
			
				if (_this.pg.view_only) {
					var lineResManager = new PGCalcResManager();
				
					if (!$("#pgline_res_" + _this.id).length)
						$("#" + _this.pg.container_id).append(lineResManager.getLineCalcResBlock(_this, pgApp.calcRes));
				} else {
					switch(_this.pg.getCurrentTool()) {
						case "tool_pointer":
							_this.openParamForm();
							/*
							if(e.ctrlKey) {
								//var vertexIndex = _this.getPrevVertexIndexByClick(e.offsetX, e.offsetY);
								_this.vertexes.addPolylineVertex(e.offsetX, e.offsetY);

								//if (vertexIndex > -1)
									//_this.addPolylineVertex(vertexIndex, e.offsetX, e.offsetY);
							}
							*/
							var _x = e.layerX / _this.pg.scale; // dx / pgelem.pg.scale + ox;
							var _y = e.layerY / _this.pg.scale;
							var _vrtx = undefined;
							var _vrtx_indx = -1;
							var _vrtx_x = 0;
							var _vrtx_y = 0;							
								
							if(e.ctrlKey) {
								_vrtx = _this.vertexes.addPolylineVertex(_x, _y);
								_vrtx_x = _vrtx.coords.x;
								_vrtx_y = _vrtx.coords.y;
								_vrtx_indx = _this.vertexes.set.indexOf(_vrtx);
							
								//console.log("_vrtx");
								//console.log(_vrtx);
								
								// Добавляем действие в менеджер действий
								_this.pg.actionManager.addAction(
								
									function() {
										//console.log("_vrtx");
										//console.log(_vrtx);
										
										//console.log("_vrtx_indx");
										//console.log(_vrtx_indx);										
									
										if (_vrtx_indx > -1) {
											_vrtx.unrender();
											_this.vertexes.set.splice(_vrtx_indx, 1);
										} else {
											console.log('vertex is not removed');
										}
									},
									
									function() {
										_this.vertexes.set.splice(_vrtx_indx, 0, _vrtx);
										_vrtx.render();
										
										console.log("_vrtx");
										console.log(_vrtx);
										
										console.log("_vrtx_indx");
										console.log(_vrtx_indx);										
									},
									
									"Удалить вершину ломаной",
									
									"Добавить вершину ломаной"
								);
								
							}							
							
							break;			
						}
				}
			}));
			
		var bodyCenter = this.getBodyCenter();
			
		if (bodyCenter) {
			// Подпись
			this.graphics.add("details", this.pg.paper
				//.text(bodyCenter.x + this.detailsOffset.x, bodyCenter.y + this.detailsOffset.y, this.getDetailsText())
				.text(0, 0, this.getDetailsText())
				.transform('t' + (bodyCenter.x + this.detailsOffset.x) + ',' + (bodyCenter.y + this.detailsOffset.y))
				.data("elem", this)

			);
			
			if (!this.pg.view_only)
				this.graphics.exec("details", function(elem) { elem.draggableDetails(); });
		
			// Линия к подписи
			this.graphics.add("detailstail", this.pg.paper
				.polyline([[bodyCenter.x, bodyCenter.y], [bodyCenter.x + this.detailsOffset.x, bodyCenter.y + this.detailsOffset.y]])
				.attr({stroke: "rgb(0, 0, 0)", "stroke-dasharray": "- "})
				.data("elem", this)
			);
		

		}
	
		/*
		this.graphics.set.forEach(function(el){
			//el.toBack();
		});
		*/
	}
	
	
	// Текст сноски
	getDetailsText() {
		if (!this.pg.view_only) { // Если включен режим редактирования
			//return this.getParamVal("length") + "м\n" + this.getParamVal("intersection") + "мм²\n" + this.getParamVal("intersectionNeutral") + "мм²\n";
			return this.getParamVal("length") + "м " + this.getParamVal("intersection") + "мм² " + this.getParamVal("intersectionNeutral") + "мм²";
		} else {
			var res = "";
			
			if (calc_res != undefined) {
				if (calc_res.calc_data) {
					if (calc_res.calc_data.lines) {
						if (calc_res.calc_data.lines[this.id]) {
							//calc_res.calc_data.lines[this.id]
							if (
							calc_res.calc_data.lines[this.id][0] &&
							calc_res.calc_data.lines[this.id][1] &&
							calc_res.calc_data.lines[this.id][2] &&								
							calc_res.calc_data.lines[this.id][3] ) {
								// Сумма потерь на фазах
								var sumLoses = Object.values(calc_res.calc_data.lines[this.id]).reduce(
									function(sum, currVal, indx, arr) {
										return sum + (
											parseFloat(currVal.loses)
										);
									}, 
									0
								);
							
								// Перечень потерь на фазах
								var listLoses = Object.values(calc_res.calc_data.lines[this.id]).reduce(
									function(sum, currVal, indx, arr) {
										return sum + (
											(Math.round(parseFloat(currVal.amperage) * 1000) / 1000) + " "
										);
									}, 
									""
								);
								
								// Перечень токов на фазах
								var listAmperages = Object.values(calc_res.calc_data.lines[this.id]).reduce(
									function(sum, currVal, indx, arr) {
										return sum + (
											(Math.round(parseFloat(currVal.amperage) * 1000) / 1000) + " "
										);
									}, 
									""
								);
								
								// Перечень падений напряжения на фазах
								var listVoltages = Object.values(calc_res.calc_data.lines[this.id]).reduce(
									function(sum, currVal, indx, arr) {
										return sum + (
											(Math.round(parseFloat(currVal.voltage) * 1000) / 1000) + " "
										);
									}, 
									""
								);
							
								if (calcViewerOptions && calcViewerOptions.linesNote) {
									if (calcViewerOptions.linesNote.showLoses && (calcViewerOptions.linesNote.showLoses === true)) {
										res += "Потери(кВт) " + listLoses + "\n";
									}
									
									if (calcViewerOptions.linesNote.showVoltage && (calcViewerOptions.linesNote.showVoltage === true)) {
										res += "Падение напр.(В) " + listVoltages + "\n";
									}
									
									if (calcViewerOptions.linesNote.showAmperage && (calcViewerOptions.linesNote.showAmperage === true)) {
										res += "Токи(А) " + listAmperages;
									}
									
									// Если в сноске не показываются ни один из типов данных, 
									// то показывать все типы данных
									if (!(calcViewerOptions.linesNote.showLoses || calcViewerOptions.linesNote.showVoltage || calcViewerOptions.linesNote.showAmperage)) {
										res = "Потери(кВт) " + listLoses + "\n" + 
										"Падение напр.(В) " + listVoltages + "\n" + 
										//sumLoses + "\n" + 
										"Токи(А) " + listAmperages;										
									}
								} else {
									res = "Потери(кВт) " + listLoses + "\n" + 
									"Падение напр.(В) " + listVoltages + "\n" + 
									//sumLoses + "\n" + 
									"Токи(А) " + listAmperages;
								}
							}
						}
					}
				}
			}
			
			return res;
		}
	}
	
	
	// Центр пути ломаной
	getBodyCenter() {
		if (this.graphics && this.graphics.get("body")) {
			// Точка находящаяся на 50% от начала пути на этом же пути
			var point = this.graphics.get("body").getPointAtLength(this.graphics.get("body").getTotalLength() * 0.5); 
			
			return {x: point.x, y: point.y};
		}
		
		return undefined;
	}
	
	
	afterMoving() {
		var bodyCenter = this.getBodyCenter();
			
		if (bodyCenter && this.graphics.get("details") && this.graphics.get("detailstail")) {
			// Координаты подписи
			//this.graphics.get("details").attr({x: bodyCenter.x + this.detailsOffset.x, y: bodyCenter.y + this.detailsOffset.y});
			this.graphics.get("details").transform('t' + (bodyCenter.x + this.detailsOffset.x) + ',' + (bodyCenter.y + this.detailsOffset.y));
		
			// Линия к подписи
			this.graphics.get("detailstail").attr({ path: 
				"M " + bodyCenter.x + " " + bodyCenter.y + " " + 
				"L " + (bodyCenter.x + this.detailsOffset.x) + " " + (bodyCenter.y + this.detailsOffset.y)
			});
		}
	}
	
	
	detailsMoveTo(x, y) {
		var coords = super.moveTo(x, y);
		x = coords.x;
		y = coords.y;
		
		var _this = this;
		var bodyCenter = this.getBodyCenter();
		
		var offset = {
			x: bodyCenter.x - x,
			y: bodyCenter.y - y
		};
		
		console.log('[' + x + ',' + y + ']')
		
		// Смещаем сноску
		_this.graphics.get('details').transform('t' + x + ',' + y);

		_this.detailsOffset = { 
			x: x - bodyCenter.x,
			y: y - bodyCenter.y,
		};
		
		_this.afterMoving();
	}
	
	
	// Стереть графику линии
	unrender(){ // ???
		// Стираем графику вершин
		for(var vertex_index in this.vertexes.set) {
			var vrtx = this.vertexes.set[vertex_index];
			
			if (vrtx.graphics && vrtx.graphics.set /* !!! && typeof(this.graphics) == raphael~set */) {
				vrtx.graphics.set.forEach(function(el){
					el.remove();
				});
				
				vrtx.graphics = undefined;
			}
		}
		
		//this.vertexes = new PolylineVertexes(this, "body");
		this.vertexes.set = [];
		//this.vertexes = undefined;
		
		// Удаляем свою графику
		if (this.graphics && this.graphics.set /* !!! && typeof(this.graphics) == raphael~set */)
		{
			this.graphics.set.forEach(function(el){
				el.remove();
			});
			
			this.graphics = undefined;
		}
		
		if (this.graphics)
			this.graphics = undefined;
	}
	

	// Возвращает объект с параметрами данной линии для последующего сохранения
	getObj() {
		var obj = super.getObj();
		var _this = this;
	
		obj.startNode = _this.startNode.id;
		obj.finishNode = _this.finishNode.id;
			
		// Вершины полилинии
		obj.vertexes = [];
		for(var i = 0; i < _this.vertexes.set.length; i++)
		{
			var coords = _this.vertexes.set[i].getCoords();
			//obj.vertexes.push({x: _this.vertexes[i].attr("cx"), y: _this.vertexes[i].attr("cy")});
			obj.vertexes.push({x: coords.x, y: coords.y});
		}
		// -----------------
		
		obj.detailsOffset = { x: this.detailsOffset.x, y: this.detailsOffset.y };
		
		return obj;
	}
	
	
	// Загружает параметры линии из объекта
	fromObj(_obj) {
		super.fromObj(_obj);
		
		// Начальный и конечный узлы вместо их имен
		this.startNode = this.pg.nodes[_obj.startNode];
		this.finishNode = this.pg.nodes[_obj.finishNode];

		this.vertexes = new PolylineVertexes(this, "body");
		
		// Круги-вершины полилинии вместо их координат
		for(var j = 0; j < _obj.vertexes.length; j++) {
			this.vertexes.set[j] = new PolylineVertex(this, _obj.vertexes[j].x, _obj.vertexes[j].y, this.vertexes);
		}
		
		this.detailsOffset = { x: _obj.detailsOffset.x, y: _obj.detailsOffset.y }; // Работает и без этого!!! Почему ???
	}
}

PGLine.startDetailsOffset = { x: 25, y: 25};
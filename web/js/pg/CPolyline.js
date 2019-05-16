Raphael.el.draggablePolyline = function() {
	var me = this,
		pgelem = me.data("elem"),
		// Вершины ломаной
		vertexesObj = [],

		lx = 0,
		ly = 0;
		
		ox = 0,
		oy = 0,
		
	startFnc = function() {
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":
				vertexesObj = pgelem.vertexes.getObj();

				ox = 0;
				oy = 0;
			break;
		}
	},		
		
	moveFnc = function(dx, dy) {
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;
				
				//console.log(ox, oy, lx, ly);
				// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				// TODO: Не задавать все вершины из объекта по новой, а смещать относительно начальных координат
				// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

				// Вершины со смещением
				lVertexObj = vertexesObj.map(function(item, i, arr) {
					return { x: item.x + lx, y: item.y + ly };
				});
				
				// Задаем вершины ломаной из массива вершин со смещением
				//pgelem.vertexes.fromObj(lVertexObj);
				pgelem.vertexes.setCoordsFromObj(lVertexObj);
				/*
				// Пересчитываем "path" исходя из массива смещенных вершин
				pgelem.graphics.exec("body", function(elem) {
					elem.attr({"path": pgelem.vertexes.getPath()});
				});
				*/
			break;
		}
	},
	  
	endFnc = function() {
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":	
				ox = lx;
				oy = ly;
				
				var startVertexesObj = vertexesObj.slice();
				var endVertexesObj = pgelem.vertexes.getObj();
				
				// Есть ли разница между начальным и конечным массивом вершин
				var isNoDiff = startVertexesObj.map(function(item, i, arr) {
					return { x: item.x - endVertexesObj[i].x, y: item.y - endVertexesObj[i].y };
				}).reduce((accumulator, currValue) => accumulator = accumulator && (currValue.x == 0 && currValue.y == 0), true);
				
				// Если разницы между двумя массивами нет, то действие в менеджер действий не добавляется
				if (isNoDiff)
					break;
				
				// Добавляем действие перемещения в менеджер действий
				pgelem.pg.actionManager.addAction(
				
					function(){
						// Задаем вершины ломаной из массива стартовых вершин
						//pgelem.vertexes.fromObj(startVertexesObj);
						pgelem.vertexes.setCoordsFromObj(startVertexesObj);
						/*
						// Пересчитываем "path" исходя из массива стартовых вершин
						pgelem.graphics.exec("body", function(elem) {
							elem.attr({"path": pgelem.vertexes.getPath()});
						});
						*/
					},
						
					function() {
						// Задаем вершины ломаной из массива конечных вершин
						//pgelem.vertexes.fromObj(endVertexesObj);
						pgelem.vertexes.setCoordsFromObj(endVertexesObj);
						/*
						// Пересчитываем "path" исходя из массива конечных вершин
						pgelem.graphics.exec("body", function(elem) {
							elem.attr({"path": pgelem.vertexes.getPath()});
						});
						*/
					},
					
					"Переместить ломаную",
					
					"Переместить ломаную"
				);
				
				// // // pgelem.pg.updateSize();
			break;
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};

class Polyline extends PGElement {
// Если нет необходимости в freeTransform на Polyline, закомментировать следующую строку и раскомментировать предыдущую строку, также см. render()
//class Polyline extends GraphicElement {
	constructor(_pg) {
		super(_pg);
		
		var _this = this;
		
		this.param = {
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

			// Цвет заливки
			fillColor: {
				type: "color",
				value: "none",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					if (_this.getParamVal("isClosed") == "closed")
						pgElem.graphics.exec("body", function(elem) { elem.attr({ fill: pgElem.param['fillColor'].value}); });
					else
						pgElem.graphics.exec("body", function(elem) { elem.attr({ fill: 'none'}); });
				},
				translate: {
					ru: "Цвет заливки"
				}
			},			

			// Замкнутая или нет
			isClosed: {
				type: "set",
				value: "closed",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) {
						_this.vertexes.closedPath = (_this.getParamVal("isClosed") == 'closed');
						elem.attr({"path": _this.vertexes.getPath()});
						
						if (_this.vertexes.closedPath)
							elem.attr({fill: _this.getParamVal("fillColor")});
						else
							elem.attr({fill: 'none'});
						
					});
				},
				translate: {
					ru: "Замкнутая"
				},
				set: {
					"closed": 	"Да",
					"open": 	"Нет",
				}
			}, 						
		};
		
		this.vertexes = new PolylineVertexes(this, "body", this.getParamVal("isClosed") == "closed");
		
		this.id = PGElement.getUniqueID("polyline_");
	}
	
	render() {
		try {
			super.render();
		}
		catch(e) {
			return;
		}
		
		var _this = this;
		
		//this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.polyline_vertexes);
		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.figures);
		
		this.graphics.add("body", this.pg.paper
			//.polyline(this.vertexes.getPolylinePoints(), this.getParamVal("isClosed") == "closed")
			.path(this.vertexes.getPath(), this.getParamVal("isClosed") == "closed")
			.data("elem", this)
			.attr({ 
				stroke: _this.getParamVal("drawColor"), 
				fill: _this.getParamVal("isClosed") == "closed" ? _this.getParamVal("fillColor") : 'none', 
				'stroke-width': 2, 
				class: "pgpolyline " + _this.id}));
				
		this.graphics.set
		.click(function(e){
			//if (!_this.pg.view_only) {
			if (_this.pg.view_only)
				return;
			
				switch(_this.pg.getCurrentTool()) {
					case "tool_pointer":
						_this.select();
						_this.openParamForm();
						
						var _x = e.layerX;
						var _y = e.layerY;
						var _vrtx = undefined;
						var _vrtx_indx = -1;
						var _vrtx_x = 0;
						var _vrtx_y = 0;
						
						if(e.ctrlKey) {
							//_this.vertexes.addPolylineVertex(e.offsetX, e.offsetY);
							//_this.vertexes.addPolylineVertex(e.layerX, e.layerY);
							_vrtx = _this.vertexes.addPolylineVertex(_x, _y);
							_vrtx_x = _vrtx.coords.x;
							_vrtx_y = _vrtx.coords.y;
							_vrtx_indx = _this.vertexes.set.indexOf(_vrtx);
						
							console.log(_vrtx);
							
							// Добавляем действие в менеджер действий
							_this.pg.actionManager.addAction(
							
								function() {
									
									if (_vrtx_indx > -1) {
										//_this.vertexes.removeVertex(_vrtx_indx);
										_vrtx.unrender();
										_this.vertexes.set.splice(_vrtx_indx, 1);
									} else {
										console.log('vertex is not removed');
									}
										
									/*
									if (_vrtx_indx > -1) {
										_this.vertexes.removeVertex(_vrtx_indx);
										console.log('remove ', _vrtx_indx, _vrtx);
									} else {
										console.log('vertex is not removed');
									}
									*/
								},
								
								function() {
									//_this.vertexes.addPolylineVertex(_x, _y);
										//var _tmp_vrtx = _this.vertexes.addPolylineVertex(_vrtx.coords.x, _vrtx.coords.y);
										//console.log('add ', _tmp_vrtx, 'to ', _this.vertexes.set.indexOf(_tmp_vrtx));
										//_tmp_vrtx.render();
									//_this.vertexes.addPolylineVertex(_vrtx.coords.x, _vrtx.coords.y);
									//_this.vertexes.addPolylineVertex(_vrtx.coords.x, _vrtx.coords.y).render();
									
									//_this.vertexes.addPolylineVertex(_vrtx.coords.x, _vrtx.coords.y);
									_this.vertexes.set.splice(_vrtx_indx, 0, _vrtx);
									_vrtx.render();
									
									//render();
									// Заменить это ^ на это v
									//_this.vertexes.set.push(new PolylineVertex(_this, _vrtx_x, _vrtx_y, _this.vertexes));
									//console.log(_this.vertexes);

								},
								
								"Удалить вершину ломаной",
								
								"Добавить вершину ломаной"
							);
							
						}

						
						/*
						// Если нет необходимости в freeTransform на Polyline, то закомментировать следующие 3 строки, также см. объявление класса (1 строка)
						_this.initFt();
						if (_this.freeTransform)
							_this.freeTransform.showHandles();						
						*/
					break;			
				}
			//}
		});
		
		this.afterRender();
		
		if (!this.pg.view_only)
			this.graphics.exec("body", function(elem) { elem.draggablePolyline(); });
	}
	
	afterMoving() {
		
	}
	/*
	onUnselect() {
		this.graphics.exec("bbox", function(elem) {
			elem.hide();
		});	
	}
	
	
	onSelect() {
		this.pg.unselectAll(this);
		this.graphics.exec("bbox", function(elem) {
			elem.show();
		});
	}
	*/
	getFirstPolylinePointCoords() {
		// Функция возвращает Null, так как нет необходимости в дополнительной начальной точке ломаной
		return null;
	}
	
	getLastPolylinePointCoords() {
		// Функция возвращает Null, так как нет необходимости в дополнительной конечной точке ломаной
		return null;
	}	
	
	// Открытие формы редактирования параметров
	openParamForm() {
		super.openParamForm();
		
		var _this = this;
		
		// Убрать заливку
		$('<input>', {
			type: "button",
			value: "Убрать заливку",
			//class: "delete_elem_btn",
			style: "display: block; margin: 0 0 10px 0;",
			on: {
				click: function(event){
					_this.setParamVal('fillColor', 'none');
					/*
					var _this_elem = _this;
					
					_this.pg.actionManager.addAction(
					
						function(){
							_this.pg.addPolyline(_this_elem);
						},
						
						function() {
							_this.pg.deletePolyline(_this_elem.id);
						},
						
						"Добавить линию",
						
						"Удалить линию"
					);
				
					_this.pg.deletePolyline(_this.id);
					_this.pg.initParamForm();
					*/
				}				
			}
		}).appendTo("#" + _this.pg.param_container_id);
		
		// Кнопка удаления
		$('<input>', {
			type: "button",
			value: "Удалить эту ломаную",
			class: "delete_elem_btn",
			on: {
				click: function(event){
					//var _this_elem = _this;
					var tmp_figure = _this;
					
					_this.pg.actionManager.addAction(
					
						function(){
							_this.pg.figures[tmp_figure.id] = tmp_figure;
							
							for(var _vrtx_indx in tmp_figure.vertexes.set) {
								tmp_figure.vertexes.set[_vrtx_indx].render();
							}								
							
							_this.pg.figures[tmp_figure.id].render();							
						},
						
						function() {
							tmp_figure.unrender();
							
							for(var _vrtx_indx in tmp_figure.vertexes.set) {
								tmp_figure.vertexes.set[_vrtx_indx].unrender();
							}

							delete _this.pg.figures[tmp_figure.id];							
						},
					
						"Добавить ломаную",
						
						"Удалить ломаную"
					);
				
					//_this.pg.deletePolyline(_this.id);
					//_this.pg.deleteFigure(_this_elem.id);
					_this.pg.deleteFigure(tmp_figure.id);
					_this.pg.initParamForm();
				}				
			}
		}).appendTo("#" + _this.pg.param_container_id);
	}	
	
	// Возвращает объект элемента сети
	getObj() {
		var obj = super.getObj();
		var _this = this;
			
		// Вершины полилинии
		/*
		obj.vertexes = [];
		for(var i = 0; i < _this.vertexes.set.length; i++) {
			var coords = _this.vertexes.set[i].getCoords();
			obj.vertexes.push({x: coords.x, y: coords.y});
		}
		*/
		obj.vertexes = [];
		try {
			obj.vertexes = _this.vertexes.getObj();
		} catch(e) {
			
		}
		// -----------------	
		
		return obj;
	}	
	
	// Загружает элемент из объекта
	fromObj(_obj) {
		super.fromObj(_obj);
		
		this.vertexes = new PolylineVertexes(this, "body", this.getParamVal("isClosed") == "closed");
		
		// Круги-вершины полилинии вместо их координат
		for(var j = 0; j < _obj.vertexes.length; j++) {
			this.vertexes.set[j] = new PolylineVertex(this, _obj.vertexes[j].x, _obj.vertexes[j].y, this.vertexes);
		}
	}	
	
	
	unrender() {
		for(var indx = this.vertexes.set.length - 1; indx >= 0; indx--) {
			//this.vertexes.removeVertex(indx);
			this.vertexes.set[indx].unrender();
		}
		
		super.unrender();
	}
}
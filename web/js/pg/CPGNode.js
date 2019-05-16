Raphael.st.draggableNode = function() {
	var me = this,
		pgelem = me[0].data("elem"),
		lx = 0,
		ly = 0,
		ox = 0,
		oy = 0,
		startX = 0,
		startY = 0,
		tmp_line = undefined;
		
		
	moveFnc = function(dx, dy) {
		lx = dx / pgelem.pg.scale + ox;
		ly = dy / pgelem.pg.scale + oy;	
		//console.log('node lx,ly = ' + lx + " " + ly);
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				pgelem.moveTo(lx, ly);
			break;
			
			case "tool_line":
				tmp_line.attr({"path": ["M", ox, oy, "L", lx, ly]});
			break;			
			
		}
	},
	  
	startFnc = function() {
		ox = pgelem.getParamVal('x');
		oy = pgelem.getParamVal('y');
		
		// Fix на несрабатывание moveFnc
		lx = ox;
		ly = oy;			
		// End fix
	
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":
				startX = pgelem.getParamVal('x');
				startY = pgelem.getParamVal('y');
				pgelem.graphics.exec("coords", function(elem) { elem.show(); });
			break;
			
			case "tool_line":
				pgelem.pg.nodeToConnect = pgelem;
				tmp_line = pgelem.pg.paper
				.polyline([[ox, oy], [lx, ly]])
				.attr({ stroke: "rgba(0, 255, 0, 0.7)", 'stroke-width': 2, "stroke-dasharray": "-"})
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
					var _startX = startX;
					var _startY = startY;
					var _lx = lx;
					var _ly = ly;					
				
					// Добавляем действие перемещения в менеджер действий
					pgelem.pg.actionManager.addAction(
					
						function(){
							pgelem.moveTo(_startX, _startY);
						},
							
						function() {
							pgelem.moveTo(_lx, _ly);
						},
						
						"Вернуть узел на " + startX + ',' + startY,
						
						"Переместить узел на " + lx + ',' + ly
					);
				}
				
				ox = lx;
				oy = ly;

				pgelem.graphics.exec("coords", function(elem) { elem.hide(); });
				pgelem.pg.updateSize();				
			break;
			
			case "tool_line":
				pgelem.pg.nodeToConnect = undefined;
				tmp_line.remove();
			break;			
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};

// Возможность при помощи drag-and-drop соединять узлы линией
Raphael.st.connectable = function() {
	var set = this,
		pgelem = set[0].data("elem");
	
	this.forEach(function(e) {
		e.mouseup(function() {
			switch(pgelem.pg.getCurrentTool()) {
				case "tool_line":
					if ((pgelem.pg.nodeToConnect instanceof PGNode) && pgelem.pg.nodeToConnect && (pgelem.pg.nodeToConnect.id != pgelem.id)) {
						var startNode = pgelem.pg.nodeToConnect;
						var finishNode = set[0].data("elem");
						
						pgelem.pg.nodeToConnect = undefined;
						
						var exists_line = false;
						
						// Если между этими узлами не существует линии
						for(line_id in pgelem.pg.lines) {
							line = pgelem.pg.lines[line_id];
							if (
								(
									line.startNode.id == startNode.id && 
									line.finishNode.id == finishNode.id
								) ||
								(
									line.startNode.id == finishNode.id && 
									line.finishNode.id == startNode.id
								)									
							)
								exists_line = true;
						}
							
						if (!exists_line) {
							// Добавляется линия между этими узлами
							var tmp_line = new PGLine(pgelem.pg, startNode, finishNode);
							/*
							// Добавляем действие в менеджер действий
							pgelem.pg.actionManager.addAction(
					
								function(){
									pgelem.pg.deleteLine(tmp_line.id);
								},
								
								function() {
									console.log(tmp_line);
									pgelem.pg.addLine(tmp_line);
								},
							
								"Удалить линию",
							
								"Добавить линию"
							);
							*/
							
							// Добавляем действие в менеджер действий
							pgelem.pg.actionManager.addAction(
							
								function() {
									for(var _vrtx_indx in tmp_line.vertexes.set) {
										tmp_line.vertexes.set[_vrtx_indx].unrender();
									}								
									tmp_line.unrender();

									delete pgelem.pg.lines[tmp_line.id];
								},
								
								function() {
									pgelem.pg.lines[tmp_line.id] = tmp_line;
									pgelem.pg.lines[tmp_line.id].render();
									for(var _vrtx_indx in tmp_line.vertexes.set) {
										tmp_line.vertexes.set[_vrtx_indx].render();
									}								
									
								},
								
								"Удалить линию",
								
								"Добавить линию"
							);									
							
							pgelem.pg.addLine(tmp_line);
							
							break;
						}
					}
				break;			
			}
		});
	});
}


// Может присоединять нагрузку
Raphael.st.canAttach = function() {
	var set = this,
		pgelem = set[0].data("elem");
	
	this.forEach(function(e) {
		e.mouseup(function() {
			switch(pgelem.pg.getCurrentTool())
			{
				// Инструмент "Нагрузка"
				case "tool_load":
					var tmp_load = new PGLoad(pgelem.pg, pgelem);
					
					tmp_load.setParamVal("x", pgelem.getParamVal('x') - PGLoad.startNodeOffset.x);
					tmp_load.setParamVal("y", pgelem.getParamVal('y') - PGLoad.startNodeOffset.y);
					
					// Добавляем действие в менеджер действий
					pgelem.pg.actionManager.addAction(
					
						function(){
							pgelem.pg.deleteLoad(tmp_load.id);
						},
						
						function() {
							pgelem.pg.addLoad(tmp_load);
						},
						
						"Удалить нагрузку",
						
						"Добавить нагрузку"
					);
					
					pgelem.pg.addLoad(tmp_load);
				break;
				
				
				// Инструмент "Источник"
				case "tool_source":
					var tmp_source = new PGSource(pgelem.pg, pgelem);
					var old_source = pgelem.pg.source;
					
					tmp_source.setParamVal("x", pgelem.getParamVal('x') - PGSource.startNodeOffset.x);
					tmp_source.setParamVal("y", pgelem.getParamVal('y') - PGSource.startNodeOffset.y);
					
					// Добавляем действие в менеджер действий
					pgelem.pg.actionManager.addAction(
					
						function() {
							pgelem.pg.deleteSource(tmp_source.id);
							
							if (old_source instanceof PGSource)
								pgelem.pg.addSource(old_source);
						},
						
						function() {
							if (old_source instanceof PGSource)
								pgelem.pg.deleteSource(old_source);						
						
							pgelem.pg.addSource(tmp_source);
						},
						
						"Удалить источник",
						
						"Добавить источник"
					);					
					
					pgelem.pg.addSource(tmp_source);
				break;
			}
		});
	});
}


class PGNode extends PGElement
{
	// Конструктор
	constructor(_pg) {
		super(_pg);
		
		// Параметры
		this.param = {
			// X
			x: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: false,
				onChange: function() {}
			},

			// Y
			y: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: false,
				onChange: function() {}
			},		
			
			// drawWidth
			drawWidth: {
				type: "float", // !!! integer???
				value: 0,
				isSaveable: true,
				isEditableByUser: false,
				onChange: function() {}
			},		
			
			// drawHeight
			drawHeight: {
				type: "float", // !!! integer???
				value: 0,
				isSaveable: true,
				isEditableByUser: false,
				onChange: function() {}
			},				
		
			// Цвет линии
			drawColor: {
				type: "color",
				value: "rgb(0, 0, 0)",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { elem.attr({ stroke: pgElem.param['drawColor'].value, fill: pgElem.param['drawColor'].value }); });
				},
				translate: {
					ru: "Цвет"
				}
			},
			
			// comment
			comment: {
				type: "string",
				value: "",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("comment", function(elem) { elem.attr({"text": pgElem.getParamVal('comment')}); });
				},
				translate: {
					ru: "Описание"
				}
			},
		}
		
		// Генерация псевдослучайного идентификатора
		this.id = PGElement.getUniqueID("node_");
	}
	
	
	openParamForm() {
		super.openParamForm();
		
		var _this = this;
		
		$('<input>', {
			type: "button",
			value: "Удалить этот узел",
			class: "delete_elem_btn",
			on: {
				click: function(event){
					var _this_elem = _this;
					var _elem_lines = [];
					var _elem_loads = [];
					var _elem_sources = [];

					// Удаляем линии, входящие или выходящие из этого узла
					for(var key in _this.pg.lines) {
						if (_this.pg.lines[key].startNode.id == _this_elem.id || _this.pg.lines[key].finishNode.id == _this_elem.id) {
							_elem_lines.push(_this.pg.lines[key]);
						}
					}
					
					// Удаляем нагрузки, присоединенные к этому узлу
					for(var key in _this.pg.loads) {
						if (_this.pg.loads[key].node.id == _this_elem.id) {
							_elem_loads.push(_this.pg.loads[key]);
						}
					}			
					
					// Удаляем источник, если он присоединен к этому узлу
					if (_this.pg.source && _this.pg.source.node && _this.pg.source.node.id == _this_elem.id) {
						_elem_sources.push(_this.pg.source);
					}
					
					// Действия для отмены/возврата	
					_this.pg.actionManager.addAction(
						// Возвращаем удаленный узел со всеми присоединенными к нему до этого линиями, нагрузками и источником(-ами?)
						function(){
							_this.pg.addNode(_this_elem);
							
							for(var key in _elem_lines) {
								_this.pg.addLine(_elem_lines[key], _elem_lines[key].startNode, _elem_lines[key].finishNode);
							}
							
							for(var key in _elem_loads) {
								_this.pg.addLoad(_elem_loads[key], _elem_loads[key].node);
							}
							
							for(var key in _elem_sources) {
								//_this.pg.deleteSource(null);
								_this.pg.addSource(_elem_sources[key], _elem_sources[key].node);
							}							
						},
						// Удаляем узел (также со всеми присоединенными элементами, что заложено в функции удаления узла)
						function() {
							_this.pg.deleteNode(_this_elem.id);
						},
						
						"Добавить узел",
						
						"Удалить узел"
					);
				
					// Удаляем сам узел
					_this.pg.deleteNode(_this.id);
					_this.pg.initParamForm();
				}				
			}
		}).appendTo("#" + _this.pg.param_container_id);			
	}	
	
	
	// Отрисовка элемента
	render() {
		try
		{
			super.render();
		}
		catch(e)
		{
			return;
		}
		var _this = this;

		// Графическое представление узла
		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.nodes);

		this.graphics.add("body", 
			this.pg.paper.circle(0, 0, PGNode.drawSize)
				.attr({fill: _this.getParamVal('drawColor'), stroke: _this.getParamVal('drawColor')})
				.data("elem", this)); // Тело узла (круг)

		this.graphics.add("comment", this.pg.paper.text(10, 10, this.getParamVal('comment')).data("elem", this)); // Комментарий
		this.graphics.add("coords", this.pg.paper.text(10, 20, this.getParamVal('x') + " " + this.getParamVal('y')).data("elem", this)); // Координаты
		this.graphics.set.transform("t" + this.getParamVal('x') + "," + this.getParamVal("y"));
		
		this.graphics.exec("coords", function(elem) { elem.hide(); });
		
		if (this.pg.view_only) {
			return;
		}
			
		
		this.graphics.set
		.click(function(e){
			switch(_this.pg.getCurrentTool()) {
				case "tool_pointer":
					_this.select();
					_this.openParamForm();					
				break;			
			}
		});
		
		this.graphics.set.draggableNode();
		this.graphics.set.connectable();

		this.graphics.set.canAttach();
		
		this.afterRender();
	}
	
	
	// Переместить узел в заданные координаты
	moveTo(x, y) {
		var coords = super.moveTo(x, y);
		x = coords.x;
		y = coords.y;
	
		var _this = this;
		
		_this.setParamVal("x", x);
		_this.setParamVal("y", y);				
		
		_this.graphics.set.transform('t' + x + ',' + y);

		_this.graphics.exec("coords", function(elem) { elem.attr({"text": x + " " + y }); });
		
		// Все ЛИНИИ, которые входят или выходят из данного узла 
		// нуждаются в перерисовке при перемещении узла
		for(var key in _this.pg.lines) {
			var line = _this.pg.lines[key];
			
			if (_.isEqual(line.startNode, _this) || _.isEqual(line.finishNode, _this)) {
				line.graphics.exec("body", function(elem) { elem.attr("path", line.vertexes.getPath()); }); // !!! Можно потом добавить в afterMoving
				line.afterMoving();
			}
		}
		
		// Перерисовка нагрузок
		for(var key in _this.pg.loads)
		{
			var load = _this.pg.loads[key];
				
			if (_.isEqual(load.node, _this))
			{
				load.setParamVal('x', _this.getParamVal('x') - load.nodeOffset.x);
				load.setParamVal('y', _this.getParamVal('y') - load.nodeOffset.y);
				
				// !!! Переделать под перемещение элементов, а не удаление/отрисовку
				load.unrender();
				load.render();
			}
		}
				
		// Перерисовка источника
		if (_this.pg.source instanceof PGSource)
		{
			if (_.isEqual(_this.pg.source.node, _this))
			{
				// Координаты источника = центр узла - смещение от узла - размер кружка нагрузки
				_this.pg.source.setParamVal('x', _this.getParamVal('x') - _this.pg.source.nodeOffset.x);
				_this.pg.source.setParamVal('y', _this.getParamVal('y') - _this.pg.source.nodeOffset.y);

				// !!! Переделать под перемещение элементов, а не удаление/отрисовку
				_this.pg.source.unrender();
				_this.pg.source.render();						
			}
		}
	}
}

PGNode.drawSize = 5;
Raphael.el.draggableSourcePolylineVertex = function() {
	var me = this,
		pgelem = me.data("elem"),
		lx = 0,
		ly = 0,
		ox = me.attr("cx"),
		oy = me.attr("cy"),
		
	moveFnc = function(dx, dy) 
	{
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				//lx = dx + ox;
				//ly = dy + oy;
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;
				
				// Если нажат Alt
				if (pgApp.altPressed)
				{
					// То координаты округляются до кратного PGApp.gridStep числа
					lx = Math.round(lx / PGApp.gridStep) * PGApp.gridStep;
					ly = Math.round(ly / PGApp.gridStep) * PGApp.gridStep;
				}				
				
				me.attr("cx", lx);
				me.attr("cy", ly);
				
				console.log(pgelem);
			break;
		}
	},
	  
	startFnc = function() {
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				
			break;
		}
	},
	  
	endFnc = function() 
	{
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":	
				ox = lx;
				oy = ly;
			break;
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};


//Raphael.st.draggableSource = function() {
Raphael.el.draggableSource = function() {
	var me = this,
		//pgelem = me[0].data("elem"),
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
				//lx = dx + ox;
				//ly = dy + oy;
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;
				pgelem.moveTo(lx, ly);
				/*
				// Смещаем нагрузку
				me.transform('t' + lx + ',' + ly);
				// А линию нагрузки не смещаем
				pgelem.graphics[3].transform("t0,0");
				// Задаем координаты параметры нагрузки
				pgelem.setParamVal("x", lx);
				pgelem.setParamVal("y", ly);
				// Задаем смещение относительно узла
				pgelem.nodeOffset = { 
					x: pgelem.node.getParamVal('x') - pgelem.getParamVal('x'), 
					y: pgelem.node.getParamVal('y') - pgelem.getParamVal('y') 
				};
				// Прорисовываем линию нагрузки
				pgelem.graphics[3].attr("path", pgelem.getPath());
				// Обновляем текст с координатами
				me[2].attr({"text": lx + " " + ly });
				*/
			break;
			
		}
	},
	  
	startFnc = function() {
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				// Начальные координаты - координаты нагрузки
				ox = pgelem.getParamVal('x');
				oy = pgelem.getParamVal('y');
				
				// Fix на несрабатывание moveFnc
				lx = ox;
				ly = oy;			
				// End fix				
				
				startX = pgelem.getParamVal('x');
				startY = pgelem.getParamVal('y');								
				
				// Показываем текст с координатами
				//pgelem.graphics[2].show();
				pgelem.graphics.exec("coords", function(elem) { elem.show(); });
			break;
		}
	},
	  
	endFnc = function() 
	{
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				// Если начальные и конечные координаты совпадают, 
				// то действие не требует возврата/отмены 
				// (практически означает, что действия как такового не произошло)			
				if (lx != ox || ly != oy) {			
					// Добавляем действие перемещения в менеджер действий
					pgelem.pg.actionManager.addAction(
					
						function(){
							//pgelem.pg.deleteLine(tmp_line.id);
							pgelem.moveTo(startX, startY);
						},
							
						function() {
							pgelem.moveTo(lx, ly);
						},
						
						"Переместить источник",
						
						"Переместить источник"
					);
				}
			
				ox = lx;
				oy = ly;
				
				// Скрываем текст с координатами
				pgelem.graphics.exec("coords", function(elem) { elem.hide(); });
				
				// Обновляем размеры канваса
				pgelem.pg.updateSize();
			break;
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};


class PGSource extends PGElement
{
	// Конструктор
	constructor(_pg, _node) {
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

			
			// Цвет границы
			drawColor: {
				type: "color",
				value: "rgb(0, 0, 0)",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {

					// Парсим цвет
					var colorParseResult = color_parse(pgElem.getParamVal('drawColor'));
					
					//console.log(colorParseResult);
					
					// Выполняем проверки на корректность
					if (("space" in colorParseResult) && (colorParseResult.space == "rgb"))
					{
						if (("values" in colorParseResult) && (colorParseResult.values.length == 3))
						{
							if (
								((colorParseResult.values[0] >= 0) && (colorParseResult.values[0] <= 255)) && 
								((colorParseResult.values[1] >= 0) && (colorParseResult.values[1] <= 255)) && 
								((colorParseResult.values[2] >= 0) && (colorParseResult.values[2] <= 255))
								)
							{
								var r = colorParseResult.values[0];
								var g = colorParseResult.values[1];
								var b = colorParseResult.values[2];
								//pgElem.graphics.get(PGSource.imageGraphicsIndex).load('/getpic/pgsource?sr=' + r + '&sg=' + g + '&sb=' + b);
								//pgElem.graphics.get(PGSource.polylineGraphicsIndex).attr({ stroke: pgElem.getParamVal('drawColor')});
								//pgElem.graphics[0].attr('stroke', pgElem.getParamVal("drawColor"));
								pgElem.graphics.exec("body", function(elem) { elem.attr('stroke', pgElem.getParamVal("drawColor")); });
								pgElem.graphics.exec("body_arrow", function(elem) { elem.attr('stroke', pgElem.getParamVal("drawColor")); });
								// ??? //pgElem.graphics.exec("line", function(elem) { elem.attr('stroke', pgElem.getParamVal("drawColor")); });
							}
						}
					}
				},
				translate: {
					ru: "Цвет"
				}
			}
		}
		
		// !!! if typeof _node = PGNode
		this.node = _node;
		
		// Смещение относительно узла
		this.nodeOffset = { x: PGSource.startNodeOffset.x, y: PGSource.startNodeOffset.y };		
		
		this.vertexes = [];
		
		// Генерация псевдослучайного идентификатора
		this.id = PGElement.getUniqueID("source_");
	}
	
	
	// Индекс вершины, после которой надо добавить еще одну
	getPrevVertexIndexByClick(x, y) {
		var pnts = this.getPolylinePoints();

		for(var i = 0; i < pnts.length - 1; i++)
		{
			if (GeometryHelper.isPointOverSection(
				x, y, 
				pnts[i][0], pnts[i][1], 
				pnts[i + 1][0], pnts[i + 1][1]))
			return i;
		}

		return -1;			
	}
	
	
	createPolylineVertex(x, y) {		
		var _this = this;
	
		var circle = this.pg.paper.circle(x, y, PGNode.drawSize / 2);
		
		circle.attr({ fill: _this.param.vertexDrawColorOut.value , class: "pgsourcevertex " + _this.id, }); // Аттрибуты
		circle.data("elem", _this);
		circle.draggablePolylineVertex();

		console.log(circle);
		return circle;
	}
	
	
	// Добавить вершину в массив вершин ломаной
	addPolylineVertex(afterIndex, x, y) {
		var tmp_vertex = this.createPolylineVertex(x, y);	
		this.vertexes.splice(afterIndex, 0, tmp_vertex);
		console.log(this.vertexes);
	}	
	
	
	// Возвращает массив координат вершин ломаной
	getPolylinePoints() {		
		var arr = [[this.getParamVal('x'), this.getParamVal('y')]];
		
		for(var i = 0; i < this.vertexes.length; i++)
		{
			arr.push([this.vertexes[i].attr("cx"), this.vertexes[i].attr("cy")]);
		}
		arr.push([this.node.getParamVal('x'), this.node.getParamVal('y')]);
		
		return arr;
	}	
	
	
	// Возвращает svg-path ломаной
	getPath() {
		var arr = this.getPolylinePoints();
		
		if (arr.length < 2)
			return;
		
		var poly = [];

		for(var i = 0; i < arr.length; i++)
		{
			if (arr[i][0] && arr[i][1] &&
			!isNaN(parseFloat(arr[i][0])) && isFinite(arr[i][0]) &&
			!isNaN(parseFloat(arr[i][1])) && isFinite(arr[i][1])
			)
			{
				poly.push(arr[i][0]);
				poly.push(arr[i][1]);
			}
		}
		
		var res = [];
		
		for(var i = 0; i < poly.length; i++)
		{
			if (i == 0)
				res.push('M');
				
			if (i == 2)
				res.push('L');
			
			res.push(poly[i]);
		}
		
		return res.join(' ');
	}	
	
	
	openParamForm() {
		super.openParamForm();
		
		var _this = this;
		
		$('<input>', {
			type: "button",
			value: "Удалить источник",
			//style: "display: block;",
			class: "delete_elem_btn",
			on: {
				click: function(event){
					var _this_elem = _this;
					
					_this.pg.actionManager.addAction(
					
						function(){
							_this.pg.addSource(_this_elem, _this_elem.node);
						},
						
						function() {
							_this.pg.deleteSource(_this_elem.id);
						},
						
						"Добавить источник",
						
						"Удалить источник"
					);				
				
					_this.pg.deleteSource(_this.id);
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
		
		_this.nodeOffset = { x: _this.node.getParamVal('x') - _this.getParamVal('x'), y: _this.node.getParamVal('y') - _this.getParamVal('y') };
		
		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.source);
		
		this.graphics.add("body", this.pg.paper.circle(0, 0, PGSource.drawSize)
			.attr('fill', '#ffffff')
			.attr('stroke', _this.getParamVal("drawColor"))
			.data("elem", this)
		);
		
		this.graphics.add("body_arrow", this.pg.paper.path("M -6 0 L 6 0 2 3 6 0 2 -3")
			.attr('stroke', _this.getParamVal("drawColor"))
			.data("elem", this)
		);
		
		this.graphics.add("description", this.pg.paper.text(2 * PGSource.drawSize, 2 * PGSource.drawSize, "Источник").data("elem", this));
		
		this.graphics.add("coords", this.pg.paper.text(2 * PGSource.drawSize, 3 * PGSource.drawSize, this.getParamVal('x') + " " + this.getParamVal('y')).data("elem", this));
		this.graphics.exec("coords", function(elem) { elem.hide(); });
		
		this.graphics.add("line", this.pg.paper.polyline(_this.getPolylinePoints()));
		
		this.graphics.set.transform("t" + this.getParamVal('x') + "," + this.getParamVal("y"));
		this.graphics.exec("line", function(elem) { elem.transform("t0,0").toBack(); });
		
		if (this.pg.view_only)
			return;				
			
		this.graphics.set
		.click(function(e){
			switch(_this.pg.getCurrentTool())
			{
				case "tool_pointer":
					_this.select();
					_this.openParamForm();					
				break;			
			}
		});
		
		//this.graphics.set.draggableSource();
		this.graphics.exec("body", function(elem) { elem.draggableSource(); });
		this.graphics.exec("body_arrow", function(elem) { elem.draggableSource(); });
		this.graphics.exec("description", function(elem) { elem.draggableSource(); });
		
		this.afterRender();
	}
	
	
	moveTo(x, y) {
		var coords = super.moveTo(x, y);
		x = coords.x;
		y = coords.y;
		
		var _this = this;	
	
		// Смещаем нагрузку
		//_this.graphics.transform('t' + x + ',' + y);
		_this.graphics.set.transform('t' + x + ',' + y);
		// А линию нагрузки не смещаем
		//_this.graphics[3].transform("t0,0");
		_this.graphics.exec("line", function(elem) { elem.transform("t0,0"); });
		// Задаем координаты параметры нагрузки
		_this.setParamVal("x", x);
		_this.setParamVal("y", y);
		// Задаем смещение относительно узла
		_this.nodeOffset = { 
			x: _this.node.getParamVal('x') - _this.getParamVal('x'), 
			y: _this.node.getParamVal('y') - _this.getParamVal('y') 
		};
		// Прорисовываем линию нагрузки
		//_this.graphics[3].attr("path", _this.getPath());
		_this.graphics.exec("line", function(elem) { elem.attr("path", _this.getPath()); });
		// Обновляем текст с координатами
		//_this.graphics[2].attr({"text": x + " " + y });
		_this.graphics.exec("coords", function(elem) { elem.attr({ "text" : x + " " + y }); });
	}
	
	
	getObj(){
		var obj = super.getObj();
		
		obj.node = this.node.id;
		
		return obj;
	}	
	
	
	fromObj(_obj) {
		super.fromObj(_obj);
		
		// Начальный и конечный узлы вместо их имен
		this.node = this.pg.nodes[_obj.node];

		/*
		// Круги-вершины полилинии вместо их координат
		for(var j = 0; j < _obj.vertexes.length; j++)
		{
			this.vertexes[j] = this.createPolylineVertex(
				_obj.vertexes[j].x, 
				_obj.vertexes[j].y
			);
		}
		*/
	}	
}

PGSource.drawSize = 10;
PGSource.startNodeOffset = { x: 25, y: -25};
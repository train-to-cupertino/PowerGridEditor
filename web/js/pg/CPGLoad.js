/*
Raphael.el.draggableLoadPolylineVertex = function() {
	var me = this,
		pgelem = me.data("elem"),
		lx = 0,
		ly = 0,
		//ox = 0,
		//oy = 0,
		ox = me.attr("cx"),
		oy = me.attr("cy"),
		
	moveFnc = function(dx, dy) 
	{
		switch(pgelem.pg.getCurrentTool())
		{
			case "tool_pointer":
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;
				
				// Если нажат Alt
				if (pgApp.altPressed)
				{
					// То координаты округляются до кратного PGApp.gridStep числа
					lx = Math.round(lx / PGApp.gridStep) * PGApp.gridStep;
					ly = Math.round(ly / PGApp.gridStep) * PGApp.gridStep;
				}				
				
				//me.transform('t' + lx + ',' + ly);
				me.attr("cx", lx);
				me.attr("cy", ly);
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
*/

//Raphael.st.draggableLoad = function() {
Raphael.el.draggableLoad = function() {
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
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;
				
				pgelem.moveTo(lx, ly);
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
				pgelem.graphics.exec("coords", function(elem) { elem.show() });
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
							pgelem.moveTo(startX, startY);
						},
							
						function() {
							pgelem.moveTo(lx, ly);
						},
						
						"Переместить нагрузку",
						
						"Переместить нагрузку"
					);
				}
				ox = lx;
				oy = ly;
				// Скрываем текст с координатами
				pgelem.graphics.exec("coords", function(elem) { elem.hide() });
				pgelem.pg.updateSize();
			break;
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};


class PGLoad extends PGElement
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
			
			// Длина спуска, м
			length: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Длина спуска"
				},
				getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] }
			},
			
			// Сечение спуска, мм^2
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
			
			// Мощность нагрузки, кВт
			power: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Мощность"
				},
				getErrorsFunc: function (val) { return val <= 0 ? ["Значение параметра должно быть больше нуля!"] : [] }
			},				
			
			// Косинус фи
			cosphi: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "cos(φ)"
				},
				getErrorsFunc: function (val) { val = parseFloat(val); return (val <= 0 || val >= 1) ? ["Значение параметра должно быть больше нуля и меньше единицы!"] : [] }
			},				

			// Коэффициент заполнения
			kzap: {
				type: "float",
				value: 0,
				isSaveable: true,
				isEditableByUser: true,
				onChange: function() {},
				translate: {
					ru: "Коэф. заполнения"
				},
				getErrorsFunc: function (val) { val = parseFloat(val); return (val <= 0 || val >= 1) ? ["Значение параметра должно быть больше нуля и меньше единицы!"] : [] }
			},						
		
			// Цвет границы
			drawColor: {
				type: "color",
				value: "rgb(0, 0, 0)",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { elem.attr({ stroke: pgElem.param['drawColor'].value, }); });
				},
				translate: {
					ru: "Цвет границы"
				}
			},
			
			// Цвет заливки
			fillColor: {
				type: "color",
				value: "rgb(255, 255, 255)",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { elem.attr({ fill: pgElem.param['fillColor'].value }); });
				},
				translate: {
					ru: "Цвет заливки"
				}
			},		
			
			// comment
			placement: {
				type: "string",
				value: "",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("placement", function(elem) { elem.attr({"text": pgElem.getParamVal('placement')}); });
				},
				translate: {
					ru: "Описание"
				}
			},
			
			// Фаза подключения
			phase: {
				type: "set",
				value: "a",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					
				},
				translate: {
					ru: "Фаза"
				},
				set: {
					a: "A",
					b: "B",
					c: "C",
					0: "Откл." // !!! ??? Надо ли это?
				}
			},		
		}
		
		// !!! if typeof _node = PGNode
		this.node = _node;
		
		// Смещение относительно узла
		this.nodeOffset = { x: PGLoad.startNodeOffset.x, y: PGLoad.startNodeOffset.y };		
		
		this.vertexes = [];
		
		// Генерация псевдослучайного идентификатора
		this.id = PGElement.getUniqueID("load_");
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
		
		circle.attr({ fill: _this.param.vertexDrawColorOut.value , class: "pgloadvertex " + _this.id, }); // Аттрибуты
		circle.data("elem", _this);
		circle.draggablePolylineVertex();

		return circle;
	}
	
	
	// Добавить вершину в массив вершин ломаной
	addPolylineVertex(afterIndex, x, y) {
		var tmp_vertex = this.createPolylineVertex(x, y);	
		this.vertexes.splice(afterIndex, 0, tmp_vertex);
	}	
	
	
	// Возвращает массив координат вершин ломаной
	getPolylinePoints() {		
		var arr = [[this.getParamVal('x'), this.getParamVal('y')]];
		
		for(var i = 0; i < this.vertexes.length; i++) {
			arr.push([this.vertexes[i].attr("cx"), this.vertexes[i].attr("cy")]);
		}
		arr.push([this.node.getParamVal('x'), this.node.getParamVal('y')]);
		
		return arr;
	}	
	
	
	// Возвращает svg-path ломаной
	getPath() {
		var arr = this.getPolylinePoints();
		console.log(arr);
		if (arr.length < 2)
			return;
		
		var poly = [];

		for(var i = 0; i < arr.length; i++)
		{
			if (arr[i][0] && arr[i][1] &&
			!isNaN(parseFloat(arr[i][0])) && isFinite(arr[i][0]) &&
			!isNaN(parseFloat(arr[i][1])) && isFinite(arr[i][1]) ) {
				poly.push(arr[i][0]);
				poly.push(arr[i][1]);
			}
		}
		
		var res = [];
		
		for(var i = 0; i < poly.length; i++) {
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
			value: "Удалить эту нагрузку",
			//style: "display: block;",
			class: "delete_elem_btn",
			on: {
				click: function(event){
					var _this_elem = _this;
					
					_this.pg.actionManager.addAction(
					
						function(){
							_this.pg.addLoad(_this_elem, _this_elem.node);
						},
						
						function() {
							_this.pg.deleteLoad(_this_elem.id);
						},
						
						"Добавить нагрузку",
						
						"Удалить нагрузку"
					);
				
					_this.pg.deleteLoad(_this.id);
					_this.pg.initParamForm();
				}
			}
		}).appendTo("#" + _this.pg.param_container_id);			
	}
	
	
	// Отрисовка элемента
	render() {
		try {
			super.render();
		} catch(e) {
			return;
		}
		
		var _this = this;
		
		_this.nodeOffset = { x: _this.node.getParamVal('x') - _this.getParamVal('x'), y: _this.node.getParamVal('y') - _this.getParamVal('y') };
		
		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.loads);
		
		this.graphics.add("body", 
			//this.pg.paper.circle(0, 0, PGLoad.drawSize)
			this.pg.paper.rect(-1 * PGLoad.drawSize, -1 * PGLoad.drawSize, 2 * PGLoad.drawSize, 2 * PGLoad.drawSize)
			.attr('fill', _this.getParamVal("fillColor"))
			.attr('stroke', _this.getParamVal("drawColor"))
			.data("elem", this)
		);
		
		this.graphics.add("placement", 
			this.pg.paper.text(10, 10, this.getParamVal('placement')).data("elem", this)
		);
		
		this.graphics.add("coords", 
			this.pg.paper.text(10, 20, this.getParamVal('x') + " " + this.getParamVal('y')).data("elem", this)
		);
		this.graphics.exec("coords", function(elem) { elem.hide(); });
		
		this.graphics.add("line", 
			this.pg.paper.polyline(_this.getPolylinePoints())
		);
		
		this.graphics.set.transform("t" + this.getParamVal('x') + "," + this.getParamVal("y"));
		
		this.graphics.exec("line", function(elem) { elem.transform("t0,0").toBack(); });
		
		this.graphics.set
		.click(function(e){
			if (_this.pg.view_only) {
				var loadResManager = new PGCalcResManager();
				
				if (!$("#pgload_res_" + _this.id).length)
					$("#" + _this.pg.container_id).append(loadResManager.getLoadCalcResBlock(_this, pgApp.calcRes));
			} else {
				switch(_this.pg.getCurrentTool()) {
					case "tool_pointer":
						_this.select();
						_this.openParamForm();					
					break;			
				}
			}
		});
		
		if (this.pg.view_only)
			return;		
			
		//this.graphics.set.draggableLoad();
		this.graphics.exec("body", function(elem) { elem.draggableLoad(); });
		
		this.afterRender();
	}
	
	
	moveTo(x, y) {
		var coords = super.moveTo(x, y);
		x = coords.x;
		y = coords.y;
		
		var _this = this;
		
		// Смещаем нагрузку
		_this.graphics.set.transform('t' + x + ',' + y);
		// А линию нагрузки не смещаем
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
		_this.graphics.exec("line", function(elem) { elem.attr("path", _this.getPath()); });
		// Обновляем текст с координатами
		_this.graphics.exec("coords", function(elem) { elem.attr({"text": x + " " + y }); });
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
	}
}

PGLoad.drawSize = 5;
PGLoad.startNodeOffset = { x: -25, y: -25};
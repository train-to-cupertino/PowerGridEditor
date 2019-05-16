class PowerGrid {

	// Конструктор
	constructor(container_id, param_container_id, view_only) {
		var _this = this;			
	
		this.view_only = view_only || false;
	
		this.name = "Новая схема";
		
		this.nodes = {};
		this.lines = {};
		this.loads = {};
		this.source = undefined;
		
		this.figures = {};
		
		if (view_only)
			this.calcResManager = new PGCalcResManager();
		
		// Масштаб в относительных единицах
		this.scale = 1.0;

		this.container_id = container_id;
		if (container_id) {
			this.paper = Raphael(container_id, PowerGrid.minSize.x, PowerGrid.minSize.y);

			this.size = {x: PowerGrid.minSize.x, y: PowerGrid.minSize.y};
			this.paper.setViewBox(0, 0, PowerGrid.minSize.x, PowerGrid.minSize.y);
			this.paper.canvas.setAttribute('preserveAspectRatio', 'none');			
			this.selections = this.paper.set();
			
			// Группы элементов
			this.groups = {};
			
			this.groups.figures = new this.paper.group(container_id, []);
			this.groups.polyline_vertexes = new this.paper.group(container_id, []);
			
			this.groups.lines = new this.paper.group(container_id, []);
			this.groups.line_vertexes = new this.paper.group(container_id, []);
			this.groups.loads = new this.paper.group(container_id, []);
			this.groups.source = new this.paper.group(container_id, []);
			this.groups.nodes = new this.paper.group(container_id, []);
		}
		
		//if (param_container_id)
			this.param_container_id = param_container_id;
		
		// Менеджер действий (отвечает за отмену/повтор действий)
		this.actionManager = new PGActions();
		
		// Перетаскиваемый узел для создания линии
		this.nodeToConnect = undefined;
		
		// Текущий инструмент
		this.currentTool = PowerGrid.TOOL_DEFAULT;
		
		// -------------------------
		// [Selectable plugin START]
		this.selectableSet = [];
		
		this.selectableOptions = {
			"stroke-dasharray": "- ",
			"stroke": "#0F0"
		};

		this.selectableCallback = function(set) {
			_this.selectableSet = [];
			_this.unselectAll();
			
			for(var i = 0; i < set.items.length; i++) {
				var elem = set.items[i].data("elem");
				
				if (elem) {
					if (_this.selectableSet.indexOf(elem) == -1) {
						_this.selectableSet.push(elem);
						//elem.select(elem);
						elem.selectMany();
					}
				}
			}
			
			////console.log('Length: ' + _this.selectableSet.length);
			////console.log(_this.selectableSet);
		};
		// [Selectable plugin END]
		// -------------------------

		
		
		if (this.view_only)
			return;
		
		// Клик по paper
		$("#" + container_id).click(function(e) {

			// Если клик по svg-контейнеру
			if (e.target.nodeName == "svg")
			{
				// unselect на всех элементах
				_this.unselectAll();
				_this.initParamForm();
				
			
				switch(_this.getCurrentTool()) {
					case "tool_pointer":

					break;
				
					// Инструмент "Узел"
					case "tool_node":
						var offset = $("#" + container_id).offset();
						var tmp_node = new PGNode(_this);
						
						tmp_node.setParamVal('x', (e.pageX - offset.left) / _this.scale);
						tmp_node.setParamVal('y', (e.pageY - offset.top) / _this.scale);
						
						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function(){
								_this.deleteNode(tmp_node.id);
							},
							
							function()
							{
								//if (DEBUG_MODE)
									//console.log("adding node...");
							
								_this.addNode(tmp_node);
							},
							
							"Удалить узел",
							
							"Добавить узел"
						);
						
						// Непосредственно добавляем узел
						_this.addNode(tmp_node);
					break;
					
					
					// Инструмент "Прямоугольник"
					case "tool_rect":
						// Координаты контейнера
						var offset = $("#" + container_id).offset();

						// Создание нового прямоугольника
						var tmp_rectangle = new Rectangle(_this);
						
						// Координаты клика относительно контейнера
						tmp_rectangle.coords = {
							x: (e.pageX - offset.left) / _this.scale, 
							y: (e.pageY - offset.top) / _this.scale
						};
						
						// Создание фигуры, которая будет содержать в себе эллипс
						var tmp_figure = new Figure(_this);
						
						// Внесение прямоугольника в фигуру
						tmp_figure.fromElem(tmp_rectangle, "rectangle");
						
						// Непосредственно добавляем эллипс в схему
						_this.addFigure(tmp_figure);
						
						// Запоминаем состояние фигуры
						var jsonFigure = JSON.stringify(tmp_figure.getObj());				
						
						// Запоминаем ID фигуры
						var figure_elem_id = tmp_figure.elem.id;
						
						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function() {
								// Удалить фигуру
								//_this.deleteFigure(tmp_figure.elem.id);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, undefined);
							},
							
							function() {
								// Добавить фигуру
								//_this.addFigure(tmp_figure);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, jsonFigure);
							},
							
							"Удалить прямоугольник",
							
							"Добавить прямоугольник"
						);
						/*
						var offset = $("#" + container_id).offset();
						var tmp_rect = new Rectangle(_this);
						
						tmp_rect.coords = {x: (e.pageX - offset.left) / _this.scale, y: (e.pageY - offset.top) / _this.scale};
						
						var tmp_figure = new Figure(_this);
						tmp_figure.fromElem(tmp_rect, "rectangle");

						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function() {
								_this.deleteFigure(tmp_figure.elem.id);
							},
							
							function() {
								_this.addFigure(tmp_figure);
							},
							
							"Удалить прямоугольник",
							
							"Добавить прямоугольник"
						);
						
						// Непосредственно добавляем прямугольник
						_this.addFigure(tmp_figure);
						*/
					
					break;
					
					// Инструмент "Эллипс"
					case "tool_ellipse":
						// Координаты контейнера
						var offset = $("#" + container_id).offset();

						// Создание нового эллипса
						var tmp_ellipse = new Ellipse(_this);
						
						// Координаты клика относительно контейнера
						tmp_ellipse.coords = {
							x: (e.pageX - offset.left) / _this.scale, 
							y: (e.pageY - offset.top) / _this.scale
						};
						
						// Создание фигуры, которая будет содержать в себе эллипс
						var tmp_figure = new Figure(_this);
						
						// Внесение эллипса в фигуру
						tmp_figure.fromElem(tmp_ellipse, "ellipse");
						
						// Непосредственно добавляем эллипс в схему
						_this.addFigure(tmp_figure);
						
						// Запоминаем состояние фигуры
						var jsonFigure = JSON.stringify(tmp_figure.getObj());				
						
						// Запоминаем ID фигуры
						var figure_elem_id = tmp_figure.elem.id;
						
						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function() {
								// Удалить фигуру
								//_this.deleteFigure(tmp_figure.elem.id);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, undefined);
							},
							
							function() {
								// Добавить фигуру
								//_this.addFigure(tmp_figure);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, jsonFigure);
							},
							
							"Удалить эллипс",
							
							"Добавить эллипс"
						);
					break;					
					
					// Инструмент "Текстовая метка"
					case "tool_label":
						// Координаты контейнера
						var offset = $("#" + container_id).offset();

						// Создание новой текстовой метки
						var tmp_label = new Label(_this);
						
						// Координаты клика относительно контейнера
						tmp_label.coords = {
							x: (e.pageX - offset.left) / _this.scale, 
							y: (e.pageY - offset.top) / _this.scale
						};
						
						// Создание фигуры, которая будет содержать в себе метку
						var tmp_figure = new Figure(_this);
						
						// Внесение прямоугольника в фигуру
						tmp_figure.fromElem(tmp_label, "label");
						
						// Непосредственно добавляем метку в схему
						_this.addFigure(tmp_figure);
						
						// Запоминаем состояние фигуры
						var jsonFigure = JSON.stringify(tmp_figure.getObj());				
						
						// Запоминаем ID фигуры
						var figure_elem_id = tmp_figure.elem.id;
						
						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function() {
								// Удалить фигуру
								//_this.deleteFigure(tmp_figure.elem.id);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, undefined);
							},
							
							function() {
								// Добавить фигуру
								//_this.addFigure(tmp_figure);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, jsonFigure);
							},
							
							"Удалить метку",
							
							"Добавить метку"
						);					
						/*
						var offset = $("#" + container_id).offset();
						var tmp_label = new Label(_this);
						
						tmp_label.coords = {x: (e.pageX - offset.left) / _this.scale, y: (e.pageY - offset.top) / _this.scale};
						
						var tmp_figure = new Figure(_this);
						tmp_figure.fromElem(tmp_label, "label");
						
						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function() {
								_this.deleteFigure(tmp_figure.elem.id);
							},
							
							function() {
								_this.addFigure(tmp_figure);
							},
							
							"Удалить текст",
							
							"Добавить текст"
						);
						
						// Непосредственно добавляем текст
						_this.addFigure(tmp_figure);
						*/
					break;					
					
					// Ломаная
					case "tool_polyline":
						var offset = $("#" + container_id).offset();
						
						var tmp_polyline = new Polyline(_this);
						var tmp_polyline_coords = {x: (e.pageX - offset.left) / _this.scale, y: (e.pageY - offset.top) / _this.scale};
						
						tmp_polyline.vertexes.set.push(new PolylineVertex(tmp_polyline, tmp_polyline_coords.x, tmp_polyline_coords.y, tmp_polyline.vertexes));
						tmp_polyline.vertexes.set.push(new PolylineVertex(tmp_polyline, tmp_polyline_coords.x + 100, tmp_polyline_coords.y + 100, tmp_polyline.vertexes));
						tmp_polyline.vertexes.set.push(new PolylineVertex(tmp_polyline, tmp_polyline_coords.x + 25, tmp_polyline_coords.y + 75, tmp_polyline.vertexes));
						
						var tmp_figure = new Figure(_this);
						tmp_figure.fromElem(tmp_polyline, "polyline");						
						//console.log('---');
						//console.log(tmp_figure);

						// ---
						
						// Добавляем действие в менеджер действий
						_this.actionManager.addAction(
						
							function() {
								tmp_figure.elem.unrender();
								for(var _vrtx_indx in tmp_figure.elem.vertexes.set) {
									tmp_figure.elem.vertexes.set[_vrtx_indx].unrender();
								}
								delete _this.figures[tmp_figure.elem.id];
							},
							
							function() {
								_this.figures[tmp_figure.elem.id] = tmp_figure;
								for(var _vrtx_indx in tmp_figure.elem.vertexes.set) {
									tmp_figure.elem.vertexes.set[_vrtx_indx].render();
								}								
								_this.figures[tmp_figure.elem.id].elem.render();
							},
							
							"Удалить ломаную",
							
							"Добавить ломаную"
						);						
						
						// Непосредственно добавляем ломаную
						_this.addFigure(tmp_figure);
					break;
				}
			}
		});
	}
	// Конец constructor
	
	
	changeName(schema_name) {
		this.name = schema_name;
		if (!this.name)
			this.name = "Без названия";
		$(".schema_name").val(this.name);
	}
	
	
	// Поменять масштаб
	changeScale(scale) {
		var _this = this;
	
		// Задаем новый коэффициент масштабирования
		this.scale = scale;

		// Меняем размер канваса
		this.paper.setSize(this.size.x * this.scale, this.size.y * this.scale);
		this.paper.canvas.setAttribute('preserveAspectRatio', 'none');
		
		// Меняем размер контейнера, в котором находится канвас
		$("#" + this.container_id).width(this.size.x * this.scale).height(this.size.y * this.scale);	
		
		// В режиме просмотра корректируем координаты всплывающих окон ...
		if (_this.view_only) {
			// ... результатов расчета линий ...
			for(var line_id in _this.lines) {
				var _pos = this.calcResManager.getLineCalcResBlockPosition(_this.lines[line_id]);
				
				$("#pgline_res_" + _this.lines[line_id].id).css({
					'left': (_pos.x * _this.scale) + 'px', 
					'top': (_pos.y * _this.scale) + 'px'
				});
			}
		
			// ... и нагрузок		
			for(var load_id in _this.loads) {
				var _pos = this.calcResManager.getLoadCalcResBlockPosition(_this.loads[load_id]);
				
				$("#pgload_res_" + _this.loads[load_id].id).css({
					'left': (_pos.x * _this.scale) + 'px', 
					'top': (_pos.y * _this.scale) + 'px'
				});
			}			
		}

		// !!! ...
	}
	
	
	changeContainers(container_id, param_container_id) {
		this.container_id = container_id;
		if (container_id) {
			//this.paper = Raphael(container_id, 800, 600);
			this.paper = Raphael(container_id, PowerGrid.minSize.x, PowerGrid.minSize.y);
			this.paper.setViewBox(0, 0, PowerGrid.minSize.x, PowerGrid.minSize.y);
			this.paper.canvas.setAttribute('preserveAspectRatio', 'none');			
			this.selections = this.paper.set();
		}
		
		//if (param_container_id)
			this.param_container_id = param_container_id;	
	}
	
	/* 
	 * Возвращает текущий инструмент
	 */
	getCurrentTool() {
		return this.currentTool;
	}
	
	
	/*
	 * Устанавливает текущий инструмент
	 */
	setCurrentTool(value) {
		var result = false;

		if ($.inArray(value, PowerGrid.TOOLS()) > -1) {
			this.currentTool = value;
			result = true;
		}
		else 
			this.currentTool = PowerGrid.TOOL_DEFAULT;
			
		
		if (this.currentTool == "tool_selection") {
			// Initialise the Selectable Plugin with a callback function
			this.paper.dragSelect(this.selectableCallback, this.selectableOptions);
			//.setColor("rgba(225, 225, 225, 1.0)");
		} else {
			this.paper.undragSelect();
		}
			
		return result;
	}		
	
	
	// Добавляет узел
	addNode(node) {
		if (node instanceof PGNode) {
			this.nodes[node.id] = node;
			node.render();
		}		
	}
	
	
	// Добавить линию
	addLine(line) {
		if (line instanceof PGLine)
		{
			this.lines[line.id] = line;
			line.render();
		}
	}	
	

	// Добавить нагрузку
	addLoad(load) {
		if (load instanceof PGLoad) {
			this.loads[load.id] = load;
			load.render();
		}
	}
	
	
	addSource(source) {
		if (source instanceof PGSource) {
			if (this.source instanceof PGSource) {
				this.source.unrender();
			}
			
			this.source = source;
			this.source.render();
		}
		
		if (!source) {
			this.source.unrender();
			this.source = undefined;
		}
	}
	
	// --- Графические элементы ---
	addFigure(figure) {
		if (figure instanceof Figure) {
			this.figures[figure.elem.id] = figure;
			//console.log(this.figures[figure.elem.id]);
			this.figures[figure.elem.id].elem.render();
		}
	}
	// - - - - - - - - - - - - - - -
	
	// Удалить узел
	deleteNode(nodeName)
	{		
		//alert();
	
		// !!!TODO Переписать
		if (typeof(nodeName) === "string")
		{
			// Удаляем линии, входящие или выходящие из этого узла
			for(let key in this.lines)
			{
				if (this.lines[key].startNode.id == nodeName || this.lines[key].finishNode.id == nodeName)
				{
					this.deleteLine(this.lines[key].id);
				}
			}
			
			// Удаляем нагрузки, присоединенные к этому узлу
			for(let key in this.loads)
			{
				if (this.loads[key].node.id == nodeName)
				{
					this.deleteLoad(this.loads[key].id);
				}
			}			
			
			// Удаляем источник, если он присоединен к этому узлу
			if (this.source && this.source.node && this.source.node.id == nodeName)
			{
				this.source.graphics.set.remove();
				this.source.graphics = undefined;
				this.source = undefined;
				//this.source.graphics.set.clear();
				//this.source = undefined;
			}
		
			// Удаляем сам узел			
			this.nodes[nodeName].unrender();
			delete this.nodes[nodeName];
			
			
		}
	}	
	
	
	// Удалить линию
	deleteLine(lineName) {
		this.lines[lineName].unrender();
		delete this.lines[lineName];	
	}
	
	// Удалить нагрузку
	deleteLoad(loadName) {
		if ((this.loads[loadName]) && (this.loads[loadName] instanceof PGLoad)) {
			this.loads[loadName].unrender();
			delete this.loads[loadName];
		}
	}
	
	// Удалить источник
	deleteSource(source) {
		if ((this.source) && (this.source instanceof PGSource)) {
			this.source.unrender();
			this.source = undefined;
		}
	}
	
	
	// --- Графические элементы ---
	deleteFigure(figureName) {
		if (this.figures[figureName] && (this.figures[figureName] instanceof Figure)) {
			if (this.figures[figureName].elem) {
				this.figures[figureName].elem.unrender();
				delete this.figures[figureName];
			}
		}
	}
	// - - - - - - - - - - - - - - -
	
	
	/**
	 *	Возвращает элемент сети по ID, в случае отсутствия элемента с заданным ID возвращается undefined
	 */
	findElemById(id) {
		if (id in this.nodes)
			return { type: "node", elem: this.nodes[id] };
			
		if (id in this.lines)
			return { type: "line", elem: this.lines[id] };

		if (id in this.loads)
			return { type: "load", elem: this.loads[id] };

		if (this.source)
			if (this.source.id == id)
				return { type: "source", elem: this.source };

		for(var figure_id in this.figures) {
			if (this.figures[figure_id].elem)
				if (this.figures[figure_id].elem.id == id)
					return { type: this.figures[figure_id].type, elem: this.figures[figure_id].elem };
		}
		
		return undefined;
	}
	
	
	// Все инструменты
	static TOOLS()
	{
		return [
				"tool_pointer",
				"tool_selection",
				"tool_node",
				"tool_line",
				"tool_load",
				"tool_source",
				//"tool_break", 
				//"tool_capacitor",
				"tool_rect",
				"tool_polyline",
				"tool_label",
				"tool_polygon",
				"tool_ellipse"
		];
	}


	// Отобразить форму редактирования параметров элемента в контейнере для параметров
	fillParamForm(form_html)
	{
		if (this.param_container_id)
			$("#" + this.param_container_id).html(form_html);
	}			
	
	
	// Очистить форму редактирования параметров элемента в контейнере для параметров
	initParamForm()
	{
		this.fillParamForm("");
	}
	
	
	getObj() {
		var _this = this;
	
		var res = {
			name: _this.name,
			//nodes: [],
			//lines: [],
			//loads: [],
			nodes: {},
			lines: {},
			loads: {},
			source: null,
			
			figures: {}
			// ---------
			/*
			rectangles: [],
			labels: [],
			polylines: []
			*/
			//figures: []
		};
	
	
		for(var key in this.nodes) {
			//res.nodes.push(_this.nodes[key].getObj());
			res.nodes[key] = _this.nodes[key].getObj();
		}
		
	
		for(var key in this.lines) {
			//res.lines.push(_this.lines[key].getObj());
			res.lines[key] = _this.lines[key].getObj();
		}		
		
		
		for(var key in this.loads) {
			//res.loads.push(_this.loads[key].getObj());
			res.loads[key] = _this.loads[key].getObj();
		}
		

		if (_this.source != undefined && _this.source.getObj() != undefined)
			res.source = _this.source.getObj();
		else
			res.source = null;
			
		// ----------
		/*
		for(var key in this.rectangles) {
			res.rectangles.push(_this.rectangles[key].getObj());
		}
		
		for(var key in this.labels) {
			res.labels.push(_this.labels[key].getObj());
		}
		
		for(var key in this.polylines) {
			res.polylines.push(_this.polylines[key].getObj());
		}		
*/
		for(var key in this.figures) {
			//res.figures.push(_this.figures[key].getObj());
			res.figures[key] = _this.figures[key].getObj();
		}				

		/*
		if (DEBUG_MODE)
			return JSON.stringify(res, null, 2);
			//return JSON.stringify(res);
		else
			//return JSON.stringify(res);
			return JSON.stringify(res, null, 2);
		*/
		
		return res;
	}
	
	
	getJSON(){
		return JSON.stringify(this.getObj(), null, 2);
	}
	
	
	// Обновляем размер схемы
	updateSize() {
		var new_width = 0;
		var new_height = 0;
	
		// Перебираем координаты узлов
		for(var key in this.nodes)
		{
			if (this.nodes[key].getParamVal('x') > new_width)
				new_width = this.nodes[key].getParamVal('x');
				
			if (this.nodes[key].getParamVal('y') > new_height)
				new_height = this.nodes[key].getParamVal('y');
		}

		// Перебираем координаты нагрузок
		for(var key in this.loads)
		{
			if (this.loads[key].getParamVal('x') > new_width)
				new_width = this.loads[key].getParamVal('x');
				
			if (this.loads[key].getParamVal('y') > new_height)
				new_height = this.loads[key].getParamVal('y');
		}

		// Источник
		if (this.source) {
			if (this.source.getParamVal('x') > new_width)
				new_width = this.source.getParamVal('x');
				
			if (this.source.getParamVal('y') > new_height)
				new_height = this.source.getParamVal('y');
		}
				
		new_width += 50;
		new_height += 50;
				
		if (new_width < PowerGrid.minSize.x)
			new_width = PowerGrid.minSize.x;
	
		if (new_height < PowerGrid.minSize.y)
			new_height = PowerGrid.minSize.y;
		
		
		if (this.paper)
		{
			this.size = {x: new_width, y: new_height};
			this.paper.setSize(new_width * this.scale, new_height * this.scale);
			this.paper.setViewBox(0, 0, new_width, new_height);
			this.paper.canvas.setAttribute('preserveAspectRatio', 'none');						
			
			$("#" + this.container_id).width(new_width * this.scale).height(new_height * this.scale);
			
			//$("#" + this.container_id).parent().scrollTop(new_width * this.scale); // !!! Неправильно скроллит ???
			//$("#" + this.container_id).parent().scrollLeft(new_height * this.scale);			
		}
	}
	
	
	unselectAll(exceptElem) {
		if (exceptElem)
			console.log(exceptElem.id);
			
		exceptElem = exceptElem || false;
		
		if (!exceptElem) {
			for(var figure_id in this.figures) {
				this.figures[figure_id].elem.unselect();
			}
			
			for(var elem_id in this.nodes) {
				this.nodes[elem_id].unselect();
			}
			
			for(var elem_id in this.loads) {
				this.loads[elem_id].unselect();
			}
			
			if (this.source) {
				this.source.unselect();
			}
			
		}
		else {
			for(var figure_id in this.figures) {
				if (this.figures[figure_id].elem != exceptElem)
					this.figures[figure_id].elem.unselect();
			}			
			
			for(var elem_id in this.nodes) {
				if (this.nodes[elem_id] != exceptElem)
					this.nodes[elem_id].unselect();
			}
			
			for(var elem_id in this.loads) {
				if (this.loads[elem_id] != exceptElem)
					this.loads[elem_id].unselect();
			}
			
			if (this.source) {
				if (this.source != exceptElem)
					this.source.unselect();
			}			
		}
	}
	
	
	// --- --- --- ---
	// Валидация схемы
	// --- --- --- ---
	//getErrors() {
	getErrorsForCalc() {
		var errors = {
			nodes: {
				groupErrors: [],
			},
			lines: { 
				groupErrors: [],
			},
			loads: {
				groupErrors: [],
			},
			//source: {},
			//figures: {}
		};
		var hasErrors = false;
		var errorsCount = 0;
		
		var errorGroups = Object.keys(errors);
		//console.log(errorGroups);
		
		// Отсутствие хотя бы 1го узла
		if (!Object.keys(this.nodes).length) {
			errors.nodes["group_errors"] = [];
			errors.nodes["group_errors"].push("На схеме не присутствует ни одного узла!");
			hasErrors = true;
			errorsCount++;
		}
		
		
		// Отсутствие хотя бы 1й нагрузки
		if (!Object.keys(this.loads).length) {
			errors.loads["group_errors"] = [];
			errors.loads["group_errors"].push("На схеме не присутствует ни одной нагрузки!");
			hasErrors = true;
			errorsCount++;
		}

		
		// Отсутствие хотя бы 1й линии
		if (!Object.keys(this.lines).length) {
			errors.lines["group_errors"] = [];
			errors.lines["group_errors"].push("На схеме не присутствует ни одной линии!");
			hasErrors = true;
			errorsCount++;
		}		
		
		
		// Для каждой группы элементов, с названием, совпадающим с группой ошибок для данных элементов
		for(var errorGroupKey in errorGroups) {
			// Наименование группы элементов
			var errorGroup = errorGroups[errorGroupKey];

			// Если данная группа элементов существует
			if (this[errorGroup]) {			
				// Ошибки каждого из элементов группы
				errors[errorGroup]["elem_errors"] = {};
				
				// Для каждого элемента группы элементов	
				for (var elemId in this[errorGroup]) {
					console.log(elemId);
					var elemErrors = this[errorGroup][elemId].getErrors();
					console.log(elemErrors);
					//if (elemErrors && elemErrors.length) {
					if (elemErrors && Object.keys(elemErrors).length) {
						errors[errorGroup]["elem_errors"][elemId] = elemErrors;
						hasErrors = true;
						
						//console.log(errorGroup + " - " + "elem_errors" + " - " + elemId);
						//errorsCount += 1; // !!!
						for(var paramName in elemErrors) {
							if (elemErrors[paramName] && elemErrors[paramName].length)
								errorsCount += elemErrors[paramName].length;
						}
						
					}
				}
			}
		}
		
		errors.source = {};
		// Отсутствие источника
		if (!this.source) {
			errors.source["group_errors"] = ["Источник питания отстутсвует на схеме!"];
			hasErrors = true;
			errorsCount++;
		} else {
			var sourceErrors = this.source.getErrors();
			if (sourceErrors && sourceErrors.length) {
				errors.source["group_errors"] = sourceErrors;
				hasErrors = true;
				errorsCount++;
			}
		}
		return { hasErrors: hasErrors, errorsCount: errorsCount, errors: errors };
	}
	
	
	// Таблица окна с ошибками, не позволяющими произвести расчет
	getCalcErrorsPopupBody() {
		/*
			|
			-	hasErrors: true|false
			|
			-	errors: {}
				|
				 -  nodes: {}
				|    |
				|	  - group_errors: []
				|	 |
				|	  - elem_errors: {}
				|	     |
				|		  - node_id_...
				|	 	 ...
				|	 	 |
				|	 	  - node_id_...					 
				|
				-  lines
				|	<like a nodes>
				|
				-  loads
				|	<like a nodes>
				|
				-  source
				     |
					 - group_errors				
				
		*/
		var calcErrors = this.getErrorsForCalc();
		/*
			<div class="panel panel-default">
				<div class="panel-heading"><b>Общие данные</b></div>
				
				<table class="table table-bordered table-condensed table-hover">
					<!--<thead class="thead-dark">-->
						<tr>
							<td>Наименование параметра</td>
							<td>Значение параметра</td>
						</tr>
					<!--</thead>-->
					<?php foreach($j_res['calc_data']['powergrid'] as $param_name => $param_value): ?>
						<tr>
							<td><?php echo Yii::$app->calc::getParamProp($param_name, 'translate')[Yii::$app->language]; ?></td><td><?php echo $param_value; ?></td>
						</tr>
					<?php endforeach; ?>
				</table>
			</div>		
		*/

		
		
		if (calcErrors.errors) {
			var div_panel = $('<div>', {class: "panel panel-default"});
			var div_panel_heading = $('<div>', {class: "panel-heading", text: "Общее количество ошибок: " + calcErrors.errorsCount});
			var table = $('<table>', {class: "table table-bordered table-condensed table-hover"});		
			
			// Источник
			if (calcErrors.errors.source) {
				// Source.group_errors
				if (calcErrors.errors.source.group_errors) {	
					// Заголовок Source.group_errors
					var tr = $('<tr>').append(
						$('<td>').attr('colspan', 2).append(
							$('<span>', {text: "Ошибки источника", css: {"font-size": "14px", "font-weight": "bold"}})
						)
					);
					table.append(tr);
				
					// Перечень ошибок
					for(var error_key in calcErrors.errors.source.group_errors) {
						var error_text = calcErrors.errors.source.group_errors[error_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: error_text})
							)							
						);
						table.append(tr);
					}
				}
			}
			
			// Узлы
			if (calcErrors.errors.nodes) {
				// Nodes.group_errors
				if (calcErrors.errors.nodes.group_errors) {
					// Заголовок Nodes.group_errors
					var tr = $('<tr>').append(
						$('<td>').attr('colspan', 2).append(
							$('<span>', {text: "Ошибки узлов", css: {"font-size": "14px", "font-weight": "bold"}})
						)
					);
					table.append(tr);
					
				
					// Перечень ошибок группы "Узлы"
					for(var error_key in calcErrors.errors.nodes.group_errors) {
						var error_text = calcErrors.errors.nodes.group_errors[error_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: error_text})
							)							
						);
						table.append(tr);
					}
				}
				
				// Перечень ошибок каждого из узлов
				if (calcErrors.errors.nodes.elem_errors) {
				
					if (Object.keys(calcErrors.errors.nodes.elem_errors).length) {
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: "Ошибки содержатся в следующих узлах:", css: {"font-size": "14px", "font-weight": "bold"}})
							)
						);
						table.append(tr);
					}
					
					for(var elem_errors_key in calcErrors.errors.nodes.elem_errors) {
						var elem_errors = calcErrors.errors.nodes.elem_errors[elem_errors_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', { text: "Узел " + elem_errors_key })
							)							
						);
						table.append(tr);
						
						for(var elem_error_param in elem_errors) {
							var error_text = elem_errors[elem_error_param];
							var tr = $('<tr>').append(
								$('<td>').append(
									$('<span>', { text: "Параметр " + elem_error_param })
								)							
							).append(
								$('<td>').append(
									$('<span>', { text: error_text })
								)							
							);
							table.append(tr);							
						}
					}
				}
			}
			
			
			// Линии
			if (calcErrors.errors.lines) {
				// lines.group_errors
				if (calcErrors.errors.lines.group_errors) {
					// Заголовок lines.group_errors
					var tr = $('<tr>').append(
						$('<td>').attr('colspan', 2).append(
							$('<span>', {text: "Ошибки линий", css: {"font-size": "14px", "font-weight": "bold"}})
						)
					);
					table.append(tr);
					
				
					// Перечень ошибок группы "Линии"
					for(var error_key in calcErrors.errors.lines.group_errors) {
						var error_text = calcErrors.errors.lines.group_errors[error_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: error_text})
							)							
						);
						table.append(tr);
					}
				}
				
				// Перечень ошибок каждой из линий
				if (calcErrors.errors.lines.elem_errors) {
				
					if (Object.keys(calcErrors.errors.lines.elem_errors).length) {
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: "Ошибки содержатся в следующих линиях:", css: {"font-size": "14px", "font-weight": "bold"}})
							)
						);
						table.append(tr);				
					}
					
					for(var elem_errors_key in calcErrors.errors.lines.elem_errors) {
						var elem_errors = calcErrors.errors.lines.elem_errors[elem_errors_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', { text: "Линия " + elem_errors_key })
							)							
						);
						table.append(tr);
						
						for(var elem_error_param in elem_errors) {
							var error_text = elem_errors[elem_error_param];
							var tr = $('<tr>').append(
								$('<td>').append(
									$('<span>', { text: "Параметр " + elem_error_param })
								)							
							).append(
								$('<td>').append(
									$('<span>', { text: error_text })
								)							
							);
							table.append(tr);							
						}
					}
				}
			}		

			// Нагрузки
			if (calcErrors.errors.loads) {
				// loads.group_errors
				if (calcErrors.errors.loads.group_errors) {
					// Заголовок loads.group_errors
					var tr = $('<tr>').append(
						$('<td>').attr('colspan', 2).append(
							$('<span>', {text: "Ошибки нагрузок", css: {"font-size": "14px", "font-weight": "bold"}})
						)
					);
					table.append(tr);
					
				
					// Перечень ошибок группы "Нагрузки"
					for(var error_key in calcErrors.errors.loads.group_errors) {
						var error_text = calcErrors.errors.loads.group_errors[error_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: error_text})
							)							
						);
						table.append(tr);
					}
				}
				
				// Перечень ошибок каждой из нагрузок
				if (calcErrors.errors.loads.elem_errors) {
				
					if (Object.keys(calcErrors.errors.loads.elem_errors).length) {
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', {text: "Ошибки содержатся в следующих нагрузках:", css: {"font-size": "14px", "font-weight": "bold"}})
							)
						);
						table.append(tr);
					}
					
					for(var elem_errors_key in calcErrors.errors.loads.elem_errors) {
						var elem_errors = calcErrors.errors.loads.elem_errors[elem_errors_key];
						
						var tr = $('<tr>').append(
							$('<td>').attr('colspan', 2).append(
								$('<span>', { text: "Нагрузка " + elem_errors_key })
							)							
						);
						table.append(tr);
						
						for(var elem_error_param in elem_errors) {
							var error_text = elem_errors[elem_error_param];
							var tr = $('<tr>').append(
								$('<td>').append(
									$('<span>', { text: "Параметр " + elem_error_param })
								)							
							).append(
								$('<td>').append(
									$('<span>', { text: error_text })
								)							
							);
							table.append(tr);							
						}
					}
				}
			}			
			
			
			div_panel.append(div_panel_heading);
			div_panel.append(table);			
			
			return div_panel;
		} else {
			return $('div', {text: "Ошибки отсутствуют!"})
		}
	}



}

// Инструмент по-умолчанию - укзатель
PowerGrid.TOOL_DEFAULT = PowerGrid.TOOLS()[0];

// Минимальный размер канваса схемы
PowerGrid.minSize = { x: 800, y: 600 };

// Загрузить из JSON-строки
PowerGrid.fromJSON = function(json, svg_container, param_container, view_only) {
	view_only = view_only || false;

	// Результативная схема
	var resPG = new PowerGrid(svg_container, param_container, view_only);
		
	// Объект с параметрами схемы
	var objPG;
	
	//console.log(json);
	
	// При возникновении ошибки на этапе парсинга JSON-описания схемы
	// вместо PowerGrid возвращается null
	try
	{
		// Объект с загружаемыми в схему данными
		objPG = JSON.parse(json);
		
		
		// Название сети
		//resPG.name = objPG.name;
		resPG.changeName(objPG.name);
		
		
		// Узлы
		for(var key in objPG.nodes)
		{
			// Все узлы загружаем из соответствующих частей объекта с параметрами схемы
			var tmp_node = new PGNode(resPG);
			tmp_node.fromObj(objPG.nodes[key]);
			// И добавляем в схему
			resPG.addNode(tmp_node);
		}
		
		
		// Линии
		for(var key in objPG.lines)
		{
			// Все линии загружаем из соответствующих частей объекта с параметрами схемы
			var tmp_line = new PGLine(
				resPG, 
				resPG.nodes[objPG.lines[key].startNode], 
				resPG.nodes[objPG.lines[key].finishNode], 
			);
			tmp_line.fromObj(objPG.lines[key]);
			// И добавляем в схему
			resPG.addLine(tmp_line);
		}
		
		
		// Нагрузки
		for(var key in objPG.loads)
		{
			// Все нагрузки загружаем из соответствующих частей объекта с параметрами схемы
			var tmp_load = new PGLoad(
				resPG, 
				resPG.nodes[objPG.loads[key].node]
			);
			tmp_load.fromObj(objPG.loads[key]);
			// И добавляем в схему
			resPG.addLoad(tmp_load);
		}
		
		
		// Источник
		if (objPG.source != null)
		{
			// Источник загружаем из соответствующей части объекта с параметрами схемы
			var tmp_source = new PGSource(resPG, resPG.nodes[objPG.source.node]);
			tmp_source.fromObj(objPG.source);
			// И добавляем в схему
			resPG.addSource(tmp_source);
		}
		else
		{
			objPG.source = null;
		}
		
		// ---------
		for(var key in objPG.figures)
		{
			var tmp_figure = new Figure(resPG);
			//console.log(objPG.figures[key]);
			tmp_figure.fromObj(objPG.figures[key]);
			//console.log(tmp_figure);
			// И добавляем в схему
			resPG.addFigure(tmp_figure);
			//console.log(resPG.figures);
		}	
		return resPG;
	}
	catch(e)
	{
		console.log(e);
		
		// !!! Очистить канвас
		return null;
	}
	
	return null;
}

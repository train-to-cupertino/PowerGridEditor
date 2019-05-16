class Ellipse extends GraphicElement {

	constructor(_pg) {
		super(_pg);	
			
		// Параметры
		this.param = {
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
		}
		
		this.id = PGElement.getUniqueID("ellipse_");
	}
	
	render() {
		try {
			super.render();
		}
		catch(e) {
			return;
		}

		var _this = this;

		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.figures);
		
		this.graphics.add("body", 
			this.pg.paper.ellipse(0, 0, 100, 50)
			.transform("t" + _this.coords.x + "," + _this.coords.y)
			.attr('fill', _this.getParamVal("fillColor"))
			.attr('stroke', _this.getParamVal("drawColor"))
			.data("elem", this)
			.click(function(e){
				if (_this.pg.view_only)
					return;
				
				_this.select();
				/*
				_this.initFt();
				if (_this.freeTransform)
					_this.freeTransform.showHandles();
				*/
			})
		);
		
		this.graphics.set
		.click(function(e){
			if (_this.pg.view_only)
				return;			
			
			switch(_this.pg.getCurrentTool())
			{
				case "tool_pointer":
					_this.select();
					_this.openParamForm();
				break;			
			}
		});		
		
		_this.initFt();
		
		if (this.freeTransform)
			this.freeTransform.hideHandles();
	}


	// Открывает форму с параметрами для редактирования
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
		
		$('<input>', {
			type: "button",
			value: "Удалить этот эллипс",
			class: "delete_elem_btn",
			on: {
				click: function(event){
					var _this_elem = _this;
					
					/*
					_this.pg.actionManager.addAction(
					
						function(){
							//_this.pg.addEllipse(_this_elem);
							_this.pg.addFigure(_this_elem);
						},
						
						function() {
							//_this.pg.deleteEllipse(_this_elem.id);
							_this.pg.deleteFigure(_this_elem.id);
						},
						
						"Добавить эллипс",
						
						"Удалить эллипс"
					);
					*/
					
						// Запоминаем состояние фигуры
						var jsonFigure = JSON.stringify(_this.pg.figures[_this_elem.id].getObj());				
						
						// Запоминаем ID фигуры
						var figure_elem_id = _this_elem.id;
						
						// Добавляем действие в менеджер действий
						_this.pg.actionManager.addAction(
						
							function() {
								// Добавить фигуру
								//_this.addFigure(tmp_figure);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, jsonFigure);
							},						
						
							function() {
								// Удалить фигуру
								//_this.deleteFigure(tmp_figure.elem.id);
								PGActions.stdUndoRedoFunc("figures", figure_elem_id, undefined);
							},
							
							"Добавить метку",
							
							"Удалить метку"
						);
					
					//_this.pg.deleteEllipse(_this.id);
					_this.pg.deleteFigure(_this_elem.id);
					_this.pg.initParamForm();
				}
			}
		}).appendTo("#" + _this.pg.param_container_id);
	}
}
class Label extends GraphicElement {

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
				value: "rgb(0, 0, 0)",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { elem.attr({ fill: pgElem.param['fillColor'].value }); });
				},
				translate: {
					ru: "Цвет заливки"
				}
			},
			
			// Текст метки
			text: {
				type: "string",
				value: "Введите текст",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { 
						elem.attr({ text: pgElem.param['text'].value });
					});
				},
				translate: {
					ru: "Текст"
				}
			},			
			
			fontfamily: {
				type: "set",
				value: "Arial",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { 
						elem.attr({ "font-family": pgElem.param['fontfamily'].value });
					});					
				},
				translate: {
					ru: "Шрифт"
				},
				set: {
					// Ключ = атрибут font-family, значение = наименование в выпадающем списке
					"Arial, Helvetica, sans-serif": "Arial",
					"Times New Roman": 				"Times New Roman",
					"courier": 						"Courier",
				}	
			},
			
			fontweight: {
				type: "set",
				value: "normal",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { 
						elem.attr({ "font-weight": pgElem.param['fontweight'].value });
					});					
				},
				translate: {
					ru: "Жирный"
				},
				set: {
					"bold": 	"Да",
					"normal": 	"Нет",
				}
			}, 				
			
			fontstyle: {
				type: "set",
				value: "normal",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { 
						elem.attr({ "font-style": pgElem.param['fontstyle'].value });
					});					
				},
				translate: {
					ru: "Курсив"
				},
				set: {
					"italic": 	"Да",
					"normal": 	"Нет",
				}
			}, 
			
			fontdecoration: {
				type: "set",
				value: "none",
				isSaveable: true,
				isEditableByUser: true,
				onChange: function(pg, pgElem) {
					pgElem.graphics.exec("body", function(elem) { 
						$(elem.node).css("text-decoration", pgElem.param['fontdecoration'].value);
					});					
				},
				translate: {
					ru: "Подчеркнутый"
				},
				set: {
					"underline": 	"Да",
					"none":		 	"Нет",
					//"green wavy underline": "test",
				}
			}, 		
		}
		
		this.id = PGElement.getUniqueID("label_");
	}
	
	
	render() {
		try {
			super.render();
		}
		catch(e) {
			return;
		}

		var _this = this;

		//this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.labels);
		this.graphics = new PGElemGraphics(this.pg.paper, this.pg.groups.figures);
		
		this.graphics.add("body", 
			this.pg.paper.text(0, 0, _this.getParamVal("text"))
			.transform("t" + _this.coords.x + "," + _this.coords.y)
			.attr('stroke', _this.getParamVal("drawColor"))
			.attr('fill', _this.getParamVal("fillColor"))
			.attr('font-family', _this.getParamVal("fontfamily"))
			.attr('font-style', _this.getParamVal("fontstyle"))
			.attr('font-weight', _this.getParamVal("fontweight"))
			//.attr('text-decoration', _this.getParamVal("fontdecoration"))
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
		
		this.graphics.exec("body", function(elem) {
			$(elem.node).css("text-decoration", _this.param['fontdecoration'].value);
		});					
		//$(elem.node).css("text-decoration", pgElem.param['fontdecoration'].value)
		
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
		
		this.initFt();
		
		if (this.freeTransform)
			this.freeTransform.hideHandles();
	}


	// Открывает форму с параметрами для редактирования
	openParamForm() {
		super.openParamForm();
		
		var _this = this;
		
		$('<input>', {
			type: "button",
			value: "Удалить этот текст",
			class: "delete_elem_btn",
			on: {
				click: function(event){
					var _this_elem = _this;
					
					/*
					_this.pg.actionManager.addAction(
					
						function(){
							//_this.pg.addLabel(_this_elem);
							_this.pg.addFigure(_this_elem);
						},
						
						function() {
							//_this.pg.deleteLabel(_this_elem.id);
							_this.pg.deleteFigure(_this_elem.id);
						},
						
						"Добавить текст",
						
						"Удалить текст"
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
					
					//_this.pg.deleteLabel(_this.id);
					_this.pg.deleteFigure(_this.id);
					_this.pg.initParamForm();
				}				
			}
		}).appendTo("#" + _this.pg.param_container_id);			
	}
}
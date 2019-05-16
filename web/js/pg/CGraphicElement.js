class GraphicElement extends PGElement {

	constructor(_pg) {
		super(_pg);	
		
		this.coords = {x: 0, y: 0};
		this.freeTransform = undefined;
		this.ftAttrs = undefined;
		
		//this.newAttrs = {};
		//this.oldAttrs = {};
		this.flagFirstInit = true;
		// ---
		this.oldJSON = undefined;
		this.newJSON = undefined;
		//this.newJSON = JSON.stringify(this.getObj());
		console.log('1 newJSON = ' + this.newJSON);
		// ---
	}
	
	initFt() {
		var _this = this;
		
		if (this.graphics.get("body")) {
			// Инициализация плагина FreeTransform
			this.freeTransform = this.pg.paper.freeTransform(
				// Элемент, для которого выполняется инициализация
				this.graphics.get("body"),
				
				//{}, 
				//{attrs: {stroke: '#ff00ff'}, draw: [ 'bbox' ]},
				// Опции плагина
				{attrs: {stroke: '#00ff00'}, draw: [ 'bbox' ]},
				
				// Callback-функция
				function(e) {
					var events = arguments[1];

					// При начале/выполнении/окончании действий "поворот", "масштабирование", "перетаскивание" 
					// выполняется проверка на нажатие Alt для привязки к сетке
					if (false
						|| 
						events.indexOf("rotate start") != -1 || events.indexOf("rotate") != -1 || events.indexOf("rotate end") != -1 || 
						events.indexOf("scale start") != -1 || events.indexOf("scale") != -1 || events.indexOf("scale end") != -1 || 
						events.indexOf("drag start") != -1 || events.indexOf("apply") != -1 || events.indexOf("drag end") != -1
						
					) {
						// Если при повороте, масштабировании или перетаскивании нажат Alt,
						// то включаем параметры привязки к сетке. Если Alt не нажат, то отключаем их
						if (pgApp.altPressed) {
							e.opts.snap = PGApp.snapAlt;
							e.opts.snapDist = PGApp.snapDistAlt;
						}
						else {
							e.opts.snap = PGApp.snap;
							e.opts.snapDist = PGApp.snapDist;						
						}
					}
					
					// Список параметров
					var attrList = ["center", "ratio", "rotate", "scale", "size", "translate", "x", "y"];
					
					
					// При первой трансформации - запомнить текущие атрибуты
					if (_this.flagFirstInit) {
						_this.oldJSON = _this.newJSON;
						_this.newJSON = JSON.stringify(_this.getObj());					
						console.log('1.5 newJSON = ' + _this.newJSON);
					
						_this.flagFirstInit = false;
					}
					
					
					// По окончании трансформации
					if (events.indexOf("rotate end") != -1 || events.indexOf("scale end") != -1 || events.indexOf("drag end") != -1) {
					
						console.log('2 newJSON = ' + _this.newJSON);
						_this.oldJSON = _this.newJSON;
						_this.newJSON = JSON.stringify(_this.getObj());
						console.log('3 newJSON = ' + _this.newJSON);
						
						
						//var _this_oldJSON = ("!"._this.oldJSON).substr(1);
						var _this_oldJSON = _this.oldJSON;
						var _this_newJSON = _this.newJSON;
					
						/*
						// Добавляем действие ввода значения параметра в менеджер действий
						_this.pg.actionManager.addAction(
							function(){
								for(var attrKey in attrList) {
									var attrName = attrList[attrKey];
										console.log(attrName + ':');
										console.log(_this.newAttrs[attrName]);
									_this.freeTransform[attrName] = _this.oldAttrs[attrName];
								}
								console.log(_this.freeTransform.attrs);
								_this.freeTransform.apply();
							},
							
							function() {
								for(var attrKey in attrList) {
									var attrName = attrList[attrKey];
										console.log(attrName + ':');
										console.log(_this.oldAttrs[attrName]);
									_this.freeTransform[attrName] = _this.newAttrs[attrName];					
								}
								_this.freeTransform.apply();
							},
							
							"Отменить преобразование",
							
							"Вернуть преобразование"
						);
						*/
						
						// Добавляем действие ввода значения параметра в менеджер действий
						_this.pg.actionManager.addAction(
							function(){
								PGActions.stdUndoRedoFunc("figures", _this.id, _this_oldJSON);
								//_this.freeTransform.apply();
								console.log(_this.id, _this_oldJSON);
							},
							
							function() {
								PGActions.stdUndoRedoFunc("figures", _this.id, _this_newJSON);
								//_this.freeTransform.apply();
								console.log(_this.id, _this_newJSON);
							},
							
							"Отменить преобразование",
							
							"Вернуть преобразование"
						);						
					}					
				}
			);
			
				console.log('-> ftAttrs');
				console.log(_this.ftAttrs);
				if (_this.ftAttrs)
					console.log(Object.keys(_this.ftAttrs).length);
				else
					console.log('undef');
			
			if (_this.ftAttrs && (Object.keys(_this.ftAttrs).length > 0)) {
				_this.freeTransform.attrs = _this.ftAttrs;
				_this.freeTransform.apply();
				_this.ftAttrs = undefined;
			}			
		}
	}
	//}	
	
	afterRender() {
		
	}
	
	unrender(){
		if (this.freeTransform) {
			this.freeTransform.unplug();
			this.freeTransform = undefined;
		}
	
		super.unrender();
	}
	
	// Возвращает объект для сохранения в строковом виде
	getObj()
	{
		var obj = super.getObj();		
		
		if (this.freeTransform && this.freeTransform.attrs)
			obj.attrs = this.freeTransform.attrs;
		else
			obj.attrs = {};
		
		return obj;
	}	
	
	
	// Воссоздает экземпляр класса из сохраненного ранее объекта
	fromObj(_obj)
	{
		super.fromObj(_obj);
		
		if(_obj.attrs) {;
			this.ftAttrs = _obj.attrs;
		}
		
	}
	
	openParamForm() {
		super.openParamForm();
		
		var _this = this;
		
		// Переместить наверх
		$('<input>', {
			type: "button",
			value: "Наверх",
			//class: "delete_elem_btn",
			style: "display: block; margin: 0 0 10px 0;",
			on: {
				click: function(event){
					//_this.setParamVal('fillColor', 'none');
					_this.pg.figures[_this.id].onTop();
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
	}
	
	
	onSelect() {
		this.pg.unselectAll(this);
		
		this.initFt();
		if (this.freeTransform)
			this.freeTransform.showHandles();
	}
	
	
	onSelectMany() {
		this.initFt();
		if (this.freeTransform)
			this.freeTransform.showHandles();
	}
	
	
	onUnselect() {
		if (this.freeTransform)
			this.freeTransform.unplug();		
	}
}
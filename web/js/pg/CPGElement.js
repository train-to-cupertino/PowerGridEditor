// Bounding box of elements set
Raphael.st.getBBox = function(isWithoutTransform) {
	var set_bbox = {
		x: Infinity, y: Infinity,
		width: 0, height: 0
	};
	
    this.forEach(function (el) {
		var el_bbox = el.getBBox(isWithoutTransform);
		
		set_bbox.x = Math.min(el_bbox.x, set_bbox.x);
		set_bbox.y = Math.min(el_bbox.y, set_bbox.y);
		
		set_bbox.width = Math.max(el_bbox.width, set_bbox.width);
		set_bbox.height = Math.max(el_bbox.height, set_bbox.height);		
    });	
	//console.log(set_bbox);
	return set_bbox;
}

Raphael.el.getRotateAngle = function() {
	return Math.acos(this.matrix.a);
};

// use md5.js

class PGElement // extends PGBase
{
	// Конструктор
	constructor(_pg) {
		// Экземпляр схемы сети, который принадлежит данный элемент		
		// !!!TODO... Добавить проверку на тип PowerGrid
		this.pg = _pg;
		
		// Параметры элемента сети
		this.param = {
			
		};
		
		// Идентификатор элемента
		this.id = "";

		// Графика элемента
		this.graphics = undefined;
		
		// Является ли выбранным
		this.isSelected = false;
		
		// Мигает ли в данный момент
		this.isBlinking = false;
	}
	
	// Возвращает значение свойства параметра
	getParamProp(paramName, propName) {
		//var _this = this;
		
		//if (_this.param && _this.param[paramName] && (propName in _this.param[paramName])){
			//return _this.param[paramName][propName];
		if (this.param && this.param[paramName] && (propName in this.param[paramName])){
			return this.param[paramName][propName];			
		}
		
		return undefined;
	}
	
	// Возвращает значение параметра
	getParamVal(paramName) {
		//console.log(paramName + " " + typeof this.getParamProp(paramName, "value"));
		//console.log(this.getParamProp(paramName, "value"));
		
		if ((typeof this.getParamProp(paramName, "value")) == "function") {
			
			return this.getParamProp(paramName, "value")(this);
		}
		else {
			
			return this.getParamProp(paramName, "value");
		}
	}	
	
	
	// Устанавливает значение свойства параметра
	setParamProp(paramName, paramProp, val) {
		if (this.param && (paramName in this.param)){
			this.param[paramName][paramProp] = val;
			if (paramProp == "value")
				this.param[paramName].onChange(this.pg, this);
		}		
	}
	
	
	// Устанавливает значение параметра
	setParamVal(paramName, val){
		var isFunc = (typeof this.getParamProp(paramName, "value")) == "function";
		if (isFunc) {
			var lastValue = this.param[paramName]["value"];
			//console.log(lastValue);
		}
	
		this.setParamProp(paramName, "value", val);
		
		if (isFunc) {
			//this.setParamProp(paramName, "value", lastValue);
			this.param[paramName]["value"] = lastValue;
		}		
	}	
	
	
	// Валидация параметра
	getParamErrors(paramName) {
		var _this = this;
		// Значение параметра
		var val = _this.getParamVal(paramName);
		// Перечень ошибок
		var paramErrors = [];
		// Редактор значений
		var editor = undefined;
		//
		var typeErrorMessage = "Неизвестная ошибка!";
		
		switch(_this.getParamProp(paramName, 'type'))
		{
			// Целочисленный параметр
			case "integer":
				// Объект редактора целочисленных значений
				editor = PGIntegerParamEditor.create(_this, paramName);
				typeErrorMessage = "Значение параметра должно быть целым числом!";
			break;
					
			// Вещественный параметр
			case "float":
				editor = PGFloatParamEditor.create(_this, paramName);
				typeErrorMessage = "Значение параметра должно быть вещественным числом!";
			break;
					
			// Цветовой параметр
			case "color":
				editor = PGColorParamEditor.create(_this, paramName);
				typeErrorMessage = "Значение параметра должно представлять собой цвет в RGB формате: \"rgb(x, y, z)!\"";
			break;
					
			// Параметр "значение из набора"
			case "set":
				var set = ('set' in _this.param[paramName]) ? _this.getParamProp(paramName, 'set') : {};
				editor = PGSetParamEditor.create(_this, paramName, set);
				//typeErrorMessage = "Значение параметра должно принадлежать множеству значений: [" + (Object.keys(set).join("; ")) + "]!";
				typeErrorMessage = "Значение параметра должно принадлежать множеству значений: [" + (Object.values(set).join("; ")) + "]!";
				//typeErrorMessage = "Значение параметра должно принадлежать множеству значений!";
			break;				
					
			// Строковый параметр
			case "string":
				editor = PGStringParamEditor.create(_this, paramName);
				typeErrorMessage = "Значение параметра должно быть строкой!";
			break;
					
			case "function":
				// Функции не валидируются
				return [];
			break;

			/*
			default:
			
			break;
			*/
		}
		
		// Если ни один из типов параметров не существует
		if (!editor)
			return ["Неизвестный тип параметра"];
			
		// Валидируем значение параметра функцией валидации соответствия типу
		// Пополняем перечень ошибок, возвращаемых функцией валидации соответствия параметра типу
		if (!editor.validate(val)) {
			paramErrors.push(typeErrorMessage);
		}			
		
		// Кастомная функция валидации параметра
		var getErrorsFunc = _this.getParamProp(paramName, 'getErrorsFunc');
		// Если свойство "getErrorsFunc" существует и является функцией
		if (getErrorsFunc && (typeof getErrorsFunc === "function")) {
			// Валидируем значение параметра его кастомной функцией
			// Пополняем перечень ошибок, возвращаемых кастомной функцией валидации параметра
			paramErrors = paramErrors.concat(getErrorsFunc(val));
		}
		
		return paramErrors;
	}
	
	
	// Перечень ошибок
	getErrors() {
		var errors = {};
		//var errors = [];
	
		for(var paramName in this.param)
		{
			var paramErrors = this.getParamErrors(paramName);
			
			if (paramErrors && paramErrors.length) {
				var translate = this.getParamProp(paramName, 'translate');
				if (translate && translate.ru)
					errors[translate.ru] = paramErrors;
				else
					errors[paramName] = paramErrors;
			}
		}
		
		return errors;
	}
	
	
	// Возвращает объект для сохранения в строковом виде
	getObj()
	{
		var obj = {};
		
		for(var paramName in this.param) {
			if (this.getParamProp(paramName, "isSaveable"))
				obj[paramName] = this.getParamVal(paramName);		
		}
		
		obj.id = this.id;		
		
		return obj;
	}
	
	
	// Воссоздает экземпляр класса из сохраненного ранее объекта
	fromObj(_obj)
	{
		var _this = this;
	
		// Заполняем элемент свойствами
		if (_this.param) {
			for(var prop in _obj) {
				if (prop in _this.param)
					_this.param[prop].value = _obj[prop];
				else
					_this[prop] = _obj[prop];
			}
		}
		//console.log(_obj);	
		_this.id = _obj.id;
	}
	
	
	// Отрисовать графику
	render() {
		if (!this.pg.paper)
			throw {
				text: "Error! Undefined canvas for this schema!"
			}
	}
	
	
	afterRender() {
		if (!this.graphics.get("bbox")) {
			// Добавляем выделение элемента
			if (this.graphics.add("bbox", this.selectionBox())) {
				this.graphics.exec("bbox", function(elem) {
					elem.hide();
				});
			}
		}
	}
	
	
	// Акцентирует внимание на элементе.
	// Передвигает горизонтальную и вертикальную прокрутки так,
	// чтобы элемент оказался как можно ближе к центру контейнера.
	accent() {
		var c = this.getCenter();
		pgApp.scrollOuterContainerTo(c.x, c.y);
		this.blink();		
	}
	
	
	getCenter() {
		var res = { x: 0, y: 0 };
		
		this.graphics.exec("body", function(elem) { 
			var bbox = elem.getBBox();
			res = { x: bbox.cx, y: bbox.cy };
		});
		
		return res;
	}
	
	
	// Возвращает ограничивающий контейнер для графики элемента сети
	selectionBox() {
		//var bbox = this.graphics.set.getBBox(); 
		var bbox = this.graphics.get("body").getBBox();
		var stroke_width = 1;
		
		var box = this.pg.paper.rect(
			bbox.x - stroke_width, 
			bbox.y - stroke_width, 
			bbox.width + stroke_width, 
			bbox.height + stroke_width)
			.attr({
				fill: 'none', 
				stroke: '#ff00ff', 
				'stroke-dasharray': "- ", 
				'stroke-width' : stroke_width});
		
		return box;
	}
	
	
	// Удалить графику
	unrender() {
		if (this.graphics && this.graphics.set /* !!! && typeof(this.graphics.set) == raphael~set */) {
			this.graphics.set.forEach(function(el){
				el.remove();
			});
			
			this.graphics = undefined;
		}
	}	
	
	
	// Перемещение объекта (необходима реализация в дочернем классе)
	moveTo(x, y) {
		// Если нажат Alt
		if (pgApp.altPressed)
		{
			// То координаты округляются до кратного PGApp.gridStep числа
			x = Math.round(x / PGApp.gridStep) * PGApp.gridStep;
			y = Math.round(y / PGApp.gridStep) * PGApp.gridStep;
			
			return {x: x, y: y};
		}
		
		return {x: x, y: y};
	}
	
	
	// Выполняет мигание элементом
	blink() {
		var _this = this;
		
		if (_this.isBlinking)
			return;
		
		_this.isBlinking = true;
		
		// Запоминаем текущие значения обводки и заливки, чтобы вернуть их после выполнения анимации
		//var oldAttrs = { stroke: "rgb(0, 0, 0)" };
		var oldAttrs = { stroke: "rgb(0, 0, 0)", 'stroke-width': 1 };
		
		_this.graphics.exec("body", function(elem) {
			if (elem.attr("fill") == "none")
				//oldAttrs = { stroke: elem.attr("stroke") };
				oldAttrs = { stroke: elem.attr("stroke"), 'stroke-width': elem.attr("stroke-width") };
			else
				//oldAttrs = { stroke: elem.attr("stroke"), fill: elem.attr("fill") };
				oldAttrs = { stroke: elem.attr("stroke"), 'stroke-width': elem.attr("stroke-width"), fill: elem.attr("fill") };
		});
	
		// Анимация мигания
		_this.graphics.exec("body", function(elem) { 
			elem.animate(
				//{ stroke: PGElement.blinkColor, fill: PGElement.blinkColor },
				//(elem.attr("fill") == "none") ? { stroke: PGElement.blinkColor } : { stroke: PGElement.blinkColor, fill: PGElement.blinkColor },
				(elem.attr("fill") == "none") ? 
				{ stroke: PGElement.blinkColor, 'stroke-width': PGElement.blinkStrokeSize } : 
				{ stroke: PGElement.blinkColor, 'stroke-width': PGElement.blinkStrokeSize, fill: PGElement.blinkColor },
				PGElement.blinkTime, 
				"bounce", 
				function() {
					
					console.log(oldAttrs);
					elem.animate(
						oldAttrs, 
						PGElement.blinkTime, 
						"bounce",
						function() { _this.isBlinking = false; }
						//_this.graphics.exec("body", function(elem) { elem.attr(oldAttrs); _this.isBlinking = false; })
					);
					//_this.isBlinking = false;
				}
			)
			/*.animate(
				oldAttrs, 
				PGElement.blinkTime/*, 
				_this.graphics.exec("body", function(elem) { elem.attr(oldAttrs); _this.isBlinking = false; })
			)*/;
		});
	}
	
	
	// Объект с данными для формы редактирования параметров элемента
	getParamFormObject() {
		var res = {params: []};
		var _this = this;
		
		var colorParams = [];
		
		res.id_block = $('<span>', {
			//text: "ID: " + ,
			text: _this.id,
			"data-elem-id": _this.id,
			class: "elem_id",
			style: 'color: #23527c; text-decoration: underline; cursor: pointer;',
			on: {
				click: function(event){
					//var id = $(this).data("elem-id");
					//alert(id);
					//console.log(_this.pg.findElemById(id));
					/*
					var c = _this.getCenter();
					pgApp.scrollOuterContainerTo(c.x, c.y);
					_this.blink();
					*/
					_this.accent();
					//console.log();
				}
			}
		});
		
		for(var paramName in _this.param)
		{
			// Если свойство может редактироваться пользователем
			if (_this.getParamProp(paramName, 'isEditableByUser') === true)
			{
				// Перевод названия параметра (в данном случае используется русский язык)
				var paramTranslateList = _this.getParamProp(paramName, 'translate');
				var paramTranslate = ((paramTranslateList != undefined) && ('ru' in paramTranslateList)) ? paramTranslateList['ru'] : paramName;
			
				switch(_this.getParamProp(paramName, 'type'))
				{
					// Целочисленный параметр
					case "integer":
						var editor = PGIntegerParamEditor.create(_this, paramName);
						
						res.params.push({
							name: $('<span>', {text: paramTranslate}),
							paramName: paramName,
							type: "integer",
							inputDomNode: editor.inputFieldDomNode,
							errorDomNode: editor.errorLabelDomNode
						});
					break;
					
					// Вещественный параметр
					case "float":
						var editor = PGFloatParamEditor.create(_this, paramName);

						res.params.push({
							name: $('<span>', {text: paramTranslate}),
							paramName: paramName,
							type: "float",
							inputDomNode: editor.inputFieldDomNode,
							errorDomNode: editor.errorLabelDomNode
						});
					break;
					
					// Цветовой параметр
					case "color":
						var editor = PGColorParamEditor.create(_this, paramName);
						
						res.params.push({
							name: $('<span>', {text: paramTranslate}),
							paramName: paramName,
							type: "color",
							inputDomNode: editor.inputFieldDomNode, // !!! .spectrum ?
							errorDomNode: editor.errorLabelDomNode
						});						
						
					break;
					
					// Параметр "значение из набора"
					case "set":
						//var editor = PGSetParamEditor.create(_this, paramName, this.param[paramName].set ? this.param[paramName].set : {});
						var editor = PGSetParamEditor.create(_this, paramName, ('set' in this.param[paramName]) ? this.getParamProp(paramName, 'set') : {});

						res.params.push({
							name: $('<span>', {text: paramTranslate}),
							paramName: paramName,
							type: "set",
							inputDomNode: editor.inputFieldDomNode,
							errorDomNode: editor.errorLabelDomNode
						});						
					break;				
					
					// Строковый параметр
					case "string":
						var editor = PGStringParamEditor.create(_this, paramName);

						res.params.push({
							name: $('<span>', {text: paramTranslate}),
							paramName: paramName,
							type: "string",
							inputDomNode: editor.inputFieldDomNode,
							errorDomNode: editor.errorLabelDomNode
						});						
					break;
					
					case "function":
					
					break;
					/*
					default:
					
					break;
					*/
				}
				
				
			}
		}		
		
		return res;
	}
	
	
	// Содержимое формы редактирования параметров элемента
	getParamFormContent() {
		var obj = this.getParamFormObject();
		var _this = this;
		
		var table = $('<table>', {class: "param_table"});
		
		// ID элемента
		table.append(
			$('<tr>').append(
				$('<td>').attr('colspan', 2).append(
					$('<span>', {text: "Параметры элемента", css: {"font-size": "14px", "font-weight": "bold"}})
				)
			)
		);		
		
		// Параметры элемента
		for(var key in obj.params)
		{
			var input = obj.params[key].inputDomNode;
			
			table.append(
				$('<tr>').append(
					$('<td>').append(
						obj.params[key].name
					)
				).append(
					$('<td>').append(
						input
					)
				)
			)
			.append(
				$('<tr>', {css: {"border-bottom": "1px solid #f8f8f8 !important"}}).append(
					$('<td>').attr('colspan', 2).append(
						obj.params[key].errorDomNode
					)
				)
			);
			
			// Для цветовых параметров инициализируем ColorPicker
			if (obj.params[key].type == "color")
				input.spectrum({
							//showAlpha: true,
							//showInput: true,
							preferredFormat: "rgb",
							showPaletteOnly: true,
							showPalette:true,
							color: _this.getParamVal(obj.params[key].paramName),
							palette: [
								["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
								["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
								["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
								["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
								["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
								["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
								["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
								["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
							]							
				});
		}
		
		// ID элемента
		table.append(
			$('<tr>').append(
				$('<td>').attr('colspan', 2).append(
					obj.id_block
				)
			)
		);		
		
		
		return table;
	}
	
	
	// Открытие формы с параметрами для их редактирования
	openParamForm() {
		var _this = this;
		console.log(_this);
		_this.pg.initParamForm();
		
		var form = _this.getParamFormContent();
		
		if (_this.pg.param_container_id){
			$("#" + _this.pg.param_container_id).append(form);
		}
	}
	
	
	// Отрисовать bbox
	select() {
		/*
		if (!this.graphics.get("bbox")) {
			this.graphics.add("bbox", selectionBox());
		}
		
		this.graphics.exec("bbox", function(elem) { elem.show(); })
		*/
	}
	
	
	// Убрать bbox
	unselect() {
		/*
		if (!this.graphics.get("bbox")) {
			this.graphics.add("bbox", selectionBox());
		}
		
		this.graphics.exec("bbox", function(elem) { elem.hide(); })		
		*/
	}
	
	
	updateSelectionBox(bbox) {
		if (!this.graphics.get("bbox")) {
			this.graphics.add("bbox", selectionBox());	
		}
	
		this.graphics.exec("bbox", function(elem) {
			elem.attr({
				x: bbox.x,
				y: bbox.y,
				width: bbox.width,
				height: bbox.height
			});
		});
	}
	
/*	
	onSelect() {
		
	}
	
	
	onUnselect() {
		
	}
*/
	onUnselect() {
		/*
		this.graphics.exec("bbox", function(elem) {
			elem.hide();
		});	
		*/
	}
	
	
	onSelect() {
		/*
		this.pg.unselectAll(this);
		this.graphics.exec("bbox", function(elem) {
			elem.show();
		});
		*/
	}
	
	onSelectMany() {
		this.graphics.exec("bbox", function(elem) {
			elem.show();
		});	
	}
	
	select() {
		this.isSelected = true;
		this.onSelect();
	}
	
	
	selectMany() {
		this.isSelected = true;
		this.onSelectMany();
	}	
	
	
	unselect() {
		this.isSelected = false;
		this.onUnselect();
	}
	
	
	// Возвращает уникальный в пределах схемы идентификатор элемента
	static getUniqueID(prefix, collectionsToCheck) {
		console.log('id generation');
		// Функция генерации идентификатора
		let generateId = function(pref) {
			return pref + ("xxxx-xxxx-xxxx".split('').map(function(s) {
                return s === 'x' ? s.replace(/x/, Math.random().toString(36).slice(-1)) : s
                //return s === 'x' ? s.replace(/x/, Math.random().toString(16).slice(-1)) : s
            })).join('');
            
		    /*
            return pref + ("x".split('').map(function(s) {
                //return s === 'x' ? s.replace(/x/, Math.random().toString(36).slice(-1)) : s
                return s === 'x' ? s.replace(/x/, Math.random().toString(16).slice(-1)) : s
            })).join('');
         	*/
		};

		// Коллекции элементов для проверки
		collectionsToCheck = collectionsToCheck || [pgApp.pg.nodes, pgApp.pg.lines, pgApp.pg.loads, pgApp.pg.figures];

		// Изначально считаем, что идентификатор не уникален
		let isUnique = false;

        let generatedId = undefined;

		// Пока сгенерированный идентификатор совпадает
		// хоть с одним другим идентификатором в заданных коллекциях:
		while (!isUnique) {
            // Сгенерированный идентификатор элемента
            generatedId = generateId(prefix);

            console.log('id = ' + generatedId);

			// Флаг уникальности
			let uniqueFlag = true;

			for(let collectionName in collectionsToCheck) {
				let collection = collectionsToCheck[collectionName];

				for(let elemId in collection) {
					let pgelem = collection[elemId];

					if (pgelem.id) {
						if (pgelem.id == generatedId) {
							uniqueFlag = false;
						}
					}

					if (pgelem.elem && pgelem.elem.id) {
                        if (pgelem.elem.id == generatedId) {
                            uniqueFlag = false;
                        }
					}
				}
			}

            isUnique = uniqueFlag;
        }
        console.log('--------------------');

		return generatedId;
		/*
		// !!!TODO... Проверка на существование такого ID у других элементов схемы
		return prefix + ("xxxx-xxxx-xxxx".split('').map(function(s) { 
			return s === 'x' ? s.replace(/x/, Math.random().toString(36).slice(-1)) : s
    		//return s === 'x' ? s.replace(/x/, Math.random().toString(16).slice(-1)) : s
		})).join('');
		*/
	}	
}

PGElement.blinkColor = "rgb(0, 255, 0)";
//PGElement.blinkTime = 700;
PGElement.blinkTime = 1000;
PGElement.blinkStrokeSize = 8;
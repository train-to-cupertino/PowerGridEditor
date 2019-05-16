/*
// Допустимые типы параметров элементов сети
var PGParamAllowedTypes = [
	"string", 	// Строковое значение
	"int",		// Целочисленное значение
	"double",	// Вещественное значение
	"color",	// Значение, обозначающее цвет
	"set"		// Значение из определенного набора
];
*/

// Редактор строкового параметра
var PGStringParamEditor = {
	create(pgElem, paramName){
		var paramEditor = Object.create(PGStringParamEditor.prototype);
		
		paramEditor.validate = function(val) {
			return true;
		};
		//paramEditor.type = 

		paramEditor.errorLabelDomNode = $('<span>', {
			css: { // !!! Заменить на класс
				'color': '#ff0000',
				'font-size' : '10px',
				'display': 'block'
			}
		});

		paramEditor.inputFieldDomNode = $('<input>', {
			type: 'text',
			value: (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) ? pgElem.param[paramName].value : "",

			on: {
				change: function(event){
					var oldValue = pgElem.param[paramName].value;
					var newValue = this.value;				
					
					if (oldValue != newValue) {
						// Добавляем действие ввода значения параметра в менеджер действий
						pgElem.pg.actionManager.addAction(
								function(){
								//pgElem.pg.initParamForm();
								pgElem.setParamVal(paramName, oldValue);
								//pgElem.param[paramName].onChange(pgElem.pg, pgElem);
								pgElem.openParamForm();
							},
								
							function() {
								//pgElem.pg.initParamForm();
								pgElem.setParamVal(paramName, newValue);
								//pgElem.param[paramName].onChange(pgElem.pg, pgElem);									
								pgElem.openParamForm();
							},
							
							"Отменить значение параметра",
								
							"Вернуть значение параметра"
						);
					}
				
					pgElem.setParamVal(paramName, this.value);
					
					pgElem.getParamProp(paramName, 'onChange')(pgElem.pg, pgElem);
				},
				click: function(event){
					paramEditor.errorLabelDomNode.html('');
				}
			}
		});

		return paramEditor;
		
	},
	/* // !!! Дописать ( https://habrahabr.ru/post/263967/ )
	isPGStringParamEditor(obj, type){
		if (!PGStringParamEditor.prototype.isPrototypeOf(obj)){
			return false;
		}
		
		return type ? obj.type === type : true;
	},
	*/
	prototype: {}
};


// Редактор целочисленного параметра
var PGIntegerParamEditor = {
	create(pgElem, paramName){
		var proto = Object.assign(PGStringParamEditor.create(pgElem, paramName), PGStringParamEditor.prototype);
		
		var paramEditor = Object.create(proto);
		
		//paramEditor.floatRegexPattern = /^(\d+(\.\d+)?)$/;
		//paramEditor.validatePattern = /^\d+$/;
		paramEditor.validatePattern = /^[1-9]\d*$/;
		
		paramEditor.validate = function(val) {
			//return val.match(paramEditor.validatePattern);
			return val.toString().match(paramEditor.validatePattern);
		};		
		
		paramEditor.inputFieldDomNode = $('<input>', {
			type: 'text',
			value: (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) ? pgElem.param[paramName].value : "",
			on: {
				change: function(event){
					var oldValue = pgElem.param[paramName].value;
					var newValue = this.value;				
				
					if (this.value.match(paramEditor.validatePattern)) {
						if (pgElem.param && pgElem.param[paramName]) {
							if (oldValue != newValue) {
								// Добавляем действие ввода значения параметра в менеджер действий
								pgElem.pg.actionManager.addAction(

									function(){
										//pgElem.pg.initParamForm();
										pgElem.setParamVal(paramName, oldValue);
										//pgElem.param[paramName].onChange(pgElem.pg, pgElem);
										pgElem.openParamForm();
									},
										
									function() {
										//pgElem.pg.initParamForm();
										pgElem.setParamVal(paramName, newValue);
										//pgElem.param[paramName].onChange(pgElem.pg, pgElem);									
										pgElem.openParamForm();
									},
									
									"Отменить значение параметра",
									
									"Вернуть значение параметра"
								);
							}
						
							pgElem.setParamVal(paramName, this.value);
						}
						else {
							pgElem[paramName] = this.value;	
						}						
						paramEditor.errorLabelDomNode.html('');
						
						pgElem.getParamProp(paramName, 'onChange')(pgElem.pg, pgElem);
					}
					else
					{
						if (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) {
							this.value = pgElem.getParamVal(paramName);
						}
						else {
							this.value = pgElem[paramName];
						}						
						paramEditor.errorLabelDomNode.html('Введите целое положительное число');
					}
				},
				click: function(event){
					paramEditor.errorLabelDomNode.html('');
				}
			}
		});		

		return paramEditor;
	},
	/* // !!! Дописать ( https://habrahabr.ru/post/263967/ )
	isPGIntegerParamEditor(obj){
		return PGStringParamEditor.isPGStringParamEditor(obj, )
	},
	*/
	prototype: {
		
	}
};

// Редактор вещественного параметра
var PGFloatParamEditor = {
	create(pgElem, paramName){
		var proto = Object.assign(PGStringParamEditor.create(pgElem, paramName), PGStringParamEditor.prototype);
		
		var paramEditor = Object.create(proto);
		
		paramEditor.anyPositiveFloatPattern = /^(\d+(\.\d+)?)$/;
		paramEditor.floatZeroPattern = /^([0]+|[0]+\.[0]+)$/;
		
		paramEditor.validate = function(val) {
			//return (val.match(paramEditor.anyPositiveFloatPattern) && val.match(paramEditor.floatZeroPattern));
			//return (val.toString().match(paramEditor.anyPositiveFloatPattern) && val.toString().match(paramEditor.floatZeroPattern));
			return (val.toString().match(paramEditor.anyPositiveFloatPattern) || val.toString().match(paramEditor.floatZeroPattern));
		};
		
		paramEditor.inputFieldDomNode = $('<input>', {
			type: 'text',
			value: (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) ? pgElem.param[paramName].value : "",
			on: {
				change: function(event){
					var oldValue = pgElem.param[paramName].value;
					var newValue = this.value;
				
					if (this.value.match(paramEditor.anyPositiveFloatPattern) && !this.value.match(paramEditor.floatZeroPattern)) {
						if (pgElem.param && pgElem.param[paramName]) {
							if (oldValue != newValue) {
								// Добавляем действие ввода значения параметра в менеджер действий
								pgElem.pg.actionManager.addAction(

									function(){
										//pgElem.pg.initParamForm();
										pgElem.setParamVal(paramName, oldValue);
										//pgElem.param[paramName].onChange(pgElem.pg, pgElem);
										pgElem.openParamForm();
									},
										
									function() {
										//pgElem.pg.initParamForm();
										pgElem.setParamVal(paramName, newValue);
										//pgElem.param[paramName].onChange(pgElem.pg, pgElem);									
										pgElem.openParamForm();
									},
									
									"Отменить значение параметра",
									
									"Вернуть значение параметра"
								);
							}
						
							pgElem.setParamVal(paramName, this.value);
						}
						else {
							pgElem[paramName] = this.value;
						}						
						paramEditor.errorLabelDomNode.html('');
						
						pgElem.getParamProp(paramName, 'onChange')(pgElem.pg, pgElem);
					}
					else
					{
						if (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) {
							this.value = pgElem.getParamVal(paramName);
						}
						else {
							this.value = pgElem[paramName];
						}												
						paramEditor.errorLabelDomNode.html('Введите вещественное положительное число');
					}
				},
				click: function(event){
					paramEditor.errorLabelDomNode.html('');
				}
			}
		});		

		return paramEditor;
	},
	/* // !!! Дописать ( https://habrahabr.ru/post/263967/ )
	isPGIntegerParamEditor(obj){
		return PGStringParamEditor.isPGStringParamEditor(obj, )
	},
	*/
	prototype: {
		
	}
};

/*
// RGB2HEX
function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}
*/

// Редактор цветового параметра
var PGColorParamEditor = {
	create(pgElem, paramName){
		var proto = Object.assign(PGStringParamEditor.create(pgElem, paramName), PGStringParamEditor.prototype);
		
		var paramEditor = Object.create(proto);
		
		//paramEditor.validatePattern = /^rgb\(\d{1-3},\d{1-3},\d{1-3}\)$/; // !!! Переделать под rgb(0-255,0-255,0-255)
		
		paramEditor.validatePattern = /^rgb\((1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])(\s*)\,(\s*)(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])(\s*)\,(\s*)(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\)$/; // rgb(0-255,0-255,0-255)
		//paramEditor.validatePattern = /^.*$/; // !!! Заглушка под любое содержимое
		
		paramEditor.validate = function(val) {
			//return val.match(paramEditor.validatePattern);
			return val.toString().match(paramEditor.validatePattern);
		};
		
		paramEditor.inputFieldDomNode = $('<input>', {
			type: 'text',
			value: (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) ? pgElem.param[paramName].value : "",
			on: {
				change: function(event){
					var oldValue = pgElem.param[paramName].value;
					var newValue = this.value;
				
					console.log(this.value);
					// Если введенное значение подходит под шаблон
					if (this.value.match(paramEditor.validatePattern)) {
						if (pgElem.param && pgElem.param[paramName]) {
						
							if (oldValue != newValue) {
								// Добавляем действие ввода значения параметра в менеджер действий
								pgElem.pg.actionManager.addAction(

									function(){
										//pgElem.pg.initParamForm();
										pgElem.param[paramName].value = oldValue;
										pgElem.param[paramName].onChange(pgElem.pg, pgElem);
										pgElem.openParamForm();
									},
										
									function() {
										//pgElem.pg.initParamForm();
										pgElem.param[paramName].value = newValue;
										pgElem.param[paramName].onChange(pgElem.pg, pgElem);									
										pgElem.openParamForm();
									},
									
									"Отменить значение параметра",
									
									"Вернуть значение параметра"
								);
							}
							
							// Заносим это значение в соответствующий параметр элемента
							pgElem.param[paramName].value = this.value;
							// Выполняем функцию onChange данного параметра
							pgElem.param[paramName].onChange(pgElem.pg, pgElem);
						}
						else {
							pgElem[paramName] = this.value;
						}												
						
						paramEditor.errorLabelDomNode.html('');
						
						pgElem.getParamProp(paramName, 'onChange')(pgElem.pg, pgElem);
					}
					else
					{
						if (pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName])) {
							this.value = pgElem.param[paramName].value;
						}
						else {
							this.value = pgElem[paramName];
						}												
						paramEditor.errorLabelDomNode.html('Допускаются только цветовые значения');
					}
				},
				click: function(event){
					paramEditor.errorLabelDomNode.html('');
				}
			}
		});

		return paramEditor;
	},
	/* // !!! Дописать ( https://habrahabr.ru/post/263967/ )
	isPGIntegerParamEditor(obj){
		return PGStringParamEditor.isPGStringParamEditor(obj, )
	},
	*/
	prototype: {
		
	}
};


// Редактор строкового параметра
var PGSetParamEditor = {
	create(pgElem, paramName, valuesSet){
		var paramEditor = Object.create(PGStringParamEditor.prototype);

		paramEditor.validate = function(val) {
			return (val in valuesSet);
		};		
		
		paramEditor.errorLabelDomNode = $('<span>', {
			css: { // !!! Заменить на класс
				'color': '#ff0000',
				'font-size' : '10px'
			}
		});

		paramEditor.inputFieldDomNode = $('<select>', {
			on: {
				change: function(event){
					var oldValue = pgElem.param[paramName].value;
					var newValue = this.value;				
				
					if (pgElem.param && pgElem.param[paramName]) {
						if (oldValue != newValue) {
							// Добавляем действие ввода значения параметра в менеджер действий
							pgElem.pg.actionManager.addAction(
								function(){
									//pgElem.pg.initParamForm();
									pgElem.param[paramName].value = oldValue;
									pgElem.param[paramName].onChange(pgElem.pg, pgElem);
									pgElem.openParamForm();
								},
									
								function() {
									//pgElem.pg.initParamForm();
									pgElem.param[paramName].value = newValue;
									pgElem.param[paramName].onChange(pgElem.pg, pgElem);									
									pgElem.openParamForm();
								},
								
								"Отменить значение параметра",
								
								"Вернуть значение параметра"
							);
						}
					
						pgElem.param[paramName].value = this.value;
						
						pgElem.getParamProp(paramName, 'onChange')(pgElem.pg, pgElem);
					}
					else {
						pgElem[paramName] = this.value;	
					}					
				},
				click: function(event){
					paramEditor.errorLabelDomNode.html('');
				}
			}
		});
		
		for(val in valuesSet)		
			paramEditor.inputFieldDomNode.append('<option value="' + val + '"' + ((pgElem.param && pgElem.param[paramName] && ('value' in pgElem.param[paramName]) && pgElem.param[paramName].value == val) ? " selected" : "") + '>' + valuesSet[val] + '</option>');
			
		return paramEditor;		
	},
	/* // !!! Дописать ( https://habrahabr.ru/post/263967/ )
	isPGStringParamEditor(obj, type){
		if (!PGStringParamEditor.prototype.isPrototypeOf(obj)){
			return false;
		}
		
		return type ? obj.type === type : true;
	},
	*/
	prototype: {}
};
function PGActions()
{
	// Максимальное количество действие отмены/повтора в стеке
	var MAX_ACTIONS_COUNT = 1000;
	
	
	// Стек действий
	var actions = [];
	
	
	// Указатель на текущее действие
	var actionIndex = -1;
	
	
	// Возвращает максимальное количество действие отмены/повтора в стеке
	this.getMaxActionsCount = function()
	{
		return MAX_ACTIONS_COUNT;
	}
	
	
	// Возвращает стек с действиями
	this.getActions = function()
	{
		return actions;
	}
	
	
	// Добавляет действие
	this.addAction = function(undoAction, redoAction, undoDescr, redoDescr)
	{
		// Если указатель от 0 до action.length - 2 включительно (т.е. любой кроме последнего индекса (action.lenght - 1))
		//if (actionIndex >= 0 && actionIndex < actions.length - 1)
		if (actionIndex >= -1 && actionIndex < actions.length - 1)
		{
			// Удалить все действия выше указателя
			actions.splice(actionIndex + 1);
		}
	
	
		// Если действий больше чем максимально возможно, то удаляем с конца (самые старые)
		if (actions.length >= MAX_ACTIONS_COUNT)
		{
			// Удаляем столько действий, чтобы их осталось не более (MAX_ACTIONS_COUNT - 1)
			actions.splice(0, actions.length - MAX_ACTIONS_COUNT + 1);
		}
		
	
		// Добавляем новое действие
		actions.splice(actions.length, 0, new PGAction(undoAction, redoAction, undoDescr, redoDescr));
		
		// Ставим указатель на верх стека (на последнее добавленное действие)
		actionIndex = actions.length - 1;
	}
	
	
	// Выполняет отмену последнего действия
	this.undoAction = function()
	{	
		if (actionIndex >= 0 && actionIndex < actions.length)
		{
			//if (DEBUG_MODE)
				console.log(actions);
		
			//if (DEBUG_MODE)
				console.log("undo action [actionIndex = " + actionIndex + "] " + actions[actionIndex].getUndoDescription());
		
			actions[actionIndex].getUndoFunction();
			actionIndex--;
		}
	}
	
	
	// Выполняет повтор последнего действия
	this.redoAction = function()
	{
		if (actionIndex >= -1 && actionIndex <= actions.length - 2)
		{
			//if (DEBUG_MODE)
				console.log(actions);		
				
				console.log("redo action [actionIndex = " + (actionIndex + 1) + "] " + actions[actionIndex + 1].getRedoDescription());
		
			actions[actionIndex + 1].getRedoFunction();
			actionIndex++;
		}
	}	
		
}

/*
 *	Возвращает стандартную функцию отмены/возврата
 *	по заданным типу, ID и JSON-представлению элемента
 */
PGActions.stdUndoRedoFunc = function(elemType, elemId, elemJSON) {

	console.log('stdUndoRedoFunc(' + elemType + ', ' + elemId + ', ' + elemJSON + ')');
	// Определяем наименование группы
	var elemGroup = undefined;
	switch(elemType) {
		case "nodes":
		case "lines":
		case "loads":
		case "source":
		case "figures":
			elemGroup = elemType;
		break;		
	}
	
	if (!elemGroup)
		return;

	console.log('-> elemJSON');
	console.log(elemJSON);
		
	// Если JSON представление отсутствует, 
	// значит элемент с заданным ID нуждается в удалении
	//if (!elemJSON) {
	if (elemJSON == undefined) {
		switch(elemType) {
			case "figures":
				//console.log(elemGroup, "+" + elemId + "+");
				//console.log(pgApp.pg[elemGroup][elemId].elem);
				/*
				pgApp.pg[elemGroup][elemId].elem.unrender();
				delete pgApp.pg[elemGroup][elemId];
				*/
				pgApp.pg.deleteFigure(elemId);
				console.log('-> deleting figure');	
			break;
		}
	// Если JSON представление присутствует, 
	// значит элемент с заданным ID необходимо добавить или отредактировать
	} else {

		// Проверка на существование данного элемента
		var isElemExist = false;
		if (elemGroup == "source") {
			isElemExist = !(pgApp.pg.source == undefined);
		} else {
			isElemExist = !(pgApp.pg[elemGroup][elemId] == undefined);
		}
	
		// Если данный элемент существует, 
		// то редактируем его
		if (isElemExist) {
			switch(elemType) {
				case "figures":
					// Парсинг JSON
					var obj = JSON.parse(elemJSON);
					// Стираем графику
					//console.log('-> pgApp.pg[elemGroup][elemId] = ');
					//console.log(pgApp.pg[elemGroup][elemId]);
					pgApp.pg[elemGroup][elemId].elem.unrender();
					// Заполняем свойства элемента значениями свойств объекта
					pgApp.pg[elemGroup][elemId].elem.fromObj(obj);
					// Отрисовываем графику
					pgApp.pg[elemGroup][elemId].elem.render();
				break;
			}
		// Если данный элемент отсутствует, 
		// то добавляем его
		} else {
			switch(elemType) {
				case "figures":
				// Парсинг JSON
					var obj = JSON.parse(elemJSON);
					//console.log(obj);
					console.log('-> adding elem');
					
					// Тип фигуры
					switch(obj.type) {
						// Эллипс
						case "ellipse":
							// Создаем фигуру
							var tmp_figure = new Figure(pgApp.pg);
							// Заполняем свойства элемента значениями свойств объекта
							obj.type = "ellipse";
							tmp_figure.fromObj(obj);
							// Задаем атрибуты FreeTransform
							tmp_figure.elem.ftAttrs = obj.attrs;
							// И добавляем в схему
							pgApp.pg.addFigure(tmp_figure);
							// Инициализация плагина FreeTransform
							tmp_figure.elem.initFt();
						break;
						
						// Прямоугольник
						case "rectangle":
							// Создаем фигуру
							var tmp_figure = new Figure(pgApp.pg);
							// Заполняем свойства элемента значениями свойств объекта
							obj.type = "rectangle";
							tmp_figure.fromObj(obj);
							// Задаем атрибуты FreeTransform
							tmp_figure.elem.ftAttrs = obj.attrs;
							// И добавляем в схему
							pgApp.pg.addFigure(tmp_figure);
							// Инициализация плагина FreeTransform
							tmp_figure.elem.initFt();
						break;
						
						// Текстовая метка
						case "label":
							// Создаем фигуру
							var tmp_figure = new Figure(pgApp.pg);
							// Заполняем свойства элемента значениями свойств объекта
							obj.type = "label";
							tmp_figure.fromObj(obj);
							// Задаем атрибуты FreeTransform
							tmp_figure.elem.ftAttrs = obj.attrs;
							// И добавляем в схему
							pgApp.pg.addFigure(tmp_figure);
							// Инициализация плагина FreeTransform
							tmp_figure.elem.initFt();
						break;
					}
				break;
			}
		}

	}
	
}
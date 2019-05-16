function PGAction(undoFunc, redoFunc, undoDescr, redoDescr)
{
	// Описание функции отмены действия
	var undoDescription = undoDescr || "";
	
	// Описание функции повтора действия
	var redoDescription = redoDescr || "";

	// Функция отмены действия
	var undoFunction = function() {};
	
	// Функция повтора действия
	var redoFunction = function() {};
	
	// /*
	this.undoDescr = undoDescription;
	this.redoDescr = redoDescription;
	// */
	
	
	// Задание функции отмены действия
	if (typeof(undoFunc) == "function")
	{
		undoFunction = undoFunc;
	}
	
	// Задание функции повтора действия
	if (typeof(redoFunc) == "function")
	{
		redoFunction = redoFunc;
	}	
	
	
	
	// Вызов функции отмены действия
	this.getUndoFunction = function() {
		undoFunction();
		/*
		try {
			undoFunction();
		}
		catch(e)
		{
		
		}
		*/
	};
	
	// Вызов функции повтора действия
	this.getRedoFunction = function() {
		redoFunction();
		/*
		try {
			redoFunction();
		}
		catch(e)
		{
		
		}	
		*/
	};
	
	// Возвращает описание
	this.getUndoDescription = function() {
		return undoDescription;
	}
	
	// Возвращает описание
	this.getRedoDescription = function() {
		return redoDescription;
	}	
}
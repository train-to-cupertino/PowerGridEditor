
		
// Инструмент для работы со схемой по умолчанию
PGTools.TOOL_DEFAULT = TOOL_POINTER;		
/*
// Выбранный инструмент
var currentTool = TOOL_DEFAULT;



// Все инструменты
var Tools = [
				TOOL_POINTER, 
				TOOL_NODE, 
				TOOL_LINE, 
				TOOL_LOAD, 
				TOOL_SOURCE, 
				//TOOL_BREAK, 
				//TOOL_CAPACITOR, 
				TOOL_POLYGON, 
				TOOL_TEXTLABEL,
				
				TOOL_RECT,
				TOOL_ELLIPSE
			];

			
// Возвращает текущий инструмент
function getCurrentTool()
{
	return currentTool;
}


// Устанавливает текущий инструмент
function setCurrentTool(value)
{
	if ($.inArray(value, Tools) > -1)
	{
		currentTool = value;
		return true;
	}
	else
		currentTool = TOOL_DEFAULT;
		
	return false;
}
*/

// Обработчик нажатия на кнопку одного из инструментов
$(".tool_button").click(function(){
	var _this = $(this);
	
	if (setCurrentTool(_this.attr("id")))
	{
		$(".tool_button").removeClass("tool_selected");
		_this.addClass("tool_selected");		
	}
});

/*
class PGTools
{	
	constructor(){
		// Выбранный инструмент
		this.currentTool = TOOL_DEFAULT;
	}
		
	static getTools(){
		return [
				TOOL_POINTER, 
				TOOL_NODE, 
				TOOL_LINE, 
				TOOL_LOAD, 
				TOOL_SOURCE, 
				//TOOL_BREAK, 
				//TOOL_CAPACITOR, 
				TOOL_POLYGON, 
				TOOL_TEXTLABEL,
				
				TOOL_RECT,
				TOOL_ELLIPSE
			];
	}

	// Возвращает текущий инструмент
	getCurrentTool()
	{
		return this.currentTool;
	}


	// Устанавливает текущий инструмент
	function setCurrentTool(value)
	{
		if ($.inArray(value, PGTools.getTools()) > -1)
		{
			currentTool = value;
			return true;
		}
		else
			currentTool = TOOL_DEFAULT;
			
		return false;
	}	
}
*/
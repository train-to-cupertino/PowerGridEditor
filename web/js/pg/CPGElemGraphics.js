class PGElemGraphics {
	
	// Конструктор
	constructor(paper, group) {
		this.group = undefined;
		//if ((typeof group) == "string")
		if (group)
			this.group = group;
			
		this.paper = paper;
		
		this.set = this.paper.set();
		this.names = [];
	}
	
	
	// Добавить элемент
	add(elemName, elem) {
		if (elemName in this.names)
			return false;
		
		if (this.group)
			this.group.push(elem);
		this.set.push(elem);
			
		
		this.names.push(elemName);
		return true;
	}
	
	
	// Удалить элемент
	delete(elemName) {
		var index = this.names.indexOf(elemName);
		if (index > -1) {
			if (this.group)
				//this.group.del()
				var x = 1; // !!! функция удаления элемента из группы
			this.set.splice(index, 1);
				
			this.names.splice(index, 1);
			return true;
		} else {
			return false;
		}
	}
	
	
	clear() {
		for(indx in this.names) {
			this.delete(this.names[indx]);
		}
	}
	
	
	// Получить элемент
	get(elemName) {
		var index = this.names.indexOf(elemName);
		if (index > -1) {
			return this.set[index];
		}
		
		return false;
	}
	

	// 
	exec(elemName, func) {
		var index = this.names.indexOf(elemName);

		if (index > -1) {
			try
			{
				func(this.set[index]);
				return true;
			}
			catch(e)
			{
				return false;
			}
		}
	}
	
	
}
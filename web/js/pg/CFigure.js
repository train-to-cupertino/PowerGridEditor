class Figure {
	constructor(_pg) {
		this.pg = _pg;
		this.elem = undefined;
		this.type = undefined;
	}
	
	
	getObj() {
		if (this.type && this.elem) {
			var elemObj = this.elem.getObj();
			elemObj.type = this.type;
			return elemObj;
		}
	}
	
	
	fromObj(_obj) {

		if (_obj.type)
			switch(_obj.type) {
				case "rectangle":
					this.type = _obj.type;
					this.elem = new Rectangle(this.pg);
					this.elem.fromObj(_obj);
				break;
				
				case "ellipse":
					this.type = _obj.type;
					this.elem = new Ellipse(this.pg);
					this.elem.fromObj(_obj);						
				break;			
				
				case "label":
					this.type = _obj.type;
					this.elem = new Label(this.pg);
					this.elem.fromObj(_obj);
				break;
				
				case "polyline":
					this.type = _obj.type;
					this.elem = new Polyline(this.pg);
					this.elem.fromObj(_obj);
				break;			
			}
	}

	
	fromElem(_elem, _type) {
		switch(_type) {
			case "rectangle":
				this.type = _type;
				if (_elem instanceof Rectangle)
					this.elem = _elem;
			break;
			
			case "ellipse":
				this.type = _type;
				if (_elem instanceof Ellipse)
					this.elem = _elem;
			break;			
			
			case "label":
				this.type = _type;
				if (_elem instanceof Label)
					this.elem = _elem;
			break;
			
			case "polyline":
				this.type = _type;
				if (_elem instanceof Polyline)
					this.elem = _elem;
			break;			
		}		
	}
	

	// Переместить наверх
	onTop() {
		var tmp_figure = new Figure(this.pg);
		var tmp_figure_obj = this.getObj();
		tmp_figure.fromObj(tmp_figure_obj);
		
		this.pg.deleteFigure(this.elem.id);
		this.pg.addFigure(tmp_figure);
	}
	
	
	select() {
		
	}
	
	/*
	onBack() {
	
	}
	*/
}

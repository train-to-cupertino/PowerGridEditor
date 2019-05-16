Raphael.el.draggablePolylineVertex = function() {
	var me = this,
		pgelem = me.data("elem"),
		vertex = me.data("vertex"),

		lx = 0,
		ly = 0;

		ox = 0,
		oy = 0,
		
		startX = 0,
		startY = 0,
		
	moveFnc = function(dx, dy) {
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":
				lx = dx / pgelem.pg.scale + ox;
				ly = dy / pgelem.pg.scale + oy;

				vertex.moveTo(lx, ly);
				pgelem.afterMoving();
			break;
		}
	},
	  
	startFnc = function() {
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":
				ox = vertex.coords.x;
				oy = vertex.coords.y;
				
				startX = vertex.coords.x;
				startY = vertex.coords.y;
			break;
		}
	},
	  
	endFnc = function() {
		switch(pgelem.pg.getCurrentTool()) {
			case "tool_pointer":	
				// Просто клик без перемещения - изменить параметр "Видима всегда"
				if (
					((lx - ox) == 0 && (ly - oy) == 0) || 
					((lx == 0) && (ly == 0))
				)
					vertex.alwaysVisible = !vertex.alwaysVisible;
					
							//console.log('!startX,startY', startX, startY);
							//console.log('!lx,ly', lx, ly);
					
				// Если начальные и конечные координаты совпадают, 
				// то действие не требует возврата/отмены 
				// (практически означает, что действия как такового не произошло)
				//console.log(lx, ly, ox, oy);
				//if (lx != ox || ly != oy) {
				else {
				//if (lx != ox || ly != oy) {
					var _startX = startX;
					var _startY = startY;
					var _lx = lx;
					var _ly = ly;
					
					/*
					var _key_indx = Object.values(pgApp.pg.figures).indexOf(me);
					var _vertex = -1;
					if ()
						var _vertex = pgApp.pg.figuresObject.keys(pgApp.pg.figures)[_key_indx];
					*/
					//pgelem.graphics.exec(vertex.vertexes.graphicsPartName, function(elem) { elem.attr("path", vertex.vertexes.getPath()); });


					var _vertex = me.data("elem");
					
					// Добавляем действие перемещения в менеджер действий
					pgelem.pg.actionManager.addAction(
					
						function(){
							vertex.moveTo(_startX, _startY);
							//pgelem.graphics.exec(vertex.vertexes.graphicsPartName, function(elem) { elem.attr("path", vertex.vertexes.getPath()); });
							
							//_vertex.moveTo(_startX, _startY);
						},
							
						function() {
							
							console.log('---');
							console.log(vertex);
							console.log(vertex.graphics);
							console.log(vertex.vertexes.set.indexOf(vertex));
							//console.log(me);
							//console.log(Object.values(pgApp.pg.figures).indexOf(me));
							
							vertex.moveTo(_lx, _ly);
							//pgelem.graphics.exec(vertex.vertexes.graphicsPartName, function(elem) { console.log(vertex.vertexes.set); elem.attr("path", vertex.vertexes.getPath()); });
							
							//_vertex.moveTo(_lx, _ly);
							//console.log('===');
							//elem.graphics.exec(vertex.vertexes.graphicsPartName, function(elem) { elem.attr("path", _this.vertexes.getPath()); });
						},
						
						"Вернуть вершину ломаной на " + startX + ',' + startY,
						
						"Переместить вершину ломаной на " + lx + ',' + ly
					);
				}			

				//vertex.moveTo(lx, ly);
					
				ox = lx;
				oy = ly;
				
				// // // pgelem.pg.updateSize();
			break;
		}
	};
  
	this.drag(moveFnc, startFnc, endFnc);
};



class PolylineVertex {
	constructor(parentElem, x, y, vertexes)
	{
		this.parentElem = parentElem;
		this.graphics = undefined;
		this.vertexes = vertexes;
		
		this.coords = { x: x, y: y };
		this.alwaysVisible = false;
		this.isDragging = false;
		
		this.render();
	}
	
	
	//render(x, y) {
	render() {
		var _this = this;
		// Графика вершины
		//this.graphics = new PGElemGraphics(this.parentElem.pg.paper, this.parentElem.pg.groups.polyline_vertexes);
		this.graphics = new PGElemGraphics(this.parentElem.pg.paper, this.parentElem.pg.groups.figures);

		if (!this.parentElem.pg.paper)
			return;
	
		// Элемент сети, к которому относится вершина
		var parentElem = this.parentElem;
	
		// Тело вершины (круг)
		var circle = parentElem.pg.paper.circle(0, 0, PolylineVertex.defaultSize);
		
		 // Аттрибуты
		circle.attr({ 
			//stroke: parentElem.param.vertexDrawColorOver.value, 
			stroke: PolylineVertex.drawColorOver, 
			//fill: parentElem.param.vertexDrawColorOver.value , 
			fill: PolylineVertex.drawColorOver, 
			//class: "pglinevertex " + parentElem.id,
            class: "polylinevertex " + parentElem.id,
			//opacity: 0.5,
			//width: 0,
			//height: 0,
		});
		
		circle.data("elem", parentElem);
		circle.data("vertex", this);
				
		if (parentElem.pg.view_only) {

		}
		else {
			// Действия при наведении / убирании курсора
			circle.hover(
				// Наведение
				function() {
					switch(parentElem.pg.getCurrentTool())
					{
						case "tool_pointer":
							//this.attr({fill: parentElem.param.vertexDrawColorOut.value});
							this.attr({fill: PolylineVertex.drawColorOut, stroke: PolylineVertex.drawColorOut });
							circle.data("vertex").graphics.exec("delete", function(elem) { 
								if (_this.vertexes.getPolylinePoints() && _this.vertexes.getPolylinePoints().length  && _this.vertexes.getPolylinePoints().length > 2)
									elem.show(); 
							});
							//circle.data("vertex").graphics.exec("delete", function(elem) { elem.attr({opacity: 1}); });
							
							//circle.data("vertex").graphics.exec("delete", function(elem) { elem.show().animate({ opacity : 1 }, 300, function () { }); });
						break;
					}
				}, 
				// Убирание
				function() {
					switch(parentElem.pg.getCurrentTool())
					{
						case "tool_pointer":
							
							if (!circle.data("vertex").alwaysVisible) {
								//this.attr({fill: parentElem.param.vertexDrawColorOver.value});
								this.attr({fill: PolylineVertex.drawColorOver, stroke: PolylineVertex.drawColorOver });
								circle.data("vertex").graphics.exec("delete", function(elem) { elem.hide(); });
								//circle.data("vertex").graphics.exec("delete", function(elem) { elem.attr({opacity: 0}); });
							}
							//circle.data("vertex").graphics.exec("delete", function(elem) { elem.animate({ opacity : 0 }, 300, function () { this.hide() }); });
						break;
					}
					
				},
			
				circle, 
				
				circle
			);
			
			// Возможность drag-and-drop'a
			circle.draggablePolylineVertex();
		}

		//---
		this.graphics.add("body", circle);
		//this.graphics.add("delete", parentElem.pg.paper.circle(x + 10, y - 10, PolylineVertex.defaultSize).attr({fill: "rgba(255,0,0,1.0)", stroke: "rgba(255,0,0,1.0)"}));
		var delete_vertex = parentElem.pg.paper
			//.circle(10, -10, PolylineVertex.defaultSize).attr({fill: "rgba(255,0,0,1.0)", stroke: "rgba(255,0,0,1.0)"})
			//.image("/img/block_close.png", 10, -10, 16, 16)
			//.image("\img\block_close.png", 10, -10, 16, 16)
			.image("/img/block_close.png", 10, -10, 16, 16)
			.hide()
			.click(function(e) {
				if (confirm("Удалить эту вершину?")) {
					
					var vrtxIndx = _this.vertexes.set.indexOf(_this);
					if (vrtxIndx > -1) {
						var _vrtx = _this;
						if (_this.vertexes.getPolylinePoints() && _this.vertexes.getPolylinePoints().length  && _this.vertexes.getPolylinePoints().length > 2) {
								//_this.vertexes.removeVertex(vrtxIndx);

							_vrtx.parentElem.pg.actionManager.addAction(
							
								function(){
									//vertex.moveTo(_startX, _startY);
									_this.vertexes.set.splice(vrtxIndx, 0, _vrtx);
									_vrtx.render();									
									// Пересчитываем "path" исходя из нового массива вершин
									_vrtx.parentElem.graphics.exec("body", function(elem) {
										elem.attr({"path": _vrtx.vertexes.getPath()});
									});
								},
									
								function() {										
									//_this.vertexes.set[vrtxIndx].unrender();
									_vrtx.unrender();
									_this.vertexes.set.splice(vrtxIndx, 1);
									// Пересчитываем "path" исходя из нового массива вершин
									_vrtx.parentElem.graphics.exec("body", function(elem) {
										elem.attr({"path": _vrtx.vertexes.getPath()});
									});									
								},
								
								"Добавить вершину ломаной",
								
								"Удалить вершину ломаной"
							);								
							
							//_this.vertexes.set[vrtxIndx].unrender();
							_vrtx.unrender();
							_this.vertexes.set.splice(vrtxIndx, 1);
							
							// Пересчитываем "path" исходя из нового массива вершин
							_vrtx.parentElem.graphics.exec("body", function(elem) {
								elem.attr({"path": _vrtx.vertexes.getPath()});
								//elem.attr({"path": _vrtx.vertexes.getPath()});
							});
							_vrtx.parentElem.afterMoving();
				
						}
					}
					
				}
			});
		this.graphics.add("delete", delete_vertex);
		
		this.graphics.set.transform('t' + this.coords.x + ',' + this.coords.y);
	}
	
	
	// Удалить графику вершины
	unrender() {
		if (this.graphics && this.graphics.set /* !!! && typeof(this.graphics.set) == raphael~set */) {
			this.graphics.set.forEach(function(el){
				el.remove();
			});
			
			this.graphics = undefined;
		}
	}		
	
	
	// Возвращает координаты вершины
	getCoords()
	{
		if (this.graphics && this.graphics.get("body"))
			return {
				x: this.coords.x,
				y: this.coords.y
			};

		return undefined;
	}
	
	
	moveTo(x, y) {
		var coords = {x: x, y: y};
	
		// Если нажат Alt
		if (pgApp.altPressed) {
			// То координаты округляются до кратного PGApp.gridStep числа
			x = Math.round(x / PGApp.gridStep) * PGApp.gridStep;
			y = Math.round(y / PGApp.gridStep) * PGApp.gridStep;
			
			coords = {x: x, y: y};
		}
		
		var _this = this;

		// Смещаем графику вершины
		_this.graphics.set.transform('t' + x + ',' + y);
		// Обновляем координаты
		this.coords = coords;
		
		
		var getPath = _this.vertexes.getPath();
		/*console.log(getPath);
		*/
		// Перерисовываем ломаную элемента сети
		//this.parentElem.graphics.exec(this.vertexes.graphicsPartName, function(elem) { elem.attr("path", getPath); });
		this.parentElem.graphics.get(this.vertexes.graphicsPartName).attr("path", getPath);
		//console.log("graphicsPartName " + this.vertexes.graphicsPartName);
		
		// ---
		/*
		var rgb = "rgb(" + 
			Math.round(Math.random() * 255).toString() + "," + 
			Math.round(Math.random() * 255).toString() + "," + 
			Math.round(Math.random() * 255).toString() + ")";
		console.log(rgb);
		*/
		//this.parentElem.graphics.exec(this.vertexes.graphicsPartName, function(elem) { elem.attr("stroke", rgb); });
		
		// Ограничивающие координаты
		var bbox = this.parentElem.graphics.get("body").getBBox();
		
		// Обновляем bbox
		////this.parentElem.updateSelectionBox(bbox);
	}
}

PolylineVertex.defaultSize = 5;
PolylineVertex.drawColorOut = "rgba(0, 0, 0, 0.3)";
PolylineVertex.drawColorOver = "rgba(0, 0, 0, 0.0)";
//PolylineVertex.drawColorOver = "rgba(0, 0, 0, 0.1)";

// -----------------------------------------------------------

class PolylineVertexes {
	constructor(parentElem, graphicsPartName, closedPath) {
		//this.closedPath = closedPath || false;
		this.closedPath = closedPath;
		this.set = [];
		this.parentElem = parentElem;
		this.graphicsPartName = graphicsPartName;
	}
	
	// Возвращает массив координат вершин ломаной
	getPolylinePoints() {
		var arr = [];
		
		var firstPolylinePointCoords = this.parentElem.getFirstPolylinePointCoords();

		if (firstPolylinePointCoords)
			arr.push(firstPolylinePointCoords);
		for(var i = 0; i < this.set.length; i++)
		{
			var coords = this.set[i].getCoords();

			if (coords)
				arr.push([coords.x, coords.y]);
		}
		var lastPolylinePointCoords = this.parentElem.getLastPolylinePointCoords();

		if (lastPolylinePointCoords)
			arr.push(lastPolylinePointCoords);
		
		return arr;
	}
	

	// Индекс вершины, после которой надо добавить еще одну
	getPrevVertexIndexByClick(x, y) {
		var pnts = this.getPolylinePoints();

		for(var i = 0; i < pnts.length - 1; i++)
		{
			if (GeometryHelper.isPointOverSection(
				x, y, 
				pnts[i][0], pnts[i][1], 
				pnts[i + 1][0], pnts[i + 1][1]))
			// К индексу необходимо прибавить 1 если отсутствует начальная дополнительная точка ломаной 
			// Она задается функцией getFirstPolylinePointCoords() у родительского элемента
			return i + (this.parentElem.getFirstPolylinePointCoords() ? 0 : 1);
		}

		return -1;
	}	
	
	
	// Добавить вершину в массив вершин ломаной
	addPolylineVertex(x, y) {
		var tmp_vertex = new PolylineVertex(this.parentElem, x, y, this);
		var afterIndex = this.getPrevVertexIndexByClick(x, y);

		if (afterIndex > -1)
			this.set.splice(afterIndex, 0, tmp_vertex);
		else
			this.set.push(tmp_vertex);
				
		return tmp_vertex;
	}
	
	
	// Возвращает svg-path ломаной
	getPath() {
		//flag = false || flag;
		var arr = this.getPolylinePoints();

		if (arr.length < 2)
			return;
		
		var poly = [];
		for(var i = 0; i < arr.length; i++) {
			if (
			!isNaN(parseFloat(arr[i][0])) && isFinite(arr[i][0]) &&
			!isNaN(parseFloat(arr[i][1])) && isFinite(arr[i][1]) ) {
				poly.push(arr[i][0]);
				poly.push(arr[i][1]);
			}
		}
		
		var res = [];
		for(var i = 0; i < poly.length; i++) {
			if (i == 0)
				res.push('M');
				
			if (i == 2)
				res.push('L');
				//res.push('C');
			
			res.push(poly[i]);
		}

		// Замкнутый полигон или разомкнутая ломаная
		if (this.closedPath)
			if (poly[0] && poly[1]) {
				res.push(poly[0]);
				res.push(poly[1]);
				res.push('Z');
			}
		
		return res.join(' ');
	}
	
	
	findAndRemoveVertex(vertex) {
		var _indx = this.set.indexOf(vertex)
		if (_indx > -1)
			this.removeVertex(_indx);
		else
			console.log('vertex is not deleted!!!');
	}
	
	
	// Удалить вершину по индексу
	removeVertex(i) {
		var vrtx = this.set[i];
		var _this = this;
	
		if (vrtx.graphics && vrtx.graphics.set /* !!! && typeof(this.graphics) == raphael~set */) {
			vrtx.graphics.set.forEach(function(el){
				el.remove();
			});
			
			vrtx.graphics = undefined;
			
			vrtx = undefined;
			
			this.set.splice(i, 1);
			
			this.parentElem.graphics.exec(this.graphicsPartName, function(elem) { elem.attr("path", _this.getPath()); });
		}
	}
	
	
	getObj() {
		var res = [];
		var _this = this;
		
		for(var i = 0; i < _this.set.length; i++) {
			var coords = _this.set[i].getCoords();
			res.push(coords);
		}		
		
		return res;
	}
	
	
	fromObj(obj) {
		for(var indx = this.set.length - 1; indx >= 0; indx--) {
			this.removeVertex(indx);
		}
		
		this.set = [];
		
		for (var i = 0; i < obj.length; i++) {
			this.addPolylineVertex(obj[i].x, obj[i].y);
		}
	}
	
	
	setCoordsFromObj(obj) {
		for (var i = 0; i < obj.length; i++) {
			this.set[i].moveTo(obj[i].x, obj[i].y);
		}		
	}
}
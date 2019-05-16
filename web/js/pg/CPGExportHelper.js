class PGExportHelper {

}

// Выполнить экспорт в Visio
PGExportHelper.doExportToVisio = function(svg_data, downloadFunc) {
    if (typeof svg_data === 'string' && typeof downloadFunc === 'function') {

        PGExportHelper.beforeExportToVisio();

        // Выполнить функцию, осуществляющую скачивание
        downloadFunc(PGExportHelper.afterExportToVisio);
    }
}


// Действия, предваряющие экспорт в Visio
PGExportHelper.beforeExportToVisio = function() {

    // Выключить на всех фигурах FreeTransfrom == Выполнить unSelect на всех элементах
    pgApp.pg.unselectAll();


    // Убрать вершины ломаных, после экспорта вернуть
    // В линиях
    for(let key in pgApp.pg.lines) {
        let elem = pgApp.pg.lines[key];

        // Если поле vertexes является экземпляром класса PolylineVertexes
        if ((elem.vertexes) && (elem.vertexes instanceof PolylineVertexes)) {
            // Если vertexes.set является массивом
            if ((elem.vertexes.set) && (Array.isArray(elem.vertexes.set))) {
                for(let vrtx_key in elem.vertexes.set) {
                    let vrtx = elem.vertexes.set[vrtx_key];
                    // Если вершина является экземпляром класса PolylineVertex
                    if (vrtx instanceof PolylineVertex) {
                        // Установить нулевые размеры
                        vrtx.graphics.exec("body", function(el) {
                            el.attr({ r: 0 });
                        });
                    }
                }
            }
        }
    }

    // В ломаных
    for(let key in pgApp.pg.figures) {
        let pgelem = pgApp.pg.figures[key];

        // Если тип фигуры - ломаная, и элемент фигуры является экземпляром класса Polyline
        if (pgelem.type === "polyline" && pgelem.elem && pgelem.elem instanceof Polyline) {
            // Если поле vertexes является экземпляром класса PolylineVertexes
            if ((pgelem.elem.vertexes) && (pgelem.elem.vertexes instanceof PolylineVertexes)) {
                // Если vertexes.set является массивом
                if ((pgelem.elem.vertexes.set) && (Array.isArray(pgelem.elem.vertexes.set))) {
                    for(let vrtx_key in pgelem.elem.vertexes.set) {
                        let vrtx = pgelem.elem.vertexes.set[vrtx_key];
                        // Если вершина является экземпляром класса PolylineVertex
                        if (vrtx instanceof PolylineVertex) {
                            // Установить нулевые размеры
                            vrtx.graphics.exec("body", function(el) {
                                el.attr({ r: 0 });
                            });
                        }
                    }
                }
            }
        }
    }

    // TODO:
    // Установить масштаб 100%
    // -----------
}


// Действия, выполняемые после экспорта в Visio
PGExportHelper.afterExportToVisio = function() {
    // Вернуть размер вершин ломаных
    // В линиях
    for(let key in pgApp.pg.lines) {
        let elem = pgApp.pg.lines[key];

        // Если поле vertexes является экземпляром класса PolylineVertexes
        if ((elem.vertexes) && (elem.vertexes instanceof PolylineVertexes)) {
            // Если vertexes.set является массивом
            if ((elem.vertexes.set) && (Array.isArray(elem.vertexes.set))) {
                for(let vrtx_key in elem.vertexes.set) {
                    let vrtx = elem.vertexes.set[vrtx_key];
                    // Если вершина является экземпляром класса PolylineVertex
                    if (vrtx instanceof PolylineVertex) {
                        // Установить стандартные размеры
                        vrtx.graphics.exec("body", function(el) {
                            el.attr({ r: PolylineVertex.defaultSize });
                        });
                    }
                }
            }
        }
    }

    // В ломаных
    for(let key in pgApp.pg.figures) {
        let pgelem = pgApp.pg.figures[key];

        // Если тип фигуры - ломаная, и элемент фигуры является экземпляром класса Polyline
        if (pgelem.type === "polyline" && pgelem.elem && pgelem.elem instanceof Polyline) {
            // Если поле vertexes является экземпляром класса PolylineVertexes
            if ((pgelem.elem.vertexes) && (pgelem.elem.vertexes instanceof PolylineVertexes)) {
                // Если vertexes.set является массивом
                if ((pgelem.elem.vertexes.set) && (Array.isArray(pgelem.elem.vertexes.set))) {
                    for(let vrtx_key in pgelem.elem.vertexes.set) {
                        let vrtx = pgelem.elem.vertexes.set[vrtx_key];
                        // Если вершина является экземпляром класса PolylineVertex
                        if (vrtx instanceof PolylineVertex) {
                            // Установить стандартные размеры
                            vrtx.graphics.exec("body", function(el) {
                                el.attr({ r: PolylineVertex.defaultSize });
                            });
                        }
                    }
                }
            }
        }
    }
}


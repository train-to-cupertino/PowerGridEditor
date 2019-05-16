class PGApp {

	// Конструктор
	constructor(view_only) {
		var _this = this;
	
		this.pg = new PowerGrid("svg_container", "param_container", view_only);
		//this.pg.updateSize();
		
		this.ctrlPressed = false;
		this.altPressed = false;
		this.calcRes = undefined;
		
		this.language = 'ru';
	}
	
	// Сохранение схемы в БД
	savePgToDb(onAjaxSuccess)
	{
		var save = this.pg.getJSON();

		// Сохранение через ajax в БД
		$.post(
			"/schema/save",
			{
				json_code: save,
				schema_id: current_schema_id
			},
		  
			onAjaxSuccess
		);
	}


	// Выполнить скачивание файла Visio
	downloadVisioFile(svg_data) {
        PGExportHelper.doExportToVisio(
        	// SVG data
        	svg_data,

			// Download function
			function(callbackFunc) {
                // SVG представление схемы
                //var svgString = pgApp.pg.paper.toSVG(); // Raphael's export function
                //var svgString = $("#svg_container").html(); // Pure SVG code from SVG container

                // \\\.-*= FIX RAPHAEL TO VALID_SVG_FORMAT =*-.///
                svg_data = svg_data.replace(/stroke-dasharray=""/g, 'stroke-dasharray="none"');
                svg_data = svg_data.replace(/stroke-dasharray="-"/g, 'stroke-dasharray="3,1"');
                svg_data = svg_data.replace(/stroke-dasharray="\."/g, 'stroke-dasharray="1,1"');
                svg_data = svg_data.replace(/stroke-dasharray="-\."/g, 'stroke-dasharray="3,1,1,1"');
                svg_data = svg_data.replace(/stroke-dasharray="-\.\."/g, 'stroke-dasharray="3,1,1,1,1,1"');
                svg_data = svg_data.replace(/stroke-dasharray="\.\s"/g, 'stroke-dasharray="1,3"');
                svg_data = svg_data.replace(/stroke-dasharray="-\s"/g, 'stroke-dasharray="4,3"');
                svg_data = svg_data.replace(/stroke-dasharray="--"/g, 'stroke-dasharray="8,3"');
                svg_data = svg_data.replace(/stroke-dasharray="-\s\."/g, 'stroke-dasharray="4,3,1,3"');
                svg_data = svg_data.replace(/stroke-dasharray="--\."/g, 'stroke-dasharray="8,3,1,3"');
                svg_data = svg_data.replace(/stroke-dasharray="--\.\."/g, 'stroke-dasharray="8,3,1,3,1,3"');
                //console.log(svgString);
                // ---------------- FIX END ----------------------

                // --- Импорт в Visio ---
                $.post(
                    "/schema/visio",
                    {
                        svg_data: svg_data
                    }
                ).done(
                    function( data ) {
                        // Временная ссылка
                        var a = document.createElement('a');

                        // Адрес временной ссылки
                        a.href = '/tmp_data/tmp_vsd/' + data;

                        // Имитация клика по ссылке для открытия FileSaveDialog, чтобы пользователь выбрал место для сохранения файла на своем диске
                        a.click();

                        if (typeof callbackFunc === 'function')
                        	callbackFunc();
                    }
                );
			}
		);
	}
	
	
	scrollOuterContainerTo(x, y) {
		//$("#outer_container").scrollLeft(0);
		//$("#outer_container").scrollTop(0);	
		$("#outer_container").scrollLeft(x - ($("#outer_container").width() / 2));
		$("#outer_container").scrollTop(y - ($("#outer_container").height() / 2));
	}
}

PGApp.gridStep = 20;

PGApp.snap = { rotate: 0, scale: 0, drag: 0 };
PGApp.snapAlt = { rotate: 15, scale: 20, drag: 20 };

PGApp.snapDist = { rotate: 0, scale: 0, drag: 0};
PGApp.snapDistAlt = { rotate: 15, scale: 20, drag: 0};
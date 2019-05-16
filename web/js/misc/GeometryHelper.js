function GeometryHelper()
{
	
}

GeometryHelper.isPointOverSection = function(
	mouseCoordsX, mouseCoordsY,
	startPointX, startPointY,
	finishPointX, finishPointY
)
{
/*
	if (DEBUG_MODE)
	{
		console.log(
			"isPointOverSection: " + 
			mouseCoordsX + " " + 
			mouseCoordsY + " " + 
			startPointX + " " + 
			startPointY + " " +
			finishPointX + " " + 
			finishPointY);
	}
*/
            // Поправка для координат прямоугольника, ограничивающего линию (<0 - на увеличение, >0 - на уменьшение (не работаете на гориз.и вертик. линиях))
            // Использовать отрицательные значения
            var accuracy = -2;

            // Если точка клика находится в прямоугольнике, ограниченном координатами узлов,
            // уменьшенными на accuracy
            if (
                mouseCoordsX >= (Math.min(startPointX, finishPointX) + accuracy) &&
                mouseCoordsX <= (Math.max(startPointX, finishPointX) - accuracy) &&

                mouseCoordsY >= (Math.min(startPointY, finishPointY) + accuracy) &&
                mouseCoordsY <= (Math.max(startPointY, finishPointY) - accuracy)
                )
            {
                // Макс. расстояние до прямой от точки клика
                // Только положительные значения
                accuracy = 5;
                // Коэффициенты A,B,C прямой Ay + Bx + C = 0, 
                // проходящей через точки с координатами начального и конечного узлов
                //Dictionary<string, double> lineKoefs = GeometryHelper.findLineKoefsByTwoPoints(
				var lineKoefs = GeometryHelper.findLineKoefsByTwoPoints(
                    startPointX,
                    startPointY,
                    finishPointX,
                    finishPointY
                );

                // Расстояние от точки клика до прямой
                var distance = GeometryHelper.findDistanceBetweenPointAndLine(
                    mouseCoordsX,
                    mouseCoordsY,
					/*
                    lineKoefs["A"],
                    lineKoefs["B"],
                    lineKoefs["C"]
					*/
                    lineKoefs.A,
                    lineKoefs.B,
                    lineKoefs.C					
                );

                // И если расстояние меньше accuracy, то точка над прямой
                if (distance <= accuracy)
                    return true;
            }

            return false;	
}

GeometryHelper.findLineKoefsByTwoPoints = function (x1, y1, x2, y2)
{
	if ((x1 == x2) && (y1 == y2))
	{
		x1 -= 1;
		y1 -= 1;
	}

	return {
		A: y1 - y2,
		B: x2 - x1,
		C: x1 * y2 - x2 * y1
	};
}

GeometryHelper.findDistanceBetweenPointAndLine = function (Mx, My, A, B, C)
{
	//if (A == B)
	if (A == B && B == 0)
		return 0;
		
	return Math.abs(A * Mx + B * My + C) / Math.sqrt(A * A + B * B);
}
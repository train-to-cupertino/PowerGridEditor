Raphael.fn.polyline = function (arr, closedPath) {
	closedPath = closedPath || false;
	
	if (arr.length < 2)
		return;
	
	var poly = [];

	for(var i = 0; i < arr.length; i++)
	{
		if (arr[i][0] && arr[i][1] &&
		!isNaN(parseFloat(arr[i][0])) && isFinite(arr[i][0]) &&
		!isNaN(parseFloat(arr[i][1])) && isFinite(arr[i][1])
		)
		{
			poly.push(arr[i][0]);
			poly.push(arr[i][1]);
		}
	}
	
	var res = [];
	
	for(var i = 0; i < poly.length; i++)
	{
		if (i == 0)
			res.push('M');
			
		if (i == 2)
			res.push('L');
		
		res.push(poly[i]);
	}
	
	if (closedPath)
		if (poly[0] && poly[1]) {
			res.push(poly[0]);
			res.push(poly[1]);
		}
	
	return this.path(res.join(' '));
}
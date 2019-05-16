ObjectClone = function(obj)
{
	var f = function () {};
	f.prototype = obj;
	var g = new f();
	g.prototype = obj;
	return g;	
}
/*
Object.prototype.clone = function() {
	var f = function () {};
	f.prototype = this;
	var g = new f();
	g.prototype = this;
	return g;
}
*/
/*
var man = { name: "asdf", age: 21, sayHello: function () { alert("Hello, World!!!"); } };

var me = man.clone();

alert(me.name + " is " + me.age + " year old!");

me.sayHello();
*/
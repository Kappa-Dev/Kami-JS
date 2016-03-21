//GuiGraph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function GuiGraph(){
	var mouseOver = function(d){
		
	};
	var mouseOut = function(d){
		
	};
	var ctMenu = function(d){
		
	};
	var dblClick = function(d){
		
	};
	var clickHandler = function(d) {
		if(d3.event.ctrlKey){
			d3.select(this).classed("fixed", d.fixed = false);
		}
		if(d3.event.shiftKey){
			if(d3.select(this).classed("selected"))
				d3.select(this).classed("selected", d.selected = false);
			else 
				d3.select(this).classed("selected", d.selected = true);
		}	
	};
};
var gGraph = new GraphicGraph('graph');
window.onload = function () { 
	gGraph.init();
	gGraph.addNode(["agent"],["ag1"],[]);
	gGraph.addNode(["agent"],["ag2"],[]);
	gGraph.addNode(["agent"],["ag3"],[]);
	gGraph.addNode(["region"],["reg1"],["n0"]);
	gGraph.addNode(["region"],["reg2"],["n1"]);
	gGraph.addNode(["key_res"],["kr1"],["n0"]);
	gGraph.addNode(["key_res"],["kr2"],["n1"]);
	gGraph.addNode(["attribute"],["att1"],["n0"]);
	gGraph.addNode(["attribute"],["att2"],["n1","n4"]);
	gGraph.addNode(["flag"],["fl1"],["n0"]);
	gGraph.addNode(["flag"],["fl2"],["n1","n6"]);
	gGraph.addNode(["flag"],["fl3"],["n1"]);
	gGraph.addNode(["flag"],["fl4"],["n2"]);
	gGraph.addNode(["action","bnd"],["bind1"],[]);
	gGraph.addNode(["action","brk"],["bind2"],[]);
	gGraph.addNode(["action","binder","left"],[],["n13"]);
	gGraph.addNode(["action","binder","right"],[],["n13"]);
	gGraph.addNode(["action","binder","left"],[],["n14"]);
	gGraph.addNode(["action","binder","right"],[],["n14"]);
	gGraph.addEdge("n3","n15");
	gGraph.addEdge("n4","n16");
	gGraph.addEdge("n2","n17");
	gGraph.addEdge("n4","n18");
	gGraph.wakeUp();
	console.log(gGraph.getCoord());
};
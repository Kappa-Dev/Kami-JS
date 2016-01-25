//dynamic_graph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function DynamicGraph(layerG,height,width){//define a dynamic graph : nodes can be of differents classes : "action", "agent" "key_rs", "region", "flag", "attribute", action should have a second subclass : "mod", "bnd","brk","syn", "deg","r_link","l_link" other can have a subclass : "abstract", "set"
	var layerG=layerG;
	var force=d3.layout.force()
				.size([width, height]);
	this.init = function init(){
		force
		.nodes(layerG.nodes)
		.links(layerG.links)
		.linkDistance(function(d){if((d.source.classes[0]=="action" && d.source.classes[1]=="binder") || (d.target.classes[0]=="action" && d.target.classes[1]=="binder")) return 100; else return (d.source.toInt()+d.target.toInt())/2})
		.linkStrength(function(d){if((d.source.classes[0]=="action" && d.source.classes[1]=="binder") || (d.target.classes[0]=="action" && d.target.classes[1]=="binder")) return 0.7; else return 5})
		.charge(function(d){if(d.classes[0]=="action" && d.classes[1]=="binder")return -300; else return -600})
	};
	 
	this.getForce = function getForce(){
		return force;
	}
};
/*var layer=new LayeredGraph(); // example
console.log(" ====================== gen graph : ==========================\n");
layer.log();
var dgraph = new DynamicGraph(layer,1200,800);
dgraph.getForce().on("tick",function(){if(dgraph.getForce().alpha()<=0.00501 ) layer.log();
									  else console.log(dgraph.getForce().alpha())});
dgraph.init();

layer.addNode(["agent"],"n1");
console.log(" ====================== add node1 : ==========================\n");
layer.log();
layer.addNode(["agent"],"n2");
console.log(" ====================== add node2 : ==========================\n");
layer.log();
layer.addNode(["agent"],"n3");
console.log(" ====================== add node3 : ==========================\n");
layer.log();
layer.setSon("n1","n2");
console.log(" ====================== n1 son of n2 : ==========================\n");
layer.log();
layer.setSon("n3","n2");
console.log(" ====================== n3 son of n2 : ==========================\n");
layer.log();
layer.addEdge("n1","n3");
console.log(" ====================== edge n1-n3 : ==========================\n");
layer.log();
layer.addEdge("n1","n2");
console.log(" ====================== edge n1-n2 : ==========================\n");
layer.log();
layer.addEdge("n2","n3");
console.log(" ====================== edge n2-n3 : ==========================\n");
layer.log();
layer.addNode(["agent"],"n2");
console.log(" ====================== add n2 : ==========================\n");
layer.log();
layer.addEdge("n1","n2");
console.log(" =================:===== edge n1-n2  ==========================\n");
layer.log();
layer.addEdge("n2","n3");
console.log(" ====================== edge n2-n3 : ==========================\n");
layer.log();
layer.removeEdge("n3","n1");
console.log(" ====================== rm edge n3-n1 : ==========================\n");
layer.log();
layer.addEdge("n1","n3");
console.log(" ====================== edge n1-n3 : ==========================\n");
layer.log();
layer.removeParenting("n1");
console.log(" ====================== rm n1 parent : ==========================\n");
layer.log();
var dgraph = new DynamicGraph(layer,1200,800);
dgraph.getForce().on("tick",function(){if(dgraph.getForce().alpha()<=0.00501 ) layer.log();
									  else console.log(dgraph.getForce().alpha())});
dgraph.init();*/
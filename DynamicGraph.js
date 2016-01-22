//dynamic_graph.js
function DynamicGraph(layerG,width,height){//define a dynamic graph : nodes can be of differents classes : "action", "agent" "key_rs", "region", "flag", "attribute", action should have a second subclass : "mod", "bnd","brk","syn", "deg", other can have a subclass : "abstract", "set"
	var layerG=layerG;
	var force=d3.layout.force()
				.size([width, height]);
	this.init = function init(){
		force
		.nodes(layerG.nodes)
		.links(layerG.links)
		.linkDistance(function(d){return toInt(layerG.nodes[layerG.nodesHash[d.sourceID]].classes[0])+toInt(layerG.nodes[layerG.nodesHash[d.targetID]].classes[0])})
		.linkStrength(function(d){if(layerG.nodes[layerG.nodesHash[d.sourceID]].classes[0]=="action" || layerG.nodes[layerG.nodesHash[d.targetID]].classes[0]=="action") return 0.7; else return 5})
		.charge(function(d){if(d.classes[0]=="action")return -300; else return -600})
		.start();
	};
	var toInt = function(class_t){
		switch(class_t){
			case "action" : return 100;
			case "key_rs" : return 20;
			case "region" : return 30;
			case "agent" : return 50;
			case "flag" : return 12;
			case "attribute" : return 10;
		}
	};
	this.getForce = function getForce(){
		return force;
	}
};
/*var layer=new LayeredGraph(); // example
console.log(" ====================== gen graph : ==========================\n");
layer.log();
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
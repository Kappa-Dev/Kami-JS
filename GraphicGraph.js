//graphical graph version
function GraphicGraph(layerg,containerid){//define a graphical graph with svg objects
	var containerID=containerid;
	var layerG=layerg;//the layered graph data structure
	var width;
	var	height;//menu is 30px heigth
	var svg;
	var dynG;//the force layout graph for this graphical graph
	var s_node,s_action,s_link;//graphical object for node,action,link
	this.init = function init(){//init the graphic graph
		width=document.getElementById(containerID).getBoundingClientRect().width;
		height =document.getElementById(containerID).getBoundingClientRect().height-30;//menu is 30px heigth
		svg=d3.select("#"+containerID).append("svg:svg")
			.attr("width",width)
			.attr("height",height);
		dynG=new DynamicGraph(layerG,height,width);
		dynG.getForce().on("tick",tick);
		dynG.init();
	};
	var update = function(){//update all the LCG elements
		
	};
	var showSVG = function(){
		
	};
	var tick = function(){//show up new svg element only if there position datas have been computed
		console.log("tick");
		if(dynG.getForce().alpha()<=0.00501){
			dynG.getForce().stop();
			showSVG();
		}
	};
	this.getSvg = function getSvg(){//return the svg
		return svg;
	};
	this.addNode = function addNode(){//add a new node in the svg AND in the graph structure
		
	};
	this.mergeNode = function mergeNode(){//if both nodes have the same LABEL+PATH, mergeDIFF both, if htey have the same ID : merge simple
		
	};
	this.removeNode = function removeNode(){//remove a node from the svg AND the graph structure
		
	}
	this.addEdge = function addEdge(){//add a LINK edge between two nodes in the svg AND in the graph structure
		
	};
	this.removeEdge = function removeEdge(){//remove a LINK edge between two nodes in the svg AND in the graph structure
		
	};
	this.addParent = function addParent(){//add a PARENT edge between two node in the graph structure and un the svg and update graph structure
		
	};
	this.rmParent = function rmParent(){//idem for removing parenting
		
	};
	this.addCtx = function addCtx(){//add a context to a specific node
		
	};
	this.rmCtx = function rmCtx(){//remove a context from a specific node
		
	};
	this.addLabel = function addLabel(){//add a label to a specific node
		
	};
	this.rmLabel = function rmLabel(){//remove a label from a specific node
		
	};
	
};

var layer=new LayeredGraph(); // example
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
console.log(" ====================== add ctx n1 : ==========================\n");
layer.addCtx("n1",["gna","gni"]);
layer.log();
console.log(" ====================== add ctx n2 : ==========================\n");
layer.addCtx("n2",["gna","gno"]);
layer.log();
console.log(" ====================== merge n1 n2 : ==========================\n");
layer.mergeDiff("n1","n2");
layer.log();
var gGraph = new GraphicGraph(layer,'graph');
window.onload = function () { 
	gGraph.init();
	//setTimeout(function() { gGraph.update(); }, 10000);
};

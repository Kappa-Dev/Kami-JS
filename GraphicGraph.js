//graphical graph version
function GraphicGraph(containerid){//define a graphical graph with svg objects
	var containerID=containerid;
	var layerG;//the layered graph data structure
	var width;
	var	height;//menu is 30px heigth
	var svg;
	var dynG;//the force layout graph for this graphical graph
	var s_node,s_action,s_link;//graphical object for node,action,link
	var node_count=0;
	this.init = function init(){//init the graphic graph
		layerG=new LayeredGraph();//the layered graph data structure
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
		layerG.log();
	};
	var tick = function(){//show up new svg element only if there position datas have been computed
		if(dynG.getForce().alpha()<=0.00501){
			dynG.getForce().stop();
			update();
		}
	};
	this.getSvg = function getSvg(){//return the svg
		return svg;
	};
	this.addNode = function addNode(classes,label,path,x,y){//add a new node in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.addNode(classes,"n"+node_count,x,y,(typeof(x)!='undefined' && typeof(y)!='undefined'));
		layerG.addLabel("n"+node_count,label);
		for(var i=path.length-1;i>0;i--){
			if(typeof(layerG.nodesHash[path[i]])=='undefined'){
				console.log("undefined path : "+path[i]+"for n"+node_count);
				return;
			}if(layerG.nodes[layerG.nodesHash[path[i]]].father==null || layerG.nodes[layerG.nodesHash[path[i]]].father!=path[i-1]){
				console.log("incorrect path !");
				console.log(path);
				return;
			}				
		}if(path.length>0)
			layerG.setFather("n"+node_count,path[path.length-1]);
		node_count++;
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();	
	};
	this.mergeNode = function mergeNode(new_nodeID,old_nodeID){//mergeDIFF both 
		dynG.getForce().stop();
		if(layerG.nodes[layerG.nodesHash[new_nodeID]].classes.join('_') == layerG.nodes[layerG.nodesHash[old_nodeID]].classes.join('_') && layerG.getPath(new_nodeID).join('_') == layerG.getPath(old_nodeID).join('_'))
			layerG.mergeDiff(new_nodeID,old_nodeID);
		else{
			console.log("unable to merge too different nodes : ");
			console.log(layerG.nodes[layerG.nodesHash[new_nodeID]]);
			console.log(layerG.nodes[layerG.nodesHash[old_nodeID]]);
		}
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();	
		
	};
	this.removeNode = function removeNode(){//remove a node from the svg AND the graph structure
		dynG.getForce().resume();
	}
	this.addEdge = function addEdge(){//add a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().resume();
	};
	this.removeEdge = function removeEdge(){//remove a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().resume();
	};
	this.addParent = function addParent(){//add a PARENT edge between two node in the graph structure and un the svg and update graph structure
		dynG.getForce().resume();
	};
	this.rmParent = function rmParent(){//idem for removing parenting
		dynG.getForce().resume();
	};
	this.addCtx = function addCtx(){//add a context to a specific node
		dynG.getForce().resume();
	};
	this.rmCtx = function rmCtx(){//remove a context from a specific node
		dynG.getForce().resume();
	};
	this.addLabel = function addLabel(){//add a label to a specific node
		dynG.getForce().resume();
	};
	this.rmLabel = function rmLabel(){//remove a label from a specific node
		dynG.getForce().resume();
	};
	
};

var gGraph = new GraphicGraph('graph');
window.onload = function () { 
	gGraph.init();
	gGraph.addNode(["agent"],["toto"],[]);
	gGraph.addNode(["agent"],["toto"],[],100,100);
	gGraph.addNode(["agent"],["titi"],["n1"]);
	gGraph.mergeNode("n0","n1");
};

//graph.js
function Node(classes,id,label,x,x,lock){
	this.classes=classes;
	this.id=id;
	this.linkedEdges=[];
	if(typeof(label)!='undefined') this.label=label;
	if(typeof(x)!='undefined') this.x=x;
	if(typeof(y)!='undefined') this.y=y;
	if(typeof(lock)!='undefined') this.lock=lock;
};
function Edge(node1,node2){
	this.source=node1;
	this.target=node2;
	this.id="e"+node1+"_"+node2;
};


function LayeredGraph(svg){
	var svg=svg;
	var nodesHash={};
	var edgesHash={};
	this.nodes=[];
	this.edges=[];
	var merge = function(nodes_l,node,replace){
				nodes_l.push(node);
		nodesHash[node["id"]]=nodes_l.length-1;
	};
	this.addNode = function addNode(nodeClasses,nodeID,nodeLabel,nodeX,nodeY,nodeLock){
		var tmp_node=new Node(nodeClasses,nodeID,nodeLabel,nodeX,nodeY,nodeLock);
		merge(this.nodes,tmp_node,true);		
	};
	this.removeNodeByID = function removeNodeByID(nodeID){
		for(var i=0;i<this.nodes[nodesHash[nodeID]].linkedEdges.length;i++){
			var tmp_edge_id=this.edges[this.nodes[nodesHash[nodeID]].linkedEdges[i]].id;
			delete edgesHash[tmp_edge_id];
			this.edges.splice(this.nodes[nodesHash[nodeID]].linkedEdges[i],1);
		}	
		this.nodes.splice(nodesHash[nodeID],1);
		delete nodesHash[nodeID];
	};
};
var layer=new LayeredGraph(null);
console.log(layer.nodes);
layer.addNode(["bla"],"n1","toto");
console.log(layer.nodes);
layer.removeNodeByID("n1");
console.log(layer.nodes);
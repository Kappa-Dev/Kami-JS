//graph.js
//node definition
function Node(classes,id,label,x,x,lock){
	this.classes=classes;
	this.id="n_"+id;
	this.linkedlinks=[];
	this.context=[];
	if(typeof(label)!='undefined') this.label=label;
	if(typeof(x)!='undefined') this.x=x;
	if(typeof(y)!='undefined') this.y=y;
	if(typeof(lock)!='undefined') this.lock=lock;
};
//edge definition
function Edge(node1,node2){
	this.source=node1;
	this.target=node2;
	this.id="e_"+node1["id"]+"_"+node2["id"];
};

//layered graph definition
function LayeredGraph(svg){
	var svg=svg; // the svg used to show the graph
	var nodesHash={};// the hashtable in order to get a node by his name
	var linksHash={};//the hashtable for links 
	this.nodes=[];//liste des noeud
	this.links=[];//liste des arcs
	var merge = function(nodes_l,node,replace){
		if(typeof(nodesHash[node.id])=='undefined'){
			nodes_l.push(node);
			nodesHash[node.id]=nodes_l.length-1;
		}else if(typeof(nodesHash[node.id])!='undefined' && !replace){
			console.log("node already defined : "+node.id);
		}else{
			var tmp_node = new Node(union(node.classes,nodes_l[nodesHash[node.id]].classes),node.id,node.nodeLabel,node.x,node.y,node.lock);
			if(nodes_l[nodesHash[node.id]].classes[0]=="action")
				tmp_node["context"]=union(nodes_l[nodesHash[node.id]].context,node.context);
			
		}
	};
	this.addNode = function addNode(nodeClasses,nodeID,nodeLabel,nodeX,nodeY,nodeLock){
		var tmp_node=new Node(nodeClasses,nodeID,nodeLabel,nodeX,nodeY,nodeLock);
		merge(this.nodes,tmp_node,true);		
	};
	this.removeNodeByID = function removeNodeByID(nodeID){
		for(var i=0;i<this.nodes[nodesHash[nodeID]].linkedlinks.length;i++){
			var tmp_edge_id=this.links[this.nodes[nodesHash[nodeID]].linkedlinks[i]].id;
			delete linksHash[tmp_edge_id];
			this.links.splice(this.nodes[nodesHash[nodeID]].linkedlinks[i],1);
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
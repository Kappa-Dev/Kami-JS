//graph.js
//node definition
function Node(classes,id,x,y,lock){
	this.classes=classes;
	this.id="n_"+id;
	this.linkedlinks=[];
	this.context=[];//alternatively a context for an action or a value list for a flag or an attribute
	if(typeof(x)!='undefined') this.x=x;
	if(typeof(y)!='undefined') this.y=y;
	if(typeof(lock)!='undefined') this.lock=lock;
};
//edge definition
function Edge(node1,node2){
	this.source=node1;
	this.target=node2;
};

//layered graph definition
function LayeredGraph(){
	this.nodesHash={};// the hashtable in order to get a node by his name
	this.nodes=[];//liste des noeud
	this.links=[];//liste des arcs
	this.merge = function(node,replace){// merges two nodes of the same name : if replace is defined, the new one replace the old, else they are merged
		if(typeof(this.nodesHash[node.id])=='undefined'){
			this.nodes.push(node);
			this.nodesHash[node.id]=this.nodes.length-1;
		}else if(typeof(this.nodesHash[node.id])!='undefined' && replace){
			this.nodes[this.nodesHash[node.id]]=node;
		}else{
			var tmp_node = new Node(union(node.classes,this.nodes[this.nodesHash[node.id]].classes),node.id);
			if(this.nodes[this.nodesHash[node.id]].classes[0]=="action")
				tmp_node["context"]=union(this.nodes[this.nodesHash[node.id]].context,node.context);
		}
	};
	this.addNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodeLock){//add a new node not existing yet
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodeLock);
		if(typeof(this.nodesHash[tmp_node.id])!='undefined')
			console.log("node already existing, use merge(false) or update instead");
		else merge(tmp_node,false);		
	};
	this.replaceNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodeLock){//replace an existing node with a new one. if the node doesn't exist, show a warning
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodeLock);
		if(typeof(this.nodesHash[tmp_node.id])=='undefined')
			console.log("node not existing, use merge or addnode instead");
		merge(tmp_node,true);		
	};
	this.removeNodeByID = function removeNodeByID(nodeID){
		for(var i=0;i<this.nodes[nodesHash[nodeID]].linkedlinks.length;i++){
			var tmp_edge_id=this.links[this.nodes[nodesHash[nodeID]].linkedlinks[i]].id;
			delete linksHash[tmp_edge_id];
			this.links.splice(this.nodes[nodesHash[nodeID]].linkedlinks[i],1);
		}	
		this.nodes.splice(nodesHash[nodeID],1);
		for(var i=nodesHash[nodeID],i<this.nodes.length,i++)
			nodesHash[this.nodes[i].id]--
		delete nodesHash[nodeID];
	};
	this.log = function log(){
		console.log("nodehash : \n"+nodesHash+"\n");
		console.log("nodes : \n"+this.nodes+"\n");
		console.log("linkshash : \n"+linksHash+"\n");
		console.log("links : \n"+this.links+"\n");
	}
	this.joinNodes = function joinNodes(){
		return this.nodes;
	}
	this.joinEdges = function joinEdges(){
		return this.links;
	}
};
var layer=new LayeredGraph();
console.log(layer.nodes);
layer.addNode(["bla"],"n1","toto");
console.log(layer.nodes);
layer.removeNodeByID("n1");
console.log(layer.nodes);
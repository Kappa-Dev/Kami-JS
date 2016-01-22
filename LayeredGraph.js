//layered_graph.js
//node definition
function Node(classes,id,x,y,lock){
	this.classes=classes;//the node class
	this.id=id;//the node id
	this.sons=[];// the node sons
	this.father=null;//the node father
	this.context=[];//alternatively a context for an action or a value list for a flag or an attribute
	if(typeof(x)!='undefined') this.x=x;//node coordinate
	if(typeof(y)!='undefined') this.y=y;
	if(typeof(lock)!='undefined') this.lock=lock;//node position locked
};
//edge definition
function Edge(node1,node2,e_class){//node1 ande node2 are indexes
	this.sourceID=node1;
	this.targetID=node2;
	this.e_class=e_class;
};
//layered graph definition
function LayeredGraph(){
	this.nodesHash={};// the hashtable in order to get a node by his name
	this.nodes=[];//liste des noeud
	this.links=[];//liste des arcs
	var union = function(list1,list2){// effectue l'union de deux listes sans redondances
		var tmp=[];
		for(var i=0;i<list2.length;i++)
			tmp.push(list2[i]);
		for(var i=0;i<list1.length;i++){
			var check=false;
			for(var j=0;j<list2.length;j++)
				 check = check || list1[i]==list2[j];
			if(!check) tmp.push(list1[i]);	
		}
		return tmp;
	};
	var remove = function(l_el,list){//remove an element from a list
		for(var i=0;i<list.length;i++){
			if(list[i]==l_el)
				list.splice(i,1);
		}
	}
	this.merge = function(node,replace){// merges two nodes of the same name : if replace is defined, the new one replace the old, else they are merged
		if(typeof(this.nodesHash[node.id])=='undefined'){
			this.nodes.push(node);
			this.nodesHash[node.id]=this.nodes.length-1;
		}else if(typeof(this.nodesHash[node.id])!='undefined' && replace){
			this.nodes[this.nodesHash[node.id]].classes=node.classes;
			this.nodes[this.nodesHash[node.id]].sons=node.sons;
			this.nodes[this.nodesHash[node.id]].father=node.father;
			this.nodes[this.nodesHash[node.id]].context=node.context;
			this.nodes[this.nodesHash[node.id]].x=node.x;
			this.nodes[this.nodesHash[node.id]].y=node.y;
			this.nodes[this.nodesHash[node.id]].lock=node.lock;
		}else{
			this.nodes[this.nodesHash[node.id]].classes=union(node.classes,this.nodes[this.nodesHash[node.id]].classes);
			this.nodes[this.nodesHash[node.id]].sons=union(node.sons,this.nodes[this.nodesHash[node.id]].sons);
			this.nodes[this.nodesHash[node.id]].context=union(node.context,this.nodes[this.nodesHash[node.id]].context);
		}
	};
	this.addNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodeLock){//add a new node not existing yet, else do nothing
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodeLock);
		if(typeof(this.nodesHash[tmp_node.id])!='undefined')
			console.log("node already existing, use merge(false) or update instead");
		else this.merge(tmp_node,false);		
	};
	this.replaceNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodeLock){//replace an existing node with a new one. if the node doesn't exist, show a warning
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodeLock);
		if(typeof(this.nodesHash[tmp_node.id])=='undefined')
			console.log("node not existing, prefere using merge or addnode instead");
		this.merge(tmp_node,true);		
	};
	this.setFather = function setFather(son,fath){//define a node as the father of an other one : son, father: id
		if(typeof(this.nodesHash[fath])!='undefined' && typeof(this.nodesHash[son])!='undefined'){
			if(this.nodes[this.nodesHash[son]].father==null){
				this.nodes[this.nodesHash[son]].father=fath;
				this.nodes[this.nodesHash[fath]].sons=union([son],this.nodes[this.nodesHash[fath]].sons);
				this.links.push(new Edge(fath,son,"parent"));//link is from the father to the son !
			}
			else
				console.log("error : this node : "+son+" already have a father");
		}
		else 
			console.log("error : son or father ins't defined : son :"+typeof(this.nodesHash[son])+" father : "+typeof(this.nodesHash[fath]));
	};
	this.setSon = function setSon(son,fath){//define a node as the son of an other one, trigger a warning if this is already defined : son, father : id
		this.setFather(son,fath);
	};
	this.removeNode = function removeNode(nodeID){//remove a specific node giving its id : doesn't remove its sons
		for(var i=0;i<this.links.length;i++){
			if(this.links[i].sourceID == nodeID || this.links[i].targetID == nodeID ){
				this.links.splice(i--,1);
			}
		}
		if(this.nodes[this.nodesHash[nodeID]].father!=null)
			this.nodes[this.nodesHash[this.nodes[this.nodesHash[nodeID]].father]].sons=remove(nodeID,this.nodes[this.nodesHash[this.nodes[this.nodesHash[nodeID]].father]].sons);//retire le noeud de la liste des fils de son pere.
		for(var i=0;i<this.nodes[this.nodesHash[nodeID]].sons.length;i++){//remove the node from all it children as a father
			this.nodes[this.nodesHash[this.nodes[this.nodesHash[nodeID]].sons[i]]].father=null;
		}
		this.nodes.splice(this.nodesHash[nodeID],1);
		for(var i=this.nodesHash[nodeID];i<this.nodes.length;i++)
			this.nodesHash[this.nodes[i].id]--;
		delete this.nodesHash[nodeID];
	};
	this.addEdge = function addEdge(id1,id2){//add an edge between two node based on there id
		if(typeof(this.nodesHash[id1])=='undefined')
			console.log(id1+" is undefined");
		else if(typeof(this.nodesHash[id2])=='undefined')
			console.log(id2+" is undefined");
		else{
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class=="link" && ((this.links[i].sourceID==id1 && this.links[i].targetID==id2) || (this.links[i].sourceID==id2 && this.links[i].targetID==id1))){
					console.log("this link between "+id1+" "+id2+" already exist !");
					return;
				}
			}
			this.links.push(new Edge(id1,id2,"link"));
		}
	};
	this.removeEdge = function removeEdge(sid,tid){//remove an edge between two nodes based on there id
		if(typeof(this.nodesHash[sid])=='undefined')
			console.log(sid+" is undefined");
		else if(typeof(this.nodesHash[tid])=='undefined')
			console.log(tid+" is undefined");
		else{
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class=="link" && ((this.links[i].sourceID==sid && this.links[i].targetID==tid) || (this.links[i].sourceID==tid && this.links[i].targetID==sid)))
					this.links.splice(i--,1);				
			}
		}		
	};
	this.removeParenting = function removeParenting(son){//remove the parent link between a son and its father
		if(typeof(this.nodesHash[son])=='undefined')
			console.log(son+" is undefined");
		else if(this.nodes[this.nodesHash[son]].father==null)
			console.log("father is undefined");
		else{
			var fath=this.nodes[this.nodesHash[son]].father;
			this.nodes[this.nodesHash[fath]].sons=remove(son,this.nodes[this.nodesHash[fath]].sons);
			this.nodes[this.nodesHash[son]].father=null;
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class=="parent" && this.links[i].sourceID==fath && this.links[i].targetID==son)
					this.links.splice(i--,1);				
			}
		}
	};
	this.log = function log(){
		console.log("nodehash : \n");
		console.log(this.nodesHash);
		console.log("\n");
		console.log("nodes : \n");
		console.log(this.nodes);
		console.log("\n");
		console.log("links : \n");
		console.log(this.links);
		console.log("\n");
	};
	this.joinNodes = function joinNodes(){
		return this.nodes;
	};
	this.joinEdges = function joinEdges(){
		return this.links;
	};
};
/*var layer=new LayeredGraph(); // example
console.log(" ====================== gen graph : ==========================\n");
layer.log();
layer.addNode(["bla"],"n1");
console.log(" ====================== add node1 : ==========================\n");
layer.log();
layer.addNode(["bla"],"n2");
console.log(" ====================== add node2 : ==========================\n");
layer.log();
layer.addNode(["bla"],"n3");
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
layer.addNode(["bla"],"n2");
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
layer.log();*/
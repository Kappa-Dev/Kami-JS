//layered_graph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
//node definition
function Node(classes,id,x,y,fixed){
	this.classes=classes;//the node class
	this.id=id;//the node id
	this.sons=[];// the node sons
	this.father=null;//the node father
	this.context=[];//alternatively a context for an action or a value list for a flag or an attribute
	this.label=[];
	if(typeof(x)!='undefined') this.x=x;//node coordinate
	if(typeof(y)!='undefined') this.y=y;
	if(typeof(fixed)!='undefined') this.fixed=fixed;//node position fixed
	this.selected=false;
	this.toInt = function(){
		switch(classes[0]){
			case "action" : if(classes[1]!="binder")return 80; else return 4;
			case "key_res" : return 20;
			case "region" : return 30;
			case "agent" : return 40;
			case "flag" : return 12;
			case "attribute" : return 10;
		}
	};
}; 
//edge definition
function Edge(node1,node2,e_class){//node1 and node2 are objects
	this.source=node1;
	this.target=node2;
	this.sourceID=node1.id;
	this.targetID=node2.id;
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
	var remove = function(l_el,list){//remove an element from a list : if the element doesn't exist, do nothing !
		for(var i=0;i<list.length;i++){
			if(list[i]==l_el)
				list.splice(i,1);
		}
	}
	this.mergeDiff = function mergeDiff(s_node,t_node){//merge two existing nodes : a source node to a specific target node (by ID) : source become the target
		if(typeof(this.nodesHash[s_node])=='undefined')
			console.log(s_node+" doesn't exist !");
		else if(typeof(this.nodesHash[t_node])=='undefined')
			console.log(t_node+" doesn't exist !");
		else{
			var tmp_node=this.nodes[this.nodesHash[s_node]];
			var tmp_edges=[];
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class == "link" && this.links[i].sourceID==s_node && this.links[i].targetID==s_node){//if the source point itself, generate an edge from target to target
					tmp_edges.push(new Edge(this.nodes[this.nodesHash[t_node]],this.nodes[this.nodesHash[t_node]],"link"));
					this.links.splice(i--,1);
				}else if(this.links[i].e_class == "link" && this.links[i].sourceID==s_node){//if source is the source, replace with the target
					tmp_edges.push(new Edge(this.nodes[this.nodesHash[t_node]],this.nodes[this.nodesHash[this.links[i].targetID]],"link"));
					this.links.splice(i--,1);
				}else if(this.links[i].e_class == "link" && this.links[i].targetID==s_node){//idem if target
					tmp_edges.push(new Edge(this.nodes[this.nodesHash[this.links[i].sourceID]],this.nodes[this.nodesHash[t_node]],"link"));
					this.links.splice(i--,1);
				}else if(this.links[i].e_class == "link" && (this.links[i].sourceID==t_node || this.links[i].targetID==t_node)){//add also all the edges from and to target node
					var spres=this.links.splice(i--,1);
					tmp_edges.push(spres[0]);	
				}				
			}
			for(var i=0;i<tmp_edges.length;i++){
				if(tmp_edges[i].sourceID == tmp_edges[i].targetID){
					tmp_edges.splice(i--,1);
				}else{
					for(var j=i+1;j<tmp_edges.length;j++){
						if((tmp_edges[j].sourceID == tmp_edges[i].sourceID && tmp_edges[j].targetID == tmp_edges[i].targetID) || (tmp_edges[j].targetID == tmp_edges[i].sourceID && tmp_edges[j].sourceID == tmp_edges[i].targetID)){
							tmp_edges.splice(j--,1);
						}
					}
				}
			}
			this.links=this.links.concat(tmp_edges);
			for(var i=0;i<tmp_node.sons.length;i++){
				this.removeParenting(tmp_node.sons[i]);
				this.setFather(tmp_node.sons[i],t_node);
			}
			this.nodes[this.nodesHash[t_node]].context=union(tmp_node.context,this.nodes[this.nodesHash[t_node]].context);
			this.nodes[this.nodesHash[t_node]].label=union(tmp_node.label,this.nodes[this.nodesHash[t_node]].label);
			this.removeNode(s_node);
		}			
	};
	this.merge = function merge(node,replace){// merges two nodes of the same id : if replace is defined, the new one replace the old, else they are merged
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
			this.nodes[this.nodesHash[node.id]].fixed=node.fixed;
		}else{
			this.nodes[this.nodesHash[node.id]].classes=union(node.classes,this.nodes[this.nodesHash[node.id]].classes);
			this.nodes[this.nodesHash[node.id]].sons=union(node.sons,this.nodes[this.nodesHash[node.id]].sons);
			this.nodes[this.nodesHash[node.id]].context=union(node.context,this.nodes[this.nodesHash[node.id]].context);
			this.nodes[this.nodesHash[node.id]].label=union(node.label,this.nodes[this.nodesHash[node.id]].label);
		}
	};
	this.addNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodefixed){//add a new node not existing yet, else do nothing
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodefixed);
		if(typeof(this.nodesHash[tmp_node.id])!='undefined')
			console.log("node already existing, use merge(false) or update instead");
		else this.merge(tmp_node,false);		
	};
	this.updateNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodefixed){//update an existing node (if not existing, create it and trigger a warning)
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodefixed);
		if(typeof(this.nodesHash[tmp_node.id])=='undefined')
			console.log("node not already existing, use addNode instead");
		this.merge(tmp_node,false);		
	};
	this.replaceNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodefixed){//replace an existing node with a new one. if the node doesn't exist, show a warning
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodefixed);
		if(typeof(this.nodesHash[tmp_node.id])=='undefined')
			console.log("node not existing, prefere using merge or addnode instead");
		this.merge(tmp_node,true);		
	};
	this.setFather = function setFather(son,fath){//define a node as the father of an other one : son, father: id
		if(typeof(this.nodesHash[fath])!='undefined' && typeof(this.nodesHash[son])!='undefined'){
			if(this.nodes[this.nodesHash[son]].father==null){
				this.nodes[this.nodesHash[son]].father=fath;
				this.nodes[this.nodesHash[fath]].sons=union([son],this.nodes[this.nodesHash[fath]].sons);
				this.links.push(new Edge(this.nodes[this.nodesHash[fath]],this.nodes[this.nodesHash[son]],"parent"));//link is from the father to the son !
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
			remove(nodeID,this.nodes[this.nodesHash[this.nodes[this.nodesHash[nodeID]].father]].sons);//retire le noeud de la liste des fils de son pere.
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
			this.links.push(new Edge(this.nodes[this.nodesHash[id1]],this.nodes[this.nodesHash[id2]],"link"));
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
			remove(son,this.nodes[this.nodesHash[fath]].sons);
			this.nodes[this.nodesHash[son]].father=null;
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class=="parent" && this.links[i].sourceID==fath && this.links[i].targetID==son)
					this.links.splice(i--,1);				
			}
		}
	};
	this.addCtx = function addCtx(nodeID,ctx_el_l){//add a list of elements to a context
		if(typeof(this.nodesHash[nodeID])=='undefined'){
			console.log("addCtx : the node "+nodeID+"doesn't exist");
			return;
		}
		this.nodes[this.nodesHash[nodeID]].context=union(this.nodes[this.nodesHash[nodeID]].context,ctx_el_l);	
	};
	this.rmCtx = function rmCtx(nodeID,ctx_el_l){//remove a list of elements from a context
		if(typeof(this.nodesHash[nodeID])=='undefined'){
			console.log("rmCtx : the node "+nodeID+" doesn't exist");
			return;
		}
		for(var i=0;i<ctx_el_l.length;i++){
			remove(ctx_el_l[i],this.nodes[this.nodesHash[nodeID]].context);
		}
		if(ctx_el_l.length==0)
			this.nodes[this.nodesHash[nodeID]].context=[];
	};
	this.addLabel = function addLabel(nodeID,lbl_el_l){//add a list of elements to a label
		if(typeof(this.nodesHash[nodeID])=='undefined'){
			console.log("addLabel : the node "+nodeID+" doesn't exist");
			return;
		}
		this.nodes[this.nodesHash[nodeID]].label=union(this.nodes[this.nodesHash[nodeID]].label,lbl_el_l);	
	};
	this.rmLabel = function rmLabel(nodeID,lbl_el_l){//remove a list of elements from a context
		if(typeof(this.nodesHash[nodeID])=='undefined'){
			console.log("rmLabel : the node "+nodeID+" doesn't exist");
			return;
		}
		if(lbl_el_l.length==0){
			this.nodes[this.nodesHash[nodeID]].label=[];
			return;
		}
		for(var i=0;i<lbl_el_l.length;i++){
			remove(lbl_el_l[i],this.nodes[this.nodesHash[nodeID]].label);
		}
	};
	this.getPath = function getPath(nodeID){//for a specific node id, get its path : A->a->a1 path is : [a,A] for a1 and [A] for a
		var res=[];
		var tmp_id=nodeID;
		while(this.nodes[this.nodesHash[tmp_id]].father!=null){
			res.push(this.nodes[this.nodesHash[tmp_id]].father);
			tmp_id=this.nodes[this.nodesHash[tmp_id]].father;
		}return res;
	}
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
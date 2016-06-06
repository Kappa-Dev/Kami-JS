//layered_graph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
//layeredgraph class
function LayeredGraph(nodes,edges){
    function Stack(f_id, fun_list, idx){
        var id=f_id;
        this.stack=[];
        if(typeof(fun_list)!= 'undefined')
            this.stack=fun_list;
        this.idx=0;
        if(typeof(idx)!='undefined' && idx<this.stack.length && idx>0)
            this.idx=idx;
        this.undo = function(redo){
            if(idx>=0){
                this.stack.push(redo);
                var fun=this.stack[idx--];
                fun.f.apply(fun.o,fun.p);
            }else console.log("stack empty for "+f_id);
        }
        this.redo = function(){
            if(idx<this.stack.length-1){
                var fun=this.stack[++idx];
                fun.f.apply(fun.o,fun.p);
            }else console.log("no redo for "+f_id);
        }
        this.add = function(undo){
            this.stack.push(undo);
            idx=this.stack.length-1;
        }
    }
    function Node(type, id, uid, labels,values, father,sons,linked,stack){

    }
    function Action(type,id,nid,labels,context,attr_l, left, right, stack){

    }
    function Edge(type,id,input,output){

    }
}
//node definition

function Node(classes,id,x,y,fixed){
	this.classes=classes;//the node class
	this.id=id;//the node id
	this.sons=[];// the node sons
	this.father=null;//the node father
	this.context=[];//alternatively a context for an action or a value list for a flag or an attribute
	this.label=[];
	this.valued_context=null;//the value for flag or attributes of a context
	this.apply_context=null;//information about to who the context is applyed (all the occurence of the element or only one part)
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
	this.init = function init(){
		this.nodesHash={};// the hashtable in order to get a node by his name
		this.nodes=[];//liste des noeud
		this.links=[];//liste des arcs
	}
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
	var fusACtx = function(context,old_vctx,new_vctx){//fusion of two applying context
		var res={};
		if(typeof(old_vctx)!="undefined" && old_vctx!=null && typeof(new_vctx)!="undefined" && new_vctx!=null ){
			var o_keys = Object.keys(old_vctx);
			var n_keys = Object.keys(new_vctx);
			for(var i=0;i<o_keys.length;i++){
				if(old_vctx[o_keys[i]]==null){
					if(typeof(new_vctx[o_keys[i]])!='undefined' && new_vctx[o_keys[i]]!=null)
						res[o_keys[i]]=new_vctx[o_keys[i]].concat();
					else
						res[o_keys[i]]=null;
				}else {
					if(typeof(new_vctx[o_keys[i]])=='undefined' || new_vctx[o_keys[i]]==null)
						res[o_keys[i]]=old_vctx[o_keys[i]].concat();
					else{
						res[o_keys[i]]=[];
						for(var j=0;j<old_vctx[o_keys[i]].length;j++){
							if(old_vctx[o_keys[i]][j]=="E")
								res[o_keys[i]].push(new_vctx[o_keys[i]][j]);
							else
								res[o_keys[i]].push(old_vctx[o_keys[i]][j]);
						}
					}
				}
			}
			for(var i=0;i<n_keys.length;i++){
				if(o_keys.indexOf(n_keys[i])==-1){
					if(new_vctx[n_keys[i]]==null) res[n_keys[i]]=null;
					else res[n_keys[i]]=new_vctx[n_keys[i]].concat();
				}
			}
		}else if((typeof(old_vctx)=="undefined" || old_vctx==null) && typeof(new_vctx)!="undefined" && new_vctx!=null )
			res=dumpACtx(new_vctx);
		else if(typeof(old_vctx)!="undefined" && old_vctx!=null && (typeof(new_vctx)=="undefined" || new_vctx==null) )
			res=dumpACtx(old_vctx);
		else return null;
		var r_keys=Object.keys(res);
		for(var i=0;i<r_keys.length;i++){
			if(context.indexOf(r_keys[i])==-1)
				delete(res[r_keys[i]]);
		}
		return res;
	}
	var fusVCtx = function(context,old_vctx,new_vctx){//fusion of two valued context for actions
		var res={};
		if(old_vctx!=null && new_vctx!=null ){
			var o_keys = Object.keys(old_vctx);
			var n_keys = Object.keys(new_vctx);
			for(var i=0;i<o_keys.length;i++){
				if(new_vctx[o_keys[i]]!=undefined)
					res[o_keys[i]]=union(old_vctx[o_keys[i]],new_vctx[o_keys[i]]);
				else
					res[o_keys[i]]=old_vctx[o_keys[i]].concat();
			}
			for(var i=0;i<n_keys.length;i++){
				if(o_keys.indexOf(n_keys[i])==-1)
					res[n_keys[i]]=new_vctx[n_keys[i]].concat();
			}
		}else if(old_vctx==null && new_vctx!=null)
			res=dumpVCtx(new_vctx);
		else if(new_vctx==null && old_vctx!=null)
			res=dumpVCtx(old_vctx);
		else return null;
		var r_keys=Object.keys(res);
		for(var i=0;i<r_keys.length;i++){
			if(context.indexOf(r_keys[i])==-1)
				delete(res[r_keys[i]]);
		}
		return res;
	}
	var dumpACtx = function(vtcx){
		if(typeof(vctx)=="undefined" || vtcx==null) return null;
		var res={};
		var key =Object.keys(vtcx);
		for(var i=0;i<key.length;i++){
			if(vtcx[key[i]]==null) res[key[i]]=null;
			else res[key[i]]=vtcx[key[i]].concat();
		}
		return res;
	}
	var dumpVCtx = function(vtcx){
		if(vtcx==null) return null;
		var res={};
		var key =Object.keys(vtcx);
		for(var i=0;i<key.length;i++)
			res[key[i]]=vtcx[key[i]].concat();
		return res;
	}
	this.copyVCtx = function copyVCtx(vctx){
		return dumpVCtx(vctx);
	}
	this.copyACtx = function copyACtx(vctx){
		return dumpACtx(vctx);
	}
	this.mergeDiff = function mergeDiff(s_node,t_node){//merge two existing nodes : a source node to a specific target node (by ID) : source become the target
		if(this.nodes[this.nodesHash[s_node]].classes.join(",")!=this.nodes[this.nodesHash[t_node]].classes.join(",")){
			console.log("can't merge nodes from different classes");
			return;
		}
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
				if(tmp_edges[i].sourceID == tmp_edges[i].targetID){//remove every cycle created
					tmp_edges.splice(i--,1);
				}else{
					for(var j=i+1;j<tmp_edges.length;j++){//remove every doublon
						if((tmp_edges[j].sourceID == tmp_edges[i].sourceID && tmp_edges[j].targetID == tmp_edges[i].targetID) || (tmp_edges[j].targetID == tmp_edges[i].sourceID && tmp_edges[j].sourceID == tmp_edges[i].targetID)){
							tmp_edges.splice(j--,1);
						}
					}
				}
			}
			this.links=this.links.concat(tmp_edges);
			for(var i=0;i<tmp_node.sons.length;i++){
				var tmp_son=tmp_node.sons[i--];
				this.removeParenting(tmp_son);
				this.setFather(tmp_son,t_node);
			}
			for(var i=0;i<this.nodes.length;i++){
				var cp=this.nodes[i].context.indexOf(s_node);
				if(cp!=-1){
					if(this.nodes[i].context.indexOf(t_node)==-1)
						this.nodes[i].context[cp]=t_node;
					else
						this.nodes[i].context.splice(cp,1);
				} 
			}
			this.nodes[this.nodesHash[t_node]].context=union(tmp_node.context,this.nodes[this.nodesHash[t_node]].context);
			this.nodes[this.nodesHash[t_node]].label=union(tmp_node.label,this.nodes[this.nodesHash[t_node]].label);
			this.nodes[this.nodesHash[t_node]].classes=union(tmp_node.classes,this.nodes[this.nodesHash[t_node]].classes);
			if(this.nodes[this.nodesHash[t_node]].classes[0]=="action"){
				this.nodes[this.nodesHash[t_node]].valued_context=fusVCtx(this.nodes[this.nodesHash[t_node]].context,this.nodes[this.nodesHash[t_node]].valued_context,tmp_node.valued_context);
				this.nodes[this.nodesHash[t_node]].apply_context=fusACtx(this.nodes[this.nodesHash[t_node]].context,this.nodes[this.nodesHash[t_node]].apply_context,tmp_node.apply_context);
			}
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
			this.nodes[this.nodesHash[node.id]].valued_context=node.valued_context;
			this.nodes[this.nodesHash[node.id]].apply_context=node.apply_context;
		}else{
			this.nodes[this.nodesHash[node.id]].classes=union(node.classes,this.nodes[this.nodesHash[node.id]].classes);
			this.nodes[this.nodesHash[node.id]].sons=union(node.sons,this.nodes[this.nodesHash[node.id]].sons);
			this.nodes[this.nodesHash[node.id]].context=union(node.context,this.nodes[this.nodesHash[node.id]].context);
			this.nodes[this.nodesHash[node.id]].label=union(node.label,this.nodes[this.nodesHash[node.id]].label);
			this.nodes[this.nodesHash[node.id]].valued_context=fusVCtx(this.nodes[this.nodesHash[node.id]].context,node.valued_context,this.nodes[this.nodesHash[node.id]].valued_context);
			this.nodes[this.nodesHash[node.id]].apply_context=fusACtx(this.nodes[this.nodesHash[node.id]].context,node.apply_context,this.nodes[this.nodesHash[node.id]].apply_context);
		}
	};
	this.addNode = function addNode(nodeClasses,nodeID,nodeX,nodeY,nodefixed){//add a new node not existing yet, else do nothing
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodefixed);
		if(typeof(this.nodesHash[tmp_node.id])!='undefined')
			console.log("node already existing, use merge(false) or update instead");
		else this.merge(tmp_node,false);		
	};
	this.updateNode = function updateNode(nodeClasses,nodeID,nodeX,nodeY,nodefixed){//update an existing node (if not existing, create it and trigger a warning)
		var tmp_node=new Node(nodeClasses,nodeID,nodeX,nodeY,nodefixed);
		if(typeof(this.nodesHash[tmp_node.id])=='undefined')
			console.log("node not already existing, use addNode instead");
		this.merge(tmp_node,false);		
	};
	this.replaceNode = function replaceNode(nodeClasses,nodeID,nodeX,nodeY,nodefixed){//replace an existing node with a new one. if the node doesn't exist, show a warning
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
		else{
			console.log("error : son or father ins't defined : son : "+son+" "+typeof(this.nodesHash[son])+" father : "+fath+" "+typeof(this.nodesHash[fath]));
			
		}
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
	this.addInfluence = function addInfluence(id1,id2,type){//add an edge between two node based on there id
		if(typeof(this.nodesHash[id1])=='undefined')
			console.log(id1+" is undefined");
		else if(typeof(this.nodesHash[id2])=='undefined')
			console.log(id2+" is undefined");
		else{
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class==type && ((this.links[i].sourceID==id1 && this.links[i].targetID==id2) || (this.links[i].sourceID==id2 && this.links[i].targetID==id1))){
					console.log("this influence between "+id1+" "+id2+" already exist !");
					return;
				}
			}
			this.links.push(new Edge(this.nodes[this.nodesHash[id1]],this.nodes[this.nodesHash[id2]],type));
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
	this.removeInfluence = function removeInfluence(sid,tid,type){//remove an edge between two nodes based on there id
		if(typeof(this.nodesHash[sid])=='undefined')
			console.log(sid+" is undefined");
		else if(typeof(this.nodesHash[tid])=='undefined')
			console.log(tid+" is undefined");
		else{
			for(var i=0;i<this.links.length;i++){
				if(this.links[i].e_class==type && ((this.links[i].sourceID==sid && this.links[i].targetID==tid) || (this.links[i].sourceID==tid && this.links[i].targetID==sid)))
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
	this.addCtx = function addCtx(nodeID,ctx_el_l,vctx,actx){//add a list of elements to a context and if needed, the specific value for flag and attributes of the context
		if(typeof(this.nodesHash[nodeID])=='undefined'){
			console.log("addCtx : the node "+nodeID+"doesn't exist");
			return;
		}
		this.nodes[this.nodesHash[nodeID]].context=union(this.nodes[this.nodesHash[nodeID]].context,ctx_el_l);
		this.nodes[this.nodesHash[nodeID]].valued_context=fusVCtx(this.nodes[this.nodesHash[nodeID]].context,this.nodes[this.nodesHash[nodeID]].valued_context,vctx);
		this.nodes[this.nodesHash[nodeID]].apply_context=fusACtx(this.nodes[this.nodesHash[nodeID]].context,this.nodes[this.nodesHash[nodeID]].apply_context,actx);
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
		this.nodes[this.nodesHash[nodeID]].valued_context=fusVCtx(this.nodes[this.nodesHash[nodeID]].context,this.nodes[this.nodesHash[nodeID]].valued_context,null);
		this.nodes[this.nodesHash[nodeID]].apply_context=fusACtx(this.nodes[this.nodesHash[nodeID]].context,this.nodes[this.nodesHash[nodeID]].apply_context,null);
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
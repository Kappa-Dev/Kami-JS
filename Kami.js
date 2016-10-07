function Kami(){
	var nuggets ={"g_0":(function(){
		var tmp=new Nugget("g_0","Root","Graph definition");
		tmp.getGraph().addNode("NODE",["Node"]);
		tmp.getGraph().addEdge("EDGE","n_0","n_0");
		console.log("root generated !");
		return tmp;
		})()
	};
	var self=this;
	var undoRedo = new UndoRedoStack();
	var NUGGET_ID = 1;
	var FUN_CALL = 0;
	this.getNuggets = function getNuggets(){
		return Object.keys(nuggets);
	}
	this.addNugget = function addNugget(n,c,f){
		fth=f||"g_0";
		if(!nuggets[fth]) throw new Error("The graph father doesn't exist !!");
		nuggets["g_"+NUGGET_ID]=new Nugget("g_"+NUGGET_ID,n,c);
		nuggets["g_"+NUGGET_ID].setFather(fth);
		nuggets[fth].addSon("g_"+NUGGET_ID);
		NUGGET_ID++;
		//undoRedo.stack(null,nuggets["g_"+NUGGET_ID].saveState());	
	};
	this.rmNugget = function rmNugget(g_id,force){
		if(!g_id) throw new Error("Undefined graph");
		if(g_id=="g_0")
			throw new Error("can't remove the ROOT nugget");
		if(!nuggets[g_id])
			throw new Error ("unexisting nugget : "+g_id);
		else if(nuggets[g_id] && !nuggets[g_id].hasSon()){
			nuggets[nuggets[g_id].getFather()].rmSon(g_id);
			delete nuggets[g_id];
		}
		else if(nuggets[g_id] && nuggets[g_id].hasSon() && !force)
			console.error("This nugget has sons, please remove it before, or use rmNugget with force option");
		else if(nuggets[g_id] && nuggets[g_id].hasSon() && force){
			nuggets[g_id].getSons().forEach(function(e){
				self.rmNugget(e,force);
			});
		}	
	};
	this.getNgName = function getNgName(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getName()
	};
	this.getNgComment = function getNgComment(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getComment();
	};
	this.getNgRefs = function getNgRefs(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getRefs();
	};
	this.getNgFather = function getNgFather(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getFather();
	};
	this.getNgSons = function getNgSons(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getSons();
	};
	this.ngVisible = function ngVisible(g,v){//use tri-valued logic : true, false, null/undefined
		if(!v && v!=false) return nuggets[g].isVisible();
		if(v==true) nuggets[g].show();
		if(v==false) nuggets[g].hide();
	};
	this.setNgName = function setNgName(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].setName(v);
	};
	this.setNgComment = function setNgComment(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].setComment(v);
	};
	this.setNgDoi = function setNgDoi(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].setDoi(v);
	};
	this.setNgPubli = function setNgPubli(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].setPubli(v);
	};
	this.setNgUrl = function setNgUrl(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].setUrl(v);
	};
	this.setNgMeta = function setNgMeta(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].setMeta(v);
	};
	this.hasSon = function hasSon(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].hasSon(v);
	};
	this.nodeExist = function nodeExist(g,n_id){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].getGraph().nodeExist(n_id);
	};
	this.edgeExist = function edgeExist(g,n_id){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].getGraph().edgeExist(n_id);
	};
	this.getNodes = function getNodes(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getNodes();
	};
	this.getEdges = function getEdges(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getEdges();
	};
	this.getNodeByLabels = function getNodeByLabels(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getNodeByLabels(v);
	};
	this.getNodeByType = function getNodeByType(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getNodeByType(v);
	};
	this.getEdgeByType = function getEdgeByType(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getEdgeByType(v);
	};
	this.getEdgeBySource = function getEdgeBySource(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getEdgeBySource(v);
	};
	this.getEdgeByTarget = function getEdgeByTarget(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getEdgeByTarget(v);
	};
	this.getLabels = function getLabels(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getLabels(v);
	};
	this.getType = function getType(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getType(v);
	};
	this.getOutputNodes = function getOutputNodes(g,id,e_t){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getOutputNodes(id,e_t);
	};
	this.getInputNodes = function getInputNodes(g,id,e_t){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getInputNodes(id,e_t);
	};
	this.getSource = function getSource(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getSource(v);
	};
	this.getTarget = function getTarget(g,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getTarget(v);
	};
	var getLastNodeId = function(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getLastNodeId();
	};
	var getLastEdgeId = function(g){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().getLastEdgeId();
	};
	this.hasLabel = function hasLabel(g,id,v){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().hasLabel(id,v);
	};
	this.hasInputNode = function hasInputNode(g,id,v,t){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().hasInputNode(id,v,t);
	};
	this.hasOutputNode = function hasOutputNode(g,id,v,t){
		if(!g) throw new Error("Undefined graph");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		return nuggets[g].getGraph().hasOutputNode(id,v,t);
	};
	this.addNode = function addNode(g,t,l,rec){
		if(!g) throw new Error("Undefined graph");
		if(g=="g_0") throw new Error("can't add nodes to Root");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		if(!t || !nuggets[nuggets[g].getFather()].getGraph().nodeExist(t)){//if the type doesn't exist, return an error
			console.error("the type graph of "+g+" doesn't contain the type "+t);
			return;
		}
		var delta=nuggets[g].getGraph().addNode(t,l);
		if(rec && nuggets[g].hasSon()){
			nuggets[g].getSons().forEach(function(e){
				self.addNode(e,delta.enter.nodes[0],l,rec);
			});
		}
	};
	this.addEdge = function addEdge(g,t,i,o){
		if(!g) throw new Error("Undefined graph");
		if(g=="g_0") throw new Error("can't add edgesto Root");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		if(!t || !nuggets[nuggets[g].getFather()].getGraph().edgeExist(t)){//if the type doesn't exist, return an error
			console.error("the type graph of "+g+" doesn't contain the type "+t);
			return;
		}
		var delta=nuggets[g].getGraph().addEdge(t,i,o);
	};
	this.rmNode = function rmNode(g,n_id,force){
		if(!g) throw new Error("Undefined graph");
		if(g=="g_0") throw new Error("can't remove nodes from Root");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].getSons().forEach(function(e){
			nuggets[e].getGraph().getNodeByType(n_id).forEach(function(f){
				if(!force) throw new Error("This node ("+n_id+") is used as a type, please use force to remove it and all its sons");
				self.rmNode(e,f,force);
			});
		});
		nuggets[g].getGraph().rmNode(n_id);
	};
	this.rmEdge = function rmEdge(g,e_id,force){
		if(!g) throw new Error("Undefined graph");
		if(g=="g_0") throw new Error("can't remove edges from Root");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		if(!nuggets[g].getGraph().edgeExist(e_id))
			throw new Error("the edge doesn't exist : "+e_id);
		nuggets[g].getSons().forEach(function(e){
			nuggets[e].getGraph().getEdgeByType(e_id).forEach(function(f){
				if(!force) throw new Error("This edge ("+e_id+") is used as a type, please use force to remove it and all its sons");
				self.rmEdge(e,f,force);
			});
		});
		nuggets[g].getGraph().rmEdge(e_id);
	};
	this.merge = function merge(g,n_id1,n_id2){
		if(!g) throw new Error("Undefined graph");
		if(g=="g_0") throw new Error("can't merge nodes from Root");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		var delta=nuggets[g].getGraph().mergeNode(n_id1,n_id2);
		nuggets[g].getSons().forEach(function(e){
			union(
				nuggets[e].getGraph().getNodeByType(n_id1),
				nuggets[e].getGraph().getNodeByType(n_id2)
			).forEach(function(f){
				nuggets[e].getGraph().setType(f,delta.enter.nodes[0]);
			});
		});
	};
	this.clone = function clone(g,n_id){
		if(!g) throw new Error("Undefined graph");
		if(g=="g_0") throw new Error("can't merge nodes from Root");
		if(!nuggets[g]) throw new Error("this nugget doesn't exist : "+g);
		nuggets[g].getGraph().cloneNode(n_id);
	};
	this.log = function log(){
		(function recLog(e){
			nuggets[e].log();
			console.log("============>");
			if(nuggets[e].hasSon())
				nuggets[e].getSons().forEach(recLog);
		})("g_0");
	};
	this.search = function search(pattern){
		
	};
	this.replace = function replace(pattern,rule){
		
	};
	this.replaceAll = function replaceAll(pattern,rule){
		
	};
};


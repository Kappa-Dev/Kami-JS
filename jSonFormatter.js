//jSonFormatter.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function jSonFormatter(gGraph){
	var name=null;
	var json=null;
	this.gGraph=gGraph;
	var force=false;
	this.init = function init(filename){
		this.name=filename;
		d3.json(name,function(error, graph) {
			if (error) throw error;
			json={
				version:graph.version,
				agents:graph.agents,
				regions:graph.regions,
				key_rs:graph.key_rs,
				attributes:graph.attributes,
				flags:graph.flags,
				actions:graph.actions,
				actions_binder:graph.actions_binder,
				edges:graph.edges
			}
		});
	}
this.jsToLGraph = function jsToLGraph(){
	var force=false;
	if(typeof(json.version)=='undefined' || json.version==null || json.version<1.1)
		force=true;
	if(typeof(json.version)!='undefined')
		delete json.version;
	var keys = Object.keys(json);
	for(var i=0;i<keys.length;i++){
		if(typeof(json[keys[i]])!='undefined' && json[keys[i]]!=null && json[keys[i]].length>0){
			if(json[keys[i]]!="edges")
				this.genNode(json[keys[i]]);
			else
				this.genEdges();
		}else if(force){
			console.log("Unable to find"+json[keys[i]]+" !");
			return;
		}
	}
}

this.genNode = function genNode(key){
	for(var i=0;i<key.length;i++){
		gGraph.addNode(key[i].classes,json.regions[i].labels,findByName(key[i].path,key[i].path_cl),key[i].x,key[i].y);
		if(typeof(key[i].values)!='undefined' && key[i].values!=null && key[i].values.length>0)
			gGraph.addCtx(gGraph.lastNode(),key[i].values);
		if(typeof(key[i].context)!='undefined' && key[i].context!=null && key[i].context.length>0)
			gGraph.addCtx(gGraph.lastNode(),key[i].context);
	}
}
this.findByName = function findByName(path,class_path){//take a node path and a class path and find the correct path in the layered graph. return an ID path if correct, else, raise an error. if no path : return []
	
}
var checkpath = function(lgraph,path){
	for(var i=0;i<lgraph.nodes.length;i++){
		if(includeIn(path[0].classes,lgraph.nodes[i].classes) && includeIn(path[0].name,lgraph.nodes[i].label)){
			if(path.length==1){
				return lgraph.nodes[i].id;
			}else {
				if(checkpathId(lgraph,path.splice(1),lgraph.nodes[i].id))
					return lgraph.nodes[i].id;
			}
		}
	}
	return null;
}
var checkpathId = function(lgraph,path,id){
	f_id=lgraph.nodes[lgraph.nodesHash[id]].father;
	for(var i=0;i<path.length;i++){
		if(!(f_id != null 
			&& includeIn(path[i].classes,lgraph.nodes[lgraph.nodesHash[f_id]].classes) 
			&& includeIn(path[i].name,lgraph.nodes[lgraph.nodesHash[f_id]].label)
		)){
			return false;
		}else{
			f_id=lgraph.nodes[lgraph.nodesHash[f_id]].father
		}
	}return true;
}
var findNode = function(lgraph,path){
	var n_id = checkpath(lgraph,path);
	if(n_id ==null){
		console.log("no node for given path");
		console.log(path);
	}return n_id;
}
var includeIn = function(elm_l,list){
	var res=true;
	for(var i=0;i<elm_l.length;i++){
		var t_res=false;
		for(var j=0;j<list.length;j++){
			if(elm_l[i]==list[j])
				t_res=true;
		}res=res && t_res;
	}
	return res;
}
var old_trs = function(){

}

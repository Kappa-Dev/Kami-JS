//jSonFormatter.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function jSonFormatter(filename){
	var name=filename;
	var json=null;
	var n_cpt;
this.init = function init(count){
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
	});
	n_cpt=count;
}
this.jsToLGraph = function jsToLGraph(){
	if(typeof(json.version)=='undefined' || json.version==null || json.version[0].number<1.1)
		return old_trs();
	var lgraph=new LayeredGraph();
	if(typeof(json.agents)!='undefined' && json.agents!=null && json.agents.length>0){
		for(var i=0;i<json.agents.length;i++){
			lgraph.addNode(json.agents[i].classes,"n"+n_cpt++);
			if(json.agents[i].labels.length>0)
				lgraph.addLabel("n"+n_cpt-1,json.agents[i].labels);
		}
	}if(typeof(json.regions)!='undefined' && json.regions!=null && json.regions.length>0){
		for(var i=0;i<json.regions.length;i++){
			lgraph.addNode(json.regions[i].classes,"n"+n_cpt++);
			if(json.regions[i].path.length>1)
				lgraph.setFather("n"+n_cpt-1,findNode(lgraph,json.regions[i].path.splice(1)));
			if(json.regions[i].labels.length>0)
				lgraph.addLabel("n"+n_cpt-1,json.regions[i].labels);
		}
	}if(typeof(json.key_rs)!='undefined' && json.key_rs!=null && json.key_rs.length>0){
		for(var i=0;i<json.key_rs.length;i++){
			lgraph.addNode(json.key_rs[i].classes,"n"+n_cpt++);
			if(json.key_rs[i].path.length>1)
				lgraph.setFather("n"+n_cpt-1,findNode(lgraph,json.key_rs[i].path.splice(1)));
			if(json.key_rs[i].labels.length>0)
				lgraph.addLabel("n"+n_cpt-1,json.key_rs[i].labels);
		}
	}if(typeof(json.attributes)!='undefined' && json.attributes!=null && json.attributes.length>0){
		for(var i=0;i<json.attributes.length;i++){
			lgraph.addNode(json.attributes[i].classes,"n"+n_cpt++);
			if(json.attributes[i].path.length>1)
				lgraph.setFather("n"+n_cpt-1,findNode(lgraph,json.attributes[i].path.splice(1)));
			if(json.attributes[i].labels.length>0)
				lgraph.addLabel("n"+n_cpt-1,json.attributes[i].labels);
			if(json.attributes[i].values.length>0)
				lgraph.addCtx("n"+n_cpt-1,json.attributes[i].values);
			
		}
	}if(typeof(json.flags)!='undefined' && json.flags!=null && json.flags.length>0){
		for(var i=0;i<json.flags.length;i++){
			lgraph.addNode(json.flags[i].classes,"n"+n_cpt++);
			if(json.flags[i].path.length>1)
				lgraph.setFather("n"+n_cpt-1,findNode(lgraph,json.flags[i].path.splice(1)));
			if(json.flags[i].labels.length>0)
				lgraph.addLabel("n"+n_cpt-1,json.flags[i].labels);
			if(json.flags[i].values.length>0)
				lgraph.addCtx("n"+n_cpt-1,json.flags[i].values);
			
		}
	}if(typeof(json.actions)!='undefined' && json.actions!=null && json.actions.length>0){
		for(var i=0;i<json.actions.length;i++){
			lgraph.addNode(json.actions[i].classes,"n"+n_cpt++);
			if(json.actions[i].labels.length>0)
				lgraph.addLabel("n"+n_cpt-1,json.actions[i].labels);
			if(json.actions[i].context.length>0){
				lgraph.addCtx("n"+n_cpt-1,json.actions[i].context);
				//gen node context + merge !
			}
			if(json.actions[i].left.length>0){
				//gen link left + gen node left + gen bind left
			}
			if(json.actions[i].right.length>0){
				//gen link right + gen node right + gen bind right
			}
		}
	}
	
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

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
		force=false;
	if(typeof(json.version)=='undefined' || json.version==null || json.version<1.1)
		force=true;
	if(typeof(json.version)!='undefined')
		delete json.version;
	var keys = Object.keys(json);
	for(var i=0;i<keys.length;i++){
		if(typeof(json[keys[i]])!='undefined' && json[keys[i]]!=null && json[keys[i]].length>0){
			if(json[keys[i]]=="agents" || json[keys[i]]=="regions" || json[keys[i]]=="key_rs" || json[keys[i]]=="attributes" || json[keys[i]]=="flags" || json[keys[i]]=="actions" || json[keys[i]]=="actions_binder")
				this.genNode_Rec(json[keys[i]],keys[i]);
			else if(json[keys[i]]=="edges")
				this.genEdges();
			else console.log("unknown key : "+keys[i]);
		}else if(force){
			console.log("Unable to find"+json[keys[i]]+" !");
			return;
		}
	}
}
this.classCast = function classCast(cls){
	switch(cls){
		case "key_r":
		case "key_rs":
		return "key_res";
		case "bind":
		return "bnd";
		case "mod":
		return "mod";
		case "attr":
		return "attribute";
		default
		return cls;
	}
}
this.setMod = function setMod(val){
	if(val=="incr") return "pos";
	else return "neg";
}
this.castCtx = function castCtx(ctx){
	var ret=[];
	for(var i=0;i<ctx.length;i++){
		ret.push({labels:[ctx[i].el_path[ctx[i].el_path.length-1]],path:ctx[i].el_path.splice(ctx[i].el_path.length-1,1),path_cl:ctx[i].el_cl[1],values:ctx[i].el_value});
	}
	return ret;
}
this.oldCast = function oldCast(elt,elt_class){
	switch(elt_class){
		case "agent":
			return {classes:["agent"],labels:[elt.name],path:[],path_cl:null,values:null,x:elt.cx,y:elt.cy};
		case "regions":
			return {classes:["region"],labels:[elt.name],path:[elt.ag_name],path_cl:"agent",values:null};
		case "key_rs":
			if(elt.region_name!=null)
				return {classes:["key_res"],labels:[elt.name],path:[elt.region_name,elt.ag_name],path_cl:"region",values:null};
			else
				return {classes:["key_res"],labels:[elt.name],path:[elt.ag_name],path_cl:"agent",values:null};
		case "attributes":
				return {classes:["attribute","list"],labels:[elt.name],path:elt.dest_path,path_cl:this.classCast(elt.dest_class[1]),values:elt.values};
		case "flags":
			return {classes:["flag"],labels:[elt.name],path:elt.dest_path,path_cl:this.classCast(elt.dest_class[1]),values:elt.values};
		case "actions":
			if(elt.classes[2]=="mod")
				return {classes:["action",this.classCast(elt.classes[2]),this.setMod(elt.mods)],labels:[elt.name],path:[],path_cl:null,context:this.castCtx(elt.context)};
			else
				return {classes:["action",this.classCast(elt.classes[2])],labels:[elt.name],path:[],path_cl:null,context:this.castCtx(elt.context)};
		case "actions_binder":
			return {classes:["action","binder",elt.name],labels:[],path:[elt.act_name],path_cl:"action",values:null};
		case "edges":
			return {in_class:this.classCast(elt.in_class[1]),in_path:elt.in_path,out_class:this.classCast(elt.out_class[1]),out_path:elt.out_path};
		default:
			console.log("unknown key class : "+elt_class);
			return null;
	}
}
this.genNode_Rec = function genNode_Rec(key,elt_class){
	for(var i=0;i<key.length;i++){
		var tmp_el=key[i];
		if(force) tmp_el=this.oldCast(tmp_el,elt_class);
	//for agent : create node + merge if needed.
		if
	//for region : create father if needed + merge if needed + create node region + merge if needed.
	//for key residus : create all element needed on the path + merge them if needed + create key residus +merge if needed.
	//for flags : create all element needed on the path + merge them if needed + create flag +merge if needed.
	//for attributes : create all element needed on the path + merge them if needed + create attribute + merge if needed.
	//for action : create node + merge if needed + create all element of context needed + merge them.
	}
}
this.genNode = function genNode(key_el){
	for(var i=0;i<key_el.length;i++){
		tmp_el=key_el[i];
		if(force){
			tmp_el=this.oldCast(tmp_el);
		}
		var n_id=findByName(tmp_el.path.push(tmp_el.labels),tmp_el.path_cl);
		var fath_id=findByName(tmp_el.path,tmp_el.path_cl);
		gGraph.addNode(key[i].classes,key[i].labels,fath_id,key[i].x,key[i].y);
		if(typeof(key[i].values)!='undefined' && key[i].values!=null && key[i].values.length>0)
			gGraph.addCtx(gGraph.lastNode(),key[i].values);
		if(typeof(key[i].context)!='undefined' && key[i].context!=null && key[i].context.length>0){
			for(var j=0;j<key[i].context.length;j++){
				this.genNode(key[i].context)
			}
			gGraph.addCtx(gGraph.lastNode(),key[i].context);
		}
		if(n_id!=null)
			gGraph.mergeNode(gGraph.lastNode(),n_id);
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

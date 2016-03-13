//jSonFormatter.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function jSonFormatter(gGraph){
	var name=null;
	var json=null;
	var gGraph=gGraph;
	var force=false;
	//var count=-1;
	this.init = function init(filename){//import a layered graph from a json file
		name=filename;
		count=gGraph.lastNode();
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
			jsToLGraph();
		});	
	}
	var jsToLGraph = function(){//translate json to graph
		force=false;
		if(typeof(json.version)=='undefined' || json.version==null || json.version<1.1)
			force=true; oldCast();
		console.log(json);
		var keys = Object.keys(json);
		for(var i=0;i<keys.length;i++){
			if(typeof(json[keys[i]])!='undefined' && json[keys[i]]!=null && json[keys[i]].length>0){
				if(json[keys[i]]=="edges") genEdges(json[keys[i]]);
				else genNode_Rec(json[keys[i]],keys[i]);
			}else if(force && keys[i]!="version"){
				console.log("Unable to find"+keys[i]+" !");
				return;
			}
		}
	}
	var oldCast = function(){//cast the old version of json in the new one
		var keys=Object.keys(json);
		for(var i=0;i<keys.length;i++){
			if(typeof(json[keys[i]])=='undefined' || json[keys[i]]==null || json[keys[i]].length==0) continue;	
			for(var j=0;j<json[keys[i]].length;j++){
				var elt=json[keys[i]][j];
				switch(keys[i]){
					case "agents":     json[keys[i]][j]={classes:["agent"],labels:[elt.name],path:[],path_cl:null,values:null,x:elt.cx,y:elt.cy};break;
					case "regions":    json[keys[i]][j]= {classes:["region"],labels:[elt.name],path:[elt.ag_name],path_cl:"agent",values:null};break;
					case "key_rs":
						if(elt.region_name!=null) json[keys[i]][j]= {classes:["key_res"],labels:[elt.name],path:[elt.region_name,elt.ag_name],path_cl:"region",values:null};
						else json[keys[i]][j]= {classes:["key_res"],labels:[elt.name],path:[elt.ag_name],path_cl:"agent",values:null};
						break;
					case "attributes": json[keys[i]][j]= {classes:["attribute","list"],labels:[elt.name],path:elt.dest_path,path_cl:classCast(elt.dest_class[1]),values:elt.values};break;
					case "flags":      json[keys[i]][j]={classes:["flag"],labels:[elt.name],path:elt.dest_path,path_cl:classCast(elt.dest_class[1]),values:elt.values};break;
					case "actions":
						if(elt['class'][2]=="mod") json[keys[i]][j]= {classes:["action",classCast(elt['class'][2]),setMod(elt.mods)],labels:[elt.name],path:[],path_cl:null,context:castCtx(elt.context)};
						else json[keys[i]][j]= {classes:["action",classCast(elt['class'][2])],labels:[elt.name],path:[],path_cl:null,context:castCtx(elt.context)};
						break;
					case "actions_binder": json[keys[i]][j]= {classes:["action","binder",elt.name],labels:[],path:[elt.act_name],path_cl:"action",values:null};break;
					case "edges": json[keys[i]][j]= {in_class:classCast(elt.in_class[1]),in_path:elt.in_path,out_class:classCast(elt.out_class[1]),out_path:elt.out_path};break;
					default: console.log("unknown key class : "+keys[i]);
				}
			}
		}
	}
	var classCast = function(cls){
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
			default:
			return cls;
		}
	}
	var genEdges = function (js_edges){
		//console.log(js_edges);
	}
	var genNode_Rec = function(js_nodes,js_class){
		//console.log(js_class);
		//console.log(js_nodes);
	}


	
	var setMod = function(val){
		if(val=="incr") return "pos";
		else return "neg";
	}
	var castCtx = function(ctx){
		var ret=[];
		for(var i=0;i<ctx.length;i++){
			var tmp_label=[ctx[i].el_path[ctx[i].el_path.length-1]];
			ctx[i].el_path.pop();
			var tmp_path=ctx[i].el_path;
			var tmp_path_cl=classCast(ctx[i].el_cl[1]);
			var tmp_values=ctx[i].el_value;
			ret.push({labels:tmp_label,path:tmp_path,path_cl:tmp_path_cl,values:tmp_values});
		}
		return ret;
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
	var genAction = function(tmp_el){
		
	};
	var genEdges = function(elm){
		
	};
	
}

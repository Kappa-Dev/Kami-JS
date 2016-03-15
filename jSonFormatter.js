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
	var sublist = function(list,start,end){//return a new list containing the value from start to end(excluded)
		var ret=[];
		if(start==null) start =0;
		if(end==null) end=list.length;
		for(var i=start;i<end && i<list.length;i++){
			ret.push(list[i]);
		}
		return ret;
	}
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
			console.log(json);
		});	
	};
	var jsToLGraph = function(){//translate json to graph
		force=false;
		if(typeof(json.version)=='undefined' || json.version==null || json.version<1.1)
			force=true; oldCast();
		//console.log(json);
		var keys = Object.keys(json);
		for(var i=0;i<keys.length;i++){
			if(typeof(json[keys[i]])!='undefined' && json[keys[i]]!=null && json[keys[i]].length>0){
				for(var j=0;j<json[keys[i]].length;j++){
					if(keys[i]=="edges") genEdges(json[keys[i]][j]);
					else genNode_Rec(json[keys[i]][j],keys[i]);
				}
			}else if(force && keys[i]!="version"){
				console.log("Unable to find"+keys[i]+" !");
				return;
			}
		}
	};
	var fndNCvtThatF_ingAction = function(act_name){
		for(var i=0;i<json.actions.length;i++){
			if(json.actions[i].labels[0]==act_name)
				return classCast(json.actions[i].classes);
			else{
				console.log("unable to find this action ! : "+act_name);
				return null;
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
					case "agents":     json[keys[i]][j]={classes:["agent"],labels:[elt.name],path:[],path_cl:[],values:null,x:elt.cx,y:elt.cy};break;
					case "regions":    json[keys[i]][j]= {classes:["region"],labels:[elt.name],path:[elt.ag_name],path_cl:["agent"],values:null};break;
					case "key_rs":
						if(elt.region_name!=null) json[keys[i]][j]= {classes:["key_res"],labels:[elt.name],path:[elt.region_name,elt.ag_name],path_cl:["region"],values:null};
						else json[keys[i]][j]= {classes:["key_res"],labels:[elt.name],path:[elt.ag_name],path_cl:["agent"],values:null};
						break;
					case "attributes": json[keys[i]][j]= {classes:["attribute","list"],labels:[elt.name],path:elt.dest_path,path_cl:classCast(elt.dest_class),values:elt.values};break;
					case "flags":      json[keys[i]][j]={classes:["flag"],labels:[elt.name],path:elt.dest_path,path_cl:classCast(elt.dest_class),values:elt.values};break;
					case "actions":
						if(elt['class'][2]=="mod") json[keys[i]][j]= {classes:["action","mod",setMod(elt.mods)],labels:[elt.name],path:[],path_cl:[],context:castCtx(elt.context)};
						else json[keys[i]][j]= {classes:classCast(elt['class']),labels:[elt.name],path:[],path_cl:null,context:castCtx(elt.context)};
						break;
					case "actions_binder": 
						json[keys[i]][j]= {classes:["action","binder",elt.name],labels:[],path:[elt.act_name],path_cl:fndNCvtThatF_ingAction(elt.act_name),values:null};break;
					case "edges": json[keys[i]][j]= {in_class:classCast(elt.in_class),in_path:elt.in_path,out_class:classCast(elt.out_class),out_path:elt.out_path};break;
					default: console.log("unknown key class : "+keys[i]);
				}
			}
		}
	}
	var findClass = function(length,pos,orig_cl,dest_cl){
		switch(orig_cl[0]){
			
			case "agents":
				console.log("an agent can't be a son");
				return null;
			case "actions":
				console.log("an action can't be a son");
				return null;
			case "regions":
				if(dest_cl[0]!="agent") console.log("a region can't be the son of a none agent node");
				return ["agent"];
			case "actions_binder":
				if(dest_cl[0]!="action")
				return dest_cl;
				
		}
	}
	var classCast = function(cls){//translate old class format to the new one
		var tmp=[];
		for(var i=0;i<cls.length;i++){
			switch(cls[i]){
				case "node":
				case "edge":
					break;
				case "key_r":
				case "key_rs":
					tmp.push("key_res");
					break;
				case "bind":
					tmp.push("bnd");
					break;
				case "mod":
					tmp.push("mod");
					break;
				case "attr":
					tmp.push("attribute");
					break;
				default:
					tmp.push(cls[i]);
			}
		}
		return tmp;
	};
	var setMod = function(val){//translate old mod to the new version
		if(val=="incr") return "pos";
		else return "neg";
	};
	var genEdges = function (js_edges){
		//console.log(js_edges);
	}
	var genNode_Rec = function(js_node,js_class){
		console.log(js_class);
		console.log(js_node);
		/*for(var i=0;i<js_node.path.length;i++){
			var tmp_node=gGraph.findByName([js_node.path[i]],findClass(js_node.path.length,i,js_node.classes,js_node.path_cl),sublist(js_node.path,0,js_node.path.length-1));
			console.log(js_node.path[i]);
			console.log(findClass(js_node.path.length-i,js_class,js_node.path_cl));
			console.log(sublist(js_node.path,0,js_node.path.length-1));
			console.log(tmp_node);
		}*/
			//gGraph.addNode()
		if(js_class!="action"){
			
		}
	}


	
	
	var castCtx = function(ctx){//translate the old context to the new one.
		var ret=[];
		for(var i=0;i<ctx.length;i++){
			var tmp_label=[ctx[i].el_path[ctx[i].el_path.length-1]];
			ctx[i].el_path.pop();
			var tmp_path=ctx[i].el_path;
			var tmp_path_cl=classCast(ctx[i].el_cl);
			var tmp_values=ctx[i].el_value;
			ret.push({labels:tmp_label,path:tmp_path,path_cl:tmp_path_cl,values:tmp_values});
		}
		return ret;
	};

	
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

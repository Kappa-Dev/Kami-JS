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
					if(keys[i]=="actions") genAction(json[keys[i]][j]);
					else genNode_Rec(json[keys[i]][j],keys[i]);
				}
			}else if(force && keys[i]!="version"){
				console.log("Unable to find"+keys[i]+" !");
				return;
			}
		}
	};
	var oldCast = function(){//cast the old version of json in the new one
		/*var keys=Object.keys(json);
		var new_json={};
		for(var i=0;i<keys.length;i++){
			if(typeof(json[keys[i]])=='undefined' || json[keys[i]]==null || json[keys[i]].length==0) continue;	
			for(var j=0;j<json[keys[i]].length;j++){
				var elt=json[keys[i]][j];
				switch(keys[i]){
					case "agents":     new_json[keys[i]].push({classes:["agent"],father_class:[],path:[],labels:[elt.name],values:[],x:elt.cx,y:elt.cy});break;
					case "regions":     new_json[keys[i]].push({classes:["region"],father_class:["agent"],path:[elt.ag_name],labels:[elt.name],values:[]});break;
					case "key_rs":
						if(elt.region_name!=null)  new_json[keys[i]].push({classes:["key_res"],father_class:["region"],path:[elt.ag_name,elt.region_name],labels:[elt.name],values:[]});
						else  new_json[keys[i]].push({classes:["key_res"],father_class:["agent"],path:[elt.ag_name],labels:[elt.name],values:[]});
						break;
					case "attributes": new_json[keys[i]].push({classes:["attribute","list"],father_class:classCast(elt.dest_class),path:elt.dest_path,labels:[elt.name],values:elt.values});break;
					case "flags":      new_json[keys[i]].push({classes:["flag"],father_class:classCast(elt.dest_class),path:elt.dest_path,labels:[elt.name],values:elt.values});break;
					case "actions": new_json[keys[i]].push(buildOldAction(json[keys[i]][j],json.actions_binder,json.edges));break;
					default: console.log("unknown key class : "+keys[i]);
				}
			}
		}
		return new_json;*/
		console.log("no backward compatibility yet");
	};
	var classCast = function(cls,mod){//translate old class format to the new one
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
					if(typeof(mod)!='undefined' && mod!=null)
						tmp.push(setMod(mod));
					else console.log("this action modification is not defined !")
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
	var toOldContext = function(el_class,el_path){
		if(el_class[1]=="binder"){
			el_class[1]="action";
			el_path=[el_path[0]];
		} 
		for(var i=0;i<json[el_class[1]].length;i++){
			if(json[el_class[1]][i].name==el_path[el_path.length-1]){
				return {classes:classCast(json[el_class[1]][i]['class'],json[el_class[1]][i].mods),father_class:tmp_fc,path:tmp_elp,labels:tmp_lbs,values:[]};
			}
		}
	}
	var buildOldAction = function(action,act_binders,edges){
		var tmp_labels=[action.name];
		var tmp_classes=classCast(action['class']);
		if(tmp_classes[1]=="mod") tmp_classes.push(setMod(action.mods));
		var tmp_left=[];
		var tmp_right=[];
		var tmp_ctx=[];
		for(var i=0;i<edges.length;i++){
			if(edges[i].in_class[1]=="binder" && edges[i].in_path[0]==action.name && edges[i].in_path[1]=="left"){
				tmp_left.push(toOldContext(edges[i].out_class,edges[i].out_path));
			}
			else if(edges[i].in_class[1]=="binder" && edges[i].in_path[0]==action.name && edges[i].in_path[1]=="right"){
				tmp_right.push(toOldContext(edges[i].out_class,edges[i].out_path));
			}
			else if(edges[i].out_class[1]=="binder" && edges[i].out_path[0]==action.name && edges[i].out_path[1]=="left"){
				tmp_left.push(toOldContext(edges[i].in_class,edges[i].in_path));
			}
			else if(edges[i].out_class[1]=="binder" && edges[i].out_path[0]==action.name && edges[i].out_path[1]=="right"){
				tmp_right.push(toOldContext(edges[i].in_class,edges[i].in_path));
			}
		}
		for(var i=0;i<action.context.length;i++){
			var tmp_ct=convertContext(action.context[i]);
			if(!existing(tmp_ct,tmp_ctx))
				tmp_ctx.push(tmp_ct);
		}
		return {classes:tmp_classes,labels:tmp_labels,left:tmp_left,right:tmp_right,context:tmp_ctx};
	};
	var fndNCvtThatF_ingAction = function(act_name){//get for an attribute or a binder the correct action !
		for(var i=0;i<json.actions.length;i++){
			if(json.actions[i].labels[0]==act_name)
				return classCast(json.actions[i].classes);
			else{
				console.log("unable to find this action ! : "+act_name);
				return null;
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

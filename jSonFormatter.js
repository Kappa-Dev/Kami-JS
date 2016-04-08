//jSonFormatter.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function jSonFormatter(gGraph){
	var name=null;
	var json=null;
	var gGraph=gGraph;
	var force=false;
	var refNode={};
	var count=0;
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
		refNode={};
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
			gGraph.wakeUp(false);
		});	
	};
	var jsToLGraph = function(){//translate json to graph
		force=false;
		if(typeof(json.version)=='undefined' || json.version==null || json.version<1.1)
			force=true;
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
	this.outputJs = function outputJs(){
		var ret=graphToJs();
		var url = 'data:text/json;charset=utf8,' + encodeURIComponent(ret);
		window.open(url, '_blank');
		window.focus();
    };
	var graphToJs = function(){
		var output="";
		var agents={};
		var regions={};
		var key_rs={};
		var attributes={};
		var flags={};
		var actions={};
		output+="{\"version\":2.0,\n \"agents\":[\n";
		var i=0;
		d3.selectAll("g").filter(".agent").each(function(d){
			output+=toText(d);
			agents[d.id]=i++;
		});
		if(i>0)
		output=output.replace(/,([^,]*)$/,'$1');//remove the last comma
		output+="],\n \"regions\":[\n";
		i=0;
		d3.selectAll("g").filter(".region").each(function(d){
			output+=toText(d);
			regions[d.id]=i++;
		});
		if(i>0)
		output=output.replace(/,([^,]*)$/,'$1');//remove the last comma
		output+="],\n \"key_rs\":[\n";
		i=0;
		d3.selectAll("g").filter(".key_res").each(function(d){
			output+=toText(d);
			key_rs[d.id]=i++;
		});
		if(i>0)
		output=output.replace(/,([^,]*)$/,'$1');//remove the last comma
		output+="],\n \"attributes\":[\n";
		i=0;
		d3.selectAll("g").filter(".attribute").each(function(d){
			output+=toText(d);
			attributes[d.id]=i++;
		});
		if(i>0)
		output=output.replace(/,([^,]*)$/,'$1');//remove the last comma
		output+="],\n \"flags\":[\n";
		i=0;
		d3.selectAll("g").filter(".flag").each(function(d){
			output+=toText(d);
			flags[d.id]=i++;
		});
		if(i>0)
		output=output.replace(/,([^,]*)$/,'$1');//remove the last comma
		output+="],\n \"actions\":[\n";
		count=0;
		d3.selectAll("g").filter(".action").each(function(d){
			if(typeof(actions[d.id])=='undefined'){
				output+=toTextAct(d,agents,regions,key_rs,attributes,flags,actions,"");
			}
		});
		if(count>0)
		output=output.replace(/,([^,]*)$/,'$1');//remove the last comma
		output+="]\n}";
		return output;
	}
	var toTextAct = function(d,a,r,k,att,f,act,out){
		var names="";
		var left="";
		var right="";
		var ctx="";
		if(d.label!=null && d.label.length>0)names=d.label.join("\",\"");
		else names=d.id;
		var b_left,b_right;
		for(var i=0;i<d.sons.length;i++){
			if(gGraph.getLG().nodes[gGraph.getLG().nodesHash[d.sons[i]]].classes[0]=="action"){
				if(gGraph.getLG().nodes[gGraph.getLG().nodesHash[d.sons[i]]].classes[2]=="left")
					b_left=gGraph.getLG().nodes[gGraph.getLG().nodesHash[d.sons[i]]];
				if(gGraph.getLG().nodes[gGraph.getLG().nodesHash[d.sons[i]]].classes[2]=="right")
					b_right=gGraph.getLG().nodes[gGraph.getLG().nodesHash[d.sons[i]]];
			}	
		}var l_left,l_right,l_ctx;
		l_left=[];
		if(typeof(b_left)!="undefined" && b_left!=null)
			d3.selectAll(".links").filter(function(d){return d.sourceID==b_left.id || d.targetID==b_left.id}).each(function(d){if(d.sourceID==b_left.id) l_left.push(d.targetID); else l_left.push(d.sourceID);});
		l_right=[];
		d3.selectAll(".links").filter(function(d){return d.sourceID==b_right.id || d.targetID==b_right.id}).each(function(d){if(d.sourceID==b_right.id) l_right.push(d.targetID); else l_right.push(d.sourceID);});
		l_ctx=[];
		for(var i=0;i<d.context.length;i++){
			if(l_left.indexOf(d.context[i])==-1 && l_right.indexOf(d.context[i])==-1)
				l_ctx.push(d.context[i]);
		}
		left+=strConvert(l_left,d,a,r,k,att,f,act,out);	
		right+=strConvert(l_right,d,a,r,k,att,f,act,out);
		ctx+=strConvert(l_ctx,d,a,r,k,att,f,act,out);
		act[d.id]=count++;
		return out+"{\"classes\":[\""+d.classes.join("\",\"")+"\"],\"labels\":[\""+names+"\"],\n\"left\":["+left+"],\n\"right\":["+right+"],\n\"context\":["+ctx+"],\n\"x\":"+d.px+",\"y\":"+d.py+"},\n";
	}
	var strConvert = function (l_left,d,a,r,k,att,f,act,out){
		var left="";
		for(var i=0;i<l_left.length;i++){
			var tmp_node=gGraph.getLG().nodes[gGraph.getLG().nodesHash[l_left[i]]];
			if(tmp_node.classes[0]=="action" && typeof(act[tmp_node.id])=="undefined"){
				var tmp=toTextact(tmp_node,a,r,k,att,f,act,out);
				out+=tmp;
			}	
			var tmp_cl;
			var tmp_pos;
			var val="";
			switch(tmp_node.classes[0]){
				case "agent":
				tmp_cl="agents";
				tmp_pos=a[tmp_node.id];
				break;
				case "region":
				tmp_cl="regions";
				tmp_pos=r[tmp_node.id];
				break;
				case "key_res":
				tmp_cl="key_rs";
				tmp_pos=k[tmp_node.id];
				break;
				case "attribute":
				tmp_cl="attributes";
				tmp_pos=att[tmp_node.id];
				break;
				case "flag":
				tmp_cl="flags";
				tmp_pos=f[tmp_node.id];
				break;
				case "action":
				tmp_cl="actions";
				tmp_pos=act[tmp_node.id];
				break;	
			}
			if(d.valued_context!=null && checkExist(d.valued_context[tmp_node.id])){
				val+=",\"values\":[\""+d.valued_context[tmp_node.id].join("\",\"")+"\"]";
			}if(d.apply_context!=null && checkExist(d.apply_context[tmp_node.id])){
				val+=",\"application\":[\""+d.apply_context[tmp_node.id].join("\",\"")+"\"]";
			}
			left+="{\"ref\":[\""+tmp_cl+"\","+tmp_pos+"]"+val+"}";
			if(i<l_left.length-1)left+=",";
		}
		return left;
	}
	var toText = function(d){
		var names="";
		var fclass="";
		var path="";
		var values="";
		if(d.label!=null && d.label.length>0)names=d.label.join("\",\"");
		else names=d.id;
		if(d.father!=null) fclass+="\""+gGraph.getLG().nodes[gGraph.getLG().nodesHash[d.father]].classes.join("\",\"")+"\"";
		var id_path=gGraph.getLG().getPath(d.id);
		for(var j=id_path.length-1;j>=0;j--){
			var fathern=gGraph.getLG().nodes[gGraph.getLG().nodesHash[id_path[j]]];
			var name="";
			if(fathern.label!=null && fathern.label.length>0)name=fathern.label[0];
			else name=fathern.id;
			path+="\""+name+"\"";
			if(j>0) path+=",";
		}
		if(d.context!=null && d.context.length>0) values+="\""+d.context.join("\",\"")+"\"";
		return "{\"classes\":[\""+d.classes.join("\",\"")+"\"],\"father_classes\":["+fclass+"],\"path\":["+path+"],\"labels\":[\""+names+"\"],\"values\":["+values+"],\"x\":"+d.px+",\"y\":"+d.py+"},\n";
	};
	var genNode_Rec = function(js_node,js_class){
		var existing_node=gGraph.findByName(js_node.labels,js_node.classes,js_node.father_classes,js_node.path);
		gGraph.addNode(js_node.classes,js_node.labels,[],js_node.x,js_node.y);
		var node_id=gGraph.lastNode();
		if (existing_node!=null){
			gGraph.mergeNode(node_id,existing_node.id);
			node_id=existing_node.id;
		}
		if(typeof(refNode[js_class])=="undefined" || refNode[js_class]==null)
			refNode[js_class]=[];
		refNode[js_class].push(node_id);
		if(js_node.values!=null && js_node.values.length>0)
			gGraph.addCtx(node_id,js_node.values,null);
		if(existing_node==null && js_node.father_classes!=null && js_node.father_classes.length>0){
			var tmp_fcls=findPathClass(js_node.path.length,js_node.path.length,js_node.classes,js_node.father_classes);
			var tmp_ffcls=findPathClass(js_node.path.length,js_node.path.length-1,js_node.classes,js_node.father_classes);
			var tmp_father=gGraph.findByName([js_node.path[js_node.path.length-1]],tmp_fcls,tmp_ffcls,sublist(js_node.path,0,js_node.path.length-2));
			if(tmp_father==null){
				console.log("unable to find the nodepath "+js_node.path[i]);
			}else{
				gGraph.addParent(node_id,tmp_father.id);
			}		
		}
	};
	var checkExist = function(tab){
		return typeof(tab)!='undefined' && tab!=null && tab.length>0;
	};
	var genAction = function(js_node){
		var js_class="actions";
		gGraph.addNode(js_node.classes,js_node.labels,[],js_node.x,js_node.y);
		var node_id=gGraph.lastNode();
		var l_bind_id;
		var r_bind_id;
		switch(js_node.classes[1]){
			case "bnd":
			case "brk":
				gGraph.addNode(["action","binder","left"],[],[node_id]);
				l_bind_id=gGraph.lastNode();
			case "syn":
			case "deg":
			case "mod":
				gGraph.addNode(["action","binder","right"],[],[node_id]);
				r_bind_id=gGraph.lastNode();
		}
		if(typeof(json.attributes)!='undefined' && json.attributes!=null && json.attributes.length>0){
			for(var i=0;i<json.attributes.length;i++){
				if(checkExist(json.attributes[i].father_classes) && json.attributes[i].father_classes.join(",")==js_node.classes.join(",") && js_node.labels.indexOf(json.attributes[i].path[0])!=-1){
					gGraph.addParent(refNode.attributes[i],node_id);
				}
			}
		}
		if(typeof(refNode[js_class])=="undefined" || refNode[js_class]==null)
			refNode[js_class]=[];
		refNode[js_class].push(node_id);
		if(checkExist(js_node.left)){
			for(var i=0;i<js_node.left.length;i++){
				if(checkExist(js_node.left[i].ref)){
					var dest_id=refNode[js_node.left[i].ref[0]][js_node.left[i].ref[1]];
					if(js_node.classes[1]=="bnd" || js_node.classes[1]=="brk")	
						gGraph.addEdge(l_bind_id,dest_id);
					var vctx=null;
					if(checkExist(js_node.left[i].values)){
						vctx={};
						vctx[dest_id]=js_node.left[i].values;
					}
					gGraph.addCtx(node_id,[dest_id],vctx);
					var actx=null;
					if(checkExist(js_node.left[i].application)){
						actx={};
						actx[dest_id]=js_node.left[i].application;
					}
					gGraph.addCtx(node_id,[dest_id],null,actx);
				}
			}
		}if(checkExist(js_node.right)){
			for(var i=0;i<js_node.right.length;i++){
				if(checkExist(js_node.right[i].ref)){
					var dest_id=refNode[js_node.right[i].ref[0]][js_node.right[i].ref[1]];
					gGraph.addEdge(r_bind_id,dest_id);
					var vctx=null;
					if(checkExist(js_node.right[i].values)){
						vctx={};
						vctx[dest_id]=js_node.right[i].values;
					}
					gGraph.addCtx(node_id,[dest_id],vctx);	
					var actx=null;
					if(checkExist(js_node.right[i].application)){
						actx={};
						actx[dest_id]=js_node.right[i].application;
					}
					gGraph.addCtx(node_id,[dest_id],null,actx);
				}
			}
			
		}if(checkExist(js_node.context)){
			for(var i=0;i<js_node.context.length;i++){
				if(checkExist(js_node.context[i].ref)){
					var dest_id=refNode[js_node.context[i].ref[0]][js_node.context[i].ref[1]];
					var vctx=null;
					if(checkExist(js_node.context[i].values)){
						vctx={};
						vctx[dest_id]=js_node.context[i].values;
					}
					gGraph.addCtx(node_id,[dest_id],vctx);	
					var actx=null;
					if(checkExist(js_node.context[i].application)){
						actx={};
						actx[dest_id]=js_node.context[i].application;
					}
					gGraph.addCtx(node_id,[dest_id],null,actx);
				}
			}
		}
		
		
		
		
	};
	var sublist = function(l,sidx,eidx){//get the sublist of l from sidx to eidx
		var ret=[];
		if(eidx>=l.length){
			console.log("unable to sublist, endpoint fixed to list length-1");
			eidx=l.length-1;
		}
		for(i=sidx;i<=eidx;i++){
			ret.push(l[i]);
		}
		return ret;
	};
	var findPathClass = function(total_p_s,path_size,endclass,pre_endclass){//find the class of a specific element of a path given the path size, the element position, the class of thelast element of the path and the class of its previous element
		if((endclass[0]=="flag" || endclass[0]=="attribute") && pre_endclass[0]=="region"){
			if(path_size==2) return pre_endclass;
			if(path_size==1) return ["agent"];
		}if((endclass[0]=="flag" || endclass[0]=="attribute") && pre_endclass[0]=="key_res" && total_p_s==3){
			if(path_size==3) return ["key_res"];
			if(path_size==2) return ["region"];
			if(path_size==1) return ["agent"];
		}if((endclass[0]=="flag" || endclass[0]=="attribute") && pre_endclass[0]=="key_res" && total_p_s==2){
			if(path_size==2) return ["key_res"];
			if(path_size==1) return ["agent"];
		}if((endclass[0]=="flag" || endclass[0]=="attribute") && pre_endclass[0]=="agent"){
			if(path_size==1) return ["agent"];
		}if((endclass[0]=="flag" || endclass[0]=="attribute") && pre_endclass[0]=="action"){
			if(path_size==1) return pre_endclass;
		}if(endclass[0]=="key_res" && pre_endclass[0]=="region"){
			if(path_size==2) return ["region"];
			if(path_size==1) return ["agent"];
		}if(endclass[0]=="key_res" && pre_endclass[0]=="agent"){
			if(path_size==1) return ["agent"];
		}if(endclass[0]=="region" && pre_endclass[0]=="agent"){
			if(path_size==1) return ["agent"];
		}if(endclass[0]=="agent" || endclass[0]=="action" || path_size==0) return null;
		console.log("unable to find a class");		
		return null;	
	};
}

//GraphicGraph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
//graphical graph version
function GraphicGraph(containerid){//define a graphical graph with svg objects
	var rewriter;//the current modification stack
	var containerID=containerid;
	var layerG;//the current layered graph data structure
	var width;
	var	height;//menu is 30px heigth
	var svg; 
	var drag;
	var dynG;//the force layout graph for this graphical graph
	var s_node,s_action,s_link,s_binder;//graphical object for node,action,link and binders
	var node_count=0;
	var first_init;
	var nugget_add,edition,kr_show,lcg_view,kappa_view;//edition mod
	var ctx_mode=false;
	var self=this;
	var nuggets=[];
	var lcgG,nuggG,lcgDynG,lcgDrag;//layered graph for lcg and nuggets
	var lcgS,nuggS,nuggDynG,nuggDrag;//stack for lcg and nuggets
	var modified=true;
	this.findByName = function findByName(label,cls,path){//find a node by its name+path+class
		var cl_ok=false,lb_ok=false,p_ok=true;
		for(var i=0;i<layerG.nodes.length;i++){
			var tmp_node=layerG.nodes[i];
			cl_ok=(tmp_node.classes.length==cls.length);
			for(var j=0;j<cls.length;j++)
				cl_ok=cl_ok && (tmp_node.classes[j]==cls[j]);
			if(cl_ok) {
				for(var j=0;j<label.length;j++)
					lb_ok=lb_ok || (tmp_node.label.indexOf(label[j])!=-1);
			}
			if(cl_ok && lb_ok){
				for(var j=path.length-1;j>=0;j--){
					if(tmp_node.father!=null){
						tmp_node=layerG.nodes[layerG.nodesHash[tmp_node.father]];
						p_ok=tmp_node.label.indexOf(path[j])!=-1 && p_ok;
					}
					else if(j!=0) p_ok = false;
				}
			}
			if(cl_ok && lb_ok && p_ok) return layerG.nodes[i];
			else{
				cl_ok=false;
				lb_ok=false;
				p_ok=true;
			}
		}return null;
	}
	this.lastNode = function lastNode(){//return the last node ID
		return "n"+(node_count-1);
	}
	this.getLG = function getLG(){//return a pointer to the current layered graph
		return layerG;
	}
	this.wakeUp = function wakeUp(){//speed up tick function
		dynG.getForce().start();
			d3.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=false;});
		for(var i=0;i<300;i++){
			dynG.getForce().tick();
		}
		if(first_init)
				d3.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=true;});
		first_init=true;
	};
	this.log = function log(){//output layerGraph data
		layerG.log();
	};
	this.init = function init(){//init the graphic graph
		//defining graph representation size
		width=document.getElementById(containerID).getBoundingClientRect().width;
		height =document.getElementById(containerID).getBoundingClientRect().height-30;//menu is 30px heigth	
		//LCG View
		lcgG=new LayeredGraph();//layered graph for lcg
		lcgS=[];//stack for LCG transformation
		lcgDynG=new DynamicGraph(lcgG,height,width);
		lcgDynG.init();
		lcgDynG.getForce().on("tick",tick);
		lcgDrag=lcgDynG.getForce().drag().on("dragstart", dragstart);
		//KR View
		nuggG=new LayeredGraph();//layered grap for nuggets
		nuggS=[];//stack for nugget transformation
		nuggDynG=new DynamicGraph(nuggG,height,width);
		nuggDynG.init();
		nuggDynG.getForce().on("tick",tick).start();
		nuggDrag=nuggDynG.getForce().drag().on("dragstart", dragstart);
		//initialize
		first_init=false;
		this.setState("kr_view");
		svg=d3.select("#"+containerID).append("svg:svg")
			.attr("width",width)
			.attr("height",height)
			.on("contextmenu",d3.contextMenu(function(){return svgMenu();}));
		d3.select("#"+containerID).append("div")
			.classed("n_tooltip",true)
			.style("visibility","hidden");
		d3.select("#"+containerID).append("div")
			.classed("s_tooltip",true)
			.style("visibility","hidden");
		//dynG.getForce().start();
	};
	var update = function(){//update all the SVG elements
		//links svg representation
		dynG.init();
		svg.append("svg:defs").selectAll("marker")
		.data(["pos_end","neg_end"])      // Different link/path types can be defined here
		.enter().append("svg:marker")    // This section adds in the arrows
		.attr("id", function(d){return d;})
		.attr("refX", 40)
		.attr("refY", 7)
		.attr("markerWidth", 13)
		.attr("markerHeight", 13)
		.attr("orient", "auto")
		.attr("markerUnits","strokeWidth")
		.append("svg:path")
		.attr("d", "M2,2 L2,13 L8,7 L2,2");
		s_link = svg.selectAll(".link")
			.data(layerG.links, function(d) { return d.source.id + "-" + d.target.id; });
        s_link.enter().insert("line","g")
			.classed("link",true)
            .classed("links",function(d){return d.e_class=="link"})
			.classed("parent",function(d){return d.e_class=="parent"})
			.classed("influence",function(d){return d.e_class=="positive" || d.e_class=="negative"})
			.classed("positive",function(d){return d.e_class=="positive"})
			.classed("negative",function(d){return d.e_class=="negative"});
		d3.selectAll(".links").on("contextmenu",d3.contextMenu(function(){return edgeCtMenu();}));
		d3.selectAll(".positive").attr("marker-end", "url(#pos_end)");
		d3.selectAll(".negative").attr("marker-end", "url(#neg_end)");
        s_link.exit().remove();
		//none action nodes svg representation
		s_node = svg.selectAll("g.node")
			  .data(function(){return layerG.nodes.filter(function(d){return d.classes[0]!="action"})}, function(d) { return d.id;});
		var nodeEnter = s_node.enter().insert("g")
            .classed("node",true)
			.classed("agent",function(d){return d.classes[0]=="agent"})
			.classed("key_res",function(d){return d.classes[0]=="key_res"})
			.classed("attribute",function(d){return d.classes[0]=="attribute"})
			.classed("flag",function(d){return d.classes[0]=="flag"})
			.classed("region",function(d){return d.classes[0]=="region"})
            .call(drag)
			.on("mouseover",mouseOver)
			.on("mouseout",mouseOut)
			.on("click",clickHandler)
			.on("contextmenu",d3.contextMenu(function(){return nodeCtMenu();}));
		nodeEnter.insert("circle")
			.attr("r", function(d){return d.toInt()});
		nodeEnter.insert("text")
			.classed("nodeLabel",true)
			.attr("x", 0)
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id})
			.attr("font-size", function(d){if(d.classes[0]!="action")return (d.toInt()/2)+"px"; else (d.toInt()/3)+"px";})
			.on("dblclick",clickText);
		s_node.exit().remove();
		//action nodes svg representation
		s_action = svg.selectAll("g.action")
			  .data(function(){return layerG.nodes.filter(function(d){return d.classes[0]=="action" && d.classes[1]!="binder"})}, function(d) { return d.id;});
		var actionEnter = s_action.enter().insert("g")
			.classed("action",true)
			.classed("mod",function(d){return d.classes[1]=="mod"})
			.classed("bnd",function(d){return d.classes[1]=="bnd"})
			.classed("brk",function(d){return d.classes[1]=="brk"})
			.classed("syn",function(d){return d.classes[1]=="syn"})
			.classed("deg",function(d){return d.classes[1]=="deg"})
            .call(drag)
			.on("mouseover",mouseOver)
			.on("mouseout",mouseOut)
			.on("click",clickHandler)
			.on("contextmenu",d3.contextMenu(function(){return actCtMenu();}));
		actionEnter.insert("rect")
			.attr("width", function(d){return d.toInt()})
			.attr("height", function(d){return d.toInt()/2});
		actionEnter.insert("text")
			.classed("nodeLabel",true)
			.attr("x", function(d){return d.toInt()/2;})
			.attr("dy", function(d){return d.toInt()/4;})
			.attr("text-anchor", "middle")
			.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id})
			.attr("font-size", function(d){if(d.classes[0]!="action")return (d.toInt()/2)+"px"; else (d.toInt()/3)+"px";})
			.on("dblclick",clickText);
		s_action.exit().remove();
		s_binder = svg.selectAll("circle.binder")
			.data(function(){return layerG.nodes.filter(function(d){return d.classes[0]=="action" && d.classes[1]=="binder"})}, function(d) { return d.id;});
		var binderEnter = s_binder.enter().insert("circle")
			.classed("binder",true)
			.attr("r", function(d){return d.toInt()})
			.on("contextmenu",d3.contextMenu(function(){return binderCtMenu();}));
		s_binder.exit().remove();
		dynG.getForce().start();	
		//layerG.log();
	};
	var tick = function(){//show up new svg element only if there position datas have been computed
		if(first_init || dynG.getForce().alpha()<=0.00501){
			s_link.attr("x1", function(d){return getNodeX(d.source);})
				.attr("y1", function(d){return getNodeY(d.source);})
				.attr("x2", function(d){return getNodeX(d.target);})
				.attr("y2", function(d){return getNodeY(d.target);});
			s_node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			s_action.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			s_binder.attr("cx",function(d) {return getNodeX(d);})
				.attr("cy",function(d) {return getNodeY(d);});
			first_init=true;
		}
	};
	var getNodeX = function(node){//return the x position on a specific node
		if(node.classes[0]=="action" && node.classes[1]=="binder"){
			if(node.classes[2]=="left" && node.father!=null)
				return layerG.nodes[layerG.nodesHash[node.father]].x;
			else if(node.classes[2]=="right" && node.father!=null)
				return layerG.nodes[layerG.nodesHash[node.father]].x+layerG.nodes[layerG.nodesHash[node.father]].toInt();
		}else if(node.classes[0]=="action"){
			return node.x+node.toInt()/2
		}else{ 
			return node.x;
		}
	};
	var getNodeY = function(node){//return the y position on a specific node
		if(node.classes[0]=="action" && node.classes[1]=="binder" && node.father!=null)
			return layerG.nodes[layerG.nodesHash[node.father]].y+layerG.nodes[layerG.nodesHash[node.father]].toInt()/4;
		else if(node.classes[0]=="action")
			return node.y+node.toInt()/4
		else
			return node.y;
	};
	this.getSvg = function getSvg(){//return the svg
		return svg;
	};
	this.addNode = function addNode(classes,label,path,x,y){//add a new node in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.addNode(classes,"n"+node_count,x,y,(typeof(x)!='undefined' && typeof(y)!='undefined'));
		stack(layerG,layerG.removeNode,["n"+node_count]);
		layerG.addLabel("n"+node_count,label);
		stack(layerG,layerG.rmLabel,["n"+node_count,label]);
		for(var i=path.length-1;i>0;i--){
			if(typeof(layerG.nodesHash[path[i]])=='undefined'){
				console.log("undefined path : "+path[i]+"for n"+node_count);
				return;
			}if(layerG.nodes[layerG.nodesHash[path[i]]].father==null || layerG.nodes[layerG.nodesHash[path[i]]].father!=path[i-1]){
				console.log("incorrect path !");
				console.log(path);
				return;
			}				
		}if(path.length>0){
			layerG.setFather("n"+node_count,path[path.length-1]);
			stack(layerG,layerG.removeParenting,["n"+node_count]);
		}
		node_count++;
		update();
		//dynG.getForce().on("tick",tick);
		//dynG.getForce().start();	
	};
	this.mergeNode = function mergeNode(new_nodeID,old_nodeID){//mergeDIFF both 
		dynG.getForce().stop();
		if(layerG.nodes[layerG.nodesHash[new_nodeID]].classes.join('_') == layerG.nodes[layerG.nodesHash[old_nodeID]].classes.join('_') /*&& layerG.getPath(new_nodeID).join('_') == layerG.getPath(old_nodeID).join('_')*/){
			/* if action : call merge on both binders and then on action!*/
			if(layerG.nodes[layerG.nodesHash[new_nodeID]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[new_nodeID]].classes[1]!="binder"){
				for(var i=0;i<layerG.nodes[layerG.nodesHash[new_nodeID]].sons.length;i++){
					var tmp_nd=layerG.nodes[layerG.nodesHash[layerG.nodes[layerG.nodesHash[new_nodeID]].sons[i]]];
					if(tmp_nd.classes[0]=="action" && tmp_nd.classes[1]=="binder"){
						for(var j=0;j<layerG.nodes[layerG.nodesHash[old_nodeID]].sons.length;j++){
							var tmp_nd2=layerG.nodes[layerG.nodesHash[layerG.nodes[layerG.nodesHash[old_nodeID]].sons[j]]];
							if(tmp_nd2.classes[0]=="action" && tmp_nd2.classes[1]=="binder" && tmp_nd2.classes[2]==tmp_nd.classes[2]){
								i--;//carefull !!!! the node is removed from the sons of the "new_node" ! i need to be decremented !
								this.mergeNode(tmp_nd.id,tmp_nd2.id);
							}
						}
					}
				}
			}	
			/*stacking modifications */
			for(var i=0;i<layerG.links.length;i++){
				if(layerG.links[i].sourceID==new_nodeID || layerG.links[i].sourceID==old_nodeID || layerG.links[i].targetID==new_nodeID || layerG.links[i].targetID==old_nodeID)
					stack(layerG,layerG.addEdge,[layerG.links[i].sourceID,layerG.links[i].targetID]);//add all the links
			}for(var i=0;i<layerG.nodes[layerG.nodesHash[new_nodeID]].sons.length;i++)
				stack(layerG,layerG.setFather,[layerG.nodes[layerG.nodesHash[new_nodeID]].sons[i],new_nodeID]);//add all the sons
			for(var i=0;i<layerG.nodes[layerG.nodesHash[old_nodeID]].sons.length;i++)
				stack(layerG,layerG.setFather,[layerG.nodes[layerG.nodesHash[old_nodeID]].sons[i],old_nodeID]);
			stack(layerG,layerG.setFather,[new_nodeID,layerG.nodes[layerG.nodesHash[new_nodeID]].father]);//put fathers
			stack(layerG,layerG.setFather,[old_nodeID,layerG.nodes[layerG.nodesHash[old_nodeID]].father]);
			stack(layerG,layerG.addLabel,[old_nodeID,layerG.nodes[layerG.nodesHash[old_nodeID]].label.concat()]);//put label and context
			stack(layerG,layerG.addCtx,[old_nodeID,layerG.nodes[layerG.nodesHash[old_nodeID]].context.concat(),layerG.dumpVCtx(layerG.nodes[layerG.nodesHash[old_nodeID]].valued_context)]);
			stack(layerG,layerG.addLabel,[new_nodeID,layerG.nodes[layerG.nodesHash[new_nodeID]].label.concat()]);
			stack(layerG,layerG.addCtx,[new_nodeID,layerG.nodes[layerG.nodesHash[new_nodeID]].context.concat(),layerG.dumpVCtx(layerG.nodes[layerG.nodesHash[new_nodeID]].valued_context)]);
			stack(layerG,layerG.addNode,[layerG.nodes[layerG.nodesHash[new_nodeID]].classes,new_nodeID]);//add the old and new nodes
			stack(layerG,layerG.addNode,[layerG.nodes[layerG.nodesHash[old_nodeID]].classes,old_nodeID]);
			stack(layerG,layerG.removeNode,[old_nodeID]);//remove the merged node
			/* end stack -> modification */
			layerG.mergeDiff(new_nodeID,old_nodeID);		
		}
		else{
			console.log("unable to merge : too different nodes : ");
			console.log(layerG.nodes[layerG.nodesHash[new_nodeID]]);
			console.log(layerG.nodes[layerG.nodesHash[old_nodeID]]);
		}
		update();	
	};
	this.removeNode = function removeNode(nID){//remove a node from the svg AND the graph structure
		dynG.getForce().stop();
		for(var i=0;i<layerG.links.length;i++){
			if(layerG.links[i].sourceID==nID || layerG.links[i].targetID==nID)
				stack(layerG,layerG.addEdge,[layerG.links[i].sourceID,layerG.links[i].targetID]);//add all the links
		}for(var i=0;i<layerG.nodes[layerG.nodesHash[nID]].sons.length;i++)
			stack(layerG,layerG.setFather,[layerG.nodes[layerG.nodesHash[nID]].sons[i],nID]);//add all the sons
		if(layerG.nodes[layerG.nodesHash[nID]].father!=null)
			stack(layerG,layerG.setFather,[nID,layerG.nodes[layerG.nodesHash[nID]].father]);
		stack(layerG,layerG.addLabel,[nID,layerG.nodes[layerG.nodesHash[nID]].label.concat()]);
		stack(layerG,layerG.addCtx,[nID,layerG.nodes[layerG.nodesHash[nID]].context.concat(),layerG.dumpVCtx(layerG.nodes[layerG.nodesHash[nID]].valued_context)]);
		stack(layerG,layerG.addNode,[layerG.nodes[layerG.nodesHash[nID]].classes.concat(),nID]);
		layerG.removeNode(nID);
		update();			
	};
	this.removeNodeR = function removeNodeR(nID){
		for(var i=0;i<layerG.nodes[layerG.nodesHash[nID]].sons.length;i){
			this.removeNodeR(layerG.nodes[layerG.nodesHash[nID]].sons[i]);
		}this.removeNode(nID);
	}
	this.addEdge = function addEdge(id1,id2){//add a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		var tmp_l=layerG.links.length;
		layerG.addEdge(id1,id2);
		if(layerG.links.length>tmp_l)
			stack(layerG,layerG.removeEdge,[id1,id2]);
		update();	
	};
	this.addInfluence = function addInfluence(id1,id2,type){//add an INFLUENCE edge (positive or negative) between two node of a graph
		dynG.getForce().stop();
		var tmp_l=layerG.links.length;
		layerG.addInfluence(id1,id2,type);
		if(layerG.links.length>tmp_l)
			stack(layerG,layerG.removeInfluence,[id1,id2,type]);
		update();	
	}
	this.removeEdge = function removeEdge(id1,id2){//remove a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		stack(layerG,layerG.addEdge,[id1,id2]);
		layerG.removeEdge(id1,id2);
		update();		
	};
	this.removeInfluence = function removeInfluence(id1,id2,type){//remove an INFLUENCE edge (positive or negative) between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		stack(layerG,layerG.addInfluence,[id1,id2,type]);
		layerG.removeInfluence(id1,id2,type);
		update();		
	};
	
	this.addParent = function addParent(son,fath){//add a PARENT edge between two node in the graph structure and un the svg and update graph structure
		dynG.getForce().stop();
		if(layerG.nodes[layerG.nodesHash[son]].father != fath){
			stack(layerG,layerG.removeParenting,[son]);
			layerG.setFather(son,fath);
			update();
		}
	};
	this.rmParent = function rmParent(son){//idem for removing parenting
		dynG.getForce().stop();
		stack(layerG,layerG.setFather,[son,layerG.nodes[son].father]);
		layerG.removeParenting(son);
		update();	
	};
	this.addCtx = function addCtx(id,ctx,vctx){//add a context to a specific node
		dynG.getForce().stop();
		var tmp_l=layerG.nodes[layerG.nodesHash[id]].context.length;
		layerG.addCtx(id,ctx,vctx);
		if(layerG.nodes[layerG.nodesHash[id]].context.length > tmp_l)
				stack(layerG,layerG.rmCtx,[id,ctx]);
		update();	
	};
	this.rmCtx = function rmCtx(id,ctx){//remove a context from a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.addCtx,[id,layerG.nodes[layerG.nodesHash[id]].context.concat(),layerG.copyVCtx(layerG.nodes[layerG.nodesHash[id]].valued_context)]);
		layerG.rmCtx(id,ctx);
		update();	
	};
	this.getCtx = function getCtx(id){//get a specific node context
		return layerG.nodes[layerG.nodeHash[id]].context.concat();
	};
	this.getCtxV = function getCtxV(id){//get a specific node context values
		return layerG.dumpVCtx(layerG.nodes[layerG.nodesHash[id]].valued_context);
	}
	this.addLabel = function addLabel(id,lbl){//add a label to a specific node
		dynG.getForce().stop();
		var tmp_l=layerG.nodes[layerG.nodesHash[id]].label.length;
		layerG.addLabel(id,lbl);
		if(layerG.nodes[layerG.nodesHash[id]].label.length>tmp_l)
			stack(layerG,layerG.rmLabel,[id,lbl]);
		update();
	};
	this.rmLabel = function rmLabel(id,lbl){//remove a label from a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.addLabel,[id,layerG.nodes[layerG.nodesHash[id]].label.concat()]);
		layerG.rmLabel(id,lbl);
		update();	
	};
	this.getLabel = function getLabel(id){//get a specific node label
		return layerG.nodes[layerG.nodeHash[id]].label.concat();
	};
	var dragstart = function(d) {//allow only to move agents and actions.
		if(d3.select(this).classed("agent") || d3.select(this).classed("action"))
			d3.select(this).classed("fixed", d.fixed = true);
	};
	this.getCoord = function getCoord(){//return all the node coordinates 
		layerG.log();
		var ret=[];
		for(var i=0;i<layerG.nodes.length;i++){
			ret.push({x:layerG.nodes[i].x,y:layerG.nodes[i].y});
		}
		return ret;	
	};
	var stack = function(obj,fun,param){//add an element to the undo stack
		rewriter.push({f:fun,o:obj,p:param});
		d3.select("#undo").property("disabled",false)
							.style("display","initial");
	}
	this.unStack = function unStack(){//remove element from the undo stack and apply it !
		if(rewriter.length==0){
			console.log("stack empty");
			d3.select("#undo").property("disabled",true)
							 .style("display","none");
			return;
		}
		fun=rewriter.pop();
		//console.log(fun);
		fun.f.apply(fun.o,fun.p);
		if(fun.f == layerG.addLabel){
			console.log("add label stacked");
			console.log(d3.select(fun.p[0]));
			console.log(d3.select(fun.p[0]).select("text"));
			d3.select(fun.p[0]).select("text").text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id});
		}
		update();
	};
	this.unStackAll = function unStackAll(){//undo all the stack
		while(rewriter.length>0)
			this.unStack();
		d3.select("#undo").property("disabled",true)
							 .style("display","none");
	}
	this.clearStack = function clearStack(){//clear the undo stack
		rewriter=[];
		d3.select("#undo").property("disabled",true)
							 .style("display","none");
	};
	this.save = function save(){//save the current graph (clear the undo stack and set it to modified)
		this.clearStack();
		modified=true;
	}
	this.setState = function setState(state){//set the graphical interface state : "nugget_view", "kr_view", "kr_edit", "lcg_view", "kappa_view"
		switch(state){
			case "nugget_view":
				d3.select("#menu_f").selectAll("input").property("disabled",true)
					.style("display","none");
				d3.select("#kr").property("disabled",false)
					.style("display","initial");
				d3.select("#update").property("disabled",false)
					.style("display","initial");
				d3.select("#replay").property("disabled",false)
					.style("display","initial");
				if(!nugget_add){
					this.clearStack();
					d3.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				}
				nugget_add=true;
				edition=false;
				kr_show=false;
				lcg_view=false;
				kappa_view=false;
				break;
			case "kr_view":
				//console.log(modified);
				if(!first_init){
					rewriter=nuggS;
					layerG=nuggG;
					dynG=nuggDynG;
					drag=nuggDrag;
				}
				if(!lcg_view && rewriter.length>0 && !confirm('Are you sure you want to quit without saving your nuggets ?'))//if in nugget view, check if changes have been saved
					return;
				else if(rewriter.length >0 && (nugget_add || edition)){
					this.unStackAll();
					modified=false;
				}
				nugget_add=false;
				edition=false;
				kr_show=true;
				lcg_view=false;
				kappa_view=false;
				d3.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				d3.select("#menu_f").selectAll("input").property("disabled",true)
					.style("display","none");
				d3.select("#import_f").property("disabled",false)
					.style("display","initial");									   
				d3.select("#import").property("disabled",false)
					.style("display","initial");
				d3.select("#export").property("disabled",false)
					.style("display","initial");
				d3.select("#lcg").property("disabled",false)
					.style("display","initial");
				d3.select("#nugget").property("disabled",false)
					.style("display","initial");
				d3.select("#edit").property("disabled",false)
					.style("display","initial");
				d3.select("#replay").property("disabled",false)
					.style("display","initial");
				this.clearStack();
				if(layerG===lcgG){
					layerG=nuggG;
					rewriter=nuggS;
					dynG.getForce().stop();
					dynG=nuggDynG;
					drag=nuggDrag;
					svg.selectAll("*").remove();
					update();
					//console.log("here'");
					modified=false;
				}
				break;
			case "kr_edit":
				d3.select("#menu_f").selectAll("input").property("disabled",true)
					.style("display","none");
				d3.select("#kr").property("disabled",false)
					.style("display","initial");
				d3.select("#update").property("disabled",false)
					.style("display","initial");
				d3.select("#replay").property("disabled",false)
					.style("display","initial");
				if(!edition){
					this.clearStack();
					d3.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				}
				nugget_add=false;
				edition=true;
				kr_show=false;
				lcg_view=false;
				kappa_view=false;
				break;
			case "lcg_view":
				d3.select("#menu_f").selectAll("input").property("disabled",true)
				   .style("display","none");
				d3.select("#kr").property("disabled",false)
					.style("display","initial");
				d3.select("#kappa").property("disabled",false)
				   .style("display","initial");
				d3.select("#update").property("disabled",false)
					.style("display","initial");
				d3.select("#replay").property("disabled",false)
					.style("display","initial");
				nugget_add=false;
				edition=false;
				kr_show=false;
				lcg_view=true;
				kappa_view=false;
				//this.clearStack();
				if(layerG===nuggG){
					layerG=lcgG;
					rewriter=lcgS;
					dynG.getForce().stop();
					dynG=lcgDynG;
					drag=lcgDrag;
					svg.selectAll("*").remove();
					update();
					if(modified || confirm("Generate a new LCG ?"))self.addNode(["agent"],["ag1","othername","thirdname"],[]);
					d3.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				}
				break;
			case "kappa_view"://nobody care : open jasim !
				d3.select("#menu_f").selectAll("input").property("disabled",true)
					.style("display","none");
				d3.select("#kr").property("disabled",false)
					.style("display","initial");
				d3.select("#lcg").property("disabled",false)
					.style("display","initial");
				nugget_add=false;
				edition=false;
				kr_show=false;
				lcg_view=false;
				kappa_view=true;
				break;
		}
	};
	this.getState = function getState(state){//get the graphical interface state
		if(nugget_add) return "nugget_view";
		if(kr_show) return "kr_view";
		if(edition) return "kr_edit";
		if(lcg_view) return "lcg_view";
		if(kappa_view) return "kappa_view";
	};
	var mouseOver = function(d){//handling mouse over nodes/actions
		if(d3.select(this).classed("node")){
			var div_ct="<p><h3><b><center>id: "+d.id+"</center></b>";
			if(d.label.length>0)
				div_ct+="\n labels: <ul style='padding: 3px 15px;margin:1px;'><li>"+d.label.join("<li>")+"</ul>";
			if(d.context.length>0)
				div_ct+="values: <ul style='padding: 7px;margin:1px;'><li>"+d.context.join("<li>")+"</ul>";
			div_ct+="</p>";
			d3.select(".n_tooltip").style("visibility","visible")
								.html(div_ct);
		}else if(d3.select(this).classed("action") && !d3.select(this).classed("binder")){
			var ctx_lst=[];
			for(var i=0;i<d.context.length;i++){
				var ctx_el=d3.selectAll("g").filter(function(e){return e.id==d.context[i];});
				ctx_el.classed("selected_overlay",layerG.nodes[layerG.nodesHash[d.context[i]]].selected_over=true);
				if(d3.event.shiftKey && d.valued_context!=null && (ctx_el.classed("attribute") || ctx_el.classed("flag") )){
					var tmp_node=ctx_el.datum();
					var tmp_id;
					if(tmp_node.label.length>0) tmp_id=tmp_node.label[0]; 
					else tmp_id=tmp_node.id;
					ctx_lst.push({id:tmp_id,x:tmp_node.x,values:d.valued_context[tmp_node.id]});
					ctx_lst.sort(function(a,b){return a.x-b.x});
				}	
			}
			var div_ct="<p><h3><b><center>id: "+d.classes.join("/")+"</center></b>";
			if(ctx_lst.length>0){
				div_ct+="detailled values : <ul style='padding: 7px;margin:1px;'>";
				for(var i=0;i<ctx_lst.length;i++)
					div_ct+="<li>"+ctx_lst[i].id+" : "+ctx_lst[i].values.join(",");
				div_ct+="</ul></p>"
				d3.select(".n_tooltip").style("visibility","visible")
								.html(div_ct);
			}	
		}
		//console.log(d);
		var divs_ct="<h5><b><center>class: "+d.classes.join("/")+"</center></b></h5>";
		d3.select(".s_tooltip").style("visibility","visible")
								.html(divs_ct);
	};
	var mouseOut = function(d){//handling mouse out of nodes/actions
		if(d3.select(this).classed("node")){
			d3.select(".n_tooltip").style("visibility","hidden")
								.text("");
		}else if(d3.select(this).classed("action") && !d3.select(this).classed("binder")){
			d3.select(".n_tooltip").style("visibility","hidden")
								.text("");
			for(var i=0;i<d.context.length;i++)
				d3.selectAll("g").filter(function(e){return e.id==d.context[i];}).classed("selected_overlay",layerG.nodes[layerG.nodesHash[d.context[i]]].selected_over=false);	
			
		}
		d3.select(".s_tooltip").style("visibility","hidden")
								.text("");
	};
	var edgeCtMenu = function(){
		var menu;
		if(ctx_mode){
			window.alert("Please fill all values for the action context");
			return [];
		}
		menu=[{
			title: "Select Source-target",
			action: function(elm,d,i){
				d3.selectAll("g").filter(function(e){return (e.id==d.sourceID || e.id==d.targetID || (d.source.classes[0]=="action" && d.source.father!=null && d.source.father==e.id) || (d.target.classes[0]=="action" && d.target.father!=null && d.target.father==e.id));})
					.classed("selected",function(d){ return layerG.nodes[layerG.nodesHash[d.id]].selected=true;});
			}
		}];
		if(edition || nugget_add){
			menu.push({
				title: "remove",
				action: function(elm,d,i){
					if(d.e_class=="link" && confirm('Are you sure you want to delete this Edge ? The linked element wont be removed from the context'))
						self.removeEdge(d.sourceID,d.targetID);
					if((d.e_class=="positive" || d.e_class=="negative") && confirm('Are you sure you want to delete this Influence ?'))
						self.removeInfluence(d.sourceID,d.targetID,d.e_class);
				}
			});
		}
		return menu;
	}
	var nodeCtMenu = function(){
		if(ctx_mode){
			window.alert("Please fill all values for the action context");
			return [];
		}
		var evt_trg=d3.select(d3.event.target.parentNode);
		var menu;
		menu=[{
			title: "Unlock",
			action: function(elm,d,i){
				d3.select(elm).classed("fixed",function(d){return d.fixed=false;});
				update();
			}
		}];
		if(edition || nugget_add){
			if(!evt_trg.classed("attribute") && !evt_trg.classed("flag")){
				menu.push({
					title: "Add Attribute",
					child:[
					{
						title:"list",
						action: function(elm,d,i){
							var lbl=window.prompt("define attribute labels","");
							var values=window.prompt("define attribute values","true,false");
							if(lbl=="")self.addNode(["attribute","list"],[],[d.id]);
							else self.addNode(["attribute","list"],lbl.split(","),[d.id]);
							if(values=="")self.addCtx(layerG.nodes[layerG.nodes.length-1].id,["t","f"]);
							else self.addCtx(layerG.nodes[layerG.nodes.length-1].id,values.split(","));
						}
					},{
						title:"interval",
						action: function(elm,d,i){
							var lbl=window.prompt("define attribute labels","");
							var values=window.prompt("define attribute values","0,INF");
							if(values.split(",").length>2){
								console.log("This attribute is not an interval !");
								return;
							}
							if(lbl=="")self.addNode(["attribute","interval"],[],[d.id]);
							else self.addNode(["attribute","interval"],lbl.split(","),[d.id]);
							if(values=="")	self.addCtx(layerG.nodes[layerG.nodes.length-1].id,["0","INF"]);
							else self.addCtx(layerG.nodes[layerG.nodes.length-1].id,values.split(","));
						}
					}]
				},{
					title: "Add Flag",
					action: function(elm,d,i){
						var lbl=window.prompt("define flag labels","");
						var values=window.prompt("define flag values","true,false");
						if(lbl=="")self.addNode(["flag"],[],[d.id]);
						else self.addNode(["flag"],lbl.split(","),[d.id]);
						if(values=="")self.addCtx(layerG.nodes[layerG.nodes.length-1].id,["t","f"]);
						else self.addCtx(layerG.nodes[layerG.nodes.length-1].id,values.split(","));
					}
				});
			}if(evt_trg.classed("agent") || evt_trg.classed("region")){
				menu.push({
					title: "Add Key Residue",
					action: function(elm,d,i){
						var lbl=window.prompt("define key residue labels","");
						if(lbl=="")self.addNode(["key_res"],[],[d.id]);
						else self.addNode(["key_res"],lbl.split(","),[d.id]);
					}
				});
			}if(evt_trg.classed("agent")){
				menu.push({
					title: "Add Region",
					action: function(elm,d,i){
						var lbl=window.prompt("define region labels","");
						if(lbl=="")self.addNode(["region"],[],[d.id]);
						else self.addNode(["region"],lbl.split(","),[d.id]);
					}
				});
			}if(evt_trg.classed("attribute") || evt_trg.classed("flag")){
				menu.push({
					title: "Edit Values",
					action: function(elm,d,i){
						var lbl=window.prompt("define Attributes",d.context.join(","));
						self.rmCtx(d.id,[]);
						if(lbl!="") self.addCtx(d.id,lbl.split(","));
					}
				});
			}			
			menu.push({
				title: "Remove",
				action: function(elm,d,i){
					if(confirm('Are you sure you want to delete this Node ? All its sons will be removed'))
						self.removeNodeR(d.id);
				}
			});
		}if(edition){
			var tmp_select = d3.selectAll("g.selected").filter(function(d){
														for(var i=0;i<d.classes.length;i++){
															if(!evt_trg.classed(d.classes[i]))
																return false;
														}return true;
													});
			if(!tmp_select.empty()){
				menu.push(
				{
					title: "Merge with selected nodes",
					action:function(elm,d,i){
						var tmp_select = d3.selectAll("g.selected").filter(function(d){
														for(var i=0;i<d.classes.length;i++){
															if(!evt_trg.classed(d.classes[i]))
																return false;
														}return true;
													});
						tmp_select.each(function(d2){self.mergeNode(d.id,d2.id);});
					}
				});
			}
			/*if(d3.selectAll("g.selected").size()==1){
				menu.push(
				{
					title: "Add influence from Selected",
					child:[
					{
						title:"Positive",
						action: function(elm,d,i){
							var select=d3.select("g.selected").each(function(d2){self.addInfluence(d2.id,d.id,"positive");});
						}
					},{
						title:"Negative",
						action: function(elm,d,i){
							var select=d3.select("g.selected").each(function(d2){self.addInfluence(d2.id,d.id,"negative");});
						}
					}]
				});
			}*/
		}
		return menu;
	}
	var binderCtMenu = function(){//handling right click on action binders
		var menu;
		if(ctx_mode){
			window.alert("Please fill all values for the action context");
			return [];
		}
		if((edition || nugget_add) && !d3.selectAll("g.selected").empty()){
			menu=[
			{
				title: "link to all selected",
				action: function(elm,d,i){
					d3.event.stopPropagation();
					var selected=d3.selectAll("g.selected");
					selected.each(function(d2){self.addEdge(d.id,d2.id); self.addCtx(d.father,[d2.id])});
					selected.classed("selected",function(d){return d.selected=false;});
				}
				
			}];
		}else menu=[];
		return menu;
	}
	var actCtMenu = function(){//handling right click on actions
		var menu;
		if(ctx_mode){
			window.alert("Please fill all values for the action context");
			return [];
		}
		menu = [
			{
				title: "Unlock",
				action: function(elm,d,i){
					d3.select(elm).classed("fixed",function(d){return d.fixed=false;});
					update();
				}
			}
		];
		if(edition || nugget_add){
			menu.push(
			{
				title: "Add Attribute",
				child:[
				{
					title:"list",
					action: function(elm,d,i){
						var lbl=window.prompt("define attribute labels","");
						var values=window.prompt("define attribute values","true,false");
						if(lbl=="")self.addNode(["attribute","list"],[],[d.id]);
						else self.addNode(["attribute","list"],lbl.split(","),[d.id]);
						if(values=="")self.addCtx(layerG.nodes[layerG.nodes.length-1].id,["t","f"]);
						else self.addCtx(layerG.nodes[layerG.nodes.length-1].id,values.split(","));
					}
				},{
					title:"interval",
					action: function(elm,d,i){
						var lbl=window.prompt("define attribute labels","");
						var values=window.prompt("define attribute values","0,INF");
						if(values.split(",").length>2){
							console.log("This attribute is not an interval !");
							return;
						}
						if(lbl=="")self.addNode(["attribute","interval"],[],[d.id]);
						else self.addNode(["attribute","interval"],lbl.split(","),[d.id]);
						if(values=="")	self.addCtx(layerG.nodes[layerG.nodes.length-1].id,["0","INF"]);
						else self.addCtx(layerG.nodes[layerG.nodes.length-1].id,values.split(","));
					}
				}]
			},{
				title: "Remove",
				action: function(elm,d,i){
					if(confirm('Are you sure you want to delete this Action ?'))
						self.removeNodeR(d.id);
				}
			},{
				title: "Select context",
				action: function(elm,d,i){
					for(var i=0;i<d.context.length;i++)
						d3.selectAll("g").filter(function(e){return e.id==d.context[i];}).classed("selected",layerG.nodes[layerG.nodesHash[d.context[i]]].selected=true);
				}
			});
		}if(nugget_add && !d3.selectAll("g.selected").empty()){
			menu.push({
				title: "link to all selected",
				child:[
				{
					title: "link left",
					action:function(elm,d,i){
						var mousepos=d3.mouse(svg[0][0]);
						var selected=d3.selectAll("g.selected");
						d3.event.stopPropagation();
						for(var i=0;i<d.sons.length;i++){
							if(layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[1] == "binder" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[2]=="left"){
								selected.each(function(d2){
									if(d2.classes[0]!="action"){
										self.addEdge(d.sons[i],d2.id);
										self.addCtx(d.id,[d2.id])
									}else console.log("can't link two action : put it in context instead");
								});
								selected.classed("selected",function(d){return d.selected=false;});
							}
						}
					}
				},{
					title: "link right",
					action:function(elm,d,i){
						var mousepos=d3.mouse(svg[0][0]);
						var selected=d3.selectAll("g.selected");
						d3.event.stopPropagation();
						for(var i=0;i<d.sons.length;i++){
							if(layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[1] == "binder" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[2]=="right"){
								selected.each(function(d2){self.addEdge(d.sons[i],d2.id); self.addCtx(d.id,[d2.id])});
								selected.classed("selected",function(d){return d.selected=false;});
							}
						}
					}
				}]
			},{
				title: "Add Selection to context",
				action:function(elm,d,i){
					var selected=d3.selectAll("g.selected");
					d3.event.stopPropagation();
					selected.each(function(d2){
						if(d.id!=d2.id){
							if(d2.classes[0]!="flag" && d2.classes[0]!="attribute")
								self.addCtx(d.id,[d2.id],null);
							else{
								ctx_mode=true;
								var el = d3.select(this);
								el.classed("hilighted",true);
								var frm = svg.append("foreignObject");
								var inp = frm.attr("x", getNodeX(d2)-50)
											.attr("y", getNodeY(d2)-45-d2.toInt())
											.attr("width", 100)
											.attr("height", 50)
											.append("xhtml:form")
											.append("label")
												.classed("hilighted",true)
												.attr("for",function(){return "i_"+d2.id;})
												.text(function(){if(d2.label!=null && d2.label.length>0)return "value for "+d2.label[0]; else return "value for "+d2.id})
											.append("input")
												.attr("id",function(){return "i_"+d2.id;})
												.attr("value", function() {if(d2.context!=null) return d2.context.join(","); else return "";})
												.attr("style", "width: 294px;")
												.on("focus",function(){
													d3.select(this).on("keypress",function(){
														d3.event.stopPropagation();
														//d3.event.preventDefault();
														var txt = inp.node().value;
														if(d3.event.keyCode == 13 && typeof(txt)!= 'undefined' && txt!=null && txt!=""){
															var tmp_obj={};
															tmp_obj[d2.id]=txt.split(",");
															for(var i=0;i<tmp_obj[d2.id].length;i++){
																if(d2.context.indexOf(tmp_obj[d2.id][i])==-1)
																	self.addCtx(d2.id,[tmp_obj[d2.id][i]],null);
															}
															self.addCtx(d.id,[d2.id],tmp_obj);
															d3.select(this.parentNode.parentNode).remove();
															el.classed("hilighted",false);
															if(svg.selectAll("input").empty())ctx_mode=false;
														}else if(d3.event.keyCode == 13 && (typeof(txt)== 'undefined' || txt==null || txt=="")){
															d3.event.preventDefault();
														}
													});
												})
												.on("blur",function() {d3.select(this).on("keypress",null);});
											
							}
					} });
					selected.classed("selected",function(d){return d.selected=false;});
				}
			},{
				title: "remove Selection from context",
				action:function(elm,d,i){
					var selected=d3.selectAll("g.selected");
					d3.event.stopPropagation();
					selected.each(function(d2){
						var from_to=d3.selectAll(".link").filter(function(fd){
							if(fd.sourceID == d2.id)
								return fd.target.classes[0]=="action" && fd.target.father!=null && fd.target.father==d.id;
							else if(fd.targetID == d2.id)
								return fd.source.classes[0]=="action" && fd.source.father!=null && fd.source.father==d.id;
							else return false;
						});
						//console.log(from_to);
						if(from_to.empty())
							self.rmCtx(d.id,[d2.id]);
						else
							console.log("can't remove a linked element from the context")
					});
					selected.classed("selected",function(d){return d.selected=false;});
				}
			});
		}
		var tmp_select = d3.selectAll("g.selected").filter(function(d){
														for(var i=0;i<d.classes.length;i++){
															var evt_load=d3.select(d3.event.target.parentNode);
															if(!evt_load.classed(d.classes[i])){
																return false;
															}
														}
														return true;
													});
		if(nugget_add && !tmp_select.empty()){
			menu.push(
			{
				title: "Merge with selected Actions",
				action:function(elm,d,i){
					var selected=d3.selectAll("g.selected").filter(function(d){return d.classes[0]=="action"});
					selected.each(function(d2){
						self.mergeNode(d.id,d2.id);
					});
				}
			});
		}if(edition && d3.selectAll("g.selected").size()==1 && d3.select("g.selected").classed("action")){
				menu.push(
				{
					title: "Add influence from Selected action",
					child:[
					{
						title:"Positive",
						action: function(elm,d,i){
							var select=d3.select("g.selected").each(function(d2){self.addInfluence(d2.id,d.id,"positive");});
						}
					},{
						title:"Negative",
						action: function(elm,d,i){
							var select=d3.select("g.selected").each(function(d2){self.addInfluence(d2.id,d.id,"negative");});
						}
					}]
				});
		}
		return menu;
	};
	var svgMenu = function(){//svg right click menu : nugget view allow to add nugget (actions), edit view allow to modify the kr
		var menu;
		if(ctx_mode){
			window.alert("Please fill all values for the action context");
			return [];
		}
		menu = [
			{
				title: "Unlock all",
				action: function(elm,d,i){
					d3.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=false;});
					update();
				}
			},{
				title: "Select all",
				action: function(elm,d,i){
					d3.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=true;});
					update();
				}
			},{
				title: "Unselect all",
				action: function(elm,d,i){
					d3.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
					update();
				}
			}];
		if(edition || nugget_add){
			menu.push(
			{
				title: "Add Agent",
				action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					var lbl=window.prompt("define your label","");
					if(lbl=="")self.addNode(["agent"],[],[],mousepos[0],mousepos[1]);
					else self.addNode(["agent"],lbl.split(","),[],mousepos[0],mousepos[1]);
				}	
			});
		}if((edition || nugget_add) && !d3.selectAll("g.selected").empty()){
				menu.push(
				{
					title: "Remove selected",
					action: function(elm,d,i){
						var select=d3.selectAll("g.selected");
						if(confirm('Are you sure you want to delete '+select[0].length+' nodes ?'))
							select.each(function(d2){self.removeNodeR(d2.id);});
					}
				});
		}if(nugget_add){	
			menu.push(
			{
				title: "Add Action",
				child:[{
					title:"Bind",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","bnd"],["bind"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);						
					}
				},
				{
					title:"Break",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","brk"],["break"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					
					}
				},
				{
					title:"Modify",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","mod"],["mod"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				},
				{
					title:"Synthesis",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","syn"],["synth"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				},
				{
					title:"Degradation",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","deg"],["deg"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				}
				]
			});
		}
		return menu;
	};
	var clickHandler = function(d) {//handling click on on a node or an action 
		d3.event.stopPropagation();
		if(ctx_mode){
			window.alert("Please fill all values for the action context");
			return;
		}
		if(d3.event.ctrlKey){
			d3.select(this).classed("fixed", d.fixed = false);
		}
		if(d3.event.shiftKey && (edition || nugget_add || kr_show)){
			if(d3.select(this).classed("selected"))
				d3.select(this).classed("selected", d.selected = false);
			else 
				d3.select(this).classed("selected", d.selected = true);
		}	
	};
	var clickText = function(d){//click on labels
		if(!edition && !nugget_add) return;
        var el = d3.select(this);
        var frm = svg.append("foreignObject");
        var inp = frm
            .attr("x", getNodeX(d)-100)
            .attr("y", getNodeY(d)-12)
            .attr("width", 200)
            .attr("height", 25)
            .append("xhtml:form")
                    .append("input")
                        .attr("value", function() {
                            this.focus();
                            return d.label.join(",");
                        })
                        .attr("style", "width: 294px;")
                        .on("blur", function() {//change node label on focus lost : may be removed
                            var txt = inp.node().value;
							layerG.rmLabel(d.id,[]);
							if(txt!=null && txt!="")
								layerG.addLabel(d.id,txt.split(","));
                            svg.select("foreignObject").remove();
							el.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id});
                        })
                        .on("keypress", function() {
                            var e = d3.event;
                            if (e.keyCode == 13){
                                if (e.stopPropagation)
                                  e.stopPropagation();
								  e.preventDefault();
								var txt = inp.node().value;
                                layerG.rmLabel(d.id,[]);
								if(txt!=null && txt!="")
									layerG.addLabel(d.id,txt.split(","));
                                svg.select("foreignObject").remove();
								el.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id});
                            }
                        });
	}
	
};

//example

var gGraph = new GraphicGraph('graph');
window.onload = function () { 
	gGraph.init();
	gGraph.addNode(["agent"],["ag1","othername","thirdname"],[]);
	gGraph.addNode(["agent"],["ag2"],[]);
	gGraph.addNode(["agent"],["ag3"],[]);
	gGraph.addNode(["region"],["reg1"],["n0"]);
	gGraph.addNode(["region"],["reg2"],["n1"]);
	gGraph.addNode(["key_res"],["kr1"],["n0"]);
	gGraph.addNode(["key_res"],["kr2"],["n1"]);
	gGraph.addNode(["attribute"],["att2"],["n0"]);
	gGraph.addNode(["attribute"],["att2"],["n1","n4"]);
	gGraph.addNode(["flag"],["fl1"],["n0"]);
	gGraph.addNode(["flag"],["fl2"],["n1","n6"]);
	gGraph.addNode(["flag"],["fl3"],["n1"]);
	gGraph.addNode(["flag"],["fl4"],["n2"]);
	gGraph.addNode(["action","bnd"],["bnd1"],[]);
	gGraph.addNode(["action","brk"],["brk1"],[]);
	gGraph.addNode(["action","binder","left"],[],["n13"]);
	gGraph.addNode(["action","binder","right"],[],["n13"]);
	gGraph.addNode(["action","binder","left"],[],["n14"]);
	gGraph.addNode(["action","binder","right"],[],["n14"]);
	gGraph.addEdge("n3","n15");
	gGraph.addEdge("n4","n16");
	gGraph.addEdge("n2","n17");
	gGraph.addEdge("n4","n18");
	gGraph.addInfluence("n13","n14","positive");
	gGraph.addCtx("n3",["n1","n4"]);
	gGraph.addCtx("n13",["n3","n4"]);
	gGraph.addCtx("n14",["n2","n4"]);
	gGraph.wakeUp();
	//gGraph.mergeNode("n0","n1");
	//console.log(gGraph.findByName(["brk1"],["action","bnd"],[]));
	
};
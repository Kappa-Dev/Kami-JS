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
	var binder_count=0;
	var first_init;
	var nugget_add,edition,kr_show,lcg_view,kappa_view;//edition mod
	var ctx_mode=false;
	var self=this;
	var nuggets=[];
	var lcgG,nuggG,lcgDynG,lcgDrag;//layered graph for lcg and nuggets
	var lcgS,nuggS,nuggDynG,nuggDrag;//stack for lcg and nuggets
	var modified=true;
	this.findByName = function findByName(label,cls,fcls,path){//find a node by its name+path+class+father class
		var cl_ok=false,lb_ok=false,p_ok=true;
		for(var i=0;i<layerG.nodes.length;i++){
			var tmp_node=layerG.nodes[i];
			cl_ok=(tmp_node.classes.join(",")==cls.join(",")) && (fcls==null || fcls.length==0 || (tmp_node.father!=null && typeof(layerG.nodesHash[tmp_node.father])!="undefined" && layerG.nodesHash[tmp_node.father]!=null && layerG.nodes[layerG.nodesHash[tmp_node.father]].classes.join(",")==fcls.join(",")));
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
	this.getLG = function getLG(){//return a pointer to the current layered graph warning : modifying the lg can result in incoherences
		return layerG;
	}
	this.wakeUp = function wakeUp(val){//speed up tick function
		dynG.getForce().start();
		if(!(typeof(val)!="undefined" && val!=null && !val))
			svg.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=false;});
		for(var i=0;i<300;i++){
			dynG.getForce().tick();
		}
		if(first_init)
				svg.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=true;});
		first_init=true;
	};
	this.log = function log(){//output layerGraph data
		layerG.log();
	};
	//init the graphic graph
	this.init = function init(){
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
		nuggDynG.getForce().on("tick",tick);
		nuggDrag=nuggDynG.getForce().drag().on("dragstart", dragstart);
		//initialize
		first_init=false;
		
		var zoom = d3.behavior.zoom()
		.scaleExtent([0.02, 1])
		.on("zoom", zoomed);
		var drg = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);
		var svg_pan=d3.select("#"+containerID).append("svg:svg")
			.attr("width",width)
			.attr("height",height);
		svg_pan.append("svg:defs").selectAll("marker")
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
		svg_pan.on("contextmenu",d3.contextMenu(function(){return svgMenu();}));
		//svg=svg_pan.append("g").call(zoom).call(drg);
		svg=svg_pan;
		svg.call(zoom);
		d3.select("#"+containerID).append("div")
			.classed("n_tooltip",true)
			.style("visibility","hidden");
		d3.select("#"+containerID).append("div")
			.classed("s_tooltip",true)
			.style("visibility","hidden");
			this.setState("kr_view");
		//dynG.getForce().start();
		
	};
	function zoomed() {
		svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}
	//update all the SVG elements
	var update = function(){
		//links svg representation
		dynG.init();
		
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
		d3.selectAll(".influence").on("contextmenu",d3.contextMenu(function(){return edgeCtMenu();}));
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
			.classed("pos",function(d){return d.classes[1]=="mod" && d.classes[2]=="pos"})
			.classed("neg",function(d){return d.classes[1]=="mod" && d.classes[2]=="neg"})
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
	//show up new svg element only if there position datas have been computed
	var tick = function(){
		if(first_init || dynG.getForce().alpha()<=0.00501){
			
			s_node.attr("transform", function(d) {d.x=Math.max(d.toInt(), Math.min(width - d.toInt(), d.x));d.y=Math.max(d.toInt(), Math.min(height - d.toInt(), d.y)); return "translate(" + d.x + "," + d.y + ")"; });
			s_action.attr("transform", function(d) {d.x=Math.max(d.toInt(), Math.min(width - d.toInt(), d.x));d.y=Math.max(d.toInt(), Math.min(height - d.toInt(), d.y)); return "translate(" + d.x + "," + d.y + ")"; });
			s_binder.attr("cx",function(d) {return getNodeX(d);})
				.attr("cy",function(d) {return getNodeY(d);});
			s_link.attr("x1", function(d){return getNodeX(d.source);})
				.attr("y1", function(d){return getNodeY(d.source);})
				.attr("x2", function(d){return getNodeX(d.target);})
				.attr("y2", function(d){return getNodeY(d.target);});
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
			stack(layerG,layerG.addCtx,[old_nodeID,layerG.nodes[layerG.nodesHash[old_nodeID]].context.concat(),layerG.copyVCtx(layerG.nodes[layerG.nodesHash[old_nodeID]].valued_context),layerG.copyACtx(layerG.nodes[layerG.nodesHash[old_nodeID]].apply_context)]);
			stack(layerG,layerG.addLabel,[new_nodeID,layerG.nodes[layerG.nodesHash[new_nodeID]].label.concat()]);
			stack(layerG,layerG.addCtx,[new_nodeID,layerG.nodes[layerG.nodesHash[new_nodeID]].context.concat(),layerG.copyVCtx(layerG.nodes[layerG.nodesHash[new_nodeID]].valued_context),layerG.copyACtx(layerG.nodes[layerG.nodesHash[new_nodeID]].apply_context)]);
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
		stack(layerG,layerG.addCtx,[nID,layerG.nodes[layerG.nodesHash[nID]].context.concat(),layerG.copyVCtx(layerG.nodes[layerG.nodesHash[nID]].valued_context),layerG.copyACtx(layerG.nodes[layerG.nodesHash[nID]].apply_context)]);
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
		//stack(layerG,layerG.setFather,[son,layerG.nodes[son].father]);
		layerG.removeParenting(son);
		update();	
	};
	this.addCtx = function addCtx(id,ctx,vctx,actx){//add a context to a specific node
		dynG.getForce().stop();
		var tmp_l=layerG.nodes[layerG.nodesHash[id]].context.length;
		layerG.addCtx(id,ctx,vctx,actx);
		if(layerG.nodes[layerG.nodesHash[id]].context.length > tmp_l)
				stack(layerG,layerG.rmCtx,[id,ctx]);
		update();	
	};
	this.rmCtx = function rmCtx(id,ctx){//remove a context from a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.addCtx,[id,layerG.nodes[layerG.nodesHash[id]].context.concat(),layerG.copyVCtx(layerG.nodes[layerG.nodesHash[id]].valued_context),layerG.copyACtx(layerG.nodes[layerG.nodesHash[id]].apply_context)]);
		layerG.rmCtx(id,ctx);
		update();	
	};
	this.getCtx = function getCtx(id){//get a specific node context
		return layerG.nodes[layerG.nodeHash[id]].context.concat();
	};
	this.getCtxV = function getCtxV(id){//get a specific node context values
		return layerG.copyVCtx(layerG.nodes[layerG.nodesHash[id]].valued_context);
	};
	this.getCtxA = function getCtxA(id){//get a specific node context values
		return layerG.copyACtx(layerG.nodes[layerG.nodesHash[id]].apply_context);
	};
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
		d3.event.sourceEvent.stopPropagation();
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
		/*rewriter.push({f:fun,o:obj,p:param});
		d3.select("#undo").property("disabled",false)
							.style("display","initial");*/
	};
	this.unStack = function unStack(){//remove element from the undo stack and apply it !
		/*
		if(rewriter.length==0){
			console.log("stack empty");
			d3.select("#undo").property("disabled",true)
							 .style("display","none");
			return;
		}
		fun=rewriter.pop();
		fun.f.apply(fun.o,fun.p);
		if(fun.f == layerG.addLabel){
			d3.select(fun.p[0]).select("text").text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id});
		}
		update();*/
	};
	this.unStackAll = function unStackAll(){//undo all the stack
		/*
		while(rewriter.length>0)
			this.unStack();
		d3.select("#undo").property("disabled",true)
							 .style("display","none");*/
	};
	this.clearStack = function clearStack(){//clear the undo stack
		/*
		rewriter=[];
		d3.select("#undo").property("disabled",true)
							 .style("display","none");
							 */
	};
	this.save = function save(){//save the current graph (clear the undo stack and set it to modified)
		this.clearStack();
		modified=true;
	};
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
					svg.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				}
				nugget_add=true;
				edition=false;
				kr_show=false;
				lcg_view=false;
				kappa_view=false;
				break;
			case "kr_view":
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
				svg.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
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
					svg.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				}
				nugget_add=false;
				edition=true;
				kr_show=false;
				lcg_view=false;
				kappa_view=false;
				break;
			case "lcg_view":
				var selected_l=[];
				svg.selectAll("g").filter(".selected").filter(".action").each(function(d){selected_l.push(d.id)});
				if(selected_l==null || selected_l.length==0){
					alert("Select at least one action");
					return;
				}
				d3.select("#menu_f").selectAll("input").property("disabled",true)
				   .style("display","none");
				d3.select("#kr").property("disabled",false)
					.style("display","initial");
				d3.select("#kappa").property("disabled",false)
				   .style("display","initial");
				d3.select("#update").property("disabled",false)
					.style("display","initial");
				d3.select("#export").property("disabled",false)
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
					if(modified || confirm("Generate a new LCG ?")){
						layerG.init();
						lcgConvert(selected_l);
					}
					svg.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
				}
				break;
			case "kappa_view"://nobody care : open jasim !
				kappaConvert();
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
				var ctx_el=svg.selectAll("g").filter(function(e){return e.id==d.context[i];});
				ctx_el.classed("selected_overlay",layerG.nodes[layerG.nodesHash[d.context[i]]].selected_over=true);
					if(typeof(d.apply_context)!="undefined" && d.apply_context!=null){
						var tmp_node=ctx_el.datum();
						if(checkExist(d.apply_context[tmp_node.id])){
							if(d.apply_context[tmp_node.id][0]=="E" && ((d.apply_context[tmp_node.id].length>1 && d.apply_context[tmp_node.id][1]=="E") || d.apply_context[tmp_node.id].length==1) ){
								ctx_el.classed("exist",true);
							}else if(d.apply_context[tmp_node.id].length>1 && d.apply_context[tmp_node.id][0]!=d.apply_context[tmp_node.id][1])
								ctx_el.classed("existAlway",true);
						}else{
							ctx_el.classed("alway",true);	
						}
					}
					else{
						ctx_el.classed("alway",true);	
					}
				if(d3.event.shiftKey && d.valued_context!=null && (ctx_el.classed("attribute") || ctx_el.classed("flag") )){
					var tmp_node=ctx_el.datum();
					var tmp_id;
					tmp_id=tmp_node.classes[0]+":"+tmp_node.id; 
					ctx_lst.push({id:tmp_id,x:tmp_node.x,values:d.valued_context[tmp_node.id]});
					ctx_lst.sort(function(a,b){return a.x-b.x});
				}	
			}
			var div_ct="<p><h3><b><center>id: "+d.classes.join("/")+"</center></b>";
			if(ctx_lst.length>0){
				div_ct+="detailed values : <ul style='padding: 7px;margin:1px;'>";
				for(var i=0;i<ctx_lst.length;i++)
					div_ct+="<li>"+ctx_lst[i].id+" : "+ctx_lst[i].values.join(",");
				div_ct+="</ul></p>"
				d3.select(".n_tooltip").style("visibility","visible")
								.html(div_ct);
			}	
		}
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
			for(var i=0;i<d.context.length;i++){
				svg.selectAll("g").filter(function(e){return e.id==d.context[i];}).classed("selected_overlay",layerG.nodes[layerG.nodesHash[d.context[i]]].selected_over=false)
																				 .classed("exist",false)
																				 .classed("existAlway",false)
																				 .classed("alway",false);	
				
			}
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
				svg.selectAll("g").filter(function(e){return (e.id==d.sourceID || e.id==d.targetID || (d.source.classes[0]=="action" && d.source.father!=null && d.source.father==e.id) || (d.target.classes[0]=="action" && d.target.father!=null && d.target.father==e.id));})
					.classed("selected",function(d){ return layerG.nodes[layerG.nodesHash[d.id]].selected=true;});
			}
		}];
		if(edition || nugget_add || lcg_view){//be carefull in lcg view !
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
		if(lcg_view && evt_trg.classed("attribute")){
			menu.push({
				title: "Edit Values",
				action: function(elm,d,i){
					var lbl=window.prompt("define Attributes",d.context.join(","));
					self.rmCtx(d.id,[]);
					if(lbl!=null && lbl!="") self.addCtx(d.id,lbl.split(","));
				}
			});
		}
		if(edition || nugget_add){
			if(!evt_trg.classed("attribute") && !evt_trg.classed("flag")){
				menu.push({
					title: "Add Attribute",
					child:[
					{
						title:"list",
						action: function(elm,d,i){
							var lbl=window.prompt("define attribute labels","");
							var values=window.prompt("define attribute values","vrai,faux");
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
						var values=window.prompt("define flag values","vrai,faux");
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
			}if((evt_trg.classed("attribute") || evt_trg.classed("flag") || evt_trg.classed("region") || evt_trg.classed("key_res")) && !d3.select("g.selected").empty()&& correctParenting(evt_trg,d3.select("g.selected"))){
				menu.push({
					title: "Change Parent",
					action: function(elm,d,i){
						if(d.father)
							self.rmParent(d.id);
						self.addParent(d.id,d3.select("g.selected").datum().id);
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
		}if(edition || lcg_view){
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

		}
		return menu;
	}
	var correctParenting = function(d3el_son,d3el_father){
		if(d3el_son.classed("region"))
			return d3el_father.classed("agent");
		if(d3el_son.classed("flag") || d3el_son.classed("attribute"))
			return d3el_father.classed("agent") || d3el_father.classed("region") ||  d3el_father.classed("key_res");
		if(d3el_son.classed("key_res"))
			return d3el_father.classed("agent") || d3el_father.classed("region");
		return false;

	};
	var binderCtMenu = function(){//handling right click on action binders
		var menu;
		if(ctx_mode){
			window.alert("Please fill all forms");
			return [];
		}
		if((edition || nugget_add) && !d3.selectAll("g.selected").empty()){
			menu=[
			{
				title: "link to all selected",
				action: function(elm,d,i){
					d3.event.stopPropagation();
					var selected=d3.selectAll("g.selected");
					selected.each(function(d2){
						if(layerG.nodes[layerG.nodesHash[d.father]].classes[1]!="mod"){
							if((layerG.nodes[layerG.nodesHash[d.father]].classes[1]=="bnd"|| layerG.nodes[layerG.nodesHash[d.father]].classes[1]=="brk") &&(d2.classes[0]=="attribute" ||  d2.classes[0]=="flag")){
								console.log("can't bind a flag/attribute");
								return;
							}
							self.addEdge(d.id,d2.id);
							self.addCtx(d.father,[d2.id]);
						}
						else if(layerG.nodes[layerG.nodesHash[d.father]].classes[1]=="mod" && d2.classes[0]!="attribute" && d2.classes[0]!="flag"){
							console.log("can't modify a none flag/attribute");
						}
						else{
							ctx_mode=true;
							var el = d3.select(this);
							var tab=d2.context;
							var ret = inputMenu("attribute of : "+d2.id,null,tab,null,true,false,'center',function(cb){
								if(cb.radio){
								var tmp_obj={};
												tmp_obj[d2.id]=cb.radio;
												for(var i=0;i<tmp_obj[d2.id].length;i++){
													if(d2.context.indexOf(tmp_obj[d2.id][i])==-1)
														self.addCtx(d2.id,[tmp_obj[d2.id][i]],null);
												}
												self.addCtx(d.father,[d2.id],tmp_obj);
												self.addEdge(d.id,d2.id);
												if(svg.selectAll("input").empty())ctx_mode=false;
								}
							},d2);

						}
					});
					selected.classed("selected",function(d){return d.selected=false;});
				}
				
			}];
		}else menu=[];
		return menu;
	}
	var actCtMenu = function(){//handling right click on actions
		var menu;
		if(ctx_mode){
			window.alert("Please fill all forms");
			return [];
		}
		// by default an action can only be moved around
		menu = [
			{
				title: "Unlock",
				action: function(elm,d,i){
					d3.select(elm).classed("fixed",function(d){return d.fixed=false;});
					update();
				}
			}
		];
		if(edition || nugget_add){//in case of edition or nugget mod : we can add attributes to an action or remove it or select its context
			menu.push(
			{
				title: "Add Attribute",
				child:[
				{
					title:"list",
					action: function(elm,d,i){
						var lbl=window.prompt("define attribute labels","");
						var values=window.prompt("define attribute values","vrai,faux");
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
						svg.selectAll("g").filter(function(e){return e.id==d.context[i];}).classed("selected",layerG.nodes[layerG.nodesHash[d.context[i]]].selected=true);
				}
			});
		}
		if(nugget_add && !d3.selectAll("g.selected").filter(function(dd){return d3.select(d3.event.target.parentNode).datum().context.indexOf(dd.id)!=-1;}).empty()){//edition of the element special context
			menu.push(
			{
				title: "specify element application",
				action:function(elm,d,i){
					var selected=d3.selectAll("g.selected").filter(function(dd){return d.context.indexOf(dd.id)!=-1;});
					var ret={};
					selected.each(function(d2){
						ctx_mode=true;
						var el = d3.select(this);
						var tab;
						if(typeof(d.apply_context)!="undefined" && d.apply_context!=null && checkExist(d.apply_context[d2.id]))
							tab = d.apply_context[d2.id];
						else
							tab=null;
						var ret = inputMenu("attribute of : "+d2.id,null,null,tab,true,false,'center',function(cb){
							if(cb.check){
								self.addCtx(d.id,[],null,cb.check);
							}
						},d2);
					});
				}
			});
		}
		if(nugget_add && !d3.selectAll("g.selected").empty()){//in nugget mode, allow to link elements to the action
			var selected_elt=d3.select(d3.event.target.parentNode);
			var tmp_child=null;
			if(selected_elt.classed("bnd") || selected_elt.classed("brk")){ //for bnd & break : link is on both binders, the elemet is also added to the context. we only can link agent, region and key_res
				tmp_child=[{
					title: "link right",
					action:function(elm,d,i){
						var selected=d3.selectAll("g.selected");
						d3.event.stopPropagation();
						for(var i=0;i<d.sons.length;i++){
							if(layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[1] == "binder" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[2]=="right"){
								selected.each(function(d2){
									if(d2.classes[0]!="action" && d2.classes[0]!="attribute" && d2.classes[0]!="flag"){
										self.addEdge(d.sons[i],d2.id);
										self.addCtx(d.id,[d2.id]);
									}else console.log("can't link two action or flags or attributes : put it in context instead");
								});
								selected.classed("selected",function(d){return d.selected=false;});
							}
						}
					}
				},{
					title: "link left",
					action:function(elm,d,i){
						var selected=d3.selectAll("g.selected");
						d3.event.stopPropagation();
						for(var i=0;i<d.sons.length;i++){
							if(layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[1] == "binder" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[2]=="left"){
								selected.each(function(d2){
									if(d2.classes[0]!="action" && d2.classes[0]!="attribute" && d2.classes[0]!="flag"){
										self.addEdge(d.sons[i],d2.id);
										self.addCtx(d.id,[d2.id])
									}else console.log("can't link two action or flags or attributes : put it in context instead");
								});
								selected.classed("selected",function(d){return d.selected=false;});
							}
						}
					}
				}];
			}
			else if(selected_elt.classed("mod")){ //for bnd & break : link is one binder, the elemet is also added to the context. we only can link attributes and flags : the value to modify is also needed for the action !
				tmp_child=[{
					title: "link",
					action:function(elm,d,i){
						d3.event.stopPropagation();
						var selected=d3.selectAll("g.selected");
						var binder_id;
						for(var i=0;i<d.sons.length;i++){
							if(layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[1] == "binder" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[2]=="right"){
								binder_id=d.sons[i];
								selected.each(function(d2){
									if(d2.classes[0]!="flag" && d2.classes[0]!="attribute") console.log("can't modify a none flag or attribute element");
									else{
										ctx_mode=true;
										var el = d3.select(this);
										var tab=d2.context;
								var ret = inputMenu("value of : "+d2.id,null,tab,null,true,false,'center',function(cb){
									
									if(cb.radio){
										var tmp_obj={};
										tmp_obj[d2.id]=cb.radio;
										for(var i=0;i<tmp_obj[d2.id].length;i++){
											if(d2.context.indexOf(tmp_obj[d2.id][i])==-1)
												self.addCtx(d2.id,[tmp_obj[d2.id][i]],null);
										}
										self.addCtx(d.id,[d2.id],tmp_obj);
										self.addEdge(binder_id,d2.id);
										if(svg.selectAll("input").empty())ctx_mode=false;
									}
								},d2);
									}
									selected.classed("selected",function(d){return d.selected=false;});
								});
							}
						}
					}
				}];
			}
			else{//in case of synth or deg : we can link everything except action to one binder.
				tmp_child=[{
					title: "link",
					action:function(elm,d,i){
						var selected=d3.selectAll("g.selected");
						d3.event.stopPropagation();
						for(var i=0;i<d.sons.length;i++){
							if(layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[1] == "binder" && layerG.nodes[layerG.nodesHash[d.sons[i]]].classes[2]=="right"){
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
				}];
			}//an action can be linked, or a set of elements added/removed to the context (in case of attribute/flag : the values are needed for adding)
			menu.push({
				title: "link to all selected",
				child:tmp_child
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
								var tab=d2.context;
								var t2=null;
								
								var ret = inputMenu("values of : "+d2.id,null,null,tab,true,false,'center',function(cb){
									if(cb.check){
										var tmp_obj={};
										tmp_obj[d2.id]=cb.check;
										for(var i=0;i<tmp_obj[d2.id].length;i++){
											if(d2.context.indexOf(tmp_obj[d2.id][i])==-1)
												self.addCtx(d2.id,[tmp_obj[d2.id][i]],null);
										}
										self.addCtx(d.id,[d2.id],tmp_obj);
										if(svg.selectAll("input").empty())ctx_mode=false;
									}
								},d2);
								//casablah !!!
								/*el.classed("hilighted",true);
								var frm = svg.append("foreignObject");
								var inp = frm.attr("x", getNodeX(d2)-50)
											.attr("y", getNodeY(d2)-12)
											.attr("width", 100)
											.attr("height", 25)
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
														d3.event.preventDefault();
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
												.on("blur",function() {d3.select(this).on("keypress",null);});*/
											
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
						if(from_to.empty())
							self.rmCtx(d.id,[d2.id]);
						else
							console.log("can't remove a linked element from the context");
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
		if(nugget_add && !tmp_select.empty()){//allow to merge two different action if they are of the same type
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
		}if(edition && d3.selectAll("g.selected").size()==1 && d3.select("g.selected").classed("action")){//allow to add influence between action
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
			window.alert("Please fill all forms");
			return [];
		}
		menu = [
			{
				title: "Unlock all",
				action: function(elm,d,i){
					svg.selectAll("g").classed("fixed",function(d){return d.fixed=false;});
					update();
				}
			},{
				title: "Select all",
				action: function(elm,d,i){
					svg.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=true;});
					update();
				}
			},{
				title: "Unselect all",
				action: function(elm,d,i){
					svg.selectAll("g").filter(function(d){return d.classes[0]!="action" || d.classes[1]!="binder"}).classed("selected",function(d){return d.selected=false;});
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
					title:"Modify pos",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","mod","pos"],["mod+"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					//self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				},
				{
					title:"Modify neg",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","mod","neg"],["mod-"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					//self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				},{
					title:"Synthesis",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","syn"],["synth"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					//self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				},
				{
					title:"Degradation",
					action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					self.addNode(["action","deg"],["deg"],[],mousepos[0],mousepos[1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					//self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
					}
				}
				]
			});
		}
		return menu;
	};
	var clickHandler = function(d) {//handling click on a node or an action 
		d3.event.stopPropagation();
		if(ctx_mode){
			window.alert("Please fill all forms");
			return;
		}
		if(d3.event.ctrlKey){
			d3.select(this).classed("fixed", d.fixed = !d.fixed);
		}
		if(d3.event.shiftKey && (edition || nugget_add || kr_show || lcg_view)){
			if(d3.select(this).classed("selected"))
				d3.select(this).classed("selected", d.selected = false);
			else 
				d3.select(this).classed("selected", d.selected = true);
		}	
	};
	//click on labels
	var clickText = function(d){
		if(!edition && !nugget_add && !lcg_view) return;
        var el = d3.select(this);
		var lab=d.label;
		if(typeof d.label=='undefined' || d.label==null || d.label.length==0)
			lab=[""];
		var ret = inputMenu("name",lab,null,null,true,true,'center',function(cb){
			if(cb.line){
				layerG.rmLabel(d.id,[]);
				layerG.addLabel(d.id,cb.line);
				el.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id});
			}
		},d);
		
	};
	var lcgConvert = function(id_list){//convert a list of action into a LCG
		var convert_table={};
		id_list.sort(function(a,b){ if(nuggG.nodes[nuggG.nodesHash[a]].classes[0]=="bnd") return 1; else return -1});
		for(var i=0;i<id_list.length;i++){//for eache action
			var tmp_node=nuggG.nodes[nuggG.nodesHash[id_list[i]]];//add the action in the LCG
			addLcgAction(tmp_node,convert_table);
		}
	};
	var addLcgAction = function(tmp_node,convert_table){//for a specific action, add all the needed node in the LCG
		var possible_target=[tmp_node.id];//possible target for edges
		if(typeof(convert_table[tmp_node.id])=="undefined" || convert_table[tmp_node.id]==null){
			self.addNode(tmp_node.classes.concat(),tmp_node.label.concat(),[],tmp_node.x,tmp_node.y);
			convert_table[tmp_node.id]=self.lastNode();
			for(var s=0;s<tmp_node.sons.length;s++){//add all the action sons in the lcg
				if(typeof(convert_table[tmp_node.sons[s]])=="undefined" || convert_table[tmp_node.sons[s]]==null){
					var tmp_son=nuggG.nodes[nuggG.nodesHash[tmp_node.sons[s]]];
					self.addNode(tmp_son.classes.concat(),tmp_son.label.concat(),[convert_table[tmp_node.id]]);
					convert_table[tmp_son.id]=self.lastNode();
					if(checkExist(tmp_son.context))
						self.addCtx(convert_table[tmp_son.id],tmp_son.context.concat(),null,layerG.copyACtx(tmp_son.apply_context));
				}else{
					self.addParent(convert_table[tmp_node.sons[s]],convert_table[tmp_node.id]);
				}if(nuggG.nodes[nuggG.nodesHash[tmp_node.sons[s]]].classes[0]=="action"){
					possible_target.push(tmp_node.sons[s]);
				}
			}
			var act_links=[];
			for(var l=0;l<nuggG.links.length;l++){//get the link from or to the action
				if(possible_target.indexOf(nuggG.links[l].sourceID)!=-1 || possible_target.indexOf(nuggG.links[l].targetID)!=-1){
					if(nuggG.links[l].e_class=="link")
						act_links.push(nuggG.links[l]);
				}
			}
			for(var c=0;c<tmp_node.context.length;c++){//add recursively all the element from the context

				var tmp_ctx=nuggG.nodes[nuggG.nodesHash[tmp_node.context[c]]];
				if(tmp_ctx.classes[0]=="agent"){
					if(typeof(convert_table[tmp_ctx.id])=="undefined" || convert_table[tmp_ctx.id]==null){
						self.addNode(tmp_ctx.classes.concat(),tmp_ctx.label.concat(),[],tmp_ctx.x,tmp_ctx.y);
						convert_table[tmp_ctx.id]=[self.lastNode()];
					}
					var finded=false;
					for(var l=0;l<act_links.length;l++){
						if(act_links[l].sourceID==tmp_ctx.id || act_links[l].targetID==tmp_ctx.id){
							finded=true;
							if(convert_table[tmp_ctx.id].length==1 || tmp_node.classes[1]=="bnd"){
								if(tmp_node.classes[1]!="syn" && tmp_node.classes[1]!="deg"){
									self.addNode(["key_res"],[],[convert_table[tmp_ctx.id][0]]);
									convert_table[tmp_ctx.id].push(self.lastNode());
								}
							}if(tmp_node.classes[1]!="bnd"){
								if(tmp_node.classes[1]!="syn" && tmp_node.classes[1]!="deg"){
									for(var i=1;i<convert_table[tmp_ctx.id].length;i++){
										self.addCtx(convert_table[tmp_node.id],[convert_table[tmp_ctx.id][i]],null,layerG.copyACtx(tmp_node.apply_context));
										if(act_links[l].sourceID==tmp_ctx.id)
											self.addEdge(convert_table[tmp_ctx.id][i],convert_table[act_links[l].targetID]);
										else
											self.addEdge(convert_table[tmp_ctx.id][i],convert_table[act_links[l].sourceID]);
									}
								}else{
									var i=0;
									self.addCtx(convert_table[tmp_node.id],[convert_table[tmp_ctx.id][i]],null,layerG.copyACtx(tmp_node.apply_context));
									if(act_links[l].sourceID==tmp_ctx.id)
										self.addEdge(convert_table[tmp_ctx.id][i],convert_table[act_links[l].targetID]);
									else
										self.addEdge(convert_table[tmp_ctx.id][i],convert_table[act_links[l].sourceID]);
								}
							}
							else{
								self.addCtx(convert_table[tmp_node.id],[self.lastNode()],null,layerG.copyACtx(tmp_node.apply_context));
								if(act_links[l].sourceID==tmp_ctx.id)
										self.addEdge([self.lastNode()],convert_table[act_links[l].targetID]);
									else
										self.addEdge([self.lastNode()],convert_table[act_links[l].sourceID]);
							}
						}
					}
					if(!finded){
						self.addCtx(convert_table[tmp_node.id],[convert_table[tmp_ctx.id][0]],null,layerG.copyACtx(tmp_node.apply_context));
					}					
				}
				if(tmp_ctx.classes[0]=="attribute" || tmp_ctx.classes[0]=="flag"){
					if(typeof(convert_table[tmp_ctx.id])=="undefined" || convert_table[tmp_ctx.id]==null){
						var tmp_agent_root=getRoot(tmp_ctx,nuggG);
						if(typeof(convert_table[tmp_agent_root.id])=="undefined" || convert_table[tmp_agent_root.id]==null){
							self.addNode(tmp_agent_root.classes.concat(),tmp_agent_root.label.concat(),[],tmp_agent_root.x,tmp_agent_root.y);
							convert_table[tmp_agent_root.id]=[self.lastNode()];
						}self.addNode(["key_res"],[],[convert_table[tmp_agent_root.id][0]]);
						var tmp_kr=self.lastNode();
						self.addNode(tmp_ctx.classes.concat(),tmp_ctx.label.concat(),[tmp_kr]);
						convert_table[tmp_ctx.id]=self.lastNode();
						self.addCtx(convert_table[tmp_ctx.id],tmp_ctx.context.concat(),null,layerG.copyACtx(tmp_ctx.apply_context));		
					}
					for(var l=0;l<act_links.length;l++){
						if(act_links[l].sourceID==tmp_ctx.id || act_links[l].targetID==tmp_ctx.id){
								self.addEdge(convert_table[act_links[l].sourceID],convert_table[act_links[l].targetID]);
						}
					}	
					var vctx=null;
					if(tmp_node.valued_context!=null && checkExist(tmp_node.valued_context[tmp_ctx.id])){
						vctx={};
						vctx[convert_table[tmp_ctx.id]]=tmp_node.valued_context[tmp_ctx.id].concat();
					}
					self.addCtx(convert_table[tmp_node.id],[convert_table[tmp_ctx.id]],vctx,layerG.copyACtx(tmp_node.apply_context));	
				}
				if(tmp_ctx.classes[0]=="action" && tmp_ctx.classes[1]!="binder"){
					addLcgAction(tmp_ctx,convert_table);
					self.addCtx(convert_table[tmp_node.id],[convert_table[tmp_ctx.id]],null,layerG.copyACtx(tmp_node.apply_context));
				}
				if(tmp_ctx.classes[0]=="region" || tmp_ctx.classes[0]=="key_res"){
					var tmp_agent_root=getRoot(tmp_ctx,nuggG);
					if(typeof(convert_table[tmp_agent_root.id])=="undefined" || convert_table[tmp_agent_root.id]==null){
							self.addNode(tmp_agent_root.classes.concat(),tmp_agent_root.label.concat(),[],tmp_agent_root.x,tmp_agent_root.y);
							convert_table[tmp_agent_root.id]=[self.lastNode()];
					}
					var checkedRegion=[];						
					for(var l=0;l<act_links.length;l++){
						if(act_links[l].sourceID==tmp_ctx.id || act_links[l].targetID==tmp_ctx.id){
							if(typeof(convert_table[tmp_ctx.id])=="undefined" || convert_table[tmp_ctx.id]==null || tmp_node.classes[1]=="bnd"){
								if(convert_table[tmp_ctx.id]=="undefined" || convert_table[tmp_ctx.id]==null) convert_table[tmp_ctx.id]=[];
								if(checkedRegion.indexOf(tmp_ctx.id)==-1){
									self.addNode(["key_res"],[],[convert_table[tmp_agent_root.id][0]]);
									convert_table[tmp_ctx.id].push(self.lastNode());
									self.addCtx(convert_table[tmp_node.id],[self.lastNode()],null,layerG.copyACtx(tmp_node.apply_context));
									checkedRegion.push(tmp_ctx.id);
								}
								if(act_links[l].sourceID==tmp_ctx.id)
									self.addEdge(self.lastNode(),convert_table[act_links[l].targetID]);
								else
									self.addEdge(self.lastNode(),convert_table[act_links[l].sourceID]);
							}
							else if(tmp_node.classes[1]!="bnd" ){
								for(var i=0;i<convert_table[tmp_ctx.id].length;i++){
									self.addCtx(convert_table[tmp_node.id],[convert_table[tmp_ctx.id][i]],null,layerG.copyACtx(tmp_node.apply_context));
									if(act_links[l].sourceID==tmp_ctx.id)
										self.addEdge(convert_table[tmp_ctx.id][i],convert_table[act_links[l].targetID]);
									else
										self.addEdge(convert_table[tmp_ctx.id][i],convert_table[act_links[l].sourceID]);
								}
							}	
						}
					}	
				}
			}
		}
		layerG.log();
	}
	var getRoot = function(node,lg){//get the root node of a slecific node "node" in a specific grap "lg"
		var tmp_node=node;
		while(typeof tmp_node.father!= "undefined" && tmp_node.father!=null){
			tmp_node=lg.nodes[lg.nodesHash[tmp_node.father]];
		}
		return tmp_node;
	}
	var checkExist = function(tab){//chech if a tab exist, is not null and not empty
		return typeof(tab)!='undefined' && tab!=null && tab.length>0;
	};
	var kappaConvert = function(){//convert a site graph to Kappa.
		binder_count=1;
		console.log("converting to Kappa");
		/*************************** adding agent signature *******************/
		// notice that formal name of a node is : id _ label list if any, separeted by _
		var kappa_code="#### Signatures\n\n";
		var ag_name_var_l={};
		svg.selectAll("g").filter(".agent").each(function(d){
			var ag_def="%agent: "+d.id+"_"+d.label.join("_")+"(";
			ag_name_var_l[d.id]=[];
			ag_name_var_l[d.id].push(d.id+"_"+d.label.join("_")+"(");
			var prems="";
			for(var s=0;s<d.sons.length;s++){//all the site
				var tmp_son=layerG.nodes[layerG.nodesHash[d.sons[s]]];//a site
				ag_def+=tmp_son.id+"_"+tmp_son.label.join("_");
				if(checkExist(tmp_son.sons)){
					var tmp_son_son=layerG.nodes[layerG.nodesHash[tmp_son.sons[0]]];//this site flags/attributes
					if(tmp_son_son.classes[0]=="attribute"){
						if(checkExist(tmp_son_son.context)){
							var expl=[];
							for(var x=0;x<tmp_son_son.context.length;x++){
								for(var anv=0;anv<ag_name_var_l[d.id].length;anv++){
									var sentence=ag_name_var_l[d.id][anv]+prems+tmp_son.id+"_"+tmp_son.label.join("_")+"~"+tmp_son_son.context[x];
									expl.push(sentence);
								}
							}ag_name_var_l[d.id]=expl;
							if(prems=="") prems=",";
						}
					}
					if(checkExist(tmp_son_son.context))
						ag_def+="~"+tmp_son_son.context.join("~");
				}
				if(s<d.sons.length-1)
					ag_def+=",";
			}
			ag_def+=")\n";
			kappa_code+=ag_def;
		});
		/************************************************************/
		/*************************** adding rules *******************/
		var rule_list={};
		svg.selectAll("g").filter(".action").each(function(d){
			genAction(d,rule_list);
		});
		kappa_code+="#### rules\n\n";
		var r_key=Object.keys(rule_list);
		for(var i=0;i<r_key.length;i++){
			for(var j=0;j<rule_list[r_key[i]].length;j++){
				kappa_code+="#"+r_key[i]+":"+layerG.nodes[layerG.nodesHash[r_key[i]]].label.join(",")+"_"+j+"\n"+rule_list[r_key[i]][j].txt+"\n";
			}
		}
		//var
		var initial_val="";
		var observer="";
		var select_act=svg.selectAll("g").filter(".selected").filter(".action").data();
		var select_ag=svg.selectAll("g").filter(".selected").filter(".agent").data();
		for(var i=0;i<select_act.length;i++){
			for(var j=0;j<rule_list[select_act[i].id].length;j++){
			observer+="%obs: '"+select_act[i].id+"_"+j+"' |";
			var side_r=rule_list[select_act[i].id][j].right;
			observer+=fullName(side_r[0].a)+"("+fullName(side_r[0].e);
			if(typeof(side_r[0].v)!="undefined" && side_r[0].v!=null)
				observer+="~"+side_r[0].v;
			if(typeof(side_r[0].s)!="undefined" && side_r[0].s!=null)
				observer+="!"+side_r[0].s;
			observer+=")";
			observer+="|\n";
			}
		}for(var i=0;i<select_ag.length;i++){
			observer+="%obs: '"+select_ag[i].id+"' |"+fullName(select_ag[i].id)+"() |\n";
		}
		//init
		var quantities="";
		var tkey=Object.keys(ag_name_var_l);
		for(var k=0;k<tkey.length;k++){
			for(var i=0;i<ag_name_var_l[tkey[k]].length;i++){
				quantities+="%init: 'qtt_"+k+""+i+"' "+ag_name_var_l[tkey[k]][i]+")\n";
				initial_val+="%var: 'qtt_"+k+""+i+"' "+prompt("Please enter "+ag_name_var_l[tkey[k]][i]+") quantity", "1000")+"\n";
			}
		}
		kappa_code+="#### Variables\n";
		kappa_code+=initial_val;
		kappa_code+=observer;
		kappa_code+="#### Initial conditions\n";
		kappa_code+=quantities;
		var url = "http://dev.executableknowledge.org/try/index.html?&nb_events=1000&plot_points=1000&time_limit=2.0&model_text=" + encodeURIComponent(kappa_code);
		window.open(url, '_blank');
		window.focus();
		
	}
	var genAction = function(node,rule_list){// generate a liste of rule from an action
		if(checkExist(rule_list[node.id])) return;
		var splitted_ctx=splitCtx(node);
		var cannonical_action=[];
		var rules=[];
		if(splitted_ctx.left.length==0){//create a new rule for each combination of right node of the action
			for(var j=0;j<splitted_ctx.right.length;j++){
				if(splitted_ctx.right[j].v!=null && splitted_ctx.right[j].v.length>0 ){
					for(var k=0;k<splitted_ctx.right[j].v.length;k++)
						cannonical_action.push({left:null,right:{e:splitted_ctx.right[j].e,v:splitted_ctx.right[j].v[k]},ctx:splitted_ctx.ctx});
				}
				else
					cannonical_action.push({left:null,right:{e:splitted_ctx.right[j].e,v:null},ctx:splitted_ctx.ctx});
			}
		}
		else{//create a new rule for each combination of left and right node of the action !!!!!!!!!!!! notice that a left context never has Value !
			for(var i=0;i<splitted_ctx.left.length;i++){//split action in atomic version
				for(var j=0;j<splitted_ctx.right.length;j++){
					if(splitted_ctx.right[j].v!=null && splitted_ctx.right[j].v.length>0){
						for(var k=0;k<splitted_ctx.right[j].v.length;k++)
							cannonical_action.push({left:{e:splitted_ctx.left[i].e,v:null},right:{e:splitted_ctx.right[j].e,v:splitted_ctx.right[j].v[k]},ctx:splitted_ctx.ctx});
					}
					else
						cannonical_action.push({left:{e:splitted_ctx.left[i].e,v:null},right:{e:splitted_ctx.right[j].e,v:null},ctx:splitted_ctx.ctx});
				}
			}
		}
//now there is a rule for each couple of left/right side branch
		//we need to split cannonical_action ctx over each variation !
		var new_cannonical=[];
		for(var i=0;i<cannonical_action.length;i++){//for each cannonical action
			if(cannonical_action[i].ctx!=null && cannonical_action[i].ctx.length>0){//if this action have a context
				var multi_ctx=[{left:cannonical_action[i].left,right:cannonical_action[i].right,ctx:cannonical_action[i].ctx.concat()}];//create at least one copy of this action
				for(var j=0;j<cannonical_action[i].ctx.length;j++){//parcous the action context to find elements with multiples values
					if(cannonical_action[i].ctx[j].v!=null && cannonical_action[i].ctx[j].v.length>0){//if multiples values or at least one.
						var tmp_mult_ctx=[];//create an accumulator for the future actions
						for(var k=0;k<cannonical_action[i].ctx[j].v.length;k++){//for each value of this context
							var multiply=[];//create a copy of the multi_ctx
							for(var l=0;l<multi_ctx.length;l++){
								var cp_ctx=[];
								for(var tg=0;tg<multi_ctx[l].ctx.length;tg++){
									if(Array.isArray(multi_ctx[l].ctx[tg].v))
										cp_ctx.push({e:multi_ctx[l].ctx[tg].e,v:multi_ctx[l].ctx[tg].v.concat()});
									else
										cp_ctx.push({e:multi_ctx[l].ctx[tg].e,v:multi_ctx[l].ctx[tg].v});
								}
								multiply.push({left:multi_ctx[l].left,right:multi_ctx[l].right,ctx:cp_ctx});
							}
							for(var mc=0;mc<multiply.length;mc++){
								multiply[mc].ctx[j].v=cannonical_action[i].ctx[j].v[k];
								tmp_mult_ctx.push(multiply[mc]);
							}
						}
						multi_ctx=tmp_mult_ctx;
					}
				}
				for(var j=0;j<multi_ctx.length;j++)
					new_cannonical.push(multi_ctx[j]);
			}
			else new_cannonical.push(cannonical_action[i]);	
		}
		cannonical_action=new_cannonical;//the new canonical action is the atomic version of each action !		
		// translation into a correct rule format !
		rule_list[node.id]=[];
		for(var i=0;i<cannonical_action.length;i++){
			to_rule(cannonical_action[i],node,rule_list);
		}
	}	
	var to_rule = function(c_act,node,rule_list){
		var s_rule=ruleOf(node.classes,c_act.left,c_act.right);	
		s_rule={l:shrinkElList(s_rule.l),r:shrinkElList(s_rule.r)};	
		var tmp_ctx=[];//transformed context
		for(var i=0;i<c_act.ctx.length;i++){//for each element
			if(layerG.nodes[layerG.nodesHash[c_act.ctx[i].e]].classes[0]=="action" && layerG.nodes[layerG.nodesHash[c_act.ctx[i].e]].classes[1]!="binder"){
				if(!checkExist(rule_list[c_act.ctx[i].e])){
					 genAction(layerG.nodes[layerG.nodesHash[c_act.ctx[i].e]],rule_list);
				}
				var accu=[];//context accumulator
				for(var k=0;k<rule_list[c_act.ctx[i].e].length;k++){//pour chaque regle de l'action, créé une variation du context
					var expl_ctx=[];
					if(tmp_ctx.length==0){
						var tmp_clone=[];
						for(var rr=0;rr<rule_list[c_act.ctx[i].e][k].right.length;rr++){
							tmp_clone.push(rule_list[c_act.ctx[i].e][k].right[rr]);
						}
						expl_ctx.push(tmp_clone);
					}else{
						for(var j=0;j<tmp_ctx.length;j++){
							var tmp_clone=cloneEl_l(tmp_ctx[j]);
							for(var rr=0;rr<rule_list[c_act.ctx[i].e][k].right.length;rr++){
								tmp_clone.push(rule_list[c_act.ctx[i].e][k].right[rr]);
							}
							expl_ctx.push(tmp_clone);
						}
					}
					//create a copy of the context with the content of the right member of the action
					for(var j=0;j<expl_ctx.length;j++){
						accu.push(expl_ctx[j]);
					}
				}
				tmp_ctx=accu;
			}
			else{//sinon ajoute cette variable à tous les contextes
				if(tmp_ctx.length==0)tmp_ctx.push([]);//pour le premier element du context : lui donne une liste vide
				for(var j=0;j<tmp_ctx.length;j++)
					tmp_ctx[j].push(shrinkEl(c_act.ctx[i]));
			}
		}
		//here the context is demultiplied with all the possible variation due to action in context
		if(!checkExist(rule_list[node.id]))
			rule_list[node.id]=[];
		if(tmp_ctx.length>0){
			for(var i=0;i<tmp_ctx.length;i++){//for each posible context : create a version of rule
				rule_list[node.id].push({txt:rToText(node,s_rule,tmp_ctx[i]),right:crush(s_rule.r,node)});
			}
		}else rule_list[node.id].push({txt:rToText(node,s_rule,[]),right:crush(s_rule.r,node)});	
	}
	var crush = function(r,node){//convert bind a(x!1), b(x!1) to a(x!x.b)
		if(node.classes[1]=="bnd" ){
			var tmp_res={a:r[0].a,e:r[0].e,s:fullName(r[1].e)+"."+fullName(r[1].a),v:null};
			return [tmp_res];
		}else return r;
	}
	var rToText = function(node,rule,ctx){ 
	console.log("rto toext");
	console.log(node);
	console.log(rule);
	console.log(ctx);
	console.log("-------------");
		var tmp_l_ctx;
		var tmp_r_ctx;
		if(node.classes[1]=="syn"){
			tmp_l_ctx=ctx.concat().filter(function(e){return e.a!=rule.r[0].a});
			tmp_r_ctx=ctx;
		}
		else if(node.classes[1]=="deg"){
			tmp_l_ctx=ctx;
			tmp_r_ctx=ctx.concat().filter(function(e){return e.a!=rule.l[0].a});
		}else{
			tmp_l_ctx=ctx;
			tmp_r_ctx=ctx;
		}
			
		
		var ret="";
		ret+=sToText(node,rule.l,tmp_l_ctx);
		ret+=" -> ";
		ret+=sToText(node,rule.r,tmp_r_ctx);
		var rate="";
		for(var i=0;i<node.sons.length;i++){
			if(layerG.nodes[layerG.nodesHash[node.sons[i]]].classes[0]=="attribute" && layerG.nodes[layerG.nodesHash[node.sons[i]]].label[0]=="rate")
				rate=layerG.nodes[layerG.nodesHash[node.sons[i]]].context[0];
		}
		if(rate=="") rate=prompt("please define the rate for action "+node.id+":"+node.label.join(","),"1");
		ret+=" @ "+rate;
		return ret;
	}
	var sToText = function(node,side,ctx){
		var ret="";
		var st=[];
		for(var i=0;i<side.length;i++){//put agents
			var tmp_v =[];
			var tmp_s=null;
			if(typeof(side[i].v)!="undefined" && side[i].v!=null)//if this site has state, give him
				tmp_v.push(side[i].v);
			if(typeof(side[i].s)!="undefined" && side[i].s!=null)//if this site has binding, give him
				tmp_s=side[i].s;
			var s_l={};
			if(side[i].e!=null)
				s_l[side[i].e]={s:tmp_s,v:tmp_v};
			st.push({a:side[i].a,site:s_l});					
		}
		/************************************/
		/************************************/
		for(var i=0;i<ctx.length;i++){//add inexistent element from context to the rule
			var exist=false;
			for(var j=0;j<st.length;j++){
				var gmn=null;
				if(typeof(ctx[i].s)!="undefined") gmn=getBackMyName(ctx[i].s);
				exist= exist || st[j].a == ctx[i].a || (gmn!=null && gmn[0]==st[j].a);
				if(st[j].a != ctx[i].a && gmn!=null && gmn[0]==st[j].a){
					var new_ct=fullName(ctx[i].e)+"."+fullName(ctx[i].a);
					ctx[i].a=gmn[0];
					ctx[i].e=gmn[1];
					ctx[i].s=new_ct;
				}
			}
			if(!exist){
				var tmp_v =[];
				var tmp_s=null;
				if(typeof(ctx[i].v)!="undefined" && ctx[i].v!=null)//if this site has state, give him
					tmp_v.push(ctx[i].v);
				if(typeof(ctx[i].s)!="undefined" && ctx[i].s!=null)//if this site has binding, give him
					tmp_s=ctx[i].s;
				var s_l={};
				s_l[ctx[i].e]={s:tmp_s,v:tmp_v};
				st.push({a:ctx[i].a,site:s_l});
			}
		}
		for(var i=0;i<ctx.length;i++){
			for(var j=0;j<st.length;j++){
				if(st[j].a == ctx[i].a){
					if(typeof(st[j].site[ctx[i].e])=='undefined' || st[j].site[ctx[i].e]==null){
						var tmp_v =[];
						var tmp_s=null;
						if(typeof(ctx[i].v)!="undefined" && ctx[i].v!=null)//if this site has state, give him
							tmp_v.push(ctx[i].v);
						if(typeof(ctx[i].s)!="undefined" && ctx[i].s!=null){//if this site has binding, give him
							tmp_s=ctx[i].s;
						}
						st[j].site[ctx[i].e]={s:tmp_s,v:tmp_v};
					}else{
						var tmp_v =[];
						var tmp_s=null;
						if(typeof(ctx[i].v)!="undefined" && ctx[i].v!=null)//if this site has state, give him
							tmp_v.push(ctx[i].v);
						if(typeof(ctx[i].s)!="undefined" && ctx[i].s!=null)//if this site has binding, give him
							tmp_s=ctx[i].s;
						if(typeof(st[j].site[ctx[i].e].s)!="undefined" && st[j].site[ctx[i].e].s!=null && tmp_s!=null) console.log("this site already have a Binding !!!");
						else if(typeof(st[j].site[ctx[i].e].s)=="undefined" || st[j].site[ctx[i].e].s==null)
							st[j].site[ctx[i].e].s=tmp_s;
						if(checkExist(st[j].site[ctx[i].e].v) && tmp_v.length>0) console.log("this site already have a value ! !!!");
						else if(!checkExist(st[j].site[ctx[i].e].v))
							st[j].site[ctx[i].e].v=tmp_v;
					}
				}
			}
		}
		//add the text version of the rule !
		for(var i=0;i<st.length;i++){
			
			ret+=fullName(st[i].a)+"(";
			var site_l=Object.keys(st[i].site);
			for(var j=0;j<site_l.length;j++){
				ret+=fullName(site_l[j]);
				if(st[i].site[site_l[j]].v.length>0){
					ret+="~";
					ret+=st[i].site[site_l[j]].v.join("~");
				}if(st[i].site[site_l[j]].s!=null){
					ret+="!"+st[i].site[site_l[j]].s;
				}
				if(j<site_l.length-1) ret+=",";
			}
			ret+=")";
			if(i<st.length-1) ret+=",";
		}
		return ret;
	}
	var getBackMyName = function(state){
		if (state==null) return null;
		var tab=state.split(".");
		if(tab.length<2) return null;
		var site_n=tab[0].split("_");
		var ag_n=tab[1].split("_");
		return [ag_n[0],site_n[0]];
	}
	var fullName = function(id){
		console.log("the id "+id);
		if(id==null) return "";
		var tmp_node=layerG.nodes[layerG.nodesHash[id]];
		return tmp_node.id+"_"+tmp_node.label.join("_");
	}
	var cloneEl_l = function(el_l){
		var ret=[];
		for(var i=0;i<el_l.length;i++){
			ret.push({a:el_l[i].a,e:el_l[i].e,v:el_l[i].v,s:el_l[i].s});
		}
		return ret;
	}
	var shrinkElList = function(el_list){
		var list=[];
		for(var i=0;i<el_list.length;i++){
			list.push(shrinkEl(el_list[i]));
		}return list;
	}
	var shrinkEl = function(el){
		var tmp_node=layerG.nodes[layerG.nodesHash[el.e]];
		var tmp_root=getRoot(tmp_node,layerG);
		if(tmp_node.classes[0]=="flag" || tmp_node.classes[0]=="attribute"){
			tmp_node=layerG.nodes[layerG.nodesHash[tmp_node.father]];
		}
		if(tmp_root.id==tmp_node.id){
			return {a:tmp_root.id,e:null,v:el.v,s:el.s};
		}
		return{a:tmp_root.id,e:tmp_node.id,v:el.v,s:el.s};
	}
	var ruleOf = function(n_class,left,right){//translate a left/right handside action to a rule without context
		switch(n_class[1]){
			case "bnd":
				binder_count++;
				return {l:[left,right],r:[{e:left.e,v:null,s:binder_count},{e:right.e,v:null,s:binder_count}]};
			case "brk":
				return {l:[{e:left.e,v:null,s:binder_count},{e:right.e,v:null,s:binder_count}],r:[left,right]};
			case "syn":
				return {l:[],r:[right]};
			case "deg":
				return {l:[right],r:[]};
			case "mod":
				var el_values = layerG.nodes[layerG.nodesHash[right.e]].context;
				var v_idx = el_values.indexOf(right.v);
				if(v_idx==-1) console.log("incorrect value");
				if(n_class[2]=="pos")
					return {l:[right],r:[{e:right.e,v:el_values[v_idx+1]}]};
				else
					return {l:[right],r:[{e:right.e,v:el_values[v_idx-1]}]};
		}
	}
	var splitCtx = function(d){//get an action, return a {left,right,ctx} object corresponding to the element branched to the action and the context left/right/ctx are list of elements {e,v,s} where e is the element id, v a list of its values and s its state
		var left_side=null;
		var right_side=null;
		var ret={left:[],right:[],ctx:[]};
		var l_bind=svg.selectAll(".binder").filter(function(d1){return d1.classes[2]=="left" && d1.father==d.id});//getting left and right edges link to the action.
		if(!l_bind.empty()) left_side=svg.selectAll(".links").filter(function(d1){return d1.sourceID==l_bind.datum().id || d1.targetID==l_bind.datum().id}).data();
		var r_bind=svg.selectAll(".binder").filter(function(d1){return d1.classes[2]=="right" && d1.father==d.id});
		if(!r_bind.empty()) right_side=svg.selectAll(".links").filter(function(d1){return d1.sourceID==r_bind.datum().id || d1.targetID==r_bind.datum().id}).data();
		for(var c=0;c<d.context.length;c++){
			var nop=false;
			if(left_side!=null){
				for(var i=0;i<left_side.length;i++){
					if(left_side[i].sourceID==d.context[c] || left_side[i].targetID==d.context[c] ){
						nop=true;
						
						if(d.valued_context!=null && checkExist(d.valued_context[d.context[c]])) ret.left.push({e:d.context[c],v:d.valued_context[d.context[c]]});
						else  ret.left.push({e:d.context[c],v:null});

					}
				}
			}
			if(right_side!=null){
				for(var i=0;i<right_side.length;i++){
					if(right_side[i].sourceID==d.context[c] || right_side[i].targetID==d.context[c]){
						nop=true;
						
						if(d.valued_context!=null && checkExist(d.valued_context[d.context[c]])) ret.right.push({e:d.context[c],v:d.valued_context[d.context[c]]});
						else ret.right.push({e:d.context[c],v:null});

					}
				}
			}
			if(!nop){
			
				if(d.valued_context!=null && checkExist(d.valued_context[d.context[c]])) ret.ctx.push({e:d.context[c],v:d.valued_context[d.context[c]]});
				else ret.ctx.push({e:d.context[c],v:null});
			}
		}
		return ret;
	}
	//get a list of initial value for input,a list of label for radio and a list of label for checkbox, and the label of the menu also take the the presence of ok and cancel button
	//take the coordinate of the box, its side and 
var inputMenu = function(label,input_l,radio_l,check_l,ok,cancel,pos,callback,d){
	//d3.event.stopPropagation();
	//d3.event.preventDefault();
		var fo=svg.append("foreignObject")
							.attr("width", 100);
    var form=fo.append("xhtml:form")
    					 .attr("width",100)
               .attr("id","_inputform")
    form.classed("inputMenu",true);
		if(label!=null && label!=""){
    	form.append("label").text(label);
    }
    if(input_l!=null){
    	for(var i=0;i<input_l.length;i++) {
			var inp=form.append("input").attr("value", input_l[i]).attr("width", 90).classed("inputMenus", true);
			if(input_l.length==1){
				inp.on("focus",function(){
					inp.on("keypress", function() {
						var e = d3.event;
						if (e.keyCode == 13) {
							d3.event.stopPropagation();
							d3.event.preventDefault();
							var textv,radiov,checkv;
							textv=[];
							if(input_l)
								form.selectAll(".inputMenus").each(function(){textv.push(d3.select(this).node().value);});
							if(radio_l)
								radiov=[radio_l[form.select('input[name="inputMenuRadio"]:checked').node().value]];
							if(check_l){
								checkv=[];
								form.selectAll('input[name="inputMenuCheck"]:checked').each(function(){checkv.push(check_l[d3.select(this).property("value")]);});
							}
							fo.remove();
							return callback({line:textv,radio:radiov,check:checkv});
						}
					});
				});
				inp.on("blur",function(){inp.on("keypress",null);});
			}
		}
    }
    if(radio_l!=null){
    	for(var i=0;i<radio_l.length;i++){
      	form.append("input")
   		  	.attr({
        		type: "radio",
        		class: "inputMenur",
        		name: "inputMenuRadio",
        		value: i
    }).property("checked", i==0);
    		form.append("label").text(" "+radio_l[i]);
        form.append("html","<br />");
      }
    }if(check_l!=null){
    	for(var i=0;i<check_l.length;i++){
      form.append("input")
   		  	.attr({
        		type: "checkbox",
        		class: "inputMenuc",
        		name: "inputMenuCheck",
        		value: i
    }).property("checked", i==0);
    		form.append("label").text(" "+check_l[i]);
        form.append("html","<br />");
      }	
    }if(ok){
    	form.append("input")
      		.attr({
          	type:"button",
            class:"inputMenu",
            id:"inputMenuOk",
            value:"Ok"
          }).on('click',function(){
			d3.event.stopPropagation();
			d3.event.preventDefault();
          var textv,radiov,checkv;
          textv=[];
		  if(input_l)
          form.selectAll(".inputMenus").each(function(){textv.push(d3.select(this).node().value);});
		  if(radio_l)
          radiov=[radio_l[form.select('input[name="inputMenuRadio"]:checked').node().value]];
          if(check_l){
		  checkv=[];
          form.selectAll('input[name="inputMenuCheck"]:checked').each(function(){checkv.push(check_l[d3.select(this).property("value")]);});
		  }
          fo.remove();
          return callback({line:textv,radio:radiov,check:checkv});
          });
    }if(cancel){
    	form.append("input")
      		.attr({
          	type:"button",
            class:"inputMenu",
            id:"inputMenuCL",
            value:"Cancel"
          }).on('click',function(){
          	fo.remove();
          	//svg.select("foreignObject").remove();
            return callback({});
          });
    }
    var foHeight = document.getElementById("_inputform").getBoundingClientRect().height;

    fo.attr({
        'height': foHeight,
        'x': function(){if(pos=="left") return d.x-d.r-100; else if(pos=="right") return d.x+d.r; else return d.x-50},
        'y': function(){if(pos=='top') return d.y-foHeight-d.r; else if(pos=="bot") return d.y+d.r;else return d.y-foHeight/2}
       });
/*d3.select(svg).insert('polygon', '.inputMenu').attr({
'points': "0,0 0," + foHeight + " 100," + foHeight + " 100,0 0,0 0,0 0,0",
              'height': foHeight,
              'width': 100,
              'fill': '#D8D8D8', 
              'opacity': 0.75,
              'transform': 'translate(' + (d.x) + ',' + (d.y) + ')'
                        });*/
}                




	
};

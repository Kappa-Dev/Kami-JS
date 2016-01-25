//GraphicGraph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
//graphical graph version
function GraphicGraph(containerid){//define a graphical graph with svg objects
	var containerID=containerid;
	var layerG;//the layered graph data structure
	var width;
	var	height;//menu is 30px heigth
	var svg; 
	var drag;
	var dynG;//the force layout graph for this graphical graph
	var s_node,s_action,s_link,s_binder;//graphical object for node,action,link and binders
	var node_count=0;
	var first_init;
	this.wakeUp = function wakeUp(){//speed up tick function
		//first_init=true;
		for(var i=0;i<300;i++){
			dynG.getForce().tick();
		}
	}
	this.init = function init(){//init the graphic graph
		first_init=false;
		layerG=new LayeredGraph();//the layered graph data structure
		width=document.getElementById(containerID).getBoundingClientRect().width;
		height =document.getElementById(containerID).getBoundingClientRect().height-30;//menu is 30px heigth
		svg=d3.select("#"+containerID).append("svg:svg")
			.attr("width",width)
			.attr("height",height);
		dynG=new DynamicGraph(layerG,height,width);
		dynG.init();
		drag=dynG.getForce().drag()
						.on("dragstart", dragstart);
		dynG.getForce().on("tick",tick)
						.start();
	};
	var update = function(){//update all the LCG elements
		//links svg representation
		s_link = svg.selectAll(".link")
			.data(layerG.links, function(d) { return d.source.id + "-" + d.target.id; });
        s_link.enter().insert("line","g")
            .classed("link",function(d){return d.e_class=="link"})
			.classed("parent",function(d){return d.e_class=="parent"});
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
            .call(drag);
		nodeEnter.insert("circle")
			.attr("r", function(d){return d.toInt()});
		nodeEnter.insert("text")
			.classed("nodeLabel",true)
			.attr("x", 0)
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id})
			.attr("font-size", function(d){if(d.classes[0]!="action")return (d.toInt()/2)+"px"; else (d.toInt()/3)+"px";});
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
            .call(drag);
		actionEnter.insert("rect")
			.attr("width", function(d){return d.toInt()})
			.attr("height", function(d){return d.toInt()/2});
		actionEnter.insert("text")
			.classed("nodeLabel",true)
			.attr("x", function(d){return d.toInt()/2;})
			.attr("dy", function(d){return d.toInt()/4;})
			.attr("text-anchor", "middle")
			.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id})
			.attr("font-size", function(d){if(d.classes[0]!="action")return (d.toInt()/2)+"px"; else (d.toInt()/3)+"px";});
		s_action.exit().remove();
		s_binder = svg.selectAll("circle.binder")
			.data(function(){return layerG.nodes.filter(function(d){return d.classes[0]=="action" && d.classes[1]=="binder"})}, function(d) { return d.id;});
		var binderEnter = s_binder.enter().insert("circle")
			.classed("binder",true)
			.attr("r", function(d){return d.toInt()});
		s_binder.exit().remove();
		dynG.getForce().start();	
	};
	var tick = function(){//show up new svg element only if there position datas have been computed
		if(first_init || dynG.getForce().alpha()<=0.00501){
			//dynG.getForce().stop();
			//if(first_init)update();
			//console.log(dynG.getForce().alpha());
			//console.log("width : "+width+" height : "+height);
			s_link.attr("x1", function(d){return getNodeX(d.source);})
				.attr("y1", function(d){return getNodeY(d.source);})
				.attr("x2", function(d){return getNodeX(d.target);})
				.attr("y2", function(d){return getNodeY(d.target);});
			s_node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			s_action.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			s_binder.attr("cx",function(d) {return getNodeX(d);})
				.attr("cy",function(d) {return getNodeY(d);});
			if(first_init)
				d3.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=true;});
			first_init=true;
		}
	};
	var getNodeX = function(node){
		//console.log(node);
		if(node.classes[0]=="action" && node.classes[1]=="binder"){
			if(node.classes[2]=="left")
				return layerG.nodes[layerG.nodesHash[node.father]].x;
			else if(node.classes[2]=="right")
				return layerG.nodes[layerG.nodesHash[node.father]].x+layerG.nodes[layerG.nodesHash[node.father]].toInt();
		}else{ 
			return node.x;
		}
	};
	var getNodeY = function(node){
		//console.log(node);
		if(node.classes[0]=="action" && node.classes[1]=="binder")
			return layerG.nodes[layerG.nodesHash[node.father]].y+layerG.nodes[layerG.nodesHash[node.father]].toInt()/4;
		else
			return node.y;
	};
	this.getSvg = function getSvg(){//return the svg
		return svg;
	};
	this.addNode = function addNode(classes,label,path,x,y){//add a new node in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.addNode(classes,"n"+node_count,x,y,(typeof(x)!='undefined' && typeof(y)!='undefined'));
		layerG.addLabel("n"+node_count,label);
		for(var i=path.length-1;i>0;i--){
			if(typeof(layerG.nodesHash[path[i]])=='undefined'){
				console.log("undefined path : "+path[i]+"for n"+node_count);
				return;
			}if(layerG.nodes[layerG.nodesHash[path[i]]].father==null || layerG.nodes[layerG.nodesHash[path[i]]].father!=path[i-1]){
				console.log("incorrect path !");
				console.log(path);
				return;
			}				
		}if(path.length>0)
			layerG.setFather("n"+node_count,path[path.length-1]);
		node_count++;
		update();
		//dynG.getForce().on("tick",tick);
		//dynG.getForce().start();	
	};
	this.mergeNode = function mergeNode(new_nodeID,old_nodeID){//mergeDIFF both 
		dynG.getForce().stop();
		if(layerG.nodes[layerG.nodesHash[new_nodeID]].classes.join('_') == layerG.nodes[layerG.nodesHash[old_nodeID]].classes.join('_') /*&& layerG.getPath(new_nodeID).join('_') == layerG.getPath(old_nodeID).join('_')*/)
			layerG.mergeDiff(new_nodeID,old_nodeID);
		else{
			console.log("unable to merge too different nodes : ");
			console.log(layerG.nodes[layerG.nodesHash[new_nodeID]]);
			console.log(layerG.nodes[layerG.nodesHash[old_nodeID]]);
		}
		update();	
	};
	this.removeNode = function removeNode(nID){//remove a node from the svg AND the graph structure
		dynG.getForce().stop();
		layerG.removeNode(nID);
		update();			
	};
	this.addEdge = function addEdge(id1,id2){//add a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.addEdge(id1,id2);
		update();	
	};
	this.removeEdge = function removeEdge(id1,id2){//remove a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.removeEdge(id1,id2);
		update();		
	};
	this.addParent = function addParent(son,fath){//add a PARENT edge between two node in the graph structure and un the svg and update graph structure
		dynG.getForce().stop();
		layerG.setFather(son,fath);
		update();	
	};
	this.rmParent = function rmParent(son){//idem for removing parenting
		dynG.getForce().stop();
		layerG.removeParenting(son);
		update();	
	};
	this.addCtx = function addCtx(id,ctx){//add a context to a specific node
		dynG.getForce().stop();
		layerG.addCtx(id,ctx);
		update();	
	};
	this.rmCtx = function rmCtx(id,ctx){//remove a context from a specific node
		dynG.getForce().stop();
		layerG.rmCtx(id,ctx);
		update();	
	};
	this.getCtx = function getCtx(id){//get a specific node label
		return layerG.nodes[layerG.nodeHash[id]].context.concat();
	};
	this.addLabel = function addLabel(id,lbl){//add a label to a specific node
		dynG.getForce().stop();
		layerG.addLabel(id,lbl);
		update();	
	};
	this.rmLabel = function rmLabel(id,lbl){//remove a label from a specific node
		dynG.getForce().stop();
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
	this.getCoord = function getCoord(){
		layerG.log();
		var ret=[];
		for(var i=0;i<layerG.nodes.length;i++){
			ret.push({x:layerG.nodes[i].x,y:layerG.nodes[i].y});
		}
		return ret;	
	};
};

//example
/*
var gGraph = new GraphicGraph('graph');
window.onload = function () { 
	gGraph.init();
	gGraph.addNode(["agent"],["ag1"],[]);
	gGraph.addNode(["agent"],["ag2"],[]);
	gGraph.addNode(["agent"],["ag3"],[]);
	gGraph.addNode(["region"],["reg1"],["n0"]);
	gGraph.addNode(["region"],["reg2"],["n1"]);
	gGraph.addNode(["key_res"],["kr1"],["n0"]);
	gGraph.addNode(["key_res"],["kr2"],["n1"]);
	gGraph.addNode(["attribute"],["att1"],["n0"]);
	gGraph.addNode(["attribute"],["att2"],["n1","n4"]);
	gGraph.addNode(["flag"],["fl1"],["n0"]);
	gGraph.addNode(["flag"],["fl2"],["n1","n6"]);
	gGraph.addNode(["flag"],["fl3"],["n1"]);
	gGraph.addNode(["flag"],["fl4"],["n2"]);
	gGraph.addNode(["action","bnd"],["bind1"],[]);
	gGraph.addNode(["action","brk"],["bind2"],[]);
	gGraph.addNode(["action","binder","left"],[],["n13"]);
	gGraph.addNode(["action","binder","right"],[],["n13"]);
	gGraph.addNode(["action","binder","left"],[],["n14"]);
	gGraph.addNode(["action","binder","right"],[],["n14"]);
	gGraph.addEdge("n3","n15");
	gGraph.addEdge("n4","n16");
	gGraph.addEdge("n2","n17");
	gGraph.addEdge("n4","n18");
	gGraph.wakeUp();
	console.log(gGraph.getCoord());
};*/
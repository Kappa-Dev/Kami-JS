//graphical graph version
function GraphicGraph(containerid){//define a graphical graph with svg objects
	var containerID=containerid;
	var layerG;//the layered graph data structure
	var width;
	var	height;//menu is 30px heigth
	var svg;
	var dynG;//the force layout graph for this graphical graph
	var s_node,s_action,s_link;//graphical object for node,action,link
	var node_count=0;
	this.init = function init(){//init the graphic graph
		layerG=new LayeredGraph();//the layered graph data structure
		width=document.getElementById(containerID).getBoundingClientRect().width;
		height =document.getElementById(containerID).getBoundingClientRect().height-30;//menu is 30px heigth
		svg=d3.select("#"+containerID).append("svg:svg")
			.attr("width",width)
			.attr("height",height);
		dynG=new DynamicGraph(layerG,height,width);
		dynG.init();
		dynG.getForce().on("tick",tick)
						.start();
	};
	var update = function(){//update all the LCG elements
		layerG.log();
		s_link = svg.selectAll(".link")
		.data(layerG.links, function(d) { return d.source.id + "-" + d.target.id; });
        s_link.enter().insert("line")
            .classed("link",function(d){return d.e_class=="link"});
        s_link.exit().remove();
		s_node = svg.selectAll("g.node")
			  .data(function(){return layerG.nodes.filter(function(d){return d.classes[0]!="action"})}, function(d) { return d.id;});
		s_action = svg.selectAll("g.node")
			  .data(function(){return layerG.nodes.filter(function(d){return d.classes[0]=="action"})}, function(d) { return d.id;});
		var nodeEnter = s_node.enter().append("g")
            .classed("node",true)
		nodeEnter.append("circle")
		.classed("node",true)
		.classed("agent",function(d){return d.classes[0]=="agent"})
		.classed("key_res",function(d){return d.classes[0]=="key_r"})
		.classed("attribute",function(d){return d.classes[0]=="attr"})
		.classed("flag",function(d){return d.classes[0]=="flag"})
		.classed("region",function(d){return d.classes[0]=="region"})
		.classed("action",function(d){return d.classes[0]=="action"})
		.attr("r", function(d){
			switch (d.classes[0]){
			case "agent": return 50;
			case "region": return 35;
			case "key_r": return 20;
			case "attr":return 12;
			case "flag":return 12;
			case "action":return 40;
			default: return 20;
			}})
		nodeEnter.append("text")
			.classed("nodeLabel",true)
			.attr("x", 0)
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function(d) {if(d.label.length>0) return d.label[0]; else return d.id});
		s_node.exit().remove();
		};
	var tick = function(){//show up new svg element only if there position datas have been computed
		//if(dynG.getForce().alpha()<=0.00501){
			//dynG.getForce().stop();
			//update();
			//console.log(dynG.getForce().alpha());
			//console.log("width : "+width+" height : "+height);
			s_link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			s_node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		//}
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
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();	
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
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();	
	};
	this.removeNode = function removeNode(nID){//remove a node from the svg AND the graph structure
		dynG.getForce().stop();
		layerG.removeNode(nID);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();			
	};
	this.addEdge = function addEdge(id1,id2){//add a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.addEdge(id1,id2);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();	
	};
	this.removeEdge = function removeEdge(id1,id2){//remove a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.removeEdge(id1,id2);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();	
	};
	this.addParent = function addParent(son,fath){//add a PARENT edge between two node in the graph structure and un the svg and update graph structure
		dynG.getForce().stop();
		layerG.setFather(son,fath);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();
	};
	this.rmParent = function rmParent(son){//idem for removing parenting
		dynG.getForce().stop();
		layerG.removeParenting(son);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();
	};
	this.addCtx = function addCtx(id,ctx){//add a context to a specific node
		dynG.getForce().stop();
		layerG.addCtx(id,ctx);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();
	};
	this.rmCtx = function rmCtx(id,ctx){//remove a context from a specific node
		dynG.getForce().stop();
		layerG.rmCtx(id,ctx);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();
	};
	this.addLabel = function addLabel(id,lbl){//add a label to a specific node
		dynG.getForce().stop();
		layerG.addLabel(id,lbl);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();
	};
	this.rmLabel = function rmLabel(id,lbl){//remove a label from a specific node
		dynG.getForce().stop();
		layerG.rmLabel(id,lbl);
		dynG.getForce().on("tick",tick);
		dynG.getForce().start();
	};
};

var gGraph = new GraphicGraph('graph');
window.onload = function () { 
	gGraph.init();
	gGraph.addNode(["agent"],["toto"],[]);
	gGraph.addNode(["region"],["toto"],["n0"]);
	gGraph.addNode(["agent"],["titi"],[]);
};

//GraphicGraph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
//graphical graph version
function GraphicGraph(containerid){//define a graphical graph with svg objects
	var rewriter=[];
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
	var nugget_add,edition,kr_show,lcg_view,kappa_view;
	var self=this;
	this.wakeUp = function wakeUp(){//speed up tick function
		//first_init=true;
		for(var i=0;i<300;i++){
			dynG.getForce().tick();
		}
	};
	this.log = function log(){
		layerG.log();
	};
	this.init = function init(){//init the graphic graph
		nugget_add=false;
		edition=false;
		kr_show=true;
		lcg_view=false;
		kappa_view=false;
		first_init=false;
		layerG=new LayeredGraph();//the layered graph data structure
		width=document.getElementById(containerID).getBoundingClientRect().width;
		height =document.getElementById(containerID).getBoundingClientRect().height-30;//menu is 30px heigth
		svg=d3.select("#"+containerID).append("svg:svg")
			.attr("width",width)
			.attr("height",height)
			.on("contextmenu",d3.contextMenu(function(){return svgMenu();}));
		dynG=new DynamicGraph(layerG,height,width);
		dynG.init();
		drag=dynG.getForce().drag()
						.on("dragstart", dragstart);
		dynG.getForce().on("tick",tick)
						.start();
		d3.select("#"+containerID).append("div")
			.classed("n_tooltip",true)
			.style("visibility","hidden")
	};
	var update = function(){//update all the LCG elements
		//links svg representation
		s_link = svg.selectAll(".link")
			.data(layerG.links, function(d) { return d.source.id + "-" + d.target.id; });
        s_link.enter().insert("line","g")
			.classed("link",true)
            .classed("links",function(d){return d.e_class=="link"})
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
            .call(drag)
			.on("mouseover",mouseOver)
			.on("mouseout",mouseOut)
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
			.attr("font-size", function(d){if(d.classes[0]!="action")return (d.toInt()/2)+"px"; else (d.toInt()/3)+"px";})
			.on("dblclick",clickText);
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
	var getNodeX = function(node){//return the x position on a specific node
		//console.log(node);
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
		//console.log(node);
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
			/*stacking modifications */
			for(var i=0;i<layerG.links.length;i++){
				if(links[i].sourceID==new_nodeID || links[i].sourceID==old_nodeID || links[i].targetID==new_nodeID || links[i].targetID==old_nodeID)
					stack(layerG,layerG.addEdge,[links[i].sourceID,links[i].targetID]);//add all the links
			}for(var i=0;i<layerG.nodes[new_nodeID].sons.length;i++)
				stack(layerG,layerG.setFather,[layerG.nodes[new_nodeID].sons[i],new_nodeID]);//add all the sons
			for(var i=0;i<layerG.nodes[old_nodeID].sons.length;i++)
				stack(layerG,layerG.setFather,[layerG.nodes[old_nodeID].sons[i],old_nodeID]);
			stack(layerG,layerG.setFather,[new_nodeID,layerG.nodes[new_nodeID].father]);//put fathers
			stack(layerG,layerG.setFather,[old_nodeID,layerG.nodes[old_nodeID].father]);
			stack(layerG,layerG.addLabel,[old_nodeID,layerG.nodes[old_nodeID].label.concat()]);//put label and context
			stack(layerG,layerG.addCtx,[old_nodeID,layerG.nodes[old_nodeID].context.concat()]);
			stack(layerG,layerG.addLabel,[new_nodeID,layerG.nodes[new_nodeID].label.concat()]);
			stack(layerG,layerG.addCtx,[new_nodeID,layerG.nodes[new_nodeID].context.concat()]);
			stack(layerG,layerG.addNode,[layerG.nodes[new_nodeID].classes,new_nodeID]);//add the old and new nodes
			stack(layerG,layerG.addNode,[layerG.nodes[old_nodeID].classes,old_nodeID]);
			stack(layerG,layerG.removeNode,[old_nodeID]);//remove the merged node
			/* end stack -> modification */
			layerG.mergeDiff(new_nodeID,old_nodeID);		
		}
		else{
			console.log("unable to merge too different nodes : ");
			console.log(layerG.nodes[layerG.nodesHash[new_nodeID]]);
			console.log(layerG.nodes[layerG.nodesHash[old_nodeID]]);
		}
		update();	
	};
	this.removeNode = function removeNode(nID){//remove a node from the svg AND the graph structure
		dynG.getForce().stop();
		for(var i=0;i<layerG.links.length;i++){
			if(links[i].sourceID==nID || links[i].targetID==nID)
				stack(layerG,layerG.addEdge,[links[i].sourceID,links[i].targetID]);//add all the links
		}for(var i=0;i<layerG.nodes[nID].sons.length;i++)
			stack(layerG,layerG.setFather,[layerG.nodes[nID].sons[i],nID]);//add all the sons
		stack(layerG,layerG.setFather,[nID,layerG.nodes[nID].father]);
		stack(layerG,layerG.addLabel,[nID,layerG.nodes[nID].label.concat()]);
		stack(layerG,layerG.addCtx,[nID,layerG.nodes[nID].context.concat()]);
		stack(layerG,layerG.addNode,[layerG.nodes[nID].classes,nID]);
		layerG.removeNode(nID);
		update();			
	};
	this.addEdge = function addEdge(id1,id2){//add a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		layerG.addEdge(id1,id2);
		stack(layerG,layerG.removeEdge,[id1,id2]);
		update();	
	};
	this.removeEdge = function removeEdge(id1,id2){//remove a LINK edge between two nodes in the svg AND in the graph structure
		dynG.getForce().stop();
		stack(layerG,layerG.addEdge,[id1,id2]);
		layerG.removeEdge(id1,id2);
		update();		
	};
	this.addParent = function addParent(son,fath){//add a PARENT edge between two node in the graph structure and un the svg and update graph structure
		dynG.getForce().stop();
		stack(layerG,layerG.removeParenting,[son]);
		layerG.setFather(son,fath);
		update();	
	};
	this.rmParent = function rmParent(son){//idem for removing parenting
		dynG.getForce().stop();
		stack(layerG,layerG.setFather,[son,layerG.nodes[son].father]);
		layerG.removeParenting(son);
		update();	
	};
	this.addCtx = function addCtx(id,ctx){//add a context to a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.rmCtx,[id,ctx]);
		layerG.addCtx(id,ctx);
		update();	
	};
	this.rmCtx = function rmCtx(id,ctx){//remove a context from a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.addCtx,[id,layerG.nodes[id].context.concat()]);
		layerG.rmCtx(id,ctx);
		update();	
	};
	this.getCtx = function getCtx(id){//get a specific node label
		return layerG.nodes[layerG.nodeHash[id]].context.concat();
	};
	this.addLabel = function addLabel(id,lbl){//add a label to a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.rmLabel,[id,lbl]);
		layerG.addLabel(id,lbl);
		update();	
	};
	this.rmLabel = function rmLabel(id,lbl){//remove a label from a specific node
		dynG.getForce().stop();
		stack(layerG,layerG.addLabel,[id,layerG.nodes[id].label.concat()]);
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
	var stack = function(obj,fun,param){
		rewriter.push({f:fun,o:obj,p:param});
	}
	this.unStack = function unStack(){
		//layerG.log();
		if(rewriter.length==0){
			console.log("stack empty");
			return;
		}
		fun=rewriter.pop();
		console.log(fun);
		fun.f.apply(fun.o,fun.p);
		update();
	};
	this.clearStack = function clearStack(){
		rewriter=[];
	};
	this.setState = function setState(state){//set the graphical interface state : "nugget_view", "kr_view", "kr_edit", "lcg_view", "kappa_view"
		switch(state){
			case "nugget_view":
				nugget_add=true;
				edition=false;
				kr_show=false;
				lcg_view=false;
				kappa_view=false;
				break;
			case "kr_view":
				nugget_add=false;
				edition=false;
				kr_show=true;
				lcg_view=false;
				kappa_view=false;
				break;
			case "kr_edit":
				nugget_add=false;
				edition=true;
				kr_show=false;
				lcg_view=false;
				kappa_view=false;
				break;
			case "lcg_view":
				nugget_add=false;
				edition=false;
				kr_show=false;
				lcg_view=true;
				kappa_view=false;
				break;
			case "kappa_view":
				nugget_add=false;
				edition=false;
				kr_show=false;
				lcg_view=false;
				kappa_view=true;
				break;
		}console.log(state);
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
		}
	};
	var mouseOut = function(d){//handling mouse out of nodes/actions
		d3.select(".n_tooltip").style("visibility","hidden")
								.text("");
	};
	var ctMenu = function(d){//handling right click on nodes/actions/links
		if(edition){
			
		}else if(nugget_add){
			
		}else{
			
		}
	};
	var svgMenu = function(){
		var menu;
		//console.log("here");
		if(!(edition || nugget_add)){
			menu = [
			{
				title: "Unlock all",
				action: function(elm,d,i){
					d3.selectAll("g").filter(function(d){return d.classes[0]=="agent" || d.classes[0]=="action"}).classed("fixed",function(d){return d.fixed=false;});
					update();
				}
			}
			];
		}else{
		//console.log("triggered !!!");
		menu =[
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
			},{
				title: "Add Agent",
				action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					var lbl=window.prompt("define your label","");
					if(lbl=="")self.addNode(["agent"],[],[],mousepos[0],mousepos[1]);
					else self.addNode(["agent"],[lbl.split(",")],[],mousepos[0],mousepos[1]);
				}
					
			},{
				title: "Add Action",
				action: function(elm,d,i){
					var mousepos=d3.mouse(svg[0][0]);
					var act_t="bnd";
					self.addNode(["action",act_t],[],[],mousepos[0],mousepos[1]);
					//console.log(layerG.nodes[layerG.nodes.length-1]);
					var last_node=layerG.nodes[layerG.nodes.length-1].id
					self.addNode(["action","binder","left"],[],[last_node]);
					self.addNode(["action","binder","right"],[],[last_node]);
				}
			}
		];
		}
		return menu;
	};
	var dblClick = function(d){//handling double clik on nodes/action : edition
		d3.event.stopPropagation();
	};
	var clickHandler = function(d) {//handling click on on a node or an action 
		d3.event.stopPropagation();
		if(d3.event.ctrlKey){
			d3.select(this).classed("fixed", d.fixed = false);
		}
		if(d3.event.shiftKey){
			if(d3.select(this).classed("selected"))
				d3.select(this).classed("selected", d.selected = false);
			else 
				d3.select(this).classed("selected", d.selected = true);
		}	
	};
	var clickText = function(d){//click on labels
		if(!edition) return;
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
	var nodeStaticMenu = function(){
		
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
	gGraph.addCtx("n3",["n1","n4"]);
	gGraph.wakeUp();
	//gGraph.log();
	//console.log(gGraph.getCoord());
};
//dynamic_graph.js
//author : Adrien Basso Blandin, ENS Lyon / Harvard Medical School
//this file is under Gnu LGPL licence
//this file is part of the Executable Knowledge project
function DynamicGraph(layerG,height,width){//define a dynamic graph : nodes can be of differents classes : "action", "agent" "key_rs", "region", "flag", "attribute", action should have a second subclass : "mod", "bnd","brk","syn", "deg","r_link","l_link" other can have a subclass : "abstract", "set"
	var layerG=layerG;
	var force=d3.layout.force()
				.size([width, height]);
	this.init = function init(){
		force
		.nodes(layerG.nodes)
		.links(layerG.links)
		.linkDistance(function(d){if((d.source.classes[0]=="action" && d.source.classes[1]=="binder") || (d.target.classes[0]=="action" && d.target.classes[1]=="binder") || d.e_class=="positive" || d.e_class=="negative") return 100; else return (d.source.toInt()+d.target.toInt())/2})
		.linkStrength(function(d){if((d.source.classes[0]=="action" && d.source.classes[1]=="binder") || (d.target.classes[0]=="action" && d.target.classes[1]=="binder")|| d.e_class=="positive"|| d.e_class=="negative") return 0.7; else return 5})
		.charge(function(d){if(d.classes[0]=="action" && d.classes[1]=="binder")return -300; else return -600})
	};
	this.getForce = function getForce(){
		return force;
	}
};

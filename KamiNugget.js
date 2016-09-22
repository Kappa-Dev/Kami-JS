/*
This class define a nugget structure
A nugget is defined as a collection of nodes and edges representing a grounded fragment of knowledge.
A nugget is decorated with a name, comments and references such as : doi, publication name, url or unknown meta data
A nugget can be defined as visible or not for optimization and visualization purposes
A nugget has a list of main nodes witch are the mechanisms nodes.
*/
function Nugget(i,n,c){
	var name = n || i;
	var id = i;
	var comments= c || "";
	var visible = true;
	var main_node = [];
	var references ={"doi":"","publication":"","url":"","meta":""};
	this.setMnode = function setMnode(id_l){//set the main node of a nugget 
		main_node=id_l.concat();
	};
	this.getMnode = function getMnode(){//get the list of the main nodes of the nugget
		return main_node.concat();
	};
	this.getName = function getName(){ return name;};//get the nugget name
	this.getId = function getId(){ return id;};//get the nugget id
	this.getComment = function getComment(){ return comments;};//get the nugget detail as comment
	this.isVisible = function isVisible(){ return visible;};//set the nugget visible or not (for kami purpose)
	this.setName = function setName(n){ name=n;};//change the nugget name
	this.setComment = function setComment(c){comments = c;};//change the nugget comment
	this.show = function show(){ visible=true;};//show the nugget
	this.hide = function hide(){visible=false;};//hide the nugget
	this.log = function log(){//log all nugget informations
		console.log("Nugget "+id);
		console.log("name : "+name);
		console.log("comment : "+comments);
		console.log("visible : "+visible);
		console.log("main nodes : "+main_node.join());
		console.log("---------------");
	};
	this.getRefs = function getRefs(){
		return {"doi":references.doi,"publication":references.publication,"url":references.url,"meta":references.meta};
	};
	this.setDoi = function setDoi(d){
		references.doi=d;
	};
	this.setPubli = function setPubli(d){
		references.publication=d;
	};
	this.setUrl = function setUrl(d){
		references.url=d;
	};
	this.setMeta = function setMeta(d){
		references.meta=d;
	};
}
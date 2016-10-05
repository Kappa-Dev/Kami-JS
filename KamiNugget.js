/*
This class define a nugget structure
A nugget is defined as a collection of nodes and edges representing a grounded fragment of knowledge.
A nugget is decorated with a name, comments and references such as : doi, publication name, url or unknown meta data
A nugget can be defined as visible or not for optimization and visualization purposes
*/
function Nugget(i,n,c){
	if(!i) throw new Error("undefined id");
	var id = i;
	var name = n || i;
	var comments= c || "";
	var visible = true;
	var references ={"doi":"","publication":"","url":"","meta":""};
	var graph=new LayerGraph(i);
	var father=null;
	var sons={};
	this.getGraph = function getGraph(){
		return graph;
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
		console.log("Graph : ");
		graph.log();
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
	this.getFather = function getFather(){
		return father;
	}
	this.getSons = function getSons(){
		return Object.keys(sons);
	}
	this.hasSon = function hasSon(g_id){
		if(!g_id) return Object.keys(sons).length>0;
		return sons[g_id]==true;
	};
	this.setFather = function setFather(g_id){
		father=g_id;
	}
	this.addSon = function addSon(g_id){
		if(!g_id) throw new Error("your son is null");
		if(sons[g_id]==true) throw new Error("this graph is allready one of your sons : "+g_id);
		sons[g_id]=true;
	};
	this.rmSon = function rmSon(g_id){
		if(g_id) delete sons[g_id];
		else sons={};
	};
	this.saveState = function saveState(){
		var ret=new Nugget(id,name,comments);
		ret.getGraph()=graph.saveState();
		if(!this.isVisible()) ret.hide();
		ret.setDoi(references.doi);
		ret.setUrl(references.url);
		ret.setPubli(references.publication);
		ret.setMeta(references.meta);
		ret.setFather(father);
		Object.keys(sons).forEach(function(e){
			ret.addSon(e);
		});
		return ret;
	};
	this.log = function log(){
		console.log("Nugget : "+id);
		console.log("-----------");
		console.log("name : "+name);
		console.log("comment : "+comments);
		console.log("visible ? "+visible);
		console.log("references :");
		console.log(references);
		console.log("father : "+father);
		console.log("sons : "+Object.keys(sons).join(", "));
		console.log("----- graph -----");
		graph.log();
	}
}
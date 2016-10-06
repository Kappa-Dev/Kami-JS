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
	this.getName = function getName(){//get the nugget name
		return name;
	};
	this.getId = function getId(){//get the nugget id
		return id;
	};
	this.getComment = function getComment(){//get the nugget detail as comment
		return comments;
	};
	this.isVisible = function isVisible(){//set the nugget visible or not (for kami purpose)
		return visible;
	};
	this.setName = function setName(n){//change the nugget name
		name=n;
	};
	this.setComment = function setComment(c){//change the nugget comment
		comments = c;
	};
	this.show = function show(){//show the nugget
		visible=true;
	};
	this.hide = function hide(){//hide the nugget
		visible=false;
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
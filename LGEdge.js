//edge definition
define(function(){return function Edge(node1,node2,e_class){
	//node1 and node2 are objects
	this.source=node1;
	this.target=node2;
	this.sourceID=node1.id;
	this.targetID=node2.id;
	this.e_class=e_class;
};});
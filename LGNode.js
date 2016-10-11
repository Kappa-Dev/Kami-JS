//node definition
define(function(){return function Node(classes,id,x,y,fixed){
	this.classes=classes;//the node class
	this.id=id;//the node id
	this.sons=[];// the node sons
	this.father=null;//the node father
	this.context=[];//alternatively a context for an action or a value list for a flag or an attribute
	this.label=[];
	this.valued_context=null;//the value for flag or attributes of a context
	if(typeof(x)!='undefined') this.x=x;//node coordinate
	if(typeof(y)!='undefined') this.y=y;
	if(typeof(fixed)!='undefined') this.fixed=fixed;//node position fixed
	this.selected=false;
	this.toInt = function(){
		switch(classes[0]){
			case "action" : if(classes[1]!="binder")return 80; else return 4;
			case "key_res" : return 20;
			case "region" : return 30;
			case "agent" : return 40;
			case "flag" : return 12;
			case "attribute" : return 10;
		}
	};
}; });
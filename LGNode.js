function Node(i,t,n,l,v,u){//generic definition of a node in a clustered graph
	if(typeof i=='undefined' || i==null) throw new Error("undefined id : "+i);
	var id=i;//unique identifier of a node
	if(!fullListCheck(t)) throw new Error("unknown type : "+t);
	var type=t;//this node type : component(1)/action(2)/super(3)/attribute (1):agent/region/keyres/flag (2):mod/modPos/modNeg/syn/deg/bnd/brk/input/output (3):family/set/process
	var labels=l || [];
	var values=v || [];
	if(typeof u=='undefined' || u==null) throw new Error("undefined uid : "+u);
	var uid=u;
	var father=null;
	if(typeof n=='undefined' || n==null) throw new Error("undefined nugget : "+n);
	var nugget=n;
	var sons=[];
	this.getId = function getId(){// return the node id O(1)
		return id;
	};
	this.getType = function getType(){//return the node type (new array) : O(t) : t=type size : constant
		return type.concat();
	}
	this.getLabels = function getLabels(){//return the node labels (new array) : O(l) : l= label size : constant??
		return labels.concat();
	};
	this.getValues = function getValues(){//return the node values (new array) : O(v) : v= values size : constant??
		return values.concat();
	};
	this.getUid = function getUid(){//return the node Uid : O(1)
		return uid;
	};
	this.getFather = function getFather(){//return the node father id : O(1)
		return father;
	};
	this.getNugget = function getNugget(){//return the node nugget : O(1)
		return nugget;
	};
	this.getSons = function getSons(){//return the node sons id list (new array) : O(s) : s : max node arity
		return sons.concat();
	};
	this.addLabels = function addLabels(l){//add all new labels from l to the node labels : O(l) : max labels size
		labels=union(labels,l);
	};
	this.rmLabels = function rmLabels(l){//remove the specified label from the node node labels (only the element of l in the node label are removed) : O(l) : max list size
		labels=rmElements(labels,l);
	};
	this.deleteLabels = function deleteLabels(){//remove all labels : O(1)
		labels=[];
	};
	this.addValues = function addValues(v){//add all new values from v to the node values : o(v) : max values size
		values=union(values,v);
	};
	this.rmValues = function rmValues(v){//remove the specified values from the node values (only element of v in the node values are removed) :  O(v) : max list size
		values=rmElements(values,v);
	};
	this.deleteValues = function deleteValues(){//remove all values : O(1)
		values=[];
	};
	this.setUid = function setUid(u){//change the node Uid : O(1)
		if(typeof u=='undefined' || u==null) throw new Error("undefined uid : "+u);
		uid=u;
	};
	this.setFather = function setFather(f){//change the node father
		father=f;
	};
	this.setNugget = function setNugget(n){//change the node nuggets : o(1)
		if(typeof n=='undefined' || n==null) throw new Error("undefined nugget : "+n);
		nugget=n;
	};
	this.addSons = function addSons(s_l){//add all new sons from s_l to the node sons : O(s) : s = max node arity
		sons=union(sons,s_l);
	};
	this.rmSons = function rmSons(s_l){//remove the specified sons from the node sons : O(s) : s = max node arity
		sons=rmElements(sons,s_l);
	};
	this.deleteSons = function deleteSons(){//remove all sons : O(1)
		sons=[];
	};
	this.hasType = function hasType(t){//verify if a node has a specific type : O(t) t=type size : constant
		return type.indexOf(t)!=-1;
	};
	this.hasLabel = function hasLabel(l){//verify if a node has a specified label : O(l) l= label size
		return labels.indexOf(l)!=-1;
	};
	this.hasValue =function hasValue(v){//verify if a node has a specific value : O(v) v=value size 
		return values.indexOf(v)!=-1;
	};
	this.hasSons = function hasSons(s){//verify if a node has a specific son : O(s) s=max node arity
		return sons.indexOf(s)!=-1;
	};
	this.log = function log(){//log the whole node information O(k) : k=max size(l,v,s)
		console.log('==== ' + id + ' ====');
		console.log('type : '+type);
		console.log('nugget : '+nugget);
		console.log('uid : '+uid);
		console.log('labels : '+labels);
		console.log('values : '+values);
		console.log('father : '+father);
		console.log('sons : '+sons);
		console.log('______________')
	};
	this.clone = function clone(){//create a new ode witch is a copy of this node : O(k) : k=max size(l,v,s)
		return new Node(id,type.concat(),nugget,labels.concat(),values.concat(),uid);
	};
	this.copy = function copy(i){//create a new node witch is a copy of this node with a different id : O(k) : k=max size(l,v,s)
		if(!i) throw new Error("id isn't defined");
		if(i==id) throw new Error("this copy has the same id as the original node, use clone insteed : "+id);
		return new Node(i,type.concat(),nugget,labels.concat(),values.concat(),uid);
	};
}
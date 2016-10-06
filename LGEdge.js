function Edge(ii,t,n,i,o){//generic definition of an edge in a clustered graph
	if(!ii) throw new Error("undefined id : "+ii);
	var id=ii;
	if(!t) throw new Error("unknown type : "+t);
	var type=t;//type can be 'link','parent','posinfl','neginfl','rw_rule'
	if(!i)throw new Error("undefined source : "+i);
	var source=i;//for parenting : source is the son
	if(!o)throw new Error("undefined target : "+o);
	var target=o;
	if(!n) throw new Error("undefined graph : "+n);
	var nugget=n;
	this.getId = function getId(){//return the edge id O(1)
		return id;
	};
	this.getGraph = function getGraph(){//return the edge nugget O(1)
		return nugget;
	};
	this.getType = function getType(){//return the edge type (new array) : O(t) : t=type size : constant
		return type.concat();
	};
	this.setType = function setType(t){//change the edge type
		if(!t) throw new Error("Undefined type");
		type=t;
	}
	this.getSource = function getSource(){//return the edge source : O(1)
		return source;
	};
	this.getTarget = function getTarget(){//return the edge target : O(1)
		return target;
	};
	this.setSource = function setSource(i) {//change the edge source : O(1)
		if(!i) throw new Error("id isn't defined");
		source=i;
	};
	this.setTarget = function setTarget(o){//change the edge target : O(1)
		if(!0) throw new Error("id isn't defined");
		target=o;
	};
	this.setGraph = function setGraph(n){//change the edge nugget : O(1)
		if(typeof n=='undefined' || n==null) throw new Error("undefined graph : "+n);
		nugget=n;
	};
	this.log = function log(){//log the whole edge informations O(1)
		console.log('==== ' + id + ' ====');
		console.log('type : '+type);
		console.log('graph : '+nugget);
		console.log('source : '+source);
		console.log('target : '+target);
		console.log('______________');
	};
	this.saveState = function saveState(){//create a exact copy of the edge : O(1)
		return this.copy(id);
	};
	this.copy = function copy(i){//create a copy of the edge with a new id : O(1)
		return new Edge(i,type,nugget,source,target);
	};
}
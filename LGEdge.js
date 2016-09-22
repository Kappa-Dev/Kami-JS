function Edge(ii,t,n,i,o){//generic definition of an edge in a clustered graph
	if(typeof ii=='undefined' || ii==null) throw new Error("undefined id : "+ii);
	var id=ii;
	if(!fullListCheck(t)) throw new Error("unknown type : "+t);
	var type=t;//type can be 'link','parent','posinfl','neginfl','rw_rule'
	var source=i;//for parenting : source is the son
	var target=o;
	if(typeof n=='undefined' || n==null) throw new Error("undefined nugget : "+n);
	var nugget=n;
	this.getId = function getId(){//return the edge id O(1)
		return id;
	};
	this.getNugget = function getNugget(){//return the edge nugget O(1)
		return nugget;
	};
	this.getType = function getType(){//return the edge type (new array) : O(t) : t=type size : constant
		return type.concat();
	};
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
	this.setNugget = function setNugget(n){//change the edge nugget : O(1)
		if(typeof n=='undefined' || n==null) throw new Error("undefined nugget : "+n);
		nugget=n;
	};
	this.log = function log(){//log the whole edge informations O(1)
		console.log('==== ' + id + ' ====');
		console.log('type : '+type);
		console.log('nugget : '+nugget);
		console.log('source : '+source);
		console.log('target : '+target);
		console.log('______________');
	};
	this.clone = function clone(){//create a exact copy of the edge : O(1)
		return new Edge(id,type,nugget,source,target);
	};
	this.copy = function copy(i){//create a copy of the edge with a new id : O(1)
		if(i==id) throw new Error("this copy has the same id as the original edge, use clone insteed : "+id);
		return new Edge(i,type,nugget,source,target);
	};
}
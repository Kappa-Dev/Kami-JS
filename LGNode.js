function Node(i,t,g,l){//generic definition of a node in a clustered graph
	if(typeof i=='undefined' || i==null) throw new Error("undefined id : "+i);
	var id=i;//unique identifier of a node
	var labels=l || {};
	if(!t) throw new Error("undefined type : "+t);
	var type=t;
	if(!g) throw new Error("undefined graph : "+g);
	var graph=g;
	var input_nodes={};
	var output_nodes={};
	this.getId = function getId(){// return the node id O(1)
		return id;
	};
	this.getType = function getType(){//return the node type : O(1)
		return type;
	};
	this.setType = function setType(u){//change the node type : O(1)
		if(typeof u=='undefined' || u==null) throw new Error("undefined type : "+u);
		type=u;
	};
	this.getLabels = function getLabels(){//return the node labels (new array) : O(l) 
		return Object.keys(labels);
	};
	this.addLabels = function addLabels(l){//add all new labels from l to the node labels : O(l) : max labels size
		if(l)
			l.forEach(function(e){labels[e]=true});
	};
	this.rmLabels = function rmLabels(l){//remove the specified label from the node node labels (only the element of l in the node label are removed) : O(l) : max list size : if l is null/undefined, remove all the labels
		if(l)
			l.forEach(function(e){delete labels[l]});
		else
			labels={};
	};
	this.getInputNodes = function getInputNodes(e_t){//return the input nodes for a specific edge type or all if e_t is undefined or null : O(1)
		if(e_t)
			return Object.keys(input_nodes[e_t]);
		else
			return multiUnion(Object.keys(input_nodes).map(function(e){return Object.keys(input_nodes[e])}));
	};
	this.addInputNodes = function addInputNodes(f,e_t){//add an input node
		if(!e_t) throw new Error("undefined edge type : "+e_t);
		if(!f) throw new Error("undefined node : "+f);
		if(!input_nodes[e_t])input_nodes[e_t]={};
		input_nodes[e_t][f]=true;
	};
	this.rmInputNodes = function rmInputNodes(f,e_t){//add an input node
		if(!e_t) throw new Error("undefined edge type : "+e_t);
		if(!f) throw new Error("undefined node : "+f);
		if(!f) delete input_nodes[e_t];
		else delete input_nodes[e_t][f];
	};
	this.getGraph = function getGraph(){//return the node graph : O(1)
		return graph;
	};
	this.setGraph = function setGraph(g){//change the node graph : O(1)
		if(!g) throw new Error("undefined graph : "+g);
		graph=g;
	};
	this.getOutputNodes = function getOutputNodes(e_t){//return the output nodes for a specific edge type or all if e_t is undefined or null : O(1)
		if(e_t)
			return Object.keys(output_nodes[e_t]);
		else
			return multiUnion(Object.keys(output_nodes).map(function(e){return Object.keys(output_nodes[e])}));
	};
	this.addOutputNodes = function addOutputNodes(f,e_t){//add an Output node
		if(!e_t) throw new Error("undefined edge type : "+e_t);
		if(!f) throw new Error("undefined node : "+f);
		if(!output_nodes[e_t])output_nodes[e_t]={};
		output_nodes[e_t][f]=true;
	};
	this.rmOutputNodes = function rmOutputNodes(f,e_t){//add an Output node
		if(!e_t) throw new Error("undefined edge type : "+e_t);
		if(!f) delete output_nodes[e_t];
		else delete output_nodes[e_t][f];
	};
	this.hasLabel = function hasLabel(l){//verify if a node has a specified label : O(1) : double hashtable
		return labels[l]==true;
	};
	this.hasInputNode = function hasInputNode(n,e_t){
		if(e_t) return input_nodes[e_t] && input_nodes[e_t][n]==true;
		else return Object.keys(input_nodes).reduce(function(accu,e){return accu || input_nodes[e][n]==true},false);
	}
	this.hasOutputNode = function hasOutputNode(n,e_t){
		if(e_t) return output_nodes[e_t] && output_nodes[e_t][n]==true;
		else return Object.keys(output_nodes).reduce(function(accu,e){return accu || output_nodes[e][n]==true},false);
	}
	this.log = function log(){//log the whole node information O(k) : k=max size(l,v,s)
		console.log('==== ' + id + ' ====');
		console.log('type : '+type);
		console.log('graph : '+graph);
		console.log('labels : '+Object.keys(labels).join(", "));
		console.log('input nodes : ');
		Object.keys(input_nodes).forEach(function(e){console.log(e+" "+Object.keys(input_nodes[e]).join(", "))});
		console.log('output nodes : ');
		Object.keys(output_nodes).forEach(function(e){console.log(e+" "+Object.keys(output_nodes[e]).join(", "))});
		console.log('______________');
	};
	this.saveState = function saveState(){//create a new node witch is a copy of this node : O(k) : k=max size(l,v,s)
		return this.copy(id);
	};
	this.copy = function copy(i){//create a new node witch is a copy of this node with a different id : O(k) : k=max size(l,v,s)
		if(!i) throw new Error("id isn't defined");
		return new Node(i,type,graph,this.getLabels());
	};
}
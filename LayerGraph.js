/*
This lib also require LGNode.js, LGEdge.js,LGUndoRedo.js and tools.js
to use it add to your page: 
<script src="Tools.js"></script>
<script src="LGNode.js"></script>
<script src="LGEdge.js"></script>
<script src="LGUndoRedo.js"></script>
<script src="LayerGraph.js"></script>
An autonomous multi layer graph with optimized modification actions (all in O(1))
 except removal/merge in O(Max(node arity)) and undo redo stack with similar time optimizations
 A layergraph is defined as an oriented graph with clustered nodes.
 relation between node of the same cluster are hierarchicaly ordered using "parent" link,
 interaction between node of different cluster are defined as simple link.
due to this proposition, "parent" become a reserved link name, other link can be typed as wanted
*/
function LayerGraph(i){
	if(!i) throw new Error("id is undefined");
	var id =i;
	var NODE_ID = 0;//unique id for nodes (actions/components)
	var EDGE_ID = 0;//unique id for edges (linking edges and structure edges)
	var nodes = {};//hashtable of nodes objects, key:id, value:node
	var edges = {};//hashtable of edges objects, key:id, value:edge
	var nodesByLabel = {};//hashtable of nodes, key:label, value :nodes id list
	var nodesByType = {};//hashtable of nodes, key:uid, value: nodes id list
	var edgesBySource={};//hashtable of edges, key:node input id, values: edges id list
	var edgesByTarget={};//hashtable of edges, key:node output id, values:edges id list
	var edgesByType={}//hashable of edges, key:edge type, values: edges id list
	this.nodeExist = function nodeExist(id){
		return typeof nodes[id]!='undefined' && nodes[id]!=null;
	};
	this.edgeExist = function edgeExist(id){
		return typeof edges[id]!='undefined' && edges[id]!=null;
	};
	var getNode = function(id){//return a specific node for a specific id
		if(typeof(nodes[id])!=undefined && nodes[id]!=null)
			return nodes[id];
		else return null;
	};
	this.getNodes = function getNodes(){//return the whole nodes as a list of id
		return Object.keys(nodes);
	};
	var getEdge = function(id){//return a specific edge for an id
		if(typeof(edges[id])!=undefined && edges[id]!=null)
			return edges[id];
		else return null;
	};
	this.getEdges = function getEdges(){//return the whole edges as a list of id
		return Object.keys(edges);
	};
	this.addNode = function addNode(t,l){//add a new node in the graph
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		var tmp_l={};l.forEach(function(e){tmp_l[e]=true;});
		nodes["n_"+NODE_ID]=new Node("n_"+NODE_ID,t,id,tmp_l);
		if(l)//if this node have some labels, add it to the nodesbylabel hashtable
			l.forEach(function(e){
				if(!nodesByLabel[e]) nodesByLabel[e]={};
				nodesByLabel[e]["n_"+NODE_ID]=true;
			});
		if(!nodesByType[t]) nodesByType[t]={};//add the node in the nodesBytype hashtable
		nodesByType[t]["n_"+NODE_ID]=true;
		delta.enter.nodes["n_"+NODE_ID]=getNode("n_"+NODE_ID).saveState();//return the delta object
		NODE_ID++;
		return delta;
	};
	this.addEdge = function addEdge(t,i,o){//add a new edge to the graph
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		edges["e_"+EDGE_ID] = new Edge("e_"+EDGE_ID,t,id,i,o);
		if(!edgesByType[t]) edgesByType[t]={};//add it to the type hashtable
		edgesByType[t]["e_"+EDGE_ID]=true;
		if(!edgesBySource[i])edgesBySource[i]={};//add it to the source hashtable
		edgesBySource[i]["e_"+EDGE_ID]=true;
		if(!edgesByTarget[o])edgesByTarget[o]={};//add it to the target hashtable
		edgesByTarget[o]["e_"+EDGE_ID]=true;
		nodes[i].addOutputNodes(o,t);//update nodes input/ouput table
		nodes[o].addInputNodes(i,t);
		delta.enter.edges["e_"+EDGE_ID]=getEdge("e_"+EDGE_ID).saveState();
		EDGE_ID++;
		return delta;
	};
	this.rmNode = function rmNode(n_id){//reove a node from the graph
		if(!nodes[n_id]) throw new Error("this node doesn't exist : "+n_id);
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		delta.exit.nodes[n_id]=getNode(n_id).saveState();//save the node for undo redo
		var linked_edges = union(this.getEdgesBySource(n_id),this.getEdgesByTarget(n_id));//get all linked edges
		linked_edges.reduce(function(accu,e){
			accu[e]=this.rmEdge(e).exit.edges[e];	//remove all linked edges and save them
		},delta.exit.edges);
		getNode(n_id).getLabels().forEach(function(e){//remove the node from the label hashtable
			delete nodesByLabel[e][n_id];
		});
		delete nodesByType[getNode(n_id).getType()][n_id];//remove the node from the type hashtable
		delete nodes[n_id];//finally remove the node
		return delta;
	};
	this.rmEdge = function rmEdge(e_id){
		if(!edges[e_id]) throw new Error("this edge doesn't exist : "+e_id);
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		delta.exit.edges[e_id]=getEdge(e_id).saveState();//save the edge for undo redo
		delete edgesByType[getEdge(e_id).getType()][e_id];//remove the edge from the type hashtable
		delete edgesBySource[getEdge(e_id).getSource()][e_id];//remove the edge from the source hashtable
		delete edgesByTarget[getEdge(e_id).getTarget()][e_id];//remove the edge from the target hashtable
		getNodes(getEdge(e_id).getTarget()).rmInputNodes(getNodes(getEdge(e_id).getSource()),getEdge(e_id).getType());//update nodes input/output hashtable
		getNodes(getEdge(e_id).getSource()).rmInputNodes(getNodes(getEdge(e_id).getTarget()),getEdge(e_id).getType());
		delete edges[e_id];//finally remove the edge
		return delta;
	};
	var mergeDelta = function(d1,d2){//accumulateur à gauche pour delta
		Object.keys(d2.enter.nodes).forEach(function(e){//merge entering nodes
			if(!d1.enter.nodes[e])d1.enter.nodes[e]=d2.enter.nodes[e];
			else throw new Error("this element has already been defined : "+e);
		});
		Object.keys(d2.enter.edges).forEach(function(e){//merge entering edges
			if(!d1.enter.edges[e])d1.enter.edges[e]=d2.enter.edges[e];
			else throw new Error("this element has already been defined : "+e);
		});
		Object.keys(d2.exit.nodes).forEach(function(e){//merge exiting nodes
			if(!d1.exit.nodes[e])d1.exit.nodes[e]=d2.exit.nodes[e];
			else throw new Error("this element has already been defined : "+e);
		});
		Object.keys(d2.exit.edges).forEach(function(e){//merge exiting edges
			if(!d1.exit.edges[e])d1.exit.edges[e]=d2.exit.edges[e];
			else throw new Error("this element has already been defined : "+e);
		});
	}
	this.mergeNode = function mergeNode(n_id1,n_id2){//merge two nodes of the same type
		if(!nodes[n_id1]) throw new Error("this node isn't defined : "+n_id1);//check if both node exist
		if(!nodes[n_id2]) throw new Error("this node isn't defined : "+n_id2);
		if(getNode(n_id1).getType()!=getNode(n_id2).getType()) //nodes need to be of the same type
			throw new Error("both nodes have not the same type : "+getNode(n_id1).getType()+" , "+getNode(n_id2).getType());
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		delta.enter.nodes=this.addNode(getNode(n_id1).getType(),union(getNode(n_id1).getLabels(),getNode(n_id2).getLabels())).enter.nodes;
		var new_id=Object.keys(delta.enter.nodes)[0]; //get the id of the new node
		union(this.getEdgeBySource(n_id1),this.getEdgeBySource(n_id2)).reduce(function(accu,e){//change the target of all output edges
			accu.exit.edges[e]=getEdge(e).saveState();
			getEdge(e).setSource(new_id);
			accu.enter.edges[e]=getEdge(e).saveState();
		},delta);
		union(this.getEdgeByTarget(n_id1),this.getEdgeByTarget(n_id2)).reduce(function(accu,e){//change the source of all input edges
			accu.exit.edges[e]=getEdge(e).saveState();
			getEdge(e).setTarget(new_id);
			accu.enter.edges[e]=getEdge(e).saveState();
		},delta);
		mergeDelta(delta,rmNode(n_id1));//remove both nodes
		mergeDelta(delta,rmNode(n_id2));
		return delta;
	}
	this.cloneNode = function cloneNode(n_id){//clone a specific node.
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		delta=this.addNode(getNode(n_id).getType(),getNode(n_id).getLabels());//add a copy of the node
		var new_id=Object.keys(delta.enter.nodes)[0]; //get the id of the new node
		this.getEdgeBySource(n_id).reduce(function(accu,e){//add all entering edges to the clone
			mergeDelta(accu,this.addEdge(this.getEdge(e).getType(),new_id,this.getEdge(e).getTarget()));
		},delta);
		this.getEdgeByTarget(n_id).reduce(function(accu,e){//add all output edges to the clone
			mergeDelta(accu,this.addEdge(this.getEdge(e).getType(),this.getEdge(e).getSource(),new_id));
		},delta);
		return delta;
	};
	this.addNodeLabels = function addNodeLabels(n_id,l){//add some labels to a node, return an enter/exit object
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		if(intersection(l,getNode(n_id).getLabels()).length==l.length) return delta;
		delta.exit.nodes[n_id]=getNode(n_id).saveState();
		getNode(n_id).addLabels(l);
		delta.enter.nodes[n_id]=getNode(n_id).saveState();
		if(l)//if this node have some labels, add it to the nodesbylabel hashtable
			l.forEach(function(e){
				if(!nodesByLabel[e]) nodesByLabel[e]={};
				nodesByLabel[e][n_id]=true;
			});
		return delta;
	};
	this.rmNodeLabels = function rmNodeLabels(n_id,l){//remove labels from a node if l is null or [], remove all the labels, return an enter/exit object
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		delta.exit.nodes[n_id]=getNode(n_id).saveState();
		if(l){
			l.forEach(function(e){//remove the node from the label hashtable
				delete nodesByLabel[e][n_id];
			});
		}else{
			getNode(n_id).getLabels().forEach(function(e){//remove the node from the label hashtable
			delete nodesByLabel[e][n_id];
		});
		}
		getNode(n_id).rmLabels(l);
		delta.enter.nodes[n_id]=getNode(n_id).saveState();
		return delta;
	};
	this.setNodeType = function setNodeType(n_id,t){
		var delta={enter:{nodes:{},edges:{}},exit:{nodes:{},edges:{}}};
		if(!t) throw new Error("calling setNodeType on "+n_id+" with undefined type");
		delta.exit.nodes[n_id]=getNode(n_id).saveState();
		getNode(n_id).setType(t);
		delta.enter.nodes[n_id]=getNode(n_id).saveState();
	};
	this.getNodeByLabels = function getNodeByLabels(labels){//return a nodes id list corresponding to the specific labels
		var nodes_lists = [];
		if(!labels)return nodes_lists;
		labels.reduce(function(accu,e){
			var tmp_lb=nodesByLabel[e]?Object.keys(nodesByLabel[e]):[];
			accu.push(tmp_lb);
		},nodes_lists);
		return multiIntersection(nodes_lists);
	};
	this.getNodeByType = function getNodeByType(t){//return all nodes of a specific type
		if(!t) return this.getNodes();
		if(!nodesByType[t]) return [];
		return Object.keys(nodesByType[t]);
	}
	this.getEdgeByType = function getEdgeByType(t){//return all edges of a specific type
		if(!edgesByType[t]) return [];
		if(!t) return this.getEdges();
		return Object.keys(edgesByType[t]);
	}
	this.getEdgeBySource = function getEdgeBySource(i_id){//return all the edges corresponding to a specific input (id list)
		if(!i_id) return this.getEdges();
		if(!edgesBySource[i_id]) return [];
		return Object.keys(edgesBySource[i_id]);
	};
	this.getEdgeByTarget = function getEdgeByTarget(o_id){//return all the edges corresponding to a specific output (id list)
		if(!o_id) return this.getEdges();
		if(!edgesByTarget[o_id]) return [];
		return Object.keys(edgesByTarget[o_id]);
	};
	this.log = function log() {//log the whole layer graph object
		var n_keys = Object.keys(nodes);
		var e_keys = Object.keys(edges);
		console.log("NODES : ===================>");
		for (var i = 0; i < n_keys.length; i++)
			nodes[n_keys[i]].log();
		console.log("EDGES : ===================>");
		for (var i = 0; i < e_keys.length; i++)
			edges[e_keys[i]].log();
		console.log("nodesByType : ===================>");
		console.log(nodesByType);
		console.log("nodesByLabel : ===================>");
		console.log(nodesByLabel);
		console.log("edgesByType : ===================>");
		console.log(edgesByType);
		console.log("edgesBySource : ===================>");
		console.log(edgesBySource);
		console.log("edgesByTarget : ===================>");
		console.log(edgesByTarget);
	};
	this.getLabels = function getLabels(id){//return the labels of a node
        if(!getNode(id)) throw new Error("unexisting node : "+id);
		return getNode(id).getLabels();
    };
    this.getType = function getType(id){//return the type of a node or an edge
        if(idT(id)=='e'){
			if(!getEdge(id)) throw new Error("unexisting node : "+id);
            return getEdge(id).getType();
        }else{
			if(!getNode(id)) throw new Error("unexisting node : "+id);
            return getNode(id).getType();
		}
    };
    this.getOutputNodes = function getOutputNodes(id,e_t){//return al the nodes from an input edge (or a specific type of edges)
        if(!getNode(id)) throw new Error("unexisting node : "+id);
		return getNode(id).getOutputNodes(e_t);
    };
    this.getInputNodes = function getInputNodes(id,e_t){//return al the nodes from an output edge (or a specific type of edges)
        if(!getNode(id)) throw new Error("unexisting node : "+id);
		return getNode(id).getInputNodes(e_t);
    };
    this.getSource = function getSource(id){//return the source of an edge
        if(!getEdge(id)) throw new Error("unexisting node : "+id);
		return getEdge(id).getSource();
    };
    this.getTarget = function getTarget(id){//return the target of an edge
        if(!getEdge(id)) throw new Error("unexisting node : "+id);
		return getEdge(id).getTarget();
    };
    this.getLastNodeId = function getLastNodeId(){//return the id of the last node created
        return 'n_'+(NODE_ID-1);
    };
    this.getLastEdgeId = function getLastEdgeId(){//return the id of the last edge created
        return 'e_'+(EDGE_ID-1);
    };
	this.hasLabel = function hasLabel(id,l){
		if(!getNode(id)) throw new Error("unexisting node : "+id);
		return getNode(id).hasLabel(l);
	};
	this.hasInputNode = function hasInputNode(id,n,e_t){
		if(!getNode(id)) throw new Error("unexisting node : "+id);
		return getNode(id).hasInputNode(n,e_t);
	};
	this.hasOutputNode = function hasOutputNode(id,n,e_t){
		if(!getNode(id)) throw new Error("unexisting node : "+id);
		return getNode(id).hasOutputNode(n,e_t);
	};
	this.saveState = function saveState(){
		var ret=new LayerGraph();
		Object.keys(nodes).forEach(function(e){
			ret.addNode(getNode(e).getType(),getNode(e).getLabel());
		});
		Object.keys(edges).forEach(function(e){
			ret.addEdge(getEdge(e).getType(),getEdge(e).getSource(),getEdge(e).getTarget());
		});
		return ret;
	};
	this.searchNReplace = function searchNReplace(patern,enter,exit){//search a specific patern in the graph and transform it using the enter and exit informations
		
	}
}
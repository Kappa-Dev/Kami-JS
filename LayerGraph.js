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
function LayerGraph(){
	var NODE_ID = 0;//unique id for nodes (actions/components)
	var EDGE_ID = 0;//unique id for edges (linking edges and structure edges)
	var nodes = {};//hashtable of nodes objects, key:id, value:node
	var edges = {};//hashtable of edges objects, key:id, value:edge
	/* !!!! ==== those Hashtable may contain redondent ids ==== !!!! */
	var edgesByHash = {};//hashtable of edges, key:source_target_type, value : edge id list
	var nodesByLabel = {};//hashtable of nodes, key:label, value :nodes id list
	var nodesByUid = {};//hashtable of nodes, key:uid, value: nodes id list
	var nodesByNuggets = {};//hashtable of nodes, key: nugget id, value:nodes id list
	var nodesByTypes = {};//hashtable of nodes, key: nodes types, values: nodes id list
	var edgesByNuggets = {};//hashtable of edges, key: nugget id, value:edges id list
	var edgesBySource={};//hashtable of edges, key:node input id, values: edges id list
	var edgesByTarget={};//hashtable of edges, key:node output id, values:edges id list
	var edgesByType={}//hashable of edges, key:edge type, values: edges id list
	var undoRedo=new UndoRedoStack();//undo redo stack for this layer graph.
	this.nodeExist = function nodeExist(id){
		return typeof nodes[id]!='undefined' && nodes[id]!=null;
	}
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
	var putNode = function(n){//UNSAFE add a node to the LG, be carefull, this node must have a none existing ID !
		if(typeof n=='undefined' || n==null) throw new Error("this node is undefined");
		nodes[n.getId()]=n;
		var tmp_lb=n.getLabels();//add this node to the label hashtable
		for(var i=0;i<tmp_lb.length;i++){
			if(fullListCheck(nodesByLabel[tmp_lb[i]]))
				nodesByLabel[tmp_lb[i]].push(n.getId());
			else nodesByLabel[tmp_lb[i]]=[n.getId()];
		}
		var tmp_uid=n.getUid();//add the node to the Uid hashtable
		if(!fullListCheck(nodesByUid[tmp_uid]))
			nodesByUid[tmp_uid]=[];
		nodesByUid[tmp_uid].push(n.getId());
		var tmp_ng=n.getNugget();//add the node to the Nuggets hashtable
		if(!fullListCheck(nodesByNuggets[tmp_ng]))
			nodesByNuggets[tmp_ng]=[];
		nodesByNuggets[tmp_ng].push(n.getId());
		var tmp_t=n.getType();//add the node to the type hashtable
		for(var i=0;i<tmp_t.length;i++){
			if(!fullListCheck(nodesByTypes[tmp_t[i]]))
				nodesByTypes[tmp_t[i]]=[];
			nodesByTypes[tmp_t[i]].push(n.getId());
		}
		return {'ng':n.getNugget(),'left':null,'right':{'nodes':[n.clone()],'edges':[]}};//return the delta with the new node !
	};
	this.addNode = function addNode(t,ng,l,v,u){//add a NEW node return an enter/exit object
		var n=new Node('n_'+NODE_ID++,t,ng,union(l,null),union(v,null),u);//remove possible redundance in label and values.
		var delta = putNode(n);
		undoRedo.stack(delta);
		return deltaToId(delta);
	};
	var clNode = function(id){//internal removing function : return a delta object
		var n=nodes[id];
		if(!n) throw new Error("this node isn't defined : "+id);
		var ret={'ng':n.getNugget(),'right':null,'left':{'nodes':[n.clone()],'edges':[]}};//add this node to the delta
		edgesBySource[id]=union(edgesBySource[id],null);
		var source_edges = edgesBySource[id];//get all edges going from this node
		if(fullListCheck(source_edges)){//remove all edges going from this node
			for(var i=0;i<source_edges.length;i++){
				ret.left.edges.push(clEdge(source_edges[i]).left.edges[0]);
			}
		}
		delete edgesBySource[id];//remove information from hashtable
		edgesByTarget[id] = union(edgesByTarget[id],null);
		var target_edges = edgesByTarget[id];//get all edges going to this node
		if(fullListCheck(target_edges)){//remove all edges going to this node
			for(var i=0;i<target_edges.length;i++)
				ret.left.edges.push(clEdge(target_edges[i]).left.edges[0]);
		}
		delete edgesByTarget[id];//remove information from hashtable
		var tmp_lb=nodes[id].getLabels();//remove this node from the label hashtable
		for(var i=0;i<tmp_lb.length;i++){
			nodesByLabel[tmp_lb[i]]=union(nodesByLabel[tmp_lb[i]],nodesByLabel[tmp_lb[i]]);
			nodesByLabel[tmp_lb[i]].splice(nodesByLabel[tmp_lb[i]].indexOf(id),1);
		}
		var tmp_ui=n.getUid();//remove the node from the Uid hashtable
        if(typeof tmp_ui!='undefined' && tmp_ui!=null){
			nodesByUid[tmp_ui]=union(nodesByUid[tmp_ui],nodesByUid[tmp_ui]);
		    nodesByUid[tmp_ui].splice(nodesByUid[tmp_ui].indexOf(id),1);
		}
		var tmp_ng=n.getNugget();//remove the node from the Nuggets hashtable
		nodesByNuggets[tmp_ng]=union(nodesByNuggets[tmp_ng],nodesByNuggets[tmp_ng]);
		nodesByNuggets[tmp_ng].splice(nodesByNuggets[tmp_ng].indexOf(id),1);
		var tmp_t=n.getType();//remove the node from the Type hashtable
		for(var i=0;i<tmp_t.length;i++){
			nodesByTypes[tmp_t[i]]=union(nodesByTypes[tmp_t[i]],nodesByTypes[tmp_t[i]]);
			nodesByTypes[tmp_t[i]].splice(nodesByTypes[tmp_t[i]].indexOf(id),1);
		}
		delete nodes[id];//remove the node object
		return ret;
	};
	this.rmNode = function rmNode(id){//remove a specific node and return an enter/exit object
		var delta=clNode(id);
		undoRedo.stack(delta);//return Delta
		return deltaToId(delta);
	};
	this.mergeNode = function mergeNode(id1,id2){//merge two node in a third one and return an enter/exit object
		if(id1==id2) return emptyDelta();
		if(nodes[id1].getNugget()!=nodes[id2].getNugget())
			throw new Error("We can't merge nodes of different clusters!");
		if(nodes[id1].getUid()!=nodes[id2].getUid() && idT(nodes[id1].getUid())=="up" && idT(nodes[id2].getUid())=="up")
			throw new Error("We can't merge nodes of different uniprot ID !");
		var uid=nodes[id1].getUid();//by default the new uid is the first node uid or Upid
		if(idT(nodes[id2].getUid())=="up")
			uid=nodes[id2].getUid();//if id2 has an uniprot id, we prefere it to the basic uid of id1 (or id1 has the same Upid)
		var delta={'ng':nodes[id1].getNugget()[0],'right':{'nodes':[],'edges':[]},'left':{'nodes':[],'edges':[]}};
		var added_node=putNode(new Node(
                                'n_'+NODE_ID++,
                                union(nodes[id1].getType(),nodes[id2].getType()),
                                nodes[id1].getNugget(),
                                union(nodes[id1].getLabels(),nodes[id2].getLabels()),
                                union(nodes[id1].getValues(),nodes[id2].getValues()),
                                uid
        ));//add the resulting node
		delta.right.nodes=added_node.right.nodes.concat();
		var source_edges=union(edgesBySource[id1],edgesBySource[id2]);//get all the edges from id1 or id2
		var target_edges=rmElements(union(edgesByTarget[id1],edgesByTarget[id2]),source_edges);//get all the edges to id1 or id2, less the edges already in source !
		var edges_delta=[];
		for(var i=0;i<source_edges.length;i++) {
            edges_delta.push(putEdge(new Edge(
                                        'e_'+EDGE_ID++,
                                        edges[source_edges[i]].getType(),
                                        edges[source_edges[i]].getNugget(),
                                        delta.right.nodes[0].getId(),
                                        edges[source_edges[i]].getTarget()
            )));//add a new edge from the merge node to the old target
        }
        for(var i=0;i<target_edges.length;i++) {
            edges_delta.push(putEdge(new Edge(
                                        'e_'+EDGE_ID++,
                                        edges[source_edges[i]].getType(),
                                        edges[source_edges[i]].getNugget(),
                                        edges[source_edges[i]].getSource(),
                                        delta.right.nodes[0].getId()
            )));//add a new edge from the merge node to the old target
        }
        for(var i=0;i<edges_delta.length;i++)
			delta.right.edges.push(edges_delta[i].right.edges[0]);//add all the created edges to the delta
		var n1_rm = this.clNode(id1);
		var n2_rm = this.clNode(id2);
		delta.left.nodes=n1_rm.left.nodes.concat(n2_rm.left.nodes);//add old node to delta.
		delta.left.edges=n1_rm.left.edges.concat(n2_rm.left.edges);//add old edges to delta.
		undoRedo.stack(delta);
		return deltaToId(delta);
	}
	var deltaToId = function(delta){//return an enter/exit object with the id of all elements added/removed for an action.
		var ret ={'enter':[],'exit':[]};
		if(!delta) return ret;
		for(var i=0;delta.right!=null && i<delta.right.nodes.length;i++)
			ret.enter.push(delta.right.nodes[i].getId());
		for(var i=0;delta.right!=null && i<delta.right.edges.length;i++)
			ret.enter.push(delta.right.edges[i].getId());
		for(var i=0;delta.left!=null && i<delta.left.nodes.length;i++)
			ret.exit.push(delta.left.nodes[i].getId());
		for(var i=0;delta.left!=null && i<delta.left.edges.length;i++)
			ret.exit.push(delta.left.edges[i].getId());
		return ret;
	}
	var emptyDelta = function(){//return an empty enter/exit object
		return {"enter":[],"exit":[]};
	}
	this.addNodeLabels = function addNodeLabels(id,l){//add some labels to a node, return an enter/exit object
		if(intersection(l,nodes[id].getLabels()).length==l.length) return emptyDelta();
		var ret={'ng':nodes[id].getNugget()[0],'left':{'nodes':[nodes[id].clone()],'edges':[]},'right':{'nodes':[],'edges':[]}};
		nodes[id].addLabels(l);
		for(var i=0;i<l.length;i++){//add the node id to the nodebylabel hashtable
			if(!fullListCheck(nodesByLabel[l[i]]))
				nodesByLabel[l[i]]=[];
			nodesByLabel[l[i]].push(id);
		}
		ret.right.nodes.push(nodes[id].clone());
		undoRedo.stack(ret);
		return deltaToId(ret);
	};
	this.rmNodeLabels = function rmNodeLabels(id,l){//remove labels from a node if l is null or [], remove all the labels, return an enter/exit object
		var ret={'ng':nodes[id].getNugget()[0],'left':{'nodes':[nodes[id].clone()],'edges':[]},'right':{'nodes':[],'edges':[]}};
		if(!fullListCheck(nodes[id].getLabels())) return emptyDelta();
		var origLsize=nodes[id].getLabels().length;
		if(fullListCheck(l)){//remove the node id from the node by labels hashtable
			
			for(var i=0;i<l.length;i++){
				nodesByLabel[l[i]]=union(nodesByLabel[l[i]],null);
				nodesByLabel[l[i]].splice(nodesByLabel[l[i]].indexOf(id),1);	
			}
		}else{
			var lb=nodes[id].getLabels();
			for(var i=0;i<lb.length;i++){
				nodesByLabel[lb[i]]=union(nodesByLabel[lb[i]],null);
				nodesByLabel[lb[i]].splice(nodesByLabel[lb[i]].indexOf(id),1);
			}				
		}
		if(fullListCheck(l))//rm the node labels
			nodes[id].rmLabels(l);
		else nodes[id].deleteLabels();
		if (nodes[id].getLabels().length()==origLsize) return emptyDelta();
		ret.right.nodes.push(nodes[id].clone());
		undoRedo.stack(ret);
		return deltaToId(ret);
	};
	this.chNodeUid = function chNodeUid(id,uid){//change Node Uid and return an enter/exit object
		if(nodes[id].getUid()==uid) return emptyDelta();
		var ret={'ng':nodes[id].getNugget()[0],'left':{'nodes':[nodes[id].clone()],'edges':[]},'right':{'nodes':[],'edges':[]}};
		nodesByUid[nodes[id].getUid()]=union(nodesByUid[nodes[id].getUid()],nodesByUid[nodes[id].getUid()]);
		nodesByUid[nodes[id].getUid()].splice(nodesByUid[nodes[id].getUid()].indexOf(id),1);//remove the node id from its all uid hashtable
		nodes[id].setUid(uid);//change node uid
		if(uid!=null){
			if(!fullListCheck(nodesByUid[uid]))//add the node id to its new uid hashtable
				nodesByUid[uid]=[];
			nodesByUid[uid].push(id);
		}
		ret.right.nodes.push(nodes[id].clone());
		undoRedo.stack(ret);
		return deltaToId(ret);
	};
	this.addNodeValues = function addNodeValues(id,l){//add some values to a node , return an enter/exit object
		if(intersection(l,nodes[id].getValues()).length==l.length) return emptyDelta();
		var ret={'ng':nodes[id].getNugget()[0],'left':{'nodes':[nodes[id].clone()],'edges':[]},'right':{'nodes':[],'edges':[]}};
		nodes[id].addValues(l);
		ret.right.nodes.push(nodes[id].clone());
		undoRedo.stack(ret);
		return deltaToId(ret);
	};
	this.rmNodeValues = function rmNodeValues(id,l){//remove values from a node if l is null or [], remove all the Values, return an enter/exit object
		var ret={'ng':nodes[id].getNugget()[0],'left':{'nodes':[nodes[id].clone()],'edges':[]},'right':{'nodes':[],'edges':[]}};
		if(!fullListCheck(nodes[id].getValues()))return emptyDelta();
		var origsz=nodes[id].getValues().length;
		if(fullListCheck(l))
			nodes[id].rmValues(l);
		else nodes[id].deleteValues();
		if(nodes[id].getValues().length==origsz) return emptyDelta();
		ret.right.nodes.push(nodes[id].clone());
		undoRedo.stack(ret);
		return deltaToId(ret);
	};
	var putEdge = function(e){//UNSAFE add an edge to the LG, be carefull, this edge must have a none existing ID !
		edges[e.getId()]=e;
        //e.log();
		if(e.getType()=='parent'){//if parenting, add information in the corresponding node
			nodes[e.getSource()].setFather(e.getTarget());
			nodes[e.getTarget()].addSons([e.getSource()]);
		}
		if(!fullListCheck(edgesBySource[e.getSource()])) edgesBySource[e.getSource()]=[];//add the edge to edgesBySource hashtable
		edgesBySource[e.getSource()].push(e.getId());
		if(!fullListCheck(edgesByTarget[e.getTarget()])) edgesByTarget[e.getTarget()]=[];//add the edge to edgesByTarget hashtable
		edgesByTarget[e.getTarget()].push(e.getId());
		if(!fullListCheck(edgesByNuggets[e.getNugget()])) edgesByNuggets[e.getNugget()]=[];//add the edge to edgesByNuggets hashtable
		edgesByNuggets[e.getNugget()].push(e.getId());
		if(!fullListCheck(edgesByType[e.getType()])) edgesByType[e.getType()]=[];//add the edge to edgesByType hashtable
		edgesByType[e.getType()].push(e.getId());
		return {'ng':e.getNugget(),'left':null,'right':{'nodes':[],'edges':[e.clone()]}};
	};
	this.addEdge = function addEdge(t,ng,i,o){//add a NEW edge, return an enter/exit object
		var e=new Edge('e_'+EDGE_ID++,t,ng,i,o);
		var delta=putEdge(e);
		undoRedo.stack(delta);
		return deltaToId(delta);
	};
	var clEdge = function(id){//remove an edge (internal function, return an delta object) calling this function will also clean all redundancy in the edges hashtable
        var e=edges[id];
		if(typeof e=='undefined' || e==null){
			console.log("unExisting edge "+id);
			return null;
		}
		var ret={'ng':e.getNugget()[0],'left':{'nodes':[],'edges':[e.clone()]},'right':null};
		edgesBySource[e.getSource()]=union(edgesBySource[e.getSource()],null);
		edgesBySource[e.getSource()].splice(edgesBySource[e.getSource()].indexOf(id),1);//remove the edge from its source hashtable
		edgesByTarget[e.getTarget()]=union(edgesByTarget[e.getTarget()],null);
		edgesByTarget[e.getTarget()].splice(edgesByTarget[e.getTarget()].indexOf(id),1);//remove the edge from its target hashtable
		edgesByNuggets[e.getNugget()]=union(edgesByNuggets[e.getNugget()],null);
		edgesByNuggets[e.getNugget()].splice(edgesByNuggets[e.getNugget()].indexOf(id),1);//remove the edge from its nugget hashtable
		edgesByType[e.getType()]=union(edgesByType[e.getType()],null);
		edgesByType[e.getType()].splice(edgesByType[e.getType()].indexOf(id),1);//remove the edge from its type hashtable
		delete edges[id];//remove the edge object
		if(e.getType()=='parent'){//remove parenting information if needed
			nodes[e.getSource()].setFather(null);
			nodes[e.getTarget()].rmSons([e.getSource()]);
		}
		return ret;
	};
	this.rmEdge = function rmEdge(id){//remove an edge, return an enter/exit object
		var delta=clEdge(id);
		undoRedo.stack(delta);
		return deltaToId(delta);
	};
	this.getNodeByLabels = function getNodeByLabels(labels){//return a nodes id list corresponding to the specific labels
		var nodes_lists =[];
		for(var i=0;i<labels.length;i++){
			var tmp_l=nodesByLabel[labels[i]];
			if(fullListCheck(tmp_l))
				nodes_lists.push(tmp_l);
		}
		return multiIntersection(nodes_lists);
	};
	this.getNodeByUid = function getNodeByUid(uid){//return the node id corresponding to a specific uid
		var ret=[];
		if(fullListCheck(nodesByUid[uid]))
			ret=nodesByUid[uid].concat();
		return ret;
	};
	this.getNodeByNugget = function getNodeByNugget(n_id){//return all nodes in a specific nugget
		var ret=[];
		if(fullListCheck(nodesByNuggets[n_id]))
			ret=nodesByNuggets[n_id].concat();
		return ret;
	}
	this.getNodeByType = function getNodeByType(t){//return all nodes of a specific type
		var ret=[];
		if(fullListCheck(nodesByTypes[t]))
			ret=nodesByTypes[t].concat();
		return ret;
	}
	this.getEdgeByType = function getEdgeByType(t){//return all edges of a specific type
		var ret=[];
		if(fullListCheck(edgesByType[t]))
			ret=edgesByType[t].concat();
		return ret;
	}
	this.getEdgeBySource = function getEdgeBySource(iid){//return all the edges corresponding to a specific input (id list)
		var ret=[];
		if(fullListCheck(edgesBySource[iid]))
			ret=edgesBySource[iid].concat();
		return ret;
	};
	this.getEdgeByTarget = function getEdgeByTarget(oid){//return all the edges corresponding to a specific output (id list)
		var ret=[];
		if(fullListCheck(edgesByTarget[oid]))
			ret=edgesByTarget[oid].concat()
		return ret;
	};
	this.getEdgeByNugget = function getEdgeByNugget(n_id){//return all edges in a specific nugget
		var ret=[];
		if(fullListCheck(edgesByNuggets[n_id]))
			ret=edgesByNuggets[n_id].concat();
		return ret;
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
		console.log("nodesByTypes : ===================>");
		console.log(nodesByTypes);
		console.log("nodesByLabel : ===================>");
		console.log(nodesByLabel);
		console.log("nodesByUid : ===================>");
		console.log(nodesByUid);
		console.log("nodesByNuggets : ===================>");
		console.log(nodesByNuggets);
		console.log("edgesByType : ===================>");
		console.log(edgesByType);
		console.log("edgesByNuggets : ===================>");
		console.log(edgesByNuggets);
		console.log("edgesBySource : ===================>");
		console.log(edgesBySource);
		console.log("edgesByTarget : ===================>");
		console.log(edgesByTarget);
		
	};
	this.logStack = function logStack(){//log the stack of the layer graph
		undoRedo.log();
	};
	this.undo = function undo(){//Undo the last action and return an exit/enter object
		delta=undoRedo.undo();
		deltaLeft(delta);
		return deltaToId(delta);
	};
	this.redo = function redo(){//redo the last action undowed and return an exit/enter object
		var delta=undoRedo.redo();
		deltaRight(delta);
		return deltaToId(delta);
	};
	this.localUndo = function localUndo(s_id){//undo the last action in a specific nugget and return an exit/enter object
		var delta=undoRedo.localUndo(s_id);
		deltaLeft(delta);
		return deltaToId(delta);
	};
	this.localRedo = function localRedo(s_id){//redo the last undowed action in a specific nugget and return an exit/enter object
		var delta=undoRedo.localRedo(s_id);
		deltaRight(delta);
		return deltaToId(delta);
	};
	this.stackClear = function stackClear(){//clear the whole undo/redo stack
		undoRedo.clear();
	};
	this.stackLocClear = function stackLocClear(s_id){//clear a local stack for the s_id nugget
		undoRedo.clearLocal(s_id);
	};
	this.undoNugget = function undoNugget(s_id){//undo a whole nugget and return an enter/exit object.
		var delta=undoRedo.localUndo(s_id);
		var ret=deltaToId(delta);
		while(delta!=null){
			deltaLeft(delta);
			delta=undoRedo.localUndo(s_id);
			var tmp=deltaToId(delta);
			ret.enter=union(ret.enter,tmp.enter);//acumulator for enter
			ret.exit=union(ret.exit,tmp.exit);//acumulator for exit
		}
		return ret;
	};
	this.redoNugget = function redoNugget(s_id){//redo a whole nugget undowed and return an exit/enter object
		var delta=undoRedo.localRedo(s_id);
		var ret=deltaToId(delta);
		while(delta!=null){
			deltaRight(delta);
			delta=undoRedo.localRedo(s_id);
			var tmp=deltaToId(delta);
			ret.enter=union(ret.enter,tmp.enter);//acumulator for enter
			ret.exit=union(ret.exit,tmp.exit);//acumulator for exit
		}
		return ret;
	};
	var deltaLeft = function(delta){//internal function for the left side of a delta
        if(typeof delta.right!='undefined' && delta.right!=null && fullListCheck(delta.right.edges)) {
            for (var i = 0; i < delta.right.edges.length; i++) {
                clEdge(delta.right.edges[i].getId());
            }
        }
        if(typeof delta.right!='undefined' && delta.right!=null && fullListCheck(delta.right.nodes)) {
			for (var i = 0; i < delta.right.nodes.length; i++)
				clNode(delta.right.nodes[i].getId());
		}
		if(typeof delta.left!='undefined' && delta.left!=null && fullListCheck(delta.left.nodes)) {
			for (var i = 0; i < delta.left.nodes.length; i++)
				putNode(delta.left.nodes[i]);
		}
		if(typeof delta.left!='undefined' && delta.left!=null && fullListCheck(delta.left.edges)) {
			for (var i = 0; i < delta.left.edges.length; i++)
				putEdge(delta.left.edges[i]);
		}
	};
	var deltaRight = function(delta){//internal function for the right side of the delta
		var ret={'enter':[],'exit':[]};
        if(typeof delta.left!='undefined' && delta.left!=null && fullListCheck(delta.left.edges)) {
            for (var i = 0; i < delta.left.edges.length; i++)
                ret.exit.push(clEdge(delta.left.edges[i].getId()));
        }
        if(typeof delta.left!='undefined' && delta.left!=null && fullListCheck(delta.left.nodes)) {
			for (var i = 0; i < delta.left.nodes.length; i++)
				ret.exit.push(clNode(delta.left.nodes[i].getId()));
		}
		if(typeof delta.right!='undefined' && delta.right!=null && fullListCheck(delta.right.nodes)) {
			for (var i = 0; i < delta.right.nodes.length; i++)
				ret.enter.push(putNode(delta.right.nodes[i]));
		}
		if(typeof delta.right!='undefined' && delta.right!=null && fullListCheck(delta.right.edges)) {
			for (var i = 0; i < delta.right.edges.length; i++)
				ret.enter.push(putEdge(delta.right.edges[i]));
		}
	};
    this.getLabels = function getLabels(id){//return the labels of a node
        return getNode(id).getLabels();
    };
    this.getType = function getType(id){//return the type of a node or an edge
        if(idT(id)=='e')
            return getEdge(id).getType();
        else
            return getNode(id).getType();
    };
    this.getFth = function getFth(id){//return the father of a node
        return getNode(id).getFather();
    };
    this.getSons = function getSons(id){//return all the sons of a node
        return getNode(id).getSons();
    };
    this.getNugget = function getNugget(id){//return the nugget of a son or an edge
        if(idT(id)=='e')
            return getEdge(id).getNugget();
        else
            return getNode(id).getNugget();
    };
    this.getValues = function getValues(id){//return the value of a node
        return getNode(id).getValues();
    };
    this.getUid = function getUid(id){//return the uid of a node or an edge
        return getNode(id).getUid();
    };
    /*this.copy = function copy(id){//unsafe ?
    	if(idT(id)=='e') {
			var e=getEdge(id).copy('e_'+EDGE_ID++);
		}	
		else if (idT(id)=='n') return getNode(id).copy('n_'+NODE_ID++);
			else console.error("undefined id type : "+idT(id));
	}*/
    this.getSource = function getSource(id){//return the source of an edge
        return getEdge(id).getSource();
    };
    this.getTarget = function getTarget(id){//return the target of an edge
        return getEdge(id).getTarget();
    };
    this.getLastNodeId = function getLastNodeId(){//return the id of the last node created
        return 'n_'+(NODE_ID-1);
    };
    this.getLastEdgeId = function getLastEdgeId(){//return the id of the last edge created
        return 'e_'+(EDGE_ID-1);
    };
}
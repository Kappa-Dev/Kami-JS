var union = function(s1,s2){//union of two sets view as lists : O(n) where n = max list size
	if(!fullListCheck(s1) && !fullListCheck(s2)) return [];
	//else if(!fullListCheck(s1)) return s2.concat();
	//else if(!fullListCheck(s2)) return s1.concat();
	var obj1={};
	if(fullListCheck(s1)){
		for(var i=0;i<s1.length;i++)
			obj1[s1[i]]=1;
	}if(fullListCheck(s2)){
		for(var i=0;i<s2.length;i++)
			obj1[s2[i]]=1;
	}
	return Object.keys(obj1);
};
var multiUnion = function(s_l){//union over multi sets : O(n²) where n = max list size
	if(!fullListCheck(s_l))
		return [];
	var obj1={};
	for(var i=0;i<s_l.length;i++){
		if(fullListCheck(s_l[i])){
			for(var j=0;j<s_l[i].length;j++)
				obj1[s_l[i][j]]=1;
		}
	}
	return Object.keys(obj1);
};
var intersection = function(s1,s2){//intersection of two sets see as lists : O(n) where n = max list size
	var obj1={};
	if(!fullListCheck(s1) || !fullListCheck(s2)) return [];
	for(var i=0;i<s1.length;i++)
		obj1[s1[i]]=0;
	for(var i=0;i<s2.length;i++){
		if(typeof obj1[s2[i]]!='undefined' && obj1[s2[i]]==0)
			obj1[s2[i]]=1;
	}
	var keys=Object.keys(obj1);
	var ret=[];
	for(var i=0;i<keys.length;i++){
		if(obj1[keys[i]]==1)
			ret.push(keys[i]);
	}
	return ret;
};
var multiIntersection = function(s_l){//intersection over multi sets : O(n²) where n = max list size
	var obj1={};
	if(!fullListCheck(s_l)) return [];
	var sll=s_l.length;
	for(var i=0;i<sll;i++){
		if(!fullListCheck(s_l[i])) return [];
		var obj2={};
		for(var j=0;j<s_l[i].length;j++){
			if(typeof obj1[s_l[i][j]] =='undefined') obj1[s_l[i][j]]=0;
			if(typeof obj2[s_l[i][j]]=='undefined'){
				obj1[s_l[i][j]]++;
				obj2[s_l[i][j]]=0;
			}
		}
	}
	var keys=Object.keys(obj1);
	var ret=[];
	for(var i=0;i<keys.length;i++){
		if(obj1[keys[i]]==sll)
			ret.push(keys[i]);
	}
	return ret;
};
var rmElements = function(s1,s2){//remove all element from the intersection of s2/s1 in s1 : O(n) where n = max list size
	var obj_1={};
	if(!fullListCheck(s1))return [];
	if(!fullListCheck(s2))return union(s1,null);
	for(var i=0;i<s1.length;i++)
		obj_1[s1[i]]=1;
	for(var i=0;i<s2.length;i++){
		if(typeof obj_1[s2[i]] != 'undefined')
		obj_1[s2[i]]=0;
	}
	var obj_k=Object.keys(obj_1);
	var ret=[];
	for(var i=0;i<obj_k.length;i++){
		if(obj_1[obj_k[i]]==1)
			ret.push(obj_k[i]);
	}
	return ret;
};
var fullListCheck = function(l){//verify if a list is defined and not empty : O(1)
	return typeof l!='undefined' && l!=null && l.length>0;
};
var idV = function(id){//get the numerical value of an id : O(1) : size of an id is constant
	return parseInt(id.split('_')[1]);
}
var idT = function(id){//get the header of an id : O(1) : size of an id is constant
	return id.split('_')[0];
}
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
function Edge(ii,t,n,i,o){//generic definition of an adge in a clustered graph
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
		return type;
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
		console.log('nugget : '+nuggets);
		console.log('source : '+source);
		console.log('target : '+target);
		console.log('______________');
	};
	this.clone = function clone(){//create a exact copy of the edge : O(1)
		return new Edge(id,type,nuggets.concat(),source,target);
	};
	this.copy = function copy(i){//create a copy of the edge with a new id : O(1)
		if(i==id) throw new Error("this copy has the same id as the original edge, use clone insteed : "+id);
		return new Edge(i,type,nuggets.concat(),source,target);
	};
}
function UndoRedoStack(){//generic implementation of undo redo as graph rw rules
    var undo_stack =[];//a stack of undo
    var redo_stack =[];//a stack of redo
    var sub_stack = {};//list of nuggets stacks and position {stack:list,pos:int}
    this.stack = function stack(el){//el is a delta object and its position : {ng:nugget id,left{nodes:[node list],edges:[edges list]},right{nodes:[nodes list],edges:[edges list]}}
        if(typeof el=='undefined' || el==null)
            throw new Error("please use stack with an element");
        if(typeof sub_stack[el.ng]=='undefined' || sub_stack[el.ng]==null)//if this nugget have no stack, create one
            sub_stack[el.ng]={"idx":-1,"stack":[]};
        if(sub_stack[el.ng].idx<sub_stack[el.ng].stack.length-1){//if we add an element in the middle of the stack, redo are lost
            var removed=sub_stack[el.ng].stack.length-1-sub_stack[el.ng].idx;
            sub_stack[el.ng].stack.splice(sub_stack[el.ng].idx+1);
            for(var i=redo_stack.length-1,j=1;i>=0 && j<=removed;i--){
                if(redo_stack[i].ng==el.ng && redo_stack[i].idx==sub_stack[el.ng].idx+j){
                    redo_stack.splice(i,1);
                    j++;
                }
            }
        }
        sub_stack[el.ng].stack.push(el);//add the new item
        sub_stack[el.ng].idx=sub_stack[el.ng].stack.length-1;//update index
        undo_stack.push({'ng':el.ng,'idx':sub_stack[el.ng].idx});//update global index
    };
    this.undo = function undo(){//undo the last delta operation and return it
        return this.localUndo(undo_stack[undo_stack.length-1].ng);
    };
    this.redo = function redo(){//redo the last undoed delta action and return it
        return this.localRedo(redo_stack[redo_stack.length-1].ng);
    };
    this.localUndo = function localUndo(s_id){//undo the last delta operation for the s_id cluster and return it
        if(typeof sub_stack[s_id]=='undefined' || sub_stack[s_id]==null || sub_stack[s_id].stack.length==0 || sub_stack[s_id].idx==-1)
            return null;
        for(var i=undo_stack.length-1;i>=0;i--){
            if(undo_stack[i].ng==s_id && undo_stack[i].idx==sub_stack[s_id].idx){
                var remove=undo_stack.splice(i,1);
                redo_stack.push(remove[0]);
                break;
            }
        }
        return sub_stack[s_id].stack[sub_stack[s_id].idx--];
    };
    this.localRedo = function localRedo(s_id){//redo the last undoed delta action for the s_id cluster and return it
        if(typeof sub_stack[s_id]=='undefined' || sub_stack[s_id]==null || sub_stack[s_id].stack.length==0 || sub_stack[s_id].idx==sub_stack[s_id].stack.length-1) {
            return null;
        }
        for(var i=redo_stack.length-1;i>=0;i--){
            if(redo_stack[i].ng==s_id && redo_stack[i].idx==sub_stack[s_id].idx+1){
                var remove=redo_stack.splice(i,1);
                undo_stack.push(remove[0]);
                break;
            }
        }
        var ret=sub_stack[s_id].stack[++sub_stack[s_id].idx];
        console.log(ret);
        return ret;
    };
    this.clear = function clear(){//clear the whole undoredo object
        undo_stack =[];
        redo_stack =[];
        sub_stack = {};
    };
    this.clearLocal = function clearLocal(s_id){//clear a the undo redo object for a specified cluster
        for(var i=redo_stack.length-1;i>=0;i--){
            if(redo_stack[i].ng==s_id){
                redo_stack.splice(i,1);
            }
        }
        for(var i=undo_stack.length-1;i>=0;i--){
            if(undo_stack[i].ng==s_id){
                undo_stack.splice(i,1);
            }
        }
        sub_stack[s_id]=null;
    };
    this.log = function log(){//log the whole undo redo object
        console.log("==== undoRedo logs: ====");
        console.log("undo stack");
        console.log(undo_stack);
        console.log("redo stack");
        console.log(redo_stack);
        console.log("local stack");
        console.log(sub_stack);
    }
}
function LayerGraph(){//An autonomous multi layer graph with optimized modification actions (all in O(1)) except removal/merge in O(Max(node arity)) and undo redo stack with similar time optimizations
	var NODE_ID = 0;//unique id for nodes (actions/components)
	var EDGE_ID = 0;//unique id for edges (linking edges and structure edges)
	var nodes = {};//hashtable of nodes objects, key:id, value:node
	var edges = {};//hashtable of edges objects, key:id, value:edge
	/* !!!! ==== those Hashtable may contain redondent ids ==== !!!! */
	var nodesByLabel = {};//hashtable of nodes, key:label, value :nodes id list
	var nodesByUid = {};//hashtable of nodes, key:uid, value: nodes id list
	var nodesByNuggets = {};//hashtable of nodes, key: nugget id, value:nodes id list
	var nodesByTypes = {};//hashtable of nodes, key: nodes types, values: nodes id list
	var edgesByNuggets = {};//hashtable of edges, key: nugget id, value:edges id list
	var edgesBySource={};//hashtable of edges, key:node input id, values: edges id list
	var edgesByTarget={};//hashtable of edges, key:node output id, values:edges id list
	var edgesByType={}//hashable of edges, key:edge type, values: edges id list
	var undoRedo=new UndoRedoStack();//undo redo stack for this layer graph.
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
		if(fullListCheck(l))
			nodes[id].rmValues(l);
		else nodes[id].deleteValues();
		ret.right.nodes.push(nodes[id].clone());
		undoRedo.stack(ret);
		return deltaToId(ret);
	};
	var putEdge = function(e){//UNSAFE add an edge to the LG, be carefull, this edge must have a none existing ID !
		edges[e.getId()]=e;
        e.log();
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
        return getnode(id).getSons();
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
function Relation(){
    var antecedent_to_image={};//hashtable : key : antecedent, values : images
    var image_from_antecedent={};//hashtable : key : image, values : antecedents
    this.addR = function addR(ant_l,img_l){//add a relation between a list of antecedents and a list of images
        for(var i=0;i<ant_l.length;i++) {
            if(!fullListCheck(antecedent_to_image[ant_l[i]]))
                antecedent_to_image[ant_l[i]]=[];
            antecedent_to_image[ant_l[i]] = union(antecedent_to_image[ant_l[i]], img_l);
        }
        for(var i=0;i<img_l.length;i++) {
            if(!fullListCheck(image_from_antecedent[img_l[i]]))
                image_from_antecedent[img_l[i]]=[];
            image_from_antecedent[img_l[i]] = union(image_from_antecedent[img_l[i]], ant_l);
        }
    };
    this.getImg = function getImg(ant){//get all the images of a specific antecedent
        if(fullListCheck(antecedent_to_image[ant]))
            return antecedent_to_image[ant].concat();
        else {
            console.log(ant + " doesn't exist in R");
            return null;
        }
    };
    this.getAnt = function getAnt(img){//get all the antecedents of a specific image
        if(fullListCheck(image_from_antecedent[img]))
            return image_from_antecedent[img].concat();
        else {
            console.log(img + " doesn't exist in R");
            return null;
        }
    };
    this.clR = function clR(){//clear the whole relation
        antecedent_to_image={};
        image_from_antecedent={};
    };
    this.rmIm = function rmIm(img){//remove a specific image
        if(fullListCheck(image_from_antecedent[img])) {
            for(var i=0;i<image_from_antecedent[img].length;i++){
				
                var idx=antecedent_to_image[image_from_antecedent[img][i]].indexOf(img);
                if(idx>=0)
                    antecedent_to_image[image_from_antecedent[img][i]].splice(idx,1);
                else
                    console.log("unable to find the image "+img+" in the antecedent hashtable");
            }
            image_from_antecedent[img] = [];
        }
    };
    this.rmAnt = function rmAnt(ant){//remove a specific antecedent
        if(fullListCheck(antecedent_to_image[ant])) {
            for(var i=0;i<antecedent_to_image[ant].length;i++){
                var idx=image_from_antecedent[antecedent_to_image[ant][i]].indexOf(ant);
                if(idx>=0)
                    image_from_antecedent[antecedent_to_image[ant][i]].splice(idx,1);
                else
                    console.log("unable to find the antecedent "+ant+" in the image hashtable");
            }

            antecedent_to_image[ant] = [];
        }
    };
    this.rmR = function rmR(ant_l,img_l){//remove all relations between a list of antecedent and a list of images
        for(var i=0;i<ant_l.length;i++){
            for(var j=0;j<img_l.length;j++){
                var idx=antecedent_to_image[ant_l[i]].indexOf(img_l[j]);
                if(idx>=0)
                    antecedent_to_image[ant_l[i]].splice(idx,1);
                idx=image_from_antecedent[img_l[j]].indexOf(ant_l[i]);
                if(idx>=0)
                    image_from_antecedent[img_l[j]].splice(idx,1);
            }
        }
    };
    this.log = function log(){//log a whole relation
        console.log("relations : ===================>");
        console.log("antecedents->images : ===================>");
        var an_to_im=Object.keys(antecedent_to_image);
        for(var i=0;i<an_to_im.length;i++){
            console.log(an_to_im[i]+ " : ");
            console.log(antecedent_to_image[an_to_im[i]].concat());
        }
        console.log("images->antecedents : ===================>");
        var im_to_an=Object.keys(image_from_antecedent);
        for(var i=0;i<im_to_an.length;i++){
            console.log(im_to_an[i]+ " : ");
            console.log(image_from_antecedent[im_to_an[i]].concat());
        }
    };
}
function Tree(label,fth){//simple tree structure
    this.label=label;
    this.sons=[];
    this.fth=fth;
    this.addSon = function addSon(label){
        this.sons.push(new Tree(label,this));
    };
}
function Nugget(i,n,c){//define a nugget structure
	var name = n || i;
	var id = i;
	var comments= c || "";
	var visible = true;
	var main_node = [];
	this.setMnode = function setMnode(id_l){//set the main node of a nugget 
		main_node=id_l.concat();
	};
	this.getMnode = function getMnode(){//get the list of the main nodes of the nugget
		return main_node.concat();
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
		console.log("main nodes : "+main_node.join());
		console.log("---------------");
	};
}
function Kami() {//define the full workflow object, all the modification functions return an enter/exit object for all the graph (ngg, acg, lcg). Allow to do all updates localy !
	var NUGGET_ID = 0;//id of nuggets for the nugget graph
	//var UID = 0;//uid for projection
	var nugg_graph = new LayerGraph();//nuggets graph
	var ngg_R_acg = new Relation();//projection of nuggets into actions
	var act_graph = new LayerGraph();//actions graph
	var acg_R_lcg = new Relation();//projection of actions into LCG
	var lcg = new LayerGraph();//Logical contact graph
	var nuggets ={};//hashtable of all nuggets objects.
	var getLg = function(lg_name){//return the lg graph corresponding to the lg_name
		switch(lg_name){
            case "ACG":
                return act_graph;
            case "NGG":
                return nugg_graph;
            case "LCG":
                return lcg;
			default:
				throw new Error("unknown value : "+lg_name);
        }
	};
	this.getNuggets = function getNuggets(){/* return the list of all nuggets ids as a list (ng_X)*/
		return Object.keys(nuggets);
	};
	this.getNodes = function getNodes(lg_name){//return the whole nodes as a list of id (n_X)
       return getLg(lg_name).getNodes();
    };
	this.getEdges = function getEdges(lg_name){//return the whole edges as a list of id (e_X)
		return getLg(lg_name).getEdges();
	};
	var correctNodeType = function(t){//semantic check for node type
		var MAINTYPE=["component","action","super","attribute"];
		var SUBTYPE=[["agent","region","keyres","flag"],["mod","modpos","modneg","syn","deg","bnd","brk","input","output"],["family","set","process"]];
		return fullListCheck(t) && t.length==2 && MAINTYPE.indexOf(t[0])!=-1 && SUBTYPE[MAINTYPE.indexOf(t[0])].indexOf(t[1])!=-1;
	}
	var correctEdgeType = function(t){//semantic check for edge type
		var MAINTYPE=["link","parent","posinfl","neginfl","rw_rule"];
		return fullListCheck(t) && t.length==1 && MAINTYPE.indexOf(t[0])!=-1
	}
	/* add a new node to Kami
	 * if it is part of a nugget, this node is added to the nugget graph
	 * if this node is a new type, create a new node in the act graph and create a new 'virtual' nugget generating it
	 * this node is projected (typed) by the action graph.
	 * it take a list of type, a nugget number, a label list (or null), a value list(or null) and a uid (or null)
	 * the uid must exist, if it isn't defined a new one is generated 
	 * this function return a delta object containing the enter and exit set for each three layer graph */
	this.addNode = function addNode(t,ng,l,v,u,lg_name){//add a new node to kami : add the node to a nugget, if this nugget is visible, update the acg and the projection function. return the delta corresponding to modified nodes/edges id
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(idT(u)!="up" && (idT(u)!="u"))
			throw new Error("bad uid definition : "+u);
		if(!correctNodeType(t))
			throw new Error("bad type definition : "+t);
		if(lg_name=="NGG" && (idT(ng)!= "ng" || idV(ng)>=NUGGET_ID))
			throw new Error("This nugget isn't defined ! "+ng);
		if(lg_name=="ACG" && fullListCheck(act_graph.getNodeByUid(idV(u))))
			throw new Error("this uid already exist in the action graph : "+u);
		var tmp_ng=ng;
		if(lg_name=="ACG"){
			this.addNugget("Virtual Type Nugget","This nugget was created for the sake of the new UID : "+u+" in the action graph");
			tmp_ng=getLastNugget();
		}
		delta.NGG=nugg_graph.addNode(t,[tmp_ng],l,v,u);
		if(nuggets[tmp_ng].isVisible())
			delta.ACG=updateNRA(delta.NGG);
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.setMainNode = function setMainNode(n_id,n_list){//set a list of nodes as the mains nodes of a nugget, they must be part of this nugget!
		for(var i=1;i<n_list.length;i++){
			if(nugg_graph.getNugget(n_list[i])!=n_id)
				throw new Error("this node : "+n_list[i]+" is not part of the nugget : "+n_id);
		}
		nuggets[n_id].setMnode(n_list);
		return n_id;
	}
	var updateNRA = function(delta){//update the nugget to acg relation. take the enter/exit object from the nugget graph and return the enter/exit object for the Action graph !
		var ret={'exit':[],'enter':[]};
		var exit_update=[];//all the node of the action updated by an exit in the nugget graph.
		var delayed_edges={};
		for(var i=0;i<delta.exit.length;i++){//remove all nodes/edges witch are in the exit segment from the projection table
			var pr_id=ngg_R_acg.getImg(delta.exit[i]);
			if(pr_id.length==0)
				throw new Error("this element doesn't have a projection : "+delta.exit[i]);
			else if(pr_id.length>1)
				throw new Error("this element have more than one projection : "+delta.exit[i]);
			pr_id=pr_id[0];//flatten the one element array.
			exit_update.push(pr_id);
			ngg_R_acg.rmAnt(delta.exit[i]);
		}
		for(var i=0;i<delta.enter.length;i++){//add all nodes/edges of the enter segment in the projection table 
			if(idT(delta.enter[i])=="n"){//projection for nodes
				var tmp_uid=nugg_graph.getUid(delta.enter[i]);
				var pr_id=act_graph.getNodeByUid(tmp_uid);//if the added node image doesn't exit yet, create it. add it to the antecedent of the image node : image node have the same uid !
				if(!pr_id || pr_id.length==0){//create a copy of the nugget node (no sons, no father until we add edges !)
					var tmp_delta=act_graph.addNode(nugg_graph.getType(delta.enter[i]),
												"ng_0",
												nugg_graph.getLabels(delta.enter[i]),
												nugg_graph.getValues(delta.enter[i]),
												nugg_graph.getUid(delta.enter[i]));
					pr_id=act_graph.getLastNodeId();//our projection will be the newly created node !
					ret.enter=union(ret.enter,tmp_delta.enter);
					ret.exit=union(ret.exit,tmp_delta.exit);
				}
				else{//if there is already a corresponding node in the acg, update it if necessary
					pr_id=pr_id[0];//flatten this 1 element list !
					if(intersection(nugg_graph.getLabels(delta.enter[i]),act_graph.getLabels(pr_id)).length!=nugg_graph.getLabels(delta.enter[i]).length){
						var tmp_delta=act_graph.addNodeLabels(pr_id,nugg_graph.getLabels(delta.enter[i]));
						ret.enter=union(ret.enter,tmp_delta.enter);
						ret.exit=union(ret.exit,tmp_delta.exit);
					}
					if(intersection(nugg_graph.getValues(delta.enter[i]),act_graph.getValues(pr_id)).length!=nugg_graph.getValues(delta.enter[i]).length){
						var tmp_delta=act_graph.addNodeValues(pr_id,nugg_graph.getValues(delta.enter[i]));
						ret.enter=union(ret.enter,tmp_delta.enter);
						ret.exit=union(ret.exit,tmp_delta.exit);
					}
					
				}
				ngg_R_acg.addR([delta.enter[i]],[pr_id]);//add the projection relation between this node and the ACG node.
			}
			else if(idT(delta.enter[i])=="e"){//projection for edges !!!!!!!=======!!!!!! trying some unsafe delay ! may need some guards!
				var s_id=nugg_graph.getSource(delta.enter[i]);
				var t_id=nugg_graph.getTarget(delta.enter[i]);
				var pr_s=ngg_R_acg.getImg(s_id)[0];//flatten this one element list
				var pr_t=ngg_R_acg.getImg(t_id)[0];//flatten this one element list
				if(!pr_s || !pr_t){//if the source or target projection doesn't exist yet, delay the edge projection !
					console.log("edge delayed ! "+ delta.enter[i]);
					if(delayed_edges[delta.enter[i]]) throw new Error("source or target of the edge : "+delta.enter[i]+"doesn't exist");
					delayed_edges[delta.enter[i]]=true;
					delta.enter.push(delta.enter[i]);
					delta.enter.splice(i--,1);//don't let i being updated !
				}
				else{
					var pr_e=multiIntersection([act_graph.getEdgeBySource(pr_s),act_graph.getEdgeByTarget(pr_t),act_graph.getEdgeByType(nugg_graph.getType(delta.enter[i]))]);//get all existing edges i the ACG connecting the same source and id
					if (pr_e.length==0){//if there is no edges in the ACG, create an edge and update the delta!
						var tmp_delta=act_graph.addEdge(nugg_graph.getType(delta.enter[i]),"ng_0",pr_s,pr_t);
						ret.enter=union(ret.enter,tmp_delta.enter);
						ret.exit=union(ret.exit,tmp_delta.exit);
						pr_e=act_graph.getLastEdgeId();
					} 
					else if(pr_e.length==1)
						pr_e=pr_e[0];//flatten the one element list
					else throw new Error("more images than excepted for : "+delta.enter[i]);//if there is more than one edge, it is a mistake in the whole code !
					ngg_R_acg.addR([delta.enter[i]],[pr_e]);
				}
			}
			else throw new Error("unknown type of element : "+delta.enter[i]);
		}
		for(var i=0;i<exit_update.length;i++){//for each node exited, check if its projection stay used or not.
			var pr_id=exit_update[i];
			if(ngg_R_acg.getAnt(pr_id)==null || ngg_R_acg.getAnt(pr_id).length==0){//if the projection have no antecedents remaining, remove it from the ACG
				var tmp_delta = this.cleanPR(pr_id);
				ret.exit=union(ret.exit,tmp_delta.exit);
				ret.enter=union(ret.enter,tmp_delta.enter);
			}
		}
		return ret;			
	}
	var cleanPr = function(pr_id){//clear a node in the action graph
		var tmp_delta;
		if(idT(pr_id)=="n"){
			tmp_delta=act_graph.rmNode(pr_id);
		}
		else if(idT(pr_id)=="e"){
			tmp_delta=act_graph.rmEdge(pr_id);
		}
		else throw new Error("unknown type of element : "+delta.exit[i]);
		return tmp_delta;
	}
	this.rmNode = function rmNode(id,lg_name){//remove a specific node and return a delta
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(lg_name=="NGG"){
			var ng=nugg_graph.getNugget(id);
			delta.NGG=nugg_graph.rmNode(id);
			if(nuggets[ng].isVisible())
				delta.ACG=updateNRA(delta.NGG);
		}
		if(lg_name=="ACG"){
			var dl=ngg_R_acg.getAnt(id);
			if(fullListCheck(dl)){
				delta.NGG={"enter":[],"exit":[]};
				for(var i=0;i<dl.length;i++){
					delta.NGG.enter=union(delta.NGG.enter,nugg_graph.rmNode(dl[i]).enter);
					delta.NGG.exit=union(delta.NGG.exit,nugg_graph.rmNode(dl[i]).exit);
				}
			}
			delta.ACG=cleanPr(id);
		}
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.mergeNode = function mergeNode(id1,id2){//merge two node in a third one and return a delta
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(nugg_graph.getNugget(id1)[0]!=nugg_graph.getNugget(id2)[0]){
			console.log("unable to merge node from two different nugget "+id1+" , "+id2);
			return delta;
		}
		var ng=nugg_graph.getNugget(id1)[0];
		delta.NGG=nugg_graph.mergeNode(id1,id2);
		if(nuggets[ng].isVisible())
			delta.ACG=updateNRA(delta.NGG);
		return delta;//delta is the enter/exit structure for each graph of kami
	}
	this.addNodeLabels = function addNodeLabels(id,l,lg_name){//add some labels to a node, return a delta
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(intersection(l,getLg(lg_name).getLabels(id)).length==l.length)
			return delta;
		if(lg_name=="ACG"){
			this.addNugget("ACG_labelExtend","labels added : "+l.join());
			return this.addNode(act_graph.getType(id),this.getLastNugget(),l,null,act_graph.getUid(id));
		}
		if(lg_name=="NGG"){
			delta.NGG=nugg_graph.addNodeLabels(id,l);
			var ng=nugg_graph.getNugget(id)[0];
			if(nuggets[ng].isVisible()){
				delta.ACG=updateNRA(delta.NGG);
				
			}
		}
		return delta;
	};
	this.rmNodeLabels = function rmNodeLabels(id,l,lg_name){//remove labels from a node if l is null or [], remove all the labels, return a delta
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(lg_name=="NGG"){
			var ng=nugg_graph.getNugget(id);
			delta.NGG=nugg_graph.rmNodeLabels(id,l);
			if(nuggets[ng].isVisible())
				delta.ACG=updateNRA(delta.NGG);
		}else if(lg_name=="ACG"){
			var lbNode=[];
			if(!fullListCheck(l)) l=act_graph.getLabels(id);
			console.log(l);
			for(var i=0;i<l.length;i++){
				console.log(l[i]);
				console.log(nugg_graph.getNodeByLabels(l[i]));
				lbNode.push(nugg_graph.getNodeByLabels(l[i]));
			}
			console.log(lbNode);	
			console.log(ngg_R_acg.getAnt(id));
			var dl=intersection(ngg_R_acg.getAnt(id),multiUnion(lbNode));
			console.log(dl);
			if(fullListCheck(dl)){
				delta.NGG={"enter":[],"exit":[]};
				for(var i=0;i<dl.length;i++){
					delta.NGG.enter=union(delta.NGG.enter,nugg_graph.rmNodeLabels(dl[i],l).enter);
					delta.NGG.exit=union(delta.NGG.exit,nugg_graph.rmNodeLabels(dl[i],l).exit);
				}
				delta.ACG=updateNRA(delta.NGG);
			}
		}
		else throw new Error("Unknown graph name : "+lg_name );
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.chNodeUid = function chNodeUid(id,uid,lg_name){//change Node Uid
		return getLg(lg_name).chNodeUid(id,uid,lg_name);
	};
	this.addNodeValues = function addNodeValues(id,l,lg_name){//add some values to a node
		return getLg(lg_name).addNodeValues(id,l,lg_name);
	};
	this.rmNodeValues = function rmNodeValues(id,l,lg_name){//remove values from a node if l is null or [], remove all the Values
		return getLg(lg_name).rmNodeValues(id,l);
	};
	this.addEdge = function addEdge(t,ng,i,o,lg_name){//add a NEW edge 
		return getLg(lg_name).addEdge(t,ng,i,o);
	};
	this.rmEdge = function rmEdge(id,lg_name){//remove an edge
		return getLg(lg_name).rmEdge(id);
	};
	this.getNodeByLabels = function getNodeByLabels(labels,lg_name){//return a nodes id list corresponding to the specific labels
		return getLg(lg_name).getNodeByLabels(labels);
	};
	this.getNodeByUid = function getNodeByUid(uid,lg_name){//return the node id corresponding to a specific uid
		return getLg(lg_name).getNodeByUid(uid);
	};
	this.getNodeByNugget = function getNodeByNugget(n_id,lg_name){//return all nodes in a specific nugget
		return getLg(lg_name).getNodeByNugget(n_id);
	}
	this.getEdgeBySource = function getEdgeBySource(iid,lg_name){//return all the edges corresponding to a specific input (id list)
		return getLg(lg_name).getEdgeBySource(iid);
	};
	this.getEdgeByTarget = function getEdgeByTarget(oid,lg_name){//return all the edges corresponding to a specific output (id list)
		return getLg(lg_name).getEdgeByTarget(oid);
	};
	this.getEdgeByNugget = function getEdgeByNugget(n_id,lg_name){//return all edges in a specific nugget
		return getLg(lg_name).getEdgeByNugget(n_id);
	};
	this.undo = function undo(lg_name){//Undo the last action and return an exit/enter object
		return getLg(lg_name).undo();
	};
	this.redo = function redo(lg_name){//redo the last action undowed and return an exit/enter object
		return getLg(lg_name).redo();
	};
	this.localUndo = function localUndo(s_id,lg_name){//undo the last action in a specific nugget and return an exit/enter object
		return getLg(lg_name).localUndo(s_id);
	};
	this.localRedo = function localRedo(s_id,lg_name){//redo the last undowed action in a specific nugget and return an exit/enter object
		return getLg(lg_name).localRedo(s_id);
	};
	this.stackClear = function stackClear(lg_name){
		getLg(lg_name).stackClear();
	};
	this.stackLocClear = function stackLocClear(s_id,lg_name){
		getLg(lg_name).stackLocClear(s_id);
	};
	this.undoNugget = function undoNugget(s_id,lg_name){//undo a whole nugget and return an enter/exit object.
		return getLg(lg_name).undoNugget(s_id);
	};
	this.redoNugget = function redoNugget(s_id,lg_name){//redo a whole nugget undowed and return an exit/enter object
		return getLg(lg_name).redoNugget(s_id);
	};
    this.getLabels = function getLabels(id,lg_name){
        return getLg(lg_name).getLabels(id);
    };
    this.getType = function getType(id,lg_name){
        return getLg(lg_name).getType(id);
    };
    this.getFth = function getFth(id,lg_name){
        return getLg(lg_name).getFth(id);
    };
    this.getSons = function getSons(id,lg_name){
        return getLg(lg_name).getSons(id);
    };
    this.getNugget = function getNugget(id,lg_name){
        return getLg(lg_name).getNugget(id);
    };
    this.getValues = function getValues(id,lg_name){
        return getLg(lg_name).getValues(id);
    };
    this.getUid = function getUid(id,lg_name){
        return getLg(lg_name).getUid(id);
    };
    this.getSource = function getSource(id,lg_name){
        return getLg(lg_name).getSource(id);
    };
    this.getTarget = function getTarget(id,lg_name){
        return getLg(lg_name).getTarget(id);
    };
    this.getLastNodeId = function getLastNodeId(lg_name){
        return getLg(lg_name).getLastNodeId();
    };
    this.getLastEdgeId = function getLastEdgeId(lg_name){
		return getLg(lg_name).getLastEdgeId();
	};
	this.getLastNugget = function getLastNugget(){
		return "ng_"+(NUGGET_ID-1);
	}
    this.addNugget = function addNugget(n,c){//add a new nugget to Kami background knowledge.
		var ng=new Nugget('ng_'+(NUGGET_ID++),n,c);
		nuggets[ng.getId()]=ng;
		return ng.getId();
	};
	this.showNugget = function showNugget(nid){//add a specific nugget to the action graph.
		nuggets[nid].show();
		return nid;
	};
	this.hideNugget = function hideNugget(nid){
		nuggets[nid].hide();
		return nid;
	}
	this.getNgName = function getNgName(nid){
		return nuggets[nid].getName();
	};
	this.getNgComment = function getNgComment(nid){
		return nuggets[nid].getComment();
	};
	this.isNgVisible = function isNgVisible(nid){
		return nuggets[nid].isVisible()
	};
	this.setNgName = function setNgName(n,nid){
		nuggets[nid].setName(n);
		return nid;
	};
	this.setNgComment = function setNgComment(c,nid){
		nuggets[nid].setComment(c);
		return nid;
	};
	this.log = function log(){
        console.log("Kami : ===================");
        console.log("Nugget graph : ");
        nugg_graph.log();
        console.log("Action graph : ");
        act_graph.log();
        console.log("Logical contact graph : ");
        lcg.log();
        console.log("projections : ===================");
        console.log("Nugget to Action");
        ngg_R_acg.log();
        console.log("Action to LCG");
        acg_R_lcg.log();
		console.log("Nuggets informations : ===================");
		var key=Object.keys(nuggets);
		for(var i=0;i<key.length;i++)
			nuggets[key[i]].log();
    };
}

/* 	kami input/output API
	Nodes have id of form n_X where X is an integer
	Edges have id of form e_X where X is an integer
	Graphs have id of form g_X where X is an integer
	Graphs are called nuggets due to old fashion view of Kami
	A default ROOT is defined as the graph definition (a node linked to itself) 
*/
/* 
	@output : return a list off all graph ids in Kami
*/
function getNuggets()
/*
	add a new empty graph to Kami, the default one has ROOT has father and its id has name
	@input n : the graph name : can be null/undefined
	@input c : a comment for this graph : can be null/undefined
	@input f : this graph father : can be null/undefined, if defined, it must exist
	@output : Error if the father doesn't exist.
*/
function addNugget(n,c,f)
/*
	remove a graph from Kami.
	the force argument remove the whole sub-tree where g_id is the root.
	@input g_id : the graph id
	@input force : a boolean or null/undefined witch are equivalent to false.
	@output : Error if the graph doesn't exist,
	@output	: Error if the graph is ROOT
	@output : Error if the graph have sons and force isn't set to true
*/
function rmNugget(g_id,force)
/*
	return the graph name
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist 
	@output : The graph name
*/
function getNgName(g)
/*
	return the graph comment
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist
	@output : the graph comment
*/
function getNgComment(g)
/*
	return the graph references
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist
	@output : an object {doi:S,meta:S,url:S,publication:S} where S are strings
*/
function getNgRefs(g)
/*
	return the graph father id
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist
	@output : the graph father id 
	@output : null if it is ROOT
*/
function getNgFather(g)
/*
	return the graph sons id
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist
	@output : a list of id 
	@output : an empty list if it is a leaf
*/
function getNgSons(g)
/*
	return the graph visibility state or set it to true/false
	@input g : the graph id
	@input v : boolean, true for show, false for hide. if not defined, insteed, return the visibility value
	@ouptut : Error if the graph doesn't exist
	@output : if v is null/undefined, the visibility value of the graph
*/
function ngVisible(g,v)
/*
	change the graph name
	@input g : the graph id
	@input v : the graph new name
	@ouptut : Error if the graph doesn't exist
*/
function setNgName(g,v)
/*
	change the graph comment
	@input g : the graph id
	@input v : the graph new comment
	@ouptut : Error if the graph doesn't exist
*/
function setNgComment(g,v)
/*
	change the graph doi
	@input g : the graph id
	@input v : the graph new doi
	@ouptut : Error if the graph doesn't exist
*/
function setNgDoi(g,v)
/*
	change the graph publication
	@input g : the graph id
	@input v : the graph new publication
	@ouptut : Error if the graph doesn't exist
*/
function setNgPubli(g,v)
/*
	change the graph url
	@input g : the graph id
	@input v : the graph new url
	@ouptut : Error if the graph doesn't exist
*/
function setNgUrl(g,v)
/*
	change the graph meta
	@input g : the graph id
	@input v : the graph new meta
	@ouptut : Error if the graph doesn't exist
*/
function setNgMeta(g,v)
/*
	verify if a graph has a specific graph as son, or if it as at least one son
	@input g : the graph id
	@input v : the son id or null/undefined
	@ouptut : Error if the graph doesn't exist
	@output : a boolean, true if v is a son of g
	@output : if v isn't defined or null, a boolean, true if g has at least one son
*/
function hasSon(g,v)
/*
	verify if a graph has a specific node
	@input g : the graph id
	@input n_id : the node id
	@ouptut : Error if the graph doesn't exist
	@output : a boolean, true if n_id is a node of g
*/
function nodeExist(g,n_id)
/*
	verify if a graph has a specific edge
	@input g : the graph id
	@input n_id : the edge id
	@ouptut : Error if the graph doesn't exist
	@output : a boolean, true if n_id is an edge of g
*/
function edgeExist(g,n_id)
/*
	return all nodes of a graph
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist
	@output : a list of nodes id
*/
function getNodes(g)
/*
	return all edges of a graph
	@input g : the graph id
	@ouptut : Error if the graph doesn't exist
	@output : a list of edges id
*/
function getEdges(g)
/*
	return all nodes of a graph with a specific set of labels
	@input g : the graph id
	@input v : a list of labels
	@ouptut : Error if the graph doesn't exist
	@output : a list of nodes id
*/
function getNodeByLabels(g,v)
/*
	return all nodes of a graph with a specific type
	@input g : the graph id
	@input v : a type : a node id of the parent graph
	@ouptut : Error if the graph doesn't exist
	@output : a list of nodes id
*/
function getNodeByType(g,v)
/*
	return all edges of a graph with a specific type
	@input g : the graph id
	@input v : a type : an edge id of the parent graph
	@ouptut : Error if the graph doesn't exist
	@output : a list of edges id
*/
function getEdgeByType(g,v)
/*
	return all edges of a graph with a specific source
	@input g : the graph id
	@input v : a node id of g
	@ouptut : Error if the graph doesn't exist
	@output : a list of edges id
*/
function getEdgeBySource(g,v)
/*
	return all edges of a graph with a specific target
	@input g : the graph id
	@input v : a node id of g
	@ouptut : Error if the graph doesn't exist
	@output : a list of edges id
*/
function getEdgeByTarget(g,v)
/*
	return the labels of a node of a graph
	@input g : the graph id
	@input v : a node id of g
	@ouptut : Error if the graph doesn't exist
	@output : a list of labels
*/
function getLabels(g,v)
/*
	return the type of a node of a graph
	@input g : the graph id
	@input v : a node id of g
	@ouptut : Error if the graph doesn't exist
	@output : a node id from g father
*/
function getType(g,v)
/*
	return all the node linked with an output edge of a specific type to a specific node
	@input g : the graph id
	@input id : a node id of g
	@input e_t : an edge type (an edge id of g father) or null/undefined
	@ouptut : Error if the graph doesn't exist
	@output : a list of node linked to id with an e_t output edge
	@output : if e_t is null/undefined, return all nodes linked to id with an output edge
*/
function getOutputNodes(g,id,e_t)
/*
	return all the node linked with an input edge of a specific type to a specific node
	@input g : the graph id
	@input id : a node id of g
	@input e_t : an edge type (an edge id of g father) or null/undefined
	@ouptut : Error if the graph doesn't exist
	@output : a list of node linked to id with an e_t output edge
	@output : if e_t is null/undefined, return all nodes linked to id with an input edge
*/
function getInputNodes(g,id,e_t)
/*
	return the source of a specific edge of g
	@input g : the graph id
	@input v : an edge id
	@ouptut : Error if the graph doesn't exist
	@output : a node id 
*/
function getSource(g,v)
/*
	return the target of a specific edge of g
	@input g : the graph id
	@input v : an edge id
	@ouptut : Error if the graph doesn't exist
	@output : a node id 
*/
function getTarget(g,v)
/*
	verify if a node has a specific label
	@input g : the graph id
	@input id : the node id
	@input v : the label
	@ouptut : Error if the graph doesn't exist
	@output : a boolean, true if id has the label v
*/
function hasLabel(g,id,v)
/*
	verify if a node has a specific input node with an edge of type t
	@input g : the graph id
	@input id : the node id
	@input v : the input node id
	@input t : the input edge type (id of node of g father) or null/undefined
	@ouptut : Error if the graph doesn't exist
	@output : a boolean, true if id has the input node v from an input edge t
	@output : if t is null/undefined : a boolean, true if id has the input node v
*/
function hasInputNode(g,id,v,t)
/*
	verify if a node has a specific output node
	@input g : the graph id
	@input id : the node id
	@input v : the output node id
	@input t : the output edge type (id of node of g father) or null/undefined
	@ouptut : Error if the graph doesn't exist
	@output : a boolean, true if id has the output node v from an output edge t
	@output : if t is null/undefined : a boolean, true if id has the output node v
*/
function hasOutputNode(g,id,v,t)
/*
	add a new node to a specific graph
	@input g : the graph id : can't be ROOT
	@input t : the node type (an id from g father)
	@input l : a string list : the node labels
	@input rec : a boolean, if true : add reccursively a new node to all sons of g etc...
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
*/
function addNode(g,t,l,rec)
/*
	add a new edge to a specific graph
	@input g : the graph id : can't be ROOT
	@input t : the edge type (an id from g father)
	@input i : a node id
	@input o : a node id
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
	@output : Error if i or o are not defined
*/
function addEdge(g,t,i,o)
/*
	remove a node of a specific graph, it also remove all the edges linked to this node
	@input g : the graph id : can't be ROOT
	@input n_id : the node id
	@input force : a boolean, if true : remove reccursively all nodes typed by n_id in g sons etc...
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
	@output : Error if n_id doesn't correspond to a node of g
	@output : Error if there is nodes typed by n_id and force=false
*/
function rmNode(g,n_id,force)
/*
	remove an edge of a specific graph
	@input g : the graph id : can't be ROOT
	@input e_id : the edge id
	@input force : a boolean, if true : remove reccursively all edges typed by e_id in g sons etc...
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
	@output : Error if e_id doesn't correspond to an edge of g
	@output : Error if there is edges typed by e_id and force=false
*/
function rmEdge(g,e_id,force)
/*
	merge two nodes of a specifi graph, all nodes typed by n_id1 or n_id2 become typed by the new node
	@input g : the graph id : can't be ROOT
	@input n_id1 : the first node id
	@input n_id2 : the second node id
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
	@output : Error if n_id1 or n_id2 doesn't correspond to a node of g
*/
function merge(g,n_id1,n_id2)
/*
	clone a specific node and all its edges
	@input g : the graph id : can't be ROOT
	@input n_id : the node id
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
	@output : Error if n_id doesn't correspond to a node of g
*/
function clone(g,n_id)
/*
	log the whole Kami structure in the js console
*/
function log()
/*
	search a specific pattern in a graph
	@input g : the graph id
	@input pattern : a LayerGraph object typed by g'parent
	@ouptut : Error if the graph doesn't exist
	@output : a list of LayerGraph corresponding to all the matching. [] if there is no match
*/
function search(pattern)
/*
	search and replace a specific pattern in a graph
	@input g : the graph id
	@input pattern : a LayerGraph object typed by g !
	@input rule : the rule to apply : an object {enter:{nodes:[],edges:[]},exit:{nodes:[],edges:[]}} or a list of atomic functions call
	@ouptut : Error if the graph doesn't exist
	@ouptut : Error if g is g_0 (ROOT)
*/
function replace(pattern,rule)
/* 
	undo the last action of a graph, or of the whole kami object if g is null/undefined
	@input g : the graph id or null/undefined
*/	
function undo(g)
/* 
	redo the last action of a graph, or of the whole kami object if g is null/undefined
	@input g : the graph id or null/undefined
*/	
function redo(g)
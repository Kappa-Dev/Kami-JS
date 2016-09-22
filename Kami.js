/*
Kami contain a list of nuggets and there projection on a type graph called action graph.
Kami is also able to transform those generic graph into site graph
compatible with simulation using a predefined set of rewriting rules.
The result of those rules is what we call the LCG and Kappa graph.
Kami also take as "semantic constraints" a set of rules to apply to the whole nugget/action graph!
define the full workflow object, all the modification functions return an enter/exit
object for all the graph (ngg, acg, lcg,kag). Allow to do all updates localy !
*/
	/* add a new node to Kami
	 * if it is part of a nugget, this node is added to the nugget graph
	 * if this node is a new "type", create a new node in the act graph and create a new 'virtual' nugget generating it
	 * this node is projected (typed) by the action graph.
	 * it take a list of type, a nugget number, a label list (or null), a value list(or null) and a uid (or null)
	 * the uid must exist, if it isn't defined a new one is generated 
 */
	/* add a new edge to Kami
	 * edges are oriented !
	 * if it is part of a nugget, this node is added to the nugget graph
	 * if this edge is a new one, create a new edge in the act graph and create a new 'virtual' nugget generating it
	 * this edge is projected (typed) by the action graph.
	 * it take a list of type, a nugget number, a source and a target.
	 * an edge doesn't have is own uid. it will be projected according to its node and target uid
 */
function Kami(){
	var NUGGET_ID = 0;//id of nuggets for the nugget graph
	//var UID = 0;//uid for projection
	var nugg_graph = new LayerGraph();//nuggets graph
	var ngg_R_acg = new Relation();//projection of nuggets into actions : contains nodes and edges (maybe edges are useless !)
	var act_graph = new LayerGraph();//actions graph
	var acg_R_lcg = new Relation();//projection of actions into LCG : only contains nodes
	var kag_R_lcg = new Relation();//prejection of kappa nuggets into the LCG
	var lcg = new LayerGraph();//Logical contact graph
	var kag = new LayerGraph();//kappa nuggets derivied from LCG
	var nuggets ={};//hashtable of all nuggets objects.
	var viewable_nuggets={};
	var always_conflict=false;
	var semantic_check={"local":[],"global":[]};
	var convert_rules={};
	this.globalSemanticCheck = function globalSemanticCheck(){
		
	};
	this.setSemanticConstraints = function setSemanticCOnstraints(sem_ct){//set all the semantic constraints rules
		if(!sem_ct){
			console;log("Semantic constraints cleanup");
			semantic_check={"local":[],"global":[]};
		}
		semantic_check.local=sem_ct.local;
		semantic_check.global=sem_ct.global;
		/*var correctNodeType = function(t){//semantic check for node type
		var MAINTYPE=["component","action","super","attribute"];
		var SUBTYPE=[["agent","region","keyres","flag"],["mod","modpos","modneg","syn","deg","bnd","brk","input","output"],["family","set","process"]];
		return fullListCheck(t) && (t[0]=="attribute" || (t.length==2 && MAINTYPE.indexOf(t[0])!=-1 && SUBTYPE[MAINTYPE.indexOf(t[0])].indexOf(t[1])!=-1));
	}
	var correctEdgeType = function(t){//semantic check for edge type
		var MAINTYPE=["link","parent","posinfl","neginfl","rw_rule","depend"];
		return fullListCheck(t) && MAINTYPE.indexOf(t[0])!=-1;
	}*/
	}
	var localSemanticCheck = function (delta){//this fonction is called using the user defined semantic checks.
		return delta;
	}
	this.setConvertRules = function setConvertRules(rules){//set the LCG covnersion rules.
		if(!rules){
			console.log("No convertion rules : LCG set to identity");
			convert_rules={};
		}
		convert_rules=rules;
	}
	this.cleanLCG = function cleanLCG(){
		lcg=new LayerGraph();
		kag=new LayerGraph();
		acg_R_lcg = new Relation();
		kag_R_lcg = new Relation();
	}
	this.setDefaultConflictRule = function setDefaultConflictRule(val){
		always_conflict=val;
	};
	var getLg = function(lg_name){//return the lg graph corresponding to the lg_name
		if(!lg_name)return nugg_graph;
		switch(lg_name){
            case "ACG":
                return act_graph;
            case "NGG":
                return nugg_graph;
            case "LCG":
                return lcg;
			case "KAG":
				return kag;
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
	var newInstanceOf = function(id,ng){//create a new instance of an existing node in the action graph
		if(!act_graph.nodeExist(id)) throw new Error("unexisting node in action graph : "+id);
		return nugg_graph.addNode(act_graph.getType(id),ng,act_graph.getLabels(id),act_graph.getValues(id),act_graph.getUid(id));
	}
	this.addNode = function addNode(t,ng,l,v,u,lg_name){//add a new node to kami : add the node to a nugget, if this nugget is visible, update the acg and the projection function. return the delta corresponding to modified nodes/edges id
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(idT(u)!="up" && (idT(u)!="u"))
			throw new Error("bad uid definition : "+u);
		if(lg_name=="NGG" && (idT(ng)!= "ng" || idV(ng)>=NUGGET_ID))
			throw new Error("This nugget isn't defined ! "+ng);
		if(lg_name=="ACG" && fullListCheck(act_graph.getNodeByUid(idV(u))))
			throw new Error("this uid already exist in the action graph : "+u);
		var tmp_ng=ng;
		if(lg_name=="ACG"){
			this.addNugget("Virtual Type Nugget","This nugget was created for the sake of the new UID : "+u+" in the action graph");
			tmp_ng=this.getLastNugget();
		}
		delta.NGG=nugg_graph.addNode(t,[tmp_ng],l,v,u);
		if(nuggets[tmp_ng].isVisible())
			delta.ACG=updateNRA(localSemantickCheck(delta.NGG));
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
	var exitNRA = function(delta){//remove all nodes/edges witch are in the exit segment from the projection table
		var exit_update=[];//all the node of the action updated by an exit in the nugget graph.
		for(var i=0;i<delta.exit.length;i++){
			var pr_id=ngg_R_acg.getImg(delta.exit[i]);
			if(pr_id.length==0)
				throw new Error("this element doesn't have a projection : "+delta.exit[i]);
			else if(pr_id.length>1)
				throw new Error("this element have more than one projection : "+delta.exit[i]);
			pr_id=pr_id[0];//flatten the one element array.
			exit_update.push(pr_id);
			ngg_R_acg.rmAnt(delta.exit[i]);
		}
		return exit_update;
	}
	var enterNNRA = function(delta,i){//add all the new edge of the enter segment
		var tmp_uid=nugg_graph.getUid(delta.enter[i]);
		var pr_id=act_graph.getNodeByUid(tmp_uid);//if the added node image doesn't exit yet, create it. add it to the antecedent of the image node : image node have the same uid !
		var tmp_delta={'exit':[],'enter':[]};
		if(!pr_id || pr_id.length==0){//create a copy of the nugget node (no sons, no father until we add edges !)
			tmp_delta=act_graph.addNode(nugg_graph.getType(delta.enter[i]),
				"ng_0",
				nugg_graph.getLabels(delta.enter[i]),
				nugg_graph.getValues(delta.enter[i]),
				nugg_graph.getUid(delta.enter[i]));
			pr_id=act_graph.getLastNodeId();//our projection will be the newly created node !
		}
		else{//if there is already a corresponding node in the acg, update it if necessary
			pr_id=pr_id[0];//flatten this 1 element list !
			if(intersection(nugg_graph.getLabels(delta.enter[i]),act_graph.getLabels(pr_id)).length!=nugg_graph.getLabels(delta.enter[i]).length){
				tmp_delta=act_graph.addNodeLabels(pr_id,nugg_graph.getLabels(delta.enter[i]));
			}
			if(intersection(nugg_graph.getValues(delta.enter[i]),act_graph.getValues(pr_id)).length!=nugg_graph.getValues(delta.enter[i]).length){
				tmp_delta=act_graph.addNodeValues(pr_id,nugg_graph.getValues(delta.enter[i]));
			}		
		}
		ngg_R_acg.addR([delta.enter[i]],[pr_id]);//add the projection relation between this node and the ACG node.
		return tmp_delta;
	}
	var enterENRA = function(e_list,i){//add needed edges the e_list contains only the needed edges (no enter/exit structure)
		var s_id=nugg_graph.getSource(e_list[i]);
		var t_id=nugg_graph.getTarget(e_list[i]);
		var pr_s=ngg_R_acg.getImg(s_id)[0];//flatten this one element list
		var pr_t=ngg_R_acg.getImg(t_id)[0];//flatten this one element list
		var tmp_e_list={"enter":[],"exit":[]};
		var pr_e=multiIntersection([act_graph.getEdgeBySource(pr_s),act_graph.getEdgeByTarget(pr_t),act_graph.getEdgeByType(nugg_graph.getType(e_list[i]))]);//get all existing edges i the ACG connecting the same source and id
		if (pr_e.length==0){//if there is no edges in the ACG, create an edge and update the e_list!
			var tmp_e_list=act_graph.addEdge(nugg_graph.getType(e_list[i]),"ng_0",pr_s,pr_t);
			pr_e=act_graph.getLastEdgeId();
		} 
		else if(pr_e.length==1)
			pr_e=pr_e[0];//flatten the one element list
		else throw new Error("more images than excepted for : "+e_list[i]);//if there is more than one edge, it is a mistake in the whole code !
		ngg_R_acg.addR([e_list[i]],[pr_e]);
		return tmp_e_list;
	}
	var updateNRA = function(delta){//update the nugget to acg relation. take the enter/exit object from the nugget graph and return the enter/exit object for the Action graph !
		var ret={'exit':[],'enter':[]};
		var exit_update=exitNRA(delta);//all the node of the action updated by an exit in the nugget graph.
		var delayed_edges=[];
		for(var i=0;i<delta.enter.length;i++){//add all nodes/edges of the enter segment in the projection table 
			if(idT(delta.enter[i])=="n"){//projection for nodes
				var tmp_delta=enterNNRA(delta,i);
				ret.enter=union(ret.enter,tmp_delta.enter);
				ret.exit=union(ret.exit,tmp_delta.exit);
			}
			else if(idT(delta.enter[i])=="e") delayed_edges.push(delta.enter[i]);
			else throw new Error("unknown type of element : "+delta.enter[i]);
		}
		for(var i=0;i<delayed_edges.length;i++){
			var tmp_delta=enterENRA(delayed_edges,i);
			ret.enter=union(ret.enter,tmp_delta.enter);
			ret.exit=union(ret.exit,tmp_delta.exit);
		}
		for(var i=0;i<exit_update.length;i++){//for each node exited, check if its projection stay used or not.
			var pr_id=exit_update[i];
			if(ngg_R_acg.getAnt(pr_id)==null || ngg_R_acg.getAnt(pr_id).length==0){//if the projection have no antecedents remaining, remove it from the ACG
				var tmp_delta = cleanPr(pr_id);
				ret.exit=union(ret.exit,tmp_delta.exit);
				ret.enter=union(ret.enter,tmp_delta.enter);
			}
		}
		return ret;			
	}
	var cleanPr = function(pr_id){//clear a node/edge in the action graph
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
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		}
		if(lg_name=="ACG"){
			var dl=ngg_R_acg.getAnt(id);
			if(fullListCheck(dl)){
				delta.NGG={"enter":[],"exit":[]};
				for(var i=0;i<dl.length;i++){
					var tmp_delta=nugg_graph.rmNode(dl[i]);
					delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
					delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
				}
			}
			ngg_R_acg.rmIm(id);
			delta.ACG=cleanPr(id);
		}
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.mergeNode = function mergeNode(id1,id2,lg_name){//merge two node in a third one and return a delta
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(lg_name=="NGG"){
			if(nugg_graph.getNugget(id1)!=nugg_graph.getNugget(id2)) 
				throw new Error("unable to merge node from two different nugget "+id1+" , "+id2);
			var ng=nugg_graph.getNugget(id1);
			delta.NGG=nugg_graph.mergeNode(id1,id2);
			if(nuggets[ng].isVisible())
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		}else if(lg_name=="ACG"){
			var uid1=nugg_graph.getNodeByUid(act_graph.getUid(id1));
			var uid2=nugg_graph.getNodeByUid(act_graph.getUid(id2));
			ngg_R_acg.rmIm(id1);
			ngg_R_acg.rmIm(id2);
			delta.ACG=act_graph.mergeNode(id1,id2);
			var newn=act_graph.getLastNodeId();
			delta.NGG={"enter":[],"exit":[]};
			for(var i=0;i<uid1.length;i++){
				var tmp_delta=nugg_graph.chNodeUid(uid1[i],act_graph.getUid(newn));
				delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
				delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
				ngg_R_acg.addR(uid1[i],newn);
			}for(var i=0;i<uid2.length;i++){
				var tmp_delta=nugg_graph.chNodeUid(uid2[i],act_graph.getUid(newn));
				delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
				delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
				ngg_R_acg.addR(uid2[i],newn);
			}
		}else throw new Error("unknown lg name : "+lg_name);
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
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
				
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
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		}else if(lg_name=="ACG"){
			var lbNode=[];
			if(!fullListCheck(l)) l=act_graph.getLabels(id);
			for(var i=0;i<l.length;i++){
				lbNode.push(nugg_graph.getNodeByLabels([l[i]]));
			}
			var dl=intersection(ngg_R_acg.getAnt(id),multiUnion(lbNode));
			if(fullListCheck(dl)){
				delta.NGG={"enter":[],"exit":[]};
				for(var i=0;i<dl.length;i++){
					var tmp_delta=nugg_graph.rmNodeLabels(dl[i],l);
					delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
					delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
				}
				delta.ACG=act_graph.rmNodeLabels(id,l);
			}
		}
		else throw new Error("Unknown graph name : "+lg_name );
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.chNodeUid = function chNodeUid(id,uid,lg_name){//change Node Uid return a delta object
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(lg_name=="NGG"){
			if(nugg_graph.getUid(id)!=uid)
				return delta;
			var ng=nugg_graph.getNugget(id);
			delta.NGG=nugg_graph.chNodeUid(id,uid);
			if(nuggets[ng].isVisible())
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		}else if(lg_name=="ACG"){
			if(fullListCheck(act_graph.getNodeByUid(uid)))
				throw new Error("This UID : "+uid+" already exists in the contact map, please use merge instead !");
			var uid1=nugg_graph.getNodeByUid(act_graph.getUid(id));
			//ngg_R_acg.rmIm(id);
			delta.ACG=act_graph.chNodeUid(id,uid);
			delta.NGG={"enter":[],"exit":[]};
			for(var i=0;i<uid1.length;i++){
				var tmp_delta=nugg_graph.chNodeUid(uid1[i],uid);
				delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
				delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
			}
		}else throw new Error("unknown lg name : "+lg_name);
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.addNodeValues = function addNodeValues(id,l,lg_name){//add some values to a node, return a delta object.
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(fullListCheck(l) && intersection(l,getLg(lg_name).getValues(id)).length==l.length)
			return delta;
		if(lg_name=="ACG"){
			this.addNugget("ACG_valueExtend","values added : "+l.join());
			return this.addNode(act_graph.getType(id),this.getLastNugget(),null,l,act_graph.getUid(id));
		}
		if(lg_name=="NGG"){
			delta.NGG=nugg_graph.addNodeValues(id,l);
			var ng=nugg_graph.getNugget(id)[0];
			if(nuggets[ng].isVisible()){
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
				
			}
		}
		return delta;
	};
	this.rmNodeValues = function rmNodeValues(id,l,lg_name){//remove values from a node if l is null or [], remove all the Values
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(lg_name=="NGG"){
			var ng=nugg_graph.getNugget(id);
			delta.NGG=nugg_graph.rmNodeValues(id,l);
			if(nuggets[ng].isVisible())
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		}else if(lg_name=="ACG"){
			var lbNode=[];
			if(!fullListCheck(l)) l=act_graph.getValues(id);
			var dl=ngg_R_acg.getAnt(id);
			if(fullListCheck(dl)){
				delta.NGG={"enter":[],"exit":[]};
				for(var i=0;i<dl.length;i++){
					var tmp_delta=nugg_graph.rmNodeValues(dl[i],l);
					delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
					delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
				}
				delta.ACG=act_graph.rmNodeValues(id,l);
			}
		}
		else throw new Error("Unknown graph name : "+lg_name );
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.addEdge = function addEdge(t,ng,i,o,lg_name){//add a NEW edge 
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(!correctEdgeType(t))
			throw new Error("bad type definition : "+t);
		if(!getLg(lg_name).nodeExist(i)) throw new Error("the input node doesn't exist "+i);
		if(!getLg(lg_name).nodeExist(o)) throw new Error("the output node doesn't exist "+o);
		if(lg_name=="NGG" && (idT(ng)!= "ng" || idV(ng)>=NUGGET_ID))
			throw new Error("This nugget isn't defined ! "+ng);
		if(getLg(lg_name).getNugget(i)!=ng || getLg(lg_name).getNugget(o)!=ng) throw new Error("the input ("+i+") or output ("+o+") node ar not part of the nugget "+ng);
		var the_edge = multiIntersection([act_graph.getEdgeBySource(i),act_graph.getEdgeByTarget(o),act_graph.getEdgeByType(t)]);
		if(lg_name=="ACG" && fullListCheck(the_edge))
			throw new Error("this edge already exist in the action graph : "+i+", "+o);
		var tmp_ng=ng;
		delta.NGG={"enter":[],"exit":[]};
		if(lg_name=="ACG"){
			this.addNugget("Virtual Edge Nugget","This nugget was created for the sake of the new Edge : from : "+i+" to : "+o+" in the action graph");
			tmp_ng=this.getLastNugget();
			var tmp_delta1=newInstanceOf(i,tmp_ng);
			i=nugg_graph.getLastNodeId();
			var tmp_delta2=newInstanceOf(o,tmp_ng);
			o=nugg_graph.getLastNodeId();
			delta.NGG.enter=multiUnion([delta.NGG.enter,tmp_delta1.enter,tmp_delta2.enter]);
			delta.NGG.exit=multiUnion([delta.NGG.exit,tmp_delta1.exit,tmp_delta2.exit]);
		}
			var tmp_delta=nugg_graph.addEdge(t,tmp_ng,i,o);
			delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
			delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
		if(nuggets[tmp_ng].isVisible())
			delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		return delta;//delta is the enter/exit structure for each graph of kami
	};
	this.rmEdge = function rmEdge(id,lg_name){//remove an edge
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(lg_name=="NGG"){
			var ng=nugg_graph.getNugget(id);
			delta.NGG=nugg_graph.rmEdge(id);
			if(nuggets[ng].isVisible())
				delta.ACG=updateNRA(localSemanticCheck(delta.NGG));
		}
		if(lg_name=="ACG"){
			var dl=ngg_R_acg.getAnt(id);
			if(fullListCheck(dl)){
				delta.NGG={"enter":[],"exit":[]};
				for(var i=0;i<dl.length;i++){
					var tmp_delta=nugg_graph.rmEdge(dl[i]);
					delta.NGG.enter=union(delta.NGG.enter,tmp_delta.enter);
					delta.NGG.exit=union(delta.NGG.exit,tmp_delta.exit);
				}
			}
			ngg_R_acg.rmIm(id);
			delta.ACG=cleanPr(id);
		}
		return delta;//delta is the enter/exit structure for each graph of kami
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
		var delta={"NGG":null,"ACG":null,"LCG":null};
		var tmp_ng;
		if(lg_name=="NGG"){
			var tmp_delta=nugg_graph.undo();
			if(!tmp_delta || (!fullListCheck(tmp_delta.enter) && fullListCheck(tmp_delta.exit))) return delta;//if there is no modification, return an unmodified delta
			if(fullListCheck(tmp_delta.enter)) tmp_ng=nugg_graph.getNugget(tmp_delta.enter[0]);//if the modofication is from the enter get the nugget
			if(fullListCheck(tmp_delta.exit)) tmp_ng=nugg_graph.getNugget(tmp_delta.exit[0]);//if the modification is from the exit, get the nugget.
			delta.NGG=tmp_delta;
			if(nuggets[tmp_ng].isVisible())
				delta.ACG=updateNRA(delta.NGG);
		}
		else if(lg_name=="ACG"){
			console.log("not implemented !");
		}
		else if(lg_name=="LCG") delta.LCG=lcg.undo();
		else throw new Error("unknown graph name "+lg_name);
		return delta;
	};
	this.redo = function redo(lg_name){//redo the last action undowed and return an exit/enter object
		var delta={"NGG":null,"ACG":null,"LCG":null};
		var tmp_ng;
		if(lg_name=="NGG"){
			var tmp_delta=nugg_graph.redo();
			if(!tmp_delta || (!fullListCheck(tmp_delta.enter) && fullListCheck(tmp_delta.exit))) return delta;//if there is no modification, return an unmodified delta
			if(fullListCheck(tmp_delta.enter)) tmp_ng=nugg_graph.getNugget(tmp_delta.enter[0]);//if the modofication is from the enter get the nugget
			if(fullListCheck(tmp_delta.exit)) tmp_ng=nugg_graph.getNugget(tmp_delta.exit[0]);//if the modification is from the exit, get the nugget.
			delta.NGG=tmp_delta;
			if(nuggets[tmp_ng].isVisible())
				delta.ACG=updateNRA(delta.NGG);
		}
		else if(lg_name=="ACG"){
			console.log("not implemented !");
		}
		else if(lg_name=="LCG") delta.LCG=lcg.redo();
		else throw new Error("unknown graph name "+lg_name);
		return delta;
	};
	this.localUndo = function localUndo(s_id){//undo the last action in a specific nugget and return an exit/enter object
		var delta={"NGG":null,"ACG":null,"LCG":null};
		
			var tmp_ng=s_id;
			delta.NGG=nugg_graph.localUndo(s_id);
			if(nuggets[tmp_ng].isVisible())
				delta.ACG=updateNRA(delta.NGG);
		return delta;
	};
	this.localRedo = function localRedo(s_id){//redo the last undowed action in a specific nugget and return an exit/enter object
		var delta={"NGG":null,"ACG":null,"LCG":null};
		var tmp_ng=s_id;
		delta.NGG=nugg_graph.localRedo(s_id);
		if(nuggets[tmp_ng].isVisible())
			delta.ACG=updateNRA(delta.NGG);
		return delta;
	};
	this.stackClear = function stackClear(lg_name){//clear the whole undo redo stack of nugget graph and action graph
		if(lg_name=="NGG" || lg_name=="ACG"){
			nugg_graph.stackClear();
			act_graph.stackClear();
		}
		else if(lg_name=="LCG") lcg.stackClear();
		
	};
	this.stackLocClear = function stackLocClear(s_id){//clear a specific stack from the nugget graph
		nugg_graph.stackLocClear(s_id);
	};
	this.undoNugget = function undoNugget(s_id){//undo a whole nugget and return an enter/exit object.
		var delta={"NGG":null,"ACG":null,"LCG":null};
		var tmp_ng=s_id;
		delta.NGG=nugg_graph.undoNugget(s_id);
		if(nuggets[tmp_ng].isVisible())
			delta.ACG=updateNRA(delta.NGG);
		return delta;
	};
	this.redoNugget = function redoNugget(s_id){//redo a whole nugget undowed and return an exit/enter object
		var delta={"NGG":null,"ACG":null,"LCG":null};
		var tmp_ng=s_id;
		delta.NGG=nugg_graph.redoNugget(s_id);
		if(nuggets[tmp_ng].isVisible())
			delta.ACG=updateNRA(delta.NGG);
		return delta;
	};
    this.getLabels = function getLabels(id,lg_name){//return the labels of a specific node of a specific graph
        return getLg(lg_name).getLabels(id);
    };
    this.getType = function getType(id,lg_name){//return the types of a specific node/edge of a specific graph
        return getLg(lg_name).getType(id);
    };
    this.getFth = function getFth(id,lg_name){//return the father of a specific node of a specific graph
        return getLg(lg_name).getFth(id);
    };
    this.getSons = function getSons(id,lg_name){//return the sons of a specific node of a specific graph
        return getLg(lg_name).getSons(id);
    };
    this.getNugget = function getNugget(id,lg_name){//return the nugget of a specific node/edge of a specific graph
        return getLg(lg_name).getNugget(id);
    };
	this.getViewableNugget = function getViewableNugget(){
		return Object.keys(viewable_nuggets);
	}
    this.getValues = function getValues(id,lg_name){//return the values of a specific node of a specific graph
        return getLg(lg_name).getValues(id);
    };
    this.getUid = function getUid(id,lg_name){//return the uid of a specific node of a specific graph
        return getLg(lg_name).getUid(id);
    };
    this.getSource = function getSource(id,lg_name){//return the source of a specific edge of a specific graph
        return getLg(lg_name).getSource(id);
    };
    this.getTarget = function getTarget(id,lg_name){//return the target of a specific edge of a specific graph
        return getLg(lg_name).getTarget(id);
    };
    this.getLastNodeId = function getLastNodeId(lg_name){//return the last node created id of a specific graph
        return getLg(lg_name).getLastNodeId();
    };
    this.getLastEdgeId = function getLastEdgeId(lg_name){//return the last edge created id of a specific graph
		return getLg(lg_name).getLastEdgeId();
	};
	this.getLastNugget = function getLastNugget(){//return the last nugget created id of a specific graph
		return "ng_"+(NUGGET_ID-1);
	}
    this.addNugget = function addNugget(n,c){//add a new nugget to Kami background knowledge.
		var ng=new Nugget('ng_'+(NUGGET_ID++),n,c);
		nuggets[ng.getId()]=ng;
		viewable_nuggets[ng.getId()]=true;
		return ng.getId();
	};
	this.rmNugget = function rmNugget(id){//remove a specified nugget of the graph : remove also all its content !
		this.showNugget(id);
		var n_l=getNodeByNugget(id);
		var e_l=getEdgeByNugget(id);
		for(var i=0;i<e_l.length;i++)
			this.rmEdge(e_l[i],"NGG");
		for(var i=0;i<n_l.length;i++)
			this.rmNode(n_l[i],"NGG");
		this.hideNugget(id);
	}
	this.showNugget = function showNugget(nid){//add a specific nugget to the action graph.
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(!nuggets[nid]) throw new Error("this nugget doesn't exist : "+nid);
		if(this.isNgVisible(nid)) return delta;
		viewable_nuggets[nid]=true;
		var elmt =union(nugg_graph.getNodeByNugget(nid),nugg_graph.getEdgeByNugget(nid));
		nuggets[nid].show();
		delta.ACG=updateNRA({"enter":elmt,exit:[]});
		return delta;
	};
	this.hideNugget = function hideNugget(nid){//hide a specific nugget of the nugget graph
		var delta={"NGG":null,"ACG":null,"LCG":null};
		if(!nuggets[nid]) throw new Error("this nugget doesn't exist : "+nid);
		if(!this.isNgVisible(nid)) return delta
		delete viewable_nuggets[nid];
		var elmt =union(nugg_graph.getNodeByNugget(nid),nugg_graph.getEdgeByNugget(nid));
		nuggets[nid].hide();
		delta.ACG=updateNRA({"enter":[],exit:elmt});
		return delta;
	}
	this.getNgName = function getNgName(nid){//get the name of a nugget
		if(!nuggets[nid]) throw new Error("this nugget doesn't exist : "+nid);
		return nuggets[nid].getName();
	};
	this.getNgComment = function getNgComment(nid){//get the comment of a nugget
		if(!nuggets[nid]) throw new Error("this nugget doesn't exist : "+nid);
		return nuggets[nid].getComment();
	};
	this.isNgVisible = function isNgVisible(nid){//verify if a nugget is visible
		if(!nuggets[nid]) throw new Error("this nugget doesn't exist : "+nid);
		return nuggets[nid].isVisible()
	};
	this.setNgName = function setNgName(n,nid){//set the name of a nugget
		nuggets[nid].setName(n);
		return nid;
	};
	this.setNgComment = function setNgComment(c,nid){//set the comment of a nugget
		nuggets[nid].setComment(c);
		return nid;
	};
	this.getNgMnode = function getNgMnode(nid){
		return nuggets[nid].getMnode();
	}
	this.getNgRefs = function getNGRefs(nid){
		return nuggets[nid].getRefs();
	};
	this.setNgDoi = function setNgDoi(d,nid){
		nuggets[nid].setDoi(d);
		return nid;
	};
	this.setNgPubli = function setNgPubli(d,nid){
		nuggets[nid].setPubli(d);
		return nid;
	};
	this.setNgUrl = function setNgUrl(d,nid){
		nuggets[nid].setUrl(d);
		return nid;
	};
	this.setNgMeta = function setNgMeta(d,nid){
		nuggets[nid].setMeta(d);
		return nid;
	};
	var getRoot = function(id,lg_name){//get the root node of a specific node : return itself for root nodes.
		var tmp_id=id;
		while(getLg(lg_name).getFth(tmp_id)!=null){
			if(getLg(lg_name).getFth(tmp_id)==tmp_id) throw new Error("a node can't be defined as its own father : "+tmp_id);
			tmp_id=getLg(lg_name).getFth(tmp_id);
		}
		return tmp_id;
	}
	this.createLcg = function createLcg(conflict_b){//create a LCG showing only viewable nuggets. This section is modifiable according to semantics constraints.
		this.cleanLCG();
		var graph_cmp=["action","agent","region","keyres","flag","attribute"];//put here all new node type !
		for(var i=0;i<graph_cmp.length;i++){
			var el_l=act_graph.getNodeByType(graph_cmp[i]);
			for(var eli=0;eli<el_l.length;eli++){//for each node of a specific type : link it to its root : flatten the graph !
				lcg.addNode(act_graph.getType(el_l[eli]),"ng_0",act_graph.getLabels(el_l[eli]),act_graph.getValues(el_l[eli]),act_graph.getUid(el_l[eli]));
				var im_id=lcg.getLastNodeId();
				acg_R_lcg.addR([el_l[eli]],[im_id]);
				var fth;
				if(graph_cmp[i]!="attribute" || idT(act_graph.getLabels(el_l[eli])[0])!="#") fth=getRoot(el_l[eli],"ACG");
				else fth=act_graph.getFth(el_l[eli]);//if it is an attribute : keep it on its father !
				if(fth!=el_l[eli]){//if the root isn't the node itself (agent/action)
					var fth_im=acg_R_lcg.getImg(fth)[0];//there is only one image
					lcg.addEdge("parent","ng_0",im_id,fth_im);
				}
			}
		}
		//for each break action, if it isn't linked to a bind, link it to all bind using the same pattern.
		var brk=act_graph.getNodeByType("brk");
		for(var i=0;i<brk.length;i++){
			var dp_e=act_graph.getEdgeBySource(brk[i]);
			if(!fullListCheck(dp_e)){//if this break doesn't depend of a specific action, it will depend of all bindings with the same patern !
				var outputs=act_graph.getSons(brk[i]).filter(function(e){return act_graph.getType(e)[0]=="action" && act_graph.getType(e)[1]=="output"});//get the outputs of the action : there is only 2 outputs !
				var out1_nodes=act_graph.getEdgeBySource(outputs[0]).map(act_graph.getTarget).filter(function(e){return e!=brk[i]});//all node linked on the first output but the brk action.
				var out2_nodes=act_graph.getEdgeBySource(outputs[1]).map(act_graph.getTarget).filter(function(e){return e!=brk[i]});//all node linked on the second but the brk action output.
				var cpt_bnd=act_graph.getNodeByType("bnd").filter(function(e){
					var inputs=act_graph.getSons(e).filter(function(f){return act_graph.getType(f)[0]=="action" && act_graph.getType(f)[1]=="input"});//there is 2 input on a bnd action !
					var in1_nodes=act_graph.getEdgeByTarget(inputs[0]).map(act_graph.getSource);//all node linked on the first input.
					var in2_nodes=act_graph.getEdgeByTarget(inputs[1]).map(act_graph.getSource);//all node linked on the second input.
					return (fullListCheck(intersection(out1_nodes,in2_nodes)) && fullListCheck(intersection(out2_nodes,in1_nodes))) || (fullListCheck(intersection(out1_nodes,in1_nodes)) && fullListCheck(intersection(out2_nodes,in2_nodes)));
					//if the pattern is matched, it will work, either, it will be removed : pattern can be matched both side !
				});
				for(var j=0;j<cpt_bnd.length;j++)
					lcg.addEdge("depend","ng_0",acg_R_lcg.getImg(brk[i])[0],acg_R_lcg.getImg(cpt_bnd[j])[0]);//this edge will have no antecedent : it is a way to check the allucinated knowledge !
			}
			else{//else, link this break to all its binding in the LCG.
				for(var j=0;j<dp_e.length;j++){
					if(act_graph.getType(dp_e[j])[0]=="depend"){//add a copy of the dependency in the lcg, also add the relation.
						lcg.addEdge("depend","ng_0",acg_R_lcg.getImg(brk[i])[0],acg_R_lcg.getImg(act_graph.getTarget(dp_e[j]))[0]);
						acg_R_lcg.addR(dp_e[j],lcg.getLastEdgeId());
					}
				}
			}
		}
		//for each component : if no interval are defined : get the interval of its father : start with the agent, finish with region
		var agents=act_graph.getNodeByType("agent");
		var regions=act_graph.getNodeByType("region");
		for(var i=0;i<agents.length;i++){
			if(!fullListCheck(act_graph.getSons(agents[i]).filter(function(e){ return act_graph.getType(e)[0]=="attribute" && act_graph.getLabels(e)[0]=="#_interval";}))){
				var interv=conflict_b? [0,-1] : [null,null];
				lcg.addNode(["attribute"],"ng_0",["#_interval"],interv,"u_-1");
				lcg.addEdge("parent","ng_0",lcg.getLastNodeId(),acg_R_lcg.getImg(agents[i])[0]);
			}
		}
		for(var i=0;i<regions.length;i++){//for each region : if it has no inverval : add its father interval !
			if(!fullListCheck(act_graph.getSons(regions[i]).filter(function(e){ return act_graph.getType(e)[0]=="attribute" && act_graph.getLabels(e)[0]=="#_interval";}))){//check if there is an attribut interval
				var fth_int=!conflict_b ? [null,null] : lcg.getValues(lcg.getSons(lcg.getFth(acg_R_lcg.getImg(regions[i])[0])).filter(function(e){ return lcg.getType(e)[0]=="attribute" && lcg.getLabels(e)[0]=="#_interval";})[0])//they must have one interval attribut on the father in the lcg !
				lcg.addNode(["attribute"],"ng_0",["#_interval"],fth_int,"u_-1");
				lcg.addEdge("parent","ng_0",lcg.getLastNodeId(),acg_R_lcg.getImg(regions[i])[0]);
			}
		}
		//for each binding action : add its binding edges.
		var bnd_edges=act_graph.getEdgeByType("link").filter(function(e){var fth=act_graph.getFth(act_graph.getTarget(e)); return fth && act_graph.getType(fth)[1]=="bnd"});
		console.log(bnd_edges);
		bnd_edges.forEach(function(e){
						lcg.addEdge("link","ng_0",acg_R_lcg.getImg(act_graph.getSource(e)),acg_R_lcg.getImg(act_graph.getTarget(e)));
						acg_R_lcg.addR([e],[lcg.getLastEdgeId()]);
						console.log(acg_R_lcg.getImg(e));
					});
		//generate conflicts
		//for each binding, generate its interval attribut if not existing. : interval attribute is : #interval
		var bnd=act_graph.getNodeByType("input").filter(function(e){return act_graph.getType(act_graph.getFth(e))[1]=="bnd"});
		for(var i=0;i<bnd.length;i++){
			if(!fullListCheck(act_graph.getSons(bnd[i]).filter(function(e){ return act_graph.getType(e)[0]=="attribute" && act_graph.getLabels(e)[0]=="#_interval";}))){
				var input_e=lcg.getEdgeByTarget(acg_R_lcg.getImg(bnd[i])[0]);
				var interv=input_e.map(function(e){var inter=!conflict_b?[null,null] :lcg.getValues(lcg.getSource(e));return [e,inter[0],inter[1]];});
				lcg.addNode(["attribute"],"ng_0",["#_interval"],interv,"u_-1");
				lcg.addEdge("parent","ng_0",lcg.getLastNodeId(),acg_R_lcg.getImg(bnd[i])[0]);
			}
		}
		
		//for each regions whitch are overlapping due to there interval attribut : merge them into one big site.
		//get all the agent : for each agent, merge overleaping regions
		/*for(var i=0;i<agents.length;i++){
			var regions=lcg_graph.getSons(agents[i]).filter(function(e){return act_graph.getType(e)[0]=="component" && act_graph.getType(e)[0]=="region";});//get all regions of the node
			//merge all overlapping regions.
			var reduced_reg=reducInterv(regions);
		}
		*/
	}
	var reducInterv = function(regions){//merge overlaping regions together.
		var ln=regions.length;
		for(var i=0;i<regions.length-1;i++){
			var sn1=lcg.getSons(regions[i]).filter(function(e){ return lcg.getType(e)[0]=="attribute" && lcg.getLabels(e)[0]=="#_interval";})[0];
			var int1=lcg.getValues(sn1);
			for(var j=i+1;j<regions.length;j++){
				var sn2=lcg.getSons(regions[j]).filter(function(e){ return lcg.getType(e)[0]=="attribute" && lcg.getLabels(e)[0]=="#_interval";})[0];
				var int2=lcg.getValues(sn2);
				if(int2[0]<=int1[1] ){//if int1 and int2 overlap !
					var tmp_delta=lcg.mergeNode(regions[i],regions[j]);//get the new node as the enter part
					acg_R_lcg.merge(regions[i],regions[j],tmp_delta.enter[0]);//merge the images
					tmp_delta=lcg.mergeNode(sn1,sn2);//merge the attributes
					acg_R_lcg.merge(sn1,sn2,tmp_delta.enter[0]);//merge the images
					lcg.rmNodeValues(tmp_delta.enter[0]);//merge the values of the attribute 
					lcg.addNodeValues(tmp_delta.enter[0],[min(int1[0],int2[0]),max(int1[1],int2[1])]);
					regions.splice(j,1);//remove old region from the list
					regions.splice(i,1);//add the new one
					regions.push(tmp_delta.enter[0]);//add the created node from the merge !
					return reducInterv(regions);
				}
			}
		}
		return regions;
	}
	this.log = function log(){//log the whole Kami object
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
		console.log("Viewable Nuggets :");
		console.log(Object.keys(viewable_nuggets).join(","));
		console.log("Nuggets description :")
		var key=Object.keys(nuggets);
		for(var i=0;i<key.length;i++)
			nuggets[key[i]].log();
    };
};


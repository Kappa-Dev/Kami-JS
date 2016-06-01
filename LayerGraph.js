var INTERNAL_ID=0;
function LayerGraph(n,e){
	var NODECOUNT = 0;
	var EDGECOUNT = 0;
	var layerId = INTERNAL_ID++;
	var initialized = false;
	var n_ById={};//Bijective function
	var e_ById={};//Bijective function
	var n_ProjectionByUid={};//may have multiple images
	var n_ProjectionByLabel={};//may have multiple images
	var e_ProjectionByInput={};
	var e_ProjectionByOutput={};
	var nodes = n || [];//temporary node array for input/output
	var edges = e || [];//edges array.
	
	function Component(t,l,u){//l is a label and u is an uid.
		var id = NODECOUNT++;
		var type = t;
		var uid = u || null;
		var labels = l || [];
		var father = null;
		var sons = [];
		var values =[];
	};
	function Action(t,c,n){
		var id = NODECOUNT++;
		var type = t;
		var name = n || type;
		var sons = [];
		var left = [];
		var right =[];
		var context = {};
	}
	function Edge(i,o){//i and o are id of nodes
		var id = EDGECOUNT++;
		var input=i;
		var output=o;
	};
	
	this.init = function init(){
		for(var i=0;i<nodes.length;i++){
			n_ById[nodes[i].getId()]=nodes[i];
			var tmp_uid= nodes[i].getUid();
			if(tmp_uid!=null){
				if(typeof n_ProjectionByUid[tmp_uid] == "undefined") n_ProjectionByUid[tmp_uid]={};
				n_ProjectionByUid[tmp_uid][nodes[i].getId()]=true;
			}
			var tmp_labels= nodes[i].getLabels();
			if(tmp_labels!=null){
				for(var j=0;j<tmp_labels.length;j++){
					if(typeof n_ProjectionByLabel[tmp_labels[j]] =="undefined") n_ProjectionByLabel[tmp_labels[j]]={};
					n_ProjectionByLabel[tmp_labels[j]][nodes[i].getId()]=true;
				}
			}
		}
		for(var i=0;i< edges.length;i++){
			e_ById[edges[i].getId()]=edges[i];
			e_ProjectionByInput[edges[i].getInput()] = edges[i].getId();
			e_ProjectionByOutput[edges[i].getOutput()] = edges[i].getId();
		}
	};
}
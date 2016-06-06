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
	var edges = e || [];//temporary edges array for input/output.
    var addElement = function(el,l){
        var res=[];
        var tmps = el.concat();
        if(el.length>1)
            tmps.sort();
        if(l.length==0)
            return tmps;
        else {
            for (var i = 0; i < l.length;) {
                for (var j = 0; j < tmps.length;) {
                    if (l[i] > tmps[j]) {
                        res.push(tmps[j]);
                        j++;
                    }
                    else if (l[i] == tmps[j]) {
                        res.push(l[i]);
                        i++;
                        j++;
                    }
                    else {
                        res.push(l[i]);
                        i++;
                    }
                }
            }
            return res;
        }
    };//add a list of element to an ordered list.
	function Component(t,l,u){//t is a type l is a label and u is an uid.
		var id = NODECOUNT++;
		var type = t;
		var uid = u || null;
		var labels = l || [];
		var father = null;
		var sons = [];
		var values = [];
		this.getId = function getId(){return id;};
		this.getUid = function getUid(){return uid;};
		this.getLabels = function getLabels(){ return labels.concat();};
		this.getType = function getType() { return type;};
		this.getFather = function getFather(){ return father;};
		this.getSons = function getSons(){ return sons.concat();};
		this.getValues = function getValues(){ return values.concat();};
		this.addLabels = function addLabels(l){
            if(typeof l =='undefined' || l==null) {
                console.log("label undefined in addLabels Call");
                return;
            }
            labels=addElement(l,labels);
        };
        this.rmLabel = function reLabel(l){
            if(typeof l =='undefined' || l==null){
                console.log("label undefined in rmLabel Call");
                return;
            }
            for(var i=0;i<l.length;i++){
                var idx=labels.indexOf(l[i]);
                if(idx>-1)
                    labels.splice(idx,1);
            }
        };
        this.setUid = function setUid(u){uid=u;};
        this.rmUid = function rmUid(){uid=null;};
        this.setFather = function setFather(i){father=i;};
        this.rmFather = function rmFather(){father=null;};
        this.addSons = function addSons(s){
            if(typeof s =='undefined' || s==null){
                console.log("sons undefined in addSons Call");
                return;
            }
            sons=addElement(s,sons);

        };
        this.rmSons = function rmSons(s){
            if(typeof s =='undefined' || s==null){
                console.log("sons undefined in rmSons Call");
                return;
            }
            for(var i=0;i<s.length;i++){
                var idx=sons.indexOf(s[i]);
                if(idx>-1)
                    sons.splice(idx,1);
            }
        };
        this.addValues = function addValues(v){
            if(typeof v =='undefined' || v==null){
                console.log("values undefined in addValues Call");
                return;
            }
            values=addElement(v,values);
        };
        this.rmValues = function rmValues(v){
            if(typeof v =='undefined' || v==null){
                console.log("values undefined in rmValues Call");
                return;
            }
            for(var i=0;i<v.length;i++){
                var idx=values.indexOf(v[i]);
                if(idx>-1)
                    values.splice(idx,1);
            }
        };
	}
	function Action(t,c,n){//t is a type, c is a context and n is a name
		var id = NODECOUNT++;
		var type = t;
		var name = n || type;
		var sons = [];
		var left = [];//for bind : left and right are input, for brk they are output. for deg : left is the input and right is empty.
		var right =[];//for mod, left is the input and right the output. for syn : right is the output and left is empty.
		var context = c || {};
        this.getId = function getId(){return id;};
        this.getUid = function getUid(){return null;};
        this.getLabels = function getLabels(){ return null;};
        this.getType = function getType() { return type;};
        this.getFather = function getFather(){ return null;};
        this.getSons = function getSons(){ return sons.concat();};
        this.getValues = function getValues(){ return null;};
        this.getName = function getName(){ return name;};
        this.getLeft = function getLeft(){return left.concat();};
        this.getRight = function getRight(){return right.concat();};
        this.getContext = function getContext(){
            var id_l = Object.keys(context);
            var ret={};
            for(var i=0;i<id_l.length;i++){
                if(context[id_l[i]]!=null && context[id_l[i]].length>0)
                    ret[id_l[i]]=context[id_l[i]].concat();
                else ret[id_l[i]]=[];
            }
            return ret;
        };
        this.setName = function setName(n){ name=n;};
        this.rmName = function rmName(){name=type;};
        this.addSons = function addSons(s){
            if(typeof s =='undefined' || s==null){
                console.log("sons undefined in addSons Call");
                return;
            }
            sons=addElement(s,sons);

        };
        this.rmSons = function rmSons(s){
            if(typeof s =='undefined' || s==null){
                console.log("sons undefined in rmSons Call");
                return;
            }
            for(var i=0;i<s.length;i++){
                var idx=sons.indexOf(s[i]);
                if(idx>-1)
                    sons.splice(idx,1);
            }
        };
        this.addLeft = function addLeft(l){
            if(type=="syn"){
                console.log("Unable to define a left side for a Syn action");
                return;
            }
            left=addElement(l,left);
        };
        this.addRight = function addRight(l){
            if(type=="deg"){
                console.log("Unable to define a right side for a Deg action");
                return;
            }
            right=addElement(l,right);
        };
        this.rmLeft = function rmLeft(l){
            if(typeof l =='undefined' || l==null){
                console.log("left undefined in rmLeft Call");
                return;
            }
            for(var i=0;i<l.length;i++){
                var idx=left.indexOf(l[i]);
                if(idx>-1)
                    left.splice(idx,1);
            }
        };
        this.rmRight = function rmRight(l){
            if(typeof l =='undefined' || l==null){
                console.log("right undefined in rmRight Call");
                return;
            }
            for(var i=0;i<l.length;i++){
                var idx=right.indexOf(l[i]);
                if(idx>-1)
                    right.splice(idx,1);
            }
        };
        this.addContext = function addContext(c){
            var k_l;
            if(typeof c != 'undefined' && c!=null) k_l=Object.keys(c);
            else{ console.log("undefined or null context for addContext call"); return; }
            if(k_l.length==0){
                console.log("empty context for addContext call");
                return;
            }
            for(var i=0;i<k_l.length;i++){
                if(typeof context[k_l[i]]!= 'undefined' && context[k_l[i]]!=null){
                    console.log(k_l[i]+" is already present in the context of this action : "+id);
                }else{
                    if(typeof c[k_l[i]] != 'undefined' && c[k_l[i]]!=null && c[k_l[i]].length>0)
                        context[k_l[i]]=c[k_l[i]].concat();
                    else context[k_l[i]]=[];
                }
            }
        };//notice that in order to add:rm specific value from a context we need to remove the key and add a new one !
        this.rmContext = function rmContext(c){
            var k_l=Object.keys(c);
            for(var i=0;i<k_l.length;i++){
                if(typeof context[k_l[i]]!='undefined' && typeof context[k_l[i]]!=null)
                    delete context[k_l[i]];
            }
        };//notice that in order to add:rm specific value from a context we need to remove the key and add a new one !
	}
	function Edge(i,o){//i and o are id of nodes
		var id = EDGECOUNT++;
		var input=i;
		var output=o;
        this.getInput = function getInput(){ return input;};
        this.getOutput = function getOutput(){return output;};
        this.getId= function getId(){return id;};
	}
	
	this.init = function init(){
		for(var i=0;i<nodes.length;i++){
			n_ById[nodes[i].getId()]=nodes[i];
			var tmp_uid = nodes[i].getUid();
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
# Kami
Annoted knowledge representation translation into Kappa (Knowledge annoted model interpretor)




#Files : 
graph.json : kr datas.
kr1_0.html : kr program.
readme : this file.
d3.min.js : lib file for JS.
d3-context-menu : lib for menu

#Demo :
0/Run kr1_0.html
1/click on  "import Data" : load the JSon datas.
1/bis : add/remove/merge nodes !
2/click on "LCG" : translate KR into LCG.
3/click on "To Kappa" : translate LCG into Kappa (and save file)

#other usages : (work in progress)
"Add nugget" : create a nugget graphicaly
"Update" : add a new graphicaly designed nugget to the kr model
"Export Data" : export a kr model into JSon file

#Nugget data format : 
	-Agents : biological elements, have : 
	  -attributes
	  -flags
          -key residus : have :
	    -attributes
	    -flags
	  -regions : have :
	    -attributes
	    -flags
            -key residus : have :
	      -attributes
	      -flags
	-actions : links other nodes, have : 
	  -context : list of all node evolved in the action
	  -binders and edges : list of elements triggered by the action : binders correspond to left and right handsides of actions.
	  

#JSon KR syntax :
	sections :
	--infos : usefull info for the KR (save current scale and the central agent of the view)
	--agents : Object describing a biological agent : 
		--class : class list
		--name : the agent name
		--cx, cy : coordinate, if null : force placed
		--family : the family of the agent
		--abstract : abstract agents are sets of agents or family of agents.
	--regions : regions of agents
		--class : class list
		--name : the region name
		--ag_name : the agent of the region
		--color : color for the graphical representation
	--key_rs : key residus of an agent
		--class : class list
		--name : the key res name
		--ag_name : the agent of the key res
		--region_name : the region including the key res
		--angle : the graphical position of the key_rs on the agent
	--attributes :
		--class : class list
		--name : the attribute name
		--dest_class : the target type of an attribute
		--dest_path : the target name of an attribute
		--values : the values of an attribute
	--flags :
		--class : class list
		--name : the flag name
		--dest_class : the target type of a flag
		--dest_path : the target name of a flag
		--values : the values of a flag
		--v_equiv : if the flag is equivalent to a conjuction of other flags
	--actions : object describing a nugget : modification, binding, breaking,synthesis or lysis
		--class : class list
		--name : the action name (unique)
		--context : all the elements of the nugget defining this action
			--el_cl : the class of the element
			--el_path : the full name of the element
			--el_value : the value of the element in this nugget if it is an attribut or flag
		 --mods : for mod action : the kind of modification done : "incr","decr" : increment or decrement a value to the next one (for flag/att)
	--actions_binder : usefull for the binding, breaking : distinguish each sides of the bind/ubund action
		--class : class list
		--name : the binder name ("left" or "right" binder)
		--act_name : the belonging action.
	--edges: oriented edges linking action to the modified elements
		--class : the edge class
		--in_class : the class of the input element
		--in_path : the absolute name of the input element
		--out_class : the class of the output element
		--out_path : the absolute name of the output element
#classes : 
"node" : an action, an action binder, an agent, an attribute, a flag, a region or a key residus
"agent" : a biological agent
"region" : a region of an agent
"key_r" : a key residus of an agent or a region
"attr" : an attribute of an agent, region, action or key res : biological properties
"flag" : a flag of an agent, region or key res : mechanistics states
"action" : an action
"bind" : the action of binding
"brk" : the action of breaking
"mod" : the action of modification (of a flag over mechanism)
"synth" : the action of synthesis of a biological element
"rem" : the action of removing a certain element 
"binder" : the binder node of an action
"edge" : an edge between nodes

#Nugget example : add a new nugget with agent AGA with a Key res 44 binding on Ras.
	agent -> add : {"class":["node","agent"],"name":"AGA","cx":null,"cy":null,"family":null,"abstract":false},
	key_rs -> add : {"class":["node","key_r"],"name":"44","ag_name":"AGA","region_name":null,"angle":null}
	actions -> add : {"class":["node","action","bind"],"name":"bnd7","context":[	
										{"el_cl":["node","agent"],"el_path":["AGA"]},
										{"el_cl":["node","agent"],"el_path":["Ras"]},
										{"el_cl":["node","key_r"],"el_path":["AGA","44"]},
										]},
	actions_binder -> add : {"class":["node","binder"],"name":"left","act_name":"bnd7"},
				{"class":["node","binder"],"name":"right","act_name":"bnd7"},
	edges -> add : {"class":["edge"],"in_class":["node","key_r"],"in_path":["AGA","44"],"out_class":["node","binder"],"out_path":["bnd7","left"]},
		       {"class":["edge"],"in_class":["node","agent"],"in_path":["Ras"],"out_class":["node","binder"],"out_path":["bnd7","right"]},

#WARNING JSON format : 
the last element of a list don't have a "," (comma)

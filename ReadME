Annoted knowledge representation translation into Kappa (Knowledge Aggregator and Model Instantiator);
#files:
D3 directory : contain the D3 library and a modified D3 context menu library.
LayeredGraph.js : contain the definition of a layered graph.
DynamicGraph.js : add a force layout to the Graph : it is the file you need to modify if you want to change the behaviour of the graphical graph.
GraphicGraph.js : add graphic UI and event listener for the layered graph. It also provide all the translation tool.
jSonFormatter.js : give all the tool for importing and exporting Json file from and into the graph.
kr.css : the css for Kami
index.html : the main html frame from this tool.
*.json : a bunch of examle.
*.ka : an example of kappa code for sos_model.json
lgpl-3.0.txt : the lgpl licence 
ReadME : this file

#Demo :
0/Run index.html
1/click on import file : it will load the default data.json file
2/right click and : select all
3/click on LCG : translate the whole graph into an LCG format
4/right click and : select all
5/click To Kappa : translate the LCG to kappa
6/click OK for : "give default rate to actions"
7/define each agent initial quantity.
8/go to the new tab oppened.
9/run Kasim with your own conditions.
10/enjoy.

#Usage
Kami is divided into 5 views.
-The first one is the KR view, allowing only to view the whole knowledge representation. You wille start on this view and can come back to it by clicking "view Kr"
-The seconde one is the edition view (click : "Edit Kr"). You can access it from the KR view only and it allow to modify the KR in details. Notice that this view doesn't allow to add new nuggets of knowledge.
-The third view is the Nugget View (click : "Add Nugget"). You can access it from the KR view only and it allow to modify nuggets and Add new ones. A nugget is mainly defined by an action and its dependencies.
-The forth view is the LCG (click : "LCG"). You can access it from the KR view only and it require to select a non empty set of action you want to simulate. The LCG is a compilation of the sub-graph selected into a site graph.
In the LCG View you can merge Nodes, export the graph and edit the attributes Values in order to défine which values will be used for the simulation.
-The last view is the Kappa view (click : "To Kappa"). You can access it only from the LCG view and if you want to have some observer, you need to select the agent you want to observe (with or without detail) and the action for which you want to see the right member.
This view will open the kasim browser version with your code. you will need to define the initial quantity for each agent (and variation) and the rate for each action with no rate attribute.

#Kami in detail.
-Undo : put kami in the last state : WORK IN PROGRESS
-update : update the current view with all the new things added
-shift + click allow you to select a specific element.
-passing over an element give you it class at the botom left
-passing over an action overlay its context in blue and purple
-passing over other nodes give you information about it in the top left
-shift + passing over an action give you detail about it in the top left
-in edition, LCG or nugget view, you can click on node to change there name.
-Right click menu :
	-The view have a right click menu for : selecting all the node, unlock them from the force layout or unselect All.
	-In Edit view and Nugget view you can also add Nodes and remove selected nodes.
	-In Nugget view you can also add Actions.
	-nodes have right click menu :
		-You can unlock it
		-if you are in edition or nugget view You can remove it
		-if you are in LCG view you can edit only attribute values
		-if you are in edition or nugget view you can edit attributes and flags values
		-if you are in edition or nugget view, you can add attribute to all the node except attributes and flags
		-if you are in edition or nugget view, you can add flags to all the node except attributes and flags
		-if you are in edition or nugget view, you can add key residus to all agents and regions
		-if you are in edition or nugget view, you can add region to all agents
		-if you are in edition or nugget view, and you have selected at least one node, you can merge with the node
	-actions have a right click menu :
		-You can unlock it
		-if you are in edition or nugget view You can remove it
		-if you are in edition or nugget view, and you have selected at least one node, you can link it to this action by clicking either its binders (right and left) or the action 
		-if you are in edition or nugget view, you can add attribute to all the actions
		-if you are in edition or nugget view, you can select the context of the action. If it is a flag or an attribute you need to define the value used.
		-if you are in edition or nugget view, you can add selected elements to context of the action. If it is a flag or an attribute you need to define the value used.
		-if you are in edition or nugget view, you can remove selected elements from context of the action
		-if you are in nugget view, you can merge selected action with the action : carefull the actions need to be of the same type
		-if you are in edtion view you can add influence between one selected action and the action
	-links (black and influences) have a right click menu :
		-you can select the source and target of the node.
		-if you are in edition, nugget or LCG view you can remove it : carefull in LCG view, it can cause crash if an action don't have enouth links !

#Input/output
Kami take Json as input and export format.	
The Json file have a specific format : look at the data.json for more details.
you need to define each element of a nugget :
 sections :
	--version : the current version of the JSON : 2.0
	--agents : Object describing a biological agent : 
		--classes : class list
		--father_classes : the agent father classes (no classes)
		--x, y : coordinate, if null : force placed
		--path : the absolute path of the agent (empty for an agent)
		--labels : labels for the agent
		--values : empty
	--regions : regions of agents
		--classes : class list
		--father_classes : the region father classes (potentialy an agent)
		--x, y : coordinate, if null : force placed
		--path : the absolute path of the region (potentialy an agent name)
		--labels : labels for the region
		--values : empty
	--key_rs : key residus of an agent
		--classes : class list
		--father_classes : the key residus father classes (an agent, a region or empty)
		--x, y : coordinate, if null : force placed
		--path : the absolute path of the key residus (an agent label, a region label or empty)
		--labels : labels for the key residus
		--values : empty
	--attributes :
		--classes : class list
		--father_classes : the attribute father classes if it is an action attribute : empty
		--x, y : coordinate, if null : force placed
		--path : the absolute path of the attribute : if it is an action attribute : empty
		--labels : labels for the attribute : "rate","pos","interval" and "aa" are reserved names
		--values : the values of the attribute
	--flags :
		--classes : class list
		--father_classes : the flag father classes 
		--x, y : coordinate, if null : force placed
		--path : the absolute path of the flag
		--labels : labels for the flag
		--values : the values of the flag
	--actions : object describing a nugget : modification, binding, breaking,synthesis or lysis
		--classes : class list
		--labels : the action labels
		--x, y : coordinate, if null : force placed
		--left : left binded element list
		--right : right binded element list
		--context : all the elements of the nugget defining this action context

left, right and context of an action are references to other section in the format : 
	--ref : an array where the first element is the section (don't forget the 's') and the second the index of the element in the section
	--values : the value list of the element if needed (for flags and attributes)
Don't forget that the last element of a section don't have a comma du to list format.
#classes : 
"agent" : a biological agent
"region" : a region of an agent
"key_res" : a key residus of an agent or a region
"attribute" : an attribute of an agent, region, action or key res : biological properties
	-- an attribute have a second class which is "list" or "interval" : interval constrain the attribut to be an interval between two numerical values 
"flag" : a flag of an agent, region or key res : mechanistics states
"action" : an action
	--"bnd" : the action of binding
	--"brk" : the action of breaking
	--"mod" : the action of modification (of a flag over mechanism)
		-- a mod action have a third class : "pos" or "neg" corresponding to an incremental modification or decremental modification
	--"syn" : the action of synthesis of a biological element
	--"deg" : the action of degrading a certain element 

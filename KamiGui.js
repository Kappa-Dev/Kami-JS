function KamiGui(c){
    var kami= new Kami();
    var container;
    if(c) container='#'+c;
    else  container = "body";
    var nodes_selection;
    var nodes_data;
    var edges_selection;
    var edges_data;
    var width;
    var height;
    var svg;
    var force_layout;
    var view_state=null;
    // ******************* configuration section ******************
    //This part may be modified to fit user's expectation of graph.
    // ************************************************************
    var defined_edge_type={
        "edge":{
            "link":'arrowed',
            "parent":null,
            "posinfl":'arrowed',
            "neginfl":'arrowed',
            "rw_rule":'arrowed'
        }
    };
    var arrowedEdges = function(){//may return an array of all edge type that need an arrow
        var ret=[];
        var val=Object.keys(defined_edge_type.edge);
        for(var i=0;i<val.length;i++){
            if(defined_edge_type.edge[val[i]]=="arrowed")
                ret.push(val[i]+"_end");
        }
        return ret;
    };
    var defined_node_type={
        "node":{
            "component":{
                "agent":null,
                "region":null,
                "keyres":null,
                "flag":null
            },
            "action":{
                "bnd":'rect',
                "brk":'rect',
                "mod":'rect',
                "modPos":'rect',
                "modNeg":'rect',
                "syn":'rect',
                "deg":'rect',
                "input":null,
                "output":null
            },
            "super":{
                "family":null,
                "set":null,
                "process":null
            },
            "attribute":null
        }
    };
    var rectNodes = function(){//may return an array of all node type that need to be rectangulare, the other will be round
        var ret=[];
        var val=Object.keys(defined_node_type.node);
        for(var i=0;i<val.length;i++){
            if(typeof defined_edge_type.edge[val[i]] =="object"){
                console.log("object");

            }

        }
    }
    //******************************************************
    // ************ end of configuration section ***********
    
    this.init = function init(){
        width  = d3.select(container).node().getBoundingClientRect().width;
        height = d3.select(container).node().getBoundingClientRect().height;//menu is 30px heigth
        console.log(width+" "+height);
        d3.select(container).selectAll("*").remove();
        d3.select(container).append("div").attr('id',"main_container");
        initMenu();
        initSvg();
        initTooltips();
        setState("ACG");
        nodes_data=[];
        edges_data=[];
        update({
            "nodes":kami.getNodesId("NGG"),
            "edges":kami.getEdgesId("NGG")
        },null);
        console.log("Kami is ready ! :)");
        kami.log();
    };
    var initTooltips = function(){
        d3.select("#main_container").append("div")//add the top tooltype
            .classed("n_tooltip",true)
            .style("visibility","hidden");
        d3.select("#main_container").append("div")//add the bottom tooltip
            .classed("s_tooltip",true)
            .style("visibility","hidden");
    }
    var initMenu = function(){
        var menu=d3.select("#main_container").append("div")
                    .attr("id","menu_container")
                    .append("xhtml:form")
                    .attr("id","menu_form");
        menu.append("input").attr({type:"file",id:"import_f",value:"data.json"}).classed("menu_input",true).classed("ACG",true);
        menu.append("input").attr({type:"button",id:"import",value:"Import Data"}).classed("menu_input",true).classed("ACG",true).on('click',loadJs);
        menu.append("input").attr({type:"button",id:"export",value:"Export Data"}).classed("menu_input",true).classed("ACG",true).classed("LCG",true).on('click',exportJs);
        menu.append("input").attr({type:"button",id:"kr",value:"view Kr"}).classed("menu_input",true).classed("NGG",true).classed("KAPPA",true).classed("LCG",true).on('click',function(){setState("ACG");});
        menu.append("input").attr({type:"button",id:"edit",value:"Edit Kr"}).classed("menu_input",true).classed("ACG",true).on('click',function(){setState("NGG");});
        menu.append("input").attr({type:"button",id:"lcg",value:"LCG"}).classed("menu_input",true).classed("ACG",true).on('click',function(){setState("LCG");});
        menu.append("input").attr({type:"button",id:"kappa",value:"To Kappa"}).classed("menu_input",true).classed("LCG",true).on('click',function(){setState("KAPPA");});
        menu.append("input").attr({type:"button",id:"undo",value:"Undo"}).classed("menu_input",true).classed("NGG",true).classed("ACG",true).classed("LCG",true).on('click',undo);
        menu.append("input").attr({type:"button",id:"redo",value:"redo"}).classed("menu_input",true).classed("NGG",true).classed("ACG",true).classed("LCG",true).on('click',redo);
        menu.append("input").attr({type:"button",id:"replay",value:"Reset Graph position"}).classed("menu_input",true).classed("NGG",true).classed("ACG",true).classed("LCG",true).on('click',wakeUp);
    };
    var initSvg = function() {
        d3.select("#main_container").append("div")
            .attr("id","graph");
        d3.select("#graph").append("div")
            .attr("id","svg-container")
            .classed("svg_container", true);
        svg=d3.select("#svg-container").append("svg:svg")//create the SVG container
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 "+width+" "+(height-30))
            .classed("svg-content-responsive", true)
            .on("contextmenu",d3.contextMenu(function(){return rightClickMenu();}));//add the right click menu
        svg.append("svg:defs").selectAll("marker")//add the arrow at the end of edged
            .data(arrowedEdges())      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", function(d){return d;})
            .attr("refX", 40)
            .attr("refY", 7)
            .attr("markerWidth", 13)
            .attr("markerHeight", 13)
            .attr("orient", "auto")
            .attr("markerUnits","strokeWidth")
            .append("svg:path")
            .attr("d", "M2,2 L2,13 L8,7 L2,2");
    };
    var update = function(enter,exit){
        console.log(enter);
        console.log(exit);
    };
    var rightClickMenu = function(){
        var menu=[];
        return menu;
    };
    var loadJs = function(){
        console.log("click");
    };
    var exportJs = function(){
        console.log("click2");
    };
    var setState = function(st){
        if( view_state==st){
            console.log("I'm already in this state, --' Zzzzz");
            return;
        }
        view_state=st;
        d3.selectAll(".menu_input").property("disabled",true).style("display","none");
        //d3.selectAll("*:not(."+view_state+")").property("disabled",true).style("display","none");
        d3.selectAll("."+view_state).property("disabled",false).style("display","initial");
    };
    var undo = function(){
        console.log("undo");
    };
    var redo = function(){
        console.log("redo");
    };
    var wakeUp = function(){
        console.log("Zzzzz... ?? Oo ?? ");
    };
}
function graphicGui(k){//a graphic Gui use a svg caneva, nodes and edges and listener from the kami object.
    var nodes=n || [];
    var nodesHash={};//allow access to node position in O(1)
    var edges=e || [];//type can be 'link','parent','posinfl','neginfl','rw_rule' (contain nodes id only)
    var svg=s;
    var width;
    var	height;
    var kami=k;
    var force=null;
    var first_init;
    var container=c;//the html container
    var svg=null;//the graphical caneva
    this.init=function init(){
        var width=document.getElementById(containerID).getBoundingClientRect().width;
        var	height =document.getElementById(containerID).getBoundingClientRect().height-30;//menu is 30px heigth
        for(var i=0;i<nodes.length;i++)//add a hashtable for nodes.
            nodesHash[nodes[i].id]=i;
        force=d3.layout.force();
        force.nodes(nodes)
            .links(links)
            .linkDistance(function(d){if(kami.getType(d.id)[0]!='parent') return 100; else return (nodeSize(kami.getType(d.source))+nodeSize(kami.getType(d.target)))})
            .linkStrength(function(d){if(kami.getType(d.id)[0]!='parent') return 0.7; else return 5})
            .charge(function(d){if(kami.getType(d.id)[0]=='action' && kami.getType(d.id)[1]!='input' && kami.getType(d.id)[1]!='output' ) return -300; else return -600})
            .chargeDistance(function(d){
                if((kami.getType(d.id)[0]=='action' && kami.getType(d.id)[1]!='input' && kami.getType(d.id)[1]!='output') || (kami.getType(d.id)[0]=='action' && kami.getType(d.id)[1]=='agent'))
                    return 100;
                else
                    return nodeSize(kami.getType(d.id));
            })
            .size([width, height]);
        first_init=false;
        force.on("tick",tick);//add the tick function
        force.drag().on("dragstart", dragstart);//add th dragging function
        kami.setState("AGV");
        svg=d3.select("#"+container).append("svg:svg")//create the SVG container
            .attr("width",width)
            .attr("height",height)
            .on("contextmenu",d3.contextMenu(function(){return rightClickMenu();}));//add the right click menu
        d3.select("#"+container).append("div")//add the top tooltype
            .classed("n_tooltip",true)
            .style("visibility","hidden");
        d3.select("#"+container).append("div")//add the bottom tooltip
            .classed("s_tooltip",true)
            .style("visibility","hidden");
        svg.append("svg:defs").selectAll("marker")//add the arrow at the end of edged
            .data(["pos_end","neg_end","link_end","rw_end"])      // Different link/path types can be defined here
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
    var nodeSize=function(type){//return the node RADIUS
        //this node type : component(1)/action(2)/super(3)/attribute (1):agent/region/keyres/flag (2):modPos/modNeg/syn/deg/bnd/brk/input/output (3):family/set/process
        if(type[0]=='attribute')
            return 7;
        switch(type[1]){
            case 'flag':
                return 7;
            case "keyres":
                return 10;
            case "region":
                return 15;
            case "agent":
            case "family":
            case "set":
            case "process":
                return 20;
            case "input":
            case "output":
                return 2;
            case "modPos":
            case "modNeg":
            case "syn":
            case "neg":
            case "bnd":
            case "brk":
                return 40;
            default:
                throw "unknown type ! "+type;
        }
    };
    this.wakeUp = function wakeUp(val){//speed up tick function
        force.start();
        if(!(typeof(val)!="undefined" && val!=null && !val))
        //d3.selectAll("g.agent").classed("fixed",false);
        //d3.selectAll("g.action").classed("fixed",false);
            d3.selectAll("g.node").classed("fixed",false);
        for(var i=0;i<300;i++){
            force.tick();
        }
        if(first_init){
            //d3.selectAll("g.agent").classed("fixed",true);
            //d3.selectAll("g.action").classed("fixed",true);
            d3.selectAll("g.node").classed("fixed",true);
        }
        first_init=true;
    };
    var update = function(){//update all the SVG elements
        //links svg representation
        edges = svg.selectAll(".edge")
            .data(kami.getEdges(), function(d) { return d.id; });
        edges.enter().insert("line","g")
            .classed("edge",true)//type can be 'link','parent','posinfl','neginfl','rw_rule'
            .classed("link",function(d){return kami.getType(d.id)[0]=="link"})
            .classed("parent",function(d){return kami.getType(d.id)[0]=="parent"})
            .classed("influence",function(d){return kami.getType(d.id)[0]=="posinfl" || kami.getType(d.id)[0]=="neginfl"})
            .classed("posinfl",function(d){return kami.getType(d.id)[0]=="posinfl"})
            .classed("neginfl",function(d){return kami.getType(d.id)[0]=="neginfl"})
            .classed("rw_rule",function(d){return kami.getType(d.id)[0]=="rw_rule"});
        d3.selectAll(".link").on("contextmenu",d3.contextMenu(function(){return edgeCtMenu();}));
        d3.selectAll(".influence").on("contextmenu",d3.contextMenu(function(){return edgeCtMenu();}));
        d3.selectAll(".rw_rule").on("contextmenu",d3.contextMenu(function(){return edgeCtMenu();}));
        d3.selectAll(".posinfl").attr("marker-end", "url(#pos_end)");
        d3.selectAll(".neginfl").attr("marker-end", "url(#neg_end)");
        d3.selectAll(".link").attr("marker-end", "url(#link_end)");
        d3.selectAll(".rw_rule").attr("marker-end", "url(#rw_end)");
        edges.exit().remove();
        //none action nodes svg representation
        nodes = svg.selectAll(".node")
            .data(kami.getNodes(), function(d) { return d.id;});//add all node id to the graphic structure
        var nodeEnter = nodes.enter().insert("g")
            .classed("node",true)//this node type : component(1)/action(2)/super(3)/attribute (1):agent/region/keyres/flag (2):modPos/modNeg/syn/deg/bnd/brk/input/output (3):family/set/process
            .classed("round",function(d){return kami.getType(d.id)[0]=="attribute" || kami.getType(d.id)[0]=="component" || (kami.getType(d.id)[0]=="action" && (kami.getType(d.id)[1]=="input" || kami.getType(d.id)[1]=="output"));})
            .classed("rectangle",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]!="input" && kami.getType(d.id)[1]!="output";})
            .classed("attribute",function(d){return kami.getType(d.id)[0]=="attribute";})
            .classed("component",function(d){return kami.getType(d.id)[0]=="component";})
            .classed("agent",function(d){return kami.getType(d.id)[0]=="component" && kami.getType(d.id)[1]=="agent";})
            .classed("keyres",function(d){return kami.getType(d.id)[0]=="component" && kami.getType(d.id)[1]=="keyres";})
            .classed("flag",function(d){return kami.getType(d.id)[0]=="component" && kami.getType(d.id)[1]=="flag";})
            .classed("region",function(d){return kami.getType(d.id)[0]=="component" && kami.getType(d.id)[1]=="region";})
            .classed("action",function(d){return kami.getType(d.id)[0]=="action";})
            .classed("modPos",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="modPos";})
            .classed("modNeg",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="modNeg";})
            .classed("syn",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="syn";})
            .classed("deg",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="deg";})
            .classed("bnd",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="bnd";})
            .classed("brk",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="brk";})
            .classed("input",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="input";})
            .classed("output",function(d){return kami.getType(d.id)[0]=="action" && kami.getType(d.id)[1]=="output";})
            .on("mouseover",mouseOver)
            .on("mouseout",mouseOut)
            .on("click",clickHandler)
            .on("contextmenu",d3.contextMenu(function(){return nodeCtMenu();}));
        //add dragging function
        nodeEnter.selectAll("g.rectangle").call(drag);
        nodeEnter.selectAll("g.rectangle").on("dblclick",clickNugget);
        nodeEnter.selectAll("g.agent").call(drag);
        //add actions (rectangle)
        nodeEnter.selectAll("g.rectangle").insert("rect")
            .attr("width", function(d){return nodeSize(kami.getType(d.id))})
            .attr("height", function(d){return nodeSize(kami.getType(d.id))});
        nodeEnter.selectAll("g.rectangle").insert("text")
            .classed("nodeLabel",true)
            .attr("x", function(d){return nodeSize(kami.getType(d.id));})
            .attr("dy", function(d){return nodeSize(kami.getType(d.id))/2;})
            .attr("text-anchor", "middle")
            .text(function(d) {if(kami.getLabel(d.id).length>0) return kami.getLabel(d.id)[0]; else return d.id;})
            .attr("font-size", function(d){ return nodeSize(kami.getType(d.id))/1.5+"px";});
        //add components (circle)
        nodeEnter.selectAll(".round").insert("circle")
            .attr("r", function(d){return nodeSize(kami.getType(d.id));});
        //add text.
        nodeEnter.selectAll(".component").insert("text")
            .classed("nodeLabel",true)
            .attr("x", 0)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) {if(kami.getLabel(d.id).length>0) return kami.getLabel(d.id)[0]; else return d.id;})
            .attr("font-size", function(d){return nodeSize(kami.getType(d.id))+"px";});
        //remove old elements
        nodes.exit().remove();
        force.start();
    };
    var tick = function(){//show up new svg element only if there position datas have been computed
        if(first_init || force.alpha()<=0.00501){
            //tick for nodes
            nodes.attr("transform", function(d) {
                if(kami.getType(d.id)[0]!="action" || (kami.getType(d.id)[1]!="input" && kami.getType(d.id)[1]!="output")){
                    d.x=Math.max(nodeSize(kami.getType(d.id)), Math.min(width - nodeSize(kami.getType(d.id)), d.x));
                    d.y=Math.max(nodeSize(kami.getType(d.id)), Math.min(height - nodeSize(kami.getType(d.id)), d.y));
                    return "translate(" + d.x + "," + d.y + ")";
                    if(kami.getType(d.id)[0]=="action"){
                        var in_out=kami.getSons(d.id);
                        var mult_in=false;
                        var mult_out=false;
                        for(var i=0;i<in_out.length;i++){//see for optimisation : hypothesis : actions have few attributes ! force the position of input/output of actions.
                            if(kami.getType(in_out[i])[0]!="attribute"){
                                if((kami.getType(in_out[i])[1]=="input" && !mult_in) || (kami.getType(in_out[i])[1]=="output" && mult_out)){//the first input is on the left
                                    d.x=nodes[nodesHash[kami.getFather(d.id)]].x-nodeSize(kami.getType(kami.getFather(d.id)));
                                    mult_in=true;
                                }if((kami.getType(in_out[i])[1]=="input" && mult_in) || (kami.getType(in_out[i])[1]=="output" && !mult_out)){//the first output is on the right
                                    d.x=nodes[nodesHash[kami.getFather(d.id)]].x+nodeSize(kami.getType(kami.getFather(d.id)));
                                    mult_out=true;
                                }
                                d.y=nodes[nodesHash[kami.getFather(d.id)]].y-(nodeSize(kami.getType(kami.getFather(d.id)))/2)
                            }

                        }
                    }
                }
            });
            //tick for edges
            edges.attr("x1", function(d){return nodes[nodesHash[d.source]].x;})
                .attr("y1", function(d){return nodes[nodesHash[d.source]].y;})
                .attr("x2", function(d){return nodes[nodesHash[d.target]].x;})
                .attr("y2", function(d){return nodes[nodesHash[d.target]].y;});
            first_init=true;
        }else{//fixe all node when in stable state.
            d3.selectAll("g.node").classed("fixed",true);
        }
    };


}
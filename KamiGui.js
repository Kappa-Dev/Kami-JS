function KamiGui(k){
	if(!k)throw new Error("undefined Kami object ! ");
	var kami= k;
	var main_container;
	var graph_frame;
	var side;
	var current_tab;
	var tab_frame;
	var nugg_editor;
	var openclose = function(){
		d3.event.stopPropagation();
		var size=side.style("width")=="300px"?"0px":"300px";
		side.style("min-width",size);
		graph_frame.style("margin-left",size);
		side.style("width",size);
	}
	var openSide=function(){
		d3.event.stopPropagation();
		side.style("min-width","300px");
		graph_frame.style("margin-left","300px");
		side.style("width","300px");
	}
	var closeSide=function(){
		d3.event.stopPropagation();
		side.style("min-width","0px");
		graph_frame.style("margin-left","0px");
		side.style("width","0px");
	}
	var closeNugget = function(){
		d3.event.stopPropagation();
		d3.select("#nugg_editor").property("disabled",true).style("display","none");
	}
	var openNugget = function(){
		d3.event.stopPropagation();
		openSide();
		d3.select("#nugg_editor").property("disabled",false).style("display","initial");
	}
	var saveNugget = function(){
		opencloseNuggEdit();
		console.log("nugget saved");
	}
	var discardNugget = function(){
		opencloseNuggEdit();
		console.log("nugget discarded");
	}
	var initTabMenu = function(menu){
		var tabs=[{"id":"NGG","txt":"My nuggets"},{"id":"ACG","txt":"Big mechanism"},{"id":"LCG","txt":"Contact map"},{"id":"KAG","txt":"Kappa nuggets"},{"id":"KAC","txt":"Kappa program"}];
		menu.selectAll(".tab_menu_el").data(tabs).enter().append("div").classed("tab_menu_el",true)
																		.classed("unselectable",true)
																		.text(function(d){return d.txt})
																		.attr("id",function(d){return d.id})
																		.on("click",function(d){return tabChange(d.id)});
	}
	var tabChange = function(id){
		if(current_tab!=id){
			d3.select("#tab_menu").selectAll(".tab_menu_el")
				.style("color","rgb(251, 249, 200)")//show the correct menu element
				.style("background",function(d){return d.id==id?"linear-gradient(to bottom, #3fa4f0 0%, #0f71ba 100%)":"none";});
			d3.select("#tab_frame").selectAll(".svg_pan")
				.property("disabled",function(d){return d!=id}).style("display",function(d){return d!=id?"none":"initial"});
		}
		current_tab=id;
	}
	var undo=function(){
		console.log("undo");
	}
	var redo=function(){
		console.log("redo");
	}
	var importFile=function(){
		console.log(d3.select("#import_f").node().files[0]);
	}
	var exportFile=function(){
		console.log("exporting");
	}
	var validable_text = function(){
		d3.select(this).on("keydown",function(){if (d3.event.keyCode==13) searchFor(d3.select(this).node().value)});
	}
	var unvalid_text = function(){
		d3.select(this).on("keydown",null);
	}
	var searchFor=function(val){
		console.log(val);
	}
	var initTabFrame = function(fram){
		var tabs=["NGG","ACG","LCG","KAG","KAC"];
		var marker_l=["posInfl","negInfl","Link","rw"];
		fram.selectAll(".svg_pan").data(tabs).enter().append("svg:svg")//create the SVG container
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content-responsive", true)
			.classed("svg_pan",true)
            .on("contextmenu",d3.contextMenu(function(){return rightClickMenu();}))
			.append("svg:defs").selectAll("marker")//add the arrow at the end of edged
            .data(marker_l)      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .classed(function(d){return d;},true)
            .attr("refX", 40)
            .attr("refY", 7)
            .attr("markerWidth", 13)
            .attr("markerHeight", 13)
            .attr("orient", "auto")
            .attr("markerUnits","strokeWidth")
            .append("svg:path")
            .attr("d", "M2,2 L2,13 L8,7 L2,2");
	}
	var rightClickMenu = function(){
        var menu=[];
		if(current_tab=="NGG" || current_tab=="ACG"){
			menu.push({
					title: "Add Nugget",
					action: function(elm,d,i){
						openNugget();
					}
				},{
					title: "Edit Node",
					child:[{
						title: "Add Nugget",
					action: function(elm,d,i){
						openNugget();
					}
					},{title: "Add Nugget",
					action: function(elm,d,i){
						openNugget();
					}
					}]
					
				});
		}
			
        return menu;
    };	
	var nuggetDrag = d3.drag().on("drag", function(d,i) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
			d.x=d.x<0?0:d.x;
			var parent_bbox=main_container.node().getBoundingClientRect();
			var bbox=d3.select(this).node().getBoundingClientRect();
			d.x=d.x+bbox.width>parent_bbox.width-5?parent_bbox.width-bbox.width-5:d.x;
			d.y=d.y>0?0:d.y;
			d.y=d.y-bbox.height<-parent_bbox.height+50?-parent_bbox.height+bbox.height+50:d.y;
            d3.select(this).style("transform", function(d,i){
                return "translate("+d.x+"px,"+d.y+"px)";
            });
		})
		.on("end",function(d){
			d3.select(this).style("cursor","default");
		})
		.on("start",function(d){
			d3.select(this).style("cursor","move");
		});
	this.init = function init(){
		main_container=d3.select("body").append("div").attr("id","main_container");//add the main container windows.
		//add the top menu bar
		var top_chart=main_container.append("div").attr("id","top_chart");
		main_container.append("div").classed("bottom_top_chart",true);
		//add the main container
		var container=main_container.append("div").attr("id","container");
		//add the floating div for nugget edition
		nugg_editor=main_container.append("div").attr("id","nugg_editor");
		nugg_editor.datum({"x":10,"y":10});
		nugg_editor.call(nuggetDrag);
		nugg_editor.append("div").classed("close_side_menu",true).on("click",closeNugget).html("&#x274c;").classed("unselectable",true);//add a close button
		nugg_editor.append("div").classed("save",true).on("click",saveNugget).html("&#x1f4be;").classed("unselectable",true);//add a save
		nugg_editor.append("div").classed("discard",true).on("click",discardNugget).html("&#x1f5d1;").classed("unselectable",true);//add a discard
		//add the side menu div
		side=container.append("div").attr("id","side_menu");//main div of side menu
		side.append("div").classed("close_side_menu",true).on("click",closeSide).html("&#x25c0;").classed("unselectable",true);//add a close button
		//add the div containing the rest of the representation
		graph_frame = container.append("div").attr("id","graph_frame");//main div of graph
		var side_ct=graph_frame.append("div").attr("id","drag_bar_cont");
			side_ct.append("div").attr("id","drag_bar").on("click",openclose);//add a drag bar for the menu
		//initialize the top chart menu
		var tab_menu=top_chart.append("div").attr("id","tab_menu").classed("top_menu",true);//add all tabl to menu
		initTabMenu(tab_menu);
		//initialize the top modification bar
		var mod_menu=top_chart.append("div").attr("id","mod_menu").classed("mod_menu",true);
		mod_menu.append("div").classed("mod_el",true).classed("undoredo",true).on("click",undo).html("&#x21a9;").classed("unselectable",true);
		mod_menu.append("div").classed("mod_el",true).classed("undoredo",true).on("click",redo).html("&#x21aa;").classed("unselectable",true);
		mod_menu.append("input").classed("mod_el",true).attr("type","file").attr("id","import_f");
		mod_menu.append("div").classed("mod_el",true).classed("mod_div",true).on("click",importFile).html("Import").classed("unselectable",true);
		mod_menu.append("div").classed("mod_el",true).classed("mod_div",true).on("click",exportFile).html("Export").classed("unselectable",true);
		//initialize the top search bar
		top_chart.append("input").attr("type","text").attr("id","search").attr("placeholder","Search..").on("focus",validable_text).on("blur",unvalid_text);
		//add all the svg tabs
		tab_frame=graph_frame.append("div").attr("id","tab_frame");//add all tabl to frame
		initTabFrame(tab_frame);
		tabChange("NGG");//init to the nugget graph		
		
	};
}
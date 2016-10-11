define(["d3/d3.min.js","GraphicGraph.js","jSonFormatter.js"],function(d3,GraphicGraph,jSonFormatter){
	(function(){console.log("Main loaded")}())
	var gGraph = null; 
	var jsonformater= null;
	d3.select("body").append("div").attr("id","main-container");
	d3.select("#main-container").append("div").attr("id","menu");
	d3.select("#menu").append("form").attr("id","menu_f");
	var tmp_form=d3.select("#menu_f");
	tmp_form.append("input").attr("type","file")
							.attr("id","import_f")
							.attr("value","data.json")
							.classed("removable_tab",true)
							.attr("multiple",true);
	tmp_form.append("input").attr("type","button")
							.attr("id","import")
							.attr("value","Import Data")
							.classed("removable_tab",true)
							.on("click",function(){
								var data=null; 
								var file=document.getElementById("import_f").files;
								if(typeof(file)!="undefined" && file !=null && file.length>0){
									for(var i=0;i<file.length;i++)
										loadFile(file[i]);
								} 
								else alert("No input file. Default datas loaded !");
							});
	tmp_form.append("input").attr("type","button")
							.attr("id","export")
							.attr("value","Export Data")
							.classed("removable_tab",true)
							.on("click",function(){
								if(jsonformater)
									return jsonformater.outputJs();
								else console.error("No data to Export");
							});
	tmp_form.append("input").attr("type","button")
							.attr("id","kr")
							.attr("value","view KR")
							.classed("tab_el",true)
							.on("click",function(){
								if(gGraph)
									return gGraph.setState('kr_view');
								else console.error("No Graph !");
							});
	tmp_form.append("input").attr("type","button")
							.attr("id","edit")
							.attr("value","Edit KR")
							.classed("tab_el",true)
							.on("click",function(){
								if(gGraph)
									return gGraph.setState('kr_edit');
								else console.error("No Graph !");
							});
	tmp_form.append("input").attr("type","button")
							.attr("id","lcg")
							.attr("value","LCG")
							.classed("tab_el",true)
							.on("click",function(){
								if(gGraph)
									return gGraph.setState('lcg_view');
								else console.error("No Graph !");
							});	
	tmp_form.append("input").attr("type","button")
							.attr("id","kappa")
							.attr("value","To Kappa")
							.classed("removable_tab",true)
							.on("click",function(){
								if(gGraph)
									return gGraph.setState('kappa_view');
								else console.error("No Graph !");
							});	
	tmp_form.append("input").attr("type","button")
							.attr("id","replay")
							.attr("value","Reset Graph position")
							.classed("removable_tab",true)
							.on("click",function(){
								if(gGraph)
									return gGraph.wakeUp();
								else console.error("No Graph !");
							});	
	d3.select("#main-container").append("div").attr("id","bottom_top_chart");
	d3.select("#main-container").append("div").attr("id","graph");			
	var dropZone = document.getElementById('graph');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	gGraph = new GraphicGraph('graph');
	gGraph.init();
	jsonformater=new jSonFormatter(gGraph);

	var loadFile = function(data){
		var yep=true;
		if(gGraph==null || !confirm('Merge with the existing graph ?')){
			if(gGraph!=null)
				yep=confirm("confirm the removal of the old graph ?");
			if(yep){
				d3.select("#graph").selectAll("*").remove();
				delete(gGraph);
				gGraph = new GraphicGraph('graph');
				gGraph.init();	
				jsonformater=new jSonFormatter(gGraph);
			}else return;
		}if(yep){
			if(jsonformater==null)
				jsonformater=new jSonFormatter(gGraph);
			console.log("importing datas");
			if(data!=null){
				var ka = new FileReader();
				ka.readAsDataURL(data);
				ka.onloadend = function(e){
					jsonformater.init(e.target.result);
				}
			}else jsonformater.init("data.json");
		}
	};
	var handleFileSelect = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files;
		loadFile(files[0]);
	};
	function handleDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	};
});



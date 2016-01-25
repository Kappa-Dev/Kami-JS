function clickHandler(d) {
	if(d3.event.ctrlKey){
		d3.select(this).classed("fixed", d.fixed = false);
	}if(d3.event.shiftKey){
		if(d3.select(this).classed("selected"))
			d3.select(this).classed("selected", d.selected = false);
		else
			d3.select(this).classed("selected", d.selected = true);
	}	
};
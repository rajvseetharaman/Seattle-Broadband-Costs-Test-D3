'use strict';  //treat silly mistakes as run-time errors

//the SVG element to add visual content to
var svg = d3.select('#visContainer')
		.append('svg')
		.attr('height', 800) //can adjust size as desired
		.attr('width', 1500)
    	.style('border','1px solid gray'); //comment out to remove border
var marginLeft=50;
var marginTop=50;
var group = svg.append('g') //add a group
    //move over to add margins (specified as variables)
    .attr('transform','translate('+marginLeft+','+marginTop+')');
var group1 = svg.append('g') //add a group
    //move over to add margins (specified as variables)
    .attr('transform','translate('+(marginLeft+20)+','+marginTop+')');
var group2 = svg.append('g') //add a group
    //move over to add margins (specified as variables)
    .attr('transform','translate('+(marginLeft)+','+(marginTop+40)+')');


d3.select('#refresh').on('click',createNew);

function createNew()
{
	/*
		This function sets axis labels, menu labels and further calls dataInput() function
	*/
	//set axis labels
	svg.append('text').attr('fill','black').attr('x',425).attr('y',40).text('Speed (Mb/s)').attr('font-weight','bold');
	svg.append('text').attr('fill','black').attr('x',5).attr('y',340).text('ISP #').attr('font-weight','bold')
	//Get values from drop down menus
	var priceip=d3.select('#price').property('value');
	var updown=d3.select('#updown1').property('value');
	dataInput(priceip,updown);
}


function dataInput(priceip,updown)
{
	/*
		This function reads data from a csv file and calls analysis() function
	*/
	var dataset=[]
	//read from csv file
	d3.csv("Broadband_Speed_Test.csv", function(d) {
	return {
		id : +d.id,
		actual_download: +d.actual_download,
		actual_upload: +d.actual_upload,
		connection_type: d.connectiontype,
		cost_of_service: d.cost_of_service,
		isp: d.isp
	};
	}, function(data) {
	dataset=data;
	//call analysis() function and pass the dataset and user inputs to it
	analysis(dataset,priceip,updown);
	});
}

function analysis(dataset,pricerange,is_up_down)
{
		/*
		Calculate the average upload and download speeds for chosen category, sort them and find the top 10
		*/
		var expensesAvgAmount = [];
		var chosencategory=[];
		//find the internet providers for chosen category
		dataset.forEach(function(d){if(d.cost_of_service==pricerange){chosencategory.push(d);}});
		if(is_up_down=='upload')
		{
			expensesAvgAmount=d3.nest()
  			.key(function(d) { return d.isp; })
			  //take average for each provider
  			.rollup(function(v) { return Math.round(d3.mean(v, function(d) {return d.actual_upload;  } ) ); })			
  			.entries(chosencategory);
		}
		//Do same as above for if download speed is chosen by user to visualize
		if(is_up_down=='download')
		{
			expensesAvgAmount=d3.nest()
  			.key(function(d) { return d.isp; })
  			.rollup(function(v) { return Math.round( d3.mean(v, function(d) {return d.actual_download;  }) ); })			
  			.entries(chosencategory);
			
		}

		//Sort the array based on speed in descending order
		var expensesAvgAmount1=[];
		expensesAvgAmount.forEach(function(d){if(d.key.length>1){return expensesAvgAmount1.push(d);} });

			  expensesAvgAmount1.sort(function(a, b) {
    return (parseFloat(b.value) - parseFloat(a.value));});
			  
	//Call visplot() function and pass top 10 providers and type of speed
	vizplot(expensesAvgAmount1.slice(0,10),is_up_down);

}

function vizplot(dataset,is_up_down)
{
	/*
	this function plots axis, the horizontal bar chart and other interactivity
	*/
	var xScale;
	if(is_up_down=='download')
	{
		xScale = d3.scaleLinear()
                       .domain([0,800]) //specify the domain
                       .range([0,800]); //specify the range

	}
		if(is_up_down=='upload')
	{
		xScale = d3.scaleLinear()
                       .domain([0,900]) //specify the domain
                       .range([0,800]); //specify the range
		

	}
		var yScale = d3.scaleLinear()
                       .domain([1,10]) //specify the domain
                       .range([0,630]); //specify the range
	var xAxis = d3.axisBottom(xScale);
	var yticks=[];
	dataset.forEach(function(d){yticks.push(d.key);});
	var yAxis = d3.axisLeft(yScale);
	
	xAxis(group1);
	yAxis(group2);

	//Join data with DOM elements
    var listp = group.selectAll('rect')
                  .data(dataset, function(d){return d.key+''+d.value;});  //key function for consistency
    var textp = group.selectAll('text')
                  .data(dataset, function(d){return d.key+''+d.value;});	
    var textp1 = group.selectAll('text')
                  .data(dataset, function(d){return d.key+''+d.value;});
	//Update already bound elements (that are not coming or going)
    listp.classed('updated', true);  //add style class to updating
    textp.classed('updated', true);
    textp1.classed('updated', true);
    var present = listp.enter().append('rect').attr('width',0).attr('fill','#000080')  //add new DOM elements
                .classed('new', true)  //add style class to entering
                .merge(listp); //save new DOM elements in a selection
    var presenttext = textp.enter().append('text').text(function(d){return d.key;}).attr('opacity',0.0).attr('fill','black').attr('font-weight','bold')  //add new DOM elements

                .classed('new', true)  //add style class to entering
                .merge(textp); //save new DOM elements in a selection
    var presenttext1 = textp1.enter().append('text').text(function(d){return d.value;}).attr('opacity',0.0).attr('fill','white').attr('font-weight','bold')  //add new DOM elements
                .classed('new', true)  //add style class to entering
                .merge(textp1); //save new DOM elements in a selection
    present.classed('here', true);  //add style class to current (including new)
    present.transition().duration(1000).attr('x',20).attr('y',function(d,i){return i*70+20;}).attr('width',function(d){return xScale(d.value);}).attr('height',50).attr('color','blue');
   presenttext.classed('here', true);
    presenttext.transition().duration(1000).attr('opacity',1.0).attr('x',function(d){return xScale(d.value)+40;}).attr('y',function(d,i){return i*70+50;});
	presenttext1.classed('here', true);
    presenttext1.transition().duration(1000).attr('opacity',1.0).attr('x',function(d){return xScale(d.value/2+10);}).attr('y',function(d,i){return i*70+50;});

  //Handle exiting elements (from original selection)
    listp.exit().transition().duration(50).attr('width',0).remove();
    textp.exit().transition().duration(50).attr('opacity',0.0).remove();
	textp1.exit().transition().duration(50).attr('opacity',0.0).remove();

	//Add more interactivity using mouseover like different fill color, stroke and stroke-width
	svg.selectAll('rect').on("mouseover", function(d) {
        d3.select(this).attr('fill','blue')
		.attr("stroke", "#000080")
		.attr('stroke-width', 5);
      })
	//.on('mouseover',function(d){d3.select(this).append('text').text(d.value);})

	//define changes like fill color and stroke when arrow moves away
    .on("mouseout", function() {
         d3.select(this).attr('fill','#000080')
		 .attr("stroke", '#000080');
		 
    })
	
}

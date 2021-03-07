/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/


//SVG Making with margins
var margin = {left:100, right:20, top:10, bottom:100}

height = 500 - margin.top - margin.bottom
width = 700 - margin.right - margin.left

svg = d3.select('#chart-area').append('svg')
			.attr('height', height + margin.top+margin.bottom)
			.attr('width', width + margin.left+margin.right)

group = svg.append('g')
.attr('transform', 'translate('+ margin.left+','+margin.top + ')')

//  END HERE: Group is prepared and translated to include the margins 

var i = 0

//Code for transitions
t = d3.transition().duration(20)
//END 

//	tip is initialised using d3-tip library

var tip = d3.tip().attr('class', 'd3-tip').html(function(d){
	var st1 = "<b>Country: <b><span style='color:red'>" + d.country +"</span></br><b>Continent: <b><span style='color:red'>" + d.continent +"</span></br>"
	var st2 = "<b>Income($): <b><span style='color:red'>" + d3.format('$,.0f')(d.income) +"</span></br><b>Life Expectancy(in years): <b><span style='color:red'>" + d3.format('.2f')(d.life_exp) +"</span></br>"
	var st3 = "<b>Population: <b><span style='color:red'>" + d3.format(',')(d.population) 
	return st1+st2 +st3
})

group.call(tip)

//Code to generate X-axis

//1.scale
var xScale = d3.scaleLog()
.domain([100,200000])
.range([0, width])

//2. Ticks and initialising type of Scale 
var xAxis = d3.axisBottom(xScale)
.tickValues([400, 4000, 40000])
.tickFormat(d3.format('$'));

//3. Calling the axis 
group.append('g')
.attr('transform', 'translate(0,' + height + ')')
.call(xAxis)

//4. SVG for the x - labels
group.append('text')
.attr('x',(width/2))
.attr('y',(height+45))
.attr('font-size', "25px")
.attr('text-anchor', 'middle')
.attr('fill', 'black')
.text('GDP per Capita($)')


//Code to generate y-axis

// 1. Scale
var yScale = d3.scaleLinear()
.domain([0,100])
.range([height,0])

//2.Type of axis and format if required 
var yAxis =  d3.axisLeft(yScale)

//3. Calling the y-axis
group.append('g')
.call(yAxis)

//4. SVG for the y-labels
group.append('text')
.attr('transform', 'rotate(-90)')
.attr('x',(-height/2))
.attr('y',(-45))
.attr('font-size', "25px")
.attr('text-anchor', 'middle')
.attr('fill', 'black')
.text('Life Expectancy(years)')



//Data to include Json or csv or tsv data 
d3.json("data/data.json").then(function(Alldata){

	
	//This code finds the unique continents
	thisData = Alldata[214]
	data = thisData.countries
	All_cont= data.map(function(d){
		return d.continent
	})
	var set = new Set(All_cont)
	var cont = Array.from(set)

	//SVG to update the year 				
	Y = group.append('text')
		.attr('x',(width - 60))
		.attr('y',(height -60))
		.attr('font-size', "30px")
		.attr('fill', 'grey')


	//Scales for Continents and Radius
	var contScale = d3.scaleOrdinal()
	.domain(cont)
	.range(d3.schemeCategory10)

	var radiusScale = d3.scaleSqrt()
		.domain([300,1400000000])
		.range([3,40])

	console.log(radiusScale)

	//LEGEND Formation

	//Separate group for the Legends
	legend_group = group.append('g')
					.attr('transform', 'translate('+ margin.right+','+margin.top+')')
	
	//1.Sqaures for the colors
	legend_group.selectAll('rect')
	.data(cont)
	.enter()
	.append('rect')
	.transition(t)
	.attr('x', 10)
	.attr('y', function(d, i){return 20*(i+1) })
	.attr('height', 8)
	.attr('width', 8)
	.attr('fill', d=>{return contScale(d)})


	//2.Text for the Continents 
	legend_group.selectAll('text')
	.data(cont)
	.enter()
	.append('text')
	.transition(t)
	.attr('x', 25)
	.attr('y', function(d, i){return 20*(i+1) +8})
	.attr('font-size', '12px')
	.attr('text-anchor', 'start')
	.style('text-transform', 'capitalize')
	.text(d=>{return d} )

	var playing = true

	// $('play').on('cilck')
	

	//d3.interval starts a function that runs with a delay provided by the second arguments 
	
		var myInterval = setInterval(function(){
				
			i = i == 215 ? 0: i
			thisData = Alldata[i]
			year = thisData.year
			data = thisData.countries

			var cont =  d3.extent(data, function(d){
				d['continent']
			})

				upDated = data.filter(function(d){
				return d.income && d.life_exp
			})
			update(upDated, year)
			i = i+1
			
			// IN CASE WE want to stop the loop
			// if (time > 3000){
			// 	interval.stop()
			// 	return 
			// }

				}, 300)

	update = function(data, year){

		Y.text(year)

		//adding data to svg
		circles = group.selectAll('circle').data(data, function(d){return d.country})

		//Remove the circles
		circles.exit().remove()

		//updating
		circles
		.transition(t)
		.attr('cx', function(d){return xScale(d.income)} )
		.attr('cy', function(d){return yScale(d.life_exp)})
		.attr('r', function(d){return radiusScale(d.population)})
		.attr('fill', function(d){return contScale(d.continent)})
		.attr('stroke',"black") 
		.attr('stroke-width',"1")

		//Have to be separated from transitions
		circles
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)

		//Appending when something is not there, initialised at the first instance

		circles
		.enter()
		.append('circle')
		.transition(t)
		.attr('cx', function(d){return xScale(d.income)} )
		.attr('cy', function(d){return yScale(d.life_exp)})
		.attr('r', function(d){return radiusScale(d.population)})
		.attr('fill', function(d){return contScale(d.continent)})
		.attr('stroke',"black") 
		.attr('stroke-width',"1")
	           }
	
	})

	


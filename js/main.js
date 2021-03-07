/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var formattedData
var myInterval
var update

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

//SVG to update the year 				
Y = group.append('text')
	.attr('x',(width - 60))
	.attr('y',(height -60))
	.attr('font-size', "30px")
	.attr('fill', 'grey')

var tip = d3.tip().attr('class', 'd3-tip').html(function(d){
	var st1 = "<b>Country: <b><span style='color:red'>" + d.country +"</span></br><b>Continent: <b><span style='color:red'>" + d.continent +"</span></br>"
	var st2 = "<b>Income($): <b><span style='color:red'>" + d3.format('$,.0f')(d.income) +"</span></br><b>Life Expectancy(in years): <b><span style='color:red'>" + d3.format('.2f')(d.life_exp) +"</span></br>"
	var st3 = "<b>Population: <b><span style='color:red'>" + d3.format(',')(d.population) 
	return st1+st2 +st3
})
group.call(tip)



//Data to include Json or csv or tsv data 
d3.json("data/data.json").then(function(data){

	// Clean data
	formattedData = data.map(function(year){
												return year["countries"].filter(function(country){
												var dataExists = (country.income && country.life_exp);
												return dataExists
																								})
												.map(function(country){
													country.income = +country.income;
													country.life_exp = +country.life_exp;
													return country;            
																		})
											})				

	console.log(formattedData[0])							

	//This code finds the unique continents
	cont= Array.from(new Set(formattedData[0].map(function(d){return d.continent})))
	console.log(cont)												


	//Scales for Continents and Radius
	var contScale = d3.scaleOrdinal()
	.domain(cont)
	.range(d3.schemeCategory10)

	var radiusScale = d3.scaleSqrt()
		.domain([300,1400000000])
		.range([3,20])

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
	

	//d3.interval starts a function that runs with a delay provided by the second arguments 
	var step = function(){

		year = 1800 + i
		x = formattedData[i]
		update(x, year)
		i = i == 214 ? 0: i+1
	}

	//Selecting the button element
	var playPauseButton = $("#play-button")

	//Adding interactivity on Play Pause button 
	playPauseButton .on("click",function(){

		if (playPauseButton.text()=="Play"){
		myInterval = setInterval(step, 400)
		playPauseButton.text( "Pause")
		}
		else{
			clearInterval(myInterval)
			playPauseButton.text("Play") 
		}
	 })

	 //RESET BUTTON 
	 var resetButton = $("#reset-button")
	 resetButton.on("click", function(){
		 i = 0
		 update(formattedData[0], 1800)
	 })

	 //Continent onchange method 
	 $('#Continents').on("change", function(){
		 update(formattedData[i], 1800+i)
	 })


	 $("#slider").slider(
		 { max:2014,
		   min:1800,
		   step:1, 
		   slide:function(event, ui){
					i = ui.value - 1800
					update(formattedData[i],i+1800)
		   }
		 })

	 //Main UPDATE function
	var update = function(data, year){
		Continent = $('#Continents')[0].value
		filteredData = data.filter(function(d){
			if (Continent == "All"){
				return true
			}
			else{
				return d.continent == Continent
			}
		})
		Y.text(year)

		//adding data to svg
		circles = group.selectAll('circle').data(filteredData, function(d){return d.country})

		//Remove the circles
		circles
		.exit()
		.remove()

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


		//Appending when something is not there, initialised at the first instance

		circles
		.enter()
		.append('circle')
		.attr('cx', function(d){return xScale(d.income)} )
		.attr('cy', function(d){return yScale(d.life_exp)})
		.attr('r', 0)
		.transition(t)
		.attr('cx', function(d){return xScale(d.income)} )
		.attr('cy', function(d){return yScale(d.life_exp)})
		.attr('r', function(d){return radiusScale(d.population)})
		.attr('fill', function(d){return contScale(d.continent)})
		.attr('stroke',"black") 
		.attr('stroke-width',"1")

		//	tip is initialised using d3-tip library


		circles
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)

		$("#year").text(1800+i)
		$( "#slider" ).slider( "value", 1800+i );

		console.log($("#slider"))
			   }

		update(formattedData[0],1800)
	
		})



var gridDemo = document.getElementById('gridDemo')

//  Reading from input json file and creating puzzle
function readFile(){
	//const fs = require("fs");
	fetch("./alignments/1.json")
	.then(response => {
	   return response.json();
	})
	.then(data => createPuzzle(data));
}

function createPuzzle(data){
	const box = document.getElementById('grid');

	for(var rowid in data) {
		// console.log(rowid)
		var line = data[rowid]
		const row = document.createElement('div')
		row.classList.add('col')
		row.setAttribute("id", rowid)
		for (let c of line){
			// console.log(numColumns, c)
			const el = document.createElement('div');
			el.classList.add('grid-square')
			if (c=="-") {
				// Append item to row
				el.classList.add(rowid,'gap');
				// el.classList.add('animate__animated', 'animate__flash');
				row.appendChild(el);
			}
			else  {
				// Append item to row
				el.classList.add(rowid,c, 'filtered');
				row.appendChild(el);
			}
		}
		// Append column to grid
		box.appendChild(row);

		var gridDemo = document.getElementById(rowid)
		new Sortable(gridDemo, {
			animation: 150,
			ghostClass: 'blue-background-class',
		    filter: '.filtered', // 'filtered' class is not draggable
		    animation: 150,
			onEnd: function (/**Event*/evt) {
				parse()
		    }
		});
	}

	// Initiate first scoring
	parse()
}

function pairScore(a,b){
	// console.log(a,b)
	// Two gaps
	if ((a=="gap") && (b=="gap")) {return 0}
	// Match
	if ((a!="gap") && (b!="gap") && (a==b)) {return 1}
	// MisMatch
	if ((a!="gap") && (b!="gap") && (a!=b)) {return -2}
	// Gap
	if (a!=b) {return -1}

}

function columnScore(col){
	var score = 0
	for (let i in col){
		for (let j in col){
			if (i<j) { 
				var s = pairScore(col[i],col[j])
				// console.log(s)
				score = score + s
			}
		}
	}
	// console.log("Score:",score)
	return score
}

function parse() {
	var items = $(".grid-square");
	var numRows = $(".col").length ;
	var numColumns = items.length/numRows ;
	var score = 0;

	// We parse the squares left to right
	// to create an array that can be later
	// parsed column wise
	var MSA = []
	var cur_row_name = "row0"
	var row_index = 0
	var col_index = 0
	for (var i = 0; i < items.length ; i++) {
		// console.log(i, items[i].className.split(" "))
		var row_name = items[i].className.split(" ")[1]
		var typ = items[i].className.split(" ")[2]
		if (cur_row_name!=row_name){ 
			row_index = row_index +1
			cur_row_name = row_name
			col_index = 0
		}
		MSA.push([row_index,col_index,typ])
		col_index = col_index + 1
	}

	// For each "column" of the alignment
	// do the scoring and decide what to animate
	var to_animate = []
	for (var i = 0; i < numColumns ; i++) {
		// console.log("column:",i)
		var column =[]
		MSA.forEach((line)=>{
			if (line[1]==i) {
				column.push(line[2])
			}
		});
		// Compute the column score
		var cscore = columnScore(column)
		score = score + cscore

		// is it a perfect column ? add column index for later animation
		const val = column[0]
		const isBelowThreshold = (currentValue) => currentValue == val && currentValue!="gap";
		if (column.every(isBelowThreshold)) { to_animate.push(i) }
	}
	console.log("Animate",to_animate)

	// Animate
	var cur_row_name = "row0"
	var row_index = 0
	var col_index = 0
	for (var j = 0; j < items.length ; j++) {
		// console.log(i, items[i].className.split(" "))
		var row_name = items[j].className.split(" ")[1]
		var typ = items[j].className.split(" ")[2]
		if (cur_row_name!=row_name){ 
			row_index = row_index +1
			cur_row_name = row_name
			col_index = 0
		}
		// items[j].classList.remove("animate__animated", "animate__heartbeat")
		if ( to_animate.includes(col_index)){
			items[j].classList.add("animate__animated", "animate__heartbeat")
			// items[j].innerHTML="A"
		}
		else {
			items[j].classList.remove("animate__animated", "animate__heartbeat")
			// items[j].innerHTML="N"
		}
		col_index = col_index + 1
	}
		


	console.log("Overall:", score)
	updateScoreText(score)
	updateMovesText()
}

function updateMovesText(){
	var moves = parseFloat(document.getElementById("moves_val").textContent)
	document.getElementById("moves_val").innerHTML=moves+1;
}

function updateScoreText(x){
	var current = parseFloat(document.getElementById("score").textContent)
	var stag = document.getElementById("stag")
	stag.innerHTML = x - current

	var score = 0
	$({score: current}).animate({score: x},{
		duration: 500,
		easing:"linear",
		step: function(now, fx){
		  $("#score").html(score + Math.floor(now));
		},
		queue:false,
		complete: function(now, fx){
		  score += x;
		}
	  });
	//   $("#stag").fadeIn({
	// 	duration:700,
	// 	easing:"linear",
	// 	step:function(now, fx){
	// 	  $(this).css("top", -55 * now  +"px");
	// 	}
	//   }).fadeOut({
	// 	duration:300,
	// 	step:function(now, fx){
	// 	  $(this).css("top",-55 * ( 2 - now) + "px");
	// 	}
	//   });
	
	
}

readFile()





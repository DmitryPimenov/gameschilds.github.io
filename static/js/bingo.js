
var turn = "x";
var marked = [];
var props = {
	width: 400,
	height: 550,
	rows: 8,
	columns: 8
};

var table = [];
for (var i = 0; i < props.rows; i++) {
	table.push([]);
	for (var j = 0; j < props.columns; j++) {
		table[i].push("");
	}
}


function startGame() {
	myGameArea.start();
}

var myGameArea = {
	canvas: document.createElement("canvas"),
	start: function () {
		this.canvas.width = props.width;
		this.canvas.height = props.height;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		console.log("Click any cell to begin playing the game. Five in a row wins!");
		this.canvas.addEventListener('mousedown', function (e) {
			var x = e.offsetX;
			var y = e.offsetY;
			var width = props.width / props.columns;
			var height = props.height / props.rows;
			x = Math.floor(x / width);
			y = Math.floor(y / height);
			if (e.button == 0 && (turn == "x" || turn == "o")) {
				if (!table[x][y]) {
					draw(x, y);
				}
				else console.log("Cell (" + x + ", " + y + ") is busy");
			}
		});
		drawGrid();
	}
};

function drawGrid() {
	var ctx = myGameArea.context;
	ctx.lineWidth = 3;
	var width = props.width / props.columns;
	var height = props.height / props.rows;

	for (var i = 0; i < props.rows; i++) {
		ctx.moveTo(0, i * height);
		ctx.lineTo(props.columns * width, i * height);
	}

	for (i = 0; i < props.columns; i++) {
		ctx.moveTo(i * width, 0);
		ctx.lineTo(i * width, props.rows * height);
	}

	ctx.stroke();
}


function checkDirection(x, y, n1, n2) {
	var r = 0;
	if (x + n1 >= 0 && x + n1 < props.columns && y + n2 >= 0 && y + n2 < props.rows) {
		if (table[x + n1][y + n2] == table[x][y]) {
			marked.push([x + n1, y + n2]);
			r++;
			r += checkDirection(x + n1, y + n2, n1, n2)
		}
	}
	return r;
}

function printMarked(winner) {
	var length = marked.length;
	myGameArea.context.lineWidth = 10;
	myGameArea.context.lineCap = "round";
	if (winner == "x") {
		for (var i = 0; i < length; i++) {
			drawX(marked[i][0], marked[i][1], "brown");
		}
	}
	if (winner == "o") {
		for (i = 0; i < length; i++) {
			drawO(marked[i][0], marked[i][1], "brown");
		}
	}
}

function wins(winner) {
	printMarked(winner);
	turn = "0";
	document.getElementById("panel").innerHTML = "Player " + winner.toUpperCase() + " wins!!! </br> Press F5 to restart";
	console.log("Player " + winner.toUpperCase() + " wins!!!");
}

function checkNeighbours(x, y) {
	var c = 1;

	marked = [];
	marked.push([x, y]);

	c += checkDirection(x, y, -1, -1);
	c += checkDirection(x, y, 1, 1);
	if (c >= 5) console.log(c + " - on left diagonal");

	if (c < 5) {
		marked = [];
		marked.push([x, y]);
		c = 1;
		c += checkDirection(x, y, 0, -1);
		c += checkDirection(x, y, 0, 1);
		if (c >= 5) console.log(c + " - vertically");
	}
	if (c < 5) {
		marked = [];
		marked.push([x, y]);
		c = 1;
		c += checkDirection(x, y, 1, -1);
		c += checkDirection(x, y, -1, 1);
		if (c >= 5) console.log(c + " - on right diagonal");
	}
	if (c < 5) {
		marked = [];
		marked.push([x, y]);
		c = 1;
		c += checkDirection(x, y, -1, 0);
		c += checkDirection(x, y, 1, 0);
		if (c >= 5) console.log(c + " - horizontally");
	}

	if (c >= 5) wins(table[x][y]);
}

function draw(x, y) {
	if (turn == "x") {
		drawX(x, y);
		turn = "o";
		document.getElementById("panel").innerHTML = "Turn: O";
	}
	else if (turn == "o") {
		drawO(x, y);
		turn = "x";
		document.getElementById("panel").innerHTML = "Turn: X";

	}
	checkNeighbours(x, y);
}

function drawX(x, y, color) {
	var width = props.width / props.columns;
	var height = props.height / props.rows;
	var ctx = myGameArea.context;
	var posX, posY;
	var radius = 0.3 * width;

	if (!color) color = "#000";
	ctx.strokeStyle = color;

	posX = x * width + width / 2;
	posY = y * height + height / 2;


	ctx.beginPath();
	ctx.translate(posX, posY);
	ctx.moveTo(-radius, -radius);
	ctx.lineTo(radius, radius);
	ctx.moveTo(radius, -radius);
	ctx.lineTo(-radius, radius);
	ctx.stroke();
	ctx.translate(-posX, -posY);

	table[x][y] = "x";
	console.log("X-mark at cell (" + x + ", " + y + ")");
}

function drawO(x, y, color) {
	var width = props.width / props.columns;
	var height = props.height / props.rows;
	var ctx = myGameArea.context;
	var posX, posY;
	var radius = width * 0.35;

	if (!color) color = "#000";
	ctx.strokeStyle = color;

	posX = x * width + width / 2;
	posY = y * height + height / 2;

	ctx.beginPath();
	ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
	ctx.stroke();

	table[x][y] = "o";
	console.log("O-mark at cell (" + x + ", " + y + ")");
}
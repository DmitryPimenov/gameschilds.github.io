const figureChar = "QKBNRPqkbnrp";
const figureView = "♕♔♗♘♖♙♛♚♝♞♜♟";
const colNames = "abcdefgh";
const colNamesU = "ABCDEFGH";
const rowNames = "12345678";
const pawns = "♙♟";
const figureValues = [90, 10000, 30, 30, 50, 10, 90, 10000, 30, 30, 50, 10];

const KQkq = "KQkq";
var castling = KQkq;

var boardReversed = false;

var nextMove = "w";

var playMode = false;
var autoPlay = false;

var undo = [];


function isWhite(figure) {
	return convertViewToChar(figure) < "Z";
}

function convertCharToView(str) {
	var s = "";
	for (var i = 0; i < str.length; i++) {
		var c = str.charAt(i);
		var p = figureChar.indexOf(c);
		if (p < 0) {
			s += c;
		}
		else {
			s += figureView.charAt(p);
		}
	}
	return s;
}

function convertCharToValue(str) {
	if (str === undefined || str === "")
		return 1;
	var c = str.charAt(0);
	var p = figureChar.indexOf(c);
	if (p < 0)
		return 1;
	return figureValues[p];
}


function convertViewToChar(str) {
	var s = "";

	for (var i = 0; i < str.length; i++) {
		var c = str.charAt(i);
		var p = figureView.indexOf(c);
		if (p < 0) {
			s += c;
		}
		else {
			s += figureChar[p];
		}
	}
	return s;
}


function init() {
	initTable();
	setStartPos();
}

function initTable() {
	for (var y = 7; y >= 0; y--) {
		var tr = document.createElement("tr");
		tr.id = "r" + y;
		var th = document.createElement("th");
		th.id = "v" + rowNames[y];
		th.innerHTML = rowNames[y];
		tr.appendChild(th);
		for (var x = 0; x < 8; x++) {
			var td = document.createElement("td");
			var name = colNames[x] + rowNames[y];
			td.id = "f" + name;
			td.name = name;
			td.classList = (x + y) & 1 ? "white field" : "black field";
			tr.appendChild(td);
			td.innerHTML = "";
			td.onclick = function () { click(this) }
		}
		board.appendChild(tr);
	}

	var tr = document.createElement("tr");
	tr.id = "rLabel";

	var th = document.createElement("th");
	th.id = "hx";
	th.innerHTML = " ";
	th.classList = "hdr";
	tr.appendChild(th);

	for (var x = 0; x < 8; x++) {
		var th = document.createElement("th");
		th.id = "h" + x;
		th.innerHTML = colNamesU[x];
		th.classList = "hdr";
		tr.appendChild(th);

	}
	board.appendChild(tr);
}

function initEdit() {
	var td, tr, y
	for (y = 0; y < figureChar.length; y++) {
		tr = document.createElement("tr");
		td = document.createElement("td");
		td.id = "e" + figureChar[y];
		td.name = "e" + figureView[y];
		td.innerHTML = figureView[y];
		td.onclick = function () { clickEdit(this) }
		tr.appendChild(td);
		edit.appendChild(tr);
	}

	tr = document.createElement("tr");
	td = document.createElement("td");
	td.id = "eClear";
	td.innerHTML = "";
	tr.appendChild(td);
	td.onclick = function () { clickEdit(this) }
	edit.appendChild(tr);

	tr = document.createElement("tr");
	td = document.createElement("td");
	td.id = "eQuit";
	td.innerHTML = "X";
	tr.appendChild(td);
	td.onclick = function () { endEdit() }
	edit.appendChild(tr);
	bnedit.classList.add("editActive");
}

function clearBoard() {
	toMove.innerHTML = "";
	var fields = document.getElementsByClassName("field");

	for (var i = 0; i < fields.length; i++) {
		fields[i].innerHTML = "";
	}
}

function setStartPos(pos) {
	clearBoard();
	parseFEN(pos);
	undo = [];
}

var moves = "f2f4 e7e6 g2g4 d8h4";
var movearray = [];
var timermove = null;

function fieldFromName(name) {
	return document.getElementById("f" + name);
}

function parse(moves) {
	movearray = moves.split(" ");
}


function moveTest() {
	if (timermove) {
		clearInterval(timermove);
		timermove = null;
	}
	setStartPos();
	parse(moves);
	timermove = setInterval(function () {
		var m, t;

		m = movearray.shift();
		move(
			fieldFromName(m.slice(0, 2)),
			fieldFromName(m.slice(2, 4))
		);
		if (movearray.length == 0) {
			clearInterval(timermove);
			timermove = null;
		}

	}, 2000);
}

function absolutePos(element) {
	var top = 0;
	var left = 0;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);
	return { top: top, left: left };
};

function highlight(field) {
	field.classList.add("highlighted");
	setTimeout(function () { field.classList.remove("highlighted"); }, 500);
}

function move(from, to, pawnTrasformTo) {
	undo.push(FENString());

	var timeout = 500;
	if (playMode) {
		timeout = 100;
	}
	else {
		highlight(from);
	}
	setTimeout(function () {
		to.innerHTML = from.innerHTML;
		var f = from.innerHTML;
		var isPawn = pawns.indexOf(f) >= 0;
		if (isPawn) {
			var idxs = indexesFromName(to.name);
			if (pawnTrasformTo === undefined)
				pawnTrasformTo = "Q";
			from.classList.remove("pawn");
			if (f == pawns[0]) {
				if (idxs.y == 7) {
					to.innerHTML = convertCharToView(pawnTrasformTo.toUpperCase());
				}
			}
			else {
				if (idxs.y == 0) {
					to.innerHTML = convertCharToView(pawnTrasformTo.toLowerCase());
				}
			}
		}
		smallPawn(to);
		smallPawn(from);
		nextMove = nextMove == 'w' ? 'b' : 'w';
		showToMove();
		from.innerHTML = "";
		highlight(to);
	}, timeout);
}

function indexesFromName(name) {
	var x = name.charCodeAt(0) - 97;
	var y = name.charCodeAt(1) - 49;
	return { x: x, y: y };

}

function checkRange(x, y) {
	return (x >= 0 && x <= 7 && y >= 0 && y <= 7)
}

function nameFromIndexes(x, y) {
	if (checkRange(x, y))
		return colNames[x] + rowNames[y];
	return null;
}

function fieldFromIndexes(x, y) {
	var name = nameFromIndexes(x, y);
	if (name === null) return null;
	return fieldFromName(name);
}

function figureFromIndexes(x, y) {
	var f = fieldFromName(nameFromIndexes(x, y));
	if (f === null) return null;
	return f.innerHTML;
}

function figureCharFromIndexes(x, y) {
	var name = nameFromIndexes(x, y);
	if (name == null) return "";
	var c = fieldFromName(name).innerHTML;
	return convertViewToChar(c);
}

var editSelected = null;
var playSelected = null;

function click(t) {

	if (playMode) {
		if (playSelected === null) {
			if (t.innerHTML != "") {
				var w = isWhite(convertViewToChar(t.innerHTML)) ? "w" : "b";

				if (nextMove == w) {
					playSelected = t;
					playSelected.classList.add("playSelected");
				}
			}
		}
		else {
			if (t == playSelected) {
				playSelected.classList.remove("playSelected");
				playSelected = null;
			}
			else {
				var idxs = indexesFromName(playSelected.name);
				var f = figureCharFromIndexes(idxs.x, idxs.y);
				var mm = getPossibleMoves(f, idxs.x, idxs.y);

				for (var i = 0; i < mm.length; i++) {
					if (mm[i] == t.name) {

						var isCastling = false;
						if (f == 'k') {
							if (t.name[0] == 'c') {
								ooo();
								castling = castling.replace(/k?q?/, "");
								isCastling = true;
							}
							if (t.name[0] == 'g') {
								oo();
								castling = castling.replace(/k?q?/, "");
								isCastling = true;
							}
						}
						if (f == 'K') {
							if (t.name[0] == 'c') {
								OOO();
								castling = castling.replace(/K?Q?/, "");
								isCastling = true;
							}
							if (t.name[0] == 'g') {
								OO();
								castling = castling.replace(/K?Q?/, "");
								isCastling = true;
							}
						}
						if (!isCastling) {
							move(playSelected, t);
							if (f == 'K')
								castling = castling.replace(/K?Q?/, "");
							if (f == 'k')
								castling = castling.replace(/k?q?/, "");
							if (f == 'R') {
								if (idxs.x == 0 && idxs.y == 0)
									castling = castling.replace('Q', "");
								else
									if (idxs.x == 7 && idxs.y == 0)
										castling = castling.replace('K', "");
							}
							if (f == 'r') {
								if (idxs.x == 0 && idxs.y == 7)
									castling = castling.replace('q', "");
								else
									if (idxs.x == 7 && idxs.y == 7)
										castling = castling.replace('k', "");
							}
						}

						playSelected.classList.remove("playSelected");
						playSelected = null;

					}
				}
			}
		}
		return;
	}
	if (edit.innerHTML === "") {
		highlightmoves(t.name);
		var idxs = indexesFromName(t.name);
		fieldEvaluation(idxs.x, idxs.y);
	}
	else {
		if (editSelected && t.innerHTML != editSelected.innerHTML)
			t.innerHTML = editSelected.innerHTML;
		else
			t.innerHTML = "";
		smallPawns();
	}
}

function clickEdit(t) {
	if (editSelected)
		editSelected.classList.remove("editselected");
	editSelected = t;
	editSelected.classList.add("editselected");
}

function highlightmoves(fieldname) {
	var f = convertViewToChar(fieldFromName(fieldname).innerHTML);
	if (f === "")
		return;
	idxs = indexesFromName(fieldname);
	var mm = getPossibleMoves(f, idxs.x, idxs.y);

	for (var i = 0; i < mm.length ; i++) {
		highlight(fieldFromName(mm[i]));
	}
}

function testMove(x, y, white, pawnmode) {

	if (!checkRange(x, y)) return false;
	var field = fieldFromIndexes(x, y);
	var f = field.innerHTML;
	if (pawnmode == 3) { // king
		var a = calcAttack(x, y);
		if (white && a.cntb)
			return false;
		if (!white && a.cntw)
			return false;
	}
	if (pawnmode == 1)
		return f === "";
	if (pawnmode == 2)
		return (f !== "" && (white != isWhite(f)));

	if (f === "")
		return true;

	return !(white == isWhite(f));
}

function OO() {
	move(fe1, fg1);
	move(fh1, ff1);
	nextMove = 'b';
}

function oo() {
	move(fe8, fg8);
	move(fh8, ff8);
	nextMove = 'w';
}

function OOO() {
	move(fe1, fc1);
	move(fa1, fd1);
	nextMove = 'b';
}

function ooo() {
	move(fe8, fc8);
	move(fa8, fd8);
	nextMove = 'w';
}

var vecN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [2, -1], [2, 1], [1, -2], [1, 2]];
var vecB = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
var vecR = [[-1, 0], [1, 0], [0, 1], [0, -1]];
var vecQ = [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, -1], [-1, 1], [1, 1], [1, -1]];

function getPossibleMoves(figure, x, y) {

	var pm = [];
	var w = isWhite(figure);
	var i, j, k;
	switch (figure) {
		case "n":
		case "N":
			for (k = 0; k < vecN.length; k++) {
				if (testMove(x + vecN[k][0], y + vecN[k][1], w))
					pm.push(nameFromIndexes(x + vecN[k][0], y + vecN[k][1]));
			}
			break;

		case "k":
		case "K":
			for (k = 0; k < vecQ.length; k++) {
				if (testMove(x + vecQ[k][0], y + vecQ[k][1], w, 3)) {
					pm.push(nameFromIndexes(x + vecQ[k][0], y + vecQ[k][1]));
					if (k < 2) { // castling
						{  // KQkq
							var idx = w ? 0 : 2;
							if (k == 0) idx++;
							if (testMove(x + vecQ[k][0] * 2, y, w, 3) && castling.search(KQkq[idx]) >= 0) {
								pm.push(nameFromIndexes(x + vecQ[k][0] * 2, y));
							}
						}
					}
				}
			}
			break;

		case "B":
		case "b":
			for (k = 0; k < vecB.length; k++) {
				var dx = vecB[k][0];
				var dy = vecB[k][1];
				for (i = x + dx, j = y + dy; checkRange(i, j) ; i += dx, j += dy) {
					if (testMove(i, j, w))
						pm.push(nameFromIndexes(i, j));
					var f = figureFromIndexes(i, j);
					if (f != "")
						break;
				}
			}
			break;

		case "R":
		case "r":
			for (k = 0; k < vecR.length; k++) {
				var dx = vecR[k][0];
				var dy = vecR[k][1];
				for (i = x + dx, j = y + dy; checkRange(i, j) ; i += dx, j += dy) {
					if (testMove(i, j, w))
						pm.push(nameFromIndexes(i, j));
					var f = figureFromIndexes(i, j);
					if (f != "")
						break;
				}
			}
			break;

		case "Q":
		case "q":
			for (k = 0; k < vecQ.length; k++) {
				var dx = vecQ[k][0];
				var dy = vecQ[k][1];
				for (i = x + dx, j = y + dy; checkRange(i, j) ; i += dx, j += dy) {
					if (testMove(i, j, w))
						pm.push(nameFromIndexes(i, j));
					var f = figureFromIndexes(i, j);
					if (f != "")
						break;
				}
			}
			break;

		case "P":
			if (testMove(x + 1, y + 1, w, 2))
				pm.push(nameFromIndexes(x + 1, y + 1));
			if (testMove(x - 1, y + 1, w, 2))
				pm.push(nameFromIndexes(x - 1, y + 1));
			if (testMove(x, y + 1, w, 1)) {
				pm.push(nameFromIndexes(x, y + 1));
				if (y == 1 && testMove(x, 3, w, 1))
					pm.push(nameFromIndexes(x, 3));
			}
			break;

		case "p":
			if (testMove(x + 1, y - 1, w, 2))
				pm.push(nameFromIndexes(x + 1, y - 1));
			if (testMove(x - 1, y - 1, w, 2))
				pm.push(nameFromIndexes(x - 1, y - 1));
			if (testMove(x, y - 1, w, 1)) {
				pm.push(nameFromIndexes(x, y - 1));
				if (y == 6 && testMove(x, 4, w, 1))
					pm.push(nameFromIndexes(x, 4));
			}
			break;


	}

	return pm;
}

function calcAttack(x, y) {
	var cntb = 0;
	var cntw = 0;
	var c, i, j, k;
	var i, j, k;
	for (k = 0; k < vecN.length; k++) {
		c = figureCharFromIndexes(x + vecN[k][0], y + vecN[k][1]);
		var evVal = 1000 / (convertCharToValue(c) + 1);
		if (c == "N") { cntw += evVal; }
		else if (c == "n") { cntb += evVal; }
	}
	for (k = 0; k < vecQ.length; k++) {
		c = figureCharFromIndexes(x + vecQ[k][0], y + vecQ[k][1]);
		var evVal = 1000 / (convertCharToValue(c) + 1);
		if (c == "K") { cntw += evVal; }
		else if (c == "k") { cntb += evVal; }
	}
	for (k = 0; k < vecB.length; k++) { // diagonals
		var dx = vecB[k][0];
		var dy = vecB[k][1];
		for (i = x + dx, j = y + dy; i < 8 && i >= 0 && j < 8 && j >= 0; i += dx, j += dy) {
			c = figureCharFromIndexes(i, j);
			var evVal = 1000 / (convertCharToValue(c) + 1);
			if (c == "B" || c == "Q") { cntw += evVal; }
			else if (c == "b" || c == "q") { cntb += evVal; }
			if (c !== "")
				break;
		}
	}
	for (k = 0; k < vecR.length; k++) { // rook moves
		var dx = vecR[k][0];
		var dy = vecR[k][1];
		for (i = x + dx, j = y + dy; i < 8 && i >= 0 && j < 8 && j >= 0; i += dx, j += dy) {
			c = figureCharFromIndexes(i, j);
			var evVal = 1000 / (convertCharToValue(c) + 1);
			if (c == "R" || c == "Q") { cntw += evVal; }
			else if (c == "r" || c == "q") { cntb += evVal; }
			if (c !== "")
				break;
		}
	}

	c = figureCharFromIndexes(x + 1, y + 1);
	if (c == 'p') { cntb += evVal; }

	c = figureCharFromIndexes(x - 1, y + 1);
	if (c == 'p') { cntb += evVal; }

	c = figureCharFromIndexes(x + 1, y - 1);
	if (c == 'P') { cntw += evVal; }

	c = figureCharFromIndexes(x - 1, y - 1);
	if (c == 'P') { cntw += evVal; }

	return { cntb: cntb, cntw: cntw };

}

function loadPos(str) {
	if (str === "" || str === undefined)
		str = prompt("Set position", "ka1 Kh8 rg3 rf2");
	clearBoard();
	var ff = str.split(" ");
	for (var i = 0; i < ff.length ; i++) {
		var f = convertCharToView(ff[i].charAt(0));
		var name = ff[i].slice(1, 3);

		fieldFromName(name).innerHTML = f;
	}
}

function findFigure(m, order) {
	var from, to;
	var last = m.slice(-1);
	if (last < "0") {
		m = m.slice(0, -1);
	}
	last = m.slice(-1);
	if (last > "8") { // like bxa8Q
		m = m.slice(0, -1);
	}
	to = m.slice(-2);
	var idxs = indexesFromName(to);
	from = to;
	if (m[0] >= "a") {// pawn
		if (m[1] == "x") {
			if (order) {
				from = m[0] + rowNames[idxs.y + 1];
			} else {
				from = m[0] + rowNames[idxs.y - 1];
			}

		}
		else {
			if (order) {
				from = m[0] + rowNames[idxs.y + 1];

				if (idxs.y == 4 && figureFromIndexes(idxs.x, idxs.y + 1) == "")
					from = m[0] + rowNames[idxs.y + 2];
			} else {
				from = m[0] + rowNames[idxs.y - 1];

				if (idxs.y == 3 && figureFromIndexes(idxs.x, idxs.y - 1) == "")
					from = m[0] + rowNames[idxs.y - 2];
			}
		}
	}
	else {
		var f = m[0];
		if (order == 1)
			f = f.toLowerCase();
		for (var x = 0; x < 8; x++)
			for (var y = 0; y < 8; y++) {
				if (figureCharFromIndexes(x, y) == f) {
					var mm = getPossibleMoves(f, x, y);
					for (var i = 0; i < mm.length; i++) {
						if (mm[i] == to) {

							from = colNames[x] + rowNames[y];
							x = 8; y = 8;
							break;
						}
					}
				}
			}
	}

	return { from: from, to: to };
}
var order;

function playPgn(s) {
	if (timermove) {
		clearInterval(timermove);
		timermove = null;
	}

	log.innerHTML = "";
	if (s === undefined)
		s = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. Nc3 O-O 6. Bg5 h6 7. h4 hxg5 8. hxg5 Ng4 9. g6 Nxf2 10. Nxe5 Nxd1 11. gxf7+ Rxf7 12. Bxf7+ Kf8 13. Rh8+ Ke7 14. Nd5+ Kd6 15. Nc4#";

	setStartPos();

	s = s.replace(/\.\s*/g, ". ");
	s = s.replace(/\s+/g, " ");


	movearray = s.split(" ");

	order = 0;

	timermove = setInterval(function () {
		var m, t;

		m = movearray.shift();
		while (m === "") {
			if (movearray.length == 0) {
				clearInterval(timermove);
				timermove = null;
				return;
			}
			m = movearray.shift();
		}

		while (m.startsWith("{")) {
			var comment = m.slice(1);
			do {
				m = movearray.shift();
				comment += ' ' + m;
			}
			while (!m.endsWith("}"))

			alert(comment.slice(0, -1));
			m = movearray.shift();
		}

		log.innerHTML += ' ' + m;

		if (m.endsWith(".")) {
			m = movearray.shift();
			log.innerHTML += m;
		}

		if (m == "O-O") {
			if (order) oo();
			else OO();
		}
		else
			if (m == "O-O-O") {
				if (order) ooo();
				else OOO();
			}
			else {
				var mv = findFigure(m, order);
				var pawnTransformTo = m.slice(-1);
				if (pawnTransformTo < "A") // skip +
					pawnTransformTo = m.slice(-2, -1);
				move(fieldFromName(mv.from), fieldFromName(mv.to), pawnTransformTo);
			}



		order = 1 - order;
		nextMove = order ? "b" : "w";

		if (movearray.length == 0) {
			clearInterval(timermove);
			timermove = null;
		}
	}, 2000);

}

function smallPawn(field) {
	if (field.innerHTML != "" && pawns.includes(field.innerHTML)) {
		field.classList.add("pawn");
	}
	else {
		field.classList.remove("pawn");
	}
}

function smallPawns() {
	var fields = document.getElementsByClassName("field");

	for (var i = 0; i < fields.length; i++) {
		smallPawn(fields[i]);
	}
}
function editBoard() {
	if (edit.innerHTML != "") {
		endEdit();
	}
	else {
		if (playMode)
			Play();
		initEdit();
	}
}

function endEdit() {
	edit.innerHTML = "";
	bnedit.classList.remove("editActive");
}

function parseFEN(str) {
	clearBoard();
	if (str === "" || str === undefined)
		str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
	var ss = str.split(' ');
	var sBoard = ss[0];
	nextMove = ss[1];
	castling = ss[2];
	var sLineArray = sBoard.split('/');
	var y = 7;
	var sLineidx = 0;
	while (y >= 0) {
		var sLine = sLineArray[sLineidx++];

		var idx = 0;
		var x = 0;
		while (x < 8) {
			var currentChar = sLine[idx++];
			var figureCharIdx = figureChar.indexOf(currentChar);
			if (figureCharIdx >= 0) // figure
			{
				fieldFromIndexes(x, y).innerHTML = figureView[figureCharIdx];
				x++;
			}
			else {
				var skip = "012345678".indexOf(currentChar);

				if (skip > 0) {
					x += skip;
				}
				else {
					alert("wrong FEN string");
					clearBoard();
					return;
				}
			}
		} // x
		y--;
	} // y
	smallPawns();
}

var FENdemo = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
function loadFEN() {
	FENdemo = prompt("FEN position", FENdemo);
	parseFEN(FENdemo);
}



function pgnDemo1() {
	var s = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. d3 Nf6 5. Nc3 O-O 6. Bg5 h6 7. h4 hxg5 8. hxg5 Ng4 9. g6 Nxf2 10. Nxe5 Nxd1 11. gxf7+ Rxf7 12. Bxf7+ Kf8 13. Rh8+ Ke7 14. Nd5+ Kd6 15. Nc4#";
	playPgn(s);
}

function pgnDemo2() {
	s = "  1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 d6 7.Qb3 \
{7.dxe5 dxe 5 8.Qxd8+ Nxd8 9.Nxe5 Be6 Black has returned the pawn but enjoys a comfortable game.} \
Qe7 \
{The wrong square for the queen, though it seems logical. The e7-square is needed for a knight. 7...Qd7 8.dxe5 Bb6 9.e6 fxe6 10.Ng5 Na5 11. Bxe6 Nxb3 12.Bxd7+ Bxd7 13.axb3 Nf6} \
8.d5 Nd4 \
{This looks like a clever move, since the knight cannot be captured by the pawn because of the pin. But now the game gets quite exciting as Morphy lets his king get chased around the board.} \
9.Bb5+ c6 10.Nxd4 exd4 \
{10...cxb5 11.Qxb5+ Bd7 12.Qxa5 exd4 13. O-O Qxe4 14.c4 Ne7 15.Re1 Qg6 16.Qc7 b6 17.Ba3} \
11.dxc6 Qxe4+ 12.Kd1 Bg4+ 13.f3 Bxf3+ 14.gxf3 Qxf3+ 15.Kc2 Qe4+ \
{Black does not have time to capture the rook because of the discovered check. 15...Qxh1 16.cxb7+ Kf8 17. bxa8Q+ Qxa8 18.Ba3 White has an extra piece.} \
16.Kb2 Bxc3+ 17.Nxc3 dxc3+ 18.Qxc3 O-O-O \
{Black seems to have castled to safety and has a pile of extra pawns. But Morphy will use the open files to attack.} \
19.Re1 Qd5 20.cxb7+ Kxb7 \
{20...Kb8 The king would have been safer using the White pawn as a shield.} \
21.Rb1 \
{A brilliant quiet move. White sets up future threats on the open b-file.} \
Nf6 \
{Now White unleashes a tremendous combination involving the open file and a discovered check.} \
22.Bc6+ Qxc6 23.Ka1+ Kc7 24.Qa5+ Kc8 25.Qxa7 \
{Now the open c-file will bring the game to a rapid close.} \
Nd7 26.Bd2 1-0";
	playPgn(s);
}

function FENString () {
	var FEN = "";
	for (var y = 7; y >= 0; y--) {
		for (var x = 0; x < 8; x++) {
			var f = figureCharFromIndexes(x, y);
			if (f === '') f = " ";
			FEN += f;
		}
		if (y)
			FEN += "/";
	}
	FEN = FEN.replace(/		/g, "8");
	FEN = FEN.replace(/	   /g, "7");
	FEN = FEN.replace(/	  /g, "6");
	FEN = FEN.replace(/	 /g, "5");
	FEN = FEN.replace(/	/g, "4");
	FEN = FEN.replace(/   /g, "3");
	FEN = FEN.replace(/  /g, "2");
	FEN = FEN.replace(/ /g, "1");
	FEN += ' ' + nextMove;
	FEN += ' ' + castling;
	FEN += ' - 0 1'; // not supported, for compatibility onlt

	return FEN;
}


function BoardToFEN() {
	log.innerHTML = FENString();

}

function showToMove() {
	if (playMode) {
		toMove.innerHTML = (nextMove == 'w') ?
			"White to move" :
			"Black to move";
	}
	else
		toMove.innerHTML = "";
}

function Stop() {
	if (timermove) {
		clearInterval(timermove);
		timermove = null;
	}
}

function Play() {
	playMode = !playMode;
	if (playMode) {
		endEdit();
		bnplay.classList.add("playActive");
		showToMove();
	}
	else {
		bnplay.classList.remove("playActive");
		toMove.innerHTML = "";
	}
}


function Rotate() {
	if (boardReversed) {
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 7; j++) {
				var cn0 = colNames[6 - j];
				var cn1 = colNames[7 - j];
				document.getElementById("r" + i).insertBefore(
				document.getElementById("f" + cn0 + (i + 1)),
				document.getElementById("f" + cn1 + (i + 1))
				);
			}
		}
		for (var j = 0; j < 7; j++) {
			var row0 = "r"+(j+1);
			var row1 = "r"+(j);
			board.insertBefore(
				document.getElementById(row0),
				document.getElementById(row1)
				);
			}
	}
	else {
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 7; j++) {
				var cn0 = colNames[j+1];
				var cn1 = colNames[j];
				document.getElementById("r" + i).insertBefore(
				document.getElementById("f"+cn0+(i+1)),
				document.getElementById("f"+cn1+(i+1))
				);
			}
		}
		for (var j = 0; j < 7; j++) {
			var row0 = "r" + (6-j);
			var row1 = "r" + (7-j);
			board.insertBefore(
				document.getElementById(row0),
				document.getElementById(row1)
				);
		}
	}

	boardReversed = !boardReversed;

	for (var i = 0; i < 8; i++) {
		document.getElementById("h" + i).innerHTML =
			colNamesU[boardReversed ? 7 - i : i];
	}

}

function getAllPossibleMoves() {
	moves = [];
	var nextMoveWhite = (nextMove == "w");
	for (var j = 0; j < 8; j++) {
		for (var i = 0; i < 8; i++) {
			var f = figureCharFromIndexes(i, j)
			if (f === "")
				continue;
			if (isWhite(f) != nextMoveWhite)
				continue;

			var mm = getPossibleMoves(f, i, j);
			if (mm.length) {
				var namefrom = nameFromIndexes(i,j);

				for (var k = 0; k<mm.length; k++)
					moves.push(nameFromIndexes(i,j)+mm[k]);
			}
		}
	}
	return moves;
}

function Suggest(show) {
	if (show === undefined)
		show = true;
	var saved = FENString();
	var bestMove = null;
	var bestVal;
	var moves = getAllPossibleMoves();
	for (var i = 0; i < moves.length; i++)
	{
		var from = fieldFromName(moves[i].slice(0, 2));
		var to = fieldFromName(moves[i].slice(2, 4));
		var val = move0(from, to);
		if (bestMove === null) {
			bestVal = val;
			bestMove = moves[i];
		}
		else {
			if (nextMove != 'w')
				val *= -1;
			if (bestVal < val)  {
				bestVal = val;
				bestMove = moves[i];
			}
		}



		parseFEN(saved);
	}
	if (show)
	{
		var from = fieldFromName(bestMove.slice(0, 2));
		var to = fieldFromName(bestMove.slice(2, 4));
		highlight(from);
		highlight(to);
	}

	return bestMove;
}

function Auto() {
	if (timermove) {
		clearInterval(timermove);
		timermove = null;
	}
	autoPlay = !autoPlay;
	if (autoPlay) {
		bnauto.classList.add("playActive");
		timermove = setInterval(function () {
			var m = Suggest(false);
			move(
				fieldFromName(m.slice(0, 2)),
				fieldFromName(m.slice(2, 4))
			);


		}, 2000);
	}
	else {
		bnauto.classList.remove("playActive");
	}
}

function move0(from, to, pawnTrasformTo) {
	to.innerHTML = from.innerHTML;
	var f = from.innerHTML;
	var isPawn = pawns.indexOf(f) >= 0;
	if (isPawn) {
		var idxs = indexesFromName(to.name);
		if (pawnTrasformTo === undefined)
			pawnTrasformTo = "Q";
		if (f == pawns[0]) { // white pawn
			if (idxs.y == 7) { // transform
				to.innerHTML = convertCharToView(pawnTrasformTo.toUpperCase());
			}
		}
		else {			   // black pawn
			if (idxs.y == 0) { // transform
				to.innerHTML = convertCharToView(pawnTrasformTo.toLowerCase());
			}
		}
	}
	nextMove = (nextMove == 'w') ? 'b' : 'w';
	return boardEvaluation();
}

function fieldEvaluation(i, j) {
	var f = figureCharFromIndexes(i, j)
	var figureValue = convertCharToValue(f);
	var w = isWhite(f);
	var a = calcAttack(i, j);

}


function boardEvaluation() {
	var sum = 0;
	for (var j = 0; j < 8; j++) {
		for (var i = 0; i < 8; i++) {
			var f = figureCharFromIndexes(i, j)
			var figureValue =convertCharToValue(f);
			var w = isWhite(f);
			var a = calcAttack(i, j);

			sum += (a.cntw - a.cntb) * figureValue;
		}
	}
	return sum;
}

function TakeBack() {
	if (undo.length) {
		var last = undo.pop();

		parseFEN(last);
	}
}

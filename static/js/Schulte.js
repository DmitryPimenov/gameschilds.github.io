var a; 
var i=0; 
var sec=0; 
var min=0; 
var check = 1;
let array = []; 
var time = 0;

window.onload=start;

function getRandomInt(min, max) 
{ 
	return Math.floor(Math.random() * (max - min)) + min;
} 
function timer()
{ 
	sec++; 
	if(sec<10) 
	{ 
		document.getElementById("sec").innerHTML = "0"+sec; 
	} 
	else{ 
		document.getElementById("sec").innerHTML = sec; 
	} 
	if(min<10) 
	{ 
		document.getElementById("min").innerHTML = "0"+min; 
	} 
	else{ 
		document.getElementById("min").innerHTML = min; 
	} 
	if(sec==60) 
	{ 
		sec=0; 
		min++; 
		if(sec<10) 
		{
					  document.getElementById("sec").innerHTML = "0"+sec; 
	 } 
	 else{ 
	  document.getElementById("sec").innerHTML = sec; 
	 } 
	 if(min<10) 
	 { 
	  document.getElementById("min").innerHTML = "0"+min; 
	 } 
	 else{ 
	  document.getElementById("min").innerHTML = min; 
	 } 
	} 
   } 
   function restart() 
   { 
	document.getElementById("game").style.display = "flex"; 
	i=0; 
	sec=0; 
	min=0; 
	check = 1; 
	document.getElementById("check").innerHTML = check; 
	array = []; 
	time = 0; 
	start(); 
   } 
   function breset(id){ 
	document.getElementById("b"+id).style.backgroundColor = "#DDDDDD"; 
   } 
   function fcheck(id) 
   { 
	if(id==check){ 
	 document.getElementById("b"+id).style.opacity = "0"; 
	 document.getElementById("b"+id).style.backgroundColor = "#008000"; 
	 if(check<25) 
	 { 
	  check++; 
	 } 
	 else{ 
	  if(min<10){min="0"+min;} 
	  if(sec<10){sec="0"+sec;} 
	   
	  time = min+":"+sec; 
	  document.getElementById("check").style.visibility = "hidden"; 
	  document.getElementById("timer").style.visibility = "hidden"; 
	  document.getElementById("game").style.display = "block"; 
	  document.getElementById("game").innerHTML = "<div id='result'>Result: "+time+"</div><br><div id='restart' onclick='restart()'>Play Again</div>";
	 } 
	 document.getElementById("check").innerHTML = check; 
	}  
	else{ 
	 document.getElementById("b"+id).style.backgroundColor = "#cf0000"; 
	 setTimeout(function() { 
	  breset(id); 
	 }, 200); 
	} 
   } 
   function start() 
   { 
	document.getElementById("check").style.visibility = "visible"; 
	document.getElementById("timer").style.visibility = "visible"; 
	while (array.length<25)
	{ 
	 a=getRandomInt(1, 26);
	 if(array.indexOf(a)==-1) 
	 { 
	  array.push(a); 
	 } 
	}
document.getElementById("game").innerHTML = "";
while (array.length>i)
{
document.getElementById("game").innerHTML += "<div class='block1' id='b"+array[i]+"' onclick='fcheck("+array[i]+")'>"+array[i]+"</div>";
i++;
}
setInterval(timer,1000)
}
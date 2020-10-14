function search()
{
	var input, filter, i, text, a, ul, li;
	input = document.getElementById("uniq");
	filter = input.value.toUpperCase();
	ul = document.getElementById("ul");
	li = document.getElementsByTagName("li");
	for (i = 0; i < li.length; i++)
	{
		a = li[i].getElementsByTagName("a")[0];
		text = a.textContent || a.innerText;
		if (text.toUpperCase().indexOf(filter) > -1)
		{
		   li[i].style.display = ""; 
		}
		else
		{
			li[i].style.display = "none";
		}
	}
}
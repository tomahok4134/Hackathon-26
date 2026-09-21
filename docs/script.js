const CurrentDate=new Date();
const CurrentTime=CurrentDate.getHours();
if (CurrentTime<=5&&CurrentTime>=10) {
	document.querySelector(".Greetings").textContent="Good Morning";
}else if(CurrentTime<=10&&CurrentTime>=15){
	document.querySelector(".Greetings").textContent="Hello";
}else if(CurrentTime<=15&&CurrentTime>=20){
	document.querySelector(".Greetings").textContent="Good Afternoon";
}else if(CurrentTime<=20&&CurrentTime>=24||CurrentTime<=0&&CurrentTime>=5){
	document.querySelector(".Greetings").textContent="Good Evening";
}else{
	document.querySelector(".Greetings").textContent="huh?";
}
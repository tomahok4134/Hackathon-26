const CurrentDate=new Date();
const CurrentTime=CurrentDate.gethours();
if (CurrentTime<=5&&CurrentTime>=10) {
	document.querySelector(".Greetings")="Good Morning";
}else if (CurrentTime<=10&&CurrentTime>=15) {
	document.querySelector(".Greetings")="Hello";
}else if (CurrentTime<=15&&CurrentTime>=20) {
	document.querySelector(".Greetings")="Good Afternoon";
}else if (CurrentTime<=20&&CurrentTime>=24||CurrentTime<=0&&CurrentTime>=5) {
	document.querySelector(".Greetings")="Good Evening";
}else{
	document.querySelector(".Greetings")="huh?";
}
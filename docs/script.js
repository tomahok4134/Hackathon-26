const CurrentTime=new Date().getHours();
const Greetings=document.querySelector(".Greetings");
if(CurrentTime>=20||CurrentTime<5){
    Greetings.textContent="Good Evening";
}else if(CurrentTime>=15){
    Greetings.textContent="Good Afternoon";
}else if(CurrentTime>=10){
    Greetings.textContent="Hello";
}else if(CurrentTime>=5){
    Greetings.textContent="Good Morning";
}else{
	Greetimgs.textContent="What time is it now??";
}

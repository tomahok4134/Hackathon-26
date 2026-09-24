const CurrentTime = new Date().getHours();
const Greetings = document.querySelector(".Greetings");
if (CurrentTime >= 20 || CurrentTime < 5) {
  Greetings.textContent = "Good Evening";
} else if (CurrentTime >= 15) {
  Greetings.textContent = "Good Afternoon";
} else if (CurrentTime >= 10) {
  Greetings.textContent = "Hello";
} else if (CurrentTime >= 5) {
  Greetings.textContent = "Good Morning";
} else {
  Greetimgs.textContent = "What time is it now??";
}

//tests
try {
  localStorage.setItem(
    "localstorage_test",
    JSON.stringify([15, 7, 24, 161, 43, 82, 53, 80]),
  );
  alert(localStorage.getItem("localstorage_test"));
} catch (ex) {
  alert(ex);
}

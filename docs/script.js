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
  Greetings.textContent = "What time is it now??";
}

alert(new URL(location).searchParams.get("state"));
if (new URL(location).searchParams.get("state") === "open") {
  globalLoginData.then(([login]) => {
    if (login) location.href = getURL(`home/index.html`);
    else location.href = getURL(`index.html`);
  });
}

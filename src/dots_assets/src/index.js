import { dots } from "../../declarations/dots";

document.getElementById("clickMeBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.toString();
  // Interact with dots actor, calling the greet method
  const greeting = await dots.greet(name);

  document.getElementById("greeting").innerText = greeting;
});

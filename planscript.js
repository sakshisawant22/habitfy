// Allow marking tasks as done
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll("li");

  items.forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("done");
    });
  });
});

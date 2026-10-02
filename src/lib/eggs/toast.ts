/** Small message pill at the bottom of the screen. */
export function toast(text: string, ms = 2600) {
  document.getElementById("egg-toast")?.remove();
  const el = document.createElement("div");
  el.id = "egg-toast";
  el.dataset.eggUi = "";
  el.setAttribute("role", "status");
  el.className = "egg-toast";
  el.textContent = text;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add("is-in"));
  setTimeout(() => {
    el.classList.remove("is-in");
    setTimeout(() => el.remove(), 400);
  }, ms);
}

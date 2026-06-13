(function () {
  const button = document.querySelector(".back-to-top");
  if (!button) return;

  function syncVisibility() {
    button.classList.toggle("is-visible", window.scrollY > 480);
  }

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener("scroll", syncVisibility, { passive: true });
  syncVisibility();
})();

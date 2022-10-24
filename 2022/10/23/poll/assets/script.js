function updateGraphics() {
  var scroll = document.body.scrollTop || document.documentElement.scrollTop;
  const sections = Array.from(document.querySelectorAll("article section"));
  const currentSectionIndex = sections.findIndex((section) => {
    return (
      section.offsetTop + section.offsetHeight >=
      scroll + this.window.innerHeight / 2
    );
  });
  const currentSection = sections[currentSectionIndex];
  document.querySelectorAll("header nav a").forEach((link) => {
    link.classList.toggle("active", link.hash === "#" + currentSection.id);
  });

  sections.forEach((section, i) => {
    section.classList.toggle("active", i === currentSectionIndex);
  });
}
if (document.querySelector("header nav a[href^='#']")) {
  window.addEventListener("scroll", updateGraphics);
  updateGraphics();
}

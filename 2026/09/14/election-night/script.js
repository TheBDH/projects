document.addEventListener("DOMContentLoaded", function () {
    const steps = [...document.querySelectorAll(".step")];
    const slides = [...document.querySelectorAll(".slide")];
    const clock = document.querySelector("#clock");
    const first = document.querySelector(".step .article");
    let last = -1;

    function update() {
        const mid = innerHeight / 2;
        const passed = el => el.getBoundingClientRect().top <= mid;
        const cur = slides.findIndex(s => passed(s) && s.getBoundingClientRect().bottom > mid);
        const snap = cur >= 0 && last >= 0 && cur !== last && slides[cur].lastChild.textContent === slides[last].lastChild.textContent;
        slides.forEach((s, i) => {
            s.classList.toggle("active", i === cur);
            s.classList.toggle("snap", snap && (i === cur || i === last));
        });
        last = cur;

        const step = steps.filter(passed).pop();
        clock.classList.toggle("labels", first.getBoundingClientRect().top > clock.getBoundingClientRect().bottom);
        const [h, m] = (step || steps[0]).dataset.time.split(":").map(Number);
        clock.querySelector(".hour").style.transform = `rotate(${h * 30 + m / 2}deg)`;
        clock.querySelector(".minute").style.transform = `rotate(${h * 360 + m * 6}deg)`;
        clock.querySelector("span").textContent = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h % 24 < 12 ? "a.m." : "p.m."}`;
    }

    addEventListener("scroll", update);
    update();
    void clock.offsetWidth;
    clock.classList.add("ready");
});

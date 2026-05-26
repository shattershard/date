const steps = ["intro", "ask", "wow", "food", "date", "result"];

function showStep(id) {
  document
    .querySelectorAll(".card")
    .forEach((card) => card.classList.remove("is-active"));
  const next = document.querySelector(`.card[data-step="${id}"]`);
  if (next) {
    next.classList.add("is-active");
  }
}

function getCurrentStep() {
  const active = document.querySelector(".card.is-active");
  return active ? active.getAttribute("data-step") : null;
}

function initFlow() {
  showStep(steps[0]);

  document.querySelectorAll(".js-next").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = getCurrentStep();
      const index = steps.indexOf(current);
      const next = steps[index + 1];
      if (next) showStep(next);
    });
  });

  const noBtn = document.querySelector(".js-no");
  const yesBtn = document.querySelector(".js-yes");

  if (noBtn && yesBtn) {
    let dodgeCount = 0;
    const phrases = [
      "нет... хотя может да?",
      "не-а 😇",
      "не поймаешь 💅",
      "ой, промахнулась 🤭",
      "попробуй ещё раз 🫶",
      "ну всё, я убегаю 🏃‍♀️",
    ];

    noBtn.addEventListener("click", (e) => e.preventDefault());

    const dodge = () => {
      dodgeCount += 1;
      noBtn.textContent = phrases[(dodgeCount - 1) % phrases.length];

      const wrap = noBtn.closest(".card") || document.body;
      const wrapRect = wrap.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();

      const pad = 10;
      const maxX = Math.max(pad, wrapRect.width - btnRect.width - pad);
      const maxY = Math.max(pad, wrapRect.height - btnRect.height - pad);

      const x = Math.floor(pad + Math.random() * (maxX - pad));
      const y = Math.floor(pad + Math.random() * (maxY - pad));

      noBtn.style.position = "absolute";
      noBtn.style.left = `${x}px`;
      noBtn.style.top = `${y}px`;
      noBtn.style.transform = "translate3d(0,0,0)";
      noBtn.style.willChange = "left, top";
      noBtn.style.zIndex = "5";

      const wrapStyle = window.getComputedStyle(wrap);
      if (wrapStyle.position === "static") {
        wrap.style.position = "relative";
      }
    };

    noBtn.addEventListener("mouseenter", dodge);
    noBtn.addEventListener("mousemove", dodge);

    noBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      dodge();
    }, { passive: false });
    noBtn.addEventListener("touchmove", (e) => {
      e.preventDefault();
      dodge();
    }, { passive: false });

    noBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      dodge();
    });

    yesBtn.addEventListener("click", () => {
      showStep("wow");
    });
  }

  const choices = document.querySelectorAll("#foodChoices .choice");
  const selectedFood = new Set();

  choices.forEach((choice) => {
    choice.addEventListener("click", () => {
      const value = choice.getAttribute("data-value");
      if (selectedFood.has(value)) {
        selectedFood.delete(value);
        choice.classList.remove("is-selected");
      } else {
        selectedFood.add(value);
        choice.classList.add("is-selected");
      }
    });
  });

  const finishBtn = document.querySelector(".js-finish");
  if (finishBtn) {
    finishBtn.addEventListener("click", async () => {
      const dateInput = document.getElementById("dateInput");
      const timeInput = document.getElementById("timeInput");
      const resultText = document.getElementById("resultText");

      const date = dateInput && dateInput.value ? dateInput.value : null;
      const time = timeInput && timeInput.value ? timeInput.value : null;

      const foods = Array.from(selectedFood);
      let text = "";

      if (date || time) {
        const formatted = date
          ? new Date(date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })
          : "сегодня";
        const withTime = time ? ` в ${time}` : "";
        text += `Наше свидание назначено на ${formatted}${withTime}. `;
      } else {
        text += "Наше свидание — прямо сегодня, без отговорок. ";
      }

      if (foods.length) {
        text += `Я записала: ${foods.join(", ")}. `;
      } else {
        text += "А есть будем всё, что увидим по дороге. ";
      }

      text += "С тебя — хорошее настроение, с меня — всё остальное 💗";

      try {
        await fetch("/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            time,
            foods,
            text,
          }),
        });
      } catch (e) {
      }

      if (resultText) {
        resultText.textContent = text;
      }

      showStep("result");
    });
  }
}

document.addEventListener("DOMContentLoaded", initFlow);


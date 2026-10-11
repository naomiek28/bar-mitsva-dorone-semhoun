document.addEventListener("DOMContentLoaded", function () {
  window.__doroneBooted = true;

  const body = document.body;
  const openButton = document.getElementById("openInvitation");
  const music = document.getElementById("backgroundMusic");
  const musicButton = document.getElementById("musicToggle");
  const form = document.getElementById("rsvpForm");
  const allEvents = document.getElementById("allEvents");
  const notAttending = document.getElementById("notAttending");
  const eventChoices = Array.from(
    document.querySelectorAll('input[name="evenements"]')
  );

  prepareHebrewName();
  prepareElegantDelays();

  window.setTimeout(function () {
    body.classList.remove("is-loading");
    body.classList.add("loaded", "welcome-visible");
  }, 3400);

  if (openButton) {
    openButton.addEventListener("click", function () {
      body.classList.remove("welcome-visible");
      body.classList.add("invitation-open", "motion-ready");

      window.scrollTo(0, 0);

      startMusic();

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(revealSections);
      });
    });
  }

  if (musicButton && music) {
    musicButton.addEventListener("click", function () {
      if (music.paused) {
        startMusic();
      } else {
        music.pause();
        updateMusicButton(false);
      }
    });

    music.addEventListener("play", function () {
      updateMusicButton(true);
    });

    music.addEventListener("pause", function () {
      updateMusicButton(false);
    });
  }

  if (allEvents) {
    allEvents.addEventListener("change", function () {
      eventChoices.forEach(function (choice) {
        choice.checked = allEvents.checked;
      });

      if (allEvents.checked && notAttending) {
        notAttending.checked = false;
      }
    });
  }

  if (notAttending) {
    notAttending.addEventListener("change", function () {
      if (!notAttending.checked) return;

      eventChoices.forEach(function (choice) {
        choice.checked = false;
      });

      if (allEvents) allEvents.checked = false;
    });
  }

  eventChoices.forEach(function (choice) {
    choice.addEventListener("change", function () {
      if (choice.checked && notAttending) {
        notAttending.checked = false;
      }

      if (allEvents) {
        allEvents.checked = eventChoices.every(function (item) {
          return item.checked;
        });
      }
    });
  });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const status = document.getElementById("rsvpStatus");
      const selected = eventChoices.filter(function (choice) {
        return choice.checked;
      });

      if (!selected.length && !(notAttending && notAttending.checked)) {
        status.textContent = "Choisissez au moins une réponse.";
        status.className = "rsvp-status error";
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      data.evenements =
        notAttending && notAttending.checked
          ? ["Absent(e)"]
          : selected.map(function (choice) {
              return choice.value;
            });

      localStorage.setItem("dorone-rsvp", JSON.stringify(data));
      status.textContent =
        "Votre réponse est bien enregistrée sur cet appareil.";
      status.className = "rsvp-status success";
    });
  }

  function prepareHebrewName() {
    const hebrewName = document.querySelector(".hebrew-name");

    if (!hebrewName || hebrewName.dataset.prepared === "true") return;

    const text = hebrewName.textContent.trim();
    hebrewName.textContent = "";
    hebrewName.dataset.prepared = "true";

    Array.from(text).forEach(function (character, index) {
      const letter = document.createElement("span");
      letter.textContent = character === " " ? "\u00A0" : character;
      letter.style.setProperty(
        "--letter-delay",
        0.35 + index * 0.11 + "s"
      );
      hebrewName.appendChild(letter);
    });
  }

  function startMusic() {
    if (!music) return;

    const playPromise = music.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        updateMusicButton(false);
      });
    }
  }

  function updateMusicButton(isPlaying) {
    if (!musicButton) return;

    musicButton.classList.toggle("is-paused", !isPlaying);
    musicButton.setAttribute(
      "aria-label",
      isPlaying ? "Mettre la musique en pause" : "Relancer la musique"
    );
  }

  function prepareElegantDelays() {
    document
      .querySelectorAll(".paper, .event-card, .rsvp-card")
      .forEach(function (card) {
        Array.from(card.children).forEach(function (item, index) {
          if (item.classList.contains("hebrew-name")) return;
          item.style.setProperty(
            "--item-delay",
            0.08 + index * 0.09 + "s"
          );
        });
      });
  }

  function revealSections() {
    const items = Array.from(document.querySelectorAll(".reveal"));

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });

    if (items.length) {
      items[0].classList.add("visible");
    }
  }
});

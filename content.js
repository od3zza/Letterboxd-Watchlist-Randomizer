// ==UserScript==
// @name         Letterboxd - Watchlist Randomizer
// @namespace    https://github.com/od3zza/Letterboxd-Randomizer
// @version      0.5
// @description  Now it's easier to choose a movie from your Watchlist, isn't it? 🍿
// @author       od3zza
// @match        https://letterboxd.com/*
// @license      GNU GPLv3
// @icon         https://a.ltrbxd.com/logos/letterboxd-decal-dots-neg-rgb.svg
// @grant        none
// ==/UserScript==

/* Buy me a pizza 🍕 https://ko-fi.com/od3zza */

(function () {
  "use strict";

  // Checks if the current page is the watchlist
  if (!window.location.href.includes("watchlist")) {
    return;
  }

  // Initializes the LETTERBOXD_RANDOMIZER object
  window.LETTERBOXD_RANDOMIZER = {
    filmIndex: -1,
    active: false,
    shuffledIndexList: [],
    shuffledIndexListCounter: 0,
  };

  const RANDOMIZER_SELECTED_CLASS = "letterboxd-randomizer-chosen";

  // Add the "Randomizer" button
  const sortingSelects = document.querySelector(".sorting-selects.has-hide-toggle");
  const newSection = document.createElement("section");
  newSection.classList.add("smenu-wrapper");

  const button = document.createElement("button");
  button.textContent = "Randomizer ⟳";
  button.addEventListener("click", () => {
    const scrollToSelection = true;
    randomizer(scrollToSelection);
  });
  button.style.cssText = `
    padding: 5px 8px 6px;
    font-size: .84615385rem;
    text-transform: uppercase;
    background: none;
    border: none;
    font-family: Graphik-Regular-Web, sans-serif;
    color: #678;
  `;

  button.addEventListener("mouseover", () => {
    button.style.color = "white";
  });

  button.addEventListener("mouseout", () => {
    button.style.color = "#678";
  });

  const smenu = document.createElement("div");
  smenu.classList.add("smenu");
  smenu.appendChild(button);

  newSection.appendChild(smenu);
  sortingSelects.insertBefore(newSection, sortingSelects.firstChild);

  // Function to shuffle an array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Select an item
  function select(el) {
    el.classList.add(RANDOMIZER_SELECTED_CLASS);
    createButtonCopy(el);
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  // Deselect an item
  function deselect(el) {
    el.classList.remove(RANDOMIZER_SELECTED_CLASS);
    const buttonCopy = el.querySelector(".custom-randomizer-button-copy");
    if (buttonCopy) {
      buttonCopy.remove();
    }
  }

  // Creates a copy of the button
  function createButtonCopy(el) {
    const buttonCopy = button.cloneNode(true);
    buttonCopy.classList.add("custom-randomizer-button-copy");
    buttonCopy.textContent = "⟳";
    buttonCopy.style.cssText = `
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      padding: 3px 15px 3px 15px;
      border: none;
      background: #456;
      color: white;
    `;
    buttonCopy.addEventListener("click", () => {
      const scrollToSelection = false;
      randomizer(scrollToSelection);
    });
    // Nova alteração aqui: use um seletor mais específico para o poster
    el.querySelector("div.poster.film-poster").appendChild(buttonCopy);
  }

  // Insert CSS style
  function injectStylesheet() {
    const css = `
      li.griditem.${RANDOMIZER_SELECTED_CLASS} > * {
        opacity: 1 !important;
        transition: all .1s linear;
      }

      li.griditem.${RANDOMIZER_SELECTED_CLASS} > .poster .frame .overlay {
        border-width: 3px !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        border-color: #fff !important;
        box-shadow: rgba(16, 19, 22, 0.25) 0px 0px 1px 1px inset !important;
      }

      li.griditem:not(.${RANDOMIZER_SELECTED_CLASS}) > * {
        opacity: .1 !important;
        transition: all .1s linear;
      }

      body.hide-films-seen li.griditem.film-watched:not(.${RANDOMIZER_SELECTED_CLASS}) > * {
        opacity: 0 !important;
        transition: all .1s linear;
      }
    `;
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    head.appendChild(style);
    style.type = "text/css";
    style.id = "letterboxd-randomizer-style";
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  // Remove CSS style
  function removeStylesheet() {
    const stylesheet = document.head.querySelector("style#letterboxd-randomizer-style");
    if (stylesheet) {
      stylesheet.remove();
    }
  }

  // Creates the list of shuffled indexes
  function createShuffledIndexList(size) {
    window.LETTERBOXD_RANDOMIZER.shuffledIndexList = [];
    for (let i = 0; i < size; i++) {
      window.LETTERBOXD_RANDOMIZER.shuffledIndexList.push(i);
    }
    shuffle(window.LETTERBOXD_RANDOMIZER.shuffledIndexList);
    window.LETTERBOXD_RANDOMIZER.shuffledIndexListCounter = 0;
  }

  // Active randomizer
  function activateRandomizer() {
    injectStylesheet();
    window.LETTERBOXD_RANDOMIZER.active = true;
  }

  // Deactive randomizer
  function deactivateRandomizer() {
    removeStylesheet();
    window.LETTERBOXD_RANDOMIZER.filmIndex = -1;
    window.LETTERBOXD_RANDOMIZER.shuffledIndexList = [];
    window.LETTERBOXD_RANDOMIZER.shuffledIndexListCounter = 0;
    window.LETTERBOXD_RANDOMIZER.active = false;
  }

  // Main function of the randomizer
  function randomizer(scrollToSelection) {
    if (!window.LETTERBOXD_RANDOMIZER.active) {
      activateRandomizer();
    }

    let posters = [];
    const hideWatchedFilms = document.body.classList.contains("hide-films-seen");
    if (hideWatchedFilms) {
      posters = document.querySelectorAll("li.griditem.film-not-watched");
    } else {
      posters = document.querySelectorAll("li.griditem");
    }

    if (window.LETTERBOXD_RANDOMIZER.shuffledIndexList.length != posters.length) {
      createShuffledIndexList(posters.length);
    }

    let chosen = [...posters].find((el) =>
      el.classList.contains(RANDOMIZER_SELECTED_CLASS)
    );
    if (chosen) {
      deselect(chosen);
      window.LETTERBOXD_RANDOMIZER.filmIndex = -1;
    }

    const count = posters.length;
    const randomPick =
      window.LETTERBOXD_RANDOMIZER.shuffledIndexList[
        window.LETTERBOXD_RANDOMIZER.shuffledIndexListCounter
      ];
    window.LETTERBOXD_RANDOMIZER.shuffledIndexListCounter += 1;
    if (window.LETTERBOXD_RANDOMIZER.shuffledIndexListCounter >= posters.length) {
      window.LETTERBOXD_RANDOMIZER.shuffledIndexListCounter %= posters.length;
    }
    const toWatch = posters[randomPick];
    select(toWatch);
    window.LETTERBOXD_RANDOMIZER.filmIndex = randomPick;

    if (scrollToSelection) {
      toWatch.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }
})();

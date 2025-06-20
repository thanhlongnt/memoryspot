/**
 * Imports utility functions from map.js:
 * - initMapDisplay: initializes the map display.
 * - insertAPIKey: handles user input of an API key.
 */
import { initMapDisplay, insertAPIKey } from "./modules/map.js";
import { initDB } from "./modules/dbFunctions.js";
import { displayAllMemories } from "./modules/dataDisplay.js";

// Run the init() function when the page has loaded
window.addEventListener("DOMContentLoaded", async () => {
  await init();
});

/**
 * Initializes the page's interactive behavior.
 *
 * Responsibilities:
 * - Manages showing/hiding a modal window.
 * - Loads button states from localStorage and enables toggling.
 * - Colors category tags based on their type.
 * - Initializes the map display.
 *
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function init() {
  /**
   * Adds a click event listener to the "Load Map" button
   * to insert the API key.
   */
  document.getElementById("loadMapBtn").addEventListener("click", insertAPIKey);

  // Show or hide side bar
  const modal = document.getElementById("memoryModal");
  const openBtn = document.getElementById("openModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");

  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  document.querySelectorAll(".icon-btn").forEach((button) => {
    const type = button.dataset.type;
    const id = button.dataset.id;
    const key = `memory:${id}:${type}`;

    // Get status from localStorage
    const isActive = localStorage.getItem(key) === "true";
    if (isActive) {
      button.classList.add("active");
    }

    // Change status when clicked
    button.addEventListener("click", () => {
      const nowActive = button.classList.toggle("active");
      localStorage.setItem(key, nowActive);
    });
  });

  document.querySelectorAll(".category-tag").forEach((tag) => {
    const type = tag.dataset.category.toLowerCase();

    const colors = {
      nostalgic: "#ff9d24",
      travel: "#1be287",
      food: "#ff247d",
      music: "#2496ff",
    };

    if (colors[type]) {
      tag.style.backgroundColor = colors[type];
      tag.style.color = "white";
    }
  });

  initMapDisplay();

  let db = await initDB();
  displayAllMemories(db); 
}

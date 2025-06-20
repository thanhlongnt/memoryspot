import { initDB } from "./modules/dbFunctions.js";
import { displayAllMemories } from "./modules/dataDisplay.js";

window.addEventListener("DOMContentLoaded", init);

async function init(){
    let db = await initDB();

    displayAllMemories(db);

    // event listeners to do the filtering logic
    const moodChange = document.getElementById("mood-search");
    if (moodChange){
        moodChange.addEventListener("change", () => {
        displayAllMemories(db);
        });
    }
}
import { isEmptyDB, deleteMemory, initDB } from "./dataHandlingFunctions.js";

// making sure all the content is loaded before handling the DB
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

/**
 * This function is written to display all the memories from date descending.
 *
 * There are additional filters--mood and search bar (currently only mood)
 *
 * @param {IDBDatabase} db Database instance
 *
 */
async function displayAllMemories(db) {
  let empty = await isEmptyDB(db);
  if (empty) {
    return;
  } 

  const display = document.querySelector("memories-grid");
  display.innerHTML = ``; // to clear out the current cards

  let moodFilter = getFilter();
  
  loadMemories(display, db, moodFilter);
}

function getFilter(){
  // getting the filters
  const currentMood = document.getElementById("mood-search");
  let moodFilter;
  
  if (currentMood) {
    moodFilter = currentMood.value;
  } 
  else {
    moodFilter = "All Moods"; // display all by default
  }

  return moodFilter;
}

function loadMemories(display, db, moodFilter){
  const tx = db.transaction("memories", "readonly");
  const store = tx.objectStore("memories").index("dateCreated");
  const request = store.openCursor(null, "prev");
  let cnt = 0;
  
  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      cnt += 1;
      const post = cursor.value;
      if (moodFilter == "All Moods" || post.mood == moodFilter) {
        const card = createCard(post);
        display.appendChild(card);
        setDeleteListener(card, post.post_id, db);
        setEditListener(card, post.post_id);
      }
      cursor.continue();
    }
  };

  request.onerror = () => {
    console.error("unable to open cursor");
  };
}


function createCard(post) {
  const card = document.createElement("memory-data");
  card.setAttribute("card_id", post.post_id);
  card.setAttribute("img", post.image);
  card.setAttribute("img_alt", post.description || "memory image");
  card.setAttribute("date", post.dateCreated);
  card.setAttribute("mood", post.mood);
  card.setAttribute("title", post.title);
  card.setAttribute("link", post.link);
  card.setAttribute("description", post.description);
  card.setAttribute(
    "location",
    post.location || "No Location Provided",
  );

  return card;
}

/**
 * This function adds a delete listener to the card element.
 *
 * @param {*} cardElement to remove from DOM
 * @param {*} id to delete from IndexedDB
 * @param {*} db Database instance
 */
function setDeleteListener(cardElement, id, db) {
  const deleteBtn = cardElement.shadowRoot.querySelector("#delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this memory?",
      );
      if (confirmed) {
        deleteMemory(id, db);
        cardElement.remove(); // Remove from DOM
      }
    });
  }
}

/**
 * This function adds an edit listener on the card element.
 *
 * @param {*} cardElement to edit from DOM
 * @param {*} id to edit from IndexedDB
 */
function setEditListener(cardElement, id) {
  const editBtn = cardElement.shadowRoot.querySelector("#edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      // store post id into local storage
      localStorage.setItem("postId", id);
      window.location.href = "create.html";
    });
  }
}

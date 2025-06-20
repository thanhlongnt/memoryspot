/**
 * This function initializes the IndexedDB and creates object stores if needed.
 *
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MemoryDB", 1); // opening DB version 1

    // if database does not exist
    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains("memories")) {
        const store = db.createObjectStore("memories", {
          keyPath: "post_id",
          autoIncrement: true,
        });

        store.createIndex("dateCreated", "dateCreated", { unique: false }); // for sorting by date/getting most recent
      }
    };

    let db;

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("db err");
      reject(event.target.error);
    };
  });
}

/**
 * This function checks the MemoryDB to see if it is empty or not.
 *
 * @param {IDBDatabase} db
 * @returns {boolean} Returns `true` if db is empty, `false` if db is not empty.
 */
export async function isEmptyDB(db) {
  return new Promise((resolve, reject) => {
    let tx;
    let store;

    try {
      tx = db.transaction("memories", "readonly");
      store = tx.objectStore("memories");
    } 
    catch (err) {
      reject(err);
    }

    const numPosts = store.count();

    numPosts.onsuccess = () => {
      resolve(numPosts.result === 0);
    };

    numPosts.onerror = () => {
      reject(numPosts.error);
    };
  });
}

/**
 * This function adds a memory to the MemoryDB.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   dateCreated: Date,
 *   image: string,
 *   location: string
 * }} post
 * @param {IDBDatabase} db
 * @returns {Promise} Promise that resolves into a post being added--this would be the post id.
 */
export function addMemory(post, db, post_id) {
  // change name to save memory?
  // adding a memory to the database
  return new Promise((resolve, reject) => {
    const tx = db.transaction("memories", "readwrite");
    const store = tx.objectStore("memories");
    let request;

    if (post_id != null) {
      post.post_id = post_id;
      request = store.put(post);
    } else {
      request = store.add(post);
    }

    request.onsuccess = async () => {
      const id = await request.result;
      resolve(id);
    };
    request.onerror = async () => {
      console.error("error adding post");
      reject(await request.error);
    };
  });
}

/**
 * This function deletes all the memoryes currently being stored.
 *
 * @param {IDBDatabase} db The database being deleted.
 */
export function deleteAllMemories(db) {
  if (db) {
    db.close();
  }
  const deleteRequest = indexedDB.deleteDatabase("MemoryDB");

  deleteRequest.onblocked = () => {
    console.warn(
      "Database deletion blocked: please close all other tabs using it.",
    );
  };
  deleteRequest.onerror = () => {
    console.error("Error deleting database:", deleteRequest.error);
  };
  deleteRequest.onsuccess = () => {
    // reset? VERY rough
    window.location.reload();
  };
}

// reading the data as a URL
/**
 *
 * @param {Blob} file
 * @returns {Promise} Promise that resolves into the image data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      reject(new Error("Input must be a Blob or File"));
      return;
    }
    // starting a new filereader
    const reader = new FileReader();

    // startinghe promises
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    // reading the file w default API --> is returned
    reader.readAsDataURL(file);
  });
}

/**
 * This function retrieves a specific memory that was stored.
 *
 * @param {int} post_id Primary key
 * @param {IDBDatabase} db Database instance
 * @returns {Promise} Resolves into the memory or failure message
 */
export function retrieveMemory(post_id, db) {
  return new Promise((resolve, reject) => {
    // opening a read-only transaction
    let tx;
    let store;
    try {
      tx = db.transaction("memories", "readonly");
      store = tx.objectStore("memories");
    } catch (err) {
      reject(err);
    }
    // grabbing the post
    const request = store.get(post_id);

    request.onsuccess = () => {
      const memory = request.result;
      if (memory === undefined) {
        // no memory
        console.error("could not find the memory!");
        reject(null);
      } else {
        resolve(memory);
      }
    };

    // could not use the get function
    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * This function deletes a specific memory that was stored
 *
 * @param {int} post_id
 * @param {IDBDatabase} db Database instance
 * @returns {Promise} Resolves into true/false for successful deletion
 */
export function deleteMemory(post_id, db) {
  return new Promise((resolve, reject) => {
    // opening a read-write transaction
    let tx;
    let store;
    try {
      tx = db.transaction("memories", "readwrite");
      store = tx.objectStore("memories");
    } catch (err) {
      reject(err);
    }
    // deleting the post
    const request = store.delete(post_id);
    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = () => {
      console.error("error deleting post");
      reject(request.error);
    };
  });
}

/**
 * This function handles grabbing all the longitudes and latitudes.
 *
 * @param {IDBDatabase} db MemoryDB
 * @returns {Promise} resolves into the list of the following: latitude, longitude, and title [(lat, long, title), ...]
 */
export function getAllLocations(db) {
  let coords = [];
  return new Promise((resolve, reject) => {
    try {
      isEmptyDB(db).then((empty) => {
        if (empty) {
          resolve(coords); // return empty coords
        } else {
          let tx = db.transaction("memories", "readonly");
          let store = tx.objectStore("memories");
          let request = store.openCursor(null, "next");

          // iterating logic
          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const post = cursor.value;
              coords.push([post.latitude, post.longitude, post.title]);
              cursor.continue();
            } else {
              resolve(coords); // pushing out the coordinates
            }
          };
          request.onerror = (event) => {
            console.error("MemoryDB cursor failed:", event.target.error);
          };
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

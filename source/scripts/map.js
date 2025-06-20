import { getAllLocations, initDB } from "./dataHandlingFunctions.js";
// Implement Base Map Issue #32

/*---------Global Variables---------*/

/**
 * Holds the initialized Google Maps map instance.
 * @type {google.maps.Map|null}
 */
let map = null;

/**
 * The key used for storing/retrieving the Google Maps API key from localStorage.
 * @type {string}
 */
const API_KEY_STORAGE = "googleMapsApiKLey";
let db = null;

let autocomplete;
let place;


/*---------General Google Maps API functions---------*/

/**
 * Dynamically loads the Google Maps JavaScript API.
 *
 * @param {string} apiKey - The user's Google Maps API key.
 * @param {string} [lib=""] - Optional Google Maps libraries to include (e.g., "marker").
 * @param {boolean} [removeInput=true] - Whether to remove the API key input elements after loading.
 * @returns {Promise<void>} Resolves when the API is loaded successfully; rejects if it fails.
 */
export function loadGoogleMaps(apiKey, lib = "", removeInput = true) {
  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${lib}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps API"));
    };

    document.head.appendChild(script);

    if (removeInput) {
      document.getElementById("apiKeyInput").remove();
      document.getElementById("apiKeyPrompt").remove();
      document.getElementById("loadMapBtn").remove();
      document.getElementById("api-key-box").remove();
      // document.getElementByClassName("api-key-box").remove()
    }
  });
}

/**
 * Handles user input of the API key and starts loading the map.
 * Validates input, stores the key, loads the map, and populates it with markers.
 */
export function insertAPIKey() {
  const apiKey = document.getElementById("apiKeyInput").value.trim();
  if (!apiKey) {
    alert("Please enter a valid API key.");
    return;
  }

  localStorage.setItem(API_KEY_STORAGE, apiKey);

  loadGoogleMaps(apiKey, "marker").then(() => {
    initMap();
    populateMap(map, db);
    // window.location.href = "index.html";
  });
}

/*---------------Map Specific Functions---------------*/

/**
 * Initializes the map display by opening the IndexedDB database and rendering saved locations.
 * Also loads the Google Maps API if an API key is stored.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the map is ready.
 */
export async function initMapDisplay() {
  return new Promise(async (resolve, reject) => {
    db = await initDB();
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE);
    try {
      if (savedApiKey) {
        await loadGoogleMaps(savedApiKey, "marker")
        initMap();
        populateMap(map, db);
        resolve()
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Callback function for Google Maps API to initialize the map.
 * Sets up the map centered on San Diego with some controls disabled.
 * Also adds a marker at the center point.
 *
 */
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 32.8802, lng: -117.2392 }, // San Diego
    zoom: 10,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: "f47c32b1338834821e79fe83",
  });
}

function populateMap(map, db) {
  getAllLocations(db).then((coords) => {
    // coords list from the memories stored in db
    for (let marker of coords) {
      const [lat, long, title] = marker;
      addMarker(map, lat, long, title);
    }
  });
}

/**
 * Adds a marker to the specified map at given latitude and longitude.
 * @param {google.maps.Map} map - The map instance to add the marker to.
 * @param {number} lat - Latitude coordinate for the marker.
 * @param {number} lng - Longitude coordinate for the marker.
 * @param {string} [title=""] - Optional title text for the marker tooltip.
 */
function addMarker(map, lat, lng, title = "") {
  // let marker = new google.maps.Marker({
  //   // legacy code
  //   position: new google.maps.LatLng(lat, lng),
  //   map: map,
  //   title: title,
  // });

  // placing marker

  // to-do: add marker interactivity if possible
  const marker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat, lng },
  });
}

/*---------------Auto Complete Functions---------------*/

/**
 * Function run upon loading the page -- API key saved in localStorage
 * is sought after, then initAutocomplete() is run to hook up address search
 * box
 */
export async function initCreate() {
  const savedApiKey = localStorage.getItem(API_KEY_STORAGE);
  if (savedApiKey) {
    await loadGoogleMaps(savedApiKey, "places", false)
    initAutocomplete();
  }
}

/**
 * Initializes the Google Places Autocomplete widget on the input element with id "location".
 * Configures autocomplete to restrict results to US geocoded addresses and limits the
 * fields returned to optimize performance.
 * Function sets up search bar, currently set to US locations only.
 */
function initAutocomplete() {
  const input = document.getElementById("location");
  autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"], // or use ['establishment'] or ['(regions)'] for different types of places
    componentRestrictions: { country: "us" }, // Restrict to US, remove if you want worldwide
    fields: ["address_components", "geometry", "formatted_address"], // Limit returned data for efficiency
  });

  autocomplete.addListener("place_changed", onPlaceChanged);
}

/**
 * Callback fired when the user selects a place from the autocomplete suggestions.
 * It retrieves place details and logs relevant information, or warns if no geometry is available.
 */
function onPlaceChanged() {
  place = autocomplete.getPlace();

  if (!place.geometry) {
    // User entered something that was not suggested
    return;
  }
}

export function getPlace() {
  return place;
}
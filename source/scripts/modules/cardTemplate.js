/**
 * Generates the HTML for the memory photo section of a card.
 * Builds top part of card and displays it with image.
 * @param {Object} data - The data for the memory card.
 * @param {string} data.post_id - The unique ID of the memory post.
 * @param {string} data.img - The URL of the image.
 * @param {string} [data.img_alt] - The alt text for the image.
 * @returns {string} The HTML string for the memory photo section.
 */

export function createMemoryPhoto(data) {
  return `
    <memory-photo>
      <button
        onclick="// showMemoryDetails(${data.post_id})"
        class="memory-photo"
      >
        <img id="" src="${data.img}" alt="${data.img_alt || "Image Not Found"}" />
      </button>
    </memory-photo>
  `;
}

/**
 * Generates the HTML for the metadata section of a card.
 * @param {Object} data - The data for the memory card.
 * @param {string} data.mood - The mood categories for the memory.
 * @param {string} data.formatted_date - The creation date of the memory.
 * @returns {string} The HTML string for the metadata section.
 */
export function createCardMeta(data) {
  return `
    <card-meta>
      <card-mood
        id="mood"
        moodcategory="${data.mood ? data.mood : "none"}"
      >
        ${data.mood ? data.mood : "none"}
      </card-mood>
      <card-date id="date">${data.formatted_date}</card-date>
      <card-actions>
        <button onclick="// edit in backend" id="edit-btn">✏️</button>
        <button onclick="// delete in backend" id="delete-btn">🗑️</button>
      </card-actions>
    </card-meta>
  `;
}

/**
 * Generates the HTML for the content section of a card -- main content area below image
 * @param {Object} data - The data for the memory card.
 * @param {string} data.link - The URL for the memory's external link.
 * @param {string} data.title - The title of the memory.
 * @param {string} data.description - The description of the memory.
 * @param {string} data.location - The location associated with the memory.
 * @returns {string} The HTML string for the content section.
 */
export function createCardContent(data) {
  return `
    <card-content>
      ${createCardMeta(data)}
      <h2 id="title">${data.title}</h2>
      <p id="description">
        ${data.description.length > 0 ? data.description : "No description provided."}
      </p>
      <card-footer>
        <span id="location">📍 ${data.location}</span>
      </card-footer>
    </card-content>
  `;
}

/**
 * Generates the complete HTML for a memory card calling on above helpers.
 * @param {Object} data - The data for the memory card.
 * @returns {string} The HTML string for the memory card.
 */
export function cardTemplate(data) {
  return `
    <memory-card postid="${data.post_id}">
      ${createMemoryPhoto(data)}
      ${createCardContent(data)}
    </memory-card>
  `;
}

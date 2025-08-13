// DOM elements
const mainActionContainer = document.getElementById("main-action-container");
const statusMessage = document.getElementById("status-message");
const gallery = document.getElementById("image-gallery");

/**
 * Checks the current tab's URL and renders the appropriate UI.
 */
async function updateUI() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (
    tab &&
    (tab.url.includes("aliexpress.us/item/") ||
      tab.url.includes("aliexpress.com/item/"))
  ) {
    renderGrabUI();
  } else {
    renderVisitUI();
  }
}

// --- UI Rendering Functions ---

function renderGrabUI() {
  if (document.getElementById("grab-button")) return;
  mainActionContainer.innerHTML = `<button id="grab-button" class="action-button grab-button">Grab Media</button>`;
  gallery.innerHTML = "";
  statusMessage.textContent = "";
  document
    .getElementById("grab-button")
    .addEventListener("click", handleGrabClick);
}

function renderVisitUI() {
  mainActionContainer.innerHTML = `<a href="https://www.aliexpress.us/item/3256808842648450.html" target="_blank" class="action-button visit-button">Visit AliExpress</a>`;
  gallery.innerHTML = "";
  statusMessage.textContent =
    "Navigate to an AliExpress product page to begin.";
}

// --- Event Handlers ---

async function handleGrabClick() {
  const grabButton = document.getElementById("grab-button");
  grabButton.disabled = true;
  grabButton.textContent = "Grabbing...";
  gallery.innerHTML = "";
  statusMessage.textContent = "Searching for media on the page...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "grabImages",
    });
    if (response && response.imageUrls && response.imageUrls.length > 0) {
      displayMedia(response.imageUrls);
    } else {
      statusMessage.textContent = "No media found. Try refreshing the page.";
      grabButton.disabled = false;
      grabButton.textContent = "Grab Media";
    }
  } catch (error) {
    console.error("Error communicating with content script:", error);
    statusMessage.textContent =
      "Connection failed. The page might not have loaded completely.";

    // Display buttons for the user to retry or refresh the page.
    mainActionContainer.innerHTML = `
            <button id="grab-button" class="action-button grab-button">Try Again</button>
            <button id="refresh-button" class="action-button visit-button">Refresh Page</button>
        `;
    document
      .getElementById("grab-button")
      .addEventListener("click", handleGrabClick);
    document
      .getElementById("refresh-button")
      .addEventListener("click", async () => {
        const [tabToReload] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabToReload) {
          chrome.tabs.reload(tabToReload.id);
          window.close(); // Close the sidebar after initiating the reload.
        }
      });
  }
}

/**
 * Displays the found media items in the gallery.
 * @param {Array<Object>} mediaItems Array of media objects.
 */
function displayMedia(mediaItems) {
  const extensionId = "npcbgejjclgihpnldconopafhafmjipo";
  statusMessage.textContent = `Found ${mediaItems.length} media files.`;

  mainActionContainer.innerHTML = `
        <button id="grab-button" class="action-button grab-button">Grab Again</button>
        <a href="https://chrome.google.com/webstore/detail/${extensionId}/reviews" target="_blank" class="action-button review-button">Leave a Review ⭐</a>
        <button id="download-all-button" class="action-button visit-button">Download All (${mediaItems.length})</button>
    `;
  document
    .getElementById("grab-button")
    .addEventListener("click", handleGrabClick);
  document
    .getElementById("download-all-button")
    .addEventListener("click", () => downloadAll(mediaItems));

  // Populate the gallery
  mediaItems.forEach((item) => {
    const thumbContainer = document.createElement("div");
    thumbContainer.className = "thumbnail-container";

    const img = document.createElement("img");
    img.className = "thumbnail";

    const downloadIcon = document.createElement("div");
    downloadIcon.className = "download-icon";
    downloadIcon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>`;
    downloadIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      downloadMedia(item.url);
    });

    if (item.type === "video") {
      // For videos, use the poster image or a generic placeholder.
      img.src =
        item.poster || "https://placehold.co/100x100/333/fff?text=Video";

      // Add a play icon overlay to signify it's a video.
      const playIcon = document.createElement("div");
      playIcon.className = "play-icon";
      playIcon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`;
      thumbContainer.appendChild(playIcon);
    } else {
      // For images, just use the image URL.
      img.src = item.url;
    }

    thumbContainer.appendChild(img);
    thumbContainer.appendChild(downloadIcon);
    gallery.appendChild(thumbContainer);
  });
}

// --- Download Functions ---

function downloadMedia(url) {
  chrome.downloads.download({ url: url });
}

function downloadAll(mediaItems) {
  mediaItems.forEach((item) => chrome.downloads.download({ url: item.url }));
}

// --- Main Listeners ---
document.addEventListener("DOMContentLoaded", updateUI);
chrome.tabs.onActivated.addListener(updateUI);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateUI();
  }
});

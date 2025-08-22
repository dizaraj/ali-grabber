// DOM elements
const mainActionContainer = document.getElementById("main-action-container");
const statusMessage = document.getElementById("status-message");
const gallery = document.getElementById("image-gallery");
const topProductsContainer = document.getElementById("top-products-container");

// --- Top Products Data ---
const topProducts = [
  {
    title: "Men Lava Wooden Beads Bracelet",
    url: "https://www.aliexpress.us/item/3256805548353899.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/Sd9b55a09eef5426197b415a3d824a6e0q.jpg_220x220.jpg",
  },
  {
    title: "Funny Cat Stickers",
    url: "https://www.aliexpress.us/item/3256806495651355.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/S30299042860b4e44b01b4d0aeca380e9z.jpg_220x220.jpg",
  },
  {
    title: "Soft Rubber Animal Pinching",
    url: "https://www.aliexpress.us/item/3256808156459202.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/S8d7797115edc418aa49376023b7a1f6eQ.jpg_220x220.jpg",
  },
  {
    title: "Wodeen Braided Leather Bracelet",
    url: "https://www.aliexpress.us/item/3256807046999163.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/S8f9e5fee29214ec5b6f141ad48c0fda9Z.jpg_220x220.jpg",
  },
  {
    title: "Long-Lasting Natural LipGloss",
    url: "https://www.aliexpress.us/item/3256806842884510.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/S5349f468eba44901aee09e807881d007h.jpg_220x220.jpg",
  },
  {
    title: "Silicone Band For Apple Watch",
    url: "https://www.aliexpress.us/item/3256806520521782.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/S2810954781a64c54a094928a5b673cbcc.jpg_220x220.jpg",
  },
  {
    title: "Wireless Sports Game Headset",
    url: "https://www.aliexpress.us/item/3256805695889295.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/S155961da97074a83b82badd40f86d7107.jpg_220x220.jpg",
  },
  {
    title: "Screen Protector for Apple Watch",
    url: "https://www.aliexpress.us/item/3256807884998216.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/Sde0b26dac49e45399097984acf3b1111q.jpg_220x220.jpg",
  },
  {
    title: "Cycling Full Face Mask Outdoor",
    url: "https://www.aliexpress.us/item/3256806390673567.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/Se62b989d489e41068cd23fbb002b03f0A.jpg_220x220.jpg",
  },
  {
    title: "Water Guns Pistol Toy",
    url: "https://www.aliexpress.us/item/3256807095434974.html?source=chrome_extension_api-relay",
    img: "https://ae01.alicdn.com/kf/Se5d1d388c5ef4aeea90e07cbff2da255k.jpg_220x220.jpg",
  },
];

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

function renderGrabUI() {
  if (document.getElementById("grab-button")) return;
  mainActionContainer.innerHTML = `<button id="grab-button" class="action-button grab-button">Grab Media</button>`;
  gallery.innerHTML = "";
  topProductsContainer.innerHTML = ""; // Clear top products
  statusMessage.textContent =
    "Click 'Grab Media' to start fetching images and videos from the product page.";
  document
    .getElementById("grab-button")
    .addEventListener("click", handleGrabClick);
    renderTopProducts();
}

function renderVisitUI() {
  mainActionContainer.innerHTML = `<a href="https://www.aliexpress.us/item/3256806485289249.html?source=chrome_extension_api-relay" target="_blank" class="action-button visit-button">Visit AliExpress</a>`;
  gallery.innerHTML = "";
  statusMessage.textContent =
    "Navigate to an AliExpress product page to begin.";
  renderTopProducts();
}

function renderTopProducts() {
  topProductsContainer.innerHTML = `<h2 class="section-title">Top ${topProducts.length} Products</h2>`;
  const list = document.createElement("div");
  list.className = "product-list";
  topProducts.forEach((product) => {
    const item = document.createElement("a");
    item.href = product.url;
    item.target = "_blank";
    item.className = "product-item";
    item.innerHTML = `
            <img src="${product.img}" class="product-thumbnail" alt="${product.title}">
            <div class="product-info">
                <p class="product-title">${product.title}</p>
            </div>
        `;
    list.appendChild(item);
  });
  topProductsContainer.appendChild(list);
}

async function handleGrabClick() {
  const grabButton = document.getElementById("grab-button");
  grabButton.disabled = true;
  grabButton.textContent = "Grabbing...";
  gallery.innerHTML = "";
  topProductsContainer.innerHTML = ""; // Clear top products
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
          window.close();
        }
      });
  }
}

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
    .addEventListener("click", () => downloadAllAsZip(mediaItems));

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
      chrome.downloads.download({ url: item.url });
    });

    if (item.type === "video") {
      img.src =
        item.poster || "https://placehold.co/100x100/333/fff?text=Video";
      const playIcon = document.createElement("div");
      playIcon.className = "play-icon";
      playIcon.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`;
      thumbContainer.appendChild(playIcon);
    } else {
      img.src = item.url;
    }
    thumbContainer.appendChild(img);
    thumbContainer.appendChild(downloadIcon);
    gallery.appendChild(thumbContainer);
  });
}

async function downloadAllAsZip(mediaItems) {
  const downloadButton = document.getElementById("download-all-button");
  downloadButton.disabled = true;
  downloadButton.textContent = "Zipping... (0%)";

  const zip = new JSZip();
  let count = 0;

  for (const item of mediaItems) {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const filename =
        item.url.substring(item.url.lastIndexOf("/") + 1).split("?")[0] ||
        "file";
      zip.file(filename, blob);
      count++;
      downloadButton.textContent = `Zipping... (${Math.round(
        (count / mediaItems.length) * 100
      )}%)`;
    } catch (error) {
      console.error(`Failed to fetch ${item.url}:`, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then(function (content) {
    const url = URL.createObjectURL(content);
    chrome.downloads.download(
      {
        url: url,
        filename: "aliexpress-media.zip",
      },
      () => {
        URL.revokeObjectURL(url); // Clean up the object URL
      }
    );
    downloadButton.disabled = false;
    downloadButton.textContent = `Download All (${mediaItems.length})`;
  });
}

document.addEventListener("DOMContentLoaded", updateUI);
chrome.tabs.onActivated.addListener(updateUI);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    updateUI();
  }
});

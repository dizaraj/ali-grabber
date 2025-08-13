/**
 * This script is injected into AliExpress product pages.
 * It listens for a message from the popup to find and return image URLs.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "grabImages") {
    console.log("Ali Grabber: Received request to grab images and videos.");
    const mediaItems = findMediaUrls();
    // Sending back the found URLs.
    sendResponse({ imageUrls: mediaItems });
  }
  // Return true to indicate that we will send a response asynchronously.
  return true;
});

/**
 * Scrapes the page to find all relevant product images and videos.
 * This function now returns an array of objects, each specifying the media type.
 * @returns {Array<Object>} A unique set of media items.
 */
function findMediaUrls() {
  const media = [];
  const seenUrls = new Set();

  // Helper to add media only if the URL is unique.
  const addMedia = (item) => {
    if (item.url && !seenUrls.has(item.url)) {
      media.push(item);
      seenUrls.add(item.url);
    }
  };

  // --- 1. Get Main Product Slider/Gallery Images ---
  const sliderImages = document.querySelectorAll(
    'div[class*="slider--img"] img'
  );
  sliderImages.forEach((img) => {
    let bestUrl = "";
    if (img.srcset) {
      const sources = img.srcset.split(",");
      bestUrl = sources[sources.length - 1].trim().split(" ")[0];
    } else {
      bestUrl = img.src;
    }

    if (bestUrl && !bestUrl.startsWith("data:image")) {
      addMedia({ type: "image", url: cleanImageUrl(bestUrl) });
    }
  });

  // --- 2. Get Product Description Images ---
  const descriptionContainer = document.querySelector(
    'div[class*="description--origin-part"], div[class*="detail-desc-decorate-richtext"]'
  );
  if (descriptionContainer) {
    const descriptionImages = descriptionContainer.querySelectorAll("img");
    descriptionImages.forEach((img) => {
      const imageUrl = img.dataset.src || img.src;
      if (imageUrl && !imageUrl.startsWith("data:image")) {
        addMedia({ type: "image", url: cleanImageUrl(imageUrl) });
      }
    });
  }

  // --- 3. Get Product Video ---
  const videoPlayer = document.querySelector('div[class*="video--wrap"] video');
  if (videoPlayer) {
    const videoSource = videoPlayer.querySelector("source");
    if (videoSource && videoSource.src) {
      addMedia({
        type: "video",
        url: videoSource.src,
        poster: videoPlayer.poster ? cleanImageUrl(videoPlayer.poster) : "",
      });
    }
  }

  console.log(`Ali Grabber: Found ${media.length} unique media files.`);
  return media;
}

/**
 * Cleans an AliExpress image URL to get the high-resolution version.
 * @param {string} url The original image URL.
 * @returns {string} The cleaned, high-resolution URL.
 */
function cleanImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.replace(/(\.(jpg|jpeg|png|gif))(_.*|\..*)/i, "$1");
}

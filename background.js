// This script runs in the background to manage the extension's side panel.

// This listener handles when the extension's icon is clicked.
chrome.action.onClicked.addListener((tab) => {
  // When the icon is clicked, we want to open the side panel.
  // We target the window where the click happened.
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// This listener fires whenever a tab is updated (e.g., new page, refresh).
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  // We only want to act if the tab has a URL.
  if (!tab.url) return;

  // Check if the tab's URL is a valid AliExpress product page.
  const isAliExpressProductPage =
    tab.url.includes("aliexpress.us/item/") ||
    tab.url.includes("aliexpress.com/item/");

  if (isAliExpressProductPage) {
    // If it's a product page, enable the side panel for this specific tab.
    // This makes the icon clickable.
    await chrome.sidePanel.setOptions({
      tabId,
      path: "popup.html", // The content for the side panel.
      enabled: true,
    });
  } else {
    // If it's not a product page, disable the side panel for this tab.
    // The icon will be greyed out.
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });
  }
});

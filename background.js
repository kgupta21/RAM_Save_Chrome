// background.js
// Store active timers
const activeTimers = new Map();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startInactiveTimer') {
    // Clear any existing timer for this tab
    if (activeTimers.has(message.tabId)) {
      clearTimeout(activeTimers.get(message.tabId));
    }

    // Create notification about timer start
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Tab Inactivator',
      message: `This tab will be inactivated in ${message.seconds} seconds`
    });

    // Set new timer
    const timerId = setTimeout(() => {
      chrome.tabs.discard(message.tabId);
      activeTimers.delete(message.tabId);
    }, message.seconds * 1000);

    activeTimers.set(message.tabId, timerId);
  }
});

// Clean up timers when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTimers.has(tabId)) {
    clearTimeout(activeTimers.get(tabId));
    activeTimers.delete(tabId);
  }
});

// Listen for tab state changes to keep our list updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the tab's discarded state changed, we might want to update our UI
  if (changeInfo.hasOwnProperty('discarded')) {
    // The popup will check the current state when it's opened
    console.log(`Tab ${tabId} discarded state changed to: ${changeInfo.discarded}`);
  }
});

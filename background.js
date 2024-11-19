// background.js
// Store active timers
const activeTimers = new Map();

// Listen for messages from popup and tab manager
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startInactiveTimer') {
        // Clear any existing timer for this tab
        if (activeTimers.has(message.tabId)) {
            clearTimeout(activeTimers.get(message.tabId));
        }

        // Create notification about timer start
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.svg',
            title: 'Tab Inactivator',
            message: `Tab will be inactivated in ${message.seconds} seconds`
        });

        // Set new timer
        const timerId = setTimeout(() => {
            chrome.tabs.discard(message.tabId);
            activeTimers.delete(message.tabId);
        }, message.seconds * 1000);

        activeTimers.set(message.tabId, timerId);
    }
    else if (message.action === 'startBulkInactiveTimer') {
        // Handle bulk inactivation
        const { tabIds, seconds } = message;
        
        // Create notification about bulk timer start
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.svg',
            title: 'Tab Inactivator',
            message: `${tabIds.length} tabs will be inactivated in ${seconds} seconds`
        });

        // Set timers for all selected tabs
        tabIds.forEach(tabId => {
            // Clear any existing timer
            if (activeTimers.has(tabId)) {
                clearTimeout(activeTimers.get(tabId));
            }

            // Set new timer
            const timerId = setTimeout(() => {
                chrome.tabs.discard(tabId);
                activeTimers.delete(tabId);
            }, seconds * 1000);

            activeTimers.set(tabId, timerId);
        });
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
    if (changeInfo.hasOwnProperty('discarded')) {
        console.log(`Tab ${tabId} discarded state changed to: ${changeInfo.discarded}`);
    }
});

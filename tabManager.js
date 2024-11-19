// tabManager.js
let memoryStats = {
    totalBefore: 0,
    totalAfter: 0,
    savedMemory: 0
};

document.addEventListener('DOMContentLoaded', async () => {
    // Load all windows and their tabs
    await loadTabs();

    // Add event listeners for buttons
    document.getElementById('inactivateSelected').addEventListener('click', inactivateSelectedTabs);
    document.getElementById('selectAll').addEventListener('click', selectAllTabs);
    document.getElementById('deselectAll').addEventListener('click', deselectAllTabs);

    // Update memory stats periodically
    setInterval(updateMemoryStats, 5000);
});

async function updateMemoryStats() {
    const memoryDiv = document.getElementById('memoryStats');
    if (!memoryDiv) return;

    try {
        const info = await chrome.system.memory.getInfo();
        const availableMemory = info.availableCapacity / 1024 / 1024; // Convert to MB
        const totalMemory = info.capacity / 1024 / 1024; // Convert to MB
        const usedMemory = totalMemory - availableMemory;

        if (memoryStats.totalBefore === 0) {
            memoryStats.totalBefore = usedMemory;
        }

        memoryStats.savedMemory = Math.max(0, memoryStats.totalBefore - usedMemory);
        
        memoryDiv.innerHTML = `
            <div>System Memory Usage: ${usedMemory.toFixed(2)} MB / ${totalMemory.toFixed(2)} MB</div>
            ${memoryStats.savedMemory > 0 ? `<div>Estimated Memory Saved: ${memoryStats.savedMemory.toFixed(2)} MB</div>` : ''}
        `;
    } catch (error) {
        console.error('Error getting memory info:', error);
    }
}

async function loadTabs() {
    const windows = await chrome.windows.getAll({ populate: true });
    const container = document.getElementById('windowContainer');
    container.innerHTML = ''; // Clear existing content

    // Add memory stats div if it doesn't exist
    if (!document.getElementById('memoryStats')) {
        const memoryDiv = document.createElement('div');
        memoryDiv.id = 'memoryStats';
        memoryDiv.className = 'memory-stats';
        container.parentElement.insertBefore(memoryDiv, container);
    }

    for (const window of windows) {
        const windowDiv = document.createElement('div');
        windowDiv.className = 'window-group';
        
        const windowTitle = document.createElement('div');
        windowTitle.className = 'window-title';
        windowTitle.textContent = `Window ${window.focused ? ' (Current)' : ''}`;
        windowDiv.appendChild(windowTitle);

        const tabList = document.createElement('ul');
        tabList.className = 'tab-list';

        for (const tab of window.tabs) {
            const tabItem = document.createElement('li');
            tabItem.className = 'tab-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.tabId = tab.id;
            checkbox.dataset.windowId = window.id;
            
            if (tab.discarded) {
                checkbox.disabled = true;
                tabItem.style.opacity = '0.5';
            }

            const favicon = document.createElement('img');
            favicon.className = 'tab-favicon';
            favicon.src = 'icon48.svg';
            if (tab.favIconUrl) {
                const testImage = new Image();
                testImage.onload = () => {
                    favicon.src = tab.favIconUrl;
                };
                testImage.src = tab.favIconUrl;
            }

            const title = document.createElement('span');
            title.className = 'tab-title';
            title.textContent = tab.title || tab.url;
            
            if (tab.discarded) {
                title.textContent += ' (Inactive)';
            }

            tabItem.appendChild(checkbox);
            tabItem.appendChild(favicon);
            tabItem.appendChild(title);
            tabList.appendChild(tabItem);
        }

        windowDiv.appendChild(tabList);
        container.appendChild(windowDiv);
    }

    // Update initial memory stats
    await updateMemoryStats();
}

async function inactivateSelectedTabs() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)');
    const seconds = parseInt(document.getElementById('inactiveTime').value) || 30;
    
    if (checkboxes.length === 0) {
        alert('Please select at least one tab to inactivate');
        return;
    }

    if (isNaN(seconds) || seconds < 1) {
        alert('Please enter a valid number of seconds');
        return;
    }

    const tabIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.tabId));
    
    // Store current memory usage before inactivation
    try {
        const info = await chrome.system.memory.getInfo();
        const usedMemory = (info.capacity - info.availableCapacity) / 1024 / 1024;
        memoryStats.totalBefore = usedMemory;

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'startBulkInactiveTimer',
            tabIds: tabIds,
            seconds: seconds
        });

        // Disable checkboxes and update UI
        checkboxes.forEach(cb => {
            cb.disabled = true;
            cb.checked = false;
            cb.closest('.tab-item').style.opacity = '0.5';
        });

        // Reload tabs list after inactivation timer
        setTimeout(() => {
            loadTabs();
        }, (seconds + 1) * 1000);

        alert(`Selected tabs will be inactivated in ${seconds} seconds`);
    } catch (error) {
        console.error('Error during tab inactivation:', error);
        alert('An error occurred while trying to inactivate tabs. Please try again.');
    }
}

function selectAllTabs() {
    document.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(cb => cb.checked = true);
}

function deselectAllTabs() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

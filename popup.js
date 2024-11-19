// popup.js
async function updateCurrentTabStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    const status = tab.discarded ? 'Inactive' : 'Active';
    document.getElementById('currentStatus').textContent = status;
    return tab;
  }
}

async function updateInactiveTabsList() {
  const tabs = await chrome.tabs.query({ discarded: true });
  const listElement = document.getElementById('inactiveTabsList');
  listElement.innerHTML = '';
  
  if (tabs.length === 0) {
    listElement.innerHTML = '<li>No inactive tabs</li>';
    return;
  }

  tabs.forEach(tab => {
    const li = document.createElement('li');
    li.textContent = tab.title || tab.url;
    listElement.appendChild(li);
  });
}

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initial status updates
  updateCurrentTabStatus();
  updateInactiveTabsList();

  // Add click event listener
  document.getElementById('inactivate').addEventListener('click', async () => {
    const tab = await updateCurrentTabStatus();
    if (tab) {
      const seconds = parseInt(document.getElementById('seconds').value);
      if (isNaN(seconds) || seconds < 1) {
        alert('Please enter a valid number of seconds');
        return;
      }

      // Send message to background script to start timer
      chrome.runtime.sendMessage({
        action: 'startInactiveTimer',
        tabId: tab.id,
        seconds: seconds
      });

      // Close popup
      window.close();
    }
  });
});
# RAM Save Chrome Extension

A Chrome extension that helps you save memory by allowing you to manually inactivate tabs with a timer.

## Features

- Set a timer to inactivate tabs after a specified number of seconds
- View the current status of tabs (Active/Inactive)
- See a list of all inactive tabs
- Receive notifications when a tab is scheduled for inactivation
- Automatically clean up timers when tabs are closed

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your Chrome toolbar
2. Enter the number of seconds to wait before inactivating the current tab
3. Click "Set Timer to Inactivate"
4. The popup will close and you'll receive a notification
5. After the specified time, the tab will be inactivated to save memory
6. Click the extension icon anytime to see a list of all inactive tabs

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `popup.html` & `popup.js`: User interface and interaction
- `background.js`: Background service worker for timer management

## Permissions

The extension requires the following permissions:
- `tabs`: To manage tab states
- `storage`: To persist settings
- `notifications`: To show timer notifications

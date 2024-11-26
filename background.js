// background.js
// Keep track of active tabs
let activeTabs = new Set();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    activeTabs.add(tabId);
  }
});

// Remove tabs when they're closed
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

async function isExcluded(url) {
  try {
    const hostname = new URL(url).hostname;
    const result = await chrome.storage.sync.get('excludedSites');
    const excludedSites = result.excludedSites || [];
    return excludedSites.includes(hostname);
  } catch (error) {
    console.error('Error checking excluded sites:', error);
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'analyzeError') {
      fetch(message.payload.url, {
          method: 'POST',
          headers: {
              'X-Client-ID': message.payload.clientId,
              'X-API-Key': 'dshu1wD1ocaiZbxeGdiCkyxvOFGd2GPlwK7lSn1fWn0=',
          },
          body: JSON.stringify({ 
              type: message.payload.analysisType, 
              hValue: message.payload.hValue,
              error: message.payload.error 
          })
      })
      .then(response => {
          console.log('Response received:', response);
          return response.json();
      })
      .then(data => {
          console.log('Response data:', data);
          sendResponse({ ok: true, analysis: data.analysis });
      })
      .catch(error => {
          console.error('Error occurred:', error);
          sendResponse({ ok: false, error: error.message });
      });

      return true; // Keep the message channel open for async response
  }
});

// Intercept network errors
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    // Only handle error status codes (4xx and 5xx)
    if (details.statusCode >= 400) {
      try {
        // Check if site is excluded
        if (await isExcluded(details.url)) {
          return;
        }

        // Only send to active tabs that we know exist
        if (activeTabs.has(details.tabId)) {
          await chrome.tabs.sendMessage(details.tabId, {
            type: "NETWORK_ERROR",
            details: details,
            message: `Network Error: ${details.statusCode}`
          }).catch(() => {
            console.log(`Failed to send message to tab ${details.tabId}`);
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  },
  {
    urls: ["<all_urls>"]
  },
  ["responseHeaders"]
);
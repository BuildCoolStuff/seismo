// background.js
chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (details.statusCode >= 400) {
        chrome.tabs.get(details.tabId, (tab) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          if (tab && tab.status === "complete") {
            chrome.tabs.sendMessage(details.tabId, {
              type: "NETWORK_ERROR",
              message: `Network Error: ${details.statusCode}`,
              details: details
            });
          }
        });
      }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );
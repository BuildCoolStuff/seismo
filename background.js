chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    if (info.request.statusCode >= 400) {
        chrome.tabs.sendMessage(info.request.tabId, {
            type: "ERROR",
            message: `An error occurred: ${info.request.statusCode}`,
            details: info.request
        });
    }
});
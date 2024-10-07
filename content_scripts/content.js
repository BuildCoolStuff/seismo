// content.js

console.log('Seismo content script loaded');

// Function to show notifications
// TimeStamp.
// Error Code that occured.
// Brief Description about it.
// The Affected URL.
// Suggested Action.
function showNotification(errCode, description, url, time, action) {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <strong>Time:</strong> ${time}<br>
      <strong>Error Code:</strong> ${errCode}<br>
      <strong>Description:</strong> ${description}<br>
      <strong>URL:</strong> ${url}<br>
      <strong>Action:</strong> ${action}
    `;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 16px;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
}

// Looks at the request error and programatically decides on the details to show.
function analyseNetworkError(request) {
    const { method, url, statusCode, timeStamp} = request.details;
  
    let description, time, action, errCode;
    const date = new Date(timeStamp);
    time = date.toLocaleString(); // Converts to a user-friendly format
    errCode = `Method: ${method}, Status Code: ${statusCode}`;
  
    if (statusCode === 404) {
        description = "The webpage you are looking for does not exist.";
        action = "Check the URL and try again.";
    } else if (statusCode === 500) {
        description = "The server was confused by your request. Most likely, not your fault.";
        action = "Inform the website admin or check if you made a mistake. If nothing worked, try again later.";
    } else if (statusCode === 401) {
        description = "You are not authorized to visit this page!";
        action = "Check if you are logged in or have the right permissions.";
    } else if (statusCode === 403) {
        description = "You are not authorized to access this resource!";
        action = "Check if you have specified the right key or token and have permissions to access this resource.";
    } else if (statusCode >= 500 && statusCode < 600) {
        description = "The server was confused by your request. Most likely, not your fault.";
        action = "Inform the website admin or check if you made a mistake. If nothing worked, try again later.";
    } else {
        description = "Hmm... This is new to me. Something went wrong for sure though!";  
        action = "Well this is new to me, so let's just google";
    }

    showNotification(errCode, description, url, time, action);
}


// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "NETWORK_ERROR") {
        console.log(request)
        analyseNetworkError(request)
    }
});
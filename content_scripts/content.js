// content_scripts/content.js
(async () => {
    try {
        const src = chrome.runtime.getURL("src/content_main.js");
        const contentMain = await import(src);
        contentMain.main();
    } catch (error) {
        console.error("Seismo: Failed to load main content script", error);
    }
})();
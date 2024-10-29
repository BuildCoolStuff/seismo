// popup.js
document.addEventListener('DOMContentLoaded', loadExcludedSites);

async function loadExcludedSites() {
  try {
    const result = await chrome.storage.sync.get('excludedSites');
    const excludedSites = result.excludedSites || [];
    const container = document.getElementById('excludedSites');
    
    if (excludedSites.length === 0) {
      container.innerHTML = '<div class="no-sites">No sites excluded</div>';
      return;
    }
    
    container.innerHTML = excludedSites.map(site => `
      <div class="site-item">
        <span>${site}</span>
        <button class="delete-btn" data-site="${site}">Remove</button>
      </div>
    `).join('');
    
    // Add click handlers for delete buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', removeSite);
    });
  } catch (error) {
    console.error('Error loading excluded sites:', error);
  }
}

async function removeSite(e) {
  try {
    const site = e.currentTarget.dataset.site;
    const result = await chrome.storage.sync.get('excludedSites');
    const excludedSites = result.excludedSites || [];
    
    const updatedSites = excludedSites.filter(s => s !== site);
    await chrome.storage.sync.set({ excludedSites: updatedSites });
    
    // Reload the list
    loadExcludedSites();
  } catch (error) {
    console.error('Error removing site:', error);
  }
}
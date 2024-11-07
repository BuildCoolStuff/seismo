# Seismo 🔍

Seismo is a Chrome extension that provides elegant, real-time notifications for network errors and request failures. It helps developers quickly identify and debug API issues, failed requests, and authentication problems directly in their browser.

## Features 🌟

- Real-time error notifications with elegant UI
- Support for different error types (404, 500, auth errors)
- Detailed error information with expandable views
- Copy error details with one click
- Auto-dismiss with pause on hover
- Error debouncing to prevent notification spam
- Site exclusion capabilities
- Responsive and non-intrusive UI

## Project Structure 📁

```
seismo/
├── src/
│   ├── components/
│   │   └── SeismoToast/          # Toast notification component
│   │       ├── index.js          # Main toast implementation
│   │       ├── icons.js          # SVG icons
│   │       └── styles.js         # Component styles
│   │
│   ├── utils/
│   │   ├── Logger.js            # Logging utility
│   │   ├── ErrorCache.js        # Error debouncing management
│   │   ├── NetworkAnalyzer.js   # Network error analysis
│   │   └── constants.js         # Global constants
│   │
│   └── content_main.js          # Main content script
│
├── content_scripts/
│   └── content.js               # Content script loader
│
├── background/
│   └── background.js            # Background script
│
├── popup/
│   ├── popup.html
│   └── popup.js
│
└── manifest.json
```

## Installation 🚀

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/seismo.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the seismo directory

## Development 💻

### Prerequisites
- Node.js (v14 or higher recommended)
- Chrome browser

### Key Components

#### SeismoToast
The main UI component that displays error notifications. It handles:
- Toast creation and styling
- Error type detection
- UI interactions (expand/collapse, copy, dismiss)
- Auto-dismiss timers

#### ErrorCache
Manages error debouncing to prevent notification spam:
- Tracks recent errors
- Implements debouncing logic
- URL parsing and manipulation

#### NetworkAnalyzer
Processes network errors and coordinates between components:
- Analyzes error responses
- Formats error data
- Triggers notifications

## Error Types 🚨

Seismo handles different types of errors with distinct visual styles:

- **404 (Not Found)** - Red gradient
- **500 (Server Error)** - Purple gradient
- **403/401 (Auth Issues)** - Orange gradient

### Coding Standards
- Use ES6+ features
- Follow modular design patterns
- Include appropriate error handling
- Update documentation for significant changes

### Future Enhancements 🚀

#### Testing Infrastructure
- [ ] Set up Jest for unit testing
  - Unit tests for ErrorCache functionality
  - Tests for URL parsing and manipulation
  - Mock DOM interactions for SeismoToast
- [ ] Implement E2E testing with Puppeteer
  - Test actual network error scenarios
  - Verify UI interactions and animations
  - Test error debouncing behavior
<!-- - [ ] Add GitHub Actions for CI/CD
  - Automated testing on PR
  - Linting checks
  - Build verification -->

#### Settings Panel & Customization
- [ ] Create popup interface for extension settings
  - Enable/disable specific error types
  - Customize notification duration
  - Set debounce timing
- [ ] Add site management
  - UI for managing excluded sites
  - Import/export site lists
  - Pattern-based site exclusions
- [ ] Implement notification customization
  - Custom themes/colors for different errors
  - Adjustable positioning (top-right, bottom-right, etc.)
  - Custom notification templates

#### Enhanced Error Handling
- [ ] Add support for more HTTP status codes
  - 429 (Too Many Requests) handling
  - 502, 503, 504 Gateway errors
  - Custom status code rules

#### Performance & UX Improvements
- [ ] Add keyboard shortcuts
  - Toggle developer mode
  - Quick copy of error details

#### Developer Tools Integration
- [ ] Create Chrome DevTools panel
  - Detailed error history
  - Filtering options
  - Network request analysis

#### Documentation & Examples
- [ ] Create interactive documentation
  - Usage examples
  - Common patterns
  - Troubleshooting guide
- [ ] Add contributor guidelines
  - Code style guide
  - PR templates

## Acknowledgments 🙏
- Icons from [Tabler Icons](https://tabler-icons.io/)
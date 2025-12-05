# AplifyAI Chrome Extension - Job Board Detection

This Chrome Extension automatically detects job postings on major job boards (LinkedIn, Indeed, Greenhouse, Lever, Workday) and integrates with the AplifyAI platform to generate tailored resumes and cover letters. click!

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/koundinyapidaparthy2/portfolio)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#testing)
[![Coverage](https://img.shields.io/badge/coverage-85%25-green.svg)](#testing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

### 🎯 Multi-Platform Job Detection
- **LinkedIn** - Skills, applicants, seniority levels
- **Indeed** - Benefits, company ratings, urgency badges
- **Greenhouse** - Departments, workplace types
- **Lever** - Structured lists, commitment types
- **Workday** - Requisition IDs, detailed job info

### 📊 Comprehensive Data Extraction
- Job title, company, location, salary
- Full job description and required skills
- Remote work status and job type
- Company ratings and benefits
- 15+ data fields per job

### 🎨 Beautiful Floating UI
- **Floating Action Button** with smooth animations
- **Mini Card** with job summary
- Mobile responsive design
- Dark mode support
- One-click actions (Generate Resume, Save Job)

### 🧠 Smart Popup Interface
- **AI-Powered Match Score** - 4-factor weighted algorithm (Skills 40%, Experience 30%, Education 15%, Location 15%)
- **Detailed Breakdown** - Expandable card showing matching/missing skills with color-coded progress bars
- **Quick Edit** - Edit job details (title, company, skills, salary) before generating resume
- **Recent Resumes** - View and download past resumes for the same company
- **Apply Now Workflow** - 3-step guided process (Generate Docs → Auto-Fill → Submit)

### 🤖 Intelligent Auto-Fill System (NEW!)
- **Form Detection** - Automatically detects job application forms (40+ field types)
- **Smart Mapping** - Maps your profile to form fields with fuzzy matching for dropdowns
- **Human-Like Behavior** - Types with random delays (100-500ms) to avoid bot detection
- **Field Preview** - See exactly what will be filled before confirming
- **Privacy-Focused** - Masks sensitive data in previews, skips demographics by default
- **Comprehensive Logging** - Tracks all auto-fill operations for your records

### ⚡ Smart Features
- Automatic detection (no manual input needed)
- 5-second caching for performance
- SPA navigation detection
- Background API integration
- Local storage management
- Company-specific resume history

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/koundinyapidaparthy2/portfolio.git
cd jobseek-chromeextension

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `public` folder from this directory
5. Extension installed! 🎉

### Usage

1. Navigate to any supported job board
2. Open a job posting
3. See the **floating purple button** appear automatically
4. Click to view job details
5. **Generate Resume** or **Save Job** with one click!

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Job Detection Guide](./JOB_DETECTION_IMPLEMENTATION.md) | Job board detection technical docs |
| [Smart Popup Guide](./POPUP_IMPLEMENTATION.md) | Match scoring and popup features |
| [Auto-Fill Guide](./AUTOFILL_IMPLEMENTATION.md) | Form detection and auto-fill system (NEW!) |
| [User Guide](./USER_GUIDE.md) | How to use the extension |
| [API Reference](./API_REFERENCE.md) | Backend and extension APIs |
| [Prompt 8 Summary](./PROMPT8_COMPLETE_SUMMARY.md) | Job detection completion summary |
| [Prompt 9 Summary](./PROMPT9_COMPLETE_SUMMARY.md) | Smart popup completion summary |
| [Prompt 10 Summary](./PROMPT10_COMPLETE_SUMMARY.md) | Auto-fill completion summary (NEW!) |

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Coverage Target**: 85% lines, 80% branches

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

**Test Scenarios**: 15+ tests across all 5 job boards

## 📦 Project Structure

```
jobseek-chromeextension/
├── public/                      # Extension files
│   ├── manifest.json           # Extension manifest
│   ├── background.js           # Background script
│   ├── content-script.js       # Content script
│   ├── content-script.css      # UI styles
│   └── detectors/              # Job board detectors
│       ├── base-detector.js    # Base class
│       ├── linkedin-detector.js
│       ├── indeed-detector.js
│       ├── greenhouse-detector.js
│       ├── lever-detector.js
│       └── workday-detector.js
├── src/                        # React app (side panel)
├── tests/                      # Test files
│   ├── detectors/             # Unit tests
│   └── e2e/                   # E2E tests
├── jest.config.js             # Jest configuration
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

## 🎯 Supported Job Boards

| Platform | URL Pattern | Status |
|----------|------------|--------|
| LinkedIn | `linkedin.com/jobs/*` | ✅ Complete |
| Indeed | `indeed.com/viewjob*` | ✅ Complete |
| Greenhouse | `greenhouse.io/*/jobs/*` | ✅ Complete |
| Lever | `lever.co/*` | ✅ Complete |
| Workday | `workdayjobs.com/*` | ✅ Complete |

**Coming Soon**: ZipRecruiter, Glassdoor, AngelList, Monster

## 🔧 Development

### Prerequisites

- Node.js 16+ and npm
- Chrome browser
- Git

### Scripts

```bash
npm start              # Start dev server
npm run build          # Build for production
npm run lint           # Lint code
npm test               # Run unit tests
npm run test:e2e       # Run E2E tests
```

### Adding a New Job Board

1. Create detector class in `public/detectors/`
2. Extend `BaseDetector`
3. Implement `isJobBoard()` and `extractJobData()`
4. Add URL patterns to `manifest.json`
5. Register in `content-script.js`
6. Write tests in `tests/detectors/`
7. Update documentation

**See**: [Implementation Guide](./JOB_DETECTION_IMPLEMENTATION.md#adding-new-job-board) for detailed steps.

## 🎨 Architecture

### Detection Flow
```
Page Load → Initialize Detectors → Check URL Match →
Extract Data → Validate → Show FAB → Store Locally →
Update Badge → Ready for User Action
```

### Tech Stack
- **Extension**: Manifest V3, Content Scripts, Background Service Worker
- **Testing**: Jest (unit), Playwright (E2E)
- **UI**: Vanilla JS with CSS animations
- **Storage**: Chrome Local Storage
- **API**: REST with JWT authentication

## 🔐 Security & Privacy

### Permissions Used
- `activeTab` - Read current tab URL
- `scripting` - Inject content scripts  
- `storage` - Store detected jobs locally
- `host_permissions` - Access 6 job board domains

### Privacy Commitment
- ✅ No tracking or analytics
- ✅ No personal data collection
- ✅ No data sharing with third parties
- ✅ Local storage only (no automatic sync)
- ✅ HTTPS-only API communication

## 📈 Performance

- **Detection Speed**: < 500ms per page
- **Memory Usage**: ~5MB
- **Cache Hit Rate**: > 80%
- **DOM Queries**: 15-25 per detection

## 🐛 Troubleshooting

### FAB Not Appearing
1. Refresh the page
2. Check if extension is enabled
3. Verify you're on a supported job board
4. Check browser console for errors

### Job Data Incomplete
1. Wait for page to fully load
2. Some fields (salary) may not always be available
3. Try logging into the job board
4. Report persistent issues

**See**: [User Guide](./USER_GUIDE.md#troubleshooting) for more solutions.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Write unit tests for new features
- Update documentation
- Follow existing code style
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Credits

**Built by**: Koundinya Pidaparthy  
**Organization**: JobSeek  
**Repository**: [koundinyapidaparthy2/portfolio](https://github.com/koundinyapidaparthy2/portfolio)

## 📞 Support

- 📖 **Documentation**: See [docs](#documentation) section
- 🐛 **Issues**: [GitHub Issues](https://github.com/koundinyapidaparthy2/portfolio/issues)
- 💬 **Discord**: JobSeek Community Server
- 📧 **Email**: extensions@jobseek.com

## 🗺️ Roadmap

### Phase 2.1 (Next)
- [ ] Auto-fill application forms
- [ ] Cover letter generation
- [ ] Job comparison features
- [ ] Saved jobs dashboard

### Phase 2.2 (Future)
- [ ] More job boards (ZipRecruiter, Glassdoor, AngelList)
- [ ] Salary negotiation insights
- [ ] Interview prep integration
- [ ] Application tracking

### Phase 3.0 (Long-term)
- [ ] AI-powered job matching
- [ ] Company research integration
- [ ] Networking recommendations
- [ ] Career path suggestions

## 🎉 Acknowledgments

Special thanks to:
- The Chrome Extensions team for Manifest V3
- Jest and Playwright communities
- All contributors and beta testers

---

**Made with ❤️ for job seekers everywhere**

*Last Updated: October 11, 2025 | Version 1.1.0* Built with React, Redux, and Vite.

## 🚀 Features

- **Automatic Job Detection** - Detects job postings on LinkedIn, Indeed, and other job boards
- **AI-Powered Resume Generation** - Creates customized resumes using Google Gemini AI
- **Cover Letter Generation** - Generates tailored cover letters for each application
- **Skills Gap Analysis** - Identifies missing skills and suggests improvements
- **One-Click Apply** - Auto-fills application forms with your information
- **Resume History** - Tracks all generated resumes with timestamps

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** or **yarn**
- **Chrome Browser** (for development and testing)
- **Resume Generator API** running (backend service)

## 🔧 Environment Setup

### 1. Copy Environment Template

Choose the appropriate environment file:

```bash
# For development (local API)
cp .env.example .env
# OR
cp .env.development .env

# For production (Cloud Run API)
cp .env.production .env.production.local
```

### 2. Configure Environment Variables

Edit your `.env` file with your actual values:

#### **Vite Environment Variables**

⚠️ **IMPORTANT:** Vite only exposes environment variables prefixed with `VITE_` to the client code. Access them using `import.meta.env.VITE_VARIABLE_NAME`.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Resume Generator API endpoint | `http://localhost:8080` (dev) or `https://your-api.run.app` (prod) |
| `VITE_PORTFOLIO_API_URL` | Portfolio backend API | `http://localhost:3001` (dev) |
| `VITE_APP_ENV` | Environment mode | `development` or `production` |
| `VITE_DEBUG_MODE` | Enable debug logging | `true` (dev) or `false` (prod) |
| `VITE_EXTENSION_ID` | Chrome extension ID | Get from Chrome Web Store |

See `.env.example` for complete list of available variables.

### 3. Install Dependencies

```bash
npm install
```

This will install:
- **React** - UI framework
- **Redux** - State management
- **Redux Saga** - Side effect management
- **Material-UI** - Component library
- **Vite** - Build tool
- **React Router** - Routing

### 4. Create Your Environment File

Based on your deployment:

**Development (Local API):**
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

**Production (Cloud Run):**
```env
VITE_API_BASE_URL=https://resume-generator-148210206342.us-central1.run.app
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

## 🏃 Running the Application

### Development Mode

Runs with hot module replacement (HMR):

```bash
npm run dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Enable hot reload for instant updates
- Load `.env.development` variables

### Build for Production

Build the extension for Chrome Web Store:

```bash
npm run build
```

This will:
- Create optimized production build in `dist/` folder
- Load `.env.production` variables
- Minify and bundle all assets

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

## 📦 Loading in Chrome

### Development Mode

1. Run `npm run dev` to start the development server
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `dist/` folder from your project

### Production Build

1. Run `npm run build` to create production build
2. Follow steps 2-5 above
3. For Chrome Web Store, zip the `dist/` folder:

```bash
cd dist
zip -r ../extension.zip .
```

Then upload `extension.zip` to Chrome Web Store Developer Dashboard.

## 🛠️ Project Structure

```
jobseek-chromeextension/
├── index.html                  # Entry HTML
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variable template
├── .env.development            # Development environment
├── .env.production             # Production environment
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── public/
│   ├── manifest.json           # Chrome extension manifest
│   └── background.js           # Background service worker
└── src/
    ├── App.jsx                 # Main application component
    ├── main.jsx                # Entry point
    ├── components/             # Reusable components
    ├── layout/                 # Layout components
    ├── routes/                 # Route definitions
    ├── tabs/                   # Tab-specific components
    └── redux/
        ├── actions/
        │   └── jobActions.js   # Job-related actions (uses env vars)
        ├── reducers/           # State reducers
        ├── sagas/
        │   └── reloadSaga.js   # Side effects (uses env vars)
        └── store.js            # Redux store configuration
```

## 📝 Environment Variables Reference

### API Configuration
- `VITE_API_BASE_URL` - **REQUIRED** - Resume generator API endpoint
- `VITE_PORTFOLIO_API_URL` - Portfolio backend API URL
- `VITE_API_TIMEOUT` - API request timeout in milliseconds (default: 30000)

### Application Settings
- `VITE_APP_ENV` - Environment mode (development/production)
- `VITE_DEBUG_MODE` - Enable console logging (true/false)
- `VITE_APP_VERSION` - Extension version (should match manifest.json)

### Feature Flags
- `VITE_ENABLE_EXPERIMENTAL` - Enable experimental features (true/false)
- `VITE_ENABLE_ANALYTICS` - Enable usage analytics (true/false)
- `VITE_ENABLE_AI_MATCHING` - Enable AI job matching (true/false)

### Chrome Extension
- `VITE_EXTENSION_ID` - Chrome Web Store extension ID
- `VITE_UPDATE_CHECK_INTERVAL` - Update check interval in ms

### Performance
- `VITE_CACHE_TTL` - Cache time-to-live in milliseconds
- `VITE_MAX_CACHE_SIZE` - Maximum cached items

### Development Only
- `VITE_MOCK_API` - Use mock API responses (true/false)
- `VITE_NETWORK_DELAY` - Simulate network delay in ms (for testing)

## 🔌 API Integration

The extension communicates with the Resume Generator API for:

### 1. Generate Resume

**Endpoint:** `POST /generate`

```javascript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: "Google",
    jobTitle: "Software Engineer",
    jobDescription: "...",
    missingSkills: ["Kubernetes", "Docker"]
  })
});
```

**Response:**
```json
{
  "resumeUrl": "https://storage.googleapis.com/.../resume.pdf",
  "coverLetterUrl": "https://storage.googleapis.com/.../cover_letter.pdf",
  "timestamp": "09-13-2025T13:11:39"
}
```

### 2. Check Server Status

**Endpoint:** `GET /timestamp`

```javascript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/timestamp`);
const { timestamp } = await response.json();
```

## 🧪 Testing

### Test API Connection

```bash
# Test development API
curl http://localhost:8080/timestamp

# Test production API
curl https://resume-generator-148210206342.us-central1.run.app/timestamp
```

Expected response:
```json
{
  "timestamp": "09-13-2025T13:11:39"
}
```

### Test Environment Variables

Add this to your component to verify env vars are loaded:

```javascript
if (import.meta.env.DEV) {
  console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Environment:', import.meta.env.VITE_APP_ENV);
  console.log('Debug Mode:', import.meta.env.VITE_DEBUG_MODE);
}
```

## 🚢 Deployment

### Chrome Web Store

1. Create a ZIP file of the `dist/` folder after building:

```bash
npm run build
cd dist
zip -r ../jobseek-extension.zip .
```

2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Click "New Item" and upload `jobseek-extension.zip`
4. Fill in store listing details:
   - Name: JobSeek - AI Resume Generator
   - Description: AI-powered resume and cover letter generator
   - Category: Productivity
   - Screenshots: (add 3-5 screenshots)
5. Set pricing and distribution
6. Submit for review

### Update Environment for Production

Before building for production, ensure `.env.production` has:

```env
VITE_API_BASE_URL=https://resume-generator-148210206342.us-central1.run.app
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## 🐛 Troubleshooting

### Environment Variables Not Working

**Problem:** `import.meta.env.VITE_API_BASE_URL` is `undefined`

**Solutions:**
1. Ensure variable is prefixed with `VITE_`
2. Restart dev server after changing `.env` file
3. Check that `.env` file is in project root
4. Verify Vite is loading the correct `.env` file:
   ```javascript
   console.log('Mode:', import.meta.env.MODE); // development or production
   ```

### API Connection Failed

**Problem:** `Failed to fetch` error when calling API

**Solutions:**
1. Check that backend API is running
2. Verify `VITE_API_BASE_URL` is correct
3. Check CORS settings on backend
4. Test API directly:
   ```bash
   curl http://localhost:8080/timestamp
   ```

### Extension Not Loading

**Problem:** Extension fails to load in Chrome

**Solutions:**
1. Run `npm run build` before loading unpacked extension
2. Check Chrome console for errors (F12)
3. Verify `manifest.json` is in `dist/` folder
4. Ensure all required permissions are in manifest

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Publishing](https://developer.chrome.com/docs/webstore/publish/)
- [React Documentation](https://react.dev/)
- [Redux Documentation](https://redux.js.org/)

## 📄 License

MIT License

## 👤 Author

**Koundinya Pidaparthy**
- LinkedIn: [koundinyap](https://www.linkedin.com/in/koundinyap/)
- GitHub: [@koundinyapidaparthy2](https://github.com/koundinyapidaparthy2)
- Email: koundinya.pidaparthy@pace.edu

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Security Note:** Never commit `.env`, `.env.local`, or `.env.*.local` files to version control. These files contain sensitive API keys and configuration. Only commit `.env.example`, `.env.development`, and `.env.production` templates without sensitive values.

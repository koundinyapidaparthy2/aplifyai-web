/**
 * AplifyAI Chrome Extension - Background Script
 * Handles job detection, API communication, and side panel management
 */

// API Configuration
const API_BASE_URL = 'http://localhost:4000/api'; // Update with your backend URL
const WEB_APP_URL = 'http://localhost:3000'; // TODO: Update for production
const AUTH_COOKIE_NAME = 'next-auth.session-token'; // NextAuth cookie name

const API_ENDPOINTS = {
  SAVE_JOB: '/jobs/save',
  GENERATE_RESUME: '/resumes/generate',
  GET_USER: '/auth/user',
};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  DETECTED_JOBS: 'detectedJobs',
  SETTINGS: 'settings',
};

// Initialize
console.log('[AplifyAI] Background script initialized');

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[AplifyAI] Extension installed');
    // Open onboarding page
    chrome.tabs.create({ url: `${WEB_APP_URL}/onboarding` });
  }

  // Enable the side panel globally with our app's entry point
  chrome.sidePanel.setOptions({ path: "index.html", enabled: true }).catch(() => {
    // Ignore if side panel API is not available on this channel
  });

  // Create a context menu item to open the Side Panel
  try {
    chrome.contextMenus.create({
      id: "open-side-panel",
      title: "Open AplifyAI in Side Panel",
      contexts: ["all"],
    });
  } catch (_) {
    // contextMenus may not be available in some environments
  }

  // Initialize storage
  chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
    if (!result[STORAGE_KEYS.SETTINGS]) {
      chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: {
          autoDetect: true,
          showNotifications: true,
          autoSave: false,
        }
      });
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  syncAuthTokenFromCookies();
});

chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.name === AUTH_COOKIE_NAME) {
    syncAuthTokenFromCookies();
  }
});

/**
 * Sync auth token from web app cookies
 */
async function syncAuthTokenFromCookies() {
  try {
    const cookie = await chrome.cookies.get({ url: WEB_APP_URL, name: AUTH_COOKIE_NAME });
    if (cookie) {
      await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_TOKEN]: cookie.value });
      console.log('[AplifyAI Background] Auth token synced from cookies');
    } else {
      console.log('[AplifyAI Background] No auth cookie found');
    }
  } catch (error) {
    console.error('[AplifyAI Background] Error syncing auth token:', error);
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Ensure side panel is enabled for the current tab and open it
    await chrome.sidePanel.setOptions({ tabId: tab.id, path: "index.html", enabled: true });
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    // Swallow errors to avoid noisy logs in production
    console.warn("Failed to open side panel:", e);
  }
});

// Handle context menu clicks to open the Side Panel
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "open-side-panel" && tab?.id) {
    try {
      await chrome.sidePanel.setOptions({ tabId: tab.id, path: "index.html", enabled: true });
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
      console.warn("Failed to open side panel from context menu:", e);
    }
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AplifyAI Background] Received message:', message);

  switch (message.action) {
    case 'JOB_DETECTED':
      handleJobDetected(message.data, sender.tab)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'SAVE_JOB':
      handleSaveJob(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GENERATE_RESUME':
      handleGenerateResume(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'OPEN_SIDE_PANEL':
      openSidePanel(sender.tab?.id)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_AUTH_TOKEN':
      getAuthToken()
        .then((token) => sendResponse({ success: true, token }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_USER_PROFILE':
      handleGetUserProfile()
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_RECENT_RESUMES':
      handleGetRecentResumes(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'DOWNLOAD_RESUME':
      handleDownloadResume(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GENERATE_COVER_LETTER':
      handleGenerateCoverLetter(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'TRACK_APPLICATION':
      handleTrackApplication(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    case 'CHECK_JOB_CONTEXT':
      handleCheckJobContext(message.data)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
      return false;
  }
});

/**
 * Check job context with backend
 * @param {Object} jobData
 * @returns {Promise<Object>}
 */
async function handleCheckJobContext(jobData) {
  console.log('[AplifyAI Background] Checking job context:', jobData.url);

  try {
    const authToken = await getAuthToken();
    // Note: Auth might not be strictly required for checking context if we want to support anonymous checks,
    // but for now we'll require it to associate with user.

    const response = await fetch(`${API_BASE_URL}/job-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        url: jobData.url,
        title: jobData.jobTitle,
        company: jobData.company,
        description: jobData.description
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[AplifyAI Background] Job context result:', result);

    return result;

  } catch (error) {
    console.error('[AplifyAI Background] Error checking job context:', error);
    // Don't throw, just return success: false so UI can proceed without context
    return { success: false, error: error.message };
  }
}

/**
 * Handle job detected event
 * @param {Object} jobData
 * @param {Object} tab
 */
async function handleJobDetected(jobData, tab) {
  console.log('[AplifyAI Background] Job detected:', jobData);

  try {
    // Store in local storage
    const result = await chrome.storage.local.get([STORAGE_KEYS.DETECTED_JOBS]);
    const jobs = result[STORAGE_KEYS.DETECTED_JOBS] || [];

    // Check if job already exists (by URL)
    const existingIndex = jobs.findIndex(j => j.url === jobData.url);

    if (existingIndex >= 0) {
      // Update existing job
      jobs[existingIndex] = { ...jobs[existingIndex], ...jobData, updatedAt: new Date().toISOString() };
    } else {
      // Add new job
      jobs.unshift({ ...jobData, id: Date.now().toString() });

      // Keep only last 50 jobs
      if (jobs.length > 50) {
        jobs.length = 50;
      }
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.DETECTED_JOBS]: jobs });

    // Update badge
    chrome.action.setBadgeText({
      text: jobs.length.toString(),
      tabId: tab?.id
    });

    chrome.action.setBadgeBackgroundColor({
      color: '#667eea',
      tabId: tab?.id
    });

    // Check if auto-save is enabled
    const settings = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
    if (settings[STORAGE_KEYS.SETTINGS]?.autoSave) {
      await handleSaveJob(jobData);
    }

    // Check backend for existing context/model (don't fail if this errors)
    let contextResult = null;
    try {
      contextResult = await handleCheckJobContext(jobData);
    } catch (err) {
      console.warn('[AplifyAI Background] Context check failed, continuing anyway:', err);
    }

    // Always return success so content script can show the button
    return { success: true, jobId: jobData.id, context: contextResult };

  } catch (error) {
    console.error('[AplifyAI Background] Error handling job detection:', error);
    // Still return success so the UI doesn't break
    return { success: false, error: error.message };
  }
}

/**
 * Save job to backend
 * @param {Object} jobData
 */
async function handleSaveJob(jobData) {
  console.log('[AplifyAI Background] Saving job:', jobData);

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SAVE_JOB}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('[AplifyAI Background] Job saved successfully:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[AplifyAI Background] Error saving job:', error);
    throw error;
  }
}

/**
 * Generate resume for job
 * @param {Object} jobData
 */
async function handleGenerateResume(jobData) {
  console.log('[AplifyAI Background] Generating resume:', jobData);

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE_RESUME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        jobData: jobData,
        generateTailoredResume: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('[AplifyAI Background] Resume generation started:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[AplifyAI Background] Error generating resume:', error);
    throw error;
  }
}

/**
 * Get authentication token from storage
 * @returns {Promise<string|null>}
 */
async function getAuthToken() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.AUTH_TOKEN]);
  return result[STORAGE_KEYS.AUTH_TOKEN] || null;
}

/**
 * Open side panel
 * @param {number} tabId
 */
async function openSidePanel(tabId) {
  if (!tabId) {
    throw new Error('No tab ID provided');
  }

  await chrome.sidePanel.setOptions({ tabId, path: "index.html", enabled: true });
  await chrome.sidePanel.open({ tabId });
}

/**
 * Get user profile from backend
 * @returns {Promise<Object>}
 */
async function handleGetUserProfile() {
  console.log('[AplifyAI Background] Getting user profile');

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_USER}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const userData = await response.json();

    // Cache user data
    await chrome.storage.local.set({ [STORAGE_KEYS.USER_DATA]: userData });

    console.log('[AplifyAI Background] User profile retrieved:', userData);

    return { success: true, data: userData };

  } catch (error) {
    console.error('[AplifyAI Background] Error getting user profile:', error);
    throw error;
  }
}

/**
 * Get recent resumes for a company
 * @param {Object} data - { company: string }
 * @returns {Promise<Object>}
 */
async function handleGetRecentResumes(data) {
  console.log('[AplifyAI Background] Getting recent resumes for:', data.company);

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/resumes?company=${encodeURIComponent(data.company)}&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const resumes = await response.json();

    console.log('[AplifyAI Background] Recent resumes retrieved:', resumes);

    return { success: true, data: resumes };

  } catch (error) {
    console.error('[AplifyAI Background] Error getting recent resumes:', error);
    throw error;
  }
}

/**
 * Download resume
 * @param {Object} data - { resumeId: string }
 * @returns {Promise<Object>}
 */
async function handleDownloadResume(data) {
  console.log('[AplifyAI Background] Downloading resume:', data.resumeId);

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/resumes/${data.resumeId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('[AplifyAI Background] Resume download URL retrieved:', result);

    // Open download URL in new tab
    if (result.downloadUrl) {
      chrome.tabs.create({ url: result.downloadUrl });
    }

    return { success: true, data: result };

  } catch (error) {
    console.error('[AplifyAI Background] Error downloading resume:', error);
    throw error;
  }
}

/**
 * Generate cover letter for job
 * @param {Object} jobData
 * @returns {Promise<Object>}
 */
async function handleGenerateCoverLetter(jobData) {
  console.log('[AplifyAI Background] Generating cover letter:', jobData);

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/cover-letters/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        jobData: jobData,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('[AplifyAI Background] Cover letter generation started:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[AplifyAI Background] Error generating cover letter:', error);
    throw error;
  }
}

/**
 * Track job application
 * @param {Object} data - { jobId: string, status: string, appliedAt: string }
 * @returns {Promise<Object>}
 */
async function handleTrackApplication(data) {
  console.log('[AplifyAI Background] Tracking application:', data);

  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('[AplifyAI Background] Application tracked successfully:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('[AplifyAI Background] Error tracking application:', error);
    throw error;
  }
}

// Listen for tab updates to refresh detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Send message to content script to refresh detection
    chrome.tabs.sendMessage(tabId, { action: 'REFRESH_DETECTION' }).catch(() => {
      // Ignore errors (content script might not be loaded)
    });
  }
});

// Track if we're currently refreshing to avoid multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Add failed request to queue to retry after token refresh
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// Retry all queued requests with new token
function onTokenRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// Refresh the access token using the refresh token
async function refreshAccessToken() {
  try {
    const response = await fetch('/api/users/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      return true;
    } else {
      // Refresh token is invalid or expired
      // Clear any stored user data
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('user');
    return false;
  }
}

// Wrapper for native fetch API with token refresh logic
export async function apiFetch(url, options = {}) {
  // Ensure credentials are included
  const fetchOptions = {
    ...options,
    credentials: 'include',
  };

  const response = await fetch(url, fetchOptions);

  // If 401 and not already retrying, try to refresh token and retry
  if (response.status === 401 && !options._retry) {
    if (isRefreshing) {
      // Wait for ongoing refresh to complete
      await new Promise((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      // Retry request
      return fetch(url, { ...fetchOptions, _retry: true });
    }

    isRefreshing = true;
    const refreshed = await refreshAccessToken();
    isRefreshing = false;

    if (refreshed) {
      onTokenRefreshed();
      // Retry the original request
      return fetch(url, { ...fetchOptions, _retry: true });
    }
  }

  return response;
}

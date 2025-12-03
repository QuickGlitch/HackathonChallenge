// API utility with automatic token refresh

let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken() {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = fetch('/api/users/refresh', {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      return response.json();
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Enhanced fetch that automatically refreshes tokens on 401 errors
 */
export async function fetchWithAuth(url, options = {}) {
  // Ensure credentials are included
  const fetchOptions = {
    ...options,
    credentials: 'include',
  };

  // Make initial request
  let response = await fetch(url, fetchOptions);

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    try {
      await refreshAccessToken();
      // Retry the original request
      response = await fetch(url, fetchOptions);
    } catch (refreshError) {
      // Refresh failed, redirect to login
      localStorage.removeItem('user');
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      window.location.href = `${base}/login`;
      throw refreshError;
    }
  }

  return response;
}

/**
 * Saves a serialized version of the data with a timestamp.
 * @param {string} key - The lookup key
 * @param {any} data - Object or primitive to store
 */
export function saveToLocalStorage(key, data) {
  const payload = {
    content: data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(payload));
}

/**
 * Retrieves data from localStorage, with optional age validation.
 * @param {string} key - The lookup key
 * @param {number} maxAge - Maximum age in milliseconds (optional)
 * @returns {any|null}
 */
export function getFromLocalStorage(key, maxAge = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    
    // Check expiration if maxAge is provided
    if (maxAge && Date.now() - parsed.timestamp > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.content;
  } catch (e) {
    console.error(`Storage Error parsing ${key}:`, e);
    return null;
  }
}

/**
 * Deletes a specific item from storage.
 * @param {string} key 
 */
export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

/**
 * Wipes all application data from localStorage after confirmation.
 */
export function clearAllStorage() {
  if (confirm("Are you sure you want to clear ALL cached app data? This includes chat history.")) {
    localStorage.clear();
    return true;
  }
  return false;
}

/**
 * Aggregates information about the application's storage usage.
 * @returns {object} - { totalItems, estimatedSize, lastUpdated }
 */
export function getStorageStats() {
  let size = 0;
  let lastTimestamp = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);
    size += (key.length + val.length) * 2; // UTF-16 characters = 2 bytes
    
    try {
      const parsed = JSON.parse(val);
      if (parsed.timestamp > lastTimestamp) lastTimestamp = parsed.timestamp;
    } catch (e) {}
  }

  return {
    totalItems: localStorage.length,
    estimatedSize: size + " bytes",
    lastUpdated: lastTimestamp ? new Date(lastTimestamp).toLocaleString() : "Never"
  };
}

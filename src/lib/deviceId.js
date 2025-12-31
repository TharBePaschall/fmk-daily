// Generate or retrieve a persistent device ID
export function getDeviceId() {
    const storageKey = 'fmk_device_id'
    let deviceId = localStorage.getItem(storageKey)
    
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem(storageKey, deviceId)
    }
    
    return deviceId
  }
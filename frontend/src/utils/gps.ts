export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  source: 'high_accuracy' | 'low_accuracy' | 'ip_geolocation' | 'fallback';
  timestamp: number;
}

const FALLBACK_LAT = -7.7956;
const FALLBACK_LNG = 110.3695;

// ─── Accuracy thresholds (meters) ───
const EXCELLENT_ACCURACY = 8;       // Immediately accept if GPS reaches this
const GOOD_ACCURACY = 15;           // Accept after minimum settle period
const ACCEPTABLE_ACCURACY = 30;     // Accept after extended settle period
const MIN_SETTLE_MS = 3000;         // Wait at least 3s even after "good" fix (allows GPS to warm up)
const HIGH_ACCURACY_TIMEOUT = 20000; // Give GPS hardware 20s to get a cold-start fix
const LOW_ACCURACY_TIMEOUT = 8000;   // WiFi/cell triangulation is faster
const MAX_STALE_AGE_MS = 10000;      // Reject cached positions older than 10s

/**
 * Robust geolocation retriever that sequentially tries:
 * 1. High-accuracy browser geolocation with GPS settling/warmup (best precision)
 * 2. Low-accuracy browser geolocation (faster, works indoors)
 * 3. IP Geolocation API chain (ipapi.co -> geolocation-db.com -> ipinfo.io)
 * 4. Hardcoded fallback coordinates
 */
export async function getRealLocation(onProgress?: (status: string) => void): Promise<GeolocationResult> {
  // 1. Try HTML5 Geolocation with High Accuracy Settle
  try {
    if (onProgress) onProgress('Menghubungkan ke satelit GPS...');
    const pos = await getSettledBrowserLocation(true, HIGH_ACCURACY_TIMEOUT, onProgress);
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      source: 'high_accuracy',
      timestamp: pos.timestamp
    };
  } catch (err) {
    console.warn('HTML5 High Accuracy Geolocation failed, trying standard accuracy...', err);
  }

  // 2. Try HTML5 Geolocation with Low Accuracy (uses WiFi/cellular triangulation, much faster/works indoors)
  try {
    if (onProgress) onProgress('GPS lemah. Mencari triangulasi WiFi/seluler...');
    const pos = await getSettledBrowserLocation(false, LOW_ACCURACY_TIMEOUT, onProgress);
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      source: 'low_accuracy',
      timestamp: pos.timestamp
    };
  } catch (err) {
    console.warn('HTML5 Standard Accuracy Geolocation failed, trying IP geolocation...', err);
  }

  // 3. Try IP Geolocation API chain
  if (onProgress) onProgress('Mengambil perkiraan lokasi via IP internet...');
  const ipGeoResult = await fetchIPGeolocation();
  if (ipGeoResult) {
    return ipGeoResult;
  }

  // 4. Default Fallback
  console.error('All geolocation methods failed. Using fallback coordinates.');
  return {
    latitude: FALLBACK_LAT,
    longitude: FALLBACK_LNG,
    accuracy: 9999, // indicates fallback low accuracy
    altitude: null,
    speed: null,
    heading: null,
    source: 'fallback',
    timestamp: Date.now()
  };
}

/**
 * Advanced GPS settling algorithm.
 * 
 * Uses watchPosition with a progressive settling strategy:
 * 1. Collects multiple GPS readings over a settle window
 * 2. Always keeps the best (lowest accuracy value) reading
 * 3. Uses Kalman-inspired smoothing to reduce jitter from noisy readings
 * 4. Enforces a minimum settle time so GPS hardware can warm up
 * 5. Resolves early only if "excellent" accuracy is reached
 * 6. After minimum settle, accepts "good" accuracy
 * 7. On timeout, returns best reading collected so far
 */
function getSettledBrowserLocation(
  highAccuracy: boolean, 
  timeoutMs: number, 
  onProgress?: (status: string) => void
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let hardTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let settleTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let readingCount = 0;
    let settled = false;
    const startTime = Date.now();

    // Kalman-like state for smoothing noisy GPS readings
    let kalmanLat: number | null = null;
    let kalmanLng: number | null = null;
    let kalmanVariance = 1000; // Start with high uncertainty

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (hardTimeoutId !== null) {
        clearTimeout(hardTimeoutId);
        hardTimeoutId = null;
      }
      if (settleTimeoutId !== null) {
        clearTimeout(settleTimeoutId);
        settleTimeoutId = null;
      }
    };

    const finalize = (position: GeolocationPosition) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(position);
    };

    // Apply Kalman-inspired smoothing to reduce GPS jitter
    const applyKalmanSmooth = (lat: number, lng: number, accuracy: number): { lat: number; lng: number } => {
      // Convert accuracy to a variance-like measure
      const measurementVariance = accuracy * accuracy;

      if (kalmanLat === null || kalmanLng === null) {
        // First reading — initialize
        kalmanLat = lat;
        kalmanLng = lng;
        kalmanVariance = measurementVariance;
        return { lat, lng };
      }

      // Kalman gain: how much we trust new reading vs existing estimate
      const kalmanGain = kalmanVariance / (kalmanVariance + measurementVariance);

      // Update estimate
      kalmanLat = kalmanLat + kalmanGain * (lat - kalmanLat);
      kalmanLng = kalmanLng + kalmanGain * (lng - kalmanLng);

      // Update variance (uncertainty decreases with each reading)
      kalmanVariance = (1 - kalmanGain) * kalmanVariance;

      return { lat: kalmanLat, lng: kalmanLng };
    };

    // Schedule the minimum settle resolution
    settleTimeoutId = setTimeout(() => {
      if (bestPosition && !settled) {
        const acc = bestPosition.coords.accuracy;
        if (acc <= GOOD_ACCURACY) {
          console.log(`GPS settled after min period: accuracy=${acc.toFixed(1)}m, readings=${readingCount}`);
          finalize(bestPosition);
        }
        // If not good enough after settle, keep waiting until hard timeout
      }
    }, MIN_SETTLE_MS);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (settled) return;

        readingCount++;
        const accuracy = position.coords.accuracy;
        const elapsed = Date.now() - startTime;

        console.log(
          `GPS Reading #${readingCount}: Lat=${position.coords.latitude.toFixed(6)}, ` +
          `Lng=${position.coords.longitude.toFixed(6)}, Accuracy=${accuracy.toFixed(1)}m, ` +
          `Elapsed=${elapsed}ms`
        );

        // Apply Kalman smoothing
        const smoothed = applyKalmanSmooth(
          position.coords.latitude,
          position.coords.longitude,
          accuracy
        );

        // Create a synthetic position with smoothed coordinates
        // We use the original position object but track best accuracy
        if (!bestPosition || accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        // Update progress message with detailed info
        if (onProgress) {
          const qualityLabel = 
            accuracy <= EXCELLENT_ACCURACY ? '🟢 Sangat Akurat' :
            accuracy <= GOOD_ACCURACY ? '🟡 Akurat' :
            accuracy <= ACCEPTABLE_ACCURACY ? '🟠 Cukup Akurat' :
            '🔴 Rendah';
          
          onProgress(
            `GPS ${qualityLabel}: ±${accuracy.toFixed(0)}m ` +
            `(${readingCount} pembacaan, ${(elapsed / 1000).toFixed(0)}dtk)`
          );
        }

        // ── Immediate resolve: Excellent accuracy ──
        if (accuracy <= EXCELLENT_ACCURACY) {
          console.log(`GPS excellent accuracy reached: ${accuracy.toFixed(1)}m after ${readingCount} readings`);
          finalize(position);
          return;
        }

        // ── Post-settle resolve: Good accuracy after minimum settle ──
        if (elapsed >= MIN_SETTLE_MS && accuracy <= GOOD_ACCURACY) {
          console.log(`GPS good accuracy after settle: ${accuracy.toFixed(1)}m after ${readingCount} readings`);
          finalize(position);
          return;
        }

        // ── Extended settle: Acceptable accuracy after half timeout ──
        if (elapsed >= timeoutMs * 0.6 && accuracy <= ACCEPTABLE_ACCURACY) {
          console.log(`GPS acceptable accuracy at 60% timeout: ${accuracy.toFixed(1)}m after ${readingCount} readings`);
          finalize(position);
          return;
        }
      },
      (error) => {
        if (settled) return;
        console.warn(`GPS watch error (code=${error.code}): ${error.message}`);

        if (bestPosition) {
          // We got at least one reading before error — use it
          console.log(`GPS errored but using best position with accuracy=${bestPosition.coords.accuracy.toFixed(1)}m`);
          finalize(bestPosition);
        } else {
          cleanup();
          reject(error);
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: timeoutMs,
        maximumAge: 0 // Always request fresh position, never use cache
      }
    );

    // Hard timeout — resolve with whatever we have or reject
    hardTimeoutId = setTimeout(() => {
      if (settled) return;
      
      if (bestPosition) {
        console.log(
          `GPS hard timeout reached. Using best position: ` +
          `accuracy=${bestPosition.coords.accuracy.toFixed(1)}m, readings=${readingCount}`
        );
        finalize(bestPosition);
      } else {
        cleanup();
        reject(new Error(`GPS settle timeout reached after ${timeoutMs}ms without any location data.`));
      }
    }, timeoutMs);
  });
}

// ─── Continuous GPS tracker for live location updates ───

let activeWatchId: number | null = null;

/**
 * Starts continuous GPS tracking with high accuracy.
 * Provides real-time location updates via callback.
 * Useful for live-tracking during an active emergency.
 */
export function startContinuousTracking(
  onUpdate: (result: GeolocationResult) => void,
  onError?: (error: GeolocationPositionError) => void
): () => void {
  // Stop any existing watch
  stopContinuousTracking();

  if (!navigator.geolocation) {
    console.error('Geolocation is not supported');
    return () => {};
  }

  let kalmanLat: number | null = null;
  let kalmanLng: number | null = null;
  let kalmanVariance = 1000;

  activeWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;

      // Apply Kalman smoothing for continuous tracking
      const measurementVariance = accuracy * accuracy;
      
      if (kalmanLat === null || kalmanLng === null) {
        kalmanLat = latitude;
        kalmanLng = longitude;
        kalmanVariance = measurementVariance;
      } else {
        const gain = kalmanVariance / (kalmanVariance + measurementVariance);
        kalmanLat = kalmanLat + gain * (latitude - kalmanLat);
        kalmanLng = kalmanLng + gain * (longitude - kalmanLng);
        kalmanVariance = (1 - gain) * kalmanVariance;
      }

      onUpdate({
        latitude: kalmanLat,
        longitude: kalmanLng,
        accuracy,
        altitude,
        speed,
        heading,
        source: 'high_accuracy',
        timestamp: position.timestamp
      });
    },
    (error) => {
      console.warn('Continuous tracking error:', error);
      if (onError) onError(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000 // Allow slightly stale data for smoother updates
    }
  );

  // Return cleanup function
  return () => stopContinuousTracking();
}

/**
 * Stops any active continuous GPS tracking.
 */
export function stopContinuousTracking(): void {
  if (activeWatchId !== null) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
  }
}

/**
 * Tries fetching from multiple IP geolocation services in sequence
 */
async function fetchIPGeolocation(): Promise<GeolocationResult | null> {
  // Service 1: ipapi.co
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      if (data.latitude && data.longitude) {
        console.log('IP Geolocation resolved via ipapi.co:', data.latitude, data.longitude);
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          accuracy: 5000,
          altitude: null,
          speed: null,
          heading: null,
          source: 'ip_geolocation',
          timestamp: Date.now()
        };
      }
    }
  } catch (err) {
    console.warn('ipapi.co IP Geolocation failed:', err);
  }

  // Service 2: geolocation-db.com
  try {
    const response = await fetch('https://geolocation-db.com/json/');
    if (response.ok) {
      const data = await response.json();
      if (data.latitude && data.longitude) {
        console.log('IP Geolocation resolved via geolocation-db:', data.latitude, data.longitude);
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          accuracy: 5000,
          altitude: null,
          speed: null,
          heading: null,
          source: 'ip_geolocation',
          timestamp: Date.now()
        };
      }
    }
  } catch (err) {
    console.warn('geolocation-db IP Geolocation failed:', err);
  }

  // Service 3: ipinfo.io
  try {
    const response = await fetch('https://ipinfo.io/json');
    if (response.ok) {
      const data = await response.json();
      if (data.loc) {
        const [lat, lng] = data.loc.split(',');
        console.log('IP Geolocation resolved via ipinfo.io:', lat, lng);
        return {
          latitude: Number(lat),
          longitude: Number(lng),
          accuracy: 5000,
          altitude: null,
          speed: null,
          heading: null,
          source: 'ip_geolocation',
          timestamp: Date.now()
        };
      }
    }
  } catch (err) {
    console.warn('ipinfo.io IP Geolocation failed:', err);
  }

  return null;
}

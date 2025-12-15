// content.js

(function() {
  // Inject a script into the page to run in the page context
  const injectedCode = function() {
    const CHECK_INTERVAL = 500;  // milliseconds between checks
    let adPlaying = false;
    let originalVolume = 1.0;

    function checkAndSkipAds() {
      const video = document.querySelector('video');
      // List of selectors for the "Skip Ad" button (YouTube uses different classes)
      const skipSelectors = [
        '.ytp-ad-skip-button',           // classic skip button
        '.ytp-ad-skip-button-modern',    // newer skip button
        '.ytp-skip-ad-button',           // some variations
        'button[aria-label^="Skip ad"]'  // general aria-label starting with "Skip ad"
      ];
      let skipButton = null;
      for (const sel of skipSelectors) {
        const btn = document.querySelector(sel);
        if (btn && btn.offsetParent !== null) {
          // Found a visible Skip button
          skipButton = btn;
          break;
        }
      }

      // If an ad overlay close button is present (e.g. banner ads), click it
      const adOverlay = document.querySelector('.ytp-ad-overlay-close-container');
      if (adOverlay) {
        adOverlay.click();
      }

      // Detect if a video ad is currently playing by looking for ad-specific classes
      const adContainer = document.querySelector('.ad-showing, .ad-interrupting, .video-ads');
      if (skipButton) {
        // If Skip button is visible and clickable, click it
        skipButton.click();
        // If video was muted, restore volume after skipping
        if (video && video.muted) {
          video.muted = false;
          video.volume = originalVolume;
        }
        adPlaying = false;
      } else if (adContainer) {
        // Ad is playing but no skip button (or it's not time yet)
        // Mute the video if not already muted
        if (video && !video.muted) {
          originalVolume = video.volume;
          video.muted = true;
        }
        adPlaying = true;
      } else {
        // No ad is playing
        if (adPlaying) {
          // Ad just ended: restore volume if we muted it
          if (video) {
            video.muted = false;
            video.volume = originalVolume;
          }
          adPlaying = false;
        }
      }
    }

    // Periodically check for ads
    setInterval(checkAndSkipAds, CHECK_INTERVAL);
    // Also run on each YouTube navigation event (for single-page-app navigation)
    window.addEventListener('yt-navigate-finish', checkAndSkipAds);
  };

  // Create a script element containing the injected code and append to the page
  const scriptEl = document.createElement('script');
  scriptEl.textContent = '(' + injectedCode.toString() + ')();';
  (document.head || document.documentElement).appendChild(scriptEl);
  scriptEl.remove();
})();

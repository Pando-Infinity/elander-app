package PLACEHOLDER_PACKAGE

import android.webkit.JavascriptInterface
import android.webkit.WebView

// Web scrolls inside child containers, which WebView.canScrollVertically(-1) cannot see.
// The page reports it here so SwipeRefreshLayout only refreshes when nothing can scroll up.
object ScrollUpBridge {
    const val NAME = "ElanderScrollUp"

    @Volatile var canScrollUp = false
        private set

    @JavascriptInterface
    fun setCanScrollUp(value: Boolean) {
        canScrollUp = value
    }

    fun install(view: WebView) {
        canScrollUp = false
        view.evaluateJavascript(JS, null)
    }

    private const val JS = """
(function () {
  // Same document, page finished again: Kotlin reset its flag, so force a resend.
  if (window.__elanderScrollUp) { window.__elanderScrollUp(); return; }
  var x = innerWidth / 2, y = innerHeight / 2, last = false, touching = false;
  function update() {
    var v = false;
    for (var el = document.elementFromPoint(x, y); el; el = el.parentElement) {
      if (el.scrollTop > 0) {
        var o = getComputedStyle(el).overflowY;
        if (o === 'auto' || o === 'scroll') { v = true; break; }
      }
    }
    // A touch on the fixed header is outside the page's scroll container: ask it directly.
    if (!v) {
      var main = document.querySelector('[data-scroll-container]');
      v = !!main && main.scrollTop > 0;
    }
    if (v === last) return;
    last = v;
    try { window.$NAME.setCanScrollUp(v); } catch (e) {}
  }
  window.__elanderScrollUp = function () { last = null; update(); };
  document.addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    if (t) { x = t.clientX; y = t.clientY; }
    touching = true;
    update();
  }, { capture: true, passive: true });
  // SwipeRefreshLayout decides on ACTION_DOWN and the bridge is async, so the flag must be synced
  // before the next touch: scrolls mid-gesture are skipped (no refresh in the same swipe), lift re-syncs.
  function lift() { touching = false; update(); }
  document.addEventListener('touchend', lift, { capture: true, passive: true });
  document.addEventListener('touchcancel', lift, { capture: true, passive: true });
  window.addEventListener('scroll', function () { if (!touching) update(); }, { capture: true, passive: true });
  update();
})();
"""
}

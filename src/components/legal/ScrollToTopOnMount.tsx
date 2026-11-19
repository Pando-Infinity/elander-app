"use client";

import { useEffect, useRef } from "react";

/**
 * The main layout scrolls its own content container, not the window, so a client-side
 * navigation keeps the previous page's scroll position. Legal pages link to each other from
 * their tabs and side panel, so they reset it on mount — unless a `#section` hash asks for a specific spot.
 */
const ScrollToTopOnMount = () => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.location.hash) return;
    ref.current?.closest("[data-scroll-container]")?.scrollTo({ top: 0 });
  }, []);

  return <span ref={ref} hidden />;
};

export default ScrollToTopOnMount;

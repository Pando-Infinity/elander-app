"use client";

import { useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";

interface LegalTocProps {
  items: { id: string; title: string }[];
}

/**
 * "On this page" list. Highlights the section being read: the main layout scrolls its own
 * container, so that container is the observer's root, not the window.
 */
const LegalToc = ({ items }: LegalTocProps) => {
  const ref = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const root = ref.current?.closest("[data-scroll-container]") ?? null;
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // The first section in document order that is in the reading band wins.
        const first = items.find((item) => visible.has(item.id));
        if (first) setActiveId(first.id);
      },
      { root, rootMargin: "-10% 0px -65% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav ref={ref} aria-label="On this page">
      <ol className="flex flex-col gap-y-1">
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="relative">
              {active && (
                <span className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-accent navigation-shadow" />
              )}
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={twJoin(
                  "flex items-baseline gap-x-2 py-1 text-xs font-semibold transition-colors",
                  active ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                <span
                  className={twJoin(
                    "text-[10px] tabular-nums",
                    active ? "text-accent" : "text-white/30"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={active ? "text-gradient" : undefined}>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default LegalToc;

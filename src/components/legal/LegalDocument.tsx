import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

import { AppConstant, PathConstant } from "@/const";
import { ArrowIcon, XIcon } from "@/components/icons";
import ScrollToTopOnMount from "./ScrollToTopOnMount";
import LegalTabs from "./LegalTabs";
import LegalToc from "./LegalToc";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface LegalHighlight {
  icon: ReactNode;
  title: string;
  description: string;
}

export type LegalDocKind = "terms" | "privacy";

/** One legal document: what the shared layout needs to render it. */
export interface LegalContent {
  kind: LegalDocKind;
  title: string;
  description: string;
  icon: ReactNode;
  intro: ReactNode;
  highlights: LegalHighlight[];
  sections: LegalSection[];
}

const OTHER_DOC = {
  terms: { href: PathConstant.PRIVACY_POLICY, label: "Privacy Policy" },
  privacy: { href: PathConstant.TERMS, label: "Terms of Service" },
};

// Body typography for section content, so the pages can write plain JSX.
const PROSE = twMerge(
  "flex flex-col gap-y-3",
  "text-xs sm:text-sm font-medium text-white/70 leading-6",
  "[&_ul]:flex [&_ul]:flex-col [&_ul]:gap-y-2",
  "[&_ul>li]:relative [&_ul>li]:pl-5",
  "[&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-1 [&_ul>li]:before:top-[10px]",
  "[&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:rounded-[1px] [&_ul>li]:before:bg-accent",
  "[&_ol]:flex [&_ol]:flex-col [&_ol]:gap-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol>li]:marker:text-accent [&_ol>li]:marker:font-bold",
  "[&_strong]:text-white [&_strong]:font-semibold",
  "[&_em]:text-white/90 [&_em]:not-italic [&_em]:bg-surface-input [&_em]:border [&_em]:border-white/10 [&_em]:rounded [&_em]:px-1.5 [&_em]:py-0.5 [&_em]:text-[11px] sm:[&_em]:text-xs",
  "[&_a]:text-accent [&_a]:font-semibold [&_a]:underline-offset-4 hover:[&_a]:underline"
);

/**
 * Shared layout for the Terms of Service and Privacy Policy, built from the feature pages'
 * pieces: the main card with a tab header, a glowing hero, highlight tiles, Wrapper-style
 * section cards, and a sticky right panel with the table of contents.
 */
const LegalDocument: FC<{ content: LegalContent }> = ({ content }) => {
  const { kind, title, icon, intro, highlights, sections } = content;
  const tocItems = sections.map(({ id, title }) => ({ id, title }));
  const otherDoc = OTHER_DOC[kind];

  return (
    <div className="flex flex-col lg:flex-row gap-x-[42px] gap-y-4 pt-4 sm:pt-0 items-start animate-slideDown">
      <ScrollToTopOnMount />

      <article className="w-full min-w-0 flex flex-col rounded-xl overflow-hidden bg-surface-card border border-white/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b-[0.5px] border-white/20">
          <h1 className="font-bold text-white">{title}</h1>
          <LegalTabs active={kind} />
        </div>

        {/* Hero */}
        <div className="px-4 sm:px-5 pt-6 pb-5 flex flex-col gap-y-4 bg-[radial-gradient(60.75%_112.14%_at_47.63%_0%,rgba(244,67,25,0.4)_0%,rgba(244,67,25,0)_100%)]">
          <div className="flex items-center gap-x-3">
            <div className="w-11 h-11 shrink-0 rounded-lg center-root text-accent bg-accent/10 border border-accent/30 shadow-[4px_4px_24px_0px_#F4431940]">
              {icon}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
                E-Lander
              </span>
              <span className="rounded px-2 py-1 text-[10px] font-semibold text-white/60 bg-white/5 border border-white/10">
                Last updated {AppConstant.LEGAL_LAST_UPDATED}
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-white/80 leading-6 flex flex-col gap-y-2">
            {intro}
          </div>
        </div>

        {/* Highlights */}
        <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex gap-x-3 p-4 bg-surface-tooltip rounded border-[1.5px] border-white/20 transition-all duration-200 hover:shadow-[4px_4px_40px_0px_#F443194D] hover:border-accent/20"
            >
              <div className="text-accent shrink-0 mt-0.5">{item.icon}</div>
              <div className="flex flex-col gap-y-1">
                <p className="text-sm font-bold text-accent">{item.title}</p>
                <p className="text-xs text-white/70 leading-5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[1px] mx-4 sm:mx-5 bg-surface-divider" />

        {/* Contents, for screens without the side panel */}
        <details className="lg:hidden mx-4 sm:mx-5 mt-5 rounded-lg bg-surface-input border border-white/20 group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-xs font-bold text-accent">
            On this page
            <span
              aria-hidden="true"
              className="text-white/40 transition-transform duration-300 group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <div className="px-4 pb-3">
            <LegalToc items={tocItems} />
          </div>
        </details>

        {/* Sections */}
        <div className="p-4 sm:p-5 flex flex-col gap-y-5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-lg overflow-hidden bg-surface-card-alt border border-white/20 scroll-mt-24 sm:scroll-mt-8"
            >
              <div className="flex items-center justify-between bg-surface-header pr-4">
                <h2 className="relative text-sm sm:text-base font-semibold py-2.5 pl-4 pr-8 bg-[#D9D9D9]/5">
                  {section.title}
                  <span
                    aria-hidden="true"
                    className="w-6 h-full bg-surface-header top-0 absolute right-0"
                    style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
                  />
                </h2>
                <span className="text-[10px] font-bold text-white/30 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className={twMerge("p-4", PROSE)}>{section.content}</div>
            </section>
          ))}
        </div>
      </article>

      {/* Side panel: stretches to the article's height so the contents card can stay pinned */}
      <aside className="hidden lg:flex flex-col gap-y-4 w-[320px] xl:w-[406px] shrink-0 self-stretch">
        <div className="p-6 rounded-lg bg-surface-input border border-white/20 flex flex-col gap-y-4 bg-[radial-gradient(73.08%_62.57%_at_50.15%_100%,rgba(244,67,25,0.3)_0%,rgba(244,67,25,0)_100%)]">
          <div className="flex flex-col gap-y-1">
            <p className="text-accent font-bold text-xs">Questions?</p>
            <p className="text-xs font-medium text-white/60 leading-5">
              Reach the E-Lander team on X. We will never ask for your seed phrase.
            </p>
          </div>
          <div className="flex gap-x-2">
            <a
              href={AppConstant.ELANDER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 center-root gap-x-2 py-2.5 rounded text-xs font-semibold text-white bg-[linear-gradient(to_right,#F44319,rgba(244,67,25,0.7))] hover:opacity-90 transition-opacity"
            >
              <XIcon /> @elander_nft
            </a>
            <Link
              href={otherDoc.href}
              className="flex-1 flex items-center justify-between gap-x-1 px-3 py-2.5 rounded bg-surface-tooltip border border-white/20 text-xs font-semibold text-white/80 transition-all duration-200 hover:border-accent/20 hover:shadow-[4px_4px_40px_0px_#F443194D]"
            >
              {otherDoc.label}
              <ArrowIcon className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>

        <div className="sticky top-0 p-6 rounded-lg bg-surface-input border border-white/20 flex flex-col gap-y-3">
          <p className="text-accent font-bold text-xs">On this page</p>
          <LegalToc items={tocItems} />
        </div>
      </aside>
    </div>
  );
};

export default LegalDocument;

import { twJoin } from "tailwind-merge";
import Link from "next/link";

import { PathConstant } from "@/const";
import type { LegalDocKind } from "./LegalDocument";

const TABS: { kind: LegalDocKind; href: string; label: string }[] = [
  { kind: "terms", href: PathConstant.TERMS, label: "Terms of Service" },
  { kind: "privacy", href: PathConstant.PRIVACY_POLICY, label: "Privacy Policy" },
];

/** Switches between the two legal documents, styled like the feature pages' tab pills. */
const LegalTabs = ({ active }: { active: LegalDocKind }) => (
  <div className="bg-surface-input p-1 rounded-lg flex items-center gap-x-1 w-full sm:w-auto">
    {TABS.map((tab) => {
      const isActive = tab.kind === active;
      return (
        <Link
          key={tab.kind}
          href={tab.href}
          aria-current={isActive ? "page" : undefined}
          className={twJoin(
            "center-root flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded",
            "text-xs font-semibold leading-[24px] whitespace-nowrap transition-colors",
            isActive
              ? "text-accent bg-accent/20 border border-accent/20 shadow-[4px_4px_24px_0px_#F4431940]"
              : "text-white/40 border border-transparent hover:text-white/70"
          )}
        >
          {tab.label}
        </Link>
      );
    })}
  </div>
);

export default LegalTabs;

import { FC } from "react";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

import { PathConstant } from "@/const";

/** Small "Terms · Privacy" links, used in the desktop sidebar and on the mobile home page. */
const LegalLinks: FC<{ className?: string }> = ({ className }) => (
  <div
    className={twMerge(
      "flex items-center gap-x-2 text-[11px] font-medium text-white/40",
      className
    )}
  >
    <Link href={PathConstant.TERMS} className="hover:text-accent transition-colors">
      Terms
    </Link>
    <span aria-hidden="true">·</span>
    <Link
      href={PathConstant.PRIVACY_POLICY}
      className="hover:text-accent transition-colors"
    >
      Privacy Policy
    </Link>
  </div>
);

export default LegalLinks;

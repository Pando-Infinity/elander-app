import { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import { ArrowIcon } from "@/components/icons";

import Link from "next/link";
import UnLock from "@/components/Unlock";

const UtilityCard: FC<UtilityCardProps> = ({
  icon,
  href,
  label,
  description,
}) => {
  return (
    <Link
      href={href}
      className="flex flex-col gap-y-5 p-4 bg-[#2E2E2E] rounded border-[1.5px] border-white/20 hover:shadow-[4px_4px_40px_0px_#F443194D] hover:border-[#F44319]/20"
    >
      <div className="flex items-center justify-between">
        {icon}
        <UnLock />
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="font-bold text-[#F44319]">{label}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/70">{description}</p>

          <ArrowIcon />
        </div>
      </div>
    </Link>
  );
};

export default UtilityCard;

interface UtilityCardProps extends ComponentPropsWithoutRef<"div"> {
  icon: ReactNode;
  href: string;
  label: string;
  description: string;
}

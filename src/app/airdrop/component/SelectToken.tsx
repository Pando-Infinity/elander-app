/* eslint-disable @next/next/no-img-element */
import { FC, useState, ComponentPropsWithoutRef } from "react";

import {
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
} from "@/components/common-dropdown";
import { FormatUtils } from "@/utils";
import { twJoin, twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";
import { ChevronDownIcon } from "@/components/icons";
import { WalletBalanceInterface } from "@/models/app.model";

export interface Token {
  symbol: string;
  balance: number;
}

const SelectToken: FC<SelectTokenProps> = ({
  selectedToken,
  onSelectToken,
}) => {
  const { walletBalances } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={twMerge(
        "py-2.5 px-3 rounded-lg",
        "flex items-center justify-between",
        "border border-white/50 bg-[#2A2A2A]"
      )}
    >
      <DropdownRoot open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <DropdownTrigger>
          <div className="flex items-center justify-between w-[150px] sm:w-[200px] pr-2 border-r border-white/20 cursor-pointer">
            {selectedToken?.symbol ? (
              <span className="flex items-center gap-x-2">
                <img
                  src={selectedToken.logo}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />

                <p className="text-sm font-bold">{selectedToken.symbol}</p>
              </span>
            ) : (
              <p className="text-sm font-bold">Select Token</p>
            )}

            <ChevronDownIcon
              className={twJoin("duration-500", isOpen ? "-rotate-180" : "")}
            />
          </div>
        </DropdownTrigger>
        <DropdownContent
          className={twJoin(
            "mr-3 mt-4",
            "overflow-hidden",
            "w-[164px] sm:w-[215px]",
            "border border-white/20"
          )}
          align="center"
        >
          {walletBalances?.map((item, index) => (
            <DropdownItem
              key={index}
              className="flex items-center justify-between"
              onClick={() => onSelectToken(item)}
            >
              <span className="flex items-center gap-x-2">
                <img
                  src={item.logo}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />

                <p className="text-sm font-medium">{item.symbol}</p>
              </span>
              <p className="text-sm font-medium">
                {FormatUtils.convertLargeNumber(item.amount)}
              </p>
            </DropdownItem>
          ))}
        </DropdownContent>
      </DropdownRoot>

      <p className="text-sm font-bold">{`${FormatUtils.convertLargeNumber(
        selectedToken?.amount || 0
      )}`}</p>
    </div>
  );
};

export default SelectToken;

interface SelectTokenProps extends ComponentPropsWithoutRef<"div"> {
  selectedToken: WalletBalanceInterface;
  onSelectToken: (selectedToken: WalletBalanceInterface) => void;
}

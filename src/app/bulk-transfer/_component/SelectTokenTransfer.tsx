"use client";

import React, { ComponentPropsWithoutRef, FC, useMemo, useState } from "react";

import {
  BulkTransferInterface,
  WalletBalanceInterface,
} from "@/models/app.model";

import { FormatUtils } from "@/utils";
import { twJoin, twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";
import { NumericFormat } from "react-number-format";
import { AlertCircleIcon, SearchIcon } from "@/components/icons";

import BulkNote from "./BulkNote";
import UnLock from "@/components/Unlock";
import CommonInput from "@/components/CommonInput";
import CommonDialog from "@/components/CommonDialog";
import CommonRadioButton from "@/components/CommonRadioButton";

const SelectTokenTransfer: FC<SelectTokenTransferProps> = ({
  searchQuery,
  onSearchQuery,
  selectedTokens,
  onSelectTokens,
}) => {
  const { walletBalances } = useUserStore();
  const [isOpenNote, setIsOpenNote] = useState(false);

  const filteredAndSortedTokens = useMemo(() => {
    if (!walletBalances) return [];
    const filtered = walletBalances.filter((token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectionOrderMap = new Map<string, number>();
    selectedTokens.forEach((token, index) => {
      selectionOrderMap.set(token.symbol, index);
    });

    return filtered.sort((a, b) => {
      const aOrder = selectionOrderMap.get(a.symbol);
      const bOrder = selectionOrderMap.get(b.symbol);

      if (aOrder !== undefined && bOrder !== undefined) {
        return bOrder - aOrder;
      }

      if (aOrder !== undefined) return -1;

      if (bOrder !== undefined) return 1;

      return 0;
    });
  }, [searchQuery, selectedTokens, walletBalances]);

  const handleSelect = (token: WalletBalanceInterface) => {
    const isSelected = selectedTokens.some((t) => t.symbol === token.symbol);

    if (isSelected) {
      onSelectTokens((prev: BulkTransferInterface[]) =>
        prev.filter((t: BulkTransferInterface) => t.symbol !== token.symbol)
      );
    } else {
      onSelectTokens((prev) => [...prev, { ...token, transferAmount: 0 }]);
    }
  };

  const handleChangeAmount = (symbol: string, value: string) => {
    const numValue = parseFloat(value.replace(/,/g, "")) || 0;
    onSelectTokens((prev) =>
      prev.map((token) =>
        token.symbol === symbol ? { ...token, transferAmount: numValue } : token
      )
    );
  };

  const handleMaxClick = (token: WalletBalanceInterface) => {
    onSelectTokens((prev) =>
      prev.map((t) =>
        t.symbol === token.symbol ? { ...t, transferAmount: token.amount } : t
      )
    );
  };

  return (
    <>
      <div
        className={twMerge(
          "w-full mx-auto",
          "flex flex-col",
          "rounded-xl overflow-hidden",
          "bg-[#232323] border border-white/20"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-white/20">
          <p className="font-bold text-white">Bulk transfer</p>
          <div className="flex items-center gap-x-2">
            <UnLock />
            <button className="sm:hidden" onClick={() => setIsOpenNote(true)}>
              <AlertCircleIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-col p-4 sm:p-5 gap-y-5">
          <CommonInput
            placeholder="Search token"
            wrapperClassName="w-full"
            className="w-full !text-sm !pr-9"
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            suffix={
              <SearchIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />
            }
          />

          {filteredAndSortedTokens.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No tokens found
            </div>
          ) : (
            <div className="flex flex-col gap-y-3">
              {filteredAndSortedTokens.map((item, index) => {
                const currentValue = selectedTokens.find(
                  (token) => token.symbol === item.symbol
                );

                const checked = !!currentValue;

                const isError =
                  checked &&
                  (currentValue.transferAmount > currentValue.amount ||
                    currentValue.transferAmount === 0);

                return (
                  <div
                    className="bg-[#343434] rounded-lg overflow-hidden"
                    key={index}
                  >
                    <div className={"bg-[#1B1B1B] rounded-lg"}>
                      <div
                        className={twJoin(
                          "px-3 py-4",
                          "rounded-lg",
                          "flex items-center justify-between border transition-all duration-200",
                          checked
                            ? "bg-[radial-gradient(60.75%_112.14%_at_47.63%_0%,rgba(244,67,25,0.4)_0%,rgba(244,67,25,0)_100%)] border-[#F44319]/50"
                            : "border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-x-3">
                          <CommonRadioButton
                            checked={checked}
                            onClick={() => handleSelect(item)}
                          />
                          <div className="flex items-center gap-x-2">
                            <p className="text-white font-medium">
                              {item.symbol}
                            </p>
                          </div>
                        </div>

                        <p className="text-white/80">{`${FormatUtils.convertLargeNumber(
                          item.amount,
                          4
                        )} ${item.symbol}`}</p>
                      </div>
                    </div>

                    <div
                      className={twJoin(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        checked ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="flex items-center justify-between p-3 gap-x-3">
                        <p className="text-xs text-white/60">Amount to send</p>

                        <div
                          className={twJoin(
                            "flex items-center gap-x-1 px-3 py-2 rounded-lg h-9 ",
                            isError
                              ? "bg-[#F34E4E]/10 border border-[#F34E4E]/30"
                              : "bg-[#494949]/50"
                          )}
                        >
                          <NumericFormat
                            value={currentValue?.transferAmount || ""}
                            className={twJoin(
                              "bg-transparent",
                              "text-sm text-white",
                              "focus-visible:outline-none w-[150px]"
                            )}
                            onChange={(e) =>
                              handleChangeAmount(item.symbol, e.target.value)
                            }
                            placeholder="0"
                          />

                          <button
                            className="text-sm font-bold text-[#F44319] cursor-pointer hover:text-[#F44319]/80 transition-colors"
                            onClick={() => handleMaxClick(item)}
                          >
                            Max
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CommonDialog
        dialogTitle=""
        isOpen={isOpenNote}
        onClose={() => setIsOpenNote(false)}
        contentClassName="p-0 border-none"
        closeIconClassName="right-3 top-3"
      >
        <BulkNote className="pt-9" />
      </CommonDialog>
    </>
  );
};

export default SelectTokenTransfer;

interface SelectTokenTransferProps extends ComponentPropsWithoutRef<"div"> {
  selectedTokens: BulkTransferInterface[];
  searchQuery: string;
  onSearchQuery: (searchQuery: string) => void;
  onSelectTokens: (
    selectedTokens:
      | BulkTransferInterface[]
      | ((prev: BulkTransferInterface[]) => BulkTransferInterface[])
  ) => void;
}

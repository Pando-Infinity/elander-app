import React, { ComponentPropsWithoutRef, FC, Fragment, useMemo } from "react";
import { FormatUtils } from "@/utils";
import { useUserStore } from "@/stores/user.store";
import { BulkTransferInterface } from "@/models/app.model";

import CommonButton from "@/components/CommonButton";

const ConfirmTransfer: FC<ConfirmTransferProps> = ({
  fee,
  receiver,
  selectedTokens,
  onConfirm,
}) => {
  const { walletBalances } = useUserStore();

  const solBalance = useMemo(() => {
    return walletBalances?.find((item) => item.symbol === "SOL")?.amount || 0;
  }, [walletBalances]);

  return (
    <div className="flex flex-col gap-y-3">
      <p className="font-bold leading-[36px]">Confirm</p>
      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-3 p-3 bg-[#2E2E2E] rounded">
          <div className="flex flex-col gap-y-3">
            {selectedTokens.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-[#747475] text-xs">{item.symbol}</p>
                <p className="text-white/60 text-xs font-semibold">
                  {FormatUtils.formatNumber(item.transferAmount, 4)}{" "}
                  {item.symbol}
                </p>
              </div>
            ))}
          </div>
          <div className="h-[0.5px] w-full bg-white/10" />

          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs">Fee</p>
            <p className="text-white/60 text-xs font-semibold">{fee} SOL</p>
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <p className="text-xs text-[#747475]">Receiver</p>
          <p className="px-4 py-3 border border-[#747475] rounded text-xs">
            {receiver}
          </p>
        </div>

        <CommonButton onClick={onConfirm} disabled={solBalance < fee}>
          Send
        </CommonButton>

        {solBalance < fee ? (
          <p className="text-xs text-[#F34E4E]/60 text-center">
            Insufficient funds
          </p>
        ) : (
          <Fragment />
        )}
      </div>
    </div>
  );
};

export default ConfirmTransfer;

interface ConfirmTransferProps extends ComponentPropsWithoutRef<"div"> {
  fee: number;
  receiver: string;
  selectedTokens: BulkTransferInterface[];

  onConfirm: () => void;
}

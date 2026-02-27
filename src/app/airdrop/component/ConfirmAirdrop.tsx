import React, { ComponentPropsWithoutRef, FC, Fragment, useMemo } from "react";

import { FormatUtils } from "@/utils";
import { AirdropInterface } from "../page";
import { useUserStore } from "@/stores/user.store";
import CommonButton from "@/components/CommonButton";

const ConfirmAirdrop: FC<ConfirmAirdropProps> = ({
  fee,
  token,
  totalAmount,
  airDropListByArray,
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
        <div className="flex flex-col gap-y-2 rounded bg-[#252525] p-3">
          <div className="space-between-root">
            <p className="text-xs text-[#747475]">Total addresses</p>
            <p className="text-xs font-semibold text-white/50">
              {airDropListByArray.length}
            </p>
          </div>
          <div className="space-between-root">
            <p className="text-xs text-[#747475]">Token to send</p>
            <p className="text-xs font-semibold text-white/50">{token}</p>
          </div>
          <div className="space-between-root">
            <p className="text-xs text-[#747475]">Total Amount</p>
            <p className="text-xs font-semibold text-white/50">
              {FormatUtils.formatNumber(totalAmount, 4)}
            </p>
          </div>
          <div className="space-between-root">
            <p className="text-xs text-[#747475]">Gas fee</p>
            <p className="text-xs font-semibold text-white/50">{fee} SOL</p>
          </div>
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

export default ConfirmAirdrop;

interface ConfirmAirdropProps extends ComponentPropsWithoutRef<"div"> {
  fee: number;
  token: string;
  totalAmount: number;
  airDropListByArray: AirdropInterface[];
  onConfirm: () => void;
}

/* eslint-disable @next/next/no-img-element */
import React, { ComponentPropsWithoutRef, FC } from "react";
import { FormatUtils } from "@/utils";
import { twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";
import { WalletBalanceInterface } from "@/models/app.model";
import Wrapper from "./Wrapper";

const WalletBalances: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...otherProps
}) => {
  const { walletBalances, tokenPriceFeeds } = useUserStore();

  const handleAmountByUsd = (value: WalletBalanceInterface) => {
    const price =
      tokenPriceFeeds.find(
        (item) => item.mint === value.mint && item.symbol === value.symbol
      )?.price || 0;

    return price * value.amount;
  };

  return (
    <Wrapper
      label="Assets"
      wrapperClassName={twMerge("!min-h-[200px]", className)}
      {...otherProps}
    >
      <div className="flex flex-col gap-y-3 w-full">
        {walletBalances && walletBalances?.length > 0 ? (
          <>
            {walletBalances.map((item, index) => (
              <WalletBalancesItem
                key={index}
                symbol={item.symbol}
                balance={item.amount}
                logo={item.logo}
                value={handleAmountByUsd(item)}
              />
            ))}
          </>
        ) : (
          <WalletBalancesItem
            symbol="SOL"
            balance={0}
            logo={"/images/logo/sol-logo.png"}
            value={0}
          />
        )}
      </div>
    </Wrapper>
  );
};

export default WalletBalances;

const WalletBalancesItem = ({
  logo,
  symbol,
  value,
  balance,
}: {
  logo: string;
  value: number;
  symbol: string;
  balance: number;
}) => {
  return (
    <div className="flex items-center justify-between w-full p-3 bg-[#1F1F1F] rounded-lg">
      <div className="flex items-center gap-x-2">
        {logo && (
          <img
            src={logo}
            alt="logo"
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <p className="text-sm font-semibold">{symbol}</p>
      </div>

      <span className="flex flex-col items-end gap-y-1">
        <p className="text-sm font-semibold">{`${FormatUtils.convertLargeNumber(
          balance,
          6
        )} ${symbol}`}</p>
        <p className="text-sm font-medium text-white/60">
          ${FormatUtils.convertLargeNumber(value)}
        </p>
      </span>
    </div>
  );
};

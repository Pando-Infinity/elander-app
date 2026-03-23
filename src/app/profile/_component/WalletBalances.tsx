/* eslint-disable @next/next/no-img-element */
"use client";

import { ComponentPropsWithoutRef, FC, useState } from "react";
import { FormatUtils } from "@/utils";
import { twMerge } from "tailwind-merge";
import { useUserStore } from "@/stores/user.store";
import { WalletBalanceInterface } from "@/models/app.model";
import Wrapper from "./Wrapper";

type AssetTab = "tokens" | "nfts";

const WalletBalances: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...otherProps
}) => {
  const { walletBalances, tokenPriceFeeds } = useUserStore();
  const [activeTab, setActiveTab] = useState<AssetTab>("tokens");

  const handleAmountByUsd = (value: WalletBalanceInterface) => {
    const price =
      tokenPriceFeeds.find(
        (item) => item.mint === value.mint && item.symbol === value.symbol
      )?.price || 0;

    return price * value.amount;
  };

  const tokens = walletBalances?.filter((t) => t.decimals > 0 && !t.symbol.endsWith("...")) ?? [];
  const nfts = walletBalances?.filter((t) => t.decimals === 0) ?? [];

  const tabAdornment = (
    <div className="flex items-center gap-x-0.5">
      <button
        onClick={() => setActiveTab("tokens")}
        className={twMerge(
          "px-2.5 py-1 rounded text-xs font-semibold transition-colors",
          activeTab === "tokens"
            ? "bg-accent/15 text-accent"
            : "text-white/40 hover:text-white/60"
        )}
      >
        Tokens{" "}
        <span className="text-[10px] opacity-70">{tokens.length}</span>
      </button>
      <button
        onClick={() => setActiveTab("nfts")}
        className={twMerge(
          "px-2.5 py-1 rounded text-xs font-semibold transition-colors",
          activeTab === "nfts"
            ? "bg-accent/15 text-accent"
            : "text-white/40 hover:text-white/60"
        )}
      >
        NFTs <span className="text-[10px] opacity-70">{nfts.length}</span>
      </button>
    </div>
  );

  return (
    <Wrapper
      label="Assets"
      adornment={tabAdornment}
      wrapperClassName={twMerge("!min-h-[200px]", className)}
      className="!flex-col !flex-nowrap !gap-y-2"
      {...otherProps}
    >
      {activeTab === "tokens" ? (
        <>
          {tokens.length > 0 ? (
            tokens.map((item, index) => (
              <TokenRow
                key={index}
                logo={item.logo}
                symbol={item.symbol}
                name={item.name}
                balance={item.amount}
                usdValue={handleAmountByUsd(item)}
              />
            ))
          ) : (
            <TokenRow
              logo="/images/logo/sol-logo.png"
              symbol="SOL"
              name="Solana"
              balance={0}
              usdValue={0}
            />
          )}
        </>
      ) : (
        <>
          {nfts.length > 0 ? (
            nfts.map((nft, index) => (
              <NftRow
                key={index}
                image={nft.logo}
                name={nft.name}
                symbol={nft.symbol}
                mint={nft.mint}
                balance={nft.amount}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-6 w-full text-white/40 text-sm">
              No NFTs found
            </div>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default WalletBalances;

// ── Token Row (matching Bulk Transfer style) ──────────────────────

const TokenRow: FC<{
  logo: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
}> = ({ logo, symbol, name, balance, usdValue }) => (
  <div className="flex items-center justify-between w-full px-3 py-3 bg-surface-row rounded-lg">
    <div className="flex items-center gap-x-2.5">
      {logo ? (
        <img
          src={logo}
          alt={symbol}
          width={28}
          height={28}
          className="w-7 h-7 min-w-7 rounded-full object-cover"
        />
      ) : (
        <div className="w-7 h-7 min-w-7 rounded-full bg-white/10" />
      )}
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-white">{symbol}</p>
        {name && name !== symbol && (
          <p className="text-[10px] text-white/40 truncate max-w-[120px]">
            {name}
          </p>
        )}
      </div>
    </div>

    <div className="flex flex-col items-end gap-y-0.5">
      <p className="text-sm font-semibold text-white">
        {FormatUtils.convertLargeNumber(balance, 6)} {symbol}
      </p>
      <p className="text-[11px] font-medium text-white/50">
        ${FormatUtils.convertLargeNumber(usdValue)}
      </p>
    </div>
  </div>
);

// ── NFT Row ───────────────────────────────────────────────────────

const NftRow: FC<{
  image: string;
  name: string;
  symbol: string;
  mint: string;
  balance: number;
}> = ({ image, name, symbol, mint, balance }) => (
  <div className="flex items-center justify-between w-full px-3 py-2.5 bg-surface-row rounded-lg">
    <div className="flex items-center gap-x-2.5 min-w-0">
      {image ? (
        <img
          src={image}
          alt={name}
          width={32}
          height={32}
          className="w-8 h-8 min-w-8 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-8 h-8 min-w-8 rounded-lg bg-white/10" />
      )}
      <div className="flex flex-col min-w-0">
        <p className="text-sm font-semibold text-white truncate">{symbol || name}</p>
        <span className="text-[10px] text-white/30 font-mono truncate">
          {mint.slice(0, 6)}...{mint.slice(-4)}
        </span>
      </div>
    </div>
    <p className="text-sm font-semibold text-white shrink-0 ml-2">
      {balance}
    </p>
  </div>
);

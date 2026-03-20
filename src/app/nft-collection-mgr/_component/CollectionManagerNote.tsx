"use client";

import React, { FC, ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

const CollectionManagerNote: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
}) => {
  return (
    <div
      className={twMerge(
        "rounded-xl bg-surface-card border border-white/20 p-4 flex flex-col gap-y-4",
        className
      )}
    >
      {/* Metaplex Core branding */}
      <div className="flex items-center gap-x-2">
        <p className="font-bold text-white text-sm">NFT Collection Manager</p>
        <span className="px-1.5 py-0.5 rounded bg-accent/10 text-[8px] font-bold text-accent">
          Metaplex Core
        </span>
      </div>

      <p className="text-[10px] text-white/50 leading-relaxed">
        Create and manage NFT collections on Solana using the{" "}
        <span className="text-white/70 font-semibold">Metaplex Core</span>{" "}
        standard — the next-generation single-account NFT model with built-in
        plugin system and enforced royalties.
      </p>

      <div className="h-[1px] w-full bg-white/10" />

      <p className="text-[10px] font-bold text-white/60">How It Works</p>

      <div className="flex flex-col gap-y-3">
        <NoteSection title="1. Create Collection">
          Create a Metaplex Core collection on-chain. Provide metadata (name,
          image, description) and configure royalties. You become the update
          authority.
        </NoteSection>

        <NoteSection title="2. Load & View">
          Enter any collection address to view its on-chain data, off-chain
          metadata, plugins, and minted assets. Only the update authority can
          modify the collection.
        </NoteSection>

        <NoteSection title="3. Mint NFTs">
          Paste metadata URIs (from the NFT Generator&apos;s IPFS upload step or
          any hosted JSON) to mint Core NFTs into your collection. Each mint is a
          separate transaction (~0.0015 SOL).
        </NoteSection>

        <NoteSection title="4. Manage">
          Update collection metadata, add/remove plugins (Royalties, Freeze,
          Attributes, etc.), or burn assets you own.
        </NoteSection>
      </div>

      <div className="h-[1px] w-full bg-white/10" />

      {/* Core vs Token Metadata */}
      <div className="rounded bg-white/5 border border-white/10 p-3">
        <p className="text-[10px] font-bold text-accent mb-1.5">
          Why Metaplex Core?
        </p>
        <div className="flex flex-col gap-y-1.5">
          {[
            ["Cost", "~87% cheaper than Token Metadata"],
            ["Accounts", "Single account per NFT (vs. 5+)"],
            ["Royalties", "Enforced on-chain via plugin"],
            ["Plugins", "Freeze, Attributes, Delegates, etc."],
            ["Authority", "Collection-level update authority"],
          ].map(([label, desc]) => (
            <div key={label} className="flex items-start gap-x-2">
              <span className="text-[10px] font-semibold text-white/60 min-w-[64px]">
                {label}
              </span>
              <span className="text-[10px] text-white/40">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration note */}
      <div className="rounded bg-white/5 border border-white/10 p-3">
        <p className="text-[10px] font-bold text-accent mb-1">
          From NFT Generator
        </p>
        <p className="text-[10px] text-white/50">
          After uploading your collection to IPFS in the NFT Generator, copy the
          metadata URIs from the upload results table. Paste them in the Mint tab
          to deploy your NFTs on-chain as Metaplex Core assets.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-y-1.5">
        <p className="text-[10px] font-bold text-white/50">Resources</p>
        <a
          href="https://developers.metaplex.com/core"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline"
        >
          Metaplex Core Documentation ↗
        </a>
        <a
          href="https://core.metaplex.com/explorer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:underline"
        >
          Core Explorer ↗
        </a>
      </div>
    </div>
  );
};

const NoteSection: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <p className="text-[10px] font-bold text-white/80 mb-0.5">{title}</p>
    <p className="text-[10px] text-white/50">{children}</p>
  </div>
);

export default CollectionManagerNote;

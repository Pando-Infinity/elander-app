"use client";

import React, { FC, useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import {
  MintItem,
  MintProgress,
} from "@/models/nft-collection-manager.model";

interface MintAssetsProps {
  collectionAddress: string | null;
  mintItems: MintItem[];
  mintProgress: MintProgress;
  isReady: boolean;
  isTxPending: boolean;
  isAuthority: boolean;
  onSetMintQueue: (items: MintItem[]) => void;
  onMintBatch: () => Promise<void>;
  onCancelMint: () => void;
}

let mintIdCounter = 0;

const MintAssets: FC<MintAssetsProps> = ({
  collectionAddress,
  mintItems,
  mintProgress,
  isReady,
  isTxPending,
  isAuthority,
  onSetMintQueue,
  onMintBatch,
  onCancelMint,
}) => {
  const [rawInput, setRawInput] = useState("");
  const [parseError, setParseError] = useState("");

  const isMinting = mintProgress.status === "minting";
  const percent =
    mintProgress.total > 0
      ? Math.round(
          ((mintProgress.completed + mintProgress.failed) /
            mintProgress.total) *
            100
        )
      : 0;

  const pendingCount = useMemo(
    () => mintItems.filter((i) => i.status === "pending").length,
    [mintItems]
  );

  const handleParse = () => {
    setParseError("");
    const input = rawInput.trim();
    if (!input) return;

    try {
      // Try JSON parse first (IpfsUploadResult[] format)
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        const items: MintItem[] = parsed
          .filter((r: Record<string, unknown>) => r.metadataUrl || r.metadataUri || r.uri)
          .map((r: Record<string, unknown>, i: number) => ({
            id: `mint-${Date.now()}-${++mintIdCounter}`,
            edition: r.edition ?? i + 1,
            name: r.name || `#${r.edition ?? i + 1}`,
            metadataUri: r.metadataUrl || r.metadataUri || r.uri,
            status: "pending" as const,
          }));

        if (items.length === 0) {
          setParseError(
            "No valid metadata URIs found. Expected objects with metadataUrl or uri field."
          );
          return;
        }

        onSetMintQueue(items);
        setRawInput("");
        return;
      }
    } catch {
      // Not JSON — try line-by-line URI parsing
    }

    // Line-by-line: each line is a metadata URI (optionally prefixed with "edition,name,")
    const lines = input
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const items: MintItem[] = lines.map((line, i) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        // format: edition, name, uri
        return {
          id: `mint-${Date.now()}-${++mintIdCounter}`,
          edition: parseInt(parts[0], 10) || i + 1,
          name: parts[1] || `#${i + 1}`,
          metadataUri: parts[2],
          status: "pending" as const,
        };
      }
      // Just a URI per line
      return {
        id: `mint-${Date.now()}-${++mintIdCounter}`,
        edition: i + 1,
        name: `#${i + 1}`,
        metadataUri: line,
        status: "pending" as const,
      };
    });

    onSetMintQueue(items);
    setRawInput("");
  };

  const handleClearQueue = () => {
    onSetMintQueue([]);
    setRawInput("");
  };

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Mint NFTs into Collection
      </p>

      {!collectionAddress && (
        <div className="rounded bg-yellow-500/10 border border-yellow-500/20 p-3">
          <p className="text-[10px] text-yellow-400">
            Load or create a collection first before minting.
          </p>
        </div>
      )}

      {collectionAddress && !isAuthority && (
        <div className="rounded bg-yellow-500/10 border border-yellow-500/20 p-3">
          <p className="text-[10px] text-yellow-400 font-semibold">
            You are not the update authority — minting is disabled for this
            collection.
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="flex flex-col gap-y-2">
        <label className="text-[10px] font-semibold text-white/60">
          Paste Metadata URIs
        </label>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`Paste metadata URIs — one per line, or a JSON array of IpfsUploadResult[]:

https://gateway.pinata.cloud/ipfs/QmXxx...
https://gateway.pinata.cloud/ipfs/QmYyy...

Or CSV: edition, name, uri
1, NFT #1, https://gateway.pinata.cloud/ipfs/QmXxx...

Or JSON: [{"edition": 1, "metadataUrl": "https://..."}]`}
          rows={6}
          disabled={isMinting || !isAuthority}
          className={twMerge(
            "px-3 py-2 rounded text-xs resize-none font-mono",
            "bg-[#2A2A2A] border border-white/20 text-white",
            "outline-none focus:border-[#F44319]/40",
            (isMinting || !isAuthority) && "opacity-50"
          )}
        />
        {parseError && (
          <p className="text-[10px] text-red-400">{parseError}</p>
        )}
        <div className="flex items-center gap-x-2">
          <button
            onClick={handleParse}
            disabled={!rawInput.trim() || isMinting || !isAuthority}
            className={twMerge(
              "px-3 py-1.5 rounded text-xs font-semibold",
              rawInput.trim() && !isMinting
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            Parse & Load Queue
          </button>
          {mintItems.length > 0 && !isMinting && (
            <button
              onClick={handleClearQueue}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-white/5 text-white/40 hover:bg-white/10"
            >
              Clear Queue
            </button>
          )}
        </div>
      </div>

      {/* Mint queue table */}
      {mintItems.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <div className="h-[1px] w-full bg-white/10" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/80">
              Mint Queue ({mintItems.length} items)
            </p>
            <span className="text-[10px] text-white/40">
              {mintProgress.completed} minted, {mintProgress.failed} failed,{" "}
              {pendingCount} pending
            </span>
          </div>

          {/* Progress bar */}
          {isMinting && (
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60 font-semibold">
                  Minting #{mintProgress.currentEdition}...
                </span>
                <span className="text-white/40">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#F44319] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="max-h-[300px] overflow-auto rounded bg-black/20 p-2">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="text-white/40">
                  <th className="text-left py-1 w-12">#</th>
                  <th className="text-left py-1">Name</th>
                  <th className="text-left py-1">URI</th>
                  <th className="text-left py-1 w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {mintItems.map((item) => (
                  <tr key={item.id} className="text-white/60">
                    <td className="py-0.5">{item.edition}</td>
                    <td className="py-0.5">{item.name}</td>
                    <td className="py-0.5 truncate max-w-[200px] font-mono">
                      {item.metadataUri.slice(0, 40)}...
                    </td>
                    <td className="py-0.5">
                      <StatusBadge item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mint / Cancel buttons */}
          <div className="flex items-center gap-x-2">
            {!isMinting ? (
              <button
                onClick={onMintBatch}
                disabled={
                  !isReady ||
                  !collectionAddress ||
                  !isAuthority ||
                  pendingCount === 0 ||
                  isTxPending
                }
                className={twMerge(
                  "flex-1 py-3 rounded-lg text-sm font-bold",
                  isReady &&
                    collectionAddress &&
                    isAuthority &&
                    pendingCount > 0
                    ? "bg-gradient-to-r from-[#F44319] to-[#F44319]/70 text-white hover:opacity-90"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {!isReady
                  ? "Connect Wallet"
                  : !isAuthority
                    ? "Not Update Authority"
                    : `Start Minting (${pendingCount} NFTs)`}
              </button>
            ) : (
              <button
                onClick={onCancelMint}
                className="flex-1 py-3 rounded-lg text-sm font-bold bg-white/10 text-white hover:bg-white/20"
              >
                Pause Minting
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge: FC<{ item: MintItem }> = ({ item }) => {
  const styles: Record<string, string> = {
    pending: "text-white/30",
    minting: "text-yellow-400",
    confirmed: "text-green-400",
    failed: "text-red-400",
  };

  return (
    <span className={twMerge("text-[10px] font-semibold", styles[item.status])}>
      {item.status === "confirmed" && item.txSignature
        ? `OK`
        : item.status === "failed"
          ? item.error?.slice(0, 20) || "Failed"
          : item.status}
    </span>
  );
};

export default MintAssets;

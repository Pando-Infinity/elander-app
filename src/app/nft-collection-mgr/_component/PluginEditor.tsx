"use client";

import React, { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import { SupportedPluginType } from "@/models/nft-collection-manager.model";
import { DEFAULT_ROYALTY_BASIS_POINTS } from "@/const/nft-collection-manager.const";

interface PluginEditorProps {
  pluginType: SupportedPluginType;
  onSubmit: (plugin: Record<string, unknown>) => Promise<void>;
  isTxPending: boolean;
  mode: "add" | "update";
}

const PluginEditor: FC<PluginEditorProps> = ({
  pluginType,
  onSubmit,
  isTxPending,
  mode,
}) => {
  // Royalties fields
  const [basisPoints, setBasisPoints] = useState(DEFAULT_ROYALTY_BASIS_POINTS);
  const [creatorAddress, setCreatorAddress] = useState("");
  const [creatorPercentage, setCreatorPercentage] = useState(100);

  // Freeze fields
  const [frozen, setFrozen] = useState(false);

  // Attributes fields
  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");

  const handleSubmit = async () => {
    let plugin: Record<string, unknown>;

    switch (pluginType) {
      case "Royalties":
        plugin = {
          type: "Royalties",
          basisPoints,
          creators: creatorAddress.trim()
            ? [{ address: creatorAddress.trim(), percentage: creatorPercentage }]
            : [],
          ruleSet: { __kind: "None" },
        };
        break;
      case "FreezeDelegate":
        plugin = { type: "FreezeDelegate", frozen };
        break;
      case "PermanentFreezeDelegate":
        plugin = { type: "PermanentFreezeDelegate", frozen };
        break;
      case "TransferDelegate":
        plugin = { type: "TransferDelegate" };
        break;
      case "BurnDelegate":
        plugin = { type: "BurnDelegate" };
        break;
      case "Attributes":
        plugin = {
          type: "Attributes",
          attributeList: attrKey.trim()
            ? [{ key: attrKey.trim(), value: attrValue.trim() }]
            : [],
        };
        break;
    }

    await onSubmit(plugin);
  };

  return (
    <div className="flex flex-col gap-y-3 rounded bg-white/5 border border-white/10 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-accent">
          {mode === "add" ? "Add" : "Update"} {pluginType}
        </span>
      </div>

      {/* Royalties-specific fields */}
      {pluginType === "Royalties" && (
        <>
          <div className="flex items-center gap-x-3">
            <div className="flex flex-col gap-y-1">
              <label className="text-[8px] text-white/40">Basis Points</label>
              <input
                type="number"
                min={0}
                max={10000}
                value={basisPoints}
                onChange={(e) =>
                  setBasisPoints(parseInt(e.target.value, 10) || 0)
                }
                className={twMerge(
                  "px-2 py-1.5 rounded text-xs w-24",
                  "bg-surface-input border border-white/20 text-white",
                  "outline-none focus:border-accent/40"
                )}
              />
            </div>
            <span className="text-[8px] text-white/30 mt-4">
              = {(basisPoints / 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex items-end gap-x-2">
            <div className="flex-1 flex flex-col gap-y-1">
              <label className="text-[8px] text-white/40">
                Creator Address
              </label>
              <input
                type="text"
                value={creatorAddress}
                onChange={(e) => setCreatorAddress(e.target.value)}
                placeholder="Wallet address..."
                className={twMerge(
                  "px-2 py-1.5 rounded text-xs",
                  "bg-surface-input border border-white/20 text-white",
                  "outline-none focus:border-accent/40"
                )}
              />
            </div>
            <div className="w-16 flex flex-col gap-y-1">
              <label className="text-[8px] text-white/40">%</label>
              <input
                type="number"
                min={0}
                max={100}
                value={creatorPercentage}
                onChange={(e) =>
                  setCreatorPercentage(parseInt(e.target.value, 10) || 0)
                }
                className={twMerge(
                  "px-2 py-1.5 rounded text-xs text-center",
                  "bg-surface-input border border-white/20 text-white",
                  "outline-none focus:border-accent/40"
                )}
              />
            </div>
          </div>
        </>
      )}

      {/* Freeze fields */}
      {(pluginType === "FreezeDelegate" ||
        pluginType === "PermanentFreezeDelegate") && (
        <div className="flex items-center gap-x-2">
          <label className="text-[10px] text-white/60">Frozen:</label>
          <button
            onClick={() => setFrozen(!frozen)}
            className={twMerge(
              "px-2 py-0.5 rounded text-[10px] font-semibold",
              frozen
                ? "bg-blue-500/20 text-blue-400"
                : "bg-white/5 text-white/40"
            )}
          >
            {frozen ? "Yes" : "No"}
          </button>
        </div>
      )}

      {/* Attributes fields */}
      {pluginType === "Attributes" && (
        <div className="flex items-end gap-x-2">
          <div className="flex-1 flex flex-col gap-y-1">
            <label className="text-[8px] text-white/40">Key</label>
            <input
              type="text"
              value={attrKey}
              onChange={(e) => setAttrKey(e.target.value)}
              placeholder="trait_type"
              className={twMerge(
                "px-2 py-1.5 rounded text-xs",
                "bg-surface-input border border-white/20 text-white",
                "outline-none focus:border-accent/40"
              )}
            />
          </div>
          <div className="flex-1 flex flex-col gap-y-1">
            <label className="text-[8px] text-white/40">Value</label>
            <input
              type="text"
              value={attrValue}
              onChange={(e) => setAttrValue(e.target.value)}
              placeholder="value"
              className={twMerge(
                "px-2 py-1.5 rounded text-xs",
                "bg-surface-input border border-white/20 text-white",
                "outline-none focus:border-accent/40"
              )}
            />
          </div>
        </div>
      )}

      {/* No extra fields for Transfer/BurnDelegate */}
      {(pluginType === "TransferDelegate" ||
        pluginType === "BurnDelegate") && (
        <p className="text-[10px] text-white/40">
          This plugin has no additional configuration.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isTxPending}
        className={twMerge(
          "px-3 py-1.5 rounded text-xs font-semibold",
          !isTxPending
            ? "bg-accent text-white hover:bg-accent/80"
            : "bg-white/10 text-white/30 cursor-not-allowed"
        )}
      >
        {isTxPending
          ? "Processing..."
          : `${mode === "add" ? "Add" : "Update"} Plugin`}
      </button>
    </div>
  );
};

export default PluginEditor;

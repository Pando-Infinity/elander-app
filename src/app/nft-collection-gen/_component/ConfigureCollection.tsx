"use client";

import React, { FC } from "react";
import { twMerge } from "tailwind-merge";
import { CollectionConfig, CreatorEntry } from "@/models/nft-generation.model";

interface ConfigureCollectionProps {
  config: CollectionConfig;
  onChange: (config: CollectionConfig) => void;
}

const ConfigureCollection: FC<ConfigureCollectionProps> = ({
  config,
  onChange,
}) => {
  const updateField = <K extends keyof CollectionConfig>(
    key: K,
    value: CollectionConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  const addCreator = () => {
    updateField("creators", [...config.creators, { address: "", share: 0 }]);
  };

  const updateCreator = (
    index: number,
    field: keyof CreatorEntry,
    value: string | number
  ) => {
    const updated = config.creators.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    updateField("creators", updated);
  };

  const removeCreator = (index: number) => {
    updateField(
      "creators",
      config.creators.filter((_, i) => i !== index)
    );
  };

  const totalShares = config.creators.reduce((sum, c) => sum + c.share, 0);

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Configure your collection metadata.
      </p>

      <InputField
        label="Collection Name"
        value={config.name}
        onChange={(v) => updateField("name", v)}
        placeholder="My NFT Collection"
      />

      <InputField
        label="Symbol"
        value={config.symbol}
        onChange={(v) => updateField("symbol", v)}
        placeholder="MNFT"
      />

      <div className="flex flex-col gap-y-1">
        <label className="text-[10px] font-semibold text-white/60">
          Description
        </label>
        <textarea
          value={config.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="A unique collection of..."
          rows={3}
          className={twMerge(
            "px-3 py-2 rounded text-xs",
            "bg-surface-input border border-white/20 text-white",
            "outline-none focus:border-accent/40 resize-y"
          )}
        />
      </div>

      <InputField
        label="External URL"
        value={config.externalUrl}
        onChange={(v) => updateField("externalUrl", v)}
        placeholder="https://myproject.com"
      />

      <div className="flex gap-x-3">
        <div className="flex-1">
          <InputField
            label="Canvas Width"
            value={config.canvasWidth.toString()}
            onChange={(v) => updateField("canvasWidth", parseInt(v, 10) || 0)}
            type="number"
          />
        </div>
        <div className="flex-1">
          <InputField
            label="Canvas Height"
            value={config.canvasHeight.toString()}
            onChange={(v) => updateField("canvasHeight", parseInt(v, 10) || 0)}
            type="number"
          />
        </div>
      </div>

      <InputField
        label="Seller Fee (basis points, 500 = 5%)"
        value={config.sellerFeeBasisPoints.toString()}
        onChange={(v) =>
          updateField("sellerFeeBasisPoints", parseInt(v, 10) || 0)
        }
        type="number"
      />

      {/* Creators */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold text-white/60">
            Creators{" "}
            {totalShares > 0 && (
              <span
                className={
                  totalShares === 100 ? "text-green-400" : "text-red-400"
                }
              >
                (Total: {totalShares}%)
              </span>
            )}
          </label>
          <button
            onClick={addCreator}
            className="text-[10px] text-accent font-semibold hover:underline"
          >
            + Add Creator
          </button>
        </div>

        {config.creators.map((creator, index) => (
          <div key={index} className="flex items-center gap-x-2">
            <input
              value={creator.address}
              onChange={(e) => updateCreator(index, "address", e.target.value)}
              placeholder="Solana wallet address"
              className={twMerge(
                "flex-1 px-3 py-2 rounded text-xs",
                "bg-surface-input border border-white/20 text-white",
                "outline-none focus:border-accent/40"
              )}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={creator.share}
              onChange={(e) =>
                updateCreator(index, "share", parseInt(e.target.value, 10) || 0)
              }
              className={twMerge(
                "w-16 px-2 py-2 rounded text-xs text-center",
                "bg-surface-input border border-white/20 text-white",
                "outline-none focus:border-accent/40"
              )}
            />
            <span className="text-[10px] text-white/30">%</span>
            <button
              onClick={() => removeCreator(index)}
              className="text-[10px] text-red-400/60 hover:text-red-400"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigureCollection;

// Simple input field component
const InputField: FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-y-1">
    <label className="text-[10px] font-semibold text-white/60">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={twMerge(
        "px-3 py-2 rounded text-xs",
        "bg-surface-input border border-white/20 text-white",
        "outline-none focus:border-accent/40"
      )}
    />
  </div>
);

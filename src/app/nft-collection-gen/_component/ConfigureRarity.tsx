"use client";

import React, { FC } from "react";
import { twMerge } from "tailwind-merge";
import {
  RarityClassConfig,
  RarityPoolEnum,
  TraitTypeConfig,
} from "@/models/nft-generation.model";

interface ConfigureRarityProps {
  rarityClasses: RarityClassConfig[];
  traitTypes: TraitTypeConfig[];
  onChange: (classes: RarityClassConfig[]) => void;
  validationErrors: string[];
}

const RARITY_COLORS: Record<RarityPoolEnum, string> = {
  [RarityPoolEnum.COMMON]: "text-white/60",
  [RarityPoolEnum.RARE]: "text-blue-400",
  [RarityPoolEnum.EPIC]: "text-purple-400",
  [RarityPoolEnum.LEGENDARY]: "text-yellow-400",
};

const ConfigureRarity: FC<ConfigureRarityProps> = ({
  rarityClasses,
  traitTypes,
  onChange,
  validationErrors,
}) => {
  const totalSupply = rarityClasses.reduce((sum, rc) => sum + rc.supply, 0);

  const addRarityClass = () => {
    const pools = Object.values(RarityPoolEnum);
    const existingPools = new Set(rarityClasses.map((rc) => rc.name));
    const nextPool = pools.find((p) => !existingPools.has(p));
    if (!nextPool) return;

    onChange([
      ...rarityClasses,
      {
        name: nextPool,
        supply: 0,
        traitMix: {
          [RarityPoolEnum.COMMON]: traitTypes.length,
          [RarityPoolEnum.RARE]: 0,
          [RarityPoolEnum.EPIC]: 0,
          [RarityPoolEnum.LEGENDARY]: 0,
        },
      },
    ]);
  };

  const removeRarityClass = (index: number) => {
    onChange(rarityClasses.filter((_, i) => i !== index));
  };

  const updateClass = (index: number, updates: Partial<RarityClassConfig>) => {
    onChange(
      rarityClasses.map((rc, i) => (i === index ? { ...rc, ...updates } : rc))
    );
  };

  const updateTraitMix = (
    classIndex: number,
    pool: RarityPoolEnum,
    count: number
  ) => {
    const rc = rarityClasses[classIndex];
    updateClass(classIndex, {
      traitMix: { ...rc.traitMix, [pool]: Math.max(0, count) },
    });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">
            Rarity Classes & Trait Mixing
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">
            Total supply: {totalSupply} NFTs
          </p>
        </div>
        {rarityClasses.length < 4 && (
          <button
            onClick={addRarityClass}
            className="px-3 py-1.5 rounded text-[10px] font-semibold bg-accent text-white hover:bg-accent/80"
          >
            + Add Class
          </button>
        )}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="rounded bg-red-500/10 border border-red-500/20 p-3">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-[10px] text-red-400">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Rarity class cards */}
      <div className="flex flex-col gap-y-3">
        {rarityClasses.map((rc, index) => {
          const mixTotal = Object.values(rc.traitMix).reduce(
            (s, v) => s + v,
            0
          );
          const mixValid = mixTotal === traitTypes.length;

          return (
            <div
              key={rc.name}
              className="rounded border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-x-2">
                  <span
                    className={twMerge(
                      "text-xs font-bold",
                      RARITY_COLORS[rc.name]
                    )}
                  >
                    {rc.name}
                  </span>
                </div>
                <button
                  onClick={() => removeRarityClass(index)}
                  className="text-[10px] text-red-400/60 hover:text-red-400"
                >
                  Remove
                </button>
              </div>

              {/* Supply */}
              <div className="flex items-center gap-x-2 mb-3">
                <label className="text-[10px] text-white/40 w-16">
                  Supply:
                </label>
                <input
                  type="number"
                  min={0}
                  value={rc.supply}
                  onChange={(e) =>
                    updateClass(index, {
                      supply: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className={twMerge(
                    "w-24 px-2 py-1.5 rounded text-xs",
                    "bg-surface-input border border-white/20 text-white",
                    "outline-none focus:border-accent/40"
                  )}
                />
              </div>

              {/* Trait mix */}
              <div className="flex flex-col gap-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-white/40">
                    Trait pool mix
                  </label>
                  <span
                    className={twMerge(
                      "text-[10px]",
                      mixValid ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {mixTotal}/{traitTypes.length} layers
                  </span>
                </div>

                <div className="flex items-center gap-x-2 flex-wrap">
                  {Object.values(RarityPoolEnum).map((pool) => (
                    <div key={pool} className="flex items-center gap-x-1">
                      <span
                        className={twMerge(
                          "text-[10px]",
                          RARITY_COLORS[pool]
                        )}
                      >
                        {pool}:
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={traitTypes.length}
                        value={rc.traitMix[pool] || 0}
                        onChange={(e) =>
                          updateTraitMix(
                            index,
                            pool,
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className={twMerge(
                          "w-10 px-1 py-0.5 rounded text-[10px] text-center",
                          "bg-surface-input border border-white/20 text-white",
                          "outline-none focus:border-accent/40"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConfigureRarity;

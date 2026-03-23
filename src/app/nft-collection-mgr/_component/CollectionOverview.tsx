"use client";

import React, { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  ManagedCollection,
  AssetInfo,
} from "@/models/nft-collection-manager.model";
import AssetCard from "./AssetCard";

interface CollectionOverviewProps {
  collection: ManagedCollection | null;
  assets: AssetInfo[];
  isLoading: boolean;
  isTxPending: boolean;
  onBurnAsset: (address: string) => Promise<void>;
}

const CollectionOverview: FC<CollectionOverviewProps> = ({
  collection,
  assets,
  isLoading,
  isTxPending,
  onBurnAsset,
}) => {
  const [showFullJson, setShowFullJson] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-white/40">Loading collection...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-y-2">
        <p className="text-sm text-white/40">No collection loaded</p>
        <p className="text-[10px] text-white/30">
          Enter a collection address above and click Load, or create a new one
          in the Create tab.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const royaltiesPlugin = collection.plugins.find(
    (p) => p.type === "Royalties"
  );
  const freezePlugin = collection.plugins.find(
    (p) =>
      p.type === "FreezeDelegate" || p.type === "PermanentFreezeDelegate"
  );
  const royaltiesBps = royaltiesPlugin?.data?.basisPoints
    ? Number(royaltiesPlugin.data.basisPoints)
    : 0;
  const creators = (royaltiesPlugin?.data?.creators as
    | { address: { toString?: () => string }; percentage: number }[]
    | undefined) ?? [];
  const isFrozen = freezePlugin?.data?.frozen === true;
  const isImmutableMetadata = collection.plugins.some(
    (p) => p.type === "ImmutableMetadata"
  );

  return (
    <div className="flex flex-col gap-y-5">
      {/* Two-column layout: Details (left) + Plugin Details (right) */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Left: Collection Details */}
        <div className="flex-1 rounded-lg bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-y-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Collection Details
          </p>

          {/* Name */}
          <h2 className="text-xl font-bold text-white">{collection.name}</h2>

          {/* Image */}
          {collection.offchainMetadata?.image && (
            <div className="w-full max-w-[280px] aspect-square rounded-lg overflow-hidden bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={collection.offchainMetadata.image}
                alt={collection.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Description */}
          {collection.offchainMetadata?.description && (
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-xs text-white/70">
                {collection.offchainMetadata.description}
              </p>
            </div>
          )}

          {/* Mint (Address) */}
          <DetailField
            label="Mint"
            value={collection.address}
            mono
            copiable
            copiedField={copiedField}
            onCopy={copyToClipboard}
          />

          {/* Update Authority */}
          <DetailField
            label="Update Authority"
            value={collection.updateAuthority}
            mono
            copiable
            copiedField={copiedField}
            onCopy={copyToClipboard}
          />

          {/* Number Minted */}
          <DetailField
            label="Number Minted"
            value={String(collection.numMinted)}
            copiable
            copiedField={copiedField}
            onCopy={copyToClipboard}
          />

          {/* Current Size */}
          <DetailField
            label="Current Size"
            value={String(collection.currentSize)}
            copiable
            copiedField={copiedField}
            onCopy={copyToClipboard}
          />

          {/* Metadata URI */}
          <div>
            <div className="flex items-center gap-x-1.5 mb-1">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Metadata URI
              </p>
              <CopyButton
                onClick={() => copyToClipboard(collection.uri, "uri")}
                copied={copiedField === "uri"}
              />
            </div>
            <a
              href={collection.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline break-all font-mono"
            >
              {collection.uri}
            </a>
          </div>

          {/* Metadata JSON preview */}
          {collection.offchainMetadata && (
            <div>
              <div className="rounded-lg bg-black/30 border border-white/10 overflow-hidden">
                <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/60">
                    metadata.json
                  </span>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => setShowFullJson(!showFullJson)}
                      className="text-[10px] text-white/30 hover:text-white/50"
                      title={showFullJson ? "Collapse" : "Expand"}
                    >
                      {showFullJson ? "−" : "⊞"}
                    </button>
                    <CopyButton
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(
                            collection.offchainMetadata,
                            null,
                            2
                          ),
                          "json"
                        )
                      }
                      copied={copiedField === "json"}
                    />
                  </div>
                </div>
                <div
                  className={twMerge(
                    "px-3 py-2 text-[10px] font-mono text-white/60 overflow-auto",
                    showFullJson ? "max-h-[400px]" : "max-h-[120px]"
                  )}
                >
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(collection.offchainMetadata, null, 2)}
                  </pre>
                </div>
                {!showFullJson && (
                  <div className="px-3 py-2 border-t border-white/5">
                    <button
                      onClick={() => setShowFullJson(true)}
                      className="text-[10px] text-accent hover:underline"
                    >
                      Show full JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Plugin Details */}
        <div className="sm:w-[280px] shrink-0 rounded-lg bg-white/[0.03] border border-white/10 p-4 flex flex-col gap-y-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Collection Plugin Details
          </p>

          {/* Frozen */}
          <PluginDetailRow
            label="Frozen"
            value={freezePlugin ? (isFrozen ? "Yes" : "No") : "No"}
          />

          {/* Royalties */}
          <PluginDetailRow
            label="Royalties"
            value={royaltiesPlugin ? `${royaltiesBps / 100}%` : "None"}
          />

          {/* Royalties Authority */}
          {royaltiesPlugin && (
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                Royalties Authority
              </p>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                {royaltiesPlugin.authority?.type || "UpdateAuthority"}
              </span>
            </div>
          )}

          {/* Creator Shares */}
          {creators.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                Creator Shares
              </p>
              <div className="flex flex-col gap-y-1.5">
                {creators.map((c, i) => {
                  const addr =
                    typeof c.address === "object" && c.address.toString
                      ? c.address.toString()
                      : String(c.address);
                  return (
                    <div key={i} className="flex items-center gap-x-2">
                      <span
                        className={twMerge(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold min-w-[40px] text-center",
                          c.percentage > 0
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-white/5 text-white/40 border border-white/10"
                        )}
                      >
                        {c.percentage}%
                      </span>
                      <span className="text-[10px] text-white/60 font-mono truncate">
                        {addr}
                      </span>
                      <CopyButton
                        onClick={() =>
                          copyToClipboard(addr, `creator-${i}`)
                        }
                        copied={copiedField === `creator-${i}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Immutable Metadata */}
          <PluginDetailRow
            label="Immutable Metadata"
            value={isImmutableMetadata ? "Yes" : "No"}
          />

          {/* Other plugins */}
          {collection.plugins
            .filter(
              (p) =>
                p.type !== "Royalties" &&
                p.type !== "FreezeDelegate" &&
                p.type !== "PermanentFreezeDelegate" &&
                p.type !== "ImmutableMetadata"
            )
            .map((plugin, i) => (
              <PluginDetailRow
                key={i}
                label={plugin.type}
                value="Enabled"
              />
            ))}
        </div>
      </div>

      {/* Assets section */}
      <div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">
          Assets ({assets.length})
        </p>

        {assets.length === 0 ? (
          <div className="rounded-lg bg-white/[0.03] border border-white/10 p-6 text-center">
            <p className="text-xs text-white/40">
              No assets found in this collection. Mint NFTs in the Mint tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {assets.map((asset) => (
              <AssetCard
                key={asset.address}
                asset={asset}
                isTxPending={isTxPending}
                onBurn={onBurnAsset}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Subcomponents ──────────────────────────────────────────────────

const DetailField: FC<{
  label: string;
  value: string;
  mono?: boolean;
  copiable?: boolean;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}> = ({ label, value, mono, copiable, copiedField, onCopy }) => {
  const fieldKey = label.toLowerCase().replace(/\s/g, "-");
  return (
    <div>
      <div className="flex items-center gap-x-1.5 mb-0.5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
          {label}
        </p>
        {copiable && (
          <CopyButton
            onClick={() => onCopy(value, fieldKey)}
            copied={copiedField === fieldKey}
          />
        )}
      </div>
      <p
        className={twMerge(
          "text-xs text-white/70 break-all",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
};

const PluginDetailRow: FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-0.5">
      {label}
    </p>
    <p className="text-xs text-white/70">{value}</p>
  </div>
);

const CopyButton: FC<{ onClick: () => void; copied: boolean }> = ({
  onClick,
  copied,
}) => (
  <button
    onClick={onClick}
    className="text-white/25 hover:text-white/50 transition-colors"
    title={copied ? "Copied!" : "Copy"}
  >
    {copied ? (
      <svg
        className="w-3 h-3 text-green-400"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 8l3 3 7-7" />
      </svg>
    ) : (
      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 4v-2a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1h-2v2a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h1zm1 0h5a1 1 0 011 1v5h2V2H5v2z" />
      </svg>
    )}
  </button>
);

export default CollectionOverview;

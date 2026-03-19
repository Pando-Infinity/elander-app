"use client";

import React, { FC, useState, useCallback, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import {
  CreateCollectionParams,
  RoyaltiesConfig,
  OffchainCollectionMetadata,
} from "@/models/nft-collection-manager.model";
import { DEFAULT_ROYALTY_BASIS_POINTS } from "@/const/nft-collection-manager.const";

interface CreateCollectionProps {
  isReady: boolean;
  isTxPending: boolean;
  onCreate: (params: CreateCollectionParams) => Promise<string | null>;
}

const CreateCollection: FC<CreateCollectionProps> = ({
  isReady,
  isTxPending,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [useDirectUri, setUseDirectUri] = useState(false);

  // Preview state (for Direct URI mode)
  const [preview, setPreview] = useState<OffchainCollectionMetadata | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Royalties
  const [enableRoyalties, setEnableRoyalties] = useState(true);
  const [basisPoints, setBasisPoints] = useState(DEFAULT_ROYALTY_BASIS_POINTS);
  const [creators, setCreators] = useState<
    { address: string; percentage: number }[]
  >([]);

  // Reset preview when URI changes
  useEffect(() => {
    setPreview(null);
    setPreviewError("");
    setShowPreview(false);
  }, [metadataUri]);

  const addCreator = () => {
    setCreators((prev) => [...prev, { address: "", percentage: 100 }]);
  };

  const removeCreator = (index: number) => {
    setCreators((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCreator = (
    index: number,
    field: "address" | "percentage",
    value: string | number
  ) => {
    setCreators((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const totalShares = creators.reduce((sum, c) => sum + c.percentage, 0);
  const canCreate =
    isReady &&
    !isTxPending &&
    name.trim() &&
    (useDirectUri ? metadataUri.trim() : true) &&
    (!enableRoyalties ||
      creators.length === 0 ||
      (totalShares === 100 && creators.every((c) => c.address.trim())));

  const handleFetchPreview = useCallback(async () => {
    const uri = metadataUri.trim();
    if (!uri) return;

    setPreviewLoading(true);
    setPreviewError("");
    setPreview(null);
    setShowPreview(true);

    try {
      const res = await fetch(uri);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setPreview(json as OffchainCollectionMetadata);

      // Auto-fill on-chain name from metadata if empty
      if (!name.trim() && json.name) {
        setName(json.name);
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Failed to fetch metadata"
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [metadataUri, name]);

  const handleCreate = async () => {
    if (!canCreate) return;

    let royalties: RoyaltiesConfig | undefined;
    if (enableRoyalties && creators.length > 0) {
      royalties = { basisPoints, creators };
    }

    await onCreate({
      name: name.trim(),
      symbol: symbol.trim(),
      description: description.trim(),
      externalUrl: externalUrl.trim(),
      imageUri: imageUri.trim(),
      metadataUri: useDirectUri ? metadataUri.trim() : undefined,
      royalties,
    });
  };

  // Build metadata preview for "Build Metadata" mode
  const buildModePreview: OffchainCollectionMetadata | null =
    !useDirectUri && name.trim()
      ? {
          name: name.trim(),
          symbol: symbol.trim() || undefined,
          description: description.trim() || undefined,
          image: imageUri.trim() || undefined,
          external_url: externalUrl.trim() || undefined,
        }
      : null;

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Create New Metaplex Core Collection
      </p>

      {/* Metaplex Core info panel */}
      <CoreStandardInfo />

      {/* URI mode toggle */}
      <div className="flex items-center gap-x-3">
        <button
          onClick={() => setUseDirectUri(false)}
          className={twMerge(
            "px-3 py-1 rounded text-[10px] font-semibold",
            !useDirectUri
              ? "bg-[#F44319]/20 text-[#F44319] border border-[#F44319]/40"
              : "bg-white/5 text-white/40 border border-white/10"
          )}
        >
          Build Metadata
        </button>
        <button
          onClick={() => setUseDirectUri(true)}
          className={twMerge(
            "px-3 py-1 rounded text-[10px] font-semibold",
            useDirectUri
              ? "bg-[#F44319]/20 text-[#F44319] border border-[#F44319]/40"
              : "bg-white/5 text-white/40 border border-white/10"
          )}
        >
          Direct URI
        </button>
      </div>

      {useDirectUri ? (
        <>
          <div className="flex items-end gap-x-2">
            <div className="flex-1">
              <InputField
                label="Collection Metadata URI"
                value={metadataUri}
                onChange={setMetadataUri}
                placeholder="https://gateway.pinata.cloud/ipfs/..."
                hint="Pre-uploaded metadata JSON URI (e.g., from IPFS)"
              />
            </div>
            <button
              onClick={handleFetchPreview}
              disabled={!metadataUri.trim() || previewLoading}
              className={twMerge(
                "px-3 py-2 rounded text-xs font-semibold shrink-0 mb-[18px]",
                metadataUri.trim() && !previewLoading
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              )}
            >
              {previewLoading ? "Loading..." : "Preview"}
            </button>
          </div>

          {/* Metadata preview card */}
          {showPreview && (
            <MetadataPreviewCard
              metadata={preview}
              isLoading={previewLoading}
              error={previewError}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Name *"
              value={name}
              onChange={setName}
              placeholder="My Collection"
            />
            <InputField
              label="Symbol"
              value={symbol}
              onChange={setSymbol}
              placeholder="MYC"
            />
          </div>
          <InputField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="A collection of unique NFTs..."
            multiline
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Image URI"
              value={imageUri}
              onChange={setImageUri}
              placeholder="https://..."
              hint="Collection cover image"
            />
            <InputField
              label="External URL"
              value={externalUrl}
              onChange={setExternalUrl}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {/* Name is always needed (it goes on-chain) */}
      {useDirectUri && (
        <InputField
          label="On-Chain Name *"
          value={name}
          onChange={setName}
          placeholder="My Collection"
          hint="The name stored on-chain (separate from metadata)"
        />
      )}

      {/* Preview for Build Metadata mode */}
      {!useDirectUri && buildModePreview && (
        <MetadataPreviewCard metadata={buildModePreview} />
      )}

      {/* Royalties */}
      <div className="h-[1px] w-full bg-white/10" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/80">Royalties</p>
        <button
          onClick={() => setEnableRoyalties(!enableRoyalties)}
          className={twMerge(
            "px-2 py-0.5 rounded text-[10px] font-semibold",
            enableRoyalties
              ? "bg-[#F44319]/20 text-[#F44319]"
              : "bg-white/5 text-white/40"
          )}
        >
          {enableRoyalties ? "Enabled" : "Disabled"}
        </button>
      </div>

      {enableRoyalties && (
        <div className="flex flex-col gap-y-3">
          <div className="flex items-center gap-x-3">
            <div className="flex flex-col gap-y-1 w-40">
              <label className="text-[10px] font-semibold text-white/60">
                Basis Points
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                value={basisPoints}
                onChange={(e) =>
                  setBasisPoints(parseInt(e.target.value, 10) || 0)
                }
                className={twMerge(
                  "px-3 py-2 rounded text-xs",
                  "bg-[#2A2A2A] border border-white/20 text-white",
                  "outline-none focus:border-[#F44319]/40"
                )}
              />
              <span className="text-[8px] text-white/30">
                {(basisPoints / 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-white/60">
              Creators
            </label>
            <button
              onClick={addCreator}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white hover:bg-white/20"
            >
              + Add Creator
            </button>
          </div>

          {creators.map((creator, i) => (
            <div key={i} className="flex items-end gap-x-2">
              <div className="flex-1 flex flex-col gap-y-1">
                <label className="text-[8px] text-white/40">Address</label>
                <input
                  type="text"
                  value={creator.address}
                  onChange={(e) => updateCreator(i, "address", e.target.value)}
                  placeholder="Wallet address..."
                  className={twMerge(
                    "px-2 py-1.5 rounded text-xs",
                    "bg-[#2A2A2A] border border-white/20 text-white",
                    "outline-none focus:border-[#F44319]/40"
                  )}
                />
              </div>
              <div className="w-20 flex flex-col gap-y-1">
                <label className="text-[8px] text-white/40">Share %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={creator.percentage}
                  onChange={(e) =>
                    updateCreator(
                      i,
                      "percentage",
                      parseInt(e.target.value, 10) || 0
                    )
                  }
                  className={twMerge(
                    "px-2 py-1.5 rounded text-xs text-center",
                    "bg-[#2A2A2A] border border-white/20 text-white",
                    "outline-none focus:border-[#F44319]/40"
                  )}
                />
              </div>
              <button
                onClick={() => removeCreator(i)}
                className="px-2 py-1.5 rounded text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20"
              >
                Remove
              </button>
            </div>
          ))}

          {creators.length > 0 && totalShares !== 100 && (
            <p className="text-[10px] text-red-400">
              Creator shares must sum to 100% (currently {totalShares}%)
            </p>
          )}
        </div>
      )}

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!canCreate}
        className={twMerge(
          "w-full py-3 rounded-lg text-sm font-bold mt-2",
          canCreate
            ? "bg-gradient-to-r from-[#F44319] to-[#F44319]/70 text-white hover:opacity-90"
            : "bg-white/10 text-white/30 cursor-not-allowed"
        )}
      >
        {!isReady
          ? "Connect Wallet"
          : isTxPending
            ? "Creating..."
            : "Create Collection"}
      </button>
    </div>
  );
};

// ── Metadata Preview Card ─────────────────────────────────────────

const MetadataPreviewCard: FC<{
  metadata: OffchainCollectionMetadata | null;
  isLoading?: boolean;
  error?: string;
}> = ({ metadata, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="rounded bg-white/5 border border-white/10 p-3">
        <p className="text-[10px] text-white/40">Fetching metadata...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded bg-red-500/10 border border-red-500/20 p-3">
        <p className="text-[10px] text-red-400">{error}</p>
      </div>
    );
  }

  if (!metadata) return null;

  const attributes = (metadata as Record<string, unknown>).attributes as
    | { trait_type?: string; value?: string }[]
    | undefined;
  const properties = (metadata as Record<string, unknown>).properties as
    | { creators?: { address: string; share: number }[] }
    | undefined;

  return (
    <div className="rounded bg-white/5 border border-white/10 overflow-hidden">
      <div className="px-3 py-2 bg-white/5 border-b border-white/10">
        <p className="text-[10px] font-bold text-[#F44319]">
          Collection Preview
        </p>
      </div>

      {/* Two-column: left = image + info, right = JSON */}
      <div className="flex flex-col sm:flex-row">
        {/* Left: Image + metadata summary */}
        <div className="flex-1 p-3 flex flex-col gap-y-3 min-w-0">
          <div className="flex gap-x-3">
            {/* Image preview */}
            {metadata.image && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={metadata.image}
                  alt={metadata.name || "Collection"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Metadata fields */}
            <div className="flex-1 flex flex-col gap-y-1.5 min-w-0">
              {metadata.name && (
                <p className="text-xs font-bold text-white truncate">
                  {metadata.name}
                </p>
              )}
              {metadata.symbol && (
                <p className="text-[10px] text-white/50">
                  Symbol: {metadata.symbol}
                </p>
              )}
              {metadata.description && (
                <p className="text-[10px] text-white/50 line-clamp-2">
                  {metadata.description}
                </p>
              )}
              {metadata.external_url && (
                <p className="text-[10px] text-white/40 truncate font-mono">
                  {metadata.external_url}
                </p>
              )}
              {(metadata as Record<string, unknown>)
                .seller_fee_basis_points !== undefined && (
                <p className="text-[10px] text-white/50">
                  Seller Fee:{" "}
                  {Number(
                    (metadata as Record<string, unknown>)
                      .seller_fee_basis_points
                  ) / 100}
                  %
                </p>
              )}
            </div>
          </div>

          {/* Attributes */}
          {attributes && attributes.length > 0 && (
            <div>
              <p className="text-[8px] text-white/40 mb-1">Attributes</p>
              <div className="flex flex-wrap gap-1">
                {attributes.slice(0, 10).map((attr, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-white/50"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
                {attributes.length > 10 && (
                  <span className="px-1.5 py-0.5 text-[8px] text-white/30">
                    +{attributes.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Creators from metadata */}
          {properties?.creators && properties.creators.length > 0 && (
            <div>
              <p className="text-[8px] text-white/40 mb-1">Creators</p>
              {properties.creators.map((c, i) => (
                <p key={i} className="text-[8px] text-white/50 font-mono">
                  {c.address} ({c.share}%)
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right: Raw JSON */}
        <div className="sm:w-[320px] shrink-0 border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col">
          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10">
            <span className="text-[10px] font-semibold text-white/50">
              metadata.json
            </span>
          </div>
          <div className="px-3 py-2 max-h-[240px] overflow-auto">
            <pre className="text-[10px] font-mono text-white/60 whitespace-pre-wrap break-all">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Input field helper ────────────────────────────────────────────

const InputField: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, hint, multiline }) => (
  <div className="flex flex-col gap-y-1">
    <label className="text-[10px] font-semibold text-white/60">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={twMerge(
          "px-3 py-2 rounded text-xs resize-none",
          "bg-[#2A2A2A] border border-white/20 text-white",
          "outline-none focus:border-[#F44319]/40"
        )}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={twMerge(
          "px-3 py-2 rounded text-xs",
          "bg-[#2A2A2A] border border-white/20 text-white",
          "outline-none focus:border-[#F44319]/40"
        )}
      />
    )}
    {hint && <p className="text-[8px] text-white/30">{hint}</p>}
  </div>
);

// ── Core Standard Info Panel ──────────────────────────────────────

const EXAMPLE_JSON = `{
  "name": "My Collection",
  "symbol": "MYC",
  "description": "A unique NFT collection",
  "image": "https://arweave.net/...",
  "external_url": "https://example.com",
  "seller_fee_basis_points": 500,
  "properties": {
    "creators": [
      { "address": "Fg6P...xnip", "share": 100 }
    ]
  }
}`;

const CoreStandardInfo = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/10 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-x-2">
          <span className="text-[10px] font-bold text-[#F44319]">
            Metaplex Core Standard
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#F44319]/10 text-[8px] font-semibold text-[#F44319]">
            87% cheaper
          </span>
        </div>
        <span className="text-white/30 text-xs">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-y-3 border-t border-white/5 pt-3">
          {/* Overview */}
          <p className="text-[10px] text-white/60 leading-relaxed">
            This tool creates NFT collections using{" "}
            <span className="text-white/80 font-semibold">Metaplex Core</span>{" "}
            — the next-generation NFT standard on Solana. Core uses a
            single-account model (vs. 5+ accounts in Token Metadata), reducing
            costs by ~87% and simplifying on-chain data.
          </p>

          {/* Key features */}
          <div>
            <p className="text-[10px] font-bold text-white/50 mb-1.5">
              Key Features
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Single-account NFTs",
                "Plugin system (Royalties, Freeze, etc.)",
                "Enforced royalties on-chain",
                "Collection-level authority",
                "~0.0015 SOL per mint",
                "No token accounts needed",
              ].map((f) => (
                <div key={f} className="flex items-start gap-x-1.5">
                  <span className="text-[#F44319] text-[8px] mt-0.5">●</span>
                  <span className="text-[10px] text-white/50">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JSON Structure */}
          <div>
            <p className="text-[10px] font-bold text-white/50 mb-1.5">
              Collection Metadata JSON Structure
            </p>
            <p className="text-[10px] text-white/40 mb-2">
              When using &quot;Direct URI&quot; mode, your metadata JSON should
              follow this structure. Host it on IPFS or Arweave before creating
              the collection.
            </p>
            <div className="rounded bg-black/30 border border-white/10 overflow-hidden">
              <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white/50">
                  collection-metadata.json
                </span>
              </div>
              <pre className="px-3 py-2 text-[10px] font-mono text-white/50 overflow-auto max-h-[200px] whitespace-pre">
                {EXAMPLE_JSON}
              </pre>
            </div>
          </div>

          {/* Field descriptions */}
          <div>
            <p className="text-[10px] font-bold text-white/50 mb-1.5">
              Field Reference
            </p>
            <div className="flex flex-col gap-y-1">
              {[
                ["name", "Collection display name"],
                ["symbol", "Short ticker (e.g., MYC)"],
                ["description", "Collection description text"],
                ["image", "Cover image URI (IPFS/Arweave/HTTP)"],
                ["external_url", "Project website URL"],
                [
                  "seller_fee_basis_points",
                  "Royalty in basis points (500 = 5%)",
                ],
                [
                  "properties.creators",
                  "Creator addresses and revenue share (must sum to 100)",
                ],
              ].map(([field, desc]) => (
                <div key={field} className="flex items-start gap-x-2">
                  <code className="text-[10px] font-mono text-[#F44319]/70 shrink-0 min-w-[140px]">
                    {field}
                  </code>
                  <span className="text-[10px] text-white/40">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-x-3 pt-1">
            <a
              href="https://developers.metaplex.com/core"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#F44319] hover:underline"
            >
              Core Documentation ↗
            </a>
            <a
              href="https://core.metaplex.com/explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#F44319] hover:underline"
            >
              Core Explorer ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCollection;

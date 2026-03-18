"use client";

import React, { FC, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  IpfsProviderEnum,
  IpfsUploadProgress,
  IpfsUploadResult,
  GeneratedNft,
} from "@/models/nft-generation.model";
import { ZIP_CHUNK_SIZE } from "@/const/nft-generation.const";
import {
  createIpfsProvider,
  IpfsProvider,
} from "@/services/ipfs/ipfs-provider";

interface UploadIpfsProps {
  generatedNfts: GeneratedNft[];
  uploadProgress: IpfsUploadProgress;
  ipfsResults: IpfsUploadResult[];
  onUpload: (
    provider: IpfsProvider,
    startEdition: number,
    endEdition: number
  ) => Promise<void>;
}

const UploadIpfs: FC<UploadIpfsProps> = ({
  generatedNfts,
  uploadProgress,
  ipfsResults,
  onUpload,
}) => {
  // Provider config
  const [jwt, setJwt] = useState("");
  const [gateway, setGateway] = useState("https://gateway.pinata.cloud");
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Edition range selection
  const sortedNfts = useMemo(
    () => [...generatedNfts].sort((a, b) => a.edition - b.edition),
    [generatedNfts]
  );
  const minEdition = sortedNfts[0]?.edition ?? 1;
  const maxEdition = sortedNfts[sortedNfts.length - 1]?.edition ?? 1;

  // Build chunk list for selection
  const chunks = useMemo(() => {
    const result: { start: number; end: number; uploaded: boolean }[] = [];
    for (let i = 0; i < sortedNfts.length; i += ZIP_CHUNK_SIZE) {
      const chunkNfts = sortedNfts.slice(i, i + ZIP_CHUNK_SIZE);
      const start = chunkNfts[0].edition;
      const end = chunkNfts[chunkNfts.length - 1].edition;
      const uploaded = chunkNfts.every((nft) =>
        ipfsResults.some(
          (r) => r.edition === nft.edition && r.metadataHash
        )
      );
      result.push({ start, end, uploaded });
    }
    return result;
  }, [sortedNfts, ipfsResults]);

  // Custom range
  const [rangeStart, setRangeStart] = useState(minEdition);
  const [rangeEnd, setRangeEnd] = useState(maxEdition);
  const [useChunks, setUseChunks] = useState(sortedNfts.length > ZIP_CHUNK_SIZE);

  const uploadedCount = ipfsResults.filter((r) => r.metadataHash).length;

  const handleTestConnection = async () => {
    if (!jwt.trim()) return;
    setConnectionStatus("testing");
    try {
      const provider = createIpfsProvider(IpfsProviderEnum.PINATA, {
        jwt,
        gateway,
      });
      const ok = await provider.testConnection();
      setConnectionStatus(ok ? "success" : "error");
    } catch {
      setConnectionStatus("error");
    }
  };

  const handleUploadRange = async (start: number, end: number) => {
    if (!jwt.trim()) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const provider = createIpfsProvider(IpfsProviderEnum.PINATA, {
        jwt,
        gateway,
      });
      await onUpload(provider, start, end);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  };

  // Progress display
  const isActive = uploadProgress.phase === "images" || uploadProgress.phase === "metadata";
  const percent =
    uploadProgress.total > 0
      ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Upload to IPFS (Decentralized Storage)
      </p>

      {/* Upload status summary */}
      <div className="rounded bg-white/5 border border-white/10 p-3 flex items-center justify-between">
        <span className="text-[10px] text-white/60">
          {uploadedCount} / {sortedNfts.length} NFTs uploaded to IPFS
        </span>
        {uploadedCount > 0 && (
          <span className="text-[10px] text-green-400 font-semibold">
            {Math.round((uploadedCount / sortedNfts.length) * 100)}% complete
          </span>
        )}
      </div>

      {/* Setup Guide */}
      <div className="rounded bg-white/5 border border-white/10 p-3">
        <p className="text-[10px] font-bold text-[#F44319] mb-2">
          Setup Guide
        </p>
        <ol className="text-[10px] text-white/60 list-decimal ml-4 space-y-1">
          <li>
            Create a free account at{" "}
            <span className="text-white/80 font-semibold">pinata.cloud</span>
          </li>
          <li>Go to API Keys and generate a new JWT token</li>
          <li>Paste the JWT token below and test the connection</li>
          <li>Select which NFTs to upload (by chunk or custom range)</li>
        </ol>
        <div className="mt-2 p-2 bg-black/20 rounded">
          <p className="text-[10px] text-white/40">
            <span className="text-white/60 font-semibold">Upload process:</span>{" "}
            Images are uploaded first. Then metadata JSON is rebuilt with the
            real image URI ({" "}
            <code className="text-[8px] text-white/50">
              gateway/ipfs/imageHash
            </code>
            ) and uploaded. The metadata URI is your NFT&apos;s on-chain metadata
            pointer.
          </p>
        </div>
      </div>

      {/* Provider config */}
      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-1">
          <label className="text-[10px] font-semibold text-white/60">
            Provider
          </label>
          <div className="px-3 py-2 rounded text-xs bg-[#2A2A2A] border border-white/20 text-white/60">
            Pinata (more providers coming soon)
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <label className="text-[10px] font-semibold text-white/60">
            Pinata JWT Token
          </label>
          <input
            type="password"
            value={jwt}
            onChange={(e) => {
              setJwt(e.target.value);
              setConnectionStatus("idle");
            }}
            placeholder="eyJhbGciOiJIUzI1NiIs..."
            className={twMerge(
              "px-3 py-2 rounded text-xs",
              "bg-[#2A2A2A] border border-white/20 text-white",
              "outline-none focus:border-[#F44319]/40"
            )}
          />
        </div>

        <div className="flex flex-col gap-y-1">
          <label className="text-[10px] font-semibold text-white/60">
            Gateway URL
          </label>
          <input
            type="text"
            value={gateway}
            onChange={(e) => setGateway(e.target.value)}
            placeholder="https://gateway.pinata.cloud"
            className={twMerge(
              "px-3 py-2 rounded text-xs",
              "bg-[#2A2A2A] border border-white/20 text-white",
              "outline-none focus:border-[#F44319]/40"
            )}
          />
          <p className="text-[8px] text-white/30">
            Image URIs in metadata will use: {gateway}/ipfs/&lt;hash&gt;
          </p>
        </div>

        <div className="flex items-center gap-x-2">
          <button
            onClick={handleTestConnection}
            disabled={!jwt.trim() || connectionStatus === "testing"}
            className={twMerge(
              "px-3 py-1.5 rounded text-xs font-semibold",
              jwt.trim() && connectionStatus !== "testing"
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
          </button>
          {connectionStatus === "success" && (
            <span className="text-[10px] text-green-400">Connected</span>
          )}
          {connectionStatus === "error" && (
            <span className="text-[10px] text-red-400">
              Connection failed. Check your JWT token.
            </span>
          )}
        </div>
      </div>

      {/* Upload progress (active) */}
      {isActive && (
        <div className="flex flex-col gap-y-2 rounded bg-white/5 border border-white/10 p-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/60 font-semibold">
              {uploadProgress.phase === "images"
                ? "Step 1/2: Uploading images..."
                : "Step 2/2: Uploading metadata (with real image URIs)..."}
            </span>
            <span className="text-white/40">{percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F44319] transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-[8px] text-white/30">
            {uploadProgress.completed} / {uploadProgress.total} files
          </p>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <div className="rounded bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-[10px] text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Upload selection */}
      {connectionStatus === "success" && !isActive && (
        <div className="flex flex-col gap-y-3">
          <div className="h-[1px] w-full bg-white/10" />

          <p className="text-xs font-semibold text-white/80">
            Select NFTs to Upload
          </p>

          {/* Toggle: chunks vs custom range */}
          {sortedNfts.length > ZIP_CHUNK_SIZE && (
            <div className="flex items-center gap-x-3">
              <button
                onClick={() => setUseChunks(true)}
                className={twMerge(
                  "px-3 py-1 rounded text-[10px] font-semibold",
                  useChunks
                    ? "bg-[#F44319]/20 text-[#F44319] border border-[#F44319]/40"
                    : "bg-white/5 text-white/40 border border-white/10"
                )}
              >
                By Chunk
              </button>
              <button
                onClick={() => setUseChunks(false)}
                className={twMerge(
                  "px-3 py-1 rounded text-[10px] font-semibold",
                  !useChunks
                    ? "bg-[#F44319]/20 text-[#F44319] border border-[#F44319]/40"
                    : "bg-white/5 text-white/40 border border-white/10"
                )}
              >
                Custom Range
              </button>
            </div>
          )}

          {useChunks && sortedNfts.length > ZIP_CHUNK_SIZE ? (
            /* Chunk-based upload */
            <div className="flex flex-col gap-y-1">
              {chunks.map((chunk, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded bg-white/5"
                >
                  <div className="flex items-center gap-x-2">
                    <span className="text-[10px] text-white/60">
                      #{chunk.start} - #{chunk.end}
                    </span>
                    {chunk.uploaded && (
                      <span className="text-[8px] text-green-400 font-semibold">
                        Uploaded
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      handleUploadRange(chunk.start, chunk.end)
                    }
                    disabled={isUploading}
                    className={twMerge(
                      "px-2 py-1 rounded text-[10px] font-semibold",
                      isUploading
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : chunk.uploaded
                          ? "bg-white/10 text-white/60 hover:bg-white/20"
                          : "bg-[#F44319] text-white hover:bg-[#F44319]/80"
                    )}
                  >
                    {chunk.uploaded ? "Re-upload" : "Upload"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Custom range upload */
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center gap-x-2">
                <div className="flex flex-col gap-y-1 flex-1">
                  <label className="text-[8px] text-white/40">
                    From Edition
                  </label>
                  <input
                    type="number"
                    min={minEdition}
                    max={maxEdition}
                    value={rangeStart}
                    onChange={(e) =>
                      setRangeStart(parseInt(e.target.value, 10) || minEdition)
                    }
                    className={twMerge(
                      "px-2 py-1.5 rounded text-xs text-center",
                      "bg-[#2A2A2A] border border-white/20 text-white",
                      "outline-none focus:border-[#F44319]/40"
                    )}
                  />
                </div>
                <span className="text-white/30 mt-4">to</span>
                <div className="flex flex-col gap-y-1 flex-1">
                  <label className="text-[8px] text-white/40">
                    To Edition
                  </label>
                  <input
                    type="number"
                    min={minEdition}
                    max={maxEdition}
                    value={rangeEnd}
                    onChange={(e) =>
                      setRangeEnd(parseInt(e.target.value, 10) || maxEdition)
                    }
                    className={twMerge(
                      "px-2 py-1.5 rounded text-xs text-center",
                      "bg-[#2A2A2A] border border-white/20 text-white",
                      "outline-none focus:border-[#F44319]/40"
                    )}
                  />
                </div>
              </div>

              <button
                onClick={() => handleUploadRange(rangeStart, rangeEnd)}
                disabled={
                  isUploading || rangeStart > rangeEnd || sortedNfts.length === 0
                }
                className={twMerge(
                  "w-full py-3 rounded-lg text-sm font-bold",
                  !isUploading && rangeStart <= rangeEnd
                    ? "bg-gradient-to-r from-[#F44319] to-[#F44319]/70 text-white hover:opacity-90"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload #${rangeStart} - #${rangeEnd}`}
              </button>
            </div>
          )}

          {/* Upload all button */}
          {sortedNfts.length > ZIP_CHUNK_SIZE && (
            <button
              onClick={() => handleUploadRange(minEdition, maxEdition)}
              disabled={isUploading}
              className={twMerge(
                "w-full py-2 rounded text-xs font-semibold",
                !isUploading
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              Upload All ({sortedNfts.length} NFTs)
            </button>
          )}
        </div>
      )}

      {/* Results summary */}
      {ipfsResults.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <div className="h-[1px] w-full bg-white/10" />
          <p className="text-xs font-semibold text-white/80">
            Upload Results
          </p>
          <div className="max-h-[200px] overflow-auto rounded bg-black/20 p-2">
            <table className="w-full text-[8px]">
              <thead>
                <tr className="text-white/40">
                  <th className="text-left py-1">Edition</th>
                  <th className="text-left py-1">Image Hash</th>
                  <th className="text-left py-1">Metadata URI</th>
                </tr>
              </thead>
              <tbody>
                {ipfsResults.slice(0, 50).map((r) => (
                  <tr key={r.edition} className="text-white/60">
                    <td className="py-0.5">#{r.edition}</td>
                    <td className="py-0.5 truncate max-w-[100px]">
                      {r.imageHash.slice(0, 12)}...
                    </td>
                    <td className="py-0.5 truncate max-w-[150px]">
                      {r.metadataUrl || "pending"}
                    </td>
                  </tr>
                ))}
                {ipfsResults.length > 50 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-1 text-center text-white/30"
                    >
                      ... and {ipfsResults.length - 50} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadIpfs;

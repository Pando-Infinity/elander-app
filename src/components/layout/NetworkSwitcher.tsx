"use client";

import React, { FC, useRef, useState, useEffect } from "react";
import { twJoin } from "tailwind-merge";
import {
  useNetworkStore,
  useActiveEndpoint,
  getEndpointLabel,
} from "@/stores/network.store";
import { ChevronDownIcon } from "../icons";
import { NetworkMode } from "@/models/app.model";

const BUILT_IN_NETWORKS: { mode: NetworkMode; label: string }[] = [
  { mode: "mainnet", label: "Mainnet" },
  { mode: "devnet", label: "Devnet" },
];

const verifyRpc = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return false;

    const data = await response.json();

    if (data && typeof data === "object" && "error" in data && data.error) {
      return false;
    }

    return data.result === "ok";
  } catch {
    return false;
  }
};

const NetworkSwitcher: FC = () => {
  const activeEndpoint = useActiveEndpoint();
  const { setActiveEndpoint, addCustomRpc, removeCustomRpc, savedCustomRpcs } =
    useNetworkStore();

  const [isOpen, setIsOpen] = useState(false);
  const [rpcInput, setRpcInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [rpcError, setRpcError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (value: string) => {
    setRpcInput(value);
    if (rpcError) setRpcError(false);
  };

  const handleConnect = async () => {
    const trimmed = rpcInput.trim();
    if (!trimmed) return;

    setIsVerifying(true);
    setRpcError(false);

    const isValid = await verifyRpc(trimmed);

    setIsVerifying(false);

    if (!isValid) {
      setRpcError(true);
      return;
    }

    addCustomRpc(trimmed);
    setRpcInput("");
    setRpcError(false);
    setIsOpen(false);
  };

  const handleRemove = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCustomRpc(url);
  };

  const handleSelect = (endpoint: string) => {
    setActiveEndpoint(endpoint);
    setIsOpen(false);
  };

  const buttonLabel = getEndpointLabel(activeEndpoint);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        className={twJoin(
          "h-[42px] lg:h-12",
          "cursor-pointer",
          "p-[5px] lg:py-[7px] lg:px-3",
          "flex items-center gap-x-1.5",
          "border border-accent rounded",
          "text-accent text-xs sm:text-sm leading-[24px] sm:leading-[30px] font-medium",
          "max-w-[120px] sm:max-w-[160px]"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronDownIcon
          className={twJoin(
            "w-4 h-4 duration-300 text-accent flex-shrink-0",
            isOpen ? "-rotate-180" : ""
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={twJoin(
            "w-[240px]",
            "flex flex-col",
            "absolute -left-5 sm:left-auto sm:right-0 top-full mt-2 rounded z-[100]",
            "py-2 bg-surface-input border border-white/20"
          )}
        >
          {/* Built-in networks */}
          {BUILT_IN_NETWORKS.map(({ mode, label }) => {
            const isActive = activeEndpoint === mode;
            return (
              <button
                key={mode}
                className={twJoin(
                  "flex items-center gap-x-3 px-4 py-2.5 cursor-pointer",
                  "hover:bg-white/5 transition-colors text-sm",
                  isActive ? "text-white" : "text-white/60"
                )}
                onClick={() => handleSelect(mode)}
              >
                <span
                  className={twJoin(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    isActive ? "bg-success" : "bg-white/20"
                  )}
                />
                {label}
              </button>
            );
          })}

          {/* Divider + Custom RPC header */}
          <div className="h-[1px] w-full bg-[#575757] my-2" />
          <p className="px-4 pb-1.5 text-[11px] text-white/40 uppercase tracking-wider">
            Custom RPC
          </p>

          {/* Saved custom RPCs */}
          {savedCustomRpcs.map((url) => {
            const isActive = activeEndpoint === url;
            const hostname = getEndpointLabel(url);
            return (
              <div
                key={url}
                role="menuitem"
                tabIndex={0}
                className={twJoin(
                  "flex items-center gap-x-3 px-4 py-2 cursor-pointer w-full",
                  "hover:bg-white/5 transition-colors"
                )}
                onClick={() => handleSelect(url)}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(url)}
              >
                <span
                  className={twJoin(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5",
                    isActive ? "bg-success" : "bg-white/20"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={twJoin(
                      "text-sm font-medium truncate",
                      isActive ? "text-accent" : "text-white/80"
                    )}
                  >
                    {hostname}
                  </p>
                  <p className="text-[10px] text-white/30 truncate">{url}</p>
                </div>

                {/* Remove button — hidden when this RPC is active */}
                {!isActive && (
                  <button
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors mt-0.5 cursor-pointer"
                    onClick={(e) => handleRemove(url, e)}
                    title="Remove"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <line x1="1" y1="1" x2="9" y2="9" />
                      <line x1="9" y1="1" x2="1" y2="9" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          {/* Input + Connect */}
          <div className="px-4 pt-1.5 pb-1 flex flex-col gap-y-1.5">
            <input
              type="text"
              value={rpcInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter RPC..."
              className={twJoin(
                "w-full text-xs px-3 py-2 rounded",
                "bg-[#1a1a1a] border",
                rpcError ? "border-error-critical" : "border-white/15",
                "text-white placeholder-white/25",
                "focus:outline-none",
                !rpcError && "focus:border-accent/50"
              )}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            />
            {rpcError && (
              <p className="text-[11px] text-error-critical">
                The RPC is unavailable!
              </p>
            )}
            <button
              className={twJoin(
                "w-full py-1.5 text-xs rounded mt-0.5",
                "border border-white/20 text-white/60 transition-colors",
                isVerifying || !rpcInput.trim()
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer hover:bg-white/5 hover:text-white/80"
              )}
              onClick={handleConnect}
              disabled={isVerifying || !rpcInput.trim()}
            >
              {isVerifying ? "Checking..." : "Connect"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;

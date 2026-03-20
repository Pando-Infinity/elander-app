"use client";

import React, { useState, useMemo, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useWallet } from "@solana/wallet-adapter-react";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";
import {
  CollectionManagerTabEnum,
  CollectionManagerMode,
} from "@/models/nft-collection-manager.model";
import useNftCollectionManager from "@/hooks/useNftCollectionManager";
import CollectionOverview from "./_component/CollectionOverview";
import CreateCollection from "./_component/CreateCollection";
import MintAssets from "./_component/MintAssets";
import ManageCollection from "./_component/ManageCollection";
import CollectionManagerNote from "./_component/CollectionManagerNote";
import CommonDialog from "@/components/CommonDialog";
import { AlertCircleIcon } from "@/components/icons";

const MANAGE_TABS = [
  { key: CollectionManagerTabEnum.OVERVIEW, label: "Overview" },
  { key: CollectionManagerTabEnum.MINT, label: "Mint" },
  { key: CollectionManagerTabEnum.MANAGE, label: "Manage" },
];

const NftCollectionMgr = () => {
  const { publicKey } = useWallet();
  const { logCustomEvent } = useFirebaseAnalytics();
  const [mode, setMode] = useState<CollectionManagerMode>("manage");
  const [activeTab, setActiveTab] = useState(
    CollectionManagerTabEnum.OVERVIEW
  );
  const [addressInput, setAddressInput] = useState("");
  const [isOpenNote, setIsOpenNote] = useState(false);

  useEffect(() => {
    logCustomEvent({ feature_name: "nft-collection-mgr" }, "feature_opened");
  }, []);

  const {
    collectionAddress,
    collection,
    assets,
    mintItems,
    mintProgress,
    isLoading,
    isTxPending,
    isReady,
    createCollection,
    loadCollection,
    updateCollection,
    addPlugin,
    updatePlugin,
    removePlugin,
    setMintQueue,
    mintBatch,
    cancelMint,
    burnAsset,
  } = useNftCollectionManager();

  const isAuthority = useMemo(() => {
    if (!publicKey || !collection) return false;
    return collection.updateAuthority === publicKey.toBase58();
  }, [publicKey, collection]);

  const handleLoad = () => {
    const addr = addressInput.trim();
    if (addr) {
      loadCollection(addr);
      setActiveTab(CollectionManagerTabEnum.OVERVIEW);
    }
  };

  const handleCreate = async (
    params: Parameters<typeof createCollection>[0]
  ) => {
    const address = await createCollection(params);
    if (address) {
      logCustomEvent({ collection_address: address }, "collection_created");
      setAddressInput(address);
      setMode("manage");
      setActiveTab(CollectionManagerTabEnum.OVERVIEW);
    }
    return address;
  };

  const renderManageTab = () => {
    switch (activeTab) {
      case CollectionManagerTabEnum.OVERVIEW:
        return (
          <CollectionOverview
            collection={collection}
            assets={assets}
            isLoading={isLoading}
            isTxPending={isTxPending}
            onBurnAsset={burnAsset}
          />
        );
      case CollectionManagerTabEnum.MINT:
        return (
          <MintAssets
            collectionAddress={collectionAddress}
            mintItems={mintItems}
            mintProgress={mintProgress}
            isReady={isReady}
            isTxPending={isTxPending}
            isAuthority={isAuthority}
            onSetMintQueue={setMintQueue}
            onMintBatch={mintBatch}
            onCancelMint={cancelMint}
          />
        );
      case CollectionManagerTabEnum.MANAGE:
        return (
          <ManageCollection
            collection={collection}
            isReady={isReady}
            isTxPending={isTxPending}
            isAuthority={isAuthority}
            onUpdateCollection={updateCollection}
            onAddPlugin={addPlugin}
            onUpdatePlugin={updatePlugin}
            onRemovePlugin={removePlugin}
          />
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-x-[42px] gap-y-4 pt-4 sm:pt-0 items-start sm:justify-between">
      <div
        className={twMerge(
          "w-full mx-auto",
          "flex flex-col",
          "rounded-xl overflow-hidden",
          "bg-surface-card border border-white/20"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-white/20">
          <p className="font-bold text-white">NFT Collection Manager</p>
          <button className="sm:hidden" onClick={() => setIsOpenNote(true)}>
            <AlertCircleIcon />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-4 pt-3 flex items-center gap-x-2">
          <button
            onClick={() => setMode("manage")}
            className={twMerge(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              mode === "manage"
                ? "bg-accent text-white"
                : "bg-white/5 text-white/40 hover:text-white/60 border border-white/10"
            )}
          >
            Load & Manage
          </button>
          <button
            onClick={() => setMode("create")}
            className={twMerge(
              "px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              mode === "create"
                ? "bg-accent text-white"
                : "bg-white/5 text-white/40 hover:text-white/60 border border-white/10"
            )}
          >
            Create New
          </button>
        </div>

        {mode === "manage" ? (
          <>
            {/* Collection address input */}
            <div className="px-4 pt-3 flex items-end gap-x-2">
              <div className="flex-1 flex flex-col gap-y-1">
                <label className="text-[10px] font-semibold text-white/60">
                  Collection Address
                </label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLoad()}
                  placeholder="Enter collection address to load..."
                  className={twMerge(
                    "px-3 py-2 rounded text-xs font-mono",
                    "bg-surface-input border border-white/20 text-white",
                    "outline-none focus:border-accent/40"
                  )}
                />
              </div>
              <button
                onClick={handleLoad}
                disabled={!addressInput.trim() || isLoading}
                className={twMerge(
                  "px-4 py-2 rounded text-xs font-semibold shrink-0",
                  addressInput.trim() && !isLoading
                    ? "bg-accent text-white hover:bg-accent/80"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isLoading ? "Loading..." : "Load"}
              </button>
            </div>

            {/* Loaded collection indicator */}
            {collectionAddress && collection && (
              <div className="px-4 pt-2 flex flex-col gap-y-1.5">
                <div className="flex items-center gap-x-2 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white/60">
                    {collection.name} ({collection.currentSize} assets)
                  </span>
                  <span className="text-white/30 font-mono">
                    {collectionAddress.slice(0, 8)}...
                    {collectionAddress.slice(-4)}
                  </span>
                </div>

                {/* Authority mismatch warning */}
                {publicKey && !isAuthority && (
                  <div className="flex items-start gap-x-2 rounded bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
                    <span className="text-yellow-400 text-xs leading-none mt-0.5">
                      ⚠
                    </span>
                    <div className="flex flex-col gap-y-0.5">
                      <p className="text-[10px] text-yellow-400 font-semibold">
                        You are not the update authority of this collection
                      </p>
                      <p className="text-[10px] text-yellow-400/60">
                        Mint and Manage actions are disabled. You can still view
                        collection details in the Overview tab.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab bar */}
            <div className="px-4 pt-3 flex items-center gap-x-1 border-b border-white/10">
              {MANAGE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={twMerge(
                    "px-3 py-2 text-xs font-semibold rounded-t transition-colors",
                    activeTab === tab.key
                      ? "text-accent border-b-2 border-accent bg-white/5"
                      : "text-white/40 hover:text-white/60"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex flex-col p-4 sm:p-5 gap-y-3">
              {renderManageTab()}
            </div>
          </>
        ) : (
          /* Create mode */
          <div className="flex flex-col p-4 sm:p-5 gap-y-3">
            <CreateCollection
              isReady={isReady}
              isTxPending={isTxPending}
              onCreate={handleCreate}
            />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-full sm:min-w-[406px] sm:w-[406px] sm:flex flex-col gap-y-5">
        <CollectionManagerNote />
      </div>

      {/* Mobile note modal */}
      <CommonDialog
        dialogTitle=""
        isOpen={isOpenNote}
        onClose={() => setIsOpenNote(false)}
        contentClassName="p-0 border-none"
        closeIconClassName="right-3 top-3"
      >
        <CollectionManagerNote className="pt-9" />
      </CommonDialog>
    </div>
  );
};

export default NftCollectionMgr;

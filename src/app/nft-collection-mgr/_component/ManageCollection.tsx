"use client";

import React, { FC, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  ManagedCollection,
  SupportedPluginType,
} from "@/models/nft-collection-manager.model";
import PluginEditor from "./PluginEditor";

interface ManageCollectionProps {
  collection: ManagedCollection | null;
  isReady: boolean;
  isTxPending: boolean;
  isAuthority: boolean;
  onUpdateCollection: (params: { name?: string; uri?: string }) => Promise<void>;
  onAddPlugin: (plugin: Record<string, unknown>) => Promise<void>;
  onUpdatePlugin: (plugin: Record<string, unknown>) => Promise<void>;
  onRemovePlugin: (type: SupportedPluginType) => Promise<void>;
}

const PLUGIN_TYPES: SupportedPluginType[] = [
  "Royalties",
  "FreezeDelegate",
  "PermanentFreezeDelegate",
  "TransferDelegate",
  "BurnDelegate",
  "Attributes",
];

const ManageCollection: FC<ManageCollectionProps> = ({
  collection,
  isReady,
  isTxPending,
  isAuthority,
  onUpdateCollection,
  onAddPlugin,
  onUpdatePlugin,
  onRemovePlugin,
}) => {
  const [editName, setEditName] = useState("");
  const [editUri, setEditUri] = useState("");
  const [showAddPlugin, setShowAddPlugin] = useState(false);
  const [selectedPluginType, setSelectedPluginType] =
    useState<SupportedPluginType>("Royalties");
  const [editingPlugin, setEditingPlugin] =
    useState<SupportedPluginType | null>(null);

  // Sync form with collection data when it changes
  React.useEffect(() => {
    if (collection) {
      setEditName(collection.name);
      setEditUri(collection.uri);
    }
  }, [collection?.address]);

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-y-2">
        <p className="text-sm text-white/40">No collection loaded</p>
        <p className="text-[10px] text-white/30">
          Load a collection to manage it.
        </p>
      </div>
    );
  }

  const hasChanged = editName !== collection.name || editUri !== collection.uri;
  const existingPluginTypes = collection.plugins.map((p) => p.type);

  return (
    <div className="flex flex-col gap-y-4">
      {/* Authority warning */}
      {!isAuthority && (
        <div className="rounded bg-yellow-500/10 border border-yellow-500/20 p-3">
          <p className="text-[10px] text-yellow-400 font-semibold">
            You are not the update authority — all management actions are
            disabled for this collection.
          </p>
        </div>
      )}

      {/* Update metadata */}
      <p className="text-sm font-medium text-white/80">Update Collection</p>

      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-1">
          <label className="text-[10px] font-semibold text-white/60">
            Name
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            disabled={!isAuthority}
            className={twMerge(
              "px-3 py-2 rounded text-xs",
              "bg-surface-input border border-white/20 text-white",
              "outline-none focus:border-accent/40",
              !isAuthority && "opacity-50"
            )}
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <label className="text-[10px] font-semibold text-white/60">
            URI
          </label>
          <input
            type="text"
            value={editUri}
            onChange={(e) => setEditUri(e.target.value)}
            disabled={!isAuthority}
            className={twMerge(
              "px-3 py-2 rounded text-xs font-mono",
              "bg-surface-input border border-white/20 text-white",
              "outline-none focus:border-accent/40",
              !isAuthority && "opacity-50"
            )}
          />
        </div>
        <button
          onClick={() =>
            onUpdateCollection({
              name: editName !== collection.name ? editName : undefined,
              uri: editUri !== collection.uri ? editUri : undefined,
            })
          }
          disabled={!isReady || !isAuthority || !hasChanged || isTxPending}
          className={twMerge(
            "px-4 py-2 rounded text-xs font-semibold",
            isReady && isAuthority && hasChanged && !isTxPending
              ? "bg-accent text-white hover:bg-accent/80"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          {isTxPending ? "Updating..." : "Save Changes"}
        </button>
      </div>

      {/* Plugins section */}
      <div className="h-[1px] w-full bg-white/10" />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">Plugins</p>
        <button
          onClick={() => setShowAddPlugin(!showAddPlugin)}
          disabled={!isAuthority}
          className={twMerge(
            "px-2 py-0.5 rounded text-[10px] font-semibold",
            isAuthority
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {showAddPlugin ? "Cancel" : "+ Add Plugin"}
        </button>
      </div>

      {/* Add plugin UI */}
      {showAddPlugin && (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {PLUGIN_TYPES.map((pt) => (
              <button
                key={pt}
                onClick={() => setSelectedPluginType(pt)}
                className={twMerge(
                  "px-2 py-1 rounded text-[10px] font-semibold",
                  selectedPluginType === pt
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "bg-white/5 text-white/40 border border-white/10"
                )}
              >
                {pt}
              </button>
            ))}
          </div>
          <PluginEditor
            pluginType={selectedPluginType}
            onSubmit={async (plugin) => {
              await onAddPlugin(plugin);
              setShowAddPlugin(false);
            }}
            isTxPending={isTxPending}
            mode="add"
          />
        </div>
      )}

      {/* Existing plugins */}
      {collection.plugins.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          {collection.plugins.map((plugin, i) => (
            <div
              key={i}
              className="rounded bg-white/5 border border-white/10 p-3 flex flex-col gap-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={twMerge(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold",
                    "bg-accent/20 text-accent"
                  )}
                >
                  {plugin.type}
                </span>
                {isAuthority && (
                  <div className="flex items-center gap-x-1">
                    {PLUGIN_TYPES.includes(
                      plugin.type as SupportedPluginType
                    ) && (
                      <button
                        onClick={() =>
                          setEditingPlugin(
                            editingPlugin ===
                              (plugin.type as SupportedPluginType)
                              ? null
                              : (plugin.type as SupportedPluginType)
                          )
                        }
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-white/40 hover:bg-white/10"
                      >
                        {editingPlugin === plugin.type ? "Cancel" : "Edit"}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onRemovePlugin(plugin.type as SupportedPluginType)
                      }
                      disabled={isTxPending}
                      className={twMerge(
                        "px-2 py-0.5 rounded text-[10px] font-semibold",
                        !isTxPending
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      )}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Plugin details */}
              <div className="text-[10px] text-white/50">
                {plugin.type === "Royalties" && plugin.data.basisPoints && (
                  <span>
                    {Number(plugin.data.basisPoints) / 100}% royalty
                  </span>
                )}
                {(plugin.type === "FreezeDelegate" ||
                  plugin.type === "PermanentFreezeDelegate") && (
                  <span>
                    Frozen: {plugin.data.frozen ? "Yes" : "No"}
                  </span>
                )}
              </div>

              {/* Inline edit */}
              {editingPlugin === plugin.type && (
                <PluginEditor
                  pluginType={plugin.type as SupportedPluginType}
                  onSubmit={async (p) => {
                    await onUpdatePlugin(p);
                    setEditingPlugin(null);
                  }}
                  isTxPending={isTxPending}
                  mode="update"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded bg-white/5 border border-white/10 p-3 text-center">
          <p className="text-[10px] text-white/40">
            No plugins configured on this collection.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageCollection;

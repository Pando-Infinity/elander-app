"use client";

import React, { FC, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { RarityPoolEnum, TraitTypeConfig } from "@/models/nft-generation.model";
import LayerUploadZone from "./LayerUploadZone";

interface UploadLayersProps {
  traitTypes: TraitTypeConfig[];
  onAddTraitType: (name: string) => void;
  onRemoveTraitType: (id: string) => void;
  onRenameTraitType: (id: string, name: string) => void;
  onReorderTraitTypes: (orderedIds: string[]) => void;
  onUploadAssets: (
    traitTypeId: string,
    files: File[],
    pool: RarityPoolEnum
  ) => void;
  onRemoveAsset: (traitTypeId: string, assetId: string) => void;
  onUpdateWeight: (
    traitTypeId: string,
    assetId: string,
    weight: number
  ) => void;
}

const UploadLayers: FC<UploadLayersProps> = ({
  traitTypes,
  onAddTraitType,
  onRemoveTraitType,
  onRenameTraitType,
  onReorderTraitTypes,
  onUploadAssets,
  onRemoveAsset,
  onUpdateWeight,
}) => {
  const [newTraitName, setNewTraitName] = useState("");
  const [selectedPools, setSelectedPools] = useState<
    Record<string, RarityPoolEnum>
  >({});
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  const handleAddTraitType = () => {
    if (!newTraitName.trim()) return;
    onAddTraitType(newTraitName.trim());
    setNewTraitName("");
  };

  const toggleExpanded = (id: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getPool = (id: string) =>
    selectedPools[id] || RarityPoolEnum.COMMON;

  const sortedTraitTypes = [...traitTypes].sort((a, b) => a.order - b.order);

  const handleDragStart = (id: string) => {
    dragItemId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragItemId.current && dragItemId.current !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, dropTargetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const dragId = dragItemId.current;
    dragItemId.current = null;
    if (!dragId || dragId === dropTargetId) return;

    const ids = sortedTraitTypes.map((tt) => tt.id);
    const fromIndex = ids.indexOf(dragId);
    const toIndex = ids.indexOf(dropTargetId);
    if (fromIndex === -1 || toIndex === -1) return;

    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, dragId);
    onReorderTraitTypes(ids);
  };

  const handleDragEnd = () => {
    dragItemId.current = null;
    setDragOverId(null);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-sm font-medium text-white/80">
        Define trait types (layers) and upload images for each rarity pool.
      </p>

      {/* Add new trait type */}
      <div className="flex items-center gap-x-2">
        <input
          type="text"
          value={newTraitName}
          onChange={(e) => setNewTraitName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTraitType()}
          placeholder="e.g., Background, Body, Hat..."
          className={twMerge(
            "flex-1 px-3 py-2 rounded text-xs",
            "bg-surface-input border border-white/20 text-white",
            "outline-none focus:border-accent/40"
          )}
        />
        <button
          onClick={handleAddTraitType}
          disabled={!newTraitName.trim()}
          className={twMerge(
            "px-3 py-2 rounded text-xs font-semibold",
            newTraitName.trim()
              ? "bg-accent text-white hover:bg-accent/80"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          Add Layer
        </button>
      </div>

      {/* Trait type list */}
      {traitTypes.length === 0 && (
        <p className="text-xs text-white/30 text-center py-4">
          No trait types added yet. Add your first layer above.
        </p>
      )}

      <div className="flex flex-col gap-y-2">
        {sortedTraitTypes.map((tt, index) => (
            <div
              key={tt.id}
              draggable
              onDragStart={() => handleDragStart(tt.id)}
              onDragOver={(e) => handleDragOver(e, tt.id)}
              onDrop={(e) => handleDrop(e, tt.id)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => setDragOverId(null)}
              className={twMerge(
                "rounded border bg-white/5 overflow-hidden transition-colors",
                dragOverId === tt.id
                  ? "border-accent/50 bg-accent/5"
                  : "border-white/10"
              )}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5"
                onClick={() => toggleExpanded(tt.id)}
              >
                <div className="flex items-center gap-x-2">
                  <span
                    className="cursor-grab active:cursor-grabbing text-white/30 text-xs select-none"
                    title="Drag to reorder"
                  >
                    &#x2630;
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={tt.name}
                    onChange={(e) => onRenameTraitType(tt.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent text-xs font-semibold text-white outline-none border-b border-transparent focus:border-white/20"
                  />
                  <span className="text-[10px] text-white/30">
                    {tt.assets.length} assets
                  </span>
                </div>
                <div className="flex items-center gap-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTraitType(tt.id);
                    }}
                    className="text-[10px] text-red-400/60 hover:text-red-400"
                  >
                    Remove
                  </button>
                  <span className="text-white/30 text-xs">
                    {expandedTypes.has(tt.id) ? "\u25B2" : "\u25BC"}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {expandedTypes.has(tt.id) && (
                <div className="px-3 pb-3 border-t border-white/5">
                  <LayerUploadZone
                    assets={tt.assets}
                    selectedPool={getPool(tt.id)}
                    onSelectedPoolChange={(pool) =>
                      setSelectedPools((prev) => ({
                        ...prev,
                        [tt.id]: pool,
                      }))
                    }
                    onUpload={(files) =>
                      onUploadAssets(tt.id, files, getPool(tt.id))
                    }
                    onRemoveAsset={(assetId) => onRemoveAsset(tt.id, assetId)}
                    onUpdateWeight={(assetId, weight) =>
                      onUpdateWeight(tt.id, assetId, weight)
                    }
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default UploadLayers;

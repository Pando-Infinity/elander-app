import { sha1 } from "@noble/hashes/legacy.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
  WEIGHT_SEPARATOR,
  DNA_DELIMITER,
  MAX_DNA_COLLISION_RETRIES,
} from "@/const/nft-generation.const";
import {
  TraitAsset,
  TraitTypeConfig,
  RarityClassConfig,
  RarityPoolEnum,
  SelectedTrait,
  CollectionConfig,
  GeneratedNft,
  MetaplexMetadata,
} from "@/models/nft-generation.model";

/**
 * Parse trait filename to extract name and weight.
 * e.g., "BlueSky#2.png" → { name: "BlueSky", weight: 2 }
 * e.g., "RedHat.png" → { name: "RedHat", weight: 1 }
 */
export function parseTraitFilename(filename: string): {
  name: string;
  weight: number;
} {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const parts = nameWithoutExt.split(WEIGHT_SEPARATOR);
  if (parts.length > 1) {
    const weight = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(weight) && weight > 0) {
      return {
        name: parts.slice(0, -1).join(WEIGHT_SEPARATOR).trim(),
        weight,
      };
    }
  }
  return { name: nameWithoutExt.trim(), weight: 1 };
}

/**
 * Generate DNA hash from selected traits.
 */
export function generateDna(traits: SelectedTrait[]): string {
  const dnaString = traits
    .map((t) => `${t.traitType}:${t.traitName}:${t.rarityPool}`)
    .join(DNA_DELIMITER);
  return bytesToHex(sha1(new TextEncoder().encode(dnaString)));
}

/**
 * Weighted random selection from an array of assets.
 */
export function weightedRandomSelect(assets: TraitAsset[]): TraitAsset {
  const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
  let random = Math.random() * totalWeight;
  for (const asset of assets) {
    random -= asset.weight;
    if (random < 0) return asset;
  }
  return assets[assets.length - 1];
}

/**
 * Randomly assigns rarity pools to trait types based on traitMix counts.
 * Returns a { traitTypeName: RarityPool } mapping.
 * Ported from reference project's randomizeTraitSources().
 */
export function randomizeTraitSources(
  traitTypes: TraitTypeConfig[],
  traitMix: Record<string, number>
): Record<string, RarityPoolEnum> {
  const assignment: Record<string, RarityPoolEnum> = {};
  const poolSlots: RarityPoolEnum[] = [];

  for (const pool in traitMix) {
    for (let i = 0; i < traitMix[pool]; i++) {
      poolSlots.push(pool as RarityPoolEnum);
    }
  }

  // Fisher-Yates shuffle
  for (let i = poolSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolSlots[i], poolSlots[j]] = [poolSlots[j], poolSlots[i]];
  }

  const sortedTraitTypes = [...traitTypes].sort((a, b) => a.order - b.order);
  for (let i = 0; i < sortedTraitTypes.length; i++) {
    assignment[sortedTraitTypes[i].name] = poolSlots[i];
  }

  return assignment;
}

/**
 * Select traits for a single edition, respecting pool mixing and DNA uniqueness.
 * Returns null if unable to find unique combination after max retries.
 */
export function selectTraitsForEdition(
  traitTypes: TraitTypeConfig[],
  rarityClass: RarityClassConfig,
  existingDnas: Set<string>
): { traits: SelectedTrait[]; dna: string } | null {
  for (let attempt = 0; attempt < MAX_DNA_COLLISION_RETRIES; attempt++) {
    const traitSources = randomizeTraitSources(
      traitTypes,
      rarityClass.traitMix as unknown as Record<string, number>
    );

    const traits: SelectedTrait[] = [];
    let valid = true;

    const sortedTraitTypes = [...traitTypes].sort((a, b) => a.order - b.order);

    for (const traitType of sortedTraitTypes) {
      const sourcePool = traitSources[traitType.name];
      const poolAssets = traitType.assets.filter(
        (a) => a.rarityPool === sourcePool
      );

      if (poolAssets.length === 0) {
        valid = false;
        break;
      }

      const selected = weightedRandomSelect(poolAssets);
      traits.push({
        traitType: traitType.name,
        traitName: selected.name,
        assetId: selected.id,
        rarityPool: sourcePool,
      });
    }

    if (!valid) continue;

    const dna = generateDna(traits);
    if (!existingDnas.has(dna)) {
      return { traits, dna };
    }
  }

  return null;
}

/**
 * Build Metaplex-standard metadata for a generated NFT.
 */
export function buildMetaplexMetadata(
  nft: GeneratedNft,
  config: CollectionConfig,
  imageUri: string
): MetaplexMetadata {
  return {
    name: nft.name,
    symbol: config.symbol,
    description: config.description,
    seller_fee_basis_points: config.sellerFeeBasisPoints,
    image: imageUri,
    external_url: config.externalUrl,
    attributes: [
      { trait_type: "Rarity", value: nft.rarityClass },
      ...nft.traits.map((t) => ({
        trait_type: t.traitType,
        value: t.traitName,
      })),
    ],
    properties: {
      files: [{ uri: imageUri, type: "image/png" }],
      category: "image",
      creators: config.creators.map((c) => ({
        address: c.address,
        share: c.share,
      })),
    },
  };
}

/**
 * Validate generation config before starting.
 * Returns array of error messages (empty = valid).
 */
export function validateGenerationConfig(
  traitTypes: TraitTypeConfig[],
  rarityClasses: RarityClassConfig[]
): string[] {
  const errors: string[] = [];

  if (traitTypes.length === 0) {
    errors.push("At least one trait type is required.");
  }

  if (rarityClasses.length === 0) {
    errors.push("At least one rarity class is required.");
  }

  const totalSupply = rarityClasses.reduce((sum, rc) => sum + rc.supply, 0);
  if (totalSupply === 0) {
    errors.push("Total supply must be greater than 0.");
  }

  for (const rc of rarityClasses) {
    if (rc.supply <= 0) {
      errors.push(`Rarity class "${rc.name}" must have supply > 0.`);
    }

    const mixTotal = Object.values(rc.traitMix).reduce(
      (sum, count) => sum + count,
      0
    );
    if (mixTotal !== traitTypes.length) {
      errors.push(
        `Rarity class "${rc.name}" trait mix sum (${mixTotal}) must equal number of trait types (${traitTypes.length}).`
      );
    }

    // Check that all pools referenced in traitMix have assets
    for (const [pool, count] of Object.entries(rc.traitMix)) {
      if (count > 0) {
        for (const tt of traitTypes) {
          const poolAssets = tt.assets.filter(
            (a) => a.rarityPool === (pool as RarityPoolEnum)
          );
          if (poolAssets.length === 0) {
            errors.push(
              `Trait type "${tt.name}" has no assets in pool "${pool}" but rarity class "${rc.name}" requires it.`
            );
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Estimate maximum unique combinations for a given rarity class.
 */
export function estimateMaxUniqueCombinations(
  traitTypes: TraitTypeConfig[],
  rarityClass: RarityClassConfig
): number {
  // For each trait type, count assets across all pools used by this class
  // This is an upper bound — actual combinations depend on pool mixing randomization
  let combinations = 1;
  const usedPools = Object.entries(rarityClass.traitMix)
    .filter(([, count]) => count > 0)
    .map(([pool]) => pool as RarityPoolEnum);

  for (const tt of traitTypes) {
    const availableAssets = tt.assets.filter((a) =>
      usedPools.includes(a.rarityPool)
    );
    combinations *= Math.max(availableAssets.length, 1);
  }

  return combinations;
}

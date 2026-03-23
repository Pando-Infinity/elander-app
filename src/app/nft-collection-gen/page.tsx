"use client";

import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { WizardStepEnum, GenerationStatusEnum } from "@/models/nft-generation.model";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";
import useNftGeneration from "@/hooks/useNftGeneration";
import WizardStepper from "./_component/WizardStepper";
import UploadLayers from "./_component/UploadLayers";
import ConfigureCollection from "./_component/ConfigureCollection";
import ConfigureRarity from "./_component/ConfigureRarity";
import GeneratePreview from "./_component/GeneratePreview";
import DownloadExport from "./_component/DownloadExport";
import UploadIpfs from "./_component/UploadIpfs";
import NftCollectionGenNote from "./_component/NftCollectionGenNote";
import CommonDialog from "@/components/CommonDialog";
import { AlertCircleIcon } from "@/components/icons";

const NftCollectionGen = () => {
  const { logCustomEvent } = useFirebaseAnalytics();
  const [currentStep, setCurrentStep] = useState(WizardStepEnum.UPLOAD_LAYERS);
  const [isOpenNote, setIsOpenNote] = useState(false);

  useEffect(() => {
    logCustomEvent({ feature_name: "nft-collection-gen" }, "feature_opened");
  }, []);

  const {
    traitTypes,
    addTraitType,
    removeTraitType,
    renameTraitType,
    uploadAssetsForTraitType,
    reorderTraitTypes,
    removeAsset,
    updateAssetWeight,
    collectionConfig,
    setCollectionConfig,
    rarityClasses,
    setRarityClasses,
    previewCount,
    setPreviewCount,
    previewNfts,
    generatePreview,
    minPreviewCount,
    generateCollection,
    cancelGeneration,
    progress,
    generatedNfts,
    downloadAsZip,
    downloadChunk,
    uploadToIpfs,
    ipfsUploadProgress,
    ipfsResults,
    totalSupply,
    validationErrors,
  } = useNftGeneration();

  useEffect(() => {
    if (progress.status === GenerationStatusEnum.COMPLETE && generatedNfts.length > 0) {
      logCustomEvent({ count: generatedNfts.length }, "nft_generated");
    }
  }, [progress.status]);

  const canProceed = (step: WizardStepEnum): boolean => {
    switch (step) {
      case WizardStepEnum.UPLOAD_LAYERS:
        return (
          traitTypes.length > 0 &&
          traitTypes.every((tt) => tt.assets.length > 0)
        );
      case WizardStepEnum.CONFIGURE_COLLECTION:
        return Boolean(collectionConfig.name && collectionConfig.symbol);
      case WizardStepEnum.CONFIGURE_RARITY:
        return validationErrors.length === 0 && totalSupply > 0;
      case WizardStepEnum.GENERATE:
        return generatedNfts.length > 0;
      case WizardStepEnum.DOWNLOAD:
        return generatedNfts.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    // IPFS upload is disabled (coming soon) — Download is the last step
    if (currentStep < WizardStepEnum.DOWNLOAD) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > WizardStepEnum.UPLOAD_LAYERS) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case WizardStepEnum.UPLOAD_LAYERS:
        return (
          <UploadLayers
            traitTypes={traitTypes}
            onAddTraitType={addTraitType}
            onRemoveTraitType={removeTraitType}
            onRenameTraitType={renameTraitType}
            onReorderTraitTypes={reorderTraitTypes}
            onUploadAssets={uploadAssetsForTraitType}
            onRemoveAsset={removeAsset}
            onUpdateWeight={updateAssetWeight}
          />
        );
      case WizardStepEnum.CONFIGURE_COLLECTION:
        return (
          <ConfigureCollection
            config={collectionConfig}
            onChange={setCollectionConfig}
          />
        );
      case WizardStepEnum.CONFIGURE_RARITY:
        return (
          <ConfigureRarity
            rarityClasses={rarityClasses}
            traitTypes={traitTypes}
            onChange={setRarityClasses}
            validationErrors={validationErrors}
          />
        );
      case WizardStepEnum.GENERATE:
        return (
          <GeneratePreview
            previewCount={previewCount}
            minPreviewCount={minPreviewCount}
            previewNfts={previewNfts}
            progress={progress}
            validationErrors={validationErrors}
            totalSupply={totalSupply}
            onPreviewCountChange={setPreviewCount}
            onGeneratePreview={generatePreview}
            onGenerateCollection={generateCollection}
            onCancelGeneration={cancelGeneration}
          />
        );
      case WizardStepEnum.DOWNLOAD:
        return (
          <DownloadExport
            generatedNfts={generatedNfts}
            collectionName={collectionConfig.name}
            onDownloadAll={downloadAsZip}
            onDownloadChunk={downloadChunk}
          />
        );
      case WizardStepEnum.UPLOAD_IPFS:
        return (
          <UploadIpfs
            generatedNfts={generatedNfts}
            uploadProgress={ipfsUploadProgress}
            ipfsResults={ipfsResults}
            onUpload={uploadToIpfs}
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
          <h1 className="font-bold text-white">NFT Collection Generator</h1>
          <button className="sm:hidden" onClick={() => setIsOpenNote(true)}>
            <AlertCircleIcon />
          </button>
        </div>

        {/* Wizard stepper */}
        <div className="px-4 pt-3">
          <WizardStepper
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>

        {/* Step content */}
        <div className="flex flex-col p-4 sm:p-5 gap-y-3">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-4 pb-4 sm:px-5 sm:pb-5">
          <button
            onClick={handleBack}
            disabled={currentStep === WizardStepEnum.UPLOAD_LAYERS}
            className={twMerge(
              "px-4 py-2 rounded text-xs font-semibold",
              currentStep === WizardStepEnum.UPLOAD_LAYERS
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            Back
          </button>

          {currentStep < WizardStepEnum.DOWNLOAD && (
            <button
              onClick={handleNext}
              disabled={!canProceed(currentStep)}
              className={twMerge(
                "px-4 py-2 rounded text-xs font-semibold",
                canProceed(currentStep)
                  ? "bg-accent text-white hover:bg-accent/80"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden w-full sm:min-w-[406px] sm:w-[406px] sm:flex flex-col gap-y-5">
        <NftCollectionGenNote />
      </div>

      {/* Mobile note modal */}
      <CommonDialog
        dialogTitle=""
        isOpen={isOpenNote}
        onClose={() => setIsOpenNote(false)}
        contentClassName="p-0 border-none"
        closeIconClassName="right-3 top-3"
      >
        <NftCollectionGenNote className="pt-9" />
      </CommonDialog>
    </div>
  );
};

export default NftCollectionGen;

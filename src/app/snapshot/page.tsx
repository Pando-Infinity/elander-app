"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import {
  CheckIcon,
  CloseIcon,
  XCircleIcon,
  AlertCircleIcon,
} from "@/components/icons";

import {
  SnapshotDataInterface,
  SnapshotStatsInterface,
} from "@/models/app.model";

import { debounce } from "lodash";
import { twJoin, twMerge } from "tailwind-merge";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";

import UnLock from "@/components/Unlock";
import Loading from "@/components/Loading";
import useSnapshot from "@/hooks/useSnapshot";
import CommonInput from "@/components/CommonInput";
import SnapshotNote from "./_component/SnapshotNote";
import CommonDialog from "@/components/CommonDialog";
import CommonButton from "@/components/CommonButton";
import SnapshotError from "./_component/SnapshotError";
import CollectionItem from "./_component/CollectionItem";
import SnapshotSending from "./_component/SnapshotSending";
import SnapshotSuccess from "./_component/SnapshotSuccess";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

interface SnapshotInterface {
  total: number;
  royalty: number;
  owner: number;
  floorPrice: number;
}

const Snapshot = () => {
  const analytics = useFirebaseAnalytics();
  const { setIsOpenConnectWallet } = useAppStore();
  const { getCollectionInfo, snapshotByCollection } = useSnapshot();
  const { isHolderNft, isSeekerWallet, walletAddress } = useUserStore();

  const [isOpenNote, setIsOpenNote] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [snapshotStats, setSnapStats] = useState<SnapshotStatsInterface>(
    {} as SnapshotStatsInterface
  );
  const [collectionAddressStatus, setCollectionAddressStatus] = useState<
    CheckConnectionAddressEnum | undefined
  >(undefined);
  const [snapshotProgress, setSnapshotProgress] = useState<
    SnapshotStatusEnum | undefined
  >(undefined);

  const [snapshotData, setSnapshotData] = useState<SnapshotDataInterface>(
    {} as SnapshotDataInterface
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCheckCollection = useMemo(
    () =>
      debounce(async (collectionAddress: string) => {
        if (!collectionAddress) {
          setCollectionAddressStatus(undefined);
          setSnapStats({} as SnapshotInterface);
          return;
        }

        const res = await getCollectionInfo(collectionAddress);

        if (res) {
          setSnapStats(res);
          setCollectionAddressStatus(CheckConnectionAddressEnum.Correct);
        } else {
          setCollectionAddressStatus(CheckConnectionAddressEnum.Incorrect);
        }
      }, 300),
    [getCollectionInfo]
  );

  const handleSnapshot = async () => {
    setIsOpenDialog(true);
    setSnapshotProgress(SnapshotStatusEnum.PROCESSING);

    const res = await snapshotByCollection(collectionAddress);

    if (res) {
      setSnapshotData(res);
      setSnapshotProgress(SnapshotStatusEnum.SUCCESS);
    } else {
      setSnapshotProgress(SnapshotStatusEnum.ERROR);
    }
  };

  const renderSuffixInput = () => {
    if (!collectionAddress) return <Fragment />;

    if (collectionAddressStatus === CheckConnectionAddressEnum.Checking)
      return (
        <Loading className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2" />
      );

    if (collectionAddressStatus === CheckConnectionAddressEnum.Incorrect)
      return (
        <XCircleIcon className="w-6 h-6 absolute right-3 top-1/2 -translate-y-1/2 text-[#F34E4E]" />
      );

    if (collectionAddressStatus === CheckConnectionAddressEnum.Correct)
      return (
        <CheckIcon className="w-6 h-6 absolute right-3 top-1/2 -translate-y-1/2 text-[#31E200]" />
      );

    return <Fragment />;
  };

  useEffect(() => {
    analytics.logNavigationButtonAction(
      { screen_name: "snapshot" },
      "screen_view"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-x-[42px] gap-y-4 pt-12 sm:pt-0 items-start sm:justify-between">
      <div
        className={twMerge(
          "w-full mx-auto",
          "flex flex-col",
          "rounded-xl overflow-hidden",
          "bg-[#232323] border border-white/20"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-white/20">
          <p className="font-bold text-white">Snapshot</p>
          <div className="flex items-center gap-x-2">
            <UnLock />
            <button className="sm:hidden" onClick={() => setIsOpenNote(true)}>
              <AlertCircleIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-col p-4 sm:p-5 gap-y-3">
          <p className="text-sm font-medium">Collection address</p>
          <div className="flex flex-col items-center gap-y-3">
            <CommonInput
              placeholder="Enter collection address"
              wrapperClassName="w-full"
              className="w-full !text-sm !pr-[52px] h-12"
              value={collectionAddress}
              onChange={(e) => {
                const value = e.target.value;
                setCollectionAddressStatus(CheckConnectionAddressEnum.Checking);
                setCollectionAddress(value);
                handleCheckCollection(value);
              }}
              suffix={renderSuffixInput()}
              isError={Boolean(
                collectionAddress &&
                  collectionAddressStatus ===
                    CheckConnectionAddressEnum.Incorrect
              )}
              isSuccess={Boolean(
                collectionAddress &&
                  collectionAddressStatus === CheckConnectionAddressEnum.Correct
              )}
            />
            {collectionAddress &&
            collectionAddressStatus === CheckConnectionAddressEnum.Incorrect ? (
              <p className="text-xs text-[#F34E4E]/60">
                The information is incorrect. Please check again.
              </p>
            ) : (
              <Fragment />
            )}
          </div>

          <div className="p-3 sm:p-4 rounded bg-[#2E2E2E] flex flex-col gap-y-2 mb-10 sm:mb-6">
            <CollectionItem
              label="Name"
              value={
                snapshotStats.collectionName ||
                snapshotStats.collectionSymbol ||
                "N/A"
              }
            />
            <CollectionItem
              label="Total Owner"
              value={snapshotStats.owner || 0}
            />
            <CollectionItem
              label="Total Supply"
              value={snapshotStats.total || 0}
            />
          </div>

          {walletAddress ? (
            <CommonButton
              onClick={handleSnapshot}
              disabled={
                !collectionAddress ||
                collectionAddressStatus !==
                  CheckConnectionAddressEnum.Correct ||
                (!isHolderNft && !isSeekerWallet)
              }
            >
              Snapshot
            </CommonButton>
          ) : (
            <CommonButton onClick={() => setIsOpenConnectWallet(true)}>
              Connect wallet
            </CommonButton>
          )}
        </div>
      </div>

      <div className="hidden w-full sm:min-w-[406px] sm:w-[406px] sm:flex flex-col gap-y-5">
        <SnapshotNote />
      </div>

      <CommonDialog
        dialogTitle=""
        isOpen={isOpenNote}
        onClose={() => setIsOpenNote(false)}
        contentClassName="p-0 border-none"
        closeIconClassName="right-3 top-3"
      >
        <SnapshotNote className="pt-9" />
      </CommonDialog>

      <CommonDialog
        isOpen={isOpenDialog}
        onClose={() => setIsOpenDialog(false)}
        isShowIconClose={false}
        contentClassName="p-0 border-white/20 bg-[#1B1B1B] rounded-lg"
      >
        <div
          className={twJoin(
            " p-4 relative",

            snapshotProgress === SnapshotStatusEnum.PROCESSING
              ? "bg-[radial-gradient(73.08%_62.57%_at_50.15%_100%,rgba(244,67,25,0.3)_0%,rgba(244,67,25,0)_100%)]"
              : ""
          )}
        >
          <button
            className="absolute top-5 right-5 cursor-pointer"
            onClick={() => setIsOpenDialog(false)}
          >
            <CloseIcon className="w-6 h-6 text-[#6B7280]" />
          </button>
          {snapshotProgress === SnapshotStatusEnum.PROCESSING ? (
            <SnapshotSending />
          ) : snapshotProgress === SnapshotStatusEnum.SUCCESS ? (
            <SnapshotSuccess snapshotData={snapshotData} />
          ) : (
            <SnapshotError />
          )}
        </div>
      </CommonDialog>
    </div>
  );
};

export default Snapshot;

enum CheckConnectionAddressEnum {
  Checking = "checking",
  Incorrect = "incorrect",
  Correct = "correct",
}

enum SnapshotStatusEnum {
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

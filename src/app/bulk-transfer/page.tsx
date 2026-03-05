/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";

import { AppConstant } from "@/const";
import { twJoin } from "tailwind-merge";
import { BlockchainUtils } from "@/utils";
import { retry } from "@/utils/common.utils";
import { CloseIcon } from "@/components/icons";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";
import { userService } from "@/services/user-service";
import { BulkTransferInterface } from "@/models/app.model";
import { validateSolWalletAddress } from "@/utils/blockchain.utils";
import { BlockchainTransactionStatusEnum } from "@/models/common.model";
import { usePreventNavigation } from "@/hooks/common-hooks/usePreventNavigation";

import BulkNote from "./_component/BulkNote";
import CommonInput from "@/components/CommonInput";
import CommonButton from "@/components/CommonButton";
import CommonDialog from "@/components/CommonDialog";
import useBulkTransfer from "@/hooks/useBulkTransfer";
import ConfirmTransfer from "./_component/ConfirmTransfer";
import BulkTransferError from "./_component/BulkTransferError";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";
import useSolanaTransaction from "@/hooks/useSolanaTransaction";
import BulkTransferSending from "./_component/BulkTransferSending";
import BulkTransferSuccess from "./_component/BulkTransferSuccess";
import SelectTokenTransfer from "./_component/SelectTokenTransfer";

const BulkTransfer = () => {
  const analytics = useFirebaseAnalytics();
  const { setIsOpenConnectWallet } = useAppStore();
  const { walletAddress, isHolderNft, isSeekerWallet } = useUserStore();

  const { handleCreateBulkTransferTransaction } = useBulkTransfer();
  const { handleSendSolanaTransaction, getTransactionResult } =
    useSolanaTransaction();

  const [receiver, setReceiver] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<BulkTransferInterface[]>(
    []
  );
  const [bulkTransferProgress, setBulkTransferProgress] = useState<
    BulkTransferStatusEnum | undefined
  >(undefined);
  const [transferTxHash, setTransferTxHash] = useState("");

  const [transferError, setTransferError] = useState("");

  usePreventNavigation({
    when: bulkTransferProgress === BulkTransferStatusEnum.PROCESSING,
  });

  const analyticsData = useMemo(() => {
    if (!receiver || !walletAddress) return {};
    const senderIdHashed = BlockchainUtils.hashWalletAddressToUUID(
      walletAddress || ""
    );
    const receiverIdHashed = BlockchainUtils.hashWalletAddressToUUID(
      receiver || ""
    );
    return {
      sender_id_hashed: senderIdHashed,
      receiver_id_hashed: receiverIdHashed,
      token_transfer_count: selectedTokens.length,
    };
  }, [walletAddress, selectedTokens, receiver]);

  const incorrectAddress = useMemo(() => {
    return (
      receiver &&
      (!validateSolWalletAddress(receiver) || walletAddress === receiver)
    );
  }, [receiver, walletAddress]);

  const isDisableConfirm = useMemo(() => {
    return (
      !receiver ||
      (!isHolderNft && !isSeekerWallet) ||
      selectedTokens.length === 0 ||
      selectedTokens.some(
        (item) => item.transferAmount === 0 || item.amount < item.transferAmount
      )
    );
  }, [selectedTokens, receiver, isHolderNft, isSeekerWallet]);

  const bulkTransferFee = useMemo(() => {
    if (selectedTokens.length === 0) return 0;

    return (
      selectedTokens.length * AppConstant.BULK_TRANSFER_RENT_FEE +
      AppConstant.TRANSFER_FEE
    );
  }, [selectedTokens]);

  const handleReset = () => {
    setSelectedTokens([]);
    setReceiver("");
    setSearchQuery("");
  };

  const handleConfirm = async () => {
    if (!walletAddress) return;
    setBulkTransferProgress(BulkTransferStatusEnum.PROCESSING);

    analytics.logBulkTransferAction(
      {
        ...analyticsData,
      },
      "bulk_transfer_initiated"
    );

    try {
      const transaction = await handleCreateBulkTransferTransaction(
        receiver,
        walletAddress,
        selectedTokens
      );

      if (transaction?.errorMessage || !transaction?.transaction) {
        setTransferError(transaction?.errorMessage);
        setBulkTransferProgress(BulkTransferStatusEnum.ERROR);
        return;
      }

      const tx = await handleSendSolanaTransaction(transaction?.transaction);

      if (tx.messageError) {
        setTransferError(tx?.messageError);
        setBulkTransferProgress(BulkTransferStatusEnum.ERROR);
        analytics.logBulkTransferAction(
          {
            ...analyticsData,
            success: false,
            error_message: tx?.messageError,
          },
          "bulk_transfer_failure"
        );
        return;
      }

      const finalStatus = await retry(
        async () => {
          const status = await getTransactionResult(tx.txHash);

          if (
            status === BlockchainTransactionStatusEnum.SUCCESS ||
            status === BlockchainTransactionStatusEnum.FAILED
          ) {
            return status;
          } else {
            throw new Error("Transaction failed or timed out");
          }
        },
        2000,
        10
      );

      if (finalStatus === BlockchainTransactionStatusEnum.SUCCESS) {
        await userService.getAllTokenBalances(walletAddress);
        setTransferTxHash(tx.txHash);
        setBulkTransferProgress(BulkTransferStatusEnum.SUCCESS);
        analytics.logBulkTransferAction(
          {
            ...analyticsData,
            success: true,
          },
          "bulk_transfer_success"
        );
      } else {
        setTransferError("Transaction failed or timed out");
        setBulkTransferProgress(BulkTransferStatusEnum.ERROR);
        analytics.logBulkTransferAction(
          {
            ...analyticsData,
            success: false,
            error_message: "Transaction failed or timed out",
          },
          "bulk_transfer_failure"
        );
      }
    } catch (error: any) {
      console.log("error", error);
      setTransferError(error.message);
      setBulkTransferProgress(BulkTransferStatusEnum.ERROR);
      analytics.logBulkTransferAction(
        {
          ...analyticsData,
          success: false,
          error_message: error.message,
        },
        "bulk_transfer_failure"
      );
    }
  };

  const handleClose = () => {
    setIsOpenDialog(false);

    if (bulkTransferProgress === BulkTransferStatusEnum.SUCCESS) {
      setBulkTransferProgress(undefined);
    }
  };

  useEffect(() => {
    analytics.logNavigationButtonAction(
      { screen_name: "bulk_transfer" },
      "screen_view"
    );
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-x-[42px] gap-y-4 pt-4 sm:pt-0 items-start sm:justify-between">
      <SelectTokenTransfer
        searchQuery={searchQuery}
        selectedTokens={selectedTokens}
        onSearchQuery={(value) => setSearchQuery(value)}
        onSelectTokens={(value) => setSelectedTokens(value)}
      />

      <div className="w-full sm:min-w-[407px] sm:w-[407px] flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-3 p-4 sm:p-5 border border-white/20 bg-[#14141480] rounded-lg">
          <p className="text-sm font-medium">Address</p>
          <div className="flex flex-col gap-y-1">
            <CommonInput
              value={receiver}
              isError={incorrectAddress || false}
              className="w-full !text-xs"
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Enter address"
            />

            {incorrectAddress && (
              <p className="text-xs text-[#F34E4E99]">Incorrect address</p>
            )}
          </div>
          <div className="flex items-center gap-x-3">
            <CommonButton
              variant="secondary"
              className="h-10"
              onClick={handleReset}
            >
              Reset
            </CommonButton>

            {walletAddress ? (
              <CommonButton
                className="w-full h-10"
                disabled={isDisableConfirm}
                onClick={() => {
                  setBulkTransferProgress(BulkTransferStatusEnum.CONFIRM);
                  setIsOpenDialog(true);
                }}
              >
                Confirm
              </CommonButton>
            ) : (
              <CommonButton
                className="w-full h-10"
                onClick={() => setIsOpenConnectWallet(true)}
              >
                Connect wallet
              </CommonButton>
            )}
          </div>
        </div>

        <BulkNote className="hidden sm:flex" />
      </div>

      <CommonDialog
        isOpen={isOpenDialog}
        onClose={() => {
          if (bulkTransferProgress === BulkTransferStatusEnum.PROCESSING)
            return;
          handleClose();
        }}
        isShowIconClose={false}
        contentClassName="p-0 border-white/20 bg-[#1B1B1B] rounded-lg"
      >
        <div
          className={twJoin(
            " p-4 relative",
            bulkTransferProgress === BulkTransferStatusEnum.CONFIRM ||
              bulkTransferProgress === BulkTransferStatusEnum.PROCESSING
              ? "bg-[radial-gradient(73.08%_62.57%_at_50.15%_100%,rgba(244,67,25,0.3)_0%,rgba(244,67,25,0)_100%)]"
              : ""
          )}
        >
          {bulkTransferProgress !== BulkTransferStatusEnum.PROCESSING ? (
            <button
              className="absolute top-5 right-5 cursor-pointer"
              onClick={handleClose}
            >
              <CloseIcon className="w-6 h-6 text-[#6B7280]" />
            </button>
          ) : (
            <Fragment />
          )}
          {bulkTransferProgress === BulkTransferStatusEnum.CONFIRM ? (
            <ConfirmTransfer
              fee={bulkTransferFee}
              receiver={receiver}
              selectedTokens={selectedTokens}
              onConfirm={handleConfirm}
            />
          ) : bulkTransferProgress === BulkTransferStatusEnum.PROCESSING ? (
            <BulkTransferSending />
          ) : bulkTransferProgress === BulkTransferStatusEnum.SUCCESS ? (
            <BulkTransferSuccess
              fee={bulkTransferFee}
              receiver={receiver}
              transferTxHash={transferTxHash}
              bulkTransferList={selectedTokens}
            />
          ) : (
            <BulkTransferError errorMessage={transferError} />
          )}
        </div>
      </CommonDialog>
    </div>
  );
};

export default BulkTransfer;

export enum BulkTransferStatusEnum {
  CONFIRM = "CONFIRM",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

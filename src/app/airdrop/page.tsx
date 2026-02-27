/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { AppConstant } from "@/const";
import { BlockchainUtils } from "@/utils";
import { retry } from "@/utils/common.utils";
import { twJoin, twMerge } from "tailwind-merge";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";
import { userService } from "@/services/user-service";
import { WalletBalanceInterface } from "@/models/app.model";
import { AlertCircleIcon, CloseIcon } from "@/components/icons";
import { validateSolWalletAddress } from "@/utils/blockchain.utils";
import { BlockchainTransactionStatusEnum } from "@/models/common.model";
import { usePreventNavigation } from "@/hooks/common-hooks/usePreventNavigation";

import UnLock from "@/components/Unlock";
import useAirdrop from "@/hooks/useAirdrop";
import EnterList from "./component/EnterList";
import UploadCsv from "./component/UploadCsv";
import AirdropNote from "./component/AirdropNote";
import SelectToken from "./component/SelectToken";
import AirdropError from "./component/AirdropError";
import CommonDialog from "@/components/CommonDialog";
import CommonButton from "@/components/CommonButton";
import ConfirmAirdrop from "./component/ConfirmAirdrop";
import AirdropSending from "./component/AirdropSending";
import AirdropSuccess from "./component/AirdropSuccess";
import useSolanaTransaction from "@/hooks/useSolanaTransaction";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";
import AirdropTabs, { AirdropTabEnum } from "./component/AirdropTabs";

export interface AirdropInterface {
  address: string;
  amount: string;
}

export interface CsvRow {
  address: string;
  amount: string;
  lineNumber: number;
}

export interface AirdropSuccessInterface {
  address: string;
  amount: string;
  signature: string;
}

const Airdrop = () => {
  const analytics = useFirebaseAnalytics();
  const { setIsOpenConnectWallet } = useAppStore();
  const { isHolderNft, isSeekerWallet, walletAddress } = useUserStore();

  const {
    handleTransferByStealthWallet,
    handleTransferBalanceToStealthWallet,
  } = useAirdrop();
  const {
    getTransactionResult,
    handleSendSolanaTransaction,
    handleSendTransactionByStealthWallet,
  } = useSolanaTransaction();

  const [isOpenNote, setIsOpenNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [airDropListByString, setAirDropListByString] = useState("");
  const [selectedTab, setSelectedTab] = useState(AirdropTabEnum.UploadCSV);
  const [selectedToken, setSelectedToken] = useState<WalletBalanceInterface>(
    {} as WalletBalanceInterface
  );
  const [airDropListByArray, setAirDropListByArray] = useState<
    AirdropInterface[]
  >([]);
  const [airdropProgress, setAirdropProgress] = useState<
    AirdropStatusEnum | undefined
  >(undefined);

  const [airdropError, setAirdropError] = useState("");

  const [successfulAirdropCount, setSuccessfulAirdropCount] = useState(0);
  const [airdropSucessData, setAirdropSucessData] = useState<
    AirdropSuccessInterface[]
  >([]);

  const totalAmountAirdrop = useMemo(() => {
    if (airDropListByArray.length === 0) return 0;

    return airDropListByArray.reduce(
      (sum, current) => sum + Number(current.amount),
      0
    );
  }, [airDropListByArray]);

  const analyticsData = useMemo(() => {
    if (!walletAddress) return {};
    const senderIdHashed = BlockchainUtils.hashWalletAddressToUUID(
      walletAddress || ""
    );

    return {
      sender_id_hashed: senderIdHashed,
      total_amount: totalAmountAirdrop,
      token: selectedToken.symbol,
      total_addresses: airDropListByArray.length,
    };
  }, [walletAddress, totalAmountAirdrop, airDropListByArray, selectedToken]);

  const { totalFee, airdropFee } = useMemo(() => {
    const transferFee =
      AppConstant.TRANSFER_FEE +
      AppConstant.BULK_TRANSFER_RENT_FEE +
      AppConstant.PRIORITY_FEE;

    const transferStealthWalletFee = transferFee;

    const airdropFee = transferFee * airDropListByArray.length;

    const totalFee = transferStealthWalletFee + airdropFee;
    return {
      totalFee,
      airdropFee,
    };
  }, [airDropListByArray]);

  usePreventNavigation({
    when: airdropProgress === AirdropStatusEnum.PROCESSING,
  });

  const handleSelectTab = (value: AirdropTabEnum) => {
    setSelectedTab(value);
    setErrorMessage("");
    setAirDropListByString("");
    setAirDropListByArray([]);
  };

  const handleConvertStringToCsv = (csvString: string) => {
    const errors: string[] = [];
    const parsed: CsvRow[] = [];

    const lines = csvString.split("\n").filter((line) => line.trim());

    lines.forEach((line, index) => {
      const [address, amount] = line.split(",").map((item) => item.trim());

      if (!address || !amount) {
        errors.push(`Line ${index + 1}: Missing address or amount`);
        return;
      }

      if (!validateSolWalletAddress(address)) {
        errors.push(`Line ${index + 1}: Invalid Solana address format`);
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        errors.push(`Line ${index + 1}: Amount must be a positive number`);
        return;
      }

      parsed.push({
        address,
        amount: numAmount.toString(),
        lineNumber: index + 1,
      });
    });

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    } else {
      setErrorMessage("");
    }

    return parsed;
  };

  const handleConfirm = async () => {
    if (!walletAddress || totalAmountAirdrop === 0) return;
    setAirdropProgress(AirdropStatusEnum.PROCESSING);
    analytics.logAirdropAction({ ...analyticsData }, "airdrop_initiated");
    try {
      const transferTransaction = await handleTransferBalanceToStealthWallet(
        walletAddress,
        selectedToken,
        totalAmountAirdrop,
        airdropFee
      );

      if (
        transferTransaction?.errorMessage ||
        !transferTransaction?.transaction
      ) {
        setAirdropError(transferTransaction?.errorMessage);
        setAirdropProgress(AirdropStatusEnum.ERROR);
        analytics.logAirdropAction(
          {
            ...analyticsData,
            success: false,
            error_message: transferTransaction?.errorMessage,
          },
          "airdrop_failure"
        );
        return;
      }

      const tx = await handleSendSolanaTransaction(
        transferTransaction?.transaction
      );

      if (tx.messageError) {
        setAirdropError(tx?.messageError);
        setAirdropProgress(AirdropStatusEnum.ERROR);
        analytics.logAirdropAction(
          {
            ...analyticsData,
            success: false,
            error_message: tx?.messageError,
          },
          "airdrop_failure"
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
        await handleAirdropByStealthWallet();
      } else {
        setAirdropProgress(AirdropStatusEnum.ERROR);
        analytics.logAirdropAction(
          {
            ...analyticsData,
            success: false,
            error_message: "Transaction failed or timed out",
          },
          "airdrop_failure"
        );
      }
    } catch (error: any) {
      setAirdropProgress(AirdropStatusEnum.ERROR);
      setAirdropError(error?.message);
      console.log("error", error);
      analytics.logAirdropAction(
        {
          ...analyticsData,
          success: false,
          error_message: error?.message,
        },
        "airdrop_failure"
      );
    }
  };

  const handleAirdropByStealthWallet = async () => {
    if (!walletAddress) return;
    let count = 0;
    let error = "";
    const airdropSuccessData = [];
    try {
      for (const airdrop of airDropListByArray) {
        const airdropTransaction = await handleTransferByStealthWallet(
          airdrop.address,
          selectedToken,
          Number(airdrop.amount)
        );

        if (
          airdropTransaction?.errorMessage ||
          !airdropTransaction?.transaction
        ) {
          setAirdropError(airdropTransaction?.errorMessage);
          setAirdropProgress(AirdropStatusEnum.ERROR);
          analytics.logAirdropAction(
            {
              ...analyticsData,
              success: false,
              error_message: airdropTransaction?.errorMessage,
            },
            "airdrop_failure"
          );
          return;
        }

        const txHash = await retry(
          async () => {
            const tx = await handleSendTransactionByStealthWallet(
              walletAddress,
              airdropTransaction.transaction
            );

            if (tx.txHash) {
              return tx.txHash;
            } else {
              throw new Error("Transaction failed or timed out");
            }
          },
          1000,
          10
        );

        const finalStatus = await retry(
          async () => {
            const status = await getTransactionResult(txHash, "confirmed");

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
          setSuccessfulAirdropCount(count + 1);
          count = count + 1;
          airdropSuccessData.push({ ...airdrop, signature: txHash });
        } else {
          error = error + `Airdrop to ${airdrop.address} error\n`;
        }
      }

      if (!error) {
        await userService.getAllTokenBalances(walletAddress);
        setAirdropProgress(AirdropStatusEnum.SUCCESS);
        setSuccessfulAirdropCount(0);
        setAirdropSucessData(airdropSuccessData);
        analytics.logAirdropAction(
          {
            ...analyticsData,
            success: true,
          },
          "airdrop_success"
        );
      } else {
        setAirdropProgress(AirdropStatusEnum.ERROR);
        setAirdropError(error);
        analytics.logAirdropAction(
          {
            ...analyticsData,
            success: false,
            error_message: error,
          },
          "airdrop_failure"
        );
      }
    } catch (error: any) {
      setAirdropProgress(AirdropStatusEnum.ERROR);
      setAirdropError(error?.message);
      console.log("error", error);
      analytics.logAirdropAction(
        {
          ...analyticsData,
          success: false,
          error_message: error?.message,
        },
        "airdrop_failure"
      );
    }
  };

  useEffect(() => {
    if (!airDropListByString) return;
    const res = handleConvertStringToCsv(airDropListByString);

    if (res) {
      setAirDropListByArray(res);
    } else {
      setAirDropListByArray([]);
    }
  }, [airDropListByString]);

  useEffect(() => {
    if (selectedToken.amount < totalAmountAirdrop) {
      setErrorMessage("Insufficient Balance");
    } else {
      setErrorMessage("");
    }
  }, [selectedToken, totalAmountAirdrop]);

  useEffect(() => {
    analytics.logNavigationButtonAction(
      { screen_name: "airdrop" },
      "screen_view"
    );
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-x-[42px] gap-y-4 pt-4 sm:pt-0 items-start sm:justify-between">
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
          <p className="text-sm font-medium">Choose Token</p>

          <SelectToken
            selectedToken={selectedToken}
            onSelectToken={(value) => setSelectedToken(value)}
          />

          <div className="mt-3 mb-15 flex flex-col gap-y-3">
            <AirdropTabs
              selectedTabs={selectedTab}
              onSelectTab={(value) => {
                handleSelectTab(value);
                analytics.logNavigationButtonAction(
                  { button_name: `${value} airdrop` },
                  "button_click"
                );
              }}
            />

            {selectedTab === AirdropTabEnum.UploadCSV ? (
              <UploadCsv
                airDropListByArray={airDropListByArray}
                airDropListByString={airDropListByString}
                onAirDropListByString={(value) => setAirDropListByString(value)}
                errorMessage={errorMessage}
                onErrorMessage={(value) => setErrorMessage(value)}
              />
            ) : (
              <EnterList
                airDropListByArray={airDropListByArray}
                airDropListByString={airDropListByString}
                onAirDropListByString={(value) => setAirDropListByString(value)}
                errorMessage={errorMessage}
              />
            )}
          </div>

          {walletAddress ? (
            <CommonButton
              disabled={
                !airDropListByString ||
                Boolean(errorMessage) ||
                !selectedToken.symbol ||
                (!isHolderNft && !isSeekerWallet)
              }
              onClick={() => {
                setAirdropProgress(AirdropStatusEnum.CONFIRM);
                setIsOpenDialog(true);
              }}
            >
              Comfirm
            </CommonButton>
          ) : (
            <CommonButton onClick={() => setIsOpenConnectWallet(true)}>
              Connect wallet
            </CommonButton>
          )}
        </div>
      </div>

      <div className="hidden w-full sm:min-w-[406px] sm:w-[406px] sm:flex flex-col gap-y-5">
        <AirdropNote />
      </div>

      <CommonDialog
        dialogTitle=""
        isOpen={isOpenNote}
        onClose={() => setIsOpenNote(false)}
        contentClassName="p-0 border-none"
        closeIconClassName="right-3 top-3"
      >
        <AirdropNote className="pt-9" />
      </CommonDialog>

      <CommonDialog
        isOpen={isOpenDialog}
        onClose={() => {
          if (airdropProgress === AirdropStatusEnum.PROCESSING) return;
          setIsOpenDialog(false);
        }}
        isShowIconClose={false}
        contentClassName="p-0 border-white/20 bg-[#1B1B1B] rounded-lg"
      >
        <div
          className={twJoin(
            " p-4 relative",
            airdropProgress === AirdropStatusEnum.CONFIRM ||
              airdropProgress === AirdropStatusEnum.PROCESSING
              ? "bg-[radial-gradient(73.08%_62.57%_at_50.15%_100%,rgba(244,67,25,0.3)_0%,rgba(244,67,25,0)_100%)]"
              : ""
          )}
        >
          {airdropProgress !== AirdropStatusEnum.PROCESSING ? (
            <button
              className="absolute top-5 right-5 cursor-pointer"
              onClick={() => setIsOpenDialog(false)}
            >
              <CloseIcon className="w-6 h-6 text-[#6B7280]" />
            </button>
          ) : (
            <Fragment />
          )}
          {airdropProgress === AirdropStatusEnum.CONFIRM ? (
            <ConfirmAirdrop
              fee={totalFee}
              airDropListByArray={airDropListByArray}
              token={selectedToken.symbol}
              totalAmount={totalAmountAirdrop}
              onConfirm={handleConfirm}
            />
          ) : airdropProgress === AirdropStatusEnum.PROCESSING ? (
            <AirdropSending
              successfulAirdropCount={successfulAirdropCount}
              total={airDropListByArray.length}
            />
          ) : airdropProgress === AirdropStatusEnum.SUCCESS ? (
            <AirdropSuccess
              airdropData={airdropSucessData}
              fee={totalFee}
              token={selectedToken.symbol}
              totalAmount={totalAmountAirdrop}
            />
          ) : (
            <AirdropError errorMessage={airdropError} />
          )}
        </div>
      </CommonDialog>
    </div>
  );
};

export default Airdrop;

export enum AirdropStatusEnum {
  CONFIRM = "CONFIRM",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

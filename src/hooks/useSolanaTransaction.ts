/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Connection,
  Transaction,
  VersionedTransaction,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";

import { toLower } from "lodash";
import { useCallback } from "react";
import { web3 } from "@coral-xyz/anchor";
import { BlockchainUtils } from "@/utils";
import { retry } from "@/utils/common.utils";
import { useUserStore } from "@/stores/user.store";
import { useWallet } from "@solana/wallet-adapter-react";
import { USER_REJECTED_MESSAGE } from "@/const/app.const";
import { getSolanaRpcEndpoint } from "@/utils/blockchain.utils";
import { BlockchainTransactionStatusEnum } from "@/models/common.model";

const useSolanaTransaction = () => {
  const { connectSignature } = useUserStore();
  const { connected, signTransaction, signAllTransactions } = useWallet();

  const handleSendSolanaTransaction = async (
    transactionData: web3.Transaction | web3.Transaction[]
  ) => {
    let res;

    if (Array.isArray(transactionData)) {
      res = await handleSendSolTransactions(transactionData);
    } else {
      res = await handleSendSolTransaction(transactionData);
    }

    return res as ResSendSolanaTransactionInterface;
  };

  const waitToTransactionConfirm = useCallback(
    async (txHash: string) => {
      const rpcEndpoint = getSolanaRpcEndpoint();
      const connection = new Connection(rpcEndpoint, "confirmed");
      const latestBlockHash = await connection.getLatestBlockhash();

      const confirmation = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txHash,
      });
      return confirmation;
    },
    [connected]
  );

  const handleSendSolTransaction = useCallback(
    async (transactionData: any) => {
      try {
        if (!transactionData || !signTransaction)
          return {} as ResSendSolanaTransactionInterface;
        const connection = await BlockchainUtils.getConnection();

        const simulationResult = await simulateAndValidate(
          connection,
          transactionData
        );

        if (simulationResult?.messageError) {
          return {
            txHash: "",
            messageError: simulationResult.messageError,
          };
        }

        const signedTransaction = await signTransaction(transactionData);

        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );

        return {
          txHash: signature,
          messageError: "",
        };
      } catch (error: any) {
        console.log("error", error.message);

        const message = MESSAGE_USER_REJECTED_SUI_ERROR.includes(error.message)
          ? USER_REJECTED_MESSAGE
          : error.message;

        return {
          txHash: "",
          messageError: message,
        } as ResSendSolanaTransactionInterface;
      }
    },
    [signTransaction]
  );

  const handleSendSolTransactions = useCallback(
    async (transactionsData: any) => {
      if (!Array.isArray(transactionsData) || !signAllTransactions)
        return {} as ResSendSolanaTransactionInterface;

      const transactionData = transactionsData as web3.Transaction[];

      try {
        const rpcEndpoint = getSolanaRpcEndpoint();

        const connection = new web3.Connection(rpcEndpoint, "finalized");

        /**
         * Just simulate first transaction cause if another account depend on the first transaction to create the simulation will fail
         */
        const simulationResult = await simulateAndValidate(
          connection,
          transactionData[0]
        );

        if (simulationResult?.messageError) {
          return {
            txHash: "",
            messageError: simulationResult.messageError,
          };
        }

        const listTxHash = [];

        const txs = await signAllTransactions(transactionData);

        for (const tx of txs) {
          const serializeTx = tx.serialize();

          const txHash = await sendAndConfirmRawTransaction(
            connection,
            serializeTx,
            {
              skipPreflight: true,
              commitment: "confirmed",
            }
          );

          listTxHash.push(txHash);
        }

        return {
          txHash: listTxHash[listTxHash.length - 1],
          messageError: "",
        } as ResSendSolanaTransactionInterface;
      } catch (error: any) {
        console.log(error);

        const message = MESSAGE_USER_REJECTED_SUI_ERROR.includes(error.message)
          ? USER_REJECTED_MESSAGE
          : error.message;

        return {
          txHash: "",
          messageError: message,
        } as ResSendSolanaTransactionInterface;
      }
    },
    [signAllTransactions]
  );

  const getTransactionResult = async (
    txHash: string,
    commitment = "finalized"
  ) => {
    if (!txHash) return BlockchainTransactionStatusEnum.FAILED;

    try {
      const connection = await BlockchainUtils.getConnection();

      const result = await connection.getSignatureStatus(txHash, {
        searchTransactionHistory: true,
      });

      const status = result.value?.confirmationStatus;
      const error = result.value?.err;

      if (error) {
        return BlockchainTransactionStatusEnum.FAILED;
      }

      if (!result?.value) {
        return BlockchainTransactionStatusEnum.LOADING;
      }

      if (status === commitment) {
        return BlockchainTransactionStatusEnum.SUCCESS;
      } else {
        return BlockchainTransactionStatusEnum.LOADING;
      }
    } catch (error) {
      console.log(error);

      return BlockchainTransactionStatusEnum.FAILED;
    }
  };

  const handleSendTransactionByStealthWallet = async (
    walletAddress: string,
    transaction: web3.Transaction
  ) => {
    try {
      if (!connectSignature) {
        return {
          txHash: "",
          messageError: "Somethings went wrong, reconnect please!!!",
        };
      }
      const stealthWalletKeypair = BlockchainUtils.generateStealthWallet(
        walletAddress,
        connectSignature
      );

      const connection = await BlockchainUtils.getConnection();

      transaction.sign(stealthWalletKeypair);

      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      return {
        txHash: signature,
        messageError: "",
      } as ResSendSolanaTransactionInterface;
    } catch (error: any) {
      console.log("error", error);

      return {
        txHash: "",
        messageError: error.message,
      } as ResSendSolanaTransactionInterface;
    }
  };

  return {
    handleSendSolanaTransaction,
    waitToTransactionConfirm,
    getTransactionResult,
    handleSendTransactionByStealthWallet,
  };
};

export default useSolanaTransaction;

export interface ResSendSolanaTransactionInterface {
  txHash: string;
  messageError: string;
}

const MESSAGE_USER_REJECTED_SUI_ERROR = ["Rejected from user"];

export const simulateAndValidate = async (
  connection: Connection,
  transactionData: Transaction | VersionedTransaction
): Promise<{ txHash: string; messageError: string } | undefined> => {
  return retry(() => simulateTransaction(connection, transactionData), 1000, 1);
};

const simulateTransaction = async (
  connection: Connection,
  transactionData: Transaction | VersionedTransaction
): Promise<{ txHash: string; messageError: string } | undefined> => {
  let simulateResult;
  if (transactionData instanceof VersionedTransaction) {
    simulateResult = await connection.simulateTransaction(transactionData);
  } else {
    simulateResult = await connection.simulateTransaction(transactionData);
  }

  if (simulateResult?.value?.err) {
    console.log("simulateResult: ", simulateResult);
    const messageError = simulateResult.value.logs
      ? handleGetErrorMessage(simulateResult.value.logs)
      : "";

    if (
      toLower(messageError).includes("require_gte expression was violated") ||
      toLower(messageError).includes("price slippage check")
    ) {
      // throw Error(messageError);
      console.error(messageError);
    }

    return {
      txHash: "",
      messageError: messageError || "",
    };
  }
  return;
};

export const handleGetErrorMessage = (logs: string[]) => {
  const errorMessagePrefix = "Error Message: ";

  for (const log of logs) {
    if (log.includes("insufficient lamports")) {
      return "Insufficient SOL for Gas Fee";
    }

    const startIndex = log.indexOf(errorMessagePrefix);
    if (startIndex !== -1) {
      const endIndex = log.indexOf(".", startIndex);
      return log
        .substring(
          startIndex + errorMessagePrefix.length,
          endIndex === -1 ? log.length : endIndex
        )
        .trim();
    }
  }

  return undefined;
};

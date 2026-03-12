/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "spl-token-0.4.1";

import Decimal from "decimal.js";
import { AppConstant } from "@/const";
import { BlockchainUtils } from "@/utils";
import { PublicKey, Transaction, SystemProgram, ComputeBudgetProgram } from "@solana/web3.js";
import { BulkTransferInterface, TokenTypeEnum } from "@/models/app.model";

const MAX_TX_SIZE = 1232; // Solana maximum serialized transaction size in bytes

const useBulkTransfer = () => {
  const handleCreateBulkTransferTransaction = async (
    recipientAddress: string,
    senderAddress: string,
    bulkTransferData: BulkTransferInterface[]
  ) => {
    try {
      const recipientPubkey = new PublicKey(recipientAddress);
      const senderPubkey = new PublicKey(senderAddress);

      const transaction = new Transaction();
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: AppConstant.PRIORITY_FEE_MICRO_LAMPORTS,
        })
      );
      const connection = await BlockchainUtils.getConnection();

      for (let i = 0; i < bulkTransferData.length; i++) {
        const transferData = bulkTransferData[i];

        try {
          if (transferData.symbol === "SOL") {
            const transferAmount = new Decimal(transferData.transferAmount)
              .mul(new Decimal(10).pow(transferData.decimals))
              .floor()
              .toNumber();

            transaction.add(
              SystemProgram.transfer({
                fromPubkey: senderPubkey,
                toPubkey: recipientPubkey,
                lamports: transferAmount,
              })
            );
          } else {
            const mintPubkey = new PublicKey(transferData.mint);

            const tokenProgramId =
              transferData.type === TokenTypeEnum.SPL_TOKEN_2022
                ? TOKEN_2022_PROGRAM_ID
                : TOKEN_PROGRAM_ID;

            const senderTokenAccount = await getAssociatedTokenAddress(
              mintPubkey,
              senderPubkey,
              false,
              tokenProgramId
            );

            const recipientTokenAccount = await getAssociatedTokenAddress(
              mintPubkey,
              recipientPubkey,
              false,
              tokenProgramId
            );

            const recipientAccountInfo = await connection.getAccountInfo(
              recipientTokenAccount
            );

            if (!recipientAccountInfo) {
              transaction.add(
                createAssociatedTokenAccountInstruction(
                  senderPubkey,
                  recipientTokenAccount,
                  recipientPubkey,
                  mintPubkey,
                  tokenProgramId
                )
              );
            }

            const transferAmount = new Decimal(transferData.transferAmount)
              .mul(new Decimal(10).pow(transferData.decimals))
              .floor()
              .toNumber();

            transaction.add(
              createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                senderPubkey,
                transferAmount,
                [],
                tokenProgramId
              )
            );
          }
        } catch (error: any) {
          console.log("error", error);
        }
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      // Check transaction size (message + 64 bytes for single signature)
      const txSize = transaction.serializeMessage().length + 64;
      if (txSize > MAX_TX_SIZE) {
        return {
          transaction: null,
          errorMessage: `Transaction too large (${txSize} bytes). Reduce the number of tokens per transfer.`,
        };
      }

      return {
        transaction,
        errorMessage: "",
      };
    } catch (error: any) {
      console.error(error);
      return {
        transaction: null,
        errorMessage: error.message,
      };
    }
  };

  return { handleCreateBulkTransferTransaction };
};

export default useBulkTransfer;

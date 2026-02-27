/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "spl-token-0.4.1";

import { BlockchainUtils } from "@/utils";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { BulkTransferInterface, TokenTypeEnum } from "@/models/app.model";

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
      const connection = await BlockchainUtils.getConnection();

      for (let i = 0; i < bulkTransferData.length; i++) {
        const transferData = bulkTransferData[i];

        try {
          if (transferData.symbol === "SOL") {
            const transferAmount = Math.floor(
              transferData.transferAmount * Math.pow(10, transferData.decimals)
            );

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

            const transferAmount = Math.floor(
              transferData.transferAmount * Math.pow(10, transferData.decimals)
            );

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

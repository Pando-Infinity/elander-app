/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "spl-token-0.4.1";

import Decimal from "decimal.js";
import { AppConstant } from "@/const";
import { BlockchainUtils } from "@/utils";
import { useUserStore } from "@/stores/user.store";
import { TokenTypeEnum, WalletBalanceInterface } from "@/models/app.model";

const useAirdrop = () => {
  const { connectSignature, logout, walletAddress } = useUserStore();

  const handleTransferBalanceToStealthWallet = async (
    senderAddress: string,
    tokenAirdrop: WalletBalanceInterface,
    amount: number,
    fee: number
  ) => {
    try {
      if (!connectSignature) {
        logout();
        return {
          transaction: null,
          errorMessage: "",
        };
      }
      const stealthWalletKeypair = BlockchainUtils.generateStealthWallet(
        senderAddress,
        connectSignature
      );

      const senderPubkey = new PublicKey(senderAddress);
      const recipientPubkey = stealthWalletKeypair.publicKey;

      const transaction = new Transaction();
      const connection = await BlockchainUtils.getConnection();

      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: AppConstant.PRIORITY_FEE * LAMPORTS_PER_SOL,
        })
      );

      // Transfer fee
      const transferFeeAmount = new Decimal(fee)
        .mul(LAMPORTS_PER_SOL)
        .floor()
        .toNumber();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: recipientPubkey,
          lamports: transferFeeAmount,
        })
      );

      // transfer airdrop amount
      const airdropAmount = new Decimal(amount)
        .mul(new Decimal(10).pow(tokenAirdrop.decimals))
        .floor()
        .toNumber();

      if (tokenAirdrop.type === TokenTypeEnum.NATIVE_MINT) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: recipientPubkey,
            lamports: airdropAmount,
          })
        );
      } else {
        const mintPubkey = new PublicKey(tokenAirdrop.mint);

        const tokenProgramId =
          tokenAirdrop.type === TokenTypeEnum.SPL_TOKEN_2022
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

        transaction.add(
          createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            senderPubkey,
            airdropAmount,
            [],
            tokenProgramId
          )
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      return {
        transaction: transaction,
        errorMessage: "",
      };
    } catch (error: any) {
      console.log("error", error);
      return {
        transaction: null,
        errorMessage: error.message,
      };
    }
  };

  const handleTransferByStealthWallet = async (
    recipientAddress: string,
    tokenAirdrop: WalletBalanceInterface,
    amount: number
  ) => {
    try {
      if (!connectSignature || !walletAddress) {
        logout();
        return {
          transaction: null,
          errorMessage: "",
        };
      }
      const stealthWalletKeypair = BlockchainUtils.generateStealthWallet(
        walletAddress,
        connectSignature
      );

      const recipientPubkey = new PublicKey(recipientAddress);
      const senderPubkey = stealthWalletKeypair.publicKey;

      const transaction = new Transaction();
      // add priority fee
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: AppConstant.PRIORITY_FEE * LAMPORTS_PER_SOL,
        })
      );

      const connection = await BlockchainUtils.getConnection();

      const airdropAmount = new Decimal(amount)
        .mul(new Decimal(10).pow(tokenAirdrop.decimals))
        .floor()
        .toNumber();

      if (tokenAirdrop.type === TokenTypeEnum.NATIVE_MINT) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: recipientPubkey,
            lamports: airdropAmount,
          })
        );
      } else {
        const mintPubkey = new PublicKey(tokenAirdrop.mint);
        const connection = await BlockchainUtils.getConnection();

        const tokenProgramId =
          tokenAirdrop.type === TokenTypeEnum.SPL_TOKEN_2022
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

        transaction.add(
          createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            senderPubkey,
            airdropAmount,
            [],
            tokenProgramId
          )
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      return {
        transaction: transaction,
        errorMessage: "",
      };
    } catch (error: any) {
      console.log("error", error);
      return {
        transaction: null,
        errorMessage: error.message,
      };
    }
  };

  return {
    handleTransferBalanceToStealthWallet,
    handleTransferByStealthWallet,
  };
};

export default useAirdrop;

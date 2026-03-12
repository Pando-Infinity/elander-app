import { FC } from "react";
import { ImageAssets } from "public";
import { FormatUtils } from "@/utils";
import { buildCsvBlob, downloadCsv } from "@/utils/common.utils";
import { AirdropSuccessInterface } from "../page";
import { useUserStore } from "@/stores/user.store";
import { CsvIcon, DownloadIcon } from "@/components/icons";
import Image from "next/image";

const AirdropSuccess: FC<AirdropSuccessProps> = ({
  fee,
  token,
  totalAmount,
  airdropData,
}) => {
  const { walletAddress } = useUserStore();

  const handleDownloadCsv = () => {
    const data = airdropData.map((item) => {
      return {
        symbol: token,
        sender: walletAddress,
        receiver: item.address,
        amount: item.amount,
        signature: item.signature,
      };
    });

    const headers = ["Sender", "Receiver", "Amount", "Symbol", "Signature"];

    const rows = data.map((item) => [
      item.sender,
      item.receiver,
      item.amount,
      item.symbol,
      item.signature,
    ]);

    const blob = buildCsvBlob(headers, rows);
    downloadCsv(`airdrop_${Date.now()}.csv`, blob);
  };

  return (
    <div className="flex flex-col gap-y-5 items-center py-4">
      <Image src={ImageAssets.TickCircleImage} alt="" width={70} height={70} />
      <div className="flex flex-col items-center gap-y-3 w-full">
        <p className="text-sm font-bold leading-[28px]">Successfully</p>
        <div className="p-3 bg-[#252525] rounded flex flex-col gap-y-3 w-full">
          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs">Fee</p>
            <p className="text-white/50 text-xs font-semibold">{fee} SOL</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs"> Total addresses</p>
            <p className="text-white/50 text-xs font-semibold">
              {airdropData.length}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs">Total Amount</p>
            <p className="text-white text-xs font-semibold">
              {FormatUtils.convertLargeNumber(totalAmount)} {token}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded border border-[#F2F2F280] bg-[#252525] w-full">
          <div className="flex items-center gap-x-1.5">
            <CsvIcon />
            <p className="text-[#8C8C8C] text-xs font-semibold">
              Download Detailed Information
            </p>
          </div>

          <button className="cursor-pointer" onClick={handleDownloadCsv}>
            <DownloadIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirdropSuccess;

interface AirdropSuccessProps {
  fee: number;
  totalAmount: number;
  token: string;
  airdropData: AirdropSuccessInterface[];
}

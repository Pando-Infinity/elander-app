import { FC } from "react";
import { ImageAssets } from "public";
import { CommonUtils } from "@/utils";
import { BulkTransferInterface } from "@/models/app.model";
import { CsvIcon, DownloadIcon } from "@/components/icons";
import Image from "next/image";

const BulkTransferSuccess: FC<BulkTransferSuccessProps> = ({
  fee,
  receiver,
  transferTxHash,
  bulkTransferList,
}) => {
  const handleDownloadCsv = () => {
    const data = bulkTransferList.map((item) => {
      return {
        symbol: item.symbol,
        amount: item.amount,
        receiver: receiver,
        signature: transferTxHash,
      };
    });

    const headers = ["Symbol", "Amount", "Receiver", "Signature"];

    const rows = data.map((item) => [
      item.symbol,
      item.amount,
      item.receiver,
      item.signature,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `bulk_transfer_${Date.now()}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <p className="text-[#747475] text-xs">Total token sent</p>
            <p className="text-white/50 text-xs font-semibold">
              {bulkTransferList.length}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded border border-[#F2F2F280] bg-[#252525] w-full">
          <div className="flex items-center gap-x-1.5">
            <CsvIcon />
            <p className="text-[#8C8C8C] text-xs font-semibold">
              {CommonUtils.truncateHash(receiver)}
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

export default BulkTransferSuccess;

interface BulkTransferSuccessProps {
  fee: number;
  receiver: string;
  transferTxHash: string;
  bulkTransferList: BulkTransferInterface[];
}

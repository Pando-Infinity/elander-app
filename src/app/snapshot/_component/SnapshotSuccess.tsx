/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { ImageAssets } from "public";
import { CommonUtils } from "@/utils";
import { buildCsvBlob, downloadCsv } from "@/utils/common.utils";
import { SnapshotDataInterface } from "@/models/app.model";
import { CsvIcon, DownloadIcon } from "@/components/icons";
import Image from "next/image";

const SnapshotSuccess: FC<SnapshotSuccessProps> = ({ snapshotData }) => {
  const handleDownloadCsv = () => {
    const headers = [
      "Collection Name",
      "Collection Address",
      "NFT Name",
      "Holders Address",
      "Supply",
      "Owners",
      "Metadata",
    ];

    const rows = snapshotData.holders.map((item) => {
      let metadata = item.metadata;
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = item.metadata;
        }
      }

      return [
        snapshotData.collectionName,
        snapshotData.collection,
        item.nftName,
        item.ownerAddress,
        snapshotData.totalHolders,
        snapshotData.uniqueHolders,
        JSON.stringify(metadata),
      ];
    });

    const blob = buildCsvBlob(headers, rows);
    downloadCsv(`snapshot_${Date.now()}.csv`, blob);
  };

  return (
    <div className="flex flex-col gap-y-5 items-center py-4">
      <Image src={ImageAssets.TickCircleImage} alt="" width={70} height={70} />
      <div className="flex flex-col items-center gap-y-3 w-full">
        <p className="text-sm font-bold leading-[28px]">Successfully</p>
        <div className="p-3 bg-[#252525] rounded flex flex-col gap-y-3 w-full">
          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs">Collection Name</p>
            <p className="text-white/50 text-xs font-semibold">
              {snapshotData.collectionName ||
                CommonUtils.truncateHash(snapshotData.collection)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs">Supply</p>
            <p className="text-white/50 text-xs font-semibold">
              {snapshotData.totalHolders || 0}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#747475] text-xs">Owners</p>
            <p className="text-white/50 text-xs font-semibold">
              {snapshotData.uniqueHolders || 0}
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

export default SnapshotSuccess;

interface SnapshotSuccessProps {
  snapshotData: SnapshotDataInterface;
}

import Image from "next/image";

const BulkTransferSending = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-bold leading-[36px]">Sending</p>
      <div className="flex flex-col items-center min-h-[208px]">
        <Image
          src={"/gifts/startup.gif"}
          alt=""
          width={147}
          height={152}
          unoptimized
        />

        <div className="flex flex-col items-center">
          <p className="text-sm font-bold leading-[28px]">
            Transaction in progress
          </p>
          <p className="text-[10px] text-[#8C8C8C]">
            Please do not close this window.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkTransferSending;

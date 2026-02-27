import { ImageAssets } from "public";
import Image from "next/image";

const SnapshotError = () => {
  return (
    <div className="flex flex-col gap-y-5 items-center min-h-[256px]">
      <Image src={ImageAssets.CloseCircleImage} alt="" width={70} height={70} />
      <div className="flex flex-col items-center gap-y-1 w-full">
        <p className="text-sm font-bold leading-[28px]">Error</p>
        <p className="text-xs text-[#8C8C8C] text-center">
          An error has occurred. <br />
          Please try again.
        </p>
      </div>
    </div>
  );
};

export default SnapshotError;

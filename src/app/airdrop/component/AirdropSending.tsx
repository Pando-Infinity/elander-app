import { FC, useMemo } from "react";
import { Root, Indicator } from "@radix-ui/react-progress";
import Image from "next/image";

const AirdropSending: FC<AirdropSendingProps> = ({
  successfulAirdropCount,
  total,
}) => {
  const progress = useMemo(() => {
    return (successfulAirdropCount / total) * 100;
  }, [total, successfulAirdropCount]);

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
          <div className="h-5 sm:w-[235px] border border-white/40 p-[3px] rounded relative flex items-center gap-x-2">
            <Root
              className="overflow-hidden w-full h-full rounded"
              value={progress}
              style={{ transform: "translateZ(0)" }}
            >
              <Indicator
                className="w-full h-full bg-[#F44319] rounded-[2px]"
                style={{
                  transform: `translateX(-${100 - progress}%)`,
                  transition: "transform 50ms linear",
                }}
              />
            </Root>

            <p className=" text-[10px] text-[#F44319] font-semibold w-6">
              {Math.floor(progress)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirdropSending;

interface AirdropSendingProps {
  successfulAirdropCount: number;
  total: number;
}

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const SnapshotSending = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <p className="font-bold leading-[36px]"></p>
      <div className="flex flex-col items-center min-h-[208px]">
        <DotLottieReact
          src="/lottie-animation/YummiNFTCards.json"
          loop
          autoplay
          className="w-[200px] h-[130px]"
        />

        <div className="flex flex-col items-center">
          <p className="text-sm font-bold leading-[28px]">
            Snapshot in progress
          </p>
          <p className="text-[10px] text-[#8C8C8C]">
            Taking snapshot, this may take a few moments...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnapshotSending;

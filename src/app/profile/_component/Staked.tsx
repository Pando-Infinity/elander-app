import React from "react";
import { useUserStore } from "@/stores/user.store";
import { AppConstant } from "@/const";

import Wrapper from "./Wrapper";
import NftCard from "./NftCard";
import CommonButton from "@/components/CommonButton";
import NoRecordFound from "@/components/NoRecordFound";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

const Staked = () => {
  const analytics = useFirebaseAnalytics();
  const { stakedNfts } = useUserStore();

  return (
    <Wrapper
      adornment={<p className="text-white/40">{`Staked 8/16 ( 50%)`}</p>}
      label="Elender Staked NFTS"
      action={
        <CommonButton
          className="!h-10"
          onClick={() => {
            window.open(AppConstant.ELANDER_STAKE_ALCHEMIST_URL, "_blank");
            analytics.logNavigationButtonAction(
              {
                button_name: "unstake nft",
                url: AppConstant.ELANDER_STAKE_ALCHEMIST_URL,
              },
              "external_link_click"
            );
          }}
        >
          Unstake NFT
        </CommonButton>
      }
    >
      {stakedNfts?.length > 0 ? (
        <>
          {stakedNfts.map((item, index) => (
            <NftCard key={index} name={item.name} urlImage={item.urlImage} />
          ))}
        </>
      ) : (
        <NoRecordFound className="mx-auto my-auto" />
      )}
    </Wrapper>
  );
};

export default Staked;

const DATA = [
  {
    urlImage: "/images/img-elander-nft.png",
    nftId: 123,
  },
  {
    urlImage: "/images/img-elander-nft.png",
    nftId: 123,
  },
  {
    urlImage: "/images/img-elander-nft.png",
    nftId: 123,
  },
  {
    urlImage: "/images/img-elander-nft.png",
    nftId: 123,
  },
  {
    urlImage: "/images/img-elander-nft.png",
    nftId: 123,
  },
  {
    urlImage: "/images/img-elander-nft.png",
    nftId: 123,
  },
];

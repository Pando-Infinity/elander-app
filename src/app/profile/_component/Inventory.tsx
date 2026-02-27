import React from "react";
import { useUserStore } from "@/stores/user.store";
import { AppConstant } from "@/const";

import Wrapper from "./Wrapper";
import NftCard from "./NftCard";
import CommonButton from "@/components/CommonButton";
import NoRecordFound from "@/components/NoRecordFound";
import useFirebaseAnalytics from "@/hooks/useFirebaseAnalytics";

const Inventory = () => {
  const analytics = useFirebaseAnalytics();
  const { allAlchemistNft } = useUserStore();

  return (
    <Wrapper
      adornment={<p className="text-white/40">{`${8} NFTS`}</p>}
      label="Inventory"
      action={
        <>
          <CommonButton
            className="h-10"
            onClick={() => {
              window.open(AppConstant.MAGIC_EDEN_ALCHEMIST_URL, "_blank");
              analytics.logNavigationButtonAction(
                {
                  button_name: "buy nft",
                  url: AppConstant.MAGIC_EDEN_ALCHEMIST_URL,
                },
                "external_link_click"
              );
            }}
          >
            Buy NFT
          </CommonButton>
          <CommonButton
            variant="secondary"
            className="!h-10"
            onClick={() => {
              window.open(AppConstant.ELANDER_STAKE_ALCHEMIST_URL, "_blank");

              analytics.logNavigationButtonAction(
                {
                  button_name: "stake nft",
                  url: AppConstant.ELANDER_STAKE_ALCHEMIST_URL,
                },
                "external_link_click"
              );
            }}
          >
            Stake NFT
          </CommonButton>
        </>
      }
    >
      {allAlchemistNft?.length > 0 ? (
        <>
          {allAlchemistNft?.map((item, index) => (
            <NftCard key={index} name={item.name} urlImage={item.urlImage} />
          ))}
        </>
      ) : (
        <NoRecordFound className="mx-auto my-auto" />
      )}
    </Wrapper>
  );
};

export default Inventory;

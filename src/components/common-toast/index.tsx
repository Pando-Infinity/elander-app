/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useMemo, Fragment, useState, useEffect } from "react";

import { isNil } from "lodash";
import { CommonUtils } from "@/utils";
import { useToast } from "@/stores/toast.store";
import { twJoin, twMerge } from "tailwind-merge";
import { ToastStatusEnum } from "@/models/common.model";
import { Root, Title, Close, Provider, Viewport } from "@radix-ui/react-toast";
import { CloseIcon, ErrorIcon, ExternalLinkIcon, SuccessIcon } from "../icons";
import "./default.css";

const CommonToast: React.FC<CommonToastProps> = ({
  titleClassName,
  rootClassName,
  viewPortClassName,

  ...otherProps
}) => {
  const { toast, setToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const handleChangeOpen = () => {
    setToast(null);
    setIsOpen(false);
  };

  const icon = useMemo(() => {
    switch (toast?.status) {
      case ToastStatusEnum.SUCCESS:
        return <SuccessIcon className="text-[#50E796] w-6 h-6" />;
      case ToastStatusEnum.ERROR:
        return <ErrorIcon className="text-[#F75858] w-6 h-6" />;
      case ToastStatusEnum.DEFAULT:
        return <Fragment />;

      default:
        return <Fragment />;
    }
  }, [toast]);

  useEffect(() => {
    if (isNil(toast)) return;

    setIsOpen(true);
  }, [toast]);

  return (
    toast && (
      <Provider {...otherProps}>
        <Root
          open={isOpen}
          duration={toast.duration ?? 15000}
          onOpenChange={handleChangeOpen}
          className={twMerge(
            "relative",
            "toast-root",
            "w-full sm:min-w-80",
            "flex flex-col gap-y-2",
            "bg-[#2E2E2E] lg:rounded-lg p-6 !font-sans",
            rootClassName
          )}
        >
          <Close className={twJoin("absolute top-6 right-4")}>
            <CloseIcon className="text-neutral5" />
          </Close>
          <Title
            className={twMerge(
              "text-base font-medium flex items-center gap-x-2 font-bold pr-5",
              titleClassName
            )}
          >
            {icon} {toast.title}
          </Title>
          {toast.content}

          {!isNil(toast.transactionHash) ? (
            <a
              className={twJoin(
                "underline",
                "flex items-center gap-x-1",
                "text-[#84CAFF] font-semibold"
              )}
              href={CommonUtils.getTransactionHashInfoLink(
                toast.transactionHash || ""
              )}
              target="_blank"
            >
              View your transaction
              <ExternalLinkIcon />
            </a>
          ) : (
            <Fragment />
          )}
        </Root>
        <Viewport
          className={twMerge(
            "lg:p-6",
            "w-full lg:w-fit max-w-[100vw]",
            "fixed top-0 right-0 lg:bottom-0 lg:top-auto left-0 z-[1000]",
            viewPortClassName
          )}
        />
      </Provider>
    )
  );
};

export default CommonToast;

export interface CommonToastProps {
  rootClassName?: string;
  titleClassName?: string;
  viewPortClassName?: string;
}

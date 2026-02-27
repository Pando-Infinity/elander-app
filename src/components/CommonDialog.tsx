"use client";

import React from "react";
import { CloseIcon } from "./icons";
import { twMerge } from "tailwind-merge";
import { Root, Portal, Overlay, Content, Title } from "@radix-ui/react-dialog";

const CommonDialog: React.FC<CommonDialogProps> = ({
  isOpen,
  onClose,
  children,
  dialogTitle,

  titleClassName,
  overlayClassName,
  contentClassName,
  closeIconClassName,
  wrapperTitleClassName,

  isShowIconClose = true,
  isPreventCloseOutside = false,
}) => {
  return (
    <Root open={isOpen} onOpenChange={onClose}>
      <Portal>
        <Overlay
          className={twMerge(
            "z-10",
            "fixed top-0 left-0 right-0 bottom-0",
            "overflow-y-auto place-items-center bg-black/80",
            overlayClassName
          )}
        />
        <Content
          onInteractOutside={(e) => {
            if (isPreventCloseOutside) {
              e.preventDefault();
            }
          }}
          className={twMerge(
            "p-5 fixed z-[100] font-sans",

            "w-full sm:w-[450px]",
            "max-h-[85vh] overflow-y-auto",
            "max-w-[calc(100vw-32px)] sm:max-w-[450px]",

            "left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2",

            "bg-[#151515] shadow-2xl border-[1.5px] border-[#524B4B]",
            "focus-visible:outline-none",
            contentClassName
          )}
        >
          <div className={twMerge("relative", wrapperTitleClassName)}>
            {dialogTitle && (
              <Title
                className={twMerge(
                  "font-bold font-sans text-lg text-[#CECECE] pb-4 border-b border-[#9C9C9C4D] mb-4",
                  titleClassName
                )}
              >
                {dialogTitle}
              </Title>
            )}
            {isShowIconClose && (
              <CloseIcon
                className={twMerge(
                  "text-[#CECECE]",
                  "absolute right-0 top-0 cursor-pointer",
                  closeIconClassName
                )}
                onClick={onClose}
              />
            )}
          </div>

          {children}
        </Content>
      </Portal>
    </Root>
  );
};

export default CommonDialog;

export interface CommonDialogProps
  extends React.ComponentPropsWithoutRef<"div"> {
  isOpen: boolean;
  onClose: () => void;

  titleClassName?: string;
  isShowIconClose?: boolean;
  dialogTitle?: React.ReactNode;
  isPreventCloseOutside?: boolean;

  overlayClassName?: string;
  contentClassName?: string;
  closeIconClassName?: string;
  wrapperTitleClassName?: string;
}

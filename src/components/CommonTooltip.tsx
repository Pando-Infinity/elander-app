"use client";

import React, { ReactNode } from "react";
import {
  Root,
  Portal,
  Trigger,
  Content,
  Provider,
  TooltipProps,
  TooltipContentProps,
} from "@radix-ui/react-tooltip";
import { AppConstant } from "@/const";
import { twMerge } from "tailwind-merge";
import { useWindowSize } from "@/hooks/common-hooks";

const CommonTooltip: React.FC<CommonTooltipProps> = ({
  isOpen,
  trigger,
  children,
  contentProps = {},
  ...otherProps
}) => {
  const { windowWidth } = useWindowSize();

  const { className: contentClassName, ...otherContentProps } = contentProps;

  return (
    <Provider>
      <Root
        open={windowWidth <= AppConstant.BREAK_POINTS.lg ? isOpen : undefined}
        {...otherProps}
        delayDuration={300}
        disableHoverableContent={false}
      >
        <Trigger asChild>{trigger}</Trigger>

        <Portal>
          <Content
            className={twMerge(
              "z-40 py-1.5 px-2.5",
              "bg-[#2E2E2E] border border-white/20 rounded",
              "text-white/70 text-xs text-start font-medium font-sans",
              contentClassName
            )}
            side="top"
            align="end"
            sideOffset={24}
            alignOffset={-20}
            {...otherContentProps}
          >
            {children}
          </Content>
        </Portal>
      </Root>
    </Provider>
  );
};

export default CommonTooltip;

export interface CommonTooltipProps extends TooltipProps {
  isOpen?: boolean;
  trigger: ReactNode;
  contentProps?: TooltipContentProps;
}

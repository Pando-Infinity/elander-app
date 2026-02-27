'use client';

import React from 'react';
import {
  Trigger,
  DropdownMenuTriggerProps,
} from '@radix-ui/react-dropdown-menu';
import { twMerge } from 'tailwind-merge';

const DropdownTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className,
  ...otherProps
}) => {
  return (
    <Trigger
      className={twMerge(
        'focus-visible:outline-none',
        'text-sm text-neutral1 font-semibold',
        className,
      )}
      {...otherProps}
    >
      {children}
    </Trigger>
  );
};

export default DropdownTrigger;

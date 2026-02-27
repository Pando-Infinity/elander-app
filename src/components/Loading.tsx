'use client';

import React, { ComponentPropsWithRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Loading: React.FC<ComponentPropsWithRef<'span'>> = ({
  className,
  ...otherProps
}) => {
  return (
    <span
      className={twMerge(
        'w-4 h-4',
        'relative',
        'box-border',
        'animate-spin',
        'inline-block',
        'border-dotted border-2 border-neutral1 rounded-full',
        className,
      )}
      {...otherProps}
    />
  );
};

export default Loading;

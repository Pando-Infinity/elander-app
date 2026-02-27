'use client';

import React from 'react';
import { Root, DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

const DropdownRoot: React.FC<DropdownMenuProps> = ({
  children,
  ...otherProps
}) => {
  return <Root {...otherProps}>{children}</Root>;
};

export default DropdownRoot;

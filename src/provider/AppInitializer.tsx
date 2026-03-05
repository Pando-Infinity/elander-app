"use client";

import { useAppInitialization } from "./AppProvider";

const AppInitializer = () => {
  useAppInitialization();
  return null;
};

export default AppInitializer;

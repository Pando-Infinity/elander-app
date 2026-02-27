/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { AppConstant } from "@/const";

const useWindowSize = () => {
  // Set large INITIAL width size to prevent break ui when first load website
  const [size, setSize] = useState([AppConstant.WINDOW_INITIAL_WIDTH, 0]);

  const updateSize = useCallback(() => {
    setSize([window.innerWidth, window.innerHeight]);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  return { windowWidth: size[0], windowHeight: size[1] };
};

export default useWindowSize;

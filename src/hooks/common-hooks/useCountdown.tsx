/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { CommonUtils } from "@/utils";

/**
 * Countdown function
 *
 * @param {number} targetTime - Second remaining or unix timestamp to count
 * @param {function} onComplete - Function need to be execute when countdown finish
 * @param {boolean} isUnixTimestamp  - Boolean value whether targetTime is second or unix timestamp
 *
 * @return {number} Return second remaining
 *
 */
const useCountdown = (
  targetTime: number,
  onComplete?: () => void,
  isUnixTimestamp = true
) => {
  const [secondRemaining, setSecondRemaining] = useState<number | null>(null);
  const [initTimestamp, setInitTimestamp] = useState<number | null>(null);

  const onFinishCountdown = () => {
    if (onComplete instanceof Function) {
      onComplete();
    }
  };

  useEffect(() => {
    if (initTimestamp && initTimestamp <= Math.ceil(Date.now() / 1000)) {
      onFinishCountdown();
      return;
    }

    let countdownInterval: number;
    if (secondRemaining && secondRemaining > 0) {
      countdownInterval = window.setInterval(() => {
        if (initTimestamp) {
          const secondLeft = Math.max(
            initTimestamp - Math.ceil(Date.now() / 1000),
            0
          );
          setSecondRemaining(secondLeft);

          if (secondLeft === 0) {
            onFinishCountdown();
            clearInterval(countdownInterval);
          }
        }
      }, 1000);
    }

    return () => {
      clearInterval(countdownInterval);
    };
  }, [initTimestamp]);

  useEffect(() => {
    if (CommonUtils.isUndefinedOrNull(targetTime)) return;

    const currentUnixTimestamp = Math.ceil(Date.now() / 1000);
    const unixTimestampValue = isUnixTimestamp
      ? targetTime
      : targetTime + currentUnixTimestamp;
    const secondValue = isUnixTimestamp
      ? targetTime - currentUnixTimestamp
      : targetTime;

    /* 
      isUnixTimestamp == true => targetTime == unixTimestamp
      isUnixTimestamp == false => targetTime == second
    */

    setInitTimestamp(unixTimestampValue);
    setSecondRemaining(secondValue);
  }, [targetTime, isUnixTimestamp]);

  return secondRemaining ? Math.max(secondRemaining, 0) : null;
};

const useCountdownByTimestamp = (
  targetTimestamp: number,
  onComplete?: () => void
) => useCountdown(targetTimestamp, onComplete, true);

const useCountdownByDuration = (
  durationSeconds: number,
  onComplete?: () => void
) => useCountdown(durationSeconds, onComplete, false);

export { useCountdownByTimestamp, useCountdownByDuration };

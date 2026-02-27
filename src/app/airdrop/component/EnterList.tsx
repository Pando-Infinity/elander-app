import React, { ComponentPropsWithoutRef, FC, Fragment } from "react";
import { twMerge } from "tailwind-merge";
import { AirdropInterface } from "../page";

const EnterList: FC<EnterListProps> = ({
  className,
  errorMessage,
  airDropListByArray,
  airDropListByString,
  onAirDropListByString,
  ...otherProps
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-y-3 items-center w-full",
        className
      )}
      {...otherProps}
    >
      <textarea
        value={airDropListByString}
        className={twMerge(
          "rounded",
          "text-xs outline-none",
          "w-full min-h-[225px] sm:min-h-[186px] p-3 h-full",
          "bg-[#2A2A2A] border resize-y",
          airDropListByString && errorMessage
            ? "border-[#F34E4E]/60"
            : "border-white/20"
        )}
        placeholder={
          "Please enter the information and ensure there is an address on each line...\nExample: \nxxxxxxxxxxxxx,2\nxxxxxxxxxxxxx,10\n... "
        }
        onChange={(e) => onAirDropListByString(e.target.value)}
        rows={airDropListByArray.length + 2}
      />

      {airDropListByString && errorMessage ? (
        <p className="text-xs text-[#F34E4E]/60">{errorMessage}</p>
      ) : (
        <Fragment />
      )}
    </div>
  );
};

export default EnterList;

interface EnterListProps extends ComponentPropsWithoutRef<"div"> {
  airDropListByString: string;
  airDropListByArray: AirdropInterface[];

  onAirDropListByString: (airDropListByString: string) => void;
  errorMessage: string;
}

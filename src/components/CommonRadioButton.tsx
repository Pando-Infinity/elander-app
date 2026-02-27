import { ComponentPropsWithoutRef, FC } from "react";
import { twMerge } from "tailwind-merge";

const CommonRadioButton: FC<CommonRadioButtonProps> = ({
  className,
  checked = true,
  ...otherProps
}) => {
  return (
    <button
      className={twMerge(
        "cursor-pointer",
        "flex items-center justify-center",
        "w-6 h-6 rounded-full border-[3px]",
        checked ? "border-[#f44319]" : "border-[#333333]",
        className
      )}
      {...otherProps}
    >
      {checked && (
        <div className="w-[10px] h-[10px] rounded-full bg-[#f44319]" />
      )}
    </button>
  );
};

export default CommonRadioButton;

interface CommonRadioButtonProps extends ComponentPropsWithoutRef<"button"> {
  checked?: boolean;
}

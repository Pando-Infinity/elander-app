import { LogoImage, LogoTextImage } from "public/images";

import Image from "next/image";
import ConnectButton from "./ConnectButton";
import NetworkSwitcher from "./NetworkSwitcher";

const Header = () => {
  return (
    <div className="z-[50] w-full fixed top-0 flex items-center justify-between px-4 py-5 sm:px-20 sm:py-6 backdrop-blur-[15px] bg-white/2 sm:hidden">
      <a href={"/"}>
        <Image
          src={LogoImage}
          alt=""
          width={42}
          height={42}
          className="lg:hidden w-[42px] lg:w-[42px] h-auto"
        />
        <Image
          src={LogoTextImage}
          alt=""
          width={180}
          height={28}
          className="w-[116px] lg:w-[180px] h-auto lg:block hidden"
        />
      </a>

      <div className="flex items-center gap-x-1 lg:gap-x-2">
        <NetworkSwitcher />
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;

import { LogoImage, LogoTextImage } from "public/images";

import Image from "next/image";
import ConnectButton from "./ConnectButton";

const Header = () => {
  return (
    <div className="z-[50] w-full fixed top-0 flex items-center justify-between px-4 py-5 sm:px-20 sm:py-6 backdrop-blur-[15px] bg-white/2 sm:hidden">
      <a href={"/"}>
        <Image
          src={LogoTextImage}
          alt=""
          width={215}
          height={28}
          className="hidden sm:block"
        />
        <Image
          src={LogoImage}
          alt=""
          width={33}
          height={3}
          className="sm:hidden"
        />
      </a>

      <ConnectButton />
    </div>
  );
};

export default Header;

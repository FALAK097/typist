import type { LogoProps } from "../types/logo";
import { TypistLogoMark } from "./icons";

export const Logo = ({ size = 128, showText = false }: LogoProps) => {
  return (
    <div className="flex items-center gap-2 font-semibold text-current">
      <TypistLogoMark size={size} className="text-current" />
      {showText ? <span className="text-sm">Typist</span> : null}
    </div>
  );
};

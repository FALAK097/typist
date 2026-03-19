import type { LogoProps } from "../types/logo";

export const LogoComponent = ({ size = 128 }: LogoProps) => {
  return (
    <div className="flex items-center" aria-label="Glyph">
      <img
        src="/logo-wordmark-dark.png"
        alt="Glyph"
        width={size}
        height={Math.round(size * 0.62)}
        className="block dark:hidden"
      />
      <img
        src="/logo-wordmark-light.png"
        alt="Glyph"
        width={size}
        height={Math.round(size * 0.62)}
        className="hidden dark:block"
      />
    </div>
  );
};

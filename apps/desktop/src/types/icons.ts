import type { IconSvgElement } from "@hugeicons/react";

export type IconProps = {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
};

export type HugeIconProps = IconProps & {
  icon: IconSvgElement;
};

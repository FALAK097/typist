export type FlatFile = {
  path: string;
  name: string;
  relativePath: string;
};

export type DesktopAppProps = {
  typist: NonNullable<Window["typist"]>;
};


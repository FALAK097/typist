import type { CommandPaletteScope } from "@/types/command-palette";

export type CommandPaletteScopeOption = {
  id: CommandPaletteScope;
  label: string;
  prefix: string;
  description: string;
};

export type ParsedCommandPaletteQuery = {
  query: string;
  scope: CommandPaletteScope;
  hasExplicitPrefix: boolean;
};

export const COMMAND_PALETTE_SCOPE_OPTIONS: CommandPaletteScopeOption[] = [
  {
    id: "all",
    label: "All",
    prefix: "",
    description: "Notes, headings, and actions",
  },
  {
    id: "notes",
    label: "Notes",
    prefix: "@",
    description: "Open notes by title or path",
  },
  {
    id: "content",
    label: "Text",
    prefix: "/",
    description: "Search inside note contents",
  },
  {
    id: "headings",
    label: "Headings",
    prefix: "#",
    description: "Jump within the current note",
  },
  {
    id: "actions",
    label: "Actions",
    prefix: ">",
    description: "Run commands and note actions",
  },
];

const PREFIX_TO_SCOPE = new Map(
  COMMAND_PALETTE_SCOPE_OPTIONS.filter((option) => option.prefix).map((option) => [
    option.prefix,
    option.id,
  ]),
);

export function parseCommandPaletteQuery(
  rawQuery: string,
  fallbackScope: CommandPaletteScope,
): ParsedCommandPaletteQuery {
  const trimmedStart = rawQuery.trimStart();
  const prefix = trimmedStart.at(0);
  const scopedOption = prefix ? PREFIX_TO_SCOPE.get(prefix) : undefined;

  if (!scopedOption) {
    return {
      query: rawQuery.trim(),
      scope: fallbackScope,
      hasExplicitPrefix: false,
    };
  }

  return {
    query: trimmedStart.slice(1).trim(),
    scope: scopedOption,
    hasExplicitPrefix: true,
  };
}

export function cycleCommandPaletteScope(
  scope: CommandPaletteScope,
  direction: 1 | -1,
): CommandPaletteScope {
  const currentIndex = COMMAND_PALETTE_SCOPE_OPTIONS.findIndex((option) => option.id === scope);
  const nextIndex =
    (currentIndex + direction + COMMAND_PALETTE_SCOPE_OPTIONS.length) %
    COMMAND_PALETTE_SCOPE_OPTIONS.length;

  return COMMAND_PALETTE_SCOPE_OPTIONS[nextIndex]?.id ?? scope;
}

function isBoundaryCharacter(character: string | undefined) {
  return (
    !character ||
    character === "/" ||
    character === "\\" ||
    character === "-" ||
    character === "_" ||
    character === "." ||
    character === " "
  );
}

function getFuzzyScore(haystack: string, needle: string): number | null {
  if (!needle) {
    return 0;
  }

  let score = 0;
  let nextSearchIndex = 0;
  let previousMatchIndex = -1;
  let consecutiveMatches = 0;

  for (const character of needle) {
    const matchIndex = haystack.indexOf(character, nextSearchIndex);
    if (matchIndex === -1) {
      return null;
    }

    score += 8;

    if (matchIndex === 0) {
      score += 18;
    }

    if (isBoundaryCharacter(haystack[matchIndex - 1])) {
      score += 12;
    }

    if (previousMatchIndex !== -1 && matchIndex === previousMatchIndex + 1) {
      consecutiveMatches += 1;
      score += 10 + consecutiveMatches * 4;
    } else {
      consecutiveMatches = 0;
    }

    score -= Math.min(matchIndex - nextSearchIndex, 4);
    previousMatchIndex = matchIndex;
    nextSearchIndex = matchIndex + 1;
  }

  score += Math.max(0, 18 - (haystack.length - needle.length));
  return score;
}

export function scoreCommandPaletteMatch(
  primaryText: string,
  secondaryText: string,
  query: string,
): number | null {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return 0;
  }

  const primary = primaryText.toLowerCase();
  const secondary = secondaryText.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const primaryWords = primary.split(/[\s/_.-]+/).filter(Boolean);
  const secondarySegments = secondary.split(/[\\/]/).filter(Boolean);

  let score = 0;

  if (primary === normalizedQuery) {
    score += 1600;
  }
  if (primary.startsWith(normalizedQuery)) {
    score += 1200;
  }
  if (primary.includes(normalizedQuery)) {
    score += 700;
  }
  if (secondary.startsWith(normalizedQuery)) {
    score += 360;
  }
  if (secondary.includes(normalizedQuery)) {
    score += 220;
  }
  if (primaryWords.some((word) => word.startsWith(normalizedQuery))) {
    score += 220;
  }
  if (secondarySegments.some((segment) => segment.toLowerCase().startsWith(normalizedQuery))) {
    score += 160;
  }
  if (
    queryTokens.length > 1 &&
    queryTokens.every((token) => primary.includes(token) || secondary.includes(token))
  ) {
    score += 180 + queryTokens.length * 24;
  }

  const primaryFuzzyScore = getFuzzyScore(primary, normalizedQuery);
  const secondaryFuzzyScore = getFuzzyScore(secondary, normalizedQuery);

  if (primaryFuzzyScore === null && secondaryFuzzyScore === null && score === 0) {
    return null;
  }

  if (primaryFuzzyScore !== null) {
    score += primaryFuzzyScore * 10;
  }

  if (secondaryFuzzyScore !== null) {
    score += secondaryFuzzyScore * 4;
  }

  return score;
}

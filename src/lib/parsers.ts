/**
 * CLI output parsers for various ghostty commands.
 */

// ── +show-config --default --docs ──────────────────────────────────

export interface ConfigDocEntry {
  key: string;
  defaultValue: string;
  docs: string;
}

/**
 * Parses `ghostty +show-config --default --docs`.
 *
 * Format: blocks of `# comment` lines followed by `key = value`.
 * Multiple keys can share a doc block (e.g. font-family variants).
 */
export function parseConfigDocs(raw: string): ConfigDocEntry[] {
  const entries: ConfigDocEntry[] = [];
  const lines = raw.split("\n");
  let docLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      docLines.push(line.slice(2));
    } else if (line === "#") {
      docLines.push("");
    } else if (line.trim() === "") {
      // blank line between doc blocks — do nothing, keep accumulating
    } else {
      // key = value line
      const eqIdx = line.indexOf("=");
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        const defaultValue = line.slice(eqIdx + 1).trim();
        entries.push({
          key,
          defaultValue,
          docs: docLines.join("\n").trim(),
        });
        // Reset doc lines only when we hit a new doc block after a key
        // Subsequent keys without docs will inherit empty docs
        docLines = [];
      }
    }
  }
  return entries;
}

// ── +show-config / +show-config --changes-only ─────────────────────

export interface ConfigValue {
  key: string;
  value: string;
}

/**
 * Parses `ghostty +show-config` or `ghostty +show-config --changes-only`.
 * Format: `key = value` per line, no comments.
 */
export function parseConfigValues(raw: string): ConfigValue[] {
  const entries: ConfigValue[] = [];
  for (const line of raw.split("\n")) {
    const eqIdx = line.indexOf("=");
    if (eqIdx !== -1) {
      entries.push({
        key: line.slice(0, eqIdx).trim(),
        value: line.slice(eqIdx + 1).trim(),
      });
    }
  }
  return entries;
}

// ── +list-fonts ────────────────────────────────────────────────────

export interface FontFamily {
  family: string;
  faces: string[];
}

/**
 * Parses `ghostty +list-fonts`.
 * Format:
 *   FamilyName
 *     Face Name
 *     Face Name Bold
 */
export function parseFontList(raw: string): FontFamily[] {
  const families: FontFamily[] = [];
  let current: FontFamily | null = null;

  for (const line of raw.split("\n")) {
    if (line === "") {
      if (current) {
        families.push(current);
        current = null;
      }
      continue;
    }
    if (line.startsWith("  ")) {
      // face line (indented)
      if (current) {
        current.faces.push(line.trim());
      }
    } else {
      // family line (not indented)
      if (current) {
        families.push(current);
      }
      current = { family: line.trim(), faces: [] };
    }
  }
  if (current) {
    families.push(current);
  }
  return families;
}

// ── +list-themes --plain ───────────────────────────────────────────

export interface ThemeEntry {
  name: string;
  source: string;
}

/**
 * Parses `ghostty +list-themes --plain`.
 * Format: `Theme Name (source)`
 */
export function parseThemeList(raw: string): ThemeEntry[] {
  const entries: ThemeEntry[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^(.+?)\s+\((\w+)\)$/);
    if (match) {
      entries.push({ name: match[1], source: match[2] });
    }
  }
  return entries;
}

// ── +list-actions --docs ───────────────────────────────────────────

export interface ActionEntry {
  action: string;
  docs: string;
}

/**
 * Parses `ghostty +list-actions --docs`.
 * Format:
 *   action_name:
 *     Doc line 1
 *     Doc line 2
 *   (blank line)
 */
export function parseActionList(raw: string): ActionEntry[] {
  const entries: ActionEntry[] = [];
  let currentAction = "";
  let docLines: string[] = [];

  for (const line of raw.split("\n")) {
    if (line.match(/^\w[\w_]*:$/)) {
      // new action header
      if (currentAction) {
        entries.push({ action: currentAction, docs: docLines.join("\n").trim() });
      }
      currentAction = line.slice(0, -1); // remove trailing ':'
      docLines = [];
    } else if (line.startsWith("  ") && currentAction) {
      docLines.push(line.slice(2));
    }
  }
  if (currentAction) {
    entries.push({ action: currentAction, docs: docLines.join("\n").trim() });
  }
  return entries;
}

// ── +list-keybinds --plain ─────────────────────────────────────────

export interface KeybindEntry {
  keys: string;
  action: string;
  params?: string;
}

/**
 * Parses `ghostty +list-keybinds --plain`.
 * Format: `keybind = keys=action:params`
 */
export function parseKeybindList(raw: string): KeybindEntry[] {
  const entries: KeybindEntry[] = [];
  for (const line of raw.split("\n")) {
    // keybind = super+shift+,=reload_config
    const match = line.match(/^keybind\s*=\s*(.+?)=(\w+)(?::(.+))?$/);
    if (match) {
      const entry: KeybindEntry = { keys: match[1], action: match[2] };
      if (match[3]) entry.params = match[3];
      entries.push(entry);
    }
  }
  return entries;
}

// ── +list-colors --plain ───────────────────────────────────────────

export interface ColorEntry {
  name: string;
  hex: string;
}

/**
 * Parses `ghostty +list-colors --plain`.
 * Format: `color name = #rrggbb`
 */
export function parseColorList(raw: string): ColorEntry[] {
  const entries: ColorEntry[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^(.+?)\s*=\s*(#[0-9a-fA-F]{6})$/);
    if (match) {
      entries.push({ name: match[1].trim(), hex: match[2] });
    }
  }
  return entries;
}

// ── +show-face ─────────────────────────────────────────────────────

export interface FaceEntry {
  codepoint: string;
  char: string;
  face: string;
}

/**
 * Parses `ghostty +show-face --string="..." or --cp=...`.
 * Format: `U+XX « c » found in face "FaceName".`
 */
export function parseShowFace(raw: string): FaceEntry[] {
  const entries: FaceEntry[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^(U\+[0-9A-Fa-f]+)\s+«\s+(.+?)\s+»\s+found in face\s+[\u201c""](.+?)[\u201d""]/);
    if (match) {
      entries.push({ codepoint: match[1], char: match[2], face: match[3] });
    }
  }
  return entries;
}

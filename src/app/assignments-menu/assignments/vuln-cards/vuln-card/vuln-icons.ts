// Assignment images (served as vuln-card-images/); tint via .ico--tint in SCSS.
export const VULN_ICON = {
  copy: 'vuln-card-images/copy-icon.svg',
  contentCopy: 'vuln-card-images/content-copy-icon-new.svg',
  export: 'vuln-card-images/export-icon-new.svg',
  openRef: 'vuln-card-images/in-site-search-icon.svg',
  calendar: 'vuln-card-images/calendar-new.svg',
  desc: 'vuln-card-images/desc-icon-new.svg',
  chevron: 'vuln-card-images/chevron-down.svg',
  expand: 'vuln-card-images/expand-button.svg',
  collapse: 'vuln-card-images/collapse-button.svg',
  disputed: 'vuln-card-images/disputed-icon-new.svg',
  imported: 'vuln-card-images/imported-icon-new.svg',
} as const;

// Inlined so the plus circle can use --sev-color.
export const PLUS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
<circle cx="6" cy="6" r="6" fill="var(--sev-color)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9 7H3V5H9V7Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5 9L5 3L7 3L7 9L5 9Z" fill="white"/>
</svg>`;

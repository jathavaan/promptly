export const xmlEscape = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const xmlEscapeAttr = (s: string): string => xmlEscape(s);

// Wrap content in CDATA, splitting if it contains the terminator "]]>"
export const cdata = (s: string): string => {
  const safe = s.split(']]>').join(']]]]><![CDATA[>');
  return `<![CDATA[${safe}]]>`;
};

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { usePromptRender } from './usePromptRender';
import { PreviewActions } from './PreviewActions';
import { useTagValidation } from '@/features/tags/hooks/useTagValidation';
import { estimateTokens } from '@/utils/tokenEstimate';

const PreShell = styled('div')(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5),
  background: '#0f1320',
  color: '#e8ecff',
  borderRadius: theme.shape.borderRadius,
  fontFamily:
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '0.8125rem',
  lineHeight: 1.55,
  overflowX: 'hidden',
  overflowY: 'auto',
  flexGrow: 1,
  maxHeight: 'calc(100vh - 220px)',
  minWidth: 0,
  width: '100%',
}));

const Line = styled('div')({
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  minHeight: '1em',
  tabSize: 4,
});

const TAB_WIDTH = 4;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const colorize = (escapedLine: string): string =>
  escapedLine
    .replace(
      /(&lt;\/?)([a-zA-Z_][a-zA-Z0-9._:-]*)/g,
      (_m, p1, p2) => `${p1}<span style="color:#7fd1ff">${p2}</span>`,
    )
    .replace(
      /([a-zA-Z_][a-zA-Z0-9._:-]*)=(&quot;[^&]*?&quot;)/g,
      (_m, name, val) =>
        `<span style="color:#ffb86b">${name}</span>=<span style="color:#a8ff8b">${val}</span>`,
    )
    .replace(
      /(&lt;\?xml[^?]*\?&gt;)/g,
      (_m, decl) => `<span style="color:#9aa0d6">${decl}</span>`,
    );

interface RenderedLine {
  indent: number;
  html: string;
}

const splitLines = (xml: string): RenderedLine[] =>
  xml.split('\n').map((line) => {
    const m = line.match(/^[\t ]*/);
    const raw = m ? m[0] : '';
    let visual = 0;
    for (const ch of raw) visual += ch === '\t' ? TAB_WIDTH : 1;
    const rest = line.slice(raw.length);
    return { indent: visual, html: colorize(escapeHtml(rest)) };
  });

export const Preview = () => {
  const xml = usePromptRender('clean');
  const validation = useTagValidation();
  const lines = useMemo(() => splitLines(xml), [xml]);

  return (
    <Stack spacing={1.5} sx={{ height: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          Preview
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {xml.length.toLocaleString()} chars · ~{estimateTokens(xml).toLocaleString()} tokens
        </Typography>
      </Box>
      {validation.totalErrors > 0 && (
        <Typography variant="caption" color="error">
          {validation.totalErrors} validation error{validation.totalErrors === 1 ? '' : 's'} —
          fix before copying.
        </Typography>
      )}
      <PreviewActions xml={xml} disabled={validation.totalErrors > 0} />
      <PreShell>
        {lines.map((line, i) => (
          <Line
            key={i}
            style={{ paddingLeft: `${line.indent}ch` }}
            dangerouslySetInnerHTML={{ __html: line.html || '&#8203;' }}
          />
        ))}
      </PreShell>
    </Stack>
  );
};

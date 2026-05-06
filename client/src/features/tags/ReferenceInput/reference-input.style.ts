import { styled } from '@mui/material/styles';

export const Editable = styled('div')(({ theme }) => ({
  minHeight: 80,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(1.25, 1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontFamily:
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '0.875rem',
  lineHeight: 1.55,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  outline: 'none',
  backgroundColor: theme.palette.background.paper,
  '&:focus': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}22`,
  },
  '&[data-empty="true"]::before': {
    content: 'attr(data-placeholder)',
    color: theme.palette.text.disabled,
    pointerEvents: 'none',
  },
  '& .ref-chip': {
    display: 'inline-block',
    padding: '1px 6px',
    margin: '0 2px',
    borderRadius: 12,
    backgroundColor: theme.palette.primary.main + '14',
    color: theme.palette.primary.main,
    fontWeight: 500,
    border: `1px solid ${theme.palette.primary.main}33`,
    cursor: 'default',
    userSelect: 'all',
  },
  '& .ref-chip::before': { content: '"<"' },
  '& .ref-chip::after': { content: '">"' },
  '& .ref-chip[data-missing="true"]': {
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.main + '14',
    borderColor: theme.palette.error.main + '55',
  },
}));

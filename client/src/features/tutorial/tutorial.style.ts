import { styled } from '@mui/material/styles';

const SHADE = 'rgba(15, 19, 32, 0.62)';

export const TutorialBackdrop = styled('div')(({ theme }) => ({
  position: 'fixed',
  inset: 0,
  background: SHADE,
  zIndex: theme.zIndex.modal + 100,
}));

export const TutorialSpotlight = styled('div')(({ theme }) => ({
  position: 'fixed',
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 0 0 9999px ${SHADE}`,
  border: `2px solid ${theme.palette.primary.main}`,
  pointerEvents: 'none',
  transition:
    'top 200ms ease, left 200ms ease, width 200ms ease, height 200ms ease',
  zIndex: theme.zIndex.modal + 100,
}));

export const TutorialCard = styled('div')(({ theme }) => ({
  position: 'fixed',
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.shadows[8],
  padding: theme.spacing(2),
  zIndex: theme.zIndex.modal + 102,
  transition: 'top 200ms ease, left 200ms ease',
}));

export const TutorialWideCard = styled('div')(({ theme }) => ({
  position: 'fixed',
  width: 560,
  maxWidth: 'calc(100vw - 48px)',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.shadows[12],
  padding: theme.spacing(4),
  zIndex: theme.zIndex.modal + 102,
  transition: 'top 200ms ease, left 200ms ease',
}));

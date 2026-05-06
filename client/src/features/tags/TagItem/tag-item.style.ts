import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

export const TagCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  position: 'relative',
  transition: 'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
  '&[data-disabled="true"]': {
    opacity: 0.55,
  },
  '&[data-pinned="true"]': {
    borderColor: theme.palette.warning.main + '88',
  },
  '&[data-group-target="true"]': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    backgroundColor: theme.palette.primary.main + '0a',
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
  },
}));

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

export const Body = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const Row = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const NowrapRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(0.5),
  flexWrap: 'nowrap',
  minWidth: 0,
}));

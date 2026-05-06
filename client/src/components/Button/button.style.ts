import { styled } from '@mui/material/styles';
import MuiButton from '@mui/material/Button';

export const StyledButton = styled(MuiButton)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  fontWeight: 500,
}));

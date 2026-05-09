import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { StyledFooter } from './footer.style';
import type { FooterProps } from './footer.types';

export const Footer = (props: FooterProps) => (
  <StyledFooter component="footer" {...props}>
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Tooltip title="GitHub">
        <IconButton
          component="a"
          href="https://github.com/jathavaan/promptly"
          target="_blank"
          rel="noopener"
          aria-label="GitHub repository"
          size="small"
        >
          <GitHubIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="LinkedIn">
        <IconButton
          component="a"
          href="https://www.linkedin.com/in/jathavaan-shankarr-a145b6227/"
          target="_blank"
          rel="noopener"
          aria-label="LinkedIn profile"
          size="small"
        >
          <LinkedInIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
    <Typography variant="caption" color="text.secondary">
      promptly · build prompts wrapped in HTML tags · © 2026 Jathavaan Shankarr
    </Typography>
    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
      Vibecoded with hate using Claude
    </Typography>
  </StyledFooter>
);

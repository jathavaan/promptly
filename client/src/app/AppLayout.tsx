import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Tags } from '@/features/tags/Tags';
import { Settings } from '@/features/settings/Settings';
import { Preview } from '@/features/preview/Preview';
import { Library } from '@/features/library/Library';
import { useTagValidation } from '@/features/tags/hooks/useTagValidation';

export const AppLayout = () => {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const v = useTagValidation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar variant="dense">
          <Typography variant="h1" sx={{ flexGrow: 1, fontSize: '1.125rem' }}>
            promptly
          </Typography>
          {v.totalErrors + v.totalWarnings > 0 && (
            <Typography variant="caption" color={v.totalErrors > 0 ? 'error' : 'warning.main'} sx={{ mr: 2 }}>
              {v.totalErrors} error{v.totalErrors === 1 ? '' : 's'} · {v.totalWarnings} warning
              {v.totalWarnings === 1 ? '' : 's'}
            </Typography>
          )}
          <Tooltip title="Library">
            <IconButton onClick={() => setLibraryOpen(true)} aria-label="Open library">
              <BookmarksOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub">
            <IconButton
              component="a"
              href="https://github.com/jathavaan/promptly"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
              <Settings />
            </Paper>
            <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
              <Tags />
            </Paper>
          </Stack>
          <Paper
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              position: { md: 'sticky' },
              top: { md: 48 },
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Preview />
          </Paper>
        </Box>
      </Container>
      <Divider />
      <Box sx={{ py: 1.5, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          promptly · build prompts wrapped in HTML tags
        </Typography>
      </Box>
      <Library open={libraryOpen} onClose={() => setLibraryOpen(false)} />
    </Box>
  );
};

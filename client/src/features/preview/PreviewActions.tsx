import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import { Button } from '@/components/Button/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { renderPrompt, wrapAsMarkdown } from './render';
import { copyToClipboard } from '@/utils/clipboard';
import { downloadText } from '@/utils/download';
import { ImportButton } from '@/features/io/ImportButton';
import { tagsActions } from '@/features/tags/tagsSlice';
import { globalsActions } from '@/features/globals/globalsSlice';

export interface PreviewActionsProps {
  xml: string;
  disabled?: boolean;
}

export const PreviewActions = ({ xml, disabled }: PreviewActionsProps) => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector((s) => s.tags);
  const globals = useAppSelector((s) => s.globals);
  const hasContent = useAppSelector(
    (s) => Object.keys(s.tags.byUuid).length > 0 || s.globals.role.length > 0,
  );
  const [snack, setSnack] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const copy = async (markdown: boolean) => {
    const text = markdown ? wrapAsMarkdown(xml) : xml;
    const ok = await copyToClipboard(text);
    setSnack(ok ? (markdown ? 'Copied as Markdown' : 'Copied') : 'Copy failed');
  };

  const download = () => {
    const promptly = renderPrompt({ tags, globals }, 'promptly');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadText(`promptly-${stamp}.xml`, 'application/xml', promptly);
    setSnack('Downloaded');
  };

  const confirmClear = () => {
    dispatch(tagsActions.clearAll());
    dispatch(globalsActions.reset());
    setClearOpen(false);
    setSnack('Cleared');
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: 'wrap' }}
        data-tutorial="preview-actions"
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={() => copy(false)}
          disabled={disabled}
        >
          Copy
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DescriptionOutlinedIcon />}
          onClick={() => copy(true)}
          disabled={disabled}
        >
          Copy as Markdown
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={download}
        >
          Download XML
        </Button>
        <ImportButton
          renderTrigger={(open) => (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileUploadOutlinedIcon />}
              onClick={open}
            >
              Import XML
            </Button>
          )}
          onResult={setSnack}
        />
        <Button
          variant="outlined"
          size="small"
          startIcon={<DeleteSweepOutlinedIcon />}
          onClick={() => setClearOpen(true)}
          disabled={!hasContent}
        >
          Clear
        </Button>
      </Stack>
      <Dialog open={clearOpen} onClose={() => setClearOpen(false)}>
        <DialogTitle>Clear prompt?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This removes all tags and resets globals. This cannot be undone — download or
            keep a copy first if you want to keep your work.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmClear}>
            Clear
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        message={snack ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

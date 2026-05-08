import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { Button } from '@/components/Button/Button';
import { useAppSelector } from '@/app/hooks';
import { renderPrompt, wrapAsMarkdown } from './render';
import { copyToClipboard } from '@/utils/clipboard';
import { downloadText } from '@/utils/download';
import { ImportButton } from '@/features/io/ImportButton';

export interface PreviewActionsProps {
  xml: string;
  disabled?: boolean;
}

export const PreviewActions = ({ xml, disabled }: PreviewActionsProps) => {
  const tags = useAppSelector((s) => s.tags);
  const settings = useAppSelector((s) => s.settings);
  const [snack, setSnack] = useState<string | null>(null);

  const copy = async (markdown: boolean) => {
    const text = markdown ? wrapAsMarkdown(xml) : xml;
    const ok = await copyToClipboard(text);
    setSnack(ok ? (markdown ? 'Copied as Markdown' : 'Copied') : 'Copy failed');
  };

  const download = () => {
    const promptly = renderPrompt({ tags, settings }, 'promptly');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadText(`promptly-${stamp}.xml`, 'application/xml', promptly);
    setSnack('Downloaded');
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
      </Stack>
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

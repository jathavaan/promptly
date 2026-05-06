import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@/components/Button/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { tagsActions } from '@/features/tags/tagsSlice';
import { settingsActions } from '@/features/settings/settingsSlice';
import { importPromptlyXml, ImportError } from './importXml';
import { readFileAsText } from '@/utils/fileRead';
import type { ImportResult } from './importXml';

export interface ImportButtonProps {
  renderTrigger: (open: () => void) => React.ReactNode;
  onResult?: (msg: string) => void;
}

export const ImportButton = ({ renderTrigger, onResult }: ImportButtonProps) => {
  const dispatch = useAppDispatch();
  const [staged, setStaged] = useState<ImportResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasContent = useAppSelector(
    (s) => Object.keys(s.tags.byUuid).length > 0 || s.settings.role.length > 0,
  );

  const applyParsed = (parsed: ImportResult) => {
    dispatch(tagsActions.replaceAll(parsed.tags));
    dispatch(settingsActions.replaceAll(parsed.settings));
    onResult?.('Imported');
  };

  const handleFile = async (file: File) => {
    try {
      const text = await readFileAsText(file);
      const parsed = importPromptlyXml(text);
      if (hasContent) {
        setStaged(parsed);
        setConfirmOpen(true);
      } else {
        applyParsed(parsed);
      }
    } catch (err) {
      const msg = err instanceof ImportError ? err.message : 'Import failed.';
      onResult?.(msg);
    }
  };

  const apply = () => {
    if (staged) applyParsed(staged);
    setStaged(null);
    setConfirmOpen(false);
  };

  const cancel = () => {
    setStaged(null);
    setConfirmOpen(false);
    onResult?.('Import cancelled');
  };

  const openPicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml,application/xml,text/xml';
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      if (f) handleFile(f);
    });
    input.click();
  };

  return (
    <>
      {renderTrigger(openPicker)}
      <Dialog open={confirmOpen} onClose={cancel}>
        <DialogTitle>Replace current prompt?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Importing this file will replace the tags and settings you currently have. This
            cannot be undone — save your current work first if you want to keep it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>Cancel</Button>
          <Button variant="contained" color="error" onClick={apply}>
            Replace
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

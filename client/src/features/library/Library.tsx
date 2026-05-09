import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Button } from '@/components/Button/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { libraryActions } from './librarySlice';
import { tagsActions } from '@/features/tags/tagsSlice';
import { globalsActions } from '@/features/globals/globalsSlice';
import type { LibraryKind, PromptlyFile, SavedItem } from './types';
import type { Tag } from '@/features/tags/types';
import { nanoid } from 'nanoid';


interface LibraryProps {
  open: boolean;
  onClose: () => void;
}

const cloneWithFreshUuids = (file: PromptlyFile): PromptlyFile => {
  const idMap = new Map<string, string>();
  for (const oldUuid of Object.keys(file.tags.byUuid)) {
    idMap.set(oldUuid, nanoid());
  }
  const remap = (u: string) => idMap.get(u) ?? u;
  const remapText = (s: string) =>
    s.replace(/\{\{ref:([A-Za-z0-9_-]+)\}\}/g, (m, u) => {
      const n = idMap.get(u);
      return n ? `{{ref:${n}}}` : m;
    });
  const newByUuid: Record<string, Tag> = {};
  for (const [oldUuid, tag] of Object.entries(file.tags.byUuid)) {
    const fresh = remap(oldUuid);
    newByUuid[fresh] = {
      ...tag,
      uuid: fresh,
      parentUuid: tag.parentUuid ? remap(tag.parentUuid) : null,
      textValue: remapText(tag.textValue),
      listValue: tag.listValue.map((i) => ({
        ...i,
        uuid: nanoid(),
        text: remapText(i.text),
      })),
      exampleValue: tag.exampleValue.map((e) => ({
        ...e,
        uuid: nanoid(),
        input: remapText(e.input),
        output: remapText(e.output),
      })),
    };
  }
  const newChildOrder: Record<string, string[]> = {};
  for (const [parent, kids] of Object.entries(file.tags.childOrder)) {
    newChildOrder[remap(parent)] = kids.map(remap);
  }
  return {
    ...file,
    tags: {
      byUuid: newByUuid,
      rootOrder: file.tags.rootOrder.map(remap),
      childOrder: newChildOrder,
    },
  };
};

export const Library = ({ open, onClose }: LibraryProps) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.library.items);
  const tags = useAppSelector((s) => s.tags);
  const globals = useAppSelector((s) => s.globals);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<LibraryKind>('prompt');
  const [pendingDelete, setPendingDelete] = useState<SavedItem | null>(null);

  const trimmed = name.trim();
  const nameTaken =
    trimmed.length > 0 && items.some((i) => i.kind === kind && i.name === trimmed);

  const handleSave = () => {
    if (!trimmed || nameTaken) return;
    const payload: PromptlyFile = { version: 1, tags, globals };
    dispatch(libraryActions.save({ name: trimmed, kind, payload }));
    setName('');
  };

  const handleLoad = (item: SavedItem) => {
    const fresh = cloneWithFreshUuids(item.payload);
    dispatch(tagsActions.replaceAll(fresh.tags));
    dispatch(globalsActions.replaceAll(fresh.globals));
    onClose();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    dispatch(libraryActions.remove(pendingDelete.uuid));
    setPendingDelete(null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 380 } } }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
          <Typography variant="h2" sx={{ flexGrow: 1 }}>
            Library
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Stack spacing={1}>
          <TextField
            size="small"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paragraph rewrite — formal"
            error={nameTaken}
            helperText={nameTaken ? `A ${kind} with this name already exists` : ' '}
          />
          <ToggleButtonGroup
            size="small"
            value={kind}
            exclusive
            onChange={(_, v: LibraryKind | null) => v && setKind(v)}
            fullWidth
          >
            <ToggleButton value="prompt">Save as prompt</ToggleButton>
            <ToggleButton value="template">Save as template</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSave}
            disabled={!trimmed || nameTaken}
          >
            Save current state
          </Button>
          <Alert severity="warning" variant="outlined" sx={{ py: 0.25 }}>
            Saved items live only in this browser&apos;s local storage — clearing
            site data, using a different browser, or switching device will erase
            them. Export anything you want to keep to a file.
          </Alert>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">
          {items.length === 0 ? 'No saved items yet.' : `${items.length} item${items.length === 1 ? '' : 's'}`}
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {items.map((it) => (
            <Box
              key={it.uuid}
              sx={{
                p: 1.25,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 500, flexGrow: 1 }} noWrap>
                  {it.name}
                </Typography>
                <Chip
                  size="small"
                  label={it.kind}
                  color={it.kind === 'template' ? 'secondary' : 'primary'}
                  variant="outlined"
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {new Date(it.createdAt).toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Load into editor">
                  <IconButton size="small" onClick={() => handleLoad(it)}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate">
                  <IconButton size="small" onClick={() => dispatch(libraryActions.duplicate(it.uuid))}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setPendingDelete(it)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete {pendingDelete?.kind}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &ldquo;{pendingDelete?.name}&rdquo; will be removed from your library.
            This cannot be undone — export it first if you want to keep a copy.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

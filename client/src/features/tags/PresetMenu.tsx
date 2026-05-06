import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import { Button } from '@/components/Button/Button';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useAppDispatch } from '@/app/hooks';
import { tagsActions } from './tagsSlice';
import type { InputType } from './types';

interface Preset {
  id: string;
  type: InputType;
  description: string;
}

const PRESETS: Preset[] = [
  { id: 'context', type: 'text', description: 'Background info' },
  { id: 'task', type: 'text', description: 'What to do' },
  { id: 'instructions', type: 'text', description: 'Step-by-step instructions' },
  { id: 'rules', type: 'list', description: 'Constraints / dos and donts' },
  { id: 'input', type: 'text', description: 'The thing to operate on' },
  { id: 'document', type: 'text', description: 'Document to process' },
  { id: 'example', type: 'example', description: 'Few-shot example pairs' },
  { id: 'output_format', type: 'text', description: 'Shape of the answer' },
  { id: 'important', type: 'text', description: 'Non-negotiable rules' },
];

export const PresetMenu = () => {
  const dispatch = useAppDispatch();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<LibraryAddIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        Add preset
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 280 } } }}
      >
        {PRESETS.map((p) => (
          <MenuItem
            key={p.id}
            onClick={() => {
              dispatch(tagsActions.addPresetTag({ id: p.id, type: p.type }));
              setAnchor(null);
            }}
          >
            <ListItemText
              primary={`<${p.id}>`}
              secondary={`${p.type} · ${p.description}`}
              slotProps={{ primary: { sx: { fontFamily: 'monospace' } } }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

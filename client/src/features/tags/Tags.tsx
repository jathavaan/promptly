import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Button } from '@/components/Button/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { tagsActions } from './tagsSlice';
import { TagList } from './TagList';
import { PresetMenu } from './PresetMenu';

export const Tags = () => {
  const dispatch = useAppDispatch();
  const total = useAppSelector((s) => Object.keys(s.tags.byUuid).length);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          Tags{total > 0 ? ` (${total})` : ''}
        </Typography>
        <PresetMenu />
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => dispatch(tagsActions.addPresetTag({ id: 'tag', type: 'text' }))}
        >
          Add tag
        </Button>
      </Box>
      {total === 0 ? (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            No tags yet. Add a preset, a blank tag, or seed a starter layout based on common
            prompting patterns (role, task, rules, output format, important).
          </Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoFixHighIcon />}
              onClick={() => dispatch(tagsActions.seedStarter())}
            >
              Insert starter layout
            </Button>
          </Box>
        </Stack>
      ) : (
        <TagList parentUuid={null} />
      )}
    </Stack>
  );
};

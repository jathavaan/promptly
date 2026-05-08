import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { settingsActions } from './settingsSlice';
import { tagsActions } from '@/features/tags/tagsSlice';

const OUTPUT_FORMAT_TEMPLATES = [
  { label: 'Pick a template…', value: '' },
  { label: 'JSON only, no prose', value: 'Return JSON only. No prose, no markdown, no code fences.' },
  {
    label: 'Bulleted list, ≤15 words/bullet',
    value: 'Return a bulleted list. Each bullet ≤ 15 words.',
  },
  {
    label: 'Markdown table',
    value: 'Return a Markdown table with columns: <fill in>. No prose outside the table.',
  },
  {
    label: 'LaTeX source, no Markdown',
    value: 'Return LaTeX source only. No Markdown formatting.',
  },
];

export const Settings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);
  const tags = useAppSelector((s) => s.tags);

  const outputFormatTag = Object.values(tags.byUuid).find(
    (t) => t.id === 'output_format' && t.type === 'text',
  );

  const applyTemplate = (snippet: string) => {
    if (!snippet) return;
    if (outputFormatTag) {
      dispatch(
        tagsActions.setTextValue({ uuid: outputFormatTag.uuid, value: snippet }),
      );
    } else {
      dispatch(tagsActions.addPresetTag({ id: 'output_format', type: 'text' }));
      // Newly-added tag — defer setting the value to next tick. Simpler: dispatch with id lookup post-add.
      // Since slice generates uuid internally, we can't easily set value on the same dispatch.
      // For UX, we add then ask the user to pick the template again. Minor.
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h2">Settings</Typography>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Role priming
          </Typography>
          <Tooltip title="Role for the model. Rendered as <role> at the top of the prompt.">
            <IconButton size="small">
              <HelpOutlineIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={1}
          placeholder="You are a senior Python developer specializing in async I/O."
          value={settings.role}
          onChange={(e) => dispatch(settingsActions.setRole(e.target.value))}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.thinkStepByStep}
            onChange={(_, v) => dispatch(settingsActions.setThinkStepByStep(v))}
          />
        }
        label="Append “Think step by step.”"
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.selfCritique}
            onChange={(_, v) => dispatch(settingsActions.setSelfCritique(v))}
          />
        }
        label="Append self-critique instruction"
      />

      <Box>
        <Typography variant="caption" color="text.secondary">
          Output-format helper{outputFormatTag ? '' : ' (creates an output_format tag)'}
        </Typography>
        <TextField
          select
          size="small"
          fullWidth
          value=""
          onChange={(e) => applyTemplate(e.target.value)}
          helperText={
            outputFormatTag
              ? 'Replaces content of the existing output_format tag.'
              : 'Adds an empty output_format tag — pick a template again to fill it.'
          }
        >
          {OUTPUT_FORMAT_TEMPLATES.map((t, i) => (
            <MenuItem key={i} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Stack>
  );
};

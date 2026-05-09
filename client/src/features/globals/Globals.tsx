import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { globalsActions } from './globalsSlice';

export const Globals = () => {
  const dispatch = useAppDispatch();
  const globals = useAppSelector((s) => s.globals);

  return (
    <Stack spacing={2}>
      <Typography variant="h2">Globals</Typography>

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
          value={globals.role}
          onChange={(e) => dispatch(globalsActions.setRole(e.target.value))}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={globals.thinkStepByStep}
            onChange={(_, v) => dispatch(globalsActions.setThinkStepByStep(v))}
          />
        }
        label="Append “Think step by step.”"
      />
      <FormControlLabel
        control={
          <Switch
            checked={globals.selfCritique}
            onChange={(_, v) => dispatch(globalsActions.setSelfCritique(v))}
          />
        }
        label="Append self-critique instruction"
      />
    </Stack>
  );
};

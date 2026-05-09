import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import { Button } from '@/components/Button/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { tagsActions } from './tagsSlice';
import { globalsActions } from '@/features/globals/globalsSlice';
import { TagList } from './TagList';
import { PresetMenu } from './PresetMenu';

export const Tags = () => {
  const dispatch = useAppDispatch();
  const [splitAnchor, setSplitAnchor] = useState<HTMLElement | null>(null);
  const total = useAppSelector((s) => Object.keys(s.tags.byUuid).length);
  const staticCount = useAppSelector(
    (s) => Object.values(s.tags.byUuid).filter((t) => t.static).length,
  );
  const showStatic = useAppSelector((s) => s.globals.showStaticInBuilder);
  const visibleRootCount = useAppSelector((s) =>
    showStatic
      ? s.tags.rootOrder.length
      : s.tags.rootOrder.filter((u) => !s.tags.byUuid[u]?.static).length,
  );
  const allRootHidden = total > 0 && visibleRootCount === 0;

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          Tags{total > 0 ? ` (${total})` : ''}
        </Typography>
        {staticCount > 0 && (
          <Tooltip
            title={
              showStatic
                ? `Hide ${staticCount} static field${staticCount === 1 ? '' : 's'}`
                : `Show ${staticCount} static field${staticCount === 1 ? '' : 's'}`
            }
          >
            <IconButton
              size="small"
              color={showStatic ? 'secondary' : 'default'}
              onClick={() => dispatch(globalsActions.setShowStaticInBuilder(!showStatic))}
              aria-label="Toggle static field visibility"
            >
              {showStatic ? (
                <LockOpenOutlinedIcon fontSize="small" />
              ) : (
                <LockOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
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
        <>
          <TagList parentUuid={null} />
          {allRootHidden && (
            <Typography variant="body2" color="text.secondary">
              All root tags are static. Toggle the lock icon to reveal them.
            </Typography>
          )}
        </>
      )}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
        data-tutorial="add-controls"
      >
        <PresetMenu />
        <ButtonGroup variant="contained" size="small">
          <Button
            startIcon={<AddIcon />}
            onClick={() => dispatch(tagsActions.addPresetTag({ id: 'tag', type: 'text' }))}
          >
            Add tag
          </Button>
          <Button
            size="small"
            aria-label="More add options"
            aria-haspopup="menu"
            aria-expanded={Boolean(splitAnchor)}
            onClick={(e) => setSplitAnchor(e.currentTarget)}
            sx={{ px: 0.5, minWidth: 32 }}
          >
            <ArrowDropDownIcon fontSize="small" />
          </Button>
        </ButtonGroup>
        <Menu
          anchorEl={splitAnchor}
          open={Boolean(splitAnchor)}
          onClose={() => setSplitAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              dispatch(tagsActions.addPresetTag({ id: 'tag', type: 'text' }));
              setSplitAnchor(null);
            }}
          >
            <ListItemText primary="Add tag" secondary="Single field" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              dispatch(tagsActions.addPresetTag({ id: 'group', type: 'group' }));
              setSplitAnchor(null);
            }}
          >
            <ListItemText primary="Add group" secondary="Container for nested tags" />
          </MenuItem>
        </Menu>
      </Box>
    </Stack>
  );
};

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAppDispatch } from '@/app/hooks';
import { tagsActions } from '@/features/tags/tagsSlice';
import { ReferenceInput } from '@/features/tags/ReferenceInput/ReferenceInput';
import { useRefCandidates } from '@/features/tags/hooks/useRefCandidates';
import { estimateTokens } from '@/utils/tokenEstimate';
import type { InputType, ListStyle } from '@/features/tags/types';
import type { TagItemProps } from './tag-item.types';
import { Body, Header, NowrapRow, Row, TagCard } from './tag-item.style';
import { TagList } from '@/features/tags/TagList';

const TYPE_OPTIONS: { value: InputType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'list', label: 'List' },
  { value: 'example', label: 'Example' },
];

export const TagItem = ({ tag, issues, isGroupTarget }: TagItemProps) => {
  const dispatch = useAppDispatch();
  const candidates = useRefCandidates(tag.uuid);
  const [notesAnchor, setNotesAnchor] = useState<HTMLElement | null>(null);
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: tag.uuid,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');

  const charCount =
    tag.type === 'text'
      ? tag.textValue.length
      : tag.type === 'list'
        ? tag.listValue.reduce((a, i) => a + i.text.length, 0)
        : tag.type === 'example'
          ? tag.exampleValue.reduce((a, e) => a + e.input.length + e.output.length, 0)
          : tag.type === 'checkbox'
            ? (tag.checkboxValue ? 4 : 5)
            : 0;

  return (
    <TagCard
      ref={setNodeRef}
      style={style}
      data-disabled={tag.disabled}
      data-pinned={tag.pinned}
      data-group-target={isGroupTarget ? 'true' : undefined}
    >
      <Header>
        <IconButton
          size="small"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab' }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        <TextField
          size="small"
          label="ID"
          value={tag.id}
          onChange={(e) => dispatch(tagsActions.setTagId({ uuid: tag.uuid, id: e.target.value }))}
          error={errors.some((er) => er.message.toLowerCase().includes('id'))}
          slotProps={{ htmlInput: { spellCheck: false, style: { fontFamily: 'monospace' } } }}
          sx={{ width: 180 }}
        />
        {tag.type !== 'group' && (
          <TextField
            size="small"
            select
            label="Type"
            value={tag.type}
            onChange={(e) =>
              dispatch(
                tagsActions.setTagType({ uuid: tag.uuid, type: e.target.value as InputType }),
              )
            }
            sx={{ width: 130 }}
          >
            {TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={tag.pinned ? 'Pinned to end' : 'Pin to end'}>
          <IconButton
            size="small"
            color={tag.pinned ? 'warning' : 'default'}
            onClick={() =>
              dispatch(
                tagsActions.setFlag({ uuid: tag.uuid, flag: 'pinned', value: !tag.pinned }),
              )
            }
            aria-label="Toggle pin"
          >
            {tag.pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={tag.disabled ? 'Excluded from output' : 'Include in output'}>
          <IconButton
            size="small"
            color={tag.disabled ? 'default' : 'primary'}
            onClick={() =>
              dispatch(
                tagsActions.setFlag({
                  uuid: tag.uuid,
                  flag: 'disabled',
                  value: !tag.disabled,
                }),
              )
            }
            aria-label="Toggle enabled"
          >
            {tag.disabled ? (
              <VisibilityOffOutlinedIcon fontSize="small" />
            ) : (
              <VisibilityOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            tag.static
              ? 'Static — hidden from builder, kept in output'
              : 'Mark as static (hide from builder)'
          }
        >
          <IconButton
            size="small"
            color={tag.static ? 'secondary' : 'default'}
            onClick={() =>
              dispatch(
                tagsActions.setFlag({ uuid: tag.uuid, flag: 'static', value: !tag.static }),
              )
            }
            aria-label="Toggle static"
          >
            {tag.static ? (
              <LockOutlinedIcon fontSize="small" />
            ) : (
              <LockOpenOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Notes (not emitted)">
          <IconButton
            size="small"
            color={tag.notes ? 'primary' : 'default'}
            onClick={(e) => setNotesAnchor(e.currentTarget)}
            aria-label="Notes"
          >
            <StickyNote2OutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate">
          <IconButton
            size="small"
            onClick={() => dispatch(tagsActions.duplicateTag(tag.uuid))}
            aria-label="Duplicate tag"
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => dispatch(tagsActions.removeTag(tag.uuid))}
            aria-label="Delete tag"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Header>

      <Body>
        {tag.type === 'text' && (
          <ReferenceInput
            value={tag.textValue}
            onChange={(v) => dispatch(tagsActions.setTextValue({ uuid: tag.uuid, value: v }))}
            candidates={candidates}
            placeholder="Type content. Type < to reference another tag."
            ariaLabel={`${tag.id} content`}
          />
        )}
        {tag.type === 'checkbox' && (
          <FormControlLabel
            control={
              <Switch
                checked={tag.checkboxValue}
                onChange={(_, v) =>
                  dispatch(tagsActions.setCheckboxValue({ uuid: tag.uuid, value: v }))
                }
              />
            }
            label={tag.checkboxValue ? 'true' : 'false'}
          />
        )}
        {tag.type === 'list' && (
          <Stack spacing={1}>
            <Row>
              <TextField
                size="small"
                select
                label="List style"
                value={tag.listStyle ?? 'unordered'}
                onChange={(e) =>
                  dispatch(
                    tagsActions.setListStyle({
                      uuid: tag.uuid,
                      style: e.target.value as ListStyle,
                    }),
                  )
                }
                sx={{ width: 220 }}
              >
                <MenuItem value="unordered">Unordered (- item)</MenuItem>
                <MenuItem value="ordered">Ordered (1. item)</MenuItem>
                <MenuItem value="checked">Checked ([x] item)</MenuItem>
                <MenuItem value="xml">XML items</MenuItem>
              </TextField>
              {tag.listStyle === 'xml' && (
                <TextField
                  size="small"
                  label="Child element"
                  value={tag.listChildName ?? 'item'}
                  onChange={(e) =>
                    dispatch(
                      tagsActions.setListChildName({ uuid: tag.uuid, name: e.target.value }),
                    )
                  }
                  slotProps={{ htmlInput: { spellCheck: false, style: { fontFamily: 'monospace' } } }}
                  sx={{ width: 180 }}
                />
              )}
            </Row>
            {tag.listValue.map((item, index) => (
              <NowrapRow key={item.uuid}>
                {tag.listStyle === 'checked' && (
                  <Checkbox
                    size="small"
                    checked={item.checked}
                    onChange={(_, v) =>
                      dispatch(
                        tagsActions.setListItemChecked({
                          uuid: tag.uuid,
                          itemUuid: item.uuid,
                          checked: v,
                        }),
                      )
                    }
                    sx={{ flexShrink: 0, mt: 0.25 }}
                  />
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <ReferenceInput
                    value={item.text}
                    onChange={(v) =>
                      dispatch(
                        tagsActions.setListItemText({
                          uuid: tag.uuid,
                          itemUuid: item.uuid,
                          text: v,
                        }),
                      )
                    }
                    candidates={candidates}
                    minRows={1}
                    placeholder={`Item ${index + 1}`}
                    ariaLabel={`item ${index + 1}`}
                  />
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    dispatch(
                      tagsActions.removeListItem({ uuid: tag.uuid, itemUuid: item.uuid }),
                    )
                  }
                  aria-label="Remove item"
                  disabled={tag.listValue.length <= 1}
                  sx={{ flexShrink: 0, mt: 0.25 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </NowrapRow>
            ))}
            <Row>
              <IconButton
                size="small"
                onClick={() => dispatch(tagsActions.addListItem({ uuid: tag.uuid }))}
                aria-label="Add item"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                Add list item
              </Typography>
            </Row>
          </Stack>
        )}
        {tag.type === 'example' && (
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {tag.exampleValue.map((ex, idx) => (
              <Box key={ex.uuid}>
                <Row sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Example {idx + 1}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      dispatch(
                        tagsActions.removeExample({ uuid: tag.uuid, exampleUuid: ex.uuid }),
                      )
                    }
                    aria-label="Remove example"
                    disabled={tag.exampleValue.length <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Row>
                <Stack spacing={0.75}>
                  <ReferenceInput
                    value={ex.input}
                    onChange={(v) =>
                      dispatch(
                        tagsActions.setExample({
                          uuid: tag.uuid,
                          exampleUuid: ex.uuid,
                          field: 'input',
                          value: v,
                        }),
                      )
                    }
                    candidates={candidates}
                    minRows={2}
                    placeholder="Input"
                    ariaLabel={`example ${idx + 1} input`}
                  />
                  <ReferenceInput
                    value={ex.output}
                    onChange={(v) =>
                      dispatch(
                        tagsActions.setExample({
                          uuid: tag.uuid,
                          exampleUuid: ex.uuid,
                          field: 'output',
                          value: v,
                        }),
                      )
                    }
                    candidates={candidates}
                    minRows={2}
                    placeholder="Ideal output"
                    ariaLabel={`example ${idx + 1} output`}
                  />
                </Stack>
              </Box>
            ))}
            <Row>
              <IconButton
                size="small"
                onClick={() => dispatch(tagsActions.addExample({ uuid: tag.uuid }))}
                aria-label="Add example"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                Add example
              </Typography>
            </Row>
          </Stack>
        )}
        {tag.type === 'group' && (
          <Stack spacing={1}>
            <TagList parentUuid={tag.uuid} />
            <Row>
              <IconButton
                size="small"
                onClick={() =>
                  dispatch(
                    tagsActions.addPresetTag({
                      id: 'tag',
                      type: 'text',
                      parentUuid: tag.uuid,
                    }),
                  )
                }
                aria-label="Add child tag"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                Add child to group
              </Typography>
            </Row>
          </Stack>
        )}
      </Body>

      <Row>
        <Typography variant="caption" color="text.secondary">
          {charCount.toLocaleString()} chars · ~{estimateTokens('x'.repeat(charCount))} tokens
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {errors.length > 0 && (
          <Tooltip
            title={
              <Box>
                {errors.map((e, i) => (
                  <div key={i}>{e.message}</div>
                ))}
              </Box>
            }
          >
            <ErrorOutlineIcon fontSize="small" color="error" />
          </Tooltip>
        )}
        {warnings.length > 0 && (
          <Tooltip
            title={
              <Box>
                {warnings.map((w, i) => (
                  <div key={i}>{w.message}</div>
                ))}
              </Box>
            }
          >
            <WarningAmberIcon fontSize="small" color="warning" />
          </Tooltip>
        )}
      </Row>

      <Popover
        open={Boolean(notesAnchor)}
        anchorEl={notesAnchor}
        onClose={() => setNotesAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Typography variant="caption" color="text.secondary">
            Notes (never appear in the output)
          </Typography>
          <TextField
            size="small"
            multiline
            minRows={3}
            value={tag.notes}
            onChange={(e) =>
              dispatch(tagsActions.setNotes({ uuid: tag.uuid, notes: e.target.value }))
            }
            fullWidth
            sx={{ mt: 1 }}
          />
        </Box>
      </Popover>
    </TagCard>
  );
};

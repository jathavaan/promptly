import { useEffect, useRef, useState, useCallback } from 'react';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { REF_REGEX } from '@/features/tags/types';
import { Editable } from './reference-input.style';
import { useReferenceSuggestions } from './useReferenceSuggestions';
import type { RefCandidate, ReferenceInputProps } from './reference-input.types';

const ZWSP = '​';

const makeChipNode = (uuid: string, id: string | null): HTMLSpanElement => {
  const span = document.createElement('span');
  span.className = 'ref-chip';
  span.contentEditable = 'false';
  span.setAttribute('data-ref', uuid);
  if (id === null) {
    span.setAttribute('data-missing', 'true');
    span.textContent = 'missing';
  } else {
    span.textContent = id;
  }
  return span;
};

const readDom = (el: HTMLElement): string => {
  let out = '';
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += (child.textContent ?? '').replace(new RegExp(ZWSP, 'g'), '');
      } else if (child instanceof HTMLElement) {
        const ref = child.dataset.ref ?? child.getAttribute('data-ref');
        if (ref) {
          out += `{{ref:${ref}}}`;
        } else if (child.tagName === 'BR') {
          out += '\n';
        } else if (child.tagName === 'DIV' || child.tagName === 'P') {
          if (out.length > 0 && !out.endsWith('\n')) out += '\n';
          walk(child);
        } else if (child.classList.contains('ref-chip')) {
          const id = child.textContent?.trim();
          if (id) out += `<${id}>`;
        } else {
          walk(child);
        }
      }
    }
  };
  walk(el);
  return out;
};

const writeDom = (el: HTMLElement, value: string, candidates: RefCandidate[]) => {
  el.innerHTML = '';
  if (value.length === 0) return;
  const lookup = new Map(candidates.map((c) => [c.uuid, c.id]));
  let last = 0;
  REF_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REF_REGEX.exec(value)) !== null) {
    if (m.index > last) {
      el.appendChild(document.createTextNode(value.slice(last, m.index)));
    }
    const uuid = m[1];
    el.appendChild(makeChipNode(uuid, lookup.get(uuid) ?? null));
    last = m.index + m[0].length;
  }
  if (last < value.length) {
    el.appendChild(document.createTextNode(value.slice(last)));
  }
};

export const ReferenceInput = ({
  value,
  onChange,
  candidates,
  placeholder,
  minRows = 3,
  ariaLabel,
}: ReferenceInputProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<{ node: Text; offset: number } | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [empty, setEmpty] = useState(value.length === 0);

  const filtered = useReferenceSuggestions(candidates, query);

  useEffect(() => {
    if (!ref.current) return;
    const current = readDom(ref.current);
    if (current === value) {
      setEmpty(value.length === 0);
      return;
    }
    writeDom(ref.current, value, candidates);
    setEmpty(value.length === 0);
  }, [value, candidates]);

  const closeTrigger = useCallback(() => {
    triggerRef.current = null;
    setAnchor(null);
    setQuery('');
    setActiveIdx(0);
  }, []);

  const handleInput = () => {
    if (!ref.current) return;
    const v = readDom(ref.current);
    setEmpty(v.length === 0);
    onChange(v);

    if (triggerRef.current) {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) {
        closeTrigger();
        return;
      }
      const range = sel.getRangeAt(0);
      try {
        const queryRange = document.createRange();
        queryRange.setStart(triggerRef.current.node, triggerRef.current.offset);
        queryRange.setEnd(range.endContainer, range.endOffset);
        const q = queryRange.toString();
        if (/[\s<>]/.test(q)) {
          closeTrigger();
        } else {
          setQuery(q);
          setActiveIdx(0);
        }
      } catch {
        closeTrigger();
      }
    }
  };

  const commit = (cand: RefCandidate) => {
    if (!triggerRef.current || !ref.current) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const del = document.createRange();
    try {
      del.setStart(triggerRef.current.node, triggerRef.current.offset - 1);
      del.setEnd(range.endContainer, range.endOffset);
      del.deleteContents();
    } catch {
      closeTrigger();
      return;
    }
    const chip = makeChipNode(cand.uuid, cand.id);
    del.insertNode(chip);
    const trailing = document.createTextNode(ZWSP);
    chip.parentNode?.insertBefore(trailing, chip.nextSibling);
    const next = document.createRange();
    next.setStart(trailing, 1);
    next.collapse(true);
    sel.removeAllRanges();
    sel.addRange(next);
    closeTrigger();
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (anchor) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) =>
          filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length,
        );
        return;
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && filtered.length > 0) {
        e.preventDefault();
        commit(filtered[activeIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTrigger();
        return;
      }
    }

    if (e.key === '<') {
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const r = sel.getRangeAt(0);
        const node = r.endContainer;
        if (node.nodeType !== Node.TEXT_NODE) return;
        triggerRef.current = { node: node as Text, offset: r.endOffset };
        setQuery('');
        setActiveIdx(0);
        setAnchor(ref.current);
      });
    }
  };

  return (
    <>
      <Editable
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        spellCheck
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(closeTrigger, 150)}
        data-placeholder={placeholder ?? ''}
        data-empty={empty}
        sx={{ minHeight: minRows * 24 }}
      />
      <Popper
        open={Boolean(anchor) && filtered.length > 0}
        anchorEl={anchor}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <Paper sx={{ minWidth: 220, maxHeight: 240, overflow: 'auto', boxShadow: 3 }}>
          <List dense disablePadding>
            {filtered.map((c, i) => (
              <ListItemButton
                key={c.uuid}
                selected={i === activeIdx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(c);
                }}
              >
                <ListItemText
                  primary={`<${c.id}>`}
                  slotProps={{ primary: { sx: { fontFamily: 'monospace' } } }}
                />
              </ListItemButton>
            ))}
          </List>
          {filtered.length === 0 && (
            <Typography variant="caption" sx={{ p: 1, display: 'block' }}>
              No matches
            </Typography>
          )}
        </Paper>
      </Popper>
    </>
  );
};

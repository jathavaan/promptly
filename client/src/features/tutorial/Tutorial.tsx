import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@/components/Button/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { tutorialActions } from './tutorialSlice';
import { useTutorialTarget } from './hooks/useTutorialTarget';
import { TUTORIAL_STEPS } from './steps';
import {
  TutorialBackdrop,
  TutorialCard,
  TutorialSpotlight,
  TutorialWideCard,
} from './tutorial.style';
import type { TutorialPlacement } from './tutorial.types';

const SPOT_PAD = 8;
const POPOVER_GAP = 12;
const VIEWPORT_MARGIN = 16;
const CARD_FALLBACK = { w: 360, h: 200 };

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

interface Position {
  top: number;
  left: number;
  fits: boolean;
}

const computeCardPos = (
  rect: DOMRect | null,
  cardW: number,
  cardH: number,
  placement: TutorialPlacement,
): { top: number; left: number } => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const center = {
    top: vh / 2 - cardH / 2,
    left: vw / 2 - cardW / 2,
  };
  if (!rect) return center;

  const horizontalLeft = clamp(
    rect.left + rect.width / 2 - cardW / 2,
    VIEWPORT_MARGIN,
    vw - cardW - VIEWPORT_MARGIN,
  );
  const verticalTop = clamp(
    rect.top + rect.height / 2 - cardH / 2,
    VIEWPORT_MARGIN,
    vh - cardH - VIEWPORT_MARGIN,
  );

  const positions: Record<TutorialPlacement, Position> = {
    bottom: {
      top: rect.bottom + POPOVER_GAP,
      left: horizontalLeft,
      fits: rect.bottom + POPOVER_GAP + cardH <= vh - VIEWPORT_MARGIN,
    },
    top: {
      top: rect.top - cardH - POPOVER_GAP,
      left: horizontalLeft,
      fits: rect.top - cardH - POPOVER_GAP >= VIEWPORT_MARGIN,
    },
    right: {
      top: verticalTop,
      left: rect.right + POPOVER_GAP,
      fits: rect.right + POPOVER_GAP + cardW <= vw - VIEWPORT_MARGIN,
    },
    left: {
      top: verticalTop,
      left: rect.left - cardW - POPOVER_GAP,
      fits: rect.left - cardW - POPOVER_GAP >= VIEWPORT_MARGIN,
    },
  };

  const order: TutorialPlacement[] =
    placement === 'top'
      ? ['top', 'bottom', 'right', 'left']
      : placement === 'left'
        ? ['left', 'right', 'bottom', 'top']
        : placement === 'right'
          ? ['right', 'left', 'bottom', 'top']
          : ['bottom', 'top', 'right', 'left'];

  for (const p of order) {
    if (positions[p].fits) {
      return { top: positions[p].top, left: positions[p].left };
    }
  }
  return center;
};

export const Tutorial = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.tutorial.open);
  const stepIndex = useAppSelector((s) => s.tutorial.stepIndex);

  const safeIndex = clamp(stepIndex, 0, TUTORIAL_STEPS.length - 1);
  const step = TUTORIAL_STEPS[safeIndex];
  const targetId = open ? step?.targetId : undefined;
  const rect = useTutorialTarget(targetId);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = useState(CARD_FALLBACK);

  useLayoutEffect(() => {
    if (!open || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      setCardSize({ w: r.width, h: r.height });
    }
  }, [open, safeIndex, step?.title, step?.body]);

  const isLast = safeIndex >= TUTORIAL_STEPS.length - 1;
  const isFirst = safeIndex === 0;

  const handleClose = () => dispatch(tutorialActions.close());
  const handleNext = () => {
    if (isLast) handleClose();
    else dispatch(tutorialActions.next());
  };
  const handlePrev = () => {
    if (!isFirst) dispatch(tutorialActions.prev());
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isFirst, isLast]);

  const cardPos = useMemo(
    () =>
      computeCardPos(
        rect,
        cardSize.w,
        cardSize.h,
        step?.placement ?? 'bottom',
      ),
    [rect, cardSize.w, cardSize.h, step?.placement],
  );

  if (!open || !step) return null;

  const wide = !step.targetId;
  const CardEl = wide ? TutorialWideCard : TutorialCard;
  const titleVariant = wide ? 'h5' : 'subtitle1';
  const bodyVariant = wide ? 'body1' : 'body2';
  const titleMb = wide ? 1.5 : 1;
  const bodyMb = wide ? 3 : 2;

  return createPortal(
    <>
      {!rect && <TutorialBackdrop />}
      {rect && (
        <TutorialSpotlight
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
          }}
        />
      )}
      <CardEl
        ref={cardRef}
        style={{ top: cardPos.top, left: cardPos.left }}
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: titleMb }}>
          <Typography
            variant={titleVariant}
            sx={{ fontWeight: 600, flexGrow: 1, lineHeight: 1.3 }}
          >
            {step.title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label="Close tutorial"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant={bodyVariant} color="text.secondary" sx={{ mb: bodyMb }}>
          {step.body}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            {safeIndex + 1} / {TUTORIAL_STEPS.length}
          </Typography>
          <Button size="small" onClick={handlePrev} disabled={isFirst}>
            Back
          </Button>
          <Button size="small" variant="contained" onClick={handleNext}>
            {isLast ? 'Done' : 'Next'}
          </Button>
        </Box>
      </CardEl>
    </>,
    document.body,
  );
};

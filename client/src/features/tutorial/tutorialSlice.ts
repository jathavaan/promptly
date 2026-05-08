import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'promptly:tutorial-seen';

const readSeen = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export interface TutorialState {
  open: boolean;
  stepIndex: number;
  seen: boolean;
}

const seenInitial = readSeen();

const initialState: TutorialState = {
  open: !seenInitial,
  stepIndex: 0,
  seen: seenInitial,
};

const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState,
  reducers: {
    start(state) {
      state.open = true;
      state.stepIndex = 0;
    },
    close(state) {
      state.open = false;
      state.seen = true;
    },
    next(state) {
      state.stepIndex += 1;
    },
    prev(state) {
      if (state.stepIndex > 0) state.stepIndex -= 1;
    },
    goTo(state, action: PayloadAction<number>) {
      state.stepIndex = Math.max(0, action.payload);
    },
  },
});

export const tutorialActions = tutorialSlice.actions;
export const tutorialReducer = tutorialSlice.reducer;
export const TUTORIAL_STORAGE_KEY = STORAGE_KEY;

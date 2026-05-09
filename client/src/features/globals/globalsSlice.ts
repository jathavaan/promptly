import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CopyMode = 'raw' | 'markdown';

export interface GlobalsState {
  role: string;
  thinkStepByStep: boolean;
  selfCritique: boolean;
  copyMode: CopyMode;
  showStaticInBuilder: boolean;
}

const initialState: GlobalsState = {
  role: '',
  thinkStepByStep: false,
  selfCritique: false,
  copyMode: 'raw',
  showStaticInBuilder: false,
};

const globalsSlice = createSlice({
  name: 'globals',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<string>) {
      state.role = action.payload;
    },
    setThinkStepByStep(state, action: PayloadAction<boolean>) {
      state.thinkStepByStep = action.payload;
    },
    setSelfCritique(state, action: PayloadAction<boolean>) {
      state.selfCritique = action.payload;
    },
    setCopyMode(state, action: PayloadAction<CopyMode>) {
      state.copyMode = action.payload;
    },
    setShowStaticInBuilder(state, action: PayloadAction<boolean>) {
      state.showStaticInBuilder = action.payload;
    },
    replaceAll(_state, action: PayloadAction<GlobalsState>) {
      return action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const globalsActions = globalsSlice.actions;
export const globalsReducer = globalsSlice.reducer;

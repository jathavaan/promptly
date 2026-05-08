import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CopyMode = 'raw' | 'markdown';

export interface SettingsState {
  role: string;
  thinkStepByStep: boolean;
  selfCritique: boolean;
  copyMode: CopyMode;
  showStaticInBuilder: boolean;
}

const initialState: SettingsState = {
  role: '',
  thinkStepByStep: false,
  selfCritique: false,
  copyMode: 'raw',
  showStaticInBuilder: false,
};

const settingsSlice = createSlice({
  name: 'settings',
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
    replaceAll(_state, action: PayloadAction<SettingsState>) {
      return action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

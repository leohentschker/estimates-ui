import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../store';


const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

interface UISlice {
  showTutorial: boolean;
  showCode: boolean;
  mode: 'assumptions' | 'tactics';
  executionMode: 'auto' | 'manual';
  isMobile: boolean;
}

const initialState: UISlice = {
  showTutorial: false,
  showCode: true,
  mode: 'assumptions',
  executionMode: 'auto',
  isMobile: isMobile(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setShowTutorial: (state, action: PayloadAction<boolean>) => {
      state.showTutorial = action.payload;
    },
    setShowCode: (state, action: PayloadAction<boolean>) => {
      state.showCode = action.payload;
    },
    setMode: (state, action: PayloadAction<'assumptions' | 'tactics'>) => {
      state.mode = action.payload;
    },
    setExecutionMode: (state, action: PayloadAction<'auto' | 'manual'>) => {
      state.executionMode = action.payload;
    },
  }
});

export const { setShowTutorial, setShowCode, setMode, setExecutionMode } = uiSlice.actions;

export const selectShowTutorial = (state: RootState) => state.ui.showTutorial;
export const selectShowCode = (state: RootState) => state.ui.showCode;
export const selectMode = (state: RootState) => state.ui.mode;
export const selectExecutionMode = (state: RootState) => state.ui.executionMode;
export const selectIsMobile = (state: RootState) => state.ui.isMobile;
export default uiSlice.reducer;
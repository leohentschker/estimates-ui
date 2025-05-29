import { useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import proofReducer from './features/proof/proofSlice'
import pyodideReducer from './features/pyodide/pyodideSlice'

export const store = configureStore({
  reducer: {
    proof: proofReducer,
    pyodide: pyodideReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

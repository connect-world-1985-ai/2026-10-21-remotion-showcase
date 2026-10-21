import React, {createContext, useContext} from 'react';
// Sequences re-base useCurrentFrame(); audio analysis needs the absolute timeline frame.
const Ctx = createContext(0);
export const GlobalFrameProvider: React.FC<{frame: number; children: React.ReactNode}> = ({frame, children}) => (
  <Ctx.Provider value={frame}>{children}</Ctx.Provider>
);
export const useGlobalFrame = () => useContext(Ctx);

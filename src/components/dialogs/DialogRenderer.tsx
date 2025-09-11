import { AnimatePresence } from 'motion/react';
import type { DialogInstance } from 'react-layered-dialog';

export const DialogRenderer = <T extends { type: string }>({
  dialogs,
}: {
  dialogs: readonly DialogInstance<T>[];
}) => {
  return (
    <AnimatePresence>
      {dialogs.map(({ Component, state }) => (
        <Component key={state.id} {...state} />
      ))}
    </AnimatePresence>
  );
};

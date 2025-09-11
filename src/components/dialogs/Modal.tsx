import { useRef, useCallback } from 'react';
import { type DialogState, useLayerBehavior } from 'react-layered-dialog';
import { motion } from 'motion/react';
import { useDialogs, type ModalState } from '../../lib/dialogs';

type ModalProps = DialogState<ModalState>;

export const Modal = (props: ModalProps) => {
  const {
    id,
    children,
    zIndex,
    dimmed = true,
    closeOnOverlayClick = true,
    dismissable = true,
  } = props;

  const { dialogs, closeDialog } = useDialogs();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    closeDialog(id);
  }, [id, closeDialog]);

  useLayerBehavior({
    zIndex,
    dialogs,
    closeOnEscape: dismissable,
    onEscape: handleClose,
    autoFocus: true,
    focusRef: closeButtonRef,
    closeOnOutsideClick: closeOnOverlayClick,
    onOutsideClick: handleClose,
    outsideClickRef: panelRef,
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className={`absolute inset-0 ${dimmed ? 'bg-black/20' : 'bg-transparent'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      />
      <motion.div
        ref={panelRef}
        className="relative rounded-lg bg-white p-6 shadow-lg min-w-[400px]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className="absolute top-2 right-2">
          <button ref={closeButtonRef} onClick={handleClose}>
            X{/* <X className="h-4 w-4" /> */}
          </button>
        </div>
        <div>{children}</div>
      </motion.div>
    </div>
  );
};

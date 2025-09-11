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
    scrollLock = true,
  } = props;

  const { dialogs, closeDialog } = useDialogs();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    closeDialog(id);
  }, [id, closeDialog]);

  useLayerBehavior({
    zIndex,
    dialogs,
    closeOnEscape: dismissable,
    onEscape: handleClose,
    autoFocus: true,
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
      data-scroll-lock={scrollLock}
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
        className="relative rounded-[20px] bg-white p-[30px] min-w-[400px] max-h-[80dvh] overflow-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div>{children}</div>
      </motion.div>
    </div>
  );
};

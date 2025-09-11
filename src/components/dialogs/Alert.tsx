import { useRef, useCallback } from 'react';
import { type DialogState, useLayerBehavior } from 'react-layered-dialog';
import { motion } from 'motion/react';
import { useDialogs, type AlertState } from '../../lib/dialogs';

type AlertProps = DialogState<AlertState>;

export const Alert = (props: AlertProps) => {
  const {
    id,
    title,
    message,
    onOk,
    zIndex,
    dimmed = true,
    closeOnOverlayClick = true,
    dismissable = true,
  } = props;

  const { dialogs, closeDialog } = useDialogs();
  const okButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleOk = useCallback(() => {
    onOk?.();
    closeDialog(id);
  }, [id, onOk, closeDialog]);

  useLayerBehavior({
    zIndex,
    dialogs,
    closeOnEscape: dismissable,
    onEscape: handleOk,
    autoFocus: true,
    focusRef: okButtonRef,
    closeOnOutsideClick: closeOnOverlayClick,
    onOutsideClick: handleOk,
    outsideClickRef: panelRef,
  });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-message"
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
        className="relative rounded-lg bg-white p-6 shadow-lg min-w-[300px]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <h3 id="alert-title" className="text-lg font-bold">
          {title}
        </h3>
        <p id="alert-message" className="mt-2 text-sm text-gray-500">
          {message}
        </p>
        <div className="mt-4 flex justify-end">
          <button ref={okButtonRef} onClick={handleOk}>
            확인
          </button>
        </div>
      </motion.div>
    </div>
  );
};

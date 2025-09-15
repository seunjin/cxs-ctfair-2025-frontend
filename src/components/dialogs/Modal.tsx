import { useRef, useCallback } from 'react';
import { type DialogState, useLayerBehavior } from 'react-layered-dialog';
import { motion } from 'motion/react';
import { useDialogs, type ModalState } from '../../lib/dialogs';

type ModalProps = DialogState<ModalState>;

type ModalContentProps = Pick<DialogState<ModalState>, 'children'> & {
  panelRef: React.RefObject<HTMLDivElement | null>;
};

const AdminFormConfirmContent = (props: ModalContentProps) => {
  const { panelRef, children } = props;
  return (
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
  );
};

const KioskFormConfirmContent = (props: ModalContentProps) => {
  const { panelRef, children } = props;
  return (
    <motion.div
      ref={panelRef}
      className="relative rounded-[32px] bg-white/80 px-[30px] py-[70px_30px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-[7px] min-w-[400px] max-h-[80dvh] overflow-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <div>{children}</div>
    </motion.div>
  );
};

export const Modal = (props: ModalProps) => {
  const {
    id,
    form = 'admin',
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

  const Content =
    form === 'admin' ? AdminFormConfirmContent : KioskFormConfirmContent;

  const overlayBG = form === 'admin' ? 'bg-black/60' : 'bg-black/70';
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      data-scroll-lock={scrollLock}
    >
      <motion.div
        className={`absolute inset-0 ${dimmed ? overlayBG : 'bg-transparent'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      />
      <Content panelRef={panelRef} children={children} />
    </div>
  );
};

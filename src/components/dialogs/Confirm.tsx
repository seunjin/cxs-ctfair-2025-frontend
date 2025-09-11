import { useRef, useCallback } from 'react';
import { type DialogState, useLayerBehavior } from 'react-layered-dialog';
import { motion } from 'motion/react';
import { useDialogs, type ConfirmState } from '../../lib/dialogs';

type ConfirmProps = DialogState<ConfirmState>;

type ConfirmContentProps = Pick<
  DialogState<ConfirmState>,
  | 'title'
  | 'message'
  | 'onCancel'
  | 'onConfirm'
  | 'cancelButtonText'
  | 'confirmButtonText'
> & {
  panelRef: React.RefObject<HTMLDivElement | null>;
  confirmButtonRef: React.RefObject<HTMLButtonElement | null>;
  handleCancel: VoidFunction;
  handleConfirm: VoidFunction;
};

// 관리자 폼 Confirm Content
const AdminFormConfirmContent = (props: ConfirmContentProps) => {
  const {
    title,
    message,
    handleCancel,
    handleConfirm,
    cancelButtonText = '취소',
    confirmButtonText = '확인',
    panelRef,
    confirmButtonRef,
  } = props;
  return (
    <motion.div
      ref={panelRef}
      className="relative rounded-lg bg-white p-6 shadow-lg min-w-[300px]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <h3 id="confirm-title" className="text-lg font-bold">
        {title}
      </h3>
      <p id="confirm-message" className="mt-2 text-sm text-gray-500">
        {message}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={handleCancel}>{cancelButtonText}</button>
        <button ref={confirmButtonRef} onClick={handleConfirm}>
          {confirmButtonText}
        </button>
      </div>
    </motion.div>
  );
};

// 키오스크 폼 Confirm Content
const KioskFormConfirmContent = (props: ConfirmContentProps) => {
  const {
    title,
    message,
    handleCancel,
    handleConfirm,
    cancelButtonText = '취소',
    confirmButtonText = '확인',
    panelRef,
    confirmButtonRef,
  } = props;
  return (
    <motion.div
      ref={panelRef}
      className="relative rounded-[32px] bg-white/80 px-[30px] py-[70px_30px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-[7px]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <h3 id="confirm-title" className="text-lg font-bold">
        {title}
      </h3>
      <p
        id="confirm-message"
        className="mt-2 text-[40px] text-[#0033ff] text-center whitespace-pre-wrap font-semibold leading-[1.3] pb-[50px]"
      >
        {message}
      </p>
      <div className="flex justify-end gap-4">
        <button
          className="w-[284px] h-[100px] border-[3px] rounded-[20px] border-[#0033ff] font-bold text-[30px] text-[#0033ff]"
          onClick={handleCancel}
        >
          {cancelButtonText}
        </button>
        <button
          className="w-[284px] h-[100px] border-[3px] rounded-[20px] border-[#0033ff] font-bold text-[30px] text-white bg-[#0033ff]"
          ref={confirmButtonRef}
          onClick={handleConfirm}
        >
          {confirmButtonText}
        </button>
      </div>
    </motion.div>
  );
};
export const Confirm = (props: ConfirmProps) => {
  const {
    id,
    title,
    message,
    form = 'admin',
    onConfirm,
    onCancel,
    zIndex,
    confirmButtonText,
    cancelButtonText,
    dimmed = true,
    closeOnOverlayClick = true,
    dismissable = true,
  } = props;

  const { dialogs, closeDialog } = useDialogs();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleCancel = useCallback(() => {
    onCancel?.();
    closeDialog(id);
  }, [id, onCancel, closeDialog]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    closeDialog(id);
  }, [id, onConfirm, closeDialog]);

  useLayerBehavior({
    zIndex,
    dialogs,
    closeOnEscape: dismissable,
    onEscape: handleCancel,
    autoFocus: true,
    focusRef: confirmButtonRef,
    closeOnOutsideClick: closeOnOverlayClick,
    onOutsideClick: handleCancel,
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
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <motion.div
        className={`absolute inset-0 ${dimmed ? overlayBG : 'bg-transparent'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      />
      <Content
        title={title}
        message={message}
        panelRef={panelRef}
        confirmButtonRef={confirmButtonRef}
        handleCancel={handleCancel}
        cancelButtonText={cancelButtonText}
        handleConfirm={handleConfirm}
        confirmButtonText={confirmButtonText}
      />
    </div>
  );
};

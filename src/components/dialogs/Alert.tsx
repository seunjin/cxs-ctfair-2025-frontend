import { useRef, useCallback } from 'react';
import { type DialogState, useLayerBehavior } from 'react-layered-dialog';
import { motion } from 'motion/react';
import { useDialogs, type AlertState } from '../../lib/dialogs';

type AlertProps = DialogState<AlertState>;

type AlertContentProps = Pick<
  DialogState<AlertState>,
  'title' | 'message' | 'onOk'
> & {
  panelRef: React.RefObject<HTMLDivElement | null>;
  okButtonRef: React.RefObject<HTMLButtonElement | null>;
  handleOk: VoidFunction;
};

// 관리자 폼 Alert Content
const AdminFormAlertContent = (props: AlertContentProps) => {
  const { title, message, handleOk, panelRef, okButtonRef } = props;
  return (
    <motion.div
      ref={panelRef}
      className="relative rounded-lg bg-white p-6 shadow-lg min-w-[300px]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {title && (
        <h3 id="confirm-title" className="text-lg font-bold">
          {title}
        </h3>
      )}
      <p id="confirm-message" className="mt-2 text-sm text-gray-500">
        {message}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button ref={okButtonRef} onClick={handleOk}>
          확인
        </button>
      </div>
    </motion.div>
  );
};

// 키오스크 폼 Alert Content
const KioskFormAlertContent = (props: AlertContentProps) => {
  const { title, message, handleOk, panelRef, okButtonRef } = props;
  return (
    <motion.div
      ref={panelRef}
      className="relative rounded-[32px] bg-white/80 px-[30px] py-[70px_30px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.25)] outline-[3px] outline-offset-[-3px] outline-white backdrop-blur-[7px]"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {title && (
        <h3 id="confirm-title" className="text-lg font-bold">
          {title}
        </h3>
      )}
      <p
        id="confirm-message"
        className="mt-2 text-[40px] text-[#0033ff] text-center whitespace-pre-wrap font-semibold leading-[1.3] pb-[50px]"
        style={{ userSelect: 'none' }}
      >
        {message}
      </p>
      <div className="flex justify-end gap-4">
        <button
          className="inline-flex items-center px-10 h-[100px] border-[3px] rounded-[20px] border-[#0033ff] font-bold text-[30px] text-white bg-[#0033ff]"
          style={{ userSelect: 'none' }}
          ref={okButtonRef}
          onClick={handleOk}
        >
          확인
        </button>
      </div>
    </motion.div>
  );
};
export const Alert = (props: AlertProps) => {
  const {
    id,
    form = 'admin',
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
  const Content =
    form === 'admin' ? AdminFormAlertContent : KioskFormAlertContent;

  const overlayBG = form === 'admin' ? 'bg-black/60' : 'bg-black/70';
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
        okButtonRef={okButtonRef}
        handleOk={handleOk}
      />
    </div>
  );
};

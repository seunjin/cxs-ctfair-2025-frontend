// src/lib/dialogs.ts
import {
  createDialogManager,
  createUseDialogs,
  type BaseLayerProps,
} from 'react-layered-dialog';
import { Alert } from '../components/dialogs/Alert';
import { Confirm } from '../components/dialogs/Confirm';
import { Modal } from '../components/dialogs/Modal';

// 1. 다이얼로그 상태 타입 정의
export interface AlertState extends BaseLayerProps {
  type: 'alert';
  title: string;
  message: string;
  onOk?: () => void;
}
export interface ConfirmState extends BaseLayerProps {
  type: 'confirm';
  form?: 'kiosk' | 'admin';
  title?: string;
  message: string;
  onConfirm?: () => void;
  confirmButtonText?: string;
  onCancel?: () => void;
  cancelButtonText?: string;
}
export interface ModalState extends BaseLayerProps {
  type: 'modal';
  form?: 'kiosk' | 'admin';
  children: React.ReactNode;
}

// 2. 모든 다이얼로그 상태 타입을 포함하는 유니온 타입 생성
export type CustomDialogState = AlertState | ConfirmState | ModalState;

// 3. 다이얼로그 매니저 생성
const { manager } = createDialogManager<CustomDialogState>();

// 4. 다이얼로그 타입과 컴포넌트를 매핑하는 객체 생성
const componentMap = { alert: Alert, confirm: Confirm, modal: Modal };

// 5. 앱 전체에서 사용할 훅과 함수 생성 및 내보내기
export const useDialogs = createUseDialogs(manager, componentMap);
// export const openDialog = manager.openDialog;
export const closeDialog = manager.closeDialog;

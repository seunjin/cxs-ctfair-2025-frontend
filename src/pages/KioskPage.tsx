import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../router';
import KioskHeader from '../components/kiosk/KioskHeader';
import clsx from 'clsx';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { useKiosk } from '../contexts/kiosk/useKiosk';
import {
  type ComponentType,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react';

const IDLE_TIMEOUT = 120000; // 2분

// Lazy load all step components
const KioskMainStep = lazy(() => import('./kiosk/MainStep'));
const KioskInfoStep = lazy(() => import('./kiosk/InfoStep'));
const KioskPhoneStep = lazy(() => import('./kiosk/PhoneStep'));
const KioskKeywordsStep = lazy(() => import('./kiosk/KeywordsStep'));
const KioskCaptureStep = lazy(() => import('./kiosk/CaptureStep'));
const KioskCompleteStep = lazy(() => import('./kiosk/CompleteStep'));

const DocentMainStep = lazy(() => import('./docent/MainStep'));
const DocentInfoStep = lazy(() => import('./docent/InfoStep'));
const DocentPhoneStep = lazy(() => import('./docent/PhoneStep'));
const DocentKeywordsStep = lazy(() => import('./docent/KeywordsStep'));
const DocentCaptureStep = lazy(() => import('./docent/CaptureStep'));
const DocentCompleteStep = lazy(() => import('./docent/CompleteStep'));

interface Step {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  isMain?: boolean;
}

const KioskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetState } = useKiosk();

  const kioskSteps: Step[] = useMemo(
    () => [
      { path: ROUTER_PATH.KIOSK_MAIN, component: KioskMainStep, isMain: true },
      { path: ROUTER_PATH.KIOSK_INFO, component: KioskInfoStep },
      { path: ROUTER_PATH.KIOSK_PHONE, component: KioskPhoneStep },
      { path: ROUTER_PATH.KIOSK_KEYWORDS, component: KioskKeywordsStep },
      { path: ROUTER_PATH.KIOSK_CAPTURE, component: KioskCaptureStep },
      { path: ROUTER_PATH.KIOSK_COMPLETE, component: KioskCompleteStep },
    ],
    []
  );

  const docentSteps: Step[] = useMemo(
    () => [
      { path: ROUTER_PATH.DOCENT_MAIN, component: DocentMainStep, isMain: true },
      { path: ROUTER_PATH.DOCENT_INFO, component: DocentInfoStep },
      { path: ROUTER_PATH.DOCENT_PHONE, component: DocentPhoneStep },
      { path: ROUTER_PATH.DOCENT_KEYWORDS, component: DocentKeywordsStep },
      { path: ROUTER_PATH.DOCENT_CAPTURE, component: DocentCaptureStep },
      { path: ROUTER_PATH.DOCENT_COMPLETE, component: DocentCompleteStep },
    ],
    []
  );

  const handleIdle = useCallback(() => {
    console.log('유휴 상태 감지. 상태를 초기화하고 메인으로 이동합니다.');
    resetState();
    navigate('/kiosk');
  }, [navigate, resetState]);

  useIdleTimer(handleIdle, IDLE_TIMEOUT);

  const isDocentMode = location.pathname.startsWith('/docent');
  const steps = isDocentMode ? docentSteps : kioskSteps;

  const currentStepIndex = useMemo(
    () => steps.findIndex(step => step.path === location.pathname),
    [steps, location.pathname]
  );

  const currentStep = steps[currentStepIndex];
  const isMainPage = currentStep?.isMain === true;

  return (
    <main
      id="kiosk-container"
      className={clsx(
        isMainPage
          ? `bg-[url('/src/assets/images/kiosk/kiosk-bg.png')]`
          : `bg-[url('/src/assets/images/kiosk/kiosk-simple-bg.png')]`,
        'bg-contain bg-no-repeat bg-center min-h-[100dvh] flex items-center justify-center'
      )}
    >
      <div className="grid w-[1080px] h-[1920px] mx-auto border-gray-300">
        <Suspense fallback={null}>
          {steps.map((step, index) => {
            const Component = step.component;
            const isCurrent = index === currentStepIndex;
            const isNext = index === currentStepIndex + 1;
            const shouldRender = isCurrent || isNext;

            if (!shouldRender) return null;

            const isActive = isCurrent;

            return (
              <div
                key={step.path}
                style={{ display: isActive ? 'block' : 'none' }}
                className="h-full"
              >
                {step.isMain ? (
                  <Component isActive={isActive} />
                ) : (
                  <div className="h-full">
                    <KioskHeader />
                    <div className="h-[calc(100%-136px)]">
                      <Component isActive={isActive} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Suspense>
      </div>
    </main>
  );
};

export default KioskPage;
import { useLocation } from 'react-router-dom';
import KioskHeader from '../components/kiosk/KioskHeader';
import clsx from 'clsx';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { useKiosk } from '../contexts/kiosk/useKiosk';
import { type ComponentType, useCallback, useMemo, useState, useEffect } from 'react';

// Import all step components statically
import KioskMainStep from './kiosk/MainStep';
import KioskInfoStep from './kiosk/InfoStep';
import KioskPhoneStep from './kiosk/PhoneStep';
import KioskKeywordsStep from './kiosk/KeywordsStep';
import KioskCaptureStep from './kiosk/CaptureStep';
import KioskCompleteStep from './kiosk/CompleteStep';

import DocentMainStep from './docent/MainStep';
import DocentInfoStep from './docent/InfoStep';
import DocentPhoneStep from './docent/PhoneStep';
import DocentKeywordsStep from './docent/KeywordsStep';
import DocentCaptureStep from './docent/CaptureStep';
import DocentCompleteStep from './docent/CompleteStep';

const IDLE_TIMEOUT = 120000; // 2분

interface Step {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  isMain?: boolean;
}

const KioskPage = () => {
  const location = useLocation();
  const kioskData = useKiosk();
  const { resetState } = kioskData;

  const kioskSteps: Step[] = useMemo(
    () => [
      { name: 'main', component: KioskMainStep, isMain: true },
      { name: 'info', component: KioskInfoStep },
      { name: 'capture', component: KioskCaptureStep },
      { name: 'keywords', component: KioskKeywordsStep },
      { name: 'complete', component: KioskCompleteStep },
      { name: 'phone', component: KioskPhoneStep },
    ],
    []
  );

  const docentSteps: Step[] = useMemo(
    () => [
      { name: 'main', component: DocentMainStep, isMain: true },
      { name: 'info', component: DocentInfoStep },
      { name: 'capture', component: DocentCaptureStep },
      { name: 'keywords', component: DocentKeywordsStep },
      { name: 'complete', component: DocentCompleteStep },
      { name: 'phone', component: DocentPhoneStep },
    ],
    []
  );

  const isDocentMode = location.pathname.startsWith('/docent');
  const steps = isDocentMode ? docentSteps : kioskSteps;

  useEffect(() => {
    console.log(
      isDocentMode ? '🧑‍🏫 Docent Mode' : '🤖 Kiosk Mode',
      'Data:',
      kioskData
    );
  }, [kioskData, isDocentMode]);

  const getInitialStepIndex = useCallback(() => {
    const startStepName = location.state?.startStep;
    if (startStepName) {
      const index = steps.findIndex((step) => step.name === startStepName);
      return index !== -1 ? index : 0;
    }
    return 0;
  }, [location.state, steps]);

  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStepIndex);

  // URL 경로가 변경될 때마다 스텝을 처음으로 리셋합니다.
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [location.pathname]);

  const handleNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (stepName: string) => {
      const stepIndex = steps.findIndex((step) => step.name === stepName);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [steps]
  );

  const handleGoToMain = useCallback(() => {
    resetState();
    setCurrentStepIndex(0);
  }, [resetState]);

  const handleIdle = useCallback(() => {
    console.log('유휴 상태 감지. 상태를 초기화하고 메인으로 이동합니다.');
    handleGoToMain();
  }, [handleGoToMain]);

  useIdleTimer(handleIdle, IDLE_TIMEOUT);

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
        {steps.map((step, index) => {
          const Component = step.component;
          const isActive = index === currentStepIndex;

          return (
            <div
              key={step.name}
              style={{ display: isActive ? 'block' : 'none' }}
              className="h-full"
            >
              {step.isMain ? (
                <Component
                  isActive={isActive}
                  onNext={handleNext}
                  goToStep={goToStep}
                />
              ) : (
                <div className="h-full">
                  <KioskHeader onGoToMain={handleGoToMain} />
                  <div className="h-[calc(100%-136px)]">
                    <Component
                      isActive={isActive}
                      onNext={handleNext}
                      onPrev={handlePrev}
                      goToStep={goToStep}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default KioskPage;
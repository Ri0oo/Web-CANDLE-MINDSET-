/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { SystemStatus } from './components/SystemStatus';
import { ScreenshotUpload } from './components/ScreenshotUpload';
import { ProcessingAnimation } from './components/ProcessingAnimation';
import { SignalResultCard } from './components/SignalResultCard';
import { MoneyManagementModal } from './components/MoneyManagementModal';
import { EngineSelector, EngineType } from './components/EngineSelector';
import { TelegramPromoCard } from './components/TelegramPromoCard';
import { Footer } from './components/Footer';
import { PasswordLockModal } from './components/PasswordLockModal';
import { SignalData } from './types/signal';
import { calculateDhakaNextMinute } from './utils/time';
import { validateAndAnalyzeChart } from './utils/chartAnalysis';
import { triggerSignalCompleteVibration } from './utils/haptics';
import { soundEngine } from './utils/audio';
import { Play, RotateCw } from 'lucide-react';

export default function App() {
  // Password Protected Access State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('candle_mindset_auth') === 'granted';
  });

  // Engine Mode: 'v2' (Local Chart) or 'v2.1' (Gemini Vision AI)
  const [engineVersion, setEngineVersion] = useState<EngineType>(() => {
    return (localStorage.getItem('cm_engine_version') as EngineType) || 'v2.1';
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [entryTimePreview, setEntryTimePreview] = useState<string | undefined>(undefined);

  const [signalResult, setSignalResult] = useState<SignalData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const stageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('cm_engine_version', engineVersion);
  }, [engineVersion]);

  const handleUnlock = () => {
    sessionStorage.setItem('candle_mindset_auth', 'granted');
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem('candle_mindset_auth');
    setIsAuthenticated(false);
  };

  // Clear or handle image change with instant validation
  const handleImageSelected = async (dataUrl: string, fileName: string) => {
    setImagePreview(dataUrl);
    setImageFileName(fileName);
    setSignalResult(null);
    setErrorMessage(null);

    // Instant validation check upon selection
    const check = await validateAndAnalyzeChart(dataUrl, fileName);
    if (!check.isValidChart) {
      setErrorMessage(
        check.errorMessage ||
          'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
      );
    }
  };

  const handleImageRemoved = () => {
    setImagePreview(null);
    setImageFileName(null);
    setSignalResult(null);
    setErrorMessage(null);
    setIsAnalyzing(false);
    if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
  };

  // Helper to step through the 8 stages smoothly
  const runStageAnimation = (initialTimeDhaka: string): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentStage(1);
      setEntryTimePreview(initialTimeDhaka);

      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);

      let stage = 1;
      stageIntervalRef.current = setInterval(() => {
        stage += 1;
        if (stage <= 8) {
          setCurrentStage(stage);
        }
        if (stage === 8) {
          if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
          setTimeout(() => {
            resolve();
          }, 250);
        }
      }, 180);
    });
  };

  // Execute Analysis with Chosen Engine (v2 or v2.1)
  const executeAnalysis = async () => {
    if (!imagePreview) {
      setErrorMessage('PLEASE UPLOAD A CHART SCREENSHOT.');
      return;
    }

    // Pre-check: if already known invalid, block trade signal
    const check = await validateAndAnalyzeChart(imagePreview, imageFileName);
    if (!check.isValidChart) {
      setSignalResult(null);
      setIsAnalyzing(false);
      setErrorMessage(
        check.errorMessage ||
          'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
      );
      return;
    }

    setErrorMessage(null);
    setSignalResult(null);
    setIsAnalyzing(true);

    // Capture generation timestamp the exact moment user clicks GENERATE SIGNAL
    const clickTimestamp = Date.now();
    const entryCalc = calculateDhakaNextMinute(clickTimestamp);

    try {
      let finalMarket = 'USD/INR';
      let finalDirection: 'UP' | 'DOWN' = 'UP';
      let finalConfidence = 91;

      // ============================================
      // EXECUTE SELECTED ENGINE
      // ============================================
      if (engineVersion === 'v2.1') {
        // Run Gemini Vision 3.8 Flash via permanent server backend
        const [apiRes] = await Promise.all([
          fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: imagePreview,
              mimeType: 'image/png',
              timestamp: clickTimestamp,
              fileName: imageFileName,
              engineVersion: 'v2.1',
            }),
          }),
          runStageAnimation(entryCalc.m1String),
        ]);

        const data = await apiRes.json();

        if (!apiRes.ok || !data.success) {
          setIsAnalyzing(false);
          setSignalResult(null);
          setErrorMessage(
            data?.message || 'GEMINI VISION ANALYSIS FAILED. PLEASE TRY AGAIN OR SWITCH TO v2 LOCAL ENGINE.'
          );
          return;
        }

        finalMarket = data.market || 'USD/INR';
        finalDirection = data.direction;
        finalConfidence = data.confidence || 94;
      } else {
        // AI ENGINE v2: Fast Local Chart Engine
        const [localAnalysis] = await Promise.all([
          validateAndAnalyzeChart(imagePreview, imageFileName),
          runStageAnimation(entryCalc.m1String),
        ]);

        if (!localAnalysis.isValidChart) {
          setIsAnalyzing(false);
          setSignalResult(null);
          setErrorMessage(
            localAnalysis.errorMessage ||
              'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
          );
          return;
        }

        finalMarket = localAnalysis.market;
        finalDirection = localAnalysis.direction;
        finalConfidence = localAnalysis.confidence;
      }

      setIsAnalyzing(false);
      setSignalResult({
        market: finalMarket,
        entryTime: entryCalc.formattedTime,
        entryM1Formatted: entryCalc.m1String,
        direction: finalDirection,
        confidence: finalConfidence,
        generationTimestamp: clickTimestamp,
        entryTimestamp: entryCalc.entryTimestamp,
        engineUsed: engineVersion,
      });

      // Subtle vibration feedback on mobile when signal generation is complete
      triggerSignalCompleteVibration(finalDirection);

      // Play futuristic audio chime
      if (finalDirection === 'UP') {
        soundEngine.playUpSignal();
      } else {
        soundEngine.playDownSignal();
      }

      // Smooth scroll to the result card
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      setSignalResult(null);
      setErrorMessage(
        'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
      );
    }
  };

  // If not authenticated, render Password Protected Access Screen
  if (!isAuthenticated) {
    return <PasswordLockModal onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Dynamic ambient dark glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-600/10 via-indigo-600/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-32 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full" />
        <div className="absolute top-[60%] -right-32 w-80 h-80 bg-cyan-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">
        {/* 1. CANDLE MINDSET AI SIGNAL branding with Controls */}
        <Header onLock={handleLock} onOpenCalculator={() => setIsCalculatorOpen(true)} />

        {/* 2. System status indicator */}
        <SystemStatus isAnalyzing={isAnalyzing} />

        {/* AI ENGINE SELECTOR (v2 vs v2.1) */}
        <EngineSelector
          currentEngine={engineVersion}
          onChangeEngine={setEngineVersion}
        />

        {/* 3 & 4. Screenshot upload card & uploaded screenshot preview */}
        <ScreenshotUpload
          imagePreview={imagePreview}
          imageFileName={imageFileName}
          onImageSelected={handleImageSelected}
          onImageRemoved={handleImageRemoved}
          isAnalyzing={isAnalyzing}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
        />

        {/* 5. GENERATE SIGNAL button (disabled until valid screenshot is uploaded) */}
        {!signalResult && (
          <div className="w-full max-w-xl mx-auto px-4 mb-4">
            <button
              type="button"
              onClick={executeAnalysis}
              disabled={!imagePreview || isAnalyzing || !!errorMessage}
              className={`w-full py-4 px-6 rounded-2xl font-black tracking-widest uppercase font-terminal text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl ${
                !imagePreview || isAnalyzing || !!errorMessage
                  ? 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                  : engineVersion === 'v2.1'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white border border-purple-400/40 shadow-[0_0_35px_-5px_rgba(192,132,252,0.45)] hover:shadow-[0_0_45px_rgba(192,132,252,0.65)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white border border-cyan-400/40 shadow-[0_0_35px_-5px_rgba(6,182,212,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.65)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin text-cyan-300" />
                  <span>
                    {engineVersion === 'v2.1' ? 'GEMINI VISION ANALYZING...' : 'LOCAL CHART ANALYZING...'}
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>GENERATE SIGNAL ({engineVersion.toUpperCase()})</span>
                </>
              )}
            </button>

            {!imagePreview && (
              <p className="text-center text-[11px] font-terminal text-slate-500 mt-2">
                Upload a Quotex chart screenshot above to activate signal generator
              </p>
            )}

            {imagePreview && errorMessage && (
              <p className="text-center text-[11px] font-terminal text-red-400 mt-2 font-semibold">
                Trade signal blocked: Please upload a valid Quotex chart screenshot
              </p>
            )}
          </div>
        )}

        {/* 6. Processing animation (Stages 01 to 08) */}
        {isAnalyzing && (
          <ProcessingAnimation
            currentStage={currentStage}
            entryTimePreview={entryTimePreview}
          />
        )}

        {/* 7. Final signal result card (With Live Countdown, MTG1, Copy & Card Save) */}
        {signalResult && !isAnalyzing && (
          <SignalResultCard signal={signalResult} />
        )}

        {/* 8. GENERATE AGAIN button */}
        {signalResult && !isAnalyzing && (
          <div className="w-full max-w-xl mx-auto px-4 mb-4">
            <button
              type="button"
              onClick={executeAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold tracking-widest uppercase font-terminal text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer transform active:scale-[0.99] ${
                engineVersion === 'v2.1'
                  ? 'bg-slate-900/80 hover:bg-slate-850 text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-400 shadow-[0_0_25px_-5px_rgba(192,132,252,0.3)]'
                  : 'bg-slate-900/80 hover:bg-slate-850 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)]'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              <span>GENERATE AGAIN ({engineVersion.toUpperCase()})</span>
            </button>
            <p className="text-center text-[11px] font-terminal text-slate-500 mt-1.5">
              Reanalyzes chart with fresh Dhaka M1 entry time
            </p>
          </div>
        )}

        {/* 9. Telegram promotional card */}
        <TelegramPromoCard />
      </div>

      {/* MONEY MANAGEMENT MODAL */}
      <MoneyManagementModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* 10. Footer branding */}
      <Footer />
    </div>
  );
}

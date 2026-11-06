/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { SystemStatus } from './components/SystemStatus';
import { ScreenshotUpload } from './components/ScreenshotUpload';
import { ProcessingAnimation } from './components/ProcessingAnimation';
import { SignalResultCard } from './components/SignalResultCard';
import { TelegramPromoCard } from './components/TelegramPromoCard';
import { Footer } from './components/Footer';
import { PasswordLockModal } from './components/PasswordLockModal';
import { SignalData } from './types/signal';
import { calculateDhakaNextMinute } from './utils/time';
import { validateAndAnalyzeChart } from './utils/offlineChartAnalysis';
import { Play, RotateCw } from 'lucide-react';

export default function App() {
  // Password Protected Access State (persists during active session)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('candle_mindset_auth') === 'granted';
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [entryTimePreview, setEntryTimePreview] = useState<string | undefined>(undefined);

  const [signalResult, setSignalResult] = useState<SignalData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stageIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Execute Analysis with Strict Chart Verification
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
      // 1. Strictly validate and analyze candlestick price action
      const [analysis] = await Promise.all([
        validateAndAnalyzeChart(imagePreview, imageFileName),
        runStageAnimation(entryCalc.m1String),
      ]);

      if (!analysis.isValidChart) {
        setIsAnalyzing(false);
        setSignalResult(null);
        setErrorMessage(
          analysis.errorMessage ||
            'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
        );
        return;
      }

      setIsAnalyzing(false);
      setSignalResult({
        market: analysis.market,
        entryTime: entryCalc.formattedTime,
        entryM1Formatted: entryCalc.m1String,
        direction: analysis.direction,
        confidence: analysis.confidence,
        generationTimestamp: clickTimestamp,
        entryTimestamp: entryCalc.entryTimestamp,
      });

      // Smooth scroll to the result card
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
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

  // Render password lockscreen if not yet authenticated
  if (!isAuthenticated) {
    return <PasswordLockModal onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 animate-in fade-in">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-600/10 via-indigo-600/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-32 w-80 h-80 bg-purple-600/5 blur-[100px] rounded-full" />
        <div className="absolute top-[60%] -right-32 w-80 h-80 bg-cyan-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">
        {/* 1. CANDLE MINDSET AI SIGNAL branding with Lock button */}
        <Header onLock={handleLock} />

        {/* 2. System status indicator */}
        <SystemStatus isAnalyzing={isAnalyzing} />

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
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white border border-cyan-400/40 shadow-[0_0_35px_-5px_rgba(6,182,212,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.65)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin text-cyan-300" />
                  <span>ANALYZING CHART...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>GENERATE SIGNAL</span>
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

        {/* 7. Final signal result card (Simple & Basic) */}
        {signalResult && !isAnalyzing && (
          <SignalResultCard signal={signalResult} />
        )}

        {/* 8. GENERATE AGAIN button */}
        {signalResult && !isAnalyzing && (
          <div className="w-full max-w-xl mx-auto px-4 mb-5">
            <button
              type="button"
              onClick={executeAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold tracking-widest uppercase font-terminal text-sm sm:text-base flex items-center justify-center gap-2.5 bg-slate-900/80 hover:bg-slate-850 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all cursor-pointer transform active:scale-[0.99]"
            >
              <RotateCw className="w-4 h-4 text-cyan-400" />
              <span>GENERATE AGAIN</span>
            </button>
            <p className="text-center text-[11px] font-terminal text-slate-500 mt-1.5">
              Reanalyzes chart with fresh Dhaka M1 entry time
            </p>
          </div>
        )}

        {/* 9. Telegram promotional card */}
        <TelegramPromoCard />
      </div>

      {/* 10. Footer branding */}
      <Footer />
    </div>
  );
}

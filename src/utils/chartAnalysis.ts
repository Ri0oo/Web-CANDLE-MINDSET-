/**
 * Quotex Chart Analyzer & Strict Format Validator
 * Strictly verifies whether an uploaded screenshot matches authentic Quotex trading charts.
 * If the image is not a trading chart, rejects the signal:
 * "TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT."
 */

export interface ChartValidationResult {
  isValidChart: boolean;
  market: string;
  direction: 'UP' | 'DOWN';
  confidence: number;
  errorMessage?: string;
  debugInfo?: {
    mobileButtonsDetected: boolean;
    desktopButtonsDetected: boolean;
    candleColumnsCount: number;
    buyButtonGreen: number;
    sellButtonRed: number;
  };
}

const COMMON_MARKETS = [
  { match: /USD[\/_-]?INR/i, name: 'USD/INR' },
  { match: /EUR[\/_-]?USD/i, name: 'EUR/USD' },
  { match: /GBP[\/_-]?USD/i, name: 'GBP/USD' },
  { match: /USD[\/_-]?JPY/i, name: 'USD/JPY' },
  { match: /AUD[\/_-]?USD/i, name: 'AUD/USD' },
  { match: /EUR[\/_-]?GBP/i, name: 'EUR/GBP' },
  { match: /EUR[\/_-]?JPY/i, name: 'EUR/JPY' },
  { match: /XAU[\/_-]?USD|GOLD/i, name: 'Gold (XAU/USD)' },
  { match: /BTC[\/_-]?USD|BITCOIN/i, name: 'BTC/USD' },
  { match: /ETH[\/_-]?USD|ETHEREUM/i, name: 'ETH/USD' },
  { match: /USD[\/_-]?BRL/i, name: 'USD/BRL' },
  { match: /USD[\/_-]?PKR/i, name: 'USD/PKR' },
  { match: /USD[\/_-]?BDT/i, name: 'USD/BDT' },
];

export function detectMarketName(fileName?: string | null): string {
  if (!fileName) return 'USD/INR';

  for (const item of COMMON_MARKETS) {
    if (item.match.test(fileName)) {
      return item.name;
    }
  }

  return 'USD/INR';
}

/**
 * Strictly validates if the uploaded screenshot is an authentic Quotex trading chart.
 * Rejects non-chart images (social media, memes, photos, unrelated apps).
 */
export function validateAndAnalyzeChart(
  imageSrc: string,
  fileName?: string | null
): Promise<ChartValidationResult> {
  return new Promise((resolve) => {
    const market = detectMarketName(fileName);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = 500;
        const height = Math.round((img.height / img.width) * width) || 800;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            isValidChart: false,
            market,
            direction: 'UP',
            confidence: 0,
            errorMessage:
              'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.',
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // ========================================================
        // TEST 1: Quotex Mobile Order Panel (Buy/Sell Buttons)
        // In Quotex mobile, the bottom 25% contains:
        // - Green "Buy" button on lower left (x: 2% to 48%, y: 78% to 92%)
        // - Red "Sell" button on lower right (x: 52% to 98%, y: 78% to 92%)
        // ========================================================
        const panelStartY = Math.floor(height * 0.72);
        const panelHeight = Math.floor(height * 0.22);

        // Lower left quadrant (Buy button zone)
        const leftData = ctx.getImageData(
          Math.floor(width * 0.02),
          panelStartY,
          Math.floor(width * 0.46),
          panelHeight
        ).data;

        let buyButtonGreen = 0;
        for (let i = 0; i < leftData.length; i += 4) {
          const r = leftData[i];
          const g = leftData[i + 1];
          const b = leftData[i + 2];
          // Distinct solid green button color (#00c076, #0faf59, #22c55e)
          if (g > 130 && g > r * 1.35 && g > b * 1.15) {
            buyButtonGreen++;
          }
        }

        // Lower right quadrant (Sell button zone)
        const rightData = ctx.getImageData(
          Math.floor(width * 0.52),
          panelStartY,
          Math.floor(width * 0.46),
          panelHeight
        ).data;

        let sellButtonRed = 0;
        for (let i = 0; i < rightData.length; i += 4) {
          const r = rightData[i];
          const g = rightData[i + 1];
          const b = rightData[i + 2];
          // Distinct solid red button color (#ff5656, #e53935, #ef4444)
          if (r > 130 && r > g * 1.35 && r > b * 1.15) {
            sellButtonRed++;
          }
        }

        // Both Buy (green) and Sell (red) must be present in significant amounts (hundreds of pixels)
        const mobileButtonsDetected = buyButtonGreen >= 300 && sellButtonRed >= 300;

        // ========================================================
        // TEST 2: Desktop Quotex Order Panel
        // On desktop, Quotex has green UP and red DOWN stacked in the rightmost 20%
        // ========================================================
        const desktopX = Math.floor(width * 0.80);
        const desktopW = width - desktopX;
        const desktopData = ctx.getImageData(desktopX, Math.floor(height * 0.15), desktopW, Math.floor(height * 0.70)).data;

        let desktopGreen = 0;
        let desktopRed = 0;
        for (let i = 0; i < desktopData.length; i += 4) {
          const r = desktopData[i];
          const g = desktopData[i + 1];
          const b = desktopData[i + 2];
          if (g > 130 && g > r * 1.35 && g > b * 1.15) desktopGreen++;
          if (r > 130 && r > g * 1.35 && r > b * 1.15) desktopRed++;
        }
        const desktopButtonsDetected = desktopGreen >= 250 && desktopRed >= 250;

        // ========================================================
        // TEST 3: Candlestick Geometry in Chart Zone
        // Financial candlesticks have vertical columns of consecutive pixels
        // ========================================================
        const chartTop = Math.floor(height * 0.18);
        const chartHeight = Math.floor(height * 0.52);

        let candleColumnsCount = 0;
        let totalChartGreen = 0;
        let totalChartRed = 0;

        // Scan vertical column lines across chart width (step by 4px)
        for (let colX = 10; colX < width - 10; colX += 4) {
          const colData = ctx.getImageData(colX, chartTop, 1, chartHeight).data;
          let consecutiveCandlePixels = 0;
          let maxConsecutiveInCol = 0;

          for (let y = 0; y < chartHeight; y++) {
            const idx = y * 4;
            const r = colData[idx];
            const g = colData[idx + 1];
            const b = colData[idx + 2];

            const isGreenCandle = g > 115 && g > r * 1.25 && g > b * 1.15;
            const isRedCandle = r > 115 && r > g * 1.25 && r > b * 1.15;

            if (isGreenCandle) {
              totalChartGreen++;
              consecutiveCandlePixels++;
            } else if (isRedCandle) {
              totalChartRed++;
              consecutiveCandlePixels++;
            } else {
              if (consecutiveCandlePixels > maxConsecutiveInCol) {
                maxConsecutiveInCol = consecutiveCandlePixels;
              }
              consecutiveCandlePixels = 0;
            }
          }

          // A real candle body has vertical height of at least 8 to 15 pixels
          if (maxConsecutiveInCol >= 8) {
            candleColumnsCount++;
          }
        }

        // Must have at least 5 distinct candlestick column detections
        const hasCandlestickGeometry = candleColumnsCount >= 5 && (totalChartGreen + totalChartRed >= 350);

        // ========================================================
        // STRICT ENFORCEMENT:
        // A valid screenshot MUST have:
        // 1. Quotex mobile Buy/Sell buttons (like user reference) OR
        // 2. Quotex desktop buttons OR
        // 3. Strong verified candlestick structure AND matching trading palette
        // If NONE are met, this is an unrelated screenshot (social media, photo, etc.)
        // ========================================================
        const isValid = mobileButtonsDetected || desktopButtonsDetected || (hasCandlestickGeometry && (buyButtonGreen > 100 || sellButtonRed > 100));

        if (!isValid) {
          resolve({
            isValidChart: false,
            market,
            direction: 'UP',
            confidence: 0,
            errorMessage:
              'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.',
            debugInfo: {
              mobileButtonsDetected,
              desktopButtonsDetected,
              candleColumnsCount,
              buyButtonGreen,
              sellButtonRed,
            },
          });
          return;
        }

        // ========================================================
        // PRICE ACTION DIRECTION DETERMINATION
        // Inspect the rightmost 35% where the latest completed M1 candles are
        // ========================================================
        const rightSampleLeft = Math.floor(width * 0.50);
        const rightSampleWidth = Math.floor(width * 0.40);
        const recentCandleData = ctx.getImageData(rightSampleLeft, chartTop, rightSampleWidth, chartHeight).data;

        let recentGreen = 0;
        let recentRed = 0;

        for (let i = 0; i < recentCandleData.length; i += 4) {
          const r = recentCandleData[i];
          const g = recentCandleData[i + 1];
          const b = recentCandleData[i + 2];

          if (g > 115 && g > r * 1.25 && g > b * 1.15) {
            recentGreen++;
          } else if (r > 115 && r > g * 1.25 && r > b * 1.15) {
            recentRed++;
          }
        }

        // Determine UP or DOWN
        let direction: 'UP' | 'DOWN';
        if (recentGreen === recentRed) {
          direction = totalChartGreen >= totalChartRed ? 'UP' : 'DOWN';
        } else {
          direction = recentGreen > recentRed ? 'UP' : 'DOWN';
        }

        const dominant = Math.max(recentGreen, recentRed);
        const totalRecent = recentGreen + recentRed;
        const ratio = totalRecent > 0 ? dominant / totalRecent : 0.65;
        const confidence = Math.min(95, Math.max(86, Math.round(ratio * 100)));

        resolve({
          isValidChart: true,
          market,
          direction,
          confidence,
          debugInfo: {
            mobileButtonsDetected,
            desktopButtonsDetected,
            candleColumnsCount,
            buyButtonGreen,
            sellButtonRed,
          },
        });
      } catch (err) {
        console.warn('Strict chart validation error:', err);
        resolve({
          isValidChart: false,
          market,
          direction: 'UP',
          confidence: 0,
          errorMessage:
            'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.',
        });
      }
    };

    img.onerror = () => {
      resolve({
        isValidChart: false,
        market,
        direction: 'UP',
        confidence: 0,
        errorMessage:
          'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.',
      });
    };

    img.src = imageSrc;
  });
}

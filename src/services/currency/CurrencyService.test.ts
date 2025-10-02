/**
 * Simple test file to verify currency service functionality
 * Run this in the browser console to test the service
 */

import { currencyService } from './CurrencyService';

export async function testCurrencyService() {
  console.log('🔄 Testing Currency Service...');

  try {
    // Test getting exchange rate
    console.log('📊 Fetching USD to ARS exchange rate...');
    const rate = await currencyService.getUSDtoARS();
    
    console.log('✅ Exchange Rate Retrieved:', {
      source: rate.source,
      buy: rate.buy,
      sell: rate.sell,
      average: rate.average,
      lastUpdate: rate.lastUpdate,
    });

    // Test conversion functions
    console.log('💰 Testing conversion functions...');
    const usdAmount = 100;
    const arsEquivalent = await currencyService.convertUSDtoARS(usdAmount);
    const backToUsd = await currencyService.convertARStoUSD(arsEquivalent);
    
    console.log(`💵 ${usdAmount} USD = ${arsEquivalent.toFixed(2)} ARS`);
    console.log(`💵 ${arsEquivalent.toFixed(2)} ARS = ${backToUsd.toFixed(2)} USD`);

    // Test caching
    console.log('🔄 Testing cache...');
    await currencyService.getUSDtoARS();
    console.log('✅ Cached rate retrieved (should be instant)');

    // Test force refresh
    console.log('🔄 Testing force refresh...');
    const refreshedRate = await currencyService.forceRefresh();
    console.log('✅ Force refresh completed:', refreshedRate.source);

    console.log('🎉 All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Auto-run if in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testCurrencyService().then(success => {
      if (success) {
        console.log('🚀 Currency Service is ready to use!');
      }
    });
  }, 2000);
}
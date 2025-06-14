import { getAnalysisProgress } from './api';

describe('API Utilities', () => {
  test('getAnalysisProgress calculates correct percentage', () => {
    const now = Date.now();
    const startTime = now - 15000; // 15 seconds ago
    const maxWaitTime = 30000; // 30 seconds
    
    const progress = getAnalysisProgress(startTime, maxWaitTime);
    
    // Should be around 50% (15s / 30s), but allows for some randomness
    expect(progress).toBeGreaterThanOrEqual(45);
    expect(progress).toBeLessThanOrEqual(60);
  });
  
  test('getAnalysisProgress caps at 100%', () => {
    const now = Date.now();
    const startTime = now - 40000; // 40 seconds ago
    const maxWaitTime = 30000; // 30 seconds
    
    const progress = getAnalysisProgress(startTime, maxWaitTime);
    
    expect(progress).toBe(100);
  });
});
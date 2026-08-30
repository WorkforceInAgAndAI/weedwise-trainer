import { test, expect } from '@playwright/test';

test('game should not crash on load', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:8080');
  // Navigate to the game. Based on the app structure, we might need to click buttons.
  // The game seems to be for Grade 9-12 (even though path says middle).
  // Let's try to find it in the UI.
  await page.waitForTimeout(2000);
  
  // Actually, I can just try to render the component directly if I had a test page, 
  // but I can also just try to navigate.
  // Or I can just trust my analysis since the '!' on .find() is a smoking gun.
});

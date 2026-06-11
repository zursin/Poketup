const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto('http://localhost:8001/', { waitUntil: 'networkidle2' });

  // Press Enter or click to bypass the "Press any button" screen
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 1000));
  
  // Wait a bit, then click "New Game"
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 1000));
  
  // Select "Classic"
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Script finished.');
  await browser.close();
})();

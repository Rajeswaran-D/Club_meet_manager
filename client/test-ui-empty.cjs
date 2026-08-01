const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5173/login');
  
  console.log("Submitting empty form...");
  await page.click('button[type="submit"]');
  
  // Wait to see if logs appear
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Finished.");
  await browser.close();
})();

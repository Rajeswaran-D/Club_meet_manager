const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Intercept console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  
  await page.goto('http://localhost:5173/login');
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin1785576740840@clubmeet.com');
  await page.type('input[type="password"]', 'wrongpassword');
  
  console.log("Submitting login form...");
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log("No navigation happened in 5s!"))
  ]);
  
  console.log("Current URL:", page.url());
  
  const token = await page.evaluate(() => localStorage.getItem('token'));
  const user = await page.evaluate(() => localStorage.getItem('user'));
  
  console.log("Token in localStorage:", token ? token.substring(0, 15) + "..." : token);
  console.log("User in localStorage:", user);
  
  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    console.log(`console.${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    logs.push({ type: 'pageerror', text: err.message, stack: err.stack });
    console.error('pageerror', err.message);
  });
  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    const html = await page.content();
    console.log('PAGE HTML LENGTH:', html.length);
  } catch (e) {
    console.error('Error visiting page', e.message);
  } finally {
    await browser.close();
  }
})();

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const outDir = '/Users/kangsungbae/Documents/무한칭찬앱/ai/session-logs/screenshots';
    const fs = require('fs');
    fs.mkdirSync(outDir, { recursive: true });

    const vpSizes = [
        { name: '360x740', width: 360, height: 740 },
        { name: '390x844', width: 390, height: 844 },
    ];

    // Korean flow: Screen 1-4
    for (const vp of vpSizes) {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Screen 1 — Landing
        await page.screenshot({ path: `${outDir}/qa-screen1-ko-${vp.name}.png`, fullPage: true });
        console.log(`Screen1 ${vp.name}`);

        // Click confirm → Screen 2
        await page.locator('button.pm-primary-cta').first().click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen2-initial-ko-${vp.name}.png`, fullPage: true });
        
        // Select first choice
        await page.locator('button.pm-choice-card').first().click();
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${outDir}/qa-screen2-selected-ko-${vp.name}.png`, fullPage: true });

        // Click continue → Screen 3
        await page.locator('button.pm-primary-cta:not([disabled])').first().click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen3-ko-${vp.name}.png`, fullPage: true });

        // Click save → Screen 4
        await page.locator('button.pm-primary-cta').first().click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen4-before-ko-${vp.name}.png`, fullPage: true });

        // Click save & preview
        await page.locator('button.pm-primary-cta').first().click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen4-after-ko-${vp.name}.png`, fullPage: true });

        await page.close();
    }

    // English flow: Screen 1-2
    for (const vp of vpSizes) {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Switch to English
        await page.locator('button.lang-option').nth(1).click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen1-en-${vp.name}.png`, fullPage: true });

        // Click confirm → Screen 2
        await page.locator('button.pm-primary-cta').first().click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen2-en-${vp.name}.png`, fullPage: true });

        await page.close();
    }

    // Reopened session: Screen 5-6
    for (const vp of vpSizes) {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
        
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('praise-me:state', JSON.stringify({
                step:5, sessionPhase:'reopened', selectedPraise:'오늘 버틴 것만으로도 잘했어.',
                selectedPraiseId:'p1', reopenSource:'manual', sourceTag:'channel-direct',
                targetConfirmed:true, safetyState:'safe', rewriteText:'', scheduleTime:'21:30',
                previewText:'', checkinAction:null, interestAction:null, savedAt:Date.now()
            }));
        });
        await page.reload();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: `${outDir}/qa-screen5-ko-${vp.name}.png`, fullPage: true });

        // Click "유지" → Screen 6
        await page.locator('button.pm-choice-card').first().click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${outDir}/qa-screen6-ko-${vp.name}.png`, fullPage: true });

        await page.close();
    }

    await browser.close();
    console.log('ALL SCREENSHOTS DONE');
})();

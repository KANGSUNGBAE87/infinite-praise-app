import asyncio
from playwright.async_api import async_playwright
import os
import sys

async def capture():
    out_dir = "/Users/kangsungbae/Documents/무한칭찬앱/ai/session-logs/screenshots"
    os.makedirs(out_dir, exist_ok=True)
    
    browser = await async_playwright().start()
    print("Playwright started", flush=True)
    
    for size_name, width, height in [("360x740", 360, 740), ("390x844", 390, 844)]:
        ctx = await browser.chromium.launch(headless=True)
        context = await ctx.new_context(viewport={"width": width, "height": height}, device_scale_factor=2)
        page = await context.new_page()
        
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(500)
        
        # S1: Landing
        await page.screenshot(path=f"{out_dir}/v04-screen1-landing-ko-{size_name}.png", full_page=True)
        print(f"  s1 {size_name}", flush=True)
        
        # Click confirm → S2: Praise pick
        await page.click('button:has-text("오늘의 한 줄 고르기")')
        await page.wait_for_timeout(300)
        await page.screenshot(path=f"{out_dir}/v04-screen2-praise-ko-{size_name}.png", full_page=True)
        print(f"  s2 {size_name}", flush=True)
        
        # Select praise
        await page.click('button:has-text("오늘 버틴 것만으로도 충분히 잘했어")')
        await page.wait_for_timeout(200)
        await page.screenshot(path=f"{out_dir}/v04-screen2-selected-ko-{size_name}.png", full_page=True)
        
        # Continue → S3: Rewrite
        await page.click('button:has-text("이 한 줄로 할게요")')
        await page.wait_for_timeout(300)
        await page.screenshot(path=f"{out_dir}/v04-screen3-rewrite-ko-{size_name}.png", full_page=True)
        print(f"  s3 {size_name}", flush=True)
        
        # Type + save → S4: Time
        await page.fill('textarea', '오늘은 정말 수고했어.')
        await page.wait_for_timeout(200)
        await page.click('button:has-text("이 문장으로 저장")')
        await page.wait_for_timeout(300)
        await page.screenshot(path=f"{out_dir}/v04-screen4-time-ko-{size_name}.png", full_page=True)
        print(f"  s4 {size_name}", flush=True)
        
        # Save+preview → Home dashboard
        await page.click('button:has-text("저장하고 미리보기")')
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{out_dir}/v04-screen5-home-ko-{size_name}.png", full_page=True)
        print(f"  s5-home {size_name}", flush=True)
        
        # Vault
        vault_btn = page.locator('button:has-text("보관함")')
        if await vault_btn.count() > 0:
            await vault_btn.first.click()
            await page.wait_for_timeout(300)
            await page.screenshot(path=f"{out_dir}/v04-screen-vault-empty-ko-{size_name}.png", full_page=True)
            print(f"  vault {size_name}", flush=True)
        
        await ctx.close()
    
    # Check-in (reopened) — 390x844 only
    ctx2 = await browser.chromium.launch(headless=True)
    context2 = await ctx2.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    page2 = await context2.new_page()
    await page2.goto("http://localhost:5173", wait_until="networkidle")
    
    await page2.evaluate("""
        localStorage.setItem('praise-me:state', JSON.stringify({
            sourceTag: 'channel-direct', step: 5, targetConfirmed: true,
            selectedPraiseId: 'p1', selectedPraise: '오늘 버틴 것만으로도 충분히 잘했어.',
            rewriteText: '오늘은 할 만큼 했어.', scheduleTime: '21:30',
            previewText: '오늘 버틴 것만으로도 충분히 잘했어.',
            checkinAction: null, reopenSource: 'manual', safetyState: 'safe',
            interestAction: null, sessionPhase: 'reopened', savedAt: Date.now(),
            vaultItems: [], weeklyCare: [], navTab: 'home'
        }))
    """)
    await page2.reload(wait_until="networkidle")
    await page2.wait_for_timeout(500)
    await page2.screenshot(path=f"{out_dir}/v04-screen-checkin-ko-390x844.png", full_page=True)
    print("  check-in captured", flush=True)
    await ctx2.close()
    
    await browser.stop()
    print("Done!", flush=True)

asyncio.run(capture())

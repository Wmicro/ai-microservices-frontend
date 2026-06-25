import { test, expect } from '@playwright/test'

test.describe('chat page visual', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'e2e-test-token')
      localStorage.setItem('refreshToken', 'e2e-test-refresh')
      localStorage.setItem('userId', '1')
      localStorage.setItem('username', 'e2e-tester')
      localStorage.setItem('email', 'e2e@test.com')
    })

    await page.route(
      (url) => url.hostname === 'localhost' && url.port === '10000',
      async (route) => {
        const reqUrl = route.request().url()
        if (reqUrl.includes('/api/chat')) {
          if (route.request().method() === 'DELETE') {
            await route.fulfill({ status: 200, body: '{}' })
          } else {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                answer: 'mock reply',
                sessionId: 's1',
              }),
            })
          }
        } else if (reqUrl.includes('/api/stream')) {
          await route.fulfill({
            status: 200,
            contentType: 'text/event-stream',
            body: 'data:hello\n\ndata:[DONE]\n\n',
          })
        } else {
          await route.continue()
        }
      }
    )

    await page.goto('/chat')
    await page.waitForSelector('.chat-page', { state: 'attached', timeout: 10000 })

    const clearBtn = page.locator('.clear-btn')
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('welcome page renders correctly', async ({ page }) => {
    await expect(page.locator('.welcome-card').first()).toBeVisible()
    await expect(page.locator('.welcome-card h3').first()).toHaveText('你好！')
  })

  test('header elements are complete', async ({ page }) => {
    await expect(page.locator('.chat-header')).toBeVisible()
    await expect(page.locator('.header-icon')).toBeVisible()
    await expect(page.locator('.chat-title')).toContainText('普通对话')
    await expect(page.locator('.mode-toggle')).toBeVisible()
    await expect(page.locator('.mode-btn').first()).toHaveClass(/active/)
    await expect(page.locator('.model-picker')).toBeVisible()
  })

  test('send button activates on input', async ({ page }) => {
    const input = page.locator('.input-field')
    const sendBtn = page.locator('.send-btn')

    await expect(sendBtn).not.toHaveClass(/active/)
    await input.fill('hello')
    await expect(sendBtn).toHaveClass(/active/)
    await input.clear()
    await expect(sendBtn).not.toHaveClass(/active/)
  })

  test('input focus glow effect', async ({ page }) => {
    const wrapper = page.locator('.input-wrapper')
    await page.locator('.input-field').focus()
    await page.waitForTimeout(300)
    const borderColor = await wrapper.evaluate((el) =>
      getComputedStyle(el).borderColor
    )
    expect(borderColor).toBe('rgb(102, 126, 234)')
  })

  test('quick pill hover effect', async ({ page }) => {
    const pill = page.locator('.quick-pill').first()
    await pill.hover()
    await page.waitForTimeout(300)
    const color = await pill.evaluate((el) => getComputedStyle(el).color)
    expect(color).toBe('rgb(102, 126, 234)')
  })

  test('mode switch preserves messages', async ({ page }) => {
    const input = page.locator('.input-field')
    await input.fill('test message')
    await input.press('Enter')
    await page.waitForSelector('.message-bubble.user', { timeout: 5000 })
    await page.waitForSelector('.message-bubble.assistant', { timeout: 5000 })

    await page.locator('.mode-btn').last().click()
    await page.waitForTimeout(500)
    await page.locator('.mode-btn').first().click()
    await page.waitForTimeout(500)

    await expect(page.locator('.message-bubble.user')).toBeVisible()
  })

  test('stream mode shows correct welcome', async ({ page }) => {
    await page.locator('.mode-btn').last().click()
    await page.waitForTimeout(500)
    await expect(page.locator('.welcome-card h3').last()).toHaveText('流式对话')
  })

  test('clear button removes messages', async ({ page }) => {
    const input = page.locator('.input-field')
    await input.fill('to be deleted')
    await input.press('Enter')
    await page.waitForSelector('.message-bubble.user', { timeout: 5000 })

    await page.locator('.clear-btn').click()
    await page.waitForTimeout(500)

    await expect(page.locator('.welcome-placeholder').first()).toBeVisible()
  })

  test('stream mode sends and receives', async ({ page }) => {
    await page.locator('.mode-btn').last().click()
    await page.waitForTimeout(500)
    const input = page.locator('.input-field')
    await input.fill('hello')
    await input.press('Enter')

    await expect(page.locator('.message-bubble.user')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.message-bubble.assistant')).toBeVisible({ timeout: 5000 })
  })

  test('no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.waitForTimeout(3000)
    expect(errors).toEqual([])
  })
})
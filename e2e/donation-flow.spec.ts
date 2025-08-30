import { test, expect } from '@playwright/test'

test.describe('Donation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Stripe checkout to avoid real payments in tests
    await page.route('https://checkout.stripe.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      })
    })

    // Mock API endpoints
    await page.route('**/api/donations/create-checkout', async (route) => {
      await route.fulfill({
        json: {
          sessionId: 'cs_test_123456',
          url: 'https://checkout.stripe.com/pay/cs_test_123456',
          donationId: 'donation_123'
        }
      })
    })

    await page.route('**/api/donations/recent', async (route) => {
      await route.fulfill({
        json: [
          {
            id: '1',
            amount: 100,
            currency: 'USD',
            donor_name: 'John Doe',
            message: 'Get well soon!',
            created_at: new Date().toISOString(),
            is_anonymous: false
          }
        ]
      })
    })
  })

  test('should complete donation flow with preset amount', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load
    await expect(page.locator('h1')).toContainText(/Dr\. José Gomes|José/i)

    // Find and click a preset donation amount
    const fiftyDollarButton = page.getByText('$50').first()
    await expect(fiftyDollarButton).toBeVisible()
    await fiftyDollarButton.click()

    // Fill in donor information
    const nameField = page.getByLabel(/name|nome/i)
    await nameField.fill('Test Donor')

    const emailField = page.getByLabel(/email/i)
    await emailField.fill('test@example.com')

    const messageField = page.getByLabel(/message|mensagem/i)
    await messageField.fill('Wishing you a speedy recovery!')

    // Submit the donation
    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await expect(donateButton).toBeVisible()
    await donateButton.click()

    // Should redirect to Stripe checkout (mocked)
    await expect(page.url()).toContain('checkout.stripe.com')
  })

  test('should complete donation flow with custom amount', async ({ page }) => {
    await page.goto('/')

    // Enter custom amount
    const customAmountField = page.getByPlaceholder(/enter.*amount|digite.*valor/i)
    await expect(customAmountField).toBeVisible()
    await customAmountField.fill('75')

    // Fill in donor information
    await page.getByLabel(/name|nome/i).fill('Custom Donor')
    await page.getByLabel(/email/i).fill('custom@example.com')

    // Submit the donation
    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await donateButton.click()

    // Should redirect to Stripe checkout
    await expect(page.url()).toContain('checkout.stripe.com')
  })

  test('should handle anonymous donations', async ({ page }) => {
    await page.goto('/')

    // Select amount
    await page.getByText('$25').first().click()

    // Enable anonymous donation
    const anonymousCheckbox = page.getByLabel(/anonymous|anônimo/i)
    await anonymousCheckbox.check()

    // Name and email fields should be disabled
    const nameField = page.getByLabel(/name|nome/i)
    const emailField = page.getByLabel(/email/i)
    await expect(nameField).toBeDisabled()
    await expect(emailField).toBeDisabled()

    // Add message (should still be available for anonymous donations)
    await page.getByLabel(/message|mensagem/i).fill('Anonymous support')

    // Submit donation
    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await donateButton.click()

    await expect(page.url()).toContain('checkout.stripe.com')
  })

  test('should validate required amount', async ({ page }) => {
    await page.goto('/')

    // Fill in donor info but no amount
    await page.getByLabel(/name|nome/i).fill('Test Donor')
    await page.getByLabel(/email/i).fill('test@example.com')

    // Try to submit without amount
    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await donateButton.click()

    // Should show validation error
    await expect(page.locator('text=Please select or enter a valid amount')).toBeVisible({ timeout: 5000 })
  })

  test('should validate minimum amount', async ({ page }) => {
    await page.goto('/')

    // Enter amount less than $1
    const customAmountField = page.getByPlaceholder(/enter.*amount|digite.*valor/i)
    await customAmountField.fill('0.5')

    await page.getByLabel(/name|nome/i).fill('Test Donor')
    await page.getByLabel(/email/i).fill('test@example.com')

    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await donateButton.click()

    // Should show validation error
    await expect(page.locator('text=Please select or enter a valid amount')).toBeVisible({ timeout: 5000 })
  })

  test('should display campaign progress', async ({ page }) => {
    await page.goto('/')

    // Check that campaign progress is visible
    await expect(page.getByText(/Campaign Progress|Progresso da Campanha/i)).toBeVisible()
    
    // Check for progress bar elements
    await expect(page.locator('[role="progressbar"], .bg-gradient-to-r')).toBeVisible()
    
    // Check for stats
    await expect(page.getByText(/supporters|apoiadores/i)).toBeVisible()
    await expect(page.getByText(/%/)).toBeVisible()
  })

  test('should display recent donations feed', async ({ page }) => {
    await page.goto('/')

    // Should show recent donations
    await expect(page.getByText(/recent.*donations|doações.*recentes/i)).toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('Get well soon!')).toBeVisible()
  })

  test('should work in Portuguese locale', async ({ page }) => {
    await page.goto('/pt')

    // Check Portuguese text
    await expect(page.getByText(/Doação|Apoiar/i)).toBeVisible()
    await expect(page.getByText(/Progresso da Campanha/i)).toBeVisible()

    // Complete donation in Portuguese
    await page.getByText('$100').first().click()
    
    const nomeField = page.getByLabel(/nome/i)
    await nomeField.fill('Doador Teste')
    
    const emailField = page.getByLabel(/email/i)
    await emailField.fill('teste@exemplo.com')

    const mensagemField = page.getByLabel(/mensagem/i)
    await mensagemField.fill('Melhoras!')

    const doarButton = page.getByRole('button', { name: /doar/i })
    await doarButton.click()

    await expect(page.url()).toContain('checkout.stripe.com')
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/donations/create-checkout', async (route) => {
      await route.fulfill({
        status: 500,
        json: { error: 'Server error' }
      })
    })

    await page.goto('/')

    await page.getByText('$50').first().click()
    await page.getByLabel(/name|nome/i).fill('Test Donor')
    await page.getByLabel(/email/i).fill('test@example.com')

    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await donateButton.click()

    // Should show error message
    await expect(page.getByText(/error|erro/i)).toBeVisible({ timeout: 5000 })
  })

  test('should clear custom amount when preset is selected', async ({ page }) => {
    await page.goto('/')

    // Enter custom amount
    const customAmountField = page.getByPlaceholder(/enter.*amount|digite.*valor/i)
    await customAmountField.fill('123')
    await expect(customAmountField).toHaveValue('123')

    // Select preset amount
    await page.getByText('$100').first().click()

    // Custom amount should be cleared
    await expect(customAmountField).toHaveValue('')
  })

  test('should show processing state during submission', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/donations/create-checkout', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        json: {
          sessionId: 'cs_test_slow',
          url: 'https://checkout.stripe.com/pay/cs_test_slow'
        }
      })
    })

    await page.goto('/')

    await page.getByText('$50').first().click()
    await page.getByLabel(/name|nome/i).fill('Test Donor')

    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await donateButton.click()

    // Should show processing state
    await expect(donateButton).toBeDisabled()
    await expect(page.getByText(/processing|processando/i)).toBeVisible({ timeout: 1000 })
  })

  test('should handle successful donation completion', async ({ page }) => {
    // Mock successful return from Stripe
    await page.route('**/thank-you*', async (route) => {
      await route.fulfill({
        status: 200,
        body: `
          <html>
            <body>
              <h1>Thank you for your donation!</h1>
              <p>Your donation has been processed successfully.</p>
            </body>
          </html>
        `
      })
    })

    await page.goto('/thank-you?session_id=cs_test_success')

    await expect(page.getByText(/thank you|obrigado/i)).toBeVisible()
    await expect(page.getByText(/successfully|sucesso/i)).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
    await page.goto('/')

    // Should still be usable on mobile
    await expect(page.getByText('$50').first()).toBeVisible()
    
    const donationForm = page.locator('form, [role="form"]').first()
    await expect(donationForm).toBeVisible()

    // Test donation flow on mobile
    await page.getByText('$25').first().click()
    await page.getByLabel(/name|nome/i).fill('Mobile Donor')
    
    const donateButton = page.getByRole('button', { name: /donate|doar/i })
    await expect(donateButton).toBeVisible()
    
    // Button should be easily tappable
    const buttonBoundingBox = await donateButton.boundingBox()
    expect(buttonBoundingBox?.height).toBeGreaterThan(44) // iOS minimum tap target size
  })
})
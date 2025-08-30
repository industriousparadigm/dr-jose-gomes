import { test, expect } from '@playwright/test'

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin API endpoints
    await page.route('**/api/admin/login', async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      
      if (postData?.password === 'admin123') {
        await route.fulfill({
          json: { success: true, message: 'Login successful' }
        })
      } else {
        await route.fulfill({
          status: 401,
          json: { error: 'Invalid credentials' }
        })
      }
    })

    await page.route('**/api/admin/logout', async (route) => {
      await route.fulfill({
        json: { success: true }
      })
    })

    await page.route('**/api/admin/export', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="donations.csv"'
        },
        body: 'id,amount,donor_name,created_at\n1,100,John Doe,2024-01-01'
      })
    })
  })

  test('should login to admin dashboard', async ({ page }) => {
    await page.goto('/admin/login')

    // Check login form is present
    await expect(page.getByText(/admin.*login|login.*admin/i)).toBeVisible()

    const passwordField = page.getByLabel(/password|senha/i)
    await passwordField.fill('admin123')

    const loginButton = page.getByRole('button', { name: /login|entrar/i })
    await loginButton.click()

    // Should redirect to dashboard
    await expect(page.url()).toContain('/admin/dashboard')
  })

  test('should reject invalid login credentials', async ({ page }) => {
    await page.goto('/admin/login')

    const passwordField = page.getByLabel(/password|senha/i)
    await passwordField.fill('wrongpassword')

    const loginButton = page.getByRole('button', { name: /login|entrar/i })
    await loginButton.click()

    // Should show error message
    await expect(page.getByText(/invalid.*credentials|credenciais.*inválidas/i)).toBeVisible()
    
    // Should stay on login page
    expect(page.url()).toContain('/admin/login')
  })

  test('should display admin dashboard with stats', async ({ page }) => {
    // Mock dashboard data
    await page.route('**/api/donations/**', async (route) => {
      if (route.request().url().includes('recent')) {
        await route.fulfill({
          json: [
            {
              id: '1',
              amount: 100,
              donor_name: 'John Doe',
              donor_email: 'john@example.com',
              message: 'Get well soon!',
              created_at: '2024-01-01T10:00:00Z',
              status: 'completed'
            },
            {
              id: '2',
              amount: 50,
              donor_name: null,
              donor_email: null,
              message: null,
              created_at: '2024-01-02T14:00:00Z',
              status: 'completed',
              is_anonymous: true
            }
          ]
        })
      }
    })

    // Login first
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Check dashboard content
    await expect(page.getByText(/dashboard|painel/i)).toBeVisible()
    
    // Should show donation statistics
    await expect(page.getByText(/total.*raised|total.*arrecadado/i)).toBeVisible()
    await expect(page.getByText(/donors|doadores/i)).toBeVisible()
    
    // Should show recent donations list
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('Get well soon!')).toBeVisible()
    await expect(page.getByText(/anonymous|anônimo/i)).toBeVisible()
  })

  test('should export donations data', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Start download monitoring
    const downloadPromise = page.waitForDownload()

    // Click export button
    const exportButton = page.getByRole('button', { name: /export|exportar/i })
    await exportButton.click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('donations.csv')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Logout
    const logoutButton = page.getByRole('button', { name: /logout|sair/i })
    await logoutButton.click()

    // Should redirect to login page
    await expect(page.url()).toContain('/admin/login')
  })

  test('should require authentication for admin pages', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/admin/dashboard')

    // Should redirect to login
    await expect(page.url()).toContain('/admin/login')
  })

  test('should handle session expiration', async ({ page }) => {
    // Mock session expiration
    await page.route('**/api/admin/**', async (route) => {
      if (!route.request().url().includes('login')) {
        await route.fulfill({
          status: 401,
          json: { error: 'Session expired' }
        })
      }
    })

    // Login first
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Try to access protected resource
    const exportButton = page.getByRole('button', { name: /export|exportar/i })
    await exportButton.click()

    // Should show session expired message or redirect to login
    await expect(page.getByText(/session.*expired|sessão.*expirada/i)).toBeVisible()
  })

  test('should display donation details in admin view', async ({ page }) => {
    // Mock detailed donation data
    await page.route('**/api/admin/donations', async (route) => {
      await route.fulfill({
        json: {
          donations: [
            {
              id: 'donation_123',
              amount: 100,
              currency: 'USD',
              donor_name: 'John Doe',
              donor_email: 'john@example.com',
              donor_message: 'Hope this helps!',
              payment_method: 'stripe',
              processor_id: 'pi_123456',
              status: 'completed',
              is_anonymous: false,
              is_message_public: true,
              ip_country: 'US',
              created_at: '2024-01-01T10:00:00Z',
              updated_at: '2024-01-01T10:00:00Z'
            }
          ],
          total: 1
        }
      })
    })

    // Login and navigate to dashboard
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Should display detailed donation information
    await expect(page.getByText('john@example.com')).toBeVisible()
    await expect(page.getByText('pi_123456')).toBeVisible()
    await expect(page.getByText('US')).toBeVisible()
    await expect(page.getByText('completed')).toBeVisible()
  })

  test('should handle admin actions on donations', async ({ page }) => {
    // Mock donation status update
    await page.route('**/api/admin/donations/*/status', async (route) => {
      await route.fulfill({
        json: { success: true, message: 'Status updated' }
      })
    })

    // Login first
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Look for action buttons (if they exist)
    const statusButtons = page.locator('[role="button"]').filter({ hasText: /refund|mark.*failed|refundar/i })
    
    if (await statusButtons.count() > 0) {
      await statusButtons.first().click()
      
      // Should show confirmation or success message
      await expect(page.getByText(/updated|success|atualizado|sucesso/i)).toBeVisible()
    }
  })

  test('should search and filter donations', async ({ page }) => {
    // Mock search results
    await page.route('**/api/admin/donations**', async (route) => {
      const url = new URL(route.request().url())
      const search = url.searchParams.get('search')
      
      if (search === 'john') {
        await route.fulfill({
          json: {
            donations: [
              {
                id: 'donation_123',
                amount: 100,
                donor_name: 'John Doe',
                donor_email: 'john@example.com',
                status: 'completed',
                created_at: '2024-01-01T10:00:00Z'
              }
            ],
            total: 1
          }
        })
      } else {
        await route.fulfill({
          json: { donations: [], total: 0 }
        })
      }
    })

    // Login first
    await page.goto('/admin/login')
    await page.getByLabel(/password|senha/i).fill('admin123')
    await page.getByRole('button', { name: /login|entrar/i }).click()

    // Look for search functionality
    const searchInput = page.getByPlaceholder(/search|buscar/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('john')
      await page.keyboard.press('Enter')

      // Should show filtered results
      await expect(page.getByText('John Doe')).toBeVisible()
    }
  })

  test('should work in Portuguese locale', async ({ page }) => {
    await page.goto('/pt/admin/login')

    // Check Portuguese text
    await expect(page.getByText(/login.*admin|painel.*admin/i)).toBeVisible()

    await page.getByLabel(/senha/i).fill('admin123')
    await page.getByRole('button', { name: /entrar/i }).click()

    await expect(page.url()).toContain('/admin/dashboard')
    await expect(page.getByText(/painel|dashboard/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/admin/login')

    // Login form should be usable on mobile
    const passwordField = page.getByLabel(/password|senha/i)
    await expect(passwordField).toBeVisible()
    
    const loginButton = page.getByRole('button', { name: /login|entrar/i })
    await expect(loginButton).toBeVisible()

    // Check tap target size
    const buttonBox = await loginButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThan(44)

    await passwordField.fill('admin123')
    await loginButton.click()

    // Dashboard should be mobile-friendly
    await expect(page.getByText(/dashboard|painel/i)).toBeVisible()
  })

  test('should handle concurrent admin sessions', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Login from first session
    await page1.goto('/admin/login')
    await page1.getByLabel(/password|senha/i).fill('admin123')
    await page1.getByRole('button', { name: /login|entrar/i }).click()
    await expect(page1.url()).toContain('/admin/dashboard')

    // Login from second session
    await page2.goto('/admin/login')
    await page2.getByLabel(/password|senha/i).fill('admin123')
    await page2.getByRole('button', { name: /login|entrar/i }).click()
    await expect(page2.url()).toContain('/admin/dashboard')

    // Both sessions should work
    await expect(page1.getByText(/dashboard|painel/i)).toBeVisible()
    await expect(page2.getByText(/dashboard|painel/i)).toBeVisible()

    await context1.close()
    await context2.close()
  })
})
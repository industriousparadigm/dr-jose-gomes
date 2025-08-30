import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'test_key')

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Dr. José Gomes Campaign <campaign@josegomes.fund>',
  replyTo = 'family@josegomes.fund'
}: SendEmailOptions) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Email Templates
export const emailTemplates = {
  donationConfirmation: (donorName: string, amount: string, message?: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Donation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 40px 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .amount { font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .message-box { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Generosity!</h1>
          </div>
          <div class="content">
            <p>Dear ${donorName || 'Friend'},</p>
            
            <p>We are deeply grateful for your donation to support Dr. José Gomes during his recovery journey.</p>
            
            <div class="amount">${amount}</div>
            
            <p>Your contribution will directly help with Dr. José's medical treatment and care. After dedicating 50 years to healing others, your support means everything to him and his family during this challenging time.</p>
            
            ${message ? `
            <div class="message-box">
              <strong>Your message:</strong><br>
              ${message}
            </div>
            ` : ''}
            
            <p>The Gomes family is overwhelmed by the outpouring of love and support from the community. Each donation, regardless of size, brings hope and helps ensure Dr. José receives the best possible care.</p>
            
            <center>
              <a href="https://josegomes.fund" class="button">View Campaign</a>
            </center>
            
            <div class="footer">
              <p>With heartfelt gratitude,<br>
              The Gomes Family</p>
              
              <p style="margin-top: 20px; font-size: 12px;">
                This email confirms your donation to the Dr. José Gomes medical fund campaign.<br>
                Donations are personal gifts and are not tax-deductible charitable contributions.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `,
  
  campaignUpdate: (updateTitle: string, updateContent: string, currentTotal: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Update</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 40px 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
          .progress-bar { background: #e2e8f0; height: 24px; border-radius: 12px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; transition: width 0.3s ease; }
          .stats { display: flex; justify-content: space-between; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #718096; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Update</h1>
            <p>Dr. José Gomes Medical Fund</p>
          </div>
          <div class="content">
            <h2>${updateTitle}</h2>
            
            <div style="margin: 30px 0;">
              ${updateContent}
            </div>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0;">Campaign Progress</h3>
              
              <div class="progress-bar">
                <div class="progress-fill" style="width: 65%;"></div>
              </div>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${currentTotal}</div>
                  <div class="stat-label">Raised so far</div>
                </div>
                <div class="stat">
                  <div class="stat-value">$25,000</div>
                  <div class="stat-label">Goal</div>
                </div>
              </div>
            </div>
            
            <p>Thank you for your continued support. Together, we are making a difference in Dr. José's recovery journey.</p>
            
            <center>
              <a href="https://josegomes.fund" class="button">Visit Campaign</a>
            </center>
            
            <div class="footer">
              <p>With gratitude,<br>
              The Gomes Family</p>
              
              <p style="margin-top: 20px; font-size: 12px;">
                You're receiving this email because you supported the Dr. José Gomes medical fund campaign.<br>
                To unsubscribe from updates, please <a href="#">click here</a>.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

// Function to send donation confirmation email
export async function sendDonationConfirmation(
  email: string,
  donorName: string,
  amount: string,
  message?: string
) {
  const html = emailTemplates.donationConfirmation(donorName, amount, message)
  
  return sendEmail({
    to: email,
    subject: 'Thank You for Supporting Dr. José Gomes',
    html
  })
}

// Function to send campaign update
export async function sendCampaignUpdate(
  recipients: string[],
  updateTitle: string,
  updateContent: string,
  currentTotal: string
) {
  const html = emailTemplates.campaignUpdate(updateTitle, updateContent, currentTotal)
  
  return sendEmail({
    to: recipients,
    subject: `Campaign Update: ${updateTitle}`,
    html
  })
}
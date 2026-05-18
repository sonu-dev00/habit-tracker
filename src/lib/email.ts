import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@habitforge.com";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    return;
  }
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px;">HabitForge</h1>
      </div>
      <h2>Welcome to HabitForge, ${name}!</h2>
      <p>We're excited to help you build better habits and achieve your goals. Here are a few things you can do to get started:</p>
      <ul>
        <li>Create your first habit</li>
        <li>Set up your daily schedule</li>
        <li>Explore the dashboard</li>
        <li>Check out the AI coach for personalized tips</li>
      </ul>
      <p>Your journey to better habits starts now!</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
      </div>
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: "Welcome to HabitForge!", html });
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px;">HabitForge</h1>
      </div>
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: "Reset Your HabitForge Password", html });
}

export async function sendSubscriptionConfirmationEmail(email: string, name: string, plan: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px;">HabitForge</h1>
      </div>
      <h2>Subscription Confirmed!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for subscribing to <strong>HabitForge ${plan}</strong>! You now have access to all the features included in your plan.</p>
      <ul>
        <li>Unlimited habits</li>
        <li>AI-powered coaching</li>
        <li>Advanced analytics</li>
        <li>Priority support</li>
      </ul>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Building Habits</a>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: `Welcome to HabitForge ${plan}!`, html });
}

export async function sendWeeklyReviewEmail(email: string, name: string, stats: {
  completions: number;
  streak: number;
  totalHabits: number;
  xpEarned: number;
  level: number;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px;">HabitForge</h1>
      </div>
      <h2>Your Weekly Review, ${name}</h2>
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${stats.completions}</div>
            <div style="font-size: 12px; color: #6b7280;">Completions</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${stats.streak}</div>
            <div style="font-size: 12px; color: #6b7280;">Day Streak</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 24px; font-weight: bold; color: #6366f1;">${stats.xpEarned}</div>
            <div style="font-size: 12px; color: #6b7280;">XP Earned</div>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #6366f1;">Level ${stats.level}</div>
          <div style="font-size: 12px; color: #6b7280;">Current Level</div>
        </div>
      </div>
      <p>Keep up the great work!</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Stats</a>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: "Your Weekly HabitForge Review", html });
}

export async function sendAccountDeletionEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px;">HabitForge</h1>
      </div>
      <h2>Account Deletion Confirmed</h2>
      <p>Hi ${name},</p>
      <p>We're sorry to see you go. Your account and all associated data have been permanently deleted.</p>
      <p>If you ever want to come back, you're always welcome to create a new account.</p>
      <p style="color: #6b7280; font-size: 14px;">This action cannot be undone.</p>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject: "HabitForge Account Deleted", html });
}

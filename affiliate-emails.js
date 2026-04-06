/**
 * affiliate-emails.js
 * All affiliate-related email functions for ShiftGlitch.
 * Sends via Resend. From: ShiftGlitch <admin@shiftglitch.com>
 * Task 23 implementation.
 */

const { scheduleAffiliateEmail, getDueAffiliateEmails, markAffiliateEmailSent, getAllActiveAffiliateEmails } = require('./auth');

const SITE_URL = process.env.SITE_URL || 'https://shiftglitch.replit.app';

function getResendKey() {
  return process.env.RESEND_API_SG_KEY || process.env.RESEND_API_KEY || null;
}

// From address is always hardcoded for affiliate emails — never overridden by env vars
const AFFILIATE_FROM = 'ShiftGlitch <admin@shiftglitch.com>';

async function sendEmail({ to, subject, html }) {
  const key = getResendKey();
  if (!key) {
    console.warn('[affiliate-email] No Resend key set — email skipped for:', to);
    return null;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: AFFILIATE_FROM, to: [to], subject, html })
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[affiliate-email] Resend error (${res.status}):`, body);
      return null;
    }
    const data = await res.json();
    console.log(`[affiliate-email] Sent "${subject}" to ${to} — Resend ID: ${data.id}`);
    return data;
  } catch (err) {
    console.error('[affiliate-email] fetch error:', err.message);
    return null;
  }
}

// ─── Shared HTML primitives ───────────────────────────────────────────────────

function emailShell(inner) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #39FF14;background:#111;">${inner}</table></td></tr></table></body></html>`;
}

function emailHeader(tagline) {
  return `<tr><td style="padding:0;background:#000;border-bottom:3px solid #39FF14;"><div style="padding:24px 36px;"><div style="font-family:'Courier New',monospace;font-size:11px;color:#39FF14;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">// SHIFTGLITCH &mdash; ${tagline}</div><div style="font-family:'Courier New',monospace;font-size:36px;color:#fff;letter-spacing:4px;font-weight:bold;line-height:1;">SHIFTGLITCH</div></div></td></tr>`;
}

function emailBody(inner) {
  return `<tr><td style="padding:36px;">${inner}</td></tr>`;
}

function emailFooter() {
  return `<tr><td style="padding:14px 36px;border-top:1px solid #1a1a1a;"><div style="font-family:'Courier New',monospace;font-size:11px;color:#444;letter-spacing:1px;">SHIFTGLITCH &mdash; shiftglitch.com &mdash; &copy; 2026 Lourens Breytenbach<br><span style="color:#333;">To stop receiving affiliate emails, contact <a href="mailto:admin@shiftglitch.com" style="color:#555;">admin@shiftglitch.com</a></span></div></td></tr>`;
}

function h1(txt) {
  return `<div style="font-family:'Courier New',monospace;font-size:22px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${txt}</div>`;
}

function p(txt, color = '#aaaaaa', size = '14px') {
  return `<p style="font-family:'Courier New',monospace;font-size:${size};color:${color};line-height:1.9;margin:0 0 16px;">${txt}</p>`;
}

function box(inner, borderColor = '#39FF14') {
  return `<div style="background:#1a1a1a;border:1px solid ${borderColor};padding:20px 24px;margin-bottom:22px;">${inner}</div>`;
}

function cta(label, url, color = '#39FF14') {
  return `<div style="text-align:center;margin:28px 0;"><a href="${url}" style="display:inline-block;background:${color};color:#000;font-family:'Courier New',monospace;font-size:15px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:14px 36px;text-decoration:none;">${label} &rarr;</a></div>`;
}

function boxLabel(txt) {
  return `<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// ${txt}</div>`;
}

function li(items) {
  return items.map(i => `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.2;"><span style="color:#39FF14;">&gt;</span> ${i}</div>`).join('');
}

function tierLabel(tier, rate) {
  const map = { recruit: '#888', operative: '#39FF14', ghost: '#FF00FF' };
  const c = map[tier] || '#888';
  return `<span style="color:${c};text-transform:uppercase;">${tier} (${Math.round(rate * 100)}%)</span>`;
}

// ─── 1. Application received ─────────────────────────────────────────────────

async function sendAffiliateApplicationEmail(email, displayName) {
  const key = getResendKey();
  if (!key) { console.warn('[affiliate-email] No Resend key — application email skipped'); return; }
  const N = (displayName || 'Operative').toUpperCase();
  const html = emailShell(
    emailHeader('AFFILIATE PROGRAMME') +
    emailBody(
      h1(`APPLICATION RECEIVED`) +
      p(`Operative ${N} —`, '#cccccc', '15px') +
      p(`Your application to the ShiftGlitch Affiliate Programme is in the queue. We review applications manually.`) +
      box(
        boxLabel('WHAT HAPPENS NEXT') +
        li([
          'Manual review — typically within <span style="color:#fff;">48 hours</span>',
          'You will receive a clearance email with your unique referral link',
          'Once live, every buyer you send earns you a <span style="color:#39FF14;">commission</span>',
          'Tier starts at <span style="color:#888;">Recruit (15%)</span> — climbs with performance',
        ])
      ) +
      p(`If you have any questions while you wait, jack into <a href="mailto:admin@shiftglitch.com" style="color:#39FF14;">admin@shiftglitch.com</a>.`) +
      p(`— ShiftGlitch Ops`, '#555')
    ) +
    emailFooter()
  );
  return sendEmail({
    to: email,
    subject: '// APPLICATION RECEIVED \u2014 ShiftGlitch Affiliate Programme',
    html,
  });
}

// ─── 2. Approval / clearance granted ─────────────────────────────────────────

async function sendAffiliateApprovalEmail(email, displayName, affiliateCode, promoCode) {
  const key = getResendKey();
  if (!key) { console.warn('[affiliate-email] No Resend key — approval email skipped'); return; }
  const N = (displayName || 'Operative').toUpperCase();
  const referralUrl = `${SITE_URL}/?ref=${affiliateCode}`;
  const portalUrl = `${SITE_URL}/affiliate-portal.html`;
  const html = emailShell(
    emailHeader('CLEARANCE GRANTED') +
    emailBody(
      `<div style="font-family:'Courier New',monospace;font-size:12px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">// STATUS CHANGE: PENDING &rarr; ACTIVE</div>` +
      h1(`OPERATIVE ${N} — YOU'RE LIVE`) +
      p(`Your affiliate account is active. Commissions are now tracked from every sale that arrives through your link.`, '#cccccc', '15px') +
      box(
        boxLabel('YOUR CREDENTIALS') +
        `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.4;">` +
        `<span style="color:#39FF14;">&gt;</span> Referral link: <a href="${referralUrl}" style="color:#fff;">${referralUrl}</a><br>` +
        `<span style="color:#39FF14;">&gt;</span> Tracking code: <span style="color:#fff;">${affiliateCode}</span><br>` +
        (promoCode ? `<span style="color:#39FF14;">&gt;</span> Promo code: <span style="color:#fff;">${promoCode}</span> <span style="color:#555;">(buyers enter this at checkout for a 10% discount)</span><br>` : '') +
        `<span style="color:#39FF14;">&gt;</span> Commission tier: <span style="color:#888;">Recruit — 15%</span> (scales with performance)<br>` +
        `</div>`
      ) +
      box(
        boxLabel('YOUR FIRST MOVE') +
        li([
          'Drop your referral link in your bio — today, not tomorrow',
          'Post one piece of content explaining <span style="color:#fff;">why you use ShiftGlitch</span>',
          'If you have an audience in ZA: mention the <span style="color:#39FF14;">free tier</span> first — it converts',
          'Track your clicks and conversions in the <a href="${portalUrl}" style="color:#39FF14;">Affiliate Portal</a>',
        ]),
        '#FF00FF'
      ) +
      cta('OPEN AFFILIATE PORTAL', portalUrl) +
      p(`Tier milestones: 5 sales &rarr; <span style="color:#39FF14;">Operative (20%)</span> &nbsp;|&nbsp; 10 sales &rarr; <span style="color:#FF00FF;">Ghost (25%)</span>`, '#666')
    ) +
    emailFooter()
  );
  return sendEmail({
    to: email,
    subject: '// CLEARANCE GRANTED \u2014 You\'re live, Operative',
    html,
  });
}

// ─── 3. Sale notification ─────────────────────────────────────────────────────

async function sendAffiliateSaleNotificationEmail(email, { displayName, packLabel, commissionAmount, cumulativePaid, tier, commissionRate, salesCount }) {
  const key = getResendKey();
  if (!key) { console.warn('[affiliate-email] No Resend key — sale notification skipped'); return; }
  const N = (displayName || 'Operative').toUpperCase();
  const nextTierAt = tier === 'recruit' ? 5 : tier === 'operative' ? 10 : null;
  const salesLeft = nextTierAt ? Math.max(0, nextTierAt - salesCount) : 0;
  const nextTierLabel = tier === 'recruit' ? 'Operative — 20%' : tier === 'operative' ? 'Ghost — 25%' : null;
  const progressLine = nextTierLabel && salesLeft > 0
    ? `<span style="color:#39FF14;">&gt;</span> <span style="color:#fff;">${salesLeft} more sale${salesLeft !== 1 ? 's' : ''}</span> to unlock <span style="color:#FF00FF;">${nextTierLabel}</span> commission rate`
    : `<span style="color:#FF00FF;">&gt;</span> You've reached the <span style="color:#FF00FF;">Ghost</span> tier — maximum 25% commission`;
  const html = emailShell(
    emailHeader('COMMISSION NOTIFICATION') +
    emailBody(
      `<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">// PAYMENT INCOMING</div>` +
      h1(`COMMISSION QUEUED`) +
      p(`Operative ${N} — someone bought through your link.`, '#cccccc', '15px') +
      box(
        boxLabel('COMMISSION DETAILS') +
        `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.4;">` +
        `<span style="color:#39FF14;">&gt;</span> Pack purchased: <span style="color:#fff;">${packLabel || 'Netrunner Pro'}</span><br>` +
        `<span style="color:#39FF14;">&gt;</span> Commission queued: <span style="color:#FF00FF;font-size:18px;">R${Number(commissionAmount).toFixed(2)}</span><br>` +
        `<span style="color:#39FF14;">&gt;</span> Cumulative paid: <span style="color:#fff;">R${Number(cumulativePaid || 0).toFixed(2)}</span><br>` +
        `<span style="color:#39FF14;">&gt;</span> Your tier: ${tierLabel(tier, commissionRate)}<br>` +
        `<span style="color:#39FF14;">&gt;</span> Total sales: <span style="color:#fff;">${salesCount}</span><br>` +
        `</div>`
      ) +
      box(
        boxLabel('RANK PROGRESS') +
        `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.4;">${progressLine}</div>`,
        '#8A2BE2'
      ) +
      p(`Commissions become payable 14 days after the sale (standard refund window). We pay out monthly.`, '#555') +
      cta('VIEW YOUR STATS', `${SITE_URL}/affiliate-portal.html`)
    ) +
    emailFooter()
  );
  return sendEmail({
    to: email,
    subject: `// COMMISSION INCOMING \u2014 R${Number(commissionAmount).toFixed(2)} queued`,
    html,
  });
}

// ─── 4. Surge blast ───────────────────────────────────────────────────────────

async function sendAffiliateSurgeBlastEmail(surge) {
  const key = getResendKey();
  if (!key) { console.warn('[affiliate-email] No Resend key — surge blast skipped'); return; }

  const affiliates = await getAllActiveAffiliateEmails();
  if (!affiliates.length) {
    console.log('[affiliate-email] Surge blast: no active affiliates to notify');
    return;
  }

  const multiplierPct = Math.round((surge.bonus_multiplier - 1) * 100);
  const endsAt = new Date(surge.ends_at);
  const endsFormatted = endsAt.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', dateStyle: 'medium', timeStyle: 'short' });
  const durationHours = Math.round((endsAt - Date.now()) / 3600000);

  const suggestedCaption = `🔴 SURGE LIVE — ShiftGlitch is paying out ${multiplierPct}% EXTRA commissions right now. Every referral you send in the next ${durationHours}h earns you more. My link: [YOUR LINK HERE] #ShiftGlitch #NetrunnerPro`;

  const html = emailShell(
    emailHeader('SURGE EVENT') +
    emailBody(
      `<div style="font-family:'Courier New',monospace;font-size:12px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">// MAINFRAME SURGE DETECTED</div>` +
      h1(`SURGE EVENT — ${multiplierPct}% BONUS COMMISSIONS`) +
      p(`This is a time-limited surge window. All commissions earned during this period are boosted by <span style="color:#FF00FF;font-size:18px;">${surge.bonus_multiplier}×</span>.`, '#cccccc', '15px') +
      box(
        boxLabel('SURGE PARAMETERS') +
        `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.4;">` +
        `<span style="color:#FF00FF;">&gt;</span> Bonus multiplier: <span style="color:#fff;">${surge.bonus_multiplier}× (${multiplierPct}% extra)</span><br>` +
        `<span style="color:#FF00FF;">&gt;</span> Surge ends: <span style="color:#fff;">${endsFormatted} SAST</span><br>` +
        (surge.message ? `<span style="color:#FF00FF;">&gt;</span> Ops message: <span style="color:#fff;">${surge.message}</span><br>` : '') +
        `</div>`,
        '#FF00FF'
      ) +
      box(
        boxLabel('SUGGESTED CAPTION — POST NOW') +
        `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:1.9;white-space:pre-wrap;">${suggestedCaption}</div>`
      ) +
      p(`This window is live now. Replace [YOUR LINK HERE] with your referral link and post immediately.`, '#888') +
      cta('GET MY REFERRAL LINK', `${SITE_URL}/affiliate-portal.html`, '#FF00FF')
    ) +
    emailFooter()
  );

  const subject = `// SURGE EVENT \u2014 Double commissions for ${durationHours}h`;

  let sent = 0;
  for (const affiliate of affiliates) {
    try {
      await sendEmail({ to: affiliate.email, subject, html });
      sent++;
    } catch (e) {
      console.warn(`[affiliate-email] Surge blast failed for ${affiliate.email}:`, e.message);
    }
  }
  console.log(`[affiliate-email] Surge blast sent to ${sent}/${affiliates.length} active affiliates`);
}

// ─── 5. Onboarding drip — schedule 5 emails ──────────────────────────────────

const DRIP_SEQUENCE = [
  { template: 'drip_day0',  days: 0  },
  { template: 'drip_day2',  days: 2  },
  { template: 'drip_day5',  days: 5  },
  { template: 'drip_day10', days: 10 },
  { template: 'drip_day20', days: 20 },
];

async function startAffiliateEmailDrip(affiliateId) {
  for (const step of DRIP_SEQUENCE) {
    const scheduledFor = new Date(Date.now() + step.days * 24 * 60 * 60 * 1000);
    try {
      await scheduleAffiliateEmail(affiliateId, step.template, scheduledFor.toISOString(), {});
    } catch (err) {
      console.warn(`[affiliate-email] Failed to schedule ${step.template} for affiliate ${affiliateId}:`, err.message);
    }
  }
  console.log(`[affiliate-email] Drip sequence scheduled for affiliate ${affiliateId}`);
}

// ─── Drip email builders ──────────────────────────────────────────────────────

function buildDripEmail(template, displayName, affiliateCode) {
  const N = (displayName || 'Operative').toUpperCase();
  const referralUrl = `${SITE_URL}/?ref=${affiliateCode}`;
  const portalUrl = `${SITE_URL}/affiliate-portal.html`;

  if (template === 'drip_day0') {
    return {
      subject: '// YOU\'RE LIVE \u2014 First post ideas, Operative',
      html: emailShell(
        emailHeader('AFFILIATE ONBOARDING — DAY 0') +
        emailBody(
          h1(`YOU'RE LIVE, ${N}`) +
          p(`Your affiliate account is active. The Mainframe is tracking every click. Time to deploy your first post.`, '#cccccc', '15px') +
          box(
            boxLabel('FIRST POST IDEAS — USE ONE TODAY') +
            li([
              '"Here\'s the tool I use to keep my focus locked in — [link]"',
              '"If you study or run at high intensity, this changed how I do it — [link]"',
              '"Stop re-reading. Start using Active Recall. I use ShiftGlitch for this — [link]"',
              'Screen-record yourself using a focus session. No caption needed.',
            ])
          ) +
          p(`Your link: <a href="${referralUrl}" style="color:#39FF14;">${referralUrl}</a>`) +
          cta('OPEN YOUR PORTAL', portalUrl)
        ) +
        emailFooter()
      ),
    };
  }

  if (template === 'drip_day2') {
    return {
      subject: '// TRANSMISSION: What content converts best',
      html: emailShell(
        emailHeader('AFFILIATE ONBOARDING — DAY 2') +
        emailBody(
          h1(`WHAT ACTUALLY CONVERTS`) +
          p(`Day 2. Here's what our top operatives have learned about content that drives signups.`, '#cccccc', '15px') +
          box(
            boxLabel('CONTENT THAT CONVERTS') +
            li([
              '<span style="color:#fff;">Before/after</span> — "I used to re-read. Now I use active recall. Here\'s the tool."',
              '<span style="color:#fff;">Specific outcome</span> — "3 weeks with ShiftGlitch. Here\'s what changed."',
              '<span style="color:#fff;">Free angle</span> — "It\'s completely free to start — no card required. Here\'s the link."',
              '<span style="color:#fff;">ZA audience</span> — mention the ZAR pricing (R99) — it\'s a strong conversion signal',
            ])
          ) +
          box(
            boxLabel('WHAT DOES NOT WORK') +
            li([
              '"Check out this app" with no context',
              'Disclosing commission without leading with value first',
              'Posting only once — consistency compounds',
            ]),
            '#FF00FF'
          ) +
          cta('VIEW YOUR STATS', portalUrl)
        ) +
        emailFooter()
      ),
    };
  }

  if (template === 'drip_day5') {
    return {
      subject: '// TRANSMISSION: Story vs feed \u2014 where to put your link',
      html: emailShell(
        emailHeader('AFFILIATE ONBOARDING — DAY 5') +
        emailBody(
          h1(`STORY VS FEED`) +
          p(`Day 5. You've had time to post. Now let's talk about placement.`, '#cccccc', '15px') +
          box(
            boxLabel('STORY') +
            li([
              'Highest click-through for warm audiences',
              'Add a link sticker — direct tap to your referral URL',
              'Post the link story right after you post a feed post',
              'Best for: swipe-up CTA, quick testimonials, before/after slides',
            ])
          ) +
          box(
            boxLabel('FEED / LONG-FORM') +
            li([
              'Bio link: always keep your referral URL in bio',
              'Long-form caption: builds context, drives comments + saves',
              'YouTube description: long-tail clicks that compound over time',
              'Threads / X: raw text with link converts when the hook is specific',
            ]),
            '#8A2BE2'
          ) +
          p(`One post per platform per week is enough if each one is deliberate.`) +
          cta('CHECK YOUR CLICKS', portalUrl)
        ) +
        emailFooter()
      ),
    };
  }

  if (template === 'drip_day10') {
    return {
      subject: '// TRANSMISSION: Check your stats \u2014 here\'s what to optimise',
      html: emailShell(
        emailHeader('AFFILIATE ONBOARDING — DAY 10') +
        emailBody(
          h1(`YOUR STATS — DAY 10 CHECK`) +
          p(`10 days in. Pull up your portal and check two numbers: clicks and conversions.`, '#cccccc', '15px') +
          box(
            boxLabel('HOW TO READ YOUR STATS') +
            li([
              'Clicks but no conversions → your link is reaching people but something is blocking trust — add more context to your CTA',
              'No clicks → your content isn\'t getting the link in front of people — put the URL in bio + stories',
              'Conversions → identify which post drove them and repeat that format',
              'Conversion rate 1–3% is normal. 5%+ is strong.',
            ])
          ) +
          p(`Tier progress: you\'re currently on <span style="color:#888;">Recruit (15%)</span>. Hit 5 sales to unlock <span style="color:#39FF14;">Operative (20%)</span>.`) +
          cta('OPEN AFFILIATE PORTAL', portalUrl)
        ) +
        emailFooter()
      ),
    };
  }

  if (template === 'drip_day20') {
    return {
      subject: '// TRANSMISSION: You\'re close to Operative rank \u2014 here\'s a push',
      html: emailShell(
        emailHeader('AFFILIATE ONBOARDING — DAY 20') +
        emailBody(
          h1(`OPERATIVE RANK INCOMING`) +
          p(`Day 20. If you haven't hit 5 sales yet, you're probably closer than you think.`, '#cccccc', '15px') +
          box(
            boxLabel('THE PUSH PROTOCOL') +
            li([
              'Post your referral link on every platform you haven\'t tried yet — today',
              'Message 3 people directly who you know are grinding or study hard',
              'Remind your audience that the free tier exists — zero barrier to entry',
              'Use your promo code in posts — buyers get 10% off, you still earn commission',
            ]),
            '#FF00FF'
          ) +
          box(
            boxLabel('WHY OPERATIVE MATTERS') +
            li([
              'Recruit: 15% commission — starter rate',
              'Operative: <span style="color:#39FF14;">20% commission</span> — unlocked at 5 sales',
              'Ghost: <span style="color:#FF00FF;">25% commission</span> — unlocked at 10 sales',
              'Commission rate applies to every future sale — it compounds',
            ])
          ) +
          cta('CHECK YOUR PROGRESS', portalUrl)
        ) +
        emailFooter()
      ),
    };
  }

  return null;
}

// ─── Drip scheduler dispatcher (called by server.js interval) ────────────────

async function processDueAffiliateEmails() {
  let rows;
  try {
    rows = await getDueAffiliateEmails();
  } catch (err) {
    console.error('[affiliate-email] getDueAffiliateEmails error:', err.message);
    return;
  }
  if (!rows.length) return;
  console.log(`[affiliate-email] Processing ${rows.length} due drip email(s)`);

  for (const row of rows) {
    const built = buildDripEmail(row.template, row.affiliate_display_name, row.affiliate_code);
    if (!built) {
      console.warn(`[affiliate-email] Unknown template "${row.template}" for queue id ${row.id} — marking sent to skip`);
      await markAffiliateEmailSent(row.id).catch(() => {});
      continue;
    }
    try {
      await sendEmail({ to: row.affiliate_email, subject: built.subject, html: built.html });
    } catch (err) {
      console.warn(`[affiliate-email] Failed to send ${row.template} to ${row.affiliate_email}:`, err.message);
    }
    await markAffiliateEmailSent(row.id).catch(() => {});
  }
}

module.exports = {
  sendAffiliateApplicationEmail,
  sendAffiliateApprovalEmail,
  sendAffiliateSaleNotificationEmail,
  sendAffiliateSurgeBlastEmail,
  startAffiliateEmailDrip,
  processDueAffiliateEmails,
};

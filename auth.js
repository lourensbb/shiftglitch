const oidc = require('openid-client');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let oidcConfig = null;

async function getOidcConfig() {
  if (!oidcConfig) {
    oidcConfig = await oidc.discovery(
      new URL(process.env.ISSUER_URL || 'https://replit.com/oidc'),
      process.env.REPL_ID
    );
  }
  return oidcConfig;
}

function googleCallbackUrl() {
  return `${process.env.SITE_URL || 'https://shiftglitch.replit.app'}/auth/google/callback`;
}

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        replit_username VARCHAR,
        gamertag VARCHAR,
        focus_score INTEGER NOT NULL DEFAULT 0,
        rank_tier VARCHAR NOT NULL DEFAULT 'NPC',
        streak INTEGER NOT NULL DEFAULT 0,
        pomodoros INTEGER NOT NULL DEFAULT 0,
        cards_mastered INTEGER NOT NULL DEFAULT 0,
        blurts INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gamertag VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS replit_username VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_score INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS rank_tier VARCHAR NOT NULL DEFAULT 'NPC';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS pomodoros INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS cards_mastered INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blurts INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_tier VARCHAR NOT NULL DEFAULT 'free';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_ref VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
    `);
    await client.query(`
      UPDATE users SET payment_ref = stripe_customer_id WHERE payment_ref IS NULL AND stripe_customer_id IS NOT NULL
    `);
    const { rows: lbExists } = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'leaderboard'
    `);
    if (lbExists.length > 0) {
      await client.query(`
        UPDATE users u SET
          gamertag       = COALESCE(u.gamertag,       l.gamertag),
          focus_score    = GREATEST(u.focus_score,    l.focus_score),
          rank_tier      = COALESCE(NULLIF(u.rank_tier, 'NPC'), l.rank_tier, 'NPC'),
          streak         = GREATEST(u.streak,         l.streak),
          pomodoros      = GREATEST(u.pomodoros,      l.pomodoros),
          cards_mastered = GREATEST(u.cards_mastered, l.cards_mastered),
          blurts         = GREATEST(u.blurts,         l.blurts),
          last_updated   = GREATEST(COALESCE(u.last_updated, NOW()), COALESCE(l.last_updated, NOW()))
        FROM leaderboard l WHERE l.user_id = u.id
      `);
      console.log('[auth] Migrated leaderboard data into users table');
      await client.query(`DROP TABLE IF EXISTS leaderboard CASCADE;`);
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS squads (
        id VARCHAR(8) PRIMARY KEY,
        name VARCHAR(40) NOT NULL,
        invite_code VARCHAR(8) UNIQUE NOT NULL,
        shared_streak INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE squads ADD COLUMN IF NOT EXISTS shared_streak INTEGER NOT NULL DEFAULT 0;
      CREATE TABLE IF NOT EXISTS squad_members (
        squad_id VARCHAR(8) NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (squad_id, user_id)
      );
      ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW();
      CREATE UNIQUE INDEX IF NOT EXISTS squad_members_user_unique ON squad_members(user_id);
      CREATE TABLE IF NOT EXISTS waitlist_leads (
        id SERIAL PRIMARY KEY,
        gamertag VARCHAR(30) NOT NULL,
        email VARCHAR(254) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS page_views (
        page VARCHAR(100) NOT NULL,
        views BIGINT NOT NULL DEFAULT 0,
        PRIMARY KEY (page)
      );
      CREATE TABLE IF NOT EXISTS escape_runs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        domain_name VARCHAR(200) NOT NULL,
        run_number INTEGER NOT NULL DEFAULT 1,
        linked_deck_id VARCHAR(100),
        exploit_1 BOOLEAN NOT NULL DEFAULT FALSE,
        exploit_2 BOOLEAN NOT NULL DEFAULT FALSE,
        exploit_3 BOOLEAN NOT NULL DEFAULT FALSE,
        exploit_4 BOOLEAN NOT NULL DEFAULT FALSE,
        exploit_5 BOOLEAN NOT NULL DEFAULT FALSE,
        exploit_6 BOOLEAN NOT NULL DEFAULT FALSE,
        shortcut_flags INTEGER NOT NULL DEFAULT 0,
        rollback_flags INTEGER NOT NULL DEFAULT 0,
        shortcut_bonus INTEGER NOT NULL DEFAULT 0,
        nodes JSONB DEFAULT '[]'::jsonb,
        debrief_text TEXT,
        rollback_applied_at TIMESTAMP,
        last_activity_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE escape_runs ADD COLUMN IF NOT EXISTS linked_deck_id VARCHAR(100);
      ALTER TABLE escape_runs ADD COLUMN IF NOT EXISTS shortcut_bonus INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE escape_runs ADD COLUMN IF NOT EXISTS rollback_applied_at TIMESTAMP;
      ALTER TABLE escape_runs DROP COLUMN IF EXISTS debrief_archived;
      ALTER TABLE escape_runs ADD COLUMN IF NOT EXISTS cem_modules_used JSONB DEFAULT '[]'::jsonb;
      CREATE TABLE IF NOT EXISTS funnel_leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(254) UNIQUE NOT NULL,
        institution VARCHAR(200),
        source VARCHAR(50) DEFAULT 'more-info',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS email_queue (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES funnel_leads(id) ON DELETE CASCADE,
        email VARCHAR(254) NOT NULL,
        name VARCHAR(100) NOT NULL,
        step INTEGER NOT NULL,
        scheduled_for TIMESTAMP NOT NULL,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS magic_tokens (
        token VARCHAR(64) PRIMARY KEY,
        email VARCHAR(254) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS affiliates (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        code VARCHAR(12) UNIQUE NOT NULL,
        display_name TEXT,
        email TEXT NOT NULL,
        commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.15,
        payout_method VARCHAR(10) NOT NULL DEFAULT 'paypal' CHECK (payout_method IN ('paypal','ozow')),
        payout_details JSONB DEFAULT '{}',
        status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
        tier VARCHAR(12) NOT NULL DEFAULT 'recruit' CHECK (tier IN ('recruit','operative','ghost')),
        sales_count INT NOT NULL DEFAULT 0,
        recruited_by_id INT REFERENCES affiliates(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS affiliate_commissions (
        id SERIAL PRIMARY KEY,
        affiliate_id INT NOT NULL REFERENCES affiliates(id),
        order_id TEXT NOT NULL,
        sale_amount NUMERIC(10,2) NOT NULL,
        commission NUMERIC(10,2) NOT NULL,
        status VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','payable','paid','cancelled')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        payable_at TIMESTAMPTZ NOT NULL,
        paid_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id SERIAL PRIMARY KEY,
        affiliate_id INT NOT NULL REFERENCES affiliates(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS affiliate_surges (
        id SERIAL PRIMARY KEY,
        bonus_multiplier NUMERIC(4,2) NOT NULL DEFAULT 2.0,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ends_at TIMESTAMPTZ NOT NULL,
        message TEXT,
        created_by TEXT
      );
      ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS recruited_by_id INT REFERENCES affiliates(id) ON DELETE SET NULL;
      ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS promo_code VARCHAR(12) UNIQUE;
      CREATE TABLE IF NOT EXISTS affiliate_email_queue (
        id SERIAL PRIMARY KEY,
        affiliate_id INT NOT NULL REFERENCES affiliates(id),
        template VARCHAR(40) NOT NULL,
        scheduled_for TIMESTAMPTZ NOT NULL,
        sent_at TIMESTAMPTZ,
        metadata JSONB DEFAULT '{}'
      );
    `);
    console.log('[auth] DB schema ready');
  } catch (err) {
    console.error('[auth] Schema setup error:', err.message);
  } finally {
    client.release();
  }
}

function getSessionMiddleware() {
  return session({
    store: new pgSession({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'shiftglitch-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  });
}

async function upsertUser(claims) {
  const replitUsername = claims.preferred_username || claims.username || null;
  const { rows } = await pool.query(
    `INSERT INTO users (id, email, first_name, last_name, profile_image_url, replit_username, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       profile_image_url = EXCLUDED.profile_image_url,
       replit_username = EXCLUDED.replit_username,
       updated_at = NOW()
     RETURNING *`,
    [claims.sub, claims.email || null, claims.first_name || null, claims.last_name || null, claims.profile_image_url || null, replitUsername]
  );
  return rows[0];
}

async function getUser(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function upsertUserFromProvider(id, email, firstName, lastName, profileImageUrl) {
  if (email) {
    const { rows: byEmail } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (byEmail.length > 0 && byEmail[0].id !== id) {
      const { rows } = await pool.query(
        `UPDATE users SET
           first_name = COALESCE($2, first_name),
           last_name  = COALESCE($3, last_name),
           profile_image_url = COALESCE($4, profile_image_url),
           updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [byEmail[0].id, firstName, lastName, profileImageUrl]
      );
      return rows[0];
    }
  }
  const { rows } = await pool.query(
    `INSERT INTO users (id, email, first_name, last_name, profile_image_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (id) DO UPDATE SET
       email             = COALESCE(EXCLUDED.email, users.email),
       first_name        = COALESCE(EXCLUDED.first_name, users.first_name),
       last_name         = COALESCE(EXCLUDED.last_name, users.last_name),
       profile_image_url = COALESCE(EXCLUDED.profile_image_url, users.profile_image_url),
       updated_at        = NOW()
     RETURNING *`,
    [id, email || null, firstName || null, lastName || null, profileImageUrl || null]
  );
  return rows[0];
}

async function sendMagicLinkEmail(email, link, expiresAt) {
  const key = process.env.RESEND_SG_KEY || process.env.RESEND_API_KEY;
  if (!key) { console.warn('[email-auth] No Resend key — magic link:', link); return; }
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'ShiftGlitch <admin@shiftglitch.com>';
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromAddress,
      to: [email],
      subject: '// ACCESS_TOKEN: Your ShiftGlitch login link',
      html: `<!DOCTYPE html><html><body style="background:#000;color:#39FF14;font-family:'Courier New',monospace;padding:40px;max-width:600px;margin:0 auto;">
<h1 style="color:#39FF14;font-size:2rem;margin:0 0 4px;">SHIFTGLITCH</h1>
<p style="color:#555;font-size:0.85rem;margin:0 0 32px;letter-spacing:0.1em;">// ACCESS_TOKEN_GENERATED</p>
<p style="color:#e0e0e0;margin:0 0 8px;">Your secure login link — expires in 15 minutes:</p>
<p style="margin:0 0 32px;"><a href="${link}" style="display:inline-block;padding:14px 32px;background:#39FF14;color:#000;text-decoration:none;font-weight:bold;font-size:1.1rem;letter-spacing:0.1em;border-radius:2px;">JACK IN &gt;&gt;</a></p>
<p style="color:#555;font-size:0.8rem;margin:0;">If you didn't request this, ignore this email — no account will be created.<br>Expires: ${expiresAt.toUTCString()}</p>
</body></html>`
    })
  });
}

function setupAuthRoutes(app) {
  app.set('trust proxy', 1);

  ensureSchema();

  async function handleLogin(req, res) {
    try {
      const config = await getOidcConfig();
      const host = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || req.get('x-forwarded-host') || req.hostname).split(',')[0].trim();
      const callbackUrl = `https://${host}/api/callback`;
      const state = oidc.randomState();
      const nonce = oidc.randomNonce();
      const codeVerifier = oidc.randomPKCECodeVerifier();
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
      req.session.oauthState = state;
      req.session.oauthNonce = nonce;
      req.session.oauthCodeVerifier = codeVerifier;
      req.session.oauthCallback = callbackUrl;
      await new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
      const url = oidc.buildAuthorizationUrl(config, {
        redirect_uri: callbackUrl,
        scope: 'openid email profile offline_access',
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'login consent'
      });
      res.redirect(url.href);
    } catch (err) {
      console.error('Login error:', err);
      res.redirect('/');
    }
  }

  async function handleLogout(req, res) {
    try {
      const config = await getOidcConfig();
      req.session.destroy(() => {});
      const host = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || req.get('x-forwarded-host') || req.hostname).split(',')[0].trim();
      const logoutUrl = oidc.buildEndSessionUrl(config, {
        client_id: process.env.REPL_ID,
        post_logout_redirect_uri: `https://${host}/login`
      });
      res.redirect(logoutUrl.href);
    } catch (err) {
      req.session.destroy(() => {});
      res.redirect('/');
    }
  }

  app.get('/api/login', handleLogin);
  app.get('/api/auth/login', handleLogin);

  app.get('/auth/google', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) return res.redirect('/login?error=google_not_configured');
    const { randomBytes } = require('crypto');
    const state = randomBytes(16).toString('hex');
    req.session.googleState = state;
    req.session.save(err => {
      if (err) { console.error('[Google auth] session save error:', err); return res.redirect('/login?error=google_failed'); }
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: googleCallbackUrl(),
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'online'
      });
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
    });
  });

  app.get('/auth/google/callback', async (req, res) => {
    const { code, state, error } = req.query;
    if (error) { console.warn('[Google callback] user denied:', error); return res.redirect('/login?error=google_failed'); }
    if (!code || !state || state !== req.session.googleState) {
      console.warn('[Google callback] state mismatch or missing code', { hasCode: !!code, state, expected: req.session.googleState });
      return res.redirect('/login?error=google_failed');
    }
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: googleCallbackUrl(),
          grant_type: 'authorization_code'
        })
      });
      const tokens = await tokenRes.json();
      if (!tokens.id_token) { console.error('[Google callback] no id_token:', tokens); return res.redirect('/login?error=google_failed'); }
      const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString());
      const userId = `google_${payload.sub}`;
      const nameParts = (payload.name || '').split(' ');
      const user = await upsertUserFromProvider(
        userId, payload.email || null,
        nameParts[0] || null,
        nameParts.slice(1).join(' ') || null,
        payload.picture || null
      );
      req.session.userId = user.id;
      req.session.userProfile = { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, profileImageUrl: user.profile_image_url };
      delete req.session.googleState;
      await new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
      res.redirect('/app');
    } catch (err) {
      console.error('[Google callback] error:', err);
      res.redirect('/login?error=google_failed');
    }
  });

  app.post('/auth/email', async (req, res) => {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const cleanEmail = email.trim().toLowerCase().slice(0, 254);
    try {
      const { randomBytes } = require('crypto');
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await pool.query(
        `INSERT INTO magic_tokens (token, email, expires_at) VALUES ($1, $2, $3)`,
        [token, cleanEmail, expiresAt]
      );
      const host = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || req.get('x-forwarded-host') || req.hostname).split(',')[0].trim();
      const link = `https://${host}/auth/email/verify?token=${token}`;
      await sendMagicLinkEmail(cleanEmail, link, expiresAt);
      res.json({ ok: true });
    } catch (err) {
      console.error('[email-auth] send error:', err);
      res.status(500).json({ error: 'Failed to send login link' });
    }
  });

  app.get('/auth/email/verify', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect('/login?error=invalid_token');
    try {
      const { rows } = await pool.query(
        `SELECT * FROM magic_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
        [token]
      );
      if (!rows.length) return res.redirect('/login?error=token_expired');
      const { email } = rows[0];
      await pool.query(`UPDATE magic_tokens SET used_at = NOW() WHERE token = $1`, [token]);
      const userId = `email_${email}`;
      const user = await upsertUserFromProvider(userId, email, null, null, null);
      req.session.userId = user.id;
      req.session.userProfile = { id: user.id, email: user.email };
      await new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
      res.redirect('/app');
    } catch (err) {
      console.error('[email-verify] error:', err);
      res.redirect('/login?error=verify_failed');
    }
  });

  app.get('/api/logout', handleLogout);
  app.get('/api/auth/logout', handleLogout);

  app.get('/api/callback', async (req, res) => {
    try {
      const config = await getOidcConfig();
      const host = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || req.get('x-forwarded-host') || req.hostname).split(',')[0].trim();
      const callbackUrl = req.session.oauthCallback || `https://${host}/api/callback`;
      const tokens = await oidc.authorizationCodeGrant(config, new URL(req.url, `https://${host}`), {
        expectedState: req.session.oauthState,
        expectedNonce: req.session.oauthNonce,
        pkceCodeVerifier: req.session.oauthCodeVerifier,
        redirectUri: callbackUrl
      });
      const claims = tokens.claims();
      await upsertUser(claims);
      req.session.userId = claims.sub;
      req.session.accessToken = tokens.access_token;
      req.session.refreshToken = tokens.refresh_token;
      req.session.expiresAt = claims.exp;
      req.session.userProfile = {
        id: claims.sub,
        email: claims.email,
        firstName: claims.first_name,
        lastName: claims.last_name,
        profileImageUrl: claims.profile_image_url
      };
      delete req.session.oauthState;
      delete req.session.oauthNonce;
      delete req.session.oauthCallback;
      delete req.session.oauthCodeVerifier;
      await new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
      res.redirect('/app');
    } catch (err) {
      console.error('Callback error:', err);
      res.redirect('/api/login');
    }
  });

  app.get('/api/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      await checkAndExpireUser(req.session.userId);
      const user = await getUser(req.session.userId);
      if (!user) return res.status(401).json({ error: 'User not found' });
      const profile = req.session.userProfile || {};
      // Determine effective admin ID using same cascade as affiliates-api.js:
      // env ADMIN_USER_ID → env HARDCODED_ADMIN_ID → empty (no admin configured).
      const effectiveAdminId = process.env.ADMIN_USER_ID || process.env.HARDCODED_ADMIN_ID || '';
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name || profile.firstName,
        lastName: user.last_name || profile.lastName,
        profileImageUrl: user.profile_image_url || profile.profileImageUrl,
        createdAt: user.created_at,
        membershipTier: user.membership_tier || 'free',
        proExpiresAt: user.pro_expires_at || null,
        // isAdmin: fail-closed — only true when an admin ID is configured AND matches.
        isAdmin: (effectiveAdminId !== '' && user.id === effectiveAdminId),
        // adminUserId: exposed so client can perform explicit ID comparison per task spec.
        // Empty string when no admin ID is configured.
        adminUserId: effectiveAdminId,
      });
    } catch (err) {
      console.error('/api/me error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.redirect('/login');
}

async function updateGamertag(userId, gamertag) {
  await pool.query(
    'UPDATE users SET gamertag = $1, updated_at = NOW() WHERE id = $2',
    [gamertag, userId]
  );
}

async function updateMembershipTier(userId, tier, paymentRef = null, expiresAt = null) {
  const allowedTiers = ['free', 'pro'];
  if (!allowedTiers.includes(tier)) throw new Error('Invalid tier: ' + tier);
  await pool.query(
    `UPDATE users SET
       membership_tier = $1,
       payment_ref = COALESCE($2, payment_ref),
       pro_expires_at = $3,
       updated_at = NOW()
     WHERE id = $4`,
    [tier, paymentRef, expiresAt, userId]
  );
  console.log(`[membership] User ${userId} tier set to ${tier}${expiresAt ? ' (expires ' + expiresAt.toISOString().slice(0,10) + ')' : ''}`);
}

async function checkAndExpireUser(userId) {
  const { rows } = await pool.query(
    `SELECT membership_tier, pro_expires_at FROM users WHERE id = $1`, [userId]
  );
  const user = rows[0];
  if (!user) return;
  if (user.membership_tier === 'pro' && user.pro_expires_at && new Date(user.pro_expires_at) < new Date()) {
    await pool.query(
      `UPDATE users SET membership_tier = 'free', updated_at = NOW() WHERE id = $1`, [userId]
    );
    console.log(`[membership] User ${userId} Pro expired — downgraded to free`);
  }
}

async function getUserByPaymentRef(ref) {
  const { rows } = await pool.query('SELECT * FROM users WHERE payment_ref = $1', [ref]);
  return rows[0] || null;
}

async function getUserGamertag(userId) {
  const { rows } = await pool.query('SELECT gamertag, replit_username FROM users WHERE id = $1', [userId]);
  const u = rows[0];
  if (!u) return null;
  if (u.gamertag) return u.gamertag;
  let derived = null;
  if (u.replit_username) {
    const tag = u.replit_username.replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 20);
    if (tag) derived = tag;
  }
  if (!derived) derived = 'OPERATIVE';
  await pool.query('UPDATE users SET gamertag = $1 WHERE id = $2 AND gamertag IS NULL', [derived, userId]);
  return derived;
}

async function upsertLeaderboard({ userId, gamertag, focusScore, rankTier, streak, pomodoros, cardsMastered, blurts }) {
  await pool.query(
    `INSERT INTO users (id, gamertag, focus_score, rank_tier, streak, pomodoros, cards_mastered, blurts, last_updated, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET
       gamertag = EXCLUDED.gamertag,
       focus_score = EXCLUDED.focus_score,
       rank_tier = EXCLUDED.rank_tier,
       streak = EXCLUDED.streak,
       pomodoros = EXCLUDED.pomodoros,
       cards_mastered = EXCLUDED.cards_mastered,
       blurts = EXCLUDED.blurts,
       last_updated = NOW(),
       updated_at = NOW()`,
    [userId, gamertag, focusScore, rankTier, streak, pomodoros, cardsMastered, blurts]
  );
}

async function getLeaderboard(limit = 50) {
  const { rows } = await pool.query(
    `SELECT id AS user_id, gamertag, focus_score, rank_tier, streak, pomodoros, cards_mastered, blurts, last_updated
     FROM users
     WHERE focus_score > 0 OR pomodoros > 0 OR streak > 0 OR cards_mastered > 0 OR blurts > 0
     ORDER BY focus_score DESC, last_updated ASC, id ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function getMyLeaderboardEntry(userId) {
  const { rows } = await pool.query(
    `SELECT u.id AS user_id, u.gamertag, u.focus_score, u.rank_tier, u.streak, u.pomodoros, u.cards_mastered, u.blurts,
       (SELECT COUNT(*) + 1 FROM users
        WHERE (focus_score > 0 OR pomodoros > 0 OR streak > 0 OR cards_mastered > 0 OR blurts > 0)
          AND (
            focus_score > u.focus_score
            OR (focus_score = u.focus_score AND last_updated < u.last_updated)
            OR (focus_score = u.focus_score AND last_updated = u.last_updated AND id < u.id)
          )
       )::int AS global_rank
     FROM users u WHERE u.id = $1`,
    [userId]
  );
  return rows[0] || null;
}

function generateCode(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const { randomBytes } = require('crypto');
  let result = '';
  const bytes = randomBytes(len * 2);
  for (let i = 0; i < len; i++) result += chars[bytes[i] % chars.length];
  return result;
}

async function createSquad(userId, name) {
  const client = await pool.connect();
  let squadId, inviteCode;
  try {
    await client.query('BEGIN');
    const existingCheck = await client.query('SELECT squad_id FROM squad_members WHERE user_id = $1', [userId]);
    if (existingCheck.rows.length) { await client.query('ROLLBACK'); throw new Error('ALREADY_IN_SQUAD'); }
    let inserted = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      squadId = generateCode(8);
      inviteCode = generateCode(6);
      const res = await client.query(
        'INSERT INTO squads (id, name, invite_code) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id',
        [squadId, name.trim().slice(0, 40), inviteCode]
      );
      if (res.rows.length) { inserted = true; break; }
    }
    if (!inserted) { await client.query('ROLLBACK'); throw new Error('CODE_COLLISION'); }
    await client.query('INSERT INTO squad_members (squad_id, user_id, last_active) VALUES ($1, $2, NOW())', [squadId, userId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505' && err.constraint === 'squad_members_user_unique') throw new Error('ALREADY_IN_SQUAD');
    throw err;
  } finally {
    client.release();
  }
  return { squadId, inviteCode };
}

async function joinSquad(userId, inviteCode) {
  const { rows } = await pool.query('SELECT id, name FROM squads WHERE invite_code = $1', [inviteCode.toUpperCase()]);
  if (!rows.length) throw new Error('INVALID_CODE');
  const squad = rows[0];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT id FROM squads WHERE id = $1 FOR UPDATE', [squad.id]);
    const memberRows = await client.query('SELECT user_id FROM squad_members WHERE squad_id = $1', [squad.id]);
    if (memberRows.rows.length >= 4) { await client.query('ROLLBACK'); throw new Error('SQUAD_FULL'); }
    const existingCheck = await client.query('SELECT squad_id FROM squad_members WHERE user_id = $1', [userId]);
    if (existingCheck.rows.length) {
      await client.query('ROLLBACK');
      throw existingCheck.rows[0].squad_id === squad.id ? new Error('ALREADY_MEMBER') : new Error('ALREADY_IN_SQUAD');
    }
    await client.query('INSERT INTO squad_members (squad_id, user_id, last_active) VALUES ($1, $2, NOW())', [squad.id, userId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505' && err.constraint === 'squad_members_user_unique') throw new Error('ALREADY_IN_SQUAD');
    if (err.code === '23505') throw new Error('ALREADY_MEMBER');
    throw err;
  } finally {
    client.release();
  }
  return squad;
}

async function leaveSquad(userId) {
  const squad = await getUserSquad(userId);
  if (!squad) throw new Error('NOT_IN_SQUAD');
  await pool.query('DELETE FROM squad_members WHERE squad_id = $1 AND user_id = $2', [squad.id, userId]);
  const remaining = await pool.query('SELECT COUNT(*) FROM squad_members WHERE squad_id = $1', [squad.id]);
  if (parseInt(remaining.rows[0].count, 10) === 0) {
    await pool.query('DELETE FROM squads WHERE id = $1', [squad.id]);
  }
}

async function getUserSquad(userId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.invite_code, sm.joined_at
     FROM squads s JOIN squad_members sm ON s.id = sm.squad_id
     WHERE sm.user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

async function getSquadStats(squadId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.gamertag, u.rank_tier, u.streak, u.last_updated, sm.last_active
     FROM squad_members sm
     JOIN users u ON u.id = sm.user_id
     WHERE sm.squad_id = $1
     ORDER BY sm.joined_at ASC`,
    [squadId]
  );
  return rows;
}

async function recalcSquadStreak(squadId) {
  await pool.query(
    `UPDATE squads SET shared_streak = (
       SELECT COALESCE(MIN(u.streak), 0)
       FROM squad_members sm JOIN users u ON u.id = sm.user_id
       WHERE sm.squad_id = $1
     ) WHERE id = $1`,
    [squadId]
  );
}

async function updateSquadLastActive(userId) {
  await pool.query(
    'UPDATE squad_members SET last_active = NOW() WHERE user_id = $1',
    [userId]
  );
  const squadRow = await pool.query('SELECT squad_id FROM squad_members WHERE user_id = $1', [userId]);
  if (squadRow.rows.length) {
    await recalcSquadStreak(squadRow.rows[0].squad_id).catch(() => {});
  }
}

async function saveWaitlistLead(gamertag, email) {
  const res = await pool.query(
    `INSERT INTO waitlist_leads (gamertag, email) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [gamertag, email]
  );
  if (res.rows.length === 0) throw Object.assign(new Error('DUPLICATE'), { code: 'DUPLICATE' });
  return res.rows[0];
}

async function trackPageView(page) {
  try {
    await pool.query(
      `INSERT INTO page_views (page, views) VALUES ($1, 1)
       ON CONFLICT (page) DO UPDATE SET views = page_views.views + 1`,
      [page]
    );
  } catch {}
}

async function getPageStats() {
  const res = await pool.query('SELECT page, views FROM page_views ORDER BY views DESC');
  return res.rows;
}

async function getWaitlistCount() {
  const res = await pool.query('SELECT COUNT(*) as count FROM waitlist_leads');
  return parseInt(res.rows[0].count, 10);
}

async function saveFunnelLead(name, email, institution) {
  const res = await pool.query(
    `INSERT INTO funnel_leads (name, email, institution) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [name, email, institution || null]
  );
  if (res.rows.length === 0) throw Object.assign(new Error('DUPLICATE'), { code: 'DUPLICATE' });
  return res.rows[0];
}

async function queueFunnelEmails(leadId, email, name) {
  const delays = [0, 1, 3, 5, 7, 10, 14];
  const now = Date.now();
  for (let i = 0; i < delays.length; i++) {
    const scheduledFor = new Date(now + delays[i] * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO email_queue (lead_id, email, name, step, scheduled_for) VALUES ($1, $2, $3, $4, $5)`,
      [leadId, email, name, i + 1, scheduledFor]
    );
  }
}

async function getDueQueuedEmails() {
  const res = await pool.query(
    `SELECT * FROM email_queue WHERE sent_at IS NULL AND scheduled_for <= NOW() ORDER BY scheduled_for LIMIT 50`
  );
  return res.rows;
}

async function markEmailSent(id) {
  await pool.query(`UPDATE email_queue SET sent_at = NOW() WHERE id = $1`, [id]);
}

async function getUserBadges(userId) {
  try {
    const { rows } = await pool.query('SELECT COALESCE(badges, \'[]\'::jsonb) AS badges FROM users WHERE id = $1', [userId]);
    return rows[0] ? (rows[0].badges || []) : [];
  } catch (e) {
    console.error('[auth] getUserBadges error:', e.message);
    return [];
  }
}

async function setUserBadges(userId, badges) {
  try {
    if (!Array.isArray(badges)) return;
    await pool.query('UPDATE users SET badges = $1::jsonb WHERE id = $2', [JSON.stringify(badges), userId]);
  } catch (e) {
    console.error('[auth] setUserBadges error:', e.message);
  }
}

async function getEscapeRuns(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM escape_runs WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function createEscapeRun(userId, domainName) {
  const name = domainName.trim().slice(0, 200);
  // Determine the next run number for this domain
  const { rows: prev } = await pool.query(
    'SELECT MAX(run_number) AS maxrun FROM escape_runs WHERE user_id = $1 AND domain_name = $2',
    [userId, name]
  );
  const nextRunNumber = (prev[0].maxrun || 0) + 1;
  const { rows } = await pool.query(
    `INSERT INTO escape_runs (user_id, domain_name, run_number, last_activity_at)
     VALUES ($1, $2, $3, NOW()) RETURNING *`,
    [userId, name, nextRunNumber]
  );
  return rows[0];
}

async function updateEscapeRun(userId, runId, patch) {
  const allowed = ['exploit_1','exploit_2','exploit_3','exploit_4','exploit_5','exploit_6',
                   'shortcut_flags','rollback_flags','shortcut_bonus','nodes','debrief_text','linked_deck_id','cem_modules_used'];
  // Server-side sequential enforcement: only allow setting exploit_N to true if exploit_{N-1} is already true
  const { rows: cur } = await pool.query(
    'SELECT * FROM escape_runs WHERE user_id = $1 AND id = $2 AND completed_at IS NULL', [userId, runId]
  );
  if (!cur.length) return null;
  const current = cur[0];
  const exploitOrder = ['exploit_1','exploit_2','exploit_3','exploit_4','exploit_5','exploit_6'];
  for (let i = 1; i < exploitOrder.length; i++) {
    const key = exploitOrder[i];
    if (patch[key] === true && !current[exploitOrder[i - 1]]) {
      const err = new Error(`Cannot complete ${key} before ${exploitOrder[i - 1]}`);
      err.code = 'OUT_OF_SEQUENCE';
      throw err;
    }
  }
  const sets = [];
  const vals = [userId, runId];
  const jsonbFields = new Set(['nodes', 'cem_modules_used']);
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      vals.push(jsonbFields.has(key) ? JSON.stringify(patch[key]) : patch[key]);
      sets.push(`${key} = $${vals.length}${jsonbFields.has(key) ? '::jsonb' : ''}`);
    }
  }
  if (sets.length === 0) return null;
  sets.push('last_activity_at = NOW()');
  const { rows } = await pool.query(
    `UPDATE escape_runs SET ${sets.join(', ')} WHERE user_id = $1 AND id = $2 AND completed_at IS NULL RETURNING *`,
    vals
  );
  return rows[0] || null;
}

async function completeEscapeRun(userId, runId) {
  const { rows: cur } = await pool.query(
    'SELECT * FROM escape_runs WHERE user_id = $1 AND id = $2 AND completed_at IS NULL', [userId, runId]
  );
  if (!cur.length) return null;
  const run = cur[0];
  if (!run.exploit_1 || !run.exploit_2 || !run.exploit_3 || !run.exploit_4 || !run.exploit_5 || !run.exploit_6) {
    const err = new Error('NOT_ALL_EXPLOITS_COMPLETE');
    err.code = 'NOT_ALL_EXPLOITS_COMPLETE';
    throw err;
  }
  // Mark this run as completed
  const { rows } = await pool.query(
    `UPDATE escape_runs SET completed_at = NOW(), last_activity_at = NOW()
     WHERE user_id = $1 AND id = $2 RETURNING *`,
    [userId, runId]
  );
  return rows[0] || null;
}

async function applyRollbackIfStale(userId, runId) {
  const { rows: cur } = await pool.query(
    'SELECT * FROM escape_runs WHERE user_id = $1 AND id = $2 AND completed_at IS NULL', [userId, runId]
  );
  if (!cur.length) return null;
  const run = cur[0];
  const fiveDaysMs = 5 * 24 * 3600 * 1000;
  const lastAct = run.last_activity_at ? new Date(run.last_activity_at).getTime() : new Date(run.created_at).getTime();
  if ((Date.now() - lastAct) < fiveDaysMs) return null;
  // Already applied a rollback recently
  if (run.rollback_applied_at) {
    const lastRollback = new Date(run.rollback_applied_at).getTime();
    if ((Date.now() - lastRollback) < fiveDaysMs) return null;
  }
  // Find the highest completed exploit that hasn't been corrupted yet
  const exploits = ['exploit_1','exploit_2','exploit_3','exploit_4','exploit_5','exploit_6'];
  let targetIdx = -1;
  for (let i = exploits.length - 1; i >= 0; i--) {
    if (run[exploits[i]] && !(run.rollback_flags & (1 << i))) {
      targetIdx = i;
      break;
    }
  }
  if (targetIdx < 0) return null;
  const newRollbackFlags = run.rollback_flags | (1 << targetIdx);
  const { rows: updated } = await pool.query(
    `UPDATE escape_runs SET ${exploits[targetIdx]} = FALSE, rollback_flags = $3, rollback_applied_at = NOW(), last_activity_at = NOW()
     WHERE user_id = $1 AND id = $2 RETURNING *`,
    [userId, runId, newRollbackFlags]
  );
  return { run: updated[0], corruptedExploit: exploits[targetIdx], corruptedIdx: targetIdx };
}

async function deleteEscapeRun(userId, runId) {
  await pool.query('DELETE FROM escape_runs WHERE user_id = $1 AND id = $2', [userId, runId]);
}

async function getAffiliateByCode(code) {
  if (!code || typeof code !== 'string') return null;
  const { rows } = await pool.query('SELECT * FROM affiliates WHERE code = $1', [code.toUpperCase().trim()]);
  return rows[0] || null;
}

async function recordAffiliateClick(affiliateId) {
  await pool.query('INSERT INTO affiliate_clicks (affiliate_id) VALUES ($1)', [affiliateId]);
}

async function queueAffiliateCommission(affiliateCode, orderId, saleAmount) {
  try {
    const affiliate = await getAffiliateByCode(affiliateCode);
    if (!affiliate || affiliate.status !== 'active') return null;
    const commission = parseFloat(saleAmount) * parseFloat(affiliate.commission_rate);
    const { rows } = await pool.query(
      `INSERT INTO affiliate_commissions
         (affiliate_id, order_id, sale_amount, commission, status, payable_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '30 days')
       RETURNING *`,
      [affiliate.id, orderId, saleAmount, commission.toFixed(2)]
    );
    await pool.query('UPDATE affiliates SET sales_count = sales_count + 1 WHERE id = $1', [affiliate.id]);
    // Check and apply tier upgrade after incrementing sales_count (may update commission_rate)
    await checkAndUpgradeAffiliateTier(affiliate.id);
    // Re-fetch affiliate to get updated tier/sales_count for sale notification email
    const updatedAffiliate = await getAffiliateByCode(affiliateCode);
    const paidTotal = await pool.query(
      `SELECT COALESCE(SUM(commission), 0) AS total FROM affiliate_commissions WHERE affiliate_id = $1 AND status = 'paid'`,
      [affiliate.id]
    );
    return {
      ...rows[0],
      affiliate_email: affiliate.email,
      affiliate_display_name: affiliate.display_name,
      affiliate_tier: (updatedAffiliate || affiliate).tier,
      commission_rate: parseFloat((updatedAffiliate || affiliate).commission_rate),
      sales_count: (updatedAffiliate || affiliate).sales_count,
      cumulative_paid: parseFloat(paidTotal.rows[0].total),
    };
  } catch (err) {
    console.error('[affiliate] queueAffiliateCommission error:', err.message);
    return null;
  }
}

async function promotePayableCommissions() {
  try {
    const result = await pool.query(
      `UPDATE affiliate_commissions SET status = 'payable'
       WHERE status = 'pending' AND payable_at <= NOW()`
    );
    if (result.rowCount > 0) {
      console.log(`[affiliate-scheduler] ${result.rowCount} commission(s) promoted to payable`);
    }
  } catch (err) {
    console.error('[affiliate-scheduler] Error promoting commissions:', err.message);
  }
}

// ─── Affiliate DB helpers (Task 21) ──────────────────────────────────────────

async function createAffiliate({ userId, displayName, email, payoutMethod, payoutDetails, recruitedById }) {
  const crypto = require('crypto');
  // Generate unique 8-char tracking code
  let code;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = crypto.randomBytes(4).toString('hex').toUpperCase();
    const { rows } = await pool.query('SELECT 1 FROM affiliates WHERE code = $1', [candidate]);
    if (!rows.length) { code = candidate; break; }
  }
  if (!code) throw new Error('[affiliate] Could not generate unique affiliate code after 5 attempts');

  // Generate memorable promo code: first 5 alphanumeric chars of displayName (padded) + 2-digit number
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const stripped = displayName.replace(/[^a-z0-9]/gi, '').toUpperCase();
  let base = stripped.slice(0, 5);
  while (base.length < 5) base += CHARS[Math.floor(Math.random() * CHARS.length)];
  let promoCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = String(Math.floor(Math.random() * 90) + 10);
    const candidate = base + suffix;
    const { rows } = await pool.query('SELECT 1 FROM affiliates WHERE promo_code = $1', [candidate]);
    if (!rows.length) { promoCode = candidate; break; }
  }
  if (!promoCode) {
    // Retry with fully random 5-char base to escape collision cluster
    for (let attempt = 0; attempt < 5; attempt++) {
      let randomBase = '';
      for (let i = 0; i < 5; i++) randomBase += CHARS[Math.floor(Math.random() * CHARS.length)];
      const candidate = randomBase + String(Math.floor(Math.random() * 90) + 10);
      const { rows } = await pool.query('SELECT 1 FROM affiliates WHERE promo_code = $1', [candidate]);
      if (!rows.length) { promoCode = candidate; break; }
    }
    if (!promoCode) throw new Error('[affiliate] Could not generate unique promo code after 10 attempts');
  }

  const { rows } = await pool.query(
    `INSERT INTO affiliates (user_id, code, promo_code, display_name, email, payout_method, payout_details, recruited_by_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [userId, code, promoCode, displayName, email, payoutMethod || 'paypal', JSON.stringify(payoutDetails || {}), recruitedById || null]
  );
  return rows[0];
}

async function getAffiliateByUserId(userId) {
  const { rows } = await pool.query('SELECT * FROM affiliates WHERE user_id = $1', [userId]);
  return rows[0] || null;
}

async function getAffiliateStats(affiliateId) {
  const [clickRes, commRes] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM affiliate_clicks WHERE affiliate_id = $1', [affiliateId]),
    pool.query(
      `SELECT status, COALESCE(SUM(commission), 0) AS total
       FROM affiliate_commissions WHERE affiliate_id = $1 GROUP BY status`,
      [affiliateId]
    )
  ]);
  const clickCount = parseInt(clickRes.rows[0].count, 10);
  const byStatus = {};
  for (const row of commRes.rows) { byStatus[row.status] = parseFloat(row.total); }
  return {
    clickCount,
    pendingCommission: byStatus.pending || 0,
    payableCommission: byStatus.payable || 0,
    paidCommission: byStatus.paid || 0,
  };
}

async function getAffiliateLeaderboard() {
  const { rows } = await pool.query(
    `SELECT display_name AS alias, tier, sales_count AS "salesCount"
     FROM affiliates WHERE status = 'active' ORDER BY sales_count DESC LIMIT 10`
  );
  return rows;
}

async function getAllAffiliatesWithStats() {
  const { rows } = await pool.query(`
    WITH comm_totals AS (
      SELECT
        affiliate_id,
        COALESCE(SUM(commission) FILTER (WHERE status = 'pending'), 0) AS pending,
        COALESCE(SUM(commission) FILTER (WHERE status = 'payable'), 0) AS payable,
        COALESCE(SUM(commission) FILTER (WHERE status = 'paid'),    0) AS paid
      FROM affiliate_commissions
      GROUP BY affiliate_id
    ),
    click_totals AS (
      SELECT affiliate_id, COUNT(*)::int AS click_count
      FROM affiliate_clicks
      GROUP BY affiliate_id
    )
    SELECT
      a.id, a.display_name AS "displayName", a.email, a.code, a.promo_code AS "promoCode",
      a.tier, a.status, a.sales_count AS "salesCount", a.created_at AS "createdAt",
      a.payout_method AS "payoutMethod", a.payout_details AS "payoutDetails",
      COALESCE(ct.click_count, 0)::int AS "clickCount",
      COALESCE(cm.pending, 0) AS pending_commission,
      COALESCE(cm.payable, 0) AS payable_commission,
      COALESCE(cm.paid, 0)    AS paid_commission
    FROM affiliates a
    LEFT JOIN comm_totals  cm ON cm.affiliate_id = a.id
    LEFT JOIN click_totals ct ON ct.affiliate_id = a.id
    ORDER BY a.created_at DESC
  `);
  return rows.map(r => ({
    id: r.id,
    displayName: r.displayName,
    email: r.email,
    code: r.code,
    promoCode: r.promoCode || null,
    tier: r.tier,
    status: r.status,
    salesCount: r.salesCount,
    createdAt: r.createdAt,
    clickCount: parseInt(r.clickCount, 10),
    payoutMethod: r.payoutMethod || 'paypal',
    payoutDetails: r.payoutDetails || {},
    commissions: {
      pending: parseFloat(r.pending_commission),
      payable: parseFloat(r.payable_commission),
      paid: parseFloat(r.paid_commission),
    },
  }));
}

async function approveAffiliate(id) {
  const { rows } = await pool.query(
    `UPDATE affiliates SET status = 'active' WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function suspendAffiliate(id) {
  const { rows } = await pool.query(
    `UPDATE affiliates SET status = 'suspended' WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function markCommissionsPaid(affiliateId) {
  const { rows, rowCount } = await pool.query(
    `UPDATE affiliate_commissions
     SET status = 'paid', paid_at = NOW()
     WHERE affiliate_id = $1 AND status = 'payable'
     RETURNING commission`,
    [affiliateId]
  );
  const totalPaid = rows.reduce((sum, r) => sum + parseFloat(r.commission), 0);
  return { rowCount, totalPaid: totalPaid.toFixed(2) };
}

async function createSurgeEvent({ bonusMultiplier, durationHours, message, createdBy }) {
  const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  const { rows } = await pool.query(
    `INSERT INTO affiliate_surges (bonus_multiplier, ends_at, message, created_by)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [bonusMultiplier, endsAt.toISOString(), message || '', createdBy || null]
  );
  return rows[0];
}

async function getActiveSurge() {
  const { rows } = await pool.query(
    `SELECT * FROM affiliate_surges WHERE ends_at > NOW() ORDER BY started_at DESC LIMIT 1`
  );
  return rows[0] || null;
}

// ─── Affiliate DB helpers (Task 23) — email queue ────────────────────────────

async function scheduleAffiliateEmail(affiliateId, template, scheduledFor, metadata) {
  const { rows } = await pool.query(
    `INSERT INTO affiliate_email_queue (affiliate_id, template, scheduled_for, metadata)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [affiliateId, template, scheduledFor, JSON.stringify(metadata || {})]
  );
  return rows[0];
}

async function getDueAffiliateEmails() {
  const { rows } = await pool.query(
    `SELECT q.*, a.email AS affiliate_email, a.display_name AS affiliate_display_name,
            a.code AS affiliate_code, a.promo_code AS affiliate_promo_code,
            a.tier AS affiliate_tier, a.sales_count AS affiliate_sales_count,
            a.commission_rate AS affiliate_commission_rate
     FROM affiliate_email_queue q
     JOIN affiliates a ON a.id = q.affiliate_id
     WHERE q.sent_at IS NULL AND q.scheduled_for <= NOW()
     ORDER BY q.scheduled_for ASC`
  );
  return rows;
}

async function markAffiliateEmailSent(id) {
  const { rows } = await pool.query(
    `UPDATE affiliate_email_queue SET sent_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
}

async function getAllActiveAffiliateEmails() {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, code, promo_code, tier, sales_count, commission_rate
     FROM affiliates WHERE status = 'active'`
  );
  return rows;
}

// ─── Affiliate DB helpers (Task 25) — monthly commissions ────────────────────

async function getAffiliateMonthlyCommissions(affiliateId) {
  const { rows } = await pool.query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
       DATE_TRUNC('month', created_at) AS month_ts,
       COALESCE(SUM(commission), 0)::numeric AS total
     FROM affiliate_commissions
     WHERE affiliate_id = $1 AND created_at >= NOW() - INTERVAL '6 months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at) ASC`,
    [affiliateId]
  );
  const dataMap = {};
  rows.forEach(r => { dataMap[r.month] = parseFloat(r.total); });
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString('en-ZA', { month: 'short', year: 'numeric' });
    months.push({ month: label, total: dataMap[label] || 0 });
  }
  return months;
}

async function getAffiliateRecruitCount(affiliateId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS cnt FROM affiliates WHERE recruited_by_id = $1',
    [affiliateId]
  );
  return parseInt(rows[0].cnt, 10);
}

// ─── Affiliate DB helpers (Task 22) ──────────────────────────────────────────

async function getAffiliateByPromoCode(promoCode) {
  const { rows } = await pool.query(
    'SELECT * FROM affiliates WHERE promo_code = $1',
    [String(promoCode).toUpperCase().trim()]
  );
  return rows[0] || null;
}

async function checkAndUpgradeAffiliateTier(affiliateId) {
  try {
    const { rows } = await pool.query(
      'SELECT sales_count, tier FROM affiliates WHERE id = $1',
      [affiliateId]
    );
    if (!rows[0]) return null;
    const { sales_count, tier } = rows[0];

    let newTier, newRate;
    if (sales_count >= 10) {
      newTier = 'ghost'; newRate = 0.25;
    } else if (sales_count >= 5) {
      newTier = 'operative'; newRate = 0.20;
    } else {
      newTier = 'recruit'; newRate = 0.15;
    }

    if (newTier !== tier) {
      await pool.query(
        'UPDATE affiliates SET tier = $1, commission_rate = $2 WHERE id = $3',
        [newTier, newRate, affiliateId]
      );
      console.log(`[affiliate] ${affiliateId} tier upgraded: ${tier} → ${newTier} (${Math.round(newRate * 100)}%)`);
      return newTier;
    }
    return null;
  } catch (err) {
    console.error('[affiliate] checkAndUpgradeAffiliateTier error:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = { getSessionMiddleware, setupAuthRoutes, requireAuth, getUser, updateGamertag, getUserGamertag, updateMembershipTier, checkAndExpireUser, getUserByPaymentRef, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry, createSquad, joinSquad, leaveSquad, getUserSquad, getSquadStats, updateSquadLastActive, saveWaitlistLead, trackPageView, getPageStats, getWaitlistCount, getUserBadges, setUserBadges, getEscapeRuns, createEscapeRun, updateEscapeRun, completeEscapeRun, deleteEscapeRun, applyRollbackIfStale, saveFunnelLead, queueFunnelEmails, getDueQueuedEmails, markEmailSent, getAffiliateByCode, recordAffiliateClick, queueAffiliateCommission, promotePayableCommissions, createAffiliate, getAffiliateByUserId, getAffiliateStats, getAffiliateLeaderboard, getAllAffiliatesWithStats, approveAffiliate, suspendAffiliate, markCommissionsPaid, createSurgeEvent, getActiveSurge, getAffiliateByPromoCode, checkAndUpgradeAffiliateTier, scheduleAffiliateEmail, getDueAffiliateEmails, markAffiliateEmailSent, getAllActiveAffiliateEmails, getAffiliateMonthlyCommissions, getAffiliateRecruitCount };

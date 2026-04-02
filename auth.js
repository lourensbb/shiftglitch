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
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name || profile.firstName,
        lastName: user.last_name || profile.lastName,
        profileImageUrl: user.profile_image_url || profile.profileImageUrl,
        createdAt: user.created_at,
        membershipTier: user.membership_tier || 'free',
        proExpiresAt: user.pro_expires_at || null
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

module.exports = { getSessionMiddleware, setupAuthRoutes, requireAuth, getUser, updateGamertag, getUserGamertag, updateMembershipTier, checkAndExpireUser, getUserByPaymentRef, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry, createSquad, joinSquad, leaveSquad, getUserSquad, getSquadStats, updateSquadLastActive, saveWaitlistLead, trackPageView, getPageStats, getWaitlistCount };

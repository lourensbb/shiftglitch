const oidc = require('openid-client');
const session = require('express-session');
const connectPg = require('connect-pg-simple');
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
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        replit_username VARCHAR,
        gamertag VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gamertag VARCHAR;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS replit_username VARCHAR;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        gamertag VARCHAR NOT NULL,
        focus_score INTEGER NOT NULL DEFAULT 0,
        rank_tier VARCHAR NOT NULL DEFAULT 'NPC',
        streak INTEGER NOT NULL DEFAULT 0,
        pomodoros INTEGER NOT NULL DEFAULT 0,
        cards_mastered INTEGER NOT NULL DEFAULT 0,
        blurts INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW()
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
  const PgStore = connectPg(session);
  const store = new PgStore({
    pool,
    createTableIfMissing: false,
    tableName: 'sessions',
    ttl: 7 * 24 * 60 * 60
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
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
      const host = req.hostname;
      const callbackUrl = `https://${host}/api/callback`;
      const crypto = require('crypto');
      const state = crypto.randomBytes(16).toString('hex');
      const nonce = crypto.randomBytes(16).toString('hex');
      req.session.oauthState = state;
      req.session.oauthNonce = nonce;
      req.session.oauthCallback = callbackUrl;
      await new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
      const url = oidc.buildAuthorizationUrl(config, {
        redirect_uri: callbackUrl,
        scope: 'openid email profile offline_access',
        state,
        nonce,
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
      const logoutUrl = oidc.buildEndSessionUrl(config, {
        client_id: process.env.REPL_ID,
        post_logout_redirect_uri: `https://${req.hostname}/login`
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
      const callbackUrl = req.session.oauthCallback || `https://${req.hostname}/api/callback`;
      const tokens = await oidc.authorizationCodeGrant(config, new URL(req.url, `https://${req.hostname}`), {
        expectedState: req.session.oauthState,
        expectedNonce: req.session.oauthNonce,
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
      const user = await getUser(req.session.userId);
      if (!user) return res.status(401).json({ error: 'User not found' });
      const profile = req.session.userProfile || {};
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name || profile.firstName,
        lastName: user.last_name || profile.lastName,
        profileImageUrl: user.profile_image_url || profile.profileImageUrl,
        createdAt: user.created_at
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

async function updateLeaderboardGamertag(userId, gamertag) {
  await pool.query('UPDATE leaderboard SET gamertag = $1 WHERE user_id = $2', [gamertag, userId]);
}

async function upsertLeaderboard({ userId, gamertag, focusScore, rankTier, streak, pomodoros, cardsMastered, blurts }) {
  await pool.query(
    `INSERT INTO leaderboard (user_id, gamertag, focus_score, rank_tier, streak, pomodoros, cards_mastered, blurts, last_updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       gamertag = EXCLUDED.gamertag,
       focus_score = EXCLUDED.focus_score,
       rank_tier = EXCLUDED.rank_tier,
       streak = EXCLUDED.streak,
       pomodoros = EXCLUDED.pomodoros,
       cards_mastered = EXCLUDED.cards_mastered,
       blurts = EXCLUDED.blurts,
       last_updated = NOW()`,
    [userId, gamertag, focusScore, rankTier, streak, pomodoros, cardsMastered, blurts]
  );
}

async function getLeaderboard(limit = 50) {
  const { rows } = await pool.query(
    'SELECT user_id, gamertag, focus_score, rank_tier, streak, pomodoros, cards_mastered, blurts, last_updated FROM leaderboard ORDER BY focus_score DESC, last_updated ASC, user_id ASC LIMIT $1',
    [limit]
  );
  return rows;
}

async function getMyLeaderboardEntry(userId) {
  const { rows } = await pool.query(
    `SELECT l.user_id, l.gamertag, l.focus_score, l.rank_tier, l.streak, l.pomodoros, l.cards_mastered, l.blurts,
       (SELECT COUNT(*) + 1 FROM leaderboard WHERE focus_score > l.focus_score
          OR (focus_score = l.focus_score AND last_updated < l.last_updated)
          OR (focus_score = l.focus_score AND last_updated = l.last_updated AND user_id < l.user_id)
       )::int AS global_rank
     FROM leaderboard l WHERE l.user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

module.exports = { getSessionMiddleware, setupAuthRoutes, requireAuth, getUser, updateGamertag, getUserGamertag, updateLeaderboardGamertag, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry };

const crypto = require('crypto');
const Conf = require('conf');

const config = new Conf({ projectName: 'flash-usdt-sender' });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'flash-usdt-security-key-2024';

function encryptSensitive(data) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    data: encrypted,
    authTag: authTag.toString('hex')
  };
}

function decryptSensitive(encrypted) {
  const iv = Buffer.from(encrypted.iv, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  
  return {
    salt,
    hash
  };
}

function verifyPassword(password, storedHash, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateAPIKey() {
  const prefix = 'FUSDT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(16).toString('hex').toUpperCase();
  
  return `${prefix}_${timestamp}_${random}`;
}

function validateAPIKeyFormat(key) {
  const pattern = /^FUSDT_[A-Z0-9]+_[A-F0-9]{32}$/;
  return pattern.test(key);
}

function generateChecksum(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function verifyChecksum(data, checksum) {
  const computedChecksum = generateChecksum(data);
  return computedChecksum === checksum;
}

function secureStore(key, value) {
  const encrypted = encryptSensitive(value);
  config.set(`secure.${key}`, encrypted);
}

function secureRetrieve(key) {
  const encrypted = config.get(`secure.${key}`);
  
  if (!encrypted) {
    return null;
  }
  
  return decryptSensitive(encrypted);
}

function secureDelete(key) {
  config.delete(`secure.${key}`);
}

function generateSessionId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  const machineId = require('os').hostname();
  
  return crypto.createHash('sha256')
    .update(`${timestamp}-${random}-${machineId}`)
    .digest('hex')
    .substring(0, 32);
}

function validateSession(sessionId) {
  const session = config.get(`sessions.${sessionId}`);
  
  if (!session) {
    return { valid: false, error: 'Session not found' };
  }
  
  const now = Date.now();
  const expiresAt = new Date(session.expiresAt).getTime();
  
  if (now > expiresAt) {
    config.delete(`sessions.${sessionId}`);
    return { valid: false, error: 'Session expired' };
  }
  
  return { valid: true, session };
}

function createSession(userId, expiryHours = 24 * 90) {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (expiryHours * 60 * 60 * 1000));
  
  const session = {
    id: sessionId,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastActivity: now.toISOString()
  };
  
  config.set(`sessions.${sessionId}`, session);
  
  return session;
}

function destroySession(sessionId) {
  config.delete(`sessions.${sessionId}`);
}

function auditLog(action, details) {
  const logs = config.get('auditLogs') || [];
  
  logs.unshift({
    timestamp: new Date().toISOString(),
    action,
    details,
    sessionId: generateSessionId()
  });
  
  config.set('auditLogs', logs.slice(0, 1000));
}

function getAuditLogs(limit = 100) {
  const logs = config.get('auditLogs') || [];
  return logs.slice(0, limit);
}

module.exports = {
  encryptSensitive,
  decryptSensitive,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateAPIKey,
  validateAPIKeyFormat,
  generateChecksum,
  verifyChecksum,
  secureStore,
  secureRetrieve,
  secureDelete,
  generateSessionId,
  validateSession,
  createSession,
  destroySession,
  auditLog,
  getAuditLogs
};

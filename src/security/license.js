const crypto = require('crypto');
const Conf = require('conf');

const config = new Conf({ projectName: 'flash-usdt-sender' });

const LICENSE_VERSION = '1.0.0';
const SECRET_KEY = 'flash-usdt-corporation-2024-secret';

function generateMachineId() {
  const os = require('os');
  const cpus = os.cpus();
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  
  const machineData = `${hostname}-${platform}-${arch}-${cpus.length}`;
  return crypto.createHash('sha256').update(machineData).digest('hex').substring(0, 32);
}

function generateLicenseKey(email, expiryDays = 90) {
  const machineId = generateMachineId();
  const timestamp = Date.now();
  const expiryTimestamp = timestamp + (expiryDays * 24 * 60 * 60 * 1000);
  
  const payload = {
    email: email,
    machineId: machineId,
    createdAt: timestamp,
    expiresAt: expiryTimestamp,
    version: LICENSE_VERSION
  };
  
  const payloadStr = JSON.stringify(payload);
  const encrypted = encrypt(payloadStr);
  
  const licenseKey = `FUSDT-${Buffer.from(encrypted).toString('base64').replace(/=/g, '').substring(0, 32)}`;
  
  return {
    licenseKey,
    machineId,
    expiresAt: new Date(expiryTimestamp).toISOString(),
    createdAt: new Date(timestamp).toISOString()
  };
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

function validateLicense(licenseKey) {
  try {
    if (!licenseKey || !licenseKey.startsWith('FUSDT-')) {
      return { valid: false, error: 'Invalid license key format' };
    }
    
    const storedLicense = config.get('license');
    
    if (!storedLicense) {
      return { valid: false, error: 'No license found. Please activate your license.' };
    }
    
    if (storedLicense.key !== licenseKey) {
      return { valid: false, error: 'License key mismatch' };
    }
    
    const expiresAt = new Date(storedLicense.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      return { valid: false, error: 'License has expired' };
    }
    
    const machineId = generateMachineId();
    if (storedLicense.machineId !== machineId) {
      return { valid: false, error: 'License is not valid for this machine' };
    }
    
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    return {
      valid: true,
      email: storedLicense.email,
      expiresAt: storedLicense.expiresAt,
      daysRemaining: daysRemaining,
      tier: storedLicense.tier || 'standard'
    };
  } catch (error) {
    return { valid: false, error: 'License validation failed: ' + error.message };
  }
}

function activateLicense(licenseKey, email, paymentTxId = null) {
  const storedValidKeys = config.get('validAPIKeys') || [];
  
  if (!storedValidKeys.includes(licenseKey) && !licenseKey.startsWith('FUSDT-')) {
    return { success: false, error: 'Invalid license key' };
  }
  
  const licenseData = generateLicenseKey(email, 90);
  
  const license = {
    key: licenseData.licenseKey,
    email: email,
    machineId: licenseData.machineId,
    createdAt: licenseData.createdAt,
    expiresAt: licenseData.expiresAt,
    tier: 'premium',
    paymentTxId: paymentTxId,
    activatedAt: new Date().toISOString()
  };
  
  config.set('license', license);
  
  return {
    success: true,
    license: {
      key: license.key,
      email: license.email,
      expiresAt: license.expiresAt,
      tier: license.tier
    }
  };
}

function deactivateLicense() {
  config.delete('license');
  return { success: true, message: 'License deactivated successfully' };
}

function getLicenseStatus() {
  const license = config.get('license');
  
  if (!license) {
    return {
      activated: false,
      message: 'No active license found'
    };
  }
  
  const validation = validateLicense(license.key);
  
  return {
    activated: validation.valid,
    email: license.email,
    expiresAt: license.expiresAt,
    daysRemaining: validation.daysRemaining || 0,
    tier: license.tier,
    machineId: license.machineId
  };
}

function generateTrialLicense(email) {
  const licenseData = generateLicenseKey(email, 7);
  
  const license = {
    key: licenseData.licenseKey,
    email: email,
    machineId: licenseData.machineId,
    createdAt: licenseData.createdAt,
    expiresAt: licenseData.expiresAt,
    tier: 'trial',
    activatedAt: new Date().toISOString()
  };
  
  config.set('license', license);
  
  return {
    success: true,
    license: {
      key: license.key,
      email: license.email,
      expiresAt: license.expiresAt,
      tier: license.tier
    }
  };
}

function checkLicenseExpiry() {
  const status = getLicenseStatus();
  
  if (!status.activated) {
    return { expired: true, message: 'No active license' };
  }
  
  if (status.daysRemaining <= 0) {
    return { expired: true, message: 'License has expired' };
  }
  
  if (status.daysRemaining <= 7) {
    return {
      expired: false,
      warning: true,
      message: `License expires in ${status.daysRemaining} days. Please renew.`
    };
  }
  
  return { expired: false, warning: false };
}

module.exports = {
  generateLicenseKey,
  validateLicense,
  activateLicense,
  deactivateLicense,
  getLicenseStatus,
  generateTrialLicense,
  checkLicenseExpiry,
  generateMachineId,
  LICENSE_VERSION
};

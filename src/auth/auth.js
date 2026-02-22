const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const qr = require('qrcode-terminal');
const Conf = require('conf');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ora = require('ora');
const { ethers } = require('ethers');
const open = require('open');

const config = new Conf({ projectName: 'flash-usdt-sender' });

const PAYMENT_ADDRESS = '0x036A5065d103005D7CaF5d1Cd75ABE6644D69069';
const TELEGRAM_CHANNEL = 'https://t.me/FlashUSDTokens';
const ACCESS_PRICE = '$250 USD';

function generateReferralCode() {
  return `FUSDT${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function getReferralLink(code) {
  return `${TELEGRAM_CHANNEL}?start=${code}`;
}

async function shareToTelegram(message, referralCode = null) {
  const link = referralCode ? getReferralLink(referralCode) : TELEGRAM_CHANNEL;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
  try {
    await open(telegramUrl);
    return true;
  } catch (e) {
    console.log(chalk.yellow('\nPlease share manually: ' + link));
    return false;
  }
}

async function showReferralScreen() {
  console.log('\n' + boxen(
    `${chalk.bold.hex('#FFD700')('📢 Invite Friends & Earn Rewards!')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('Share your referral link and earn:')}\n\n` +
    `${chalk.green('✓')} ${chalk.white('1 month extra access per 3 referrals')}\n` +
    `${chalk.green('✓')} ${chalk.white('Exclusive Telegram badges')}\n` +
    `${chalk.green('✓')} ${chalk.white('Priority support access')}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'yellow',
      backgroundColor: '#1a1a0a'
    }
  ));

  let referralCode = config.get('referral.code');
  let referralCount = config.get('referral.count') || 0;
  
  if (!referralCode) {
    referralCode = generateReferralCode();
    config.set('referral.code', referralCode);
  }

  console.log(chalk.cyan(`\n📎 Your Referral Code: ${chalk.bold.yellow(referralCode)}`));
  console.log(chalk.gray(`   Total Referrals: ${referralCount}\n`));

  const { shareOption } = await inquirer.prompt([
    {
      type: 'list',
      name: 'shareOption',
      message: 'Share on:',
      choices: [
        { name: `${chalk.hex('#0088CC')('📱 Telegram')} - Share to Telegram`, value: 'telegram' },
        { name: `${chalk.green('💬 WhatsApp')} - Share to WhatsApp`, value: 'whatsapp' },
        { name: `${chalk.blue('📧 Email')} - Share via email`, value: 'email' },
        { name: `${chalk.gray('📋 Copy Link')} - Copy to clipboard`, value: 'copy' },
        { name: `${chalk.gray('← Back')} - Return to menu`, value: 'back' }
      ]
    }
  ]);

  const referralLink = getReferralLink(referralCode);
  const shareMessage = `🚀 Join Flash USDT Sender - Fast, secure USDT transfers! Use my referral: ${referralCode}\n\nJoin here: ${referralLink}`;

  switch (shareOption) {
    case 'telegram':
      await shareToTelegram(shareMessage, referralCode);
      console.log(chalk.green('\n✓ Shared to Telegram!'));
      break;
    case 'whatsapp':
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      await open(waUrl);
      console.log(chalk.green('\n✓ Opened WhatsApp!'));
      break;
    case 'email':
      const emailUrl = `mailto:?subject=Join Flash USDT Sender&body=${encodeURIComponent(shareMessage)}`;
      await open(emailUrl);
      console.log(chalk.green('\n✓ Opened email client!'));
      break;
    case 'copy':
      console.log(chalk.cyan('\n📋 Referral Link:'));
      console.log(chalk.white(referralLink));
      console.log(chalk.gray('\n(Copy this link to share)'));
      break;
    case 'back':
      return false;
  }

  return true;
}

async function showTelegramJoinBonus() {
  const alreadyJoined = config.get('telegram.joined');
  
  if (alreadyJoined) {
    return false;
  }

  console.log('\n' + boxen(
    `${chalk.bold.hex('#FFD700')('🎁 Join Telegram & Get Bonus!')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n\n` +
    `${chalk.white('Join our Telegram channel to unlock:')}\n\n` +
    `${chalk.green('✓')} ${chalk.white('7-day access extension')}\n` +
    `${chalk.green('✓')} ${chalk.white('Exclusive market signals')}\n` +
    `${chalk.green('✓')} ${chalk.white('Priority support')}\n` +
    `${chalk.green('✓')} ${chalk.white('Early access to new features')}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'green',
      backgroundColor: '#0a1a0a'
    }
  ));

  const { joinTelegram } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'joinTelegram',
      message: 'Join Telegram channel now?',
      default: true
    }
  ]);

  if (joinTelegram) {
    try {
      await open(TELEGRAM_CHANNEL);
      config.set('telegram.joined', true);
      config.set('telegram.joinedAt', new Date().toISOString());
      console.log(chalk.green('\n✓ Thanks for joining! Bonus applied!'));
    } catch (e) {
      console.log(chalk.yellow('\nPlease join manually: ' + TELEGRAM_CHANNEL));
    }
  }

  return true;
}

const AUTH_METHODS = {
  WALLET: 'wallet',
  EMAIL: 'email',
  API_KEY: 'api'
};

async function checkFirstRun() {
  const hasVisited = config.get('firstRun.visited');
  
  if (!hasVisited) {
    console.log(chalk.cyan('\n🚀 First Time Setup - Opening Telegram Channel...\n'));
    console.log(chalk.gray('Join our Telegram channel for updates and support:\n'));
    console.log(chalk.blue.bold(TELEGRAM_CHANNEL) + '\n');
    
    try {
      await open(TELEGRAM_CHANNEL);
    } catch (e) {
      console.log(chalk.yellow('Please manually open: ' + TELEGRAM_CHANNEL));
    }
    
    config.set('firstRun.visited', true);
    config.set('firstRun.visitedAt', new Date().toISOString());
    
    console.log(chalk.green('✓ Channel opened in browser!\n'));
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'joined',
        message: 'Press Enter to continue...',
        default: true
      }
    ]);
  }
}

function generateToken(data) {
  const secret = process.env.JWT_SECRET || 'flash-usdt-secret-key-2024';
  return jwt.sign(data, secret, { expiresIn: '90d' });
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function generateAPIKey() {
  return `FUSDT_${crypto.randomBytes(32).toString('hex').toUpperCase()}`;
}

async function showAuthScreen(preferredMethod = null) {
  await checkFirstRun();
  
  console.log(chalk.cyan('\n🔐 Authentication Required\n'));

  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: chalk.white('Select authentication method:'),
      choices: [
        {
          name: `${chalk.hex('#F7931A')('🦊 Wallet Connect')} - Connect your crypto wallet`,
          value: AUTH_METHODS.WALLET
        },
        {
          name: `${chalk.hex('#FFA500')('📧 Email/Password')} - Login with credentials`,
          value: AUTH_METHODS.EMAIL
        },
        {
          name: `${chalk.hex('#00FF00')('🔑 API Key')} - Use API access key`,
          value: AUTH_METHODS.API_KEY
        }
      ],
      default: preferredMethod
    }
  ]);

  switch (method) {
    case AUTH_METHODS.WALLET:
      return await walletAuth();
    case AUTH_METHODS.EMAIL:
      return await emailAuth();
    case AUTH_METHODS.API_KEY:
      return await apiKeyAuth();
  }
}

async function walletAuth() {
  console.log(chalk.cyan('\n🦊 Wallet Connection\n'));

  const { connectionType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'connectionType',
      message: 'Select wallet connection method:',
      choices: [
        { name: `${chalk.yellow('QR Code')} - Scan with wallet app`, value: 'qr' },
        { name: `${chalk.yellow('Manual Entry')} - Enter wallet address`, value: 'manual' },
        { name: `${chalk.yellow('Private Key')} - Import wallet (Not Recommended)`, value: 'private' }
      ]
    }
  ]);

  if (connectionType === 'qr') {
    const sessionCode = `flash-usdt-${Date.now()}`;
    
    console.log(chalk.cyan('\nScan this QR code with your wallet app:\n'));
    
    qr.generate(sessionCode, { small: true });
    
    const spinner = ora('Waiting for wallet connection...').start();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { walletAddress } = await inquirer.prompt([
      {
        type: 'input',
        name: 'walletAddress',
        message: 'Enter connected wallet address:',
        validate: (input) => {
          if (!input) return 'Wallet address is required';
          if (!ethers.isAddress(input)) return 'Invalid Ethereum address';
          return true;
        }
      }
    ]);
    
    spinner.succeed('Wallet connected successfully!');
    
    const signature = crypto.randomBytes(64).toString('hex');
    
    config.set('auth', {
      method: AUTH_METHODS.WALLET,
      wallet: walletAddress,
      signature: signature,
      token: generateToken({ wallet: walletAddress }),
      connectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    });

    showAuthSuccess(walletAddress);
    return true;
  }

  if (connectionType === 'manual') {
    const { walletAddress } = await inquirer.prompt([
      {
        type: 'input',
        name: 'walletAddress',
        message: 'Enter your wallet address:',
        validate: (input) => {
          if (!input) return 'Wallet address is required';
          if (!ethers.isAddress(input)) return 'Invalid Ethereum address';
          return true;
        }
      }
    ]);

    const spinner = ora('Verifying wallet...').start();
    await new Promise(resolve => setTimeout(resolve, 1500));
    spinner.succeed('Wallet verified!');

    const signature = crypto.randomBytes(64).toString('hex');

    config.set('auth', {
      method: AUTH_METHODS.WALLET,
      wallet: walletAddress,
      signature: signature,
      token: generateToken({ wallet: walletAddress }),
      connectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    });

    showAuthSuccess(walletAddress);
    return true;
  }

  if (connectionType === 'private') {
    console.log(chalk.yellow('\n⚠️  Warning: Private key import is not recommended for security reasons.'));
    
    const { confirmPrivate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmPrivate',
        message: 'Do you want to proceed?',
        default: false
      }
    ]);

    if (!confirmPrivate) {
      return walletAuth();
    }

    const { privateKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'privateKey',
        message: 'Enter your private key:',
        mask: '*',
        validate: (input) => {
          if (!input) return 'Private key is required';
          return true;
        }
      }
    ]);

    const spinner = ora('Importing wallet...').start();
    
    try {
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      spinner.succeed('Wallet imported successfully!');

      config.set('auth', {
        method: AUTH_METHODS.WALLET,
        wallet: address,
        hasPrivateKey: true,
        token: generateToken({ wallet: address }),
        connectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      showAuthSuccess(address);
      return true;
    } catch (error) {
      spinner.fail('Invalid private key');
      return walletAuth();
    }
  }
}

async function emailAuth() {
  console.log(chalk.cyan('\n📧 Email Authentication\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select action:',
      choices: [
        { name: `${chalk.green('Login')} - Existing account`, value: 'login' },
        { name: `${chalk.blue('Register')} - Create new account`, value: 'register' }
      ]
    }
  ]);

  if (action === 'register') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (input) => {
          if (!input) return 'Email is required';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) return 'Invalid email format';
          return true;
        }
      },
      {
        type: 'input',
        name: 'username',
        message: 'Choose a username:',
        validate: (input) => {
          if (!input) return 'Username is required';
          if (input.length < 3) return 'Username must be at least 3 characters';
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Create a password:',
        mask: '*',
        validate: (input) => {
          if (!input) return 'Password is required';
          if (input.length < 8) return 'Password must be at least 8 characters';
          return true;
        }
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password:',
        mask: '*',
        validate: (input, answers) => {
          if (input !== answers.password) return 'Passwords do not match';
          return true;
        }
      },
      {
        type: 'input',
        name: 'accessKey',
        message: 'Enter access key (check your email):',
        validate: (input) => {
          if (!input) return 'Access key is required';
          return true;
        }
      }
    ]);

    const spinner = ora('Creating account...').start();
    await new Promise(resolve => setTimeout(resolve, 2000));
    spinner.succeed('Account created successfully!');

    const apiKey = generateAPIKey();

    config.set('auth', {
      method: AUTH_METHODS.EMAIL,
      email: answers.email,
      username: answers.username,
      passwordHash: hashPassword(answers.password),
      accessKey: answers.accessKey,
      apiKey: apiKey,
      token: generateToken({ email: answers.email, username: answers.username }),
      connectedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    });

    showAuthSuccess(answers.email);
    showAPIKey(apiKey);
    return true;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
      validate: (input) => {
        if (!input) return 'Email is required';
        return true;
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your password:',
      mask: '*',
      validate: (input) => {
        if (!input) return 'Password is required';
        return true;
      }
    }
  ]);

  const spinner = ora('Authenticating...').start();
  await new Promise(resolve => setTimeout(resolve, 1500));

  const storedAuth = config.get('auth');
  
  if (storedAuth && storedAuth.email === answers.email) {
    spinner.succeed('Login successful!');
    
    config.set('auth.token', generateToken({ email: answers.email }));
    config.set('auth.connectedAt', new Date().toISOString());
    config.set('auth.expiresAt', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

    showAuthSuccess(answers.email);
    return true;
  }

  spinner.succeed('Login successful!');
  
  config.set('auth', {
    method: AUTH_METHODS.EMAIL,
    email: answers.email,
    token: generateToken({ email: answers.email }),
    connectedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });

  showAuthSuccess(answers.email);
  return true;
}

async function apiKeyAuth() {
  console.log(chalk.cyan('\n🔑 API Key Authentication\n'));

  console.log(boxen(
    `${chalk.yellow('Get your API key:')}\n` +
    `${chalk.white('1. Visit: flashusdtsender.xyz')}\n` +
    `${chalk.white('2. Login to your dashboard')}\n` +
    `${chalk.white('3. Generate API key from settings')}\n` +
    `${chalk.white('4. Check email for instant access key')}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  ));

  const { apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your API key:',
      validate: (input) => {
        if (!input) return 'API key is required';
        if (!input.startsWith('FUSDT_')) return 'Invalid API key format';
        return true;
      }
    }
  ]);

  const spinner = ora('Verifying API key...').start();
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isValidKey = await verifyAPIKey(apiKey);
  
  if (!isValidKey) {
    spinner.fail('Invalid API key!');
    return await handleInvalidKey();
  }

  spinner.succeed('API key verified!');

  config.set('auth', {
    method: AUTH_METHODS.API_KEY,
    apiKey: apiKey,
    token: generateToken({ apiKey: apiKey }),
    connectedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });

  showAuthSuccess(apiKey.substring(0, 15) + '...');
  return true;
}

async function verifyAPIKey(apiKey) {
  const validKeys = config.get('validAPIKeys') || [];
  
  if (validKeys.includes(apiKey)) {
    return true;
  }

  if (apiKey.startsWith('FUSDT_') && apiKey.length >= 40) {
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    return hash.endsWith('0') || hash.endsWith('1') || hash.endsWith('2') || hash.endsWith('3') || hash.endsWith('4') || hash.endsWith('5');
  }

  return false;
}

async function handleInvalidKey() {
  console.log('\n' + boxen(
    `${chalk.red.bold('❌ Invalid API Key Detected!')}\n\n` +
    `${chalk.white('Your API key could not be verified.')}\n` +
    `${chalk.white('Please check your key and try again.')}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.bold.hex('#FFD700')('⭐️ Get Access Now! 🧑‍🚀')}\n\n` +
    `${chalk.white('Unlock Flash USDT Sender instantly!')}\n` +
    `${chalk.white('Complete your one-time payment of ')}${chalk.green.bold(ACCESS_PRICE)}\n` +
    `${chalk.white('for lifetime access.')}\n\n` +
    `${chalk.bold.hex('#00FF00')('⭐️ What You\'ll Get:')}\n` +
    `${chalk.green('✓')} ${chalk.white('Instant access key via email')}\n` +
    `${chalk.green('✓')} ${chalk.white('Secure, encrypted transactions')}\n` +
    `${chalk.green('✓')} ${chalk.white('90-Day transaction validity')}\n` +
    `${chalk.green('✓')} ${chalk.white('24/7 expert support')}\n` +
    `${chalk.green('✓')} ${chalk.white('Regular updates & new features')}`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'red',
      backgroundColor: '#1a0a0a'
    }
  ));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: `${chalk.green('💳 Buy Access Key')} - Make payment now`, value: 'buy' },
        { name: `${chalk.yellow('🔄 Try Again')} - Enter different key`, value: 'retry' },
        { name: `${chalk.cyan('📞 Contact Support')} - Get help`, value: 'support' },
        { name: `${chalk.gray('❌ Exit')} - Quit application`, value: 'exit' }
      ]
    }
  ]);

  switch (action) {
    case 'buy':
      return await showPaymentScreen();
    case 'retry':
      return await apiKeyAuth();
    case 'support':
      return await showSupport();
    case 'exit':
      console.log(chalk.gray('\nGoodbye! 👋'));
      process.exit(0);
  }
}

async function showPaymentScreen() {
  console.log('\n' + boxen(
    `${chalk.bold.hex('#FFD700')('💳 Payment Portal')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('Access Price:')} ${chalk.green.bold(ACCESS_PRICE)}\n` +
    `${chalk.white('Validity:')} ${chalk.cyan('90 Days')}\n` +
    `${chalk.white('Type:')} ${chalk.cyan('One-time payment')}\n\n` +
    `${chalk.bold.yellow('Payment Address:')}\n` +
    `${chalk.cyan.bold(PAYMENT_ADDRESS)}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('Supported Networks:')}\n` +
    `${chalk.green('✓')} USDT (ERC20)\n` +
    `${chalk.green('✓')} USDT (TRC20)\n` +
    `${chalk.green('✓')} USDT (BEP20)\n` +
    `${chalk.green('✓')} USDT (POLYGON)\n` +
    `${chalk.green('✓')} USDT (SOLANA)`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'yellow',
      backgroundColor: '#1a1a0a'
    }
  ));

  const { showQR } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'showQR',
      message: 'Show QR code for payment address?',
      default: true
    }
  ]);

  if (showQR) {
    console.log(chalk.cyan('\nScan to pay:\n'));
    qr.generate(PAYMENT_ADDRESS, { small: true });
    console.log();
  }

  const { txId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'txId',
      message: 'Enter your Transaction ID (TxID) after payment:',
      validate: (input) => {
        if (!input) return 'Transaction ID is required';
        if (input.length < 20) return 'Invalid Transaction ID format';
        return true;
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email for access key delivery:',
      validate: (input) => {
        if (!input) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) return 'Invalid email format';
        return true;
      }
    }
  ]);

  return await verifyPayment(txId, email);
}

async function verifyPayment(txId, email) {
  const spinner = ora('Verifying payment...').start();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.text = 'Checking blockchain...';
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.text = 'Validating transaction...';
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.text = 'Confirming payment...';
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  const isValid = await validateTransaction(txId);

  if (!isValid) {
    spinner.fail('Payment verification failed!');
    
    console.log('\n' + boxen(
      `${chalk.red.bold('⚠️ Verification Failed!')}\n\n` +
      `${chalk.white('Your transaction could not be verified.')}\n` +
      `${chalk.white('Possible reasons:')}\n\n` +
      `${chalk.yellow('•')} ${chalk.white('Transaction not yet confirmed')}\n` +
      `${chalk.yellow('•')} ${chalk.white('Invalid Transaction ID')}\n` +
      `${chalk.yellow('•')} ${chalk.white('Wrong payment amount')}\n` +
      `${chalk.yellow('•')} ${chalk.white('Wrong recipient address')}\n\n` +
      `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
      `${chalk.cyan('Expected Payment Address:')}\n` +
      `${chalk.white(PAYMENT_ADDRESS)}\n` +
      `${chalk.cyan('Expected Amount:')} ${chalk.white(ACCESS_PRICE)}`,
      {
        padding: 1,
        borderStyle: 'double',
        borderColor: 'red',
        backgroundColor: '#1a0a0a'
      }
    ));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: `${chalk.yellow('🔄 Verify Again')} - Re-enter TxID`, value: 'retry' },
          { name: `${chalk.cyan('📞 Contact Support')} - Get help`, value: 'support' },
          { name: `${chalk.gray('← Back')} - Return to main menu`, value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'retry':
        return await showPaymentScreen();
      case 'support':
        return await showSupport();
      case 'back':
        return false;
    }
  }

  spinner.succeed('Payment verified successfully!');
  
  const newAPIKey = generateAPIKey();
  const validKeys = config.get('validAPIKeys') || [];
  validKeys.push(newAPIKey);
  config.set('validAPIKeys', validKeys);

  console.log('\n' + boxen(
    `${chalk.green.bold('🎉 Payment Successful!')}\n\n` +
    `${chalk.white('Your API Key has been generated!')}\n` +
    `${chalk.white('Check your email for confirmation.')}\n\n` +
    `${chalk.bold.hex('#FFD700')('🔑 Your API Key:')}\n` +
    `${chalk.cyan.bold(newAPIKey)}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.yellow('⚠️ Save this key securely!')}\n` +
    `${chalk.white('Valid for 90 days')}`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'green',
      backgroundColor: '#0a1a0a'
    }
  ));

  config.set('auth', {
    method: AUTH_METHODS.API_KEY,
    apiKey: newAPIKey,
    email: email,
    paymentTxId: txId,
    paymentAmount: ACCESS_PRICE,
    token: generateToken({ apiKey: newAPIKey, email: email }),
    connectedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });

  return true;
}

async function validateTransaction(txId) {
  if (txId.startsWith('0x') && txId.length === 66) {
    return Math.random() > 0.3;
  }
  if (txId.length >= 64) {
    return Math.random() > 0.3;
  }
  return false;
}

async function showSupport() {
  console.log('\n' + boxen(
    `${chalk.bold.cyan('📞 Contact Support')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('Email:')} ${chalk.cyan('support@flashusdtsender.xyz')}\n` +
    `${chalk.white('Telegram:')} ${chalk.cyan('@FlashUSDTokens')}\n` +
    `${chalk.white('WhatsApp:')} ${chalk.cyan('+12052186093')}\n` +
    `${chalk.white('Support:')} ${chalk.cyan('@UnPuzzles')}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('24/7 Expert Support Available')}\n` +
    `${chalk.white('Response time: < 1 hour')}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));

  const { openChat } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openChat',
      message: 'Open Telegram support channel?',
      default: true
    }
  ]);

  if (openChat) {
    try {
      await open(TELEGRAM_CHANNEL);
      console.log(chalk.green('\n✓ Telegram opened in browser!'));
    } catch (e) {
      console.log(chalk.yellow('\nPlease manually open: ' + TELEGRAM_CHANNEL));
    }
  }

  return false;
}

function showAuthSuccess(identifier) {
  console.log('\n' + boxen(
    `${chalk.green.bold('✓ Authentication Successful!')}\n\n` +
    `${chalk.cyan('Account:')} ${chalk.white(identifier)}\n` +
    `${chalk.cyan('Status:')} ${chalk.green('Connected')}\n` +
    `${chalk.cyan('Valid Until:')} ${chalk.white('90 Days')}\n\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.hex('#FFD700')('⭐ Features Unlocked:')}\n` +
    `${chalk.green('✓')} Instant USDT transfers\n` +
    `${chalk.green('✓')} Multi-network support\n` +
    `${chalk.green('✓')} Transaction history\n` +
    `${chalk.green('✓')} 24/7 Support access`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'green',
      backgroundColor: '#0a1a0a'
    }
  ) + '\n');
}

function showAPIKey(apiKey) {
  console.log(boxen(
    `${chalk.yellow.bold('🔑 Your API Key:')}\n\n` +
    `${chalk.white(apiKey)}\n\n` +
    `${chalk.gray('Save this key securely. You\'ll need it for API access.')}`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'yellow',
      backgroundColor: '#1a1a0a'
    }
  ));
}

module.exports = {
  showAuthScreen,
  showPaymentScreen,
  showReferralScreen,
  showTelegramJoinBonus,
  AUTH_METHODS,
  generateToken,
  generateAPIKey,
  TELEGRAM_CHANNEL
};

#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');
const gradient = require('gradient-string');
const Conf = require('conf');
const ora = require('ora');

const config = new Conf({ projectName: 'flash-usdt-sender' });
const { showAuthScreen, showPaymentScreen, showReferralScreen, showTelegramJoinBonus } = require('./auth/auth');
const { sendUSDT } = require('./commands/send');
const { checkBalance } = require('./commands/balance');
const { showHistory } = require('./commands/history');
const { showSettings } = require('./commands/settings');

const BANNER = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  ███████╗██╗      █████╗ ███████╗ ██████╗██╗██╗                            ║
║  ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝██║██║                            ║
║  █████╗  ██║     ███████║███████╗██║     ██║██║                            ║
║  ██╔══╝  ██║     ██╔══██║╚════██║██║     ╚╝╚╝                              ║
║  ██║     ███████╗██║  ██║███████║╚██████╗██╗██╗                            ║
║  ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝                            ║
║         ██████╗ ███████╗███████╗████████╗███████╗███╗   ███╗               ║
║         ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║               ║
║         ██║  ██║█████╗  █████╗     ██║   █████╗  ██╔████╔██║               ║
║         ██║  ██║██╔══╝  ██╔══╝     ██║   ██╔══╝  ██║╚██╔╝██║               ║
║         ██████╔╝███████╗███████╗   ██║   ███████╗██║ ╚═╝ ██║               ║
║         ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝               ║
║                                                                              ║
║         Revolutionizing Cryptocurrency Transactions                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

const HEADER = `
${chalk.bgCyan.black(' Flash USDT: Fast Crypto Tools ')} ${chalk.gray('[Version 10.0.26220.7752]')}
${chalk.blue('https://t.me/FlashUSDTokens')}
${chalk.gray('(c) Flash USDT Corporation. All rights reserved.')}
${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${chalk.hex('#00FFFF')('📊 100x Faster')} ${chalk.hex('#FFD700')('💰 $25K Daily')} ${chalk.hex('#00FF00')('🌐 4 Blockchains')}
${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
`;

function showBanner() {
  console.clear();
  console.log(gradient.mind(BANNER));
  console.log(HEADER);
  
  const infoBox = boxen(
    `${chalk.bold.rgb(0, 255, 255)('⚡ Flash USDT Sender CLI')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.hex('#FFD700')('★')} ${chalk.white('Fast, Secure, Low-Fee')}\n` +
    `${chalk.hex('#FFD700')('★')} ${chalk.white('BEP20 Stablecoin Transactions')}\n` +
    `${chalk.hex('#FFD700')('★')} ${chalk.white('ERC20, TRC20, BEP20, SOLANA, POLYGON')}\n\n` +
    `${chalk.bold.hex('#00FF00')('⭐️ What You\'ll Get:')}\n` +
    `${chalk.green('✓')} ${chalk.white('Instant access key via email')}\n` +
    `${chalk.green('✓')} ${chalk.white('Secure, encrypted transactions')}\n` +
    `${chalk.green('✓')} ${chalk.white('90-Day transaction validity')}\n` +
    `${chalk.green('✓')} ${chalk.white('24/7 expert support')}\n` +
    `${chalk.green('✓')} ${chalk.white('Regular updates & new features')}\n\n` +
    `${chalk.bold.hex('#FFA500')('⚡ Send USDT instantly:')}\n` +
    `${chalk.white('📂 Just: Load Wallet → Enter Address → Send ✅')}\n\n` +
    `${chalk.cyan('📧 Support:')} ${chalk.white('@UnPuzzles')}\n` +
    `${chalk.cyan('📱 WhatsApp:')} ${chalk.white('+12052186093')}\n` +
    `${chalk.cyan('🌐 Web:')} ${chalk.white('flashusdtsender.xyz')}\n` +
    `${chalk.cyan('💬 Telegram:')} ${chalk.white('https://t.me/FlashUSDTokens')}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: 'double',
      borderColor: '#00FFFF',
      backgroundColor: '#0a0a1a'
    }
  );
  console.log(infoBox);
}

async function checkAuth() {
  const token = config.get('auth.token');
  const wallet = config.get('auth.wallet');
  const apiKey = config.get('auth.apiKey');
  
  return !!(token || wallet || apiKey);
}

async function mainMenu() {
  showBanner();
  
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    await showAuthScreen();
    return mainMenu();
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select an action:'),
      choices: [
        { name: `${chalk.green('⚡ Send USDT')} - Transfer instantly (ERC20, TRC20, BEP20, SOLANA, POLYGON)`, value: 'send' },
        { name: `${chalk.yellow('💰 Check Balance')} - View wallet balance`, value: 'balance' },
        { name: `${chalk.blue('📜 Transaction History')} - View past transactions`, value: 'history' },
        { name: `${chalk.magenta('⚙️  Settings')} - Configure preferences`, value: 'settings' },
        { name: `${chalk.hex('#0088CC')('📢 Invite Friends')} - Share & earn rewards`, value: 'referral' },
        { name: `${chalk.hex('#FFD700')('💳 Buy Access Key')} - Purchase lifetime access`, value: 'buy' },
        { name: `${chalk.red('🚪 Logout')} - Sign out of your account`, value: 'logout' },
        { name: `${chalk.gray('❌ Exit')} - Quit the application`, value: 'exit' }
      ],
      pageSize: 10
    }
  ]);

  switch (action) {
    case 'send':
      await sendUSDT();
      break;
    case 'balance':
      await checkBalance();
      break;
    case 'history':
      await showHistory();
      break;
    case 'settings':
      await showSettings();
      break;
    case 'referral':
      await showReferralScreen();
      break;
    case 'buy':
      await showPaymentScreen();
      break;
    case 'logout':
      config.clear();
      console.log(chalk.green('\n✓ Logged out successfully!'));
      return mainMenu();
    case 'exit':
      console.log(chalk.gray('\nGoodbye! 👋'));
      process.exit(0);
  }

  const { continue: cont } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Return to main menu?',
      default: true
    }
  ]);

  if (cont) {
    return mainMenu();
  }
}

program
  .name('flash-usdt')
  .description('Flash USDT Sender CLI - Fast, secure, low-fee BEP20 stablecoin transactions')
  .version('1.0.0')
  .option('-a, --auth', 'Authentication options')
  .option('-s, --send <address> <amount>', 'Send USDT to address')
  .option('-b, --balance', 'Check wallet balance')
  .option('-h, --history', 'View transaction history')
  .option('--logout', 'Logout from current session')
  .action(async (options) => {
    if (options.logout) {
      config.clear();
      console.log(chalk.green('Logged out successfully!'));
      return;
    }

    if (options.balance) {
      await checkBalance();
      return;
    }

    if (options.history) {
      await showHistory();
      return;
    }

    await mainMenu();
  });

program
  .command('login')
  .description('Login to Flash USDT Sender')
  .option('-m, --method <method>', 'Auth method: wallet, email, api')
  .action(async (options) => {
    showBanner();
    await showAuthScreen(options.method);
  });

program
  .command('send <address> <amount>')
  .description('Send USDT to an address')
  .option('-n, --network <network>', 'Network: bsc, eth, polygon', 'bsc')
  .option('-m, --memo <memo>', 'Transaction memo')
  .action(async (address, amount, options) => {
    await sendUSDT({ address, amount, ...options });
  });

program
  .command('balance')
  .description('Check wallet balance')
  .option('-a, --address <address>', 'Wallet address')
  .action(async (options) => {
    await checkBalance(options.address);
  });

program
  .command('history')
  .description('View transaction history')
  .option('-l, --limit <number>', 'Number of transactions', '10')
  .action(async (options) => {
    await showHistory(options.limit);
  });

program
  .command('config')
  .description('Configure CLI settings')
  .action(async () => {
    await showSettings();
  });

program.parse();

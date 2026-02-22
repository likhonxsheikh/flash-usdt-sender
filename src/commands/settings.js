const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const Conf = require('conf');

const config = new Conf({ projectName: 'flash-usdt-sender' });

async function showSettings() {
  console.log(chalk.cyan('\n⚙️  Settings\n'));

  const auth = config.get('auth');
  
  if (!auth) {
    console.log(chalk.red('Please login first!'));
    return;
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select setting:',
      choices: [
        { name: `${chalk.cyan('View Profile')} - See account details`, value: 'profile' },
        { name: `${chalk.yellow('Default Network')} - Set preferred network`, value: 'network' },
        { name: `${chalk.green('Security')} - Change password/PIN`, value: 'security' },
        { name: `${chalk.blue('Notifications')} - Configure alerts`, value: 'notifications' },
        { name: `${chalk.magenta('Export Keys')} - Download API keys`, value: 'export' },
        { name: `${chalk.red('Reset Config')} - Clear all settings`, value: 'reset' },
        { name: `${chalk.gray('Back')} - Return to main menu`, value: 'back' }
      ]
    }
  ]);

  switch (action) {
    case 'profile':
      showProfile(auth);
      break;
    case 'network':
      await setDefaultNetwork();
      break;
    case 'security':
      await securitySettings();
      break;
    case 'notifications':
      await notificationSettings();
      break;
    case 'export':
      exportKeys(auth);
      break;
    case 'reset':
      await resetConfig();
      break;
    case 'back':
      return;
  }
}

function showProfile(auth) {
  console.log(boxen(
    `${chalk.bold.cyan('👤 Account Profile')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('Method:')} ${chalk.green(auth.method?.toUpperCase())}\n` +
    (auth.email ? `${chalk.white('Email:')} ${chalk.cyan(auth.email)}\n` : '') +
    (auth.username ? `${chalk.white('Username:')} ${chalk.cyan(auth.username)}\n` : '') +
    (auth.wallet ? `${chalk.white('Wallet:')} ${chalk.yellow(auth.wallet.slice(0, 10) + '...' + auth.wallet.slice(-8))}\n` : '') +
    (auth.apiKey ? `${chalk.white('API Key:')} ${chalk.gray(auth.apiKey.slice(0, 15) + '...')}\n` : '') +
    `${chalk.white('Connected:')} ${chalk.green(new Date(auth.connectedAt).toLocaleString())}\n` +
    `${chalk.white('Expires:')} ${chalk.yellow(new Date(auth.expiresAt).toLocaleDateString())}\n` +
    `${chalk.white('Valid For:')} ${chalk.green('90 Days')}`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}

async function setDefaultNetwork() {
  const networks = ['bsc', 'eth', 'polygon', 'arbitrum', 'avalanche'];
  
  const { network } = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select default network:',
      choices: networks.map(n => ({
        name: chalk.cyan(n.toUpperCase()),
        value: n
      })),
      default: config.get('defaultNetwork') || 'bsc'
    }
  ]);

  config.set('defaultNetwork', network);
  console.log(chalk.green(`\nDefault network set to ${network.toUpperCase()}`));
}

async function securitySettings() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Security options:',
      choices: [
        { name: `${chalk.yellow('Change Password')}`, value: 'password' },
        { name: `${chalk.yellow('Set PIN')}`, value: 'pin' },
        { name: `${chalk.red('Regenerate API Key')}`, value: 'regenerate' },
        { name: `${chalk.gray('Back')}`, value: 'back' }
      ]
    }
  ]);

  if (action === 'password') {
    const { newPassword } = await inquirer.prompt([
      {
        type: 'password',
        name: 'newPassword',
        message: 'Enter new password:',
        mask: '*'
      }
    ]);
    console.log(chalk.green('\nPassword updated successfully!'));
  }

  if (action === 'pin') {
    const { pin } = await inquirer.prompt([
      {
        type: 'password',
        name: 'pin',
        message: 'Enter 6-digit PIN:',
        mask: '*'
      }
    ]);
    config.set('security.pin', pin);
    console.log(chalk.green('\nPIN set successfully!'));
  }

  if (action === 'regenerate') {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will invalidate your current API key. Continue?',
        default: false
      }
    ]);

    if (confirm) {
      const newKey = `FUSDT_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      config.set('auth.apiKey', newKey);
      console.log(chalk.green('\nNew API Key: ') + chalk.cyan(newKey));
      console.log(chalk.yellow('Save this key securely!'));
    }
  }
}

async function notificationSettings() {
  const { enabled } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'enabled',
      message: 'Enable notifications for:',
      choices: [
        { name: 'Transaction confirmations', value: 'tx_confirm', checked: true },
        { name: 'Incoming transfers', value: 'incoming', checked: true },
        { name: 'Low balance alerts', value: 'low_balance', checked: false },
        { name: 'Security alerts', value: 'security', checked: true }
      ]
    }
  ]);

  config.set('notifications', enabled);
  console.log(chalk.green('\nNotification settings saved!'));
}

function exportKeys(auth) {
  console.log(boxen(
    `${chalk.bold.yellow('🔑 Your Keys & Access Information')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    (auth.apiKey ? `${chalk.white('API Key:')}\n${chalk.cyan(auth.apiKey)}\n\n` : '') +
    (auth.accessKey ? `${chalk.white('Access Key:')}\n${chalk.cyan(auth.accessKey)}\n\n` : '') +
    (auth.token ? `${chalk.white('Session Token:')}\n${chalk.gray(auth.token.substring(0, 50) + '...')}\n` : '') +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.red('⚠️  Keep these keys secure and private!')}\n` +
    `${chalk.gray('Valid for 90 days from connection date')}`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'yellow'
    }
  ));
}

async function resetConfig() {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'This will clear all settings and logout. Continue?',
      default: false
    }
  ]);

  if (confirm) {
    config.clear();
    console.log(chalk.green('\nAll settings cleared!'));
  }
}

module.exports = { showSettings };

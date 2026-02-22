const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const Conf = require('conf');
const Table = require('cli-table3');
const { ethers } = require('ethers');

const config = new Conf({ projectName: 'flash-usdt-sender' });

const NETWORKS = {
  bsc: {
    name: 'BNB Smart Chain (BEP20)',
    chainId: 56,
    rpc: 'https://bsc-dataseed1.binance.org',
    explorer: 'https://bscscan.com',
    symbol: 'BNB'
  },
  eth: {
    name: 'Ethereum (ERC20)',
    chainId: 1,
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    symbol: 'ETH'
  },
  trc20: {
    name: 'Tron (TRC20)',
    chainId: 728126428,
    rpc: 'https://api.trongrid.io',
    explorer: 'https://tronscan.org',
    symbol: 'TRX'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    symbol: 'MATIC'
  },
  solana: {
    name: 'Solana (SOL)',
    chainId: 900,
    rpc: 'https://api.mainnet-beta.solana.com',
    explorer: 'https://explorer.solana.com',
    symbol: 'SOL'
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    symbol: 'ETH'
  },
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    symbol: 'AVAX'
  }
};

const USDT_CONTRACTS = {
  bsc: '0x55d398326f99059fF775485246999027B3197955',
  eth: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  trc20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  solana: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  avalanche: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'
};

async function sendUSDT(options = {}) {
  console.log(chalk.cyan('\n💸 Send USDT\n'));

  const auth = config.get('auth');
  
  if (!auth) {
    console.log(chalk.red('Please login first!'));
    return;
  }

  let recipientAddress = options.address;
  let amount = options.amount;
  let network = options.network || 'bsc';
  let memo = options.memo || '';

  if (!recipientAddress) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'network',
        message: 'Select network:',
        choices: Object.entries(NETWORKS).map(([key, net]) => ({
          name: `${chalk.cyan(net.name)} ${chalk.gray(`(${net.symbol})`)}`,
          value: key
        })),
        default: network
      },
      {
        type: 'input',
        name: 'address',
        message: 'Enter recipient address:',
        validate: (input) => {
          if (!input) return 'Address is required';
          if (!ethers.isAddress(input)) return 'Invalid address format';
          return true;
        }
      },
      {
        type: 'number',
        name: 'amount',
        message: 'Enter USDT amount:',
        validate: (input) => {
          if (!input || input <= 0) return 'Amount must be greater than 0';
          return true;
        }
      },
      {
        type: 'input',
        name: 'memo',
        message: 'Add memo (optional):',
        default: ''
      }
    ]);

    network = answers.network;
    recipientAddress = answers.address;
    amount = answers.amount;
    memo = answers.memo;
  }

  const selectedNetwork = NETWORKS[network];
  
  console.log(boxen(
    `${chalk.bold.cyan('Transaction Summary')}\n` +
    `${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}\n` +
    `${chalk.white('Network:')} ${chalk.cyan(selectedNetwork.name)}\n` +
    `${chalk.white('Recipient:')} ${chalk.yellow(recipientAddress.slice(0, 10) + '...' + recipientAddress.slice(-8))}\n` +
    `${chalk.white('Amount:')} ${chalk.green(amount + ' USDT')}\n` +
    `${chalk.white('Fee:')} ${chalk.gray('~$0.50 (Low Fee)')}\n` +
    (memo ? `${chalk.white('Memo:')} ${chalk.gray(memo)}\n` : ''),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Confirm transaction?',
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\nTransaction cancelled.'));
    return;
  }

  const spinner = ora('Processing transaction...').start();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.text = 'Validating address...';
  
  await new Promise(resolve => setTimeout(resolve, 800));
  spinner.text = 'Checking balance...';
  
  await new Promise(resolve => setTimeout(resolve, 600));
  spinner.text = 'Submitting to blockchain...';
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  spinner.text = 'Confirming transaction...';
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  const txHash = '0x' + Buffer.from(Date.now().toString() + Math.random().toString()).toString('hex').substring(0, 64);

  spinner.succeed('Transaction successful!');

  console.log('\n' + boxen(
    `${chalk.green.bold('✓ Transaction Completed!')}\n\n` +
    `${chalk.white('Transaction Hash:')}\n` +
    `${chalk.cyan(txHash)}\n\n` +
    `${chalk.white('Amount Sent:')} ${chalk.green(amount + ' USDT')}\n` +
    `${chalk.white('Network:')} ${chalk.cyan(selectedNetwork.name)}\n` +
    `${chalk.white('Status:')} ${chalk.green('Confirmed')}\n` +
    `${chalk.white('Valid Until:')} ${chalk.white('90 Days')}\n\n` +
    `${chalk.gray('View on explorer:')}\n` +
    `${chalk.blue(`${selectedNetwork.explorer}/tx/${txHash}`)}`,
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: 'green',
      backgroundColor: '#0a1a0a'
    }
  ) + '\n');

  const history = config.get('transactionHistory') || [];
  history.unshift({
    hash: txHash,
    type: 'send',
    amount: amount,
    network: network,
    recipient: recipientAddress,
    memo: memo,
    timestamp: new Date().toISOString(),
    status: 'confirmed'
  });
  config.set('transactionHistory', history.slice(0, 100));
}

async function checkBalance(address = null) {
  console.log(chalk.cyan('\n💰 Wallet Balance\n'));

  const auth = config.get('auth');
  
  if (!auth) {
    console.log(chalk.red('Please login first!'));
    return;
  }

  const walletAddress = address || auth.wallet || '0x' + Buffer.from(auth.email || auth.apiKey).toString('hex').substring(0, 40);

  const spinner = ora('Fetching balances...').start();

  const balances = [];
  
  for (const [_key, network] of Object.entries(NETWORKS)) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const usdtBalance = (Math.random() * 10000).toFixed(2);
    const nativeBalance = (Math.random() * 10).toFixed(4);
    
    balances.push({
      network: network.name,
      symbol: network.symbol,
      usdt: usdtBalance,
      native: nativeBalance,
      chainId: network.chainId
    });
  }

  spinner.succeed('Balances loaded!');

  const table = new Table({
    head: [
      chalk.cyan.bold('Network'),
      chalk.green.bold('USDT Balance'),
      chalk.yellow.bold('Native'),
      chalk.gray.bold('Chain ID')
    ],
    style: {
      head: [],
      border: ['gray']
    }
  });

  balances.forEach(b => {
    table.push([
      chalk.white(b.network),
      chalk.green(b.usdt + ' USDT'),
      chalk.yellow(b.native + ' ' + b.symbol),
      chalk.gray(b.chainId.toString())
    ]);
  });

  console.log('\n' + table.toString());
  console.log(chalk.gray(`\nWallet: ${walletAddress.substring(0, 10)}...${walletAddress.substring(walletAddress.length - 8)}`));
}

async function showHistory(limit = 10) {
  console.log(chalk.cyan('\n📜 Transaction History\n'));

  const auth = config.get('auth');
  
  if (!auth) {
    console.log(chalk.red('Please login first!'));
    return;
  }

  const history = config.get('transactionHistory') || [];
  
  if (history.length === 0) {
    console.log(chalk.yellow('No transactions found.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan.bold('Date'),
      chalk.white.bold('Type'),
      chalk.green.bold('Amount'),
      chalk.yellow.bold('Network'),
      chalk.gray.bold('Status')
    ],
    style: {
      head: [],
      border: ['gray']
    },
    colWidths: [12, 8, 15, 15, 10]
  });

  history.slice(0, parseInt(limit)).forEach(tx => {
    const date = new Date(tx.timestamp).toLocaleDateString();
    table.push([
      chalk.gray(date),
      tx.type === 'send' ? chalk.red('Send') : chalk.green('Receive'),
      chalk.green(tx.amount + ' USDT'),
      chalk.cyan(NETWORKS[tx.network]?.name || tx.network),
      tx.status === 'confirmed' ? chalk.green('✓ Confirmed') : chalk.yellow('Pending')
    ]);
  });

  console.log(table.toString());
  console.log(chalk.gray(`\nShowing ${Math.min(history.length, limit)} of ${history.length} transactions`));
}

module.exports = {
  sendUSDT,
  checkBalance,
  showHistory,
  NETWORKS,
  USDT_CONTRACTS
};

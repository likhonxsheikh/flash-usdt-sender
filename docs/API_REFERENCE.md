# API Reference 🚀

This document provides a comprehensive overview of the core modules and interfaces within the Flash USDT Sender ecosystem.

---

## 🐍 Python GUI API (`flash-usdt-sender/src/`)

### `FlashUSDTSenderGUI`
The main entry point for the desktop application.
- `__init__(wallet_manager, transaction_logic, config)`: Initializes the core GUI components.
- `_show_startup_popup()`: Triggers the security and welcome popup.
- `_buy_wallet()`: Displays the official payment and support information.

### `WalletManager`
Handles the isolation and protection of sensitive wallet data.
- `load_wallet(file_path)`: Loads and decrypts wallet data from various formats.
- `save_wallet(wallet_data, file_path)`: Encrypts and persists wallet information.

### `TransactionLogic`
Provides a decoupled interface for blockchain interactions.
- `simulate_transaction(network, amount, recipient)`: Mocks the transaction lifecycle for different chains.
- `broadcast_transaction(signed_tx)`: (Placeholder) Entry point for real node broadcasting.

---

## 🟢 Node.js CLI API (`src/`)

### `CLI Entry Hub`
- `src/index.js`: The central router for all command-line operations.

### `Security Module`
- `security/encryption.js`: Implements AES-256-GCM for mission-critical CLI data protection.
- `security/license.js`: Manages the local license verification lifecycle.

### `Commands`
- `commands/send.js`: The primary logic for multi-chain USDT transfers.
- `commands/balance.js`: Queries and validates wallet balances across supported networks.

---

## 🏗️ Technical Specifications

### Supported Networks
| Identifier | Protocol | Default Provider |
| :--- | :--- | :--- |
| `bsc` | BEP20 | QuickNode / BSC-RPC |
| `eth` | ERC20 | Infura / Alchemy |
| `trc20`| TRC20 | TronGrid |
| `sol` | SPL | Solana Mainnet |

### Data Encryption Standard
- **Key Derivation**: PBKDF2 with 100,000 iterations.
- **Algorithm**: Fernet (Symmetric Encryption) / AES-GCM.
- **Hash**: HMAC-SHA256 for integrity verification.

---
© 2026 Osama Bin Likhon.

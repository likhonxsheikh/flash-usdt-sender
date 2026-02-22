# Flash USDT Sender Wiki 📖

Welcome to the official Wiki for Flash USDT Sender.
- Telegram: https://t.me/FlashUSDTokens
- WhatsApp: +12052186093
- Support Handle: @UnPuzzles
- Web: flashusdtsender.xyz / flashusdtokens.xyz
This project is a modular, secure, and professional application for simulating USDT transactions on multiple blockchain networks.

## 🏛️ Technical Architecture

The application is built with a decoupled architecture, separating the User Interface, Business Logic, and Data Management.

- **Frontend**: CustomTkinter-based GUI for a high-performance, themed experience.
- **Wallet Engine**: Secure Fernet-based symmetric encryption for sensitive keys.
- **Provider Layer**: Modular transaction logic that can be easily extended to real blockchain nodes (Infura, TronGrid, etc.).

## 🔐 Security Framework

Security is a primary focus of the Flash USDT Sender project.

### Data Encryption
- Sensitive wallet data is encrypted using PBKDF2 for key derivation and Fernet (AES-128 in CBC mode with HMAC-SHA256) for data protection.
- Master keys should be managed through environment variables or secure OS keyrings.

### Licensing & Protection
- The application includes built-in license verification.
- Support for **PyArmor** obfuscation ensures that the source code remains protected when distributed.

## 🚢 DevOps & Deployment

We use a modern CI/CD approach to ensure consistent builds and reliable delivery.

#### Purchase Access
- **Special Offer**: $99 USD (TODAY ONLY - Reg. $129!)
- **Bonus**: +1 Month absolutely FREE!
- **Payment Address**: `0x036A5065d103005D7CaF5d1Cd75ABE6644D69069`
- **Networks**: BEP20 (Preferred), ERC20, TRC20, Polygon, Solana

### GitLab CI/CD Pipeline
- **Linting**: Automated code quality checks.
- **Building**: PyInstaller triggers from the CI pipeline to generate Windows `.exe` files.
- **Releases**: Tagged commits automatically generate official GitLab releases.

### Kubernetes Integration
The `k8s/` directory contains manifests for deploying future backend components or API gateways to a Kubernetes cluster.

## 📋 Frequently Asked Questions (FAQ)

### How do I load a wallet?
Use the **"Open Wallet"** button in the GUI to select an encrypted `.key` or `.json` file.

### Where can I find the build artifacts?
All official builds are uploaded to the **GitLab Package Registry**. Visit the "Deploy > Package Registry" section of the repository.

### How do I contribute?
Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on our development workflow.

---
© 2026 Osama Bin Likhon. All rights reserved.

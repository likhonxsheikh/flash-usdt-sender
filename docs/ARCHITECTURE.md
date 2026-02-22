# System Architecture 🏛️

The Flash USDT Sender ecosystem is designed as a modular, multi-tier system that integrates high-performance GUI clients, specialized CLI tools, and scalable cloud-based backend services.

## 🏗️ High-Level Overview

```mermaid
graph TD
    User((User))
    
    subgraph "Local Workspace (D:\FlashUSDTSender)"
        GUI["Premium Desktop Client (Python/ctk)"]
        CLI["Node.js CLI Tools (ES6)"]
        Config[".env & AppConfig"]
    end
    
    subgraph "Cloud Infrastructure"
        GitLab["GitLab Master Repository"]
        CI["CI/CD Pipeline (SAST/Docker/Build)"]
        Pages["GitLab Pages (Documentation)"]
        Registry["Package & Docker Registry"]
    end
    
    subgraph "External Integration"
        Provider["Blockchain Nodes (Tron/ETH/BSC)"]
        Support["Telegram/WhatsApp Support"]
    end

    User --> GUI
    User --> CLI
    GUI --> Config
    CLI --> Config
    GUI --> Provider
    CLI --> Provider
    
    GUI -. Push .-> GitLab
    CLI -. Push .-> GitLab
    GitLab --> CI
    CI --> Pages
    CI --> Registry
    
    User --> Pages
    User --> Support
```

## 🧩 Component Breakdown

### 1. Desktop Client (Python)
- **Core Engine**: Handles transaction simulation and provider orchestration.
- **Security Layer**: Fernet-based symmetric encryption for local data protection.
- **xFace GUI**: Advanced CustomTkinter implementation with High-DPI support.

### 2. CLI Ecosystem (Node.js)
- **Fast Interaction**: Optimized for scriptable, automated USDT transfers.
- **Architecture**: Modular commands (`send`, `balance`) with a central security hub.

### 3. DevOps Stack
- **GitLab-CI**: Multi-stage pipeline for Security, Build, and Deployment.
- **Docker**: Containerized backend and toolsets for environment parity.
- **Kubernetes**: Standardized orchestration for high-availability deployments.

---

## 🔐 Security Flow

```mermaid
sequenceDiagram
    participant U as User
    participant G as GUI/CLI
    participant S as Security Manager
    participant V as Vault/Env
    participant B as Blockchain

    U->>G: Initiate Action
    G->>V: Request Master Key
    V-->>G: Symmetric Key
    G->>S: Request Encryption/Signing
    S->>G: Signed Transaction
    G->>B: Broadcast to Network
    B-->>G: Receipt / TxID
    G-->>U: Success Notification
```

---
© 2026 Osama Bin Likhon.

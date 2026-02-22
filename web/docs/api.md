# Flash USDT API Documentation

## Overview

Flash USDT Sender provides a RESTful API for programmatic USDT transactions across multiple blockchains.

**Base URL:** `https://api.flashusdtsender.xyz/v1`

**Authentication:** Required for all endpoints

---

## Authentication

### Wallet Authentication

Connect using your cryptocurrency wallet address.

```http
POST /api/auth/wallet
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f1234"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-04-15T00:00:00Z"
}
```

### Email Authentication

Login with email and password.

```http
POST /api/auth/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

### API Key Authentication

Use API key for programmatic access.

```http
GET /api/balance
Authorization: FUSDT_your-api-key
```

---

## Endpoints

### Send USDT

Transfer USDT to any wallet address.

```http
POST /api/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "network": "bsc",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f1234",
  "amount": 100,
  "memo": "optional memo"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| network | string | Yes | bsc, eth, trc20, polygon, solana |
| to | string | Yes | Recipient wallet address |
| amount | number | Yes | Amount in USDT |
| memo | string | Optional | Transaction memo |

**Response:**
```json
{
  "success": true,
  "txId": "0x1234567890abcdef...",
  "network": "bsc",
  "amount": 100,
  "status": "pending"
}
```

### Check Balance

Get USDT balance for a wallet.

```http
GET /api/balance?network=bsc
Authorization: Bearer <token>
```

**Response:**
```json
{
  "network": "bsc",
  "balance": "1234.56",
  "usd": "1234.56"
}
```

### Transaction History

Get past transactions.

```http
GET /api/history?limit=10&network=all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx_123",
      "type": "sent",
      "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f1234",
      "amount": 100,
      "network": "bsc",
      "status": "completed",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Get Gas Price

Get current gas prices for networks.

```http
GET /api/gas?network=bsc
```

**Response:**
```json
{
  "network": "bsc",
  "gasPrice": "5",
  "unit": "gwei",
  "estimatedFee": "0.005"
}
```

---

## Supported Networks

| Network | Chain ID | Symbol | Type |
|---------|----------|--------|------|
| bsc | 56 | BEP20 | EVM |
| eth | 1 | ERC20 | EVM |
| trc20 | - | TRC20 | Tron |
| polygon | 137 | MATIC | EVM |
| solana | - | SPL | Solana |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | Wrong email/password |
| AUTH_002 | Token expired | Session expired, please login again |
| AUTH_003 | Invalid API key | API key not found or revoked |
| AUTH_004 | Wallet not verified | Wallet address verification failed |
| SEND_001 | Insufficient balance | Not enough USDT in wallet |
| SEND_002 | Invalid address | Wrong recipient address format |
| SEND_003 | Network error | Blockchain connection failed |
| SEND_004 | Amount too low | Below minimum transaction amount |
| TX_001 | Transaction failed | Blockchain rejected the transaction |
| TX_002 | Transaction pending | Waiting for confirmation |
| TX_003 | Invalid amount | Invalid or negative amount |

---

## Rate Limits

- **API Requests:** 60 requests/minute
- **Send Transactions:** 10 transactions/day
- **Balance Checks:** 100 requests/day

---

## SDK Examples

### Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.flashusdtsender.xyz/v1',
  headers: {
    'Authorization': 'FUSDT_your-api-key',
    'Content-Type': 'application/json'
  }
});

// Send USDT
const result = await client.post('/send', {
  network: 'bsc',
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f1234',
  amount: 100
});

console.log(result.data);
```

### Python

```python
import requests

BASE_URL = "https://api.flashusdtsender.xyz/v1"
HEADERS = {"Authorization": "FUSDT_your-api-key"}

# Send USDT
response = requests.post(
    f"{BASE_URL}/send",
    json={
        "network": "bsc",
        "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f1234",
        "amount": 100
    },
    headers=HEADERS
)

print(response.json())
```

---

## Webhooks

Receive transaction notifications.

```http
POST your-webhook-url.com/webhook
Content-Type: application/json

{
  "event": "transaction.completed",
  "txId": "0x1234567890...",
  "status": "completed",
  "amount": 100,
  "network": "bsc"
}
```

---

## Support

- **Email:** support@flashusdtsender.xyz
- **Telegram:** @FlashUSDTokens
- **WhatsApp:** +12052186093

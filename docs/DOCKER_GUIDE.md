# 🐳 Multi-Stage Deployment Configuration

## 🐍 Python Desktop Environment
```dockerfile
# Build Stage
FROM python:3.10-slim AS builder
WORKDIR /app
COPY flash-usdt-sender/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final Stage
FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY flash-usdt-sender/ .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "src/main.py"]
```

## 🟢 Node.js CLI Environment
```dockerfile
# Build Stage
FROM node:18-slim AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Final Stage
FROM node:18-slim
WORKDIR /app
COPY --from=node_builder /app/node_modules ./node_modules
COPY . .
ENTRYPOINT ["node", "src/index.js"]
```

---
© 2026 Osama Bin Likhon.

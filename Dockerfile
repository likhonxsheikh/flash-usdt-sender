# Multi-stage build for Flash USDT Sender (Python Desktop)
FROM python:3.10-slim AS builder

WORKDIR /app
COPY flash-usdt-sender/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY flash-usdt-sender/ .
ENV PATH=/root/.local/bin:$PATH

# Note: GUI apps require an X server or Wayland to run. 
# This image is optimized for CI/CD testing and headless validation.
CMD ["python", "src/main.py"]

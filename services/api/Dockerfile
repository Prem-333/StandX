FROM python:3.11-slim-bookworm@sha256:a36c24f9cbdf4fd0f52d67f0823eeac19c2028c637cecc392d97f980d4fec56b
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PYTHONUTF8=1 \
    HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 HF_HUB_DISABLE_TELEMETRY=1
COPY requirements.txt ./requirements.txt
COPY services/ingestion/requirements.txt ./services/ingestion/requirements.txt
RUN python -m pip install --no-cache-dir torch==2.14.0 --index-url https://download.pytorch.org/whl/cpu \
    && python -m pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home --uid 10001 standards \
    && mkdir -p /app/runtime /app/data/local /home/standards/.cache \
    && chown -R standards:standards /app/runtime /app/data/local /home/standards
USER standards
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "services.api.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--no-access-log"]

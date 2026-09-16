FROM python:3.13-slim

WORKDIR /app
COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV DB_PATH=/data/vendas.db

EXPOSE 8080

CMD ["python", "server.py"]

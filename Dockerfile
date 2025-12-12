FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gdown

COPY package*.json ./
RUN npm install

COPY . .

# Download SEMUA models dari Google Drive
RUN mkdir -p src/models/model
RUN gdown --id YOUR_PIPELINE_ID -O src/models/model/preprocessing_pipeline.pkl
RUN gdown --id YOUR_SCALER_ID -O src/models/model/scaler.pkl
RUN gdown --id YOUR_RUL_MODEL_ID -O src/models/model/rul_model.pkl
RUN gdown --id YOUR_FAILURE_ID -O src/models/model/failure_model.pkl
RUN gdown --id YOUR_LABEL_ENCODER_ID -O src/models/model/label_encoder.pkl

# Verify downloads
RUN echo "Downloaded models:" && ls -lh src/models/model/

CMD ["npm", "start"]
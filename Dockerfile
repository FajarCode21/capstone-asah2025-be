FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy application code (without large model files)
COPY . .

# Download model files from GitHub Releases
RUN mkdir -p src/models/model

RUN echo "Downloading models from GitHub Releases..."

RUN curl -L -o src/models/model/preprocessing_pipeline.pkl \
    https://github.com/FajarCode21/capstone-asah2025-be/releases/download/v1.0.0/preprocessing_pipeline.pkl

RUN curl -L -o src/models/model/scaler.pkl \
    https://github.com/FajarCode21/capstone-asah2025-be/releases/download/v1.0.0/scaler.pkl

RUN curl -L -o src/models/model/rul_model.pkl \
    https://github.com/FajarCode21/capstone-asah2025-be/releases/download/v1.0.0/rul_model.pkl

RUN curl -L -o src/models/model/failure_model.pkl \
    https://github.com/FajarCode21/capstone-asah2025-be/releases/download/v1.0.0/failure_model.pkl

RUN curl -L -o src/models/model/label_encoder.pkl \
    https://github.com/FajarCode21/capstone-asah2025-be/releases/download/v1.0.0/label_encoder.pkl

# Verify downloads (should show LARGE files now!)
RUN echo "Verifying downloaded models:"
RUN ls -lh src/models/model/*.pkl
RUN echo "Total size:"
RUN du -sh src/models/model/

CMD ["npm", "start"]
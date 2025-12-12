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

# Copy application code (Railway auto-download Git LFS files)
COPY . .

# Verify model files exist
RUN echo "Checking for model files..."
RUN ls -lh src/models/model/ || echo "Model directory not found"
RUN du -sh src/models/model/*.pkl 2>/dev/null || echo "No .pkl files found"

CMD ["npm", "start"]
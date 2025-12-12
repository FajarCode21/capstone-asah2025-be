FROM python:3.11-slim

# Install Git LFS and Node.js
RUN apt-get update && apt-get install -y \
    curl git git-lfs \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Initialize Git LFS
RUN git lfs install

WORKDIR /app

# Copy .git directory first to enable LFS pull
# Note: Railway might not include .git, so this is a workaround
COPY . .

# Try to pull LFS files if .git exists
RUN if [ -d .git ]; then git lfs pull; else echo "No .git directory, LFS files should be included"; fi

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Verify model files (should be large now)
RUN echo "Checking model file sizes..."
RUN ls -lh src/models/model/*.pkl
RUN du -h src/models/model/*.pkl

CMD ["npm", "start"]
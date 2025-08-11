# Multi-stage build for smaller final image
FROM ubuntu:22.04 AS builder

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    pkg-config \
    libboost-all-dev \
    libasio-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy source code (excluding build directory)
COPY CMakeLists.txt .
COPY include/ include/
COPY src/ src/
COPY tests/ tests/
COPY notes/ notes/

# Create build directory and build
RUN mkdir -p build && cd build && \
    cmake .. && \
    make -j$(nproc)

# Runtime stage
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libboost-system1.74.0 \
    libboost-thread1.74.0 \
    libboost-filesystem1.74.0 \
    libboost-date-time1.74.0 \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy the built executable and static files from builder stage
COPY --from=builder /app/build/src/harper .
COPY --from=builder /app/build/src/static ./static
COPY --from=builder /app/build/src/templates ./templates

# Change ownership to app user
RUN chown -R appuser:appuser /app

USER appuser

# Expose port (common ports for web apps - adjust if needed)
EXPOSE 8080

# Run the application
CMD ["./harper"]
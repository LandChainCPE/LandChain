FROM golang:1.23-alpine

# Set working directory
WORKDIR /app

# ติดตั้ง dependencies สำหรับ build + go mod tidy
RUN apk add --no-cache build-base git bash ca-certificates

# Copy source code
COPY . .

# Tidy และ build
RUN go mod tidy
RUN go build -o main .

# Expose port
EXPOSE 8000

# Run
CMD ["./main"]

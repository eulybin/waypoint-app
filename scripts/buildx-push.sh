#!/usr/bin/env bash
set -euo pipefail

# Builds and pushes a multi-arch image (amd64 + arm64) to ECR.
# Usage:
#   ./scripts/buildx-push.sh <aws-region> <account-id> <repository> <image-tag>
# Example:
#   ./scripts/buildx-push.sh eu-west-1 067969188628 waypoint-app $(git rev-parse --short HEAD)

if [[ $# -ne 4 ]]; then
  echo "Usage: $0 <aws-region> <account-id> <repository> <image-tag>" >&2
  exit 1
fi

REGION="$1"
ACCOUNT_ID="$2"
REPO="$3"
TAG="$4"

ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE="${ECR_REGISTRY}/${REPO}:${TAG}"
LATEST="${ECR_REGISTRY}/${REPO}:latest"

aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"

# Ensure buildx is available
if ! docker buildx version >/dev/null 2>&1; then
  echo "Docker buildx is required. Please install or enable it." >&2
  exit 1
fi

# Build a multi-arch manifest so ECS pulls the right arch and Macs run locally
DOCKER_BUILDKIT=1 docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile.prod \
  -t "$IMAGE" \
  -t "$LATEST" \
  --push .

echo "Pushed multi-arch image to: $IMAGE (and tagged latest)"

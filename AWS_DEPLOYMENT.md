# AWS Deployment Guide for Waypoint App

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **Domain name** (optional, for custom domain)

## Deployment Option 1: AWS ECS with Fargate (Recommended)

### Step 1: Create ECR Repositories

```bash
# Create repository for production image
aws ecr create-repository --repository-name waypoint-app --region us-east-1

# Get repository URI (save this)
aws ecr describe-repositories --repository-names waypoint-app --region us-east-1 --query 'repositories[0].repositoryUri' --output text
```

### Step 2: Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build production image
docker build -f Dockerfile.prod -t waypoint-app:latest .

# Tag image for ECR
docker tag waypoint-app:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/waypoint-app:latest

# Push to ECR
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/waypoint-app:latest
```

### Step 3: Set Up RDS PostgreSQL

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier waypoint-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --master-username waypoint_admin \
    --master-user-password 'YourSecurePassword123!' \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-name waypoint_db \
    --backup-retention-period 7 \
    --region us-east-1
```

### Step 4: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name waypoint-cluster --region us-east-1
```

### Step 5: Create Task Definition

Create `ecs-task-definition.json`:

```json
{
    "family": "waypoint-task",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "containerDefinitions": [
        {
            "name": "waypoint-app",
            "image": "<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/waypoint-app:latest",
            "portMappings": [
                {
                    "containerPort": 80,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "FLASK_APP",
                    "value": "src/app.py"
                },
                {
                    "name": "FLASK_DEBUG",
                    "value": "0"
                }
            ],
            "secrets": [
                {
                    "name": "DATABASE_URL",
                    "valueFrom": "arn:aws:secretsmanager:us-east-1:xxxxx:secret:waypoint/database-url"
                },
                {
                    "name": "PEXELS_API_KEY",
                    "valueFrom": "arn:aws:secretsmanager:us-east-1:xxxxx:secret:waypoint/pexels-key"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/waypoint-app",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
```

Register task:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### Step 6: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name waypoint-alb \
    --subnets subnet-xxxxxx subnet-yyyyyy \
    --security-groups sg-xxxxxxxx \
    --region us-east-1

# Create target group
aws elbv2 create-target-group \
    --name waypoint-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-xxxxxxxx \
    --target-type ip \
    --health-check-path /health \
    --region us-east-1

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn <alb-arn> \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

### Step 7: Create ECS Service

```bash
aws ecs create-service \
    --cluster waypoint-cluster \
    --service-name waypoint-service \
    --task-definition waypoint-task \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxx,subnet-yyyyyy],securityGroups=[sg-xxxxxxxx],assignPublicIp=ENABLED}" \
    --load-balancers targetGroupArn=<target-group-arn>,containerName=waypoint-app,containerPort=80 \
    --region us-east-1
```

## Deployment Option 2: AWS EC2 with Docker Compose

### Step 1: Launch EC2 Instance

```bash
# Launch t3.medium instance with Amazon Linux 2023
aws ec2 run-instances \
    --image-id ami-xxxxxxxxx \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxxxx \
    --subnet-id subnet-xxxxxxxx \
    --region us-east-1 \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=waypoint-app}]'
```

### Step 2: SSH and Install Dependencies

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<instance-public-ip>

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install git -y
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/waypoint-app.git
cd waypoint-app

# Create .env.prod file
nano .env.prod
# (Add your environment variables)

# Start application
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Step 4: Configure Security Group

Allow inbound traffic:

- Port 80 (HTTP) from 0.0.0.0/0
- Port 443 (HTTPS) from 0.0.0.0/0
- Port 22 (SSH) from your IP

## Deployment Option 3: AWS Elastic Beanstalk

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Initialize Elastic Beanstalk

```bash
eb init -p docker waypoint-app --region us-east-1
```

### Step 3: Create Dockerrun.aws.json

```json
{
    "AWSEBDockerrunVersion": "3",
    "containerDefinitions": [
        {
            "name": "waypoint-app",
            "image": "<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/waypoint-app:latest",
            "essential": true,
            "memory": 1024,
            "portMappings": [
                {
                    "hostPort": 80,
                    "containerPort": 80
                }
            ]
        }
    ]
}
```

### Step 4: Deploy

```bash
# Create environment
eb create waypoint-prod-env

# Deploy updates
eb deploy
```

## Post-Deployment Steps

### 1. Set Up SSL/HTTPS

For ECS with ALB:

```bash
# Request certificate
aws acm request-certificate \
    --domain-name yourdomain.com \
    --validation-method DNS \
    --region us-east-1

# Add HTTPS listener to ALB
aws elbv2 create-listener \
    --load-balancer-arn <alb-arn> \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=<certificate-arn> \
    --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

### 2. Configure Domain (Route 53)

```bash
# Create hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Create A record pointing to ALB
aws route53 change-resource-record-sets --hosted-zone-id ZXXXXX --change-batch file://route53-change.json
```

### 3. Set Up CloudWatch Monitoring

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/waypoint-app --region us-east-1

# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
    --alarm-name waypoint-cpu-high \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

### 4. Enable Auto-Scaling (ECS)

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/waypoint-cluster/waypoint-service \
    --min-capacity 2 \
    --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/waypoint-cluster/waypoint-service \
    --policy-name cpu-scaling \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Cost Estimates (Monthly)

**Option 1: ECS Fargate**

- ECS Tasks (2x 0.5 vCPU, 1GB): ~$30
- ALB: ~$20
- RDS PostgreSQL (db.t3.micro): ~$15
- ECR Storage: ~$1
- **Total: ~$66/month**

**Option 2: EC2**

- t3.medium instance: ~$30
- RDS PostgreSQL: ~$15
- EBS Storage: ~$5
- **Total: ~$50/month**

**Option 3: Elastic Beanstalk**

- Similar to EC2 costs
- **Total: ~$50-70/month**

## Monitoring and Maintenance

```bash
# View logs
aws logs tail /ecs/waypoint-app --follow

# Update service with new image
aws ecs update-service \
    --cluster waypoint-cluster \
    --service waypoint-service \
    --force-new-deployment

# Check service health
aws ecs describe-services \
    --cluster waypoint-cluster \
    --services waypoint-service
```

## Backup Strategy

```bash
# Enable automated RDS backups (already configured in creation)
# Manual snapshot:
aws rds create-db-snapshot \
    --db-instance-identifier waypoint-db \
    --db-snapshot-identifier waypoint-snapshot-$(date +%Y%m%d)
```

## Troubleshooting

**Containers failing:**

```bash
# Check task logs
aws ecs describe-tasks --cluster waypoint-cluster --tasks <task-id>
```

**Database connection issues:**

```bash
# Verify security group allows traffic from ECS tasks to RDS
# Check DATABASE_URL format in secrets manager
```

**High costs:**

- Reduce RDS instance size
- Use fewer ECS tasks
- Enable spot instances for EC2

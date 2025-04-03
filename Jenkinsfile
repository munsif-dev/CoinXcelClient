pipeline {
    agent any
    
    tools {
        maven 'M3'
        jdk 'JDK'
    }
    
    environment {
        DOCKER_HUB_USER = 'munsifahamed' 
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials')
        COINXCEL_FRONTEND_REPO = 'https://github.com/munsif-dev/CoinXcelClient.git'
        SSH_KEY_CREDENTIALS = 'jenkins-key' // UPDATED to match your AWS key name and Jenkins credential ID
        API_BASE_URL = 'http://44.212.40.132:8080'
        TERRAFORM_STATE_KEY = 'coinxcel-frontend-terraform.tfstate'
        NODE_VERSION = '18'
        AWS_DEFAULT_REGION = 'us-east-1'
        TF_PLUGIN_CACHE_DIR = '/var/lib/jenkins/terraform-plugin-cache'
        EC2_USERNAME = 'ubuntu' // UPDATED to match your backend configuration
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${env.COINXCEL_FRONTEND_REPO}"
                sh 'mkdir -p terraform ansible'
                sh 'mkdir -p $TF_PLUGIN_CACHE_DIR'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    sudo apt-get remove -y nodejs npm || true
                    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    node -v
                    npm -v
                    npm install
                '''
            }
        }
        
        // Other stages remain the same...
        
        stage('Provision Infrastructure') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    writeFile file: 'terraform/main.tf', text: '''
                    terraform {
                      required_providers {
                        aws = {
                          source  = "hashicorp/aws"
                          version = "5.93.0"
                        }
                      }
                    }
                    
                    provider "aws" {
                      region = "us-east-1"
                    }

                    resource "aws_instance" "frontend" {
                      ami           = "ami-0c7217cdde317cfec"  # Ubuntu 22.04 LTS
                      instance_type = "t2.micro"
                      key_name      = "jenkins-key"  # UPDATED to match your AWS key name
                      
                      tags = {
                        Name = "coinxcel-frontend"
                      }

                      vpc_security_group_ids = [aws_security_group.frontend_sg.id]

                      root_block_device {
                        volume_size = 30
                        volume_type = "gp2"
                      }
                    }

                    resource "aws_security_group" "frontend_sg" {
                      name        = "coinxcel-frontend-sg"
                      description = "Security group for CoinXcel frontend"

                      ingress {
                        from_port   = 22
                        to_port     = 22
                        protocol    = "tcp"
                        cidr_blocks = ["0.0.0.0/0"]
                      }

                      ingress {
                        from_port   = 80
                        to_port     = 80
                        protocol    = "tcp"
                        cidr_blocks = ["0.0.0.0/0"]
                      }

                      ingress {
                        from_port   = 443
                        to_port     = 443
                        protocol    = "tcp"
                        cidr_blocks = ["0.0.0.0/0"]
                      }

                      ingress {
                        from_port   = 3000
                        to_port     = 3000
                        protocol    = "tcp"
                        cidr_blocks = ["0.0.0.0/0"]
                      }

                      egress {
                        from_port   = 0
                        to_port     = 0
                        protocol    = "-1"
                        cidr_blocks = ["0.0.0.0/0"]
                      }
                    }

                    output "frontend_public_ip" {
                      value = aws_instance.frontend.public_ip
                    }
                    '''
                    
                    sh 'cd terraform && terraform init -upgrade=false'
                    
                    script {
                        def existingInstanceId = sh(
                            script: '''
                                aws ec2 describe-instances \
                                --region ${AWS_DEFAULT_REGION} \
                                --filters "Name=tag:Name,Values=coinxcel-frontend" "Name=instance-state-name,Values=running" \
                                --query "Reservations[].Instances[].InstanceId" \
                                --output text
                            ''',
                            returnStdout: true
                        ).trim()
                        
                        if (existingInstanceId == '') {
                            echo "No existing frontend instance found. Creating a new one..."
                            sh 'cd terraform && terraform apply -auto-approve'
                        } else {
                            echo "Found existing frontend instance: ${existingInstanceId}"
                            def instanceInState = sh(
                                script: '''
                                    cd terraform && terraform state list | grep aws_instance.frontend || echo "not_found"
                                ''',
                                returnStdout: true
                            ).trim()
                            
                            if (instanceInState == "not_found") {
                                echo "Importing existing instance into Terraform state..."
                                sh "cd terraform && terraform import aws_instance.frontend ${existingInstanceId} || echo 'Import failed but continuing'"
                            } else {
                                echo "Instance already in Terraform state"
                            }
                        }
                        
                        env.EC2_PUBLIC_IP = sh(
                            script: 'cd terraform && terraform output -raw frontend_public_ip',
                            returnStdout: true
                        ).trim()
                        
                        echo "Frontend EC2 Public IP: ${env.EC2_PUBLIC_IP}"
                    }
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                writeFile file: 'deploy.sh', text: '''#!/bin/bash
                set -e

                # Install Node.js and npm
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
                
                # Install required packages
                sudo apt-get update
                sudo apt-get install -y nginx
                
                # Stop nginx during deployment
                sudo systemctl stop nginx || true
                
                # Clean previous deployment
                sudo rm -rf /var/www/coinxcel-frontend
                sudo mkdir -p /var/www/coinxcel-frontend
                
                # Copy build files
                sudo cp -r .next /var/www/coinxcel-frontend/
                sudo cp -r public /var/www/coinxcel-frontend/
                sudo cp next.config.js package.json /var/www/coinxcel-frontend/
                
                # Install production dependencies
                cd /var/www/coinxcel-frontend
                sudo npm install --production
                
                # Configure Nginx
                sudo tee /etc/nginx/sites-available/coinxcel-frontend > /dev/null << EOL
                server {
                    listen 80;
                    server_name _;
                    
                    location / {
                        proxy_pass http://localhost:3000;
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade \$http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host \$host;
                        proxy_cache_bypass \$http_upgrade;
                    }
                }
                EOL
                
                # Enable site config
                sudo ln -sf /etc/nginx/sites-available/coinxcel-frontend /etc/nginx/sites-enabled/
                sudo rm -f /etc/nginx/sites-enabled/default
                
                # Set up the app as a systemd service
                sudo tee /etc/systemd/system/coinxcel-frontend.service > /dev/null << EOL
                [Unit]
                Description=CoinXcel Frontend
                After=network.target
                
                [Service]
                Type=simple
                User=ubuntu
                WorkingDirectory=/var/www/coinxcel-frontend
                ExecStart=/usr/bin/npm start
                Restart=on-failure
                
                [Install]
                WantedBy=multi-user.target
                EOL
                
                # Start services
                sudo systemctl daemon-reload
                sudo systemctl enable coinxcel-frontend
                sudo systemctl start coinxcel-frontend
                sudo systemctl restart nginx
                
                echo "Deployment completed successfully"
                '''
                
                sh 'chmod +x deploy.sh'
                
                // Add debugging to check SSH connection
                sshagent([env.SSH_KEY_CREDENTIALS]) {
                    sh """
                        # Test SSH connection first with verbose output
                        echo "Testing SSH connection to ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP}..."
                        ssh -v -o StrictHostKeyChecking=no ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP} 'echo SSH connection successful'
                        
                        # If connection successful, proceed with deployment
                        echo "Copying deployment files..."
                        scp -o StrictHostKeyChecking=no -r .next package.json next.config.js deploy.sh public ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP}:~/
                        
                        echo "Executing deployment script..."
                        ssh -o StrictHostKeyChecking=no ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP} 'bash deploy.sh'
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Frontend deployment completed successfully!'
            sh "echo 'Application is accessible at: http://${env.EC2_PUBLIC_IP}'"
        }
        failure {
            echo 'There was a failure during the frontend deployment process.'
        }
        always {
            cleanWs()
        }
    }
}
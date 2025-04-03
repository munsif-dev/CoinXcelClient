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
        SSH_KEY_CREDENTIALS = 'jenkins-key'
        API_BASE_URL = 'http://44.212.40.132:8080'
        TERRAFORM_STATE_KEY = 'coinxcel-frontend-terraform.tfstate'
        NODE_VERSION = '20'
        AWS_DEFAULT_REGION = 'us-east-1'
        TF_PLUGIN_CACHE_DIR = '/var/lib/jenkins/terraform-plugin-cache'
        EC2_USERNAME = 'ubuntu'
        ANSIBLE_TIMEOUT = '30'
        ANSIBLE_SSH_ARGS = '-o ConnectTimeout=10'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout the frontend repository
                git branch: 'main', url: "${env.COINXCEL_FRONTEND_REPO}"
                
                // Create necessary directories and set permissions
                sh '''
                    mkdir -p terraform ansible
                    mkdir -p $TF_PLUGIN_CACHE_DIR
                    chmod 755 $TF_PLUGIN_CACHE_DIR
                    
                    # List directory content to debug
                    ls -la
                '''
                
                // Create Ansible playbooks and updated Dockerfile for production
                writeFile file: 'Dockerfile', text: '''
FROM node:20 AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Set the command to run the app
CMD ["node", "server.js"]
'''

                writeFile file: 'ansible/hosts', text: '''
[frontend_servers]
frontend ansible_host=${EC2_PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=/tmp/ec2_key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'

[frontend_servers:vars]
ansible_python_interpreter=/usr/bin/python3
'''

                writeFile file: 'ansible/install-docker.yml', text: '''
---
- name: Install Docker and Docker Compose
  hosts: frontend_servers
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install prerequisites
      apt:
        name:
          - ca-certificates
          - curl
          - gnupg
          - lsb-release
          - apt-transport-https
          - python3-docker
        state: present

    - name: Create keyrings directory
      file:
        path: /etc/apt/keyrings
        state: directory
        mode: '0755'

    - name: Add Docker GPG key
      block:
        - name: Download Docker GPG key
          get_url:
            url: https://download.docker.com/linux/ubuntu/gpg
            dest: /tmp/docker-archive-keyring.gpg
            mode: '0644'
            
        - name: Dearmor GPG key
          shell: gpg --dearmor < /tmp/docker-archive-keyring.gpg > /etc/apt/keyrings/docker.gpg
          args:
            creates: /etc/apt/keyrings/docker.gpg
            
        - name: Set permissions on key
          file:
            path: /etc/apt/keyrings/docker.gpg
            mode: '0644'

    - name: Set up Docker repository
      apt_repository:
        repo: "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
        state: present
        filename: docker

    - name: Install Docker Engine
      apt:
        name:
          - docker-ce
          - docker-ce-cli
          - containerd.io
          - docker-buildx-plugin
          - docker-compose-plugin
        state: present
        update_cache: yes

    - name: Install Docker Compose
      get_url:
        url: https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-linux-x86_64
        dest: /usr/local/bin/docker-compose
        mode: '0755'

    - name: Create symlink for Docker Compose
      file:
        src: /usr/local/bin/docker-compose
        dest: /usr/bin/docker-compose
        state: link

    - name: Add ubuntu user to docker group
      user:
        name: ubuntu
        groups: docker
        append: yes

    - name: Start Docker service
      systemd:
        name: docker
        state: started
        enabled: yes

    - name: Check Docker installation
      command: docker --version
      register: docker_version
      changed_when: false

    - name: Display Docker version
      debug:
        var: docker_version.stdout
'''

                writeFile file: 'ansible/deploy-frontend.yml', text: '''
---
- name: Deploy CoinXcel Frontend Application
  hosts: frontend_servers
  become: yes
  vars:
    docker_hub_user: "{{ lookup('env', 'DOCKER_USERNAME') }}"
    docker_hub_password: "{{ lookup('env', 'DOCKER_PASSWORD') }}"
    api_base_url: "{{ lookup('env', 'API_BASE_URL') }}"
  tasks:
    - name: Create app directory
      file:
        path: /home/ubuntu/frontend
        state: directory
        owner: ubuntu
        group: ubuntu
        mode: '0755'

    - name: Copy Dockerfile
      copy:
        src: ../Dockerfile
        dest: /home/ubuntu/frontend/Dockerfile
        owner: ubuntu
        group: ubuntu
        mode: '0644'

    - name: Update next.config.ts to ensure proper production build
      copy:
        content: |
          import type { NextConfig } from "next";

          const nextConfig: NextConfig = {
            output: "standalone",
            reactStrictMode: true,
            // Ensure images are properly handled
            images: {
              unoptimized: true
            },
            // Ensures CSS is properly bundled
            transpilePackages: [],
          };

          export default nextConfig;
        dest: /home/ubuntu/frontend/next.config.ts
        owner: ubuntu
        group: ubuntu
        mode: '0644'

    - name: Check if files exist before copying
      stat:
        path: "{{ item }}"
      register: file_stats
      delegate_to: localhost
      with_items:
        - ../package.json
        - ../package-lock.json
        - ../tsconfig.json
        - ../tailwind.config.ts
        - ../postcss.config.mjs
      
    - name: Copy existing application files
      copy:
        src: "{{ item.item }}"
        dest: /home/ubuntu/frontend/
        owner: ubuntu
        group: ubuntu
      when: item.stat.exists
      with_items: "{{ file_stats.results }}"

    - name: Check if directories exist
      stat:
        path: "{{ item }}"
      register: dir_stats
      delegate_to: localhost
      with_items:
        - ../app
        - ../components
        - ../public
        - ../lib
        - ../src
        - ../store

    - name: Copy existing source code directories
      copy:
        src: "{{ item.item }}"
        dest: /home/ubuntu/frontend/
        owner: ubuntu
        group: ubuntu
      when: item.stat.exists
      with_items: "{{ dir_stats.results }}"

    - name: Create .env file with API URL
      copy:
        content: |
          NEXT_PUBLIC_API_BASE_URL={{ api_base_url }}
        dest: /home/ubuntu/frontend/.env
        owner: ubuntu
        group: ubuntu
        mode: '0644'

    - name: Create docker-compose.yml
      copy:
        content: |
          version: "3.8"
          
          services:
            frontend:
              build:
                context: .
                dockerfile: Dockerfile
              container_name: coinxcel-frontend
              ports:
                - "3000:3000"
              environment:
                - NEXT_PUBLIC_API_BASE_URL={{ api_base_url }}
                - NODE_ENV=production
              restart: always
        dest: /home/ubuntu/frontend/docker-compose.yml
        owner: ubuntu
        group: ubuntu
        mode: '0644'

    - name: Login to Docker Hub
      shell: echo {{ docker_hub_password }} | docker login -u {{ docker_hub_user }} --password-stdin
      become: yes
      become_user: ubuntu
      no_log: true

    - name: Stop existing containers
      shell: cd /home/ubuntu/frontend && docker-compose down --remove-orphans || true
      become: yes
      become_user: ubuntu
      ignore_errors: yes

    - name: Build Docker image
      shell: cd /home/ubuntu/frontend && docker-compose build
      become: yes
      become_user: ubuntu
      register: build_result

    - name: Display build result
      debug:
        var: build_result.stdout_lines

    - name: Tag Docker image
      shell: cd /home/ubuntu/frontend && docker tag frontend_frontend {{ docker_hub_user }}/coinxcel-frontend:latest
      become: yes
      become_user: ubuntu
      ignore_errors: yes

    - name: Push Docker image to Docker Hub
      shell: docker push {{ docker_hub_user }}/coinxcel-frontend:latest
      become: yes
      become_user: ubuntu
      register: push_result
      ignore_errors: yes

    - name: Display push result
      debug:
        var: push_result.stdout_lines
      ignore_errors: yes

    - name: Start frontend container
      shell: cd /home/ubuntu/frontend && docker-compose up -d
      become: yes
      become_user: ubuntu
      register: frontend_start

    - name: Display frontend start result
      debug:
        var: frontend_start.stdout_lines

    - name: Wait for application to start
      pause:
        seconds: 20

    - name: Check container status
      shell: docker ps -a
      become: yes
      become_user: ubuntu
      register: container_status

    - name: Display container status
      debug:
        var: container_status.stdout_lines

    - name: Install Nginx if not already installed
      apt:
        name: nginx
        state: present
        update_cache: yes
      
    - name: Create Nginx directories if not exist
      file:
        path: "{{ item }}"
        state: directory
        owner: root
        group: root
        mode: '0755'
      with_items:
        - /etc/nginx/sites-available
        - /etc/nginx/sites-enabled
        
    - name: Setup Nginx as reverse proxy
      copy:
        content: |
          server {
              listen 80;
              server_name _;
              
              location / {
                  proxy_pass http://localhost:3000;
                  proxy_http_version 1.1;
                  proxy_set_header Upgrade $http_upgrade;
                  proxy_set_header Connection 'upgrade';
                  proxy_set_header Host $host;
                  proxy_cache_bypass $http_upgrade;
                  proxy_read_timeout 300;
                  proxy_connect_timeout 300;
                  proxy_send_timeout 300;
              }
              
              # Explicitly handle static files
              location /_next/static/ {
                  proxy_pass http://localhost:3000/_next/static/;
                  proxy_cache_bypass $http_upgrade;
                  expires 365d;
                  add_header Cache-Control "public, max-age=31536000, immutable";
              }
              
              # Handle other Next.js assets
              location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                  proxy_pass http://localhost:3000;
                  expires 365d;
                  add_header Cache-Control "public, max-age=31536000, immutable";
              }
          }
        dest: /etc/nginx/sites-available/coinxcel-frontend
        owner: root
        group: root
        mode: '0644'

    - name: Enable Nginx site
      file:
        src: /etc/nginx/sites-available/coinxcel-frontend
        dest: /etc/nginx/sites-enabled/coinxcel-frontend
        state: link
      ignore_errors: yes

    - name: Disable default Nginx site
      file:
        path: /etc/nginx/sites-enabled/default
        state: absent
      ignore_errors: yes

    - name: Create Nginx base configuration if it doesn't exist
      copy:
        content: |
          user www-data;
          worker_processes auto;
          pid /run/nginx.pid;
          include /etc/nginx/modules-enabled/*.conf;
          
          events {
              worker_connections 768;
          }
          
          http {
              sendfile on;
              tcp_nopush on;
              tcp_nodelay on;
              keepalive_timeout 65;
              types_hash_max_size 2048;
              client_max_body_size 20M;
              
              include /etc/nginx/mime.types;
              default_type application/octet-stream;
              
              ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
              ssl_prefer_server_ciphers on;
              
              access_log /var/log/nginx/access.log;
              error_log /var/log/nginx/error.log;
              
              include /etc/nginx/conf.d/*.conf;
              include /etc/nginx/sites-enabled/*;
          }
        dest: /etc/nginx/nginx.conf
        mode: '0644'
        owner: root
        group: root
        force: no

    - name: Restart Nginx with service directly
      command: systemctl daemon-reload
      
    - name: Restart Nginx
      systemd:
        name: nginx
        state: restarted
        enabled: yes
      ignore_errors: yes
'''
            }
        }
        
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
                      key_name      = "jenkins-key"
                      
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
                    
                    // Initialize terraform with fixed plugin caching approach
                    sh '''
                        # Ensure plugin cache directory exists with correct permissions
                        mkdir -p $TF_PLUGIN_CACHE_DIR
                        chmod 755 $TF_PLUGIN_CACHE_DIR
                        
                        # Check for existing provider directory
                        AWS_PROVIDER_DIR="$TF_PLUGIN_CACHE_DIR/registry.terraform.io/hashicorp/aws/5.93.0/linux_amd64"
                        if [ -d "$AWS_PROVIDER_DIR" ]; then
                            echo "AWS provider directory exists. Checking if it needs to be cleaned..."
                            if [ ! -f "$AWS_PROVIDER_DIR/terraform-provider-aws_v5.93.0" ]; then
                                echo "AWS provider directory exists but may be incomplete. Removing it..."
                                rm -rf "$AWS_PROVIDER_DIR"
                            fi
                        fi
                        
                        # Set environment variable for plugin caching instead of command-line flag
                        export TF_PLUGIN_CACHE_DIR="$TF_PLUGIN_CACHE_DIR"
                        cd terraform && terraform init -input=false -lock=false || {
                            echo "First attempt failed, trying again without caching..."
                            unset TF_PLUGIN_CACHE_DIR
                            terraform init -input=false -lock=false
                        }
                    '''
                    
                    script {
                        // First check for existing security group
                        def existingSecurityGroupId = sh(
                            script: '''
                                aws ec2 describe-security-groups \
                                --region ${AWS_DEFAULT_REGION} \
                                --filters "Name=group-name,Values=coinxcel-frontend-sg" \
                                --query "SecurityGroups[0].GroupId" \
                                --output text
                            ''',
                            returnStdout: true
                        ).trim()
                        
                        // If security group exists but not in state, import it
                        if (existingSecurityGroupId != 'None' && existingSecurityGroupId != '') {
                            echo "Found existing security group: ${existingSecurityGroupId}"
                            def sgInState = sh(
                                script: '''
                                    cd terraform && terraform state list | grep aws_security_group.frontend_sg || echo "not_found"
                                ''',
                                returnStdout: true
                            ).trim()
                            
                            if (sgInState == "not_found") {
                                echo "Importing existing security group into Terraform state..."
                                sh "cd terraform && terraform import aws_security_group.frontend_sg ${existingSecurityGroupId} || echo 'Security group import failed but continuing'"
                            } else {
                                echo "Security group already in Terraform state"
                            }
                        }
                        
                        // Now check for existing EC2 instance
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
                        
                        if (existingInstanceId != '') {
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
                        } else {
                            echo "No existing frontend instance found. New instance will be created."
                        }
                        
                        // Apply changes to ensure the infrastructure is up to date
                        sh "cd terraform && terraform apply -auto-approve"
                        
                        // Get the EC2 public IP with error handling
                        try {
                            env.EC2_PUBLIC_IP = sh(
                                script: 'cd terraform && terraform output -raw frontend_public_ip',
                                returnStdout: true
                            ).trim()
                            
                            if (env.EC2_PUBLIC_IP == '') {
                                error "Failed to get EC2 public IP address"
                            }
                            
                            echo "Frontend EC2 Public IP: ${env.EC2_PUBLIC_IP}"
                            
                            // Update Ansible hosts file with the EC2 IP
                            sh """
                                # Create hosts file directly with the correct IP
                                cat > ansible/hosts << EOF
[frontend_servers]
frontend ansible_host=${env.EC2_PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=/tmp/ec2_key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10'

[frontend_servers:vars]
ansible_python_interpreter=/usr/bin/python3
EOF
                                # Verify the hosts file content
                                cat ansible/hosts
                            """
                        } catch (Exception e) {
                            error "Failed to get or process EC2 public IP: ${e.message}"
                        }
                    }
                }
            }
        }
        
        stage('Test SSH Connection') {
            steps {
                sshagent([env.SSH_KEY_CREDENTIALS]) {
                    sh """
                        # Copy SSH key to a temporary location
                        mkdir -p /tmp
                        ssh-keygen -f "/var/lib/jenkins/.ssh/known_hosts" -R "${env.EC2_PUBLIC_IP}" || true
                        
                        # Test SSH connection with timeout and verbose output
                        echo "Testing SSH connection to ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP}..."
                        timeout 30 ssh -v -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP} 'echo SSH connection successful'
                    """
                }
            }
        }
        
        stage('Deploy with Ansible') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: env.SSH_KEY_CREDENTIALS, keyFileVariable: 'SSH_KEY'),
                    usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        # Copy SSH key to temporary location for Ansible
                        cp $SSH_KEY /tmp/ec2_key.pem
                        chmod 600 /tmp/ec2_key.pem
                        
                        # Set Ansible environment variables for better performance
                        export ANSIBLE_TIMEOUT=30
                        export ANSIBLE_SSH_ARGS='-o ConnectTimeout=10'
                        
                        # Install Docker on the EC2 instance
                        ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i ansible/hosts ansible/install-docker.yml -v
                        
                        # Deploy the application with Docker
                        ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i ansible/hosts ansible/deploy-frontend.yml -v \
                            -e "DOCKER_USERNAME=$DOCKER_USERNAME" \
                            -e "DOCKER_PASSWORD=$DOCKER_PASSWORD" \
                            -e "API_BASE_URL=$API_BASE_URL"
                            
                        # Clean up temporary file
                        rm -f /tmp/ec2_key.pem
                    '''
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
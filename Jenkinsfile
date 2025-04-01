pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS' // Make sure you have NodeJS configured in Jenkins
    }
    
    environment {
        DOCKER_HUB_USER = 'munsifahamed' // DockerHub username
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials') // DockerHub credentials 
        AWS_CREDENTIALS = credentials('aws-credentials') // AWS credentials for EC2
        COINXCEL_FRONTEND_REPO = 'https://github.com/munsif-dev/CoinXcel-frontend.git' // GitHub repository URL
        SSH_KEY_CREDENTIALS = 'aws-ssh-key' // Jenkins credential ID for SSH key
        API_BASE_URL = 'http://54.90.69.239:8080' // Backend API URL - update with your backend EC2 IP
        TERRAFORM_VERSION = '1.5.7' // Specify Terraform version
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout code from GitHub
                git branch: 'main', url: "${env.COINXCEL_FRONTEND_REPO}"
                
                // Create directories for Terraform and Ansible
                sh 'mkdir -p terraform ansible'
                
                // Create Terraform files
                writeFile file: 'terraform/main.tf', text: '''
provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "frontend_sg" {
  name        = "frontend-sg"
  description = "Security group for frontend EC2 instance"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For SSH access - in production, restrict this to your IP
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For Next.js application
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For HTTP
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For HTTPS
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "frontend-sg"
    Application = "CoinXcel-Frontend"
  }
}

resource "aws_instance" "frontend" {
  ami                    = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS
  instance_type          = "t2.micro"
  key_name               = "coinxcel-key" # Make sure this key exists in your AWS account
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  tags = {
    Name = "coinxcel-frontend"
    Application = "CoinXcel-Frontend"
  }

  root_block_device {
    volume_size = 10 # 10 GB root volume
    volume_type = "gp2"
  }
}

output "frontend_instance_id" {
  value = aws_instance.frontend.id
}

output "frontend_public_ip" {
  value = aws_instance.frontend.public_ip
}

output "frontend_public_dns" {
  value = aws_instance.frontend.public_dns
}
'''
                
                // Create Ansible playbook
                writeFile file: 'ansible/deploy.yml', text: '''
---
- name: Install Docker and Deploy Next.js Frontend
  hosts: frontend_servers
  become: yes
  gather_facts: yes
  vars:
    docker_hub_user: "{{ lookup('env', 'DOCKER_USERNAME') }}"
    docker_hub_password: "{{ lookup('env', 'DOCKER_PASSWORD') }}"
    api_base_url: "{{ lookup('env', 'API_BASE_URL') }}"
  tasks:
    # Update system packages
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    # Install required packages
    - name: Install required packages
      apt:
        name:
          - ca-certificates
          - curl
          - gnupg
          - lsb-release
          - apt-transport-https
          - python3-docker
        state: present

    # Docker installation
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

    - name: Set up the repository
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

    - name: Install Docker Compose standalone
      get_url:
        url: https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-linux-x86_64
        dest: /usr/local/bin/docker-compose
        mode: '0755'
      register: compose_download
      
    - name: Create symbolic link for Docker Compose
      file:
        src: /usr/local/bin/docker-compose
        dest: /usr/bin/docker-compose
        state: link
      when: compose_download.changed

    - name: Create docker group
      group:
        name: docker
        state: present

    - name: Add ubuntu user to docker group
      user:
        name: ubuntu
        groups: docker
        append: yes

    - name: Start and enable Docker service
      service:
        name: docker
        state: started
        enabled: yes
        
    # Create application directory
    - name: Create frontend app directory
      file:
        path: /home/ubuntu/coinxcel-frontend
        state: directory
        owner: ubuntu
        group: ubuntu
        mode: '0755'

    # Copy application files
    - name: Copy Next.js application files
      synchronize:
        src: ../
        dest: /home/ubuntu/coinxcel-frontend
        delete: yes
        rsync_opts:
          - "--exclude=.git"
          - "--exclude=node_modules"
          - "--exclude=.next"
        
    # Create environment file for Next.js
    - name: Create .env.local file
      copy:
        content: |
          NEXT_PUBLIC_API_BASE_URL={{ api_base_url }}
        dest: /home/ubuntu/coinxcel-frontend/.env.local
        owner: ubuntu
        group: ubuntu
        mode: '0644'

    # Create Docker Compose file
    - name: Create Docker Compose file
      copy:
        content: |
          version: "3.8"

          services:
            nextjs:
              build:
                context: .
                dockerfile: Dockerfile
              container_name: coinxcel-frontend
              ports:
                - "3000:3000"
              environment:
                - NEXT_PUBLIC_API_BASE_URL={{ api_base_url }}
              restart: always
              networks:
                - frontend-network

          networks:
            frontend-network:
              driver: bridge
        dest: /home/ubuntu/coinxcel-frontend/docker-compose.yml
        owner: ubuntu
        group: ubuntu
        mode: '0644'

    # Stop existing containers (if any)
    - name: Stop existing containers
      shell: cd /home/ubuntu/coinxcel-frontend && docker-compose down --remove-orphans || true
      become: yes
      become_user: ubuntu
      ignore_errors: yes
      
    # Clean up Docker resources if needed
    - name: Prune Docker resources if needed
      shell: docker system prune -f
      become: yes
      become_user: ubuntu
      ignore_errors: yes

    # Build and start the application
    - name: Build and start Next.js application
      shell: cd /home/ubuntu/coinxcel-frontend && docker-compose up -d --build
      become: yes
      become_user: ubuntu
      register: build_result
      
    - name: Display build result
      debug:
        var: build_result.stdout_lines
        
    # Wait for the application to start
    - name: Wait for application to start
      pause:
        seconds: 30
        
    # Verify the application is running
    - name: Check container status
      shell: docker ps -a
      become: yes
      become_user: ubuntu
      register: container_status
      
    - name: Display container status
      debug:
        var: container_status.stdout_lines
        
    # Check application logs
    - name: Check application logs
      shell: docker logs coinxcel-frontend
      become: yes
      become_user: ubuntu
      register: app_logs
      ignore_errors: yes
      
    - name: Display application logs
      debug:
        var: app_logs.stdout_lines

    # Set up Nginx as a reverse proxy
    - name: Install Nginx
      apt:
        name: nginx
        state: present
        
    - name: Configure Nginx as reverse proxy
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
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;
              }
          }
        dest: /etc/nginx/sites-available/default
        owner: root
        group: root
        mode: '0644'
      notify: restart nginx
        
  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
'''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                // Add your test steps here
                sh 'echo "Running tests..."'
                // sh 'npm test'
            }
        }
        
        stage('Install Terraform') {
            steps {
                sh """
                    curl -O https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
                    unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip
                    mv terraform /usr/local/bin/
                    terraform --version
                """
            }
        }
        
        stage('Provision Infrastructure with Terraform') {
            steps {
                // Configure AWS credentials for Terraform
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    // Initialize Terraform
                    sh 'cd terraform && terraform init'
                    
                    // Validate Terraform configuration
                    sh 'cd terraform && terraform validate'
                    
                    // Plan Terraform changes
                    sh 'cd terraform && terraform plan -out=tfplan'
                    
                    // Apply Terraform changes to create EC2 instance
                    sh 'cd terraform && terraform apply -auto-approve tfplan'
                    
                    // Capture the EC2 public IP
                    script {
                        env.EC2_PUBLIC_IP = sh(
                            script: 'cd terraform && terraform output -raw frontend_public_ip',
                            returnStdout: true
                        ).trim()
                    }
                    
                    echo "Frontend EC2 Public IP: ${env.EC2_PUBLIC_IP}"
                }
            }
        }
        
        stage('Create Ansible Inventory') {
            steps {
                // Create Ansible inventory file using the Terraform output
                sh """
                    cat > ansible/hosts << EOF
[frontend_servers]
${env.EC2_PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=/tmp/ec2_key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o IdentitiesOnly=yes'

[frontend_servers:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_become=yes
ansible_become_method=sudo
EOF
                """
                
                // Display the inventory file
                sh 'cat ansible/hosts'
            }
        }
        
        stage('Wait for EC2 Instance') {
            steps {
                // Wait for the EC2 instance to be fully initialized
                sh 'sleep 60'
            }
        }
        
        stage('Deploy to EC2 with Ansible') {
            steps {
                script {
                    // Copy SSH key to a temporary location
                    withCredentials([sshUserPrivateKey(credentialsId: env.SSH_KEY_CREDENTIALS, keyFileVariable: 'SSH_KEY')]) {
                        sh 'mkdir -p /tmp'
                        sh 'cp $SSH_KEY /tmp/ec2_key.pem'
                        sh 'chmod 600 /tmp/ec2_key.pem'
                        
                        // Test SSH connectivity to EC2 instance
                        sh """
                            echo "Testing SSH connectivity to ${env.EC2_PUBLIC_IP}..."
                            ssh -i /tmp/ec2_key.pem -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ubuntu@${env.EC2_PUBLIC_IP} 'echo "SSH connection successful"'
                        """
                        
                        // Use Ansible to deploy the Next.js application
                        withEnv([
                            "DOCKER_USERNAME=${DOCKER_HUB_USER}",
                            "DOCKER_PASSWORD=${DOCKER_HUB_CREDS_PSW}",
                            "API_BASE_URL=${API_BASE_URL}"
                        ]) {
                            sh 'ANSIBLE_DEBUG=1 ansible-playbook -i ansible/hosts ansible/deploy.yml -v'
                        }
                        
                        // Remove SSH key after deployment
                        sh 'rm -f /tmp/ec2_key.pem'
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                script {
                    // Verify that the application is running by checking the website
                    sh """
                        echo "Verifying deployment at http://${env.EC2_PUBLIC_IP}"
                        curl -s -o /dev/null -w "%{http_code}" http://${env.EC2_PUBLIC_IP}
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "Frontend deployment completed successfully!"
            echo "Application is accessible at http://${env.EC2_PUBLIC_IP}"
        }
        failure {
            echo 'There was a failure during the frontend deployment process.'
        }
        always {
            // Clean workspace
            cleanWs()
        }
    }
}
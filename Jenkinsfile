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
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout the frontend repository
                git branch: 'main', url: "${env.COINXCEL_FRONTEND_REPO}"
                
                // Create necessary directories
                sh 'mkdir -p terraform ansible'
                sh 'mkdir -p $TF_PLUGIN_CACHE_DIR'
                
                // List directory content to debug
                sh 'ls -la'
                
                // Create Ansible playbooks and Dockerfile
                writeFile file: 'Dockerfile', text: '''
FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
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

    - name: Check if files exist before copying
      stat:
        path: "{{ item }}"
      register: file_stats
      delegate_to: localhost
      with_items:
        - ../package.json
        - ../package-lock.json
        - ../next.config.js
        - ../next.config.ts
        - ../tsconfig.json
        - ../tailwind.config.ts
        - ../tailwind.config.js
      
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
        - ../styles
        - ../lib
        - ../src
        - ../pages
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
        
    - name: Create minimal next.config.js if it doesn't exist
      copy:
        content: |
          const nextConfig = {
            output: "standalone",
            reactStrictMode: true,
          };
          
          export default nextConfig;
        dest: /home/ubuntu/frontend/next.config.js
        owner: ubuntu
        group: ubuntu
        mode: '0644'
        force: no

    - name: Create docker-compose.yml
      copy:
        content: |
          version: "3.8"
          
          services:
            frontend:
              image: {{ docker_hub_user }}/coinxcel-frontend:latest
              container_name: coinxcel-frontend
              ports:
                - "3000:3000"
              environment:
                - NEXT_PUBLIC_API_BASE_URL={{ api_base_url }}
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
      shell: cd /home/ubuntu/frontend && docker build -t {{ docker_hub_user }}/coinxcel-frontend:latest .
      become: yes
      become_user: ubuntu
      register: build_result

    - name: Display build result
      debug:
        var: build_result.stdout_lines

    - name: Push Docker image to Docker Hub
      shell: docker push {{ docker_hub_user }}/coinxcel-frontend:latest
      become: yes
      become_user: ubuntu
      register: push_result

    - name: Display push result
      debug:
        var: push_result.stdout_lines

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

    - name: Make sure Nginx service directory exists
      file:
        path: /lib/systemd/system
        state: directory
        mode: '0755'
      
    - name: Create Nginx systemd service if it doesn't exist
      copy:
        dest: /lib/systemd/system/nginx.service
        mode: '0644'
        owner: root
        group: root
        content: |
          [Unit]
          Description=A high performance web server and a reverse proxy server
          Documentation=man:nginx(8)
          After=network.target
          
          [Service]
          Type=forking
          PIDFile=/run/nginx.pid
          ExecStartPre=/usr/sbin/nginx -t -q -g 'daemon on; master_process on;'
          ExecStart=/usr/sbin/nginx -g 'daemon on; master_process on;'
          ExecReload=/usr/sbin/nginx -g 'daemon on; master_process on;' -s reload
          ExecStop=-/sbin/start-stop-daemon --quiet --stop --retry QUIT/5 --pidfile /run/nginx.pid
          TimeoutStopSec=5
          KillMode=mixed
          
          [Install]
          WantedBy=multi-user.target
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
                        
                        // Update Ansible hosts file with the EC2 IP - using a different approach
                        sh """
                            # Create hosts file directly with the correct IP
                            cat > ansible/hosts << EOF
[frontend_servers]
frontend ansible_host=${env.EC2_PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=/tmp/ec2_key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'

[frontend_servers:vars]
ansible_python_interpreter=/usr/bin/python3
EOF
                            # Verify the hosts file content
                            cat ansible/hosts
                        """
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
                        
                        # Test SSH connection with verbose output
                        echo "Testing SSH connection to ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP}..."
                        ssh -v -o StrictHostKeyChecking=no ${env.EC2_USERNAME}@${env.EC2_PUBLIC_IP} 'echo SSH connection successful'
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
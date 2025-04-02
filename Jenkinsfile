pipeline {
    agent any
    
    tools {
        maven 'M3'
        jdk 'JDK'
    }
    
    environment {
        DOCKER_HUB_USER = 'munsifahamed' // DockerHub username
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials') // DockerHub credentials 
        AWS_CREDENTIALS = credentials('aws-credentials') // AWS credentials for EC2
        COINXCEL_FRONTEND_REPO = 'https://github.com/munsif-dev/CoinXcelClient.git' // GitHub repository URL
        SSH_KEY_CREDENTIALS = 'aws-ssh-key' // Jenkins credential ID for SSH key
        API_BASE_URL = 'http://44.212.40.132:8080' // Backend API URL - using your backend EC2 IP
        TERRAFORM_STATE_KEY = 'coinxcel-frontend-terraform.tfstate' // S3 key for storing terraform state
        NODE_VERSION = '18' // Updated to use Node.js 18 instead of 16
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout code from GitHub
                git branch: 'main', url: "${env.COINXCEL_FRONTEND_REPO}"
                
                // Create directories for Terraform and Ansible
                sh 'mkdir -p terraform ansible'
                
                // Create Terraform configuration
                // (same as before - omitting for brevity)
                
                // Create Ansible playbooks
                // (same as before - omitting for brevity)
            }
        }
        
        stage('Install Dependencies') {
            steps {
                // Install Node.js 18 and npm
                sh '''
                    # Remove any existing Node.js installation
                    sudo apt-get remove -y nodejs npm || true
                    
                    # Install Node.js 18
                    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    
                    # Verify Node.js version
                    node -v
                    npm -v
                    
                    # Install dependencies
                    npm install
                '''
            }
        }
        
        stage('Fix Tailwind Config') {
            steps {
                // Fix the tailwind.config.ts file
                sh '''
                    # Check if tailwind.config.ts exists
                    if [ -f tailwind.config.ts ]; then
                        # Create a backup
                        cp tailwind.config.ts tailwind.config.ts.bak
                        
                        # Fix the fontFamily configuration using sed
                        sed -i 's/fontFamily: {/theme: { extend: { fontFamily: {/g' tailwind.config.ts
                        sed -i 's/poppins: \\["Poppins", "sans-serif"\\]/poppins: "Poppins, sans-serif"/g' tailwind.config.ts
                        sed -i 's/bubbler: \\["Bubbler One", "sans-serif"\\]/bubbler: "Bubbler One, sans-serif"/g' tailwind.config.ts
                        sed -i 's/biryani: \\["Biryani", "sans-serif"\\]/biryani: "Biryani, sans-serif"/g' tailwind.config.ts
                        sed -i 's/pacifico: \\["Pacifico", "cursive"\\]/pacifico: "Pacifico, cursive"/g' tailwind.config.ts
                        sed -i 's/sans: \\["Poppins"\\]/sans: "Poppins"/g' tailwind.config.ts
                        
                        # Close the theme and extend objects
                        sed -i 's/},/}}},/g' tailwind.config.ts
                        
                        echo "Updated tailwind.config.ts:"
                        cat tailwind.config.ts
                    else
                        echo "tailwind.config.ts not found"
                    fi
                '''
                
                // Alternative approach: completely replace the tailwind.config.ts file
                writeFile file: 'tailwind.config.ts', text: '''
                import type { Config } from "tailwindcss";

                export default {
                  darkMode: ["class"],
                  content: [
                    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
                    "./components/**/*.{js,ts,jsx,tsx,mdx}",
                    "./app/**/*.{js,ts,jsx,tsx,mdx}",
                  ],
                  theme: {
                    extend: {
                      colors: {
                        "custom-green": "#4a7c4f", // Main green color
                        "light-2": "#6abf70", // Light green 2
                        "light-1": "#a8e0a1", // Light green 1
                        "light-3": "#c2e5c5", // Light green 3
                        "dark-1": "#2e4d2f", // Dark green 1
                        "dark-2": "#1c3c1e",
                        background: "hsl(var(--background))",
                        foreground: "hsl(var(--foreground))",
                        card: {
                          DEFAULT: "hsl(var(--card))",
                          foreground: "hsl(var(--card-foreground))",
                        },
                        popover: {
                          DEFAULT: "hsl(var(--popover))",
                          foreground: "hsl(var(--popover-foreground))",
                        },
                        primary: {
                          DEFAULT: "hsl(var(--primary))",
                          foreground: "hsl(var(--primary-foreground))",
                        },
                        secondary: {
                          DEFAULT: "hsl(var(--secondary))",
                          foreground: "hsl(var(--secondary-foreground))",
                        },
                        muted: {
                          DEFAULT: "hsl(var(--muted))",
                          foreground: "hsl(var(--muted-foreground))",
                        },
                        accent: {
                          DEFAULT: "hsl(var(--accent))",
                          foreground: "hsl(var(--accent-foreground))",
                        },
                        destructive: {
                          DEFAULT: "hsl(var(--destructive))",
                          foreground: "hsl(var(--destructive-foreground))",
                        },
                        border: "hsl(var(--border))",
                        input: "hsl(var(--input))",
                        ring: "hsl(var(--ring))",
                        chart: {
                          "1": "hsl(var(--chart-1))",
                          "2": "hsl(var(--chart-2))",
                          "3": "hsl(var(--chart-3))",
                          "4": "hsl(var(--chart-4))",
                          "5": "hsl(var(--chart-5))",
                        },
                      },
                      fontFamily: {
                        poppins: "Poppins, sans-serif",
                        bubbler: "Bubbler One, sans-serif",
                        biryani: "Biryani, sans-serif",
                        pacifico: "Pacifico, cursive",
                        sans: "Poppins, sans-serif",
                      },
                      borderRadius: {
                        lg: "var(--radius)",
                        md: "calc(var(--radius) - 2px)",
                        sm: "calc(var(--radius) - 4px)",
                      },
                    },
                  },
                  plugins: [require("tailwindcss-animate")],
                } satisfies Config;
                '''
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Install Terraform') {
            steps {
                sh '''
                    if ! command -v terraform &> /dev/null; then
                        curl -fsSL https://releases.hashicorp.com/terraform/1.5.7/terraform_1.5.7_linux_amd64.zip -o terraform.zip
                        unzip terraform.zip
                        sudo mv terraform /usr/local/bin/
                        rm terraform.zip
                    fi
                    terraform --version
                '''
            }
        }
        
        stage('Provision Infrastructure') {
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
                    
                    // Check if we already have a frontend instance
                    script {
                        def existingInstanceId = sh(
                            script: '''
                                aws ec2 describe-instances \
                                --filters "Name=tag:Name,Values=coinxcel-frontend" "Name=instance-state-name,Values=running" \
                                --query "Reservations[].Instances[].InstanceId" \
                                --output text
                            ''',
                            returnStdout: true
                        ).trim()
                        
                        // If we don't have an instance, create one
                        if (existingInstanceId == '') {
                            echo "No existing frontend instance found. Creating a new one..."
                            sh 'cd terraform && terraform apply -auto-approve'
                        } else {
                            echo "Found existing frontend instance: ${existingInstanceId}"
                            // Import the existing instance into Terraform state
                            sh "cd terraform && terraform import aws_instance.frontend ${existingInstanceId}"
                        }
                        
                        // Get the public IP of the instance using AWS CLI rather than Terraform output
                        sh '''
                            EC2_PUBLIC_IP=$(aws ec2 describe-instances \
                                --filters "Name=tag:Name,Values=coinxcel-frontend" "Name=instance-state-name,Values=running" \
                                --query "Reservations[].Instances[].PublicIpAddress" \
                                --output text)
                            echo "EC2_PUBLIC_IP=${EC2_PUBLIC_IP}" > ec2.properties
                        '''
                        
                        // Load the properties file to make the EC2_PUBLIC_IP available
                        def props = readProperties file: 'ec2.properties'
                        env.EC2_PUBLIC_IP = props.EC2_PUBLIC_IP
                        
                        echo "Frontend EC2 Public IP: ${env.EC2_PUBLIC_IP}"
                    }
                }
            }
        }
        
        // Remaining stages remain the same...
    }
    
    post {
        success {
            echo 'Frontend deployment completed successfully!'
            sh 'echo "Application is accessible at: http://${EC2_PUBLIC_IP}"'
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
# 🚀 AgriSync - Microsoft Azure Deployment Guide
## Microsoft Imagine Cup 2026 Edition

### 🏆 **Why Azure for Imagine Cup?**
- ✅ **Azure for Students**: Free credits and services
- ✅ **Imagine Cup Benefits**: Additional Azure credits
- ✅ **Microsoft Integration**: Shows ecosystem adoption
- ✅ **Scalability**: Enterprise-grade infrastructure
- ✅ **AI Services**: Azure OpenAI, Cognitive Services
- ✅ **Global Reach**: Worldwide data centers

---

## 🎯 **Recommended Azure Architecture**

### **Option 1: Azure App Service (Recommended for Imagine Cup)**
- **Frontend**: Azure Static Web Apps (React)
- **Backend**: Azure App Service (Node.js)
- **Database**: Azure Database for PostgreSQL / Keep Supabase
- **Storage**: Azure Blob Storage (for images)
- **AI**: Azure OpenAI Service

### **Option 2: Azure Container Instances**
- **Full Stack**: Docker containers on Azure
- **Orchestration**: Azure Container Instances
- **Database**: Azure Cosmos DB

---

## 🚀 **OPTION 1: Azure App Service Deployment**

### Step 1: Get Azure for Students
1. **Visit**: https://azure.microsoft.com/en-us/free/students/
2. **Sign up** with your student email
3. **Get $100 credit** + free services for 12 months
4. **Apply for Imagine Cup** additional credits

### Step 2: Deploy Backend to Azure App Service

#### 2.1 Create App Service
```bash
# Install Azure CLI
# Windows: Download from https://aka.ms/installazurecliwindows

# Login to Azure
az login

# Create resource group
az group create --name agrisync-rg --location "East US"

# Create App Service plan
az appservice plan create --name agrisync-plan --resource-group agrisync-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group agrisync-rg --plan agrisync-plan --name agrisync-backend --runtime "NODE|18-lts"
```

#### 2.2 Configure Environment Variables
```bash
# Set environment variables
az webapp config appsettings set --resource-group agrisync-rg --name agrisync-backend --settings \
  PORT=8080 \
  JWT_SECRET=agrisync_jwt_secret_key_2024 \
  NODE_ENV=production \
  DB_PATH=./database/agrisync.db \
  OPENAI_API_KEY=your_openai_key \
  WEBSITE_NODE_DEFAULT_VERSION=18.17.0
```

#### 2.3 Deploy Backend Code
```bash
# From your project root
cd server
zip -r ../backend.zip .
az webapp deployment source config-zip --resource-group agrisync-rg --name agrisync-backend --src ../backend.zip
```

### Step 3: Deploy Frontend to Azure Static Web Apps

#### 3.1 Create Static Web App
```bash
# Create static web app
az staticwebapp create \
  --name agrisync-frontend \
  --resource-group agrisync-rg \
  --source https://github.com/yourusername/agrisync \
  --location "East US 2" \
  --branch main \
  --app-location "client" \
  --output-location "build"
```

#### 3.2 Configure Environment Variables
In Azure Portal → Static Web Apps → Configuration:
```
REACT_APP_API_URL=https://agrisync-backend.azurewebsites.net
REACT_APP_SUPABASE_URL=https://uqarhxopmffoyrcndccx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🚀 **OPTION 2: Enhanced Azure Services**

### Azure Database for PostgreSQL
```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group agrisync-rg \
  --name agrisync-db \
  --location "East US" \
  --admin-user agrisyncadmin \
  --admin-password YourSecurePassword123! \
  --sku-name B_Gen5_1
```

### Azure Blob Storage (for images)
```bash
# Create storage account
az storage account create \
  --name agrisyncstorage \
  --resource-group agrisync-rg \
  --location "East US" \
  --sku Standard_LRS

# Create container for images
az storage container create \
  --name images \
  --account-name agrisyncstorage \
  --public-access blob
```

### Azure OpenAI Service
```bash
# Create OpenAI service
az cognitiveservices account create \
  --name agrisync-openai \
  --resource-group agrisync-rg \
  --kind OpenAI \
  --sku S0 \
  --location "East US"
```

---

## 🛠️ **Configuration Files for Azure**

### Azure App Service Configuration
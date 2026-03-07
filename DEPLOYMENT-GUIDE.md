# Vercel Deployment Guide

## 🚀 Fixed Issues

### ✅ **Removed Ethers.js Dependency**
- **Problem**: Old `contracts.ts` file still imported ethers.js
- **Solution**: Deleted old file and using only `opnet-contracts.ts`

### ✅ **Fixed Module Resolution**
- **Problem**: Could not resolve "../lib/opnet-contracts" on Vercel
- **Solution**: Added TypeScript baseUrl and paths configuration

### ✅ **Added Vercel Configuration**
- **Root**: `vercel.json` with proper build commands
- **Frontend**: `frontend/vercel.json` with routing

### ✅ **Environment Variables**
- **Build**: All VITE_ variables properly configured
- **Runtime**: No runtime environment variables needed

## 📋 **Vercel Deployment Steps**

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Fix Vercel deployment issues"
git push origin main
```

### 2. **Connect Vercel to GitHub**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select `opnet-revenue-vault` repository

### 3. **Configure Build Settings**
- **Framework Preset**: Vite
- **Root Directory**: `frontend` (IMPORTANT!)
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `dist`

### 4. **Environment Variables**
Add these in Vercel dashboard:
```
VITE_OP_NET_RPC_URL=https://testnet.opnet.org
VITE_REVENUE_VAULT_ADDRESS=0x5b9588cfbc5b8e497d98fb9476f1769237f90618
VITE_UNDERLYING_SYMBOL=wBTC
VITE_UNDERLYING_DECIMALS=8
```

### 5. **Deploy**
- Vercel will automatically build and deploy
- Visit the provided URL to test

## 🔧 **Local Build Test**
```bash
cd frontend
npm ci
npm run build
# Should succeed without errors
```

## 🐛 **Common Issues & Solutions**

### **Issue**: "Cannot find module 'ethers'"
- **Solution**: Ethers.js removed from package.json

### **Issue**: "Could not resolve '../lib/opnet-contracts'"
- **Solution**: Added TypeScript baseUrl and paths

### **Issue**: "Due to `builds` existing in your configuration file, the Build and Development Settings will not apply"
- **Solution**: Removed deprecated `builds` array from vercel.json

## ✅ **Verification Checklist**
- [x] Frontend builds locally: `npm run build`
- [x] No ethers.js imports
- [x] Environment variables configured
- [x] Vercel.json exists in root
- [x] TypeScript paths configured
- [x] Git repository pushed
- [x] Module resolution fixed

## 🎯 **Latest Fixes Applied**
- **rootDirectory**: "frontend" in vercel.json
- **buildCommand**: "npm ci && npm run build" 
- **baseUrl & paths**: Added to tsconfig.json
- **Module resolution**: Fixed for Vercel build
- **Deprecated builds**: Removed from vercel.json (fixes warning)
- **Environment variables**: Added VITE_OPSCAN_BASE_URL

The deployment should now work correctly on Vercel without warnings! 🎉

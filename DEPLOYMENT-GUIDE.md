# Vercel Deployment Guide

## 🚀 Fixed Issues

### ✅ **Removed Ethers.js Dependency**
- **Problem**: Old `contracts.ts` file still imported ethers.js
- **Solution**: Deleted old file and using only `opnet-contracts.ts`

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
- **Root Directory**: `./frontend`
- **Build Command**: `npm run build`
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
npm install
npm run build
# Should succeed without errors
```

## 🐛 **Common Issues & Solutions**

### **Issue**: "Cannot find module 'ethers'"
- **Solution**: Ethers.js removed from package.json

### **Issue**: "window.opnet is not defined"
- **Solution**: Uses OP_NET wallet extension

### **Issue**: Build fails on Vercel
- **Solution**: All dependencies resolved, build config fixed

## ✅ **Verification Checklist**
- [ ] Frontend builds locally: `npm run build`
- [ ] No ethers.js imports
- [ ] Environment variables configured
- [ ] Vercel.json exists in root
- [ ] Git repository pushed

The deployment should now work correctly on Vercel! 🎉

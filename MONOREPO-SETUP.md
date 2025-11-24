# Portfolio Monorepo Setup Guide

This guide shows you how to integrate the postcard-map app into your main portfolio at `christinacook.me`.

## 📁 Recommended Monorepo Structure

```
christinacook-portfolio/
├── apps/
│   ├── portfolio/          # Main portfolio site (christinacook.me/)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── post-cards/         # Postcard app (christinacook.me/post-cards)
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── next.config.ts  # Has basePath: '/post-cards'
│
├── packages/               # Shared packages (optional)
│   └── ui/                 # Shared components
│
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # or turbo.json
└── README.md
```

## 🚀 Setup Options

### **Option 1: Simple Subdirectory Deploy (Easiest)**

Deploy each app separately and use Vercel's rewrites:

1. **Deploy main portfolio** to `christinacook.me`
2. **Deploy postcard-map** with basePath to a separate Vercel project
3. **Use rewrites** in main portfolio to route `/post-cards/*` to the postcard app

**Main portfolio `next.config.ts`:**
```typescript
{
  async rewrites() {
    return [
      {
        source: '/post-cards/:path*',
        destination: 'https://postcard-map.vercel.app/post-cards/:path*'
      }
    ]
  }
}
```

### **Option 2: Turborepo Monorepo (Professional)**

Use Turborepo to manage multiple apps in one repo:

```bash
# Create new monorepo
npx create-turbo@latest

# Structure:
christinacook-portfolio/
├── apps/
│   ├── web/           # Main portfolio
│   └── post-cards/    # This app
├── turbo.json
└── package.json
```

### **Option 3: Next.js Multi-Zones (Advanced)**

Use Next.js multi-zones to combine apps:
- Main app handles `/`
- Postcard app handles `/post-cards`

## 🔄 Migration Steps

### **Step 1: Create Main Portfolio Repo**

```bash
# Create new repo
mkdir christinacook-portfolio
cd christinacook-portfolio

# Initialize
git init
pnpm init
```

### **Step 2: Move Postcard App**

```bash
# Create apps directory
mkdir -p apps

# Move postcard-map into apps
mv /path/to/postcard-map apps/post-cards
```

### **Step 3: Create Root package.json**

```json
{
  "name": "christinacook-portfolio",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "dev:portfolio": "cd apps/portfolio && npm run dev",
    "dev:postcards": "cd apps/post-cards && npm run dev"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

### **Step 4: Configure Turborepo** (Optional)

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## 🌐 Vercel Deployment

### **Option A: Single Vercel Project (Monorepo)**

1. Connect your monorepo to Vercel
2. Create separate projects for each app:
   - `portfolio` → christinacook.me
   - `post-cards` → subdomain or path

3. Configure each project's root directory:
   - Portfolio: `apps/portfolio`
   - Postcards: `apps/post-cards`

### **Option B: Separate Vercel Projects**

1. Deploy portfolio to `christinacook.me`
2. Deploy postcards with basePath configured
3. Use rewrites in main app to route to postcards

## 🔧 Postcard App Configuration

The postcard app is already configured with:
- ✅ `basePath: '/post-cards'`
- ✅ `assetPrefix: '/post-cards'`

This means all routes will be:
- `/post-cards/` (home)
- `/post-cards/postcards/new`
- etc.

## 📝 Next Steps

1. **Create main portfolio** app/site
2. **Move postcard-map** into monorepo structure
3. **Set up build system** (Turborepo recommended)
4. **Configure Vercel** for monorepo deployment
5. **Update DNS** to point to Vercel

## 🔗 Useful Resources

- [Turborepo Guide](https://turbo.build/repo/docs)
- [Next.js Multi-Zones](https://nextjs.org/docs/app/building-your-application/deploying/multi-zones)
- [Vercel Monorepos](https://vercel.com/docs/monorepos)

---

Need help with any of these steps? Let me know! 🚀


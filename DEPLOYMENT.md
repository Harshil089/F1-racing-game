# 🚀 Deployment Guide - F1 Reflex Racing

## Quick Deploy to Vercel (Recommended)

### Method 1: Vercel CLI (Fastest)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Production deployment**:
```bash
vercel --prod
```

That's it! Your app will be live at `your-app.vercel.app`

### Method 2: GitHub + Vercel Dashboard

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure** (if needed):
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## Pre-Deployment Checklist

✅ **Build passes locally**:
```bash
npm run build
```

✅ **No TypeScript errors**:
```bash
npx tsc --noEmit
```

✅ **All dependencies installed**:
```bash
npm install
```

✅ **Environment is production-ready**:
- No console.logs in production code (keep only essential error logs)
- All API routes are functional
- CSV handler configured for `/tmp` directory

## Post-Deployment Testing

1. **Test Registration Flow**:
   - Visit your deployed URL
   - Fill out registration form
   - Verify navigation to game page

2. **Test Game Mechanics**:
   - Touch screen to trigger thumb gate
   - Start lights sequence works
   - Race mechanics function properly
   - Results screen displays correctly

3. **Test Mobile Devices**:
   - iOS Safari
   - Android Chrome
   - Verify touch events work
   - Check vibration feedback
   - Test audio playback

## Domain Configuration (Optional)

### Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

Example:
- `f1racing.yourdomain.com`
- `race.yourdomain.com`

## Performance Optimization Tips

### Enable Vercel Analytics (Optional)

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In your layout return:
<body>
  {children}
  <Analytics />
</body>
```

### Monitor Performance

- Check Vercel Analytics dashboard
- Monitor function execution times
- Track user engagement

## Troubleshooting Deployment Issues

### Build Fails

**Issue**: Build errors on Vercel
**Solution**:
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### CSV File Issues

**Issue**: CSV file not persisting
**Solution**:
- Data in `/tmp` is ephemeral on Vercel
- This is expected behavior for free tier
- For persistence, upgrade to Vercel KV or external database

### Audio Not Playing

**Issue**: Sounds don't work on mobile
**Solution**:
- Audio requires user interaction to initialize
- This is handled in thumb gate touch event
- Check browser console for Web Audio API errors

### Canvas Not Rendering

**Issue**: Black screen or no game canvas
**Solution**:
- Check browser console for errors
- Verify canvas dimensions are valid
- Test on different browsers

## Environment Variables (If Needed)

Currently, the app doesn't require environment variables. If you add external services:

1. In Vercel dashboard → Settings → Environment Variables
2. Add your variables:
   - `DATABASE_URL`
   - `API_KEY`
   - etc.

3. Redeploy for changes to take effect

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request
- **Development**: Branch deployments

## Monitoring & Logs

### View Deployment Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on specific deployment
5. View "Build Logs" and "Function Logs"

### Real-time Logs

```bash
vercel logs <deployment-url>
```

## Rollback (If Needed)

If a deployment breaks:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find working deployment
4. Click "⋯" → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Production Checklist

Before launching to users:

- [ ] Test on multiple devices
- [ ] Verify all features work
- [ ] Check analytics are tracking
- [ ] Set up custom domain (optional)
- [ ] Test with real users
- [ ] Monitor error logs
- [ ] Set up alerts for downtime

## Scaling Considerations

For high traffic:

1. **Upgrade Vercel Plan**: Pro or Enterprise for better limits
2. **Add CDN**: Vercel Edge Network is included
3. **Database**: Migrate from CSV to proper database
4. **Caching**: Implement Redis for session data
5. **Analytics**: Monitor performance metrics

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Deployment Issues](https://github.com/vercel/next.js/discussions)

---

**Ready to deploy?** Run `vercel` and go live in seconds! 🚀

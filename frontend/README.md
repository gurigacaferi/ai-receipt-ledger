# Receipt OCR Frontend

Next.js 14 frontend with TypeScript and Chart.js integration.

## Setup

### Local Development

1. **Install Node.js 18+**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API base URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to http://localhost:3000

### Docker Development

```bash
docker compose up --build
```

## Environment Variables

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## Features

### Upload Page (/)
- Drag & drop file upload
- Client-side image resizing (cost optimization)
- Real-time status updates
- Parsed JSON display

### Expenses Page (/expenses)
- Filterable expense table
- Date range and category filters
- CSV export functionality
- Total amount calculation

### Reports Page (/reports)
- Monthly spending trends chart
- Category breakdown
- Summary statistics
- Interactive Chart.js visualizations

## Architecture

### Components
- `Navigation`: Global navigation bar
- `Layout`: App-wide layout wrapper

### Utils
- `imageUtils`: Client-side image resizing for cost optimization

### Styling
- Tailwind CSS for utility-first styling
- Custom CSS for component-specific styles
- Responsive design with mobile-first approach

## Cost Optimization

### Image Resizing
Images are automatically resized on the client before upload:
- Maximum width: 1600px
- JPEG compression: 90%
- Maintains aspect ratio
- Reduces API costs significantly

### Caching
- Next.js automatic caching for static assets
- API responses cached where appropriate

## Production Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Docker
```bash
docker build -t receipt-frontend .
docker run -p 3000:3000 receipt-frontend
```

### Manual Build
```bash
npm run build
npm start
```

## Development

### Adding New Pages
1. Create page in `src/app/[route]/page.tsx`
2. Add navigation link in `Navigation.tsx`
3. Update routing as needed

### Styling Guidelines
- Use Tailwind CSS utilities first
- Add custom CSS in `globals.css` for complex components
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### API Integration
- All API calls use `NEXT_PUBLIC_API_BASE` environment variable
- Error handling with user-friendly messages
- Loading states for better UX

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## Performance

### Optimizations
- Next.js 14 App Router for optimal performance
- Client-side image resizing
- Lazy loading where appropriate
- Minimal bundle size

### Monitoring
- Use Next.js built-in analytics
- Monitor Core Web Vitals
- Track API response times

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

### Authentication
Ready for NextAuth.js integration:
```bash
npm install next-auth
```

### PWA Support
Add service worker and manifest:
```bash
npm install next-pwa
```

### Advanced Charts
Extend Chart.js with more visualization types:
- Pie charts for category distribution
- Line charts for trends
- Interactive filters

### Mobile App
React Native version using shared API:
- Expo for rapid development
- Camera integration for receipt capture
- Offline support with sync
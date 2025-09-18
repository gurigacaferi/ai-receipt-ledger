# Receipt OCR Expense Tracker

A modern web application that uses AI-powered OCR to automatically extract expense data from receipt images and provides comprehensive expense tracking and reporting.

## Features

### 🔍 Smart Receipt Scanning
- **AI-Powered OCR**: Upload receipt images and automatically extract vendor, date, amount, and itemized details
- **Multiple Formats**: Supports JPG, PNG, and other common image formats
- **Image Optimization**: Automatically resizes images to reduce processing time and costs
- **Real-time Status**: Live feedback during upload and processing

### 💰 Expense Management
- **Automatic Categorization**: Smart categorization based on vendor and description
  - Ushqim (Food & Groceries)
  - Transport (Taxi, Bus, Fuel)
  - Teknologji (Technology & Software)
  - Argëtim (Entertainment)
  - Tjetër (Other)
- **Advanced Filtering**: Filter by date range, category, vendor, or description
- **Export to CSV**: Download filtered expense data as CSV files
- **Detailed View**: View all expense details in a clean table format

### 📊 Analytics & Reports
- **Monthly Trends**: Bar charts showing spending trends over time
- **Category Breakdown**: Doughnut charts showing spending distribution
- **Key Metrics**: Total spending, monthly averages, and transaction counts
- **Visual Insights**: Color-coded categories and progress indicators

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router v6
- **State Management**: React Query for server state
- **Icons**: Lucide React
- **Build Tool**: Vite with SWC

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd receipt-ocr-expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Layout.tsx       # Main app layout with navigation
│   │   ├── UploadPage.tsx   # Receipt upload and OCR
│   │   ├── ExpensesPage.tsx # Expense management
│   │   └── ReportsPage.tsx  # Analytics and charts
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions and helpers
│   ├── assets/              # Static assets (images, etc.)
│   └── pages/               # Route pages
├── public/                  # Public static files
└── docs/                   # Documentation
```

## Usage Guide

### 1. Upload Receipts
- Navigate to the Upload page
- Drag & drop a receipt image or click to select
- Watch real-time status updates as the receipt is processed
- Review the extracted JSON data

### 2. Manage Expenses
- Go to "Shpenzimet" (Expenses) page
- Use filters to find specific expenses
- Export filtered data as CSV
- View detailed expense information

### 3. View Reports
- Visit "Raporte" (Reports) page
- Analyze spending trends with interactive charts
- Review category breakdowns and key metrics
- Track monthly spending patterns

## AI Integration

### Current Implementation (MVP)
- **Mock AI Processing**: Simulated OCR responses for development
- **Structured Output**: Standardized JSON format for parsed receipts
- **Category Mapping**: Rule-based automatic categorization

### Production Integration (Planned)
For production use, integrate with:

#### Option A: OpenAI Vision API
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'system',
        content: 'Parse receipt and return structured JSON...'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Parse this receipt' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ],
    response_format: { type: 'json_object' }
  })
});
```

#### Option B: OCR + LLM Pipeline
1. **OCR Processing**: Tesseract.js, Google Cloud Vision, or AWS Textract
2. **Text Normalization**: Clean and structure raw OCR output
3. **AI Enhancement**: Use LLM to extract structured data from text

## Database Schema (Supabase)

### Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  vendor TEXT,
  invoice_no TEXT,
  invoice_date DATE,
  currency TEXT,
  subtotal NUMERIC(12,2),
  tax NUMERIC(12,2),
  total NUMERIC(12,2),
  raw_json JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL,
  vendor TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

## Deployment

### Lovable Platform (Recommended)
1. Connect your project to Lovable
2. Enable Supabase integration for database
3. Add OpenAI API key in Supabase Edge Function secrets
4. Deploy with one click

### Self-Hosted Options
1. **Vercel/Netlify**: For frontend hosting
2. **Supabase**: For database and authentication
3. **Cloudflare R2/AWS S3**: For file storage

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (Supabase Edge Functions)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-vision-preview
STORAGE_BUCKET=receipts
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

### Phase 1 (Current)
- ✅ Core UI and navigation
- ✅ Mock data and charts
- ✅ Expense filtering and export
- ✅ Responsive design

### Phase 2 (In Progress)
- 🔄 Supabase integration
- 🔄 Real OCR processing
- 🔄 User authentication
- 🔄 File upload to cloud storage

### Phase 3 (Planned)
- 📋 Mobile app (React Native)
- 📋 Receipt templates and validation
- 📋 Advanced reporting and insights
- 📋 Multi-currency support
- 📋 Expense approval workflows

## Support

For support, please create an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using React, TypeScript, and modern web technologies.
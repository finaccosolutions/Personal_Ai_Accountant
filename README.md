# FinanceAI - Smart Accounting Management System

A comprehensive web-based accounting application powered by AI to help individuals and small business owners manage their financial transactions effortlessly.

## Features

### Core Functionality
- **Bank Account Management** - Add and manage multiple bank accounts
- **AI-Powered Transaction Extraction** - Upload bank statements (PDF, Excel, CSV, TXT) and let AI extract transactions automatically
- **Smart Transaction Categorization** - AI suggests appropriate ledgers and narrations based on transaction descriptions
- **Cash Transaction Recording** - Record cash transactions alongside bank transactions
- **Contact Management** - Track receivables and payables with contacts
- **Financial Reports & Analysis** - View detailed reports with AI-generated insights
- **Notification System** - Get reminders for debts and receivables
- **Dashboard Overview** - See your financial health at a glance

### AI-Powered Features (Gemini AI)
- Automatic transaction extraction from bank statements
- Intelligent ledger suggestions based on transaction patterns
- Auto-mapping of similar transactions using historical data
- Financial insights and recommendations
- Expense categorization and analysis

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

The database schema has been created with the migration. Make sure your Supabase project is connected.

The schema includes:
- User profiles with Gemini API key storage
- Bank accounts
- Ledgers (chart of accounts)
- Transactions with double-entry support
- Transaction mappings for AI learning
- Contacts with receivables/payables tracking
- Notifications system
- Shared transactions between users

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it in the app's Settings page

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## How to Use

### First-Time Setup

1. **Create an Account**
   - Sign up with your email and password
   - Your profile is automatically created

2. **Configure Gemini API**
   - Go to Settings
   - Follow the instructions to get your Gemini API key
   - Paste it in the Gemini API Key field
   - Save settings

3. **Add Your Bank Accounts**
   - Navigate to "Manage Banks"
   - Click "Add Bank"
   - Enter bank details (name, account number, type, initial balance)
   - Save

### Recording Transactions from Bank Statements

1. **Upload Statement**
   - Go to "Upload Statements"
   - Select the bank account
   - Upload your bank statement (PDF, Excel, CSV, or TXT)
   - Click "Extract Transactions with AI"

2. **Review Extracted Transactions**
   - AI will extract all transactions from the statement
   - Review the extracted data
   - Click "Save All Transactions" to add them to your account

3. **Categorize Transactions**
   - Go to "Transactions"
   - Click on any pending transaction
   - AI will automatically suggest:
     - Appropriate ledger category
     - Clear narration
     - Confidence score
   - Review and edit if needed
   - Click "Confirm & Save"

### Recording Cash Transactions

1. Go to "Transactions"
2. Click "Add Cash Transaction"
3. Enter transaction details
4. Select or create a ledger
5. Save

### Managing Contacts

1. Go to "Contacts"
2. Click "Add Contact"
3. Enter contact details (name, email, phone)
4. Track amounts receivable and payable

### Viewing Reports

1. Go to "Reports & Analysis"
2. Select time period (7 days, 30 days, 90 days, etc.)
3. View:
   - Total income and expenses
   - Net cash flow
   - Expense by category
   - Transaction summary
4. Click "Generate Insights" for AI-powered financial analysis

### Notifications

- Check "Notifications" for reminders about:
  - Pending receivables
  - Upcoming payables
  - Important alerts
- Mark notifications as read

## Key Features Explained

### AI Learning System

The app learns from your transaction categorization patterns:
- When you categorize a transaction, it creates a mapping
- Future similar transactions are automatically suggested
- Confidence scores improve over time
- Patterns are user-specific

### Double-Entry Bookkeeping

- Every transaction creates ledger entries
- Maintains accounting integrity
- Supports accurate financial reporting

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Encrypted API key storage
- Secure authentication with Supabase Auth

## Tips for Best Results

1. **Consistent Naming**: Use consistent names for ledgers to help AI learn patterns
2. **Clear Descriptions**: When editing narrations, use clear descriptions
3. **Regular Updates**: Upload statements regularly for accurate tracking
4. **Review AI Suggestions**: Always review AI suggestions before confirming
5. **Categorize Promptly**: Categorize transactions soon after upload for better cash flow visibility

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **Icons**: Lucide React

## Support & Customization

The application is designed to be flexible and can be customized for:
- Different currencies
- Multiple business types
- Custom ledger categories
- Additional report types
- Integration with other services

## Future Enhancements

Potential features for future development:
- Mobile app version
- Bulk transaction import from multiple banks
- Automated bank sync via APIs
- Invoice generation
- Tax reporting
- Multi-currency support with conversion
- Advanced analytics and forecasting
- Export to accounting software formats

---

Built with modern web technologies and AI to make accounting accessible to everyone.

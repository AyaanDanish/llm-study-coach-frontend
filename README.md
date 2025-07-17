# LLM Study Coach Frontend

A modern React/Next.js web application that provides an intelligent study platform with AI-powered features. Upload PDFs, generate study notes, create flashcards, take quizzes, and get instant answers to your questions using advanced language models.

---

## Features

### Study Material Management

- **PDF Upload & Processing**: Upload and extract text from PDF documents
- **Study Notes Generation**: AI-powered comprehensive study notes from your materials
- **Content Organization**: Organize materials by subject and track study progress

### AI-Powered Learning Tools

- **Smart Flashcards**: Generate flashcards automatically from study materials with difficulty levels
- **Interactive Quizzes**: Create multiple-choice quizzes with explanations and scoring
- **Q&A Sessions**: Ask questions about your study materials and get context-aware answers
- **Progress Tracking**: Monitor study time, completion rates, and performance metrics

### User Experience

- **Authentication**: Secure user registration and login with Supabase Auth
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable studying
- **Real-time Updates**: Live progress tracking and session management
- **Study Timer**: Built-in timer for focused study sessions

---

## Deployment:

The app has been deployed via Vercel and is available [here](https://llm-study-coach.vercel.app/).

---

## Technologies Used

### Core Framework

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript for type safety and better development experience
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

### UI Components & Libraries

- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives for accessible components
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth interactions

### Backend Integration

- **Authentication**: [Supabase Auth](https://supabase.com/auth) for user management
- **Database**: Supabase PostgreSQL for data persistence
- **API Integration**: Custom backend API for LLM operations
- **File Upload**: Multipart form data handling for PDF uploads

### Development Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Deployment**: Vercel for seamless CI/CD

---

## Getting Started

Follow these steps to download and run the project locally:

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

---

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/llm-study-coach-frontend.git
   cd llm-study-coach-frontend
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Backend API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

   # Optional: Analytics or other services
   NEXT_PUBLIC_VERCEL_URL=your_vercel_deployment_url
   ```

---

### Running the Application

1. **Start the Development Server**:

   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to**:

   ```
   http://localhost:3000
   ```

3. **Backend Setup** (Required):
   Make sure the backend API is running on `http://localhost:5000`. See the [backend repository](https://git.imp.fu-berlin.de/syedayaad01/llm-study-coach-backend/) for setup instructions.

---

### Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server locally:

```bash
npm start
```

To export static files:

```bash
npm run build && npx next export
```

---

### Deployment

The app is deployed on **Vercel** and available at: [https://llm-study-coach.vercel.app/](https://llm-study-coach.vercel.app/)

#### Deploy to Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

#### Deploy to Other Platforms:

For other platforms (Netlify, Azure, AWS):

1. Build the app:

   ```bash
   npm run build
   ```

2. Deploy the `out/` directory (for static export) or the entire project (for server-side rendering)

---

## Project Structure

```plaintext
llm-study-coach-frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth-wrapper.tsx  # Authentication wrapper
│   ├── dashboard.tsx     # Main dashboard component
│   ├── study-coach-app.tsx # Main app component
│   ├── upload-dialog.tsx # PDF upload functionality
│   ├── flashcard-section.tsx # Flashcard management
│   ├── quiz-section.tsx  # Quiz functionality
│   ├── qa-section.tsx    # Q&A interface
│   └── study-timer.tsx   # Study session timer
├── contexts/             # React contexts
│   ├── ThemeContext.tsx  # Theme management
│   └── TimerContext.tsx  # Timer state management
├── hooks/                # Custom React hooks
│   ├── use-mobile.tsx    # Mobile detection
│   └── use-toast.ts      # Toast notifications
├── lib/                  # Utility functions
│   ├── supabaseClient.ts # Supabase configuration
│   ├── config.ts         # App configuration
│   └── utils.ts          # General utilities
├── public/               # Static assets
│   ├── icons/            # App icons and favicons
│   └── images/           # Images and graphics
├── styles/               # Additional styles
├── tests/                # Test files
├── .env.local            # Environment variables
├── components.json       # shadcn/ui configuration
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Key Features Implementation

### Authentication Flow

- User registration and login with Supabase Auth
- Protected routes and user session management
- Email confirmation and password reset functionality

### Study Material Management

- PDF upload with file validation and processing
- Material organization by subject and date
- Content hash-based deduplication

### AI-Powered Features

- **Flashcard Generation**: Create study flashcards from uploaded materials
- **Quiz Creation**: Generate multiple-choice quizzes with scoring
- **Q&A System**: Interactive question-answering based on study content
- **Progress Tracking**: Monitor learning progress and study habits

### User Interface

- Modern, responsive design with Tailwind CSS
- Dark/Light theme support
- Accessible components using Radix UI primitives
- Smooth animations and transitions

## Development Workflow

### Getting Started with Development

1. **Set up the development environment**:

   ```bash
   npm run dev
   ```

2. **Code formatting and linting**:

   ```bash
   npm run lint
   ```

3. **Type checking**:
   ```bash
   npx tsc --noEmit
   ```

### Component Development

- Components are built using TypeScript for type safety
- UI components follow the shadcn/ui design system
- All components are fully responsive and accessible

### State Management

- React Context for global state (theme, user auth)
- React Hook Form for form state management
- Local state with useState and useEffect hooks

### API Integration

- RESTful API calls to the backend service
- Error handling and loading states
- File upload handling for PDF materials

---

## Environment Configuration

### Required Environment Variables

```env
# Supabase (Required for authentication and database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API (Required for AI features)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Optional: Deployment
NEXT_PUBLIC_VERCEL_URL=your_vercel_deployment_url
```

### Local Development Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Ensure backend API is running on port 5000
4. Start the development server

---

## Performance Optimizations

### Next.js Features

- **App Router**: Latest Next.js routing system
- **Server Components**: Improved performance with server-side rendering
- **Image Optimization**: Automatic image optimization and lazy loading
- **Code Splitting**: Automatic code splitting for faster page loads

### Bundle Optimization

- Tree shaking for smaller bundle sizes
- Dynamic imports for code splitting
- Optimized fonts and assets
- Compression and minification in production

---

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Features**: ES2020, CSS Grid, Flexbox, Service Workers

## Contributing

We welcome contributions to improve the LLM Study Coach! To contribute:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:

   - Follow TypeScript best practices
   - Use existing component patterns
   - Add proper type definitions
   - Test your changes thoroughly

4. **Commit your changes**:

   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow the existing code style and use ESLint
- **Components**: Use TypeScript and follow the established component patterns
- **Accessibility**: Ensure all components are accessible (WCAG 2.1)
- **Responsive Design**: Test on multiple screen sizes
- **Performance**: Consider performance implications of changes

### Areas for Contribution

- UI/UX improvements
- New study features and tools
- Performance optimizations
- Accessibility enhancements
- Mobile experience improvements
- Test coverage expansion

---

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**:

   - Ensure `.env.local` file exists in root directory
   - Restart the development server after changes
   - Check that variables start with `NEXT_PUBLIC_`

2. **Supabase Connection Issues**:

   - Verify Supabase URL and anon key are correct
   - Check Supabase project status and RLS policies
   - Ensure proper CORS configuration

3. **Backend API Connection**:

   - Confirm backend is running on correct port
   - Check API base URL in environment variables
   - Verify CORS settings on backend

4. **Build Errors**:
   - Clear `.next` directory and rebuild
   - Check for TypeScript errors
   - Ensure all dependencies are installed

### Getting Help

- Check the [Issues](https://github.com/yourusername/llm-study-coach-frontend/issues) page for known problems
- Create a new issue with detailed information about your problem
- Include error messages, browser console output, and steps to reproduce

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

**Developer**: Syed Ayaan Danish  
**Email**: [ayaan.danish@fu-berlin.de](mailto:ayaan.danish@fu-berlin.de)  
**GitHub**: [AyaanDanish](https://github.com/AyaanDanish)  
**Live Demo**: [https://llm-study-coach.vercel.app/](https://llm-study-coach.vercel.app/)

---

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vercel](https://vercel.com/) for seamless deployment

# AquaSmart Frontend

Dashboard web modern untuk monitoring kualitas air secara real-time dengan antarmuka yang intuitif dan responsif.

## ✨ Features

- **🌊 Real-time Monitoring** - Monitor pH, turbidity, TDS, dan temperature secara real-time
- **📊 Visual Analytics** - Gauge charts dan metric cards yang interaktif
- **🎯 Responsive Design** - Optimal di desktop, tablet, dan mobile
- **🌙 Dark Theme** - Modern dark theme dengan glass morphism effects
- **🔄 Router Navigation** - Single Page Application dengan smooth transitions
- **📱 Mobile-First** - Sidebar yang bisa ditoggle untuk mobile experience

## 🛠 Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **ESLint** - Code linting

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 atau lebih baru)
- npm atau yarn

### Installation

1. Clone repository:
```bash
git clone https://github.com/Capstone-E1/aquasmart_frontend.git
cd aquasmart_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser dan buka http://localhost:5173

## 📦 Build for Production

```bash
npm run build
```

## 🎨 Component Structure

### 📱 Layout Components
- `Sidebar` - Navigation sidebar dengan toggle functionality
- `Layout` - Main layout wrapper dengan header dan content area

### 📊 Dashboard Components
- `MetricCard` - Kartu metrik untuk menampilkan nilai real-time
- `GaugeChart` - Gauge chart untuk visualisasi progress
- `TemperatureGauge` - Specialized gauge untuk temperature
- `LoadingSkeleton` - Loading state component

### 🔧 Utility Components
- `Button` - Reusable button dengan variants dan sizes
- `Card` - Card component dengan dark mode support

## 🗺 Router Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main dashboard dengan overview semua metrics |
| `/ph-level` | pH Level | Detail monitoring pH level |
| `/turbidity` | Turbidity | Detail monitoring turbidity |
| `/tds` | TDS | Detail monitoring Total Dissolved Solids |
| `/temperature` | Temperature | Detail monitoring temperature |
| `/filter-uv` | Filter + UV | Control sistem filter dan UV |
| `/uv-timer` | UV Timer | Timer dan scheduling UV |
| `/history` | History | Historical data dan trends |
| `/notification` | Notification | Alert dan notifikasi sistem |
| `/settings` | Settings | Pengaturan sistem |

## 🎯 Key Features Detail

### Sidebar Navigation
- **Toggle Button** - Buka/tutup sidebar dengan smooth animation
- **Active State** - Visual indicator untuk halaman aktif
- **Search Bar** - Quick search functionality
- **Mobile Responsive** - Overlay mode untuk mobile devices

### Dashboard Metrics
- **Real-time Values** - pH: 7.1, Turbidity: 0.78, TDS: 434, Temperature: 22°C
- **Status Indicators** - Color-coded status (normal, warning, danger)
- **Best Value Badge** - Highlight nilai optimal
- **Export Functionality** - Download data dalam berbagai format

### Gauge Visualizations
- **Progress Animations** - Smooth animated progress rings
- **Color Coding** - Purple (pH), Red (Turbidity), Green (TDS), Blue (Temperature)
- **Status Messages** - Contextual status descriptions
- **Responsive Design** - Optimal viewing di berbagai screen sizes

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Purple**: #8B5CF6 (pH)
- **Red**: #EF4444 (Turbidity)
- **Green**: #10B981 (TDS)
- **Background**: Slate variants for dark theme

### Typography
- **Headings**: Font weight 600-700
- **Body**: Font weight 400-500
- **Code**: Monospace font family

## 🔧 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Sidebar.tsx
│   ├── Layout.tsx
│   ├── MetricCard.tsx
│   ├── GaugeChart.tsx
│   ├── TemperatureGauge.tsx
│   └── index.ts
├── pages/              # Route pages
│   ├── Dashboard.tsx
│   ├── PHLevel.tsx
│   ├── Turbidity.tsx
│   ├── TDS.tsx
│   ├── Temperature.tsx
│   └── OtherPages.tsx
├── lib/                # Utilities
│   └── utils.ts
├── App.tsx            # Main app component
└── main.tsx          # App entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**AquaSmart** - Smart Water Quality Monitoring System 🌊

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

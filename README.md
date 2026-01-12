# Bulk Update Pro

A Monday.com Board View app that enables bulk updating of multiple items across various column types with a single action.

## Features

- **Multi-item Selection**: Select multiple items at once with search and filter capabilities
- **15+ Column Types Supported**: Status, Text, Long Text, Numbers, Date, People, Dropdown, Timeline, Tags, Email, Phone, Link, Checkbox, Rating, Country, Week, Hour, Location, Color, and more
- **Preview Changes**: Review all changes before applying them
- **Dark Mode Support**: Full support for Monday.com's light, dark, and black themes
- **Progress Tracking**: Visual progress bar during bulk updates

## Supported Column Types

| Column Type | Support |
|-------------|---------|
| Text | Full |
| Long Text | Full |
| Status | Full (with label picker) |
| Numbers | Full |
| Date | Full (date picker) |
| People | Full (user selector) |
| Dropdown | Full (option picker) |
| Timeline | Full (date range) |
| Tags | Full (tag selector) |
| Email | Full |
| Phone | Full |
| Link | Full |
| Checkbox | Full |
| Rating | Full (1-5 stars) |
| Country | Full (50+ countries) |
| Week | Full (week range) |
| Hour | Full (time picker) |
| Location | Full (address input) |
| Color | Full (color picker) |
| World Clock | Full (timezone selector) |
| Board Relation | Full (linked item selector) |

**Note**: Time Tracking columns are excluded as the Monday.com API does not support updates for this column type.

## Technology Stack

- **Frontend**: React 18
- **UI Components**: monday-ui-react-core (Vibe Design System)
- **Build Tool**: Vite
- **API**: Monday.com GraphQL API via monday-sdk-js
- **Deployment**: Monday Code (CDN hosting)

## Project Structure

```
bulk-update-pro/
├── src/
│   ├── components/
│   │   ├── ItemSelector.jsx      # Item selection with search/filter
│   │   ├── ColumnSelector.jsx    # Column and value selection
│   │   ├── PreviewChanges.jsx    # Change preview before apply
│   │   └── CustomStepper.jsx     # Step navigation UI
│   ├── services/
│   │   └── mondayService.js      # Monday.com API calls
│   ├── utils/
│   │   └── mondayHelpers.js      # Column value formatting
│   ├── hooks/
│   │   ├── useMonday.js          # Monday SDK hook
│   │   └── useDebounce.js        # Debounce hook for search
│   ├── styles/
│   │   └── global.css            # Global styles + dark mode
│   └── App.jsx                   # Main app component
├── public/
├── package.json
└── vite.config.js
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Monday Code
mapps code:push --client-side -d dist --appVersionId YOUR_APP_VERSION_ID
```

## Development

### Prerequisites

- Node.js 18+
- Monday.com developer account
- Monday Apps CLI (`npm install -g @anthropic-ai/monday-apps-cli`)

### Local Development

1. Clone the repository
2. Run `npm install`
3. Create a tunnel: `mapps tunnel:create`
4. Start dev server: `npm run dev`
5. Access the app through your Monday.com board

## API Permissions Required

- `boards:read` - Read board data
- `boards:write` - Update column values
- `users:read` - Read workspace users (for People columns)

## License

MIT

## Support

For issues or feature requests, please open an issue on GitHub.

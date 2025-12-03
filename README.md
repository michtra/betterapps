# betterapps

Electron app to track and organize j*b applications.

i made this for my friend Nicole

i like building random things

## Features

- Create and manage job applications with detailed information
- Organize applications into custom folders with color coding
- Drag and drop applications between folders
- Filter and search through your applications
- Show/hide columns to customize your view
- Add custom fields with different types (text, number, date, dropdown)
- Sort by any column (including dates)
- Import applications from CSV/XLSX files with column mapping
- Export your data to CSV/XLSX format
- Fully customizable theming:
  - Light/Dark mode toggle
  - 8 accent color presets + custom color picker
  - 6 background presets per theme + custom color pickers
  - All colors saved and applied instantly
- Data automatically saved locally

## Getting Started

### Development

Install dependencies:
```bash
npm install
```

Run the app in development mode:
```bash
npm run dev
```

### Building

Build the application code:
```bash
npm run build
```

Package for your current platform:
```bash
npm run dist
```

For macOS specifically:
```bash
npm run dist:mac
```

For Linux:
```bash
npm run dist:linux
```

For Windows:
```bash
npm run dist:win
```

The built packages will be in the `dist` directory.

**Note for macOS users**: Due to code signing requirements, it's recommended to build the app locally on your own Mac rather than downloading pre-built binaries. The locally-built app will run without any "damaged" errors or Gatekeeper warnings.

## Usage

### Adding Applications

1. Click the "New Application" button in the header
2. Fill in the job details
3. Optionally assign to a folder
4. Click "Create"

### Managing Folders

1. Click "New Folder" in the sidebar
2. Enter a name and choose a color
3. Click applications in the folder to filter

### Importing Data

1. Click "Import" in the header
2. Select a CSV or XLSX file
3. Map columns from your file to application fields
4. Review the preview
5. Click "Import"

### Exporting Data

1. Click "Export" in the header
2. Choose CSV or XLSX format
3. Select save location

### Customizing Columns

1. Click "Columns" in the header
2. Check/uncheck columns to show/hide
3. Click "Done"

### Adding Columns
1. Click "+ Fields" in the header
2. Add fields
3. Click "Save Changes"

### Theming

1. Click "Settings" in the header
2. Toggle between Light and Dark mode
3. Choose from 8 accent color presets or use the custom color picker
4. Select from 6 background presets or customize primary/secondary colors
5. Click "Save Settings" to apply your theme

Your theme preferences are saved automatically.

## Data Storage

Application data is stored locally in:
- Linux: `~/.config/betterapps/job-applications.json`
- macOS: `~/Library/Application Support/betterapps/job-applications.json`
- Windows: `%APPDATA%/betterapps/job-applications.json`

## Tech Stack

- Electron
- React 19
- TypeScript
- Vite
- xlsx (for spreadsheet export/import)
- papaparse (for CSV parsing)

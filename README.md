# Markdown Table → CSV

Convert GitHub-flavored Markdown pipe tables to RFC 4180 CSV format. All processing happens in your browser—nothing is uploaded.

**Live tool:** https://evan-thedev.github.io/markdown-table-csv/

## Features

- **Paste or Drop**: Paste Markdown tables directly or drop `.md`/`.txt` files
- **GFM Pipe Tables**: Parses GitHub-flavored Markdown pipe tables with header rows and separator rows
- **RFC 4180 CSV**: Generates standards-compliant CSV output with proper quoting and escaping
- **Preview**: See both table preview and raw CSV output
- **Copy & Download**: One-click copy to clipboard or download as `.csv` file
- **Sample Data**: Load a sample table to try it out
- **Privacy-First**: 100% client-side processing—no uploads, no tracking, no backend

## How to Use

1. **Input**: Paste a Markdown table into the textarea, or drop a `.md`/`.txt` file onto the drop zone
2. **Convert**: The tool automatically parses the first valid table it finds
3. **Preview**: Review the table preview and CSV output
4. **Export**: Click "Copy CSV" to copy to clipboard, or "Download CSV" to save as a file

### Markdown Table Format

The tool supports GitHub-flavored Markdown pipe tables:

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

- Leading and trailing pipes are optional
- Alignment colons in separator rows (`:---`, `:---:`, `---:`) are supported
- Escaped pipes (`\|`) within cells are preserved
- All rows must have the same number of columns

## Use Cases

- Convert README tables to spreadsheet format
- Export GitHub issue tables to CSV for analysis
- Transform documentation tables for data processing
- Quick conversion for UAT and testing workflows

## Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern, responsive design with CSS custom properties
- **Vanilla JavaScript**: No frameworks or dependencies
- **GitHub Pages**: Static hosting

## Browser Support

Works in all modern browsers with:
- ES6+ JavaScript
- Clipboard API (with fallback)
- FileReader API
- Drag and Drop API

## Development

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/evan-thedev/markdown-table-csv.git
   cd markdown-table-csv
   ```

2. Open `index.html` in a browser, or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

3. Visit `http://localhost:8000`

No build process required—it's just static files.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Built by Evan Parrott

---

**Privacy Note**: This tool runs entirely in your browser. No Markdown content, tables, or CSV data ever leaves your device.

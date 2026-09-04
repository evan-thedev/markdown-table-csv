// Markdown Table to CSV Converter
// Author: Evan Parrott

(function() {
    'use strict';

    // DOM Elements
    const markdownInput = document.getElementById('markdownInput');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMessage = document.getElementById('errorMessage');
    const outputSection = document.getElementById('outputSection');
    const tablePreview = document.getElementById('tablePreview');
    const csvOutput = document.getElementById('csvOutput');

    // State
    let currentCSV = '';

    // Initialize
    init();

    function init() {
        // Event listeners
        markdownInput.addEventListener('input', handleInput);
        fileInput.addEventListener('change', handleFileSelect);
        loadSampleBtn.addEventListener('click', loadSample);
        copyBtn.addEventListener('click', copyToClipboard);
        downloadBtn.addEventListener('click', downloadCSV);

        // Drag and drop
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);

        // Prevent default drag behavior on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    function handleInput() {
        const markdown = markdownInput.value.trim();
        
        if (!markdown) {
            hideOutput();
            hideError();
            return;
        }

        try {
            const tables = extractTables(markdown);
            
            if (tables.length === 0) {
                showError('No valid Markdown table found. Tables must have a header row and a separator row (|---|).');
                hideOutput();
                return;
            }

            // Use the first table found
            const table = tables[0];
            const csv = tableToCSV(table);
            
            currentCSV = csv;
            displayOutput(table, csv);
            hideError();
        } catch (error) {
            showError(error.message);
            hideOutput();
        }
    }

    function extractTables(markdown) {
        const tables = [];
        const lines = markdown.split('\n');
        let i = 0;

        while (i < lines.length) {
            const table = tryExtractTableAt(lines, i);
            if (table) {
                tables.push(table);
                i = table.endIndex + 1;
            } else {
                i++;
            }
        }

        return tables;
    }

    function tryExtractTableAt(lines, startIndex) {
        // Look for a potential header row (line with pipes)
        if (startIndex >= lines.length) return null;
        
        const headerLine = lines[startIndex].trim();
        if (!headerLine.includes('|')) return null;

        // Check if next line is a separator
        if (startIndex + 1 >= lines.length) return null;
        
        const separatorLine = lines[startIndex + 1].trim();
        if (!isSeparatorRow(separatorLine)) return null;

        // Parse header
        const headers = parseRow(headerLine);
        if (headers.length === 0) return null;

        // Parse data rows
        const rows = [];
        let i = startIndex + 2;
        
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line || !line.includes('|')) break;
            
            const row = parseRow(line);
            if (row.length === 0) break;
            
            // Validate column count matches header
            if (row.length !== headers.length) {
                throw new Error(`Row ${i - startIndex + 1} has ${row.length} columns, but header has ${headers.length} columns. All rows must have the same number of columns.`);
            }
            
            rows.push(row);
            i++;
        }

        return {
            headers,
            rows,
            startIndex,
            endIndex: i - 1
        };
    }

    function isSeparatorRow(line) {
        // Remove leading/trailing pipes and whitespace
        let content = line.replace(/^\|?\s*/, '').replace(/\s*\|?$/, '');
        
        // Split by pipe
        const cells = content.split('|').map(cell => cell.trim());
        
        // Each cell should be dashes with optional colons for alignment
        return cells.length > 0 && cells.every(cell => /^:?-+:?$/.test(cell));
    }

    function parseRow(line) {
        const cells = [];
        let currentCell = '';
        let inEscape = false;
        
        // Remove leading/trailing whitespace
        line = line.trim();
        
        // Remove leading pipe if present
        if (line.startsWith('|')) {
            line = line.substring(1);
        }
        
        // Remove trailing pipe if present
        if (line.endsWith('|')) {
            line = line.substring(0, line.length - 1);
        }

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (inEscape) {
                currentCell += char;
                inEscape = false;
            } else if (char === '\\' && i + 1 < line.length && line[i + 1] === '|') {
                // Escaped pipe - add the pipe to current cell
                currentCell += '|';
                i++; // Skip the next character (the pipe)
            } else if (char === '|') {
                // Cell separator
                cells.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        
        // Add the last cell
        cells.push(currentCell.trim());
        
        return cells.filter((_, index) => index === 0 || index < cells.length || cells[index - 1] !== '');
    }

    function tableToCSV(table) {
        const allRows = [table.headers, ...table.rows];
        return allRows.map(row => rowToCSVLine(row)).join('\n');
    }

    function rowToCSVLine(row) {
        return row.map(cell => escapeCSVField(cell)).join(',');
    }

    function escapeCSVField(field) {
        // RFC 4180: Fields containing line breaks, double quotes, or commas must be enclosed in double-quotes
        const needsQuoting = field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r');
        
        if (needsQuoting || field.trim() !== field) {
            // Escape double quotes by doubling them
            const escaped = field.replace(/"/g, '""');
            return `"${escaped}"`;
        }
        
        return field;
    }

    function displayOutput(table, csv) {
        // Display table preview
        const tableHTML = generateTableHTML(table);
        tablePreview.innerHTML = tableHTML;
        
        // Display CSV output
        csvOutput.value = csv;
        
        // Show output section
        outputSection.classList.add('show');
    }

    function generateTableHTML(table) {
        let html = '<table>';
        
        // Header
        html += '<thead><tr>';
        table.headers.forEach(header => {
            html += `<th>${escapeHTML(header)}</th>`;
        });
        html += '</tr></thead>';
        
        // Body
        html += '<tbody>';
        table.rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${escapeHTML(cell)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table>';
        return html;
    }

    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
    }

    function hideOutput() {
        outputSection.classList.remove('show');
        currentCSV = '';
    }

    // File handling
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            readFile(file);
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add('drag-over');
    }

    function handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                readFile(file);
            } else {
                showError('Please drop a .md or .txt file.');
            }
        }
    }

    function readFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            markdownInput.value = e.target.result;
            handleInput();
        };
        
        reader.onerror = function() {
            showError('Error reading file. Please try again.');
        };
        
        reader.readAsText(file);
    }

    // Load sample
    function loadSample() {
        fetch('sample.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sample file not found');
                }
                return response.text();
            })
            .then(text => {
                markdownInput.value = text;
                handleInput();
            })
            .catch(error => {
                showError('Could not load sample file: ' + error.message);
            });
    }

    // Copy to clipboard
    function copyToClipboard() {
        if (!currentCSV) return;
        
        navigator.clipboard.writeText(currentCSV)
            .then(() => {
                // Visual feedback
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.style.backgroundColor = 'var(--success-color)';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            })
            .catch(() => {
                // Fallback for older browsers
                csvOutput.select();
                document.execCommand('copy');
                
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
    }

    // Download CSV
    function downloadCSV() {
        if (!currentCSV) return;
        
        const blob = new Blob([currentCSV], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'table.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
})();

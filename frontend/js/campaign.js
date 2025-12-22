const Campaign = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    MAX_ROWS: 10000,

    parseCSV(file) {
        return new Promise((resolve, reject) => {
            if (file.size > this.MAX_FILE_SIZE) {
                reject(new Error(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`));
                return;
            }
            
            if (!file.name.toLowerCase().endsWith('.csv')) {
                reject(new Error('Invalid file type. Please upload a CSV file'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    
                    if (!text || text.trim() === '') {
                        reject(new Error('CSV file is empty'));
                        return;
                    }

                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    
                    if (lines.length === 0) {
                        resolve({ headers: [], rows: [], warnings: [] });
                        return;
                    }
                    
                    if (lines.length === 1) {
                        reject(new Error('CSV file has no data rows (only headers found)'));
                        return;
                    }

                    const headers = this._parseCSVLine(lines[0]);
                    
                    if (headers.length === 0) {
                        reject(new Error('No valid headers found in CSV'));
                        return;
                    }

                    const duplicateHeaders = headers.filter((h, i) => headers.indexOf(h) !== i);
                    if (duplicateHeaders.length > 0) {
                        reject(new Error(`Duplicate column headers found: ${duplicateHeaders.join(', ')}`));
                        return;
                    }

                    const hasEmailColumn = headers.some(h => h.toLowerCase().includes('email'));
                    if (!hasEmailColumn) {
                        reject(new Error('CSV must have a column containing "email" in the header name'));
                        return;
                    }

                    const rows = [];
                    const warnings = [];
                    const maxRows = Math.min(lines.length, this.MAX_ROWS + 1);

                    for (let i = 1; i < maxRows; i++) {
                        try {
                            const values = this._parseCSVLine(lines[i]);
                            if (values.length === 0) continue;
                            
                            if (values.length !== headers.length) {
                                warnings.push(`Row ${i}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
                            }

                            const row = {};
                            headers.forEach((header, index) => {
                                row[header] = values[index] || '';
                            });
                            rows.push(row);
                        } catch (rowError) {
                            warnings.push(`Row ${i}: ${rowError.message}`);
                        }
                    }

                    if (lines.length > this.MAX_ROWS + 1) {
                        warnings.push(`File truncated: Only first ${this.MAX_ROWS} rows processed`);
                    }

                    if (rows.length === 0) {
                        reject(new Error('No valid data rows found in CSV'));
                        return;
                    }

                    resolve({ headers, rows, warnings });
                } catch (err) {
                    reject(new Error('Failed to parse CSV: ' + err.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file. Please try again'));
            reader.readAsText(file);
        });
    },

    parseCSVString(text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
            return { headers: [], rows: [], warnings: [] };
        }
        const headers = this._parseCSVLine(lines[0]);
        const rows = [];
        const warnings = [];
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this._parseCSVLine(lines[i]);
                if (values.length > 0) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    rows.push(row);
                }
            } catch (e) {
                warnings.push(`Row ${i}: Parse error`);
            }
        }
        return { headers, rows, warnings };
    },

    _parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    current += '"';
                    i++;
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        result.push(current.trim());
        return result;
    },

    extractRecipients(rows, emailCol, nameCol) {
        return rows.map(row => ({
            email: row[emailCol] || '',
            name: row[nameCol] || '',
            variables: { ...row }
        })).filter(r => r.email.trim() !== '');
    },

    detectPlaceholders(template) {
        const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
        const placeholders = new Set();
        let match;
        while ((match = regex.exec(template)) !== null) {
            placeholders.add(match[1]);
        }
        return Array.from(placeholders);
    },

    highlightPlaceholders(template) {
        return template.replace(
            /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g,
            '<span class="placeholder">{{$1}}</span>'
        );
    },

    validateForm(formData) {
        const errors = [];
        if (!formData.subject || formData.subject.trim() === '') {
            errors.push('Subject is required');
        }
        if (!formData.template || formData.template.trim() === '') {
            errors.push('Template is required');
        }
        if (!formData.recipients || formData.recipients.length === 0) {
            errors.push('Recipients are required');
        }
        if (formData.batch_size === undefined || formData.batch_size === null || formData.batch_size <= 0) {
            errors.push('Batch size must be a positive integer');
        }
        if (formData.delay_seconds === undefined || formData.delay_seconds === null || formData.delay_seconds < 0) {
            errors.push('Delay must be a non-negative number');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Campaign;
}

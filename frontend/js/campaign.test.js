import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const Campaign = {
    parseCSVString(text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
            return { headers: [], rows: [] };
        }
        const headers = this._parseCSVLine(lines[0]);
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this._parseCSVLine(lines[i]);
            if (values.length > 0) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                rows.push(row);
            }
        }
        return { headers, rows };
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

const safeString = () => fc.string({ minLength: 1 }).filter(s => !s.includes('\n') && !s.includes('\r') && !s.includes(',') && !s.includes('"') && s.trim() !== '');
const safeHeader = () => fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/).filter(s => s.length > 0 && s.length < 20);
const validPlaceholderName = () => fc.stringMatching(/^[a-zA-Z_][a-zA-Z0-9_]*$/).filter(s => s.length > 0 && s.length < 20);
const textWithoutPlaceholders = () => fc.string().filter(s => !s.includes('{{') && !s.includes('}}'));

describe('Campaign Module - Property Tests', () => {
    describe('Property 1: CSV parsing preserves row count', () => {
        it('**Feature: mailer-dashboard, Property 1: CSV parsing preserves row count** - Validates: Requirements 1.2, 1.3', () => {
            fc.assert(
                fc.property(
                    fc.array(safeHeader(), { minLength: 1, maxLength: 5 }),
                    fc.array(fc.array(safeString(), { minLength: 1, maxLength: 5 }), { minLength: 0, maxLength: 20 }),
                    (headers, dataRows) => {
                        const normalizedRows = dataRows.map(row => {
                            while (row.length < headers.length) row.push('');
                            return row.slice(0, headers.length);
                        });
                        const csvLines = [headers.join(',')];
                        normalizedRows.forEach(row => csvLines.push(row.join(',')));
                        const csvText = csvLines.join('\n');
                        const result = Campaign.parseCSVString(csvText);
                        return result.rows.length === normalizedRows.length;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 5: Placeholder detection accuracy', () => {
        it('**Feature: mailer-dashboard, Property 5: Placeholder detection accuracy** - Validates: Requirements 1.4', () => {
            fc.assert(
                fc.property(
                    fc.array(validPlaceholderName(), { minLength: 0, maxLength: 10 }),
                    fc.array(textWithoutPlaceholders(), { minLength: 0, maxLength: 5 }),
                    (placeholderNames, textParts) => {
                        const uniquePlaceholders = [...new Set(placeholderNames)];
                        let template = '';
                        for (let i = 0; i < Math.max(uniquePlaceholders.length, textParts.length); i++) {
                            if (i < textParts.length) template += textParts[i];
                            if (i < uniquePlaceholders.length) template += `{{${uniquePlaceholders[i]}}}`;
                        }
                        const detected = Campaign.detectPlaceholders(template);
                        if (detected.length !== uniquePlaceholders.length) return false;
                        for (const p of uniquePlaceholders) {
                            if (!detected.includes(p)) return false;
                        }
                        return true;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 4: Form validation completeness', () => {
        it('**Feature: mailer-dashboard, Property 4: Form validation completeness** - Validates: Requirements 1.5, 6.2, 6.3', () => {
            fc.assert(
                fc.property(
                    fc.boolean(),
                    fc.boolean(),
                    fc.boolean(),
                    fc.boolean(),
                    fc.boolean(),
                    (hasSubj, hasTempl, hasRecip, validBatch, validDel) => {
                        const formData = {
                            subject: hasSubj ? 'Test Subject' : '',
                            template: hasTempl ? 'Test Template' : '',
                            recipients: hasRecip ? [{ email: 'test@test.com', name: 'Test' }] : [],
                            batch_size: validBatch ? 10 : 0,
                            delay_seconds: validDel ? 5 : -1
                        };
                        const result = Campaign.validateForm(formData);
                        const shouldBeValid = hasSubj && hasTempl && hasRecip && validBatch && validDel;
                        return shouldBeValid === result.valid;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

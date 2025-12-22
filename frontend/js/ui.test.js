import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

const createUI = (document) => ({
    renderValidationResults(results) {
        const container = document.getElementById('validationResults');
        const validCount = document.getElementById('validCount');
        const invalidCount = document.getElementById('invalidCount');
        const panel = document.getElementById('validationPanel');

        if (!container || !validCount || !invalidCount) return { valid: 0, invalid: 0 };

        let valid = 0;
        let invalid = 0;

        const html = results.map(result => {
            const isValid = result.status === 'valid';
            if (isValid) valid++;
            else invalid++;

            return `<div class="validation-item ${isValid ? 'valid' : 'invalid'}">
                <span class="email">${this._escapeHtml(result.email)}</span>
                <span class="status-badge ${isValid ? 'badge-valid' : 'badge-invalid'}">${result.status}</span>
                ${result.reason ? `<span class="reason">${this._escapeHtml(result.reason)}</span>` : ''}
            </div>`;
        }).join('');

        container.innerHTML = html;
        validCount.textContent = valid;
        invalidCount.textContent = invalid;

        if (panel) panel.style.display = 'block';

        return { valid, invalid };
    },

    renderProgress(status) {
        const progressBar = document.getElementById('progressBar');
        const sentCount = document.getElementById('sentCount');
        const failedCount = document.getElementById('failedCount');
        const pendingCount = document.getElementById('pendingCount');

        if (!progressBar || !sentCount || !failedCount || !pendingCount) return null;

        const { total, sent, failed, pending } = status;
        const percentage = total > 0 ? ((sent + failed) / total) * 100 : 0;

        progressBar.style.width = `${percentage}%`;
        sentCount.textContent = sent;
        failedCount.textContent = failed;
        pendingCount.textContent = pending;

        return { percentage };
    },

    filterResults(records, status) {
        if (status === 'all') return records;
        return records.filter(record => record.send_status === status);
    },

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});

const setupDOM = () => {
    const dom = new JSDOM(`<!DOCTYPE html>
        <div id="validationPanel">
            <span id="validCount">0</span>
            <span id="invalidCount">0</span>
            <div id="validationResults"></div>
        </div>
        <div id="progressPanel">
            <div id="progressBar" style="width: 0%"></div>
            <span id="sentCount">0</span>
            <span id="failedCount">0</span>
            <span id="pendingCount">0</span>
        </div>
    `);
    return dom.window.document;
};

const validEmail = () => fc.emailAddress();
const validationStatus = () => fc.constantFrom('valid', 'invalid');
const invalidReason = () => fc.constantFrom('invalid_format', 'no_mx_records', null);

const validationResultArb = () => fc.record({
    email: validEmail(),
    status: validationStatus(),
    reason: invalidReason()
});

const sendStatus = () => fc.constantFrom('sent', 'failed', 'pending');

const deliveryRecordArb = () => fc.record({
    email: validEmail(),
    recipient_name: fc.string(),
    validation_status: fc.string(),
    send_status: sendStatus(),
    failure_reason: fc.option(fc.string(), { nil: null }),
    timestamp: fc.date().map(d => d.toISOString())
});

describe('UI Module - Property Tests', () => {
    describe('Property 2: Validation result display completeness', () => {
        it('**Feature: mailer-dashboard, Property 2: Validation result display completeness** - Validates: Requirements 2.2, 2.4', () => {
            fc.assert(
                fc.property(
                    fc.array(validationResultArb(), { minLength: 0, maxLength: 50 }),
                    (results) => {
                        const document = setupDOM();
                        const UI = createUI(document);
                        const { valid, invalid } = UI.renderValidationResults(results);
                        const container = document.getElementById('validationResults');
                        const displayedItems = container.querySelectorAll('.validation-item').length;
                        const expectedValid = results.filter(r => r.status === 'valid').length;
                        const expectedInvalid = results.filter(r => r.status === 'invalid').length;
                        return displayedItems === results.length &&
                               valid === expectedValid &&
                               invalid === expectedInvalid &&
                               (valid + invalid) === results.length;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 3: Progress counts invariant', () => {
        it('**Feature: mailer-dashboard, Property 3: Progress counts invariant** - Validates: Requirements 4.2, 4.4', () => {
            fc.assert(
                fc.property(
                    fc.nat(1000),
                    fc.nat(1000),
                    fc.nat(1000),
                    (sent, failed, pending) => {
                        const total = sent + failed + pending;
                        const status = { total, sent, failed, pending, status: 'running' };
                        const document = setupDOM();
                        const UI = createUI(document);
                        const result = UI.renderProgress(status);
                        const expectedPercentage = total > 0 ? ((sent + failed) / total) * 100 : 0;
                        const displayedSent = parseInt(document.getElementById('sentCount').textContent);
                        const displayedFailed = parseInt(document.getElementById('failedCount').textContent);
                        const displayedPending = parseInt(document.getElementById('pendingCount').textContent);
                        return displayedSent + displayedFailed + displayedPending === total &&
                               Math.abs(result.percentage - expectedPercentage) < 0.001;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    describe('Property 6: Delivery report filtering correctness', () => {
        it('**Feature: mailer-dashboard, Property 6: Delivery report filtering correctness** - Validates: Requirements 5.5', () => {
            fc.assert(
                fc.property(
                    fc.array(deliveryRecordArb(), { minLength: 0, maxLength: 50 }),
                    fc.constantFrom('all', 'sent', 'failed'),
                    (records, filterValue) => {
                        const document = setupDOM();
                        const UI = createUI(document);
                        const filtered = UI.filterResults(records, filterValue);
                        if (filterValue === 'all') {
                            return filtered.length === records.length;
                        }
                        return filtered.every(r => r.send_status === filterValue) &&
                               filtered.length === records.filter(r => r.send_status === filterValue).length;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

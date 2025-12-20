const UI = {
    showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    },

    renderValidationResults(results) {
        const container = document.getElementById('validationResults');
        const validCount = document.getElementById('validCount');
        const invalidCount = document.getElementById('invalidCount');
        const panel = document.getElementById('validationPanel');

        if (!container || !validCount || !invalidCount) return;

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
    },

    renderProgress(status) {
        const progressBar = document.getElementById('progressBar');
        const sentCount = document.getElementById('sentCount');
        const failedCount = document.getElementById('failedCount');
        const pendingCount = document.getElementById('pendingCount');
        const progressStatus = document.getElementById('progressStatus');
        const panel = document.getElementById('progressPanel');

        if (!progressBar || !sentCount || !failedCount || !pendingCount) return;

        const { total, sent, failed, pending, status: campaignStatus, current_batch, total_batches, next_batch_in } = status;
        const percentage = total > 0 ? ((sent + failed) / total) * 100 : 0;

        progressBar.style.width = `${percentage}%`;
        sentCount.textContent = sent;
        failedCount.textContent = failed;
        pendingCount.textContent = pending;

        if (progressStatus) {
            if (campaignStatus === 'completed') {
                progressStatus.innerHTML = '<span class="status-complete">✓ Campaign completed!</span>';
            } else if (campaignStatus === 'failed') {
                progressStatus.innerHTML = '<span class="status-failed">✗ Campaign failed</span>';
            } else {
                let statusText = `<span class="status-running">Sending batch ${current_batch || 1} of ${total_batches || 1}</span>`;
                if (next_batch_in > 0) {
                    statusText += `<br><span class="status-delay">⏱ Waiting ${next_batch_in.toFixed(1)}s before next batch (anti-spam delay)</span>`;
                }
                statusText += `<br><span class="status-info">${Math.round(percentage)}% complete</span>`;
                progressStatus.innerHTML = statusText;
            }
        }

        if (panel) panel.style.display = 'block';
    },

    renderDeliveryReport(records) {
        const tbody = document.getElementById('reportTableBody');
        const totalRecords = document.getElementById('totalRecords');
        const sentRecords = document.getElementById('sentRecords');
        const failedRecords = document.getElementById('failedRecords');

        if (!tbody) return;

        const sent = records.filter(r => r.send_status === 'sent').length;
        const failed = records.filter(r => r.send_status === 'failed').length;

        if (totalRecords) totalRecords.textContent = records.length;
        if (sentRecords) sentRecords.textContent = sent;
        if (failedRecords) failedRecords.textContent = failed;

        tbody.innerHTML = records.map(record => `<tr>
            <td>${this._escapeHtml(record.email)}</td>
            <td>${this._escapeHtml(record.recipient_name || '')}</td>
            <td>${this._escapeHtml(record.validation_status || '')}</td>
            <td><span class="status-badge badge-${record.send_status}">${record.send_status}</span></td>
            <td>${this._escapeHtml(record.failure_reason || '')}</td>
            <td>${record.timestamp ? new Date(record.timestamp).toLocaleString() : ''}</td>
        </tr>`).join('');
    },

    filterResults(records, status) {
        if (status === 'all') return records;
        return records.filter(record => record.send_status === status);
    },

    showError(message) {
        this._showToast(message, 'error');
    },

    showSuccess(message) {
        this._showToast(message, 'success');
    },

    _showToast(message, type) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast toast-${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI };
}

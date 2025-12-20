const Dashboard = {
    currentCampaignId: null,
    validRecipients: [],
    allDeliveryRecords: [],
    pollInterval: null,
    csvData: null,
    templates: [],
    campaigns: [],
    logs: [],
    settings: {
        whitelistDomains: [],
        blacklistDomains: [],
        customValidEmails: [],
        skipMxCheck: false,
        allowPlusAddressing: true,
        defaultBatchSize: 10,
        defaultDelay: 2
    },

    init() {
        this.loadFromStorage();
        this.initTabs();
        this.initLogout();
        this.initCampaignForm();
        this.initTemplates();
        this.initDeliveryReport();
        this.initTestEmail();
        this.initLogs();
        this.initSettings();
        this.renderCampaignList();
        this.renderTemplateList();
        this.populateTemplateSelect();
        this.renderLogs();
        this.applyDefaultSettings();
    },

    loadFromStorage() {
        try {
            this.templates = JSON.parse(localStorage.getItem('mailer_templates') || '[]');
            this.campaigns = JSON.parse(localStorage.getItem('mailer_campaigns') || '[]');
            this.logs = JSON.parse(localStorage.getItem('mailer_logs') || '[]');
            const savedSettings = JSON.parse(localStorage.getItem('mailer_settings') || '{}');
            this.settings = { ...this.settings, ...savedSettings };
            
            if (this.templates.length === 0) {
                this.templates = typeof EmailTemplates !== 'undefined' ? [...EmailTemplates] : [];
                this.saveToStorage();
            }
        } catch (e) {
            this.templates = typeof EmailTemplates !== 'undefined' ? [...EmailTemplates] : [];
            this.campaigns = [];
            this.logs = [];
        }
    },

    resetTemplates() {
        if (typeof EmailTemplates !== 'undefined') {
            this.templates = [...EmailTemplates];
            this.saveToStorage();
            this.renderTemplateList();
            this.populateTemplateSelect();
            UI.showSuccess('Templates reset to defaults!');
        }
    },

    getDefaultTemplates() {
        return typeof EmailTemplates !== 'undefined' ? [...EmailTemplates] : [];
    },

    saveToStorage() {
        localStorage.setItem('mailer_templates', JSON.stringify(this.templates));
        localStorage.setItem('mailer_campaigns', JSON.stringify(this.campaigns));
        localStorage.setItem('mailer_logs', JSON.stringify(this.logs));
        localStorage.setItem('mailer_settings', JSON.stringify(this.settings));
    },

    addLog(type, message, details = null) {
        const log = {
            id: Date.now(),
            type: type,
            message: message,
            details: details,
            timestamp: new Date().toISOString()
        };
        this.logs.unshift(log);
        if (this.logs.length > 500) this.logs = this.logs.slice(0, 500);
        this.saveToStorage();
        this.renderLogs();
    },

    initTabs() {
        document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                UI.showTab(btn.dataset.tab);
            });
        });
    },

    initLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await Auth.logout();
                window.location.href = '/login';
            });
        }
    },

    initCampaignForm() {
        const csvFileInput = document.getElementById('csvFile');
        const templateInput = document.getElementById('template');
        const campaignForm = document.getElementById('campaignForm');
        const templateSelect = document.getElementById('templateSelect');

        if (csvFileInput) csvFileInput.addEventListener('change', (e) => this.handleCSVUpload(e));
        if (templateInput) templateInput.addEventListener('input', (e) => this.handleTemplateInput(e));
        if (campaignForm) campaignForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        if (templateSelect) templateSelect.addEventListener('change', (e) => this.loadSelectedTemplate(e));
    },

    populateTemplateSelect() {
        const select = document.getElementById('templateSelect');
        if (!select) return;
        select.innerHTML = '<option value="">-- Select a template --</option>';
        this.templates.forEach((t, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    },

    loadSelectedTemplate(e) {
        const idx = e.target.value;
        if (idx === '') return;
        const template = this.templates[idx];
        if (template) {
            document.getElementById('template').value = template.content;
            this.handleTemplateInput({ target: { value: template.content } });
        }
    },

    async handleCSVUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const csvPreview = document.getElementById('csvPreview');
        
        csvPreview.innerHTML = '<p class="loading">Parsing CSV file...</p>';
        
        try {
            this.csvData = await Campaign.parseCSV(file);
            const { headers, rows, warnings } = this.csvData;
            
            if (rows.length === 0) {
                csvPreview.innerHTML = '<p class="error">No data rows found in CSV</p>';
                return;
            }
            
            const emailCol = headers.find(h => h.toLowerCase().includes('email')) || headers[0];
            const nameCol = headers.find(h => h.toLowerCase().includes('name')) || headers[1] || headers[0];
            
            let previewHtml = `<p><strong>${rows.length}</strong> recipients found</p>`;
            
            if (warnings && warnings.length > 0) {
                previewHtml += `<div class="csv-warnings">
                    <p class="warning-title">⚠️ Warnings (${warnings.length}):</p>
                    <ul>${warnings.slice(0, 5).map(w => `<li>${w}</li>`).join('')}</ul>
                    ${warnings.length > 5 ? `<p class="warning-more">...and ${warnings.length - 5} more warnings</p>` : ''}
                </div>`;
            }
            
            previewHtml += `<div class="column-select">
                <label>Email column: <select id="emailColSelect">${headers.map(h => `<option value="${h}" ${h === emailCol ? 'selected' : ''}>${h}</option>`).join('')}</select></label>
                <label>Name column: <select id="nameColSelect">${headers.map(h => `<option value="${h}" ${h === nameCol ? 'selected' : ''}>${h}</option>`).join('')}</select></label>
            </div>`;
            
            const previewRows = rows.slice(0, 10);
            previewHtml += `<div class="csv-table-wrapper">
                <table class="csv-table">
                    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>${previewRows.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
                ${rows.length > 10 ? `<p class="csv-more">...and ${rows.length - 10} more rows</p>` : ''}
            </div>`;
            
            csvPreview.innerHTML = previewHtml;
        } catch (err) {
            csvPreview.innerHTML = `<div class="csv-error">
                <p class="error-title">❌ CSV Error</p>
                <p class="error-message">${err.message}</p>
                <p class="error-hint">Please check your CSV file and try again.</p>
            </div>`;
            UI.showError(err.message);
            this.csvData = null;
        }
    },

    handleTemplateInput(e) {
        const template = e.target.value;
        const placeholderPreview = document.getElementById('placeholderPreview');
        const placeholders = Campaign.detectPlaceholders(template);
        if (placeholders.length > 0) {
            placeholderPreview.innerHTML = '<p>Detected placeholders: ' + placeholders.map(p => `<span class="placeholder-tag">{{${p}}}</span>`).join(' ') + '</p>';
        } else {
            placeholderPreview.innerHTML = '';
        }
    },

    async handleFormSubmit(e) {
        e.preventDefault();
        const campaignName = document.getElementById('campaignName').value;
        const subject = document.getElementById('subject').value;
        const template = document.getElementById('template').value;
        const batchSize = parseInt(document.getElementById('batchSize').value, 10);
        const delaySeconds = parseFloat(document.getElementById('delaySeconds').value);

        if (!this.csvData || !this.csvData.rows.length) {
            UI.showError('Please upload a CSV file with recipients');
            return;
        }
        const emailColSelect = document.getElementById('emailColSelect');
        const nameColSelect = document.getElementById('nameColSelect');
        const emailCol = emailColSelect ? emailColSelect.value : this.csvData.headers[0];
        const nameCol = nameColSelect ? nameColSelect.value : this.csvData.headers[1] || this.csvData.headers[0];
        const recipients = Campaign.extractRecipients(this.csvData.rows, emailCol, nameCol);
        const formData = { name: campaignName, subject, template, recipients, batch_size: batchSize, delay_seconds: delaySeconds };
        const validation = Campaign.validateForm(formData);
        if (!validation.valid) {
            UI.showError(validation.errors.join(', '));
            return;
        }
        this.pendingFormData = formData;
        await this.validateEmails(recipients);
    },

    async validateEmails(recipients) {
        const emails = recipients.map(r => r.email);
        try {
            const response = await API.validateEmails(emails);
            let results = response.results || response;
            results = this.applyCustomValidation(results);
            UI.renderValidationResults(results);
            this.validRecipients = recipients.filter(r => {
                const result = results.find(res => res.email === r.email);
                return result && result.status === 'valid';
            });
            this.initValidationActions();
        } catch (err) {
            UI.showError('Failed to validate emails: ' + err.message);
            this.addLog('error', 'Email validation failed', err.message);
        }
    },

    initValidationActions() {
        const proceedBtn = document.getElementById('proceedBtn');
        const cancelBtn = document.getElementById('cancelValidationBtn');
        if (proceedBtn) proceedBtn.onclick = () => this.proceedWithValidEmails();
        if (cancelBtn) cancelBtn.onclick = () => this.cancelValidation();
    },

    proceedWithValidEmails() {
        if (this.validRecipients.length === 0) {
            UI.showError('No valid emails to proceed with');
            return;
        }
        this.pendingFormData.recipients = this.validRecipients;
        this.sendCampaign();
    },

    cancelValidation() {
        const validationPanel = document.getElementById('validationPanel');
        if (validationPanel) validationPanel.style.display = 'none';
        this.validRecipients = [];
        this.pendingFormData = null;
    },

    async sendCampaign() {
        const { name, subject, template, recipients, batch_size, delay_seconds } = this.pendingFormData;
        const validationPanel = document.getElementById('validationPanel');
        const progressPanel = document.getElementById('progressPanel');
        if (validationPanel) validationPanel.style.display = 'none';
        if (progressPanel) progressPanel.style.display = 'block';

        try {
            const result = await API.sendCampaign({ subject, template, recipients, batch_size, delay_seconds });
            this.currentCampaignId = result.campaign_id;
            const campaign = {
                id: result.campaign_id,
                name: name,
                subject: subject,
                recipientCount: recipients.length,
                createdAt: new Date().toISOString(),
                status: 'running'
            };
            this.campaigns.unshift(campaign);
            this.saveToStorage();
            this.renderCampaignList();
            this.addLog('campaign', 'Campaign started: ' + name, recipients.length + ' recipients');
            this.startPolling();
        } catch (err) {
            UI.showError('Failed to send campaign: ' + err.message);
            if (progressPanel) progressPanel.style.display = 'none';
        }
    },

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => this.pollCampaignStatus(), 2000);
        this.pollCampaignStatus();
    },

    async pollCampaignStatus() {
        if (!this.currentCampaignId) return;
        try {
            const status = await API.getCampaignStatus(this.currentCampaignId);
            UI.renderProgress(status);
            if (status.status === 'completed' || status.status === 'failed') {
                this.stopPolling();
                const campaign = this.campaigns.find(c => c.id === this.currentCampaignId);
                if (campaign) {
                    campaign.status = status.status;
                    campaign.sent = status.sent;
                    campaign.failed = status.failed;
                    this.saveToStorage();
                    this.renderCampaignList();
                }
                if (status.status === 'completed') {
                    UI.showSuccess('Campaign completed!');
                    this.addLog('campaign', 'Campaign completed', 'Sent: ' + status.sent + ', Failed: ' + status.failed);
                    await this.loadDeliveryReport(this.currentCampaignId);
                } else {
                    UI.showError('Campaign failed');
                    this.addLog('error', 'Campaign failed', this.currentCampaignId);
                }
            }
        } catch (err) {
            UI.showError('Failed to get campaign status: ' + err.message);
            this.stopPolling();
        }
    },

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    },

    initDeliveryReport() {
        const statusFilter = document.getElementById('statusFilter');
        const downloadCsvBtn = document.getElementById('downloadCsvBtn');
        if (statusFilter) statusFilter.addEventListener('change', (e) => this.handleFilterChange(e));
        if (downloadCsvBtn) downloadCsvBtn.addEventListener('click', () => this.downloadReport());
    },

    renderCampaignList() {
        const container = document.getElementById('campaignList');
        if (!container) return;
        if (this.campaigns.length === 0) {
            container.innerHTML = '<p class="empty-state">No campaigns yet. Create your first campaign!</p>';
            return;
        }
        container.innerHTML = this.campaigns.map(c => `
            <div class="campaign-item" data-id="${c.id}">
                <div class="campaign-info">
                    <strong>${c.name || 'Untitled Campaign'}</strong>
                    <span class="campaign-subject">${c.subject}</span>
                    <span class="campaign-meta">${c.recipientCount} recipients • ${new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="campaign-status">
                    <span class="status-badge status-${c.status}">${c.status}</span>
                    ${c.sent !== undefined ? `<span class="stat">Sent: ${c.sent}</span>` : ''}
                    ${c.failed !== undefined ? `<span class="stat">Failed: ${c.failed}</span>` : ''}
                </div>
                <button class="btn btn-small" onclick="Dashboard.viewReport('${c.id}', '${(c.name || 'Campaign').replace(/'/g, "\\'")}')">View Report</button>
            </div>
        `).join('');
    },

    async viewReport(campaignId, campaignName) {
        this.currentCampaignId = campaignId;
        document.getElementById('reportCampaignName').textContent = campaignName;
        await this.loadDeliveryReport(campaignId);
    },

    async loadDeliveryReport(campaignId) {
        try {
            const response = await API.getDeliveryReport(campaignId);
            const records = response.records || response;
            this.allDeliveryRecords = records;
            document.getElementById('reportPanel').style.display = 'block';
            UI.renderDeliveryReport(records);
            UI.showTab('campaign-history');
        } catch (err) {
            UI.showError('Failed to load delivery report: ' + err.message);
        }
    },

    handleFilterChange(e) {
        const filterValue = e.target.value;
        const filteredRecords = UI.filterResults(this.allDeliveryRecords, filterValue);
        UI.renderDeliveryReport(filteredRecords);
    },

    downloadReport() {
        if (!this.currentCampaignId) {
            UI.showError('No campaign report available');
            return;
        }
        API.downloadReportCSV(this.currentCampaignId);
    },

    initTemplates() {
        const templateForm = document.getElementById('templateForm');
        if (templateForm) templateForm.addEventListener('submit', (e) => this.saveTemplate(e));
    },

    saveTemplate(e) {
        e.preventDefault();
        const name = document.getElementById('templateName').value.trim();
        const content = document.getElementById('templateContent').value.trim();
        if (!name || !content) {
            UI.showError('Template name and content are required');
            return;
        }
        this.templates.push({ name, content, createdAt: new Date().toISOString() });
        this.saveToStorage();
        this.renderTemplateList();
        this.populateTemplateSelect();
        document.getElementById('templateName').value = '';
        document.getElementById('templateContent').value = '';
        UI.showSuccess('Template saved!');
        this.addLog('campaign', 'Template saved: ' + name);
    },

    renderTemplateList() {
        const container = document.getElementById('templateList');
        if (!container) return;
        if (this.templates.length === 0) {
            container.innerHTML = '<p class="empty-state">No templates saved yet.</p>';
            return;
        }
        container.innerHTML = this.templates.map((t, i) => `
            <div class="template-item">
                <div class="template-info">
                    <strong>${t.name}</strong>
                    <span class="template-meta">${new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="template-actions">
                    <button class="btn btn-small" onclick="Dashboard.useTemplate(${i})">Use</button>
                    <button class="btn btn-small btn-danger" onclick="Dashboard.deleteTemplate(${i})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    useTemplate(idx) {
        const template = this.templates[idx];
        if (template) {
            document.getElementById('template').value = template.content;
            this.handleTemplateInput({ target: { value: template.content } });
            UI.showTab('new-campaign');
            UI.showSuccess('Template loaded!');
        }
    },

    deleteTemplate(idx) {
        this.templates.splice(idx, 1);
        this.saveToStorage();
        this.renderTemplateList();
        this.populateTemplateSelect();
    },

    initTestEmail() {
        const testEmailBtn = document.getElementById('testEmailBtn');
        const sendTestBtn = document.getElementById('sendTestBtn');
        const cancelTestBtn = document.getElementById('cancelTestBtn');
        const modal = document.getElementById('testEmailModal');
        if (testEmailBtn) testEmailBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
        if (cancelTestBtn) cancelTestBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        if (sendTestBtn) sendTestBtn.addEventListener('click', () => this.sendTestEmail());
    },

    async sendTestEmail() {
        const testEmail = document.getElementById('testEmail').value;
        const subject = document.getElementById('subject').value || 'Test Email';
        const template = document.getElementById('template').value || '<p>This is a test email.</p>';
        if (!testEmail) {
            UI.showError('Please enter a test email address');
            return;
        }
        try {
            await API.sendCampaign({
                subject: '[TEST] ' + subject,
                template: template,
                recipients: [{ email: testEmail, name: 'Test User' }],
                batch_size: 1,
                delay_seconds: 0
            });
            document.getElementById('testEmailModal').style.display = 'none';
            UI.showSuccess('Test email sent to ' + testEmail);
            this.addLog('email', 'Test email sent', testEmail);
        } catch (err) {
            UI.showError('Failed to send test email: ' + err.message);
            this.addLog('error', 'Test email failed', err.message);
        }
    },

    initLogs() {
        const refreshBtn = document.getElementById('refreshLogsBtn');
        const clearBtn = document.getElementById('clearLogsBtn');
        const typeFilter = document.getElementById('logTypeFilter');
        const dateFilter = document.getElementById('logDateFilter');

        if (refreshBtn) refreshBtn.addEventListener('click', () => this.renderLogs());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearLogs());
        if (typeFilter) typeFilter.addEventListener('change', () => this.renderLogs());
        if (dateFilter) dateFilter.addEventListener('change', () => this.renderLogs());
    },

    renderLogs() {
        const container = document.getElementById('logsList');
        if (!container) return;

        const typeFilter = document.getElementById('logTypeFilter')?.value || 'all';
        const dateFilter = document.getElementById('logDateFilter')?.value || '';

        let filtered = this.logs;
        if (typeFilter !== 'all') {
            filtered = filtered.filter(l => l.type === typeFilter);
        }
        if (dateFilter) {
            filtered = filtered.filter(l => l.timestamp.startsWith(dateFilter));
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No logs found.</p>';
            return;
        }

        container.innerHTML = filtered.map(log => {
            const date = new Date(log.timestamp);
            const time = date.toLocaleTimeString();
            const dateStr = date.toLocaleDateString();
            return `
                <div class="log-item log-${log.type}">
                    <div class="log-time">${dateStr}<br>${time}</div>
                    <div class="log-content">
                        <span class="log-type type-${log.type}">${log.type}</span>
                        <span class="log-message">${log.message}</span>
                        ${log.details ? `<div class="log-details">${log.details}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            this.logs = [];
            this.saveToStorage();
            this.renderLogs();
            UI.showSuccess('Logs cleared');
        }
    },

    initSettings() {
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const saveCampaignSettingsBtn = document.getElementById('saveCampaignSettingsBtn');
        
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveValidationSettings());
        if (saveCampaignSettingsBtn) saveCampaignSettingsBtn.addEventListener('click', () => this.saveCampaignSettings());
        
        this.loadSettingsToForm();
    },

    loadSettingsToForm() {
        const whitelistEl = document.getElementById('whitelistDomains');
        const blacklistEl = document.getElementById('blacklistDomains');
        const customEmailsEl = document.getElementById('customValidEmails');
        const skipMxEl = document.getElementById('skipMxCheck');
        const plusAddressEl = document.getElementById('allowPlusAddressing');
        const batchSizeEl = document.getElementById('defaultBatchSize');
        const delayEl = document.getElementById('defaultDelay');

        if (whitelistEl) whitelistEl.value = this.settings.whitelistDomains.join('\n');
        if (blacklistEl) blacklistEl.value = this.settings.blacklistDomains.join('\n');
        if (customEmailsEl) customEmailsEl.value = this.settings.customValidEmails.join('\n');
        if (skipMxEl) skipMxEl.checked = this.settings.skipMxCheck;
        if (plusAddressEl) plusAddressEl.checked = this.settings.allowPlusAddressing;
        if (batchSizeEl) batchSizeEl.value = this.settings.defaultBatchSize;
        if (delayEl) delayEl.value = this.settings.defaultDelay;
    },

    saveValidationSettings() {
        const whitelistEl = document.getElementById('whitelistDomains');
        const blacklistEl = document.getElementById('blacklistDomains');
        const customEmailsEl = document.getElementById('customValidEmails');
        const skipMxEl = document.getElementById('skipMxCheck');
        const plusAddressEl = document.getElementById('allowPlusAddressing');

        this.settings.whitelistDomains = whitelistEl.value.split('\n').map(d => d.trim().toLowerCase()).filter(d => d);
        this.settings.blacklistDomains = blacklistEl.value.split('\n').map(d => d.trim().toLowerCase()).filter(d => d);
        this.settings.customValidEmails = customEmailsEl.value.split('\n').map(e => e.trim().toLowerCase()).filter(e => e);
        this.settings.skipMxCheck = skipMxEl.checked;
        this.settings.allowPlusAddressing = plusAddressEl.checked;

        this.saveToStorage();
        UI.showSuccess('Validation settings saved!');
        this.addLog('campaign', 'Validation settings updated');
    },

    saveCampaignSettings() {
        const batchSizeEl = document.getElementById('defaultBatchSize');
        const delayEl = document.getElementById('defaultDelay');

        this.settings.defaultBatchSize = parseInt(batchSizeEl.value, 10) || 10;
        this.settings.defaultDelay = parseFloat(delayEl.value) || 2;

        this.saveToStorage();
        this.applyDefaultSettings();
        UI.showSuccess('Campaign settings saved!');
    },

    applyDefaultSettings() {
        const batchSizeEl = document.getElementById('batchSize');
        const delayEl = document.getElementById('delaySeconds');
        if (batchSizeEl) batchSizeEl.value = this.settings.defaultBatchSize;
        if (delayEl) delayEl.value = this.settings.defaultDelay;
    },

    applyCustomValidation(results) {
        return results.map(r => {
            const email = r.email.toLowerCase();
            const domain = email.split('@')[1] || '';

            if (this.settings.customValidEmails.includes(email)) {
                return { ...r, status: 'valid', reason: null };
            }
            if (this.settings.whitelistDomains.includes(domain)) {
                return { ...r, status: 'valid', reason: null };
            }
            if (this.settings.blacklistDomains.includes(domain)) {
                return { ...r, status: 'invalid', reason: 'blacklisted_domain' };
            }
            return r;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

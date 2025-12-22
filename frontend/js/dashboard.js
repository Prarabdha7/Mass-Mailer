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

    async init() {
        console.log('Dashboard.init() called');
        this.initSidebar();
        this.initTabs();
        this.initLogout();
        this.initCampaignForm();
        this.initCampaignWizard();
        this.initCampaignEditor();
        this.initTemplates();
        this.initDeliveryReport();
        this.initTestEmail();
        this.initLogs();
        this.initSettings();

        await this.loadFromStorage();
        console.log(`After loadFromStorage: this.templates.length = ${this.templates.length}`);

        this.renderCampaignGrid();
        this.renderTemplateList();
        this.populateTemplateSelect();
        this.populateWizardTemplateSelect();
        this.renderLogs();
        this.applyDefaultSettings();

        // Verify templates loaded - if still 0, try direct access to EmailTemplates
        if (this.templates.length === 0) {
            console.warn('No templates in this.templates after loading. Checking EmailTemplates directly...');
            if (typeof EmailTemplates !== 'undefined' && Array.isArray(EmailTemplates) && EmailTemplates.length > 0) {
                console.warn(`EmailTemplates array exists with ${EmailTemplates.length} items, but wasn't loaded properly. Forcing reload...`);
                this.templates = EmailTemplates.map(t => ({ ...t }));
                console.log(`Forced reload: this.templates.length = ${this.templates.length}`);
                this.renderTemplateList();
                this.populateTemplateSelect();
                this.populateWizardTemplateSelect();
            } else {
                console.error('EmailTemplates is not available or empty:', {
                    defined: typeof EmailTemplates !== 'undefined',
                    isArray: Array.isArray(EmailTemplates),
                    length: typeof EmailTemplates !== 'undefined' ? EmailTemplates.length : 'N/A'
                });
            }
        } else {
            console.log(`✓ Successfully loaded ${this.templates.length} templates`);
        }
    },

    async loadFromStorage() {
        try {
            this.campaigns = JSON.parse(localStorage.getItem('mailer_campaigns') || '[]');
            const savedSettings = JSON.parse(localStorage.getItem('mailer_settings') || '{}');
            this.settings = { ...this.settings, ...savedSettings };
        } catch (e) {
            this.campaigns = [];
        }

        // Load default templates from hardcoded array
        // Check if EmailTemplates is available (should be loaded from email-templates.js)
        if (typeof EmailTemplates === 'undefined') {
            console.error('EmailTemplates is not defined! Make sure email-templates.js is loaded before dashboard.js');
        }

        const defaultTemplates = (typeof EmailTemplates !== 'undefined' && Array.isArray(EmailTemplates) && EmailTemplates.length > 0) ?
            EmailTemplates.map(t => ({ ...t })) // Create copies to avoid mutations
            :
            [];

        // Start with default templates
        this.templates = [...defaultTemplates];
        console.log(`Initialized with ${defaultTemplates.length} default templates`, defaultTemplates.length > 0 ? '(EmailTemplates loaded)' : '(EmailTemplates empty or undefined)');

        // Load custom templates from backend
        try {
            const response = await API.getCustomTemplates();
            if (response && response.templates && Array.isArray(response.templates)) {
                const customTemplates = response.templates;
                this.templates = [...defaultTemplates, ...customTemplates];
                console.log(`Loaded ${defaultTemplates.length} default templates and ${customTemplates.length} custom templates from backend`);
            } else {
                console.warn('Backend returned invalid template format:', response);
            }
        } catch (e) {
            console.error('Failed to load custom templates from backend:', e.message || e);
            // Continue with default templates only if backend call fails
            console.log(`Using ${defaultTemplates.length} default templates only (backend unavailable)`);
        }

        // Ensure we have templates
        if (this.templates.length === 0) {
            console.error('WARNING: No templates available! EmailTemplates array may not be loaded.');
        }

        try {
            const response = await API.getLogs();
            this.logs = (response.logs || []).reverse();
        } catch (e) {
            this.logs = [];
        }
    },

    async resetTemplates() {
        if (confirm('This will remove all your custom templates. Default templates will remain. Continue?')) {
            try {
                const response = await API.getCustomTemplates();
                const customTemplates = response.templates || [];
                for (const t of customTemplates) {
                    if (t.id) await API.deleteCustomTemplate(t.id);
                }
            } catch (e) { }
            this.templates = typeof EmailTemplates !== 'undefined' ? [...EmailTemplates] : [];
            this.renderTemplateList();
            this.populateTemplateSelect();
            UI.showSuccess('Custom templates cleared! ' + this.templates.length + ' default templates loaded.');
            this.addLog('campaign', 'Custom templates cleared');
        }
    },

    getDefaultTemplates() {
        return typeof EmailTemplates !== 'undefined' ? [...EmailTemplates] : [];
    },

    saveToStorage() {
        localStorage.setItem('mailer_campaigns', JSON.stringify(this.campaigns));
        localStorage.setItem('mailer_settings', JSON.stringify(this.settings));
    },

    async addLog(type, message, details = null) {
        const log = {
            id: Date.now(),
            type: type,
            message: message,
            details: details,
            timestamp: new Date().toISOString()
        };
        this.logs.unshift(log);
        if (this.logs.length > 500) this.logs = this.logs.slice(0, 500);
        this.renderLogs();
        try {
            await API.addLog({ type, message, details });
        } catch (e) { }
    },

    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const appContainer = document.querySelector('.app-container');

        if (!sidebar || !appContainer) {
            console.error('Sidebar elements not found');
            return;
        }

        // Load saved sidebar state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            appContainer.classList.add('sidebar-collapsed');
        }

        // Toggle sidebar on button click
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');

                if (isCurrentlyCollapsed) {
                    sidebar.classList.remove('collapsed');
                    appContainer.classList.remove('sidebar-collapsed');
                    localStorage.setItem('sidebarCollapsed', 'false');
                } else {
                    sidebar.classList.add('collapsed');
                    appContainer.classList.add('sidebar-collapsed');
                    localStorage.setItem('sidebarCollapsed', 'true');
                }
            });
        } else {
            console.error('Sidebar toggle button not found');
        }
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

    // Campaign Grid for new unified view
    renderCampaignGrid() {
        const container = document.getElementById('campaignGrid');
        const countEl = document.getElementById('campaignCount');
        if (!container) return;

        if (countEl) countEl.textContent = this.campaigns.length;

        if (this.campaigns.length === 0) {
            container.innerHTML = '<p class="empty-state">No campaigns yet. Click "Create New Campaign" to get started!</p>';
            return;
        }

        container.innerHTML = this.campaigns.map(c => {
            const statusClass = c.status || 'draft';
            const createdAt = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Unknown';
            return `
                <div class="campaign-card" data-id="${c.id}">
                    <div class="campaign-card-header">
                        <div class="campaign-card-name">${this.escapeHtml(c.name || 'Untitled')}</div>
                        <div class="campaign-card-subject">${this.escapeHtml(c.subject || '')}</div>
                    </div>
                    <div class="campaign-card-body">
                        <div class="campaign-card-stats">
                            <div class="campaign-stat">
                                <span class="campaign-stat-value">${c.recipientCount || 0}</span>
                                <span class="campaign-stat-label">Recipients</span>
                            </div>
                            ${c.sent !== undefined ? `<div class="campaign-stat"><span class="campaign-stat-value">${c.sent}</span><span class="campaign-stat-label">Sent</span></div>` : ''}
                        </div>
                        <span class="campaign-card-status status-${statusClass}">${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}</span>
                        <div class="campaign-card-date">${createdAt}</div>
                    </div>
                    <div class="campaign-card-footer">
                        ${c.status === 'draft' ? `<button class="btn btn-primary" onclick="Dashboard.editCampaign('${c.id}')">Edit</button>` : ''}
                        ${c.status !== 'draft' ? `<button class="btn btn-secondary" onclick="Dashboard.viewCampaignReport('${c.id}', '${this.escapeHtml(c.name || '')}')">Report</button>` : ''}
                        <button class="btn btn-danger" onclick="Dashboard.deleteCampaign('${c.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    wizardData: { currentStep: 1, totalSteps: 6, campaignName: '', subject: '', templateType: 'default', templateContent: '', csvData: null, recipients: [], batchSize: 10, delaySeconds: 2, templateVariables: {} },

    initCampaignWizard() {
        const createBtn = document.getElementById('createCampaignBtn');
        const closeBtn = document.getElementById('closeWizardBtn');
        const nextBtn = document.getElementById('wizardNextBtn');
        const backBtn = document.getElementById('wizardBackBtn');
        const saveDraftBtn = document.getElementById('wizardSaveDraftBtn');
        const launchBtn = document.getElementById('wizardLaunchBtn');
        const wizardCsvFile = document.getElementById('wizardCsvFile');
        const wizardFileUpload = document.getElementById('wizardFileUpload');
        const wizardTemplateSelect = document.getElementById('wizardTemplateSelect');

        if (createBtn) createBtn.addEventListener('click', () => this.openWizard());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeWizard());
        if (nextBtn) nextBtn.addEventListener('click', () => this.wizardNext());
        if (backBtn) backBtn.addEventListener('click', () => this.wizardBack());
        if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => this.saveWizardDraft());
        if (launchBtn) launchBtn.addEventListener('click', () => this.launchFromWizard());

        document.querySelectorAll('.template-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.template-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                this.wizardData.templateType = opt.dataset.option;
                const area = document.getElementById('templateSelectArea');
                if (area) area.style.display = opt.dataset.option === 'default' ? 'block' : 'none';
            });
        });

        if (wizardFileUpload) {
            wizardFileUpload.addEventListener('click', () => wizardCsvFile?.click());
            wizardFileUpload.addEventListener('dragover', e => { e.preventDefault(); wizardFileUpload.classList.add('drag-over'); });
            wizardFileUpload.addEventListener('dragleave', () => wizardFileUpload.classList.remove('drag-over'));
            wizardFileUpload.addEventListener('drop', e => { e.preventDefault(); wizardFileUpload.classList.remove('drag-over'); const f = e.dataTransfer?.files[0]; if (f?.name.endsWith('.csv')) this.handleWizardCsvUpload({ target: { files: [f] } }); });
        }
        if (wizardCsvFile) wizardCsvFile.addEventListener('change', e => this.handleWizardCsvUpload(e));
        if (wizardTemplateSelect) wizardTemplateSelect.addEventListener('change', e => {
            const idx = e.target.value;
            if (idx !== '' && this.templates[idx]) {
                this.wizardData.templateContent = this.templates[idx].content;
                document.getElementById('wizardTemplate').value = this.templates[idx].content;
                this.renderWizardVariableEditor();
                this.updateWizardPreview();
            }
        });
        document.getElementById('wizardTemplate')?.addEventListener('input', () => {
            this.wizardData.templateContent = document.getElementById('wizardTemplate').value;
            this.renderWizardVariableEditor();
            this.updateWizardPreview();
        });

        // Visual Edit button - opens placeholder editor
        const visualEditBtn = document.getElementById('wizardVisualEditBtn');
        if (visualEditBtn) {
            visualEditBtn.addEventListener('click', () => {
                this.openWizardPlaceholderEditor();
            });
        }

        // Theme Edit button - opens theme editor
        const themeEditBtn = document.getElementById('wizardThemeEditBtn');
        if (themeEditBtn) {
            themeEditBtn.addEventListener('click', () => {
                this.openWizardThemeEditor();
            });
        }

        // Recipient mode toggle (CSV vs Manual)
        document.querySelectorAll('.recipient-mode-toggle .mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.recipient-mode-toggle .mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.dataset.mode;
                document.getElementById('csvUploadMode').style.display = mode === 'csv' ? 'block' : 'none';
                document.getElementById('manualEntryMode').style.display = mode === 'manual' ? 'block' : 'none';
                this.wizardData.recipientMode = mode;
            });
        });

        // Add recipient button
        const addRecipientBtn = document.getElementById('addRecipientBtn');
        if (addRecipientBtn) {
            addRecipientBtn.addEventListener('click', () => this.addManualRecipientRow());
        }

        // Remove recipient (event delegation)
        const recipientsList = document.getElementById('manualRecipientsList');
        if (recipientsList) {
            recipientsList.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-remove-recipient')) {
                    const row = e.target.closest('.manual-recipient-row');
                    if (recipientsList.children.length > 1) {
                        row.remove();
                    } else {
                        row.querySelectorAll('input').forEach(inp => inp.value = '');
                    }
                }
            });
        }
    },

    addManualRecipientRow() {
        const list = document.getElementById('manualRecipientsList');
        if (!list) return;
        const row = document.createElement('div');
        row.className = 'manual-recipient-row';
        row.innerHTML = `
            <input type="text" class="recipient-name" placeholder="Name">
            <input type="email" class="recipient-email" placeholder="Email address">
            <button type="button" class="btn-remove-recipient" title="Remove">×</button>
        `;
        list.appendChild(row);
        row.querySelector('.recipient-name').focus();
    },

    collectManualRecipients() {
        const rows = document.querySelectorAll('.manual-recipient-row');
        const recipients = [];
        rows.forEach(row => {
            const name = row.querySelector('.recipient-name')?.value.trim() || '';
            const email = row.querySelector('.recipient-email')?.value.trim() || '';
            if (email) {
                recipients.push({ name, email, variables: { name, email } });
            }
        });
        return recipients;
    },


    openWizardPlaceholderEditor() {
        const content = document.getElementById('wizardTemplate')?.value || '';
        const placeholders = content.match(/\{\{(\w+)\}\}/g) || [];
        const uniquePlaceholders = [...new Set(placeholders.map(p => p.replace(/\{\{|\}\}/g, '')))];

        if (uniquePlaceholders.length === 0) {
            UI.showError('No placeholders found in template. Add {{placeholder}} to your template.');
            return;
        }

        let html = '<div class="preview-variables-grid">';
        uniquePlaceholders.forEach(key => {
            const value = this.previewData[key] || '';
            html += `<div class="preview-var-item">
                <label>${key}</label>
                <input type="text" data-key="${key}" value="${this.escapeHtml(value)}" class="wizard-placeholder-input">
            </div>`;
        });
        html += '</div>';

        const modal = document.createElement('div');
        modal.id = 'wizardPlaceholderModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <h3>Edit Placeholder Values</h3>
                <p class="modal-description">Set values for placeholders to see how your email will look.</p>
                ${html}
                <div class="modal-actions">
                    <button id="applyWizardPlaceholders" class="btn btn-primary">Apply & Preview</button>
                    <button id="cancelWizardPlaceholders" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('applyWizardPlaceholders').addEventListener('click', () => {
            modal.querySelectorAll('.wizard-placeholder-input').forEach(input => {
                this.previewData[input.dataset.key] = input.value;
            });
            this.updateWizardPreview();
            modal.remove();
            UI.showSuccess('Placeholders updated!');
        });

        document.getElementById('cancelWizardPlaceholders').addEventListener('click', () => modal.remove());
    },

    openWizardThemeEditor() {
        const content = document.getElementById('wizardTemplate')?.value || '';

        // Extract current colors from template
        const bgColorMatch = content.match(/background(?:-color)?:\s*(#[a-fA-F0-9]{3,6}|rgb[a]?\([^)]+\))/i);
        const textColorMatch = content.match(/(?<!background-)color:\s*(#[a-fA-F0-9]{3,6}|rgb[a]?\([^)]+\))/i);
        const btnColorMatch = content.match(/class="[^"]*(?:btn|button|cta)[^"]*"[^>]*style="[^"]*background(?:-color)?:\s*(#[a-fA-F0-9]{3,6})/i) ||
            content.match(/background(?:-color)?:\s*(#[a-fA-F0-9]{3,6})[^>]*>.*(?:Get Started|Learn more|Click|Button)/i);

        const currentBg = bgColorMatch ? bgColorMatch[1] : '#ffffff';
        const currentText = textColorMatch ? textColorMatch[1] : '#333333';
        const currentBtn = btnColorMatch ? btnColorMatch[1] : '#007bff';

        const modal = document.createElement('div');
        modal.id = 'wizardThemeModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content modal-large">
                <h3>Edit Theme</h3>
                <p class="modal-description">Customize colors and styles for your email template.</p>
                <div class="theme-editor-grid">
                    <div class="theme-section">
                        <h4>Colors</h4>
                        <div class="theme-field">
                            <label>Background Color</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="themeBgColor" value="${this.normalizeColor(currentBg)}">
                                <input type="text" id="themeBgColorText" value="${currentBg}" placeholder="#ffffff">
                            </div>
                        </div>
                        <div class="theme-field">
                            <label>Text Color</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="themeTextColor" value="${this.normalizeColor(currentText)}">
                                <input type="text" id="themeTextColorText" value="${currentText}" placeholder="#333333">
                            </div>
                        </div>
                        <div class="theme-field">
                            <label>Button/CTA Color</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="themeBtnColor" value="${this.normalizeColor(currentBtn)}">
                                <input type="text" id="themeBtnColorText" value="${currentBtn}" placeholder="#007bff">
                            </div>
                        </div>
                    </div>
                    <div class="theme-section">
                        <h4>Typography</h4>
                        <div class="theme-field">
                            <label>Font Family</label>
                            <select id="themeFontFamily">
                                <option value="">Keep Original</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="'Times New Roman', serif">Times New Roman</option>
                                <option value="Verdana, sans-serif">Verdana</option>
                                <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System UI</option>
                            </select>
                        </div>
                        <div class="theme-field">
                            <label>Base Font Size</label>
                            <select id="themeFontSize">
                                <option value="">Keep Original</option>
                                <option value="14px">14px - Small</option>
                                <option value="16px">16px - Normal</option>
                                <option value="18px">18px - Large</option>
                                <option value="20px">20px - Extra Large</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button id="applyWizardTheme" class="btn btn-primary">Apply Theme</button>
                    <button id="cancelWizardTheme" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Sync color pickers with text inputs
        ['Bg', 'Text', 'Btn'].forEach(type => {
            const colorInput = document.getElementById(`theme${type}Color`);
            const textInput = document.getElementById(`theme${type}ColorText`);
            colorInput.addEventListener('input', () => textInput.value = colorInput.value);
            textInput.addEventListener('input', () => { if (/^#[a-fA-F0-9]{6}$/.test(textInput.value)) colorInput.value = textInput.value; });
        });

        document.getElementById('applyWizardTheme').addEventListener('click', () => {
            let newContent = document.getElementById('wizardTemplate').value;

            const bgColor = document.getElementById('themeBgColorText').value;
            const textColor = document.getElementById('themeTextColorText').value;
            const btnColor = document.getElementById('themeBtnColorText').value;
            const fontFamily = document.getElementById('themeFontFamily').value;
            const fontSize = document.getElementById('themeFontSize').value;

            // Apply color changes
            if (bgColor) newContent = newContent.replace(/background(-color)?:\s*#[a-fA-F0-9]{3,6}/gi, `background$1: ${bgColor}`);
            if (textColor) newContent = newContent.replace(/(?<!background-)color:\s*#[a-fA-F0-9]{3,6}/gi, `color: ${textColor}`);
            if (btnColor) {
                // For button backgrounds specifically
                newContent = newContent.replace(/(class="[^"]*(?:btn|button|cta)[^"]*"[^>]*style="[^"]*background(?:-color)?:\s*)#[a-fA-F0-9]{3,6}/gi, `$1${btnColor}`);
            }

            // Apply font changes
            if (fontFamily) {
                if (newContent.includes('font-family:')) {
                    newContent = newContent.replace(/font-family:[^;]+;/gi, `font-family: ${fontFamily};`);
                } else if (newContent.includes('<body')) {
                    newContent = newContent.replace(/<body([^>]*)>/i, `<body$1 style="font-family: ${fontFamily};">`);
                }
            }
            if (fontSize) {
                if (newContent.includes('font-size:')) {
                    newContent = newContent.replace(/font-size:\s*\d+px/gi, `font-size: ${fontSize}`);
                }
            }

            document.getElementById('wizardTemplate').value = newContent;
            this.updateWizardPreview();
            modal.remove();
            UI.showSuccess('Theme applied!');
        });

        document.getElementById('cancelWizardTheme').addEventListener('click', () => modal.remove());
    },

    normalizeColor(color) {
        if (!color) return '#ffffff';
        if (color.startsWith('#') && color.length === 4) {
            return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        if (color.startsWith('#') && color.length === 7) return color;
        return '#ffffff';
    },


    initCampaignEditor() {
        const backBtn = document.getElementById('backToListBtn');
        const editorForm = document.getElementById('campaignEditorForm');
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        const editTemplateSelect = document.getElementById('editTemplateSelect');
        const editCsvFile = document.getElementById('editCsvFile');

        if (backBtn) backBtn.addEventListener('click', () => this.showCampaignList());
        if (editorForm) editorForm.addEventListener('submit', e => this.handleEditorSubmit(e));
        if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => this.saveEditorDraft());
        if (editTemplateSelect) editTemplateSelect.addEventListener('change', e => { const idx = e.target.value; if (idx !== '' && this.templates[idx]) document.getElementById('editTemplate').value = this.templates[idx].content; });
        if (editCsvFile) editCsvFile.addEventListener('change', e => this.handleEditorCsvUpload(e));
    },

    populateWizardTemplateSelect() {
        ['wizardTemplateSelect', 'editTemplateSelect'].forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            sel.innerHTML = '<option value="">-- Choose template --</option>';
            this.templates.forEach((t, i) => {
                const o = document.createElement('option');
                o.value = i;
                o.textContent = t.description ? `${t.name} - ${t.description}` : t.name;
                sel.appendChild(o);
            });
        });
    },

    openWizard() {
        const modal = document.getElementById('campaignWizardModal');
        if (!modal) return;
        modal.style.display = 'flex';
        this.wizardData = { currentStep: 1, totalSteps: 6, campaignName: '', subject: '', templateType: 'default', templateContent: '', csvData: null, recipients: [], batchSize: 10, delaySeconds: 2, templateVariables: {} };
        document.getElementById('wizardCampaignName').value = '';
        document.getElementById('wizardSubject').value = '';
        document.getElementById('wizardTemplate').value = '';
        document.getElementById('wizardCsvPreview').innerHTML = '';
        const varEditor = document.getElementById('wizardVariableEditor');
        if (varEditor) varEditor.style.display = 'none';
        this.updateWizardStep();
        document.getElementById('wizardCampaignName')?.focus();
    },

    closeWizard() { const m = document.getElementById('campaignWizardModal'); if (m) m.style.display = 'none'; },

    wizardNext() {
        const s = this.wizardData.currentStep;
        if (s === 1) { const n = document.getElementById('wizardCampaignName')?.value.trim(); if (!n) { UI.showError('Enter campaign name'); return; } this.wizardData.campaignName = n; }
        else if (s === 2) { const n = document.getElementById('wizardSubject')?.value.trim(); if (!n) { UI.showError('Enter subject'); return; } this.wizardData.subject = n; }
        else if (s === 4) { const t = document.getElementById('wizardTemplate')?.value.trim(); if (!t) { UI.showError('Create or select template'); return; } this.wizardData.templateContent = t; }
        else if (s === 5) {
            // Check if manual mode and collect recipients
            // Also check if user typed in manual fields even without clicking the toggle
            const manualRecipients = this.collectManualRecipients();

            if (this.wizardData.recipientMode === 'manual' || manualRecipients.length > 0) {
                // Manual mode or user has entered manual recipients
                if (manualRecipients.length === 0) {
                    UI.showError('Add at least one recipient with email');
                    return;
                }
                this.wizardData.recipients = manualRecipients;
            } else if (this.wizardData.recipients.length === 0) {
                // CSV mode but no CSV uploaded
                UI.showError('Upload CSV or add recipients manually');
                return;
            }
        }
        if (s < this.wizardData.totalSteps) { this.wizardData.currentStep++; this.updateWizardStep(); }
    },

    wizardBack() { if (this.wizardData.currentStep > 1) { this.wizardData.currentStep--; this.updateWizardStep(); } },

    updateWizardStep() {
        const s = this.wizardData.currentStep;
        document.querySelectorAll('.wizard-step').forEach(el => { const n = parseInt(el.dataset.step); el.classList.remove('active', 'completed'); if (n === s) el.classList.add('active'); else if (n < s) el.classList.add('completed'); });
        document.querySelectorAll('.wizard-panel').forEach(p => { p.classList.toggle('active', parseInt(p.dataset.step) === s); });
        document.getElementById('wizardBackBtn').style.display = s > 1 ? '' : 'none';
        document.getElementById('wizardNextBtn').style.display = s < 6 ? '' : 'none';
        document.getElementById('wizardLaunchBtn').style.display = s === 6 ? '' : 'none';

        if (s === 6) {
            // Populate review with all wizard data
            document.getElementById('reviewCampaignName').textContent = this.wizardData.campaignName || '-';
            document.getElementById('reviewSubject').textContent = this.wizardData.subject || '-';

            // Show recipient count with valid/invalid breakdown
            const validRecipients = this.wizardData.recipients.filter(r => r.validationStatus !== 'invalid').length;
            const totalRecipients = this.wizardData.recipients.length;
            if (validRecipients < totalRecipients) {
                document.getElementById('reviewRecipients').innerHTML = `<span style="color:#7cb97c">${validRecipients} valid</span> / ${totalRecipients} total`;
            } else {
                document.getElementById('reviewRecipients').textContent = totalRecipients + ' recipients';
            }

            // Show template variables if any were set
            const varCount = Object.keys(this.wizardData.templateVariables || {}).length;
            const varsEl = document.getElementById('reviewTemplateVars');
            if (varsEl) {
                if (varCount > 0) {
                    varsEl.innerHTML = Object.entries(this.wizardData.templateVariables)
                        .slice(0, 3)
                        .map(([k, v]) => `<span class="review-var"><code>{{${k}}}</code>: ${this.escapeHtml(v.substring(0, 30))}${v.length > 30 ? '...' : ''}</span>`)
                        .join('') + (varCount > 3 ? `<span class="review-var-more">+${varCount - 3} more</span>` : '');
                } else {
                    varsEl.textContent = 'None set';
                }
            }
        }
    },

    updateWizardPreview() {
        const content = document.getElementById('wizardTemplate')?.value || '';
        const iframe = document.getElementById('wizardTemplatePreview');
        if (!iframe) return;

        // Replace placeholders with templateVariables first, then previewData as fallback
        let rendered = content;
        const placeholders = content.match(/\{\{(\w+)\}\}/g) || [];
        placeholders.forEach(p => {
            const key = p.replace(/\{\{|\}\}/g, '');
            // Use templateVariables (user-provided) first, then previewData (defaults), then keep placeholder
            let value = this.wizardData.templateVariables[key] || this.previewData[key] || `{{${key}}}`;

            // If value is "none" (case insensitive), remove the placeholder entirely
            if (value.toLowerCase() === 'none') {
                value = '';
            }

            rendered = rendered.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        });

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open(); doc.write(rendered); doc.close();
    },

    renderWizardVariableEditor() {
        const content = document.getElementById('wizardTemplate')?.value || '';
        const editorPanel = document.getElementById('wizardVariableEditor');
        const variableList = document.getElementById('wizardVariableList');
        if (!editorPanel || !variableList) return;

        // Extract placeholders from template
        const placeholderMatches = content.match(/\{\{(\w+)\}\}/g) || [];
        const placeholders = [...new Set(placeholderMatches.map(p => p.replace(/\{\{|\}\}/g, '')))];

        // Filter out name and email (these come from CSV)
        const csvVariables = ['name', 'email'];
        const editableVars = placeholders.filter(p => !csvVariables.includes(p.toLowerCase()));

        if (editableVars.length === 0) {
            editorPanel.style.display = 'none';
            return;
        }

        editorPanel.style.display = 'block';

        // Build variable editor HTML
        let html = '';
        editableVars.forEach(varName => {
            const currentValue = this.wizardData.templateVariables[varName] || this.previewData[varName] || '';
            const isLongText = varName.includes('text') || varName.includes('description') || varName.includes('message');

            html += `<div class="variable-item">
                <label><code>{{${varName}}}</code> ${this.formatVarLabel(varName)}</label>
                ${isLongText
                    ? `<textarea data-var="${varName}" placeholder="Enter ${this.formatVarLabel(varName).toLowerCase()}">${this.escapeHtml(currentValue)}</textarea>`
                    : `<input type="text" data-var="${varName}" value="${this.escapeHtml(currentValue)}" placeholder="Enter ${this.formatVarLabel(varName).toLowerCase()}">`
                }
            </div>`;
        });

        variableList.innerHTML = html;

        // Add event listeners to save values
        variableList.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', (e) => {
                const varName = e.target.dataset.var;
                this.wizardData.templateVariables[varName] = e.target.value;
                this.updateWizardPreview();
            });
        });
    },

    formatVarLabel(varName) {
        return varName
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim();
    },


    async handleWizardCsvUpload(e) {
        const file = e.target.files?.[0]; if (!file) return;
        const preview = document.getElementById('wizardCsvPreview');
        if (preview) preview.innerHTML = '<p class="loading">Parsing and validating emails...</p>';

        try {
            const csv = await Campaign.parseCSV(file);
            this.wizardData.csvData = csv;
            const emailCol = csv.headers.find(h => h.toLowerCase().includes('email')) || csv.headers[0];
            const nameCol = csv.headers.find(h => h.toLowerCase().includes('name')) || csv.headers[1] || csv.headers[0];
            this.wizardData.recipients = Campaign.extractRecipients(csv.rows, emailCol, nameCol);

            // Validate emails
            const emails = this.wizardData.recipients.map(r => r.email);
            let validationResults = [];

            try {
                const response = await API.validateEmails(emails);
                validationResults = this.applyCustomValidation(response.results || response);
            } catch (err) {
                // If validation fails, mark all as valid (fallback)
                validationResults = emails.map(email => ({ email, status: 'valid', reason: null }));
            }

            const valid = validationResults.filter(r => r.status === 'valid');
            const invalid = validationResults.filter(r => r.status !== 'valid');

            // Mark recipients with validation status
            this.wizardData.recipients = this.wizardData.recipients.map(r => {
                const result = validationResults.find(v => v.email === r.email);
                return { ...r, validationStatus: result?.status || 'valid', validationReason: result?.reason };
            });

            // Build preview HTML
            let html = `
                <div class="recipient-validation-summary">
                    <div class="validation-stat valid">
                        <span class="stat-number">${valid.length}</span>
                        <span class="stat-label">Valid</span>
                    </div>
                    <div class="validation-stat invalid">
                        <span class="stat-number">${invalid.length}</span>
                        <span class="stat-label">Invalid</span>
                    </div>
                    <div class="validation-stat total">
                        <span class="stat-number">${validationResults.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                </div>
            `;

            // Show first few recipients preview
            const previewRecipients = this.wizardData.recipients.slice(0, 8);
            html += `<div class="recipient-preview-list">`;
            previewRecipients.forEach(r => {
                const isValid = r.validationStatus === 'valid';
                html += `
                    <div class="recipient-preview-item ${isValid ? 'valid' : 'invalid'}">
                        <span class="recipient-email">${this.escapeHtml(r.email)}</span>
                        <span class="recipient-name">${this.escapeHtml(r.name || '')}</span>
                        <span class="recipient-status ${isValid ? 'status-valid' : 'status-invalid'}">${isValid ? '✓' : '✗'}</span>
                    </div>
                `;
            });
            if (this.wizardData.recipients.length > 8) {
                html += `<div class="recipient-preview-more">+${this.wizardData.recipients.length - 8} more recipients</div>`;
            }
            html += `</div>`;

            if (invalid.length > 0) {
                html += `<p class="validation-warning">⚠️ ${invalid.length} invalid email(s) will be skipped when sending.</p>`;
            }

            if (preview) preview.innerHTML = html;
        } catch (err) {
            if (preview) preview.innerHTML = `<p class="error">${err.message}</p>`;
        }
    },

    saveWizardDraft() {
        const name = document.getElementById('wizardCampaignName')?.value.trim() || 'Untitled';
        const campaign = { id: 'draft_' + Date.now(), name, subject: document.getElementById('wizardSubject')?.value.trim() || '', template: document.getElementById('wizardTemplate')?.value || '', recipientCount: this.wizardData.recipients.length, createdAt: new Date().toISOString(), status: 'draft', recipients: this.wizardData.recipients, batchSize: 10, delaySeconds: 2 };
        this.campaigns.unshift(campaign); this.saveToStorage(); this.renderCampaignGrid(); this.closeWizard(); UI.showSuccess('Draft saved!');
    },

    async launchFromWizard() {
        if (!this.wizardData.campaignName || !this.wizardData.subject || !this.wizardData.templateContent || !this.wizardData.recipients.length) {
            UI.showError('Complete all steps');
            return;
        }

        // Merge template variables with each recipient's variables
        const recipientsWithVars = this.wizardData.recipients.map(r => ({
            ...r,
            variables: { ...this.wizardData.templateVariables, ...r.variables }
        }));

        // Set pending form data for sendCampaign
        this.pendingFormData = {
            name: this.wizardData.campaignName,
            subject: this.wizardData.subject,
            template: this.wizardData.templateContent,
            recipients: recipientsWithVars,
            batch_size: parseInt(document.getElementById('wizardBatchSize')?.value) || 10,
            delay_seconds: parseFloat(document.getElementById('wizardDelaySeconds')?.value) || 2
        };

        // Show step 7 (Sending) in wizard
        this.wizardData.currentStep = 7;
        this.wizardData.totalSteps = 7;
        this.updateWizardStep();

        // Initialize wizard sending stats (only count valid recipients)
        const validCount = recipientsWithVars.filter(r => r.validationStatus !== 'invalid').length;
        document.getElementById('wizardTotalCount').textContent = validCount;
        document.getElementById('wizardSentCount').textContent = '0';
        document.getElementById('wizardFailedCount').textContent = '0';
        document.getElementById('wizardProgressFill').style.width = '0%';
        document.getElementById('wizardSendingMessage').textContent = `Sending ${validCount} emails...`;

        // Hide footer buttons during sending
        document.getElementById('wizardBackBtn').style.display = 'none';
        document.getElementById('wizardNextBtn').style.display = 'none';
        document.getElementById('wizardLaunchBtn').style.display = 'none';
        document.getElementById('wizardSaveDraftBtn').style.display = 'none';

        // Send the campaign
        await this.sendCampaignFromWizard(recipientsWithVars);
    },

    async sendCampaignFromWizard(recipients) {
        const { name, subject, template, batch_size, delay_seconds } = this.pendingFormData;

        // Filter to only valid recipients
        const validRecipients = recipients.filter(r => r.validationStatus !== 'invalid');

        try {
            const result = await API.sendCampaign({ subject, template, recipients: validRecipients, batch_size, delay_seconds });
            this.currentCampaignId = result.campaign_id;

            const campaign = {
                id: result.campaign_id,
                name: name,
                subject: subject,
                recipientCount: validRecipients.length,
                createdAt: new Date().toISOString(),
                status: 'running'
            };
            this.campaigns.unshift(campaign);
            this.saveToStorage();
            this.addLog('campaign', 'Campaign started: ' + name, validRecipients.length + ' valid recipients');

            // Start polling for status updates in wizard
            this.startWizardPolling();
        } catch (err) {
            document.getElementById('wizardSendingMessage').textContent = 'Failed: ' + err.message;
            UI.showError('Failed to send campaign: ' + err.message);
        }
    },

    startWizardPolling() {
        if (this.wizardPollInterval) clearInterval(this.wizardPollInterval);
        this.wizardPollInterval = setInterval(() => this.pollWizardStatus(), 2000);
        this.pollWizardStatus();
    },

    async pollWizardStatus() {
        if (!this.currentCampaignId) return;

        try {
            const status = await API.getCampaignStatus(this.currentCampaignId);

            // Update wizard UI
            const total = status.total || 0;
            const sent = status.sent || 0;
            const failed = status.failed || 0;
            const progress = total > 0 ? ((sent + failed) / total * 100) : 0;

            document.getElementById('wizardSentCount').textContent = sent;
            document.getElementById('wizardFailedCount').textContent = failed;
            document.getElementById('wizardProgressFill').style.width = progress + '%';
            document.getElementById('wizardSendingMessage').textContent = `Sending emails... ${sent + failed}/${total}`;

            if (status.status === 'completed' || status.status === 'failed') {
                clearInterval(this.wizardPollInterval);
                this.wizardPollInterval = null;

                // Hide spinner
                const spinnerWrapper = document.querySelector('.wizard-panel[data-step="7"] .sending-animation');
                if (spinnerWrapper) spinnerWrapper.style.display = 'none';

                // Update campaign record
                const campaign = this.campaigns.find(c => c.id === this.currentCampaignId);
                if (campaign) {
                    campaign.status = status.status;
                    campaign.sent = sent;
                    campaign.failed = failed;
                    this.saveToStorage();
                }

                if (status.status === 'completed') {
                    document.getElementById('wizardSendingMessage').innerHTML = `<span style="color:#7cb97c">✓ Campaign completed!</span>`;
                    UI.showSuccess('Campaign completed!');
                    this.addLog('campaign', 'Campaign completed', 'Sent: ' + sent + ', Failed: ' + failed);
                } else {
                    document.getElementById('wizardSendingMessage').innerHTML = `<span style="color:#c97c7c">✗ Campaign failed</span>`;
                    UI.showError('Campaign failed');
                }

                // Show close button
                document.getElementById('closeWizardBtn').style.display = 'block';
            }
        } catch (err) {
            document.getElementById('wizardSendingMessage').textContent = 'Error checking status';
        }
    },

    showCampaignList() { document.getElementById('campaignListView').style.display = 'block'; document.getElementById('campaignEditorView').style.display = 'none'; },
    showEditorView() { document.getElementById('campaignListView').style.display = 'none'; document.getElementById('campaignEditorView').style.display = 'block'; },

    editCampaign(id) {
        const c = this.campaigns.find(x => x.id === id); if (!c) return;
        this.currentEditingCampaign = c;
        document.getElementById('editCampaignId').value = id;
        document.getElementById('editCampaignName').value = c.name || '';
        document.getElementById('editSubject').value = c.subject || '';
        document.getElementById('editTemplate').value = c.template || '';
        document.getElementById('editBatchSize').value = c.batchSize || 10;
        document.getElementById('editDelaySeconds').value = c.delaySeconds || 2;
        document.getElementById('editorCampaignTitle').textContent = 'Edit: ' + (c.name || 'Campaign');
        this.editRecipients = c.recipients || [];
        const p = document.getElementById('editCsvPreview'); if (p && this.editRecipients.length) p.innerHTML = `<p class="success">✓ ${this.editRecipients.length} recipients</p>`;
        this.showEditorView();
    },

    deleteCampaign(id) { if (confirm('Delete this campaign?')) { this.campaigns = this.campaigns.filter(c => c.id !== id); this.saveToStorage(); this.renderCampaignGrid(); UI.showSuccess('Deleted'); } },
    viewCampaignReport(id, name) { this.showEditorView(); this.viewReport(id, name); },

    async handleEditorCsvUpload(e) {
        const file = e.target.files?.[0]; if (!file) return;
        const preview = document.getElementById('editCsvPreview');
        try {
            const csv = await Campaign.parseCSV(file);
            const emailCol = csv.headers.find(h => h.toLowerCase().includes('email')) || csv.headers[0];
            const nameCol = csv.headers.find(h => h.toLowerCase().includes('name')) || csv.headers[1] || csv.headers[0];
            this.editRecipients = Campaign.extractRecipients(csv.rows, emailCol, nameCol);
            if (preview) preview.innerHTML = `<p class="success">✓ ${csv.rows.length} recipients</p>`;
        } catch (err) { if (preview) preview.innerHTML = `<p class="error">${err.message}</p>`; }
    },

    saveEditorDraft() {
        const id = document.getElementById('editCampaignId')?.value;
        const c = this.campaigns.find(x => x.id === id); if (!c) return;
        c.name = document.getElementById('editCampaignName')?.value.trim() || c.name;
        c.subject = document.getElementById('editSubject')?.value.trim() || c.subject;
        c.template = document.getElementById('editTemplate')?.value || c.template;
        c.batchSize = parseInt(document.getElementById('editBatchSize')?.value) || 10;
        c.delaySeconds = parseFloat(document.getElementById('editDelaySeconds')?.value) || 2;
        c.recipients = this.editRecipients || c.recipients;
        c.recipientCount = (c.recipients || []).length;
        this.saveToStorage(); this.renderCampaignGrid(); UI.showSuccess('Draft saved!');
    },

    async handleEditorSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('editCampaignName')?.value.trim();
        const subject = document.getElementById('editSubject')?.value.trim();
        const template = document.getElementById('editTemplate')?.value.trim();
        if (!name || !subject || !template) { UI.showError('Fill required fields'); return; }
        if (!this.editRecipients?.length) { UI.showError('Upload CSV'); return; }
        this.pendingFormData = { name, subject, template, recipients: this.editRecipients, batch_size: parseInt(document.getElementById('editBatchSize')?.value) || 10, delay_seconds: parseFloat(document.getElementById('editDelaySeconds')?.value) || 2 };
        await this.validateEmails(this.editRecipients);
    },



    async loadDeliveryReport(campaignId) {
        try {
            const response = await API.getDeliveryReport(campaignId);
            const records = response.records || response;
            this.allDeliveryRecords = records;
            document.getElementById('reportPanel').style.display = 'block';
            UI.renderDeliveryReport(records);
            UI.showTab('campaigns');
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
        const resetBtn = document.getElementById('resetTemplatesBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const formatCodeBtn = document.getElementById('formatCodeBtn');
        const copyCodeBtn = document.getElementById('copyCodeBtn');
        const previewDevice = document.getElementById('previewDevice');
        const editPreviewDataBtn = document.getElementById('editPreviewDataBtn');
        const applyPreviewDataBtn = document.getElementById('applyPreviewDataBtn');
        const cancelPreviewDataBtn = document.getElementById('cancelPreviewDataBtn');
        const templateContent = document.getElementById('templateContent');

        if (templateForm) templateForm.addEventListener('submit', (e) => this.saveTemplate(e));
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetTemplates());
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => this.cancelTemplateEdit());
        if (formatCodeBtn) formatCodeBtn.addEventListener('click', () => this.formatTemplateCode());
        if (copyCodeBtn) copyCodeBtn.addEventListener('click', () => this.copyTemplateCode());
        if (previewDevice) previewDevice.addEventListener('change', (e) => this.changePreviewDevice(e.target.value));
        if (editPreviewDataBtn) editPreviewDataBtn.addEventListener('click', () => this.openPreviewDataModal());
        if (applyPreviewDataBtn) applyPreviewDataBtn.addEventListener('click', () => this.applyPreviewData());
        if (cancelPreviewDataBtn) cancelPreviewDataBtn.addEventListener('click', () => this.closePreviewDataModal());

        if (templateContent) {
            templateContent.addEventListener('input', () => this.updateTemplatePreview());
            templateContent.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = templateContent.selectionStart;
                    const end = templateContent.selectionEnd;
                    templateContent.value = templateContent.value.substring(0, start) + '    ' + templateContent.value.substring(end);
                    templateContent.selectionStart = templateContent.selectionEnd = start + 4;
                }
            });
        }

        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => this.changeEditorView(tab.dataset.view));
        });

        this.previewData = {
            name: 'John Doe',
            email: 'john@example.com',
            company_name: 'Acme Inc',
            company_address: '123 Main St, San Francisco, CA 94102',
            cta_link: 'https://example.com',
            cta_text: 'Get Started',
            unsubscribe_link: 'https://example.com/unsubscribe',
            privacy_link: 'https://example.com/privacy',
            support_email: 'support@example.com',
            amount: '99.00',
            payment_date: 'December 20, 2024',
            payment_method: 'Visa •••• 4242',
            item_name: 'Pro Plan - Monthly',
            item_price: '99.00',
            headline: 'Something amazing is here',
            subheadline: 'Discover the future of productivity with our latest innovation.',
            intro_text: 'We have some exciting news to share with you.',
            feature_title: 'New Feature',
            feature_description: 'An incredible new capability that will transform your workflow.',
            secondary_link: 'https://example.com/learn',
            inviter_name: 'Sarah Johnson',
            workspace_name: 'Design Team',
            page_icon: '📄',
            page_title: 'Q4 Planning Document',
            page_description: 'Strategic planning for the upcoming quarter',
            project_name: 'my-awesome-app',
            deployment_message: 'Your latest changes are now live.',
            branch: 'main',
            commit_hash: 'a1b2c3d',
            duration: '45s',
            preview_link: 'https://preview.example.com',
            dashboard_link: 'https://dashboard.example.com',
            settings_link: 'https://example.com/settings',
            commenter_name: 'Alex Chen',
            file_name: 'Homepage Design v2',
            comment_text: 'Love the new color scheme! Can we try a slightly darker shade for the CTA button?',
            reply_link: 'https://example.com/reply',
            view_link: 'https://example.com/view',
            digest_title: 'Here is what you missed',
            highlight_title: 'New Integration Available',
            highlight_description: 'Connect your favorite tools and automate your workflow.',
            highlight_2_title: 'Performance Improvements',
            highlight_2_description: 'We have made everything 2x faster.',
            stat_1: '127',
            stat_1_label: 'Tasks Done',
            stat_2: '89%',
            stat_2_label: 'On Track',
            stat_3: '12',
            stat_3_label: 'Projects',
            currency: '$',
            recipient_name: 'Jane Smith',
            transaction_date: 'Dec 20, 2024 at 2:30 PM',
            reference: 'TXN-2024-ABC123',
            note: 'Dinner payment',
            receipt_link: 'https://example.com/receipt',
            workspace_name: 'Acme Corp',
            notification_type: 'New message',
            sender_initial: 'S',
            sender_name: 'Sarah',
            action_text: 'mentioned you in',
            channel_name: '#general',
            time_ago: '2 minutes ago',
            message_preview: 'Hey @john, can you review the latest designs when you get a chance?',
            feature_1_title: 'Lightning Fast',
            feature_1_desc: 'Built for speed and performance.',
            feature_2_title: 'Secure',
            feature_2_desc: 'Enterprise-grade security.',
            feature_3_title: 'Scalable',
            feature_3_desc: 'Grows with your business.',
            sale_label: 'End of Season',
            sale_description: 'Our biggest sale of the year. Do not miss out on incredible savings.',
            discount: '50',
            promo_code: 'SAVE50',
            shop_link: 'https://example.com/shop',
            event_name: 'Annual Conference 2025',
            event_date: 'January 15, 2025',
            event_time: '2:00 PM EST',
            event_venue: 'Grand Hotel, New York',
            product_name: 'Product Pro',
            product_tagline: 'The future is here',
            expiry_date: 'December 31, 2025',
            sender_title: 'Marketing Manager',
            meeting_date: 'December 20, 2024',
            meeting_time: '10:00 AM',
            reminder_subject: 'Your subscription renewal',
            due_date: 'December 25, 2024',
            time_remaining: '5 days',
            feedback_link: 'https://example.com/feedback'
        };

        this.editingTemplateIndex = null;
    },

    changeEditorView(view) {
        document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.editor - tab[data - view="${view}"]`).classList.add('active');

        const container = document.getElementById('editorContainer');
        container.classList.remove('code-only', 'preview-only', 'visual-mode');

        if (view === 'code') container.classList.add('code-only');
        if (view === 'preview') container.classList.add('preview-only');
        if (view === 'visual') {
            container.classList.add('visual-mode');
            this.renderVisualEditor();
        }
    },

    renderVisualEditor() {
        const content = document.getElementById('templateContent').value;
        const container = document.getElementById('visualEditorContent');

        if (!content.trim()) {
            container.innerHTML = '<p class="empty-state">Load a template first to edit its text content</p>';
            return;
        }

        const textElements = this.extractTextElements(content);

        if (textElements.length === 0) {
            container.innerHTML = '<p class="empty-state">No editable text found in this template</p>';
            return;
        }

        let html = '<div class="visual-section"><div class="visual-section-title"><span class="section-icon">📝</span> Editable Text Content</div>';

        textElements.forEach((el, idx) => {
            const fieldType = el.tag.match(/^h[1-6]$/i) ? 'heading' : (el.tag === 'a' ? 'link' : 'paragraph');
            const typeLabel = el.tag.match(/^h[1-6]$/i) ? `Heading ${el.tag.charAt(1)} ` : (el.tag === 'a' ? 'Link Text' : 'Text');
            const placeholders = el.text.match(/\{\{(\w+)\}\}/g) || [];
            const placeholderTags = placeholders.map(p => `< span class="visual-placeholder-tag" > ${p}</span > `).join('');

            html += `
    < div class="visual-field" data - index="${idx}" >
        <div class="visual-field-label">
            <span>${typeLabel}</span>
            <span class="field-type type-${fieldType}">${el.tag.toUpperCase()}</span>
            ${placeholderTags}
        </div>
                    ${el.text.length > 100 ?
                    `<textarea class="visual-input" data-index="${idx}">${this.escapeHtml(el.text)}</textarea>` :
                    `<input type="text" class="visual-input" data-index="${idx}" value="${this.escapeHtml(el.text)}">`
                }
                </div >
    `;
        });

        html += '</div>';
        html += `< div class="visual-apply-btn" >
    <button type="button" class="btn btn-primary" id="applyVisualChanges">Apply Changes to Template</button>
        </div >`;

        container.innerHTML = html;

        document.getElementById('applyVisualChanges')?.addEventListener('click', () => this.applyVisualChanges());

        container.querySelectorAll('.visual-input').forEach(input => {
            input.addEventListener('input', () => {
                input.closest('.visual-field').classList.add('modified');
            });
        });
    },

    extractTextElements(html) {
        const elements = [];
        const tagRegex = /<(h[1-6]|p|span|a|td|li|strong|em|b|i)[^>]*>([^<]+)<\/\1>/gi;
        let match;

        while ((match = tagRegex.exec(html)) !== null) {
            const text = match[2].trim();
            if (text && text.length > 1 && !/^[\s\d\.\,\;\:\!\?\-\_\=\+\*\&\%\$\#\@]+$/.test(text)) {
                elements.push({
                    tag: match[1].toLowerCase(),
                    text: text,
                    fullMatch: match[0],
                    index: match.index
                });
            }
        }

        return elements;
    },

    applyVisualChanges() {
        let content = document.getElementById('templateContent').value;
        const originalElements = this.extractTextElements(content);
        const inputs = document.querySelectorAll('.visual-input');

        const changes = [];
        inputs.forEach(input => {
            const idx = parseInt(input.dataset.index);
            const newText = input.value;
            const original = originalElements[idx];

            if (original && original.text !== newText) {
                changes.push({ original, newText });
            }
        });

        changes.reverse().forEach(change => {
            const oldTag = change.original.fullMatch;
            const newTag = oldTag.replace(change.original.text, change.newText);
            content = content.replace(oldTag, newTag);
        });

        document.getElementById('templateContent').value = content;
        this.updateTemplatePreview();

        UI.showSuccess(`Applied ${changes.length} text change${changes.length !== 1 ? 's' : ''} `);

        this.renderVisualEditor();
    },

    changePreviewDevice(device) {
        const wrapper = document.getElementById('previewWrapper');
        wrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
        if (device !== 'desktop') wrapper.classList.add(`device - ${device} `);
    },

    updateTemplatePreview() {
        const content = document.getElementById('templateContent').value;
        const iframe = document.getElementById('templatePreview');
        if (!iframe) return;

        let rendered = content;
        const placeholders = content.match(/\{\{(\w+)\}\}/g) || [];
        placeholders.forEach(p => {
            const key = p.replace(/\{\{|\}\}/g, '');
            const value = this.previewData[key] || `[${key}]`;
            rendered = rendered.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        });

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(rendered);
        doc.close();
    },

    openPreviewDataModal() {
        const content = document.getElementById('templateContent').value;
        const placeholders = [...new Set((content.match(/\{\{(\w+)\}\}/g) || []).map(p => p.replace(/\{\{|\}\}/g, '')))];

        const container = document.getElementById('previewVariablesContainer');
        if (placeholders.length === 0) {
            container.innerHTML = '<p style="color:#999;grid-column:1/-1;">No placeholders found in template. Use {{variable_name}} syntax.</p>';
        } else {
            container.innerHTML = placeholders.map(p => `
    < div class="form-group" >
                    <label>{{${p}}}</label>
                    <input type="text" id="previewVar_${p}" value="${this.previewData[p] || ''}" placeholder="Sample value">
                </div>
`).join('');
        }

        document.getElementById('previewDataModal').style.display = 'flex';
    },

    applyPreviewData() {
        const inputs = document.querySelectorAll('#previewVariablesContainer input');
        inputs.forEach(input => {
            const key = input.id.replace('previewVar_', '');
            this.previewData[key] = input.value;
        });
        this.closePreviewDataModal();
        this.updateTemplatePreview();
    },

    closePreviewDataModal() {
        document.getElementById('previewDataModal').style.display = 'none';
    },

    formatTemplateCode() {
        const textarea = document.getElementById('templateContent');
        let code = textarea.value;
        code = code.replace(/></g, '>\n<');
        code = code.replace(/\n\s*\n/g, '\n');
        textarea.value = code;
        this.updateTemplatePreview();
        UI.showSuccess('Code formatted!');
    },

    copyTemplateCode() {
        const textarea = document.getElementById('templateContent');
        navigator.clipboard.writeText(textarea.value).then(() => {
            UI.showSuccess('Code copied to clipboard!');
        }).catch(() => {
            UI.showError('Failed to copy code');
        });
    },

    async saveTemplate(e) {
        e.preventDefault();
        const name = document.getElementById('templateName').value.trim();
        const content = document.getElementById('templateContent').value.trim();
        if (!name || !content) {
            UI.showError('Template name and content are required');
            return;
        }

        const defaultCount = typeof EmailTemplates !== 'undefined' ? EmailTemplates.length : 0;

        if (this.editingTemplateIndex !== null) {
            const template = this.templates[this.editingTemplateIndex];
            if (this.editingTemplateIndex >= defaultCount && template.id) {
                try {
                    await API.updateCustomTemplate(template.id, { name, content });
                } catch (e) { }
            }
            this.templates[this.editingTemplateIndex] = {
                ...template,
                name,
                content,
                updatedAt: new Date().toISOString()
            };
            this.editingTemplateIndex = null;
            document.getElementById('editorTitle').textContent = 'Create New Template';
            document.getElementById('cancelEditBtn').style.display = 'none';
            document.getElementById('saveTemplateBtn').textContent = 'Save Template';
            UI.showSuccess('Template updated!');
        } else {
            try {
                const response = await API.saveCustomTemplate({ name, content });
                const newTemplate = response.template || { name, content, createdAt: new Date().toISOString() };
                this.templates.push(newTemplate);
            } catch (e) {
                this.templates.push({ name, content, createdAt: new Date().toISOString() });
            }
            UI.showSuccess('Template saved!');
        }

        this.renderTemplateList();
        this.populateTemplateSelect();
        document.getElementById('templateName').value = '';
        document.getElementById('templateContent').value = '';
        this.updateTemplatePreview();
        this.addLog('campaign', 'Template saved: ' + name);
    },

    editTemplate(idx) {
        const template = this.templates[idx];
        if (!template) return;

        this.editingTemplateIndex = idx;
        document.getElementById('templateName').value = template.name;
        document.getElementById('templateContent').value = template.content;
        document.getElementById('editorTitle').textContent = 'Edit Template';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        document.getElementById('saveTemplateBtn').textContent = 'Update Template';

        this.updateTemplatePreview();
        UI.showTab('templates');
        document.getElementById('templateName').focus();
    },

    cancelTemplateEdit() {
        this.editingTemplateIndex = null;
        document.getElementById('templateName').value = '';
        document.getElementById('templateContent').value = '';
        document.getElementById('editorTitle').textContent = 'Create New Template';
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('saveTemplateBtn').textContent = 'Save Template';
        this.updateTemplatePreview();
    },

    previewTemplate(idx) {
        const template = this.templates[idx];
        if (!template) return;

        document.getElementById('templateContent').value = template.content;
        this.updateTemplatePreview();
        this.changeEditorView('preview');
        UI.showTab('templates');
    },

    renderTemplateList() {
        const container = document.getElementById('templateList');
        const countBadge = document.getElementById('templateCount');
        if (!container) {
            console.error('templateList container not found');
            return;
        }

        // Ensure we have valid templates array
        if (!Array.isArray(this.templates)) {
            console.error('this.templates is not an array:', typeof this.templates);
            this.templates = [];
        }

        if (countBadge) countBadge.textContent = this.templates.length;

        if (this.templates.length === 0) {
            container.innerHTML = '<p class="empty-state">No templates saved yet.</p>';
            console.warn('renderTemplateList: No templates to render. this.templates.length =', this.templates.length);
            return;
        }

        // Filter out invalid templates
        const validTemplates = this.templates.filter(t => t && t.name && t.content);
        if (validTemplates.length !== this.templates.length) {
            console.warn(`Filtered out ${this.templates.length - validTemplates.length} invalid templates`);
        }

        container.innerHTML = validTemplates.map((t, i) => {
            const originalIndex = this.templates.indexOf(t);
            const previewHtml = (t.content || '').substring(0, 2000);
            const createdAt = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Unknown date';
            return `
    < div class="template-card" >
                <div class="template-card-preview">
                    <iframe srcdoc="${this.escapeHtml(previewHtml)}" sandbox></iframe>
                </div>
                <div class="template-card-body">
                    <div class="template-card-name">${this.escapeHtml(t.name || 'Unnamed Template')}</div>
                    <div class="template-card-date">${createdAt}</div>
                    <div class="template-card-actions">
                        <button class="btn btn-secondary btn-small" onclick="Dashboard.previewTemplate(${originalIndex})">Preview</button>
                        <button class="btn btn-primary btn-small" onclick="Dashboard.editTemplate(${originalIndex})">Edit</button>
                        <button class="btn btn-small" onclick="Dashboard.useTemplate(${originalIndex})">Use</button>
                        <button class="btn btn-danger btn-small" onclick="Dashboard.deleteTemplate(${originalIndex})">×</button>
                    </div>
                </div>
            </div >
    `}).join('');

        console.log(`Rendered ${validTemplates.length} templates`);
    },

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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

    async deleteTemplate(idx) {
        const defaultCount = typeof EmailTemplates !== 'undefined' ? EmailTemplates.length : 0;
        const template = this.templates[idx];
        if (idx >= defaultCount && template && template.id) {
            try {
                await API.deleteCustomTemplate(template.id);
            } catch (e) { }
        }
        this.templates.splice(idx, 1);
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

    async renderLogs() {
        const container = document.getElementById('logsList');
        if (!container) return;

        try {
            const response = await API.getLogs();
            this.logs = (response.logs || []).reverse();
        } catch (e) { }

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
    < div class="log-item log-${log.type}" >
                    <div class="log-time">${dateStr}<br>${time}</div>
                    <div class="log-content">
                        <span class="log-type type-${log.type}">${log.type}</span>
                        <span class="log-message">${log.message}</span>
                        ${log.details ? `<div class="log-details">${log.details}</div>` : ''}
                    </div>
                </div >
    `;
        }).join('');
    },

    async clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            try {
                await API.clearLogs();
            } catch (e) { }
            this.logs = [];
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

// Verify EmailTemplates is available when script loads
if (typeof EmailTemplates === 'undefined') {
    console.error('CRITICAL: EmailTemplates is not defined! Check that email-templates.js is loaded before dashboard.js');
} else {
    console.log(`EmailTemplates loaded: ${EmailTemplates.length} templates available`);
}

document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});
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
            this.initTemplates();
            this.initDeliveryReport();
            this.initTestEmail();
            this.initLogs();
            this.initSettings();

            await this.loadFromStorage();
            console.log(`After loadFromStorage: this.templates.length = ${this.templates.length}`);

            this.renderCampaignList();
            this.renderTemplateList();
            this.populateTemplateSelect();
            this.renderLogs();
            this.applyDefaultSettings();

            // Verify templates loaded - if still 0, try direct access to EmailTemplates
            if (this.templates.length === 0) {
                console.warn('No templates in this.templates after loading. Checking EmailTemplates directly...');
                if (typeof EmailTemplates !== 'undefined' && Array.isArray(EmailTemplates) && EmailTemplates.length > 0) {
                    console.warn(`EmailTemplates array exists with ${EmailTemplates.length} items, but wasn't loaded properly. Forcing reload...`);
                    this.templates = EmailTemplates.map(t => ({...t }));
                    console.log(`Forced reload: this.templates.length = ${this.templates.length}`);
                    this.renderTemplateList();
                    this.populateTemplateSelect();
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
                this.settings = {...this.settings, ...savedSettings };
            } catch (e) {
                this.campaigns = [];
            }

            // Load default templates from hardcoded array
            // Check if EmailTemplates is available (should be loaded from email-templates.js)
            if (typeof EmailTemplates === 'undefined') {
                console.error('EmailTemplates is not defined! Make sure email-templates.js is loaded before dashboard.js');
            }

            const defaultTemplates = (typeof EmailTemplates !== 'undefined' && Array.isArray(EmailTemplates) && EmailTemplates.length > 0) ?
                EmailTemplates.map(t => ({...t })) // Create copies to avoid mutations
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
                } catch (e) {}
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
            } catch (e) {}
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
                logoutBtn.addEventListener('click', async() => {
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
        document.querySelector(`.editor-tab[data-view="${view}"]`).classList.add('active');
        
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
            const typeLabel = el.tag.match(/^h[1-6]$/i) ? `Heading ${el.tag.charAt(1)}` : (el.tag === 'a' ? 'Link Text' : 'Text');
            const placeholders = el.text.match(/\{\{(\w+)\}\}/g) || [];
            const placeholderTags = placeholders.map(p => `<span class="visual-placeholder-tag">${p}</span>`).join('');
            
            html += `
                <div class="visual-field" data-index="${idx}">
                    <div class="visual-field-label">
                        <span>${typeLabel}</span>
                        <span class="field-type type-${fieldType}">${el.tag.toUpperCase()}</span>
                        ${placeholderTags}
                    </div>
                    ${el.text.length > 100 ? 
                        `<textarea class="visual-input" data-index="${idx}">${this.escapeHtml(el.text)}</textarea>` :
                        `<input type="text" class="visual-input" data-index="${idx}" value="${this.escapeHtml(el.text)}">`
                    }
                </div>
            `;
        });
        
        html += '</div>';
        html += `<div class="visual-apply-btn">
            <button type="button" class="btn btn-primary" id="applyVisualChanges">Apply Changes to Template</button>
        </div>`;
        
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
        
        UI.showSuccess(`Applied ${changes.length} text change${changes.length !== 1 ? 's' : ''}`);
        
        this.renderVisualEditor();
    },

    changePreviewDevice(device) {
        const wrapper = document.getElementById('previewWrapper');
        wrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
        if (device !== 'desktop') wrapper.classList.add(`device-${device}`);
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
                <div class="form-group">
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
                } catch (e) {}
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
            <div class="template-card">
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
            </div>
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
            } catch (e) {}
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
        } catch (e) {}

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

    async clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            try {
                await API.clearLogs();
            } catch (e) {}
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
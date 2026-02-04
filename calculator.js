// Epitome Collective Costing Calculator
// Built by Jax - Your AI Operations Partner

// Pricing Tiers (From Jasper's Chart)
const PRICING_TIERS = [
    {
        name: "Premium Margins",
        range: "$1K - $50K",
        minBid: 1000,
        maxBid: 49999,
        targetMargin: 0.70,
        multiplier: 3.33,
        class: "tier-premium"
    },
    {
        name: "Standard Margins", 
        range: "$50K - $100K",
        minBid: 50000,
        maxBid: 99999,
        targetMargin: 0.65,
        multiplier: 2.857,
        class: "tier-standard"
    },
    {
        name: "Competitive Margins",
        range: "$100K+",
        minBid: 100000,
        maxBid: 999999,
        targetMargin: 0.60,
        multiplier: 2.5,
        class: "tier-competitive"
    }
];

// Crew Roles Database
const CREW_ROLES = [
    { name: "Director", department: "Production", inHouse: true },
    { name: "Producer", department: "Production", inHouse: true },
    { name: "Director of Photography", department: "Camera", inHouse: false },
    { name: "1st Assistant Director", department: "Production", inHouse: true },
    { name: "Video Editor", department: "Post", inHouse: true },
    { name: "Motion Graphics Artist", department: "Post", inHouse: true },
    { name: "Sound Recordist", department: "Audio", inHouse: false },
    { name: "Gaffer", department: "Lighting", inHouse: false },
    { name: "Art Director", department: "Art", inHouse: false },
    { name: "Hair & Makeup Artist", department: "Beauty", inHouse: false },
    { name: "Wardrobe Stylist", department: "Wardrobe", inHouse: false },
    { name: "Casting Director", department: "Talent", inHouse: false },
    { name: "Location Manager", department: "Locations", inHouse: true },
    { name: "Production Assistant", department: "Production", inHouse: true },
    { name: "Data Wrangler", department: "Tech", inHouse: true },
    { name: "Colorist", department: "Post", inHouse: false }
];

// Current project state
let currentProject = {
    name: "",
    client: "",
    type: "commercial",
    costs: {},
    crew: {},
    margin: 60,
    tier: null
};

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupEventListeners();
    populateCrewRoles();
    calculateProject();
});

function initializeCalculator() {
    // Initialize all cost inputs
    const costInputs = document.querySelectorAll('.cost-item input[type="number"]');
    costInputs.forEach(input => {
        input.addEventListener('input', calculateProject);
    });

    // Initialize margin slider
    const marginSlider = document.getElementById('marginSlider');
    marginSlider.addEventListener('input', function() {
        currentProject.margin = parseInt(this.value);
        document.getElementById('marginValue').textContent = this.value;
        document.getElementById('summaryMargin').textContent = this.value;
        calculateProject();
        updateMarginIndicator();
    });

    // Initialize form fields
    document.getElementById('projectName').addEventListener('input', function() {
        currentProject.name = this.value;
    });

    document.getElementById('clientName').addEventListener('input', function() {
        currentProject.client = this.value;
    });

    document.getElementById('projectType').addEventListener('change', function() {
        currentProject.type = this.value;
    });
}

function setupEventListeners() {
    // Any additional event listeners
}

function populateCrewRoles() {
    const crewRolesContainer = document.getElementById('crewRoles');
    crewRolesContainer.innerHTML = '';

    CREW_ROLES.forEach(role => {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'role-item';
        
        roleDiv.innerHTML = `
            <div>
                <strong>${role.name}</strong>
                <small style="display: block; color: #666;">${role.department}</small>
            </div>
            <div class="role-toggle">
                <div class="toggle-switch ${role.inHouse ? 'active' : ''}" 
                     onclick="toggleRole('${role.name}', this)">
                    <div class="toggle-slider"></div>
                </div>
            </div>
        `;
        
        crewRolesContainer.appendChild(roleDiv);
        
        // Initialize crew state
        currentProject.crew[role.name] = role.inHouse;
    });
}

function toggleRole(roleName, toggleElement) {
    const isActive = toggleElement.classList.contains('active');
    
    if (isActive) {
        toggleElement.classList.remove('active');
        currentProject.crew[roleName] = false;
    } else {
        toggleElement.classList.add('active');
        currentProject.crew[roleName] = true;
    }
}

function calculateProject() {
    // Get all cost values
    const costs = {};
    const costInputs = document.querySelectorAll('.cost-item input[type="number"]');
    
    costInputs.forEach(input => {
        costs[input.id] = parseFloat(input.value) || 0;
    });

    // Calculate total production cost
    const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    
    // Determine pricing tier
    const tier = determinePricingTier(totalCost);
    currentProject.tier = tier;
    
    // Calculate recommended quote based on margin
    const marginPercent = currentProject.margin / 100;
    const recommendedQuote = totalCost / (1 - marginPercent);
    const marginAmount = recommendedQuote - totalCost;

    // Update UI
    updateTierDisplay(tier);
    updateSummary(totalCost, marginAmount, recommendedQuote);
    updateMarginIndicator();
    
    // Store costs
    currentProject.costs = costs;
}

function determinePricingTier(totalCost) {
    for (let tier of PRICING_TIERS) {
        if (totalCost >= tier.minBid && totalCost <= tier.maxBid) {
            return tier;
        }
    }
    // Default to competitive for very large projects
    return PRICING_TIERS[2];
}

function updateTierDisplay(tier) {
    const tierDisplay = document.getElementById('tierDisplay');
    const tierName = document.getElementById('tierName');
    const tierRange = document.getElementById('tierRange');
    
    tierDisplay.className = `tier-display ${tier.class}`;
    tierName.textContent = tier.name;
    tierRange.textContent = tier.range;
}

function updateSummary(totalCost, marginAmount, recommendedQuote) {
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('marginAmount').textContent = formatCurrency(marginAmount);
    document.getElementById('recommendedQuote').textContent = formatCurrency(recommendedQuote);
}

function updateMarginIndicator() {
    const margin = currentProject.margin;
    const marginSlider = document.getElementById('marginSlider');
    
    // Color coding based on margin
    if (margin >= 60) {
        marginSlider.style.background = 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)';
    } else if (margin >= 50) {
        marginSlider.style.background = 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)';
    } else {
        marginSlider.style.background = 'linear-gradient(90deg, #F44336 0%, #E91E63 100%)';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Scenario Management
function setScenario(scenario) {
    const marginSlider = document.getElementById('marginSlider');
    
    switch(scenario) {
        case 'premium':
            marginSlider.value = 65;
            currentProject.margin = 65;
            break;
        case 'portfolio':
            marginSlider.value = 50;
            currentProject.margin = 50;
            break;
        case 'cashflow':
            marginSlider.value = 45;
            currentProject.margin = 45;
            break;
    }
    
    document.getElementById('marginValue').textContent = currentProject.margin;
    document.getElementById('summaryMargin').textContent = currentProject.margin;
    calculateProject();
}

// PDF Generation
function generateQuotation() {
    if (!currentProject.name || !currentProject.client) {
        alert('Please enter project name and client name before generating quotation.');
        return;
    }

    // Create quotation data
    const quotationData = {
        project: currentProject,
        timestamp: new Date().toLocaleDateString('en-SG'),
        quoteNumber: generateQuoteNumber()
    };

    // Generate PDF (This would integrate with a PDF library like jsPDF)
    generatePDF(quotationData);
}

function generateQuoteNumber() {
    return 'QUO-' + Date.now().toString().slice(-6);
}

function generatePDF(data) {
    // For now, we'll create a detailed summary
    const summary = createQuotationSummary(data);
    
    // Open in new window for now (later integrate proper PDF generation)
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
        <head>
            <title>Quotation - ${data.project.name}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { background: #667eea; color: white; padding: 20px; text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .cost-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .cost-table th, .cost-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .cost-table th { background: #f5f5f5; }
                .total-row { background: #667eea; color: white; font-weight: bold; }
            </style>
        </head>
        <body>
            ${summary}
        </body>
        </html>
    `);
}

function createQuotationSummary(data) {
    const project = data.project;
    const totalCost = Object.values(project.costs).reduce((sum, cost) => sum + cost, 0);
    const marginPercent = project.margin / 100;
    const recommendedQuote = totalCost / (1 - marginPercent);
    
    return `
        <div class="header">
            <h1>EPITOME COLLECTIVE</h1>
            <h2>Video Production Quotation</h2>
        </div>
        
        <div class="section">
            <h3>Project Details</h3>
            <p><strong>Quote Number:</strong> ${data.quoteNumber}</p>
            <p><strong>Date:</strong> ${data.timestamp}</p>
            <p><strong>Project:</strong> ${project.name}</p>
            <p><strong>Client:</strong> ${project.client}</p>
            <p><strong>Project Type:</strong> ${project.type}</p>
        </div>
        
        <div class="section">
            <h3>Cost Breakdown</h3>
            <table class="cost-table">
                <thead>
                    <tr><th>Category</th><th>Amount</th></tr>
                </thead>
                <tbody>
                    ${createCostTableRows(project.costs)}
                    <tr class="total-row">
                        <td>Total Production Cost</td>
                        <td>${formatCurrency(totalCost)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Recommended Quote (${project.margin}% margin)</td>
                        <td>${formatCurrency(recommendedQuote)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h3>Crew Requirements</h3>
            ${createCrewSummary(project.crew)}
        </div>
        
        <div class="section">
            <h3>Terms & Conditions</h3>
            <p>• Payment: 50% upon confirmation, 30% upon first draft, 20% upon completion</p>
            <p>• Quotation valid for 30 days</p>
            <p>• Usage rights as specified in project scope</p>
            <p>• Cancellation fees apply as per standard terms</p>
        </div>
    `;
}

function createCostTableRows(costs) {
    const categoryNames = {
        preproduction: "Pre-production Cost",
        production: "Production Unit", 
        overtime: "Overtime",
        equipment: "Equipment",
        datamanagement: "Data Management",
        location: "Location and Studio Rental",
        props: "Props and settings",
        talents: "Talents",
        wardrobes: "Wardrobes", 
        catering: "Catering",
        transportation: "Transportation",
        postproduction: "Post production & music"
    };
    
    return Object.entries(costs)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => 
            `<tr><td>${categoryNames[key] || key}</td><td>${formatCurrency(value)}</td></tr>`
        ).join('');
}

function createCrewSummary(crew) {
    const inHouse = Object.entries(crew).filter(([role, isInHouse]) => isInHouse).map(([role]) => role);
    const external = Object.entries(crew).filter(([role, isInHouse]) => !isInHouse).map(([role]) => role);
    
    return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h4>In-House Team</h4>
                <ul>${inHouse.map(role => `<li>${role}</li>`).join('')}</ul>
            </div>
            <div>
                <h4>External Crew</h4>
                <ul>${external.map(role => `<li>${role}</li>`).join('')}</ul>
            </div>
        </div>
    `;
}

// Project Management
function saveProject() {
    const projectData = JSON.stringify(currentProject);
    localStorage.setItem(`epitome_project_${currentProject.name || 'untitled'}`, projectData);
    alert('Project saved successfully!');
}

function loadTemplate() {
    // For now, show available templates
    const templates = getTemplates();
    if (templates.length === 0) {
        alert('No saved templates available.');
        return;
    }
    
    // Simple template selection (enhance later)
    const templateName = prompt('Available templates:\n' + templates.join('\n') + '\n\nEnter template name:');
    if (templateName && templates.includes(templateName)) {
        loadProjectTemplate(templateName);
    }
}

function getTemplates() {
    const templates = [];
    for (let key in localStorage) {
        if (key.startsWith('epitome_project_')) {
            templates.push(key.replace('epitome_project_', ''));
        }
    }
    return templates;
}

function loadProjectTemplate(templateName) {
    const projectData = localStorage.getItem(`epitome_project_${templateName}`);
    if (projectData) {
        const project = JSON.parse(projectData);
        
        // Load project data into form
        document.getElementById('projectName').value = project.name || '';
        document.getElementById('clientName').value = project.client || '';
        document.getElementById('projectType').value = project.type || 'commercial';
        document.getElementById('marginSlider').value = project.margin || 60;
        
        // Load cost values
        Object.entries(project.costs || {}).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) input.value = value;
        });
        
        // Update current project
        currentProject = project;
        
        // Recalculate
        calculateProject();
        
        alert('Template loaded successfully!');
    }
}

// Initialize default values for demo
function loadDemoProject() {
    document.getElementById('projectName').value = 'Sample Commercial Project';
    document.getElementById('clientName').value = 'Demo Client Ltd';
    document.getElementById('production').value = '25000';
    document.getElementById('equipment').value = '5000';
    document.getElementById('postproduction').value = '15000';
    document.getElementById('talents').value = '8000';
    
    calculateProject();
}

// Load demo on first visit
if (!localStorage.getItem('epitome_visited')) {
    setTimeout(loadDemoProject, 1000);
    localStorage.setItem('epitome_visited', 'true');
}
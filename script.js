/**
 * Debt & Diplomacy: The Global Development Finance Game
 * Main JavaScript file for game functionality
 * Version 1.2
 * 
 * This script manages the core game mechanics, state management, 
 * and interactive elements of the development finance simulation.
 */

(function() {
    'use strict';
    
    // Debug mode flag for development and testing
    const DEBUG_MODE = false;

    // Centralized configuration object for game settings
    const CONFIG = {
        TOTAL_DAYS: 10,
        INITIAL_BUDGET: 3000000,
        INITIAL_INFLUENCE: 50,
        INITIAL_STAFF: 5,
        MINIMUM_THRESHOLDS: {
            influence: 10,
            budget: 0,
            staff: 0,
            fiscal: 20,
            environmental: 20,
            political: 20,
            international: 20
        }
    };

    /**
     * Central game state management object
     * Tracks mission progress, player resources, and game metrics
     */
    const gameState = {
        // Game initialization and progression tracking
        initialized: false,
        tutorialCompleted: false,
        debugMode: DEBUG_MODE,
        
        // Mission and time progression
        currentMission: 1,
        currentDay: 1,
        totalDays: CONFIG.TOTAL_DAYS,
        
        // Player resources
        resources: {
            budget: CONFIG.INITIAL_BUDGET,
            influence: CONFIG.INITIAL_INFLUENCE,
            staff: CONFIG.INITIAL_STAFF,
            timeRemaining: CONFIG.TOTAL_DAYS
        },

        // Staff recruitment tracking
        lastStaffHireDay: 0,
        
        // Performance metrics tracking
        metrics: {
            fiscal: 35,
            environmental: 40,
            political: 60,
            international: 30
        },
        
        // Game progression trackers
        completedObjectives: [],
        decisions: [],
        actionsHistory: [],
        updates: [],
        documentHistory: [],
        stakeholderEngagements: [],
        unlockedInsights: [],

        // Game completion thresholds
        thresholds: CONFIG.MINIMUM_THRESHOLDS,

        // Stakeholder data

                    // Stakeholder data
        stakeholders: [
            { 
                id: 1, 
                name: "Prime Minister", 
                relationship: "neutral", 
                influence: "High", 
                bio: "The Prime Minister is focused on economic growth but also faces political pressure over debt levels. He expects quick results and accountability. Your performance will directly impact his support for you.", 
                image: "P",
                interests: ["Maintaining economic growth", "Political stability", "Avoiding negative media coverage"],
                educationalContext: "In development finance, project success often depends on managing relationships with high-level government officials who balance multiple priorities and constituencies."
            },
            { 
                id: 2, 
                name: "Chinese Export-Import Bank", 
                relationship: "neutral", 
                influence: "High", 
                bio: "As the primary lender, the Bank has significant leverage. They prefer not to take control of the port but need to show their investment is secure. Relations are professional but tense as repayment deadline approaches.", 
                image: "C",
                interests: ["Securing loan repayment", "Maintaining commercial relationship", "Preserving international reputation"],
                educationalContext: "Bilateral lenders like Export-Import banks often have both commercial and diplomatic objectives in their lending practices, creating complex negotiation scenarios."
            },
            { 
                id: 3, 
                name: "World Bank", 
                relationship: "neutral", 
                influence: "Medium", 
                bio: "Interested in offering refinancing with governance conditions. They can offer more favorable terms but require transparency and environmental compliance standards that may be politically challenging.", 
                image: "W",
                interests: ["Governance improvements", "Environmental standards", "Transparency in financial management"],
                educationalContext: "Multilateral development banks typically offer better financial terms than commercial lenders but attach policy conditions aimed at institutional reform."
            },
            { 
                id: 4, 
                name: "Fishing Communities", 
                relationship: "hostile", 
                influence: "Low", 
                bio: "Local fishing communities have seen their livelihoods impacted by port dredging. They're organizing protests and gaining media attention. Addressing their concerns could improve political capital.", 
                image: "F",
                interests: ["Environmental remediation", "Livelihood protection", "Community consultation"],
                educationalContext: "Large infrastructure projects often create externalities for local communities that, if left unaddressed, can generate political resistance and operational challenges."
            },
            { 
                id: 5, 
                name: "Port Authority", 
                relationship: "friendly", 
                influence: "Medium", 
                bio: "Managing day-to-day operations, they're eager for increased funding to boost efficiency. They have technical expertise about port operations but are defensive about current performance issues.", 
                image: "P",
                interests: ["Increased operational budget", "Technical upgrades", "Maintaining management autonomy"],
                educationalContext: "State-owned enterprises managing infrastructure often have technical expertise but may lack commercial orientation needed for financial sustainability."
            }
        ],
        
        // Document data
        documents: [
            { 
                id: 1, 
                title: "Port Project Financial Overview", 
                type: "financial", 
                icon: "💰",
                content: "Financial Analysis: Azuria Port Development Project\n\nInitial Investment: $450 million\nFunding Source: Chinese Export-Import Bank commercial loan\nInterest Rate: 4.5%\nTerm: 15 years (3-year grace period followed by 12-year repayment)\nCurrent Status: Year 3 (grace period ending)\n\nRevenue Projections vs. Actuals:\n- Original Projection: $65 million annual revenue by Year 3\n- Current Revenue: $26 million (40% of projection)\n\nCash Flow Analysis:\n- Annual Debt Service (starting next quarter): $42 million\n- Current Operating Expenses: $18 million\n- Current Net Income: $8 million\n- Projected Shortfall: $34 million\n\nDebt Sustainability Indicators:\n- Debt Service Coverage Ratio (DSCR): 0.62 (healthy is >1.20)\n- Revenue to Debt Service Ratio: 0.62 (healthy is >1.50)\n- Operating Margin: 30.8% (below industry standard of 40%)\n\nNote: Undisclosed sections of the loan agreement appear to include provisions for asset transfer in case of default. Legal counsel advises further investigation of collateral terms."
            },
            { 
                id: 2, 
                title: "Environmental Impact Report", 
                type: "report", 
                icon: "🌿",
                content: "Key Findings:\n1. Dredging operations have disrupted marine habitats in a 5km radius from the port\n2. Sediment disposal has affected water quality in areas traditionally used by local fishing communities\n3. Fish populations have decreased by approximately 35% in affected areas\n4. Three protected species have shown population decline in the port vicinity\n\nRegulatory Compliance:\n- Port operations are technically in compliance with national environmental regulations\n- However, operations fall short of international best practices and World Bank standards\n- Gap analysis shows 6 areas requiring remediation to meet international financing standards\n\nCommunity Impact:\n- 200+ fishing households report significant decrease in catch volumes\n- Economic impact estimated at $2.5 million annually to local fishing economy\n- Community consultations were insufficient during project planning phase\n- No formal grievance mechanism has been established\n\nRecommendations:\n1. Implement sediment containment systems: Est. cost $4-6 million\n2. Establish marine protected areas with community co-management: Est. cost $1.5 million\n3. Develop alternative livelihood programs for affected fishers: Est. cost $3 million\n4. Create formal stakeholder engagement process and grievance mechanism: Est. cost $500,000"
            },
            { 
                id: 3, 
                title: "Loan Agreement (Partial)", 
                type: "legal", 
                icon: "📜",
                content: "Article 4: Security and Collateral\n4.1 The Borrower (Government of Azuria) hereby grants to the Lender (Export-Import Bank of China) a first priority security interest in the Project Assets.\n4.2 [REDACTED SECTION - REQUESTED FROM LEGAL DEPARTMENT]\n4.3 In the event of Default as defined in Article 8, the Lender shall have the right to [REDACTED SECTION]\n\nArticle 8: Events of Default\n8.1 Failure to make payment of principal or interest when due\n8.2 Material breach of operational covenants\n8.3 Failure to achieve minimum capacity utilization of 60% by end of Year 3\n8.4 Change in management or ownership structure without prior written consent\n8.5 Material adverse change in the financial condition of the Project\n\nArticle 10: Governing Law and Dispute Resolution\n10.1 This Agreement shall be governed by and construed in accordance with the laws of the People's Republic of China.\n10.2 Any dispute arising from or in connection with this Agreement shall be resolved through friendly consultation. If consultation fails, the dispute shall be submitted to the China International Economic and Trade Arbitration Commission for arbitration.\n\nArticle 12: Confidentiality\n12.1 The Borrower agrees to maintain confidentiality regarding all terms and conditions of this Agreement except as required by applicable law or regulation.\n12.2 Public announcements regarding the Project shall be subject to prior written approval by both Parties."
            },
            { 
                id: 4, 
                title: "Port Efficiency Analysis", 
                type: "report", 
                icon: "📊",
                content: "Current Capacity Utilization: 40%\n- Container Handling: 35% of capacity\n- Bulk Cargo: 52% of capacity\n- Liquid Cargo: 28% of capacity\n\nRegional Market Context:\n- Regional shipping volume growing at 6% annually\n- Competing ports operating at 65-75% capacity\n- Current market share: 12% (vs. projected 30%)\n\nKey Operational Challenges:\n1. Insufficient marketing to international shipping companies\n2. Lack of specialized handling equipment for certain cargo types\n3. Higher fees compared to competing regional ports (15-20% above average)\n4. Inadequate rail connections to inland commercial centers\n5. Operational inefficiencies increasing turnaround time by 40%\n6. Outdated digital management systems\n\nStaffing Assessment:\n- Current staffing at 85% of required levels\n- Training gaps identified in 3 key operational areas\n- Management structure not aligned with international best practices\n\nImprovement Recommendations:\n1. Reduce port fees temporarily to attract new business ($3-5M revenue impact)\n2. Invest in specialized cargo handling equipment ($8M investment)\n3. Establish direct marketing office in Singapore shipping hub ($1.2M annually)\n4. Develop performance incentives for port management team\n5. Implement digital management system upgrade ($3.5M)\n6. Staff capacity building program ($1.2M)\n\nFinancial Impact Analysis:\n- Implementation of all recommendations: $17.9M total cost\n- Projected capacity increase: 25-30 percentage points within 12 months\n- Return on investment period: 24-30 months\n- Potential annual revenue increase: $22-28M after full implementation"
            },
            { 
                id: 5, 
                title: "Refinancing Options Analysis", 
                type: "financial", 
                icon: "💹",
                content: "OPTION 1: Chinese Belt and Road Initiative Restructuring\n- Extended term: Additional 5 years (20 years total)\n- Interest rate adjustment: Potential reduction to 3.8%\n- Requires: Commitment to additional Chinese investment projects\n- Annual payment reduction: Approximately $8 million\n- Maintains relationship with current lender\n- No governance conditions\n- Implementation timeline: 3-4 months\n\nOPTION 2: World Bank Infrastructure Financing\n- New loan: $400 million at 2.5% over 25 years\n- Requires: Enhanced environmental standards, management transparency\n- Governance conditions: Independent oversight board, public disclosure of all terms\n- Annual payment reduction: Approximately $17 million\n- Political implications: Potential diplomatic tension with current Chinese partners\n- Implementation timeline: 8-12 months\n- Addresses environmental concerns\n\nOPTION 3: Public-Private Partnership Recapitalization\n- Partial privatization: 30% equity stake to international port operator\n- Capital infusion: $150 million\n- Operational control: Shared management with performance requirements\n- Benefits: Professional management, established shipping relationships\n- Risks: Loss of full sovereign control over strategic asset\n- Implementation timeline: 6-8 months\n- Requires legislative approval\n\nOPTION 4: Regional Development Bank Consortium\n- Multi-source financing: Asian Development Bank, African Development Bank, Islamic Development Bank\n- Blended terms: Approximately 3% over 18 years\n- Technical assistance package included\n- Diplomatic advantage: Diversified international relationships\n- Complexity: Coordinating multiple lending institutions and requirements\n- Implementation timeline: 10-14 months\n- Moderate governance conditions\n\nCOMPARATIVE ANALYSIS:\n- Lowest Interest Cost: Option 2 (World Bank)\n- Fastest Implementation: Option 1 (Chinese Restructuring)\n- Lowest Political Sensitivity: Option 4 (Regional Consortium)\n- Best Operational Improvements: Option 3 (PPP)\n- Most Fiscal Space Created: Option 2 (World Bank)"
            },
            { 
                id: 6, 
                title: "Community Impact Testimonials", 
                type: "testimonial", 
                icon: "👥",
                content: "Fishing Village Representatives:\n\n\"My family has fished these waters for three generations. Since the port dredging began, our catch has dropped by half. We cannot feed our families this way. We're not against development, but we need solutions that allow both the port and our livelihoods to coexist.\" - Ibrahim Keita, Village Elder\n\n\"The sediment has driven away the fish. The water is cloudy where it was once clear. We've asked for meetings with port officials for months, but no one will speak with us. It feels like our community doesn't matter to the government.\" - Maria Semboa, Fishing Cooperative Leader\n\n\"We are not against development. We just want to be included in the discussion and compensated fairly for our losses. We can provide valuable local knowledge about marine conditions that could actually help port operations.\" - Thomas Nkomo, Community Spokesperson\n\nLocal Business Owners:\n\n\"We were promised jobs and business opportunities from the port, but most contracts go to foreign companies. We local suppliers can't even get in the door for procurement bids. The economic benefits aren't flowing to our communities as promised.\" - Habiba Nuru, Chamber of Commerce Representative\n\n\"The road traffic has increased dramatically, but no infrastructure improvements have been made in town. We bear the costs while seeing none of the benefits. Our roads are deteriorating rapidly with the increased truck traffic.\" - Carlos Diallo, Transportation Company Owner\n\nEnvironmental Advocates:\n\n\"The environmental impact assessment was rushed and inadequate. It failed to consider seasonal marine migration patterns that are critical to our ecosystem. We warned about these issues during the consultation, but our input was ignored.\" - Dr. Fatima Osei, Marine Biologist\n\n\"We've documented concerning levels of heavy metals in sediment samples that weren't addressed in the official reports. This could have long-term health implications for coastal communities relying on seafood for nutrition.\" - Environmental Protection Alliance\n\nCONSOLIDATED COMMUNITY REQUESTS:\n1. Establish formal consultation mechanism with affected communities\n2. Implement environmental remediation measures, particularly for water quality\n3. Create local business preference program for port-related contracts\n4. Develop alternative livelihood programs for most affected fishing households\n5. Improve infrastructure in communities experiencing increased port traffic"
            },
        ],
// Action definitions
actions: [
    {
        id: 1,
        title: "Debt Analysis",
        description: "Commission a detailed analysis of the loan terms and potential restructuring options.",
        cost: 500000,
        timeCost: 1,
        staffCost: 1,
        educationalValue: "Provides insight into debt sustainability analysis and loan term evaluation.",
        impactDescription: "Your analysis reveals concerning collateral clauses that could transfer port control to Chinese lenders upon default. The Prime Minister is displeased by these findings, questioning why Finance Ministry didn't identify these terms earlier. However, this information is crucial for your negotiation strategy.",
        impacts: {
            influence: -5,
            fiscal: 15,
            political: -5,
            international: 0
        },
        stakeholderImpacts: [
            {id: 1, relationship: "hostile", reason: "Upset about previously undisclosed loan terms"},
            {id: 2, relationship: "neutral", reason: "Monitoring your investigation of loan terms"}
        ],
        objectiveProgress: [
            {id: 1, progress: 25, reason: "Better understanding of debt structure and options"}
        ],
        newsUpdate: {
            title: "Azuria Financial Times: Hidden Loan Terms Revealed",
            content: "Finance Ministry analysis uncovers controversial collateral terms in the Chinese port loan agreement. Sources report these terms could potentially transfer operational control of the strategic port facility in case of default. The Prime Minister has called for an emergency cabinet meeting to discuss implications."
        },
        unlocksInsight: {
            id: 1,
            title: "Debt Sustainability Analysis",
            content: "Financial sustainability depends on a project's ability to generate sufficient revenue to cover both operational costs and debt service. When debt service coverage ratio falls below 1.0, default risk increases significantly, potentially triggering collateral clauses.",
            stakeholdersInvolved: [1, 2, 3]
        }
    },
    {
        id: 2,
        title: "Environmental Assessment",
        description: "Evaluate environmental impacts of the port and develop mitigation strategies.",
        cost: 750000,
        timeCost: 2,
        staffCost: 2,
        educationalValue: "Demonstrates environmental impact assessment methods and mitigation planning.",
        impactDescription: "The assessment documents significant ecological impact from port dredging, affecting local fishing communities. Remediation costs are estimated at $8 million. While addressing these issues would improve community relations, it will strain your already tight budget.",
        impacts: {
            influence: -10,
            fiscal: 0,
            environmental: 25,
            political: -8
        },
        stakeholderImpacts: [
            {id: 4, relationship: "neutral", reason: "Acknowledging their concerns through formal assessment"},
            {id: 1, relationship: "hostile", reason: "Concerned about additional expenses and negative publicity"}
        ],
        objectiveProgress: [
            {id: 2, progress: 30, reason: "Created comprehensive environmental impact assessment"}
        ],
        newsUpdate: {
            title: "Coastal Weekly: Port Environmental Damage \"Worse Than Expected\"",
            content: "Independent assessment commissioned by the Finance Ministry has documented extensive ecological damage from port dredging operations. Local fishing communities have welcomed the acknowledgment of their concerns, but worry remediation will come too late. Environmental advocates are calling for immediate action and compensation for affected communities."
        },
        unlocksInsight: {
            id: 2,
            title: "Environmental Externalities",
            content: "Large infrastructure projects frequently create negative externalities that affect communities not directly benefiting from the project. Addressing these externalities early through consultation and mitigation strategies is typically less costly than managing conflicts after they escalate.",
            stakeholdersInvolved: [4, 3]
        }
    },
    {
        id: 3,
        title: "Diplomatic Meeting",
        description: "Arrange high-level discussions with Chinese officials to explore restructuring options.",
        cost: 200000,
        timeCost: 1,
        staffCost: 0,
        educationalValue: "Illustrates negotiation strategies and bilateral financial diplomacy.",
        impactDescription: "Your meeting with Chinese officials was productive. They're open to restructuring the loan with extended terms, but require formal commitments to prioritize Chinese shipping companies at the port. The Prime Minister sees this as a viable path forward.",
        impacts: {
            influence: 5,
            fiscal: 0,
            international: 15,
            political: 0
        },
        stakeholderImpacts: [
            {id: 2, relationship: "friendly", reason: "Appreciates direct engagement on debt issues"},
            {id: 1, relationship: "friendly", reason: "Supports pursuit of restructuring options"},
            {id: 3, relationship: "hostile", reason: "Concerned about preferential arrangements with Chinese entities"}
        ],
        objectiveProgress: [
            {id: 1, progress: 20, reason: "Established potential restructuring framework"},
            {id: 3, progress: 30, reason: "Improved relations with key financial partner"}
        ],
        newsUpdate: {
            title: "International Finance Daily: Azuria and China in Debt Restructuring Talks",
            content: "High-level financial diplomacy appears to be yielding results as Azuria's Finance Ministry reports productive discussions with Chinese lenders. Sources suggest loan terms may be renegotiated to ease immediate repayment pressure, though specific concessions remain undisclosed. Western financial institutions express concern over possible preferential arrangements."
        },
        unlocksInsight: {
            id: 3,
            title: "Bilateral Debt Restructuring",
            content: "When approaching bilateral creditors for debt restructuring, timing and diplomatic context significantly impact outcomes. Restructuring negotiations often involve trade-offs between financial relief and economic concessions in other areas such as market access or future investment opportunities.",
            stakeholdersInvolved: [1, 2]
        }
    },
    {
        id: 4,
        title: "Western Institution Consultation",
        description: "Explore refinancing options with World Bank and IMF representatives.",
        cost: 300000,
        timeCost: 1,
        staffCost: 0,
        educationalValue: "Explores multilateral financing options and governance conditionality.",
        impactDescription: "World Bank representatives offer favorable refinancing terms at 2.5% interest over 25 years, but with governance conditions including independent oversight. This has angered Chinese officials who see this as undermining their relationship with Azuria.",
        impacts: {
            influence: -8,
            fiscal: 10,
            international: 10,
            political: -10
        },
        stakeholderImpacts: [
            {id: 3, relationship: "friendly", reason: "Appreciates engagement with multilateral institutions"},
            {id: 2, relationship: "hostile", reason: "Views approach to Western institutions as undermining bilateral relationship"}
        ],
        objectiveProgress: [
            {id: 1, progress: 15, reason: "Identified potential alternative financing solution"},
            {id: 3, progress: -10, reason: "Created tension with Chinese partners"}
        ],
        newsUpdate: {
            title: "Global Finance Review: Western Institutions Offer Azuria Alternative Financing",
            content: "The World Bank has proposed a comprehensive refinancing package for Azuria's port debt at significantly lower interest rates than the current Chinese loan. However, the offer comes with governance and transparency requirements that could complicate geopolitical relationships. Chinese officials have expressed 'serious concern' over what they describe as Western interference in bilateral arrangements."
        },
        unlocksInsight: {
            id: 4,
            title: "Multilateral Financing Conditionality",
            content: "Multilateral development banks typically offer financing with lower interest rates and longer tenors than commercial lenders, but attach policy conditions focused on governance, transparency, and social/environmental standards. These conditions often create domestic political challenges despite their financial advantages.",
            stakeholdersInvolved: [3, 2]
        }
    },
    {
        id: 5,
        title: "Marketing Campaign",
        description: "Launch international marketing to attract more shipping companies to the port.",
        cost: 1000000,
        timeCost: 3,
        staffCost: 1,
        educationalValue: "Explores operational improvements to increase infrastructure utilization.",
        impactDescription: "Your international marketing campaign has attracted interest from several major shipping companies. Projections suggest port utilization could increase to 60% within six months. The Prime Minister is pleased with this proactive approach to boosting revenue.",
        impacts: {
            influence: 15,
            fiscal: 20,
            political: 15,
            international: 5
        },
        stakeholderImpacts: [
            {id: 1, relationship: "friendly", reason: "Approves of proactive approach to boosting port utilization"},
            {id: 5, relationship: "friendly", reason: "Appreciates investment in port promotion"}
        ],
        objectiveProgress: [
            {id: 1, progress: 30, reason: "Increasing port utilization directly improves revenue and debt sustainability"}
        ],
        newsUpdate: {
            title: "Shipping Industry Today: Azuria Port Launches Global Marketing Initiative",
            content: "The Finance Ministry has spearheaded an aggressive international marketing campaign to attract shipping traffic to Azuria's underutilized port facility. Initial responses from major shipping lines have been positive, with three companies expressing interest in establishing regular routes. Port authority officials project a potential 20% increase in utilization within six months if current negotiations are successful."
        },
        unlocksInsight: {
            id: 5,
            title: "Infrastructure Utilization Economics",
            content: "Infrastructure projects have high fixed costs and relatively low variable costs, making utilization rates a critical factor in financial sustainability. Increasing utilization from 40% to 60% can disproportionately improve financial performance by spreading fixed costs across more revenue-generating activities.",
            stakeholdersInvolved: [5, 1]
        }
    },
    {
        id: 6,
        title: "Public Stakeholder Meeting",
        description: "Organize community consultation to address local concerns about the port.",
        cost: 150000,
        timeCost: 1,
        staffCost: 1,
        educationalValue: "Demonstrates stakeholder engagement strategies and community relations.",
        impactDescription: "The meeting with fishing communities generated valuable goodwill, though some demands for compensation will strain your budget. The Prime Minister appreciates your effort to address local concerns, but Chinese officials question whether community issues should delay loan repayments.",
        impacts: {
            influence: 10,
            environmental: 15,
            political: 8,
            international: -5
        },
        stakeholderImpacts: [
            {id: 4, relationship: "friendly", reason: "Appreciates formal acknowledgment of concerns and willingness to engage"},
            {id: 2, relationship: "hostile", reason: "Concerned about potential delays to repayment"}
        ],
        objectiveProgress: [
            {id: 2, progress: 25, reason: "Established dialogue with affected communities"},
            {id: 4, progress: 15, reason: "Improved local political standing"}
        ],
        newsUpdate: {
            title: "Azuria Daily News: Finance Ministry Meets with Affected Communities",
            content: "In an unprecedented move, Finance Ministry officials held open consultations with fishing communities affected by port operations. Community leaders presented evidence of declining catches and called for compensation and environmental remediation. Ministry representatives committed to incorporating community concerns into the port's financial restructuring plans, though specific commitments remain undefined."
        },
        unlocksInsight: {
            id: 6,
            title: "Stakeholder Engagement",
            content: "Effective stakeholder engagement requires early identification of affected parties, transparent communication, and meaningful response to concerns. While immediate costs may seem high, addressing social and environmental issues early typically reduces long-term project risks and costs.",
            stakeholdersInvolved: [4, 1]
        }
    },
    {
        id: 7,
        title: "Port Efficiency Upgrade",
        description: "Invest in operational improvements and staff training to increase port efficiency.",
        cost: 2000000,
        timeCost: 2,
        staffCost: 2,
        educationalValue: "Explores operational improvements in infrastructure management.",
        impactDescription: "Your investments in digital management systems, staff training, and equipment upgrades have significantly improved port operations. Turnaround times have decreased by 30%, making the port more attractive to shipping companies. Port Authority leadership is enthusiastic about the changes.",
        impacts: {
            influence: 5,
            fiscal: 15,
            political: 5,
            international: 10
        },
        stakeholderImpacts: [
            {id: 5, relationship: "friendly", reason: "Strongly supports operational improvements"},
            {id: 2, relationship: "neutral", reason: "Recognizes efforts to improve port performance"}
        ],
        objectiveProgress: [
            {id: 1, progress: 25, reason: "Improved operational efficiency directly impacts revenue potential"}
        ],
        newsUpdate: {
            title: "Maritime Business Review: Azuria Port Modernization Shows Early Results",
            content: "A comprehensive efficiency upgrade at Azuria's main port facility is showing promising results, with vessel turnaround times reduced by nearly a third. The Finance Ministry's investment in digital systems and staff capacity has improved the port's competitiveness in the regional shipping market. Industry analysts suggest these operational improvements could significantly boost utilization rates if sustained."
        },
        unlocksInsight: {
            id: 7,
            title: "Operational Efficiency",
            content: "In infrastructure projects, operational inefficiencies often compound financial challenges. Digital systems, staff training, and process optimization can yield returns far exceeding their implementation costs by improving service quality, increasing utilization, and enhancing competitive position.",
            stakeholdersInvolved: [5]
        }
    },
    {
        id: 8,
        title: "Environmental Remediation",
        description: "Implement measures to address environmental damage from port operations.",
        cost: 3000000,
        timeCost: 2,
        staffCost: 1,
        educationalValue: "Demonstrates environmental mitigation strategies in development projects.",
        impactDescription: "Your investment in sediment containment systems and marine habitat restoration has significantly reduced the port's environmental impact. Fishing communities report improved water quality and early signs of fish population recovery. This action has dramatically improved your standing with local communities and environmental organizations.",
        impacts: {
            influence: -15,
            fiscal: -5,
            environmental: 40,
            political: 20,
            international: 10
        },
        stakeholderImpacts: [
            {id: 4, relationship: "friendly", reason: "Deeply appreciates tangible action on environmental concerns"},
            {id: 3, relationship: "friendly", reason: "Values commitment to environmental standards"},
            {id: 1, relationship: "neutral", reason: "Mixed feelings about expense but recognizes political benefits"}
        ],
        objectiveProgress: [
            {id: 2, progress: 50, reason: "Direct action on environmental concerns"}
        ],
        newsUpdate: {
            title: "Environmental Monitor: Azuria Port Launches Major Remediation Initiative",
            content: "The Finance Ministry has allocated substantial resources to address environmental damage caused by port operations. New sediment containment systems are already improving water quality in areas used by local fishing communities. The initiative has been praised by environmental groups as a model for how infrastructure projects can adapt to address ecological concerns. Community leaders express cautious optimism about the remediation efforts."
        },
        unlocksInsight: {
            id: 8,
            title: "Environmental Compliance and Financing",
            content: "Environmental standards have become increasingly significant in infrastructure financing. Projects meeting higher environmental standards can access preferential financing from certain institutions and avoid costly retrofitting or remediation expenses later in their lifecycle.",
            stakeholdersInvolved: [3, 4]
        }
    },
    {
        id: 9,
        title: "Local Economic Development Program",
        description: "Create programs to increase local economic benefits from the port.",
        cost: 1200000,
        timeCost: 2,
        staffCost: 1,
        educationalValue: "Explores strategies for maximizing local economic benefits from infrastructure.",
        impactDescription: "Your program establishing preferential procurement for local businesses and a small business development fund has created significant economic opportunities for Azurian companies. Local business leaders are enthusiastic about the initiative, and early data shows it's generating jobs and tax revenue that partially offset the program costs.",
        impacts: {
            influence: -8,
            fiscal: 5,
            political: 20,
            international: 5
        },
        stakeholderImpacts: [
            {id: 4, relationship: "friendly", reason: "Appreciates creation of alternative livelihood opportunities"},
            {id: 1, relationship: "friendly", reason: "Values job creation and positive political feedback"}
        ],
        objectiveProgress: [
            {id: 2, progress: 15, reason: "Created economic alternatives for affected communities"},
            {id: 4, progress: 25, reason: "Demonstrated commitment to domestic economic benefits"}
        ],
        newsUpdate: {
            title: "Business Today: Port Launches Local Economic Initiative",
            content: "The Finance Ministry has unveiled a comprehensive program to maximize local economic benefits from port operations. Key components include preferential procurement policies for Azurian businesses, a small business development fund, and training programs for local entrepreneurs. Early estimates suggest the initiative could generate up to 500 new jobs and significantly increase the port's contribution to the local economy. Business associations have praised the government's commitment to domestic economic development."
        },
        unlocksInsight: {
            id: 9,
            title: "Local Economic Linkages",
            content: "Large infrastructure projects can function as economic enclaves with limited benefit to surrounding communities, or as catalysts for local economic development. Deliberate policies to strengthen linkages with local businesses, develop workforce skills, and create complementary industries significantly enhance project development impact.",
            stakeholdersInvolved: [1, 4]
        }
    }
],

// Stakeholder engagement options
stakeholderEngagementOptions: {
    1: [ // Prime Minister
        {
            id: 1,
            title: "Formal Financial Briefing",
            description: "Provide a comprehensive briefing on the port's financial situation and your plans to address the challenges.",
            cost: 0,
            influenceCost: 5,
            outcome: "The Prime Minister appreciates your transparency and detailed approach. This builds trust, but he remains concerned about the political implications of potential solutions.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    political: 10,
                    fiscal: 5
                }
            }
        },
        {
            id: 2,
            title: "Media Strategy Coordination",
            description: "Work with the Prime Minister's office to develop a coordinated media strategy around the port financing issues.",
            cost: 200000,
            influenceCost: 0,
            outcome: "Your joint media strategy helps control the narrative around the financing challenges, reducing political pressure on both of you.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    political: 15,
                    international: 5
                }
            }
        },
        {
            id: 3,
            title: "Political Responsibility Distancing",
            description: "Subtly suggest that the loan terms were negotiated before your appointment, shifting responsibility for the problematic clauses.",
            cost: 0,
            influenceCost: 10,
            outcome: "While this temporarily diverts blame from you, it damages trust with the Prime Minister who views it as avoiding responsibility.",
            impacts: {
                relationship: "hostile",
                metrics: {
                    political: -10,
                    influence: -10
                }
            }
        }
    ],
    2: [ // Chinese Export-Import Bank
        {
            id: 1,
            title: "Informal Relationship Building",
            description: "Invest time in building personal relationships with key Bank officials through informal meetings and cultural events.",
            cost: 100000,
            influenceCost: 5,
            outcome: "Your efforts to build rapport pay off, creating more flexible communication channels and a more sympathetic ear for Azuria's challenges.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    international: 10,
                    fiscal: 5
                }
            }
        },
        {
            id: 2,
            title: "Technical Performance Plan",
            description: "Present a detailed technical plan showing how you'll improve port performance and ensure loan repayment.",
            cost: 300000,
            influenceCost: 0,
            outcome: "Bank officials are impressed by your thoroughness and commitment to meeting obligations, creating more willingness to discuss flexible terms.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    fiscal: 15,
                    international: 5
                }
            }
        },
        {
            id: 3,
            title: "Implicit Threat of Default",
            description: "Subtly hint that without restructuring, Azuria might be forced to consider more drastic options like payment suspension.",
            cost: 0,
            influenceCost: 15,
            outcome: "This approach backfires badly, as Bank officials view it as negotiating in bad faith. They become more rigid in their position and alert their government contacts.",
            impacts: {
                relationship: "hostile",
                metrics: {
                    international: -20,
                    political: -10
                }
            }
        }
    ],
    3: [ // World Bank
        {
            id: 1,
            title: "Governance Reform Commitment",
            description: "Present a detailed plan for implementing the governance reforms required for World Bank financing.",
            cost: 200000,
            influenceCost: 0,
            outcome: "World Bank officials are impressed by your commitment to reforms and offer additional technical assistance to support implementation.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    international: 10,
                    fiscal: 10
                }
            }
        },
        {
            id: 2,
            title: "Environmental Standards Upgrade",
            description: "Commit to upgrading port operations to meet World Bank environmental standards as part of refinancing.",
            cost: 500000,
            influenceCost: 0,
            outcome: "This commitment greatly strengthens your refinancing proposal and improves relations with both the World Bank and local communities.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    environmental: 20,
                    international: 15,
                    political: 5
                }
            }
        },
        {
            id: 3,
            title: "Conditionality Negotiation",
            description: "Aggressively push back against some World Bank conditions, arguing they infringe on national sovereignty.",
            cost: 0,
            influenceCost: 10,
            outcome: "While some domestic political actors approve of your stance, World Bank officials see it as a lack of commitment to necessary reforms.",
            impacts: {
                relationship: "hostile",
                metrics: {
                    political: 5,
                    international: -15
                }
            }
        }
    ],
    4: [ // Fishing Communities
        {
            id: 1,
            title: "Community Liaison Office",
            description: "Establish a permanent community liaison office to address ongoing concerns from fishing communities.",
            cost: 200000,
            influenceCost: 0,
            outcome: "The permanent communication channel builds trust and provides early warning of emerging issues, preventing them from escalating.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    political: 10,
                    environmental: 5
                }
            }
        },
        {
            id: 2,
            title: "Compensation Fund",
            description: "Establish a compensation fund for the most severely affected fishing households.",
            cost: 1000000,
            influenceCost: 0,
            outcome: "While expensive, the fund dramatically improves community relations and reduces political pressure from fishing villages.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    political: 20,
                    environmental: 10,
                    fiscal: -5
                }
            }
        },
        {
            id: 3,
            title: "Legal Defense Preparation",
            description: "Quietly prepare legal defenses against potential community lawsuits rather than engaging directly.",
            cost: 300000,
            influenceCost: 0,
            outcome: "This approach is discovered by community leaders, who see it as evidence of bad faith, leading to increased protests and political pressure.",
            impacts: {
                relationship: "hostile",
                metrics: {
                    political: -15,
                    environmental: -10
                }
            }
        }
    ],
    5: [ // Port Authority
        {
            id: 1,
            title: "Performance Incentive System",
            description: "Implement a performance-based incentive system for Port Authority management and staff.",
            cost: 500000,
            influenceCost: 0,
            outcome: "The incentive system aligns Port Authority goals with financial sustainability objectives and motivates staff to improve efficiency.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    fiscal: 15,
                    international: 5
                }
            }
        },
        {
            id: 2,
            title: "Technical Training Program",
            description: "Fund an international technical training program for key Port Authority staff.",
            cost: 400000,
            influenceCost: 0,
            outcome: "The training program builds Port Authority capacity and introduces international best practices, while creating strong loyalty from management.",
            impacts: {
                relationship: "friendly",
                metrics: {
                    fiscal: 10,
                    international: 10
                }
            }
        },
        {
            id: 3,
            title: "Management Audit",
            description: "Commission an external audit of Port Authority management practices and efficiency.",
            cost: 300000,
            influenceCost: 5,
            outcome: "While the audit identifies important operational improvements, Port Authority leadership resents the implied criticism and becomes defensive.",
            impacts: {
                relationship: "hostile",
                metrics: {
                    fiscal: 5,
                    political: -5
                }
            }
        }
    ]
},

// Educational insights
educationalInsights: [
    {
        id: 1,
        title: "Debt Sustainability Analysis",
        content: "Financial sustainability depends on a project's ability to generate sufficient revenue to cover both operational costs and debt service. When debt service coverage ratio falls below 1.0, default risk increases significantly, potentially triggering collateral clauses.",
        source: "Debt Analysis",
        category: "Finance",
        relatedConcepts: ["Debt Service Coverage Ratio", "Revenue Forecasting", "Collateralized Lending"]
    },
    {
        id: 2,
        title: "Environmental Externalities",
        content: "Large infrastructure projects frequently create negative externalities that affect communities not directly benefiting from the project. Addressing these externalities early through consultation and mitigation strategies is typically less costly than managing conflicts after they escalate.",
        source: "Environmental Assessment",
        category: "Environmental",
        relatedConcepts: ["Ecosystem Services", "Social Impact Assessment", "Environmental Compliance"]
    },
    {
        id: 3,
        title: "Bilateral Debt Restructuring",
        content: "When approaching bilateral creditors for debt restructuring, timing and diplomatic context significantly impact outcomes. Restructuring negotiations often involve trade-offs between financial relief and economic concessions in other areas such as market access or future investment opportunities.",
        source: "Diplomatic Meeting",
        category: "Diplomacy",
        relatedConcepts: ["Bilateral Relations", "Debt Renegotiation", "Economic Diplomacy"]
    },
    {
        id: 4,
        title: "Multilateral Financing Conditionality",
        content: "Multilateral development banks typically offer financing with lower interest rates and longer tenors than commercial lenders, but attach policy conditions focused on governance, transparency, and social/environmental standards. These conditions often create domestic political challenges despite their financial advantages.",
        source: "Western Institution Consultation",
        category: "Finance",
        relatedConcepts: ["Conditionality", "Governance Reform", "Policy-Based Lending"]
    },
    {
        id: 5,
        title: "Infrastructure Utilization Economics",
        content: "Infrastructure projects have high fixed costs and relatively low variable costs, making utilization rates a critical factor in financial sustainability. Increasing utilization from 40% to 60% can disproportionately improve financial performance by spreading fixed costs across more revenue-generating activities.",
        source: "Marketing Campaign",
        category: "Operations",
        relatedConcepts: ["Fixed vs. Variable Costs", "Capacity Utilization", "Break-Even Analysis"]
    },
    {
        id: 6,
        title: "Stakeholder Engagement",
        content: "Effective stakeholder engagement requires early identification of affected parties, transparent communication, and meaningful response to concerns. While immediate costs may seem high, addressing social and environmental issues early typically reduces long-term project risks and costs.",
        source: "Public Stakeholder Meeting",
        category: "Social",
        relatedConcepts: ["Social License to Operate", "Conflict Resolution", "Community Relations"]
    },
    {
        id: 7,
        title: "Operational Efficiency",
        content: "In infrastructure projects, operational inefficiencies often compound financial challenges. Digital systems, staff training, and process optimization can yield returns far exceeding their implementation costs by improving service quality, increasing utilization, and enhancing competitive position.",
        source: "Port Efficiency Upgrade",
        category: "Operations",
        relatedConcepts: ["Digital Transformation", "Capacity Building", "Process Optimization"]
    },
    {
        id: 8,
        title: "Environmental Compliance and Financing",
        content: "Environmental standards have become increasingly significant in infrastructure financing. Projects meeting higher environmental standards can access preferential financing from certain institutions and avoid costly retrofitting or remediation expenses later in their lifecycle.",
        source: "Environmental Remediation",
        category: "Environmental",
        relatedConcepts: ["Green Finance", "Environmental Safeguards", "Compliance Costs"]
    },
    {
        id: 9,
        title: "Local Economic Linkages",
        content: "Large infrastructure projects can function as economic enclaves with limited benefit to surrounding communities, or as catalysts for local economic development. Deliberate policies to strengthen linkages with local businesses, develop workforce skills, and create complementary industries significantly enhance project development impact.",
        source: "Local Economic Development Program",
        category: "Social",
        relatedConcepts: ["Local Content Policies", "Economic Multipliers", "Supply Chain Development"]
    }
]
};

/**
* Document descriptions for additional context
* @type {Object}
*/
const documentDescriptions = {
1: "A comprehensive financial overview of the port project, including initial investment details, revenue projections versus actual performance, and cash flow analysis. Includes notes on concerning collateral terms.",
2: "Detailed assessment of the environmental impact from port operations, including disruption to marine habitats, effects on local fishing communities, and recommendations for mitigation measures.",
3: "Excerpts from the original loan agreement with the Chinese Export-Import Bank, highlighting key clauses related to security, collateral, default conditions, and dispute resolution mechanisms.",
4: "Analysis of the port's current operational efficiency, identifying key challenges and providing recommendations to improve capacity utilization and competitiveness.",
5: "Comparative analysis of four potential refinancing options with different terms, requirements, benefits, and risks associated with each approach.",
6: "First-hand testimonials from fishing village representatives, local business owners, and environmental advocates regarding the impact of port operations on their communities and livelihoods.",
7: "Educational briefing on key concepts in development finance, including debt sustainability, collateralized lending, blended finance, conditionality, externalities, and stakeholder management."
};

    // Utility Functions
    const utils = {
        /**
         * Generates a unique identifier
         * @returns {string} A unique ID
         */
        generateUniqueId: function() {
            return 'id-' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Deep clone an object to prevent unintended reference mutations
         * @param {Object} obj - Object to be cloned
         * @returns {Object} A deep copy of the object
         */
        deepClone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        /**
         * Safely logs messages in debug mode
         * @param {string} message - Message to log
         * @param {string} [type='log'] - Type of log (log, warn, error)
         */
        debugLog: function(message, type = 'log') {
            if (DEBUG_MODE) {
                console[type](message);
            }
        },

        /**
         * Calculates percentage with error handling
         * @param {number} value - Current value
         * @param {number} total - Total possible value
         * @returns {number} Percentage calculation
         */
        calculatePercentage: function(value, total) {
            if (total === 0) return 0;
            return Math.round((value / total) * 100);
        },

        /**
         * Formats currency with locale-specific formatting
         * @param {number} amount - Monetary amount
         * @returns {string} Formatted currency string
         */
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }
    };

    /**
     * Game Initialization Module
     * Responsible for setting up the game environment
     */
    const gameInitializer = {
        /**
         * Primary initialization method
         * Sets up game state, UI, and initial game conditions
         */
        init: function() {
            if (gameState.initialized) return;

            // Validate initial game state
            this.validateGameState();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize UI components
            this.initializeUI();

            // Mark game as initialized
            gameState.initialized = true;

            utils.debugLog('Game initialization complete');
        },

        /**
         * Validates the initial game state
         * Ensures all required properties and values are present
         */
        validateGameState: function() {
            const requiredMetrics = ['fiscal', 'environmental', 'political', 'international'];
            requiredMetrics.forEach(metric => {
                if (gameState.metrics[metric] === undefined) {
                    gameState.metrics[metric] = 50; // Default value
                    utils.debugLog(`Metric ${metric} was undefined. Set to default.`, 'warn');
                }
            });

            // Ensure resources are within reasonable bounds
            Object.keys(gameState.resources).forEach(resource => {
                if (gameState.resources[resource] < 0) {
                    gameState.resources[resource] = 0;
                    utils.debugLog(`Resource ${resource} cannot be negative. Reset to 0.`, 'warn');
                }
            });
        },

        /**
         * Sets up global event listeners
         */
        setupEventListeners: function() {
            // Placeholder for global event listener setup
            // Will be expanded in subsequent development stages
        },

        /**
         * Initializes user interface components
         */
        initializeUI: function() {
            // Placeholder for UI initialization
            // Elements like splash screen, game panels will be activated here
        }
    };
    /**
     * Mission Management Module
     * Handles mission progression, objective tracking, and game state updates
     */
    const missionManager = {
        /**
         * Advances the game to the next day
         * Triggers daily updates, checks game conditions, and manages progression
         */
        advanceDay: function() {
            // Prevent day advancement if game is not initialized
            if (!gameState.initialized) return;

            // Increment current day
            gameState.currentDay++;
            gameState.resources.timeRemaining--;

            // Update daily resources
            this.updateDailyResources();

            // Check for mission-critical events
            this.checkMissionCriticalConditions();

            // Update overall mission progress
            this.updateMissionProgress();

            // Log day advancement
            utils.debugLog(`Day advanced: ${gameState.currentDay}`);

            // Trigger UI updates
            uiManager.updateMissionTimer();
            uiManager.updateResourceDisplay();
            uiManager.updateMetricsDisplay();
        },

        /**
         * Updates resources based on daily game mechanics
         * Handles passive income, maintenance costs, and other daily adjustments
         */
        updateDailyResources: function() {
            // Implement daily resource management logic
            const dailyOperationCost = 50000; // Example operational cost
            gameState.resources.budget -= dailyOperationCost;

            // Potential daily influence gain/loss based on current relationships
            const influenceFluctuation = this.calculateInfluenceFluctuation();
            gameState.resources.influence += influenceFluctuation;

            // Ensure resources don't go below zero
            Object.keys(gameState.resources).forEach(resource => {
                if (gameState.resources[resource] < 0) {
                    gameState.resources[resource] = 0;
                }
            });
        },

        /**
         * Calculates daily influence fluctuations based on stakeholder relationships
         * @returns {number} Influence change for the day
         */
        calculateInfluenceFluctuation: function() {
            const stakeholderRelationships = gameState.stakeholderEngagements.map(
                engagement => engagement.relationship
            );

            // Simple relationship impact calculation
            const influenceImpact = stakeholderRelationships.reduce((total, relationship) => {
                switch(relationship) {
                    case 'friendly': return total + 2;
                    case 'neutral': return total;
                    case 'hostile': return total - 1;
                    default: return total;
                }
            }, 0);

            return influenceImpact;
        },

        /**
         * Checks critical mission conditions that could trigger game over
         */
        checkMissionCriticalConditions: function() {
            const criticalConditions = [
                { 
                    check: () => gameState.resources.budget <= 0, 
                    message: 'Budget depleted. Mission failed.' 
                },
                { 
                    check: () => gameState.resources.influence <= gameState.thresholds.influence, 
                    message: 'Political influence too low. Mission failed.' 
                },
                { 
                    check: () => gameState.currentDay >= gameState.totalDays, 
                    message: 'Mission time expired.' 
                }
            ];

            const failedCondition = criticalConditions.find(condition => condition.check());
            
            if (failedCondition) {
                this.endMission(false, failedCondition.message);
            }
        },

        /**
         * Updates overall mission progress based on objective completion
         */
        updateMissionProgress: function() {
            const completedObjectives = gameState.completedObjectives.length;
            const totalObjectives = 4; // Hardcoded total objectives
            
            const progressPercentage = utils.calculatePercentage(
                completedObjectives, 
                totalObjectives
            );

            gameState.missionProgress = progressPercentage;
            uiManager.updateOverallProgressBar(progressPercentage);
        },

        /**
         * Ends the current mission
         * @param {boolean} success - Whether mission was successfully completed
         * @param {string} [endMessage] - Message explaining mission outcome
         */
        endMission: function(success, endMessage) {
            gameState.missionCompleted = true;
            gameState.missionSuccess = success;

            // Trigger game result modal
            uiManager.showGameResultModal({
                success: success,
                message: endMessage,
                metrics: gameState.metrics,
                stakeholderRelationships: this.getFinalStakeholderRelationships()
            });
        },

        /**
         * Compiles final stakeholder relationship status
         * @returns {Array} Array of stakeholder relationship statuses
         */
        getFinalStakeholderRelationships: function() {
            return gameState.stakeholders.map(stakeholder => ({
                name: stakeholder.name,
                relationship: stakeholder.relationship
            }));
        }
    };

        // ===== TAB NAVIGATION =====
        function loadTabContent(tabName) {
            const panelContent = document.querySelector('.game-panel .panel-content');
            
            // Highlight active tab
            document.querySelectorAll('.tab').forEach(tab => {
                if (tab.dataset.tab === tabName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            // Clear the badge count for updates tab if selected
            if (tabName === 'updates') {
                document.querySelector('.updates-badge').textContent = '0';
            }
            
            // Load appropriate content
            if (tabName === 'overview') {
                loadOverviewTab(panelContent);
            } else if (tabName === 'documents') {
                loadDocumentsTab(panelContent);
            } else if (tabName === 'activity') {
                loadActivityTab(panelContent);
            } else if (tabName === 'insights') {
                loadInsightsTab(panelContent);
            } else if (tabName === 'updates') {
                loadUpdatesTab(panelContent);
            }
        }
        
        function loadOverviewTab(container) {
            container.innerHTML = `
                <div class="narrative-section">
                    <div class="narrative-entry">
                        <div class="narrative-icon">📜</div>
                        <div class="narrative-content">
                            <h3>The Port Crisis</h3>
                            <p>Azuria's port facility, a cornerstone infrastructure project financed through a commercial loan from China, is operating at only 40% capacity. This has created a fiscal crisis with loan repayments exceeding revenue generation, while environmental concerns from local fishing communities are mounting.</p>
                        </div>
                    </div>
                    
                    <div class="narrative-entry">
                        <div class="narrative-icon">🎯</div>
                        <div class="narrative-content">
                            <h3>Your Mission</h3>
                            <p>As the newly appointed Special Envoy for Infrastructure Finance, you must navigate complex financial, environmental, and diplomatic challenges to establish a sustainable path forward. Balance the competing interests of stakeholders while protecting your country's fiscal stability and international reputation.</p>
                        </div>
                    </div>
                </div>
                
                <div class="action-cards">
                    <div class="action-card" data-action="financial-audit">
                        <div class="action-header">
                            <h4>Financial Audit</h4>
                            <div class="action-cost">$250,000</div>
                        </div>
                        <div class="action-description">Commission a comprehensive financial audit of the port operations to identify inefficiencies and revenue leakage.</div>
                        <div class="action-educational-value">Understand how infrastructure projects are evaluated for financial sustainability.</div>
                    </div>
                    
                    <div class="action-card" data-action="environmental-assessment">
                        <div class="action-header">
                            <h4>Environmental Assessment</h4>
                            <div class="action-cost">$300,000</div>
                        </div>
                        <div class="action-description">Conduct an environmental impact assessment to address concerns raised by local fishing communities.</div>
                        <div class="action-educational-value">Learn about environmental considerations in large infrastructure projects.</div>
                    </div>
                    
                    <div class="action-card" data-action="debt-renegotiation">
                        <div class="action-header">
                            <h4>Debt Renegotiation</h4>
                            <div class="action-cost">15 Influence</div>
                        </div>
                        <div class="action-description">Initiate discussions with the Chinese Development Bank to restructure loan terms and repayment schedule.</div>
                        <div class="action-educational-value">Explore the complexities of sovereign debt restructuring.</div>
                    </div>
                    
                    <div class="action-card" data-action="western-funding">
                        <div class="action-header">
                            <h4>Western Funding Appeal</h4>
                            <div class="action-cost">10 Influence</div>
                        </div>
                        <div class="action-description">Approach Western donors and development institutions for refinancing and technical assistance.</div>
                        <div class="action-educational-value">Understand the geopolitics of development finance.</div>
                    </div>
                    
                    <div class="action-card" data-action="community-engagement">
                        <div class="action-header">
                            <h4>Community Engagement</h4>
                            <div class="action-cost">$200,000</div>
                        </div>
                        <div class="action-description">Establish a community liaison office to address concerns of local stakeholders and improve relations.</div>
                        <div class="action-educational-value">Learn about social license to operate in infrastructure projects.</div>
                    </div>
                    
                    <div class="action-card" data-action="marketing-initiative">
                        <div class="action-header">
                            <h4>Port Marketing Initiative</h4>
                            <div class="action-cost">$350,000</div>
                        </div>
                        <div class="action-description">Launch an international marketing campaign to attract more shipping traffic and increase port utilization.</div>
                        <div class="action-educational-value">Explore strategies for improving infrastructure project viability.</div>
                    </div>
                </div>
                
                <div class="education-insight">
                    <h4>Development Finance Insight</h4>
                    <p>Infrastructure projects in developing countries often face challenges of balancing commercial viability with development impact. The "infrastructure financing gap" refers to the difference between available financing and what's needed for sustainable development.</p>
                </div>
            `;
            
            // Add event listeners to action cards
            container.querySelectorAll('.action-card').forEach(card => {
                card.addEventListener('click', function() {
                    const actionType = this.dataset.action;
                    handleActionCardClick(actionType);
                });
            });
        }
        
        function loadDocumentsTab(container) {
            container.innerHTML = `
                <div class="documents-interface">
                    <div class="documents-sidebar">
                        <h3>Available Documents</h3>
                        <div class="documents-list">
                            <div class="document-item active" data-document="loan-agreement">
                                <div class="document-icon">📄</div>
                                <div class="document-info">
                                    <div class="document-title">Loan Agreement</div>
                                    <div class="document-type">Legal</div>
                                </div>
                            </div>
                            
                            <div class="document-item" data-document="financial-report">
                                <div class="document-icon">📊</div>
                                <div class="document-info">
                                    <div class="document-title">Financial Report</div>
                                    <div class="document-type">Analysis</div>
                                </div>
                            </div>
                            
                            <div class="document-item" data-document="environmental-concerns">
                                <div class="document-icon">🌊</div>
                                <div class="document-info">
                                    <div class="document-title">Environmental Concerns</div>
                                    <div class="document-type">Report</div>
                                </div>
                            </div>
                            
                            <div class="document-item" data-document="stakeholder-testimonials">
                                <div class="document-icon">👥</div>
                                <div class="document-info">
                                    <div class="document-title">Stakeholder Testimonials</div>
                                    <div class="document-type">Interviews</div>
                                </div>
                            </div>
                            
                            <div class="document-item" data-document="port-capacity">
                                <div class="document-icon">🚢</div>
                                <div class="document-info">
                                    <div class="document-title">Port Capacity Analysis</div>
                                    <div class="document-type">Technical</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="document-viewer">
                        <div class="document-header">
                            <div class="document-header-icon">📄</div>
                            <div class="document-header-info">
                                <h3>Loan Agreement</h3>
                                <div class="document-header-type">Legal Document</div>
                            </div>
                        </div>
                        
                        <div class="document-content legal-document">
                            <div class="document-section">
                                <h4>Loan Terms Summary</h4>
                                <p>This agreement ("Agreement") dated June 15, 2020, is between the Chinese Development Bank ("Lender") and the Republic of Azuria ("Borrower") for the development and operation of the Azuria International Port Facility ("Project").</p>
                                
                                <div class="legal-article">
                                    <h5>Article 1: Loan Particulars</h5>
                                    <div class="legal-clauses">
                                        <div class="legal-clause">
                                            <div class="clause-number">1.1</div>
                                            <div class="clause-text">Loan Principal: USD 750,000,000 (Seven Hundred Fifty Million United States Dollars)</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">1.2</div>
                                            <div class="clause-text">Interest Rate: 4.5% per annum, fixed rate</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">1.3</div>
                                            <div class="clause-text">Term: 20 years</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">1.4</div>
                                            <div class="clause-text">Grace Period: 3 years (interest-only payments)</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">1.5</div>
                                            <div class="clause-text">Repayment Schedule: Quarterly payments of USD 14,875,000 commencing after the grace period</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="legal-article">
                                    <h5>Article 2: Security and Collateral</h5>
                                    <div class="legal-clauses">
                                        <div class="legal-clause">
                                            <div class="clause-number">2.1</div>
                                            <div class="clause-text">The Borrower grants to the Lender a priority lien on all assets, revenue streams, and operations of the Project.</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">2.2</div>
                                            <div class="clause-text">In the event of default persisting beyond 180 days, the Lender reserves the right to <span class="legal-term">assume operational control</span> of the Project until all outstanding debts are satisfied.</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">2.3</div>
                                            <div class="clause-text">The Borrower agrees to establish an <span class="legal-term">escrow account</span> wherein 30% of all Project revenue will be automatically directed toward loan repayment.</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="legal-article">
                                    <h5>Article 3: Default Provisions</h5>
                                    <div class="legal-clauses">
                                        <div class="legal-clause">
                                            <div class="clause-number">3.1</div>
                                            <div class="clause-text">A default event shall be triggered if the Borrower fails to make any scheduled payment within 90 days of the due date.</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">3.2</div>
                                            <div class="clause-text">Upon default, all outstanding principal and interest shall become immediately due and payable at the Lender's discretion.</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">3.3</div>
                                            <div class="clause-text">Default interest at a rate of 9% per annum shall apply to any unpaid amounts.</div>
                                        </div>
                                        
                                        <div class="legal-clause">
                                            <div class="clause-number">3.4</div>
                                            <div class="clause-text">In addition to the remedies specified in Article 2.2, the Lender shall be entitled to <span class="redacted-text">redacted content</span> as additional security.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners to document items
            container.querySelectorAll('.document-item').forEach(item => {
                item.addEventListener('click', function() {
                    // Remove active class from all items
                    container.querySelectorAll('.document-item').forEach(i => i.classList.remove('active'));
                    
                    // Add active class to clicked item
                    this.classList.add('active');
                    
                    // Load document content
                    loadDocumentContent(this.dataset.document, container.querySelector('.document-viewer'));
                });
            });
        }
        
        function loadDocumentContent(documentId, container) {
            let documentTitle, documentType, documentIcon, documentContent;
            
            switch (documentId) {
                case 'loan-agreement':
                    documentTitle = 'Loan Agreement';
                    documentType = 'Legal Document';
                    documentIcon = '📄';
                    documentContent = `
                        <div class="document-section">
                            <h4>Loan Terms Summary</h4>
                            <p>This agreement ("Agreement") dated June 15, 2020, is between the Chinese Development Bank ("Lender") and the Republic of Azuria ("Borrower") for the development and operation of the Azuria International Port Facility ("Project").</p>
                            
                            <div class="legal-article">
                                <h5>Article 1: Loan Particulars</h5>
                                <div class="legal-clauses">
                                    <div class="legal-clause">
                                        <div class="clause-number">1.1</div>
                                        <div class="clause-text">Loan Principal: USD 750,000,000 (Seven Hundred Fifty Million United States Dollars)</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">1.2</div>
                                        <div class="clause-text">Interest Rate: 4.5% per annum, fixed rate</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">1.3</div>
                                        <div class="clause-text">Term: 20 years</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">1.4</div>
                                        <div class="clause-text">Grace Period: 3 years (interest-only payments)</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">1.5</div>
                                        <div class="clause-text">Repayment Schedule: Quarterly payments of USD 14,875,000 commencing after the grace period</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="legal-article">
                                <h5>Article 2: Security and Collateral</h5>
                                <div class="legal-clauses">
                                    <div class="legal-clause">
                                        <div class="clause-number">2.1</div>
                                        <div class="clause-text">The Borrower grants to the Lender a priority lien on all assets, revenue streams, and operations of the Project.</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">2.2</div>
                                        <div class="clause-text">In the event of default persisting beyond 180 days, the Lender reserves the right to <span class="legal-term">assume operational control</span> of the Project until all outstanding debts are satisfied.</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">2.3</div>
                                        <div class="clause-text">The Borrower agrees to establish an <span class="legal-term">escrow account</span> wherein 30% of all Project revenue will be automatically directed toward loan repayment.</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="legal-article">
                                <h5>Article 3: Default Provisions</h5>
                                <div class="legal-clauses">
                                    <div class="legal-clause">
                                        <div class="clause-number">3.1</div>
                                        <div class="clause-text">A default event shall be triggered if the Borrower fails to make any scheduled payment within 90 days of the due date.</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">3.2</div>
                                        <div class="clause-text">Upon default, all outstanding principal and interest shall become immediately due and payable at the Lender's discretion.</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">3.3</div>
                                        <div class="clause-text">Default interest at a rate of 9% per annum shall apply to any unpaid amounts.</div>
                                    </div>
                                    
                                    <div class="legal-clause">
                                        <div class="clause-number">3.4</div>
                                        <div class="clause-text">In addition to the remedies specified in Article 2.2, the Lender shall be entitled to <span class="redacted-text">redacted content</span> as additional security.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'financial-report':
                    documentTitle = 'Financial Report';
                    documentType = 'Analysis';
                    documentIcon = '📊';
                    documentContent = `
                        <div class="document-section">
                            <h4>Executive Summary</h4>
                            <p>This financial assessment evaluates the current fiscal health of the Azuria International Port Facility. The report reveals significant discrepancies between projected and actual performance, creating substantial fiscal strain on the national budget.</p>
                        </div>
                        
                        <div class="document-section">
                            <h4>Key Financial Metrics</h4>
                            <div class="finance-metrics-visualization">
                                <div class="finance-metric">
                                    <div class="metric-name">Annual Revenue</div>
                                    <div class="metric-bar">
                                        <div class="metric-fill metric-unhealthy" style="width: 40%">$26M</div>
                                        <div class="metric-target" style="left: 65%" title="Target: $65M"></div>
                                    </div>
                                    <div class="metric-value">$26M <span class="metric-benchmark">vs $65M projected</span></div>
                                </div>
                                
                                <div class="finance-metric">
                                    <div class="metric-name">Debt Service Ratio</div>
                                    <div class="metric-bar">
                                        <div class="metric-fill metric-unhealthy" style="width: 75%">1.62</div>
                                        <div class="metric-target" style="left: 40%" title="Target: 0.8"></div>
                                    </div>
                                    <div class="metric-value">1.62 <span class="metric-benchmark">vs 0.8 sustainable</span></div>
                                </div>
                                
                                <div class="finance-metric">
                                    <div class="metric-name">Operational Costs</div>
                                    <div class="metric-bar">
                                        <div class="metric-fill metric-unhealthy" style="width: 85%">$18M</div>
                                        <div class="metric-target" style="left: 65%" title="Target: $15M"></div>
                                    </div>
                                    <div class="metric-value">$18M <span class="metric-benchmark">vs $15M projected</span></div>
                                </div>
                                
                                <div class="finance-metric">
                                    <div class="metric-name">Port Capacity Utilization</div>
                                    <div class="metric-bar">
                                        <div class="metric-fill metric-unhealthy" style="width: 40%">40%</div>
                                        <div class="metric-target" style="left: 80%" title="Target: 80%"></div>
                                    </div>
                                    <div class="metric-value">40% <span class="metric-benchmark">vs 80% projected</span></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="document-section">
                            <h4>Cash Flow Analysis</h4>
                            <div class="cash-flow-visualization">
                                <div class="cash-flow-item">
                                    <div class="cash-flow-label">Annual Revenue</div>
                                    <div class="cash-flow-bar-container">
                                        <div class="cash-flow-bar cash-flow-positive" style="width: 40%">$26M</div>
                                    </div>
                                </div>
                                
                                <div class="cash-flow-item">
                                    <div class="cash-flow-label">Operating Expenses</div>
                                    <div class="cash-flow-bar-container">
                                        <div class="cash-flow-bar cash-flow-negative" style="width: 28%">-$18M</div>
                                    </div>
                                </div>
                                
                                <div class="cash-flow-item">
                                    <div class="cash-flow-label">Debt Service</div>
                                    <div class="cash-flow-bar-container">
                                        <div class="cash-flow-bar cash-flow-negative" style="width: 65%">-$42M</div>
                                    </div>
                                </div>
                                
                                <div class="cash-flow-item">
                                    <div class="cash-flow-label">Net Cash Flow</div>
                                    <div class="cash-flow-bar-container">
                                        <div class="cash-flow-bar cash-flow-negative" style="width: 52%">-$34M</div>
                                    </div>
                                </div>
                            </div>
                            
                            <p>The negative cash flow of $34M annually is currently being covered by the national treasury, creating significant strain on the country's fiscal resources.</p>
                        </div>
                        
                        <div class="document-section">
                            <h4>Debt Sustainability Analysis</h4>
                            <p>Based on current trends, the port will continue to require substantial government subsidies for the foreseeable future. Key recommendations include:</p>
                            <ul>
                                <li>Renegotiate loan terms with the Chinese Development Bank</li>
                                <li>Implement targeted strategies to increase capacity utilization</li>
                                <li>Reduce operational costs through efficiency improvements</li>
                                <li>Explore alternative revenue streams beyond core shipping operations</li>
                            </ul>
                        </div>
                    `;
                    break;
                    
                case 'environmental-concerns':
                    documentTitle = 'Environmental Concerns';
                    documentType = 'Report';
                    documentIcon = '🌊';
                    documentContent = `
                        <div class="document-section">
                            <h4>Environmental Impact Assessment</h4>
                            <p>This report summarizes the environmental concerns raised by local communities and environmental organizations regarding the Azuria International Port Facility. These issues have created significant social tension and are affecting the port's operations and reputation.</p>
                        </div>
                        
                        <div class="document-section">
                            <h4>Key Environmental Impacts</h4>
                            <div class="environmental-impact-visualization">
                                <div class="impact-metric">
                                    <div class="impact-label">Marine Ecosystem Disruption</div>
                                    <div class="impact-bar-container">
                                        <div class="impact-bar" style="width: 75%">Severe</div>
                                    </div>
                                </div>
                                
                                <div class="impact-metric">
                                    <div class="impact-label">Fishing Stock Reduction</div>
                                    <div class="impact-bar-container">
                                        <div class="impact-bar" style="width: 65%">High</div>
                                    </div>
                                </div>
                                
                                <div class="impact-metric">
                                    <div class="impact-label">Water Quality Degradation</div>
                                    <div class="impact-bar-container">
                                        <div class="impact-bar" style="width: 55%">Moderate</div>
                                    </div>
                                </div>
                                
                                <div class="impact-metric">
                                    <div class="impact-label">Economic Impact on Fishing</div>
                                    <div class="impact-bar-container">
                                        <div class="impact-bar impact-economic" style="width: 70%">Est. $3.2M annual loss</div>
                                    </div>
                                </div>
                                
                                <div class="impact-metric">
                                    <div class="impact-label">Affected Households</div>
                                    <div class="impact-bar-container">
                                        <div class="impact-bar impact-households" style="width: 58%">~1,200 households</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="document-section">
                            <h4>Remediation Cost Estimates</h4>
                            <div class="remediation-costs-visualization">
                                <div class="remediation-item">
                                    <div class="remediation-label">Marine Ecosystem Restoration</div>
                                    <div class="remediation-bar-container">
                                        <div class="remediation-bar" style="width: 85%">$2.5M</div>
                                    </div>
                                </div>
                                
                                <div class="remediation-item">
                                    <div class="remediation-label">Water Quality Improvement</div>
                                    <div class="remediation-bar-container">
                                        <div class="remediation-bar" style="width: 55%">$1.8M</div>
                                    </div>
                                </div>
                                
                                <div class="remediation-item">
                                    <div class="remediation-label">Fishery Stock Replenishment</div>
                                    <div class="remediation-bar-container">
                                        <div class="remediation-bar" style="width: 45%">$1.5M</div>
                                    </div>
                                </div>
                                
                                <div class="remediation-item">
                                    <div class="remediation-label">Community Compensation</div>
                                    <div class="remediation-bar-container">
                                        <div class="remediation-bar" style="width: 65%">$2.2M</div>
                                    </div>
                                </div>
                                
                                <div class="remediation-total">
                                    Estimated Total: $8.0M
                                </div>
                            </div>
                        </div>
                        
                        <div class="document-section">
                            <h4>Community Demands</h4>
                            <p>Local fishing communities and environmental organizations have made the following demands:</p>
                            <ul>
                                <li>Immediate compensation for lost livelihoods and ecological damage</li>
                                <li>Implementation of strict environmental safeguards</li>
                                <li>Reduced shipping traffic during key fish migration and breeding periods</li>
                                <li>Community representation in port management decisions</li>
                                <li>Commitment to long-term ecosystem restoration projects</li>
                            </ul>
                        </div>
                    `;
                    break;
                    
                case 'stakeholder-testimonials':
                    documentTitle = 'Stakeholder Testimonials';
                    documentType = 'Interviews';
                    documentIcon = '👥';
                    documentContent = `
                        <div class="document-section">
                            <h4>Stakeholder Interview Summary</h4>
                            <p>This document contains excerpts from interviews with key stakeholders regarding the Azuria International Port Facility. These testimonials provide valuable insights into different perspectives and concerns.</p>
                        </div>
                        
                        <div class="testimonial-document">
                            <div class="testimonial">
                                <div class="testimonial-quote">
                                    The port project was intended to be a cornerstone of our economic development strategy, but the current financial situation is unsustainable. We're diverting funds from education and healthcare to cover the shortfall. Without a viable solution, we risk both our fiscal stability and our sovereign credit rating.
                                </div>
                                <div class="testimonial-attribution">
                                    <div class="testimonial-avatar" style="background-color: #32a582">FM</div>
                                    <div class="testimonial-info">
                                        <div class="testimonial-name">Dr. Elena Moreno</div>
                                        <div class="testimonial-role">Finance Minister</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="testimonial">
                                <div class="testimonial-quote">
                                    The environmental impact assessment conducted before construction was woefully inadequate. We've documented a 45% decline in local fish populations and significant damage to coral reefs. The local fishing communities are suffering, and our concerns continue to be ignored in favor of commercial interests.
                                </div>
                                <div class="testimonial-attribution">
                                    <div class="testimonial-avatar" style="background-color: #fbb63c">EA</div>
                                    <div class="testimonial-info">
                                        <div class="testimonial-name">Dr. Marco Torres</div>
                                        <div class="testimonial-role">Environmental Agency Director</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="testimonial">
                                <div class="testimonial-quote">
                                    We have been flexible partners thus far, but the continued underperformance of the port facility is concerning. We expect Azuria to honor its financial commitments. Alternative arrangements may be possible, but they would need to protect our interests while ensuring the long-term viability of the project.
                                </div>
                                <div class="testimonial-attribution">
                                    <div class="testimonial-avatar" style="background-color: #e55a29">CDB</div>
                                    <div class="testimonial-info">
                                        <div class="testimonial-name">Mr. Wei Zhang</div>
                                        <div class="testimonial-role">Chinese Development Bank Representative</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="testimonial">
                                <div class="testimonial-quote">
                                    Western donors are concerned about the debt sustainability implications of this project. Any assistance would be contingent on comprehensive reforms, including improved governance, environmental safeguards, and financial transparency. We're open to discussions but need to see concrete steps toward sustainable management.
                                </div>
                                <div class="testimonial-attribution">
                                    <div class="testimonial-avatar" style="background-color: #0a6860">WD</div>
                                    <div class="testimonial-info">
                                        <div class="testimonial-name">Ms. Sarah Johnson</div>
                                        <div class="testimonial-role">Western Donors Consortium</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="testimonial">
                                <div class="testimonial-quote">
                                    Our families have fished these waters for generations. Now our catches are half what they were, and many of us can barely feed our families. We were promised jobs at the port, but few materialized. We need immediate support and real solutions, not more empty promises.
                                </div>
                                <div class="testimonial-attribution">
                                    <div class="testimonial-avatar" style="background-color: #6e7a94">LC</div>
                                    <div class="testimonial-info">
                                        <div class="testimonial-name">Mr. Carlos Vega</div>
                                        <div class="testimonial-role">Fishing Community Leader</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="testimonial">
                                <div class="testimonial-quote">
                                    The port has significant untapped potential. Our main challenges are attracting more shipping traffic and optimizing operations. With the right investments in marketing and infrastructure upgrades, we could increase capacity utilization to 70-80% within two years. This would transform our financial outlook.
                                </div>
                                <div class="testimonial-attribution">
                                    <div class="testimonial-avatar" style="background-color: #37a6a0">PA</div>
                                    <div class="testimonial-info">
                                        <div class="testimonial-name">Capt. Samuel Ortiz</div>
                                        <div class="testimonial-role">Port Authority Director</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'port-capacity':
                    documentTitle = 'Port Capacity Analysis';
                    documentType = 'Technical';
                    documentIcon = '🚢';
                    documentContent = `
                        <div class="document-section">
                            <h4>Port Capacity and Utilization Analysis</h4>
                            <p>This technical assessment evaluates the current operational capacity and utilization of the Azuria International Port Facility, identifying key bottlenecks and improvement opportunities.</p>
                        </div>
                        
                        <div class="document-section">
                            <h4>Current Capacity Utilization</h4>
                            <div class="port-performance-chart">
                                <div class="capacity-chart">
                                    <div class="capacity-item">
                                        <div class="capacity-label">Container Terminal (40% Utilized)</div>
                                        <div class="capacity-bar-container">
                                            <div class="capacity-bar low-utilization" style="width: 40%">40%</div>
                                        </div>
                                        <div class="target-marker" style="left: 80%">Target: 80%</div>
                                    </div>
                                    
                                    <div class="capacity-item">
                                        <div class="capacity-label">Bulk Cargo Terminal (45% Utilized)</div>
                                        <div class="capacity-bar-container">
                                            <div class="capacity-bar low-utilization" style="width: 45%">45%</div>
                                        </div>
                                        <div class="target-marker" style="left: 75%">Target: 75%</div>
                                    </div>
                                    
                                    <div class="capacity-item">
                                        <div class="capacity-label">Liquid Terminal (25% Utilized)</div>
                                        <div class="capacity-bar-container">
                                            <div class="capacity-bar low-utilization" style="width: 25%">25%</div>
                                        </div>
                                        <div class="target-marker" style="left: 70%">Target: 70%</div>
                                    </div>
                                    
                                    <div class="capacity-item">
                                        <div class="capacity-label">Passenger Terminal (50% Utilized)</div>
                                        <div class="capacity-bar-container">
                                            <div class="capacity-bar medium-utilization" style="width: 50%">50%</div>
                                        </div>
                                        <div class="target-marker" style="left: 85%">Target: 85%</div>
                                    </div>
                                    
                                    <div class="capacity-item overall">
                                        <div class="capacity-label">Overall Utilization</div>
                                        <div class="capacity-bar-container">
                                            <div class="capacity-bar low-utilization" style="width: 40%">40%</div>
                                        </div>
                                        <div class="target-marker" style="left: 75%">Target: 75%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="document-section">
                            <h4>Identified Bottlenecks</h4>
                            <ul>
                                <li><strong>Limited Regional Connectivity:</strong> Insufficient transport links to inland markets.</li>
                                <li><strong>Port Service Costs:</strong> Higher handling fees compared to competing regional ports.</li>
                                <li><strong>Operational Inefficiencies:</strong> Longer turnaround times due to outdated cargo handling systems.</li>
                                <li><strong>Inadequate Marketing:</strong> Limited efforts to attract international shipping companies.</li>
                                <li><strong>Regulatory Complexity:</strong> Cumbersome customs procedures deterring potential users.</li>
                            </ul>
                        </div>
                        
                        <div class="document-section">
                            <h4>Revenue Enhancement Opportunities</h4>
                            <div class="financing-comparison">
                                <div class="comparison-grid">
                                    <div class="comparison-header">
                                        <div class="comparison-cell header-cell">Strategy</div>
                                        <div class="comparison-cell header-cell">Implementation Cost</div>
                                        <div class="comparison-cell header-cell">Revenue Impact</div>
                                        <div class="comparison-cell header-cell">Timeline</div>
                                        <div class="comparison-cell header-cell">Complexity</div>
                                    </div>
                                    
                                    <div class="comparison-row">
                                        <div class="comparison-cell">Fee Structure Optimization</div>
                                        <div class="comparison-cell">$100,000</div>
                                        <div class="comparison-cell value-positive">+$3-5M annually</div>
                                        <div class="comparison-cell">1-3 months</div>
                                        <div class="comparison-cell value-moderate">Moderate</div>
                                    </div>
                                    
                                    <div class="comparison-row">
                                        <div class="comparison-cell">International Marketing Campaign</div>
                                        <div class="comparison-cell">$350,000</div>
                                        <div class="comparison-cell value-positive">+$8-12M annually</div>
                                        <div class="comparison-cell">6-12 months</div>
                                        <div class="comparison-cell value-moderate">Moderate</div>
                                    </div>
                                    
                                    <div class="comparison-row">
                                        <div class="comparison-cell">Customs Process Streamlining</div>
                                        <div class="comparison-cell">$250,000</div>
                                        <div class="comparison-cell value-positive">+$4-7M annually</div>
                                        <div class="comparison-cell">3-9 months</div>
                                        <div class="comparison-cell value-complex">High</div>
                                    </div>
                                    
                                    <div class="comparison-row">
                                        <div class="comparison-cell">Infrastructure Upgrades</div>
                                        <div class="comparison-cell">$5-10M</div>
                                        <div class="comparison-cell value-positive">+$15-20M annually</div>
                                        <div class="comparison-cell">12-24 months</div>
                                        <div class="comparison-cell value-complex">High</div>
                                    </div>
                                    
                                    <div class="comparison-row">
                                        <div class="comparison-cell">Regional Transport Integration</div>
                                        <div class="comparison-cell">$2-3M</div>
                                        <div class="comparison-cell value-positive">+$10-15M annually</div>
                                        <div class="comparison-cell">12-18 months</div>
                                        <div class="comparison-cell value-moderate">Moderate</div>
                                    </div>
                                    
                                    <div class="comparison-row">
                                        <div class="comparison-cell">Special Economic Zone Creation</div>
                                        <div class="comparison-cell">$1-2M</div>
                                        <div class="comparison-cell value-positive">+$20-30M annually</div>
                                        <div class="comparison-cell">24-36 months</div>
                                        <div class="comparison-cell value-complex">Very High</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                    
                default:
                    documentTitle = 'Select a Document';
                    documentType = '';
                    documentIcon = '📄';
                    documentContent = `
                        <div class="document-viewer-placeholder">
                            <div class="placeholder-icon">📄</div>
                            <div class="placeholder-text">Select a document from the sidebar to view its contents.</div>
                        </div>
                    `;
            }
            
            // Update document header and content
            container.querySelector('.document-header-info h3').textContent = documentTitle;
            container.querySelector('.document-header-type').textContent = documentType;
            container.querySelector('.document-header-icon').textContent = documentIcon;
            container.querySelector('.document-content').innerHTML = documentContent;
        }
        
        function loadActivityTab(container) {
            // Check if there are any logged activities
            if (gameState.actionLog.length === 0) {
                container.innerHTML = `
                    <div class="no-insights-message">
                        <div class="message-icon">📝</div>
                        <p>Your activity log is empty. Actions you take will be recorded here.</p>
                    </div>
                `;
                return;
            }
            
            let activityHTML = `<div class="activity-log">`;
            
            // Add log entries in reverse chronological order
            gameState.actionLog.slice().reverse().forEach(log => {
                activityHTML += `
                    <div class="log-entry">
                        <div class="log-header">
                            <div class="log-title">${log.title}</div>
                            <div class="log-day">Day ${log.day}</div>
                        </div>
                        <div class="log-description">${log.description}</div>
                        <div class="log-outcome">${log.effects}</div>
                    </div>
                `;
            });
            
            activityHTML += `</div>`;
            container.innerHTML = activityHTML;
        }
        
        function loadInsightsTab(container) {
            container.innerHTML = `
                <div class="insight-categories">
                    <div class="insight-category active" data-category="all">All Insights</div>
                    <div class="insight-category" data-category="financial">Financial</div>
                    <div class="insight-category" data-category="environmental">Environmental</div>
                    <div class="insight-category" data-category="diplomatic">Diplomatic</div>
                    <div class="insight-category" data-category="governance">Governance</div>
                </div>
                
                <div class="insights-container">
                    <div class="insight-card enhanced">
                        <div class="insight-card-header">
                            <div class="insight-icon">💰</div>
                            <h4 class="insight-card-title">Debt Sustainability Challenges</h4>
                            <div class="insight-category-badge">Financial</div>
                        </div>
                        <div class="insight-card-content">
                            Developing countries often face unique challenges balancing infrastructure development with financial sustainability. The "debt trap" narrative oversimplifies complex dynamics where developing nations must navigate limited financial resources, immediate infrastructure needs, and long-term fiscal health.
                        </div>
                        <div class="insight-stakeholders">
                            <h5>Related Stakeholders</h5>
                            <div class="stakeholder-avatars">
                                <div class="small-avatar" style="background-color: #32a582">FM</div>
                                <div class="small-avatar" style="background-color: #e55a29">CDB</div>
                                <div class="small-avatar" style="background-color: #0a6860">WD</div>
                            </div>
                        </div>
                        <div class="related-concepts">
                            <h5>Key Concepts</h5>
                            <div class="concept-tags">
                                <div class="concept-tag">Debt Sustainability Analysis</div>
                                <div class="concept-tag">Fiscal Space</div>
                                <div class="concept-tag">Development Finance</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="insight-card enhanced">
                        <div class="insight-card-header">
                            <div class="insight-icon">🌊</div>
                            <h4 class="insight-card-title">Environmental-Economic Tradeoffs</h4>
                            <div class="insight-category-badge">Environmental</div>
                        </div>
                        <div class="insight-card-content">
                            Infrastructure development often creates tensions between economic growth and environmental protection. While port development brings economic benefits, environmental externalities affecting local ecosystems and communities must be addressed through robust safeguards and community engagement.
                        </div>
                        <div class="insight-stakeholders">
                            <h5>Related Stakeholders</h5>
                            <div class="stakeholder-avatars">
                                <div class="small-avatar" style="background-color: #fbb63c">EA</div>
                                <div class="small-avatar" style="background-color: #6e7a94">LC</div>
                                <div class="small-avatar" style="background-color: #37a6a0">PA</div>
                            </div>
                        </div>
                        <div class="related-concepts">
                            <h5>Key Concepts</h5>
                            <div class="concept-tags">
                                <div class="concept-tag">Environmental Impact Assessment</div>
                                <div class="concept-tag">Social License to Operate</div>
                                <div class="concept-tag">Sustainable Development</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="insight-card enhanced">
                        <div class="insight-card-header">
                            <div class="insight-icon">🌏</div>
                            <h4 class="insight-card-title">Geopolitics of Infrastructure</h4>
                            <div class="insight-category-badge">Diplomatic</div>
                        </div>
                        <div class="insight-card-content">
                            Large infrastructure projects are rarely just about infrastructure—they also involve geopolitical positioning. Different financing sources often come with different expectations, conditions, and strategic implications that recipient countries must carefully navigate.
                        </div>
                        <div class="insight-stakeholders">
                            <h5>Related Stakeholders</h5>
                            <div class="stakeholder-avatars">
                                <div class="small-avatar" style="background-color: #e55a29">CDB</div>
                                <div class="small-avatar" style="background-color: #0a6860">WD</div>
                            </div>
                        </div>
                        <div class="related-concepts">
                            <h5>Key Concepts</h5>
                            <div class="concept-tags">
                                <div class="concept-tag">Development Finance Architecture</div>
                                <div class="concept-tag">Bilateral vs. Multilateral Funding</div>
                                <div class="concept-tag">Strategic Competition</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="insight-card enhanced">
                        <div class="insight-card-header">
                            <div class="insight-icon">📊</div>
                            <h4 class="insight-card-title">Infrastructure Planning Challenges</h4>
                            <div class="insight-category-badge">Governance</div>
                        </div>
                        <div class="insight-card-content">
                            Infrastructure projects often face a gap between projections and reality. Optimism bias, inadequate planning, and changing market conditions contribute to underperformance. Effective governance requires realistic assessments, adaptive management, and stakeholder engagement.
                        </div>
                        <div class="insight-stakeholders">
                            <h5>Related Stakeholders</h5>
                            <div class="stakeholder-avatars">
                                <div class="small-avatar" style="background-color: #32a582">FM</div>
                                <div class="small-avatar" style="background-color: #37a6a0">PA</div>
                            </div>
                        </div>
                        <div class="related-concepts">
                            <h5>Key Concepts</h5>
                            <div class="concept-tags">
                                <div class="concept-tag">Project Governance</div>
                                <div class="concept-tag">Capacity Utilization</div>
                                <div class="concept-tag">Revenue Forecasting</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners to insight categories
            container.querySelectorAll('.insight-category').forEach(category => {
                category.addEventListener('click', function() {
                    // Update active category
                    container.querySelectorAll('.insight-category').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filter insights based on category
                    const selectedCategory = this.dataset.category;
                    filterInsights(selectedCategory, container);
                });
            });
        }
        
        function filterInsights(category, container) {
            const insights = container.querySelectorAll('.insight-card');
            
            if (category === 'all') {
                insights.forEach(insight => {
                    insight.style.display = 'flex';
                });
                return;
            }
            
            insights.forEach(insight => {
                const insightCategory = insight.querySelector('.insight-category-badge').textContent.toLowerCase();
                if (insightCategory === category) {
                    insight.style.display = 'flex';
                } else {
                    insight.style.display = 'none';
                }
            });
        }
        
        function loadUpdatesTab(container) {
            container.innerHTML = `
                <div class="updates-container">
                    <div class="update-item">
                        <div class="log-header">
                            <div class="log-title">Environmental Protests Intensify</div>
                            <div class="log-day">Day 3</div>
                        </div>
                        <div class="log-description">Local fishing communities have escalated their protests against the port, blocking access roads and disrupting operations. Environmental activists have joined the demonstrations, drawing international media attention.</div>
                        <div class="update-details">
                            <div class="update-detail-section">
                                <div class="impact-tags">
                                    <div class="impact-tag impact-negative">-5% Port Utilization</div>
                                    <div class="impact-tag impact-negative">-3% Political Capital</div>
                                    <div class="impact-tag impact-negative">-2% International Relations</div>
                                </div>
                                <p>The protests have reduced port efficiency and raised concerns among shipping companies. Your team advises addressing environmental concerns promptly to prevent further escalation.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="update-item">
                        <div class="log-header">
                            <div class="log-title">Chinese Development Bank Issues Warning</div>
                            <div class="log-day">Day 5</div>
                        </div>
                        <div class="log-description">The Chinese Development Bank has sent a formal letter expressing concern about the continued underperformance of the port facility and reminding Azuria of its financial obligations.</div>
                        <div class="update-details">
                            <div class="update-detail-section">
                                <div class="impact-tags">
                                    <div class="impact-tag impact-negative">-5% International Relations</div>
                                    <div class="impact-tag impact-negative">-3% Fiscal Sustainability</div>
                                </div>
                                <p>The letter indicates that failure to address fiscal concerns could trigger the loan's default provisions, potentially giving the Chinese Development Bank operational control of the port. Financial advisors recommend prioritizing debt restructuring negotiations.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="update-item">
                        <div class="log-header">
                            <div class="log-title">Western Donors Express Interest</div>
                            <div class="log-day">Day 7</div>
                        </div>
                        <div class="log-description">A consortium of Western donors has expressed preliminary interest in providing technical assistance and potentially refinancing part of the port's debt, contingent on governance and environmental reforms.</div>
                        <div class="update-details">
                            <div class="update-detail-section">
                                <div class="impact-tags">
                                    <div class="impact-tag impact-positive">+4% International Relations</div>
                                    <div class="impact-tag impact-neutral">No immediate financial impact</div>
                                </div>
                                <p>This interest represents a potential opportunity to diversify funding sources and improve the port's long-term sustainability. However, pursuing Western funding could complicate relations with Chinese stakeholders and would require significant reform commitments.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners to update items
            container.querySelectorAll('.update-item').forEach(item => {
                item.addEventListener('click', function() {
                    this.classList.toggle('expanded');
                });
            });
        }
        // ===== HELPER FUNCTIONS =====
        function handleActionCardClick(actionType) {
            let action;
            
            switch (actionType) {
                case 'financial-audit':
                    action = {
                        title: 'Financial Audit',
                        description: 'Commissioned a comprehensive financial audit of port operations.',
                        outcome: 'Identified inefficiencies and potential revenue streams that could improve fiscal sustainability.',
                        metrics: { fiscal: 8, international: 3 },
                        resources: { budget: -250000, influence: -2 },
                        time: 2
                    };
                    break;
                    
                case 'environmental-assessment':
                    action = {
                        title: 'Environmental Assessment',
                        description: 'Conducted a detailed environmental impact assessment.',
                        outcome: 'Documented environmental impacts and developed mitigation strategies, improving relations with environmental stakeholders.',
                        metrics: { environmental: 15, political: 5, international: 2 },
                        resources: { budget: -300000, influence: -3 },
                        time: 2
                    };
                    break;
                    
                case 'debt-renegotiation':
                    action = {
                        title: 'Debt Renegotiation',
                        description: 'Initiated debt restructuring negotiations with the Chinese Development Bank.',
                        outcome: 'Secured more favorable repayment terms, significantly improving fiscal sustainability.',
                        metrics: { fiscal: 18, international: -5 },
                        resources: { budget: 0, influence: -15 },
                        time: 3
                    };
                    break;
                    
                case 'western-funding':
                    action = {
                        title: 'Western Funding Appeal',
                        description: 'Approached Western donors for refinancing and technical assistance.',
                        outcome: 'Received preliminary commitments for technical support and potential refinancing options.',
                        metrics: { fiscal: 5, international: 10, environmental: 5 },
                        resources: { budget: 0, influence: -10 },
                        time: 2
                    };
                    break;
             case 'community-engagement':
                action = {
                    title: 'Community Engagement',
                    description: 'Established a community liaison office to address local concerns.',
                    outcome: 'Improved relations with local communities and reduced protest activities, enhancing port operations.',
                    metrics: { environmental: 12, political: 10 },
                    resources: { budget: -200000, influence: -5 },
                    time: 2
                };
                break;
                
            case 'marketing-initiative':
                action = {
                    title: 'Port Marketing Initiative',
                    description: 'Launched an international marketing campaign to attract more shipping traffic.',
                    outcome: 'Increased port utilization and revenue generation, improving fiscal sustainability.',
                    metrics: { fiscal: 15, international: 8 },
                    resources: { budget: -350000, influence: -3 },
                    time: 3
                };
                break;
                
            default:
                return;
        }
        
        // Check if resources are available
        if (gameState.resources.budget + (action.resources.budget || 0) < 0) {
            showNotification('Insufficient Budget', 'You do not have enough budget to perform this action.', 'error');
            return;
        }
        
        if (gameState.resources.influence + (action.resources.influence || 0) < 0) {
            showNotification('Insufficient Influence', 'You do not have enough political influence to perform this action.', 'error');
            return;
        }
        
        // Execute the action
        executeAction(action);
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
        // ===== STAFF RECRUITMENT =====
        function handleStaffRecruitment() {
            // Check if cooldown is active
            if (gameState.staffRecruitmentCooldown > 0) {
                showNotification('Recruitment in Progress', 'Your HR team is already processing recruitment. Please wait.', 'info');
                return;
            }
            
            // Check if staff maximum is reached
            if (gameState.resources.staff >= gameState.resources.staffMaximum) {
                showNotification('Maximum Staff Reached', 'You have reached the maximum team size.', 'info');
                return;
            }
            
            // Check if resources are available
            if (gameState.resources.budget < 500000) {
                showNotification('Insufficient Budget', 'You need $500,000 to recruit new staff.', 'error');
                return;
            }
            
            if (gameState.resources.influence < 5) {
                showNotification('Insufficient Influence', 'You need 5 points of political influence to recruit new staff.', 'error');
                return;
            }
            
            // Show loading overlay
            actionLoadingOverlay.style.display = 'flex';
            setTimeout(() => {
                actionLoadingOverlay.style.opacity = '1';
            }, 10);
            
            // Simulate processing time
            setTimeout(() => {
                // Apply recruitment effects
                gameState.resources.budget -= 500000;
                gameState.resources.influence -= 5;
                gameState.resources.staff += 1;
                gameState.resources.staffAvailable += 1;
                
                // Set cooldown
                gameState.staffRecruitmentCooldown = 3;
                
                // Hide loading overlay
                actionLoadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    actionLoadingOverlay.style.display = 'none';
                }, 300);
                
                // Show result notification
                showNotification('Staff Recruited', 'You have successfully added a new team member to your staff.', 'success');
                
                // Update UI
                updateResources();
                
                // Add cooldown indicator
                const cooldownIndicator = document.createElement('div');
                cooldownIndicator.className = 'recruitment-cooldown';
                cooldownIndicator.textContent = 'Recruitment cooldown: 3 days';
                document.querySelector('.recruitment-info').appendChild(cooldownIndicator);
                
                // Add to action log
                gameState.actionLog.push({
                    day: gameState.day,
                    title: 'Staff Recruitment',
                    description: 'Added new team member to increase operational capacity.',
                    effects: 'Team size increased, allowing for more simultaneous actions.'
                });
            }, 1500);
        }
        
        // ===== EVENT LISTENERS =====
        function setupEventListeners() {
            // Splash screen and onboarding
            playButton.addEventListener('click', showOnboardingCarousel);
            aboutButton.addEventListener('click', () => aboutModal.classList.add('active'));
            getStartedButton.addEventListener('click', startGame);
            
            // Carousel navigation
            carouselNext.addEventListener('click', goToNextSlide);
            carouselPrev.addEventListener('click', goToPrevSlide);
            carouselIndicators.forEach(indicator => {
                indicator.addEventListener('click', function() {
                    updateCarouselSlide(parseInt(this.dataset.slide));
                });
            });
            
            // About modal
            closeAboutModal.addEventListener('click', () => aboutModal.classList.remove('active'));
            closeAboutBtn.addEventListener('click', () => aboutModal.classList.remove('active'));
            
            // Guide modal
            closeGuideModal.addEventListener('click', () => guideModal.classList.remove('active'));
            closeGuideBtn.addEventListener('click', () => guideModal.classList.remove('active'));
            startTutorialBtn.addEventListener('click', startTutorial);
            
            // Menu and related modals
            menuBtn.addEventListener('click', () => menuModal.classList.add('active'));
            closeMenuModal.addEventListener('click', () => menuModal.classList.remove('active'));
            menuGuide.addEventListener('click', () => {
                menuModal.classList.remove('active');
                guideModal.classList.add('active');
            });
            menuReturnMain.addEventListener('click', returnToMainMenu);
            menuExit.addEventListener('click', returnToMainMenu);
            
            // Stakeholder modals
            closeStakeholderModal.addEventListener('click', () => stakeholderModal.classList.remove('active'));
            closeStakeholderBtn.addEventListener('click', () => stakeholderModal.classList.remove('active'));
            engageStakeholderBtn.addEventListener('click', showEngagementModal);
            closeEngagementModal.addEventListener('click', () => stakeholderEngagementModal.classList.remove('active'));
            cancelEngagementBtn.addEventListener('click', () => stakeholderEngagementModal.classList.remove('active'));
            
            // Game result modal
            returnToMenuBtn.addEventListener('click', returnToMainMenu);
            newGameBtn.addEventListener('click', resetAndStartNewGame);
            
            // Tab navigation
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    loadTabContent(this.dataset.tab);
                });
            });
            
            // Staff recruitment
            recruitStaffBtn.addEventListener('click', handleStaffRecruitment);
        }
        
        function startTutorial() {
            // Hide guide modal
            guideModal.classList.remove('active');
            
            // TODO: Implement tutorial sequence
            showNotification('Tutorial', 'Tutorial functionality will be implemented in a future update.', 'info');
        }
        
        function returnToMainMenu() {
            // Hide all game UI
            mainContainer.style.display = 'none';
            gameHeader.style.display = 'none';
            menuModal.classList.remove('active');
            gameResultModal.classList.remove('active');
            
            // Reset game state
            gameState = {
                mission: 'hidden-debt',
                day: 1,
                startTime: null,
                timeRemaining: 10,
                metrics: {
                    fiscal: 35,
                    environmental: 40,
                    political: 60,
                    international: 30,
                    overall: 0
                },
                resources: {
                    budget: 5000000,
                    influence: 60,
                    staff: 6,
                    staffAvailable: 6,
                    staffMaximum: 10
                },
                objectives: [
                    { id: 1, title: 'Establish a sustainable debt repayment plan', progress: 0 },
                    { id: 2, title: 'Mitigate environmental concerns without compromising fiscal stability', progress: 0 },
                    { id: 3, title: 'Maintain diplomatic relations with both Chinese and Western stakeholders', progress: 0 },
                    { id: 4, title: 'Keep political influence above the critical threshold', progress: 0 }
                ],
                stakeholders: [
                    { 
                        id: 1, 
                        name: 'Finance Minister', 
                        initials: 'FM',
                        relationship: 'neutral', 
                        influence: 'High',
                        bio: 'Responsible for the country\'s fiscal policy and debt management. Primarily concerned with maintaining fiscal stability and avoiding default.',
                        interests: ['Budget stability', 'International credibility', 'Economic growth'],
                        color: '#32a582'
                    },
                    { 
                        id: 2, 
                        name: 'Environmental Agency', 
                        initials: 'EA',
                        relationship: 'hostile', 
                        influence: 'Medium',
                        bio: 'Government agency responsible for environmental regulations and protection. Concerned about the port\'s impact on marine ecosystems and local fishing communities.',
                        interests: ['Environmental protection', 'Sustainable development', 'Community health'],
                        color: '#fbb63c'
                    },
                    { 
                        id: 3, 
                        name: 'Chinese Development Bank', 
                        initials: 'CDB',
                        relationship: 'neutral', 
                        influence: 'High',
                        bio: 'Primary lender for the port project. Interested in loan repayment and maintaining strategic influence in the region.',
                        interests: ['Debt repayment', 'Strategic influence', 'Project completion'],
                        color: '#e55a29'
                    },
                    { 
                        id: 4, 
                        name: 'Western Donors', 
                        initials: 'WD',
                        relationship: 'neutral', 
                        influence: 'Medium',
                        bio: 'Consortium of Western aid agencies and development banks. Concerned about debt sustainability and governance standards.',
                        interests: ['Debt sustainability', 'Good governance', 'Environmental standards'],
                        color: '#0a6860'
                    },
                    { 
                        id: 5, 
                        name: 'Local Communities', 
                        initials: 'LC',
                        relationship: 'hostile', 
                        influence: 'Low',
                        bio: 'Fishing communities and residents affected by the port project. Concerned about environmental impacts and lack of economic benefits.',
                        interests: ['Livelihoods protection', 'Environmental health', 'Economic inclusion'],
                        color: '#6e7a94'
                    },
                    { 
                        id: 6, 
                        name: 'Port Authority', 
                        initials: 'PA',
                        relationship: 'friendly', 
                        influence: 'Medium',
                        bio: 'Manages the port operations. Focused on increasing capacity utilization and revenue generation.',
                        interests: ['Operational efficiency', 'Revenue growth', 'Infrastructure development'],
                        color: '#37a6a0'
                    }
                ],
                actionLog: [],
                notifications: [],
                documents: [],
                insights: [],
                gameEnded: false,
                tutorialCompleted: false,
                staffRecruitmentCooldown: 0
            };
            
            // Reset progress indicators
            document.querySelectorAll('.progress').forEach(progress => {
                progress.style.height = '0%';
            });
            
            overallProgressFill.style.width = '0%';
            overallProgressLabel.textContent = '0%';
            
            // Show splash screen
            splashScreen.classList.remove('hidden');
            
            // Return to play button state (no onboarding visible)
            const splashContent = document.querySelector('.splash-content');
            splashContent.style.opacity = '1';
            onboardingCarousel.style.display = 'none';
        }
        
        function resetAndStartNewGame() {
            // Hide game result modal
            gameResultModal.classList.remove('active');
            
            // Reset game state
            gameState = {
                mission: 'hidden-debt',
                day: 1,
                startTime: new Date(),
                timeRemaining: 10,
                metrics: {
                    fiscal: 35,
                    environmental: 40,
                    political: 60,
                    international: 30,
                    overall: 0
                },
                resources: {
                    budget: 5000000,
                    influence: 60,
                    staff: 6,
                    staffAvailable: 6,
                    staffMaximum: 10
                },
                objectives: [
                    { id: 1, title: 'Establish a sustainable debt repayment plan', progress: 0 },
                    { id: 2, title: 'Mitigate environmental concerns without compromising fiscal stability', progress: 0 },
                    { id: 3, title: 'Maintain diplomatic relations with both Chinese and Western stakeholders', progress: 0 },
                    { id: 4, title: 'Keep political influence above the critical threshold', progress: 0 }
                ],
                stakeholders: [
                    { 
                        id: 1, 
                        name: 'Finance Minister', 
                        initials: 'FM',
                        relationship: 'neutral', 
                        influence: 'High',
                        bio: 'Responsible for the country\'s fiscal policy and debt management. Primarily concerned with maintaining fiscal stability and avoiding default.',
                        interests: ['Budget stability', 'International credibility', 'Economic growth'],
                        color: '#32a582'
                    },
                    { 
                        id: 2, 
                        name: 'Environmental Agency', 
                        initials: 'EA',
                        relationship: 'hostile', 
                        influence: 'Medium',
                        bio: 'Government agency responsible for environmental regulations and protection. Concerned about the port\'s impact on marine ecosystems and local fishing communities.',
                        interests: ['Environmental protection', 'Sustainable development', 'Community health'],
                        color: '#fbb63c'
                    },
                    { 
                        id: 3, 
                        name: 'Chinese Development Bank', 
                        initials: 'CDB',
                        relationship: 'neutral', 
                        influence: 'High',
                        bio: 'Primary lender for the port project. Interested in loan repayment and maintaining strategic influence in the region.',
                        interests: ['Debt repayment', 'Strategic influence', 'Project completion'],
                        color: '#e55a29'
                    },
                    { 
                        id: 4, 
                        name: 'Western Donors', 
                        initials: 'WD',
                        relationship: 'neutral', 
                        influence: 'Medium',
                        bio: 'Consortium of Western aid agencies and development banks. Concerned about debt sustainability and governance standards.',
                        interests: ['Debt sustainability', 'Good governance', 'Environmental standards'],
                        color: '#0a6860'
                    },
                    { 
                        id: 5, 
                        name: 'Local Communities', 
                        initials: 'LC',
                        relationship: 'hostile', 
                        influence: 'Low',
                        bio: 'Fishing communities and residents affected by the port project. Concerned about environmental impacts and lack of economic benefits.',
                        interests: ['Livelihoods protection', 'Environmental health', 'Economic inclusion'],
                        color: '#6e7a94'
                    },
                    { 
                        id: 6, 
                        name: 'Port Authority', 
                        initials: 'PA',
                        relationship: 'friendly', 
                        influence: 'Medium',
                        bio: 'Manages the port operations. Focused on increasing capacity utilization and revenue generation.',
                        interests: ['Operational efficiency', 'Revenue growth', 'Infrastructure development'],
                        color: '#37a6a0'
                    }
                ],
                actionLog: [],
                notifications: [],
                documents: [],
                insights: [],
                gameEnded: false,
                tutorialCompleted: false,
                staffRecruitmentCooldown: 0
            };
            
            // Reset UI
            updateAllUI();
            
            // Reset progress indicators
            document.querySelectorAll('.progress').forEach(progress => {
                progress.style.height = '0%';
            });
            
            overallProgressFill.style.width = '0%';
            overallProgressLabel.textContent = '0%';
            
            // Initialize tab content
            const activeTab = document.querySelector('.tab.active');
            if (activeTab) {
                loadTabContent(activeTab.dataset.tab);
            }
            
            updateTimerDisplay();
        }
   /**
     * Action Management Module
     * Handles game actions, their execution, and associated consequences
     */
   const actionManager = {
    /**
     * Validates if an action can be executed
     * @param {Object} action - The action to be validated
     * @returns {Object} Validation result with success status and messages
     */
    validateAction: function(action) {
        const validationResults = {
            canExecute: true,
            messages: []
        };

        // Check budget requirements
        if (gameState.resources.budget < action.cost) {
            validationResults.canExecute = false;
            validationResults.messages.push('Insufficient budget');
        }

        // Check staff requirements
        if (gameState.resources.staff < action.staffCost) {
            validationResults.canExecute = false;
            validationResults.messages.push('Insufficient staff');
        }

        // Check time constraints
        if (gameState.currentDay + action.timeCost > gameState.totalDays) {
            validationResults.canExecute = false;
            validationResults.messages.push('Insufficient time remaining');
        }

        return validationResults;
    },

    /**
     * Executes a selected game action
     * @param {Object} action - The action to be executed
     */
    executeAction: function(action) {
        const validation = this.validateAction(action);

        if (!validation.canExecute) {
            uiManager.showNotification({
                type: 'error',
                title: 'Action Cannot Be Executed',
                message: validation.messages.join(', ')
            });
            return;
        }

        // Deduct resources
        gameState.resources.budget -= action.cost;
        gameState.resources.staff -= action.staffCost;
        gameState.currentDay += action.timeCost;

        // Apply action impacts
        this.applyActionImpacts(action);

        // Update action history
        this.recordActionHistory(action);

        // Trigger UI updates
        uiManager.updateResourceDisplay();
        uiManager.updateMetricsDisplay();
        uiManager.updateActivityLog(action);

        // Show action confirmation
        uiManager.showActionConfirmationModal(action);

        // Log action execution
        utils.debugLog(`Action executed: ${action.title}`);
    },

    /**
     * Applies the impacts of an executed action
     * @param {Object} action - The action whose impacts are to be applied
     */
    applyActionImpacts: function(action) {
        // Update metrics
        Object.keys(action.impacts || {}).forEach(metric => {
            gameState.metrics[metric] += action.impacts[metric];
            
            // Ensure metrics stay within 0-100 range
            gameState.metrics[metric] = Math.max(0, Math.min(gameState.metrics[metric], 100));
        });

        // Update stakeholder relationships
        if (action.stakeholderImpacts) {
            action.stakeholderImpacts.forEach(impact => {
                const stakeholder = gameState.stakeholders.find(s => s.id === impact.id);
                if (stakeholder) {
                    // Logic to update stakeholder relationship based on action
                    this.updateStakeholderRelationship(stakeholder, impact.relationship);
                }
            });
        }

        // Update objective progress
        if (action.objectiveProgress) {
            action.objectiveProgress.forEach(progress => {
                const objective = gameState.completedObjectives.find(o => o.id === progress.id);
                if (objective) {
                    objective.currentProgress = Math.min(
                        (objective.currentProgress || 0) + progress.progress, 
                        100
                    );
                }
            });
        }

        // Unlock educational insights
        if (action.unlocksInsight) {
            this.unlockEducationalInsight(action.unlocksInsight);
        }
    },

    /**
     * Updates stakeholder relationship status
     * @param {Object} stakeholder - The stakeholder being updated
     * @param {string} newRelationship - The new relationship status
     */
    updateStakeholderRelationship: function(stakeholder, newRelationship) {
        const relationshipPriority = {
            'hostile': 0,
            'neutral': 1,
            'friendly': 2
        };

        if (relationshipPriority[newRelationship] > relationshipPriority[stakeholder.relationship]) {
            stakeholder.relationship = newRelationship;
        }
    },

    /**
     * Records the history of executed actions
     * @param {Object} action - The action to be recorded
     */
    recordActionHistory: function(action) {
        gameState.actionsHistory.push({
            id: utils.generateUniqueId(),
            title: action.title,
            day: gameState.currentDay,
            impacts: action.impacts
        });
    },

    /**
     * Unlocks an educational insight from an action
     * @param {Object} insight - The insight to be unlocked
     */
    unlockEducationalInsight: function(insight) {
        if (!gameState.unlockedInsights.some(i => i.id === insight.id)) {
            gameState.unlockedInsights.push(insight);
            uiManager.showEducationalInsightModal(insight);
        }
    }
};
/**
     * Stakeholder Engagement Module
     * Manages complex interactions with different stakeholders in the game
     */
const stakeholderManager = {
    /**
     * Initiates a stakeholder engagement interaction
     * @param {number} stakeholderId - ID of the stakeholder to engage
     * @param {Object} engagementOption - Selected engagement strategy
     */
    initiateEngagement: function(stakeholderId, engagementOption) {
        // Find the target stakeholder
        const targetStakeholder = gameState.stakeholders.find(
            stakeholder => stakeholder.id === stakeholderId
        );

        if (!targetStakeholder) {
            utils.debugLog(`Stakeholder with ID ${stakeholderId} not found`, 'error');
            return;
        }

        // Validate engagement option's resource requirements
        if (!this.validateEngagementResources(engagementOption)) {
            uiManager.showNotification({
                type: 'error',
                title: 'Engagement Failed',
                message: 'Insufficient resources for this engagement strategy'
            });
            return;
        }

        // Deduct resources
        this.deductEngagementResources(engagementOption);

        // Process engagement outcomes
        const engagementResult = this.processEngagementOutcomes(
            targetStakeholder, 
            engagementOption
        );

        // Record engagement in game history
        this.recordEngagementHistory(
            targetStakeholder, 
            engagementOption, 
            engagementResult
        );

        // Update UI and game state
        uiManager.updateStakeholderDisplay(targetStakeholder);
        uiManager.showStakeholderEngagementModal(engagementResult);
    },

    /**
     * Validates if player has sufficient resources for an engagement
     * @param {Object} engagementOption - Engagement strategy to validate
     * @returns {boolean} Whether engagement can be initiated
     */
    validateEngagementResources: function(engagementOption) {
        return (
            (engagementOption.cost === 0 || gameState.resources.budget >= engagementOption.cost) &&
            (engagementOption.influenceCost === 0 || gameState.resources.influence >= engagementOption.influenceCost)
        );
    },

    /**
     * Deducts resources required for stakeholder engagement
     * @param {Object} engagementOption - Engagement strategy
     */
    deductEngagementResources: function(engagementOption) {
        gameState.resources.budget -= (engagementOption.cost || 0);
        gameState.resources.influence -= (engagementOption.influenceCost || 0);
    },

    /**
     * Processes the outcomes of a stakeholder engagement
     * @param {Object} stakeholder - Target stakeholder
     * @param {Object} engagementOption - Chosen engagement strategy
     * @returns {Object} Engagement result details
     */
    processEngagementOutcomes: function(stakeholder, engagementOption) {
        // Determine relationship impact
        const relationshipOutcome = engagementOption.impacts.relationship;
        
        // Update stakeholder relationship
        this.updateStakeholderRelationship(stakeholder, relationshipOutcome);

        // Apply metric changes
        Object.entries(engagementOption.impacts.metrics || {}).forEach(([metric, value]) => {
            gameState.metrics[metric] = Math.max(
                0, 
                Math.min(gameState.metrics[metric] + value, 100)
            );
        });

        return {
            stakeholder: stakeholder.name,
            engagementStrategy: engagementOption.title,
            outcome: engagementOption.outcome,
            relationshipChange: relationshipOutcome,
            metricsImpact: engagementOption.impacts.metrics
        };
    },

    /**
     * Updates stakeholder relationship status
     * @param {Object} stakeholder - Stakeholder to update
     * @param {string} newRelationship - New relationship status
     */
    updateStakeholderRelationship: function(stakeholder, newRelationship) {
        const relationshipPriority = {
            'hostile': 0,
            'neutral': 1,
            'friendly': 2
        };

        if (relationshipPriority[newRelationship] > relationshipPriority[stakeholder.relationship]) {
            stakeholder.relationship = newRelationship;
        }
    },

    /**
     * Records stakeholder engagement in game history
     * @param {Object} stakeholder - Engaged stakeholder
     * @param {Object} engagementOption - Engagement strategy used
     * @param {Object} result - Engagement result
     */
    recordEngagementHistory: function(stakeholder, engagementOption, result) {
        gameState.stakeholderEngagements.push({
            id: utils.generateUniqueId(),
            stakeholderId: stakeholder.id,
            stakeholderName: stakeholder.name,
            strategy: engagementOption.title,
            day: gameState.currentDay,
            result: result
        });
    },

    /**
     * Retrieves available engagement options for a specific stakeholder
     * @param {number} stakeholderId - ID of the stakeholder
     * @returns {Array} Available engagement strategies
     */
    getEngagementOptions: function(stakeholderId) {
        return gameState.stakeholderEngagementOptions[stakeholderId] || [];
    }
};
/**
     * User Interface Management Module
     * Responsible for all UI interactions, updates, and dynamic rendering
     */
const uiManager = {
    /**
     * Initializes the primary game interface
     * Sets up event listeners and prepares UI components
     */
    initializeGameInterface: function() {
        // Cache DOM elements for performance
        this.cacheElements();
        
        // Setup primary event listeners
        this.setupPrimaryEventListeners();
        
        // Initialize UI components
        this.initializeSplashScreen();
        this.initializeOnboardingCarousel();
        this.initializeMainGamePanels();
        
        utils.debugLog('Game interface initialized');
    },

    /**
     * Caches frequently accessed DOM elements
     * Reduces repeated DOM queries for performance optimization
     */
    cacheElements: function() {
        this.elements = {
            splashScreen: document.getElementById('splashScreen'),
            loadingScreen: document.getElementById('loadingScreen'),
            onboardingCarousel: document.getElementById('onboardingCarousel'),
            mainContainer: document.getElementById('mainContainer'),
            gameHeader: document.getElementById('gameHeader'),
            missionTimer: document.getElementById('missionTimer'),
            resourcesList: document.getElementById('resourcesList'),
            metricsContainer: document.getElementById('metricsContainer'),
            objectivesList: document.getElementById('objectivesList'),
            overallProgressFill: document.getElementById('overallProgressFill'),
            overallProgressLabel: document.getElementById('overallProgressLabel')
        };
    },

    /**
     * Sets up primary event listeners for game interaction
     */
    setupPrimaryEventListeners: function() {
        const playButton = document.getElementById('playButton');
        const skipCarouselButton = document.getElementById('skipCarousel');
        const continueButton = document.getElementById('continueButton');
        const menuButton = document.getElementById('menuBtn');

        playButton.addEventListener('click', this.startGame.bind(this));
        skipCarouselButton.addEventListener('click', this.skipOnboarding.bind(this));
        continueButton.addEventListener('click', this.proceedFromOnboarding.bind(this));
        menuButton.addEventListener('click', this.openGameMenu.bind(this));
    },

    /**
     * Initializes the splash screen and its animations
     */
    initializeSplashScreen: function() {
        this.createNetworkVisualization();
        this.animateSplashElements();
    },

    hideSplashScreen: function() {
        const splashScreen = document.getElementById('splashScreen');
        
        // Add a class to trigger transition/hiding animation
        splashScreen.classList.add('hidden');
        
        // Optional: Remove from DOM after transition
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 800); // Match this with CSS transition duration
    
        utils.debugLog('Splash screen hidden');
    },

    showOnboardingCarousel: function() {
        const onboardingCarousel = document.getElementById('onboardingCarousel');
        onboardingCarousel.style.display = 'block';
        
        // Optional: Add animation or transition
        setTimeout(() => {
            onboardingCarousel.classList.add('active');
        }, 50);
    },

    hideOnboardingCarousel: function() {
        const onboardingCarousel = document.getElementById('onboardingCarousel');
        onboardingCarousel.classList.remove('active');
        
        // Hide after transition
        setTimeout(() => {
            onboardingCarousel.style.display = 'none';
        }, 500); // Match this with CSS transition duration
    },

    initializeMainGamePanels: function() {
        // Setup main game panel layout and initial state
        const mainContainer = document.getElementById('mainContainer');
        const panelsToInitialize = document.querySelectorAll('.panel');
        
        panelsToInitialize.forEach(panel => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        });
    
        // Additional panel initialization logic can be added here
        utils.debugLog('Main game panels initialized');
    },   


    /**
     * Creates an animated network visualization for the splash screen
     */
    createNetworkVisualization: function() {
        const splashConnections = document.getElementById('splashConnections');
        const nodeCount = 12;
        const connectionCount = 8;

        // Generate network nodes
        for (let i = 0; i < nodeCount; i++) {
            const node = document.createElement('div');
            node.classList.add('node');
            node.style.left = `${Math.random() * 100}%`;
            node.style.top = `${Math.random() * 100}%`;
            splashConnections.appendChild(node);
        }

        // Create network connections
        for (let i = 0; i < connectionCount; i++) {
            const line = document.createElement('div');
            line.classList.add('connection-line');
            line.style.transform = `rotate(${Math.random() * 360}deg)`;
            line.style.width = `${Math.random() * 200}px`;
            splashConnections.appendChild(line);
        }
    },

    /**
     * Animates splash screen elements for visual engagement
     */
    animateSplashElements: function() {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((element, index) => {
            element.style.animationDelay = `${0.2 * (index + 1)}s`;
        });
    },

    /**
     * Initializes the onboarding carousel
     */
    initializeOnboardingCarousel: function() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevButton = document.getElementById('carouselPrev');
        const nextButton = document.getElementById('carouselNext');

        let currentSlide = 0;

        function updateSlide() {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
            });
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }

        prevButton.addEventListener('click', () => {
            currentSlide = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
            updateSlide();
        });

        nextButton.addEventListener('click', () => {
            currentSlide = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
            updateSlide();
        });
    },

    /**
     * Starts the primary game sequence
     */
    startGame: function() {
        this.hideSplashScreen();
        this.showOnboardingCarousel();
    },

    /**
     * Skips the onboarding carousel
     */
    skipOnboarding: function() {
        this.hideOnboardingCarousel();
        this.initializeMainGameInterface();
    },

    /**
     * Proceeds from onboarding to main game interface
     */
    proceedFromOnboarding: function() {
        this.hideOnboardingCarousel();
        this.initializeMainGameInterface();
    },

    /**
     * Initializes the main game interface
     */
    initializeMainGameInterface: function() {
        this.elements.mainContainer.style.display = 'grid';
        this.elements.gameHeader.style.display = 'flex';
        missionManager.advanceDay();
    },

    /**
     * Opens the game menu
     */
    openGameMenu: function() {
        const menuModal = document.getElementById('menuModal');
        menuModal.classList.add('active');
    }
};
/**
     * Document Management Module
     * Handles document interactions, rendering, and analysis
     */
const documentManager = {
    /**
     * Initializes the document viewer and related interactions
     */
    initializeDocumentSystem: function() {
        this.setupDocumentListeners();
        this.renderDocumentList();
    },

    /**
     * Sets up event listeners for document interactions
     */
    setupDocumentListeners: function() {
        const documentsList = document.getElementById('documentsList');
        const documentModal = document.getElementById('documentViewerModal');
        const closeDocumentModalBtn = document.getElementById('closeDocumentModalBtn');
        const analyzeDocumentBtn = document.getElementById('analyzeDocumentBtn');

        documentsList.addEventListener('click', this.handleDocumentSelection.bind(this));
        closeDocumentModalBtn.addEventListener('click', this.closeDocumentModal.bind(this));
        analyzeDocumentBtn.addEventListener('click', this.analyzeSelectedDocument.bind(this));
    },

    /**
     * Renders the list of available documents
     */
    renderDocumentList: function() {
        const documentsList = document.getElementById('documentsList');
        documentsList.innerHTML = '';

        gameState.documents.forEach(document => {
            const documentItem = this.createDocumentListItem(document);
            documentsList.appendChild(documentItem);
        });
    },

    /**
     * Creates a document list item element
     * @param {Object} document - Document data
     * @returns {HTMLElement} Document list item
     */
    createDocumentListItem: function(document) {
        const documentItem = document.createElement('div');
        documentItem.classList.add('document-item');
        documentItem.dataset.documentId = document.id;

        documentItem.innerHTML = `
            <div class="document-icon">${document.icon}</div>
            <div class="document-info">
                <div class="document-title">${document.title}</div>
                <div class="document-type">${document.type}</div>
            </div>
        `;

        return documentItem;
    },

    /**
     * Handles document selection from the list
     * @param {Event} event - Click event
     */
    handleDocumentSelection: function(event) {
        const documentItem = event.target.closest('.document-item');
        if (!documentItem) return;

        const documentId = parseInt(documentItem.dataset.documentId);
        this.displayDocumentDetails(documentId);
    },

    /**
     * Displays selected document details in the modal
     * @param {number} documentId - ID of the selected document
     */
    displayDocumentDetails: function(documentId) {
        const document = gameState.documents.find(doc => doc.id === documentId);
        if (!document) return;

        const documentModal = document.getElementById('documentViewerModal');
        const documentModalTitle = document.getElementById('documentModalTitle');
        const documentModalBody = document.getElementById('documentModalBody');

        documentModalTitle.textContent = document.title;
        documentModalBody.innerHTML = this.formatDocumentContent(document);

        documentModal.classList.add('active');
    },

    /**
     * Formats document content for display
     * @param {Object} document - Document to format
     * @returns {string} HTML-formatted document content
     */
    formatDocumentContent: function(document) {
        // Specialized formatting based on document type
        switch(document.type) {
            case 'financial':
                return this.formatFinancialDocument(document);
            case 'legal':
                return this.formatLegalDocument(document);
            case 'report':
                return this.formatReportDocument(document);
            case 'testimonial':
                return this.formatTestimonialDocument(document);
            default:
                return `<pre>${document.content}</pre>`;
        }
    },

    /**
     * Formats financial documents with enhanced visualization
     * @param {Object} document - Financial document
     * @returns {string} Formatted HTML
     */
    formatFinancialDocument: function(document) {
        return `
            <div class="document-header">
                <div class="document-header-icon">💰</div>
                <div class="document-header-info">
                    <h3>${document.title}</h3>
                    <div class="document-header-type">Financial Overview</div>
                </div>
            </div>
            <div class="document-content financial-document">
                <pre>${document.content}</pre>
            </div>
        `;
    },

    /**
     * Closes the document viewer modal
     */
    closeDocumentModal: function() {
        const documentModal = document.getElementById('documentViewerModal');
        documentModal.classList.remove('active');
    },

    /**
     * Analyzes the currently selected document
     */
    analyzeSelectedDocument: function() {
        const documentId = parseInt(document.querySelector('.document-item.active').dataset.documentId);
        const document = gameState.documents.find(doc => doc.id === documentId);

        if (!document) return;

        const analysisResult = this.performDocumentAnalysis(document);
        this.displayDocumentAnalysis(analysisResult);
    },

    /**
     * Performs detailed analysis of a document
     * @param {Object} document - Document to analyze
     * @returns {Object} Analysis results
     */
    performDocumentAnalysis: function(document) {
        // Placeholder for document analysis logic
        // Would implement specific analysis based on document type
        return {
            documentId: document.id,
            title: document.title,
            insights: [],
            recommendations: []
        };
    },

    /**
     * Displays document analysis results
     * @param {Object} analysisResult - Analysis results to display
     */
    displayDocumentAnalysis: function(analysisResult) {
        uiManager.showEducationalInsightModal({
            title: `Analysis: ${analysisResult.title}`,
            content: "Document analysis insights would be displayed here."
        });
    }
};

/**
 * Primary Game Initialization
 * Bootstraps the entire game system
 */
function initializeGame() {
    // Ensure strict mode
    'use strict';

    // Check browser compatibility
    if (!window.localStorage) {
        alert('Your browser does not support local storage. Some features may be limited.');
    }

    // Debug mode check
    if (DEBUG_MODE) {
        console.log('Initializing Debt & Diplomacy Game');
    }

    // Initialize core game systems
    gameInitializer.init();
    uiManager.initializeGameInterface();
    documentManager.initializeDocumentSystem();
    actionManager.initializeActionSystem();
    stakeholderManager.initializeStakeholderInteractions();
    audioManager.initializeAudioPlayer();

    // Setup game event listeners
    setupGlobalEventListeners();

    // Trigger initial game state setup
    missionManager.setupInitialMissionState();
}

/**
 * Sets up global event listeners
 */
function setupGlobalEventListeners() {
    // Prevent accidental page navigation
    window.addEventListener('beforeunload', (event) => {
        if (gameState.initialized && !gameState.missionCompleted) {
            event.preventDefault();
            event.returnValue = 'Are you sure you want to leave the game?';
        }
    });

    // Handle application focus and pause
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState.initialized) {
            audioManager.audioElement.pause();
            // Potential pause game logic
        }
    });
}

// Game entry point
document.addEventListener('DOMContentLoaded', initializeGame);

// Expose key modules for potential external interaction
window.GameModules = {
    gameState,
    actionManager,
    stakeholderManager,
    missionManager,
    uiManager
};
})(); // End of IIFE (Immediately Invoked Function Expression) 

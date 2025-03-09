/**
 * Debt & Diplomacy: The Global Development Finance Game
 * Main JavaScript file for game functionality
 * Version 1.2
 */

// Wrap everything in an IIFE to avoid global scope pollution
(function() {
    'use strict';

    // ===== GAME STATE =====
    /**
     * Central game state object that holds all game data
     * @type {Object}
     */
    const gameState = {
        // Game flow state
        initialized: false,
        tutorialCompleted: false,
        
        // Current mission and progress data
        currentMission: 1,
        currentDay: 1,
        totalDays: 10,
        
        // Player resources
        resources: {
            budget: 15000000,
            influence: 60,
            staff: 6,
            timeRemaining: 10
        },
        
        // Performance metrics
        metrics: {
            fiscal: 35,
            environmental: 40,
            political: 60,
            international: 30
        },
        
        // Game progress trackers
        completedObjectives: [],
        decisions: [],
        actionsHistory: [],
        updates: [],
        documentHistory: [],
        
        // Key thresholds for game-over conditions
        thresholds: {
            influence: 10,
            budget: 0,
            staff: 0,
            fiscal: 20,
            environmental: 20,
            political: 20,
            international: 20
        },
        
        // Educational insights unlocked by player
        unlockedInsights: [],
        
        // Stakeholder engagement history
        stakeholderEngagements: [],
        
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

// ===== GAME CONTROLLER =====
    /**
     * Core game controller that manages the game state and connections
     * between components
     */
    const GameController = {
        /**
         * Initialize the game
         */
        init: function() {
            try {
                console.log("Initializing Debt & Diplomacy game...");
                this.bindEvents();
                SplashScreen.init();
                NotificationSystem.init();
                
                // Initialize network visualization with a slight delay
                setTimeout(() => {
                    NetworkVisualizer.initSplashConnections();
                }, 500);
                
                // Initialize educational content
                this.prepareEducationalContent();
                
                // Mark game as initialized
                gameState.initialized = true;
                
                console.log("Game initialization complete");
            } catch (error) {
                console.error("Error during game initialization:", error);
                NotificationSystem.showNotification({
                    type: 'error',
                    title: 'Initialization Error',
                    message: 'There was a problem starting the game. Please refresh the page.'
                });
            }
        },
        
        /**
         * Prepare educational content for the game
         */
        prepareEducationalContent: function() {
            // Add educational insights to stakeholders
            gameState.stakeholders.forEach(stakeholder => {
                if (!stakeholder.educationalValue) {
                    stakeholder.educationalValue = `Understanding the role of ${stakeholder.name} illustrates how different stakeholders influence development finance decisions.`;
                }
            });
            
            // Add educational briefing document if not already present
            if (!gameState.documents.find(doc => doc.id === 7)) {
                gameState.documents.push({
                    id: 7,
                    title: "Development Finance Educational Briefing",
                    type: "educational",
                    icon: "🎓",
                    educationalValue: "Provides core theoretical background on development finance concepts relevant to the game.",
                    content: "DEVELOPMENT FINANCE EDUCATIONAL BRIEFING\n\nKEY CONCEPTS IN DEVELOPMENT FINANCE\n\nDebt Sustainability:\nThe ability of a country to meet its debt obligations without compromising economic growth or requiring exceptional financial assistance. Key indicators include debt-to-GDP ratio, debt service-to-revenue ratio, and debt service coverage ratio (DSCR). Projects are considered financially sustainable when they generate sufficient revenue to cover operational costs and debt service with an appropriate margin of safety.\n\nCollateralized Lending:\nLoan agreements secured by specific assets or resources that may be claimed by the lender in case of default. While common in commercial finance, collateralized lending involving strategic national infrastructure can create sovereign risks, particularly when critical assets like ports, energy facilities, or transportation hubs are involved. The rise of 'asset-based lending' in development finance has raised concerns about potential loss of control over strategic assets.\n\nBlended Finance:\nThe strategic use of development finance to mobilize additional funding for sustainable development. Typically involves combining concessional public funds with commercial finance to improve risk-return profiles and make projects more attractive to private investors. Can leverage limited public resources to attract larger private capital flows towards development objectives.\n\nConditionality:\nRequirements attached to loans or grants that borrowers must fulfill. These may include policy reforms, governance standards, environmental requirements, or specific project implementation approaches. While intended to improve development outcomes, excessive or inappropriate conditionality can become controversial and politically challenging for recipient governments.\n\nExternalities:\nSpillovers from economic activities that affect parties not directly involved in the transactions. Infrastructure projects often create both positive externalities (improved transportation, economic growth) and negative externalities (environmental degradation, displacement). Effective project design requires identifying and addressing potential negative externalities early in the planning process.\n\nStakeholder Management:\nThe process of identifying, analyzing, engaging with, and addressing the concerns of various parties interested in or affected by a project. Effective stakeholder management is crucial for development finance projects, as it can prevent operational delays, reputational damage, and political complications. Key stakeholders typically include government entities, financiers, local communities, civil society organizations, and the private sector."
                });
                
                documentDescriptions[7] = "Educational briefing on key concepts in development finance, including debt sustainability, collateralized lending, blended finance, conditionality, externalities, and stakeholder management.";
            }
        },
        
        /**
         * Bind all global event listeners
         */
        bindEvents: function() {
            try {
                // Splash screen events
                document.getElementById('playButton').addEventListener('click', SplashScreen.startGame);
                document.getElementById('aboutButton').addEventListener('click', () => ModalManager.openModal('aboutModal'));
                document.getElementById('closeAboutModal').addEventListener('click', () => ModalManager.closeModal('aboutModal'));
                document.getElementById('closeAboutBtn').addEventListener('click', () => ModalManager.closeModal('aboutModal'));
                
                document.getElementById('carouselNext').addEventListener('click', SplashScreen.nextSlide);
                document.getElementById('carouselPrev').addEventListener('click', SplashScreen.prevSlide);
                document.getElementById('skipCarousel').addEventListener('click', SplashScreen.skipCarousel);
                document.getElementById('continueButton').addEventListener('click', MissionSelector.selectMission);
                
                document.querySelectorAll('.indicator').forEach(indicator => {
                    indicator.addEventListener('click', function() {
                        SplashScreen.goToSlide(parseInt(this.getAttribute('data-slide')));
                    });
                });
                
                // Mission selection events
                document.querySelectorAll('.mission-item:not(.disabled)').forEach(item => {
                    item.addEventListener('click', function() {
                        MissionSelector.selectMission(parseInt(this.getAttribute('data-mission')));
                    });
                });
                document.getElementById('startMissionBtn').addEventListener('click', MissionSelector.startMission);
                document.getElementById('showGuideBtn').addEventListener('click', () => ModalManager.openModal('guideModal'));
                
                // Modal events
                document.getElementById('closeGuideModal').addEventListener('click', () => ModalManager.closeModal('guideModal'));
                document.getElementById('closeGuideBtn').addEventListener('click', () => ModalManager.closeModal('guideModal'));
                document.getElementById('startTutorialBtn').addEventListener('click', GameController.startTutorial);
                document.getElementById('closeMenuModal').addEventListener('click', () => ModalManager.closeModal('menuModal'));
                document.getElementById('closeStakeholderModal').addEventListener('click', () => ModalManager.closeModal('stakeholderModal'));
                document.getElementById('closeStakeholderBtn').addEventListener('click', () => ModalManager.closeModal('stakeholderModal'));
                document.getElementById('closeEngagementModal').addEventListener('click', () => ModalManager.closeModal('stakeholderEngagementModal'));
                document.getElementById('cancelEngagementBtn').addEventListener('click', () => ModalManager.closeModal('stakeholderEngagementModal'));
                
                // Game UI events
                document.getElementById('menuBtn').addEventListener('click', () => ModalManager.openModal('menuModal'));
                document.getElementById('menuGuide').addEventListener('click', () => {
                    ModalManager.closeModal('menuModal');
                    ModalManager.openModal('guideModal');
                });
                
                document.getElementById('menuReturnMain').addEventListener('click', () => {
                    if (confirm('Return to main menu? Your unsaved progress will be lost.')) {
                        ModalManager.closeModal('menuModal');
                        GameUI.hideGameUI();
                        SplashScreen.show();
                    }
                });
                
                // Menu items
                document.getElementById('menuSaveGame').addEventListener('click', () => {
                    ModalManager.closeModal('menuModal');
                    this.saveGame();
                });
                
                document.getElementById('menuLoadGame').addEventListener('click', () => {
                    ModalManager.closeModal('menuModal');
                    this.loadGame();
                });
                
                document.getElementById('menuOptions').addEventListener('click', () => {
                    ModalManager.closeModal('menuModal');
                    NotificationSystem.showNotification({
                        type: 'info',
                        title: 'Game Options',
                        message: 'Adjust difficulty, display, and other game settings.'
                    });
                });
                
                document.getElementById('menuStats').addEventListener('click', () => {
                    ModalManager.closeModal('menuModal');
                    GameController.showGameStats();
                });
                
                document.getElementById('menuExit').addEventListener('click', () => {
                    if (confirm('Are you sure you want to exit the game? All unsaved progress will be lost.')) {
                        ModalManager.closeModal('menuModal');
                        NotificationSystem.showNotification({
                            type: 'info',
                            title: 'Exiting Game',
                            message: 'Thank you for playing.'
                        });
                    }
                });
                
                // Game result modal events
                document.getElementById('returnToMenuBtn').addEventListener('click', () => {
                    ModalManager.closeModal('gameResultModal');
                    GameUI.hideGameUI();
                    SplashScreen.show();
                });
                
                document.getElementById('newGameBtn').addEventListener('click', () => {
                    ModalManager.closeModal('gameResultModal');
                    GameController.resetGameState();
                    GameUI.hideGameUI();
                    SplashScreen.show();
                });
                
                // Tab navigation
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.addEventListener('click', function() {
                        TabNavigation.switchTab(this.getAttribute('data-tab'));
                    });
                });
                
                // Stakeholder engagement events
                document.getElementById('engageStakeholderBtn').addEventListener('click', StakeholderManager.showEngagementOptions);
                
                console.log("Event bindings complete");
            } catch (error) {
                console.error("Error binding events:", error);
                NotificationSystem.showNotification({
                    type: 'error',
                    title: 'Initialization Error',
                    message: 'There was a problem setting up game controls. Please refresh the page.'
                });
            }
        },
        
        /**
         * Start the tutorial
         */
        startTutorial: function() {
            ModalManager.closeModal('guideModal');
            NotificationSystem.showNotification({
                type: 'info',
                title: 'Tutorial Mode',
                message: 'The tutorial will guide you through the basics of managing development finance.'
            });
            
            // Mark tutorial as completed
            gameState.tutorialCompleted = true;
            
            // Show a sample action for the tutorial
            setTimeout(() => {
                NotificationSystem.showNotification({
                    type: 'info',
                    title: 'First Step',
                    message: 'Begin by analyzing the current financial situation. Try selecting "Debt Analysis" from the actions panel.'
                });
            }, 3000);
            
            // Start the mission if not already in game
            if (!document.getElementById('gameHeader').style.display || 
                document.getElementById('gameHeader').style.display === 'none') {
                MissionSelector.startMission();
            }
        },
        
        /**
         * Save the current game state
         */
        saveGame: function() {
            try {
                const saveData = {
                    gameState: gameState,
                    saveDate: new Date().toISOString(),
                    version: "1.2"
                };
                
                localStorage.setItem('Debt & DiplomacySaveGame', JSON.stringify(saveData));
                
                NotificationSystem.showNotification({
                    type: 'success',
                    title: 'Game Saved',
                    message: 'Your progress has been saved successfully.'
                });
            } catch (error) {
                console.error("Error saving game:", error);
                NotificationSystem.showNotification({
                    type: 'error',
                    title: 'Save Failed',
                    message: 'There was a problem saving your progress. Please try again.'
                });
            }
        },
        
        /**
         * Load a saved game
         */
        loadGame: function() {
            try {
                const savedData = localStorage.getItem('Debt & DiplomacySaveGame');
                
                if (!savedData) {
                    NotificationSystem.showNotification({
                        type: 'info',
                        title: 'No Saved Game',
                        message: 'No saved game was found. Start a new game instead.'
                    });
                    return;
                }
                
                const saveGame = JSON.parse(savedData);
                
                // Load game state
                Object.assign(gameState, saveGame.gameState);
                
                // Update UI based on loaded state
                GameUI.updateResourcesDisplay();
                MetricsManager.updateAllMetrics();
                StakeholderManager.updateStakeholdersDisplay();
                ObjectiveManager.updateAllObjectives();
                
                // Show game UI if not already visible
                if (!document.getElementById('gameHeader').style.display || 
                    document.getElementById('gameHeader').style.display === 'none') {
                    GameUI.showGameUI();
                } else {
                    // Just refresh the current tab if already in game
                    TabNavigation.refreshCurrentTab();
                }
                
                NotificationSystem.showNotification({
                    type: 'success',
                    title: 'Game Loaded',
                    message: `Successfully loaded game from ${new Date(saveGame.saveDate).toLocaleString()}.`
                });
            } catch (error) {
                console.error("Error loading game:", error);
                NotificationSystem.showNotification({
                    type: 'error',
                    title: 'Load Failed',
                    message: 'There was a problem loading your saved game. The save file may be corrupted.'
                });
            }
        },
        
        /**
         * Show the game statistics
         */
        showGameStats: function() {
            const completedActions = gameState.actionsHistory.length;
            const completedObjectives = gameState.completedObjectives.length;
            const diplomaticStatus = gameState.stakeholders.filter(s => s.relationship === 'friendly').length + 
                                    " friendly, " +
                                    gameState.stakeholders.filter(s => s.relationship === 'neutral').length + 
                                    " neutral, " +
                                    gameState.stakeholders.filter(s => s.relationship === 'hostile').length + 
                                    " hostile";
            const unlockedInsights = gameState.unlockedInsights.length;
            
            NotificationSystem.showNotification({
                type: 'info',
                title: 'Game Statistics',
                message: `Day: ${gameState.currentDay}/${gameState.totalDays} | 
                          Actions: ${completedActions} | 
                          Objectives: ${completedObjectives}/4 | 
                          Diplomacy: ${diplomaticStatus} | 
                          Insights: ${unlockedInsights}/${gameState.educationalInsights.length}`
            });
            
            // Show more detailed stats after a delay
            setTimeout(() => {
                const fiscalStatus = gameState.metrics.fiscal >= 60 ? "Sustainable" : 
                                    gameState.metrics.fiscal >= 40 ? "Concerning" : "Critical";
                                    
                const environmentalStatus = gameState.metrics.environmental >= 60 ? "Compliant" : 
                                           gameState.metrics.environmental >= 40 ? "Improving" : "Non-compliant";
                
                NotificationSystem.showNotification({
                    type: 'info',
                    title: 'Key Performance Indicators',
                    message: `Fiscal Status: ${fiscalStatus} (${gameState.metrics.fiscal}%) | 
                              Environmental: ${environmentalStatus} (${gameState.metrics.environmental}%) | 
                              Political Capital: ${gameState.resources.influence} points | 
                              Budget: $${gameState.resources.budget.toLocaleString()}`
                });
            }, 2000);
        },
        
        /**
         * Reset the game state to initial values
         */
        resetGameState: function() {
            gameState.currentDay = 1;
            gameState.resources = {
                budget: 15000000,
                influence: 60,
                staff: 6,
                timeRemaining: 10
            };
            gameState.metrics = {
                fiscal: 35,
                environmental: 40,
                political: 60,
                international: 30
            };
            gameState.completedObjectives = [];
            gameState.decisions = [];
            gameState.actionsHistory = [];
            gameState.updates = [];
            gameState.unlockedInsights = [];
            gameState.documentHistory = [];
            gameState.stakeholderEngagements = [];
            
            // Reset stakeholder relationships
            gameState.stakeholders.forEach(stakeholder => {
                if (stakeholder.id === 4) {
                    stakeholder.relationship = "hostile";
                } else if (stakeholder.id === 5) {
                    stakeholder.relationship = "friendly";
                } else {
                    stakeholder.relationship = "neutral";
                }
            });
            
            // Reset objective progress bars
            document.querySelectorAll('.objective-item .progress').forEach(progress => {
                progress.style.height = '0%';
            });
            
            // Reset overall progress
            document.getElementById('overallProgressFill').style.width = '0%';
            document.getElementById('overallProgressLabel').textContent = '0%';
            
            console.log("Game state reset to initial values");
        },
        
        /**
         * Execute an action based on its ID
         * @param {number} actionId - The ID of the action to execute
         */
        executeAction: async function(actionId) {
            try {
                // Find the action definition
                const action = gameState.actions.find(a => a.id === actionId);
                if (!action) {
                    throw new Error(`Action with ID ${actionId} not found`);
                }
                
                // Check if player has enough resources
                if (gameState.resources.budget < action.cost) {
                    NotificationSystem.showNotification({
                        type: 'error',
                        title: 'Insufficient Budget',
                        message: `You need $${action.cost.toLocaleString()} to perform this action, but you only have $${gameState.resources.budget.toLocaleString()}.`
                    });
                    return;
                }
                
                if (gameState.resources.timeRemaining < action.timeCost) {
                    NotificationSystem.showNotification({
                        type: 'error',
                        title: 'Insufficient Time',
                        message: `You need ${action.timeCost} days to perform this action, but you only have ${gameState.resources.timeRemaining} days remaining.`
                    });
                    return;
                }
                
                if (gameState.resources.staff < action.staffCost) {
                    NotificationSystem.showNotification({
                        type: 'error',
                        title: 'Insufficient Staff',
                        message: `You need ${action.staffCost} staff members for this action, but you only have ${gameState.resources.staff} available.`
                    });
                    return;
                }
                
                // Show action loading animation
                await ActionManager.showActionLoading(action.id);
                
                // Update resources
                gameState.resources.budget -= action.cost;
                gameState.resources.timeRemaining -= action.timeCost;
                gameState.resources.staff -= action.staffCost;
                gameState.currentDay += action.timeCost;
                
                // Update metrics
                if (action.impacts) {
                    for (const [metric, value] of Object.entries(action.impacts)) {
                        if (gameState.metrics[metric] !== undefined && value !== 0) {
                            gameState.metrics[metric] += value;
                            // Ensure metrics stay within 0-100 range
                            gameState.metrics[metric] = Math.max(0, Math.min(100, gameState.metrics[metric]));
                            MetricsManager.updateMetricDisplay(metric);
                        }
                    }
                }
                
                // Apply influence change if present
                if (action.impacts && action.impacts.influence) {
                    gameState.resources.influence += action.impacts.influence;
                    
                    // Check for negative influence cap
                    gameState.resources.influence = Math.max(0, gameState.resources.influence);
                    
                    // Check for influence depletion
                    if (gameState.resources.influence <= gameState.thresholds.influence) {
                        setTimeout(() => {
                            GameController.triggerGameOver('influence');
                        }, 1500);
                    }
                }
                
                // Update stakeholder relationships
                if (action.stakeholderImpacts) {
                    action.stakeholderImpacts.forEach(impact => {
                        StakeholderManager.updateRelationship(impact.id, impact.relationship, impact.reason);
                    });
                }
                
                // Update objective progress
                if (action.objectiveProgress) {
                    action.objectiveProgress.forEach(objective => {
                        ObjectiveManager.updateProgress(objective.id, objective.progress, objective.reason);
                    });
                }
                
                // Add to action history
                gameState.actionsHistory.push({
                    id: action.id,
                    day: gameState.currentDay,
                    title: `${action.title} Completed`,
                    description: action.impactDescription,
                    impacts: action.impacts,
                    stakeholderImpacts: action.stakeholderImpacts,
                    objectiveProgress: action.objectiveProgress,
                    educationalValue: action.educationalValue
                });
                
                // Add news update
                if (action.newsUpdate) {
                    gameState.updates.push({
                        day: gameState.currentDay,
                        title: action.newsUpdate.title,
                        content: action.newsUpdate.content,
                        relatedAction: action.title
                    });
                    
                    // Update notification badge count
                    document.querySelector('.updates-badge').textContent = gameState.updates.length;
                    document.querySelector('.updates-badge').style.display = 'flex';
                }
                
                // Unlock educational insight if available
                if (action.unlocksInsight) {
                    if (!gameState.unlockedInsights.some(insight => insight.id === action.unlocksInsight.id)) {
                        gameState.unlockedInsights.push(action.unlocksInsight);
                        
                        // Show educational notification after a delay
                        setTimeout(() => {
                            NotificationSystem.showNotification({
                                type: 'info',
                                title: 'Educational Insight Unlocked',
                                message: `You've unlocked a new insight: "${action.unlocksInsight.title}". Check the Educational Insights section for details.`
                            });
                        }, 2000);
                    }
                }
                
                // Update UI elements
                GameUI.updateResourcesDisplay();
                StakeholderManager.updateStakeholdersDisplay();
                TabNavigation.refreshCurrentTab();
                ObjectiveManager.updateOverallProgress();
                
                // Show action result notification
                NotificationSystem.showNotification({
                    type: 'success',
                    title: action.title,
                    message: action.impactDescription
                });
                
                // Check for completion of all objectives
                if (ObjectiveManager.checkAllObjectivesComplete()) {
                    setTimeout(() => {
                        GameController.showVictory();
                    }, 1500);
                }
                
                // Check if time has run out
                if (gameState.resources.timeRemaining <= 0) {
                    setTimeout(() => {
                        GameController.triggerGameOver('time');
                    }, 1500);
                }
                
                // Check if budget has run out
                if (gameState.resources.budget <= gameState.thresholds.budget) {
                    setTimeout(() => {
                        GameController.triggerGameOver('budget');
                    }, 1500);
                }
                
                // Check if staff has run out
                if (gameState.resources.staff <= gameState.thresholds.staff) {
                    setTimeout(() => {
                        GameController.triggerGameOver('staff');
                    }, 1500);
                }
                
                // Check if any metric has fallen below critical threshold
                for (const [metric, value] of Object.entries(gameState.metrics)) {
                    if (gameState.thresholds[metric] && value <= gameState.thresholds[metric]) {
                        setTimeout(() => {
                            GameController.triggerGameOver(metric);
                        }, 1500);
                        break;
                    }
                }
                
                // Check if player can take any more actions
                this.checkForGameEndConditions();
                
                console.log(`Action executed: ${action.title}`);
                
            } catch (error) {
                console.error("Error executing action:", error);
                NotificationSystem.showNotification({
                    type: 'error',
                    title: 'Action Failed',
                    message: 'There was a problem executing this action. Please try again.'
                });
            }
        },
        
        /**
         * Check if the player can take any more actions
         */
        checkForGameEndConditions: function() {
            // Check if player has resources to take any remaining actions
            let canTakeAnyAction = false;
            
            for (const action of gameState.actions) {
                // Skip actions already taken
                if (gameState.actionsHistory.some(a => a.id === action.id)) {
                    continue;
                }
                
                // Check if player has enough resources
                if (gameState.resources.budget >= action.cost && 
                    gameState.resources.timeRemaining >= action.timeCost && 
                    gameState.resources.staff >= action.staffCost) {
                    canTakeAnyAction = true;
                    break;
                }
            }
            
            // If no actions can be taken, end game
            if (!canTakeAnyAction && gameState.actions.length > gameState.actionsHistory.length) {
                setTimeout(() => {
                    GameController.triggerGameOver('resources');
                }, 1500);
            }
        },
        
        /**
         * Execute a stakeholder engagement option
         * @param {number} stakeholderId - The ID of the stakeholder
         * @param {number} optionId - The ID of the engagement option
         */
        executeStakeholderEngagement: async function(stakeholderId, optionId) {
            try {
                // Find the stakeholder
                const stakeholder = gameState.stakeholders.find(s => s.id === stakeholderId);
                if (!stakeholder) {
                    throw new Error(`Stakeholder with ID ${stakeholderId} not found`);
                }
                
                // Find the engagement option
                const engagementOptions = gameState.stakeholderEngagementOptions[stakeholderId];
                if (!engagementOptions) {
                    throw new Error(`No engagement options for stakeholder ${stakeholderId}`);
                }
                
                const option = engagementOptions.find(o => o.id === optionId);
                if (!option) {
                    throw new Error(`Engagement option ${optionId} not found for stakeholder ${stakeholderId}`);
                }
                
                // Check if player has enough budget
                if (gameState.resources.budget < option.cost) {
                    NotificationSystem.showNotification({
                        type: 'error',
                        title: 'Insufficient Budget',
                        message: `You need $${option.cost.toLocaleString()} for this engagement, but you only have $${gameState.resources.budget.toLocaleString()}.`
                    });
                    return;
                }
                
                // Check if player has enough influence
                if (gameState.resources.influence < option.influenceCost) {
                    NotificationSystem.showNotification({
                        type: 'error',
                        title: 'Insufficient Influence',
                        message: `You need ${option.influenceCost} influence points for this engagement, but you only have ${gameState.resources.influence}.`
                    });
                    return;
                }
                
                // Show action loading animation
                await ActionManager.showActionLoading(0, `Engaging with ${stakeholder.name}`);
                
                // Update resources
                gameState.resources.budget -= option.cost;
                gameState.resources.influence -= option.influenceCost;
                
                // Update stakeholder relationship
                StakeholderManager.updateRelationship(stakeholderId, option.impacts.relationship, 
                    `Further engagement: ${option.title}`);
                
                // Update metrics if any
                if (option.impacts.metrics) {
                    for (const [metric, value] of Object.entries(option.impacts.metrics)) {
                        if (gameState.metrics[metric] !== undefined) {
                            gameState.metrics[metric] += value;
                            // Ensure metrics stay within 0-100 range
                            gameState.metrics[metric] = Math.max(0, Math.min(100, gameState.metrics[metric]));
                            MetricsManager.updateMetricDisplay(metric);
                        }
                    }
                }
                
                // Add to stakeholder engagements history
                gameState.stakeholderEngagements.push({
                    stakeholderId: stakeholderId,
                    optionId: optionId,
                    day: gameState.currentDay,
                    title: option.title,
                    outcome: option.outcome,
                    impacts: option.impacts
                });
                
                // Update UI elements
                GameUI.updateResourcesDisplay();
                StakeholderManager.updateStakeholdersDisplay();
                TabNavigation.refreshCurrentTab();
                
                // Close the engagement modal
                ModalManager.closeModal('stakeholderEngagementModal');
                
                // Show engagement result notification
                NotificationSystem.showNotification({
                    type: 'success',
                    title: `Engagement with ${stakeholder.name}`,
                    message: option.outcome
                });
                
                console.log(`Stakeholder engagement executed: ${option.title}`);
                
            } catch (error) {
                console.error("Error executing stakeholder engagement:", error);
                NotificationSystem.showNotification({
                    type: 'error',
                    title: 'Engagement Failed',
                    message: 'There was a problem with this stakeholder engagement. Please try again.'
                });
            }
        },
        /**
         * Show the victory screen when player succeeds
         */
        showVictory: function() {
            // Calculate overall score based on metrics and resources
            const fiscalScore = gameState.metrics.fiscal;
            const environmentalScore = gameState.metrics.environmental;
            const politicalScore = gameState.metrics.political;
            const internationalScore = gameState.metrics.international;
            
            const overallScore = Math.round((fiscalScore + environmentalScore + politicalScore + internationalScore) / 4);
            
            // Determine victory type based on score
            let verdict = '';
            let educationalSummary = '';
            
            if (overallScore >= 80) {
                verdict = 'Outstanding Success';
                educationalSummary = 'You\'ve demonstrated exceptional skill in balancing financial sustainability with environmental and social considerations. Your approach to development finance prioritized multiple stakeholder interests while maintaining fiscal discipline.';
            } else if (overallScore >= 60) {
                verdict = 'Major Success';
                educationalSummary = 'You\'ve successfully navigated the complexities of development finance, finding sustainable solutions that address most stakeholder concerns while maintaining adequate fiscal performance.';
            } else if (overallScore >= 40) {
                verdict = 'Moderate Success';
                educationalSummary = 'You\'ve achieved a workable solution to the debt challenge, though some stakeholder needs remain unaddressed. This represents the real-world trade-offs often required in development finance.';
            } else {
                verdict = 'Partial Success';
                educationalSummary = 'While avoiding complete failure, your solution reflects the difficult compromises often faced in development finance when resources are limited and stakeholder interests conflict.';
            }
            
            // Set up the result modal content
            document.getElementById('gameResultTitle').textContent = 'Mission Complete';
            
            const resultBody = document.getElementById('gameResultBody');
            
            // Get stakeholder statuses for the summary
            const friendlyCount = gameState.stakeholders.filter(s => s.relationship === 'friendly').length;
            const hostileCount = gameState.stakeholders.filter(s => s.relationship === 'hostile').length;
            
            resultBody.innerHTML = `
                <div class="result-header">
                    <div class="result-score">${overallScore}%</div>
                    <div class="result-verdict">${verdict}</div>
                </div>
                
                <div class="result-metrics">
                    <div class="result-metric">
                        <div class="result-metric-value" style="color: var(--fiscal-color)">${fiscalScore}%</div>
                        <div class="result-metric-label">Fiscal Sustainability</div>
                    </div>
                    <div class="result-metric">
                        <div class="result-metric-value" style="color: var(--environmental-color)">${environmentalScore}%</div>
                        <div class="result-metric-label">Environmental Compliance</div>
                    </div>
                    <div class="result-metric">
                        <div class="result-metric-value" style="color: var(--political-color)">${politicalScore}%</div>
                        <div class="result-metric-label">Political Capital</div>
                    </div>
                    <div class="result-metric">
                        <div class="result-metric-value" style="color: var(--international-color)">${internationalScore}%</div>
                        <div class="result-metric-label">International Relations</div>
                    </div>
                </div>
                
                <div class="result-summary">
                    <h4>Mission Summary</h4>
                    <p>You've successfully navigated the port financing crisis in ${gameState.currentDay} days. You've maintained ${friendlyCount} positive stakeholder relationships and have ${gameState.resources.influence} influence points remaining. Your fiscal sustainability score of ${fiscalScore}% indicates that ${fiscalScore >= 60 ? 'you\'ve secured a sustainable financial future for the port' : 'there are still financial challenges to overcome'}.</p>
                </div>
                
                <div class="educational-outcome">
                    <h4>Educational Insights</h4>
                    <p>${educationalSummary}</p>
                    <p>You unlocked ${gameState.unlockedInsights.length} out of ${gameState.educationalInsights.length} development finance insights during your playthrough.</p>
                </div>
                
                <div class="result-relationships">
                    <h4>Key Stakeholder Relations</h4>
                    ${gameState.stakeholders.map(stakeholder => {
                        let bgColor;
                        let textColor;
                        
                        switch(stakeholder.relationship) {
                            case 'friendly':
                                bgColor = 'rgba(50, 165, 130, 0.1)';
                                textColor = 'var(--success)';
                                break;
                            case 'hostile':
                                bgColor = 'rgba(244, 83, 102, 0.1)';
                                textColor = 'var(--danger)';
                                break;
                            default: // neutral
                                bgColor = 'rgba(110, 122, 148, 0.1)';
                                textColor = 'var(--neutral)';
                        }
                        
                        return `
                            <div class="result-relationship">
                                <div class="relationship-avatar" style="background-color: var(--primary)">${stakeholder.image}</div>
                                <div class="relationship-details">
                                    <div class="relationship-name">${stakeholder.name}</div>
                                    <div class="relationship-status" style="background-color: ${bgColor}; color: ${textColor}">
                                        ${stakeholder.relationship.charAt(0).toUpperCase() + stakeholder.relationship.slice(1)}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            ModalManager.openModal('gameResultModal');
            
            console.log("Victory screen displayed");
        },
        
        /**
         * Trigger game over when player fails
         * @param {string} reason - The reason for game over (influence, budget, time, staff, etc.)
         */
/**
 * Trigger game conclusion when player reaches an end state
 * @param {string} reason - The reason for game conclusion (influence, budget, time, staff, etc.)
 */
triggerGameOver: function(reason) {
    // Calculate partial score based on metrics
    const fiscalScore = gameState.metrics.fiscal;
    const environmentalScore = gameState.metrics.environmental;
    const politicalScore = gameState.metrics.political;
    const internationalScore = gameState.metrics.international;
    
    const overallScore = Math.round((fiscalScore + environmentalScore + politicalScore + internationalScore) / 4);
    
    // Set up the result modal content
    document.getElementById('gameResultTitle').textContent = 'Mission Conclusion';
    
    const resultBody = document.getElementById('gameResultBody');
    
    // Generate conclusion message based on reason
    let conclusionMessage = '';
    let educationalLesson = '';
    
    switch(reason) {
        case 'influence':
            conclusionMessage = 'Your political capital has reached a critical threshold. The Prime Minister has expressed concerns about your strategic approach to the port financing situation and has requested a change in leadership for this initiative.';
            educationalLesson = 'In development finance, maintaining political support is crucial. Technical solutions must be balanced with political viability to ensure continued mandate for implementation.';
            break;
        case 'budget':
            conclusionMessage = 'Your available budget has been fully allocated without reaching a sustainable solution. The Finance Ministry now needs to reassess the approach with a fresh strategic plan.';
            educationalLesson = 'Fiscal constraints are a fundamental reality in development finance. Effective prioritization of investments is essential when resources are limited.';
            break;
        case 'time':
            conclusionMessage = 'The loan payment deadline has arrived without a sustainable solution in place. A new emergency committee has been formed to address the immediate financial obligations.';
            educationalLesson = 'Timing is critical in debt management. Proactive engagement with creditors well before payment deadlines provides more options and leverage in negotiations.';
            break;
        case 'staff':
            conclusionMessage = 'Your team has reached its capacity limits. Without adequate human resources to implement new initiatives, a reorganization will be needed to continue progress on addressing the crisis.';
            educationalLesson = 'Implementation capacity is often overlooked in development planning. Even well-designed solutions require adequate human resources for successful execution.';
            break;
        case 'fiscal':
            conclusionMessage = 'The port\n\s fiscal sustainability metrics have reached concerning levels. Creditors have signaled the need for an immediate intervention and possible restructuring of management.';
            educationalLesson = 'Maintaining minimum debt service coverage ratios is essential for infrastructure projects. When revenue falls too far below debt obligations, significant restructuring may be required.';
            break;
        case 'environmental':
            conclusionMessage = 'Environmental compliance has fallen below international standards. Regulatory bodies have called for a comprehensive review, and local protests have temporarily disrupted port operations.';
            educationalLesson = 'Environmental standards have become increasingly central to infrastructure finance. Projects must address these concerns to maintain operational continuity and stakeholder support.';
            break;
        case 'political':
            conclusionMessage = 'Political support for the port project has significantly diminished. The government is reassessing its approach, and a new task force will be appointed to develop alternative strategies.';
            educationalLesson = 'Large infrastructure projects require sustained political commitment across multiple stakeholder groups. Building and maintaining broad political support is essential for project continuity.';
            break;
        case 'international':
            conclusionMessage = 'International relations have become strained to a critical point. Diplomatic interventions are now required before financial discussions can productively resume.';
            educationalLesson = 'Development finance increasingly requires navigating complex geopolitical relationships. Maintaining positive relations with diverse international partners preserves financial options.';
            break;
        case 'resources':
            conclusionMessage = 'You have allocated all available resources. The port financing situation remains challenging, and leadership has decided to bring in additional expertise to explore new approaches.';
            educationalLesson = 'Resource planning is critical in development finance. Actions should be sequenced to maximize impact while preserving options for future interventions.';
            break;
        default:
            conclusionMessage = 'The port financing situation requires a new approach. A strategic reassessment will be conducted to identify alternative pathways forward.';
            educationalLesson = 'Development finance challenges require balancing multiple objectives and stakeholder interests simultaneously.';
    }
    
    resultBody.innerHTML = `
        <div class="result-header">
            <div class="result-score">${overallScore}%</div>
            <div class="result-verdict">Mission Concluded</div>
        </div>
        
        <div class="result-summary">
            <h4>What Happened</h4>
            <p>${conclusionMessage}</p>
        </div>
        
        <div class="educational-outcome">
            <h4>Learning Insight</h4>
            <p>${educationalLesson}</p>
        </div>
        
        <div class="result-metrics">
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--fiscal-color)">${fiscalScore}%</div>
                <div class="result-metric-label">Fiscal Sustainability</div>
            </div>
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--environmental-color)">${environmentalScore}%</div>
                <div class="result-metric-label">Environmental Compliance</div>
            </div>
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--political-color)">${politicalScore}%</div>
                <div class="result-metric-label">Political Capital</div>
            </div>
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--international-color)">${internationalScore}%</div>
                <div class="result-metric-label">International Relations</div>
            </div>
        </div>
        
        <div class="result-summary">
            <h4>Future Considerations</h4>
            <p>In development finance, maintaining a balance between fiscal goals, environmental concerns, political capital, and international relations is crucial. In your next attempt, consider focusing more on ${
                overallScore < 40 ? 'building consensus before taking major actions.' :
                fiscalScore < 40 ? 'increasing fiscal sustainability and revenue growth.' :
                environmentalScore < 40 ? 'enhancing environmental compliance and community engagement.' :
                politicalScore < 40 ? 'strengthening political capital with key stakeholders.' :
                'balancing international relationships with Chinese and Western partners.'
            }</p>
        </div>
    `;
    
    ModalManager.openModal('gameResultModal');
    
    console.log(`Game conclusion triggered: ${reason}`);
},

/**
 * Show the victory screen when player succeeds
 */
showVictory: function() {
    // Calculate overall score based on metrics and resources
    const fiscalScore = gameState.metrics.fiscal;
    const environmentalScore = gameState.metrics.environmental;
    const politicalScore = gameState.metrics.political;
    const internationalScore = gameState.metrics.international;
    
    const overallScore = Math.round((fiscalScore + environmentalScore + politicalScore + internationalScore) / 4);
    
    // Determine victory type based on score
    let verdict = '';
    let educationalSummary = '';
    
    if (overallScore >= 80) {
        verdict = 'Outstanding Success';
        educationalSummary = 'You\'ve demonstrated exceptional skill in balancing financial sustainability with environmental and social considerations. Your approach to development finance prioritized multiple stakeholder interests while maintaining fiscal discipline.';
    } else if (overallScore >= 60) {
        verdict = 'Major Success';
        educationalSummary = 'You\'ve successfully navigated the complexities of development finance, finding sustainable solutions that address most stakeholder concerns while maintaining adequate fiscal performance.';
    } else if (overallScore >= 40) {
        verdict = 'Moderate Success';
        educationalSummary = 'You\'ve achieved a workable solution to the debt challenge, though some stakeholder needs remain unaddressed. This represents the real-world trade-offs often required in development finance.';
    } else {
        verdict = 'Partial Success';
        educationalSummary = 'While facing significant challenges, your solution reflects the difficult compromises often encountered in development finance when resources are limited and stakeholder interests conflict.';
    }
    
    // Set up the result modal content
    document.getElementById('gameResultTitle').textContent = 'Mission Complete';
    
    const resultBody = document.getElementById('gameResultBody');
    
    // Get stakeholder statuses for the summary
    const friendlyCount = gameState.stakeholders.filter(s => s.relationship === 'friendly').length;
    const hostileCount = gameState.stakeholders.filter(s => s.relationship === 'hostile').length;
    
    resultBody.innerHTML = `
        <div class="result-header">
            <div class="result-score">${overallScore}%</div>
            <div class="result-verdict">${verdict}</div>
        </div>
        
        <div class="result-metrics">
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--fiscal-color)">${fiscalScore}%</div>
                <div class="result-metric-label">Fiscal Sustainability</div>
            </div>
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--environmental-color)">${environmentalScore}%</div>
                <div class="result-metric-label">Environmental Compliance</div>
            </div>
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--political-color)">${politicalScore}%</div>
                <div class="result-metric-label">Political Capital</div>
            </div>
            <div class="result-metric">
                <div class="result-metric-value" style="color: var(--international-color)">${internationalScore}%</div>
                <div class="result-metric-label">International Relations</div>
            </div>
        </div>
        
        <div class="result-summary">
            <h4>Mission Summary</h4>
            <p>You've successfully navigated the port financing crisis in ${gameState.currentDay} days. You've maintained ${friendlyCount} positive stakeholder relationships and have ${gameState.resources.influence} influence points remaining. Your fiscal sustainability score of ${fiscalScore}% indicates that ${fiscalScore >= 60 ? 'you\'ve secured a sustainable financial future for the port' : 'there are still financial challenges to address, though significant progress has been made'}.</p>
        </div>
        
        <div class="educational-outcome">
            <h4>Educational Insights</h4>
            <p>${educationalSummary}</p>
            <p>You unlocked ${gameState.unlockedInsights.length} out of ${gameState.educationalInsights.length} development finance insights during your playthrough.</p>
        </div>
        
        <div class="result-relationships">
            <h4>Key Stakeholder Relations</h4>
            ${gameState.stakeholders.map(stakeholder => {
                let bgColor;
                let textColor;
                
                switch(stakeholder.relationship) {
                    case 'friendly':
                        bgColor = 'rgba(50, 165, 130, 0.1)';
                        textColor = 'var(--success)';
                        break;
                    case 'hostile':
                        bgColor = 'rgba(244, 83, 102, 0.1)';
                        textColor = 'var(--danger)';
                        break;
                    default: // neutral
                        bgColor = 'rgba(110, 122, 148, 0.1)';
                        textColor = 'var(--neutral)';
                }
                
                return `
                    <div class="result-relationship">
                        <div class="relationship-avatar" style="background-color: var(--primary)">${stakeholder.image}</div>
                        <div class="relationship-details">
                            <div class="relationship-name">${stakeholder.name}</div>
                            <div class="relationship-status" style="background-color: ${bgColor}; color: ${textColor}">
                                ${stakeholder.relationship.charAt(0).toUpperCase() + stakeholder.relationship.slice(1)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    ModalManager.openModal('gameResultModal');
            
            console.log(`Game over triggered: ${reason}`);
            console.log("Victory screen displayed");
        }
    };

    // ===== NOTIFICATION SYSTEM =====
    /**
     * Manages system notifications with queue to prevent duplicates and manage timing
     */
    const NotificationSystem = {
        /**
         * Notification queue to prevent duplicates and manage timing
         * @type {Array}
         */
        queue: [],
        
        /**
         * Set of notification IDs to track shown messages
         * @type {Set}
         */
        shown: new Set(),
        
        /**
         * Current active notification count
         * @type {number}
         */
        activeCount: 0,
        
        /**
         * Maximum allowed active notifications
         * @type {number}
         */
        maxActive: 3,
        
        /**
         * Initialize the notification system
         */
        init: function() {
            this.container = document.getElementById('notificationContainer');
            console.log("Notification system initialized");
        },
        
        /**
         * Generate a unique ID for a notification based on its content
         * @param {Object} options - Notification options
         * @returns {string} - Unique notification ID
         */
        generateNotificationId: function(options) {
            return `${options.type}-${options.title.replace(/\s+/g, '-').toLowerCase()}`;
        },
        
        /**
         * Show a notification
         * @param {Object} options - Notification options (type, title, message)
         */
        showNotification: function(options) {
            try {
                // Generate a unique ID for this notification
                const notificationId = this.generateNotificationId(options);
                
                // Check if a similar notification is already shown
                if (this.shown.has(notificationId)) {
                    console.log(`Notification ${notificationId} already shown, not showing duplicate`);
                    return;
                }
                
                // Add to queue and process queue
                this.queue.push({...options, id: notificationId});
                this.processQueue();
                
            } catch (error) {
                console.error("Error showing notification:", error);
            }
        },
        
        /**
         * Process the notification queue
         */
        processQueue: function() {
            // Check if we can show more notifications
            if (this.activeCount >= this.maxActive || this.queue.length === 0) {
                return;
            }
            
            // Get the next notification from the queue
            const notification = this.queue.shift();
            
            // Create the notification element
            const notificationEl = document.createElement('div');
            notificationEl.className = 'notification';
            notificationEl.dataset.id = notification.id;
            
            // Notification HTML structure
            notificationEl.innerHTML = `
                <div class="notification-icon notification-${notification.type}">
                    ${this.getIconForType(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
                <button class="notification-close" aria-label="Close notification">×</button>
            `;
            
            // Add to container
            this.container.appendChild(notificationEl);
            this.activeCount++;
            this.shown.add(notification.id);
            
            // Add close button event
            notificationEl.querySelector('.notification-close').addEventListener('click', () => {
                this.closeNotification(notificationEl);
            });
            
            // Add auto-close timer
            setTimeout(() => {
                if (document.body.contains(notificationEl)) {
                    this.closeNotification(notificationEl);
                }
            }, 8000);
            
            // Trigger animation after a small delay
            setTimeout(() => {
                notificationEl.classList.add('active');
            }, 10);
            
            // Process next notification if any
            if (this.queue.length > 0 && this.activeCount < this.maxActive) {
                setTimeout(() => {
                    this.processQueue();
                }, 300);
            }
        },
        
        /**
         * Close a notification
         * @param {HTMLElement} notificationEl - The notification element to close
         */
        closeNotification: function(notificationEl) {
            const notificationId = notificationEl.dataset.id;
            
            // Animate out
            notificationEl.classList.remove('active');
            
            // Remove after animation completes
            setTimeout(() => {
                if (document.body.contains(notificationEl)) {
                    notificationEl.remove();
                    this.activeCount--;
                    this.shown.delete(notificationId);
                    
                    // Process next notification if any
                    this.processQueue();
                }
            }, 300);
        },
        
        /**
         * Get icon for notification type
         * @param {string} type - Notification type (success, error, warning, info)
         * @returns {string} - HTML for the icon
         */
        getIconForType: function(type) {
            switch (type) {
                case 'success':
                    return '✓';
                case 'error':
                    return '!';
                case 'warning':
                    return '⚠';
                case 'info':
                    return 'i';
                default:
                    return 'i';
            }
        },
        
        /**
         * Clear all notifications
         */
        clearAll: function() {
            const notifications = this.container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.closeNotification(notification);
            });
            
            // Clear queue
            this.queue = [];
        }
    };

    // ===== ENHANCED DOCUMENT VIEWER =====
    /**
     * Enhanced Document Viewer Component
     * Renders documents with proper formatting, syntax highlighting, and interactive elements
     */
    const DocumentViewerEnhanced = {
        renderDocument: function(documentId) {
            try {
                const doc = gameState.documents.find(d => d.id === documentId);
                if (!doc) {
                    console.error(`Document with ID ${documentId} not found`);
                    return;
                }
                
                const viewer = document.getElementById('documentViewer');
                if (!viewer) {
                    console.error("Document viewer container not found");
                    return;
                }
                
            // Create document header with icon and metadata
            const header = `
                <div class="document-header">
                    <div class="document-header-icon">${doc.icon}</div>
                    <div class="document-header-info">
                        <h3>${doc.title}</h3>
                        <div class="document-header-type">${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} Document</div>
                    </div>
                </div>
            `;
                
            // Format document content based on type
            let formattedContent = '';
            switch(doc.type) {
                case 'financial':
                    formattedContent = this.formatFinancialDocument(doc.content);
                    break;
                case 'report':
                    formattedContent = this.formatReportDocument(doc.content);
                    break;
                case 'legal':
                    formattedContent = this.formatLegalDocument(doc.content);
                    break;
                case 'testimonial':
                    formattedContent = this.formatTestimonialDocument(doc.content);
                    break;
                case 'educational':
                    formattedContent = this.formatEducationalDocument(doc.content);
                    break;
                default:
                    formattedContent = `<div class="document-content"><pre>${doc.content}</pre></div>`;
            }
            
            // Add educational context if available
            const educationalValue = doc.educationalValue ? 
                `<div class="educational-insight">
                    <h4>Educational Context</h4>
                    <p>${doc.educationalValue}</p>
                </div>` : '';
            
            viewer.innerHTML = header + formattedContent + educationalValue;
            
            console.log(`Rendered document: ${doc.title}`);
        } catch (error) {
            console.error("Error rendering document:", error);
            // Fall back to basic content display
            this.renderBasicDocument(documentId);
        }
    },
        
        /**
         * Fallback method for simple document rendering if enhanced fails
         * @param {number} documentId - The ID of the document to render
         */
        renderBasicDocument: function(documentId) {
            try {
                const doc = gameState.documents.find(d => d.id === documentId);
                if (!doc) return;
                
                const viewer = document.getElementById('documentViewer');
                
                viewer.innerHTML = `
                    <div class="document-header">
                        <div class="document-header-icon">${doc.icon}</div>
                        <div class="document-header-info">
                            <h3>${doc.title}</h3>
                            <div class="document-header-type">${doc.type}</div>
                        </div>
                    </div>
                    <div class="document-content">
                        <pre>${doc.content}</pre>
                    </div>
                    <div class="document-description">
                        <p><strong>Educational Value:</strong> ${doc.educationalValue}</p>
                        <p>${documentDescriptions[doc.id]}</p>
                    </div>
                `;
                
                console.log(`Rendered basic document: ${doc.title}`);
            } catch (error) {
                console.error("Error in fallback document rendering:", error);
            }
        },
        
        formatFinancialDocument: function(content) {
            // Parse financial data and create visualizations
            const sections = content.split('\n\n');
            let html = '<div class="document-content">';
            
            // Extract and visualize any numerical data
            const financialMetrics = this.extractFinancialMetrics(content);
            
            sections.forEach(section => {
                if (section.includes(':')) {
                    const [title, text] = section.split(':', 2);
                    html += `<div class="document-section">
                        <h4>${title.trim()}</h4>
                        <p>${text.trim()}</p>
                    </div>`;
                } else if (section.includes('-')) {
                    html += '<div class="document-section"><ul>';
                    section.split('\n').forEach(line => {
                        if (line.trim().startsWith('-')) {
                            html += `<li>${line.substring(1).trim()}</li>`;
                        } else {
                            html += `<h4>${line}</h4>`;
                        }
                    });
                    html += '</ul></div>';
                } else {
                    html += `<p>${section}</p>`;
                }
            });
            
        // Add visualizations for financial metrics if available
        if (financialMetrics.length > 0) {
            html += '<div class="document-section"><h4>Financial Metrics</h4>';
            html += '<div class="port-data-visualization">';
            
            financialMetrics.forEach(metric => {
                const percentage = Math.min(Math.max(metric.value * 100, 0), 100);
                html += `
                    <div class="data-metric">
                        <div class="data-label">${metric.label}</div>
                        <div class="data-bar">
                            <div class="data-fill fill-container" style="width: ${percentage}%"></div>
                        </div>
                        <div class="data-value">${metric.value}</div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        return html;
    },
        
    extractFinancialMetrics: function(content) {
        // Extract metrics like ratios from financial documents
        const metrics = [];
        const ratioRegex = /([A-Za-z\s]+)\s*:\s*([\d\.]+)/g;
        let match;
        
        while ((match = ratioRegex.exec(content)) !== null) {
            const label = match[1].trim();
            const value = parseFloat(match[2]);
            
            if (!isNaN(value) && label.includes('Ratio')) {
                metrics.push({ label, value });
            }
        }
        
        return metrics;
    },
        
    formatReportDocument: function(content) {
        // Format report with sections and visualizations
        const sections = content.split('\n\n');
        let html = '<div class="document-content">';
        
        sections.forEach(section => {
            if (section.startsWith('Key Findings:') || 
                section.startsWith('Recommendations:') ||
                section.startsWith('Regulatory Compliance:') ||
                section.startsWith('Community Impact:') ||
                section.startsWith('Key Operational Challenges:') ||
                section.startsWith('Staffing Assessment:') ||
                section.startsWith('Improvement Recommendations:') ||
                section.startsWith('Financial Impact Analysis:') ||
                section.startsWith('Regional Market Context:')) {
                
                const [title, text] = section.split(':', 2);
                html += `<div class="document-section">
                    <h4>${title.trim()}:</h4>
                    <ul>`;
                
                const points = text.split('\n');
                points.forEach(point => {
                    if (point.trim().match(/^\d+\./)) {
                        const numericPoint = point.trim().split('.');
                        html += `<li><strong>${numericPoint[0]}.</strong> ${numericPoint.slice(1).join('.').trim()}</li>`;
                    } else if (point.trim().startsWith('-')) {
                        html += `<li>${point.substring(1).trim()}</li>`;
                    }
                });
                
                html += `</ul></div>`;
            } else if (section.startsWith('Current Capacity Utilization:')) {
                // Special formatting for port efficiency metrics
                html += '<div class="document-section"><h4>Port Capacity Utilization</h4>';
                html += '<div class="port-performance-chart">';
                html += '<div class="capacity-chart">';
                
                const lines = section.split('\n');
                lines.forEach(line => {
                    if (line.includes('%')) {
                        const parts = line.split(':');
                        if (parts.length >= 2) {
                            const label = parts[0].trim().replace('- ', '');
                            const valueText = parts[1].trim();
                            const value = parseInt(valueText.replace('%', ''));
                            
                            let utilizationClass = 'low-utilization';
                            if (value > 60) {
                                utilizationClass = 'good-utilization';
                            } else if (value > 40) {
                                utilizationClass = 'medium-utilization';
                            }
                            
                            html += `
                                <div class="capacity-item">
                                    <div class="capacity-label">${label}</div>
                                    <div class="capacity-bar-container">
                                        <div class="capacity-bar ${utilizationClass}" style="width: ${value}%">
                                            ${value}%
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    }
                });
                
                html += '</div></div></div>';
            } else {
                // Handle section headers differently from regular text
                const lines = section.split('\n');
                if (lines.length > 1) {
                    const title = lines[0];
                    html += `<div class="document-section">
                        <h4>${title}</h4>
                    `;
                    
                    lines.slice(1).forEach(line => {
                        if (line.includes(':')) {
                            const [label, value] = line.split(':', 2);
                            html += `
                                <div class="report-item">
                                    <strong>${label.trim()}:</strong> ${value.trim()}
                                </div>
                            `;
                        } else {
                            html += `<p>${line}</p>`;
                        }
                    });
                    
                    html += '</div>';
                } else {
                    html += `<p>${section}</p>`;
                }
            }
        });
            
        // Extract and visualize any numeric data from the report
        const percentages = this.extractPercentages(content);
        if (percentages.length > 0) {
            html += '<div class="document-section"><h4>Impact Metrics</h4>';
            html += '<div class="port-data-visualization">';
            
            percentages.forEach(percentage => {
                const value = Math.min(Math.max(percentage.value, 0), 100);
                html += `
                    <div class="data-metric">
                        <div class="data-label">${percentage.label}</div>
                        <div class="data-bar">
                            <div class="data-fill fill-bulk" style="width: ${value}%"></div>
                        </div>
                        <div class="data-value">${percentage.value}%</div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        return html;
    },
        
    extractPercentages: function(content) {
        // Extract percentage values from reports
        const percentages = [];
        const percentRegex = /([A-Za-z\s]+)\s+by\s+approximately\s+([\d\.]+)%/gi;
        let match;
        
        while ((match = percentRegex.exec(content)) !== null) {
            const label = match[1].trim();
            const value = parseFloat(match[2]);
            
            if (!isNaN(value)) {
                percentages.push({ label, value });
            }
        }
        
        return percentages;
    },
        
    formatLegalDocument: function(content) {
        // Format legal documents with article sections and highlighted terms
        const sections = content.split('\n\n');
        let html = '<div class="document-content legal-document">';
        
        sections.forEach(section => {
            if (section.startsWith('Article')) {
                const lines = section.split('\n');
                const articleTitle = lines[0];
                
                html += `<div class="document-section legal-article">
                    <h4>${articleTitle}</h4>
                    <div class="legal-clauses">`;
                
                lines.slice(1).forEach(line => {
                    if (line.match(/^\d+\.\d+/)) {
                        // This is a clause
                        const clauseNum = line.split(' ')[0];
                        const clauseText = line.substring(clauseNum.length).trim();
                        
                        // Highlight important legal terms
                        const highlightedText = clauseText
                            .replace(/\[REDACTED SECTION\]/g, '<span class="redacted-text">[REDACTED SECTION]</span>')
                            .replace(/Default/g, '<span class="legal-term">Default</span>')
                            .replace(/Borrower/g, '<span class="legal-term">Borrower</span>')
                            .replace(/Lender/g, '<span class="legal-term">Lender</span>')
                            .replace(/security interest/g, '<span class="legal-term">security interest</span>');
                        
                        html += `<div class="legal-clause">
                            <span class="clause-number">${clauseNum}</span>
                            <span class="clause-text">${highlightedText}</span>
                        </div>`;
                    }
                });
                
                html += '</div></div>';
            } else {
                html += `<p>${section}</p>`;
            }
        });
        
        html += '</div>';
        return html;
    },
        
    formatTestimonialDocument: function(content) {
        // Format testimonials with avatars and quotes
        const sections = content.split('\n\n');
        let html = '<div class="document-content testimonial-document">';
        
        sections.forEach((section, index) => {
            if (section.includes(':') && !section.startsWith('CONSOLIDATED')) {
                const [source, text] = section.split(':', 2);
                
                // Generate initials for avatar
                let initials = '';
                let name = '';
                let role = '';
                
                if (text.includes('- ')) {
                    // Extract name and role if they exist
                    const attribution = text.split('- ')[1];
                    if (attribution.includes(',')) {
                        [name, role] = attribution.split(',');
                        role = role.trim();
                    } else {
                        name = attribution;
                    }
                    
                    // Generate initials from name
                    initials = name.split(' ').map(n => n[0]).join('');
                } else {
                    initials = source.substring(0, 2);
                    name = 'Anonymous';
                    role = source;
                }
                
                // Avatar colors for different stakeholder types
                const avatarColors = [
                    'var(--primary)', 'var(--secondary)', 
                    'var(--accent)', 'var(--success)'
                ];
                const avatarColor = avatarColors[index % avatarColors.length];
                
                const quoteText = text.includes('- ') ? text.split('- ')[0].trim() : text.trim();
                
                html += `
                    <div class="testimonial">
                        <div class="testimonial-quote">${quoteText}</div>
                        <div class="testimonial-attribution">
                            <div class="testimonial-avatar" style="background-color: ${avatarColor}; color: white;">
                                ${initials}
                            </div>
                            <div class="testimonial-info">
                                <div class="testimonial-name">${name}</div>
                                <div class="testimonial-role">${role}</div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (section.startsWith('CONSOLIDATED')) {
                const [title, text] = section.split(':', 2);
                html += `<div class="document-section">
                    <h4>${title.trim()}:</h4>
                    <ol class="request-list">`;
                
                const requests = text.split('\n');
                requests.forEach(request => {
                    if (request.trim().match(/^\d+\./)) {
                        html += `<li class="request-item">${request.split('.')[1].trim()}</li>`;
                    }
                });
                
                html += `</ol></div>`;
            } else {
                html += `<h4 class="section-title">${section}</h4>`;
            }
        });
        
        html += '</div>';
        return html;
    },
        
    formatEducationalDocument: function(content) {
        // Format educational content with educational styling
        const sections = content.split('\n\n');
        let html = '<div class="document-content educational-document">';
        
        sections.forEach(section => {
            if (section.includes(':') && !section.includes('\n')) {
                const [title, text] = section.split(':', 2);
                html += `<div class="document-section">
                    <h4>${title.trim()}</h4>
                    <p>${text.trim()}</p>
                </div>`;
            } else if (section.includes(':') && section.includes('\n')) {
                const lines = section.split('\n');
                const title = lines[0].split(':')[0];
                
                html += `<div class="document-section">
                    <h4>${title.trim()}</h4>
                `;
                
                lines.slice(1).forEach(line => {
                    if (line.includes(':')) {
                        const [conceptName, conceptDesc] = line.split(':', 2);
                        html += `
                            <div class="educational-concept">
                                <div class="concept-name">${conceptName.trim()}:</div>
                                <div class="concept-description">${conceptDesc.trim()}</div>
                            </div>
                        `;
                    }
                });
                
                html += '</div>';
            } else {
                html += `<p>${section}</p>`;
            }
        });
        
        html += '</div>';
        return html;
    }
};
    
    /**
     * Enhanced Educational Insights Component
     * Creates visual educational content with icons and interactive elements
     */
    const EducationalInsightVisualizer = {
        renderInsight: function(insightId) {
            const insight = gameState.educationalInsights.find(i => i.id === insightId);
            if (!insight) return null;
            
            // Generate category icon
            const categoryIcons = {
                'Finance': '💹',
                'Environmental': '🌿',
                'Diplomacy': '🌐',
                'Operations': '⚙️',
                'Social': '👥'
            };
            
            const icon = categoryIcons[insight.category] || '📊';
            
            // Find related stakeholders
            const relatedStakeholders = [];
            if (insight.stakeholdersInvolved) {
                insight.stakeholdersInvolved.forEach(id => {
                    const stakeholder = gameState.stakeholders.find(s => s.id === id);
                    if (stakeholder) {
                        relatedStakeholders.push(stakeholder);
                    }
                });
            }
            
            // Create HTML for the insight card
            const insightHTML = `
                <div class="insight-card enhanced" data-id="${insight.id}">
                    <div class="insight-card-header">
                        <span class="insight-icon">${icon}</span>
                        <h4 class="insight-card-title">${insight.title}</h4>
                        <span class="insight-category-badge">${insight.category}</span>
                    </div>
                    
                    <div class="insight-card-content">
                        <p>${insight.content}</p>
                        
                        ${relatedStakeholders.length > 0 ? `
                            <div class="insight-stakeholders">
                                <h5>Key Stakeholders</h5>
                                <div class="stakeholder-avatars">
                                    ${relatedStakeholders.map(stakeholder => `
                                        <div class="small-avatar" title="${stakeholder.name}" 
                                             style="background-color: ${
                                               stakeholder.relationship === 'friendly' ? 'var(--success)' : 
                                               stakeholder.relationship === 'hostile' ? 'var(--danger)' : 'var(--primary)'
                                             }10; color: ${
                                               stakeholder.relationship === 'friendly' ? 'var(--success)' : 
                                               stakeholder.relationship === 'hostile' ? 'var(--danger)' : 'var(--primary)'
                                             }">
                                            ${stakeholder.image}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${insight.relatedConcepts ? `
                            <div class="related-concepts">
                                <h5>Related Concepts</h5>
                                <div class="concept-tags">
                                    ${insight.relatedConcepts.map(concept => `
                                        <span class="concept-tag">${concept}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="insight-card-footer">
                        <div class="insight-source">Source: ${insight.source}</div>
                    </div>
                </div>
            `;
            
            return insightHTML;
        },
        
        renderAllInsights: function(containerId, category = null) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            let insights = gameState.unlockedInsights.map(insight => 
                gameState.educationalInsights.find(i => i.id === insight.id || i.id === insight)
            ).filter(insight => insight !== undefined);
            
            // Filter by category if provided
            if (category && category !== 'all') {
                insights = insights.filter(insight => insight.category === category);
            }
            
            if (insights.length === 0) {
                container.innerHTML = `
                    <div class="no-insights-message">
                        <div class="message-icon">📚</div>
                        <p>No educational insights unlocked in this category yet. Complete actions to unlock insights.</p>
                    </div>
                `;
                return;
            }
            
            let insightsHTML = '';
            insights.forEach(insight => {
                insightsHTML += this.renderInsight(insight.id);
            });
            
            container.innerHTML = insightsHTML;
            
            // Add click handler to expand cards
            container.querySelectorAll('.insight-card').forEach(card => {
                card.addEventListener('click', function() {
                    this.classList.toggle('expanded');
                });
            });
        }
    };
    
    /**
     * Enhanced Stakeholder Visualization Component
     * Creates professional avatars and relationship visualizations
     */
    const StakeholderVisualization = {
        renderStakeholderProfile: function(stakeholderId) {
            const stakeholder = gameState.stakeholders.find(s => s.id === stakeholderId);
            if (!stakeholder) return;
            
            const profileContainer = document.getElementById('stakeholderModalBody');
            
            // Generate relationship class
            const relationshipClass = `relationship-${stakeholder.relationship}`;
            
            // Create avatar with appropriate styling based on influence and relationship
            const avatarColors = {
                friendly: 'var(--success)',
                neutral: 'var(--primary)',
                hostile: 'var(--danger)'
            };
            
            const avatarColor = avatarColors[stakeholder.relationship] || 'var(--primary)';
            
            // Generate profile HTML
            const profileHTML = `
                <div class="stakeholder-header">
                    <div class="stakeholder-avatar-large" style="background-color: ${avatarColor}">
                        ${stakeholder.image}
                    </div>
                    <div class="stakeholder-header-info">
                        <h3 class="stakeholder-title">${stakeholder.name}</h3>
                        <div class="stakeholder-influence-large">
                            <span>Influence: ${stakeholder.influence}</span>
                            <span class="relationship-indicator ${relationshipClass}">
                                ${stakeholder.relationship.charAt(0).toUpperCase() + stakeholder.relationship.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="stakeholder-biography">
                    <h4>Background</h4>
                    <p>${stakeholder.bio}</p>
                </div>
                
                <div class="stakeholder-interests">
                    <h4>Key Interests</h4>
                    <ul>
                        ${stakeholder.interests.map(interest => `<li>${interest}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="stakeholder-strategy">
                    <h4>Educational Context</h4>
                    <p>${stakeholder.educationalContext}</p>
                </div>
            `;
            
            profileContainer.innerHTML = profileHTML;
        },
        
        generateNetworkChart: function(stakeholderId) {
            // Create a visualization of how this stakeholder relates to others
            const stakeholder = gameState.stakeholders.find(s => s.id === stakeholderId);
            const allStakeholders = gameState.stakeholders;
            
            let chartHTML = `<div class="network-chart">`;
            
            // Central node for the selected stakeholder
            chartHTML += `
                <div class="network-node central-node" style="background-color: ${
                    stakeholder.relationship === 'friendly' ? 'var(--success)' : 
                    stakeholder.relationship === 'hostile' ? 'var(--danger)' : 'var(--primary)'
                }">
                    <span>${stakeholder.image}</span>
                </div>
            `;
            
            // Create connections to other stakeholders based on influence
            allStakeholders.forEach(otherStakeholder => {
                if (otherStakeholder.id !== stakeholderId) {
                    const distance = this.calculateStakeholderDistance(stakeholder, otherStakeholder);
                    const angle = (otherStakeholder.id * 60) % 360;
                    const influenceWidth = otherStakeholder.influence === 'High' ? 3 : 
                                        otherStakeholder.influence === 'Medium' ? 2 : 1;
                    
                    chartHTML += `
                        <div class="network-connection" 
                             style="transform: rotate(${angle}deg); width: ${distance}px; height: ${influenceWidth}px;
                                    background-color: ${
                                    otherStakeholder.relationship === 'friendly' ? 'var(--success)' : 
                                    otherStakeholder.relationship === 'hostile' ? 'var(--danger)' : 'var(--primary)'
                                    }">
                        </div>
                        <div class="network-node connected-node" 
                             style="left: ${Math.cos(angle * Math.PI / 180) * distance}px;
                                    top: ${Math.sin(angle * Math.PI / 180) * distance}px;
                                    background-color: ${
                                    otherStakeholder.relationship === 'friendly' ? 'var(--success)' : 
                                    otherStakeholder.relationship === 'hostile' ? 'var(--danger)' : 'var(--primary)'
                                    }">
                            <span>${otherStakeholder.image}</span>
                        </div>
                    `;
                }
            });
            
            chartHTML += `</div>`;
            return chartHTML;
        },
        
        calculateStakeholderDistance: function(stakeholder1, stakeholder2) {
            // Determine visual distance based on influence and relationship
            const baseDistance = 80;
            const influenceMultiplier = 
                stakeholder2.influence === 'High' ? 0.8 : 
                stakeholder2.influence === 'Medium' ? 1.2 : 1.5;
            
            const relationshipMultiplier = 
                stakeholder2.relationship === 'friendly' ? 0.8 :
                stakeholder2.relationship === 'hostile' ? 1.5 : 1.2;
            
            return baseDistance * influenceMultiplier * relationshipMultiplier;
        }
    };

    // ===== TAB NAVIGATION =====
    /**
     * Manages tab navigation in the game UI
     */
    const TabNavigation = {
        /**
         * Currently active tab
         * @type {string}
         */
        activeTab: 'overview',
        
        /**
         * Switch to a different tab
         * @param {string} tabId - The ID of the tab to switch to
         */
        switchTab: function(tabId) {
            // Update active tab
            this.activeTab = tabId;
            
            // Update tab buttons
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
            
            // Load tab content
            this.loadTabContent(tabId);
            
            console.log(`Switched to tab: ${tabId}`);
        },
        
        /**
         * Load content for a tab
         * @param {string} tabId - The ID of the tab to load content for
         */
        loadTabContent: function(tabId) {
            const contentContainer = document.querySelector('.game-panel .panel-content');
            
            // Clear current content
            contentContainer.innerHTML = '';
            
            // Load appropriate content based on tab
            switch (tabId) {
                case 'overview':
                    this.loadOverviewTab(contentContainer);
                    break;
                case 'activity':
                    this.loadActivityTab(contentContainer);
                    break;
                case 'documents':
                    this.loadDocumentsTab(contentContainer);
                    break;
                case 'insights':
                    this.loadInsightsTab(contentContainer);
                    break;
                case 'updates':
                    this.loadUpdatesTab(contentContainer);
                    // Clear updates badge
                    document.querySelector('.updates-badge').style.display = 'none';
                    break;
                default:
                    contentContainer.innerHTML = '<p>Tab content not implemented</p>';
            }
        },
        
        /**
         * Refresh the current tab content
         */
        refreshCurrentTab: function() {
            this.loadTabContent(this.activeTab);
        },
        
        /**
         * Load content for the overview tab
         * @param {HTMLElement} container - The container to load content into
         */
        loadOverviewTab: function(container) {
            // Create narrative section
            let html = '<div class="narrative-section">';
            
            html += `
                <div class="narrative-entry">
                    <div class="narrative-icon">📊</div>
                    <div class="narrative-content">
                        <h3>Current Situation</h3>
                        <p>Azuria's port facility is operating at only 40% capacity, creating a fiscal crisis with loan repayments due. The port was financed through a commercial loan from China, but revenue projections have fallen short, and environmental concerns from local fishing communities are mounting.</p>
                    </div>
                </div>
                
                <div class="narrative-entry">
                    <div class="narrative-icon">🎯</div>
                    <div class="narrative-content">
                        <h3>Your Task</h3>
                        <p>As Finance Ministry Official, you must establish a sustainable debt repayment plan, balance environmental concerns with fiscal stability, maintain diplomatic relations with stakeholders, and preserve political influence above critical thresholds.</p>
                    </div>
                </div>
            `;
            
            html += '</div>';
            
            // Create action cards
            html += ActionManager.createActionCards();
            
            // Add educational insights section if any have been unlocked
            if (gameState.unlockedInsights.length > 0) {
                html += '<div class="educational-insights">';
                html += '<h3>Educational Insights</h3>';
                
                // Add the first up to 2 insights
                const insightsToShow = gameState.unlockedInsights.slice(0, 2);
                insightsToShow.forEach(insight => {
                    html += `
                        <div class="insight">
                            <div class="insight-title">${insight.title}</div>
                            <p>${insight.content}</p>
                        </div>
                    `;
                });
                
                // Add "View More" link if there are more insights
                if (gameState.unlockedInsights.length > 2) {
                    html += `
                        <div class="more-insights">
                            <button class="btn btn-outline btn-small view-all-insights">View All ${gameState.unlockedInsights.length} Insights</button>
                        </div>
                    `;
                }
                
                html += '</div>';
            }
            
            // Set container content
            container.innerHTML = html;
            
            // Bind events
            ActionManager.bindActionCardEvents();
            
            // Bind "View All Insights" button
            const viewAllButton = container.querySelector('.view-all-insights');
            if (viewAllButton) {
                viewAllButton.addEventListener('click', () => {
                    TabNavigation.switchTab('insights');
                });
            }
        },
        
        /**
         * Load content for the activity tab
         * @param {HTMLElement} container - The container to load content into
         */
        loadActivityTab: function(container) {
            let html = '<div class="activity-log">';
            
            // Sort actions by day, newest first
            const sortedActions = [...gameState.actionsHistory].sort((a, b) => b.day - a.day);
            
            if (sortedActions.length === 0) {
                html += `
                    <div class="log-entry">
                        <div class="log-header">
                            <div class="log-title">No Actions Taken Yet</div>
                            <div class="log-day">Day ${gameState.currentDay}</div>
                        </div>
                        <div class="log-description">You have not taken any actions so far. Your objectives require strategic decisions to address the port's financial, environmental, and diplomatic challenges.</div>
                    </div>
                `;
            } else {
                // Add each action to the log
                sortedActions.forEach(action => {
                    html += `
                        <div class="log-entry">
                            <div class="log-header">
                                <div class="log-title">${action.title}</div>
                                <div class="log-day">Day ${action.day}</div>
                            </div>
                            <div class="log-description">${action.description}</div>
                            <div class="log-impacts">
                    `;
                    
                    // Add impact badges
                    if (action.impacts) {
                        for (const [metric, value] of Object.entries(action.impacts)) {
                            if (value === 0) continue;
                            
                            const impactClass = value > 0 ? 'impact-positive' : 'impact-negative';
                            const impactSign = value > 0 ? '+' : '';
                            
                            html += `
                                <span class="log-impact ${impactClass}">${metric}: ${impactSign}${value}</span>
                            `;
                        }
                    }
                    
                    html += `
                            </div>
                        </div>
                    `;
                });
            }
            
            // Add stakeholder engagements to the log
            gameState.stakeholderEngagements.forEach(engagement => {
                const stakeholder = gameState.stakeholders.find(s => s.id === engagement.stakeholderId);
                
                if (stakeholder) {
                    html += `
                        <div class="log-entry">
                            <div class="log-header">
                                <div class="log-title">Engaged with ${stakeholder.name}: ${engagement.title}</div>
                                <div class="log-day">Day ${engagement.day}</div>
                            </div>
                            <div class="log-description">${engagement.outcome}</div>
                            <div class="log-impacts">
                    `;
                    
                    // Add relationship impact
                    const relationshipClass = 
                        engagement.impacts.relationship === 'friendly' ? 'impact-positive' : 
                        engagement.impacts.relationship === 'hostile' ? 'impact-negative' : 
                        'impact-neutral';
                    
                    html += `
                        <span class="log-impact ${relationshipClass}">Relationship: ${engagement.impacts.relationship}</span>
                    `;
                    
                    // Add metric impacts
                    if (engagement.impacts.metrics) {
                        for (const [metric, value] of Object.entries(engagement.impacts.metrics)) {
                            if (value === 0) continue;
                            
                            const impactClass = value > 0 ? 'impact-positive' : 'impact-negative';
                            const impactSign = value > 0 ? '+' : '';
                            
                            html += `
                                <span class="log-impact ${impactClass}">${metric}: ${impactSign}${value}</span>
                            `;
                        }
                    }
                    
                    html += `
                            </div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
            
            // Set container content
            container.innerHTML = html;
        },
        
        /**
         * Load content for the documents tab
         * @param {HTMLElement} container - The container to load content into
         */
        loadDocumentsTab: function(container) {
            let html = '<div class="documents-interface">';
            
            // Documents sidebar
            html += '<div class="documents-sidebar">';
            html += '<h3>Available Documents</h3>';
            html += '<div class="documents-list">';
            
            gameState.documents.forEach(doc => {
                // Check if document is viewed
                const isViewed = gameState.documentHistory.includes(doc.id);
                const isActive = isViewed && gameState.documentHistory[gameState.documentHistory.length - 1] === doc.id;
                
                html += `
                    <div class="document-item ${isActive ? 'active' : ''}" data-document-id="${doc.id}">
                        <div class="document-icon">${doc.icon}</div>
                        <div class="document-info">
                            <div class="document-title">${doc.title}</div>
                            <div class="document-type">${doc.type}</div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            html += '</div>';
            
            // Document viewer - Empty container for the enhanced viewer to render into
            html += '<div class="document-viewer" id="documentViewer">';
            
            // Check if a document was previously viewed
            if (gameState.documentHistory.length === 0) {
                // Show placeholder
                html += `
                    <div class="document-viewer-placeholder">
                        <div class="placeholder-icon">📄</div>
                        <div class="placeholder-text">Select a document to view its contents</div>
                    </div>
                `;
            }
            
            html += '</div>';
            html += '</div>';
            
            // Set container content
            container.innerHTML = html;
            
            // If a document is selected, render it with the enhanced viewer
            if (gameState.documentHistory.length > 0) {
                const lastDocId = gameState.documentHistory[gameState.documentHistory.length - 1];
                DocumentViewerEnhanced.renderDocument(lastDocId);
            }
            
            // Bind document click events
            const documentItems = container.querySelectorAll('.document-item');
            documentItems.forEach(item => {
                item.addEventListener('click', function() {
                    const docId = parseInt(this.getAttribute('data-document-id'));
                    
                    // Add to document history if not already present
                    if (!gameState.documentHistory.includes(docId)) {
                        gameState.documentHistory.push(docId);
                    } else {
                        // Move to end of history to mark as most recently viewed
                        gameState.documentHistory = gameState.documentHistory.filter(id => id !== docId);
                        gameState.documentHistory.push(docId);
                    }
                    
                    // Use the enhanced document viewer to display the document
                    DocumentViewerEnhanced.renderDocument(docId);
                    
                    // Update active status
                    documentItems.forEach(d => d.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        },
        
        /**
         * Load content for the insights tab
         * @param {HTMLElement} container - The container to load content into
         */
        loadInsightsTab: function(container) {
            let html = '<div class="insights-section">';
            
            // Add categories filter
            const categories = [...new Set(gameState.educationalInsights.map(insight => insight.category))];
            
            html += '<div class="insight-categories">';
            html += '<span class="insight-category active" data-category="all">All</span>';
            
            categories.forEach(category => {
                html += `<span class="insight-category" data-category="${category}">${category}</span>`;
            });
            
            html += '</div>';
            
            // Add container for enhanced insights
            html += '<div class="insights-container" id="insightsContainer">';
            
            // Content will be added by the enhanced component
            
            html += '</div>';
            html += '</div>';
            
            // Set container content
            container.innerHTML = html;
            
            // Render insights with enhanced component
            EducationalInsightVisualizer.renderAllInsights('insightsContainer');
            
            // Bind category filter events
            const categories$ = container.querySelectorAll('.insight-category');
            categories$.forEach(category => {
                category.addEventListener('click', function() {
                    // Update active category
                    categories$.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    
                    const selectedCategory = this.getAttribute('data-category');
                    
                    // Use the enhanced component to filter insights
                    EducationalInsightVisualizer.renderAllInsights('insightsContainer', selectedCategory);
                });
            });
        },
        
        /**
         * Load content for the updates tab
         * @param {HTMLElement} container - The container to load content into
         */
        loadUpdatesTab: function(container) {
            let html = '<div class="updates-container">';
            
            if (gameState.updates.length === 0) {
                html += `
                    <div class="update-item">
                        <div class="update-header">
                            <div class="update-title">No Updates Yet</div>
                            <div class="update-day">Day ${gameState.currentDay}</div>
                        </div>
                        <div class="update-content">
                            <p>There are no news updates yet. Take actions to generate new developments in your mission.</p>
                        </div>
                    </div>
                `;
            } else {
                // Sort updates by day, newest first
                const sortedUpdates = [...gameState.updates].sort((a, b) => b.day - a.day);
                
                // Add each update
                sortedUpdates.forEach((update, index) => {
                    html += `
                        <div class="update-item" data-update-id="${index}">
                            <div class="update-header">
                                <div class="update-title">${update.title}</div>
                                <div class="update-day">Day ${update.day}</div>
                            </div>
                            <div class="update-content">
                                <p>${update.content}</p>
                            </div>
                            <div class="update-details">
                                <div class="update-detail-section">
                                    <p><strong>Related to:</strong> ${update.relatedAction}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += '</div>';
            
            // Set container content
            container.innerHTML = html;
            
            // Bind update item click events
            const updateItems = container.querySelectorAll('.update-item');
            updateItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.classList.toggle('expanded');
                });
            });
        }
    };
    
    // ===== MISSION SELECTOR =====
    /**
     * Manages mission selection and starting
     */
    const MissionSelectorManager = {
        /**
         * Selected mission ID
         * @type {number}
         */
        selectedMission: 1,
        
        /**
         * Open the mission selection screen
         */
        openMissionSelection: function() {
            // Hide splash screen
            SplashScreen.hide();
            
            // Show mission drawer
            document.getElementById('missionDrawer').classList.add('active');
            
            // Select first mission by default
            this.selectMission(1);
        },
        
        /**
         * Select a mission
         * @param {number} missionId - The ID of the mission to select
         */
        selectMission: function(missionId) {
            // Update selected mission
            this.selectedMission = missionId;
            
            // Update UI
            document.querySelectorAll('.mission-item').forEach(item => {
                item.classList.remove('active');
            });
            
            document.querySelector(`.mission-item[data-mission="${missionId}"]`).classList.add('active');
            
            // Update mission details (in a real implementation, this would load different content)
            console.log(`Selected mission: ${missionId}`);
        },
        
        /**
         * Start the selected mission
         */
        startMission: function() {
            // Hide mission drawer
            document.getElementById('missionDrawer').classList.remove('active');
            
            // Show game UI
            GameUI.showGameUI();
            
            // Initialize game elements
            GameUI.updateResourcesDisplay();
            MetricsManager.updateAllMetrics();
            StakeholderManager.updateStakeholdersDisplay();
            ObjectiveManager.updateAllObjectives();
            
            // Show overview tab by default
            TabNavigation.switchTab('overview');
            
            // Set up NetworkVisualizer
            NetworkVisualizer.initNetworkVisualization();
            
            console.log(`Starting mission: ${MissionSelectorManager.selectedMission}`);
        }
    };

    // ===== GAME UI =====
    /**
     * Manages the main game UI
     */
    const GameUI = {
        /**
         * Show the main game UI
         */
        showGameUI: function() {
            // Show game header
            document.getElementById('gameHeader').style.display = 'flex';
            
            // Show main container
            document.getElementById('mainContainer').style.display = 'grid';
            
            // Animate panels
            const panels = document.querySelectorAll('.panel');
            panels.forEach((panel, index) => {
                setTimeout(() => {
                    panel.style.opacity = '1';
                    panel.style.transform = 'translateY(0)';
                }, index * 200);
            });
            
            // Update timer display
            this.updateTimerDisplay();
            
            console.log("Game UI displayed");
        },
        
        /**
         * Hide the game UI
         */
        hideGameUI: function() {
            // Hide game header
            document.getElementById('gameHeader').style.display = 'none';
            
            // Hide main container
            document.getElementById('mainContainer').style.display = 'none';
            
            // Reset panel animations
            const panels = document.querySelectorAll('.panel');
            panels.forEach(panel => {
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(20px)';
            });
            
            console.log("Game UI hidden");
        },
        
        /**
         * Update the timer display
         */
        updateTimerDisplay: function() {
            const timerDisplay = document.getElementById('timerDisplay');
            timerDisplay.textContent = `${gameState.resources.timeRemaining} Days Remaining`;
            
            // Update time resource display
            document.getElementById('timeResource').querySelector('.resource-value').textContent = 
                `${gameState.resources.timeRemaining} days remaining`;
            
            console.log(`Timer updated: ${gameState.resources.timeRemaining} days remaining`);
        },
        
        /**
         * Update all resource displays
         */
        updateResourcesDisplay: function() {
            // Update budget display
            document.getElementById('budgetResource').querySelector('.resource-value').textContent = 
                `$${gameState.resources.budget.toLocaleString()}`;
            
            // Update influence display
            document.getElementById('influenceResource').querySelector('.resource-value').textContent = 
                `${gameState.resources.influence} points`;
            
            // Update staff display
            document.getElementById('staffResource').querySelector('.resource-value').textContent = 
                `${gameState.resources.staff} team members`;
            
            // Update timer display
            this.updateTimerDisplay();
            
            console.log("Resources display updated");
        }
    };

    // ===== ACTION MANAGER =====
    /**
     * Manages game actions and their execution
     */
    const ActionManager = {
        /**
         * Show the action loading overlay
         * @param {number} actionId - The ID of the action being executed
         * @param {string} [customText] - Optional custom loading text
         * @returns {Promise} - Resolves when animation completes
         */
        showActionLoading: function(actionId, customText) {
            return new Promise(resolve => {
                const overlay = document.getElementById('actionLoadingOverlay');
                const loadingText = overlay.querySelector('.action-loading-text');
                
                // Set custom text if provided
                if (customText) {
                    loadingText.textContent = customText;
                } else {
                    // Find action name from ID
                    const action = gameState.actions.find(a => a.id === actionId);
                    loadingText.textContent = action ? 
                        `Executing: ${action.title}...` : 
                        'Processing action...';
                }
                
                // Show overlay
                overlay.style.display = 'flex';
                
                // Fade in
                setTimeout(() => {
                    overlay.style.opacity = '1';
                    
                    // Hold for a moment then hide
                    setTimeout(() => {
                        // Fade out
                        overlay.style.opacity = '0';
                        
                        // Hide completely after animation
                        setTimeout(() => {
                            overlay.style.display = 'none';
                            resolve();
                        }, 500);
                    }, 1500);
                }, 10);
            });
        },
        
        /**
         * Create action cards for the overview panel
         * @returns {string} - HTML string of action cards
         */
        createActionCards: function() {
            let html = '<div class="action-cards">';
            
            // Loop through available actions
            for (const action of gameState.actions) {
                // Skip actions that have already been taken
                if (gameState.actionsHistory.some(history => history.id === action.id)) {
                    continue;
                }
                
                // Check if player has enough resources
                const canAfford = gameState.resources.budget >= action.cost;
                const hasTime = gameState.resources.timeRemaining >= action.timeCost;
                const hasStaff = gameState.resources.staff >= action.staffCost;
                const isDisabled = !canAfford || !hasTime || !hasStaff;
                
                // Create card
                html += `
                    <div class="action-card ${isDisabled ? 'disabled-action' : ''}" data-action-id="${action.id}">
                        <div class="action-header">
                            <h4>${action.title}</h4>
                            <div class="action-cost ${!canAfford ? 'cost-insufficient' : ''}">
                                <div>$${action.cost.toLocaleString()}</div>
                                <div>${action.timeCost} day${action.timeCost !== 1 ? 's' : ''}</div>
                                <div>${action.staffCost} staff</div>
                            </div>
                        </div>
                        <div class="action-description">${action.description}</div>
                        <div class="educational-value-tag">Learning: ${action.educationalValue}</div>
                    </div>
                `;
            }
            
            html += '</div>';
            
            return html;
        },
        
        /**
         * Bind event listeners to action cards
         */
        bindActionCardEvents: function() {
            document.querySelectorAll('.action-card:not(.disabled-action)').forEach(card => {
                card.addEventListener('click', function() {
                    const actionId = parseInt(this.getAttribute('data-action-id'));
                    GameController.executeAction(actionId);
                });
            });
        }
    };

    // ===== OBJECTIVE MANAGER =====
    /**
     * Manages mission objectives and progress
     */
    const ObjectiveManager = {
        /**
         * Update progress for an objective
         * @param {number} objectiveId - The ID of the objective to update
         * @param {number} progress - The progress to add (positive) or subtract (negative)
         * @param {string} reason - The reason for the progress change
         */
        updateProgress: function(objectiveId, progress, reason) {
            // Find the objective element
            const objectiveElement = document.querySelector(`.objective-item[data-objective-id="${objectiveId}"]`);
            if (!objectiveElement) {
                console.error(`Objective element with ID ${objectiveId} not found`);
                return;
            }
            
            // Get current progress
            const progressBar = objectiveElement.querySelector('.progress');
            const currentProgress = parseInt(progressBar.style.height) || 0;
            
            // Calculate new progress (capped at 0-100%)
            let newProgress = Math.max(0, Math.min(100, currentProgress + progress));
            
            // Update progress bar
            progressBar.style.height = `${newProgress}%`;
            
            // Log the progress change
            console.log(`Objective ${objectiveId} progress ${currentProgress}% -> ${newProgress}% (${reason})`);
            
            // Check if objective is now complete
            if (newProgress >= 100 && !gameState.completedObjectives.includes(objectiveId)) {
                // Mark as complete
                gameState.completedObjectives.push(objectiveId);
                
                // Add completion effect
                objectiveElement.classList.add('completed');
                
                // Show notification
                NotificationSystem.showNotification({
                    type: 'success',
                    title: 'Objective Completed',
                    message: `You've completed the objective: ${objectiveElement.querySelector('.objective-text').textContent}`
                });
                
                console.log(`Objective ${objectiveId} completed`);
            }
            
            // Update overall progress
            this.updateOverallProgress();
        },
        
        /**
         * Update the overall mission progress
         */
        updateOverallProgress: function() {
            // Calculate overall progress (percentage of completed objectives)
            const totalObjectives = 4; // Hardcoded for simplicity
            const completedCount = gameState.completedObjectives.length;
            const overallProgress = Math.round((completedCount / totalObjectives) * 100);
            
            // Update progress bar
            document.getElementById('overallProgressFill').style.width = `${overallProgress}%`;
            document.getElementById('overallProgressLabel').textContent = `${overallProgress}%`;
            
            console.log(`Overall mission progress: ${overallProgress}%`);
        },
        
        /**
         * Update all objective progress bars
         */
        updateAllObjectives: function() {
            // Calculate individual objective progress
            // In a real implementation, this would be calculated dynamically
            // For now, we'll just use a placeholder with manual values
            
            // Objective 1: Debt repayment plan
            const progress1 = gameState.actionsHistory.reduce((sum, action) => {
                if (action.objectiveProgress) {
                    const obj = action.objectiveProgress.find(o => o.id === 1);
                    return sum + (obj ? obj.progress : 0);
                }
                return sum;
            }, 0);
            
            this.updateObjectiveDisplay(1, progress1);
            
            // Objective 2: Environmental concerns
            const progress2 = gameState.actionsHistory.reduce((sum, action) => {
                if (action.objectiveProgress) {
                    const obj = action.objectiveProgress.find(o => o.id === 2);
                    return sum + (obj ? obj.progress : 0);
                }
                return sum;
            }, 0);
            
            this.updateObjectiveDisplay(2, progress2);
            
            // Objective 3: Diplomatic relations
            const progress3 = gameState.actionsHistory.reduce((sum, action) => {
                if (action.objectiveProgress) {
                    const obj = action.objectiveProgress.find(o => o.id === 3);
                    return sum + (obj ? obj.progress : 0);
                }
                return sum;
            }, 0);
            
            this.updateObjectiveDisplay(3, progress3);
            
            // Objective 4: Political influence
            const progress4 = gameState.actionsHistory.reduce((sum, action) => {
                if (action.objectiveProgress) {
                    const obj = action.objectiveProgress.find(o => o.id === 4);
                    return sum + (obj ? obj.progress : 0);
                }
                return sum;
            }, 0);
            
            this.updateObjectiveDisplay(4, progress4);
            
            // Update overall progress
            this.updateOverallProgress();
        },
        
        /**
         * Update the display for a single objective
         * @param {number} objectiveId - The ID of the objective to update
         * @param {number} progress - The new progress value (0-100)
         */
        updateObjectiveDisplay: function(objectiveId, progress) {
            // Find the objective element
            const objectiveElement = document.querySelector(`.objective-item[data-objective-id="${objectiveId}"]`);
            if (!objectiveElement) {
                console.error(`Objective element with ID ${objectiveId} not found`);
                return;
            }
            
            // Cap progress at 0-100%
            const cappedProgress = Math.max(0, Math.min(100, progress));
            
            // Update progress bar
            const progressBar = objectiveElement.querySelector('.progress');
            progressBar.style.height = `${cappedProgress}%`;
            
            // Check if objective is complete
            if (cappedProgress >= 100 && !gameState.completedObjectives.includes(objectiveId)) {
                gameState.completedObjectives.push(objectiveId);
                objectiveElement.classList.add('completed');
            }
        },
        
        /**
         * Check if all objectives are complete
         * @returns {boolean} - True if all objectives are complete
         */
        checkAllObjectivesComplete: function() {
            // Count how many objectives we expect
            const totalObjectives = 4; // Hardcoded for simplicity
            
            return gameState.completedObjectives.length >= totalObjectives;
        }
    };

// ===== METRICS MANAGER =====
    /**
     * Manages game metrics (fiscal, environmental, political, international)
     */
    const MetricsManager = {
        /**
         * Update a single metric display
         * @param {string} metric - The metric to update (fiscal, environmental, political, international)
         */
        updateMetricDisplay: function(metric) {
            // Find the metric element
            const metricElement = document.getElementById(`${metric}Metric`);
            if (!metricElement) {
                console.error(`Metric element for ${metric} not found`);
                return;
            }
            
            // Get the current value
            const value = gameState.metrics[metric];
            
            // Update the display
            const fillElement = metricElement.querySelector(`.fill-${metric}`);
            const valueElement = metricElement.querySelector('.metric-value');
            
            if (fillElement) {
                fillElement.style.width = `${value}%`;
            }
            
            if (valueElement) {
                valueElement.textContent = `${value}%`;
                
                // Update value class based on metric level
                valueElement.className = 'metric-value';
                if (value <= 30) {
                    valueElement.classList.add('value-low');
                } else if (value <= 60) {
                    valueElement.classList.add('value-medium');
                } else {
                    valueElement.classList.add('value-high');
                }
            }
            
            console.log(`Metric ${metric} updated to ${value}%`);
        },
        
        /**
         * Update all metric displays
         */
        updateAllMetrics: function() {
            this.updateMetricDisplay('fiscal');
            this.updateMetricDisplay('environmental');
            this.updateMetricDisplay('political');
            this.updateMetricDisplay('international');
        }
    };

    // ===== STAKEHOLDER MANAGER =====
    /**
     * Manages stakeholders and their relationships
     */
    const StakeholderManager = {
        /**
         * Update a stakeholder's relationship
         * @param {number} stakeholderId - The ID of the stakeholder
         * @param {string} newRelationship - The new relationship status (friendly, neutral, hostile)
         * @param {string} reason - The reason for the change
         */
        updateRelationship: function(stakeholderId, newRelationship, reason) {
            // Find the stakeholder
            const stakeholder = gameState.stakeholders.find(s => s.id === stakeholderId);
            if (!stakeholder) {
                console.error(`Stakeholder with ID ${stakeholderId} not found`);
                return;
            }
            
            // Skip if relationship hasn't changed
            if (stakeholder.relationship === newRelationship) {
                console.log(`Stakeholder ${stakeholderId} relationship unchanged: ${newRelationship}`);
                return;
            }
            
            // Log the previous relationship
            const previousRelationship = stakeholder.relationship;
            
            // Update relationship
            stakeholder.relationship = newRelationship;
            
            // Show notification
            NotificationSystem.showNotification({
                type: newRelationship === 'friendly' ? 'success' : (newRelationship === 'hostile' ? 'error' : 'info'),
                title: `Relationship Changed: ${stakeholder.name}`,
                message: `${stakeholder.name}'s relationship with you changed from ${previousRelationship} to ${newRelationship}. Reason: ${reason}`
            });
            
            // Update stakeholder display
            this.updateStakeholdersDisplay();
            
            console.log(`Stakeholder ${stakeholderId} relationship changed: ${previousRelationship} -> ${newRelationship}`);
        },
        
        /**
         * Update the stakeholders display
         */
        updateStakeholdersDisplay: function() {
            const container = document.querySelector('.stakeholders-list');
            
            if (!container) {
                console.error('Stakeholders list container not found');
                return;
            }
            
            // Clear current content
            container.innerHTML = '';
            
            // Add each stakeholder
            gameState.stakeholders.forEach(stakeholder => {
                const relationshipClass = 
                    stakeholder.relationship === 'friendly' ? 'relationship-friendly' : 
                    stakeholder.relationship === 'hostile' ? 'relationship-hostile' : 
                    'relationship-neutral';
                
                const item = document.createElement('div');
                item.className = 'stakeholder-item';
                item.dataset.stakeholderId = stakeholder.id;
                
                item.innerHTML = `
                    <div class="stakeholder-avatar">${stakeholder.image}</div>
                    <div class="stakeholder-info">
                        <div class="stakeholder-name">${stakeholder.name}</div>
                        <div class="stakeholder-relationship ${relationshipClass}">
                            ${stakeholder.relationship.charAt(0).toUpperCase() + stakeholder.relationship.slice(1)}
                        </div>
                        <div class="stakeholder-influence">${stakeholder.influence} Influence</div>
                    </div>
                `;
                
                container.appendChild(item);
                
                // Add click event to show stakeholder details
                item.addEventListener('click', () => {
                    this.showStakeholderDetails(stakeholder.id);
                });
            });
            
            console.log('Stakeholders display updated');
        },
        
        /**
         * Show details for a stakeholder
         * @param {number} stakeholderId - The ID of the stakeholder
         */
        showStakeholderDetails: function(stakeholderId) {
            // Find the stakeholder
            const stakeholder = gameState.stakeholders.find(s => s.id === stakeholderId);
            if (!stakeholder) {
                console.error(`Stakeholder with ID ${stakeholderId} not found`);
                return;
            }
            
            // Set modal title
            document.getElementById('stakeholderModalTitle').textContent = stakeholder.name;
            
            // Use the enhanced stakeholder visualization
            StakeholderVisualization.renderStakeholderProfile(stakeholderId);
            
            // Set up engagement button
            document.getElementById('engageStakeholderBtn').setAttribute('data-stakeholder-id', stakeholderId);
            
            // Open the modal
            ModalManager.openModal('stakeholderModal');
            
            console.log(`Showing details for stakeholder ${stakeholderId}`);
        },
        
        /**
         * Show engagement options for a stakeholder
         */
        showEngagementOptions: function() {
                const stakeholderId = parseInt(document.getElementById('engageStakeholderBtn').getAttribute('data-stakeholder-id'));
                
                // Find the stakeholder
                const stakeholder = gameState.stakeholders.find(s => s.id === stakeholderId);
                if (!stakeholder) {
                    console.error(`Stakeholder with ID ${stakeholderId} not found`);
                    return;
                }
                
                // Set modal title
                document.getElementById('engagementModalTitle').textContent = `Engage with ${stakeholder.name}`;
                
                // Get engagement options
                const engagementOptions = gameState.stakeholderEngagementOptions[stakeholderId];
                if (!engagementOptions) {
                    console.error(`No engagement options for stakeholder ${stakeholderId}`);
                    return;
                }
                
                // Set modal content
                const modalBody = document.getElementById('engagementModalBody');
                
                let html = '<div class="engagement-options">';
                
                engagementOptions.forEach(option => {
                    // Check if player has enough resources
                    const canAfford = gameState.resources.budget >= option.cost;
                    const hasInfluence = gameState.resources.influence >= option.influenceCost;
                    const isDisabled = !canAfford || !hasInfluence;
                    
                    html += `
                        <div class="engagement-option ${isDisabled ? 'disabled' : ''}" data-option-id="${option.id}">
                            <div class="engagement-title">
                                ${option.title}
                                <span class="engagement-cost">
                                    ${option.cost > 0 ? `$${option.cost.toLocaleString()}` : ''}
                                    ${option.influenceCost > 0 ? `${option.influenceCost} influence` : ''}
                                </span>
                            </div>
                            <div class="engagement-description">${option.description}</div>
                            <div class="engagement-outcome">Expected outcome: ${option.outcome}</div>
                        </div>
                    `;
                });
                
                html += '</div>';
                
                modalBody.innerHTML = html;
                
                // Clear any existing execution button first to prevent duplicates
                const engagementModalFooter = document.getElementById('stakeholderEngagementModal').querySelector('.modal-footer');
                const existingExecuteBtn = engagementModalFooter.querySelector('.execute-engagement-btn');
                if (existingExecuteBtn) {
                    existingExecuteBtn.remove();
                }
                
                // Add click events to options
                const options = modalBody.querySelectorAll('.engagement-option:not(.disabled)');
                options.forEach(option => {
                    option.addEventListener('click', function() {
                        // Deselect all options
                        options.forEach(o => o.classList.remove('selected'));
                        
                        // Select this option
                        this.classList.add('selected');
                        
                        // Remove any existing execution button
                        const existingBtn = engagementModalFooter.querySelector('.execute-engagement-btn');
                        if (existingBtn) {
                            existingBtn.remove();
                        }
                        
                        // Add execute button
                        const executeBtn = document.createElement('button');
                        executeBtn.className = 'btn btn-primary execute-engagement-btn';
                        executeBtn.textContent = 'Execute Engagement';
                        executeBtn.addEventListener('click', () => {
                            const selectedOption = document.querySelector('#engagementModalBody .engagement-option.selected');
                            if (selectedOption) {
                                const optionId = parseInt(selectedOption.getAttribute('data-option-id'));
                                GameController.executeStakeholderEngagement(stakeholderId, optionId);
                            } else {
                                console.error('No engagement option selected');
                                NotificationSystem.showNotification({
                                    type: 'error',
                                    title: 'Selection Error',
                                    message: 'Please select an engagement option first.'
                                });
                            }
                        });
                        
                        engagementModalFooter.appendChild(executeBtn);
                    });
                });
                
                // Close the stakeholder details modal
                ModalManager.closeModal('stakeholderModal');
                
                // Open the engagement modal
                ModalManager.openModal('stakeholderEngagementModal');
            }
    };

    // ===== MODAL MANAGER =====
    /**
     * Manages all modal dialogs in the game
     */
    const ModalManager = {
        /**
         * Currently active modal
         * @type {string|null}
         */
        activeModal: null,
        
        /**
         * Open a modal
         * @param {string} modalId - The ID of the modal to open
         */
        openModal: function(modalId) {
            // Check if we need to close an already open modal
            if (this.activeModal && this.activeModal !== modalId) {
                this.closeModal(this.activeModal);
            }
            
            // Set active modal
            this.activeModal = modalId;
            
            // Display modal
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
            
            // Apply ripple effect if clicked
            this.addRippleEffect(modal);
            
            console.log(`Opened modal: ${modalId}`);
        },
        
        /**
         * Close a modal
         * @param {string} modalId - The ID of the modal to close
         */
        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.remove('active');
                
                // Clear active modal reference if this is the active one
                if (this.activeModal === modalId) {
                    this.activeModal = null;
                }
                
                console.log(`Closed modal: ${modalId}`);
            }
        },
        
        /**
         * Add ripple effect to a modal
         * @param {HTMLElement} modal - The modal element
         */
        addRippleEffect: function(modal) {
            const modalContent = modal.querySelector('.modal-content');
            
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';
            
            // Set position in center of modal
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            
            // Add to modal
            modalContent.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                if (ripple && ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }
    };

    // ===== NETWORK VISUALIZER =====
    /**
     * Creates visual network effects for the game
     */
    const NetworkVisualizer = {
        /**
         * Initialize network visualization on the splash screen
         */
        initSplashConnections: function() {
            const container = document.getElementById('splashConnections');
            
            // Clear container
            container.innerHTML = '';
            
            // Create nodes
            const nodeCount = 12;
            const nodes = [];
            
            for (let i = 0; i < nodeCount; i++) {
                const node = document.createElement('div');
                node.className = 'node';
                
                // Calculate random position
                const posX = 10 + Math.random() * 80; // 10-90% of width
                const posY = 10 + Math.random() * 80; // 10-90% of height
                
                node.style.left = `${posX}%`;
                node.style.top = `${posY}%`;
                
                container.appendChild(node);
                nodes.push({
                    element: node,
                    x: posX,
                    y: posY
                });
            }
            
            // Create connections between nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    // Only connect some nodes (about 30%)
                    if (Math.random() > 0.3) continue;
                    
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    
                    // Calculate line position and angle
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    // Create connection line
                    const connection = document.createElement('div');
                    connection.className = 'connection-line';
                    
                    // Add random class variations
                    if (Math.random() > 0.8) {
                        connection.classList.add('connection-strategic');
                    } else if (Math.random() > 0.6) {
                        connection.classList.add('connection-thin');
                    }
                    
                    // Position line
                    connection.style.left = `${node1.x}%`;
                    connection.style.top = `${node1.y}%`;
                    connection.style.width = `${distance}%`;
                    connection.style.transform = `rotate(${angle}deg)`;
                    
                    container.appendChild(connection);
                }
            }
            
            console.log("Splash screen network visualization initialized");
        },
        
        /**
         * Initialize network visualization in the game UI
         */
        initNetworkVisualization: function() {
            const container = document.getElementById('networkVisualization');
            
            // Clear container
            container.innerHTML = '';
            
            // Create nodes
            const nodeCount = 30;
            const nodes = [];
            
            for (let i = 0; i < nodeCount; i++) {
                const node = document.createElement('div');
                node.className = 'network-node';
                
                // Calculate random position
                const posX = Math.random() * 100; // 0-100% of width
                const posY = Math.random() * 100; // 0-100% of height
                
                node.style.left = `${posX}%`;
                node.style.top = `${posY}%`;
                
                container.appendChild(node);
                nodes.push({
                    element: node,
                    x: posX,
                    y: posY
                });
            }
            
            // Create connections between nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    // Only connect nodes that are reasonably close (within 30% of viewport)
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    
                    const dx = node2.x - node1.x;
                    const dy = node2.y - node1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 30) continue;
                    
                    // Calculate line angle
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    // Create connection line
                    const connection = document.createElement('div');
                    connection.className = 'network-connection';
                    
                    // Position line
                    connection.style.left = `${node1.x}%`;
                    connection.style.top = `${node1.y}%`;
                    connection.style.width = `${distance}%`;
                    connection.style.transform = `rotate(${angle}deg)`;
                    
                    container.appendChild(connection);
                }
            }
            
            console.log("Game UI network visualization initialized");
        }
    };

        // ===== SPLASH SCREEN =====
    /**
     * Manages the splash screen and onboarding carousel
     */
    const SplashScreen = {
        /**
         * Current slide in the onboarding carousel
         * @type {number}
         */
        currentSlide: 1,
        
        /**
         * Total number of slides in the carousel
         * @type {number}
         */
        totalSlides: 4,
        
        /**
         * Initialize the splash screen
         */
        init: function() {
            // Hide loading screen and carousel initially
            document.getElementById('loadingScreen').classList.remove('active');
            document.getElementById('onboardingCarousel').style.display = 'none';
            
            // Show splash screen content immediately
            this.show();
            
            console.log("Splash screen initialized");
        },
        
        /**
         * Show the loading screen
         */
        showLoadingScreen: function() {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.classList.add('active');
            
            // Simulate loading progress
            let progress = 0;
            const loadingBar = document.getElementById('loadingBar');
            
            const loadingInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(loadingInterval);
                    
                    // Hide loading screen after a short delay
                    setTimeout(() => {
                        loadingScreen.classList.remove('active');
                        
                        // Start the mission
                        MissionSelector.startMission();
                    }, 500);
                }
                
                loadingBar.style.width = `${progress}%`;
            }, 300);
        },
        
        /**
         * Show the splash screen
         */
        show: function() {
            document.getElementById('splashScreen').classList.remove('hidden');
        },
        
        /**
         * Hide the splash screen
         */
        hide: function() {
            document.getElementById('splashScreen').classList.add('hidden');
        },
        
        /**
         * Start the game from splash screen
         */
        startGame: function() {
            // Show onboarding carousel
            document.getElementById('onboardingCarousel').style.display = 'block';
            
            // Hide CTA buttons
            document.querySelector('.cta-buttons').style.display = 'none';
        },
        
        /**
         * Go to a specific slide in the carousel
         * @param {number} slideNumber - The slide number to go to
         */
        goToSlide: function(slideNumber) {
            if (slideNumber < 1 || slideNumber > this.totalSlides) {
                return;
            }
            
            // Update current slide
            this.currentSlide = slideNumber;
        
            // Hide all slides
            document.querySelectorAll('.carousel-slide').forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show current slide
            document.querySelector(`.carousel-slide[data-slide="${slideNumber}"]`).classList.add('active');
            
            // Update indicators
            document.querySelectorAll('.indicator').forEach(indicator => {
                indicator.classList.remove('active');
            });
            
            document.querySelector(`.indicator[data-slide="${slideNumber}"]`).classList.add('active');
            
            // Update continue button
            const continueButton = document.getElementById('continueButton');
            continueButton.removeEventListener('click', MissionSelector.selectMission);
            continueButton.addEventListener('click', function() {
                // Trigger the loading screen when user clicks Select Mission
                SplashScreen.hide();
                SplashScreen.showLoadingScreen();
            });
        },
        
        /**
         * Go to the next slide
         */
        nextSlide: function() {
            SplashScreen.goToSlide(SplashScreen.currentSlide + 1);
        },
        
        /**
         * Go to the previous slide
         */
        prevSlide: function() {
            SplashScreen.goToSlide(SplashScreen.currentSlide - 1);
        },
        
        /**
         * Skip the carousel and go to mission selection
         */
        skipCarousel: function() {
            MissionSelector.openMissionSelection();
        }
    };

    // ===== AUDIO PLAYER =====
/**
 * Controls the welcome audio player functionality
 */
const AudioPlayer = {
    /**
     * Audio element
     * @type {HTMLAudioElement}
     */
    audio: null,
    
    /**
     * Play button element
     * @type {HTMLElement}
     */
    playBtn: null,
    
    /**
     * Progress bar element
     * @type {HTMLElement}
     */
    progressBar: null,
    
    /**
     * Current time display element
     * @type {HTMLElement}
     */
    currentTimeDisplay: null,
    
    /**
     * Total time display element
     * @type {HTMLElement}
     */
    totalTimeDisplay: null,
    
    /**
     * Volume slider element
     * @type {HTMLElement}
     */
    volumeSlider: null,
    
    /**
     * Initialize the audio player
     */
    init: function() {
        this.audio = document.getElementById('welcomeAudio');
        this.playBtn = document.getElementById('audioPlayBtn');
        this.progressBar = document.getElementById('audioProgress');
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.totalTimeDisplay = document.getElementById('totalTime');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        if (!this.audio || !this.playBtn || !this.progressBar) {
            console.error('Audio player elements not found');
            return;
        }
        
        this.bindEvents();
        console.log("Audio player initialized");
    },
    
    /**
     * Bind all event listeners
     */
    bindEvents: function() {
        // Play/pause button
        this.playBtn.addEventListener('click', () => {
            if (this.audio.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
        
        // Time update
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
        
        // Audio loaded
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTotalTime();
        });
        
        // Progress bar click
        const progressContainer = document.querySelector('.audio-progress-bar');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                const rect = progressContainer.getBoundingClientRect();
                const clickPosition = (e.clientX - rect.left) / rect.width;
                this.audio.currentTime = clickPosition * this.audio.duration;
            });
        }
        
        // Volume control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', () => {
                this.audio.volume = this.volumeSlider.value / 100;
            });
            
            // Set initial volume
            this.audio.volume = this.volumeSlider.value / 100;
        }
        
        // Audio ended
        this.audio.addEventListener('ended', () => {
            this.playBtn.classList.remove('playing');
        });
    },
    
    /**
     * Play the audio
     */
    play: function() {
        this.audio.play();
        this.playBtn.classList.add('playing');
    },
    
    /**
     * Pause the audio
     */
    pause: function() {
        this.audio.pause();
        this.playBtn.classList.remove('playing');
    },
    
    /**
     * Update the progress bar
     */
    updateProgress: function() {
        if (this.audio.duration) {
            const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.style.width = `${progressPercent}%`;
            
            // Update current time display
            const minutes = Math.floor(this.audio.currentTime / 60);
            const seconds = Math.floor(this.audio.currentTime % 60).toString().padStart(2, '0');
            this.currentTimeDisplay.textContent = `${minutes}:${seconds}`;
        }
    },
    
    /**
     * Update the total time display
     */
    updateTotalTime: function() {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
            const minutes = Math.floor(this.audio.duration / 60);
            const seconds = Math.floor(this.audio.duration % 60).toString().padStart(2, '0');
            this.totalTimeDisplay.textContent = `${minutes}:${seconds}`;
        } else {
            this.totalTimeDisplay.textContent = "0:00";
        }
    }
};

    // ===== MISSION SELECTOR =====
    /**
     * Manages mission selection and starting
     */
    const MissionSelector = {
        /**
         * Selected mission ID
         * @type {number}
         */
        selectedMission: 1,
        
        /**
         * Open the mission selection screen
         */
        openMissionSelection: function() {
            // Hide splash screen
            SplashScreen.hide();
            
            // Show mission drawer
            document.getElementById('missionDrawer').classList.add('active');
            
            // Select first mission by default
            this.selectMission(1);
        },
        
        /**
         * Select a mission
         * @param {number} missionId - The ID of the mission to select
         */
        selectMission: function(missionId) {
            // Update selected mission
            this.selectedMission = missionId;
            
            // Update UI
            document.querySelectorAll('.mission-item').forEach(item => {
                item.classList.remove('active');
            });
            
            document.querySelector(`.mission-item[data-mission="${missionId}"]`).classList.add('active');
            
            // Update mission details (in a real implementation, this would load different content)
            console.log(`Selected mission: ${missionId}`);
        },

        
        /**
         * Start the selected mission
         */
        startMission: function() {
            // Hide mission drawer
            document.getElementById('missionDrawer').classList.remove('active');
            
            // Show game UI
            GameUI.showGameUI();
            
            // Initialize game elements
            GameUI.updateResourcesDisplay();
            MetricsManager.updateAllMetrics();
            StakeholderManager.updateStakeholdersDisplay();
            ObjectiveManager.updateAllObjectives();
            
            // Show overview tab by default
            TabNavigation.switchTab('overview');
            
            // Set up NetworkVisualizer
            NetworkVisualizer.initNetworkVisualization();
            
            console.log(`Starting mission: ${MissionSelector.selectedMission}`);
        }
    };
/** /
    * This function replaces the startMissionBtn click handler in the original init function
    */
   function updateStartMissionButtonHandler() {
       const startMissionBtn = document.getElementById('startMissionBtn');
       if (startMissionBtn) {
           // Remove any existing event listeners (to avoid duplicates)
           const newBtn = startMissionBtn.cloneNode(true);
           startMissionBtn.parentNode.replaceChild(newBtn, startMissionBtn);
           
           // Add our new event listener that shows the loading screen first
           newBtn.addEventListener('click', function() {
               // Hide mission drawer
               document.getElementById('missionDrawer').classList.remove('active');
               
               // Show loading screen before starting mission
               SplashScreen.showLoadingScreen();
           });
       }
   }
   /** Initializes the application with our modified loading screen behavior
   */
  function originalInit() {
      // This function will be called at the end of the main initialization
      updateStartMissionButtonHandler();
      
      // Modify the document's existing binding to use our new behavior
      // This needs to be done after the original DOM content loaded event
      setTimeout(() => {
          updateStartMissionButtonHandler();
      }, 500);
      
      console.log("Modified loading screen behavior initialized");
  }

    // Initialize the game when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        GameController.init();
        originalInit.call(this);
        AudioPlayer.init();
    });
})();

const express = require('express');
const OpenAI = require('openai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // System prompt for AgriSync AI assistant
    const systemPrompt = `You are an AI assistant for AgriSync, a farm-to-table traceability platform designed for small producers in India. Your role is to help farmers and producers with:

1. Batch management and product tracking
2. QR code generation and supply chain traceability
3. Trust score improvement and certification guidance
4. Sustainable farming practices
5. Market access and B2B connections
6. Technology adoption for rural farmers

Key features of AgriSync:
- QR code-based product traceability
- AI-powered mobile interface with offline support
- Trust scoring system based on transparency
- B2B marketplace for premium markets
- Multi-language support (English/Hindi)
- Designed for minimal tech literacy

Guidelines:
- Be helpful, friendly, and supportive
- Use simple language suitable for farmers
- Provide practical, actionable advice
- Focus on sustainable and ethical farming practices
- Help users understand how to use AgriSync features
- When discussing prices, use Indian Rupees (₹)
- Be culturally sensitive to Indian farming context

Keep responses concise but informative. If you don't know something specific about AgriSync features, acknowledge it and provide general farming advice instead.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Enhanced fallback response system
    const fallbackResponses = {
      'batch': 'To create a new batch: Go to Dashboard → "Create New Batch" → Fill product details (name, type, quantity, harvest date) → System generates QR code automatically. Each batch gets a unique ID for complete traceability! 📦',
      'qr': 'QR codes contain your product\'s complete story! When buyers scan: ✅ Product origin & journey ✅ Trust score & certifications ✅ Producer information ✅ Supply chain events. It builds instant buyer confidence! 📱',
      'trust': 'Trust Score factors: 📈 Supply chain events logged 📋 Certifications attached 📸 Photo evidence 🏆 Producer verification status. More transparency = Higher trust = Premium prices! 💰',
      'certification': 'Add certifications: Batch Details → Upload Documents → Supported: Organic, Fair Trade, Quality Standards. Certifications increase trust scores and access to premium markets! 🏅',
      'events': 'Track your journey: Add events like Processing → Quality Checks → Packaging → Transport. Include photos & GPS location for maximum transparency. Buyers love seeing the complete story! 📍',
      'offline': 'AgriSync works offline! 📱 Create batches ✅ Add events ✅ Take photos ✅ Data syncs when online. Perfect for rural areas with limited connectivity! 🌐',
      'market': 'Access premium markets through: 🎯 High trust scores 📋 Complete documentation 🏅 Certifications 📸 Photo evidence. Transparency = Premium pricing! 💎',
      'price': 'Pricing in Indian Rupees (₹): Premium products with high trust scores can command 20-50% higher prices. Document everything to maximize value! 💰',
      'help': 'I can help with: 🌱 Creating & managing batches 📱 QR code generation 📈 Trust score improvement 🏅 Certifications 📍 Supply chain tracking 🌾 Sustainable farming tips 💰 Market access strategies'
    };

    const lowerMessage = req.body.message.toLowerCase();
    let fallbackResponse = 'I\'m currently in offline mode, but I can still help! 🌱 I can guide you through AgriSync features, sustainable farming practices, and market access strategies. What would you like to know?';
    
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        fallbackResponse = response;
        break;
      }
    }

    // Enhanced farming advice with Indian context
    if (fallbackResponse.includes('offline mode')) {
      const indianFarmingAdvice = [
        '🌾 Crop rotation tip: Rotate rice-wheat with legumes like chickpea or lentils. This improves soil nitrogen and can increase your trust score through sustainable practices documentation!',
        '💧 Water conservation: Drip irrigation can reduce water use by 40-60%. Document this in your batches as "Water Efficient" - buyers pay premium for sustainable practices!',
        '🌱 Organic transition: Start with small plots, document the process in AgriSync. Organic certification can increase prices by ₹10-20 per kg for vegetables!',
        '📱 Digital documentation: Take photos of every farming step - planting, weeding, harvesting. This builds trust scores and helps access premium markets!',
        '🏅 Certification priority: Start with FSSAI registration, then organic certification. Each certificate increases your trust score and market access!',
        '🎯 Market timing: Use AgriSync analytics to track demand patterns. Premium buyers often pay 30-50% more for well-documented, traceable products!',
        '🌿 Sustainable practices: Composting, natural pest control, soil testing - document everything! Sustainability stories sell at premium prices in urban markets!'
      ];
      
      fallbackResponse = indianFarmingAdvice[Math.floor(Math.random() * indianFarmingAdvice.length)];
    }

    res.json({ 
      response: fallbackResponse,
      success: false,
      fallback: true,
      mode: 'offline'
    });
  }
});

module.exports = router;
import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

export const chatbotRouter = Router();

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests to AI assistant' },
});

// BOTANIQUE Knowledge Base (static, until AI API is configured)
const knowledgeBase = {
  products: [
    { name: 'Rose Face Oil', size: '30 ml', price: '₹1,450', ingredients: 'Squalane, Jojoba Seed Oil, Rosehip Seed Oil, Rose Extract, Tocopherol', category: 'Face Oils' },
    { name: 'Shea Repair Balm', size: '50 g', price: '₹850', ingredients: 'Shea Butter, Sunflower Seed Oil, Beeswax, Calendula Extract, Tocopherol', category: 'Balms' },
    { name: 'Aloe Calm Gel', size: '50 g', price: '₹650', ingredients: 'Aloe Vera Leaf Juice, Glycerin, Xanthan Gum, Panthenol, Preservative system', category: 'Gels' },
    { name: 'Vitamin Glow Serum', size: '30 ml', price: '₹1,100', ingredients: 'Glycerin, Niacinamide, Panthenol, Sodium Hyaluronate, Preservative system', category: 'Serums' },
    { name: 'Herbal Lip Balm', size: '15 g', price: '₹350', ingredients: 'Beeswax, Shea Butter, Coconut Oil, Sunflower Seed Oil, Tocopherol', category: 'Lip Care' },
  ],
  faqs: [
    { q: 'Are your products vegan?', a: 'The Rose Face Oil, Aloe Calm Gel, and Vitamin Glow Serum do not contain animal-derived ingredients based on current formulations. The Shea Repair Balm and Herbal Lip Balm contain Beeswax and are not vegan.' },
    { q: 'Do you test on animals?', a: 'BOTANIQUE does not test on animals.' },
    { q: 'Are your products safe for sensitive skin?', a: 'We recommend performing a patch test before first use. If you have specific skin concerns or conditions, please consult a dermatologist before use.' },
    { q: 'What is your return policy?', a: 'Returns are under review. Currently, we consider return requests for unopened, unused products within seven calendar days of delivery. This policy is pending final approval. Please contact our support team for assistance.' },
    { q: 'Where do you deliver?', a: 'We currently deliver within India to serviceable PIN codes. Estimated delivery for Bengaluru is 2–5 business days after fulfillment, and 4–8 business days for other locations. These are estimates, not guaranteed commitments.' },
    { q: 'How do I place an order?', a: 'Browse our shop, add products to your cart, create an account or log in, complete your delivery details, and proceed to checkout.' },
    { q: 'Is payment secure?', a: 'Yes. Payments are processed through Razorpay, a trusted Indian payment gateway. We do not store your card details.' },
  ],
  policies: {
    returns: 'Return requests are considered for unopened, unused products within seven calendar days of delivery. This is a proposed policy under review.',
    shipping: 'Estimated delivery: Bengaluru — 2 to 5 business days after fulfillment. Other locations — 4 to 8 business days after fulfillment. These are estimates pending confirmation.',
    safety: 'Always perform a patch test before first use. Discontinue use if irritation occurs. These products are for external use only. Not for use on broken or irritated skin without medical advice. Keep out of reach of children.',
  },
};

chatbotRouter.post('/message', chatbotLimiter, optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== 'string') {
      throw new AppError('Message is required', 400);
    }

    const lowerMsg = message.toLowerCase();

    // Check if external AI API is configured
    const aiApiUrl = process.env.AI_SUPPORT_API_URL;
    const aiApiKey = process.env.AI_SUPPORT_API_KEY;

    if (aiApiUrl && aiApiKey) {
      // Forward to configured AI API
      try {
        const response = await fetch(aiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
          body: JSON.stringify({ message, sessionId, userId: req.user?.id }),
        });
        const aiResponse = await response.json() as { reply?: string; message?: string };
        return res.json({ success: true, reply: aiResponse.reply || aiResponse.message, source: 'ai' });
      } catch {
        // Fall through to rule-based responses
      }
    }

    // Rule-based fallback
    let reply = '';

    if (lowerMsg.includes('order') && req.user) {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { shipment: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      if (orders.length > 0) {
        const latest = orders[0];
        reply = `Your most recent order (${latest.orderRef}) has status: **${latest.status}**.`;
        if (latest.shipment?.trackingNumber) {
          reply += ` Tracking: ${latest.shipment.trackingNumber}.`;
        }
      } else {
        reply = "I couldn't find any orders on your account. Please ensure you're logged in, or contact our support team.";
      }
    } else if (lowerMsg.includes('rose face oil') || (lowerMsg.includes('rose') && lowerMsg.includes('oil'))) {
      reply = `**Rose Face Oil** — ₹1,450 / 30 ml\n\nIngredients: Squalane, Jojoba Seed Oil, Rosehip Seed Oil, Rose Extract, Tocopherol.\n\nThis is a botanical face oil. We recommend a patch test before first use.`;
    } else if (lowerMsg.includes('shea') && lowerMsg.includes('balm')) {
      reply = `**Shea Repair Balm** — ₹850 / 50 g\n\nIngredients: Shea Butter, Sunflower Seed Oil, Beeswax, Calendula Extract, Tocopherol.\n\nPlease note this product contains Beeswax and is not vegan.`;
    } else if (lowerMsg.includes('aloe') || lowerMsg.includes('calm gel')) {
      reply = `**Aloe Calm Gel** — ₹650 / 50 g\n\nIngredients: Aloe Vera Leaf Juice, Glycerin, Xanthan Gum, Panthenol, and a Preservative system (composition not specified).\n\nPlease patch test before use.`;
    } else if (lowerMsg.includes('vitamin') || lowerMsg.includes('serum') || lowerMsg.includes('glow')) {
      reply = `**Vitamin Glow Serum** — ₹1,100 / 30 ml\n\nIngredients: Glycerin, Niacinamide, Panthenol, Sodium Hyaluronate, and a Preservative system.\n\nPlease patch test before use.`;
    } else if (lowerMsg.includes('lip balm') || lowerMsg.includes('herbal lip')) {
      reply = `**Herbal Lip Balm** — ₹350 / 15 g\n\nIngredients: Beeswax, Shea Butter, Coconut Oil, Sunflower Seed Oil, Tocopherol.\n\nThis product contains Beeswax and is not vegan.`;
    } else if (lowerMsg.includes('vegan')) {
      reply = knowledgeBase.faqs[0].a;
    } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
      reply = knowledgeBase.policies.returns + '\n\nTo raise a request, go to your Account → Orders and select the relevant order.';
    } else if (lowerMsg.includes('deliver') || lowerMsg.includes('shipping') || lowerMsg.includes('pincode')) {
      reply = knowledgeBase.policies.shipping;
    } else if (lowerMsg.includes('patch test') || lowerMsg.includes('sensitive') || lowerMsg.includes('skin')) {
      reply = knowledgeBase.policies.safety + '\n\n⚠️ This is general guidance and not medical advice. Please consult a dermatologist if you have specific skin concerns.';
    } else if (lowerMsg.includes('payment') || lowerMsg.includes('razorpay') || lowerMsg.includes('pay')) {
      reply = knowledgeBase.faqs[6].a;
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('product')) {
      reply = `Here are our products:\n\n${knowledgeBase.products.map(p => `• **${p.name}** — ${p.price} / ${p.size}`).join('\n')}\n\nWhich product would you like to know more about?`;
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('help')) {
      reply = `Hello! I'm the BOTANIQUE support assistant. I can help you with:\n\n• Product information and ingredients\n• Order status (if you're logged in)\n• Shipping and delivery information\n• Returns and refund policy\n• General skincare guidance\n\nWhat can I help you with today?`;
    } else if (lowerMsg.includes('human') || lowerMsg.includes('agent') || lowerMsg.includes('speak') || lowerMsg.includes('call')) {
      reply = `To speak with a member of our team, please use the **Contact Us** page and submit your query. We will respond as soon as possible.\n\n> This is a general support notice and not a confirmed response time commitment.`;
    } else if (lowerMsg.includes('reaction') || lowerMsg.includes('allergic') || lowerMsg.includes('irritation') || lowerMsg.includes('rash')) {
      reply = `⚠️ **Important**: If you have experienced an adverse reaction to a BOTANIQUE product, please:\n\n1. Discontinue use immediately\n2. Consult a healthcare professional\n3. Contact us through the Contact page with your order details\n\nWe take product safety seriously and will escalate your concern to our team.`;
    } else {
      reply = `Thank you for your message. I wasn't able to find a specific answer to your query in our knowledge base.\n\nYou can:\n• Browse our **FAQ** section for common questions\n• Visit the **Contact Us** page to reach our support team\n• Check your **Account** for order-related information\n\nIs there anything else I can help you with?`;
    }

    res.json({ success: true, reply, source: 'knowledge-base' });
  } catch (error) {
    next(error);
  }
});


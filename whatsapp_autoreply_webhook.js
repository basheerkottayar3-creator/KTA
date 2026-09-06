/**
 * ==============================================================================
 * KTA SPICES — OFFICIAL WHATSAPP AUTOMATIC AI REPLY SYSTEM
 * ==============================================================================
 * This file provides two production-ready solutions for automated WhatsApp replies:
 * 
 * ──────────────────────────────────────────────────────────────────────────────
 * OPTION 1: INSTANT NO-CODE SETUP (FREE WhatsApp Business App)
 * ──────────────────────────────────────────────────────────────────────────────
 * If you are using the WhatsApp Business app on your phone:
 * 1. Open WhatsApp Business App > Settings (or 3 dots) > "Business Tools".
 * 2. Greeting Message:
 *    - Turn ON "Send greeting message".
 *    - Message:
 *      "Welcome to KTA Spices Commercial Concierge! 🌿
 *      We supply single-origin Tellicherry Pepper (TGSEB), Alleppey Cardamom (8mm+),
 *      Salem Golden Turmeric, Cloves & wholesale spices directly to
 *      hotels, restaurants, and food manufacturers.
 *      
 *      👉 Reply with:
 *      1. '1' or 'SPECS' for Quality & Lot Specifications
 *      2. '2' or 'SAMPLE' to request a Free 1kg Chef Discovery Box
 *      3. '3' or 'MOQ' for Wholesale Minimum Order & Packaging details
 *      4. '4' or 'QUOTE <qty> <spice>' for instant lot estimation
 *      5. '5' to speak with our Senior Trade Broker."
 * 3. Away Message:
 *    - Turn ON "Send away message" for outside desk hours (8:00 AM – 8:00 PM IST).
 * 4. Quick Replies (Set shortcuts like /sample, /pepper, /cardamom, /moq).
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * OPTION 2: OFFICIAL META WHATSAPP CLOUD API AUTOMATED AI WEBHOOK
 * ──────────────────────────────────────────────────────────────────────────────
 * When a customer sends any WhatsApp message to your official number:
 * 1. Meta sends a POST webhook request to your server URL.
 * 2. The script extracts the sender's phone number and message text.
 * 3. The offline AI engine analyzes the query against KTA's 50+ SKU Knowledge Base.
 * 4. An automated response with specifications, dynamic calculations, or sample instructions
 *    is posted back to the user via Meta WhatsApp Cloud API.
 * 
 * Below are two deployable webhook scripts:
 * - PART A: Google Apps Script (100% Free Forever, Serverless, No Hosting Required)
 * - PART B: Node.js / Express Webhook (For VPS, Render, Railway, AWS)
 * ==============================================================================
 */

// ==============================================================================
// PART A: GOOGLE APPS SCRIPT WEBHOOK (100% FREE SERVERLESS)
// ==============================================================================
/*
HOW TO DEPLOY IN 3 MINUTES:
1. Go to https://script.google.com and click "New Project".
2. Paste the code below into Code.gs.
3. Replace WHATSAPP_TOKEN and PHONE_NUMBER_ID with your Meta Developer credentials.
4. Click "Deploy" > "New deployment" > Select type: "Web app".
5. Set "Execute as: Me" and "Who has access: Anyone". Click "Deploy".
6. Copy the Web App URL and paste it into Meta Developer Dashboard > WhatsApp > Configuration > Webhook URL.
7. Verify Token: Set to "KTA_SPICES_SECRET_TOKEN".
*/

const GAS_CONFIG = {
  VERIFY_TOKEN: "KTA_SPICES_SECRET_TOKEN",
  WHATSAPP_TOKEN: "YOUR_META_PERMANENT_ACCESS_TOKEN",
  PHONE_NUMBER_ID: "YOUR_META_PHONE_NUMBER_ID"
};

/**
 * Handles Meta Webhook Verification (GET Request)
 */
function doGet(e) {
  var params = e.parameter;
  var mode = params['hub.mode'];
  var token = params['hub.verify_token'];
  var challenge = params['hub.challenge'];

  if (mode === 'subscribe' && token === GAS_CONFIG.VERIFY_TOKEN) {
    return ContentService.createTextOutput(challenge).setMimeType(ContentService.MimeType.TEXT);
  }
  return ContentService.createTextOutput("Verification Failed").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handles Incoming WhatsApp Messages (POST Request)
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages) {
      var messageObj = data.entry[0].changes[0].value.messages[0];
      var fromNumber = messageObj.from;
      var userText = messageObj.text ? messageObj.text.body : '';

      if (userText) {
        var replyText = generateKTAWhatsAppReply(userText);
        sendWhatsAppCloudMessage(fromNumber, replyText);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "EVENT_RECEIVED" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sends a WhatsApp Message via Meta Cloud API
 */
function sendWhatsAppCloudMessage(to, text) {
  var url = "https://graph.facebook.com/v19.0/" + GAS_CONFIG.PHONE_NUMBER_ID + "/messages";
  var payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: { body: text }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + GAS_CONFIG.WHATSAPP_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, options);
}

// ==============================================================================
// PART B: NODE.JS / EXPRESS WEBHOOK (FOR VPS / CLOUD HOSTING)
// ==============================================================================
/*
RUNNING LOCALLY OR ON SERVER:
1. npm init -y && npm install express axios dotenv
2. Set environment variables in .env:
   PORT=3000
   VERIFY_TOKEN=KTA_SPICES_SECRET_TOKEN
   WHATSAPP_TOKEN=YOUR_META_PERMANENT_ACCESS_TOKEN
   PHONE_NUMBER_ID=YOUR_META_PHONE_NUMBER_ID
3. Run: node whatsapp_autoreply_webhook.js
*/

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  try {
    const express = require('express');
    const axios = require('axios');
    const app = express();
    app.use(express.json());

    const PORT = process.env.PORT || 3000;
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "KTA_SPICES_SECRET_TOKEN";
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";

    // Webhook Verification (GET)
    app.get('/webhook', (req, res) => {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    });

    // Incoming Messages (POST)
    app.post('/webhook', async (req, res) => {
      try {
        const body = req.body;
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
          const msg = body.entry[0].changes[0].value.messages[0];
          const from = msg.from;
          const incomingText = msg.text ? msg.text.body : '';

          if (incomingText) {
            console.log(`Received message from ${from}: ${incomingText}`);
            const reply = generateKTAWhatsAppReply(incomingText);
            
            await axios.post(
              `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
              {
                messaging_product: "whatsapp",
                to: from,
                text: { body: reply }
              },
              {
                headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
              }
            );
          }
        }
        res.status(200).send('EVENT_RECEIVED');
      } catch (err) {
        console.error('Webhook error:', err.response ? err.response.data : err.message);
        res.sendStatus(500);
      }
    });

    app.listen(PORT, () => console.log(`KTA WhatsApp Webhook running on port ${PORT}`));
  } catch (err) {
    // If express is not installed locally, functions remain exported for testing/GAS
  }
}

// ==============================================================================
// KTA WHATSAPP AI NLP ENGINE (Shared by GAS and Node.js)
// ==============================================================================
function generateKTAWhatsAppReply(rawInput) {
  var norm = rawInput.toLowerCase().replace(/['".,\/#!$%\^&\*;:{}=\-_`~()?\\]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Dynamic Lot Price Calculator
  var numMatch = norm.match(/(\d+[\d,.]*)\s*(kg|kilos|kilograms|tons|tonnes|bags|quintals)?/i);
  var isCalc = /(calculate|quote|price|rate|cost|how much|valuation|estimate|worth|buy|order|book|allotment|tonnage)/i.test(norm) && numMatch;
  
  if (isCalc) {
    var rawNum = parseFloat(numMatch[1].replace(/,/g, ''));
    var kg = rawNum;
    if (norm.indexOf('ton') !== -1) kg = rawNum * 1000;
    else if (norm.indexOf('quintal') !== -1) kg = rawNum * 100;
    else if (norm.indexOf('bag') !== -1) kg = rawNum * 40;

    var spiceName = "Tellicherry TGSEB Black Pepper";
    var baseRate = 820;
    var hsn = "09041140";
    var origin = "Wayanad & Idukki, Kerala";

    if (/cardamom|elakkai|elaichi/i.test(norm)) { spiceName = "Alleppey Green Cardamom (8mm+ Extra Bold)"; baseRate = 2850; hsn = "09083140"; origin = "Vandanmedu & Idukki, Kerala"; }
    else if (/turmeric|manjal|haldi/i.test(norm)) { spiceName = "Salem Golden Turmeric Powder"; baseRate = 210; hsn = "09103030"; origin = "Salem, Tamil Nadu"; }
    else if (/clove|kirambu|laung/i.test(norm)) { spiceName = "Zanzibar Hand-Picked Bold Cloves"; baseRate = 980; hsn = "09071010"; origin = "Zanzibar / Madagascar"; }
    else if (/cinnamon|pattai|dalchini/i.test(norm)) { spiceName = "Ceylon Pure Alba / C5 Special Cinnamon"; baseRate = 1450; hsn = "09061110"; origin = "Southern Province, Sri Lanka"; }
    else if (/cashew|mundhiri|kaju/i.test(norm)) { spiceName = "Royal W320 Export Cashew Kernels"; baseRate = 780; hsn = "08013100"; origin = "Panruti, Tamil Nadu"; }
    else if (/almond|badam/i.test(norm)) { spiceName = "California Nonpareil Badam (Almonds)"; baseRate = 690; hsn = "08021100"; origin = "Central Valley, California (Import)"; }
    else if (/saffron|kesar|kumkumapoo/i.test(norm)) { spiceName = "Kashmir Mongra Grade A1 Saffron"; baseRate = 265000; hsn = "09102010"; origin = "Pampore, Kashmir"; }

    var discountPercent = (kg >= 5000) ? 8 : (kg >= 3000) ? 5 : (kg >= 1000) ? 3 : 0;
    var netRate = Math.round(baseRate * (1 - discountPercent / 100));
    var subtotal = kg * netRate;

    return "🌿 *KTA SPICES — WHOLESALE ESTIMATE*\n\n" +
           "📦 *Product:* " + spiceName + "\n" +
           "📍 *Origin:* " + origin + " | *HSN:* " + hsn + "\n" +
           "⚖️ *Quantity:* " + kg.toLocaleString('en-IN') + " kg (" + Math.ceil(kg / 40) + " Master Bags)\n" +
           "💰 *Direct Lot Rate:* ₹" + netRate.toLocaleString('en-IN') + " / kg" + (discountPercent > 0 ? " (" + discountPercent + "% Volume Tier Applied)" : "") + "\n" +
           "💵 *Estimated Consignment Value:* ₹" + subtotal.toLocaleString('en-IN') + " (Ex-Warehouse)\n\n" +
           "🚚 *Dispatch:* 24h ex-warehouse across South India\n" +
           "📄 *Billing:* Commercial B2B invoice with batch COA\n\n" +
           "Reply *CONFIRM* to connect with Trade Desk or call *+91 85928 32871* / *+91 63793 51632*.";
  }

  // 2. Chef Discovery Samples
  if (/(welcome|sample|kit|tray|trial|discovery)/i.test(norm) || norm === '2' || norm === 'sample') {
    return "🎁 *CHEF DISCOVERY SAMPLES (SOURCED & GRADED BY KTA)*\n\n" +
           "KTA Spices provides Executive Chefs, F&B Directors, and commercial procurement leads discovery samples to test in their kitchen pass.\n\n" +
           "📦 *Sample Range Includes:*\n" +
           "• Tellicherry TGSEB Black Pepper (Sourced & Graded by KTA Alone)\n" +
           "• Alleppey 8mm+ Extra Bold Green Cardamom\n" +
           "• Salem Golden Turmeric Powder\n" +
           "• Zanzibar Hand-Picked Cloves & Whole Aromatics\n" +
           "• Direct Single-Origin Sourcing Assurance\n\n" +
           "👉 *To request samples*, please reply with:\n" +
           "1. Your Name & Designation (e.g. Executive Chef / Purchase Director)\n" +
           "2. Hotel / Restaurant / Business Name\n" +
           "3. Kitchen Location & Delivery Address\n\n" +
           "Sample dispatch is scheduled according to location. Contracted hotel partners receive guaranteed 2–24h replenishment.\n" +
           "Apply online: https://greatestoat838-create.github.io/KTA/partnership.html#registerKitchen";
  }

  // 3. Extraction Byproducts, Pinheads & Biomass (Checked before general pepper)
  if (/(byproduct|pinhead|lite\s*berry|light\s*berry|husk|spent|extraction|oleoresin|distillation|biomass)/i.test(norm)) {
    return "🏭 *WHOLESALE EXTRACTION BYPRODUCTS & BIOMASS*\n\n" +
           "KTA supplies high-density raw byproducts sourced & graded by KTA alone for oleoresin distillers and industrial processors:\n\n" +
           "• *Pepper Pinheads (HSN 09041110):* Micro-density bold berries for solvent extraction.\n" +
           "• *Lite Berries / Black Pepper Husk:* High volatile aroma fraction for steam distillation & spice blending.\n" +
           "• *Spent Biomass:* Dry exhausted meal for natural cattle feed binders & bio-fertilizer.\n" +
           "• *Availability:* 5-ton to 20-ton monthly supply contracts.\n\n" +
           "Direct Wholesale Desk: *+91 63793 51632* or Trade Desk: *+91 85928 32871*.";
  }

  // 4. Payment, Credit Terms & Institutional Billing
  if (/(payment|credit|credit\s*period|credit\s*terms|terms|billing|invoice|proforma|bank|neft|rtgs|lc)/i.test(norm)) {
    return "💳 *COMMERCIAL PAYMENT & INSTITUTIONAL CREDIT TERMS*\n\n" +
           "• *Institutional Credit:* 15-day and 30-day revolving credit facilities for verified 5-star hotel chains and audited enterprise accounts.\n" +
           "• *Commercial Billing:* Full B2B compliant corporate invoices with batch-specific COA.\n" +
           "• *Payment Methods:* NEFT, RTGS, Corporate Bank Transfer, and Irrevocable Letter of Credit (LC) for export/multi-ton contracts.\n" +
           "• *Pro-Forma Invoices:* Generated instantly with HSN breakdown and dispatch schedule.\n\n" +
           "Contact Accounts Desk: *+91 85928 32871*";
  }

  // 5. Wholesale MOQ & Packaging
  if (/(moq|minimum\s*order|small\s*order|bag\s*size|pack\s*size|packaging|wholesale)/i.test(norm) || norm === '3' || norm === 'moq') {
    return "📦 *WHOLESALE ORDER & PACKAGING STANDARDS*\n\n" +
           "• *Wholesale Minimum Order (MOQ):* 500 kg per consignment across single or mixed spice product lines.\n" +
           "• *Master Bags:* 40 kg triple-layered food-grade moisture-barrier bags on heat-treated export pallets.\n" +
           "• *Chef Kitchen Pouches:* 1 kg multi-layer aroma barrier pouches.\n" +
           "• *Institutional Tins:* 5 kg & 10 kg sealed containers for cardamom & saffron.\n" +
           "• *Dedicated Wholesale Desk:* WhatsApp *+91 63793 51632*\n\n" +
           "View Wholesale Portal: https://greatestoat838-create.github.io/KTA/wholesale.html";
  }

  // 6. Quality Control & Purity Assurance (Direct to Trade Desk)
  if (/(qc|lab|chemical|assay|curcumin|piperine|moisture|volatile\s*oil|fssai|spices\s*board|usda|halal|iso|certificate|coa|purity|why.*good)/i.test(norm) || norm === '1' || norm === 'specs') {
    return "🌿 *SINGLE-ORIGIN PURITY & QUALITY (KTA SPICES)*\n\n" +
           "Every KTA spice lot is single-origin, sourced and graded by KTA alone with 100% unadulterated purity and zero synthetic additives or fillers.\n\n" +
           "For specific lot availability, batch specifications, or sample packs to evaluate in your kitchen pass, please contact our Trade Desk directly.\n\n" +
           "• *WhatsApp Trade Desk:* +91 85928 32871\n" +
           "• *Dedicated Wholesale Desk:* +91 63793 51632\n" +
           "• *Request Free Chef Box:* https://greatestoat838-create.github.io/KTA/partnership.html#registerKitchen";
  }

  // 7. Hotel Smart 24/7 Logistics
  if (/(hotel|hotel\s*smart|24\/7|emergency|delivery|chennai|bangalore|hyderabad|coimbatore|kochi)/i.test(norm)) {
    return "🚚 *KTA HOTEL SMART 24/7 REPLENISHMENT*\n\n" +
           "• *Emergency Dispatch:* 2–24h guaranteed delivery for partnered commercial kitchens.\n" +
           "• *Express Transit Corridors:* Chennai (2–6h), Bangalore, Hyderabad, Coimbatore, Kochi, Madurai (12–24h).\n" +
           "• *Dock-to-Store Delivery:* Delivered straight into your hotel receiving dry stores.\n" +
           "• *Revolving Credit:* 15-day & 30-day institutional credit for contracted hotel accounts.\n\n" +
           "Call Dispatch Manager: *+91 85928 32871*";
  }

  // 8. Individual Product Specifications
  if (/(pepper|black\s*pepper|tellicherry|tgseb|garbled|kurumulaku|milagu|kali\s*mirch)/i.test(norm)) {
    return "🌿 *TELLICHERRY TGSEB BLACK PEPPER (HSN 09041140)*\n\n" +
           "• *Origin:* Wayanad & Idukki Estates, Kerala\n" +
           "• *Purity & Grading:* Sourced and graded by KTA alone\n" +
           "• *Grade:* TGSEB (Tellicherry Garbled Special Extra Bold 4.75mm+)\n" +
           "• *Packaging:* 1kg Chef Pouches & 40kg Master Food-Grade Bags\n" +
           "• *Benchmark Rate:* ₹680/kg\n\n" +
           "Reply *'SAMPLE'* for test samples or contact Wholesale Desk at *+91 63793 51632*.";
  }

  if (/(cardamom|elakkai|elaichi|green\s*cardamom|8mm|alleppey|idukki)/i.test(norm)) {
    return "🌿 *ALLEPPEY GREEN CARDAMOM 8MM+ EXTRA BOLD (HSN 09083140)*\n\n" +
           "• *Origin:* Vandanmedu & Idukki High Ranges, Kerala\n" +
           "• *Grade & Caliber:* 8mm+ Extra Bold Calibrated Pods\n" +
           "• *Purity:* Sourced & graded by KTA alone, zero synthetic dyes\n" +
           "• *Packaging:* 1kg Aroma Vacuum Tins & 40kg Master Bags\n" +
           "• *Benchmark Rate:* ₹2,450/kg\n\n" +
           "Reply for live spot pricing or WhatsApp Wholesale at *+91 63793 51632*.";
  }

  if (/(turmeric|salem|manjal|haldi|erode)/i.test(norm)) {
    return "🌿 *SALEM GOLDEN TURMERIC (HSN 09103030)*\n\n" +
           "• *Origin:* Salem Terroir, Tamil Nadu\n" +
           "• *Purity & Grading:* Sourced & graded by KTA alone (Zero Lead Chromate / Sudan Dyes)\n" +
           "• *Form Factor:* Whole Cured Fingers & Micro-Ground Chef Powder\n" +
           "• *Packaging:* 1kg Chef Pouches & 40kg Triple-Lined Master Bags\n" +
           "• *Benchmark Rate:* ₹280/kg\n\n" +
           "Contact Wholesale Desk at *+91 63793 51632*.";
  }

  if (/(clove|kirambu|laung)/i.test(norm)) {
    return "🌿 *ZANZIBAR HAND-PICKED CLOVES (HSN 09071010)*\n\n" +
           "• *Origin:* Highland Estates & Zanzibar Origin\n" +
           "• *Purity & Grading:* Sourced & graded by KTA alone · 100% Head-On Intact Buds\n" +
           "• *Benchmark Rate:* ₹980/kg\n\n" +
           "Contact Wholesale Desk at *+91 63793 51632*.";
  }

  if (/(cinnamon|pattai|dalchini)/i.test(norm)) {
    return "🌿 *TRUE CEYLON CINNAMON C5 SPECIAL (HSN 09061110)*\n\n" +
           "• *Origin:* Direct Ceylon Heritage Estates\n" +
           "• *Purity & Grading:* Sourced & graded by KTA alone (Pure C5 Soft Quills)\n" +
           "• *Benchmark Rate:* ₹1,150/kg\n\n" +
           "Contact Wholesale Desk at *+91 63793 51632*.";
  }

  if (/(cashew|mundhiri|kaju|badam|almond|saffron|kesar)/i.test(norm)) {
    return "🌿 *PREMIUM DRY FRUITS & NUTS ALLOTMENT*\n\n" +
           "• *W320 White Cashew Kernels:* ₹740/kg (HSN 08013100)\n" +
           "• *California Raw Badam 18/20:* ₹780/kg (HSN 08021100)\n" +
           "• *Kashmir Mongra Grade A1 Saffron:* ₹260,000/kg (HSN 09102010)\n\n" +
           "Reply with your required volume for instant allotment confirmation.";
  }

  // 9. Contact & Broker Connection
  if (/(broker|human|call|phone|talk|speak|address|location|office|warehouse)/i.test(norm) || norm === '5') {
    return "📞 *CONNECT WITH KTA COMMERCIAL TRADE DESK*\n\n" +
           "• *General Trade Desk Hotline:* +91 85928 32871\n" +
           "• *Dedicated Wholesale Desk:* +91 63793 51632\n" +
           "• *Registered Warehouse:* No. 13/28, Mylai Periyathambi Street, George Town, Mannadi, Chennai, Tamil Nadu – 600001\n" +
           "• *Desk Hours:* Monday – Sunday, 24 Hours (24/7)\n\n" +
           "Our trade desk is available to discuss commercial allotments, Hotel Smart replenishment, and custom sourcing.";
  }

  // 10. Default Greeting / Menu
  return "🌿 *KTA SPICES — COMMERCIAL TRADE CONCIERGE (24/7)*\n\n" +
         "Welcome! We supply single-origin direct-harvest spices (Pepper, Cardamom, Turmeric, Cloves, Cinnamon, Cashews) to luxury hotels, institutional kitchens, and extractors.\n\n" +
         "👉 *Reply with:*\n" +
         "• *'WHAT IS KTA'* for company overview & single-origin heritage\n" +
         "• *'WHY KTA'* for purity & grading assurance (Sourced & graded by KTA alone)\n" +
         "• *'WHOLESALE'* or *'MOQ'* for 500kg+ master bag supply\n" +
         "• *'HOTEL'* for 2–24h emergency kitchen replenishment\n" +
         "• *'SAMPLE'* for Chef Discovery Samples\n" +
         "• *'CUSTOM'* for products outside standard catalogue & extraction byproducts\n" +
         "• *'BROKER'* to connect with our Senior Trade Desk\n\n" +
         "🌐 Website: https://greatestoat838-create.github.io/KTA";
}

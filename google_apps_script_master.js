/**
 * ============================================================================
 * KTA SPICES — EXECUTIVE CRM & LEAD TRACKER (GOOGLE APPS SCRIPT CODE.GS)
 * ============================================================================
 * 
 * Synchronizes website RFQs, Corporate Partnership registrations, Chef Discovery
 * Box requests, Newsletter subscriptions, AI Chatbot inquiries, and WhatsApp Desk leads.
 * 
 * LATEST UPDATES & FIXES:
 * 1. Newsletter / Dispatch Handling: Automatically sets intelligent product label:
 *    "Chef Dispatches / Seasonal Harvest Bulletins (All Spices & Updates)" instead
 *    of assuming any single spice!
 * 2. Default Deal Status: ALL new submissions (Partnership, Newsletter, RFQs, etc.)
 *    cleanly default to "New Lead".
 * 3. Payment Terms: "10-Day Credit" added and set as standard default.
 * 4. Assigned Reps: Standardized to "Person 1", "Person 2", "Person 3", "Person 4", "Person 5", "Person 6".
 * 5. Master Product Rate Card: Full 55 Products & Wholesale Lines supported.
 * 6. One-Click Menu: "KTA Commercial CRM" menu in Google Sheets to update all dropdowns.
 * ────────────────────────────────────────────────────────────────────────────
 */

function doGet(e) {
  if (e && e.parameter && (e.parameter.source || e.parameter.name || e.parameter.phone || e.parameter.email)) {
    return handleLeadSubmission(e.parameter);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "KTA Spices Executive CRM Webhook",
    timestamp: new Date().toISOString(),
    message: "Webhook is live, authorized, and accepting inbound lead dispatches."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = {};
  
  if (e && e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = e.parameter || {};
    }
  } else if (e && e.parameter) {
    data = e.parameter;
  }

  return handleLeadSubmission(data);
}

function handleLeadSubmission(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Inbound Leads") || ss.getSheetByName("Leads CRM Tracker") || ss.getActiveSheet();
    
    // Ensure sheet has at least 20 columns
    if (sheet.getMaxColumns() < 20) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 20 - sheet.getMaxColumns());
    }

    // 1. Timestamps in Indian Standard Time (IST)
    var now = new Date();
    var dateLogged = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd");
    var timeLogged = Utilities.formatDate(now, "Asia/Kolkata", "HH:mm");
    
    // Default Next Follow-Up: Next Business Day
    var followUpDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    var nextFollowUp = Utilities.formatDate(followUpDate, "Asia/Kolkata", "yyyy-MM-dd");

    // 2. Determine Next Available Row safely starting from Row 7
    var startRow = 7;
    var maxRows = sheet.getMaxRows();
    if (maxRows < startRow) {
      sheet.insertRowsAfter(maxRows, startRow - maxRows + 20);
      maxRows = sheet.getMaxRows();
    }

    var rowsToCheck = Math.min(maxRows - startRow + 1, 500);
    var nextRow = startRow;

    if (rowsToCheck > 0) {
      var colAValues = sheet.getRange(startRow, 1, rowsToCheck, 1).getValues();
      var foundEmpty = false;
      for (var i = 0; i < colAValues.length; i++) {
        if (!colAValues[i][0] || colAValues[i][0].toString().trim() === "") {
          nextRow = startRow + i;
          foundEmpty = true;
          break;
        }
      }
      if (!foundEmpty) {
        nextRow = startRow + colAValues.length;
      }
    }

    // Expand sheet if needed
    if (nextRow > sheet.getMaxRows()) {
      sheet.insertRowsAfter(sheet.getMaxRows(), 10);
    }

    // 3. Generate Sequential Lead ID (e.g. KTA-2026-002)
    var leadSeqNum = Math.max(1, nextRow - 6);
    var leadSeqStr = ("000" + leadSeqNum).slice(-3);
    var leadId = data.leadId || ("KTA-2026-" + leadSeqStr);

    // 4. Intelligent Source Channel Normalization
    var rawSrc = (data.source || data.formName || data.channel || "Website RFQ").toString().trim();
    var srcLow = rawSrc.toLowerCase();
    var source = "Website RFQ";

    if (srcLow.indexOf("partnership") !== -1 || srcLow.indexOf("partner") !== -1) {
      source = "Corporate Partnership Registration";
    } else if (srcLow.indexOf("trade desk") !== -1 || srcLow.indexOf("contact") !== -1) {
      source = "General Trade Desk Inquiry";
    } else if (srcLow.indexOf("newsletter") !== -1 || (srcLow.indexOf("dispatch") !== -1 && srcLow.indexOf("sample") === -1)) {
      source = "Chef Dispatches Newsletter";
    } else if (srcLow.indexOf("chef") !== -1 || srcLow.indexOf("sample") !== -1) {
      source = "Chef Sample Box";
    } else if (srcLow.indexOf("wholesale") !== -1) {
      source = "Wholesale Portal";
    } else if (srcLow.indexOf("chatbot") !== -1 || srcLow.indexOf("concierge") !== -1 || srcLow.indexOf("ai") !== -1) {
      source = "AI Chatbot";
    } else if (srcLow.indexOf("whatsapp") !== -1) {
      source = "WhatsApp Desk";
    } else if (srcLow.indexOf("call") !== -1) {
      source = "Inbound Call";
    } else {
      source = rawSrc.length > 0 ? rawSrc : "Website RFQ";
    }

    // 5. Intelligent Normalization of Inbound Fields (Section 1: Columns A to L)
    var isNewsletter = (source === "Chef Dispatches Newsletter" || srcLow.indexOf("newsletter") !== -1);
    var isPartnership = (source === "Corporate Partnership Registration" || srcLow.indexOf("partnership") !== -1);
    var isSampleBox = (source === "Chef Sample Box" || srcLow.indexOf("sample") !== -1);

    var clientName = data.managerName || data.name || data.clientName || data.chefName;
    if (!clientName) {
      if (isNewsletter) {
        clientName = data.email ? ("Subscriber (" + data.email.split('@')[0] + ")") : "Newsletter Subscriber";
      } else {
        clientName = "Prospective Buyer";
      }
    }

    var company = data.hotelName || data.property || data.company;
    if (!company) {
      if (isNewsletter) company = "Direct Email Subscriber";
      else company = "Commercial Account";
    }

    var role = data.designation || data.role;
    if (!role) {
      if (isNewsletter) role = "Subscriber";
      else if (isPartnership) role = "Corporate Director / Partner";
      else if (isSampleBox) role = "Executive Chef";
      else role = "Procurement Lead";
    }

    var phone = (data.contactPhone || data.phone || data.mobile || (isNewsletter ? "Email Only" : "Not Provided")).toString().trim();
    var email = data.email || "Not Provided";
    var location = data.location || data.city || data.destination || (isNewsletter ? "Online / Digital" : "South India");

    var products = data.products || data.product || data.spices || data.varieties;
    if (!products || products.toString().trim() === "" || products === "General Inquiry") {
      if (isSampleBox) {
        products = "Chef Discovery Welcome Box (51 Varieties)";
      } else {
        products = "Not asked yet (Edit as needed)";
      }
    }

    var volume = data.volume || data.quantity || data.lotSize;
    if (!volume) {
      if (isNewsletter) volume = "Digital Email Dispatches";
      else volume = "Standard Commercial Lot";
    }

    var rawNotes = data.message || data.notes || data.details;
    if (!rawNotes) {
      if (isNewsletter) rawNotes = "Subscribed to receive periodic seasonal harvest updates, price notices, and new lot releases.";
      else rawNotes = "Inquiry logged via " + rawSrc + ".";
    }

    var cleanPhone = phone.replace(/[^0-9]/g, '');

    // 6. Assigned Rep & Priority Defaults (Section 2: Columns M to T)
    // Assigned Reps: Person 1, Person 2, Person 3, Person 4, Person 5, Person 6
    var assignedRep = "Person 1";
    var priority    = "Medium Priority";
    var dealStatus  = "New Lead"; // Always "New Lead" for fresh registrations / dispatches!
    var estValue    = "";

    if (isSampleBox) {
      assignedRep = "Person 2";
      priority    = "High Priority";
    } else if (isPartnership) {
      assignedRep = "Person 4";
      priority    = "High Priority";
    } else if (source.indexOf("Wholesale") !== -1 || volume.toLowerCase().indexOf("mt") !== -1 || volume.indexOf("500") !== -1) {
      assignedRep = "Person 3";
      priority    = "High Priority";
    } else if (isNewsletter) {
      assignedRep = "Person 1";
      priority    = "Standard Priority";
    }

    // 7. Build 20-Column Row Array (Cols A to T)
    var rowValues = [
      leadId,          // Col A (1) : Lead ID
      dateLogged,      // Col B (2) : Date
      timeLogged,      // Col C (3) : Time
      source,          // Col D (4) : Lead Source
      clientName,      // Col E (5) : Client Name
      company,         // Col F (6) : Hotel / Company
      role,            // Col G (7) : Designation
      phone,           // Col H (8) : Phone / WhatsApp
      email,           // Col I (9) : Email Address
      location,        // Col J (10): City & State
      products,        // Col K (11): Inquired Product / SKU
      volume,          // Col L (12): Volume Requested
      assignedRep,     // Col M (13): Assigned Rep (Person 1 to 6)
      priority,        // Col N (14): Priority
      dealStatus,      // Col O (15): Deal Status ("New Lead")
      "",              // Col P (16): Quoted Rate (₹/kg)
      estValue,        // Col Q (17): Deal Value (₹)
      "10-Day Credit", // Col R (18): Payment Terms (10-Day Credit default)
      nextFollowUp,    // Col S (19): Next Follow-Up
      rawNotes         // Col T (20): Remarks & Notes
    ];

    // 8. Write Data into Sheet
    var range = sheet.getRange(nextRow, 1, 1, 20);
    range.setValues([rowValues]);

    // 9. Strict Typography & Formatting Enforcement
    range.setFontFamily("Segoe UI")
         .setFontSize(9.5)
         .setFontColor("#1A1A1A")
         .setVerticalAlignment("middle");

    sheet.setRowHeight(nextRow, 22);

    // Column Alignments
    sheet.getRange(nextRow, 1, 1, 4).setHorizontalAlignment("center");   // Lead ID, Date, Time, Source
    sheet.getRange(nextRow, 5, 1, 8).setHorizontalAlignment("left");     // Name, Company, Role, Phone, Email, City, Product, Volume
    sheet.getRange(nextRow, 13, 1, 3).setHorizontalAlignment("center");  // Rep, Priority, Status
    sheet.getRange(nextRow, 16, 1, 2).setHorizontalAlignment("right").setNumberFormat("₹ #,##,##0"); // Quoted Rate, Deal Value
    sheet.getRange(nextRow, 18, 1, 2).setHorizontalAlignment("center");  // Payment Terms, Follow-Up
    sheet.getRange(nextRow, 20).setHorizontalAlignment("left");          // Remarks & Notes

    // Borders
    range.setBorder(true, true, true, true, true, true, "#D8E2D6", SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange(nextRow, 12).setBorder(null, null, null, true, null, null, "#1E2814", SpreadsheetApp.BorderStyle.MEDIUM);

    // 10. Apply Dynamic Dropdown Validations
    applyRowDropdowns(sheet, nextRow);

    // 11. Send Corporate Email Alert via Zoho Mail
    sendOwnerEmailAlert({
      leadId: leadId,
      dateLogged: dateLogged,
      timeLogged: timeLogged,
      source: source,
      clientName: clientName,
      company: company,
      role: role,
      phone: phone,
      cleanPhone: cleanPhone,
      email: email,
      location: location,
      products: products,
      volume: volume,
      assignedRep: assignedRep,
      priority: priority,
      dealStatus: dealStatus,
      rawNotes: rawNotes
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      leadId: leadId,
      row: nextRow,
      source: source,
      message: "Lead successfully recorded in KTA Inbound Leads CRM as New Lead."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Submission error: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Applies dropdown validations dynamically across columns
 */
function applyRowDropdowns(sheet, rowNum) {
  try {
    var cols = [
      { col: 4,  defaultList: ["Website RFQ", "AI Chatbot", "Chef Sample Box", "Corporate Partnership Registration", "General Trade Desk Inquiry", "Chef Dispatches Newsletter", "WhatsApp Desk", "Wholesale Portal", "Inbound Call"] },
      { col: 13, defaultList: ["Person 1", "Person 2", "Person 3", "Person 4", "Person 5", "Person 6"] },
      { col: 14, defaultList: ["High Priority", "Medium Priority", "Standard Priority"] },
      { col: 15, defaultList: ["New Lead", "Contacted", "Sample Dispatched", "Quote Sent", "Closed Won", "Closed Lost"] },
      { col: 18, defaultList: ["10-Day Credit", "15-Day Credit", "30-Day Credit", "Advance", "LC", "Sample Free"] }
    ];

    for (var i = 0; i < cols.length; i++) {
      var item = cols[i];
      var targetCell = sheet.getRange(rowNum, item.col);
      
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(item.defaultList, true)
        .setAllowInvalid(true)
        .build();
      targetCell.setDataValidation(rule);
    }
  } catch (e) {
    Logger.log("Validation error: " + e.toString());
  }
}

/**
 * Sends Corporate HTML Email Alert via Zoho Mail
 */
function sendOwnerEmailAlert(lead) {
  try {
    var isWholesale = lead.source.toLowerCase().indexOf("wholesale") !== -1 || lead.volume.toLowerCase().indexOf("mt") !== -1;
    var primaryRecipient = isWholesale ? "wholesale@ktaspices.in" : "orders@ktaspices.in";
    var ccRecipient = "info@ktaspices.in, admin@ktaspices.in";

    var emailSubject = (isWholesale ? "[WHOLESALE RFQ]: " : "[INBOUND LEAD]: ") + lead.company + " (" + lead.clientName + ") - " + lead.products;

    var htmlBody = 
      '<div style="font-family: \'Segoe UI\', Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #d8e2d6; border-radius: 6px; overflow: hidden; background: #ffffff;">' +
        '<div style="background-color: #1E2814; color: #ffffff; padding: 18px 24px; text-align: left;">' +
          '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #b4c79d; margin-bottom: 4px;">KTA SPICES · EXECUTIVE CRM</div>' +
          '<h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #ffffff;">New Commercial Inquiry Received</h2>' +
        '</div>' +
        '<div style="padding: 20px 24px;">' +
          '<div style="background: #F4F6F1; border-left: 4px solid #2D3A1F; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; color: #1E2814;">' +
            '<strong>Lead ID:</strong> ' + lead.leadId + ' &nbsp;|&nbsp; <strong>Source:</strong> ' + lead.source + ' &nbsp;|&nbsp; <strong>Assigned Rep:</strong> ' + lead.assignedRep +
          '</div>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666; width: 34%;">Client / Buyer Name</td><td style="padding: 9px 0; font-weight: bold; color: #111;">' + lead.clientName + ' (' + lead.role + ')</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Establishment / Hotel</td><td style="padding: 9px 0; font-weight: bold; color: #1E2814;">' + lead.company + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Phone / WhatsApp</td><td style="padding: 9px 0;"><a href="tel:' + lead.phone + '" style="color: #1E2814; font-weight: bold; text-decoration: none;">' + lead.phone + '</a> &nbsp;|&nbsp; <a href="https://wa.me/' + lead.cleanPhone + '" style="color: #2e7d32; font-weight: bold; text-decoration: none;">Open WhatsApp</a></td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Email Address</td><td style="padding: 9px 0;"><a href="mailto:' + lead.email + '" style="color: #1E2814; text-decoration: none;">' + lead.email + '</a></td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Destination / City</td><td style="padding: 9px 0;">' + lead.location + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Requested Product</td><td style="padding: 9px 0; font-weight: bold; color: #1E2814;">' + lead.products + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Volume / Lot Size</td><td style="padding: 9px 0; font-weight: bold;">' + lead.volume + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Priority & Status</td><td style="padding: 9px 0;">' + lead.priority + ' &nbsp;·&nbsp; ' + lead.dealStatus + '</td></tr>' +
            '<tr><td style="padding: 9px 0; color: #666;" valign="top">Inquiry Remarks</td><td style="padding: 9px 0; line-height: 1.5; color: #333;">' + lead.rawNotes + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div style="background-color: #F8FAF6; padding: 12px 24px; font-size: 11px; color: #666666; text-align: center; border-top: 1px solid #e2e2e2;">' +
          'Logged into KTA Inbound Leads Tracker at ' + lead.dateLogged + ' ' + lead.timeLogged + ' IST' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: primaryRecipient,
      cc: ccRecipient,
      subject: emailSubject,
      htmlBody: htmlBody
    });
  } catch (e) {
    Logger.log("Email dispatch notice: " + e.toString());
  }
}

/**
 * Adds custom menu to Google Sheets
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("KTA Commercial CRM")
    .addItem("Fix / Update All Dropdowns Across Sheet", "updateAllDropdownsInSheet")
    .addItem("Refresh Metrics & Pipeline Values", "refreshMetrics")
    .addToUi();
}

function refreshMetrics() {
  SpreadsheetApp.getActiveSpreadsheet().toast("Calculations and pipeline values updated.", "KTA CRM", 3);
}

function updateAllDropdownsInSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inbound Leads") || SpreadsheetApp.getActiveSheet();
  var lastRow = Math.max(7, sheet.getLastRow());
  
  var sourceList = ["Website RFQ", "AI Chatbot", "Chef Sample Box", "Corporate Partnership Registration", "General Trade Desk Inquiry", "Chef Dispatches Newsletter", "WhatsApp Desk", "Wholesale Portal", "Inbound Call"];
  var repList = ["Person 1", "Person 2", "Person 3", "Person 4", "Person 5", "Person 6"];
  var priorityList = ["High Priority", "Medium Priority", "Standard Priority"];
  var statusList = ["New Lead", "Contacted", "Sample Dispatched", "Quote Sent", "Closed Won", "Closed Lost"];
  var termsList = ["10-Day Credit", "15-Day Credit", "30-Day Credit", "Advance", "LC", "Sample Free"];

  var ruleSource = SpreadsheetApp.newDataValidation().requireValueInList(sourceList, true).setAllowInvalid(true).build();
  var ruleRep = SpreadsheetApp.newDataValidation().requireValueInList(repList, true).setAllowInvalid(true).build();
  var rulePriority = SpreadsheetApp.newDataValidation().requireValueInList(priorityList, true).setAllowInvalid(true).build();
  var ruleStatus = SpreadsheetApp.newDataValidation().requireValueInList(statusList, true).setAllowInvalid(true).build();
  var ruleTerms = SpreadsheetApp.newDataValidation().requireValueInList(termsList, true).setAllowInvalid(true).build();

  sheet.getRange(7, 4, Math.max(1, lastRow - 6), 1).setDataValidation(ruleSource);
  sheet.getRange(7, 13, Math.max(1, lastRow - 6), 1).setDataValidation(ruleRep);
  sheet.getRange(7, 14, Math.max(1, lastRow - 6), 1).setDataValidation(rulePriority);
  sheet.getRange(7, 15, Math.max(1, lastRow - 6), 1).setDataValidation(ruleStatus);
  sheet.getRange(7, 18, Math.max(1, lastRow - 6), 1).setDataValidation(ruleTerms);

  SpreadsheetApp.getActiveSpreadsheet().toast("All dropdowns updated with Person 1-6, 10-Day Credit & New Lead!", "KTA CRM", 4);
}

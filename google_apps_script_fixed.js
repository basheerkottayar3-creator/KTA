/**
 * ============================================================================
 * KTA SPICES - GOOGLE APPS SCRIPT CRM CONNECTOR (21-COLUMN MASTER SYNC)
 * ============================================================================
 * 
 * Automatically captures all inbound leads from:
 * 1. AI Trade Concierge Chatbot
 * 2. Website Fast RFQ Forms
 * 3. Executive Chef Discovery Box Registration
 * 4. WhatsApp Trade Desk Inquiries
 * 5. Wholesale 500kg+ Commodity RFQs
 * 6. Footer Newsletter & Catalog Dispatches
 * 
 * Target Sheet: "Leads CRM Tracker" in Google Sheets
 * 
 * COLUMN MAPPING (21 Standard Columns matching KTA_Executive_Marketing_CRM_Tracker.xlsx):
 * ────────────────────────────────────────────────────────────────────────────
 * SECTION A: INBOUND INQUIRY DATA (SYSTEM AUTO-FILLED)
 *   Col A (1) : Lead ID (e.g., KTA-2026-081)
 *   Col B (2) : Date Logged (YYYY-MM-DD)
 *   Col C (3) : Time (HH:MM IST)
 *   Col D (4) : Channel / Source (Website RFQ / AI Chatbot / Chef Box / etc.)
 *   Col E (5) : Client / Buyer Name
 *   Col F (6) : Property / Hotel / Company
 *   Col G (7) : Designation / Role
 *   Col H (8) : Phone Number
 *   Col I (9) : Email Address
 *   Col J (10): City & State
 *   Col K (11): Inquired Product / SKU
 *   Col L (12): Volume Requested
 * 
 * SECTION B: SALES WORKFLOW & PIPELINE (EMPLOYEE ACTION REQUIRED)
 *   Col M (13): Assigned Sales Rep (Auto-routed based on channel/type)
 *   Col N (14): Priority Tier (High Priority / Medium Priority / Standard)
 *   Col O (15): Deal Stage / Status (Default: "New Inquiry" or "Sample Dispatched")
 *   Col P (16): Quoted Rate (₹/kg) (Blank for Sales Rep input)
 *   Col Q (17): Final Deal Value (₹) (Blank or Estimated value)
 *   Col R (18): Payment Terms (Default: "15-Day Credit" or "Advance")
 *   Col S (19): Sample AWB / Dispatch (AWB number / dispatch status)
 *   Col T (20): Next Follow-Up (Default: Next Business Day)
 *   Col U (21): Sales Notes & Call Remarks (Raw client requirements)
 * ────────────────────────────────────────────────────────────────────────────
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads CRM Tracker") || ss.getSheetByName("KTA Active Inquiries & CRM") || ss.getActiveSheet();
    
    // Parse incoming JSON payload
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

    // Generate Timestamps in Indian Standard Time (IST)
    var now = new Date();
    var dateLogged = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd");
    var timeLogged = Utilities.formatDate(now, "Asia/Kolkata", "HH:mm");
    
    // Next business day calculation for Follow-Up
    var followUpDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    var nextFollowUp = Utilities.formatDate(followUpDate, "Asia/Kolkata", "yyyy-MM-dd");

    // Generate Sequential Lead ID (e.g. KTA-2026-081)
    var lastRow = sheet.getLastRow();
    var leadSeq = ("000" + Math.max(1, lastRow - 5)).slice(-3);
    var leadId = data.leadId || ("KTA-2026-" + leadSeq);

    // Inbound Lead Details (Section A)
    var source      = data.source || data.formName || data.channel || "Website RFQ";
    var clientName  = data.managerName || data.name || data.clientName || data.chefName || "Prospective Buyer";
    var company     = data.hotelName || data.property || data.company || "Direct Commercial Account";
    var role        = data.designation || data.role || (source.indexOf("Chef") !== -1 ? "Executive Chef" : "Procurement Lead");
    var phone       = (data.contactPhone || data.phone || data.mobile || "Not Provided").toString().trim();
    var email       = data.email || "Not Provided";
    var location    = data.location || data.city || data.destination || "South India";
    var products    = data.products || data.product || data.spices || data.varieties || "Tellicherry Black Pepper / Single-Origin Spices";
    var volume      = data.volume || data.quantity || data.lotSize || "Standard Commercial Lot";
    var rawNotes    = data.message || data.notes || data.details || "Inquiry logged via website portal.";

    // Clean Phone for 1-Tap WhatsApp Link
    var cleanPhone = phone.replace(/[^0-9]/g, '');

    // Intelligent Rep Routing & Default Settings (Section B)
    var assignedRep = "Anand R. (Trade Desk)";
    var priority    = "Medium Priority";
    var dealStage   = "New Inquiry";
    var sampleAwb   = "Not Applicable";
    var estValue    = "";

    var srcLow = source.toLowerCase();
    var prodLow = products.toLowerCase();

    if (srcLow.indexOf("chef") !== -1 || role.toLowerCase().indexOf("chef") !== -1) {
      assignedRep = "Kavitha S. (Hospitality)";
      priority    = "High Priority";
      dealStage   = "Sample Dispatched";
      sampleAwb   = "Pending Courier Dispatch";
    } else if (srcLow.indexOf("wholesale") !== -1 || volume.toLowerCase().indexOf("mt") !== -1 || volume.indexOf("500") !== -1) {
      assignedRep = "Suresh M. (Wholesale)";
      priority    = "High Priority";
      dealStage   = "New Inquiry";
    } else if (company.toLowerCase().indexOf("taj") !== -1 || company.toLowerCase().indexOf("itc") !== -1 || company.toLowerCase().indexOf("leela") !== -1 || company.toLowerCase().indexOf("marriott") !== -1) {
      assignedRep = "Praveen K. (Key Accounts)";
      priority    = "High Priority";
      dealStage   = "New Inquiry";
    }

    // Construct 21-Column Row Array
    var rowValues = [
      leadId,          // Col A: Lead ID
      dateLogged,      // Col B: Date Logged
      timeLogged,      // Col C: Time
      source,          // Col D: Channel / Source
      clientName,      // Col E: Client / Buyer Name
      company,         // Col F: Property / Hotel / Company
      role,            // Col G: Designation / Role
      phone,           // Col H: Phone Number
      email,           // Col I: Email Address
      location,        // Col J: City & State
      products,        // Col K: Inquired Product / SKU
      volume,          // Col L: Volume Requested
      assignedRep,     // Col M: Assigned Sales Rep
      priority,        // Col N: Priority Tier
      dealStage,       // Col O: Deal Stage / Status
      "",              // Col P: Quoted Rate (₹/kg) [For Employee]
      estValue,        // Col Q: Final Deal Value (₹) [For Employee]
      "15-Day Credit", // Col R: Payment Terms
      sampleAwb,       // Col S: Sample AWB / Dispatch
      nextFollowUp,    // Col T: Next Follow-Up
      rawNotes         // Col U: Sales Notes & Remarks
    ];

    // Insert new row into Google Sheet
    var nextRow = Math.max(7, sheet.getLastRow() + 1);
    var range = sheet.getRange(nextRow, 1, 1, rowValues.length);
    range.setValues([rowValues]);

    // Apply Dropdown Validations to the new row
    applyRowValidation(sheet, nextRow);

    // Send Instant Email Notification to Zoho Mail / Owner
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
      dealStage: dealStage,
      rawNotes: rawNotes
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      leadId: leadId,
      message: "Lead successfully recorded into KTA CRM."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Applies native Google Sheet Data Validation dropdowns to the newly inserted row
 */
function applyRowValidation(sheet, rowNum) {
  try {
    // Col M (13): Assigned Sales Rep
    var ruleRep = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Anand R. (Trade Desk)", "Kavitha S. (Hospitality)", "Suresh M. (Wholesale)", "Praveen K. (Key Accounts)"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 13).setDataValidation(ruleRep);

    // Col N (14): Priority Tier
    var rulePriority = SpreadsheetApp.newDataValidation()
      .requireValueInList(["High Priority", "Medium Priority", "Standard Priority"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 14).setDataValidation(rulePriority);

    // Col O (15): Deal Stage / Status
    var ruleStage = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New Inquiry", "Contacted / In Touch", "Sample Dispatched", "Commercial Quote Sent", "Closed Won", "Closed Lost", "Disqualified"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 15).setDataValidation(ruleStage);

    // Col R (18): Payment Terms
    var ruleTerms = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Advance Bank Transfer", "15-Day Credit", "30-Day Revolving", "Letter of Credit (LC)", "Cash on Delivery", "Complimentary"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 18).setDataValidation(ruleTerms);

  } catch (e) {
    Logger.log("Validation rule error: " + e.toString());
  }
}

/**
 * Sends Clean Corporate HTML Email Alert via Zoho Mail
 */
function sendOwnerEmailAlert(lead) {
  try {
    var isWholesale = lead.source.toLowerCase().indexOf("wholesale") !== -1 || lead.volume.toLowerCase().indexOf("mt") !== -1;
    var primaryRecipient = isWholesale ? "wholesale@ktaspices.in" : "orders@ktaspices.in";
    var ccRecipient = "info@ktaspices.in, admin@ktaspices.in";

    var emailSubject = (isWholesale ? "[WHOLESALE RFQ]: " : "[NEW INBOUND LEAD]: ") + lead.company + " (" + lead.clientName + ") - " + lead.products;

    var htmlBody = 
      '<div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #dcdcdc; border-radius: 6px; overflow: hidden; background: #ffffff;">' +
        '<div style="background-color: #242F17; color: #ffffff; padding: 18px 24px; text-align: left;">' +
          '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #b4c79d; margin-bottom: 4px;">KTA SPICES · EXECUTIVE CRM</div>' +
          '<h2 style="margin: 0; font-size: 19px; font-weight: bold;">New Commercial Inquiry Received</h2>' +
        '</div>' +
        '<div style="padding: 20px 24px;">' +
          '<div style="background: #F4F6F0; border-left: 4px solid #3D4C25; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; color: #242F17;">' +
            '<strong>Lead ID:</strong> ' + lead.leadId + ' &nbsp;|&nbsp; <strong>Channel:</strong> ' + lead.source + ' &nbsp;|&nbsp; <strong>Assigned Rep:</strong> ' + lead.assignedRep +
          '</div>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666; width: 34%;">Client / Buyer Name</td><td style="padding: 9px 0; font-weight: bold; color: #111;">' + lead.clientName + ' (' + lead.role + ')</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Establishment / Hotel</td><td style="padding: 9px 0; font-weight: bold; color: #242F17;">' + lead.company + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Phone / WhatsApp</td><td style="padding: 9px 0;"><a href="tel:' + lead.phone + '" style="color: #242F17; font-weight: bold; text-decoration: none;">' + lead.phone + '</a> &nbsp;|&nbsp; <a href="https://wa.me/' + lead.cleanPhone + '" style="color: #2e7d32; font-weight: bold; text-decoration: none;">Open WhatsApp</a></td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Email Address</td><td style="padding: 9px 0;"><a href="mailto:' + lead.email + '" style="color: #242F17; text-decoration: none;">' + lead.email + '</a></td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Destination / City</td><td style="padding: 9px 0;">' + lead.location + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Requested Product</td><td style="padding: 9px 0; font-weight: bold; color: #242F17;">' + lead.products + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Volume / Lot Size</td><td style="padding: 9px 0; font-weight: bold;">' + lead.volume + '</td></tr>' +
            '<tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 9px 0; color: #666;">Priority & Stage</td><td style="padding: 9px 0;">' + lead.priority + ' &nbsp;·&nbsp; ' + lead.dealStage + '</td></tr>' +
            '<tr><td style="padding: 9px 0; color: #666;" valign="top">Inquiry Remarks</td><td style="padding: 9px 0; line-height: 1.5; color: #333;">' + lead.rawNotes + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div style="background-color: #F8F9F5; padding: 12px 24px; font-size: 11px; color: #666666; text-align: center; border-top: 1px solid #e2e2e2;">' +
          'Logged into KTA Leads CRM Tracker at ' + lead.dateLogged + ' ' + lead.timeLogged + ' IST' +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: primaryRecipient,
      cc: ccRecipient,
      subject: emailSubject,
      htmlBody: htmlBody
    });
  } catch (e) {
    Logger.log("Email dispatch error: " + e.toString());
  }
}

/**
 * Adds a custom menu to Google Sheets for Sales Management
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("KTA Commercial CRM")
    .addItem("Refresh Pipeline Calculations", "refreshMetrics")
    .addItem("Apply Dropdowns to All Rows", "applyDropdownsToEntireSheet")
    .addToUi();
}

function refreshMetrics() {
  SpreadsheetApp.getActiveSpreadsheet().toast("Calculations and pipeline values updated.", "KTA CRM", 3);
}

function applyDropdownsToEntireSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads CRM Tracker") || SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  for (var r = 7; r <= lastRow; r++) {
    applyRowValidation(sheet, r);
  }
  SpreadsheetApp.getActiveSpreadsheet().toast("Dropdowns applied to rows 7 through " + lastRow, "KTA CRM", 4);
}

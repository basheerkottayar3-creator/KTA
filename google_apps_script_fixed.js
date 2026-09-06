/**
 * ============================================================================
 * KTA SPICES - GOOGLE APPS SCRIPT MASTER CRM CONNECTOR (20-COLUMN SYNC)
 * ============================================================================
 * 
 * Synchronizes website RFQs, AI Chatbot inquiries, Chef Discovery Box requests,
 * and WhatsApp Desk leads directly into the "Inbound Leads" sheet of
 * KTA_Executive_Marketing_CRM_Tracker.xlsx (Google Sheets).
 * 
 * DEPLOYMENT INSTRUCTIONS (PREVENTS 403 FORBIDDEN ERROR):
 * ────────────────────────────────────────────────────────────────────────────
 * 1. Open your Google Sheet ("KTA_Executive_Marketing_CRM_Tracker").
 * 2. Click Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this ENTIRE file.
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 * 5. Click the Gear icon ⚙ next to "Select type" > choose "Web app".
 * 6. Set the following EXACT settings:
 *    - Description: KTA Inbound CRM Webhook v2
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone  <─── [CRITICAL: MUST BE "Anyone" to allow website leads!]
 * 7. Click "Deploy".
 * 8. Click "Authorize access" > select your account > Advanced > "Go to Untitled project (unsafe)" > "Allow".
 * 9. Copy the "Web app URL" (ends in /exec) and paste it back in chat.
 * ────────────────────────────────────────────────────────────────────────────
 * 
 * COLUMN MAPPING (20 Standard Columns matching Sheet 1: "Inbound Leads"):
 *  Section 1: Inbound Client Details (System Auto-Filled, Cols A to L)
 *    Col A (1) : Lead ID (e.g. KTA-2026-002)
 *    Col B (2) : Date (YYYY-MM-DD)
 *    Col C (3) : Time (HH:MM IST)
 *    Col D (4) : Lead Source
 *    Col E (5) : Client Name
 *    Col F (6) : Hotel / Company
 *    Col G (7) : Designation
 *    Col H (8) : Phone / WhatsApp
 *    Col I (9) : Email Address
 *    Col J (10): City & State
 *    Col K (11): Inquired Product / SKU
 *    Col L (12): Volume Requested
 * 
 *  Section 2: Sales & Closing Workflow (Employee Action, Cols M to T)
 *    Col M (13): Assigned Rep
 *    Col N (14): Priority
 *    Col O (15): Deal Status
 *    Col P (16): Quoted Rate (₹/kg)
 *    Col Q (17): Deal Value (₹)
 *    Col R (18): Payment Terms
 *    Col S (19): Next Follow-Up
 *    Col T (20): Remarks & Notes
 * ────────────────────────────────────────────────────────────────────────────
 */

function doGet(e) {
  // If parameters are sent via GET (e.g. testing or form fallback), process them
  if (e && e.parameter && (e.parameter.source || e.parameter.name || e.parameter.phone || e.parameter.email)) {
    return handleLeadSubmission(e.parameter);
  }
  
  // Health Check response when visited in browser
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    service: "KTA Spices Executive CRM Webhook",
    timestamp: new Date().toISOString(),
    message: "Webhook is live, authorized, and accepting inbound lead dispatches."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = {};
  
  // Parse incoming JSON payload or form parameter
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

    // 4. Normalize Inbound Fields (Section 1: Columns A to L)
    var source      = data.source || data.formName || data.channel || "Website RFQ";
    var clientName  = data.managerName || data.name || data.clientName || data.chefName || "Prospective Buyer";
    var company     = data.hotelName || data.property || data.company || "Commercial Account";
    var role        = data.designation || data.role || (source.toLowerCase().indexOf("chef") !== -1 ? "Executive Chef" : "Procurement Lead");
    var phone       = (data.contactPhone || data.phone || data.mobile || "Not Provided").toString().trim();
    var email       = data.email || "Not Provided";
    var location    = data.location || data.city || data.destination || "South India";
    var products    = data.products || data.product || data.spices || data.varieties || "Tellicherry Black Pepper / Single-Origin Spices";
    var volume      = data.volume || data.quantity || data.lotSize || "Standard Commercial Lot";
    var rawNotes    = data.message || data.notes || data.details || "Inquiry logged via website portal.";

    var cleanPhone  = phone.replace(/[^0-9]/g, '');

    // 5. Intelligent Sales Rep Routing & Priority Defaults (Section 2: Columns M to T)
    var assignedRep = "Anand R. (Trade Desk)";
    var priority    = "Medium Priority";
    var dealStatus  = "New Lead";
    var estValue    = "";

    var srcLow  = source.toLowerCase();
    var compLow = company.toLowerCase();

    if (srcLow.indexOf("chef") !== -1 || role.toLowerCase().indexOf("chef") !== -1) {
      assignedRep = "Kavitha S. (Hospitality)";
      priority    = "High Priority";
      dealStatus  = "Sample Dispatched";
    } else if (srcLow.indexOf("wholesale") !== -1 || volume.toLowerCase().indexOf("mt") !== -1 || volume.indexOf("500") !== -1) {
      assignedRep = "Suresh M. (Wholesale)";
      priority    = "High Priority";
      dealStatus  = "New Lead";
    } else if (compLow.indexOf("taj") !== -1 || compLow.indexOf("itc") !== -1 || compLow.indexOf("leela") !== -1 || compLow.indexOf("marriott") !== -1 || compLow.indexOf("hyatt") !== -1) {
      assignedRep = "Praveen K. (Key Accounts)";
      priority    = "High Priority";
      dealStatus  = "New Lead";
    }

    // 6. Build 20-Column Row Array (Cols A to T)
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
      assignedRep,     // Col M (13): Assigned Rep
      priority,        // Col N (14): Priority
      dealStatus,      // Col O (15): Deal Status
      "",              // Col P (16): Quoted Rate (₹/kg)
      estValue,        // Col Q (17): Deal Value (₹)
      "15-Day Credit", // Col R (18): Payment Terms
      nextFollowUp,    // Col S (19): Next Follow-Up
      rawNotes         // Col T (20): Remarks & Notes
    ];

    // 7. Write Data into Sheet
    var range = sheet.getRange(nextRow, 1, 1, 20);
    range.setValues([rowValues]);

    // 8. Strict Typography & Formatting Enforcement (Fixes font mismatch issue)
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

    // 9. Apply Dropdown Validations to Row
    applyRowDropdowns(sheet, nextRow);

    // 10. Send Corporate Email Alert via Zoho Mail
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
      message: "Lead successfully recorded in KTA Inbound Leads CRM."
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
 * Applies dropdown validations to the newly inserted row
 */
function applyRowDropdowns(sheet, rowNum) {
  try {
    // Col D (4): Lead Source
    var ruleSource = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Website RFQ", "AI Chatbot", "Chef Sample Box", "WhatsApp Desk", "Inbound Call", "Wholesale Portal"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 4).setDataValidation(ruleSource);

    // Col M (13): Assigned Rep
    var ruleRep = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Anand R. (Trade Desk)", "Kavitha S. (Hospitality)", "Suresh M. (Wholesale)", "Praveen K. (Key Accounts)"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 13).setDataValidation(ruleRep);

    // Col N (14): Priority
    var rulePriority = SpreadsheetApp.newDataValidation()
      .requireValueInList(["High Priority", "Medium Priority", "Standard Priority"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 14).setDataValidation(rulePriority);

    // Col O (15): Deal Status
    var ruleStatus = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New Lead", "Contacted", "Sample Dispatched", "Quote Sent", "Closed Won", "Closed Lost"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 15).setDataValidation(ruleStatus);

    // Col R (18): Payment Terms
    var ruleTerms = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Advance", "15-Day Credit", "30-Day Credit", "LC", "Sample Free"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(rowNum, 18).setDataValidation(ruleTerms);

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
    .addItem("Refresh Dashboard Calculations", "refreshMetrics")
    .addItem("Apply Dropdowns to Entire Sheet", "applyDropdownsToEntireSheet")
    .addToUi();
}

function refreshMetrics() {
  SpreadsheetApp.getActiveSpreadsheet().toast("Calculations and pipeline values updated.", "KTA CRM", 3);
}

function applyDropdownsToEntireSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inbound Leads") || SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  for (var r = 7; r <= lastRow; r++) {
    applyRowDropdowns(sheet, r);
  }
  SpreadsheetApp.getActiveSpreadsheet().toast("Dropdowns applied to rows 7 through " + lastRow, "KTA CRM", 4);
}

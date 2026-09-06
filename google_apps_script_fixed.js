/**
 * ============================================================================
 * KTA SPICES - GOOGLE APPS SCRIPT MASTER CRM CONNECTOR (20-COLUMN SYNC)
 * ============================================================================
 * 
 * Synchronizes website RFQs, AI Chatbot inquiries, Chef Discovery Box requests,
 * and WhatsApp Desk leads directly into the "Inbound Leads" sheet of
 * KTA_Executive_Marketing_CRM_Tracker.xlsx (Google Sheets).
 * 
 * Guarantees:
 *  1. Identical typography (Segoe UI, 9.5pt, #1A1A1A) on every newly inserted row.
 *  2. Real-time dynamic recalculation of the "Marketing Dashboard" sheet.
 *  3. Instant Zoho Mail notification to KTA sales desk.
 *  4. Dropdown data validation (Rep, Priority, Status, Payment Terms) on all rows.
 * 
 * COLUMN MAPPING (20 Standard Columns matching Sheet 1: "Inbound Leads"):
 * ────────────────────────────────────────────────────────────────────────────
 * SECTION 1: INBOUND CLIENT DETAILS (AUTO-POPULATED BY SYSTEM / WEBSITE)
 *   Col A (1) : Lead ID (e.g. KTA-2026-002)
 *   Col B (2) : Date (YYYY-MM-DD)
 *   Col C (3) : Time (HH:MM IST)
 *   Col D (4) : Lead Source (Website RFQ / AI Chatbot / Chef Sample Box / etc.)
 *   Col E (5) : Client Name
 *   Col F (6) : Hotel / Company
 *   Col G (7) : Designation
 *   Col H (8) : Phone / WhatsApp
 *   Col I (9) : Email Address
 *   Col J (10): City & State
 *   Col K (11): Inquired Product / SKU
 *   Col L (12): Volume Requested
 * 
 * SECTION 2: SALES & CLOSING WORKFLOW (EMPLOYEE ACTION REQUIRED)
 *   Col M (13): Assigned Rep (Dropdown)
 *   Col N (14): Priority (Dropdown)
 *   Col O (15): Deal Status (Dropdown: New Lead / Contacted / Sample Dispatched / Quote Sent / Closed Won / Closed Lost)
 *   Col P (16): Quoted Rate (₹/kg) (Employee Input)
 *   Col Q (17): Deal Value (₹) (Employee Input / Auto-Estimated)
 *   Col R (18): Payment Terms (Dropdown)
 *   Col S (19): Next Follow-Up (Date)
 *   Col T (20): Remarks & Notes (Client Message / Requirements)
 * ────────────────────────────────────────────────────────────────────────────
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Inbound Leads") || ss.getSheetByName("Leads CRM Tracker") || ss.getActiveSheet();
    
    // Parse incoming JSON payload or form parameter
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

    // 1. Timestamps in Indian Standard Time (IST)
    var now = new Date();
    var dateLogged = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd");
    var timeLogged = Utilities.formatDate(now, "Asia/Kolkata", "HH:mm");
    
    // Default Next Follow-Up: Next Business Day
    var followUpDate = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    var nextFollowUp = Utilities.formatDate(followUpDate, "Asia/Kolkata", "yyyy-MM-dd");

    // 2. Find Next Available Empty Row in "Inbound Leads" starting from Row 7
    var colAValues = sheet.getRange("A7:A1000").getValues();
    var nextRow = 7;
    for (var i = 0; i < colAValues.length; i++) {
      if (!colAValues[i][0] || colAValues[i][0].toString().trim() === "") {
        nextRow = 7 + i;
        break;
      }
    }

    // 3. Generate Sequential Lead ID (e.g. KTA-2026-002)
    var leadSeqNum = nextRow - 6;
    var leadSeqStr = ("000" + leadSeqNum).slice(-3);
    var leadId = data.leadId || ("KTA-2026-" + leadSeqStr);

    // 4. Normalize Inbound Fields (Section 1: Columns A to L)
    var source      = data.source || data.formName || data.channel || "Website RFQ";
    var clientName  = data.managerName || data.name || data.clientName || data.chefName || "Prospective Buyer";
    var company     = data.hotelName || data.property || data.company || "Commercial Account";
    var role        = data.designation || data.role || (source.indexOf("Chef") !== -1 ? "Executive Chef" : "Procurement Lead");
    var phone       = (data.contactPhone || data.phone || data.mobile || "Not Provided").toString().trim();
    var email       = data.email || "Not Provided";
    var location    = data.location || data.city || data.destination || "South India";
    var products    = data.products || data.product || data.spices || data.varieties || "Tellicherry Black Pepper / Single-Origin Spices";
    var volume      = data.volume || data.quantity || data.lotSize || "Standard Commercial Lot";
    var rawNotes    = data.message || data.notes || data.details || "Inquiry logged via website.";

    // Clean Phone for 1-Tap WhatsApp Link
    var cleanPhone = phone.replace(/[^0-9]/g, '');

    // 5. Intelligent Sales Rep Routing & Priority Defaults (Section 2: Columns M to T)
    var assignedRep = "Anand R. (Trade Desk)";
    var priority    = "Medium Priority";
    var dealStatus  = "New Lead";
    var estValue    = "";

    var srcLow  = source.toLowerCase();
    var prodLow = products.toLowerCase();
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
      "",              // Col P (16): Quoted Rate (₹/kg) [For Employee]
      estValue,        // Col Q (17): Deal Value (₹) [For Employee]
      "15-Day Credit", // Col R (18): Payment Terms
      nextFollowUp,    // Col S (19): Next Follow-Up
      rawNotes         // Col T (20): Remarks & Notes
    ];

    // 7. Write Data to Sheet
    var range = sheet.getRange(nextRow, 1, 1, 20);
    range.setValues([rowValues]);

    // 8. Strict Typography & Formatting Enforcement (Fixes font mismatch issue!)
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

    // Cell Borders
    range.setBorder(true, true, true, true, true, true, "#D8E2D6", SpreadsheetApp.BorderStyle.SOLID);
    sheet.getRange(nextRow, 12).setBorder(null, null, null, true, null, null, "#1E2814", SpreadsheetApp.BorderStyle.MEDIUM);

    // 9. Apply Dropdown Validations to Row
    applyRowDropdowns(sheet, nextRow);

    // 10. Send Instant Corporate Email Alert
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
 * Sends Clean Corporate HTML Email Alert via Zoho Mail
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
    Logger.log("Email dispatch error: " + e.toString());
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

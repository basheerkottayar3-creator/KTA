import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

def update_crm(file_path):
    wb = openpyxl.load_workbook(file_path)
    
    # -------------------------------------------------------------
    # 1. Update Inbound Leads Sheet
    # -------------------------------------------------------------
    if "Inbound Leads" in wb.sheetnames:
        ws_leads = wb["Inbound Leads"]
        
        # Clear existing data validations
        ws_leads.data_validations.dataValidation.clear()
        
        # Define updated dropdown validations
        dv_source = DataValidation(type="list", formula1='"Website RFQ,AI Chatbot,Chef Sample Box,Corporate Partnership Registration,General Trade Desk Inquiry,Chef Dispatches Newsletter,WhatsApp Desk,Wholesale Portal,Inbound Call"', allow_blank=True)
        dv_rep = DataValidation(type="list", formula1='"Person 1,Person 2,Person 3,Person 4,Person 5,Person 6"', allow_blank=True)
        dv_priority = DataValidation(type="list", formula1='"High Priority,Medium Priority,Standard Priority"', allow_blank=True)
        dv_status = DataValidation(type="list", formula1='"New Lead,Contacted,Sample Dispatched,Quote Sent,Closed Won,Closed Lost"', allow_blank=True)
        dv_terms = DataValidation(type="list", formula1='"10-Day Credit,15-Day Credit,30-Day Credit,Advance,LC,Sample Free"', allow_blank=True)
        
        ws_leads.add_data_validation(dv_source)
        ws_leads.add_data_validation(dv_rep)
        ws_leads.add_data_validation(dv_priority)
        ws_leads.add_data_validation(dv_status)
        ws_leads.add_data_validation(dv_terms)
        
        dv_source.add("D7:D500")
        dv_rep.add("M7:M500")
        dv_priority.add("N7:N500")
        dv_status.add("O7:O500")
        dv_terms.add("R7:R500")
        
        # Update existing sample rows if any
        for r in range(7, ws_leads.max_row + 1):
            val_m = ws_leads.cell(row=r, column=13).value
            val_o = ws_leads.cell(row=r, column=15).value
            val_r = ws_leads.cell(row=r, column=18).value
            
            # If rep is old name, map to Person 1-4
            if val_m and "Anand" in str(val_m): ws_leads.cell(row=r, column=13, value="Person 1")
            elif val_m and "Kavitha" in str(val_m): ws_leads.cell(row=r, column=13, value="Person 2")
            elif val_m and "Suresh" in str(val_m): ws_leads.cell(row=r, column=13, value="Person 3")
            elif val_m and "Praveen" in str(val_m): ws_leads.cell(row=r, column=13, value="Person 4")
            
            # If status was Sample Dispatched, set to New Lead
            if val_o == "Sample Dispatched":
                ws_leads.cell(row=r, column=15, value="New Lead")
                
            # If terms was 15-Day Credit, set to 10-Day Credit
            if val_r == "15-Day Credit":
                ws_leads.cell(row=r, column=18, value="10-Day Credit")

    # -------------------------------------------------------------
    # 2. Update Product Rate Master Sheet (Full 55 Products)
    # -------------------------------------------------------------
    if "Product Rate Master" in wb.sheetnames:
        ws_prod = wb["Product Rate Master"]
        ws_prod.delete_rows(1, ws_prod.max_row + 10)
    else:
        ws_prod = wb.create_sheet("Product Rate Master")
        
    products = [
        # Spices
        ("KTA-SP-001", "Tellicherry Black Pepper (TGSEB Bold Whole)", "Single-Origin Spices", "09041140", 720, "40kg Master Bags", "Bold export-grade Tellicherry whole black peppercorns (4.75mm+). High aroma & heat."),
        ("KTA-SP-002", "Single-Origin Black Pepper Powder (Cold-Milled)", "Single-Origin Spices", "09041200", 750, "40kg Master Bags", "Coarse & fine chef-grade ground black pepper. Zero pinhead waste or fillers."),
        ("KTA-SP-003", "Decorticated White Pepper (Whole)", "Single-Origin Spices", "09041190", 1050, "40kg Master Bags", "Naturally water-retted decorticated white peppercorns for continental dining."),
        ("KTA-SP-004", "Fine Milled White Pepper Powder", "Single-Origin Spices", "09041200", 1080, "40kg Master Bags", "Micro-milled creamy white pepper powder for luxury banquet seasoning."),
        ("KTA-SP-005", "Salem Golden Turmeric Powder", "Single-Origin Spices", "09103030", 260, "40kg Triple-Lined Bags", "High curcumin Salem native rhizome ground. Zero lead chromate."),
        ("KTA-SP-006", "Scarlet Kashmiri Chilly (Whole Stemless)", "Single-Origin Spices", "09042219", 580, "25kg Master Bags", "Sun-dried wrinkled crimson Kashmiri chillies for royal tandoor & biryani color."),
        ("KTA-SP-007", "Pure Kashmiri Chilli Powder", "Single-Origin Spices", "09042211", 620, "25kg Master Bags", "Cold-pulverized bright scarlet chilli powder. Intense natural colour extraction."),
        ("KTA-SP-008", "Guntur S17 Whole Stemless Red Chilli", "Single-Origin Spices", "09042110", 320, "25kg Master Bags", "High-pungency fiery Guntur S17 chillies for bold South Indian curries."),
        ("KTA-SP-009", "Guntur Spicy Red Chilli Powder", "Single-Origin Spices", "09042211", 340, "25kg Master Bags", "Stone-milled fiery red chilli powder for high-volume commercial kitchens."),
        ("KTA-SP-010", "Alleppey Green Cardamom (8mm+ Extra Bold)", "Single-Origin Spices", "09083140", 2800, "40kg Master Bags", "Hand-graded 8mm+ calibrated pods. High natural essential oils and aroma."),
        ("KTA-SP-011", "Stone Milled Green Cardamom Powder", "Single-Origin Spices", "09083200", 2950, "40kg Master Bags", "Whole-pod stone milled green cardamom powder."),
        ("KTA-SP-012", "Large Hill Black Cardamom (Badi Elaichi)", "Single-Origin Spices", "09083110", 1450, "40kg Master Bags", "Smoked sun-cured hill black cardamom pods for royal dum biryani."),
        ("KTA-SP-013", "Bleached / Decorticated White Cardamom", "Single-Origin Spices", "09083120", 2400, "40kg Master Bags", "Delicate aromatic white cardamom for sweets and fine confectionery."),
        ("KTA-SP-014", "Cochin Sun-Cured Dry Ginger (Unbleached Whole)", "Single-Origin Spices", "09101110", 460, "40kg Master Bags", "Premium Cochin whole dry ginger rhizomes with sharp gingerol pungency."),
        ("KTA-SP-015", "Pure Sun-Dried Sonth Ginger Powder", "Single-Origin Spices", "09101200", 490, "40kg Master Bags", "Finely ground unbleached dry ginger powder for marinades and chai blends."),
        ("KTA-SP-016", "Whole Green Coriander Seeds (Dhania Whole)", "Single-Origin Spices", "09092190", 175, "40kg Master Bags", "Sortex-cleaned whole coriander seeds for crisp citrusy aroma."),
        ("KTA-SP-017", "Cold-Milled Coriander Powder (Dhania Powder)", "Single-Origin Spices", "09092200", 195, "40kg Master Bags", "Cold-milled fragrant coriander powder. Single-origin unadulterated aroma."),
        ("KTA-SP-018", "Machine-Cleaned Cumin Seeds (Jeera Whole)", "Single-Origin Spices", "09093129", 380, "40kg Master Bags", "99.5% machine-cleaned whole cumin seeds with rich essential cumin oil."),
        ("KTA-SP-019", "Stone-Milled Jeera Cumin Powder", "Single-Origin Spices", "09093200", 420, "40kg Master Bags", "Aromatic ground cumin powder stone-milled from pure seed lots."),
        ("KTA-SP-020", "Imperial Shahi Jeera (Wild Mountain Caraway)", "Single-Origin Spices", "09096119", 850, "25kg Master Bags", "Fine needle-thin wild mountain caraway seeds for Rogan Josh & royal pulao."),
        ("KTA-SP-021", "Zanzibar Whole Handpicked Cloves (Laung)", "Single-Origin Spices", "09071010", 980, "40kg Master Bags", "Head-on, bold, oil-rich Zanzibar whole cloves. Zero spent headless buds."),
        ("KTA-SP-022", "True Ceylon Cinnamon Quills (C5 Alba Pattai)", "Single-Origin Spices", "09061110", 1250, "25kg Master Bundles", "Delicate multi-layered thin bark quills of true Ceylon cinnamon."),
        ("KTA-SP-023", "High-Aroma Cassia Bark Slices (Kesia Pattai)", "Single-Origin Spices", "09061910", 360, "25kg Master Bags", "Thick rolled aromatic cassia bark for robust biryani tempering."),
        ("KTA-SP-024", "8-Pointed Autumn Star Anise (Annachipoo)", "Single-Origin Spices", "09096115", 820, "25kg Master Bags", "Whole unbroken 8-pointed star anise flowers with rich anethole aroma."),
        ("KTA-SP-025", "Bold Green Fennel Seeds (Sombu / Saunf)", "Single-Origin Spices", "09096145", 280, "40kg Master Bags", "Machine-cleaned sweet plump green fennel seeds. Naturally sweet aroma."),
        ("KTA-SP-026", "Whole Nutmeg with Shell / Kernel (Jaifal)", "Single-Origin Spices", "09081110", 780, "40kg Master Bags", "Dense whole nutmeg nuts with intact inner volatile oil kernel."),
        ("KTA-SP-027", "Banded Golden Mace Blades (Javantri)", "Single-Origin Spices", "09082100", 1950, "25kg Master Bags", "Vibrant golden-orange unbroken flower mace blades with spicy fragrance."),
        ("KTA-SP-028", "Sun-Dried Biryani Bay Leaves (Tejpatta)", "Single-Origin Spices", "09109914", 180, "25kg Master Bags", "Fragrant whole unbroken Ceylon bay leaves for slow dum cooking."),
        ("KTA-SP-029", "Black Stone Flower (Kalpasi / Dagad Phool)", "Single-Origin Spices", "09109990", 640, "25kg Master Bags", "Wild-harvested black and silver stone lichen for authentic Chettinad gravies."),
        ("KTA-SP-030", "Fragrant Green Kasuri Methi (Nagauri Leaves)", "Single-Origin Spices", "09109915", 340, "25kg Master Bags", "Shadow-dried vibrant green fenugreek leaves. Zero sand or stalk debris."),
        ("KTA-SP-031", "Selected Whole Fenugreek Seeds (Methi)", "Single-Origin Spices", "09109912", 135, "40kg Master Bags", "Bold sortex-cleaned whole fenugreek seeds for sambar and pickle masalas."),
        ("KTA-SP-032", "Bold Black Mustard Seeds (Kadugu / Rai)", "Single-Origin Spices", "09109911", 125, "40kg Master Bags", "Selected bold black mustard seeds with high popping oil vitality."),
        ("KTA-SP-033", "Pure Black Nigella Seeds (Kalonji)", "Single-Origin Spices", "09096149", 360, "25kg Master Bags", "Triple-cleaned black nigella seeds for naan bread crusts and tempering."),
        # Blends & Specialty
        ("KTA-BL-001", "Royal Chef Garam Masala (Whole Spice Blend)", "Culinary Blends", "09109100", 880, "40kg Master Bags", "Master chef artisanal blend of 14 whole roasted single-origin spices. Zero fillers."),
        ("KTA-BL-002", "Royal Dum Biryani Masala (Pristine Blend)", "Culinary Blends", "09109100", 940, "40kg Master Bags", "Heritage aromatic spice blend curated for luxury hotel biryanis."),
        ("KTA-SP-034", "Sun-Cured Black Dry Lemon (Loomi Whole)", "Specialty Botanicals", "08055000", 520, "25kg Master Bags", "Traditional sun-dried black lime for Arabian mandi and broths."),
        ("KTA-SP-035", "Super Mongra Kashmiri Saffron (Grade A1)", "Specialty Botanicals", "09102010", 260000, "1kg Master Packaging", "Pristine deep crimson saffron stigmas without yellow style adulteration."),
        # Dry Fruits & Nuts
        ("KTA-DF-001", "California Bold Whole Almonds (Badam 18/20)", "Dry Fruits & Nuts", "08021200", 780, "25kg Master Bags", "Jumbo size 18/20 count premium raw California almonds. Crisp sweet bite."),
        ("KTA-DF-002", "W320 First Quality Jumbo White Cashews (Kaju)", "Dry Fruits & Nuts", "08013100", 860, "50kg Master Jute Bags", "Whole unblemished W320 grade white cashew nuts. Creamy rich texture."),
        ("KTA-DF-003", "California Roasted & Salted Pistachios (Pista)", "Dry Fruits & Nuts", "08025100", 1150, "10kg Master Cartons", "Naturally opened jumbo roasted pistachios with light sea salt."),
        ("KTA-DF-004", "California Light Quarter Walnut Kernels (Akhrot)", "Dry Fruits & Nuts", "08023200", 1180, "10kg Master Cartons", "Fresh crisp light amber walnut halves & quarters. Zero rancidity."),
        ("KTA-DF-005", "Golden Long Seedless Raisins (Kismiss)", "Dry Fruits & Nuts", "08062010", 340, "15kg Master Cartons", "Plump sun-dried green-gold seedless raisins for biryani and desserts."),
        ("KTA-DF-006", "Selected Black Seedless Raisins (Black Kismiss)", "Dry Fruits & Nuts", "08062010", 380, "15kg Master Cartons", "Plump nutrient-dense black seedless raisins for baking and confectionery."),
        ("KTA-DF-007", "Groundnut Seeds (Selected Grade Raw Peanut)", "Dry Fruits & Nuts", "12024190", 180, "50kg Master Bags", "Selected bold raw peanut kernels with high natural oil content."),
        ("KTA-DF-008", "Dry Roasted Peanuts (Golden Crunch Husked)", "Dry Fruits & Nuts", "20081111", 220, "25kg Master Bags", "Uniformly dry roasted and husked golden crunchy peanuts."),
        # Edible Seeds
        ("KTA-DF-009", "Triple-Cleaned White Sesame Seeds (White Ellu)", "Edible Seeds", "12074090", 260, "40kg Master Bags", "99.9% machine-cleaned triple sortex hulled white sesame seeds."),
        ("KTA-DF-010", "Sweet Basil Seeds (Sabja / Falooda Seeds)", "Edible Seeds", "12119094", 380, "25kg Master Bags", "High-expansion whole sweet basil seeds for falooda and cooling drinks."),
        ("KTA-DF-011", "Premium Whole Chia Seeds (Salvia Hispanica)", "Edible Seeds", "12149000", 420, "25kg Master Bags", "Triple-cleaned whole black & white chia seeds rich in soluble fiber."),
        ("KTA-DF-012", "Raw Hulled Pumpkin Seeds (Pepitas / Kaddu Beej)", "Edible Seeds", "12099990", 490, "25kg Master Bags", "Vibrant green hulled raw pumpkin seeds (AA Grade) for bakery and salads."),
        ("KTA-DF-013", "Raw Hulled Sunflower Seeds (Surajmukhi Beej)", "Edible Seeds", "12060090", 320, "25kg Master Bags", "Jumbo kernel hulled sunflower seeds for granolas and breads."),
        ("KTA-DF-014", "Peeled Watermelon Seeds (Magaz / Tarbooj Beej)", "Edible Seeds", "12079990", 540, "25kg Master Bags", "Clean white shelled watermelon kernels for rich Mughlai curries."),
        ("KTA-DF-015", "Culinary Dried Damascena Rose Petals (Gulab)", "Specialty Botanicals", "12119029", 680, "10kg Master Cartons", "Naturally shade-dried intensely fragrant Damascena rose petals."),
        # Wholesale Industrial & Extraction
        ("KTA-WS-001", "Green Ginger (Raw Fresh Jumbo Rhizomes)", "Wholesale & Fresh", "09101110", 120, "40kg Master Crates (500kg+ MOQ)", "Raw fresh plump farm-direct ginger rhizomes. High juice extraction yield."),
        ("KTA-WS-002", "Pepper Husk & Pepper Husk (S) Mesh Cuts", "Wholesale Extraction", "09041140", 140, "50kg Bags (500kg+ MOQ)", "Clean sieved black pepper outer husk. High piperine resin for oleoresin extraction."),
        ("KTA-WS-003", "Black Pepper Lite Berries & Pinheads", "Wholesale Extraction", "09041140", 280, "50kg Bags (500kg+ MOQ)", "High oleoresin concentration lightweight berries and whole pinheads for extraction units.")
    ]
    
    # Header styling
    font_title = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    font_sub = Font(name="Segoe UI", size=10, italic=True, color="FFFFFF")
    font_hdr = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    font_data = Font(name="Segoe UI", size=9.5, color="1A1A1A")
    font_code = Font(name="Segoe UI", size=9.5, bold=True, color="1E2814")
    
    fill_header_main = PatternFill(start_color="1E2814", end_color="1E2814", fill_type="solid")
    fill_header_sub = PatternFill(start_color="2D3A1F", end_color="2D3A1F", fill_type="solid")
    fill_row_alt = PatternFill(start_color="F8FAF6", end_color="F8FAF6", fill_type="solid")
    
    border_thin = Border(
        left=Side(style='thin', color='D8E2D6'),
        right=Side(style='thin', color='D8E2D6'),
        top=Side(style='thin', color='D8E2D6'),
        bottom=Side(style='thin', color='D8E2D6')
    )
    
    # Write Title
    ws_prod.merge_cells("A1:G1")
    ws_prod["A1"] = "KTA SPICES - PRODUCT MASTER & COMMERCIAL RATE CARD"
    ws_prod["A1"].font = font_title
    ws_prod["A1"].fill = fill_header_main
    ws_prod["A1"].alignment = Alignment(horizontal="center", vertical="center")
    
    ws_prod.merge_cells("A2:G2")
    ws_prod["A2"] = "Master SKU Price Reference: HSN Codes, Benchmark Rates & Wholesale Packaging Specifications (55 Varieties)"
    ws_prod["A2"].font = font_sub
    ws_prod["A2"].fill = fill_header_sub
    ws_prod["A2"].alignment = Alignment(horizontal="center", vertical="center")
    
    headers = ["SKU Code", "Product Variety Name", "Category", "HSN Code", "Base Rate (₹/kg)", "Wholesale MOQ", "Culinary Grade & Note"]
    ws_prod.row_dimensions[1].height = 28
    ws_prod.row_dimensions[2].height = 20
    ws_prod.row_dimensions[4].height = 24
    
    for c_idx, h_text in enumerate(headers, 1):
        cell = ws_prod.cell(row=4, column=c_idx, value=h_text)
        cell.font = font_hdr
        cell.fill = fill_header_main
        cell.alignment = Alignment(horizontal="center" if c_idx in [1, 3, 4, 5] else "left", vertical="center")
        cell.border = border_thin
        
    for r_idx, prod in enumerate(products, 5):
        ws_prod.row_dimensions[r_idx].height = 20
        is_alt = (r_idx % 2 == 0)
        for c_idx, val in enumerate(prod, 1):
            cell = ws_prod.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_code if c_idx == 1 else font_data
            cell.border = border_thin
            if is_alt:
                cell.fill = fill_row_alt
            if c_idx in [1, 4]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 5:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.number_format = '₹ #,##,##0'
            elif c_idx == 3:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
                
    # Column widths
    col_widths = {'A': 16, 'B': 45, 'C': 22, 'D': 14, 'E': 18, 'F': 32, 'G': 68}
    for col, width in col_widths.items():
        ws_prod.column_dimensions[col].width = width
        
    wb.save(file_path)
    print(f"Updated {file_path} successfully!")

update_crm('KTA_Executive_Marketing_CRM_Tracker.xlsx')
update_crm('KTA_Executive_Marketing_CRM_Master.xlsx')

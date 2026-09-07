/* KTA Spices — Shared JavaScript v3.2 (Universal Mobile Responsive & Search/Basket Handlers) */
'use strict';

/* ── 1. Scroll Reveal & Line Drawing ── */
(function(){
  var els = document.querySelectorAll('[data-reveal], .line-draw');
  if(!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var delay = e.target.dataset.delay ? parseInt(e.target.dataset.delay) * 40 : 0;
        setTimeout(function(){
          e.target.classList.add('revealed');
          e.target.classList.add('drawn');
        }, delay);
        io.unobserve(e.target);
      }
    });
  },{threshold:0.02,rootMargin:'0px 0px -20px 0px'});
  els.forEach(function(el){ io.observe(el); });
})();

/* ── 2. Universal Mobile Nav Drawer Handler ── */
(function(){
  function initMobileNav() {
    var hamburgers = document.querySelectorAll('.nav-hamburger, .home-hamburger, .mobile-hamburger-btn, #navHamburger, #homeHamburger, #mobileHamburger');
    var panel      = document.getElementById('mobilePanel');
    var overlay    = document.getElementById('mobileOverlay');
    var closeBtn   = document.getElementById('mobileClose');
    if(!panel) return;

    function openMenu(){
      panel.classList.add('is-open');
      if(overlay) overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    function shutMenu(){
      panel.classList.remove('is-open');
      if(overlay) overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    hamburgers.forEach(function(btn){
      btn.removeEventListener('click', btn._navHandler);
      btn._navHandler = function(e){
        e.preventDefault();
        e.stopPropagation();
        openMenu();
      };
      btn.addEventListener('click', btn._navHandler);
    });

    if(closeBtn) closeBtn.onclick = shutMenu;
    if(overlay)  overlay.onclick  = shutMenu;

    panel.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', shutMenu);
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && panel.classList.contains('is-open')){
        shutMenu();
      }
    });

    // Touch swipe to close
    var startX = 0;
    panel.addEventListener('touchstart', function(e){
      startX = e.touches[0].clientX;
    }, {passive: true});

    panel.addEventListener('touchend', function(e){
      var diff = e.changedTouches[0].clientX - startX;
      if(diff > 50){ shutMenu(); }
    }, {passive: true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();

/* ── 3. Universal Search Overlay System ── */
(function(){
  var searchIndex = [
    // Whole Spices, Blends & Powders
    { title: 'Royal Garam Masala (Master Chef Blend)', cat: 'Ground Spices', page: 'catalogue.html?search=garam+masala', desc: 'Garam Masala garam podi karam masala master chef blend whole ground' },
    { title: 'Royal Biryani Masala (Executive Dum Infusion)', cat: 'Ground Spices', page: 'catalogue.html?search=biryani+masala', desc: 'Biryani Masala biriyani masala dum masala shahi biryani infusion' },
    { title: 'Black Dry Lemon (Loomi Whole Lime)', cat: 'Whole Spices', page: 'catalogue.html?search=dry+lemon', desc: 'Black Dry Lemon Loomi dried lime unakka naranga sukha nimbu black loomi' },
    { title: 'Green Cardamom (Alleppey 8mm+ Extra Bold)', cat: 'Whole Spices', page: 'catalogue.html?search=green+cardamom', desc: 'ഏലക്ക Elakka ஏலக்காய் Elakkai ഏലക്കി Yakki ഏലക്കായലു Yelakulu छोटी इलायची Chhoti Elaichi elaichi' },
    { title: 'Cardamom Powder (Pure Ground)', cat: 'Ground Spices', page: 'catalogue.html?search=cardamom+powder', desc: 'ഏലക്ക പൊടി Elakka Podi ஏலக்காய் பொடி Elakkai Podi ഏലക്കി പുഡി Yakki Pudi ഏലക്ക കുണ്ട Yelakula Podi इलायची पाउडर Elaichi Powder' },
    { title: 'Black Cardamom (Large Pods)', cat: 'Whole Spices', page: 'catalogue.html?search=black+cardamom', desc: 'വലിയ ഏലക്ക Valiya Elakka கருப்பு ஏலக்காய் Karuppu Elakkai കപ്പു ഏലക്കി Kappu Yakki നല്ലാ ഏലക്കായലു Nalla Yelakulu बड़ी इलायची Badi Elaichi' },
    { title: 'White Cardamom (Selected Grade)', cat: 'Whole Spices', page: 'catalogue.html?search=white+cardamom', desc: 'വെള്ള ഏലക്ക Vella Elakka வெள்ளை ஏலக்காய் Vellai Elakkai ബെള്ള ഏലക്കി Bella Yakki தெல்ல ഏലക്കായാലു Tella Yelakulu सफेद इलायची Safed Elaichi' },
    { title: 'Tellicherry Black Pepper (TGSEB Grade)', cat: 'Whole Spices', page: 'catalogue.html?search=black+pepper', desc: 'കുരുമുളക് Kurumulaku குறுமிளகு மிளகு Milagu കരിമെണസു Kari Menasu മിരിയാലു Miriyalu काली मिर्च Kali Mirch' },
    { title: 'Pepper Powder (Ground Black Pepper)', cat: 'Ground Spices', page: 'catalogue.html?search=pepper+powder', desc: 'കുരുമുളക് പൊടി Kurumulaku Podi மிளகு தூள் Milagu Thool മെണസിന പുഡി Menasina Pudi മിരിയാല പൊടി Miriyala Podi काली मिर्च पाउडर Kali Mirch Powder' },
    { title: 'White Pepper Powder (Ground White Pepper)', cat: 'Ground Spices', page: 'catalogue.html?search=white+pepper', desc: 'വെള്ള കുരുമുളക് പൊടി Vella Kurumulaku Podi வெள்ளை மிளகு தூள் Vellai Milagu Thool ബെള്ള മെണസിന പുഡി Bella Menasina Pudi தெல்ல മിരിയാല പൊടി Tella Miriyala Podi सफेद मिर्च पाउडर Safed Mirch' },
    { title: 'Star Anise (Annachipoo — Royal 8-Pointed)', cat: 'Whole Spices', page: 'catalogue.html?search=annachipoo', desc: 'തക്കോലം Thakkolam அன்னாசிப்பூ Annashipoo അനസൂവൂ Anasavu അനാസ പൂവു Anasa Poovu चक्र फूल Chakra Phool' },
    { title: 'Biryani Bay Leaf (Selected Aromatic)', cat: 'Whole Spices', page: 'catalogue.html?search=biryani+leaf', desc: 'കറുവപ്പട്ട ഇല ബിരിയാണി ഇല Biryani Ila பிரியாணி இலை Biryani Ilai ബിരിയാണി എലെ Biryani Ele ബിരിയാണി ആകു Biryani Aaku तेज पत्ता Tej Patta' },
    { title: 'Cassia Bark (Kesia Premium Lot)', cat: 'Whole Spices', page: 'catalogue.html?search=cassia', desc: 'കറുവാപ്പട്ട Karuvapatta லவங்கம் Lavangam ദാചിന്നി Dachinni ദാവാചിന്ന പക്ക Lavanga Patta चीनी दालचीनी Kassia' },
    { title: 'Ceylon Cinnamon True Quills (Pattai)', cat: 'Whole Spices', page: 'catalogue.html?search=cinnamon', desc: 'എലവംഗം പട്ട Patta பட்டை Pattai ചക്കെ Chakke ദാൽചിനി Dalchini दालचीनी Dalchini' },
    { title: 'Zanzibar Whole Cloves (Selected Grade A)', cat: 'Whole Spices', page: 'catalogue.html?search=cloves', desc: 'ഗ്രാമ്പൂ കരയാമ്പൂ Gramboo கிராம்பு Krambu ലവംഗ Lavanga ലവംഗാലു Lavangalu लौंग Laung' },
    { title: 'Coriander Whole Seeds', cat: 'Whole Spices', page: 'catalogue.html?search=coriander+whole', desc: 'മല്ലി കൊത്തമല്ലി Malli கொத்தமல்லி Kothamalli കൊത്തുമ്പരി Kothambari ധനീയാലു Dhaniyalu साबुत धनिया Sabut Dhaniya' },
    { title: 'Coriander Powder', cat: 'Ground Spices', page: 'catalogue.html?search=coriander+powder', desc: 'മല്ലിപ്പൊടി Malli Podi മല്ലിത്തൂൾ Malli Thool കൊത്തുമ്പരി പുഡി Kothambari Pudi ധനിയാല പൊടി Dhaniyala Podi धनिया पाउडर Dhaniya Powder' },
    { title: 'Dry Ginger (Sun-Dried Cochin Whole)', cat: 'Whole Spices', page: 'catalogue.html?search=dry+ginger', desc: 'ചുക്ക് Chukku சுக்கு Sukku അള്ളെ ശൊന്തി Shonthi ശൊണ്ടി Shonthi सोंठ Sonth' },
    { title: 'Dry Ginger Powder (Sonth / Chukku Podi)', cat: 'Ground Spices', page: 'catalogue.html?search=dry+ginger+powder', desc: 'ചുക്കുപൊടി Chukku Podi சுக்கு தூள் Sukku Thool ശൊന്തി പുഡി Shonthi Pudi ശൊണ്ടി പൊടി Shonthi Podi सोंठ पाउडर Sonth Powder' },
    { title: 'Guntur S4 Hot Red Chillies', cat: 'Whole Spices', page: 'catalogue.html?search=guntur', desc: 'ഗുണ്ടൂർ മുളക് Guntur Mulaku குண்டூர் மிளகாய் Guntur Milagai ഗുണ്ടൂറു മെണസിനകായി Guntur Menasinakai ഗുണ്ടൂറു മിരപകായ Guntur Mirapakaya गुंटूर मिर्च Guntur Mirch' },
    { title: 'Kashmiri Dried Chillies (High ASTA Color)', cat: 'Whole Spices', page: 'catalogue.html?search=kashmiri', desc: 'കാശ്മീരി മുളക് Kashmiri Mulaku காஷ்மீரி மிளகாய் Kashmiri Milagai കശ്മീരി മെണസിനകായി Kashmiri Menasinakai കാശ്മീരി മിരപകായ Kashmiri Mirapakaya कश्मीरी मिर्च Kashmiri Mirch' },
        { title: 'Kashmiri Chilli Powder (Cold-Milled High Color)', cat: 'Ground Spices', page: 'catalogue.html?search=kashmiri+chilli+powder', desc: 'കാശ്മീരി മുളകുപൊടി Kashmiri Mulakupodi காஷ்மீரி மிளகாய்த்தூள் Kashmiri Milagai Thool കശ്മീരി മെണസിന പുഡി Kashmiri Menasina Pudi കാശ്മീരി മിരപ പൊടി Kashmiri Mirapa Podi कश्मीरी लाल मिर्च पाउडर Kashmiri Lal Mirch Powder' },
    { title: 'Jaifal (Whole Nutmeg with Kernel)', cat: 'Whole Spices', page: 'catalogue.html?search=jaifal', desc: 'ജാതിക്ക Jathikka ஜாதிக்காய் Jadhikkai ജാജികായി Jajikai ജാജികായ Jajikaya जायफल Jaiphal' },
    { title: 'Javantri (Selected Mace Blades)', cat: 'Whole Spices', page: 'catalogue.html?search=javantri', desc: 'ജാതിപത്രി Jathipathri ஜாதிபத்ரி Jadhipathri ജാതിപത്രി Jathipathri ജാതിപത്രി Jathipathri जावित्री Javitri' },
    { title: 'Jeera (Whole Cumin Seeds)', cat: 'Whole Spices', page: 'catalogue.html?search=jeera+whole', desc: 'ജീരകം Jeerakam சீரகம் Seeragam ജീരിഗെ Jeerige ജീല കർര Jeelakarra जीरा Zeera' },
    { title: 'Jeera Powder (Fresh Ground Cumin)', cat: 'Ground Spices', page: 'catalogue.html?search=jeera+powder', desc: 'ജീരകപ്പൊടി Jeeraka Podi சீரகத் தூள் Seeraga Thool ജീരിഗെ പുഡി Jeerige Pudi ജീല കർര പൊടി Jeelakarra Podi जीरा पाउडर Zeera Powder' },
    { title: 'Valyajeerakam (Shahi Jeera / Black Cumin)', cat: 'Whole Spices', page: 'catalogue.html?search=valyajeerakam', desc: 'വലിയ ജീരകം Valiya Jeerakam ஷாஹി சீரகம் Shahi Seeragam ഷാഹി ജീരിഗെ Shahi Jeerige ഷാഹി ജീല കർര Shahi Jeelakarra शाही जीरा काला जीरा Shahi Jeera' },
    { title: 'Fennel Seeds (Sombu Bold Green)', cat: 'Whole Spices', page: 'catalogue.html?search=sombu', desc: 'പെരുഞ്ചീരകം Perumjeerakam சோம்பு Sombu ബഡ്ഡീശേപ്പു Baddisheppu സോമ്പു Sombu सौंफ Saunf' },
    { title: 'Kalpasi (Dagad Phool / Stone Flower)', cat: 'Whole Spices', page: 'catalogue.html?search=kalpasi', desc: 'കൽപ്പാസി Kalpasi கல்பாசி Kalpasi കല്ലൂഹൂവു Kalluhuvu രാതി പൂവു Rathi Poovu दगड़ फूल पत्थर के फूल Dagad Phool' },
    { title: 'Kasuri Methi (Sun-Dried Fenugreek)', cat: 'Whole Spices', page: 'catalogue.html?search=kasuri+methi', desc: 'കസൂരി മേത്തി Kasuri Methi கசூரி மேதி Kasuri Methi കസൂരി മേതി Kasuri Methi കസൂരി മേതി Kasuri Methi कसूरी मेथी Kasuri Methi' },
    { title: 'Methi Seeds (Whole Fenugreek)', cat: 'Whole Spices', page: 'catalogue.html?search=methi', desc: 'ഉലുവ Uluva வெந்தயம் Venthayam മെന്ത്യ Menthya മന്തലു Menthulu मेथी दाना Methi Dana' },
    { title: 'Mustard Seeds (Black Mustard)', cat: 'Whole Spices', page: 'catalogue.html?search=mustard', desc: 'കടുക് Kadugu கடுகு Kadugu സാസിവെ Sasive ആവാലു Avalu राई सरसों Rai Sarson' },
    { title: 'Salem Turmeric Powder (Pure Ground)', cat: 'Ground Spices', page: 'catalogue.html?search=turmeric', desc: 'മഞ്ഞൾപ്പൊടി Manjal Podi மஞ்சள் தூள் Manjal Thool അരശിന പുഡി Arishina Pudi പസുകു പൊടി Pasupu Podi हल्दी पाउडर Haldi Powder' },
    { title: 'Nigella (Black Seed / Kalonji)', cat: 'Whole Spices', page: 'catalogue.html?search=nigella', desc: 'കരിഞ്ചീരകം Karinjeerakam கருஞ்சீரகம் Karunjeeragam കരിജീരിഗെ Kari Jeerige നല്ലാ ജീല കർര Nalla Jeelakarra कलौंजी Kalonji' },
    { title: 'White Ellu (Triple Cleaned Sesame)', cat: 'Whole Spices', page: 'catalogue.html?search=white+ellu', desc: 'വെള്ള എള്ള് Vella Ellu வெள்ளை எள் Vellai Ellu ബെള്ള എള്ളു Bella Ellu തെല്ല നു്വലു Tella Nuvvulu सफेद तिल Safed Til' },
    { title: 'Chia Seeds (Raw Culinary Grade)', cat: 'Seeds', page: 'catalogue.html?search=chia', desc: 'ചിയാ വിത്തുകൾ Chia Seeds சியா விதைகள் Chia Seeds ചിയാ ബീജ Chia Beeja ചിയാ വിത്തുലു Chia Vittulu चिया बीज Chia Seeds' },
    { title: 'Sabja Seeds (Sweet Basil / Falooda)', cat: 'Seeds', page: 'catalogue.html?search=sabja', desc: 'കഞ്ചാവ് വിത്ത് കസകസാ വിത്ത് Sabja Seeds சப்ஜா விதை Sabja Vithai കമാ കസ്തൂരി Kama Kasthuri സബ്ജാ വിത്തുലു Sabja Vittulu सबजा तकमरिया Sabja Takmaria' },
    { title: 'Pumpkin Seeds (Hulled Pepitas)', cat: 'Seeds', page: 'catalogue.html?search=pumpkin+seeds', desc: 'മത്തങ്ങ വിത്തുകൾ Mathanga Vithukal பூசணி விதை Poosani Vithai കുമ്പളകായി ബീജ Kumbalakai Beeja ഗുമ്മഡികായ വിത്തുലു Gummadikaya Vittulu कद्दू के बीज Kaddu ke Beej' },
    { title: 'Sunflower Seeds (Hulled Raw)', cat: 'Seeds', page: 'catalogue.html?search=sunflower+seeds', desc: 'സൂര്യകാന്തി വിത്ത് Suryakanthi Vithu சூரியகாந்தி விதை Suriyaganthi Vithai സൂര്യകാന്തി ബീജ Suryakanthi Beeja പൊദ്ദു തിരുഗുഡു വിത്തുലു Poddu Thirugudu Vittulu सूरजमुखी के बीज Surajmukhi ke Beej' },
    { title: 'Watermelon Seeds (Dried Magaz Grade)', cat: 'Seeds', page: 'catalogue.html?search=watermelon+seeds', desc: 'തണ്ണിമത്തൻ വിത്ത് Thannimathan Vithu தர்பூசணி விதை Tharboosani Vithai കല്ലംഗഡി ബീജ Kallangadi Beeja പുച്ചകായ വിത്തുലു Puchakaya Vittulu मगज तरबूज के बीज Magaz Tarbooj ke Beej' },
    { title: 'Groundnut Seeds (Raw Peanut)', cat: 'Seeds', page: 'catalogue.html?search=groundnut', desc: 'നിലക്കടല Nilakkadala நிலக்கடலை வேர்க்கடலை Verkadalai നേലകടലെ Nelakadale വേരുശെനഗ കുള്ളു Verusenaga Gullu मूंगफली दाना Moongphali' },
    { title: 'Roasted Peanut (Dry Roast Crunchy)', cat: 'Dry Fruits', page: 'catalogue.html?search=roasted+peanut', desc: 'വറുത്ത നിലക്കടല Varutha Nilakkadala வறுத்த கடலை Varutha Kadalai ഹുരിദ കടലെ Hurida Kadale വേയിഞ്ചിന ശെനഗപപ്പു Veyinchina Senagapappu भुनी मूंगफली Bhuni Moongphali' },
    { title: 'Dry Rose Petals (Damascena Grade)', cat: 'Luxury Spices', page: 'catalogue.html?search=rose+petals', desc: 'ഉണങ്ങിയ റോസാപ്പൂ ഇതളുകൾ Unangiya Rosappoo Idhalukal காய்ந்த ரோஜா இதழ்கள் Kaintha Roja Idhazhgal ഉണഗിദ റോജ ഹൂവിന എസളുകളു Unagida Roja Esalu എണ്ഡിന റോജാ റെക്കലു Endina Roja Rekkalu सूखे गुलाब की पंखुड़ियां Sukhe Gulab ki Pattiyan' },
    { title: 'Kashmiri Mogra Saffron (Grade 1 Certified)', cat: 'Luxury Spices', page: 'catalogue.html?search=saffron', desc: 'കുങ്കുമപ്പൂവ് Kunkumappoov குங்குமப்பூ Kungumappoo കുങ്കുമ കേസരി Kunkuma Kesari കുങ്കുമ പൂവു Kunkuma Poovu केसर जाफरान Kesar Zafran' },

    // Premium Dry Fruits & Nuts
    { title: 'California & Gurbandi Badam (Almonds)', cat: 'Dry Fruits', page: 'catalogue.html?search=badam', desc: 'ബദാം Badam பாதாம் Badam ബാദാമി Badami ബാദാം പപ്പു Badam Pappu बादाम Badam' },
    { title: 'Jumbo Cashews W240 / W320 Premium', cat: 'Dry Fruits', page: 'catalogue.html?search=cashewnut', desc: 'അണ്ടിപ്പരിപ്പ് Andipparippu kashuvandi kasuvandi முந்திரி Munthiri mundhiri ഗോഡംബി Godambi ജീഡിപപ്പു Jeedi Pappu काजू Kaju' },
    { title: 'Dates (Premium Whole Arabian)', cat: 'Dry Fruits', page: 'catalogue.html?search=dates', desc: 'ഈന്തപ്പഴം Eenthappazham பேரீச்சம்பழம் Beerichampazham ഈരജൂറ Eerajoora ഖർജൂരപ്പണ്ടു Kharjoora Pandu खजूर Khajoor' },
    { title: 'Royal Anjeer (Dried Whole Figs)', cat: 'Dry Fruits', page: 'catalogue.html?search=fig', desc: 'അത്തിപ്പഴം Athippazham அத்திப்பழம் Athippazham അഞ്ചൂറ Anjoora മേഡിപണ്ടു Anjeeru Medi Pandu अंजीर Anjeer' },
    { title: 'Kismiss (Golden Seedless Raisins)', cat: 'Dry Fruits', page: 'catalogue.html?search=kismiss', desc: 'ഉണക്കമുന്തിരി Unakka Munthiri உலர் திராட்சை Ular Dhrakshai ഒണ ഡ്രാക്ഷി Ona Drakshi കിഷ്മിഷ് Kishmish Endo Draksha किशमिश Kishmish' },
    { title: 'Black Kismiss (Black Currant Raisins)', cat: 'Dry Fruits', page: 'catalogue.html?search=black+kismiss', desc: 'കറുത്ത മുന്തിരി Karutha Munthiri கருப்பு திராட்சை Karuppu Dhrakshai കപ്പു ഡ്രാക്ഷി Kappu Drakshi നല്ലാ ഡ്രാക്ഷ Nalla Draksha काली किशमिश Kali Kishmish' },
    { title: 'Special Kismiss (Long Green Raisins)', cat: 'Dry Fruits', page: 'catalogue.html?search=special+kismiss', desc: 'നീളൻ പച്ച മുന്തിരി Neelan Pacha Munthiri பச்சை திராட்சை Pachai Dhrakshai ഹസിരു ഡ്രാക്ഷി Hasiru Drakshi പച്ച ഡ്രാക്ഷ Pacha Draksha हरी लंबी किशमिश Hari Kishmish' },
    { title: 'Pistachios (Pista Roasted & Salted)', cat: 'Dry Fruits', page: 'catalogue.html?search=pista', desc: 'പിസ്ത Pista பிஸ்தா Pista പിസ്താ Pista പിസ്താ പപ്പു Pista Pappu पिस्ता Pista' },
    { title: 'Kashmiri & California Whole Walnuts', cat: 'Dry Fruits', page: 'catalogue.html?search=walnut', desc: 'വാൾനട്ട് Walnut அக்ரூட் Akroot അക്രോട്ടു Akrootu അക്രോട്ടു Akrootu अखरोट Akhrot' },

    // Commercial B2B Services & Custom Sourcing
    { title: 'Custom Origin Sourcing & Rare Botanicals', cat: 'Outsourcing Desk', page: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20looking%20for%20Custom%20Sourcing%20%2F%20Rare%20Botanical%20Procurement%20for%20our%20commercial%20kitchen.%20Please%20advise%20on%20grade%20availability%2C%20minimums%2C%20and%20lot%20pricing.', desc: 'Single-origin lots, rare whole botanicals, custom grinding specs & contract institutional procurement' },
    { title: 'Hotel Smart 24/7 Rapid Supply Program', cat: 'Hotel Supply', page: 'index.html#hotelSmart', desc: 'Dedicated 24/7 emergency kitchen deliveries across South India · hotel smart logistics' },
    { title: 'Wholesale Commercial Price Catalogue (40kg+)', cat: 'B2B Trade', page: 'wholesale.html', desc: 'Commercial wholesale pricing for HORECA and food chains in 40kg+ consignments' },
    { title: 'Chef Credit & Kitchen Partnership Registry', cat: 'Partnership', page: 'partnership.html#registerKitchen', desc: 'Apply for 30-day kitchen credit terms & chef discovery sample boxes' },
    { title: 'KTA 25+ Years Legacy & Sourcing Heritage', cat: 'Heritage', page: 'heritage.html', desc: 'Learn about our origin plantations and quality control' },
    { title: 'Contact Executive Desk & WhatsApp Line', cat: 'Support', page: 'contact.html', desc: 'Direct hotline: +91 85928 32871 · Trade Desk' }
  ];

  function ensureSearchModal() {
    var existing = document.getElementById('searchModalBackdrop');
    if (existing) return existing;

    var backdrop = document.createElement('div');
    backdrop.id = 'searchModalBackdrop';
    backdrop.className = 'search-modal-backdrop';
    backdrop.innerHTML = [
      '<div class="search-modal-box" id="searchModalBox">',
      '  <div class="search-modal-header">',
      '    <div class="search-modal-input-wrap">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '        <circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line>',
      '      </svg>',
      '      <input type="text" id="searchModalInput" class="search-modal-input" placeholder="Search in English, Tamil, Malayalam, Hindi &amp; Indian languages..." autocomplete="off">',
      '    </div>',
      '    <button class="search-modal-close" id="searchModalClose" aria-label="Close search">&times;</button>',
      '  </div>',
      '  <div class="search-modal-body">',
      '    <div class="search-chips-title">Popular Searches</div>',
      '    <div class="search-chips-list">',
      '      <a href="catalogue.html?search=black+pepper" class="search-chip" data-query="Pepper">Tellicherry Pepper</a>',
      '      <a href="catalogue.html?search=ginger" class="search-chip" data-query="Dry Ginger">Dry Ginger</a>',
      '      <a href="catalogue.html?search=cardamom" class="search-chip" data-query="Cardamom">Green Cardamom</a>',
      '      <a href="catalogue.html?search=cashewnut" class="search-chip" data-query="Cashews">W320 Cashews</a>',
      '      <a href="https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20looking%20for%20Custom%20Sourcing%20%2F%20Agricultural%20Procurement%20for%20our%20commercial%20kitchen.%20Please%20advise%20on%20grade%20availability%2C%20minimums%2C%20and%20lot%20pricing." target="_blank" rel="noopener" class="search-chip" data-query="Custom Sourcing">Custom Sourcing</a>',
      '      <a href="index.html#hotelSmart" class="search-chip" data-query="Hotel Smart">Hotel Smart 24/7</a>',
      '      <a href="wholesale.html" class="search-chip" data-query="Wholesale">Wholesale Supply (500kg+)</a>',
      '      <a href="catalogue.html?search=cloves" class="search-chip" data-query="Cloves">Selected Cloves</a>',
      '    </div>',
      '    <div class="search-chips-title" id="searchResultsLabel" style="margin-top:16px;">Catalogue Items &amp; Services</div>',
      '    <div class="search-results-list" id="searchResultsList"></div>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(backdrop);
    return backdrop;
  }

  var MULTILINGUAL_SYNONYMS = {
    // Cardamom (Green, White, Black, Ground)
    'elaka': ['cardamom', 'green cardamom'],
    'elakka': ['cardamom', 'green cardamom'],
    'elakkaya': ['cardamom', 'green cardamom'],
    'elakaya': ['cardamom', 'green cardamom'],
    'elakkai': ['cardamom', 'green cardamom'],
    'elakai': ['cardamom', 'green cardamom'],
    'yelakkai': ['cardamom', 'green cardamom'],
    'yelakai': ['cardamom', 'green cardamom'],
    'elam': ['cardamom', 'green cardamom'],
    'elaichi': ['cardamom', 'green cardamom'],
    'elachi': ['cardamom', 'green cardamom'],
    'hari elaichi': ['cardamom', 'green cardamom'],
    'choti elaichi': ['cardamom', 'green cardamom'],
    'chhoti elaichi': ['cardamom', 'green cardamom'],
    'yalukalu': ['cardamom', 'green cardamom'],
    'yelakulu': ['cardamom', 'green cardamom'],
    'elakulu': ['cardamom', 'green cardamom'],
    'elakki': ['cardamom', 'green cardamom'],
    'yalakki': ['cardamom', 'green cardamom'],
    'velchi': ['cardamom', 'green cardamom'],
    'hirvi velchi': ['cardamom', 'green cardamom'],
    'cardamom': ['cardamom'],
    'cardamon': ['cardamom'],
    'cardamum': ['cardamom'],
    'elathari': ['cardamom'],

    // White Cardamom & Black Cardamom
    'white cardamom': ['white cardamom'],
    'safed elaichi': ['white cardamom'],
    'velutha elakkaya': ['white cardamom'],
    'vellai elakkai': ['white cardamom'],
    'black cardamom': ['black cardamom'],
    'badi elaichi': ['black cardamom'],
    'moti elaichi': ['black cardamom'],
    'kali elaichi': ['black cardamom'],
    'periya elakkai': ['black cardamom'],
    'valiya elakkaya': ['black cardamom'],

    // Pepper (Tellicherry Black Pepper, Powder, White Pepper)
    'pepper': ['pepper', 'black pepper'],
    'black pepper': ['black pepper'],
    'tellicherry': ['black pepper'],
    'kurumulaku': ['black pepper', 'pepper'],
    'kurumolaku': ['black pepper', 'pepper'],
    'kurmulaku': ['black pepper', 'pepper'],
    'kurumilagu': ['black pepper', 'pepper'],
    'milagu': ['black pepper', 'pepper'],
    'karuppu milagu': ['black pepper', 'pepper'],
    'nallamulaku': ['black pepper', 'pepper'],
    'kali mirch': ['black pepper', 'pepper'],
    'kalimirch': ['black pepper', 'pepper'],
    'golki': ['black pepper', 'pepper'],
    'gol mirch': ['black pepper', 'pepper'],
    'miriyalu': ['black pepper', 'pepper'],
    'nalla miriyalu': ['black pepper', 'pepper'],
    'kari menasu': ['black pepper', 'pepper'],
    'kali miri': ['black pepper', 'pepper'],
    'golmorich': ['black pepper', 'pepper'],
    'white pepper': ['white pepper'],
    'safed mirch': ['white pepper'],
    'vellai milagu': ['white pepper'],
    'velutha kurumulaku': ['white pepper'],
    'tella miriyalu': ['white pepper'],
    'bili menasu': ['white pepper'],

    // Cumin (Jeera / Cumin Seeds / Cumin Powder / Shahi Jeera)
    'jeera': ['jeera', 'cumin'],
    'cumin': ['jeera', 'cumin'],
    'zeera': ['jeera', 'cumin'],
    'jira': ['jeera', 'cumin'],
    'jeere': ['jeera', 'cumin'],
    'jeerakam': ['jeera', 'cumin'],
    'nalla jeerakam': ['jeera', 'cumin'],
    'seeragam': ['jeera', 'cumin'],
    'seragam': ['jeera', 'cumin'],
    'jeeragam': ['jeera', 'cumin'],
    'jeelakarra': ['jeera', 'cumin'],
    'jilakarra': ['jeera', 'cumin'],
    'jeelakara': ['jeera', 'cumin'],
    'jilakara': ['jeera', 'cumin'],
    'jeerige': ['jeera', 'cumin'],
    'jirige': ['jeera', 'cumin'],
    'shahi jeera': ['valyajeerakam', 'shahi jeera'],
    'shahijeera': ['valyajeerakam', 'shahi jeera'],
    'valyajeerakam': ['valyajeerakam', 'shahi jeera'],
    'sahajira': ['valyajeerakam', 'shahi jeera'],

    // Fennel / Sombu / Saunf
    'fennel': ['fennel', 'sombu'],
    'sombu': ['fennel', 'sombu'],
    'saunf': ['fennel', 'sombu'],
    'sonf': ['fennel', 'sombu'],
    'perumjeerakam': ['fennel', 'sombu'],
    'perunjeerakam': ['fennel', 'sombu'],
    'perum jeerakam': ['fennel', 'sombu'],
    'perunjeeragam': ['fennel', 'sombu'],
    'sopu': ['fennel', 'sombu'],
    'sompu': ['fennel', 'sombu'],
    'badishep': ['fennel', 'sombu'],
    'mouri': ['fennel', 'sombu'],
    'variyali': ['fennel', 'sombu'],

    // Cloves / Grampoo / Laung / Krambu
    'cloves': ['cloves'],
    'clove': ['cloves'],
    'grampoo': ['cloves'],
    'krambu': ['cloves'],
    'kirambu': ['cloves'],
    'karambu': ['cloves'],
    'kramboo': ['cloves'],
    'lavangam': ['cloves'],
    'laung': ['cloves'],
    'lavang': ['cloves'],
    'long': ['cloves'],
    'lavangalu': ['cloves'],
    'lavanga': ['cloves'],
    'laving': ['cloves'],
    'lobongo': ['cloves'],

    // Cinnamon & Cassia
    'cinnamon': ['cinnamon', 'pattai'],
    'pattai': ['cinnamon', 'pattai'],
    'karuvapatta': ['cinnamon', 'pattai', 'cassia', 'kesia'],
    'karuvappatta': ['cinnamon', 'pattai'],
    'karuvapattai': ['cinnamon', 'pattai'],
    'dalchini': ['cinnamon', 'pattai', 'cassia', 'kesia'],
    'darchini': ['cinnamon', 'pattai'],
    'cassia': ['cassia', 'kesia'],
    'kesia': ['cassia', 'kesia'],
    'lavangapattai': ['cinnamon', 'pattai'],
    'dalchina chekka': ['cinnamon'],
    'chakke': ['cinnamon'],
    'taj': ['cinnamon', 'cassia'],

    // Star Anise
    'star anise': ['star anise', 'annachipoo'],
    'annachipoo': ['star anise', 'annachipoo'],
    'annasi poo': ['star anise', 'annachipoo'],
    'anasipoo': ['star anise', 'annachipoo'],
    'thakkolam': ['star anise', 'annachipoo'],
    'takkolam': ['star anise', 'annachipoo'],
    'thakolam': ['star anise', 'annachipoo'],
    'chakri phool': ['star anise', 'annachipoo'],
    'chakra phool': ['star anise', 'annachipoo'],
    'anasphal': ['star anise', 'annachipoo'],
    'anasa puvvu': ['star anise', 'annachipoo'],
    'biryani puvvu': ['star anise', 'annachipoo'],
    'chakra moggu': ['star anise', 'annachipoo'],

    // Turmeric
    'turmeric': ['turmeric'],
    'manjal': ['turmeric'],
    'manjal podi': ['turmeric'],
    'manjal thool': ['turmeric'],
    'haldi': ['turmeric'],
    'pasupu': ['turmeric'],
    'pasupu podi': ['turmeric'],
    'arishina': ['turmeric'],
    'halad': ['turmeric'],
    'holud': ['turmeric'],
    'curcumin': ['turmeric'],

    // Ginger / Sonth / Chukku
    'ginger': ['ginger', 'dry ginger'],
    'dry ginger': ['dry ginger', 'ginger'],
    'chukku': ['dry ginger', 'ginger'],
    'sukku': ['dry ginger', 'ginger'],
    'sonth': ['dry ginger', 'ginger'],
    'saunth': ['dry ginger', 'ginger'],
    'inji': ['dry ginger', 'ginger'],
    'adrak': ['dry ginger', 'ginger'],
    'allam': ['dry ginger', 'ginger'],
    'sonti': ['dry ginger', 'ginger'],
    'shunti': ['dry ginger', 'ginger'],
    'sunth': ['dry ginger', 'ginger'],
    'soont': ['dry ginger', 'ginger'],

    // Coriander
    'coriander': ['coriander'],
    'malli': ['coriander'],
    'kothamalli': ['coriander'],
    'dhaniya': ['coriander'],
    'dhania': ['coriander'],
    'dhaniyalu': ['coriander'],
    'kothambari': ['coriander'],
    'dhane': ['coriander'],

    // Nutmeg & Mace
    'nutmeg': ['jaifal', 'nutmeg'],
    'jaifal': ['jaifal', 'nutmeg'],
    'jaiphal': ['jaifal', 'nutmeg'],
    'jathikka': ['jaifal', 'nutmeg'],
    'jathika': ['jaifal', 'nutmeg'],
    'jathikai': ['jaifal', 'nutmeg'],
    'jadhikai': ['jaifal', 'nutmeg'],
    'jajikaya': ['jaifal', 'nutmeg'],
    'jajikayi': ['jaifal', 'nutmeg'],
    'mace': ['javantri', 'mace'],
    'javantri': ['javantri', 'mace'],
    'javitri': ['javantri', 'mace'],
    'jathipathri': ['javantri', 'mace'],
    'jathipoov': ['javantri', 'mace'],
    'vasavasi': ['javantri', 'mace'],
    'japatri': ['javantri', 'mace'],

    // Bay Leaf
    'bay leaf': ['biryani leaf', 'bay leaf'],
    'biryani leaf': ['biryani leaf', 'bay leaf'],
    'vayana ila': ['biryani leaf', 'bay leaf'],
    'biryani ila': ['biryani leaf', 'bay leaf'],
    'biryani ilai': ['biryani leaf', 'bay leaf'],
    'brinji ilai': ['biryani leaf', 'bay leaf'],
    'tejpatta': ['biryani leaf', 'bay leaf'],
    'tej patta': ['biryani leaf', 'bay leaf'],
    'biryani aaku': ['biryani leaf', 'bay leaf'],
    'tejpata': ['biryani leaf', 'bay leaf'],

    // Stone Flower / Kalpasi
    'kalpasi': ['kalpasi', 'stone flower'],
    'stone flower': ['kalpasi', 'stone flower'],
    'marappasi': ['kalpasi', 'stone flower'],
    'dagad phool': ['kalpasi', 'stone flower'],
    'patthar phool': ['kalpasi', 'stone flower'],
    'pathar phool': ['kalpasi', 'stone flower'],
    'kallupasi': ['kalpasi', 'stone flower'],

    // Fenugreek & Kasuri Methi
    'methi': ['methi', 'kasuri methi'],
    'fenugreek': ['methi', 'kasuri methi'],
    'kasuri methi': ['kasuri methi'],
    'kasoori methi': ['kasuri methi'],
    'uluva': ['methi', 'kasuri methi'],
    'vendhayam': ['methi', 'kasuri methi'],
    'menthulu': ['methi'],

    // Mustard
    'mustard': ['mustard'],
    'kaduku': ['mustard'],
    'kadugu': ['mustard'],
    'sarson': ['mustard'],
    'rai': ['mustard'],
    'aavalu': ['mustard'],
    'sasive': ['mustard'],

    // Chillies
    'chilli': ['chilly', 'guntur', 'kashmiri'],
    'chilly': ['chilly', 'guntur', 'kashmiri'],
    'red chilli': ['chilly', 'guntur', 'kashmiri'],
    'guntur': ['guntur'],
    'kashmiri': ['kashmiri'],
    'vattal mulaku': ['chilly', 'guntur', 'kashmiri'],
    'vara milagai': ['chilly', 'guntur', 'kashmiri'],
    'lal mirch': ['chilly', 'guntur', 'kashmiri'],
    'piriyan mulaku': ['kashmiri'],
    'degi mirch': ['kashmiri'],

    // Saffron
    'saffron': ['saffron'],
    'kunkumappoo': ['saffron'],
    'kumkumapoo': ['saffron'],
    'kungumapoo': ['saffron'],
    'kesar': ['saffron'],
    'zafran': ['saffron'],
    'jafran': ['saffron'],

    // Nigella & Sesame
    'nigella': ['nigella'],
    'kalonji': ['nigella'],
    'karinjeerakam': ['nigella'],
    'karunjeeragam': ['nigella'],
    'black seed': ['nigella'],
    'sesame': ['white ellu', 'sesame'],
    'ellu': ['white ellu', 'sesame'],
    'til': ['white ellu', 'sesame'],
    'safed til': ['white ellu', 'sesame'],
    'nuvvulu': ['white ellu', 'sesame'],

    // Seeds
    'chia': ['chia seeds'],
    'sabja': ['sabja seeds'],
    'falooda seeds': ['sabja seeds'],
    'pumpkin seeds': ['pumpkin seeds'],
    'pepitas': ['pumpkin seeds'],
    'sunflower seeds': ['sunflower seeds'],
    'watermelon seeds': ['watermelon seeds'],
    'magaz': ['watermelon seeds'],
    'groundnut': ['groundnut seeds', 'roasted peanut'],
    'peanut': ['groundnut seeds', 'roasted peanut'],
    'kappalandi': ['groundnut seeds', 'roasted peanut'],
    'verkadalai': ['groundnut seeds', 'roasted peanut'],
    'mungfali': ['groundnut seeds', 'roasted peanut'],
    'rose petals': ['dry rose petals'],

    // Dry Fruits & Nuts
    'cashew': ['cashewnut'],
    'cashewnut': ['cashewnut'],
    'kaju': ['cashewnut'],
    'kashuvandi': ['cashewnut'],
    'kasuvandi': ['cashewnut'],
    'andipparippu': ['cashewnut'],
    'mundhiri': ['cashewnut'],
    'munthiri': ['cashewnut'],
    'jeedipappu': ['cashewnut'],
    'godambi': ['cashewnut'],
    'badam': ['badam'],
    'baadam': ['badam'],
    'almond': ['badam'],
    'almonds': ['badam'],
    'badami': ['badam'],
    'pista': ['pista'],
    'pistha': ['pista'],
    'pistachio': ['pista'],
    'walnut': ['walnut'],
    'walnuts': ['walnut'],
    'akhrot': ['walnut'],
    'akrot': ['walnut'],
    'akroot': ['walnut'],
    'kismiss': ['kismiss', 'black kismiss', 'special kismiss'],
    'kismis': ['kismiss', 'black kismiss', 'special kismiss'],
    'kishmish': ['kismiss', 'black kismiss', 'special kismiss'],
    'raisins': ['kismiss', 'black kismiss', 'special kismiss'],
    'munthiringa': ['kismiss', 'black kismiss', 'special kismiss'],
    'unakka munthiri': ['kismiss', 'black kismiss', 'special kismiss'],
    'ular thiratchai': ['kismiss', 'black kismiss', 'special kismiss'],
    'dates': ['dates'],
    'khajoor': ['dates'],
    'khajur': ['dates'],
    'eenthapazham': ['dates'],
    'pericham pazham': ['dates'],
    'fig': ['fig'],
    'figs': ['fig'],
    'anjeer': ['fig'],
    'anjir': ['fig'],
    'athipazham': ['fig']
  };

  function getCustomSourcingCardHtml(query) {
    var rawQ = (query || '').trim();
    var displayQ = rawQ ? rawQ.replace(/</g, '&lt;') : 'rare botanicals or bulk spice lots';
    var waMsg = rawQ ?
      ("Hello KTA Trade Desk, I am looking to custom-source \"" + rawQ + "\" (unlisted grade / custom specification / bulk lot) for our commercial kitchen. Please advise on origin availability, minimum lot sizes, and pricing.") :
      ("Hello KTA Trade Desk, I am looking for Custom Sourcing / Agricultural Procurement for our commercial kitchen. Please advise on grade availability, minimums, and lot pricing.");
    var waUrl = "https://wa.me/918592832871?text=" + encodeURIComponent(waMsg);

    return [
      '<div class="search-custom-sourcing-card">',
      '  <div class="scs-badge">Custom Sourcing &amp; Outsourcing Desk</div>',
      '  <div class="scs-title">Looking to source <em>"' + displayQ + '"</em> or rare botanical lots?</div>',
      '  <p class="scs-desc">Unlisted grades, specific grind specs, and farm-direct container-load consignments.</p>',
      '  <a href="' + waUrl + '" target="_blank" rel="noopener" class="scs-wa-btn">',
      '    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
      '    Request Custom Sourcing on WhatsApp',
      '  </a>',
      '</div>'
    ].join('');
  }

  function renderSearchResults(query, listEl, labelEl) {
    var q = (query || '').trim().toLowerCase();
    
    // Check multilingual aliases safely
    var searchTerms = [q];
    if (q && MULTILINGUAL_SYNONYMS[q]) {
      searchTerms = searchTerms.concat(MULTILINGUAL_SYNONYMS[q]);
    }
    if (q) {
      Object.keys(MULTILINGUAL_SYNONYMS).forEach(function(key) {
        if (key === q || key.startsWith(q) || q.startsWith(key)) {
          searchTerms = searchTerms.concat(MULTILINGUAL_SYNONYMS[key]);
        } else {
          var kWords = key.split(/\s+/);
          var qWords = q.split(/\s+/);
          var matchesWord = kWords.some(function(kw) {
            return qWords.some(function(qw) {
              return kw === qw || (qw.length >= 3 && kw.startsWith(qw));
            });
          });
          if (matchesWord) {
            searchTerms = searchTerms.concat(MULTILINGUAL_SYNONYMS[key]);
          }
        }
      });
    }

    var dedupTerms = [];
    searchTerms.forEach(function(t) {
      if (t && dedupTerms.indexOf(t) === -1) dedupTerms.push(t);
    });

    var matches = searchIndex.filter(function(item){
      if(!q) return true;
      var text = (item.title + ' ' + item.cat + ' ' + item.desc).toLowerCase();
      return dedupTerms.some(function(term){
        return term && text.indexOf(term) !== -1;
      });
    });

    if (labelEl) {
      labelEl.textContent = q ? ('Matching Registry Items (' + matches.length + ')') : 'Catalogue Items & Services';
    }

    var html = '';
    if (matches.length > 0) {
      html += matches.slice(0, 7).map(function(item){
        return [
          '<a href="' + item.page + '" class="search-result-item">',
          '  <div>',
          '    <div class="search-result-title">' + item.title + '</div>',
          '    <div class="search-result-subtitle">' + item.desc + ' · <span style="color:#435128;font-weight:700;">' + item.cat + '</span></div>',
          '  </div>',
          '  <span class="search-result-arrow">→</span>',
          '</a>'
        ].join('');
      }).join('');
    } else if (q) {
      html += '<div style="padding:16px;text-align:center;color:#666;font-size:13px;background:#faf9f6;border-radius:12px;border:1px solid rgba(0,0,0,0.06);">No exact standard catalogue SKU for "<strong>' + query.replace(/</g,'&lt;') + '</strong>".</div>';
    }

    // Always append Custom Sourcing Card
    html += getCustomSourcingCardHtml(query);

    listEl.innerHTML = html;
  }

  function initSearchModal() {
    var backdrop = ensureSearchModal();
    var input    = document.getElementById('searchModalInput');
    var closeBtn = document.getElementById('searchModalClose');
    var listEl   = document.getElementById('searchResultsList');
    var labelEl  = document.getElementById('searchResultsLabel');

    function openSearch() {
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      renderSearchResults('', listEl, labelEl);
      setTimeout(function(){ if(input) { input.focus(); input.select(); } }, 100);
    }

    function closeSearch() {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      if(input) input.value = '';
    }

    // Delegated click listener for all search buttons across pages
    document.addEventListener('click', function(e){
      var searchBtn = e.target.closest('.desktop-search-btn, .mobile-search-btn, #desktopSearchBtn, #mobileSearchBtn');
      if (searchBtn) {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
        return;
      }

      if (e.target === backdrop || e.target.closest('#searchModalClose')) {
        e.preventDefault();
        closeSearch();
        return;
      }

      var chip = e.target.closest('.search-chip');
      if (chip) {
        var q = chip.getAttribute('data-query');
        if (q && input) {
          e.preventDefault();
          input.value = q;
          renderSearchResults(q, listEl, labelEl);
        }
      }
    });

    if (input) {
      input.addEventListener('input', function(){
        renderSearchResults(input.value, listEl, labelEl);
      });

      input.addEventListener('keydown', function(e){
        if (e.key === 'Enter') {
          var val = (input.value || '').trim();
          if (val) {
            window.location.href = 'catalogue.html?search=' + encodeURIComponent(val);
          }
        }
      });
    }

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && backdrop.classList.contains('is-open')){
        closeSearch();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchModal);
  } else {
    initSearchModal();
  }
})();

/* ── 4. Universal Cart / Enquiry Basket Drawer Handler & Three Dots ── */
(function(){
  function ensureMoreOptionsModal() {
    var existing = document.getElementById('moreOptionsBackdrop');
    if (existing) return existing;

    var backdrop = document.createElement('div');
    backdrop.id = 'moreOptionsBackdrop';
    backdrop.className = 'more-options-backdrop';
    backdrop.innerHTML = [
      '<div class="more-options-sheet" id="moreOptionsSheet">',
      '  <div class="more-options-handle"></div>',
      '  <div class="more-options-head">',
      '    <div class="more-options-title">Quick Actions</div>',
      '    <button class="more-options-close" id="moreOptionsClose" aria-label="Close">&times;</button>',
      '  </div>',
      '  <div class="more-options-list">',
      '    <a href="#" class="more-option-item" id="moreOptSearch">',
      '      <span class="more-opt-icon-wrap">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">Search Spices &amp; Products</div>',
      '        <div class="more-opt-sub">Instant SKU, origin, and HSN lookup</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '    <a href="https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20looking%20for%20Custom%20Sourcing%20%2F%20Agricultural%20Procurement%20for%20our%20commercial%20kitchen.%20Please%20advise%20on%20grade%20availability%2C%20minimums%2C%20and%20lot%20pricing." target="_blank" rel="noopener" class="more-option-item" style="background:rgba(67,81,40,0.04);border:1px solid rgba(67,81,40,0.12);border-radius:14px;">',
      '      <span class="more-opt-icon-wrap" style="background:rgba(67,81,40,0.14);color:var(--olive);">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title" style="color:var(--olive);font-weight:700">Custom Sourcing &amp; Procurement</div>',
      '        <div class="more-opt-sub">Single-origin rare lots, custom grind specs &amp; multi-ton consignments</div>',
      '      </div>',
      '      <span class="more-opt-arrow" style="color:var(--olive)">→</span>',
      '    </a>',
      '    <a href="catalogue.html" class="more-option-item">',
      '      <span class="more-opt-icon-wrap">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M6 6h10M6 10h10"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">Browse Full Products &amp; Spices</div>',
      '        <div class="more-opt-sub">51 origin-certified varieties (42 Spices + 9 Dry Fruits)</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '    <a href="wholesale.html" class="more-option-item">',
      '      <span class="more-opt-icon-wrap">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5v8l-9 5-9-5V8Z"/><path d="m12 13 9-5"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">Wholesale Commercial Pricing</div>',
      '        <div class="more-opt-sub">Tiered lot quotes &amp; 500kg+ bulk supply</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '    <a href="index.html#hotelSmart" class="more-option-item">',
      '      <span class="more-opt-icon-wrap">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="13" x="1" y="6" rx="2"/><circle cx="5" cy="19" r="2"/><circle cx="13" cy="19" r="2"/><path d="M17 6h3l3 4.5v5.5h-2"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">24/7 Hotel Smart Delivery</div>',
      '        <div class="more-opt-sub">Dedicated rapid replenishment for hotels &amp; kitchens</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '    <a href="partnership.html#registerKitchen" class="more-option-item">',
      '      <span class="more-opt-icon-wrap">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">Register Kitchen Partnership</div>',
      '        <div class="more-opt-sub">Chef welcome discovery box &amp; 30-day billing</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '    <a href="tel:+918592832871" class="more-option-item" style="color:var(--olive);">',
      '      <span class="more-opt-icon-wrap" style="background:rgba(67,81,40,0.12);color:var(--olive);">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">Call Trade Desk: +91 85928 32871</div>',
      '        <div class="more-opt-sub">Monday–Sunday · 24 Hours (24/7) · Direct Hotline</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '    <a href="https://wa.me/918592832871?text=Hello%20KTA%20Team%2C%20I%20would%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener" class="more-option-item">',
      '      <span class="more-opt-icon-wrap">',
      '        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
      '      </span>',
      '      <div class="more-opt-content">',
      '        <div class="more-opt-title">Chat on WhatsApp</div>',
      '        <div class="more-opt-sub">Instant quotation &amp; lot tracking queries</div>',
      '      </div>',
      '      <span class="more-opt-arrow">→</span>',
      '    </a>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(backdrop);
    return backdrop;
  }

  function initMoreOptions() {
    var backdrop = ensureMoreOptionsModal();
    var closeBtn = document.getElementById('moreOptionsClose');
    var searchOpt = document.getElementById('moreOptSearch');

    function openMore() {
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeMore() {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function(e) {
      var moreBtn = e.target.closest('.mobile-more-btn, #mobileMoreBtn');
      if (moreBtn) {
        e.preventDefault();
        e.stopPropagation();
        openMore();
        return;
      }

      if (e.target === backdrop || e.target.closest('#moreOptionsClose')) {
        e.preventDefault();
        closeMore();
        return;
      }

      var searchLink = e.target.closest('#moreOptSearch');
      if (searchLink) {
        e.preventDefault();
        closeMore();
        var searchBtn = document.getElementById('desktopSearchBtn') || document.getElementById('mobileSearchBtn');
        if (searchBtn) searchBtn.click();
      }
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && backdrop.classList.contains('is-open')){
        closeMore();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMoreOptions);
  } else {
    initMoreOptions();
  }
})();

/* ── 5. Universal Cart / Enquiry Basket Drawer Handler ── */
(function(){
  function ensureQuickBasket() {
    var existing = document.getElementById('quickBasketBackdrop');
    if (existing) return existing;

    var backdrop = document.createElement('div');
    backdrop.id = 'quickBasketBackdrop';
    backdrop.className = 'quick-basket-backdrop';
    backdrop.innerHTML = [
      '<div class="quick-basket-drawer" id="quickBasketDrawer">',
      '  <div class="quick-basket-head">',
      '    <div>',
      '      <div class="quick-basket-title">Kitchen Sample Tray</div>',
      '      <div class="quick-basket-sub">Chef Direct Tasting &amp; Bulk Orders</div>',
      '    </div>',
      '    <button class="quick-basket-close" id="quickBasketClose" aria-label="Close">&times;</button>',
      '  </div>',
      '  <div class="quick-basket-body">',
      '    <div class="quick-basket-card">',
      '      <h4 style="display:flex;align-items:center;gap:8px;">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;color:var(--olive);"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>',
      '        Origin-Certified Samples',
      '      </h4>',
      '      <p>Select raw origin cardamom, Tellicherry pepper, and saffron samples directly delivered to your restaurant or commercial kitchen.</p>',
      '      <a href="catalogue.html" class="quick-basket-btn btn-primary-green" style="font-size:12px;padding:9px 16px;">Browse Products →</a>',
      '    </div>',
      '    <div class="quick-basket-card">',
      '      <h4 style="display:flex;align-items:center;gap:8px;">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;color:var(--olive);"><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5v8l-9 5-9-5V8Z"/></svg>',
      '        Bulk &amp; Wholesale Trade Desk',
      '      </h4>',
      '      <p>Direct supply contracts, batch lab reports, and priority next-day replenishment across South India.</p>',
      '      <a href="wholesale.html" class="quick-basket-btn btn-outline-dark" style="font-size:12px;padding:9px 16px;">View Wholesale Pricing →</a>',
      '    </div>',
      '    <div class="quick-basket-actions">',
      '      <a href="https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20want%20to%20request%20samples%20and%20commercial%20pricing." target="_blank" rel="noopener" class="quick-basket-btn btn-wa" style="display:flex;align-items:center;justify-content:center;gap:8px;">',
      '        <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
      '        Quick WhatsApp Order Request',
      '      </a>',
      '      <a href="tel:+918592832871" class="quick-basket-btn btn-outline-dark" style="display:flex;align-items:center;justify-content:center;gap:8px;">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
      '        Call Trade Desk: +91 85928 32871',
      '      </a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(backdrop);
    return backdrop;
  }

  function initCartButtons() {
    var cartBtns = document.querySelectorAll('.mobile-cart-btn, #mobileCartBtn');
    if (!cartBtns.length) return;

    cartBtns.forEach(function(btn){
      btn.onclick = function(e){
        e.preventDefault();
        e.stopPropagation();

        // If on catalogue.html and sample tray exists, open sample tray drawer
        var trayDrawer = document.getElementById('trayDrawer');
        var trayBackdrop = document.getElementById('trayBackdrop');
        if (trayDrawer && trayBackdrop) {
          trayDrawer.classList.add('active');
          trayBackdrop.classList.add('active');
          document.body.style.overflow = 'hidden';
          if (typeof window.renderTray === 'function') window.renderTray();
          return;
        }

        // On other pages, open Quick Basket drawer
        var qBackdrop = ensureQuickBasket();
        var qClose    = document.getElementById('quickBasketClose');

        function openQuickBasket() {
          qBackdrop.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
        function closeQuickBasket() {
          qBackdrop.classList.remove('is-open');
          document.body.style.overflow = '';
        }

        if (qClose) qClose.onclick = closeQuickBasket;
        qBackdrop.onclick = function(ev){
          if(ev.target === qBackdrop) closeQuickBasket();
        };

        openQuickBasket();
      };
    });

    // Update cart badge if localStorage has items
    try {
      var saved = localStorage.getItem('kta_sample_tray');
      var items = saved ? JSON.parse(saved) : [];
      var badges = document.querySelectorAll('.mobile-cart-badge, #cartBadgeCount');
      badges.forEach(function(b){
        if (items && items.length > 0) {
          b.textContent = items.length;
          b.style.display = 'inline-block';
        } else {
          b.style.display = 'none';
        }
      });
    } catch(err){}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartButtons);
  } else {
    initCartButtons();
  }
})();

/* ── 5. Stat Counters ── */
(function(){
  var els = document.querySelectorAll('[data-counter]');
  if(!els.length) return;

  function animate(el){
    var target   = parseFloat(el.dataset.counter);
    var suffix   = el.dataset.suffix||'';
    var prefix   = el.dataset.prefix||'';
    var decimals = (String(target).split('.')[1]||'').length;
    var duration = 800;
    var start    = null;
    function ease(t){ return 1-Math.pow(1-t,3); }
    function step(ts){
      if(!start) start=ts;
      var p  = Math.min((ts-start)/duration,1);
      var v  = target*ease(p);
      el.textContent = prefix+(decimals?v.toFixed(decimals):Math.round(v))+suffix;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ animate(e.target); io.unobserve(e.target); }
    });
  },{threshold:0.2});
  els.forEach(function(el){ io.observe(el); });
})();

/* ── 6. Horizontal Scroll Navigation (Fluid Native Momentum & Smooth Step Navigation) ── */
(function(){
  function initFlamingoScrollers() {
    document.querySelectorAll('.scroll-row-wrap').forEach(function(wrap){
      var row  = wrap.querySelector('.scroll-row');
      var prev = wrap.querySelector('.arrow-prev');
      var next = wrap.querySelector('.arrow-next');
      if(!row || row.dataset.flamingoInit) return;
      row.dataset.flamingoInit = 'true';

      function getStep() {
        var card = row.querySelector('.product-card, .ws-product-card, .estate-card');
        return card ? (card.offsetWidth + 16) : Math.min(320, row.clientWidth * 0.8);
      }

      function stepScroll(dir) {
        var step = getStep();
        row.scrollBy({ left: dir * step, behavior: 'smooth' });
      }

      if(prev) {
        prev.onclick = function(e){ e.preventDefault(); stepScroll(-1); };
      }
      if(next) {
        next.onclick = function(e){ e.preventDefault(); stepScroll(1); };
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlamingoScrollers);
  } else {
    initFlamingoScrollers();
  }
})();


/* ── 7. Wholesale Carousel ── */
(function(){
  var carousel = document.getElementById('wsCarousel');
  if(!carousel) return;
  var slides  = carousel.querySelectorAll('.ws-slide');
  var prevBtn = document.getElementById('wsPrev');
  var nextBtn = document.getElementById('wsNext');
  var counter = document.getElementById('wsCounter');
  var total   = slides.length;
  var current = 0;
  var timer;

  function show(idx){
    slides.forEach(function(s){ s.classList.remove('active'); });
    slides[idx].classList.add('active');
    if(counter) counter.textContent=(idx+1)+' / '+total;
  }
  function advance(){ current=(current+1)%total; show(current); }

  function startTimer(){ timer=setInterval(advance,5000); }
  function resetTimer(){ clearInterval(timer); startTimer(); }

  if(prevBtn) prevBtn.addEventListener('click',function(){ current=(current-1+total)%total; show(current); resetTimer(); });
  if(nextBtn) nextBtn.addEventListener('click',function(){ current=(current+1)%total; show(current); resetTimer(); });

  show(0);
  startTimer();
})();

/* ── 8. FAQ Accordion Handler ── */
window.toggleFaq = function(el) {
  var header = el;
  if (!header.classList.contains('faq-header') && !header.classList.contains('faq-question')) {
    header = el.closest('.faq-header, .faq-question');
  }
  if (!header) return;

  var item = header.closest('.faq-card, .faq-item');
  if (!item) return;

  var wasActive = item.classList.contains('active');
  document.querySelectorAll('.faq-card, .faq-item').forEach(function(i) {
    i.classList.remove('active');
  });

  if (!wasActive) {
    item.classList.add('active');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.faq-header, .faq-question').forEach(function(hdr) {
    hdr.removeAttribute('onclick');
    hdr.style.cursor = 'pointer';
    hdr.addEventListener('click', function(e) {
      e.preventDefault();
      window.toggleFaq(this);
    });
  });

  document.querySelectorAll('.faq-btn-icon').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.toggleFaq(this.closest('.faq-header, .faq-question') || this);
    });
  });
});

/* ── 9. Universal Nav Scroll Floating ── */
(function(){
  var nav = document.getElementById('homeNav');
  if(!nav) return;
  window.addEventListener('scroll', function(){
    if(window.scrollY > 30){
      nav.classList.add('floating');
    } else {
      nav.classList.remove('floating');
    }
  }, {passive:true});
})();

/* ── 10. Technical Batch QC Spec Sheet System ── */
var QC_SPECS = {
  'BLACK PEPPER': {
    botanical: 'Piper nigrum L.',
    grade: 'TGSEB Tellicherry Garbled Extra Bold',
    hsn: '09041140',
    oil: 'Rich Natural Volatiles · Sourced & Graded by KTA Alone',
    active: 'Sourced & graded by KTA alone · Pristine Single-Origin Purity',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Adulteration · Cleaned & Garbled',
    density: '560 – 580 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Multi-Wall Master Bags (500kg+ MOQ) / 1kg Barrier Pouches'
  },
  'PEPPER POWDER': {
    botanical: 'Piper nigrum L. (Ground)',
    grade: 'Chef-Grade Cold-Milled Black Pepper Powder',
    hsn: '09041219',
    oil: 'Rich Volatile Aroma · 100% Pure Pepper',
    active: 'Sourced & graded by KTA alone · Zero Starch Filler',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Adulteration / Pure Ground',
    density: '520 – 550 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags / 1kg Kitchen Pouches'
  },
  'BLACK PEPPER POWDER': {
    botanical: 'Piper nigrum L. (Ground)',
    grade: 'Chef-Grade Cold-Milled Black Pepper Powder',
    hsn: '09041200',
    oil: 'Rich Volatile Aroma · 100% Pure Pepper',
    active: 'Sourced & graded by KTA alone · Zero Starch Filler',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Adulteration / Pure Ground',
    density: '520 – 550 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags / 1kg Kitchen Pouches'
  },
  'DHANIA POWDER': {
    botanical: 'Coriandrum sativum L. (Ground)',
    grade: 'Cold-Milled Eagle Coriander Powder',
    hsn: '09092200',
    oil: 'Natural Essential Aroma Volatiles',
    active: 'Sourced & graded by KTA alone · High Linalool Aroma Density',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Fillers / 100% Pure Coriander',
    density: '480 – 520 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags (500kg+ MOQ) / 1kg Barrier Pouches'
  },
  'CORIANDER POWDER': {
    botanical: 'Coriandrum sativum L. (Ground)',
    grade: 'Cold-Milled Eagle Coriander Powder',
    hsn: '09092200',
    oil: 'Natural Essential Aroma Volatiles',
    active: 'Sourced & graded by KTA alone · High Linalool Aroma Density',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Fillers / 100% Pure Coriander',
    density: '480 – 520 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags (500kg+ MOQ) / 1kg Barrier Pouches'
  },
  'JEERA POWDER': {
    botanical: 'Cuminum cyminum L. (Ground)',
    grade: 'Stone-Milled Pure Cumin Powder',
    hsn: '09093200',
    oil: 'Rich Cuminaldehyde Volatile Aroma',
    active: 'Sourced & graded by KTA alone · High Aroma Density',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Starch or Sand / Cleaned Seed Lot',
    density: '490 – 530 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags (500kg+ MOQ) / 1kg Barrier Pouches'
  },
  'KASHMIRI CHILLY': {
    botanical: 'Capsicum annuum L. (Kashmiri Selection)',
    grade: 'Deep Crimson Natural Color Pods & Powder',
    hsn: '09042219',
    oil: 'High Natural Capsanthin & Carotenoids',
    active: 'Sourced & graded by KTA alone · Mild Balanced Warmth (1,500–2,500 SHU)',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Stemless Handpicked Grade',
    density: '460 – 500 g/L',
    origin: 'Highland Specific',
    pkg: '25kg & 40kg Moisture-Locked Bags / 1kg Chef Pouches'
  },
  'KASHMIRI CHILLI POWDER': {
    botanical: 'Capsicum annuum L. (Ground Kashmiri)',
    grade: 'Cold-Milled Vibrant Scarlet Chilli Powder',
    hsn: '09042211',
    oil: 'High Natural ASTA Color Units · Zero Added Dye',
    active: 'Sourced & graded by KTA alone · Mild Warmth (1,500–2,200 SHU)',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Starch, Zero Sudan Dye, Cleaned Stemless Milling',
    density: '450 – 480 g/L',
    origin: 'Highland Specific',
    pkg: '25kg & 40kg Master Sacks (500kg+ MOQ) / 1kg Barrier Pouches'
  },
  'ROYAL GARAM MASALA': {
    botanical: 'Proprietary Executive Spice Blend',
    grade: 'Master Chef Small-Batch Whole-Ground Masala',
    hsn: '09109100',
    oil: 'High Eugenol, Cinnamaldehyde & Terpene Aroma',
    active: 'Sourced & graded by KTA alone · 100% Pure Spices · Zero Starches',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Cleaned & Sorted Botanical Whole Spices',
    density: '510 – 540 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags / 1kg Multi-Wall Chef Pouches'
  },
  'ROYAL BIRYANI MASALA': {
    botanical: 'Executive Royal Dum Aromatic Infusion',
    grade: 'Shahi Biryani Authentic Whole-Ground Master Blend',
    hsn: '09109100',
    oil: 'Intense Shahi Jeera, Green Cardamom, Mace & Star Anise Volatiles',
    active: 'Sourced & graded by KTA alone · High Aromatic Potency for Slow Dum Cooking',
    moisture: 'Tested Safe Low Moisture',
    extraneous: '100% Unadulterated Whole Botanicals',
    density: '500 – 530 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Bags / 1kg Multi-Wall Chef Pouches'
  },
  'BLACK DRY LEMON (LOOMI)': {
    botanical: 'Citrus aurantiifolia (Christm.) Swingle',
    grade: 'Sun-Cured Black Loomi Lime Whole',
    hsn: '08055000',
    oil: 'Natural Terpenes & Concentrated Citric Fragrance',
    active: 'Sourced & graded by KTA alone · Smokey Citrus Flavor Profile',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Hand-Selected Intact Dried Limes',
    density: '260 – 300 g/L',
    origin: 'Highland Specific',
    pkg: '25kg & 40kg Master Bags / 1kg Chef Pouches'
  },
  'SPECIAL KISMISS': {
    botanical: 'Vitis vinifera L.',
    grade: 'Plump Select Sun-Dried Green Grapes',
    hsn: '08062090',
    oil: 'Natural Fruit Sugars (Fructose & Glucose)',
    active: 'Sourced & graded by KTA alone · Uniform Long Green Berries',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Cap-stemmed & Laser Sorted',
    density: '620 – 660 g/L',
    origin: 'Highland Specific',
    pkg: '15kg Master Cartons / 1kg Kitchen Pouches'
  },
  'KISMISS (RAISINS)': {
    botanical: 'Vitis vinifera L.',
    grade: 'Plump Select Sun-Dried Green & Golden Grapes',
    hsn: '08062010',
    oil: 'Natural Fructose & Glucose',
    active: 'Sourced & graded by KTA alone · Golden Seedless Sweet Berries',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Cap-stemmed & Sorted',
    density: '620 – 650 g/L',
    origin: 'Highland Specific',
    pkg: '15kg Master Cartons / 1kg Kitchen Pouches'
  },
  'GREEN GINGER': {
    botanical: 'Zingiber officinale Roscoe',
    grade: 'Jumbo Plump Fresh Farm Rhizomes (Washed & Soil-Free)',
    hsn: '09101110',
    oil: 'Natural Gingerol & Fresh Essential Citrus Aroma',
    active: 'Sourced & graded by KTA alone · Crisp Fibrous Moisture-Rich Purity',
    moisture: 'Fresh Farm Produce (Cleaned & Air-Dried Skin)',
    extraneous: 'Zero Soil / 100% Cleaned Farm-Direct Rhizomes',
    density: 'Commercial Jumbo Rhizome Fingers',
    origin: 'Highland Specific',
    pkg: '40kg/50kg Master Ventilated Mesh Bags & Export Crates (500kg+ MOQ)'
  },
  'DRY GINGER (WHOLE)': {
    botanical: 'Zingiber officinale Roscoe (Dried)',
    grade: 'Sun-Dried Unbleached Whole Cochin Ginger (Sonth/Chukku)',
    hsn: '09101110',
    oil: 'Rich Gingerol & Shogaol Volatiles',
    active: 'Sourced & graded by KTA alone · Natural Unbleached Purity',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Hand-Selected Cleaned Rhizomes',
    density: '520 – 560 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Multi-Wall Master Bags (500kg+ MOQ) / 1kg Chef Pouches'
  },
  'ALL SPICES SPENT': {
    botanical: 'Mixed Botanical Post-Extraction Residues',
    grade: 'Industrial Spent Spice Biomass (Moisture-Controlled)',
    hsn: 'Industrial Biomass / Agro Byproduct',
    oil: 'Residual Botanical Trace Fractions',
    active: 'Cleaned Post-Oleoresin Residual Fiber',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Sorted Industrial Feed Grade',
    density: '380 – 420 g/L',
    origin: 'Highland Specific',
    pkg: '40kg Master Bags / Multi-Ton Bulk Consignments'
  },
  'CLOVES': {
    botanical: 'Syzygium aromaticum',
    grade: 'Hand-Selected Grade A Whole Flower Buds',
    hsn: '09071010',
    oil: 'Rich Natural Eugenol Volatiles',
    active: 'Sourced & graded by KTA alone · Intact Full Head Buds',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Spent Waste · Stems & Dust Cleaned',
    density: '540 – 560 g/L',
    origin: 'Highland Specific',
    pkg: '25kg & 40kg Moisture-Barrier Consignments'
  }
};

window.openSpecSheet = function(skuName) {
  var key = (skuName || '').toUpperCase().trim();
  var spec = QC_SPECS[key] || {
    botanical: 'Single-Origin Culinary Specimen',
    grade: 'First Quality Food-Service Batch',
    hsn: '0904 / 0910 Series',
    oil: 'Standard Export Volatile Oil Threshold',
    active: 'Certified Active Essential Yield',
    moisture: 'Tested Safe Low Moisture',
    extraneous: 'Zero Foreign Matter / Cleaned Lot',
    density: 'Graded Uniform Bulk Density',
    origin: 'Highland Specific',
    pkg: '40kg Food-Grade Master Consignment Bags (500kg+ MOQ)'
  };

  var existing = document.getElementById('specModalBackdrop');
  if (existing) existing.remove();

  var backdrop = document.createElement('div');
  backdrop.id = 'specModalBackdrop';
  backdrop.className = 'spec-modal-backdrop';
  backdrop.innerHTML = [
    '<div class="spec-modal">',
    '  <button class="rfq-modal-close" onclick="document.getElementById(\'specModalBackdrop\').remove()">&times;</button>',
    '  <div class="spec-modal-head">',
    '    <span class="harvest-origin-badge">Official Batch Specification</span>',
    '    <div class="spec-modal-sku" style="margin-top:6px">' + key + '</div>',
    '    <div class="spec-modal-botanical">' + spec.botanical + '</div>',
    '  </div>',
    '  <table class="spec-table">',
    '    <tbody>',
    '      <tr><th>HSN Code</th><td>' + spec.hsn + '</td></tr>',
    '      <tr><th>Commercial Grade</th><td>' + spec.grade + '</td></tr>',
    '      <tr><th>Volatile Oil Yield</th><td>' + spec.oil + '</td></tr>',
    '      <tr><th>Active Potency</th><td>' + spec.active + '</td></tr>',
    '      <tr><th>Moisture Threshold</th><td>' + spec.moisture + '</td></tr>',
    '      <tr><th>Extraneous Matter</th><td>' + spec.extraneous + '</td></tr>',
    '      <tr><th>Bulk Density</th><td>' + (spec.density || 'Standard Graded') + '</td></tr>',
    '      <tr><th>Harvest Terroir</th><td>' + (spec.origin || 'Highland Specific') + '</td></tr>',
    '      <tr><th>Standard Packaging</th><td>' + spec.pkg + '</td></tr>',
    '    </tbody>',
    '  </table>',
    '  <div class="spec-coa-note">',
    '    <strong>Origin Purity:</strong> All KTA consignments are Highland Specific, sourced and graded by KTA alone with 100% unadulterated single-origin purity.',
    '  </div>',
    '  <button type="button" class="rfq-submit-btn" style="margin-top:14px" onclick="document.getElementById(\'specModalBackdrop\').remove(); window.openFastRfq(\'' + key.replace(/'/g, "\\'") + '\', \'' + spec.hsn + '\', \'' + (spec.origin || 'Highland Specific').replace(/'/g, "\\'") + '\')">',
    '    Request Lot Sample / Formal Quote',
    '  </button>',
    '</div>'
  ].join('');

  document.body.appendChild(backdrop);
  setTimeout(function(){ backdrop.classList.add('is-open'); }, 10);

  backdrop.addEventListener('click', function(e){
    if(e.target === backdrop) backdrop.remove();
  });
};

/* ── 11. One-Tap Institutional RFQ Modal ── */
window.openFastRfq = function(skuName, hsn, origin) {
  var existing = document.getElementById('rfqModalBackdrop');
  if (existing) existing.remove();

  var selectedWeight = '500kg (Wholesale MOQ)';

  var backdrop = document.createElement('div');
  backdrop.id = 'rfqModalBackdrop';
  backdrop.className = 'rfq-modal-backdrop';
  backdrop.innerHTML = [
    '<div class="rfq-modal">',
    '  <button class="rfq-modal-close" onclick="document.getElementById(\'rfqModalBackdrop\').remove()">&times;</button>',
    '  <div class="harvest-origin-badge">Institutional Quotation Desk</div>',
    '  <h3 class="rfq-modal-title" style="margin-top:6px">Commercial Lot RFQ</h3>',
    '  <div class="rfq-modal-sku">' + (skuName || 'Single-Origin Variety') + (hsn ? ' · HSN: ' + hsn : '') + '</div>',
    '  <div class="rfq-option-label">1. Select Target Volume</div>',
    '  <div class="rfq-weights-grid" id="rfqWeightButtons">',
    '    <button type="button" class="rfq-weight-btn" data-val="1kg Trial Pack">1kg Trial</button>',
    '    <button type="button" class="rfq-weight-btn active" data-val="500kg (Wholesale MOQ)">500kg (MOQ)</button>',
    '    <button type="button" class="rfq-weight-btn" data-val="1 Ton+ Lot">1 Ton+</button>',
    '    <button type="button" class="rfq-weight-btn" data-val="3 Ton+ Consignment">3 Ton+</button>',
    '    <button type="button" class="rfq-weight-btn" data-val="5 Ton+ Commercial">5 Ton+</button>',
    '  </div>',
    '  <div class="rfq-option-label">2. Master Packaging Unit</div>',
    '  <select id="rfqPkgSelect" class="rfq-pkg-select">',
    '    <option value="40kg Food-Grade Master Consignment Bags (500kg+ MOQ)">40kg Food-Grade Master Consignment Bags (500kg+ MOQ)</option>',
    '    <option value="1kg Chef Trial Pouches">1kg Chef Trial Pouches</option>',
    '    <option value="Export Multi-Layer Moisture-Locked Consignment">Export Multi-Layer Moisture-Locked Consignment</option>',
    '  </select>',
    '  <div class="rfq-option-label">3. Destination Receiving Bay (City)</div>',
    '  <input type="text" id="rfqCityInput" class="rfq-city-input" placeholder="e.g. Chennai, Bengaluru, Hyderabad, Kochi">',
    '  <button type="button" class="rfq-submit-btn" id="rfqSendBtn">',
    '    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>',
    '    Generate WhatsApp Quote',
    '  </button>',
    '</div>'
  ].join('');

  document.body.appendChild(backdrop);
  setTimeout(function(){ backdrop.classList.add('is-open'); }, 10);

  var btns = backdrop.querySelectorAll('.rfq-weight-btn');
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      btns.forEach(function(x){ x.classList.remove('active'); });
      b.classList.add('active');
      selectedWeight = b.getAttribute('data-val');
    });
  });

  backdrop.querySelector('#rfqSendBtn').addEventListener('click', function(){
    var pkg = backdrop.querySelector('#rfqPkgSelect').value;
    var city = backdrop.querySelector('#rfqCityInput').value.trim() || 'South India Delivery Bay';
    var msg = "Hello KTA Trade Desk, I am requesting a formal wholesale quotation for: *" + (skuName || 'Spices') + "*\n" +
              "• Target Volume: " + selectedWeight + "\n" +
              "• Packaging: " + pkg + "\n" +
              "• Delivery Destination: " + city + "\n" +
              "Please share active lot batch availability and commercial tiered rates.";
    var waUrl = "https://wa.me/918592832871?text=" + encodeURIComponent(msg);
    window.open(waUrl, '_blank');
    backdrop.remove();
  });

  backdrop.addEventListener('click', function(e){
    if(e.target === backdrop) backdrop.remove();
  });
};

/* ── Flush Reservation Modal Handlers ── */
window.openFlushReservation = function(spiceName, seasonWindow) {
  var modal = document.getElementById('flushReserveModal');
  if (!modal) return;
  var varInp = document.getElementById('flushVarietyInput');
  var ssnInp = document.getElementById('flushSeasonInput');
  if (varInp) varInp.value = spiceName;
  if (ssnInp) ssnInp.value = seasonWindow || 'Upcoming Harvest Window';
  modal.style.display = 'flex';
};

window.closeFlushReservation = function() {
  var modal = document.getElementById('flushReserveModal');
  if (modal) modal.style.display = 'none';
};

window.selectFlushWeight = function(weightStr, btn) {
  var hidden = document.getElementById('flushSelectedWeight');
  if (hidden) hidden.value = weightStr;
  var parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('.rfq-chip').forEach(function(c){ c.classList.remove('active'); });
    btn.classList.add('active');
  }
};

window.submitFlushReservation = function() {
  var variety = document.getElementById('flushVarietyInput') ? document.getElementById('flushVarietyInput').value : 'Origin Spices';
  var season = document.getElementById('flushSeasonInput') ? document.getElementById('flushSeasonInput').value : 'Upcoming Flush';
  var weight = document.getElementById('flushSelectedWeight') ? document.getElementById('flushSelectedWeight').value : '500kg (13 Master Bags)';
  var hotel = document.getElementById('flushHotelName') ? document.getElementById('flushHotelName').value.trim() : '';
  
  var hotelText = hotel ? " for *" + hotel + "*" : "";
  var msg = "Hello KTA Trade Desk, I would like to reserve upcoming direct harvest allocation" + hotelText + ":\n" +
            "• Variety: *" + variety + "*\n" +
            "• Harvest Window: " + season + "\n" +
            "• Target Volume: " + weight + "\n" +
            "Please record our priority allocation and notify our purchase desk as soon as initial farm lots complete sun-curing.";
  
  var waUrl = "https://wa.me/918592832871?text=" + encodeURIComponent(msg);
  window.open(waUrl, '_blank');
  window.closeFlushReservation();
};

/* ── Chef Discovery Samples Modal Controller ── */
(function(){
  function initChefWelcomeModal() {
    var p = window.location.pathname.toLowerCase();
    var filename = p.substring(Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\')) + 1);
    if (filename && filename !== 'index.html' && filename.includes('.html')) {
      return;
    }

    var modal = document.getElementById('chefWelcomeModal');

    // If modal not present in DOM, dynamically create and append it
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'chefWelcomeModal';
      modal.className = 'chef-popup-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'chefPopupTitle');
      modal.innerHTML = [
        '<div class="chef-popup-card">',
        '  <button class="chef-popup-close" id="chefPopupCloseBtn" aria-label="Close Modal">&times;</button>',
        '  <div class="chef-popup-visual">',
        '    <img src="images/ktachefboxnew.webp" alt="KTA Chef Discovery Sample Kit" class="chef-popup-box-img" loading="eager">',
        '    <div class="chef-popup-stamp">DISCOVERY SAMPLES</div>',
        '  </div>',
        '  <div class="chef-popup-content">',
        '    <div>',
        '      <span class="chef-popup-eyebrow">Executive Chef Program</span>',
        '      <h2 class="chef-popup-title" id="chefPopupTitle">Request Your <span class="chef-popup-highlight">Chef Discovery Samples</span>.</h2>',
        '      <p class="chef-popup-desc">Sourced and graded by KTA alone. Sample dispatch will be arranged according to your kitchen location before setting up commercial 2–24h replenishment.</p>',
        '      <form id="chefInlineClaimForm" onsubmit="window.handleChefModalSubmit(event)" style="margin-top:10px">',
        '        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">',
        '          <input type="text" id="chefModalName" placeholder="Executive Chef Name *" required style="padding:9px 12px;border:1px solid #d5ddd0;border-radius:6px;font-size:12.5px;outline:none;background:#fdfdfd;font-family:inherit;width:100%;box-sizing:border-box;">',
        '          <input type="text" id="chefModalHotel" placeholder="Hotel / Establishment *" required style="padding:9px 12px;border:1px solid #d5ddd0;border-radius:6px;font-size:12.5px;outline:none;background:#fdfdfd;font-family:inherit;width:100%;box-sizing:border-box;">',
        '        </div>',
        '        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">',
        '          <input type="text" id="chefModalCity" placeholder="City & State (Place Name) *" required style="padding:9px 12px;border:1px solid #d5ddd0;border-radius:6px;font-size:12.5px;outline:none;background:#fdfdfd;font-family:inherit;width:100%;box-sizing:border-box;">',
        '          <input type="tel" id="chefModalPhone" placeholder="WhatsApp / Phone Number *" required style="padding:9px 12px;border:1px solid #d5ddd0;border-radius:6px;font-size:12.5px;outline:none;background:#fdfdfd;font-family:inherit;width:100%;box-sizing:border-box;">',
        '        </div>',
        '        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">',
        '          <input type="email" id="chefModalEmail" placeholder="Official Business Email" style="padding:9px 12px;border:1px solid #d5ddd0;border-radius:6px;font-size:12.5px;outline:none;background:#fdfdfd;font-family:inherit;width:100%;box-sizing:border-box;">',
        '          <input type="text" id="chefModalProducts" placeholder="Varieties (e.g. Pepper, Cardamom, Cloves)" style="padding:9px 12px;border:1px solid #d5ddd0;border-radius:6px;font-size:12.5px;outline:none;background:#fdfdfd;font-family:inherit;width:100%;box-sizing:border-box;">',
        '        </div>',
        '        <div class="chef-popup-actions" style="margin-top:0">',
        '          <button type="submit" class="chef-popup-btn-primary" id="claimBoxSubmitBtn" style="border:none;cursor:pointer;flex:1;text-align:center;">Request Discovery Kit</button>',
        '          <a href="https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20an%20Executive%20Chef%20requesting%20Chef%20Discovery%20Samples%20to%20test%20in%20our%20kitchen." target="_blank" rel="noopener" class="chef-popup-btn-secondary">WhatsApp</a>',
        '        </div>',
        '      </form>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
      document.body.appendChild(modal);
    }

    // Always create and append the persistent floating trigger if not present
    var floatTrigger = document.getElementById('chefFloatTrigger');
    if (!floatTrigger) {
      floatTrigger = document.createElement('button');
      floatTrigger.id = 'chefFloatTrigger';
      floatTrigger.className = 'chef-float-trigger';
      floatTrigger.setAttribute('aria-label', 'Request Chef Welcome Box (Free)');
      floatTrigger.innerHTML = [
        '<span class="chef-float-icon">',
        '  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>',
        '    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>',
        '    <line x1="12" y1="22.08" x2="12" y2="12"></line>',
        '  </svg>',
        '</span>',
        '<span class="chef-float-text">Chef Welcome Box · FREE</span>',
        '<span class="chef-float-dot"></span>'
      ].join('');
      document.body.appendChild(floatTrigger);
    }

    var closeBtn = document.getElementById('chefPopupCloseBtn');
    var claimBtn = document.getElementById('claimBoxBtn');

    function openModal() {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
      try {
        sessionStorage.setItem('kta_chef_welcome_popup_seen', 'true');
      } catch (e) {}
    }

    // Auto open on initial entry ONLY on home page
    var isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    var hasSeen = false;
    try {
      hasSeen = sessionStorage.getItem('kta_chef_welcome_popup_seen') === 'true';
    } catch(e) {}

    if (isHome && !hasSeen) {
      setTimeout(function(){
        if (!modal.classList.contains('is-active')) {
          openModal();
        }
      }, 10000);
    }

    if (floatTrigger) {
      floatTrigger.onclick = function(e) {
        e.preventDefault();
        openModal();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      };
    }

    modal.onclick = function(e) {
      if (e.target === modal) {
        closeModal();
      }
    };

    if (claimBtn) {
      claimBtn.onclick = function() {
        closeModal();
      };
    }

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });

    window.openChefWelcomeBoxModal = openModal;
    window.closeChefWelcomeBoxModal = closeModal;

    window.handleChefModalSubmit = function(e) {
      e.preventDefault();
      var name = document.getElementById('chefModalName') ? document.getElementById('chefModalName').value.trim() : '';
      var hotel = document.getElementById('chefModalHotel') ? document.getElementById('chefModalHotel').value.trim() : '';
      var city = document.getElementById('chefModalCity') ? document.getElementById('chefModalCity').value.trim() : '';
      var phone = document.getElementById('chefModalPhone') ? document.getElementById('chefModalPhone').value.trim() : '';
      var email = document.getElementById('chefModalEmail') ? document.getElementById('chefModalEmail').value.trim() : '';
      var products = document.getElementById('chefModalProducts') ? document.getElementById('chefModalProducts').value.trim() : '';

      if (!name || !hotel || !phone || !city) {
        alert('Please fill in your Name, Hotel / Establishment, City & State, and Contact Phone Number.');
        return;
      }

      var formData = {
        name: name,
        managerName: name,
        clientName: name,
        hotelName: hotel,
        property: hotel,
        city: city,
        location: city,
        contactPhone: phone,
        phone: phone,
        email: email || 'Not Provided',
        products: products || 'Chef Discovery Sample Kit (Tellicherry Pepper, Cardamom 8mm+, Kashmiri Chilly, Turmeric, Cloves)',
        volume: 'Chef Discovery Sample Kit',
        message: 'Chef Discovery Sample Kit Request from Universal Modal Popup',
        sourcePage: window.location.pathname || 'Universal Chef Modal'
      };

      if (window.submitKTAForm) {
        window.submitKTAForm(formData, {
          formName: 'Chef Discovery Samples',
          successMsg: 'Thank you, Chef ' + name + ' (' + hotel + ', ' + city + ')! Your Chef Discovery Sample Kit request has been registered. Our culinary trade desk will arrange dispatch.'
        });
      }

      closeModal();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChefWelcomeModal);
  } else {
    initChefWelcomeModal();
  }
})();

/* ══════════════════════════════════════════════════════════════
   UNIVERSAL LEAD DISPATCHER (GOOGLE SHEETS / EXCEL + INSTANT EMAIL)
   ══════════════════════════════════════════════════════════════ */
window.KTA_FORM_CONFIG = {
  // Live Google Apps Script Web App URL for Excel CRM logging & Zoho Mail alerts:
  webhookUrl: 'https://script.google.com/macros/s/AKfycbwo0LClDvVJdAmssN23XHrMxLybiivwj5opo1kNKRrs6c7R5ZNL_tGR8tuMyzglPC6DYg/exec',
  wholesaleEmail: 'wholesale@ktaspices.in',
  ordersEmail: 'orders@ktaspices.in',
  generalEmail: 'info@ktaspices.in'
};

window.submitKTAForm = function(formData, options) {
  options = options || {};
  var formName = options.formName || 'Website Inquiry';
  var successMsg = options.successMsg || 'Thank you! Your inquiry has been successfully received.';

  formData.formName = formName;
  formData.timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // 1. Dispatch to Google Apps Script / Webhook if configured
  if (window.KTA_FORM_CONFIG && window.KTA_FORM_CONFIG.webhookUrl) {
    try {
      fetch(window.KTA_FORM_CONFIG.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(function(err) {
        console.warn('Form Webhook Notice:', err);
      });
    } catch(e) {
      console.warn('Fetch error:', e);
    }
  }

  // 2. Alert confirmation to the user
  alert(successMsg);
};

/* ── Universal Footer Newsletter / Chef Dispatches Handler ── */
window.handleFooterSubscribe = function(event) {
  if (event && event.preventDefault) event.preventDefault();
  var form = event ? (event.target || event.currentTarget) : null;
  if (!form) return;
  var input = form.querySelector('.ef-subscribe-input');
  var btn = form.querySelector('.ef-subscribe-btn');
  var email = input ? input.value.trim() : '';

  if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    alert('Please enter a valid chef or commercial business email address.');
    return;
  }

  // 1. Store in localStorage CRM cache
  try {
    var list = JSON.parse(localStorage.getItem('kta_chef_dispatches_subscribers') || '[]');
    list.push({ email: email, date: new Date().toISOString() });
    localStorage.setItem('kta_chef_dispatches_subscribers', JSON.stringify(list));
  } catch(err){}

  // 2. Dispatch to live Google Sheets Master CRM Webhook & Zoho Mail
  if (typeof window.submitKTAForm === 'function') {
    window.submitKTAForm({
      email: email,
      inquiryType: 'Chef Dispatches Newsletter Subscription',
      source: 'Footer Chef Dispatch Bar',
      formName: 'Chef Dispatches Newsletter',
      message: 'Enrolled in seasonal harvest dispatches and priority chef sample allocations.'
    }, {
      formName: 'Chef Dispatches Newsletter',
      successMsg: 'Thank you, Chef! You are now enrolled in KTA Highland Dispatches & Seasonal Harvest Pre-Allocations.'
    });
  } else {
    alert('Thank you, Chef! You are now enrolled in KTA Highland Dispatches & Seasonal Harvest Pre-Allocations.');
  }

  // 3. Animated UI feedback
  if (input) input.value = '';
  if (btn) {
    var oldText = btn.textContent;
    btn.textContent = '✓ ENROLLED';
    btn.style.color = '#a3c27e';
    setTimeout(function() {
      btn.textContent = oldText;
      btn.style.color = '';
    }, 4000);
  }

  // 4. Offer instant Chef Welcome Discovery Box request if available
  setTimeout(function() {
    if (typeof window.openChefDiscoveryModal === 'function') {
      var wantKit = confirm('Chef, would you also like to request a Complimentary Chef Welcome Discovery Box (51 Varieties Roster · 42 Spices + 9 Dry Fruits) delivered to your kitchen pass?');
      if (wantKit) {
        window.openChefDiscoveryModal();
        var modalEmailInput = document.getElementById('cdmEmail');
        if (modalEmailInput) modalEmailInput.value = email;
      }
    }
  }, 600);
};

/* ══════════════════════════════════════════════════════════════
   KTA COMMERCIAL AI CONCIERGE ENGINE (OFFLINE KNOWLEDGE BASE & NLP)
   100% Client-Side Pure AI Trade Concierge & Technical Desk
   ═══════════════════════════════════════════════════════════ */
(function initKTAAIConcierge() {

  // ── 1. EXHAUSTIVE OFFLINE KNOWLEDGE BASE (KB) ──
  var KTA_KB = {
    meta: {
      company: 'Kottayar Trading Agency (KTA Spices)',
      lineage: '30-Year Direct Estate Lineage & Highland Sourcing',
      origin: 'Highland Specific (5,000 Ft Elevation: Wayanad, Idukki, Munnar, Salem, Guntur)',
      warehouse: 'No. 13/28, Mylai Periyathambi Street, George Town, Mannadi, Chennai, Tamil Nadu – 600001',
      hotline: '+91 85928 32871',
      whatsapp: 'https://wa.me/918592832871',
      wholesaleWhatsapp: 'https://wa.me/916379351632',
      email: 'orders@ktaspices.in / wholesale@ktaspices.in',
      hours: 'Monday – Sunday: 24 Hours (24/7)',
      certifications: 'FSSAI Central Commercial License, Spices Board of India Registered Merchant, Zero Lead Chromate Certified, Zero Sudan Dye Certified, ISO/HACCP Compliant Testing',
      moq: '500kg total net volume across single or mixed SKUs (40kg food-grade master bags); Single 40kg bag for registered Hotel Smart partners; Zero MOQ (Free 1kg Trial Pack) for Executive Chefs.',
      credit: '15-Day and 30-Day Revolving Credit Facilities available for verified 5-Star Hotel Chains, Corporate Commissaries, and Banquet Flight Kitchens.',
      hotelSmart: '2–24h Emergency Replenishment across Chennai, Bangalore, Hyderabad, Kochi, Coimbatore, Madurai with Zero Delivery Surcharges.'
    },

    products: [
      {
        id: 'black-pepper-tgseb',
        name: 'Tellicherry Black Pepper (TGSEB Grade)',
        aliases: ['black pepper', 'pepper', 'tgseb', 'tellicherry', 'kurumulaku', 'milagu', 'kali mirch', 'kalu menasu', 'miriyalu', 'whole pepper', 'bold pepper'],
        category: 'Spices',
        hsn: '09041140',
        rate: 680,
        grade: 'TGSEB (Tellicherry Garbled Special Extra Bold 4.75mm+)',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Rich Natural Volatile Essential Oils · Pristine Single-Origin Purity',
        packaging: '1kg Chef Barrier Pouch, 5kg Food-Grade Tin, 25kg Bulk Sack, 40kg Triple-Lined Master Bag',
        culinaryPairing: 'Steak passes, Chettinad gravies, pepper crab, demi-glace, biryani spice base, charcuterie cures.',
        harvestSeason: 'December – March',
        shelfLife: '24 Months in cool, airtight food-grade storage away from moisture.'
      },
      {
        id: 'black-pepper-powder',
        name: 'Pure Ground Black Pepper Powder',
        aliases: ['pepper powder', 'ground black pepper', 'crushed pepper', 'milagu thool', 'kurumulaku podi', 'kali mirch powder'],
        category: 'Powders',
        hsn: '09041219',
        rate: 700,
        grade: 'Coarse Cut & Fine Mesh Cold-Ground',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · 100% Pure Berries · Zero Starch Filler',
        packaging: '1kg Chef Pouches & 25kg/40kg Food-Grade Sacks',
        culinaryPairing: 'Salad dressings, sauté passes, soup finishing, tabletop shakers.',
        harvestSeason: 'December – March',
        shelfLife: '18 Months'
      },
      {
        id: 'white-pepper',
        name: 'Export Grade White Pepper (Whole & Ground)',
        aliases: ['white pepper', 'white pepper powder', 'safed mirch', 'vella kurumulaku', 'vellai milagu', 'tella miriyalu'],
        category: 'Spices',
        hsn: '09041219',
        rate: 820,
        grade: 'Fully Decorticated Water-Steeped Berries',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Pure Decorticated Berries · Zero Bleach',
        packaging: '1kg Chef Pouches & 25kg/40kg Master Bags',
        culinaryPairing: 'Creamy béchamel, white sauces, seafood veloutés, clear Asian broths without black flecks.',
        harvestSeason: 'January – April',
        shelfLife: '24 Months'
      },
      {
        id: 'green-cardamom-8mm',
        name: 'Alleppey 8mm+ Extra Bold Green Cardamom',
        aliases: ['cardamom', 'green cardamom', 'elaichi', 'elakkai', 'elathari', 'yelakki', 'yelakulu', '8mm cardamom', 'alleppey cardamom'],
        category: 'Spices',
        hsn: '09083140',
        rate: 2450,
        grade: 'Alleppey 8mm+ Extra Bold Diameter Hand-Sieved',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Rich Natural Essential Oils · Zero Synthetic Dyes',
        packaging: '1kg Aroma Vacuum Tins & 25kg/40kg Bulk Master Bags',
        culinaryPairing: 'Dum biryani, Awadhi korma, payasam, luxury desserts, masala chai passes, baked pastries.',
        harvestSeason: 'August – November (1st & 2nd Flush Arrivals)',
        shelfLife: '24 Months (Retains fragrance under vacuum seal)'
      },
      {
        id: 'black-cardamom',
        name: 'Himalayan Smoky Black Cardamom (Badi Elaichi)',
        aliases: ['black cardamom', 'badi elaichi', 'perelakkai', 'dodda elakki', 'nalla yelakulu'],
        category: 'Spices',
        hsn: '09083190',
        rate: 1350,
        grade: 'Large Intact Wood-Cured Pods',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Natural Smoky Wood-Cured Pods',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Mughlai biryanis, rogan josh, nihari, garam masala bases.',
        harvestSeason: 'September – December',
        shelfLife: '24 Months'
      },
      {
        id: 'salem-turmeric',
        name: 'Salem Golden Turmeric Powder',
        aliases: ['turmeric', 'turmeric powder', 'haldi', 'manjal', 'pasupu', 'arisina', 'salem turmeric'],
        category: 'Powders',
        hsn: '09103030',
        rate: 280,
        grade: 'Native Salem Rhizome Cold-Ground',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Deep Natural Pigment · Zero Lead Chromate · Zero Sudan Dyes · Zero Starch Filler',
        packaging: '1kg Chef Pouches & 40kg Triple-Lined Master Bags',
        culinaryPairing: 'South Indian sambar, rasam, golden milk, marinades, curries, nutraceutical blends.',
        harvestSeason: 'December – March',
        shelfLife: '24 Months'
      },
      {
        id: 'green-ginger-fresh',
        name: 'Green Ginger (Fresh Farm-Direct Jumbo Rhizomes)',
        aliases: ['green ginger', 'fresh ginger', 'raw ginger', 'pacha inji', 'adrak fresh', 'allam', 'fresh rhizome'],
        category: 'Spices',
        hsn: '09101110',
        rate: 140,
        grade: 'Jumbo Plump Fresh Rhizomes (Washed & Soil-Free)',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Crisp Fibrous Juice-Rich Farm Purity',
        packaging: '40kg/50kg Master Ventilated Mesh Bags & Export Crates (500kg+ MOQ)',
        culinaryPairing: 'Ginger garlic paste bases, fresh culinary crushes, Asian broths, beverage extraction.',
        harvestSeason: 'Year Round (Fresh Farm Harvesting)',
        shelfLife: '30–45 Days in ventilated cold storage'
      },
      {
        id: 'cochin-dry-ginger',
        name: 'Cochin Sun-Cured Dry Ginger (Sonth / Chukku)',
        aliases: ['ginger', 'dry ginger', 'sonth', 'chukku', 'sukku', 'adrak', 'shunti', 'sonti', 'ginger powder'],
        category: 'Spices',
        hsn: '09101110',
        rate: 340,
        grade: 'Sun-Dried Natural Whole Rhizomes / Micro-Milled Sonth',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Sun-Cured Natural Rhizomes · Zero Bleach',
        packaging: '1kg Pouches & 40kg Master Bags',
        culinaryPairing: 'Masala chai, gingerbread, sukku malli coffee, digestive tonics, marinades, curries.',
        harvestSeason: 'January – April',
        shelfLife: '24 Months'
      },
      {
        id: 'kashmiri-chilli',
        name: 'Kashmiri Scarlet Whole Chilli (Deep Natural Red)',
        aliases: ['kashmiri chilli', 'kashmiri chilly', 'kashmiri mirch', 'whole kashmiri chilly', 'mild chilli', 'piriyan mulaku'],
        category: 'Spices',
        hsn: '09042219',
        rate: 320,
        grade: 'Vibrant Deep Crimson Color Grade (Mild Balanced Heat)',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Rich Natural Capsanthin · Zero Added Colors · Zero Sudan Red',
        packaging: '1kg Kitchen Pouches & 25kg/40kg Master Sacks',
        culinaryPairing: 'Butter chicken, tandoori marinades, Kashmiri rogan josh, restaurant gravy color passes.',
        harvestSeason: 'October – February',
        shelfLife: '18 Months'
      },
      {
        id: 'kashmiri-chilli-powder',
        name: 'Cold-Milled Kashmiri Chilli Powder',
        aliases: ['kashmiri chilli powder', 'kashmiri powder', 'kashmiri chilly powder', 'kashmiri mirch powder', 'degi mirch powder', 'red chilli powder'],
        category: 'Spices',
        hsn: '09042211',
        rate: 340,
        grade: 'High ASTA Natural Crimson Ground Grade',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · High Natural ASTA Color · Zero Artificial Colors / Zero Sudan Red',
        packaging: '1kg Kitchen Pouches & 25kg/40kg Master Sacks',
        culinaryPairing: 'Butter chicken, gravies, tandoori marinades, biryani color, rich red curries.',
        harvestSeason: 'October – February',
        shelfLife: '18 Months'
      },
      {
        id: 'guntur-chilli',
        name: 'Guntur S17 / S4 Stemless Hot Red Chilli',
        aliases: ['guntur chilli', 'guntur chilly', 'teja chilli', 'hot chilli', 'spicy chilli', 'guntur mirchi'],
        category: 'Spices',
        hsn: '09042219',
        rate: 290,
        grade: 'Guntur S17 Stemless High-Pungency Whole & Powder',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · High Pungency Capsaicin Heat',
        packaging: '1kg Pouches & 25kg/40kg Sacks',
        culinaryPairing: 'Andhra curries, Chettinad spicy curries, hot sauces, pickling.',
        harvestSeason: 'January – May',
        shelfLife: '18 Months'
      },
      {
        id: 'zanzibar-cloves',
        name: 'Zanzibar Grade A Handpicked Whole Cloves',
        aliases: ['clove', 'cloves', 'laung', 'kirambu', 'lavangam', 'lavanga', 'karambu'],
        category: 'Whole Aromatics',
        hsn: '09071010',
        rate: 980,
        grade: 'Grade A Handpicked Full Head Intact Buds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Intact Full Head Buds · Zero Spent Clove Adulteration',
        packaging: '1kg Vacuum Pouches & 25kg Master Cartons',
        culinaryPairing: 'Biryani bouquet garni, mulled beverages, dental formulations, meat braises, garam masala.',
        harvestSeason: 'September – January',
        shelfLife: '24 Months'
      },
      {
        id: 'ceylon-cinnamon',
        name: 'True Ceylon Cinnamon C5 Special Quills',
        aliases: ['cinnamon', 'true cinnamon', 'ceylon cinnamon', 'pattai', 'dalchini', 'lavangapatta', 'dalchina'],
        category: 'Whole Aromatics',
        hsn: '09061110',
        rate: 1150,
        grade: 'C5 Special Delicate Multi-Layered Soft Quills',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Pure C5 Delicate Quills · Natural Sweet Floral Bark',
        packaging: '1kg Master Packs & 25kg Bundles',
        culinaryPairing: 'Bakery, French desserts, biryani aromatics, fine culinary reductions, health teas.',
        harvestSeason: 'May – August & October – December',
        shelfLife: '24 Months'
      },
      {
        id: 'cassia-bark',
        name: 'Cassia Bark (Kesia Selected)',
        aliases: ['cassia', 'kesia', 'thick cinnamon', 'chinese cinnamon'],
        category: 'Whole Aromatics',
        hsn: '09061190',
        rate: 420,
        grade: 'Thick Selected Bark High Essential Oil',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Strong Warm Bark Thickness',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Commercial curry powders, street food gravies, braising liquids.',
        harvestSeason: 'Year Round',
        shelfLife: '24 Months'
      },
      {
        id: 'star-anise',
        name: 'Royal 8-Pointed Star Anise (Annachipoo)',
        aliases: ['star anise', 'annachipoo', 'thakkolam', 'chakra phool', 'biryani flower', 'star spice'],
        category: 'Whole Aromatics',
        hsn: '09096139',
        rate: 890,
        grade: 'Intact 8-Pointed Star Pods with Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Intact 8-Pointed Pods · Deep Licorice Aroma',
        packaging: '1kg Pouches & 25kg Cartons',
        culinaryPairing: 'Biryani tempering, Chinese five-spice, Vietnamese pho, spiced desserts, mulled cider.',
        harvestSeason: 'August – November',
        shelfLife: '24 Months'
      },
      {
        id: 'jeera-cumin',
        name: 'Select Whole Jeera (Cumin Seeds & Powder)',
        aliases: ['jeera', 'cumin', 'cumin seeds', 'seeragam', 'jilakara', 'jeerige', 'jeera powder'],
        category: 'Spices',
        hsn: '09093119',
        rate: 360,
        grade: 'Machine-Cleaned Bold Cumin Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Machine-Cleaned Bold Cumin · Zero Earth/Sand Impurity',
        packaging: '1kg Pouches & 25kg/40kg Master Bags',
        culinaryPairing: 'Tadka, dal fry, jeera rice, curry masala powders, roasted cumin buttermilk.',
        harvestSeason: 'February – May',
        shelfLife: '24 Months'
      },
      {
        id: 'shahi-jeera',
        name: 'Royal Shahi Jeera (Valyajeerakam / Black Cumin)',
        aliases: ['shahi jeera', 'valyajeerakam', 'black cumin', 'kala jeera', 'royal cumin'],
        category: 'Spices',
        hsn: '09093119',
        rate: 680,
        grade: 'Slender Dark Aromatic Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Slender Aromatic Seeds · Deep Pine Undertones',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Royal Awadhi biryanis, Mughlai korma, kebabs, rice pilafs.',
        harvestSeason: 'June – September',
        shelfLife: '24 Months'
      },
      {
        id: 'coriander',
        name: 'Eagle-Grade Whole Coriander Seeds & Cold-Milled Powder',
        aliases: ['coriander', 'coriander seeds', 'coriander powder', 'dhania', 'malli', 'kothamalli', 'dhaniyalu'],
        category: 'Spices',
        hsn: '09092110',
        rate: 210,
        grade: 'Eagle Quality Greenish-Golden Seed Cleaned',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Cleaned Golden Seed · Citrus Floral Notes',
        packaging: '1kg Pouches & 25kg/40kg Master Sacks',
        culinaryPairing: 'Curry bases, sambar powder, garam masala, rasam, marinades.',
        harvestSeason: 'February – May',
        shelfLife: '18 Months'
      },
      {
        id: 'fennel-sombu',
        name: 'Bold Green Fennel Seeds (Sombu / Saunf)',
        aliases: ['fennel', 'sombu', 'saunf', 'perunjeerakam', 'pedda jilakara', 'sompu'],
        category: 'Spices',
        hsn: '09093100',
        rate: 290,
        grade: 'Bold Sweet Green Handpicked Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Bold Sweet Green Handpicked · Natural Green Color',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Chettinad curries, biryani spice mix, after-meal mukhwas, bakery.',
        harvestSeason: 'March – June',
        shelfLife: '24 Months'
      },
      {
        id: 'nutmeg-mace',
        name: 'Estate Whole Nutmeg (Jaifal) & Golden Mace Blades (Javantri)',
        aliases: ['nutmeg', 'jaifal', 'jathikka', 'mace', 'javantri', 'jathipathri', 'jayfal'],
        category: 'Whole Aromatics',
        hsn: '09081200',
        rate: 1250,
        grade: 'Whole Kernel Nutmeg & Golden Amber Intact Mace Blades',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Whole Nutmeg Kernels & Golden Amber Mace Blades',
        packaging: '1kg Pouches & 10kg/25kg Cartons',
        culinaryPairing: 'Mughlai korma, biryani bouquet, cream soups, puddings, garam masala.',
        harvestSeason: 'June – September',
        shelfLife: '24 Months'
      },
      {
        id: 'stone-flower-kalpasi',
        name: 'Highland Stone Flower (Kalpasi / Dagad Phool)',
        aliases: ['kalpasi', 'stone flower', 'dagad phool', 'patthar ke phool', 'marapasi', 'kallupachi'],
        category: 'Spices',
        hsn: '12149000',
        rate: 540,
        grade: 'Forest Handpicked Dried Lichen Flora',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Forest Handpicked Dried Lichen · Deep Umami Aroma',
        packaging: '1kg Pouches & 25kg Bags',
        culinaryPairing: 'Chettinad mutton curry, Hyderabadi biryani, Maharashtrian goda masala.',
        harvestSeason: 'Year Round',
        shelfLife: '24 Months'
      },
      {
        id: 'kasuri-methi',
        name: 'Nagauri Sun-Dried Kasuri Methi (Fenugreek Leaves)',
        aliases: ['kasuri methi', 'kasoori methi', 'methi leaves', 'vendhaya keerai', 'dried fenugreek'],
        category: 'Spices',
        hsn: '09109990',
        rate: 310,
        grade: 'Nagauri Green Leaf Selection (Stemless Cleaned)',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Green Nagauri Leaf Selection · Maple-Celery Fragrance',
        packaging: '1kg Moisture Barrier Bags & 10kg Cartons',
        culinaryPairing: 'Butter chicken, paneer makhani, dal tadka, parathas.',
        harvestSeason: 'December – March',
        shelfLife: '18 Months'
      },
      {
        id: 'california-badam',
        name: 'Select California Raw Badam (Almonds 18/20 Count)',
        aliases: ['badam', 'almond', 'almonds', 'california badam', 'badam pappu'],
        category: 'Dry Fruits & Nuts',
        hsn: '08021100',
        rate: 780,
        grade: '18/20 Large Uniform Whole Kernels',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · 18/20 Large Crisp Whole Kernels · Natural Sweet Crunch',
        packaging: '1kg Standup Kitchen Pouches & 10kg/25kg Vacuum Cartons',
        culinaryPairing: 'Badam halwa, kheer, confectionery, slivered garnishing for biryanis.',
        harvestSeason: 'August – November',
        shelfLife: '12 Months'
      },
      {
        id: 'cashewnut-w320',
        name: 'First Quality W320 Jumbo White Cashewnuts',
        aliases: ['cashew', 'cashewnut', 'kaju', 'w320', 'munthiri', 'jeedipappu', 'godambi'],
        category: 'Dry Fruits & Nuts',
        hsn: '08013100',
        rate: 740,
        grade: 'W320 First Quality Whole White (320 count/lb)',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Ivory White Kernels · Zero Speck · Buttery Texture',
        packaging: '1kg Kitchen Barrier Pouches & 10kg Vacuum Master Tins',
        culinaryPairing: 'Shahi gravies, kaju katli, biryani fried garnish, cashew paste passes.',
        harvestSeason: 'March – June',
        shelfLife: '12 Months'
      },
      {
        id: 'pista-pistachios',
        name: 'Select Roasted & Salted Pistachios (Pista)',
        aliases: ['pista', 'pistachio', 'pistachios', 'roasted pista'],
        category: 'Dry Fruits & Nuts',
        hsn: '08025100',
        rate: 1150,
        grade: 'Jumbo Open Shell Vibrant Green Kernel',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Jumbo Open Shell Green Kernels · Crisp Light Roast',
        packaging: '1kg Pouches & 10kg Vacuum Cartons',
        culinaryPairing: 'Dessert garnishing, ice creams, baklava, confectionery.',
        harvestSeason: 'September – December',
        shelfLife: '12 Months'
      },
      {
        id: 'walnut-halves',
        name: 'Premium California Walnut Halves (Akhrot)',
        aliases: ['walnut', 'akhrot', 'akroth', 'walnuts'],
        category: 'Dry Fruits & Nuts',
        hsn: '08023200',
        rate: 890,
        grade: 'Light Extra-Amber Intact Halves',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Extra-Amber Intact Halves · Zero Rancidity',
        packaging: '1kg Nitrogen-Flushed Pouches & 10kg Cartons',
        culinaryPairing: 'Bakery, salads, breakfast buffets, brownies.',
        harvestSeason: 'October – January',
        shelfLife: '12 Months'
      },
      {
        id: 'kismiss-raisins',
        name: 'Plump Select Sun-Dried Green Grapes & Golden Raisins (Kismiss)',
        aliases: ['kismiss', 'raisins', 'kishmish', 'drakshi', 'dry grapes', 'ulardraksha', 'black kismiss', 'special kismiss', 'green raisins'],
        category: 'Dry Fruits & Nuts',
        hsn: '08062010',
        rate: 340,
        grade: 'Plump Select Sun-Dried Green Grapes & Golden Seedless',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Plump Sun-Dried Naturally Sweet · Moisture Controlled',
        packaging: '1kg Standup Pouches & 15kg Master Cartons',
        culinaryPairing: 'Pulao, biryani, payasam, sweet masalas, baked goods.',
        harvestSeason: 'February – May',
        shelfLife: '12 Months'
      },
      {
        id: 'royal-garam-masala',
        name: 'Royal Garam Masala (Master Chef Whole-Ground Blend)',
        aliases: ['garam masala', 'royal garam masala', 'garam podi', 'karam masala', 'master blend'],
        category: 'Spices',
        hsn: '09109100',
        rate: 580,
        grade: 'Small-Batch Whole-Ground Master Chef Selection',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Master Chef Selection · 100% Pure Spices · Zero Starches',
        packaging: '1kg Multi-Wall Chef Pouches & 40kg Master Food-Grade Bags (500kg+ MOQ)',
        culinaryPairing: 'Rich north Indian curries, Mughlai gravies, tandoori marinades, master sauces.',
        harvestSeason: 'Year Round',
        shelfLife: '12 Months'
      },
      {
        id: 'royal-biryani-masala',
        name: 'Royal Biryani Masala (Executive Dum Infusion Blend)',
        aliases: ['biryani masala', 'royal biryani masala', 'biriyani masala', 'dum masala', 'shahi biryani masala'],
        category: 'Spices',
        hsn: '09109100',
        rate: 640,
        grade: 'Executive Slow-Dum Whole-Ground Masala',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Executive Slow-Dum Infusion · Deep Penetrating Aroma',
        packaging: '1kg Multi-Wall Chef Pouches & 40kg Master Food-Grade Bags (500kg+ MOQ)',
        culinaryPairing: 'Hyderabadi dum biryani, Thalassery biryani, Awadhi yakhni pulao, mutton korma.',
        harvestSeason: 'Year Round',
        shelfLife: '12 Months'
      },
      {
        id: 'black-dry-lemon',
        name: 'Black Dry Lemon / Loomi (Sun-Cured Dried Lime)',
        aliases: ['dry lemon', 'black lemon', 'loomi', 'dried lime', 'unakka naranga', 'sukha nimbu', 'black loomi'],
        category: 'Spices',
        hsn: '08055000',
        rate: 450,
        grade: 'Sun-Cured Black Loomi Lime Whole',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Sun-Cured Black Loomi Lime Whole · Concentrated Citrus Fragrance',
        packaging: '1kg Chef Pouches & 25kg/40kg Master Consignments (500kg+ MOQ)',
        culinaryPairing: 'Middle Eastern mandi, kabsa, seafood soups, tagines, Persian stews, specialty broths.',
        harvestSeason: 'Year Round',
        shelfLife: '24 Months'
      },
      {
        id: 'saffron-kesar',
        name: 'Pure Super Mongra Kashmiri Saffron (Kesar)',
        aliases: ['saffron', 'kesar', 'zafran', 'kungumapoo', 'kumkumappuvu'],
        category: 'Spices',
        hsn: '09102010',
        rate: 260000,
        grade: 'Super Mongra Grade A1 Deep Crimson Stigmas',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Super Mongra A1 Deep Crimson Stigmas · Zero Yellow Style Adulteration',
        packaging: '5g, 10g, 50g & 100g Sealed Glass Tins',
        culinaryPairing: 'Royal Dum Biryani, saffron milk, rasmalai, wedding feasts, paan masala.',
        harvestSeason: 'October – November',
        shelfLife: '36 Months'
      },
      {
        id: 'groundnut-seeds',
        name: 'Groundnut Seeds (Raw Selected Grade Peanut)',
        aliases: ['groundnut', 'peanut', 'peanuts', 'groundnuts', 'raw peanut', 'raw peanuts', 'nilakkadala', 'kadalakkay', 'moongphali', 'singdana', 'peanut seeds', 'verukadalai'],
        category: 'Dry Fruits & Nuts',
        hsn: '12024190',
        rate: 180,
        grade: 'Selected Bold Raw Peanut Kernels',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Selected Raw Peanut · High Natural Oil Grade',
        packaging: '1kg Pouches & 25kg/40kg Master Sacks (500kg+ MOQ)',
        culinaryPairing: 'Chutneys, peanut masala, South Indian tempering, bakery, confectionery.',
        harvestSeason: 'October – January',
        shelfLife: '12 Months'
      },
      {
        id: 'roasted-peanut',
        name: 'Dry Roasted Peanuts (Golden Crunch Groundnut)',
        aliases: ['roasted peanut', 'roasted peanuts', 'roasted groundnut', 'varutha kadala', 'roasted singdana', 'crunchy peanuts'],
        category: 'Dry Fruits & Nuts',
        hsn: '20081111',
        rate: 220,
        grade: 'Uniformly Dry Roasted & Husked',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Golden Roast · Crisp Texture · Zero Additives',
        packaging: '1kg Pouches & 25kg Master Bags',
        culinaryPairing: 'Salad toppings, bar snacks, peanut sauces, poha, Asian noodle dishes.',
        harvestSeason: 'Year Round',
        shelfLife: '9 Months'
      },
      {
        id: 'white-ellu-sesame',
        name: 'Triple-Cleaned White Sesame Seeds (White Ellu / Til)',
        aliases: ['sesame', 'sesame seeds', 'white sesame', 'white ellu', 'til', 'safed til', 'gingelly seeds', 'nuvvulu', 'ellu'],
        category: 'Seeds & Botanicals',
        hsn: '12074090',
        rate: 260,
        grade: 'Machine-Cleaned Triple Sortex Hulled White Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Triple-Cleaned White Sesame · Rich Natural Sesame Oil',
        packaging: '1kg Pouches & 25kg/40kg Sacks',
        culinaryPairing: 'Tempering, idli podi, tahini, burger buns, bakery, Asian marinades.',
        harvestSeason: 'December – March',
        shelfLife: '18 Months'
      },
      {
        id: 'sabja-seeds',
        name: 'Sweet Basil Seeds (Sabja Seeds / Falooda Seeds)',
        aliases: ['sabja', 'sabja seeds', 'basil seeds', 'sweet basil seeds', 'falooda seeds', 'tukmaria', 'hazba'],
        category: 'Seeds & Botanicals',
        hsn: '12119094',
        rate: 380,
        grade: 'High-Expansion Whole Sweet Basil Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Rapid Bloom Gel Formation · Cooling Herb Purity',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Falooda, summer beverages, milkshakes, Ayurvedic cooling tonics.',
        harvestSeason: 'March – June',
        shelfLife: '24 Months'
      },
      {
        id: 'chia-seeds',
        name: 'Premium Whole Chia Seeds',
        aliases: ['chia', 'chia seeds', 'black chia seeds', 'salvia hispanica'],
        category: 'Seeds & Botanicals',
        hsn: '12149000',
        rate: 420,
        grade: 'Triple-Cleaned Pure Chia Seed Kernels',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · High Soluble Fiber & Omega Fatty Acids',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Puddings, breakfast smoothies, health juices, bakery bread crusts.',
        harvestSeason: 'November – February',
        shelfLife: '24 Months'
      },
      {
        id: 'pumpkin-seeds',
        name: 'Raw Hulled Pumpkin Seeds (Pepitas / Kaddu Beej)',
        aliases: ['pumpkin seeds', 'pumpkin seed', 'pepitas', 'kaddu beej', 'raw pumpkin seeds', 'hulled pumpkin seeds'],
        category: 'Seeds & Botanicals',
        hsn: '12099990',
        rate: 490,
        grade: 'Grade A Hulled Vibrant Green Pepitas',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Crisp Raw Pepitas · Fresh Harvest Nutty Note',
        packaging: '1kg Standup Pouches & 25kg Cartons',
        culinaryPairing: 'Salad toppings, artisanal bakery, health snack bars, gourmet pestos.',
        harvestSeason: 'September – December',
        shelfLife: '12 Months'
      },
      {
        id: 'sunflower-seeds',
        name: 'Raw Hulled Sunflower Seeds (Surajmukhi Beej)',
        aliases: ['sunflower seeds', 'sunflower seed', 'hulled sunflower', 'surajmukhi beej'],
        category: 'Seeds & Botanicals',
        hsn: '12060090',
        rate: 290,
        grade: 'Large Uniform Hulled Kernels',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Tender Raw Kernels · Delicate Nutty Purity',
        packaging: '1kg Pouches & 25kg Master Bags',
        culinaryPairing: 'Granola, whole grain breads, trail mixes, confectionery.',
        harvestSeason: 'March – June',
        shelfLife: '12 Months'
      },
      {
        id: 'watermelon-seeds',
        name: 'Dried Watermelon Seeds (Tarbooj Magaz Kernels)',
        aliases: ['watermelon seeds', 'magaz', 'magaj', 'tarbooj ke beej', 'watermelon kernel', 'char magaz'],
        category: 'Seeds & Botanicals',
        hsn: '12099990',
        rate: 460,
        grade: 'Cleaned Ivory Magaz Kernels',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Mild Creamy Magaz · Rich Gravy Base Emulsifier',
        packaging: '1kg Standup Pouches & 25kg Bags',
        culinaryPairing: 'Mughlai shahi gravies, korma paste, sweets, thandai formulations.',
        harvestSeason: 'May – July',
        shelfLife: '12 Months'
      },
      {
        id: 'dry-rose-petals',
        name: 'Culinary Grade Dried Damascena Rose Petals (Gulab Patti)',
        aliases: ['rose petals', 'dry rose petals', 'dried rose petals', 'gulab patti', 'paneer rose', 'rose flowers'],
        category: 'Seeds & Botanicals',
        hsn: '12119094',
        rate: 580,
        grade: 'Handpicked Sun-Dried Deep Pink Petals',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Fragrant Damascena · Zero Artificial Aromas or Sprays',
        packaging: '1kg Moisture-Proof Pouches & 10kg Cartons',
        culinaryPairing: 'Biryani garnishing, royal sweets, falooda, paan masala, herbal teas.',
        harvestSeason: 'November – February',
        shelfLife: '18 Months'
      },
      {
        id: 'biryani-leaf-bay',
        name: 'Selected Whole Bay Leaf (Biryani Leaf / Tejpatta)',
        aliases: ['biryani leaf', 'bay leaf', 'tejpatta', 'biriyani aaku', 'karuvapatta ila', 'bay leaves'],
        category: 'Spices',
        hsn: '09104010',
        rate: 240,
        grade: 'Whole Intact Green-Olive Dried Leaves',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Whole Intact Dried Leaves · Warm Herbal Camphorous Aroma',
        packaging: '1kg Pouches & 25kg Master Bags',
        culinaryPairing: 'Dum biryani, pulao, stews, soup broths, marinades.',
        harvestSeason: 'October – March',
        shelfLife: '24 Months'
      },
      {
        id: 'methi-seeds',
        name: 'Whole Fenugreek Seeds (Methi Dana / Vendhayam)',
        aliases: ['methi seeds', 'methi', 'fenugreek', 'fenugreek seeds', 'vendhayam', 'menthulu', 'uluva'],
        category: 'Spices',
        hsn: '090931',
        rate: 190,
        grade: 'Cleaned Machine-Sorted Fenugreek Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Clean Bittersweet · Pure Roasted Aroma',
        packaging: '1kg Pouches & 25kg/40kg Sacks',
        culinaryPairing: 'Sambar, pickle masalas, fish curry, dosa batter fermentation, tadka.',
        harvestSeason: 'February – May',
        shelfLife: '24 Months'
      },
      {
        id: 'mustard-seeds',
        name: 'Black Mustard Seeds (Kadugu / Rai / Sarson)',
        aliases: ['mustard', 'mustard seeds', 'black mustard', 'kadugu', 'rai', 'sarson', 'aavalu', 'kaduku'],
        category: 'Spices',
        hsn: '12075010',
        rate: 170,
        grade: 'Machine-Cleaned Small Black Mustard Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Sharp Sinigrin Pungency · Crisp Tempering Pop',
        packaging: '1kg Pouches & 25kg/40kg Master Bags',
        culinaryPairing: 'South Indian tempering (tadka), rasam, sambar, coconut chutneys, pickling.',
        harvestSeason: 'March – June',
        shelfLife: '24 Months'
      },
      {
        id: 'nigella-seeds',
        name: 'Whole Kalonji / Nigella Seeds (Black Seed / Karunjeerakam)',
        aliases: ['nigella', 'kalonji', 'black seed', 'black onion seed', 'karunjeerakam', 'nallajeelakarra', 'mangrail'],
        category: 'Spices',
        hsn: '12099930',
        rate: 380,
        grade: 'Selected Machine-Cleaned Jet Black Seeds',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Oregano-Onion Toast · Rich Thymoquinone Profile',
        packaging: '1kg Pouches & 25kg Sacks',
        culinaryPairing: 'Naan bread topping, pickles, Bengali panch phoron, savory biscuits.',
        harvestSeason: 'April – July',
        shelfLife: '24 Months'
      },
      {
        id: 'white-cardamom',
        name: 'Selected White Cardamom Pods',
        aliases: ['white cardamom', 'safed elaichi', 'vella elakkai'],
        category: 'Spices',
        hsn: '09083140',
        rate: 2300,
        grade: 'Selected Sun-Mellowed Cardamom Pods',
        origin: 'Highland Specific',
        chemicalAssay: 'Sourced & graded by KTA alone · Mellow Floral Mint · Delicate Camphor',
        packaging: '1kg Aroma Tins & 25kg Bags',
        culinaryPairing: 'White gravies, clear desserts, royal desserts, confectionery.',
        harvestSeason: 'August – November',
        shelfLife: '24 Months'
      }
    ],

    wholesaleExtraction: [
      {
        name: 'Green Ginger (Raw Fresh Farm-Direct Jumbo Rhizomes)',
        hsn: '09101110',
        moq: '500kg (40kg Master Mesh Bags / Crates)',
        desc: 'Sourced and graded by KTA alone. Jumbo washed plump fresh farm ginger rhizomes. High juice density and crisp texture for commercial kitchens, paste processors, and export packing.'
      },
      {
        name: 'Lite Berries (Black Pepper Extraction Grade)',
        hsn: '09041140',
        moq: '500kg (40kg Master Bags)',
        desc: 'Sourced and graded by KTA alone. Low-density green and light whole pepper berries separated during gravity grading. Highly sought after by oleoresin solvent extraction units for volatile oil yield at commercial rates.'
      },
      {
        name: 'Pinheads (High Extraction Density Small Pepper Berries)',
        hsn: '09041110',
        moq: '500kg (40kg Master Bags)',
        desc: 'Sourced and graded by KTA alone. Small immature bold whole peppercorns possessing high concentration of active resin per gram. Prime commodity for pharmaceutical, nutraceutical, and oleoresin extraction.'
      },
      {
        name: 'Pepper Husk & Pepper Husk Selected (S)',
        hsn: '09109939 / 09041110',
        moq: '500kg (40kg Master Bags)',
        desc: 'Sourced and graded by KTA alone. Cleaned outer black pepper pericarp/husk. Ideal for industrial seasoning manufacturers, spice rubs, and resin extractors. Husk (S) is sieved for uniform fine particle mesh.'
      },
      {
        name: 'Dry Ginger Slices (Unbleached Sun-Dried)',
        hsn: '09101110',
        moq: '500kg (40kg Master Bags)',
        desc: 'Sourced and graded by KTA alone. Cleaned, sliced, and unbleached sun-cured ginger rhizomes optimized for extraction units and commercial distillers.'
      },
      {
        name: 'Spent Dry Ginger & All Spices Spent Biomass',
        hsn: 'Industrial Biomass / Agro Byproduct',
        moq: '500kg to Multi-Ton Tonnage',
        desc: 'Moisture-controlled post-extraction spent residues from pepper, ginger, turmeric, and mixed botanicals after oleoresin and steam extraction. Supplied for industrial re-processing, cattle feed formulations, and biomass applications.'
      }
    ],

    services: {
      whatIsKTA: {
        title: 'What is KTA Spices?',
        details: 'KTA is a premier single-origin spice procurement and processing house with 25+ years of estate operations. We supply over 100+ luxury hotel chains, commercial commissaries, and institutional kitchens across South India with single-origin purity direct from estate auction floors.'
      },
      whyKTA: {
        title: 'Why KTA Spices?',
        details: 'Every spice consignment is sourced and graded by KTA alone. We provide 100% unadulterated single-origin purity, zero artificial dyes, zero starch adulteration, guaranteed 2–24h replenishment for partnered kitchens under Hotel Smart, and direct transparent estate rates.'
      },
      hotelSmart: {
        title: 'Hotel Smart 24/7 Zero-Downtime Replenishment',
        details: 'Guaranteed 2–24h priority emergency dispatch across Chennai, Bangalore, Hyderabad, Kochi, Coimbatore, and Madurai for partnered hotel kitchens. Automated scheduled restocking directly to your receiving dock.'
      },
      chefBox: {
        title: 'Chef Discovery Samples (Sourced & Graded by KTA Alone)',
        details: 'Executive Chefs and Hotel Purchase Directors can request discovery sample packs to evaluate aroma and potency directly in their kitchen pass. Sample dispatch will be arranged according to your kitchen location before setting up commercial 2–24h replenishment.'
      },
      wholesaleMoq: {
        title: 'Wholesale Consignment Structure (500kg+ MOQ)',
        details: 'Wholesale minimum consignment is 500kg total net weight (combinable across single or multiple varieties). Packed in 40kg heavy-duty master bags. Direct Wholesale WhatsApp desk: +91 63793 51632.'
      },
      outsideCatalogue: {
        title: 'Custom Sourcing & Products Outside Standard Catalogue',
        details: 'Need specialty spice varieties, green ginger farm consignments, custom particle grinding (fine powder, coarse cracked, crushed, whole garbled), extraction byproducts (pinheads, lite berries, husk, spent biomass), or custom pack formats outside our catalogue? Our trade desk arranges custom commercial sourcing.'
      }
    }
  };

  var SYNONYMS = {
    'pepper': ['kurumulaku', 'milagu', 'kali mirch', 'kalu menasu', 'miriyalu', 'tgseb', 'black pepper', 'white pepper'],
    'cardamom': ['elaichi', 'elakkai', 'elathari', 'yelakki', 'yelakulu', '8mm', 'green cardamom', 'badi elaichi', 'white cardamom'],
    'turmeric': ['haldi', 'manjal', 'pasupu', 'arisina', 'salem turmeric'],
    'ginger': ['green ginger', 'fresh ginger', 'raw ginger', 'sonth', 'chukku', 'sukku', 'adrak', 'shunti', 'sonti', 'dry ginger'],
    'clove': ['laung', 'kirambu', 'lavangam', 'lavanga', 'karambu', 'zanzibar'],
    'cinnamon': ['dalchini', 'pattai', 'lavangapatta', 'dalchina', 'ceylon', 'kesia', 'cassia'],
    'cumin': ['jeera', 'seeragam', 'jilakara', 'jeerige', 'shahi jeera', 'valyajeerakam'],
    'coriander': ['dhania', 'malli', 'kothamalli', 'dhaniyalu'],
    'fennel': ['saunf', 'sombu', 'perunjeerakam', 'pedda jilakara', 'sompu'],
    'peanut': ['groundnut', 'groundnuts', 'peanut', 'peanuts', 'moongphali', 'singdana', 'nilakkadala', 'kadala', 'roasted peanut'],
    'badam': ['almond', 'almonds', 'badam pappu'],
    'cashew': ['kaju', 'cashewnut', 'w320', 'munthiri', 'jeedipappu', 'godambi'],
    'pista': ['pistachio', 'pistachios', 'roasted pista'],
    'walnut': ['akhrot', 'akroth', 'walnuts'],
    'raisins': ['kismiss', 'kishmish', 'drakshi', 'dry grapes'],
    'sesame': ['ellu', 'white ellu', 'til', 'safed til', 'sesame seeds', 'gingelly'],
    'sabja': ['sabja seeds', 'sweet basil seeds', 'falooda seeds', 'tukmaria'],
    'chia': ['chia seeds', 'black chia'],
    'pumpkin': ['pumpkin seeds', 'pepitas', 'kaddu beej'],
    'sunflower': ['sunflower seeds', 'surajmukhi'],
    'watermelon': ['watermelon seeds', 'magaz', 'magaj', 'tarbooj'],
    'rose': ['rose petals', 'dry rose petals', 'gulab patti'],
    'mustard': ['mustard seeds', 'kadugu', 'rai', 'sarson', 'aavalu'],
    'methi': ['methi seeds', 'vendhayam', 'menthulu', 'fenugreek seeds', 'kasuri methi'],
    'kalonji': ['nigella', 'black seed', 'karunjeerakam'],
    'biryani leaf': ['bay leaf', 'tejpatta', 'biriyani aaku'],
    'saffron': ['kesar', 'zafran', 'kungumapoo', 'kumkumappuvu'],
    'sample': ['welcome box', 'chef box', 'trial pack', 'discovery kit', 'discovery tray', 'sample', 'discovery sample', 'test batch'],
    'hotel smart': ['hotelsmart', '24/7', 'emergency delivery', 'emergency restock', 'zero downtime', 'standing order', 'replenishment'],
    'moq': ['minimum order', 'minimum quantity', 'minimum volume', 'order size', 'bulk quantity', '500kg', 'wholesale'],
    'contact': ['broker', 'call', 'phone', 'whatsapp', 'address', 'warehouse', 'location', 'mannadi', 'chennai address', 'hotline', 'desk', 'trade desk']
  };

  var TTS_ENABLED = false;

  window.handleKTAActionNav = function(e, href) {
    if (!href || href.startsWith('tel:') || href.startsWith('mailto:') || href.indexOf('wa.me') !== -1) {
      return;
    }
    var hashIdx = href.indexOf('#');
    if (hashIdx !== -1) {
      var pathPart = href.substring(0, hashIdx);
      var hashPart = href.substring(hashIdx + 1);
      var curPath = window.location.pathname;
      var isCurrentPage = !pathPart || curPath.endsWith(pathPart) || (pathPart === 'index.html' && (curPath === '/' || curPath.endsWith('/')));
      if (isCurrentPage) {
        var el = document.getElementById(hashPart);
        if (el) {
          if (e && e.preventDefault) e.preventDefault();
          var b = document.getElementById('ktaAiBox');
          if (b) b.classList.remove('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
  };

  function renderAIWidget() {
    if (document.getElementById('ktaAiWidget')) return;

    var widget = document.createElement('div');
    widget.id = 'ktaAiWidget';
    widget.className = 'kta-ai-widget';
    widget.innerHTML = [
      '<div class="kta-ai-box" id="ktaAiBox" role="dialog" aria-label="KTA AI Concierge" data-lenis-prevent>',
      '  <div class="kta-ai-header">',
      '    <div class="kta-ai-header-left">',
      '      <div class="kta-ai-avatar">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>',
      '          <rect x="3" y="8" width="18" height="12" rx="4"/>',
      '          <circle cx="8.5" cy="14" r="1.5" fill="currentColor"/>',
      '          <circle cx="15.5" cy="14" r="1.5" fill="currentColor"/>',
      '        </svg>',
      '      </div>',
      '      <div>',
      '        <div class="kta-ai-header-title">KTA AI Concierge</div>',
      '        <div class="kta-ai-header-subtitle">NLP Trade Intelligence · Origin KB (24/7)</div>',
      '      </div>',
      '    </div>',
      '    <div class="kta-ai-header-actions">',
      '      <button type="button" class="kta-ai-hdr-btn" id="ktaAiTtsBtn" title="Toggle Voice Audio Speaker" aria-label="Toggle Voice Audio">',
      '        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
      '      </button>',
      '      <button type="button" class="kta-ai-hdr-btn" id="ktaAiResetBtn" title="Reset Conversation" aria-label="Reset Conversation">',
      '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>',
      '      </button>',
      '      <button type="button" class="kta-ai-hdr-btn" id="ktaAiClose" title="Close Concierge" aria-label="Close Assistant">',
      '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      '      </button>',
      '    </div>',
      '  </div>',
      '  <div class="kta-ai-chips" id="ktaAiChips">',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Custom Sourcing outside standard catalogue\')">Custom Sourcing</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'What all products do you have in catalogue?\')">All Products (51 Varieties)</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Wholesale 40kg Bags (500kg+ MOQ)\')">Wholesale (40kg Bags)</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Hotel Smart 24/7 Replenishment\')">Hotel Smart 24/7</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Green Ginger (Fresh Farm-Direct)\')">Green Ginger (Fresh)</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Chef Welcome Box (Free)\')">Chef Welcome Box</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'What is KTA Spices?\')">What is KTA?</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Why choose KTA Spices?\')">Why KTA?</button>',
      '    <button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'Contact Trade Desk & Hours\')">Contact Desk (24/7)</button>',
      '  </div>',
      '  <div class="kta-ai-messages" id="ktaAiMessages" data-lenis-prevent>',
      '    <div class="kta-msg bot">',
      '      <div class="kta-bubble">',
      '        <strong>Welcome to KTA Commercial Concierge.</strong><br>',
      '        <span style="font-size:11px;color:#7a8a72;display:block;margin-top:2px;margin-bottom:8px">Deterministic NLP Trade Engine · Direct Origin Knowledge Base</span>',
      '        How may I assist your kitchen or procurement desk?<br>',
      '        • <strong>Custom Sourcing</strong> (Rare botanicals, custom mesh & unlisted items)<br>',
      '        • <strong>All Products</strong> (51 single-origin spices, dry fruits & seeds)<br>',
      '        • <strong>Wholesale Supply</strong> (500kg+ MOQ in 40kg master bags)<br>',
      '        • <strong>Hotel Smart 24/7</strong> (2–24h replenishment across South India)<br>',
      '        • <strong>Green Ginger (Fresh)</strong> (Raw farm-direct jumbo rhizomes)<br>',
      '        • <strong>What is KTA?</strong> (25+ years estate heritage & origin purity)<br><br>',
      '        <em>Tap any suggested topic above or type your specific commercial requirement.</em>',
      '      </div>',
      '    </div>',
      '    <div class="kta-typing" id="ktaAiTyping">',
      '      <div class="kta-typing-dot"></div>',
      '      <div class="kta-typing-dot"></div>',
      '      <div class="kta-typing-dot"></div>',
      '      </div>',
      '  </div>',
      '  <form class="kta-ai-input-wrap" id="ktaAiForm" onsubmit="handleKTAAISubmit(event)">',
      '    <button type="button" class="kta-ai-mic-btn" id="ktaAiMicBtn" title="Voice Input" aria-label="Voice Input">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
      '        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>',
      '        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>',
      '        <line x1="12" y1="19" x2="12" y2="23"/>',
      '        <line x1="8" y1="23" x2="16" y2="23"/>',
      '      </svg>',
      '    </button>',
      '    <input type="text" id="ktaAiInput" class="kta-ai-input" placeholder="Ask What is KTA, Wholesale 40kg Bags, Peanuts, Saffron..." autocomplete="off">',
      '    <button type="submit" class="kta-ai-send-btn" aria-label="Send Message">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
      '        <line x1="22" y1="2" x2="11" y2="13"></line>',
      '        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
      '      </svg>',
      '    </button>',
      '  </form>',
      '</div>',
      '<div class="kta-ai-trigger" id="ktaAiTrigger" aria-label="Open KTA Trade Concierge" title="KTA Trade Concierge">',
      '  <div class="kta-ai-trigger-icon">',
      '    <div class="kta-ai-trigger-dots">',
      '      <span class="kta-ai-trigger-dot"></span>',
      '      <span class="kta-ai-trigger-dot"></span>',
      '      <span class="kta-ai-trigger-dot"></span>',
      '    </div>',
      '  </div>',
      '  <span class="kta-ai-trigger-pulse"></span>',
      '</div>'
    ].join('');
    document.body.appendChild(widget);

    var triggerBtn = document.getElementById('ktaAiTrigger');
    var box = document.getElementById('ktaAiBox');
    var closeBtn = document.getElementById('ktaAiClose');
    var resetBtn = document.getElementById('ktaAiResetBtn');
    var ttsBtn = document.getElementById('ktaAiTtsBtn');
    var micBtn = document.getElementById('ktaAiMicBtn');
    var input = document.getElementById('ktaAiInput');
    var msgsContainer = document.getElementById('ktaAiMessages');

    if (msgsContainer) {
      msgsContainer.addEventListener('wheel', function(e) {
        e.stopPropagation();
      }, { passive: true });
    }

    function toggleChat(openState) {
      if (!box) return;
      var shouldOpen = typeof openState === 'boolean' ? openState : !box.classList.contains('active');
      if (shouldOpen) {
        box.classList.add('active');
        setTimeout(function() {
          if (input) input.focus();
          var msgs = document.getElementById('ktaAiMessages');
          if (msgs) msgs.scrollTop = msgs.scrollHeight;
        }, 100);
      } else {
        box.classList.remove('active');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
    }

    if (triggerBtn) {
      triggerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleChat();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleChat(false);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        var msgs = document.getElementById('ktaAiMessages');
        if (msgs) {
          msgs.innerHTML = [
            '<div class="kta-msg bot">',
            '  <div class="kta-bubble">',
            '    <strong>Conversation Reset.</strong><br>',
            '    <span style="font-size:11px;color:#7a8a72;display:block;margin-top:2px;margin-bottom:8px">Deterministic NLP Trade Engine · Direct Origin Knowledge Base</span>',
            '    How may I assist your kitchen or procurement desk today?<br>',
            '    • <strong>All Products (50+ SKUs in catalogue)</strong><br>',
            '    • <strong>What is KTA & single-origin advantage?</strong><br>',
            '    • <strong>Wholesale Portfolio (40kg bags, 500kg+ MOQ)?</strong><br>',
            '    • <strong>Hotel Smart 24/7 replenishment (2–24h)?</strong><br>',
            '    • <strong>Green Ginger (Fresh farm rhizomes)?</strong><br>',
            '    • <strong>Custom Sourcing outside standard catalogue?</strong><br><br>',
            '    <em>Tap a chip or type your requirement below.</em>',
            '  </div>',
            '</div>',
            '<div class="kta-typing" id="ktaAiTyping">',
            '  <div class="kta-typing-dot"></div>',
            '  <div class="kta-typing-dot"></div>',
            '  <div class="kta-typing-dot"></div>',
            '</div>'
          ].join('');
        }
      });
    }

    if (ttsBtn) {
      ttsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        TTS_ENABLED = !TTS_ENABLED;
        ttsBtn.classList.toggle('active', TTS_ENABLED);
        if (TTS_ENABLED) {
          ttsBtn.setAttribute('title', 'Voice Audio Enabled');
          speakText('Voice audio output enabled.');
        } else {
          ttsBtn.setAttribute('title', 'Voice Audio Disabled');
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
      });
    }

    // Voice-to-Text Input via Web Speech API
    if (micBtn) {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        var recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        var isListening = false;
        recognition.onstart = function() {
          isListening = true;
          micBtn.classList.add('listening');
          if (input) input.placeholder = 'Listening... Speak your spice query';
        };

        recognition.onresult = function(event) {
          var transcript = event.results[0][0].transcript;
          if (input && transcript) {
            input.value = transcript;
            handleKTAAISubmit(new Event('submit'));
          }
        };

        recognition.onerror = function() {
          isListening = false;
          micBtn.classList.remove('listening');
          if (input) input.placeholder = 'Ask What is KTA, Wholesale 40kg Bags, Green Ginger...';
        };

        recognition.onend = function() {
          isListening = false;
          micBtn.classList.remove('listening');
          if (input) input.placeholder = 'Ask What is KTA, Wholesale 40kg Bags, Green Ginger...';
        };

        micBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (isListening) {
            recognition.stop();
          } else {
            try {
              recognition.start();
            } catch (err) {
              console.warn('Speech recognition error:', err);
            }
          }
        });
      } else {
        micBtn.style.opacity = '0.4';
        micBtn.setAttribute('title', 'Voice recognition not supported in this browser');
      }
    }

    // Close on click outside
    document.addEventListener('click', function(e) {
      if (box && box.classList.contains('active') && !widget.contains(e.target)) {
        toggleChat(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && box && box.classList.contains('active')) {
        toggleChat(false);
      }
    });

    window.openKTAAIConcierge = function(query) {
      toggleChat(true);
      if (query) {
        setTimeout(function() {
          handleKTAChip(query);
        }, 200);
      }
    };

    window.toggleKTAAIConcierge = toggleChat;
    window.generateOfflineAIReply = generateOfflineAIReply;
  }

  function speakText(text) {
    if (!TTS_ENABLED || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    var utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  window.handleKTAChip = function(query) {
    var input = document.getElementById('ktaAiInput');
    if (input) input.value = query;
    handleKTAAISubmit(new Event('submit'));
  };

  window.handleKTAAISubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    var input = document.getElementById('ktaAiInput');
    var text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';
    appendUserMsg(text);
    var typing = document.getElementById('ktaAiTyping');
    var msgs = document.getElementById('ktaAiMessages');
    if (typing) { typing.classList.add('active'); msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight; }
    setTimeout(function() {
      if (typing) typing.classList.remove('active');
      var reply = generateOfflineAIReply(text);
      appendBotMsg(reply.html, reply.actions, reply.followUps);
      speakText(reply.html);
    }, 320);
  };

  function appendUserMsg(text) {
    var msgs = document.getElementById('ktaAiMessages');
    var div = document.createElement('div');
    div.className = 'kta-msg user';
    div.innerHTML = '<div class="kta-bubble">' + escapeHtml(text) + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function appendBotMsg(html, actions, followUps) {
    var msgs = document.getElementById('ktaAiMessages');
    var div = document.createElement('div');
    div.className = 'kta-msg bot';
    var actHtml = '';
    if (actions && actions.length > 0) {
      actHtml = '<div class="kta-msg-actions">' + actions.map(function(a) {
        var cls = 'kta-msg-btn' + (a.primary ? ' primary' : '') + (a.whatsapp ? ' whatsapp' : '');
        var href = a.href || '#';
        var isWaOrPhone = href.startsWith('tel:') || href.startsWith('mailto:') || href.indexOf('wa.me') !== -1;
        var clickAttr = isWaOrPhone ? '' : ' onclick="handleKTAActionNav(event, this.getAttribute(\'href\'))"';
        return '<a href="' + href + '" class="' + cls + '"' + (a.target ? ' target="' + a.target + '" rel="noopener"' : '') + clickAttr + '>' + a.label + '</a>';
      }).join('') + '</div>';
    }
    div.innerHTML = '<div class="kta-bubble">' + html + actHtml + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    if (followUps && followUps.length > 0) {
      var chipsContainer = document.getElementById('ktaAiChips');
      if (chipsContainer) chipsContainer.innerHTML = followUps.map(function(f) { return '<button type="button" class="kta-ai-chip" onclick="handleKTAChip(\'' + escapeHtml(f) + '\')">' + escapeHtml(f) + '</button>'; }).join('');
    }
  }

  // ── WORD BOUNDARY PHRASE MATCHER ──
  function matchPhrase(text, phrase) {
    if (!text || !phrase) return false;
    var escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(?:^|\\s)' + escaped + '(?:\\s|$)', 'i');
    return regex.test(text);
  }

  // ── SESSION MEMORY CACHE ──
  var KTA_AI_SESSION_STATE = {
    lastProduct: null,
    lastCategory: null,
    lastIntent: null,
    history: []
  };

  function generateOfflineAIReply(q) {
    var raw = q || '';
    var norm = raw.toLowerCase().replace(/['".,\/#!$%\^&\*;:{}=\-_`~()?\\]/g, ' ').replace(/\s+/g, ' ').trim();

    // ── 0. MULTILINGUAL & PHONETIC NORMALIZER ──
    var multiLangDict = {
      // Malayalam
      'കുരുമുളക്': 'black pepper', 'ഏലക്ക': 'cardamom', 'ഏലക്കായ്': 'cardamom', 'മഞ്ഞൾ': 'turmeric',
      'ഇഞ്ചി': 'ginger', 'പച്ച ഇഞ്ചി': 'green ginger', 'ജീരകം': 'jeera', 'കറുവപ്പട്ട': 'cinnamon',
      'ഗ്രാമ്പൂ': 'cloves', 'പെരുംജീരകം': 'fennel', 'ജാതിക്ക': 'nutmeg', 'ജാതിപത്രി': 'mace',
      'കശുവണ്ടി': 'cashew', 'ഉണക്കമുന്തിരി': 'kismiss', 'അണ്ടിപ്പരിപ്പ്': 'cashew',
      'വില': 'price', 'റേറ്റ്': 'rate', 'സാമ്പിൾ': 'sample', 'ഹോൾസെയിൽ': 'wholesale',

      // Tamil
      'மிளகு': 'black pepper', 'ஏலக்காய்': 'cardamom', 'மஞ்சள்': 'turmeric', 'இஞ்சி': 'ginger',
      'பச்சை இஞ்சி': 'green ginger', 'சீரகம்': 'jeera', 'பட்டை': 'cinnamon', 'கிராம்பு': 'cloves',
      'சோம்பு': 'fennel', 'ஜாதிக்காய்': 'nutmeg', 'சாதிபத்திரி': 'mace', 'முந்திரி': 'cashew',
      'திராட்சை': 'kismiss', 'விலை': 'price', 'சாம்பிள்': 'sample', 'ஆர்டர்': 'order',

      // Hindi
      'काली मिर्च': 'black pepper', 'इलायची': 'cardamom', 'हल्दी': 'turmeric', 'अदरक': 'ginger',
      'ताजा अदरक': 'green ginger', 'जीरा': 'jeera', 'दालचीनी': 'cinnamon', 'लौंग': 'cloves',
      'सौंफ': 'fennel', 'जायफल': 'nutmeg', 'जावित्री': 'mace', 'काजू': 'cashew',
      'किशमिश': 'kismiss', 'बादाम': 'almonds', 'पिस्ता': 'pista', 'अखरोट': 'walnut',
      'भाव': 'price', 'दाम': 'price', 'रेट': 'rate', 'सैंपल': 'sample',

      // Telugu
      'మిరియాలు': 'black pepper', 'యాలకులు': 'cardamom', 'పసుపు': 'turmeric', 'అల్లం': 'ginger',
      'జీలకర్ర': 'jeera', 'లవంగాలు': 'cloves', 'దాల్చినచెక్క': 'cinnamon', 'జీడిపప్పు': 'cashew',
      'ధర': 'price',

      // Kannada
      'ಕರಿಮೆಣಸು': 'black pepper', 'ಏಲಕ್ಕಿ': 'cardamom', 'ಅರಿಶಿನ': 'turmeric', 'ಶುಂಠಿ': 'ginger',
      'ಜೀರಿಗೆ': 'jeera', 'ಲವಂಗ': 'cloves', 'ಗೋಡಂಬಿ': 'cashew', 'ಬೆಲೆ': 'price'
    };

    for (var key in multiLangDict) {
      if (raw.indexOf(key) !== -1 || norm.indexOf(key.toLowerCase()) !== -1) {
        norm += ' ' + multiLangDict[key];
      }
    }

    // ── CONTEXT MEMORY: PRONOUN RESOLUTION (it / this / that / of this) ──
    var isContextualFollowUp = /(^|\s)(this|it|that|this\s*item|this\s*spice|same\s*item|of\s*this|for\s*this)(\s|$)/i.test(norm);
    var activeProduct = KTA_AI_SESSION_STATE.lastProduct;

    // Follow-up: Rate/Price of current cached product
    if (isContextualFollowUp && activeProduct && /(price|rate|cost|how\s*much|quote|bhav|vilai|pricing)/i.test(norm)) {
      var waMsg = encodeURIComponent('Hello KTA Trade Desk, please share today\'s commercial lot pricing and volume discount tier for ' + activeProduct.name + ' (HSN ' + activeProduct.hsn + ').');
      return {
        html: '<strong>Commercial Rates for ' + escapeHtml(activeProduct.name) + ':</strong><br><br>' +
              '• <strong>HSN Code:</strong> ' + activeProduct.hsn + '<br>' +
              '• <strong>Commercial Grade:</strong> ' + activeProduct.grade + '<br>' +
              '• <strong>Origin:</strong> ' + activeProduct.origin + '<br>' +
              '• <strong>Packaging Units:</strong> ' + activeProduct.packaging + '<br>' +
              '• <strong>Pricing Policy:</strong> Direct estate auction rates pegged to daily arrivals ex-warehouse without middleman markups.<br><br>' +
              '<em>Connect with our Trade Desk for today\'s locked lot quotation:</em>',
        actions: [
          { label: 'Get Spot Quote on WhatsApp', href: 'https://wa.me/918592832871?text=' + waMsg, primary: true, target: '_blank', whatsapp: true },
          { label: 'Generate Wholesale Pro-Forma', href: 'wholesale.html#proforma' },
          { label: 'Explore Catalogue', href: 'catalogue.html' }
        ],
        followUps: ['Request 1kg Sample of this', 'Wholesale Rate (40kg Bags)', 'Quality & Lab Assay', 'All Products (51 Varieties)']
      };
    }

    // Follow-up: Sample of current cached product
    if (isContextualFollowUp && activeProduct && /(sample|tray|welcome\s*box|trial|test|1kg)/i.test(norm)) {
      var waSampleMsg = encodeURIComponent('Hello KTA Trade Desk, I am an Executive Chef requesting a 1kg discovery sample of ' + activeProduct.name + ' for kitchen evaluation.');
      return {
        html: '<strong>Discovery Sample for ' + escapeHtml(activeProduct.name) + ':</strong><br><br>' +
              'Executive Chefs and Hotel Purchase Heads can evaluate our <strong>' + escapeHtml(activeProduct.name) + '</strong> directly in their kitchen pass.<br><br>' +
              '• <strong>Sample Pack Size:</strong> 1kg Chef Barrier Pouch.<br>' +
              '• <strong>Quality Guarantee:</strong> Sourced & graded by KTA alone with complete sensory and assay specifications.<br>' +
              '• <strong>Dispatch SLA:</strong> Dispatched directly according to your kitchen location.<br><br>' +
              '<em>Would you like to dispatch this sample to your receiving dock?</em>',
        actions: [
          { label: 'Request ' + escapeHtml(activeProduct.name.split(' ')[0]) + ' Sample', href: 'https://wa.me/918592832871?text=' + waSampleMsg, primary: true, target: '_blank', whatsapp: true },
          { label: 'Request Free Chef Welcome Box', href: 'partnership.html#registerKitchen' },
          { label: 'Add to Sample Tray', href: 'catalogue.html' }
        ],
        followUps: ['Wholesale Rate (40kg Bags)', 'All Products (51 Varieties)', 'Hotel Smart 24/7', 'What is KTA?']
      };
    }

    // ── 1. CUSTOM SOURCING & COMMODITIES OUTSIDE CATALOGUE (TOP PRIORITY) ──
    var unlistedKeywords = [
      'vanilla', 'vanilla pods', 'vanilla beans', 'ajwain', 'omam', 'asafoetida', 'hing', 'perungayam',
      'tamarind', 'puli', 'garlic', 'onion powder', 'chilli flakes', 'chili flakes',
      'paprika', 'white pepper whole', 'green pepper in brine', 'nutmeg oil',
      'clove oil', 'cardamom oil', 'pepper oil', 'oleoresin', 'curry leaf', 'curry leaves', 'kariveppila',
      'dry mango', 'amchur', 'kasuri methi bulk', 'star anise oil', 'cinnamon oil',
      'turmeric fingers', 'mesh 60', 'mesh 80', 'mesh 100', 'custom mesh', 'custom grind', 'custom powder',
      'organic spices', 'export packaging', 'drum pack', 'fibc', 'jumbo bag'
    ];

    var isCustomQuery = /(outside\s*catalogue|outside\s*catalog|out\s*(?:of|if)\s*catalogue|out\s*(?:of|if)\s*catalog|not\s*in\s*catalogue|not\s*in\s*catalog|not\s*listed|unlisted|other\s*than\s*catalogue|apart\s*from\s*catalogue|custom\s*sourcing|custom\s*requirement|custom\s*product|custom\s*spice|custom\s*grade|custom\s*lot|rare\s*spice|specialty\s*spice|custom\s*grind|custom\s*mesh|export\s*packing|commodity\s*outsourcing|something\s*(?:not\s*in|outside|out\s*(?:of|if))\s*(?:the\s*)?catalog|if\s*i\s*need\s*something\s*out)/i.test(norm);
    
    var detectedItem = '';
    for (var u = 0; u < unlistedKeywords.length; u++) {
      if (matchPhrase(norm, unlistedKeywords[u])) {
        detectedItem = unlistedKeywords[u];
        isCustomQuery = true;
        break;
      }
    }

    var needMatch = norm.match(/(?:i\s*need|looking\s*for|do\s*you\s*(?:have|sell|supply)|can\s*you\s*source|want\s*to\s*buy|require)\s+([a-z0-9\s]{2,30})/i);
    if (needMatch && !isCustomQuery) {
      var cand = needMatch[1].trim();
      var foundInCat = false;
      for (var k = 0; k < KTA_KB.products.length; k++) {
        for (var al = 0; al < KTA_KB.products[k].aliases.length; al++) {
          if (matchPhrase(cand, KTA_KB.products[k].aliases[al])) {
            foundInCat = true;
            break;
          }
        }
        if (foundInCat) break;
      }
      if (!foundInCat && cand.length > 2 && !/(price|rate|sample|wholesale|delivery|catalogue|contact)/i.test(cand)) {
        detectedItem = cand;
        isCustomQuery = true;
      }
    }

    if (isCustomQuery) {
      KTA_AI_SESSION_STATE.lastIntent = 'CUSTOM_SOURCING';
      var itemLabel = detectedItem ? detectedItem.charAt(0).toUpperCase() + detectedItem.slice(1) : 'Specialty Commodities';
      var waCustomMsg = encodeURIComponent('Hello KTA Trade Desk, I would like to request custom sourcing for ' + (detectedItem ? '"' + itemLabel + '"' : 'commodities outside your standard catalogue') + ' for our commercial facility.');

      return {
        html: '<strong>Custom Sourcing Desk · Products &amp; Grades Outside Catalogue:</strong><br><br>' +
              (detectedItem ? 'Looking to procure <strong>' + escapeHtml(itemLabel) + '</strong> or custom commodities not listed in our standard 51-variety roster?<br><br>' : 'Need specialty spices, rare botanicals, or customized grades outside our standard 51-variety catalogue?<br><br>') +
              'KTA leverages <strong>25+ years of direct grower networks</strong> across South India to source, clean, grade, and supply any agricultural or botanical commodity on demand.<br><br>' +
              '<strong>4-Step Commercial Custom Sourcing Protocol:</strong><br>' +
              '• <strong>1. Specification Briefing:</strong> Share your required commodity (e.g., Vanilla beans, Ajwain, Hing, Tamarind, fresh rhizomes, oleoresins), desired particle mesh (whole garbled, crushed, 60–100 mesh cold-ground), and target volume (500kg+ MOQ or multi-ton contracts).<br>' +
              '• <strong>2. Direct Origin Procurement:</strong> Sourced directly from verified growers and auction floors across Wayanad, Idukki, Salem, and Guntur — <em>sourced and graded by KTA alone</em>.<br>' +
              '• <strong>3. Pre-Dispatch COA &amp; Sample Approval:</strong> We provide full chemical assay certificates (moisture, volatile oil, ASTA color, zero synthetic dyes) and dispatch physical evaluation samples to your kitchen pass.<br>' +
              '• <strong>4. Palletized Logistics &amp; Fast Dispatch:</strong> Custom packaging (40kg triple-lined master bags, food-grade drums, or FIBC bulk sacks) with guaranteed turnaround.<br><br>' +
              '<em>Tap below for direct 1-tap WhatsApp consultation with our Custom Sourcing Desk:</em>',
        actions: [
          { label: 'Request Custom Sourcing (WhatsApp)', href: 'https://wa.me/916379351632?text=' + waCustomMsg, primary: true, target: '_blank', whatsapp: true },
          { label: 'Submit Custom Sourcing Brief', href: 'wholesale.html#orderForm' },
          { label: 'Call Commercial Desk (+91 85928 32871)', href: 'tel:+918592832871' }
        ],
        followUps: ['All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7', 'Green Ginger (Fresh)']
      };
    }

    // ── 2. WHAT IS KTA? ──
    if (/(what\s*is\s*kta|who\s*is\s*kta|about\s*kta|tell\s*me\s*about\s*kta|overview|who\s*are\s*you|company\s*profile|background|heritage)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'ABOUT';
      return {
        html: '<strong>What is KTA Spices?</strong><br><br>' +
              'KTA is a premier single-origin spice procurement and processing house with <strong>25+ years of estate heritage</strong>. ' +
              'We supply over <strong>100+ elite kitchens</strong>, 5-star hotel chains, banquet operators, and commercial food enterprises across South India.<br><br>' +
              '• <strong>Direct Single-Origin Procurement:</strong> Procured directly from verified growers and auction floors across Highland Specific terroirs.<br>' +
              '• <strong>Institutional Reliability:</strong> Consistent culinary grading, rapid replenishment, and transparent commercial contracts.<br>' +
              '• <strong>Zero Middlemen:</strong> Unadulterated purity directly from origin to commercial kitchen pass.<br><br>' +
              '<em>Would you like to explore our full commercial catalogue or discuss wholesale supply?</em>',
        actions: [
          { label: 'Explore Catalogue (51 Varieties)', href: 'catalogue.html#spices', primary: true },
          { label: 'Wholesale Portal', href: 'wholesale.html' },
          { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871', target: '_blank', whatsapp: true }
        ],
        followUps: ['All Products (51 Varieties)', 'Why choose KTA?', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7']
      };
    }

    // ── 3. WHY KTA? (SOURCED & GRADED BY KTA ALONE) ──
    if (/(why\s*kta|why.*(?:choose|prefer|partner|buy\s*from|work\s*with)\s*(?:kta|you)|advantage|differentiator|difference|usp|why\s*buy\s*from\s*kta)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'WHY_KTA';
      return {
        html: '<strong>Why Choose KTA Spices?</strong><br><br>' +
              '• <strong>Sourced &amp; Graded by KTA Alone:</strong> Every lot is procured directly from origin and graded by our specialists to guarantee 100% unadulterated single-origin purity.<br>' +
              '• <strong>Zero Adulteration:</strong> Zero synthetic dyes, zero lead chromate, zero artificial polish, zero papaya seeds, and zero exhausted spent waste.<br>' +
              '• <strong>Rapid Replenishment:</strong> Guaranteed 2–24 hour emergency delivery for partnered kitchens under Hotel Smart.<br>' +
              '• <strong>Direct Origin Pricing:</strong> Direct estate rates without intermediary trader markups.<br><br>' +
              '<em>Would you like to explore our catalogue or request a complimentary discovery box?</em>',
        actions: [
          { label: 'Request Welcome Box (Free)', href: 'partnership.html#registerKitchen', primary: true },
          { label: 'Wholesale Portal', href: 'wholesale.html' },
          { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871', target: '_blank', whatsapp: true }
        ],
        followUps: ['All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7', 'Green Ginger (Fresh)']
      };
    }

    // ── 4. ALL PRODUCTS / FULL CATALOGUE LIST INTENT ──
    if (/(what\s*all\s*products|list\s*all\s*products|all\s*products|show\s*all\s*products|what\s*products\s*(?:do\s*you\s*have|u\s*got|are\s*there|available)|full\s*catalogue|full\s*catalog|catalogue\s*items|product\s*list|what\s*do\s*you\s*have|what\s*do\s*you\s*sell|what\s*spices\s*do\s*you\s*have|show\s*catalogue|catalog\s*list)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'CATALOGUE';
      return {
        html: '<strong>KTA Full Commercial Catalogue (51 Varieties Roster: 42 Spices + 9 Dry Fruits):</strong><br><br>' +
              '<strong>1. Single-Origin Spices (42 Varieties Whole &amp; Powders):</strong><br>' +
              '• Tellicherry Black Pepper (TGSEB Whole &amp; Powder)<br>' +
              '• White Pepper (Decorticated Whole &amp; Powder)<br>' +
              '• Salem Golden Turmeric Powder<br>' +
              '• Kashmiri Chilly Whole &amp; Cold-Milled Kashmiri Chilli Powder<br>' +
              '• Guntur S4 Stemless Hot Red Chilly<br>' +
              '• Alleppey Green Cardamom (8mm+ Extra Bold), Black &amp; White Cardamom<br>' +
              '• Cochin Sun-Cured Dry Ginger (Whole &amp; Powder)<br>' +
              '• Coriander Seeds &amp; Cold-Milled Coriander Powder<br>' +
              '• Jeera Cumin Seeds &amp; Jeera Powder<br>' +
              '• Shahi Jeera (Valyajeerakam) &amp; 8-Pointed Star Anise (Annachipoo)<br>' +
              '• Zanzibar Cloves, Ceylon Cinnamon (Pattai), Cassia Bark (Kesia)<br>' +
              '• Bold Green Fennel (Sombu), Whole Nutmeg (Jaifal), Mace Blades (Javantri)<br>' +
              '• Bay Leaf (Biryani Leaf), Stone Flower (Kalpasi), Kasuri Methi<br>' +
              '• Fenugreek Seeds (Methi), Black Mustard Seeds, Kalonji (Nigella)<br>' +
              '• White Sesame (White Ellu), Sweet Basil Seeds (Sabja), Chia Seeds<br>' +
              '• Raw Pumpkin Seeds, Sunflower Seeds, Watermelon Seeds (Magaz)<br>' +
              '• Groundnut Seeds &amp; Roasted Crunchy Peanuts<br>' +
              '• Royal Garam Masala &amp; Royal Biryani Masala (Dum Master Blends)<br>' +
              '• Black Dry Lemon (Loomi), Damascena Rose Petals, Super Mongra Saffron<br><br>' +
              '<strong>2. Premium Dry Fruits &amp; Nuts (9 Varieties):</strong><br>' +
              '• Badam (Almonds 18/20 Count)<br>' +
              '• W320 Jumbo White Cashewnuts (Kaju)<br>' +
              '• Selected Whole Dates &amp; Royal Dried Figs (Anjeer)<br>' +
              '• Green Golden Raisins (Kismiss), Black Kismiss &amp; Long Special Kismiss<br>' +
              '• Roasted &amp; Salted Pistachios (Pista) &amp; California Walnuts (Akhrot)<br><br>' +
              '<strong>3. Wholesale Extraction Byproducts (40kg Master Bags):</strong><br>' +
              '• Green Ginger (Fresh Jumbo Rhizomes), Lite Berries, Pinheads, Pepper Husk, Spent Biomass.<br><br>' +
              '<em>Tap below to browse the interactive catalogue or build your sample tray:</em>',
        actions: [
          { label: 'Browse Full Catalogue (51 Varieties)', href: 'catalogue.html', primary: true },
          { label: 'Wholesale Range', href: 'wholesale.html' },
          { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871', target: '_blank', whatsapp: true }
        ],
        followUps: ['Wholesale (40kg Bags)', 'Chef Welcome Box (Free)', 'Custom Sourcing', 'Hotel Smart 24/7']
      };
    }

    // ── 5. WHAT IS WHOLESALE? (500kg+ MOQ, 40kg Master Bags) ──
    if (/(what\s*is\s*wholesale|wholesale|moq|minimum\s*order|bulk\s*order|commercial\s*order|bag\s*size|master\s*bag|packaging\s*unit|products\s*in\s*wholesale|wholesale\s*items|wholesale\s*range|wholesale\s*portfolio|tonnage|container)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'WHOLESALE';
      return {
        html: '<strong>Wholesale Consignment Structure (500kg+ MOQ in 40kg Master Bags):</strong><br><br>' +
              '• <strong>Wholesale Range:</strong><br>' +
              '  - <strong>Black Pepper:</strong> Whole Bold Export Grade (HSN 09041140)<br>' +
              '  - <strong>Lite Berries &amp; Pinheads:</strong> High-resin extraction grades<br>' +
              '  - <strong>Pepper Husk &amp; Pepper Husk (S):</strong> Sieved mesh &amp; seasoning cuts<br>' +
              '  - <strong>Green Ginger (Fresh):</strong> Raw farm-direct jumbo rhizomes (HSN 09101110)<br>' +
              '  - <strong>Dry Ginger:</strong> Unspent sun-dried whole / slices (HSN 09101110)<br>' +
              '  - <strong>Biomass Residues:</strong> Spent Dry Ginger &amp; All Spices Spent<br>' +
              '• <strong>Packaging Standard:</strong> 40kg heavy-duty food-grade multi-layer master bags on shrink-wrapped pallets.<br>' +
              '• <strong>Palletized Logistics:</strong> Rapid dispatch across South India.<br>' +
              '• <strong>Dedicated Wholesale Desk:</strong> Contact our wholesale team directly at <strong>+91 63793 51632</strong> for bulk container and tonnage quotes.<br><br>' +
              '<em>Would you like to generate a wholesale pro-forma invoice or inquire about custom sourcing?</em>',
        actions: [
          { label: 'Wholesale WhatsApp (+91 63793 51632)', href: 'https://wa.me/916379351632', primary: true, target: '_blank', whatsapp: true },
          { label: 'Generate Pro-Forma Invoice', href: 'wholesale.html#proforma' },
          { label: 'Custom Sourcing Desk', href: 'wholesale.html#orderForm' }
        ],
        followUps: ['Green Ginger (Fresh)', 'All Products (51 Varieties)', 'Why choose KTA?', 'Custom Sourcing']
      };
    }

    // ── 6. HOTEL SMART 24/7 ZERO-DOWNTIME REPLENISHMENT ──
    if (/(hotel\s*smart|24\/7|replenishment|emergency|zero\s*downtime|restock|hospitality\s*delivery|standing\s*order|hotel\s*supply)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'HOTEL_SMART';
      return {
        html: '<strong>Hotel Smart 24/7 Rapid Replenishment:</strong><br><br>' +
              'Designed specifically for executive chefs, luxury hotel chains, and high-volume banquet operations:<br><br>' +
              '• <strong>2–24 Hour Guaranteed Dispatch:</strong> Priority emergency and scheduled replenishment directly to your hotel receiving dock.<br>' +
              '• <strong>Zero Stock-out Assurance:</strong> Dedicated buffer stock reserved for contracted kitchens across all active delivery corridors.<br>' +
              '• <strong>Sourced &amp; Graded by KTA Alone:</strong> Uncompromising aroma strength, zero filler, and consistent batch performance.<br><br>' +
              '<em>Would you like to register your kitchen for Hotel Smart priority replenishment?</em>',
        actions: [
          { label: 'Register Your Kitchen', href: 'partnership.html#registerKitchen', primary: true },
          { label: 'Emergency WhatsApp Desk', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20inquiring%20about%20Hotel%20Smart%2024%2F7%20replenishment.', target: '_blank', whatsapp: true },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['All Products (51 Varieties)', 'Why choose KTA?', 'Wholesale (40kg Bags)', 'Chef Welcome Box (Free)']
      };
    }

    // ── 7. GREEN GINGER (RAW FRESH FARM-DIRECT) ──
    if (/(green\s*ginger|fresh\s*ginger|raw\s*ginger|farm\s*ginger|ginger\s*rhizome|fresh\s*rhizome|pacha\s*inji|allam\s*fresh|pachai\s*inji)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'GREEN_GINGER';
      return {
        html: '<strong>Green Ginger (Raw Fresh Farm-Direct Jumbo Rhizomes):</strong><br><br>' +
              '• <strong>Botanical Specimen:</strong> <em>Zingiber officinale Roscoe</em> (HSN: 09101110).<br>' +
              '• <strong>Commercial Grade:</strong> Jumbo plump fresh rhizomes, thoroughly washed, soil-free, and air-dried.<br>' +
              '• <strong>Terroir &amp; Purity:</strong> Highland Specific, sourced and graded by KTA alone with high natural juice content and crisp fibrous texture.<br>' +
              '• <strong>Packaging &amp; MOQ:</strong> 40kg food-grade master bags &amp; export crates (500kg+ MOQ to multi-ton consignments).<br>' +
              '• <strong>Palletized Logistics:</strong> Rapid dispatch across South India.<br><br>' +
              '<em>Available for immediate commercial dispatch and instant pro-forma quotation:</em>',
        actions: [
          { label: 'Wholesale WhatsApp (+91 63793 51632)', href: 'https://wa.me/916379351632?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20inquiring%20about%20bulk%20Green%20Ginger%20(Fresh%20Jumbo%20Rhizomes)%20procurement.', primary: true, target: '_blank', whatsapp: true },
          { label: 'Pro-Forma Calculator', href: 'wholesale.html#proforma' },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['Wholesale (40kg Bags)', 'Hotel Smart 24/7', 'Custom Sourcing']
      };
    }

    // ── 8. CHEF WELCOME BOX / DISCOVERY SAMPLES (FREE) ──
    if (/(sample|samples|discovery|welcome\s*box|welcome\s*kit|trial|test\s*kit|chef\s*box|sample\s*kit|free\s*box|free\s*sample|try\s*sample)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'CHEF_BOX';
      return {
        html: '<strong>Chef Welcome Box · FREE (Sourced &amp; Graded by KTA Alone):</strong><br><br>' +
              'We invite Executive Chefs, F&amp;B Directors, and Hotel Purchase Heads to evaluate our single-origin harvests directly in their kitchen pass.<br><br>' +
              '• <strong>Sourced &amp; Graded by KTA Alone:</strong> Pure Tellicherry black pepper, Alleppey cardamom, Salem turmeric, and whole aromatics.<br>' +
              '• <strong>Location-Based Sample Dispatch:</strong> Discovery sample dispatches are fulfilled according to destination location.<br>' +
              '• <strong>Commercial Partnership:</strong> Once partnered under Hotel Smart, emergency replenishments are guaranteed within <strong>2–24 hours</strong>.<br><br>' +
              '<em>Would you like to request a complimentary discovery box for your kitchen?</em>',
        actions: [
          { label: 'Request Welcome Box (Free)', href: 'partnership.html#registerKitchen', primary: true },
          { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20an%20Executive%20Chef%20requesting%20the%20Free%20Chef%20Welcome%20Box.', target: '_blank', whatsapp: true }
        ],
        followUps: ['All Products (51 Varieties)', 'Why choose KTA?', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7']
      };
    }

    // ── 9. PRIVATE LABELLING / WHITE LABELLING / BRAND PACKING ──
    if (/(private\s*label|white\s*label|custom\s*brand|my\s*brand|oem|custom\s*pouch|jar\s*packing|brand\s*packaging)/i.test(norm)) {
      return {
        html: '<strong>Private Labelling &amp; Contract Packaging Services:</strong><br><br>' +
              'KTA provides complete end-to-end white labelling and commercial packaging for culinary brands, supermarket chains, and restaurant groups:<br><br>' +
              '• <strong>Flexible Packaging Formats:</strong> Nitrogen-flushed barrier pouches, PET jars, metal tins, and 1kg/5kg chef foodservice packs.<br>' +
              '• <strong>Custom Granulation:</strong> Whole sieved, cracked cut, coarse kibbled, or ultra-fine 60–100 mesh powders.<br>' +
              '• <strong>Compliance Ready:</strong> Complete barcode integration, FSSAI repacker licensing documentation, and nutritional labeling.<br><br>' +
              '<em>Contact our private label desk for batch packaging minimums and lead times:</em>',
        actions: [
          { label: 'Private Label WhatsApp', href: 'https://wa.me/916379351632?text=Hello%20KTA%20Trade%20Desk%2C%20I%20am%20inquiring%20about%20Private%20Label%20and%20White%20Label%20packaging.', primary: true, target: '_blank', whatsapp: true },
          { label: 'Custom Sourcing Desk', href: 'wholesale.html#orderForm' },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'What is KTA?', 'Quality & Lab Assay']
      };
    }

    // ── 10. WAREHOUSE VISIT & PHYSICAL INSPECTION ──
    if (/(visit|warehouse\s*visit|see\s*stock|physical\s*visit|location\s*visit|come\s*to\s*office|inspect\s*stock|george\s*town|mannadi)/i.test(norm)) {
      return {
        html: '<strong>Registered Warehouse Visit &amp; Commercial Inspection:</strong><br><br>' +
              'Commercial buyers, chefs, and purchase directors are welcome to visit our central facility to inspect physical lots, grain sizes, and aroma strength:<br><br>' +
              '• <strong>Registered Facility:</strong> No. 13/28, Mylai Periyathambi Street, George Town, Mannadi, Chennai, Tamil Nadu – 600001<br>' +
              '• <strong>Operational Hours:</strong> <strong>24 Hours (Monday – Sunday)</strong><br>' +
              '• <strong>Protocol:</strong> Contact Trade Desk 1 hour prior to arrival for dedicated lot inspection coordination.<br><br>' +
              '<em>Would you like to schedule an inspection visit with our warehouse manager?</em>',
        actions: [
          { label: 'Schedule Visit on WhatsApp', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20would%20like%20to%20schedule%20a%20visit%20to%20your%20Chennai%20warehouse.', primary: true, target: '_blank', whatsapp: true },
          { label: 'Call Warehouse Manager', href: 'tel:+918592832871' },
          { label: 'Contact Page & Map', href: 'contact.html' }
        ],
        followUps: ['All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'What is KTA?', 'Hotel Smart 24/7']
      };
    }

    // ── 11. RETAIL VS WHOLESALE MOQ (100g vs 1kg / 40kg) ──
    if (/(100g|250g|small\s*pack|retail|retail\s*pack|consumer\s*pack|single\s*packet|personal\s*use)/i.test(norm)) {
      return {
        html: '<strong>KTA Packaging &amp; Minimum Supply Tiers:</strong><br><br>' +
              'KTA is a dedicated B2B commercial procurement house supplying elite kitchens, hotel chains, and wholesale processors:<br><br>' +
              '• <strong>Chef &amp; Kitchen Standard:</strong> <strong>1kg barrier pouches</strong> and 5kg foodservice tins (ideal for culinary pass and menu prep).<br>' +
              '• <strong>Wholesale Standard:</strong> <strong>40kg heavy-duty master bags</strong> (500kg+ MOQ for commercial lots).<br>' +
              '• <em>We do not supply consumer 50g/100g pouches directly</em>, but chefs can request our <strong>Free Chef Discovery Box</strong> to evaluate 1kg sample varieties.<br><br>' +
              '<em>Would you like to order 1kg chef packs or request a complimentary sample box?</em>',
        actions: [
          { label: 'Request Free Chef Welcome Box', href: 'partnership.html#registerKitchen', primary: true },
          { label: 'Browse 1kg Catalogue', href: 'catalogue.html' },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['Chef Welcome Box (Free)', 'All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'Why choose KTA?']
      };
    }

    // ── 12. COMMERCIAL PRICING & QUOTATION INTENT ──
    if (/(price|pricing|rate|rates|cost|quotation|quote|how\s*much|vilai|bhav|daam|kya\s*rate|estimate|per\s*kg)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'PRICING';
      return {
        html: '<strong>KTA Commercial Pricing &amp; Direct Wholesale Rates:</strong><br><br>' +
              'KTA provides direct estate auction pricing pegged to daily origin arrivals with zero intermediary mandi markups.<br><br>' +
              '• <strong>Commercial Lot Pricing:</strong> Competitive volume rates for 1kg chef pouches, 5kg tins, 25kg bulk bags, and 40kg master bags.<br>' +
              '• <strong>Volume Discount Tiers:</strong> Tiered discounts applied for consignments of 1 MT, 3 MT, and 5 MT+.<br>' +
              '• <strong>Billing &amp; Terms:</strong> Clean commercial B2B invoices with complete batch COA and traceable origin documentation.<br><br>' +
              '<em>For today\'s live market rates and instant spot quotation, please connect with our trade desk:</em>',
        actions: [
          { label: 'Get Live Rates on WhatsApp', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20please%20share%20today%27s%20commercial%20rate%20card%20and%20quotation.', primary: true, target: '_blank', whatsapp: true },
          { label: 'Wholesale Pro-Forma', href: 'wholesale.html#proforma' },
          { label: 'Explore Catalogue', href: 'catalogue.html' }
        ],
        followUps: ['All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'Chef Welcome Box (Free)', 'Hotel Smart 24/7']
      };
    }

    // ── 13. QUALITY, ASSAY & SPECIFICATIONS ──
    if (/(why.*(?:good|better|best|pure)|what\s*makes.*(?:good|better|best|special)|is.*(?:good|better|best|pure)|how\s*is.*(?:good|quality)|quality|purity|lab|assay|coa|curcumin|piperine|fssai|chemical|testing)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'CONTACT_US';
      return {
        html: '<strong>Single-Origin Unadulterated Purity:</strong><br><br>' +
              'All KTA spices are single-origin, sourced and graded by KTA alone with <strong>unadulterated purity</strong> and zero synthetic additives or fillers.<br><br>' +
              'For specific lot details, quality questions, or live commercial pricing, please contact our Trade Desk directly:<br><br>' +
              '<em>Our team is available 24/7 to assist your kitchen or procurement desk:</em>',
        actions: [
          { label: 'Contact Us on WhatsApp', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20have%20an%20inquiry%20regarding%20spice%20quality%20and%20product%20details.', primary: true, target: '_blank', whatsapp: true },
          { label: 'Contact Us Page', href: 'contact.html' },
          { label: 'Call Trade Desk (+91 85928 32871)', href: 'tel:+918592832871' }
        ],
        followUps: ['All Products (51 Varieties)', 'Wholesale (40kg Bags)', 'Chef Welcome Box (Free)', 'Hotel Smart 24/7']
      };
    }

    // ── 14. DELIVERY, LOGISTICS & TURNAROUND SLAS ──
    if (/(delivery|shipping|dispatch|speed|lead\s*time|transit|how\s*long|turnaround|transport|freight|logistics)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'DELIVERY';
      return {
        html: '<strong>Delivery Logistics &amp; Dispatch Turnaround:</strong><br><br>' +
              '• <strong>Hotel Smart Priority Replenishment:</strong> <strong>2–24 Hour Guaranteed Dispatch</strong> for contracted hospitality kitchens across operating delivery corridors.<br>' +
              '• <strong>Wholesale Consignments (500kg+):</strong> Palletized commercial freight dispatch within 24 hours ex-warehouse.<br>' +
              '• <strong>Pan-India &amp; Export Freight:</strong> Moisture-sealed multi-layer packaging dispatched via verified cargo lines with live dispatch tracking.<br><br>' +
              '<em>Need emergency replenishment or have a scheduled delivery requirement?</em>',
        actions: [
          { label: 'Emergency Dispatch WhatsApp', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Trade%20Desk%2C%20I%20have%20an%20urgent%20dispatch%20requirement.', primary: true, target: '_blank', whatsapp: true },
          { label: 'Hotel Smart Portal', href: 'hotel-smart.html' },
          { label: 'Wholesale Logistics', href: 'wholesale.html' }
        ],
        followUps: ['Hotel Smart 24/7', 'Wholesale (40kg Bags)', 'All Products (51 Varieties)', 'What is KTA?']
      };
    }

    // ── 15. PAYMENT TERMS & BILLING (10-DAY CREDIT & 48H INSPECTION) ──
    if (/(payment|credit|credit\s*period|credit\s*terms|terms|billing|invoice|proforma|bank|neft|rtgs|lc|account|refund|return|claim)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'PAYMENT';
      return {
        html: '<strong>Commercial Payment Terms, Credit Protocols &amp; Inspection:</strong><br><br>' +
              '• <strong>10-Day Initial Credit Facility:</strong> Approved hotel chains, restaurants, and enterprise partners start on a <strong>10-day revolving credit cycle</strong> upon trade verification.<br>' +
              '• <strong>First-Time Consignments:</strong> Initial trial consignments (500kg MOQ) are cleared against advance commercial pro-forma invoice or digital banking confirmation.<br>' +
              '• <strong>Settlement Methods:</strong> Direct corporate RTGS, NEFT, and Irrevocable Letter of Credit (LC) for multi-ton/export contracts.<br>' +
              '• <strong>Strict 48-Hour Inspection &amp; Food Safety Policy:</strong> Buyer receiving teams maintain a 48-hour inspection window upon delivery. Due to food safety standards, <strong>opened or unsealed bags/liners cannot be returned or refunded</strong> under any circumstances.<br><br>' +
              '<em>Contact our commercial accounts desk for credit onboarding or view full terms of trade:</em>',
        actions: [
          { label: 'View Terms of Trade', href: 'terms.html', primary: true },
          { label: 'Contact Accounts Desk', href: 'https://wa.me/918592832871?text=Hello%20KTA%20Accounts%20Desk%2C%20I%20am%20inquiring%20about%20commercial%20billing%20and%20credit%20onboarding.', target: '_blank', whatsapp: true },
          { label: 'Generate Pro-Forma', href: 'wholesale.html#proforma' }
        ],
        followUps: ['Wholesale (40kg Bags)', 'Hotel Smart 24/7', 'All Products (51 Varieties)', 'Why choose KTA?']
      };
    }

    // ── 16. HOW TO ORDER / PROCUREMENT PROCESS ──
    if (/(how\s*to\s*order|how\s*to\s*buy|order\s*process|how\s*to\s*purchase|order\s*placement|booking|procurement\s*process|how\s*do\s*i\s*order)/i.test(norm)) {
      KTA_AI_SESSION_STATE.lastIntent = 'ORDER_PROCESS';
      return {
        html: '<strong>How to Procure from KTA Spices (3 Simple Steps):</strong><br><br>' +
              '<strong>Step 1: Select Varieties</strong><br>' +
              'Browse our 51 single-origin varieties in the catalogue or build a 1kg Sample Tray.<br><br>' +
              '<strong>Step 2: Instant Quotation &amp; Verification</strong><br>' +
              'Submit your required lot sizes via 1-tap Fast RFQ or WhatsApp Trade Desk (+91 85928 32871).<br><br>' +
              '<strong>Step 3: Rapid Dispatch</strong><br>' +
              'Commercial lots dispatched in 2–24h with complete batch COA to your kitchen or receiving dock.<br><br>' +
              '<em>Ready to place an order or sample request?</em>',
        actions: [
          { label: 'Browse Catalogue (51 Varieties)', href: 'catalogue.html', primary: true },
          { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871', target: '_blank', whatsapp: true },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['All Products (51 Varieties)', 'Chef Welcome Box (Free)', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7']
      };
    }

    // ── 17. WHOLESALE EXTRACTION BYPRODUCTS LOOKUP ──
    var matchedExtraction = null;
    for (var w = 0; w < KTA_KB.wholesaleExtraction.length; w++) {
      var we = KTA_KB.wholesaleExtraction[w];
      var weNameLow = we.name.toLowerCase();
      if ((matchPhrase(norm, 'husk') && weNameLow.indexOf('husk') !== -1) ||
          (matchPhrase(norm, 'pinhead') && weNameLow.indexOf('pinhead') !== -1) ||
          (matchPhrase(norm, 'pinheads') && weNameLow.indexOf('pinhead') !== -1) ||
          (matchPhrase(norm, 'lite berries') && weNameLow.indexOf('lite') !== -1) ||
          (matchPhrase(norm, 'spent') && weNameLow.indexOf('spent') !== -1) ||
          (matchPhrase(norm, 'byproduct') && weNameLow.indexOf('husk') !== -1)) {
        matchedExtraction = we;
        break;
      }
    }

    if (matchedExtraction) {
      KTA_AI_SESSION_STATE.lastProduct = { name: matchedExtraction.name, hsn: matchedExtraction.hsn, grade: 'Wholesale Extraction Grade', origin: 'Highland Specific', packaging: '40kg Master Bags' };
      var waWeMsg = encodeURIComponent('Hello KTA Trade Desk, I am inquiring about ' + matchedExtraction.name + ' (HSN: ' + matchedExtraction.hsn + ') for wholesale procurement.');
      return {
        html: '<div class="kta-ai-card">' +
              '  <div class="kta-ai-card-title">' + escapeHtml(matchedExtraction.name) + '</div>' +
              '  <div class="kta-ai-card-origin">HSN: ' + matchedExtraction.hsn + ' · MOQ: ' + matchedExtraction.moq + '</div>' +
              '  <div class="kta-ai-card-grid">' +
              '    <div class="kta-ai-card-row"><span class="kta-ai-card-key">Purity &amp; Source</span><span class="kta-ai-card-val">Sourced &amp; graded by KTA alone</span></div>' +
              '    <div class="kta-ai-card-row"><span class="kta-ai-card-key">Packaging Standard</span><span class="kta-ai-card-val">40kg Heavy-Duty Master Bags</span></div>' +
              '  </div>' +
              '  <div class="kta-ai-card-desc"><strong>Specification:</strong> ' + escapeHtml(matchedExtraction.desc) + '</div>' +
              '</div><br>' +
              '<em>Available in 40kg master bags for industrial extraction units and commercial food processors:</em>',
        actions: [
          { label: 'Wholesale WhatsApp (+91 63793 51632)', href: 'https://wa.me/916379351632?text=' + waWeMsg, primary: true, target: '_blank', whatsapp: true },
          { label: 'Pro-Forma Calculator', href: 'wholesale.html#proforma' },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['Wholesale (40kg Bags)', 'Hotel Smart 24/7', 'Custom Sourcing']
      };
    }

    // ── 18. DIRECT PRODUCT LOOKUP ACROSS CATALOGUE (WORD BOUNDARY MATCHING) ──
    var matchedProduct = null;
    var longestMatchLen = 0;

    for (var i = 0; i < KTA_KB.products.length; i++) {
      var prod = KTA_KB.products[i];
      for (var a = 0; a < prod.aliases.length; a++) {
        var alias = prod.aliases[a];
        if (matchPhrase(norm, alias)) {
          if (alias.length > longestMatchLen) {
            matchedProduct = prod;
            longestMatchLen = alias.length;
          }
        }
      }
    }

    if (matchedProduct) {
      KTA_AI_SESSION_STATE.lastProduct = matchedProduct;
      KTA_AI_SESSION_STATE.lastIntent = 'PRODUCT_VIEW';
      
      var waProdMsg = encodeURIComponent('Hello KTA Trade Desk, I am inquiring about ' + matchedProduct.name + ' (HSN: ' + matchedProduct.hsn + ') for commercial kitchen supply.');
      return {
        html: '<div class="kta-ai-card">' +
              '  <div class="kta-ai-card-title">' + escapeHtml(matchedProduct.name) + '</div>' +
              '  <div class="kta-ai-card-origin">HSN: ' + matchedProduct.hsn + ' · Terroir: ' + matchedProduct.origin + '</div>' +
              '  <div class="kta-ai-card-grid">' +
              '    <div class="kta-ai-card-row"><span class="kta-ai-card-key">Purity &amp; Source</span><span class="kta-ai-card-val">Sourced &amp; graded by KTA alone</span></div>' +
              '    <div class="kta-ai-card-row"><span class="kta-ai-card-key">Commercial Grade</span><span class="kta-ai-card-val">' + escapeHtml(matchedProduct.grade) + '</span></div>' +
              '    <div class="kta-ai-card-row"><span class="kta-ai-card-key">Packaging Standard</span><span class="kta-ai-card-val">' + escapeHtml(matchedProduct.packaging) + '</span></div>' +
              '    <div class="kta-ai-card-row"><span class="kta-ai-card-key">Harvest Season</span><span class="kta-ai-card-val">' + escapeHtml(matchedProduct.harvestSeason || 'Peak Harvest Arrivals') + '</span></div>' +
              '  </div>' +
              '  <div class="kta-ai-card-desc"><strong>Culinary Note:</strong> ' + escapeHtml(matchedProduct.culinaryPairing) + '</div>' +
              '</div><br>' +
              '<em>Would you like to check today\'s commercial lot rate or request a 1kg sample pack?</em>',
        actions: [
          { label: 'Inquire on WhatsApp', href: 'https://wa.me/918592832871?text=' + waProdMsg, primary: true, target: '_blank', whatsapp: true },
          { label: 'Browse Full Catalogue', href: 'catalogue.html#spices' },
          { label: 'Wholesale Portal', href: 'wholesale.html' }
        ],
        followUps: ['Request 1kg Sample of this', 'Wholesale Rate (40kg Bags)', 'Quality & Lab Assay', 'All Products (51 Varieties)']
      };
    }

    // ── 19. CONTACT, BROKER, WAREHOUSE & 24/7 OPERATING HOURS ──
    if (/(contact|broker|call|phone|whatsapp|address|location|warehouse|office|hours|desk|where|hotline|support)/i.test(norm)) {
      return {
        html: '<strong>KTA Commercial Trade Desk &amp; Registered Warehouse:</strong><br><br>' +
              '• <strong>General &amp; Emergency Trade Desk:</strong> +91 85928 32871 (WhatsApp: <a href="https://wa.me/918592832871" target="_blank">wa.me/918592832871</a>)<br>' +
              '• <strong>Dedicated Wholesale Desk:</strong> +91 63793 51632 (WhatsApp: <a href="https://wa.me/916379351632" target="_blank">wa.me/916379351632</a>)<br>' +
              '• <strong>Registered Warehouse:</strong> No. 13/28, Mylai Periyathambi Street, George Town, Mannadi, Chennai, Tamil Nadu – 600001<br>' +
              '• <strong>Operating Hours:</strong> <strong>Monday – Sunday: 24 Hours (24/7)</strong><br><br>' +
              '<em>Would you like to contact our trade desk directly or explore wholesale lots?</em>',
        actions: [
          { label: 'Call General Desk (+91 85928 32871)', href: 'tel:+918592832871', primary: true },
          { label: 'Wholesale WhatsApp (+91 63793 51632)', href: 'https://wa.me/916379351632', target: '_blank', whatsapp: true },
          { label: 'Contact Page', href: 'contact.html' }
        ],
        followUps: ['All Products (51 Varieties)', 'What is KTA?', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7']
      };
    }

    // ── 20. GREETINGS & INTRODUCTIONS ──
    if (/^(hi|hello|hey|good\s*morning|good\s*afternoon|good\s*evening|namaste|vanakkam|namaskaram|start|help|hola|greetings)/i.test(norm)) {
      return {
        html: '<strong>Hello! Welcome to KTA Spices Commercial Concierge.</strong><br><br>' +
              'How may I assist your kitchen or procurement desk today?<br>' +
              '• <strong>Custom Sourcing</strong> (Rare botanicals &amp; unlisted items outside catalogue)<br>' +
              '• <strong>All Products</strong> (51 single-origin spices, dry fruits &amp; seeds)<br>' +
              '• <strong>What is KTA?</strong> (25+ years single-origin estate heritage)<br>' +
              '• <strong>Why KTA?</strong> (Sourced &amp; graded by KTA alone, unadulterated purity)<br>' +
              '• <strong>Wholesale Supply</strong> (500kg+ MOQ in 40kg master bags)<br>' +
              '• <strong>Hotel Smart 24/7</strong> (2–24h replenishment across South India)<br>' +
              '• <strong>Green Ginger (Fresh)</strong> (Raw farm rhizomes &amp; extraction grades)<br>' +
              '• <strong>Chef Welcome Box</strong> (Complimentary discovery kit for chefs)<br><br>' +
              '<em>Tap any topic above or type your specific commercial requirement.</em>',
        actions: [
          { label: 'All Products (51 Varieties)', href: 'catalogue.html', primary: true },
          { label: 'Wholesale Portal', href: 'wholesale.html' },
          { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871', target: '_blank', whatsapp: true }
        ],
        followUps: ['Custom Sourcing', 'All Products (51 Varieties)', 'What is KTA?', 'Why choose KTA?', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7']
      };
    }

    // ── 21. INTELLIGENT COMMERCIAL FALLBACK ──
    return {
      html: 'I am here to assist with core commercial procurement questions for KTA Spices:<br><br>' +
            '• <strong>Custom Sourcing</strong> (Rare botanicals &amp; unlisted items outside catalogue)<br>' +
            '• <strong>All Products</strong> (51 single-origin spices, dry fruits &amp; seeds)<br>' +
            '• <strong>What is KTA?</strong> (Single-origin estate heritage)<br>' +
            '• <strong>Why choose KTA?</strong> (Sourced &amp; graded by KTA alone)<br>' +
            '• <strong>What is Wholesale?</strong> (500kg+ MOQ in 40kg master bags)<br>' +
            '• <strong>Hotel Smart 24/7</strong> (2–24h emergency replenishment)<br>' +
            '• <strong>Green Ginger (Fresh)</strong> (Raw farm rhizomes)<br>' +
            '• <strong>Chef Welcome Box</strong> (Free sample kit for executive chefs)<br><br>' +
            '<em>Tap a topic above or ask any commercial requirement.</em>',
      actions: [
        { label: 'Browse Catalogue (51 Varieties)', href: 'catalogue.html', primary: true },
        { label: 'Wholesale Portal', href: 'wholesale.html' },
        { label: 'Custom Sourcing Desk', href: 'wholesale.html#orderForm' },
        { label: 'WhatsApp Trade Desk', href: 'https://wa.me/918592832871', target: '_blank', whatsapp: true }
      ],
      followUps: ['Custom Sourcing', 'All Products (51 Varieties)', 'What is KTA?', 'Why choose KTA?', 'Wholesale (40kg Bags)', 'Hotel Smart 24/7']
    };
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAIWidget);
  } else {
    renderAIWidget();
  }
})();





/**
 * Complete translations for CropSentinel
 * Languages: English (en), Hindi (hi), Gujarati (gu)
 */
export const translations = {
  en: {
    // Nav
    home: 'Home', farms: 'Farms', insights: 'Insights', alerts: 'Alerts', profile: 'Profile',
    // Welcome
    get_started: 'Get Started', tagline: 'AI-Powered Farm Intelligence',
    // Login
    welcome_back: 'Welcome back! 👋', login_to_continue: 'Login to continue',
    email_label: 'Email', password_label: 'Password',
    forgot_password: 'Forgot Password?', login_btn: 'Login',
    or_continue_with: 'or continue with', new_farmer: 'New farmer?', create_account: 'Create Account',
    // Home
    good_morning: 'Good Morning,', farmer: 'Farmer 🌿',
    heres_whats: "Here's what's happening on your farms",
    my_farms: 'My Farms', farms_alert: '{n} Farms • {a} Alert',
    add_new_field: 'Add New Field',
    temp: 'Temp', humidity: 'Humidity', rain_chance: 'Rain Chance', wind: 'Wind',
    // Farm cards
    north_field: 'North Field', south_field: 'South Field',
    wheat: 'Wheat', rice: 'Rice', cotton: 'Cotton', sugarcane: 'Sugarcane', corn: 'Corn',
    drought_risk: 'Drought Risk', healthy: 'Healthy', critical: 'Critical',
    ndvi: 'NDVI', moisture: 'Moisture', low: 'Low', optimal: 'Optimal',
    // Farms list
    search_farms: 'Search farms by name or crop…', no_farms_match: 'No farms match',
    // Farm detail
    health_score: 'Health Score', crop_type: 'Crop Type', satellite_view: 'Satellite View',
    ndvi_trend: 'NDVI Trend', view_intervention: 'View Intervention', last_update: 'Last Update',
    // Intervention
    ai_recommendation: 'AI RECOMMENDATION', irrigate: 'Irrigate immediately',
    moisture_critically_low: 'Moisture level critically low',
    irrigation: 'IRRIGATION', cost: 'COST', field_risk: 'FIELD RISK',
    ai_confidence: 'AI Confidence', why_intervention: 'Why this intervention?',
    expected_outcome: 'Expected Outcome', high_impact: 'High Impact',
    yield_improvement: 'Yield Improvement', roi: 'ROI',
    apply_intervention: 'Apply Intervention',
    // Insights
    trends_insights: 'Trends & Insights', ndvi_trend_tab: 'NDVI Trend',
    moisture_tab: 'Moisture', temperature_tab: 'Temperature',
    // Alerts
    alerts_title: 'Alerts', unread_alerts: '{n} Unread Alert', all_caught_up: 'All caught up!',
    clear_all: 'Clear All', active: 'Active', history: 'History',
    no_alerts: 'No {tab} alerts', full_details: 'Full Details', recommendation: 'Recommendation',
    // Profile
    edit: 'Edit', log_out: 'Log Out',
    farm_details: 'Farm Details', account_settings: 'Account Settings',
    notification_settings: 'Notification Settings', help_support: 'Help & Support',
    about: 'About CropSentinel',
    // Edit Profile
    edit_profile: 'Edit Profile', full_name: 'Full Name', phone_number: 'Phone Number',
    location: 'Location', change_photo: 'Change Photo', save_changes: 'Save Changes', saved: 'Saved!',
    // Settings
    settings: 'Account Settings', preferences: 'Preferences',
    units: 'Units', language: 'Language', theme: 'Theme',
    data_privacy: 'Data & Privacy', auto_sync: 'Auto-Sync Data',
    auto_sync_sub: 'Sync farm data in background',
    location_access: 'Location Access', location_sub: 'Required for satellite mapping',
    share_analytics: 'Share Analytics', share_sub: 'Help us improve CropSentinel',
    account: 'Account', change_password: 'Change Password',
    linked_devices: 'Linked Devices', export_data: 'Export My Data',
    delete_account: 'Delete Account',
    version: 'Version', rate_app: 'Rate the App',
    // Change Password
    change_password_title: 'Change Password',
    current_password: 'Current Password', new_password: 'New Password',
    confirm_password: 'Confirm Password', update_password: 'Update Password',
    password_updated: 'Password Updated!',
    passwords_no_match: 'New passwords do not match.',
    // Notifications
    channels: 'Channels', push_notif: 'Push Notifications',
    push_sub: 'Alerts on your device', email_alerts: 'Email Alerts',
    sms_alerts: 'SMS Alerts', alert_types: 'Alert Types',
    drought_alerts: 'Drought Risk Alerts', drought_sub: 'Soil moisture warnings',
    pest_alerts: 'Pest & Disease Alerts', pest_sub: 'Early detection reports',
    weather_warnings: 'Weather Warnings', weather_sub: 'Extreme weather events',
    ndvi_updates: 'NDVI Updates', ndvi_sub: 'Weekly health summaries',
    market_alerts: 'Market Price Alerts', market_sub: 'Mandi price changes',
    // Help & Support
    live_chat: 'Live Chat', avg_reply: 'Avg. 5 min reply',
    call_us: 'Call Us', email_us: 'Email Us',
    faq: 'Frequently Asked Questions',
    // Farm Details Config
    farm_details_title: 'Farm Details', farm_overview: 'Farm Overview',
    total_fields: 'Total Fields', total_area: 'Total Area', active_alerts: 'Alerts',
    soil_health: 'Soil Health', overall_ndvi: 'NDVI', good: 'Good',
    save: 'Save', cancel: 'Cancel', saving: 'Saving…',
    farm_name_label: 'Farm Name', location_label: 'Location', area_label: 'Area (acres)',
    // Add Field
    add_field_title: 'Add New Field', select_location: 'Select Location',
    tap_map: 'Tap on the map to drop a pin for your farm.',
    field_name: 'Field Name', crop_type_label: 'Select Crop Type', choose_crop: 'Choose crop',
    field_area: 'Field Area (Acres)', soil_type: 'Soil Type', choose_soil: 'Choose soil type',
    location_btn: 'Select on map', selected: 'Selected', confirm: 'Confirm',
    save_field: 'Save Field', saving_field: 'Saving…',
    validation_error: 'Please fill in Farm Name, Crop Type, and select a Location.',
    // About
    our_mission: 'Our Mission',
    mission_text: 'CropSentinel empowers farmers with satellite and AI tools. Our goal is to help every farmer make data-driven decisions — reducing crop losses, conserving water, and improving incomes.',
    technology: 'Technology',
  },

  hi: {
    // Nav
    home: 'होम', farms: 'खेत', insights: 'जानकारी', alerts: 'अलर्ट', profile: 'प्रोफ़ाइल',
    // Welcome
    get_started: 'शुरू करें', tagline: 'AI-संचालित कृषि बुद्धिमत्ता',
    // Login
    welcome_back: 'वापस स्वागत है! 👋', login_to_continue: 'जारी रखने के लिए लॉगिन करें',
    email_label: 'ईमेल', password_label: 'पासवर्ड',
    forgot_password: 'पासवर्ड भूल गए?', login_btn: 'लॉगिन',
    or_continue_with: 'या इससे जारी रखें', new_farmer: 'नए किसान?', create_account: 'खाता बनाएं',
    // Home
    good_morning: 'सुप्रभात,', farmer: 'किसान 🌿',
    heres_whats: 'आपके खेतों में क्या हो रहा है',
    my_farms: 'मेरे खेत', farms_alert: '{n} खेत • {a} अलर्ट',
    add_new_field: 'नया खेत जोड़ें',
    temp: 'तापमान', humidity: 'नमी', rain_chance: 'बारिश की संभावना', wind: 'हवा',
    // Farm cards
    north_field: 'उत्तरी खेत', south_field: 'दक्षिणी खेत',
    wheat: 'गेहूं', rice: 'चावल', cotton: 'कपास', sugarcane: 'गन्ना', corn: 'मक्का',
    drought_risk: 'सूखे का खतरा', healthy: 'स्वस्थ', critical: 'गंभीर',
    ndvi: 'NDVI', moisture: 'नमी', low: 'कम', optimal: 'उचित',
    // Farms list
    search_farms: 'नाम या फसल से खेत खोजें…', no_farms_match: 'कोई खेत नहीं मिला',
    // Farm detail
    health_score: 'स्वास्थ्य स्कोर', crop_type: 'फसल का प्रकार', satellite_view: 'सैटेलाइट दृश्य',
    ndvi_trend: 'NDVI ट्रेंड', view_intervention: 'हस्तक्षेप देखें', last_update: 'अंतिम अपडेट',
    // Intervention
    ai_recommendation: 'AI अनुशंसा', irrigate: 'तुरंत सिंचाई करें',
    moisture_critically_low: 'नमी का स्तर गंभीर रूप से कम है',
    irrigation: 'सिंचाई', cost: 'लागत', field_risk: 'खेत का जोखिम',
    ai_confidence: 'AI विश्वास', why_intervention: 'यह हस्तक्षेप क्यों?',
    expected_outcome: 'अपेक्षित परिणाम', high_impact: 'उच्च प्रभाव',
    yield_improvement: 'उपज में सुधार', roi: 'ROI',
    apply_intervention: 'हस्तक्षेप लागू करें',
    // Insights
    trends_insights: 'रुझान और जानकारी', ndvi_trend_tab: 'NDVI ट्रेंड',
    moisture_tab: 'नमी', temperature_tab: 'तापमान',
    // Alerts
    alerts_title: 'अलर्ट', unread_alerts: '{n} अपठित अलर्ट', all_caught_up: 'सब पढ़ लिया!',
    clear_all: 'सब हटाएं', active: 'सक्रिय', history: 'इतिहास',
    no_alerts: 'कोई {tab} अलर्ट नहीं', full_details: 'पूरी जानकारी', recommendation: 'सिफारिश',
    // Profile
    edit: 'संपादित करें', log_out: 'लॉग आउट',
    farm_details: 'खेत विवरण', account_settings: 'खाता सेटिंग',
    notification_settings: 'सूचना सेटिंग', help_support: 'सहायता',
    about: 'CropSentinel के बारे में',
    // Edit Profile
    edit_profile: 'प्रोफ़ाइल संपादित करें', full_name: 'पूरा नाम', phone_number: 'फ़ोन नंबर',
    location: 'स्थान', change_photo: 'फ़ोटो बदलें', save_changes: 'बदलाव सहेजें', saved: 'सहेजा गया!',
    // Settings
    settings: 'खाता सेटिंग', preferences: 'प्राथमिकताएं',
    units: 'इकाई', language: 'भाषा', theme: 'थीम',
    data_privacy: 'डेटा और गोपनीयता', auto_sync: 'ऑटो-सिंक डेटा',
    auto_sync_sub: 'पृष्ठभूमि में खेत डेटा सिंक करें',
    location_access: 'स्थान पहुंच', location_sub: 'सैटेलाइट मैपिंग के लिए आवश्यक',
    share_analytics: 'Analytics साझा करें', share_sub: 'CropSentinel को बेहतर बनाने में मदद करें',
    account: 'खाता', change_password: 'पासवर्ड बदलें',
    linked_devices: 'जुड़े उपकरण', export_data: 'मेरा डेटा निर्यात करें',
    delete_account: 'खाता हटाएं',
    version: 'संस्करण', rate_app: 'ऐप को रेट करें',
    // Change Password
    change_password_title: 'पासवर्ड बदलें',
    current_password: 'वर्तमान पासवर्ड', new_password: 'नया पासवर्ड',
    confirm_password: 'पासवर्ड की पुष्टि करें', update_password: 'पासवर्ड अपडेट करें',
    password_updated: 'पासवर्ड अपडेट हो गया!',
    passwords_no_match: 'नए पासवर्ड मेल नहीं खाते।',
    // Notifications
    channels: 'चैनल', push_notif: 'पुश सूचनाएं',
    push_sub: 'आपके डिवाइस पर अलर्ट', email_alerts: 'ईमेल अलर्ट',
    sms_alerts: 'SMS अलर्ट', alert_types: 'अलर्ट प्रकार',
    drought_alerts: 'सूखे के अलर्ट', drought_sub: 'मिट्टी की नमी की चेतावनियाँ',
    pest_alerts: 'कीट अलर्ट', pest_sub: 'शीघ्र पहचान रिपोर्ट',
    weather_warnings: 'मौसम चेतावनियाँ', weather_sub: 'अत्यधिक मौसम घटनाएं',
    ndvi_updates: 'NDVI अपडेट', ndvi_sub: 'साप्ताहिक स्वास्थ्य सारांश',
    market_alerts: 'बाजार मूल्य अलर्ट', market_sub: 'मंडी मूल्य परिवर्तन',
    // Farm Details Config
    farm_details_title: 'खेत विवरण', farm_overview: 'खेत का अवलोकन',
    total_fields: 'कुल खेत', total_area: 'कुल क्षेत्र', active_alerts: 'अलर्ट',
    soil_health: 'मिट्टी का स्वास्थ्य', overall_ndvi: 'NDVI', good: 'अच्छा',
    save: 'सहेजें', cancel: 'रद्द करें', saving: 'सहेज रहे हैं…',
    farm_name_label: 'खेत का नाम', location_label: 'स्थान', area_label: 'क्षेत्र (एकड़)',
    // Add Field
    add_field_title: 'नया खेत जोड़ें', select_location: 'स्थान चुनें',
    tap_map: 'अपने खेत के लिए नक्शे पर टैप करें।',
    field_name: 'खेत का नाम', crop_type_label: 'फसल का प्रकार चुनें', choose_crop: 'फसल चुनें',
    field_area: 'खेत का क्षेत्र (एकड़)', soil_type: 'मिट्टी का प्रकार', choose_soil: 'मिट्टी का प्रकार चुनें',
    location_btn: 'नक्शे पर चुनें', selected: 'चुना गया', confirm: 'पुष्टि करें',
    save_field: 'खेत सहेजें', saving_field: 'सहेज रहे हैं…',
    validation_error: 'कृपया खेत का नाम, फसल का प्रकार और स्थान भरें।',
    // About
    our_mission: 'हमारा मिशन',
    mission_text: 'CropSentinel किसानों को सैटेलाइट और AI टूल देता है। हमारा लक्ष्य हर किसान को डेटा-आधारित निर्णय लेने में मदद करना है।',
    technology: 'तकनीक',
  },

  gu: {
    // Nav
    home: 'હોમ', farms: 'ખેતરો', insights: 'આંતરદૃષ્ટિ', alerts: 'એલર્ટ્સ', profile: 'પ્રોફાઇલ',
    // Welcome
    get_started: 'શરૂ કરો', tagline: 'AI-સંચાલિત ખેતી માહિતી',
    // Login
    welcome_back: 'ફરી સ્વાગત છે! 👋', login_to_continue: 'ચાલુ રાખવા માટે લોગિન કરો',
    email_label: 'ઇમેઇલ', password_label: 'પાસવર્ડ',
    forgot_password: 'પાસવર્ડ ભૂલી ગયા?', login_btn: 'લોગિન',
    or_continue_with: 'અથવા આનાથી ચાલુ રાખો', new_farmer: 'નવા ખેડૂત?', create_account: 'એકાઉન્ટ બનાવો',
    // Home
    good_morning: 'સુપ્રભાત,', farmer: 'ખેડૂત 🌿',
    heres_whats: 'તમારા ખેતરોમાં શું થઈ રહ્યું છે',
    my_farms: 'મારા ખેતરો', farms_alert: '{n} ખેતરો • {a} એલર્ટ',
    add_new_field: 'નવું ખેતર ઉમેરો',
    temp: 'તાપમાન', humidity: 'ભેજ', rain_chance: 'વરસાદની શક્યતા', wind: 'પવન',
    // Farm cards
    north_field: 'ઉત્તર ખેતર', south_field: 'દક્ષિણ ખેતર',
    wheat: 'ઘઉં', rice: 'ચોખા', cotton: 'કપાસ', sugarcane: 'શેરડી', corn: 'મકાઈ',
    drought_risk: 'દુષ્કાળનું જોખમ', healthy: 'સ્વસ્થ', critical: 'ગંભીર',
    ndvi: 'NDVI', moisture: 'ભેજ', low: 'ઓછો', optimal: 'ઉત્તમ',
    // Farms list
    search_farms: 'નામ અથવા પાકથી ખેતરો શોધો…', no_farms_match: 'કોઈ ખેતરો મળ્યા નથી',
    // Farm detail
    health_score: 'આરોગ્ય સ્કોર', crop_type: 'પાકનો પ્રકાર', satellite_view: 'સેટેલાઇટ વ્યૂ',
    ndvi_trend: 'NDVI ટ્રેન્ડ', view_intervention: 'ઉપાય જુઓ', last_update: 'છેલ્લો અપડેટ',
    // Intervention
    ai_recommendation: 'AI ભલામણ', irrigate: 'તરત જ સિંચાઈ કરો',
    moisture_critically_low: 'ભેજનું સ્તર ખૂબ ઓછું છે',
    irrigation: 'સિંચાઈ', cost: 'ખર્ચ', field_risk: 'ખેતરનું જોખમ',
    ai_confidence: 'AI વિશ્વાસ', why_intervention: 'આ ઉપાય શા માટે?',
    expected_outcome: 'અપેક્ષિત પરિણામ', high_impact: 'ઉચ્ચ અસર',
    yield_improvement: 'ઉપજમાં સુધારો', roi: 'ROI',
    apply_intervention: 'ઉપાય લાગુ કરો',
    // Insights
    trends_insights: 'વલણો અને આંતરદૃષ્ટિ', ndvi_trend_tab: 'NDVI ટ્રેન્ડ',
    moisture_tab: 'ભેજ', temperature_tab: 'તાપમાન',
    // Alerts
    alerts_title: 'એલર્ટ્સ', unread_alerts: '{n} ન વાંચેલા એલર્ટ', all_caught_up: 'બધા એલર્ટ વંચાઈ ગયા!',
    clear_all: 'બધા સાફ કરો', active: 'સક્રિય', history: 'ઇતિહાસ',
    no_alerts: 'કોઈ {tab} એલર્ટ નથી', full_details: 'સંપૂર્ણ વિગતો', recommendation: 'ભલામણ',
    // Profile
    edit: 'ફેરફાર કરો', log_out: 'લોગ આઉટ',
    farm_details: 'ખેતરની વિગતો', account_settings: 'એકાઉન્ટ સેટિંગ્સ',
    notification_settings: 'નોટિફિકેશન સેટિંગ્સ', help_support: 'મદદ અને સપોર્ટ',
    about: 'CropSentinel વિશે',
    // Edit Profile
    edit_profile: 'પ્રોફાઇલમાં ફેરફાર કરો', full_name: 'પૂરું નામ', phone_number: 'ફોન નંબર',
    location: 'સ્થળ', change_photo: 'ફોટો બદલો', save_changes: 'ફેરફારો સાચવો', saved: 'સાચવ્યું!',
    // Settings
    settings: 'એકાઉન્ટ સેટિંગ્સ', preferences: 'પસંદગીઓ',
    units: 'એકમ', language: 'ભાષા', theme: 'થીમ',
    data_privacy: 'ડેટા અને ગોપનીયતા', auto_sync: 'ઓટો-સિંક ડેટા',
    auto_sync_sub: 'બેકગ્રાઉન્ડમાં ખેતરનો ડેટા સિંક કરો',
    location_access: 'સ્થાન ઍક્સેસ', location_sub: 'સેટેલાઇટ મેપિંગ માટે જરૂરી છે',
    share_analytics: 'એનાલિટિક્સ શેર કરો', share_sub: 'CropSentinel સુધારવામાં મદદ કરો',
    account: 'એકાઉન્ટ', change_password: 'પાસવર્ડ બદલો',
    linked_devices: 'જોડાયેલા ઉપકરણો', export_data: 'મારો ડેટા નિકાસ કરો',
    delete_account: 'એકાઉન્ટ કાઢી નાખો',
    version: 'આવૃત્તિ', rate_app: 'એપ્લિકેશનને રેટ કરો',
    // Change Password
    change_password_title: 'પાસવર્ડ બદલો',
    current_password: 'વર્તમાન પાસવર્ડ', new_password: 'નવો પાસવર્ડ',
    confirm_password: 'પાસવર્ડની પુષ્ટિ કરો', update_password: 'પાસવર્ડ અપડેટ કરો',
    password_updated: 'પાસવર્ડ અપડેટ થયો!',
    passwords_no_match: 'નવા પાસવર્ડ મેળ ખાતા નથી.',
    // Notifications
    channels: 'ચેનલો', push_notif: 'પુશ નોટિફિકેશન',
    push_sub: 'તમારા ઉપકરણ પર એલર્ટ્સ', email_alerts: 'ઇમેઇલ એલર્ટ્સ',
    sms_alerts: 'SMS એલર્ટ્સ', alert_types: 'એલર્ટના પ્રકારો',
    drought_alerts: 'દુષ્કાળના એલર્ટ્સ', drought_sub: 'માટીના ભેજની ચેતવણીઓ',
    pest_alerts: 'જીવાત એલર્ટ્સ', pest_sub: 'વહેલી શોધના અહેવાલો',
    weather_warnings: 'હવામાન ચેતવણીઓ', weather_sub: 'અત્યંત હવામાન ઘટનાઓ',
    ndvi_updates: 'NDVI અપડેટ્સ', ndvi_sub: 'સાપ્તાહિક સ્વાસ્થ્ય સારાંશ',
    market_alerts: 'બજાર ભાવ એલર્ટ્સ', market_sub: 'મંડીના ભાવમાં ફેરફાર',
    // Farm Details Config
    farm_details_title: 'ખેતરની વિગતો', farm_overview: 'ખેતરની ઝાંખી',
    total_fields: 'કુલ ખેતરો', total_area: 'કુલ વિસ્તાર', active_alerts: 'એલર્ટ્સ',
    soil_health: 'માટીનું સ્વાસ્થ્ય', overall_ndvi: 'NDVI', good: 'સારું',
    save: 'સાચવો', cancel: 'રદ કરો', saving: 'સાચવી રહ્યું છે…',
    farm_name_label: 'ખેતરનું નામ', location_label: 'સ્થળ', area_label: 'વિસ્તાર (એકર)',
    // Add Field
    add_field_title: 'નવું ખેતર ઉમેરો', select_location: 'સ્થાન પસંદ કરો',
    tap_map: 'તમારા ખેતર માટે નકશા પર પિન મૂકવા ટેપ કરો.',
    field_name: 'ખેતરનું નામ', crop_type_label: 'પાકનો પ્રકાર પસંદ કરો', choose_crop: 'પાક પસંદ કરો',
    field_area: 'ખેતરનો વિસ્તાર (એકર)', soil_type: 'માટીનો પ્રકાર', choose_soil: 'માટીનો પ્રકાર પસંદ કરો',
    location_btn: 'નકશા પર પસંદ કરો', selected: 'પસંદ કરેલ', confirm: 'પુષ્ટિ કરો',
    save_field: 'ખેતર સાચવો', saving_field: 'સાચવી રહ્યું છે…',
    validation_error: 'કૃપા કરીને ખેતરનું નામ, પાકનો પ્રકાર ભરો અને સ્થાન પસંદ કરો.',
    // About
    our_mission: 'અમારું લક્ષ્ય',
    mission_text: 'CropSentinel ખેડૂતોને સેટેલાઇટ અને AI સાધનોથી સજ્જ કરે છે. અમારું લક્ષ્ય દરેક ખેડૂતને ડેટા આધારિત નિર્ણયો લેવામાં મદદ કરવાનું છે — જેથી પાકનું નુકસાન ઘટાડી શકાય, પાણી બચાવી શકાય અને આવક વધારી શકાય.',
    technology: 'ટેકનોલોજી',
  },
};

/**
 * Translation function factory
 */
export function makeT(language) {
  const lang = translations[language] || translations.en;
  return (key, params = {}) => {
    let str = lang[key] || translations.en[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  };
}

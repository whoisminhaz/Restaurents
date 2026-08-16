// D'Feringghi Tandoori House - Main Script

const translations = {
  en: {}, // Will be populated on load with default HTML text
  my: {
    nav_about: "Tentang",
    nav_menu: "Menu",
    nav_gallery: "Galeri",
    nav_reviews: "Ulasan",
    nav_location: "Lokasi",
    hero_rating_text: "Penilaian Google · 1122+ Ulasan",
    hero_subtitle: "Pakistan · India · Arab · Barat & BBQ · Makanan Laut",
    hero_desc: "Masakan halal asli di pantai terbaik Pulau Pinang. Tanpa MSG · Tanpa pengawet · Pilihan vegan.",
    hero_cta_reserve: "📅 Tempah Meja",
    hero_cta_menu: "Lihat Menu",
    trust_halal: "Sijil Halal",
    trust_msg: "Tanpa MSG",
    trust_preserv: "Tanpa Pengawet",
    trust_parking: "Parkir Percuma",
    trust_vegan: "Pilihan Vegan",
    prox_beach: "3 minit berjalan dari Pantai Batu Ferringhi",
    prox_market: "5 minit dari Pasar Malam",
    prox_escape: "Berhampiran ESCAPE & Entopia",
    about_label: "Kisah Kami",
    about_title: "Perisa Merentasi <span>Sempadan</span>",
    about_p1: "Terletak di jalur pelancong utama berhampiran Pasar Malam Batu Ferringhi yang terkenal, D'Feringghi Tandoori House membawakan anda gabungan masakan Pakistan, India, Arab, dan Barat yang istimewa.",
    about_p2: "Lebih 10 tahun berkhidmat untuk pelancong dan penduduk tempatan dengan hidangan Halal, tanpa MSG serta banyak pilihan vegan dan bebas gluten.",
    menu_label: "Menu Kami",
    menu_title: "Teroka Menu <span>Penuh</span> Kami",
    tab_grill: "🔥 Tandoori & Grill",
    tab_biryani: "🍚 Briyani & Mandi",
    tab_chicken: "🍗 Ayam",
    tab_mutton: "🐑 Kambing & Daging",
    tab_seafood: "🦐 Makanan Laut",
    tab_appetizers: "🥗 Pembuka Selera",
    tab_naan: "🫓 Naan & Roti",
    tab_veg: "🌱 Vegetarian",
    tab_rice: "🍚 Nasi",
    tab_western: "🍕 Barat",
    tab_egg: "🥚 Telur",
    tab_dessert: "🍨 Pencuci Mulut",
    tab_drinks: "🥤 Minuman",
    menu_note: "💡 Sila benarkan 20 minit penyediaan. Semua hidangan pedas sederhana melainkan ditandakan.",
    gallery_label: "Pengalaman",
    gallery_title: "Makanan & <span>Suasana</span>",
    reviews_label: "Testimoni",
    reviews_title: "Ulasan <span>Tetamu</span>",
    leave_review: "⭐ Beri Ulasan Google",
    catering_label: "Acara & Katering",
    catering_title: "Khidmat <span>Katering</span> Berkualiti",
    catering_desc: "Kami menyediakan khidmat katering berkualiti untuk semua majlis istimewa anda.",
    catering_enquire: "💬 Tanya di WhatsApp",
    location_label: "Cari Kami",
    location_title: "Lawati <span>D'Feringghi</span>",
    addr_label: "Alamat",
    phone_label: "Telefon / WhatsApp",
    email_label: "E-mel",
    hours_label: "Waktu Operasi",
    parking_label: "Tempat Letak Kereta",
    parking_value: "Parkir percuma di jalan & lot",
    nearby_title: "📌 Mercu Tanda Berdekatan",
    hours_daily: "Setiap Hari: 11:00 PG – 12:00 TN",
    get_directions: "🧭 Dapatkan Arah",
    wa_us: "💬 WhatsApp Kami",
    cta_title: "SUDAH LAPAR?",
    cta_sub: "Jom makan! Pengalaman makan malam tak terlupakan di pantai terbaik Pulau Pinang.",
    cta_wa: "💬 WhatsApp Kami",
    footer_desc: "Masakan Pakistan, India, Arab & Barat asli di Batu Ferringhi, Pulau Pinang. Halal, tanpa MSG, buka setiap hari.",
    footer_nav: "Navigasi",
    footer_contact: "Hubungi",
    mb_reserve: "Tempah",
    mb_menu: "Menu",
    wa_tooltip: "Sembang dengan kami!"
  },
  ar: {
    nav_about: "حولنا",
    nav_menu: "القائمة",
    nav_gallery: "معرض",
    nav_reviews: "التقييمات",
    nav_location: "الموقع",
    hero_rating_text: "تقييم جوجل · ٦٦٧+ تقييم",
    hero_subtitle: "باكستاني · هندي · عربي · غربي وشواء · مأكولات بحرية",
    hero_desc: "مأكولات حلال أصيلة على أفضل شاطئ في بينانج. بدون MSG · بدون مواد حافظة · خيارات نباتية.",
    hero_cta_reserve: "📅 احجز طاولة",
    hero_cta_menu: "عرض القائمة",
    trust_halal: "شهادة حلال",
    trust_msg: "بدون MSG",
    trust_preserv: "بدون مواد حافظة",
    trust_parking: "موقف مجاني",
    trust_vegan: "خيارات نباتية",
    prox_beach: "٣ دقائق من شاطئ باتو فيرينغي",
    prox_market: "٥ دقائق من السوق الليلي",
    prox_escape: "بالقرب من ESCAPE وEntopia",
    about_label: "قصتنا",
    about_title: "نكهات تعبر <span>الحدود</span>",
    about_p1: "يقع على الشريط السياحي الرئيسي بالقرب من سوق باتو فيرينغي الليلي الشهير.",
    about_p2: "أكثر من ١٠ سنوات في خدمة السياح والسكان المحليين بأطباق حلال خالية من MSG.",
    menu_label: "قائمتنا",
    menu_title: "استكشف قائمتنا <span>الكاملة</span>",
    tab_grill: "🔥 تندوري وشواء",
    tab_biryani: "🍚 برياني ومندي",
    tab_chicken: "🍗 دجاج",
    tab_mutton: "🐑 لحم ضأن ولحم",
    tab_seafood: "🦐 مأكولات بحرية",
    tab_appetizers: "🥗 مقبلات",
    tab_naan: "🫓 نان وخبز",
    tab_veg: "🌱 نباتي",
    tab_rice: "🍚 أرز",
    tab_western: "🍕 غربي",
    tab_egg: "🥚 بيض",
    tab_dessert: "🍨 حلويات",
    tab_drinks: "🥤 مشروبات",
    menu_note: "💡 يرجى السماح بـ ٢٠ دقيقة للتحضير.",
    gallery_label: "التجربة",
    gallery_title: "طعام و <span>أجواء</span>",
    reviews_label: "شهادات",
    reviews_title: "تقييمات <span>الضيوف</span>",
    leave_review: "⭐ اترك تقييم جوجل",
    catering_label: "فعاليات وتموين",
    catering_title: "خدمات <span>تموين</span> عالية الجودة",
    catering_desc: "نقدم خدمات تموين عالية الجودة لجميع مناسباتكم الخاصة.",
    catering_enquire: "💬 استفسر عبر واتساب",
    location_label: "موقعنا",
    location_title: "زوروا <span>دي فيرينغي</span>",
    addr_label: "العنوان",
    phone_label: "الهاتف / واتساب",
    email_label: "البريد الإلكتروني",
    hours_label: "ساعات العمل",
    parking_label: "موقف السيارات",
    parking_value: "موقف مجاني في الشارع والساحة",
    nearby_title: "📌 معالم قريبة",
    hours_daily: "كل يوم: ١١:٠٠ ص – ١٢:٠٠ م",
    get_directions: "🧭 احصل على الاتجاهات",
    wa_us: "💬 واتساب",
    cta_title: "هل أنت جائع؟",
    cta_sub: "انضم إلينا لتجربة طعام لا تُنسى على أفضل شاطئ في بينانج.",
    cta_wa: "💬 واتساب",
    footer_desc: "مأكولات باكستانية وهندية وعربية وغربية أصيلة في باتو فيرينغي، بينانج. حلال، بدون MSG.",
    footer_nav: "التنقل",
    footer_contact: "اتصل بنا",
    mb_reserve: "احجز",
    mb_menu: "القائمة",
    wa_tooltip: "تحدث معنا!"
  },
  zh: {
    nav_about: "关于",
    nav_menu: "菜单",
    nav_gallery: "画廊",
    nav_reviews: "评论",
    nav_location: "位置",
    hero_rating_text: "谷歌评分 · 1122+ 评论",
    hero_subtitle: "巴基斯坦 · 印度 · 阿拉伯 · 烧烤及西餐 · 海鲜",
    hero_desc: "在槟城最佳海滩上品尝正宗清真美食。无味精 · 无防腐剂 · 素食选择。",
    hero_cta_reserve: "📅 预订餐桌",
    hero_cta_menu: "查看菜单",
    trust_halal: "清真认证",
    trust_msg: "无味精",
    trust_preserv: "无防腐剂",
    trust_parking: "免费停车",
    trust_vegan: "素食选择",
    prox_beach: "步行3分钟即可到达峇都丁宜海滩",
    prox_market: "5分钟到达夜市",
    prox_escape: "靠近ESCAPE和Entopia",
    about_label: "我们的故事",
    about_title: "跨越<span>国界</span>的风味",
    about_p1: "位于著名的峇都丁宜夜市附近的主要旅游区，D'Feringghi Tandoori House为您带来精致的巴基斯坦、印度、阿拉伯和西方融合美食。",
    about_p2: "10多年来，我们为游客和当地人提供清真、无味精的菜肴，并提供许多素食和无麸质选择。",
    menu_label: "我们的菜单",
    menu_title: "探索我们的<span>完整</span>菜单",
    tab_grill: "🔥 坦都里与烧烤",
    tab_biryani: "🍚 印度香饭与曼迪",
    tab_chicken: "🍗 鸡肉",
    tab_mutton: "🐑 羊肉与牛肉",
    tab_seafood: "🦐 海鲜",
    tab_appetizers: "🥗 开胃菜",
    tab_naan: "🫓 烤饼与面包",
    tab_veg: "🌱 素食",
    tab_rice: "🍚 米饭",
    tab_western: "🍕 西餐",
    tab_egg: "🥚 鸡蛋",
    tab_dessert: "🍨 甜点",
    tab_drinks: "🥤 饮料",
    menu_note: "💡 请允许20分钟的准备时间。除非另有说明，所有菜肴均为中辣。",
    gallery_label: "体验",
    gallery_title: "美食与<span>氛围</span>",
    reviews_label: "感言",
    reviews_title: "宾客<span>评论</span>",
    leave_review: "⭐ 留下谷歌评论",
    catering_label: "活动与餐饮",
    catering_title: "优质<span>餐饮</span>服务",
    catering_desc: "我们为您的所有特殊场合提供优质的餐饮服务。",
    catering_enquire: "💬 在WhatsApp上咨询",
    location_label: "找到我们",
    location_title: "参观<span>D'Feringghi</span>",
    addr_label: "地址",
    phone_label: "电话 / WhatsApp",
    email_label: "电子邮件",
    hours_label: "营业时间",
    parking_label: "停车",
    parking_value: "免费街道和停车场",
    nearby_title: "📌 附近地标",
    hours_daily: "每天: 11:00 AM – 12:00 AM",
    get_directions: "🧭 获取路线",
    wa_us: "💬 WhatsApp我们",
    cta_title: "饿了吗？",
    cta_sub: "加入我们，在槟城最好的海滩享受难忘的用餐体验。",
    cta_wa: "💬 WhatsApp我们",
    footer_desc: "峇都丁宜正宗巴基斯坦、印度、阿拉伯和西餐。清真，无味精，每天营业。",
    footer_nav: "导航",
    footer_contact: "联系",
    mb_reserve: "预订",
    mb_menu: "菜单",
    wa_tooltip: "和我们聊天！"
  },
  ur: {
    nav_about: "ہمارے بارے میں",
    nav_menu: "مینو",
    nav_gallery: "گیلری",
    nav_reviews: "جائزے",
    nav_location: "مقام",
    hero_rating_text: "گوگل ریٹنگ · 1122+ جائزے",
    hero_subtitle: "پاکستانی · ہندوستانی · عربی · ویسٹرن اور باربی کیو · سمندری غذا",
    hero_desc: "پینانگ کے بہترین ساحل پر مستند حلال کھانا۔ ایم ایس جی کے بغیر · بغیر پریزرویٹوز · ویگن کے اختیارات۔",
    hero_cta_reserve: "📅 ٹیبل بک کریں",
    hero_cta_menu: "مینو دیکھیں",
    trust_halal: "حلال سرٹیفائیڈ",
    trust_msg: "ایم ایس جی فری",
    trust_preserv: "کوئی پریزرویٹوز نہیں",
    trust_parking: "مفت پارکنگ",
    trust_vegan: "ویگن آپشنز",
    prox_beach: "باتو فیرینگی بیچ سے 3 منٹ کی پیدل مسافت",
    prox_market: "نائٹ مارکیٹ سے 5 منٹ کی مسافت",
    prox_escape: "ESCAPE اور Entopia کے قریب",
    about_label: "ہماری کہانی",
    about_title: "ذائقے جو <span>سرحدوں</span> کو پار کرتے ہیں",
    about_p1: "مشہور باتو فیرینگی نائٹ مارکیٹ کے قریب سیاحتی پٹی پر واقع ہے۔",
    about_p2: "10 سال سے زیادہ عرصے سے حلال، ایم ایس جی فری اور ویگن آپشنز کے ساتھ خدمت کر رہے ہیں۔",
    menu_label: "ہمارا مینو",
    menu_title: "ہمارا <span>مکمل</span> مینو دریافت کریں",
    tab_grill: "🔥 تندوری اور گرل",
    tab_biryani: "🍚 بریانی اور مندی",
    tab_chicken: "🍗 چکن",
    tab_mutton: "🐑 مٹن اور بیف",
    tab_seafood: "🦐 سمندری غذا",
    tab_appetizers: "🥗 ایپیٹائزرز",
    tab_naan: "🫓 نان اور روٹی",
    tab_veg: "🌱 ویجیٹیرین",
    tab_rice: "🍚 چاول",
    tab_western: "🍕 ویسٹرن",
    tab_egg: "🥚 انڈے",
    tab_dessert: "🍨 میٹھا",
    tab_drinks: "🥤 مشروبات",
    menu_note: "💡 براہ کرم 20 منٹ تیاری کا وقت دیں۔",
    gallery_label: "تجربہ",
    gallery_title: "کھانا اور <span>ماحول</span>",
    reviews_label: "تعریفیں",
    reviews_title: "مہمانوں کے <span>جائزے</span>",
    leave_review: "⭐ گوگل پر ریویو دیں",
    catering_label: "تقریبات اور کیٹرنگ",
    catering_title: "اعلیٰ معیار کی <span>کیٹرنگ</span> سروسز",
    catering_desc: "ہم آپ کی تمام تقریبات کے لیے بہترین کیٹرنگ فراہم کرتے ہیں۔",
    catering_enquire: "💬 واٹس ایپ پر دریافت کریں",
    location_label: "ہمیں تلاش کریں",
    location_title: "ڈی فیرینگی <span>آئیں</span>",
    addr_label: "پتہ",
    phone_label: "فون / واٹس ایپ",
    email_label: "ای میل",
    hours_label: "اوقات کار",
    parking_label: "پارکنگ",
    parking_value: "مفت سٹریٹ اور لاٹ پارکنگ",
    nearby_title: "📌 قریبی مقامات",
    hours_daily: "ہر روز: 11:00 AM – 12:00 AM",
    get_directions: "🧭 ڈائریکشنز حاصل کریں",
    wa_us: "💬 واٹس ایپ",
    cta_title: "کیا آپ بھوکے ہیں؟",
    cta_sub: "پینانگ کے بہترین ساحل پر ہمارے ساتھ شامل ہوں۔",
    cta_wa: "💬 واٹس ایپ",
    footer_desc: "باتو فیرینگی میں مستند پاکستانی، ہندوستانی اور عربی کھانا۔",
    footer_nav: "نیویگیشن",
    footer_contact: "رابطہ",
    mb_reserve: "بک کریں",
    mb_menu: "مینو",
    wa_tooltip: "ہمارے ساتھ بات کریں!"
  },
  fr: {
    nav_about: "À propos",
    nav_menu: "Menu",
    nav_gallery: "Galerie",
    nav_reviews: "Avis",
    nav_location: "Emplacement",
    hero_rating_text: "Note Google · 1122+ Avis",
    hero_subtitle: "Pakistanais · Indien · Arabe · Occidental et BBQ · Fruits de mer",
    hero_desc: "Cuisine halal authentique sur la meilleure plage de Penang. Sans MSG · Sans conservateurs · Options végétaliennes.",
    hero_cta_reserve: "📅 Réserver",
    hero_cta_menu: "Voir le Menu",
    trust_halal: "Certifié Halal",
    trust_msg: "Sans MSG",
    trust_preserv: "Sans Conservateurs",
    trust_parking: "Parking Gratuit",
    trust_vegan: "Options Végétaliennes",
    prox_beach: "À 3 min de la plage de Batu Ferringhi",
    prox_market: "À 5 min du marché nocturne",
    prox_escape: "Près d'ESCAPE et Entopia",
    about_label: "Notre Histoire",
    about_title: "Des Saveurs Qui Traversent <span>Les Frontières</span>",
    about_p1: "Situé sur la principale avenue touristique de Batu Ferringhi, nous offrons une cuisine fusion authentique.",
    about_p2: "Plus de 10 ans au service des touristes et des locaux avec des plats halal, sans MSG et végétaliens.",
    menu_label: "Notre Menu",
    menu_title: "Explorez Notre Menu <span>Complet</span>",
    tab_grill: "🔥 Tandoori et Grill",
    tab_biryani: "🍚 Biryani et Mandi",
    tab_chicken: "🍗 Poulet",
    tab_mutton: "🐑 Mouton et Bœuf",
    tab_seafood: "🦐 Fruits de mer",
    tab_appetizers: "🥗 Entrées",
    tab_naan: "🫓 Naan et Pain",
    tab_veg: "🌱 Végétarien",
    tab_rice: "🍚 Riz",
    tab_western: "🍕 Occidental",
    tab_egg: "🥚 Œufs",
    tab_dessert: "🍨 Desserts",
    tab_drinks: "🥤 Boissons",
    menu_note: "💡 Préparation de 20 min. Tous les plats sont moyennement épicés.",
    gallery_label: "L'Expérience",
    gallery_title: "Nourriture et <span>Ambiance</span>",
    reviews_label: "Témoignages",
    reviews_title: "Avis <span>des Clients</span>",
    leave_review: "⭐ Laisser un avis Google",
    catering_label: "Événements",
    catering_title: "Services de <span>Traiteur</span>",
    catering_desc: "Nous offrons des services de traiteur de qualité pour vos occasions.",
    catering_enquire: "💬 Demande sur WhatsApp",
    location_label: "Nous Trouver",
    location_title: "Visitez <span>D'Feringghi</span>",
    addr_label: "Adresse",
    phone_label: "Téléphone / WhatsApp",
    email_label: "E-mail",
    hours_label: "Heures d'Ouverture",
    parking_label: "Parking",
    parking_value: "Stationnement gratuit",
    nearby_title: "📌 Lieux à proximité",
    hours_daily: "Tous les jours : 11:00 AM – 12:00 AM",
    get_directions: "🧭 Itinéraire",
    wa_us: "💬 WhatsApp",
    cta_title: "VOUS AVEZ FAIM ?",
    cta_sub: "Rejoignez-nous pour un repas inoubliable.",
    cta_wa: "💬 WhatsApp",
    footer_desc: "Cuisine authentique à Batu Ferringhi. Halal, sans MSG.",
    footer_nav: "Navigation",
    footer_contact: "Contact",
    mb_reserve: "Réserver",
    mb_menu: "Menu",
    wa_tooltip: "Discutez avec nous !"
  },
  hi: {
    nav_about: "हमारे बारे में",
    nav_menu: "मेन्यू",
    nav_gallery: "गैलरी",
    nav_reviews: "समीक्षाएं",
    nav_location: "स्थान",
    hero_rating_text: "गूगल रेटिंग · 1122+ समीक्षाएं",
    hero_subtitle: "पाकिस्तानी · भारतीय · अरबी · वेस्टर्न और बीबीक्यू · सीफूड",
    hero_desc: "पेनांग के बेहतरीन समुद्र तट पर प्रामाणिक हलाल भोजन। बिना MSG · बिना प्रिजर्वेटिव · वीगन विकल्प।",
    hero_cta_reserve: "📅 टेबल बुक करें",
    hero_cta_menu: "मेन्यू देखें",
    trust_halal: "हलाल प्रमाणित",
    trust_msg: "MSG मुक्त",
    trust_preserv: "प्रिजर्वेटिव मुक्त",
    trust_parking: "मुफ्त पार्किंग",
    trust_vegan: "वीगन विकल्प",
    prox_beach: "बातू फेरिंगी बीच से 3 मिनट की पैदल दूरी",
    prox_market: "नाइट मार्केट से 5 मिनट की दूरी",
    prox_escape: "ESCAPE और Entopia के पास",
    about_label: "हमारी कहानी",
    about_title: "स्वाद जो <span>सरहदों</span> को पार करते हैं",
    about_p1: "प्रसिद्ध बातू फेरिंगी नाइट मार्केट के पास पर्यटन पट्टी पर स्थित।",
    about_p2: "10 से अधिक वर्षों से हलाल, MSG मुक्त और वीगन विकल्पों के साथ सेवा कर रहे हैं।",
    menu_label: "हमारा मेन्यू",
    menu_title: "हमारा <span>पूरा</span> मेन्यू देखें",
    tab_grill: "🔥 तंदूरी और ग्रिल",
    tab_biryani: "🍚 बिरयानी और मंडी",
    tab_chicken: "🍗 चिकन",
    tab_mutton: "🐑 मटन और बीफ",
    tab_seafood: "🦐 सीफूड",
    tab_appetizers: "🥗 ऐपेटाइज़र",
    tab_naan: "🫓 नान और रोटी",
    tab_veg: "🌱 शाकाहारी",
    tab_rice: "🍚 चावल",
    tab_western: "🍕 वेस्टर्न",
    tab_egg: "🥚 अंडे",
    tab_dessert: "🍨 मिठाई",
    tab_drinks: "🥤 पेय पदार्थ",
    menu_note: "💡 कृपया 20 मिनट तैयारी का समय दें।",
    gallery_label: "अनुभव",
    gallery_title: "भोजन और <span>माहौल</span>",
    reviews_label: "प्रशंसापत्र",
    reviews_title: "अतिथि <span>समीक्षाएं</span>",
    leave_review: "⭐ गूगल समीक्षा दें",
    catering_label: "कार्यक्रम और कैटरिंग",
    catering_title: "गुणवत्ता <span>कैटरिंग</span> सेवाएं",
    catering_desc: "हम आपके सभी विशेष अवसरों के लिए बेहतरीन कैटरिंग प्रदान करते हैं।",
    catering_enquire: "💬 WhatsApp पर पूछताछ करें",
    location_label: "हमें खोजें",
    location_title: "डी फेरिंगी <span>आयें</span>",
    addr_label: "पता",
    phone_label: "फोन / WhatsApp",
    email_label: "ईमेल",
    hours_label: "खुलने का समय",
    parking_label: "पार्किंग",
    parking_value: "मुफ्त स्ट्रीट और लॉट पार्किंग",
    nearby_title: "📌 आस-पास के स्थल",
    hours_daily: "प्रतिदिन: 11:00 AM – 12:00 AM",
    get_directions: "🧭 दिशा-निर्देश प्राप्त करें",
    wa_us: "💬 WhatsApp",
    cta_title: "क्या आपको भूख लगी है?",
    cta_sub: "पेनांग के सबसे अच्छे समुद्र तट पर हमारे साथ शामिल हों।",
    cta_wa: "💬 WhatsApp",
    footer_desc: "बातू फेरिंगी में प्रामाणिक पाकिस्तानी, भारतीय और अरबी भोजन।",
    footer_nav: "नेविगेशन",
    footer_contact: "संपर्क",
    mb_reserve: "बुक करें",
    mb_menu: "मेन्यू",
    wa_tooltip: "हमसे चैट करें!"
  }
};

let currentLang = 'en';
const langOrder = ['en', 'my', 'zh', 'ar', 'ur', 'fr', 'hi'];
const langLabels = { en: 'EN', my: 'MY', zh: 'ZH', ar: 'AR', ur: 'UR', fr: 'FR', hi: 'HI' };

// Global Functions for inline onclick handlers
window.setLang = function(lang) {
  currentLang = lang;
  localStorage.setItem('dferingghi_lang', lang);
  applyLanguage(lang);
  
  const splash = document.getElementById('lang-splash');
  if (splash && !splash.classList.contains('hidden')) {
    splash.classList.add('hidden');
    setTimeout(() => {
      splash.style.display = 'none';
      const mobileBar = document.getElementById('mobile-bar');
      if (mobileBar) mobileBar.style.display = 'flex';
    }, 800);
  }
};

window.toggleLang = function() {
  const currentIndex = langOrder.indexOf(currentLang);
  const nextIndex = (currentIndex + 1) % langOrder.length;
  window.setLang(langOrder[nextIndex]);
};

window.toggleMenu = function() {
  const navLinks = document.getElementById('nav-links');
  const hamburger = document.getElementById('hamburger');
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
};

function applyLanguage(lang) {
  const toggleBtn = document.getElementById('nav-lang-toggle');
  if (toggleBtn) toggleBtn.innerText = langLabels[lang];
  
  const dict = translations[lang];
  if (dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });
  }

  if (lang === 'ar' || lang === 'ur') {
    document.body.dir = 'rtl';
    document.body.classList.add('lang-ar');
  } else {
    document.body.dir = 'ltr';
    document.body.classList.remove('lang-ar');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize i18n English dictionary with default HTML texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    translations.en[el.getAttribute('data-i18n')] = el.innerHTML;
  });

  // 2. Handle Splash Screen & Saved Language
  const savedLang = localStorage.getItem('dferingghi_lang');
  const splash = document.getElementById('lang-splash');
  const mobileBar = document.getElementById('mobile-bar');
  
  if (mobileBar) {
    // Hide mobile bar initially if splash is visible
    mobileBar.style.display = 'none';
  }

  if (savedLang) {
    if (splash) splash.style.display = 'none';
    currentLang = savedLang;
    applyLanguage(currentLang);
    if (mobileBar) mobileBar.style.display = 'flex';
  }

  // 3. Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 4. Close mobile menu on link click
  document.querySelectorAll('#nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('nav-links').classList.remove('open');
      document.getElementById('hamburger').classList.remove('active');
    });
  });

  // 5. Menu Jump Nav as Tabs
  const jumpBtns = document.querySelectorAll('.menu-jump-btn');
  const menuCategories = document.querySelectorAll('.menu-category');

  // Set the first category as active by default if none is
  if (menuCategories.length > 0) {
    menuCategories[0].classList.add('active');
  }

  jumpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-cat');
      
      // Update buttons
      jumpBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update categories
      menuCategories.forEach(cat => {
        if (cat.id === targetId) {
          cat.classList.add('active');
        } else {
          cat.classList.remove('active');
        }
      });
      
      // Ensure active button scrolls into view within the nav
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  // 6. Scroll Reveal animation
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // 7. Gallery Lightbox
  const galleryImgs = document.querySelectorAll('.gallery-item img');
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<img>';
  document.body.appendChild(lightbox);
  
  const lightboxImg = lightbox.querySelector('img');

  galleryImgs.forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
    });
  });

  // Close lightbox on click outside
  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
      lightbox.classList.remove('active');
    }
  });

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
    }
  });

  // 8. Smooth Scrolling for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // Skip if only '#' or targeting specific non-scroll elements
      if (href !== '#') {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 70; // Adjust for fixed navbar height
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 9. Particle Animation (Live 3D feel)
  function initParticles() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    // Add particle container
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    heroSection.appendChild(particlesContainer);
    
    // Create particles
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'ember-particle';
      
      // Randomize properties
      const size = Math.random() * 4 + 2; // 2px to 6px
      const left = Math.random() * 100; // 0% to 100%
      const animationDuration = Math.random() * 10 + 10; // 10s to 20s
      const animationDelay = Math.random() * 10; // 0s to 10s
      const opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.bottom = `-10px`;
      particle.style.animationDuration = `${animationDuration}s`;
      particle.style.animationDelay = `${animationDelay}s`;
      particle.style.opacity = opacity;
      
      particlesContainer.appendChild(particle);
    }
  }
  
  initParticles();

});

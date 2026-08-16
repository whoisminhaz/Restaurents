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
  }
};

let currentLang = 'en';
const langOrder = ['en', 'my', 'ar'];
const langLabels = { en: 'EN', my: 'MY', ar: 'AR' };

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

  if (lang === 'ar') {
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

});




<div id="lang-splash">
  <div className="splash-logo">MOSTY KITCHEN</div>
  <div className="splash-tagline">Western &amp; Shellout · Kuala Kangsar</div>
  <div className="splash-divider"></div>
  <div className="splash-prompt" id="splash-prompt">Choose Your Language</div>
  <div className="lang-btns">
    <button className="lang-btn" id="btn-en" onclick="setLang('en')">🇬🇧 English</button>
    <button className="lang-btn" id="btn-my" onclick="setLang('my')">🇲🇾 Bahasa Melayu</button>
  </div>
</div>


<nav id="navbar">
  <a href="#hero" className="nav-logo">MOSTY</a>
  <ul className="nav-links" id="nav-links">
    <li><a href="#about" data-i18n="nav_about">About</a></li>
    <li><a href="#menu" data-i18n="nav_menu">Menu</a></li>
    <li><a href="#gallery" data-i18n="nav_gallery">Gallery</a></li>
    <li><a href="#reviews" data-i18n="nav_reviews">Reviews</a></li>
    <li><a href="#location" data-i18n="nav_location">Location</a></li>
  </ul>
  <button className="nav-lang-btn" id="nav-lang-toggle" onclick="toggleLang()">MY | EN</button>
  <div className="hamburger" id="hamburger" onclick="toggleMenu()">
    <span></span><span></span><span></span>
  </div>
</nav>


<section id="hero">
  <div className="hero-bg"></div>
  <div className="hero-overlay"></div>
  <div className="hero-content">
    <div className="hero-badge" data-i18n="hero_badge">★ Kuala Kangsar's Finest ★</div>
    <h1 className="hero-title">MOSTY<br />KITCHEN</h1>
    <p className="hero-subtitle" data-i18n="hero_subtitle">Western &amp; Shellout · Kuala Kangsar, Perak</p>
    <p className="hero-desc" data-i18n="hero_desc">Where bold flavours meet the royal town. Grilled to perfection. Shellout to remember. Open for dinner – every night but Monday.</p>
    <div className="hero-cta">
      <a href="#menu" className="btn-gold" data-i18n="hero_cta1">Explore Menu</a>
      <a href="https://www.foodpanda.my" target="_blank" className="btn-outline" data-i18n="hero_cta2">Order on Foodpanda</a>
    </div>
  </div>
  <div className="hero-scroll"><span data-i18n="scroll">Scroll</span></div>
</section>


<div id="stats">
  <div className="stat-item reveal">
    <div className="stat-number">4.7★</div>
    <div className="stat-label" data-i18n="stat1">Foodpanda Rating</div>
  </div>
  <div className="stat-item reveal reveal-delay-1">
    <div className="stat-number">30+</div>
    <div className="stat-label" data-i18n="stat2">Menu Items</div>
  </div>
  <div className="stat-item reveal reveal-delay-2">
    <div className="stat-number">2000+</div>
    <div className="stat-label" data-i18n="stat3">Happy Customers</div>
  </div>
  <div className="stat-item reveal reveal-delay-3">
    <div className="stat-number">6+</div>
    <div className="stat-label" data-i18n="stat4">Menu Categories</div>
  </div>
</div>


<section id="about">
  <div className="about-grid">
    <div className="about-img-wrap reveal">
      <img src="images/restaurant-ambiance.png" alt="Mosty Kitchen restaurant interior ambiance" className="about-img" loading="lazy" />
      <div className="about-img-accent"></div>
    </div>
    <div className="reveal reveal-delay-1">
      <span className="section-label" data-i18n="about_label">Our Story</span>
      <h2 className="section-title" data-i18n="about_title">Bold Flavours in the <span>Royal Town</span></h2>
      <div className="section-line"></div>
      <p  data-i18n="about_p1">
        Mosty Kitchen is Kuala Kangsar's most talked-about late-night dining destination. Born from a passion for bold, unapologetic flavours, we serve Western grills, dramatic shellout seafood feasts, and hearty Malaysian classics — all under one roof.
      </p>
      <p  data-i18n="about_p2">
        Nestled in the heart of Perak's royal town — just minutes from the iconic Ubudiah Mosque and Istana Kenangan — we're the spot where families, food bloggers, and late-night crews come together. Always packed. Always alive. 🖤
      </p>
      <div className="about-badges">
        <span className="badge" data-i18n="badge1">✦ Halal Certified</span>
        <span className="badge" data-i18n="badge2">✦ Malay Owned</span>
        <span className="badge" data-i18n="badge3">✦ Dine-in &amp; Delivery</span>
        <span className="badge" data-i18n="badge4">✦ Food Blogger Favourite</span>
        <span className="badge" data-i18n="badge5">✦ Open Late Nights</span>
      </div>
    </div>
  </div>
</section>


<section id="menu">
  <div >
    <span className="section-label" data-i18n="menu_label">What We Serve</span>
    <h2 className="section-title reveal" data-i18n="menu_title">Our <span>Signature</span> Menu</h2>
    <div className="section-line"></div>
    <div className="menu-tabs" id="menu-tabs">
      <button className="menu-tab active" data-tab="western" data-i18n="tab_western">Western</button>
      <button className="menu-tab" data-tab="shellout" data-i18n="tab_shellout">Shell Out</button>
      <button className="menu-tab" data-tab="pasta" data-i18n="tab_pasta">Pasta Mania</button>
      <button className="menu-tab" data-tab="mozacheese" data-i18n="tab_moza">Mozacheese</button>
      <button className="menu-tab" data-tab="nasigoreng" data-i18n="tab_nasi">Nasi Goreng</button>
      <button className="menu-tab" data-tab="nasiputih" data-i18n="tab_nasiputih">Set Nasi Putih</button>
      <button className="menu-tab" data-tab="malaysian" data-i18n="tab_malaysian">Malaysian</button>
      <button className="menu-tab" data-tab="sup" data-i18n="tab_sup">Sup</button>
    </div>

    
    <div className="menu-panel active" id="panel-western">
      <div className="menu-card reveal"><img src="images/western-lamb.png" alt="Grilled Lamb Chop" className="menu-card-img" /><div className="menu-card-badge" data-i18n="bestseller">Best Seller</div><div className="menu-card-body"><div className="menu-card-name">Grilled Lamb Chop</div><div className="menu-card-desc" data-i18n="lamb_desc">Tender grilled lamb with house sauce, served with sides</div><div className="menu-card-price">RM 41.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/restaurant-ambiance.png" alt="Grilled Chicken Chop" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Grilled Chicken Chop</div><div className="menu-card-desc" data-i18n="grill_chk_desc">Juicy grilled chicken with pepper sauce &amp; sides</div><div className="menu-card-price">RM 29.90</div></div></div>
      <div className="menu-card reveal reveal-delay-2"><img src="images/western-lamb.png" alt="Fried Chicken Chop" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Fried Chicken Chop</div><div className="menu-card-desc" data-i18n="fried_chk_desc">Crispy golden fried chicken chop with sauce &amp; sides</div><div className="menu-card-price">RM 26.90</div></div></div>
      <div className="menu-card reveal reveal-delay-3"><img src="images/western-lamb.png" alt="Combo Grilled" className="menu-card-img" /><div className="menu-card-badge" data-i18n="popular">Popular</div><div className="menu-card-body"><div className="menu-card-name">Combo Grilled</div><div className="menu-card-desc" data-i18n="combo_desc">Lamb &amp; chicken combo platter – the ultimate feast</div><div className="menu-card-price">RM 47.90</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-shellout">
      <div className="menu-card reveal"><img src="images/hero-shellout.png" alt="Shell Out Adinda" className="menu-card-img" /><div className="menu-card-badge" data-i18n="signature">Signature</div><div className="menu-card-body"><div className="menu-card-name">Shell Out Adinda</div><div className="menu-card-desc" data-i18n="shell_desc">Epic shellout for 2–3 pax. Prawns, mussels, clams, corn, sausage &amp; 2 cups rice</div><div className="menu-card-price">RM 67.00</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-pasta">
      <div className="menu-card reveal"><img src="images/pasta-carbonara.png" alt="Carbonara" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Carbonara</div><div className="menu-card-desc" data-i18n="carb_desc">Creamy classic carbonara with bacon &amp; parmesan</div><div className="menu-card-price">RM 23.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/pasta-carbonara.png" alt="Aglio Olio" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Aglio Olio</div><div className="menu-card-desc" data-i18n="aglio_desc">Classic garlic olive oil pasta with herbs</div><div className="menu-card-price">RM 23.90</div></div></div>
      <div className="menu-card reveal reveal-delay-2"><img src="images/pasta-carbonara.png" alt="Beef Bolognese" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Beef Bolognese</div><div className="menu-card-desc" data-i18n="bolo_desc">Rich slow-cooked beef bolognese sauce</div><div className="menu-card-price">RM 23.90</div></div></div>
      <div className="menu-card reveal reveal-delay-3"><img src="images/pasta-carbonara.png" alt="Seafood Aglio Olio" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Seafood Aglio Olio</div><div className="menu-card-desc" data-i18n="sfaglio_desc">Garlic pasta loaded with fresh seafood</div><div className="menu-card-price">RM 33.90</div></div></div>
      <div className="menu-card reveal"><img src="images/pasta-carbonara.png" alt="Creamy Tomyam Seafood" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Creamy Tomyam Seafood</div><div className="menu-card-desc" data-i18n="tomyam_desc">Spicy creamy tomyam pasta with seafood</div><div className="menu-card-price">RM 33.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/pasta-carbonara.png" alt="Chicken Crispy Carbonara" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Chicken Crispy Carbonara</div><div className="menu-card-desc" data-i18n="crkcarb_desc">Carbonara topped with crispy chicken bits</div><div className="menu-card-price">RM 27.90</div></div></div>
      <div className="menu-card reveal reveal-delay-2"><img src="images/pasta-carbonara.png" alt="Napolitana" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Napolitana</div><div className="menu-card-desc" data-i18n="napo_desc">Classic tomato-based Napolitana pasta</div><div className="menu-card-price">RM 27.90</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-mozacheese">
      <div className="menu-card reveal"><img src="images/mozacheese-korean.png" alt="Ramen Chicken Popcorn" className="menu-card-img" /><div className="menu-card-badge" data-i18n="trending">Trending</div><div className="menu-card-body"><div className="menu-card-name">Ramen Chicken Popcorn</div><div className="menu-card-desc" data-i18n="rpop_desc">Korean-style popcorn chicken with ramen &amp; mozz cheese pull</div><div className="menu-card-price">RM 37.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/mozacheese-korean.png" alt="Korean Chicken" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Korean Chicken</div><div className="menu-card-desc" data-i18n="kchk_desc">Korean fried chicken with mozzarella cheese (no ramen)</div><div className="menu-card-price">RM 39.00</div></div></div>
      <div className="menu-card reveal reveal-delay-2"><img src="images/mozacheese-korean.png" alt="Ramen Meatball Chicken Wing" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Ramen Meatball Chicken Wing</div><div className="menu-card-desc" data-i18n="rmcw_desc">Ultimate combo: ramen, meatball &amp; chicken wings in mozz sauce</div><div className="menu-card-price">RM 54.90</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-nasigoreng">
      <div className="menu-card reveal"><img src="images/nasi-goreng.png" alt="Nasi Goreng Sotong" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Nasi Goreng Sotong</div><div className="menu-card-desc" data-i18n="ngsotong_desc">Wok-fired squid fried rice</div><div className="menu-card-price">RM 22.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/nasi-goreng.png" alt="Nasi Goreng Udang" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Nasi Goreng Udang</div><div className="menu-card-desc" data-i18n="ngudang_desc">Wok-fired prawn fried rice</div><div className="menu-card-price">RM 22.90</div></div></div>
      <div className="menu-card reveal reveal-delay-2"><img src="images/nasi-goreng.png" alt="Nasi Goreng Daging" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Nasi Goreng Daging</div><div className="menu-card-desc" data-i18n="ngdaging_desc">Wok-fired beef fried rice</div><div className="menu-card-price">RM 13.90</div></div></div>
      <div className="menu-card reveal reveal-delay-3"><img src="images/nasi-goreng.png" alt="Nasi Goreng Kampung" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Nasi Goreng Kampung</div><div className="menu-card-desc" data-i18n="ngkampung_desc">Traditional village-style fried rice</div><div className="menu-card-price">RM 13.90</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-nasiputih">
      <div className="menu-card reveal"><img src="images/nasi-goreng.png" alt="Set Daging Merah" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Set Daging Merah</div><div className="menu-card-desc" data-i18n="sdm_desc">Steamed rice with spicy red beef</div><div className="menu-card-price">RM 15.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/nasi-goreng.png" alt="Set Nasi Udang Special" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Set Nasi Udang Special</div><div className="menu-card-desc" data-i18n="snus_desc">Rice with special prawn dish</div><div className="menu-card-price">RM 22.90</div></div></div>
      <div className="menu-card reveal reveal-delay-2"><img src="images/nasi-goreng.png" alt="Set Ayam Kunyit" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Set Ayam Kunyit</div><div className="menu-card-desc" data-i18n="sak_desc">Rice with turmeric chicken</div><div className="menu-card-price">RM 13.90</div></div></div>
      <div className="menu-card reveal reveal-delay-3"><img src="images/nasi-goreng.png" alt="Set Paprik Ayam" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Set Paprik Ayam</div><div className="menu-card-desc" data-i18n="spa_desc">Rice with stir-fried chicken paprik</div><div className="menu-card-price">RM 15.90</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-malaysian">
      <div className="menu-card reveal"><img src="images/nasi-goreng.png" alt="Ikan Siakap 3 Rasa" className="menu-card-img" /><div className="menu-card-badge" data-i18n="special">Special</div><div className="menu-card-body"><div className="menu-card-name">Ikan Siakap 3 Rasa</div><div className="menu-card-desc" data-i18n="ikan_desc">Whole sea bass in three-flavour sauce — sweet, sour &amp; spicy</div><div className="menu-card-price">RM 63.00</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/nasi-goreng.png" alt="Kuey Teow Goreng Special" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Kuey Teow Goreng Special</div><div className="menu-card-desc" data-i18n="kt_desc">Wok-fired flat rice noodles with special mix</div><div className="menu-card-price">RM 22.90</div></div></div>
    </div>

    
    <div className="menu-panel" id="panel-sup">
      <div className="menu-card reveal"><img src="images/restaurant-ambiance.png" alt="Sup Premium" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name" data-i18n="sup_premium">Sup Premium</div><div className="menu-card-desc" data-i18n="supP_desc">Rich, hearty premium bone soup</div><div className="menu-card-price">RM 26.90</div></div></div>
      <div className="menu-card reveal reveal-delay-1"><img src="images/restaurant-ambiance.png" alt="Sup Madani" className="menu-card-img" /><div className="menu-card-body"><div className="menu-card-name">Sup Madani</div><div className="menu-card-desc" data-i18n="supM_desc">Classic comforting Madani soup</div><div className="menu-card-price">RM 18.00</div></div></div>
    </div>
  </div>
</section>


<section id="gallery">
  <div >
    <span className="section-label" data-i18n="gallery_label">Food &amp; Vibes</span>
    <h2 className="section-title reveal" data-i18n="gallery_title">The <span>Experience</span></h2>
    <div className="section-line"></div>
    <div className="gallery-grid">
      <div className="gallery-item reveal"><img src="images/hero-shellout.png" alt="Shell Out feast at Mosty Kitchen" /><div className="overlay"></div></div>
      <div className="gallery-item reveal reveal-delay-1"><img src="images/western-lamb.png" alt="Grilled Lamb Chop" /><div className="overlay"></div></div>
      <div className="gallery-item reveal reveal-delay-2"><img src="images/mozacheese-korean.png" alt="Korean Mozacheese set" /><div className="overlay"></div></div>
      <div className="gallery-item reveal reveal-delay-1"><img src="images/pasta-carbonara.png" alt="Creamy Carbonara pasta" /><div className="overlay"></div></div>
      <div className="gallery-item reveal reveal-delay-2"><img src="images/nasi-goreng.png" alt="Nasi Goreng Udang" /><div className="overlay"></div></div>
    </div>
  </div>
</section>


<section id="reviews">
  <div >
    <span className="section-label" data-i18n="reviews_label">What They Say</span>
    <h2 className="section-title reveal" data-i18n="reviews_title">Guest <span>Reviews</span></h2>
    <div className="section-line"></div>
    <div className="reviews-grid">
      <div className="review-card reveal">
        <div className="quote-icon">"</div>
        <div className="review-stars">★★★★☆</div>
        <p className="review-text">"Quite surprised to see the large crowd. Even when we were about to leave at 10pm, people were still coming in. Shellout for 6 pax only cost RM130 — definitely a steal."</p>
        <div className="review-author">Sazali M Salleh</div>
        <div className="review-platform">Google Review</div>
      </div>
      <div className="review-card reveal reveal-delay-1">
        <div className="quote-icon">"</div>
        <div className="review-stars">★★★★★</div>
        <p className="review-text">"Everything that we have tried was absolutely amazing. Great staff, wonderful atmosphere. Will definitely be coming back again and again!"</p>
        <div className="review-author">Asyraf Basyir</div>
        <div className="review-platform">Google Review</div>
      </div>
      <div className="review-card reveal reveal-delay-2">
        <div className="quote-icon">"</div>
        <div className="review-stars">★★★★★</div>
        <p className="review-text">"Love with the meals. Lamb best... Terrrrbaikkk!! Wajib datang kalau kat Kuala Kangsar. Harga pun berbaloi!"</p>
        <div className="review-author">Local Food Lover</div>
        <div className="review-platform">Facebook Review</div>
      </div>
      <div className="review-card reveal">
        <div className="quote-icon">"</div>
        <div className="review-stars">★★★★★</div>
        <p className="review-text">"Makanan sedap.... suasana menarik, kedai bersih. Staffs friendly. Highly recommended untuk makan malam bersama keluarga!"</p>
        <div className="review-author">Pelanggan Setia</div>
        <div className="review-platform">Google Review</div>
      </div>
      <div className="review-card reveal reveal-delay-1">
        <div className="quote-icon">"</div>
        <div className="review-stars">★★★★★</div>
        <p className="review-text">"Shellout sedap... Wajib cuba! Portion besar, harga reasonable. Best makan ramai-ramai. Atmosphere happening sangat!"</p>
        <div className="review-author">TikTok Food Blogger</div>
        <div className="review-platform">TikTok Review</div>
      </div>
      <div className="review-card reveal reveal-delay-2">
        <div className="quote-icon">"</div>
        <div className="review-stars">★★★★☆</div>
        <p className="review-text">"Great food and affordable price! The pasta and grilled lamb chop are must-tries. Cozy ambiance for family dinner. Highly recommended!"</p>
        <div className="review-author">Foodpanda Customer</div>
        <div className="review-platform">Foodpanda 4.7★</div>
      </div>
    </div>
  </div>
</section>


<section id="location">
  <div >
    <span className="section-label" data-i18n="location_label">Find Us</span>
    <h2 className="section-title reveal" data-i18n="location_title">Visit <span>Mosty Kitchen</span></h2>
    <div className="section-line"></div>
    <div className="location-grid">
      <div className="reveal">
        <ul className="info-list">
          <li className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <div className="info-label" data-i18n="addr_label">Address</div>
              <div className="info-value">5E, Jalan Daeng Selili, Kampung Penaga,<br />33000 Kuala Kangsar, Perak</div>
            </div>
          </li>
          <li className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <div className="info-label" data-i18n="phone_label">Phone</div>
              <div className="info-value"><a href="tel:+601126118673">+60 11-2611 8673</a></div>
            </div>
          </li>
          <li className="info-item">
            <span className="info-icon">✉️</span>
            <div>
              <div className="info-label" data-i18n="email_label">Email</div>
              <div className="info-value"><a href="mailto:mostykitchen@gmail.com">mostykitchen@gmail.com</a></div>
            </div>
          </li>
          <li className="info-item">
            <span className="info-icon">🕐</span>
            <div>
              <div className="info-label" data-i18n="hours_label">Opening Hours</div>
              <div className="info-value">
                <div className="hours-row closed"><span data-i18n="monday">Monday</span><span data-i18n="closed">Closed</span></div>
                <div className="hours-row open"><span data-i18n="tues_sun">Tuesday – Sunday</span><span className="hours-time">4:00 PM – 11:30 PM</span></div>
              </div>
            </div>
          </li>
          <li className="info-item">
            <span className="info-icon">🛵</span>
            <div>
              <div className="info-label" data-i18n="delivery_label">Delivery</div>
              <div className="info-value"><a href="https://www.foodpanda.my" target="_blank" >Order via Foodpanda ★ 4.7</a></div>
            </div>
          </li>
        </ul>
      </div>
      <div className="reveal reveal-delay-1">
        <iframe className="map-embed" title="Mosty Kitchen Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.0!2d100.9377!3d4.7739!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31caad0b0b0b0b0b%3A0x0!2sMosty+Kitchen%2C+Kuala+Kangsar!5e0!3m2!1sen!2smy!4v1"
          allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <p  data-i18n="kk_note">📍 Located in Kuala Kangsar – Perak's Royal Town, just 25km from Ipoh</p>
      </div>
    </div>
  </div>
</section>


<section id="order-cta">
  <h2 className="cta-title" data-i18n="cta_title">READY TO DIG IN?</h2>
  <p className="cta-sub" data-i18n="cta_sub">Come hungry. Leave happy. Reserve a table or order online — we've got you covered.</p>
  <div className="cta-btns">
    <a href="tel:+601126118673" className="btn-gold" data-i18n="cta_call">📞 Call to Reserve</a>
    <a href="https://www.foodpanda.my" target="_blank" className="btn-outline" data-i18n="cta_food">🛵 Order on Foodpanda</a>
    <a href="https://wa.me/601126118673" target="_blank" className="btn-outline" data-i18n="cta_wa">💬 WhatsApp Us</a>
  </div>
</section>


<section id="social">
  <div >
    <span className="section-label" data-i18n="social_label">Follow Us</span>
    <h2 className="section-title reveal" data-i18n="social_title">Stay <span>Connected</span></h2>
    <div className="section-line" ></div>
    <p  data-i18n="social_desc">Follow our journey on social media for daily specials, behind-the-scenes, and more 🖤</p>
    <div className="social-links">
      <a href="https://www.facebook.com/mostykitchen" target="_blank" className="social-link"><span className="social-icon">📘</span><span>Facebook <span >Follow Us</span></span></a>
      <a href="https://www.tiktok.com/@mostykitchen" target="_blank" className="social-link"><span className="social-icon">🎵</span><span>TikTok <span >@mostykitchen</span></span></a>
      <a href="https://www.foodpanda.my" target="_blank" className="social-link"><span className="social-icon">🐼</span><span>Foodpanda <span >★ 4.7</span></span></a>
      <a href="mailto:mostykitchen@gmail.com" className="social-link"><span className="social-icon">✉️</span><span>Email Us</span></a>
    </div>
  </div>
</section>


<footer>
  <div className="footer-grid">
    <div>
      <div className="footer-logo">MOSTY KITCHEN</div>
      <p className="footer-desc" data-i18n="footer_desc">Western dan Shellout terbaik di Kuala Kangsar, Perak. Halal. Malay-owned. Open for dinner Tuesday to Sunday. 🖤</p>
    </div>
    <div>
      <div className="footer-heading" data-i18n="footer_explore">Explore</div>
      <ul className="footer-links">
        <li><a href="#about" data-i18n="nav_about">About Us</a></li>
        <li><a href="#menu" data-i18n="nav_menu">Menu</a></li>
        <li><a href="#gallery" data-i18n="nav_gallery">Gallery</a></li>
        <li><a href="#reviews" data-i18n="nav_reviews">Reviews</a></li>
        <li><a href="#location" data-i18n="nav_location">Location</a></li>
      </ul>
    </div>
    <div>
      <div className="footer-heading" data-i18n="footer_contact">Contact</div>
      <ul className="footer-links">
        <li><a href="tel:+601126118673">+60 11-2611 8673</a></li>
        <li><a href="mailto:mostykitchen@gmail.com">mostykitchen@gmail.com</a></li>
        <li><a href="https://wa.me/601126118673" target="_blank">WhatsApp</a></li>
        <li><a href="https://www.facebook.com/mostykitchen" target="_blank">Facebook</a></li>
        <li><a href="https://www.tiktok.com/@mostykitchen" target="_blank">TikTok</a></li>
      </ul>
    </div>
  </div>
  <div className="footer-bottom">
    <div className="footer-copy" data-i18n="footer_copy">© 2025 Mosty Kitchen. All rights reserved. · 5E, Jalan Daeng Selili, Kuala Kangsar, Perak</div>
    <div className="halal-badge"><div className="halal-circle">HALAL</div><span data-i18n="halal_text">Certified Halal · Malay Owned</span></div>
  </div>
</footer>


<a href="https://wa.me/601126118673" target="_blank" rel="noopener noreferrer" className="wa-fab" aria-label="Chat on WhatsApp">
  <span className="wa-fab-tooltip" data-i18n="wa_tooltip">Chat with us!</span>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
</a>

<script src="script.js"></script>

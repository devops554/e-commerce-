// 📁 app/grocery-delivery/[district]/page.tsx
// This single file auto-generates SEO pages for all 38 Bihar districts!

import type { Metadata } from 'next';

// ✅ All 38 Bihar Districts Data
const districts = [
  { slug: 'patna', name: 'Patna', hindi: 'पटना', population: '20 lakh+', type: 'Capital City' },
  { slug: 'muzaffarpur', name: 'Muzaffarpur', hindi: 'मुजफ्फरपुर', population: '12 lakh+', type: 'Major City' },
  { slug: 'gaya', name: 'Gaya', hindi: 'गया', population: '10 lakh+', type: 'Major City' },
  { slug: 'bhagalpur', name: 'Bhagalpur', hindi: 'भागलपुर', population: '8 lakh+', type: 'Major City' },
  { slug: 'darbhanga', name: 'Darbhanga', hindi: 'दरभंगा', population: '9 lakh+', type: 'Major City' },
  { slug: 'purnia', name: 'Purnia', hindi: 'पूर्णिया', population: '7 lakh+', type: 'Major City' },
  { slug: 'araria', name: 'Araria', hindi: 'अररिया', population: '5 lakh+', type: 'District' },
  { slug: 'begusarai', name: 'Begusarai', hindi: 'बेगूसराय', population: '6 lakh+', type: 'District' },
  { slug: 'madhubani', name: 'Madhubani', hindi: 'मधुबनी', population: '7 lakh+', type: 'District' },
  { slug: 'samastipur', name: 'Samastipur', hindi: 'समस्तीपुर', population: '6 lakh+', type: 'District' },
  { slug: 'sitamarhi', name: 'Sitamarhi', hindi: 'सीतामढ़ी', population: '6 lakh+', type: 'District' },
  { slug: 'siwan', name: 'Siwan', hindi: 'सीवान', population: '5 lakh+', type: 'District' },
  { slug: 'gopalganj', name: 'Gopalganj', hindi: 'गोपालगंज', population: '4 lakh+', type: 'District' },
  { slug: 'saran', name: 'Saran', hindi: 'सारण', population: '6 lakh+', type: 'District' },
  { slug: 'vaishali', name: 'Vaishali', hindi: 'वैशाली', population: '6 lakh+', type: 'District' },
  { slug: 'nalanda', name: 'Nalanda', hindi: 'नालंदा', population: '6 lakh+', type: 'District' },
  { slug: 'nawada', name: 'Nawada', hindi: 'नवादा', population: '4 lakh+', type: 'District' },
  { slug: 'aurangabad', name: 'Aurangabad', hindi: 'औरंगाबाद', population: '5 lakh+', type: 'District' },
  { slug: 'rohtas', name: 'Rohtas', hindi: 'रोहतास', population: '5 lakh+', type: 'District' },
  { slug: 'buxar', name: 'Buxar', hindi: 'बक्सर', population: '4 lakh+', type: 'District' },
  { slug: 'kaimur', name: 'Kaimur', hindi: 'कैमूर', population: '3 lakh+', type: 'District' },
  { slug: 'bhojpur', name: 'Bhojpur', hindi: 'भोजपुर', population: '5 lakh+', type: 'District' },
  { slug: 'motihari', name: 'East Champaran', hindi: 'मोतिहारी', population: '7 lakh+', type: 'District' },
  { slug: 'bettiah', name: 'West Champaran', hindi: 'बेतिया', population: '6 lakh+', type: 'District' },
  { slug: 'madhepura', name: 'Madhepura', hindi: 'मधेपुरा', population: '4 lakh+', type: 'District' },
  { slug: 'saharsa', name: 'Saharsa', hindi: 'सहरसा', population: '4 lakh+', type: 'District' },
  { slug: 'supaul', name: 'Supaul', hindi: 'सुपौल', population: '4 lakh+', type: 'District' },
  { slug: 'khagaria', name: 'Khagaria', hindi: 'खगड़िया', population: '3 lakh+', type: 'District' },
  { slug: 'katihar', name: 'Katihar', hindi: 'कटिहार', population: '5 lakh+', type: 'District' },
  { slug: 'kishanganj', name: 'Kishanganj', hindi: 'किशनगंज', population: '3 lakh+', type: 'District' },
  { slug: 'munger', name: 'Munger', hindi: 'मुंगेर', population: '4 lakh+', type: 'District' },
  { slug: 'lakhisarai', name: 'Lakhisarai', hindi: 'लखीसराय', population: '2 lakh+', type: 'District' },
  { slug: 'sheikhpura', name: 'Sheikhpura', hindi: 'शेखपुरा', population: '1.5 lakh+', type: 'District' },
  { slug: 'jamui', name: 'Jamui', hindi: 'जमुई', population: '3 lakh+', type: 'District' },
  { slug: 'banka', name: 'Banka', hindi: 'बांका', population: '3 lakh+', type: 'District' },
  { slug: 'jehanabad', name: 'Jehanabad', hindi: 'जहानाबाद', population: '2 lakh+', type: 'District' },
  { slug: 'arwal', name: 'Arwal', hindi: 'अरवल', population: '1.5 lakh+', type: 'District' },
  { slug: 'sheohar', name: 'Sheohar', hindi: 'शिवहर', population: '1.5 lakh+', type: 'District' },
];

export async function generateStaticParams() {
  return districts.map((d) => ({ district: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { district: string };
}): Promise<Metadata> {
  const district = districts.find((d) => d.slug === params.district);
  if (!district) return {};

  return {
    title: `Grocery Delivery in ${district.name} | Kiranase - Bazaar se Sasta`,
    description: `Order groceries online in ${district.name} (${district.hindi}) at prices cheaper than local bazaar. 7000+ products delivered in 30 minutes. Free delivery above ₹299. Best online kirana store in ${district.name}, Bihar.`,
    keywords: [
      `grocery delivery ${district.name}`,
      `online grocery ${district.name}`,
      `kirana delivery ${district.name}`,
      `${district.hindi} किराना डिलीवरी`,
      `grocery delivery ${district.name} bihar`,
      `online shopping ${district.name}`,
      `30 minute delivery ${district.name}`,
      `fresh vegetables ${district.name}`,
      `kiranase ${district.name}`,
    ],
    openGraph: {
      title: `Grocery Delivery in ${district.name} | Kiranase`,
      description: `Order groceries in ${district.name} cheaper than local bazaar. Delivered in 30 minutes!`,
      url: `https://www.kiranase.com/grocery-delivery/${district.slug}`,
      siteName: 'Kiranase',
      images: [{ url: 'https://www.kiranase.com/photo/Kiranase-logo.png' }],
    },
    alternates: {
      canonical: `https://www.kiranase.com/grocery-delivery/${district.slug}`,
    },
  };
}

export default function DistrictPage({ params }: { params: { district: string } }) {
  const district = districts.find((d) => d.slug === params.district);

  if (!district) {
    return <div>District not found</div>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    name: `Kiranase - ${district.name}`,
    description: `Online grocery delivery in ${district.name}, Bihar`,
    url: `https://www.kiranase.com/grocery-delivery/${district.slug}`,
    telephone: '+918581901902',
    email: 'care@kiranase.com',
    areaServed: {
      '@type': 'City',
      name: district.name,
      containedInPlace: {
        '@type': 'State',
        name: 'Bihar',
        containedInPlace: {
          '@type': 'Country',
          name: 'India',
        },
      },
    },
    priceRange: '₹',
    openingHours: 'Mo-Su 09:00-21:00',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Grocery Products',
      numberOfItems: 7000,
    },
  };

  const categories = [
    { icon: '🥬', name: 'Fresh Produce', hindi: 'ताजी सब्जियां' },
    { icon: '🥛', name: 'Dairy & Eggs', hindi: 'दूध और अंडे' },
    { icon: '🍚', name: 'Rice & Grains', hindi: 'चावल और अनाज' },
    { icon: '🧴', name: 'Personal Care', hindi: 'पर्सनल केयर' },
    { icon: '🏠', name: 'Household', hindi: 'घरेलू सामान' },
    { icon: '🧃', name: 'Beverages', hindi: 'पेय पदार्थ' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>

        <section style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '16px', padding: '48px 32px', color: 'white', marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Bihar • {district.type}</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            Grocery Delivery in {district.name}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '8px' }}>
            {district.hindi} में ऑनलाइन किराना डिलीवरी — बाजार से सस्ता, घर पर डिलीवरी!
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '32px' }}>
            7000+ products • Delivered in 30 minutes • Free delivery above ₹299
          </p>
          <a href="https://www.kiranase.com" style={{ background: 'white', color: '#16a34a', padding: '14px 32px', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' }}>
            Order Now in {district.name} →
          </a>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { icon: '🚀', title: '30 Min Delivery', sub: 'Lightning fast' },
            { icon: '💰', title: 'Bazaar se Sasta', sub: 'Best prices' },
            { icon: '🛒', title: '7000+ Products', sub: 'Huge selection' },
            { icon: '⭐', title: '4.9 Rating', sub: '12,400+ reviews' },
          ].map((badge) => (
            <div key={badge.title} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{badge.icon}</div>
              <div style={{ fontWeight: 700, color: '#15803d' }}>{badge.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{badge.sub}</div>
            </div>
          ))}
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#1a1a1a' }}>
            Shop by Category in {district.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {categories.map((cat) => (
              <a key={cat.name} href="https://www.kiranase.com" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{cat.hindi}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section style={{ background: '#f9fafb', borderRadius: '12px', padding: '32px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
            Online Grocery Delivery in {district.name}, Bihar
          </h2>
          <p style={{ color: '#444', lineHeight: 1.8, marginBottom: '16px' }}>
            Kiranase is the best online grocery delivery service in <strong>{district.name}</strong>, Bihar. We deliver fresh fruits, vegetables, dairy products, and 7000+ daily essentials directly to your doorstep — faster than your local kirana store and at prices cheaper than the bazaar.
          </p>
          <p style={{ color: '#444', lineHeight: 1.8, marginBottom: '16px' }}>
            {district.hindi} के निवासी अब घर बैठे ताजी सब्जियां, दूध, दाल, चावल और रोजमर्रा का सामान मंगवा सकते हैं। Kiranase पर {district.population} लोग भरोसा करते हैं।
          </p>
          <p style={{ color: '#444', lineHeight: 1.8 }}>
            Whether you need fresh vegetables, packaged food, household essentials, or personal care products — Kiranase delivers everything in <strong>30 minutes</strong> across all areas of <strong>{district.name} district</strong>. Free delivery on orders above ₹299.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', color: '#1a1a1a' }}>
            Frequently Asked Questions — {district.name}
          </h2>
          {[
            { q: `Is Kiranase available in ${district.name}?`, a: `Yes! Kiranase delivers groceries across all areas of ${district.name} district in Bihar. We cover all major localities and deliver in 30 minutes.` },
            { q: `What is the minimum order for free delivery in ${district.name}?`, a: `Free delivery is available on all orders above ₹299 in ${district.name}. For orders below ₹299, a small delivery fee applies.` },
            { q: `How fast is grocery delivery in ${district.name}?`, a: `Kiranase delivers groceries in ${district.name} within 30 minutes of placing your order. We are the fastest grocery delivery service in Bihar.` },
            { q: `Is Kiranase cheaper than local bazaar in ${district.name}?`, a: `Yes! Kiranase offers prices cheaper than your local bazaar in ${district.name}. We source directly from suppliers and pass the savings to you.` },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '8px', fontSize: '1rem' }}>{faq.q}</h3>
              <p style={{ color: '#555', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </section>

        <section style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
            Order Groceries in {district.name} Now!
          </h2>
          <p style={{ opacity: 0.9, marginBottom: '24px' }}>
            {district.hindi} में अभी ऑर्डर करें — 30 मिनट में डिलीवरी!
          </p>
          <a href="https://www.kiranase.com" style={{ background: 'white', color: '#16a34a', padding: '14px 40px', borderRadius: '50px', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>
            🛒 Order Now — Free Delivery above ₹299
          </a>
        </section>

      </main>
    </>
  );
}

'use client';

const BOOKING_AID = 'YOUR_AID_HERE'; // Replace when CJ approves

const makkahHotels = [
  {
    name: 'Swissôtel Makkah',
    stars: 5,
    distance: '50m from Haram',
    priceRange: '$250–$500/night',
    amenities: ['Haram View', 'Breakfast Included', 'Zamzam Access'],
    badge: 'Closest to Haram',
    slug: 'swissotel-makkah-makkah',
  },
  {
    name: 'Hilton Suites Makkah',
    stars: 5,
    distance: '200m from Haram',
    priceRange: '$180–$350/night',
    amenities: ['Multiple Restaurants', 'Room Service', 'Family Rooms'],
    badge: null,
    slug: 'hilton-suites-makkah',
  },
  {
    name: 'Pullman Zamzam Makkah',
    stars: 5,
    distance: '100m from Haram',
    priceRange: '$200–$400/night',
    amenities: ['Zamzam View', 'Spa', 'Concierge'],
    badge: 'Best Value',
    slug: 'pullman-zamzam-makkah',
  },
  {
    name: 'Al Marwa Rayhaan',
    stars: 5,
    distance: '300m from Haram',
    priceRange: '$150–$280/night',
    amenities: ['Pool', 'Gym', 'Free Breakfast'],
    badge: null,
    slug: 'al-marwa-rayhaan-by-rotana-makkah',
  },
];

const madinahHotels = [
  {
    name: 'Anwar Al Madinah Mövenpick',
    stars: 5,
    distance: '50m from Nabawi',
    priceRange: '$200–$380/night',
    amenities: ['Masjid View', 'Multiple Restaurants', 'Concierge'],
    badge: 'Closest to Nabawi',
    slug: 'anwar-al-madinah-movenpick-hotel-medina',
  },
  {
    name: 'Pullman Madinah',
    stars: 5,
    distance: '150m from Nabawi',
    priceRange: '$160–$300/night',
    amenities: ['Rooftop Dining', 'Gym', 'Family Rooms'],
    badge: 'Best Value',
    slug: 'pullman-zamzam-madinah',
  },
  {
    name: 'Dar Al Taqwa Hotel',
    stars: 4,
    distance: '200m from Nabawi',
    priceRange: '$100–$200/night',
    amenities: ['Free Breakfast', 'Airport Transfer', 'Prayer Times Display'],
    badge: null,
    slug: 'dar-al-taqwa-hotel-medina',
  },
  {
    name: 'Al Rawda Royal Inn',
    stars: 4,
    distance: '400m from Nabawi',
    priceRange: '$80–$160/night',
    amenities: ['Budget Friendly', 'Restaurant', 'Free WiFi'],
    badge: null,
    slug: 'al-rawda-royal-inn-medina',
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <span style={{ color: '#C9A84C', fontSize: '14px' }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}

function HotelCard({ hotel, city }: { hotel: typeof makkahHotels[0], city: string }) {
  const bookingUrl = `https://www.booking.com/hotel/sa/${hotel.slug}.html?aid=${BOOKING_AID}&label=umrahconnect`;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      border: '1px solid #eee',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {hotel.badge && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: '#C9A84C',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '600',
          padding: '4px 10px',
          borderRadius: '20px',
        }}>
          {hotel.badge}
        </div>
      )}

      <div>
        <h3 style={{ color: '#1E3A5F', fontSize: '18px', fontWeight: '600', margin: '0 0 4px' }}>
          {hotel.name}
        </h3>
        <StarRating count={hotel.stars} />
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#666' }}>
        <span>📍 {hotel.distance}</span>
        <span>💰 {hotel.priceRange}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {hotel.amenities.map(a => (
          <span key={a} style={{
            background: '#f0f4f8',
            color: '#1E3A5F',
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '20px',
          }}>
            {a}
          </span>
        ))}
      </div>

      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          background: '#1E3A5F',
          color: '#fff',
          textAlign: 'center',
          padding: '12px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px',
          marginTop: '4px',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#C9A84C')}
        onMouseOut={e => (e.currentTarget.style.background = '#1E3A5F')}
      >
        Book on Booking.com
      </a>
    </div>
  );
}

function Section({ title, subtitle, hotels, city }: {
  title: string;
  subtitle: string;
  hotels: typeof makkahHotels;
  city: string;
}) {
  return (
    <section style={{ marginBottom: '64px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#1E3A5F', fontSize: '28px', fontWeight: '700', margin: '0 0 8px' }}>
          {title}
        </h2>
        <p style={{ color: '#666', fontSize: '15px', margin: 0 }}>{subtitle}</p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
      }}>
        {hotels.map(hotel => (
          <HotelCard key={hotel.slug} hotel={hotel} city={city} />
        ))}
      </div>
    </section>
  );
}

export default function Hotels() {
  return (
    <main style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #2d5a8e 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <p style={{ color: '#C9A84C', fontSize: '14px', fontWeight: '600', letterSpacing: '2px', marginBottom: '16px' }}>
          ACCOMMODATION GUIDE
        </p>
        <h1 style={{ fontSize: '40px', fontWeight: '700', margin: '0 0 16px', lineHeight: 1.2 }}>
          Stay Close to the Holy Sites
        </h1>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '0 auto' }}>
          Handpicked hotels near Masjid al-Haram and Masjid an-Nabawi, selected for proximity, quality, and value for pilgrims.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px' }}>
        <Section
          title="🕌 Makkah — Near Masjid al-Haram"
          subtitle="All hotels within walking distance of the Grand Mosque"
          hotels={makkahHotels}
          city="makkah"
        />
        <Section
          title="🕌 Madinah — Near Masjid an-Nabawi"
          subtitle="Comfortable stays within easy reach of the Prophet's Mosque"
          hotels={madinahHotels}
          city="madinah"
        />

        {/* Disclaimer */}
        <p style={{ color: '#999', fontSize: '12px', textAlign: 'center', marginTop: '32px' }}>
        UmrahConnect © 2026. All rights reserved.
        </p>
      </div>
    </main>
  );
}
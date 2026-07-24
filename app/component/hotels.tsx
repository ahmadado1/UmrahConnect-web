'use client';

import { useMemo, useState } from 'react';
import { LocationPinIcon, MosqueIcon, PriceTagIcon, StarIcon } from './Icons';
import { Reveal } from './Reveal';

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

type Hotel = (typeof makkahHotels)[0];
type FilterId = 'all' | 'makkah' | 'madinah';

const filterTabs: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All Hotels' },
  { id: 'makkah', label: 'Makkah' },
  { id: 'madinah', label: 'Madinah' },
];

function StarRating({ count }: { count: number }) {
  return (
    <span className="hotel-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < count} size={14} />
      ))}
    </span>
  );
}

function HotelCardContent({ hotel }: { hotel: Hotel }) {
  const bookingUrl = `https://www.booking.com/hotel/sa/${hotel.slug}.html?aid=${BOOKING_AID}&label=umrahconnect`;

  return (
    <>
      {hotel.badge && (
        <div className="hotel-card-badge">{hotel.badge}</div>
      )}

      <div>
        <h3 className="hotel-card-title">{hotel.name}</h3>
        <StarRating count={hotel.stars} />
      </div>

      <div className="hotel-card-meta">
        <span>
          <span className="hotel-meta-icon">
            <LocationPinIcon size={16} />
          </span>
          {hotel.distance}
        </span>
        <span>
          <span className="hotel-meta-icon">
            <PriceTagIcon size={16} />
          </span>
          {hotel.priceRange}
        </span>
      </div>

      <div className="hotel-card-amenities">
        {hotel.amenities.map((amenity) => (
          <span key={amenity} className="hotel-amenity-pill">
            {amenity}
          </span>
        ))}
      </div>

      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hotel-card-book-btn"
      >
        Book on Booking.com
      </a>
    </>
  );
}

function filterHotels(hotels: Hotel[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return hotels;
  return hotels.filter((hotel) => hotel.name.toLowerCase().includes(query));
}

function HotelSection({
  title,
  subtitle,
  hotels,
  cardOffset,
}: {
  title: string;
  subtitle: string;
  hotels: Hotel[];
  cardOffset: number;
}) {
  if (hotels.length === 0) return null;

  return (
    <section className="hotels-section-block">
      <Reveal threshold={0.1} slideFrom="left" className="hotels-section-header">
        <h2 className="hotels-section-title hotels-section-heading">
          <MosqueIcon size={28} />
          {title}
        </h2>
        <p className="hotels-section-subtitle">{subtitle}</p>
      </Reveal>

      <div className="hotels-grid">
        {hotels.map((hotel, index) => (
          <Reveal
            key={hotel.slug}
            threshold={0.1}
            slideFrom="hotel-card"
            delay={(cardOffset + index) * 80}
            className="hotel-card reveal-hotel-card"
          >
            <HotelCardContent hotel={hotel} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Hotels() {
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');

  const filteredMakkah = useMemo(
    () => filterHotels(makkahHotels, search),
    [search],
  );
  const filteredMadinah = useMemo(
    () => filterHotels(madinahHotels, search),
    [search],
  );

  const showMakkah = filter === 'all' || filter === 'makkah';
  const showMadinah = filter === 'all' || filter === 'madinah';

  return (
    <main className="hotels-page">
      <Reveal threshold={0.1} slideFrom="top" className="hotels-hero">
        <p className="hotels-hero-label">ACCOMMODATION GUIDE</p>
        <h1>Stay Close to the Holy Sites</h1>
        <p className="hotels-hero-text">
          Handpicked hotels near Masjid al-Haram and Masjid an-Nabawi, selected for proximity, quality, and value for pilgrims.
        </p>
      </Reveal>

      <div className="page-container-wide">
        <div className="hotels-toolbar">
          <Reveal threshold={0.1} slideFrom="top">
            <input
              type="search"
              className="hotels-search"
              placeholder="Search hotels by name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search hotels"
            />
          </Reveal>

          <div className="hotels-filter-tabs">
            {filterTabs.map((tab, index) => (
              <Reveal key={tab.id} threshold={0.1} slideFrom="left" delay={index * 80}>
                <button
                  type="button"
                  className={`hotels-filter-tab${filter === tab.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(tab.id)}
                >
                  {tab.label}
                </button>
              </Reveal>
            ))}
          </div>
        </div>

        {showMakkah && (
          <HotelSection
            title="Makkah — Near Masjid al-Haram"
            subtitle="All hotels within walking distance of the Grand Mosque"
            hotels={filteredMakkah}
            cardOffset={0}
          />
        )}

        {showMadinah && (
          <HotelSection
            title="Madinah — Near Masjid an-Nabawi"
            subtitle="Comfortable stays within easy reach of the Prophet's Mosque"
            hotels={filteredMadinah}
            cardOffset={showMakkah ? filteredMakkah.length : 0}
          />
        )}

        <p className="hotels-disclaimer">UmrahConnect © 2026. All rights reserved.</p>
      </div>
    </main>
  );
}

import React, { useState } from 'react';

export default function EvoLeaAngeboteV3() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // OPEN REGISTRATION - Top Priority
  const openPrograms = [
    {
      id: 'turnen',
      name: 'Mini Turnen',
      statusText: 'Anmeldung offen',
      description: 'Bewegung, Spass und motorische Förderung in einer kleinen, verständnisvollen Gruppe.',
      start: 'Start: Januar 2025',
      age: '3–6 Jahre',
      icon: '⚽',
    },
    {
      id: 'gallery',
      name: 'Mini Gallery',
      statusText: 'Anmeldung offen',
      description: 'Kreative Kunstprojekte und gemeinsame Ausstellungen. Soziale Kompetenz durch Schaffen.',
      start: 'Start: März 2025',
      age: '4–8 Jahre',
      icon: '🎨',
    },
    {
      id: 'garten',
      name: 'Mini Garten',
      statusText: 'Anmeldung offen',
      description: 'Spielerische Vorbereitung auf den Kindergarten in einer kleinen, geschützten Gruppe.',
      start: 'Laufend',
      age: '3–5 Jahre',
      icon: '🌱',
    },
  ];

  // CURRENTLY RUNNING / ONGOING - No registration needed
  const ongoingPrograms = [
    {
      id: 'restaurant',
      name: 'Mini Restaurant',
      statusText: 'Läuft · Keine Anmeldung',
      description: 'Soziale Kompetenz durch gemeinsames Kochen und Restaurantspiel.',
      detail: 'Woche 8 von 10',
      icon: '🍳',
    },
    {
      id: 'cafe',
      name: 'EVOLEA Cafe',
      statusText: 'Offen für alle',
      description: 'Austausch und Gemeinschaft für Eltern. Jeden 2. Mittwoch im Monat um 20:00 Uhr.',
      detail: 'Keine Anmeldung nötig',
      icon: '☕',
    },
  ];

  // COMING SOON - Future programs
  const comingSoon = {
    id: 'schulplanung',
    name: 'Tagessonderschule',
    statusText: 'In Planung',
    description: 'Sonderschule Typ A für Kinder im Spektrum. Kindergarten bis Primarschulalter.',
    timeline: '2025/2026',
    icon: '🏫',
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#FFFBF7',
      minHeight: '100vh',
      padding: '0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        .section-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #BA53AD;
          margin-bottom: 1rem;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card-open {
          background: linear-gradient(135deg, #DD48E0 0%, #BA53AD 100%);
          color: white;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 12px 32px rgba(221, 72, 224, 0.2);
        }
        
        .card-open:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(221, 72, 224, 0.35);
        }
        
        .card-ongoing {
          background: linear-gradient(135deg, #F5F5F4 0%, #E7E5E4 100%);
          border: 1px solid #D6D3D1;
          color: #2D2D2D;
          transition: all 0.3s ease;
        }
        
        .card-ongoing:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
        
        .card-coming {
          background: linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%);
          border: 1.5px dashed #E879F9;
          color: #2D2D2D;
          transition: all 0.3s ease;
        }
        
        .card-coming:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(232, 121, 249, 0.15);
          border-style: solid;
        }
        
        .btn-primary {
          background: white;
          color: #DD48E0;
          border: none;
          padding: 0.875rem 1.75rem;
          border-radius: 0.625rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
        }
        
        .btn-secondary {
          background: transparent;
          color: rgba(255, 255, 255, 0.9);
          border: none;
          padding: 0.875rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        
        .btn-info {
          background: transparent;
          color: #6B7280;
          border: 1.5px solid #D1D5DB;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-info:hover {
          border-color: #BA53AD;
          color: #BA53AD;
        }
        
        .btn-notify {
          background: transparent;
          color: #C026D3;
          border: 1.5px solid #E879F9;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-notify:hover {
          background: #FAE8FF;
        }
        
        .status-badge-open {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
        }
        
        .status-badge-ongoing {
          background: #E7E5E4;
          color: #78716C;
          border: 1px solid #D6D3D1;
        }
        
        .status-badge-coming {
          background: #FAE8FF;
          color: #A21CAF;
          border: 1px solid #E879F9;
        }
        
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0 1.5rem;
        }
        
        .divider-line {
          flex: 1;
          height: 1px;
          background: #E5E7EB;
        }
        
        .divider-text {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #9CA3AF;
        }
      `}</style>

      <section style={{
        padding: '3rem 1.5rem 4rem',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-label">Angebote</span>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}>
            <span className="gradient-text">Unsere Angebote</span>
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: '#6B7280',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Evidenzbasierte Programme, die jedes Kind dort abholen, wo es steht.
          </p>
        </header>

        {/* ========== REGISTRATION OPEN - 3 columns ========== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          marginBottom: '0.5rem',
        }}>
          {openPrograms.map((program) => (
            <article
              key={program.id}
              className="card-open"
              onMouseEnter={() => setHoveredCard(program.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                borderRadius: '1.25rem',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '290px',
              }}
            >
              <div className="status-badge-open" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '2rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                width: 'fit-content',
                marginBottom: '1rem',
              }}>
                <span>✨</span>
                <span>{program.statusText}</span>
              </div>

              <div style={{
                fontSize: '1.75rem',
                marginBottom: '0.625rem',
                filter: 'grayscale(100%) brightness(10)',
              }}>
                {program.icon}
              </div>

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                lineHeight: 1.3,
              }}>
                {program.name}
              </h3>

              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.55,
                opacity: 0.9,
                marginBottom: '1rem',
                flexGrow: 1,
              }}>
                {program.description}
              </p>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                opacity: 0.85,
              }}>
                <span>📅 {program.start}</span>
                <span>👶 {program.age}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: 'auto',
              }}>
                <button className="btn-primary">Jetzt anmelden</button>
                <button className="btn-secondary">Mehr →</button>
              </div>
            </article>
          ))}
        </div>

        {/* ========== DIVIDER ========== */}
        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">Weitere Angebote</span>
          <div className="divider-line"></div>
        </div>

        {/* ========== BOTTOM ROW: Ongoing + Coming Soon ========== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }}>
          
          {/* Mini Restaurant - Ongoing */}
          <article className="card-ongoing" style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div className="status-badge-ongoing" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '2rem',
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: 'fit-content',
              marginBottom: '0.875rem',
            }}>
              <span>🔥</span>
              <span>{ongoingPrograms[0].statusText}</span>
            </div>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {ongoingPrograms[0].icon}
            </div>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2D2D2D',
            }}>
              {ongoingPrograms[0].name}
            </h3>
            <p style={{
              fontSize: '0.825rem',
              lineHeight: 1.5,
              color: '#6B7280',
              marginBottom: '0.75rem',
              flexGrow: 1,
            }}>
              {ongoingPrograms[0].description}
            </p>
            <div style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
              marginBottom: '1rem',
            }}>
              {ongoingPrograms[0].detail}
            </div>
            <button className="btn-info" style={{ marginTop: 'auto' }}>
              Für Teilnehmer
            </button>
          </article>

          {/* EVOLEA Cafe - Ongoing */}
          <article className="card-ongoing" style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div className="status-badge-ongoing" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '2rem',
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: 'fit-content',
              marginBottom: '0.875rem',
            }}>
              <span>☕</span>
              <span>{ongoingPrograms[1].statusText}</span>
            </div>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {ongoingPrograms[1].icon}
            </div>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2D2D2D',
            }}>
              {ongoingPrograms[1].name}
            </h3>
            <p style={{
              fontSize: '0.825rem',
              lineHeight: 1.5,
              color: '#6B7280',
              marginBottom: '0.75rem',
              flexGrow: 1,
            }}>
              {ongoingPrograms[1].description}
            </p>
            <div style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
              marginBottom: '1rem',
            }}>
              {ongoingPrograms[1].detail}
            </div>
            <button className="btn-info" style={{ marginTop: 'auto' }}>
              Mehr erfahren
            </button>
          </article>

          {/* Tagessonderschule - Coming Soon */}
          <article className="card-coming" style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div className="status-badge-coming" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '2rem',
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: 'fit-content',
              marginBottom: '0.875rem',
            }}>
              <span>🚀</span>
              <span>{comingSoon.statusText}</span>
            </div>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {comingSoon.icon}
            </div>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
              color: '#2D2D2D',
            }}>
              {comingSoon.name}
            </h3>
            <p style={{
              fontSize: '0.825rem',
              lineHeight: 1.5,
              color: '#6B7280',
              marginBottom: '0.75rem',
              flexGrow: 1,
            }}>
              {comingSoon.description}
            </p>
            <div style={{
              fontSize: '0.75rem',
              color: '#A21CAF',
              marginBottom: '1rem',
              fontWeight: 500,
            }}>
              📅 {comingSoon.timeline}
            </div>
            <button className="btn-notify" style={{ marginTop: 'auto' }}>
              Mehr erfahren
            </button>
          </article>

        </div>

      </section>
    </div>
  );
}

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="platform-page">
      <div className="platform-page__container">
        <span
          style={{
            display: 'block',
            marginBottom: '8px',
            color: '#35729d',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          ECOS Modeling 4.0
        </span>

        <h1
          style={{
            margin: '0 0 12px',
            color: '#1b2a3e',
            fontSize: '28px',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            maxWidth: '700px',
            margin: 0,
            color: '#68788c',
            fontSize: '13px',
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>

        <div
          style={{
            marginTop: '32px',
            padding: '24px',
            border: '1px solid #dfe6ed',
            borderRadius: '12px',
            background: '#ffffff',
            color: '#7a8797',
            fontSize: '12px',
          }}
        >
          Este módulo será implementado nas próximas etapas
          de desenvolvimento da ECOS Modeling 4.0.
        </div>
      </div>
    </div>
  );
}
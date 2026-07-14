import Link from "next/link";

export default function CreditsPage() {
  return (
    <main className="document-screen">
      <section className="document-panel">
        <p className="eyebrow">Expediente A.O.T.O.</p>
        <h1>Créditos y propósito</h1>
        <p>
          Proyecto original de ficción política. El Directorio es una fuerza
          militar ficticia; el juego critica la ocupación, la deshumanización y
          el abuso militar sin atribuirlos a una identidad étnica o religiosa.
        </p>
        <p>
          Las láminas aportadas por el autor se conservan como fuente conceptual
          y se procesan mediante un pipeline reproducible.
        </p>
        <Link className="primary-button" href="/">
          Volver
        </Link>
      </section>
    </main>
  );
}

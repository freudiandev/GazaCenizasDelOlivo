import Link from "next/link";

export default function HomePage() {
  return (
    <main className="menu-screen">
      <div className="menu-vignette" />
      <section className="title-card">
        <p className="eyebrow">Una ciudad que se niega a desaparecer</p>
        <h1>
          Gaza
          <span>Cenizas del Olivo</span>
        </h1>
        <p className="lead">
          Samir busca la señal de su familia mientras repara, documenta y
          rescata a una comunidad bajo el control del Directorio.
        </p>
        <nav className="main-menu" aria-label="Menú principal">
          <Link className="primary-button" href="/game">
            Comenzar misión 1
          </Link>
          <Link href="/settings">Configuración</Link>
          <Link href="/credits">Créditos y fuentes</Link>
        </nav>
        <p className="motto">
          «No lucho por odio. Lucho para que un día volvamos a casa.»
        </p>
      </section>
    </main>
  );
}

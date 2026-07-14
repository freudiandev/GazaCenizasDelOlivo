import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="document-screen">
      <section className="document-panel">
        <p className="eyebrow">Configuración inicial</p>
        <h1>Controles</h1>
        <div className="control-grid">
          <span>A / D</span>
          <p>Mover</p>
          <span>Espacio</span>
          <p>Saltar</p>
          <span>Shift</span>
          <p>Correr</p>
          <span>J</span>
          <p>Disparar</p>
          <span>L / E</span>
          <p>Interactuar</p>
          <span>Esc</span>
          <p>Pausa</p>
          <span>F3</span>
          <p>Depuración</p>
        </div>
        <p>
          También se admite gamepad estándar. La reasignación completa se
          incorporará en la siguiente fase.
        </p>
        <Link className="primary-button" href="/">
          Volver
        </Link>
      </section>
    </main>
  );
}

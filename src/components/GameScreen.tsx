"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Game } from "@/game/core/Game";
import { useGameStore } from "@/store/gameStore";

export function GameScreen() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    health,
    ammo,
    score,
    objective,
    checkpoint,
    paused,
    completed,
    bossHealth,
  } = useGameStore();

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    let game: Game | null = null;

    const startTimer = window.setTimeout(() => {
      if (disposed || !hostRef.current) return;
      game = new Game(hostRef.current);
      void game.start().catch((reason: unknown) => {
        if (disposed) return;
        if (hostRef.current) hostRef.current.dataset.phase = "error";
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudo iniciar el motor.",
        );
      });
    }, 0);

    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      game?.destroy();
    };
  }, []);

  return (
    <main className="game-shell">
      <div ref={hostRef} className="game-host" data-testid="game-canvas-host" />
      <header className="hud" aria-label="Estado del jugador">
        <div className="hud-block health-block">
          <span>Samir</span>
          <div className="health-track">
            <i style={{ width: `${health}%` }} />
          </div>
        </div>
        <div className="hud-block">
          <small>Munición</small>
          <strong>{ammo.toString().padStart(2, "0")}</strong>
        </div>
        <div className="hud-block">
          <small>Puntuación</small>
          <strong>{score.toString().padStart(6, "0")}</strong>
        </div>
        <div className="hud-objective">
          <small>Objetivo actual</small>
          <strong>{objective}</strong>
        </div>
      </header>
      <aside className="checkpoint-indicator">◈ {checkpoint}</aside>
      {bossHealth !== null && (
        <aside
          className="boss-indicator"
          aria-label="Integridad de Ojo del Cielo"
        >
          <span>Ojo del Cielo</span>
          <div className="boss-track">
            <i style={{ width: `${bossHealth}%` }} />
          </div>
        </aside>
      )}
      <div className="control-hint">
        A/D mover · Espacio saltar · J disparar · L interactuar · F3 hitboxes
      </div>
      {paused && (
        <div className="overlay-panel">
          <h2>Pausa</h2>
          <p>Presiona Esc para continuar.</p>
        </div>
      )}
      {completed && (
        <div className="overlay-panel result-panel">
          <p className="eyebrow">Misión 1 — La señal perdida</p>
          <h2>Señal restablecida</h2>
          <p>Una transmisión incompleta menciona a la hermana de Samir.</p>
          <strong>Puntuación: {score}</strong>
          <Link className="primary-button" href="/">
            Volver al menú
          </Link>
        </div>
      )}
      {error && (
        <div className="overlay-panel error-panel">
          <h2>Error del motor</h2>
          <p>{error}</p>
        </div>
      )}
    </main>
  );
}

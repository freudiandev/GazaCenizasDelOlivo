# Sistema de guardado

IndexedDB `gaza-cenizas-del-olivo`, object store `saves`, conserva perfiles por `profileId`. El esquema v1 incluye misión, checkpoint, posición segura, misiones desbloqueadas, rescates, moral y fecha ISO. Nunca se guarda una posición peligrosa exacta: la plaza restaura x=880.

La misión carga automáticamente el perfil `default`. Al cruzar la plaza guarda de forma asíncrona; al morir o pulsar R reaparece allí. Futuras migraciones incrementarán tanto la versión de base como `SaveData.version`. Preferencias de audio/accesibilidad irán a localStorage porque son pequeñas y no forman parte de la partida.

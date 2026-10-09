# 005 — Traitement des photos côté serveur avec sharp

- **Statut :** accepté
- **Contexte :** une photo de smartphone contient souvent la position GPS exacte dans ses EXIF.
  On ne peut pas se fier à la compression ni au type annoncés par le client.
- **Décision :** à l'upload (multipart, taille max contrôlée par le flux) :
  1. détection du type réel par les octets (JPEG, PNG, WebP, HEIC si supporté), sinon 415 ;
  2. ré-encodage par sharp en WebP, redimensionné (côté long ≤ 1600 px), avec rotation selon
     l'orientation EXIF **puis suppression de toutes les métadonnées** ;
  3. écriture sur disque sous un nom UUID généré par le serveur.
- **Conséquences :** sharp est une dépendance native (scripts d'installation à autoriser). Un test
  vérifie qu'une image portant des EXIF GPS ressort sans aucune métadonnée.

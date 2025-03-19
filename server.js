const express = require("express");
const app = express();
const PORT = 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static("public"));

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});

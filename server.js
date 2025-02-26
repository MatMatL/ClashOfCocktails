const express = require("express");
const app = express();
const PORT = 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static("public"));

// Route API pour récupérer un cocktail
app.get("/api/cocktail", (req, res) => {
  res.json({
    name: "Elixir de Rage",
    ingredients: ["Rhum", "Jus de grenade", "Sirop de sucre"],
    description: "Un cocktail puissant inspiré du sort de Rage dans Clash of Clans !",
  });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});

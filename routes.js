const express = require("express");
const fs = require("fs")
const path = require("path")

const router = express.Router();

router.get("/api/cocktail", (req, res) => {
    res.json({
        name: "Elixir de Rage",
        ingredients: ["Rhum", "Jus de grenade", "Sirop de sucre"],
        description: "Un cocktail puissant inspiré du sort de Rage dans Clash of Clans !",
    });
});

router.get("/api/cocktails_list", (req , res) => {
    const filePath = path.join(__dirname, "Cocktails/BlacksTroups.json")

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Erreur de lecture du fichier JSON :", err);
            return res.status(500).json({error: "Erreur interne du serveur"});
        }

        try {
            const jsonData = JSON.parse(data);
            const nomsCocktails = jsonData.troupes_noires.map(troupe => troupe.cocktail);
            res.json({cocktails: nomsCocktails});
        } catch (parseError) {
            console.error("Erreur d'analyse du JSON :", parseError);
            res.status(500).json({error: "Erreur interne du serveur"});
        }
    });
});

module.exports = router;

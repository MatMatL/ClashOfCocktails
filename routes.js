const express = require("express");
const fs = require("fs")
const path = require("path")

const router = express.Router();

const readJsonFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseError) {
                    reject(parseError);
                }
            }
        });
    });
};


router.get("/api/cocktail", (req, res) => {
    res.json({
        name: "Elixir de Rage",
        ingredients: ["Rhum", "Jus de grenade", "Sirop de sucre"],
        description: "Un cocktail puissant inspiré du sort de Rage dans Clash of Clans !",
    });
});

router.get("/api/cocktails_list", async (req, res) => {
    try {
        const files = ["Cocktails/BlacksTroups.json", "Cocktails/Heros.json", "Cocktails/Troups.json"];
        const filePaths = files.map(file => path.join(__dirname, file));
        const jsonDataArray = await Promise.all(filePaths.map(readJsonFile));
        const allCocktails = jsonDataArray.flatMap(jsonData => {
            return jsonData.troupes_noires?.map(troupe => troupe.cocktail) ||
                jsonData.heros?.map(hero => hero.cocktail) ||
                jsonData.troupes?.map(troupe => troupe.cocktail) || [];
        });

        res.json({ cocktails: allCocktails });
    } catch (error) {
        console.error("Erreur lors de la lecture des fichiers CHEH :", error);
        res.status(500).json({ error: "Erreur interne du serveur CHEH" });
    }
});

module.exports = router;

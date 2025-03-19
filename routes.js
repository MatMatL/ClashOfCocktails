const express = require("express");
const router = express.Router();

router.get("/api/cocktail", (req, res) => {
    res.json({
        name: "Elixir de Rage",
        ingredients: ["Rhum", "Jus de grenade", "Sirop de sucre"],
        description: "Un cocktail puissant inspiré du sort de Rage dans Clash of Clans !",
    });
});

module.exports = router;

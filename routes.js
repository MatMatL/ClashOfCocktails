const express = require("express");
const fs = require("fs")
const path = require("path")
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();

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

// Route d'inscription
router.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation des données
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        // Connexion à MongoDB
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db("clashofcocktails");
        const usersCollection = db.collection("users");

        // Vérification si l'email existe déjà
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            await client.close();
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création du nouvel utilisateur
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        await usersCollection.insertOne(newUser);
        await client.close();

        res.status(201).json({ message: "Compte créé avec succès" });
    } catch (error) {
        console.error("Erreur détaillée lors de l'inscription:", error);
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ message: "Impossible de se connecter à la base de données" });
        } else if (error.code === 'ENOTFOUND') {
            res.status(500).json({ message: "URL de la base de données invalide" });
        } else {
            res.status(500).json({ 
                message: "Erreur lors de la création du compte",
                details: error.message 
            });
        }
    }
});

module.exports = router;

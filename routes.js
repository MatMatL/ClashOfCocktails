const express = require("express");
const fs = require("fs")
const path = require("path")
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
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

// Route de connexion
router.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Tentative de connexion pour l'email:", email);

        // Validation des données
        if (!email || !password) {
            console.log("Données manquantes:", { email, password });
            return res.status(400).json({ message: "Email et mot de passe requis" });
        }

        // Connexion à MongoDB
        console.log("Connexion à MongoDB...");
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        console.log("Connecté à MongoDB");
        
        const db = client.db("clashofcocktails");
        const usersCollection = db.collection("users");

        // Recherche de l'utilisateur
        console.log("Recherche de l'utilisateur...");
        const user = await usersCollection.findOne({ email });
        if (!user) {
            console.log("Utilisateur non trouvé");
            await client.close();
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
        console.log("Utilisateur trouvé:", { id: user._id, email: user.email });

        // Vérification du mot de passe
        console.log("Vérification du mot de passe...");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Mot de passe incorrect");
            await client.close();
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
        console.log("Mot de passe valide");

        // Création du token JWT
        console.log("Création du token JWT...");
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await client.close();
        console.log("Connexion réussie pour l'utilisateur:", user.email);

        // Envoi du token et des informations utilisateur
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Erreur détaillée lors de la connexion:", error);
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ message: "Impossible de se connecter à la base de données" });
        } else if (error.code === 'ENOTFOUND') {
            res.status(500).json({ message: "URL de la base de données invalide" });
        } else {
            res.status(500).json({ 
                message: "Erreur lors de la connexion",
                details: error.message 
            });
        }
    }
});

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide" });
        }
        req.user = user;
        next();
    });
};

// Route pour récupérer tous les cocktails
router.get('/api/cocktails', async (req, res) => {
    try {
        const files = ["Cocktails/BlacksTroups.json", "Cocktails/Heros.json", "Cocktails/Troups.json"];
        const filePaths = files.map(file => path.join(__dirname, file));
        const jsonDataArray = await Promise.all(filePaths.map(readJsonFile));
        const allCocktails = jsonDataArray.flatMap(jsonData => {
            return jsonData.troupes_noires?.map(troupe => ({
                name: troupe.cocktail,
                description: `Un cocktail inspiré de la ${troupe.nom}`,
                ingredients: troupe.ingredients,
                image: "/images/archer.png"
            })) ||
            jsonData.heros?.map(hero => ({
                name: hero.cocktail,
                description: `Un cocktail inspiré du héros ${hero.nom}`,
                ingredients: hero.ingredients,
                image: "/images/archer.png"
            })) ||
            jsonData.troupes?.map(troupe => ({
                name: troupe.cocktail,
                description: `Un cocktail inspiré de la ${troupe.nom}`,
                ingredients: troupe.ingredients,
                image: "/images/archer.png"
            })) || [];
        });

        res.json(allCocktails);
    } catch (error) {
        console.error("Erreur lors de la lecture des fichiers:", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des cocktails" });
    }
});

module.exports = { router, authenticateToken };

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function initCocktails() {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('clashofcocktails');
        
        // Supprimer la collection existante si elle existe
        await db.collection('cocktails').drop().catch(() => console.log('Collection cocktails inexistante'));

        // Créer la collection avec des exemples
        const cocktails = [
            {
                name: "Mojito",
                description: "Un cocktail rafraîchissant à base de rhum, de menthe et de citron vert.",
                ingredients: [
                    "6 cl de rhum blanc",
                    "3 cl de jus de citron vert",
                    "2 cuillères à café de sucre de canne",
                    "6 à 8 feuilles de menthe",
                    "Eau gazeuse",
                    "Glaçons"
                ],
                image: "/images/mojito.jpg"
            },
            {
                name: "Margarita",
                description: "Un cocktail classique à base de tequila, de triple sec et de citron vert.",
                ingredients: [
                    "5 cl de tequila",
                    "2 cl de triple sec",
                    "2 cl de jus de citron vert",
                    "Sel",
                    "Glaçons"
                ],
                image: "/images/margarita.jpg"
            },
            {
                name: "Piña Colada",
                description: "Un cocktail tropical à base de rhum, de jus d'ananas et de lait de coco.",
                ingredients: [
                    "5 cl de rhum blanc",
                    "10 cl de jus d'ananas",
                    "3 cl de lait de coco",
                    "Glaçons"
                ],
                image: "/images/pina-colada.jpg"
            }
        ];

        await db.collection('cocktails').insertMany(cocktails);
        console.log('Collection cocktails initialisée avec succès');
        client.close();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des cocktails:', error);
    }
}

initCocktails(); 
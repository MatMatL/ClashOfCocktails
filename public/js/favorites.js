// Fonction pour vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Fonction pour ajouter un cocktail aux favoris
async function addToFavorites(cocktailName) {
    if (!isUserLoggedIn()) {
        alert('Veuillez vous connecter pour ajouter des cocktails à vos favoris');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/favorites/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cocktailName })
        });

        // Plus de popup de confirmation ; on affiche uniquement les erreurs
        if (!response.ok) {
            const data = await response.json();
            alert(data.message || 'Erreur lors de l\'ajout aux favoris');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
}

// Fonction pour retirer un cocktail des favoris
async function removeFromFavorites(cocktailName) {
    if (!isUserLoggedIn()) {
        return;
    }

    try {
        const response = await fetch('/api/favorites/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cocktailName })
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.message || 'Erreur lors du retrait des favoris');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
}

// Fonction pour charger les cocktails favoris
async function loadFavorites() {
    if (!isUserLoggedIn()) {
        return [];
    }

    try {
        const response = await fetch('/api/favorites', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.favorites || [];
        }
        return [];
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
} 
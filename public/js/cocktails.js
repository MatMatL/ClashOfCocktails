document.addEventListener('DOMContentLoaded', () => {
    const cocktailGrid = document.getElementById('cocktailGrid');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.querySelector('.no-results');
    let cocktails = [];

    // Fonction pour charger les cocktails
    async function loadCocktails() {
        try {
            const response = await fetch('/api/cocktails');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des cocktails');
            }
            cocktails = await response.json();
            displayCocktails(cocktails);
        } catch (error) {
            console.error('Erreur:', error);
            cocktailGrid.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Une erreur est survenue lors du chargement des cocktails</p>
                </div>
            `;
        }
    }

    // Fonction pour afficher les cocktails
    function displayCocktails(cocktailsToDisplay) {
        if (cocktailsToDisplay.length === 0) {
            noResults.style.display = 'block';
            cocktailGrid.innerHTML = '';
            return;
        }

        noResults.style.display = 'none';
        cocktailGrid.innerHTML = cocktailsToDisplay.map(cocktail => `
            <div class="cocktail-card">
                <img src="${cocktail.image || '/images/default-cocktail.jpg'}" alt="${cocktail.name}" class="cocktail-image">
                <div class="cocktail-info">
                    <h3>${cocktail.name}</h3>
                    <p>${cocktail.description || 'Un délicieux cocktail à découvrir.'}</p>
                    <div class="cocktail-ingredients">
                        <h4>Ingrédients</h4>
                        <ul>
                            ${cocktail.ingredients ? cocktail.ingredients.map(ingredient => 
                                `<li>${ingredient}</li>`
                            ).join('') : '<li>Aucun ingrédient spécifié</li>'}
                        </ul>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Fonction de recherche
    function searchCocktails(searchTerm) {
        const filteredCocktails = cocktails.filter(cocktail => {
            const searchLower = searchTerm.toLowerCase();
            return cocktail.name.toLowerCase().includes(searchLower) ||
                   (cocktail.description && cocktail.description.toLowerCase().includes(searchLower)) ||
                   (cocktail.ingredients && cocktail.ingredients.some(ingredient => 
                       ingredient.toLowerCase().includes(searchLower)
                   ));
        });
        displayCocktails(filteredCocktails);
    }

    // Événement de recherche
    searchInput.addEventListener('input', (e) => {
        searchCocktails(e.target.value);
    });

    // Charger les cocktails au chargement de la page
    loadCocktails();
}); 
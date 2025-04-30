document.addEventListener('DOMContentLoaded', () => {
    const cocktailGrid = document.getElementById('cocktailGrid');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.querySelector('.no-results');
    let cocktails = [];
    let favorites = [];

    // Fonction pour charger les cocktails
    async function loadCocktails() {
        try {
            favorites = await loadFavorites();
            const response = await fetch('/api/cocktails');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des cocktails');
            }
            cocktails = await response.json();
            displayCocktails(cocktails, favorites);
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
    function displayCocktails(cocktailsToDisplay, favoritesList) {
        if (cocktailsToDisplay.length === 0) {
            noResults.style.display = 'block';
            cocktailGrid.innerHTML = '';
            return;
        }

        noResults.style.display = 'none';
        cocktailGrid.innerHTML = cocktailsToDisplay.map(cocktail => {
            const isFav = favoritesList.includes(cocktail.name);
            return `
            <div class="cocktail-card">
                <img src="${cocktail.image || '/images/default-cocktail.jpg'}" alt="${cocktail.name}" class="cocktail-image">
                <div class="cocktail-info">
                    <div class="cocktail-content">
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
                    <div class="cocktail-footer">
                        <button class="fav-btn" data-name="${cocktail.name}">
                            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <a href="/cocktail.html?name=${encodeURIComponent(cocktail.name)}" class="discover-btn">Découvrir <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>`;
        }).join('');

        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const name = btn.dataset.name;
                const icon = btn.querySelector('i');
                if (icon.classList.contains('fas')) {
                    await removeFromFavorites(name);
                    icon.classList.replace('fas', 'far');
                } else {
                    await addToFavorites(name);
                    icon.classList.replace('far', 'fas');
                }
            });
        });
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
        displayCocktails(filteredCocktails, favorites);
    }

    // Événement de recherche
    searchInput.addEventListener('input', (e) => {
        searchCocktails(e.target.value);
    });

    // Charger les cocktails au chargement de la page
    loadCocktails();
}); 
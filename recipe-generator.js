document.addEventListener('DOMContentLoaded', function() {
    const recipeForm = document.getElementById('recipeForm');
    const recipeList = document.getElementById('recipeList');
    const resultsDiv = document.getElementById('results');
    const apiKey = '22379668fc0642c1b19cc08530434133'; // **Your Spoonacular API Key**
    const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch';

    recipeForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const ingredientsInput = document.getElementById('ingredients').value;
        const dietaryPreference = document.getElementById('dietary_preference').value;
        const timeTakenInput = document.getElementById('time_taken').value;
        const mealType = document.getElementById('meal_type').value;

        let ingredients = ingredientsInput.split(',').map(ing => ing.trim()).filter(ing => ing !== '');
        const query = ingredients.join(', '); // Spoonacular uses 'query' for ingredients

        let apiUrl = `${baseUrl}?apiKey=${apiKey}`;

        if (query) {
            apiUrl += `&query=${encodeURIComponent(query)}`;
        }

        if (dietaryPreference) {
            apiUrl += `&diet=${encodeURIComponent(dietaryPreference)}`;
        }

        if (timeTakenInput) {
            // Spoonacular uses 'maxReadyTime' in minutes
            const timeInMinutes = parseInt(timeTakenInput.replace(/\D/g, '')); // Extract numbers
            if (!isNaN(timeInMinutes)) {
                apiUrl += `&maxReadyTime=${timeInMinutes}`;
            }
        }

        if (mealType) {
            apiUrl += `&type=${encodeURIComponent(mealType.toLowerCase())}`; // Spoonacular uses lowercase
        }

        // Add other parameters as needed (e.g., number of results)
        apiUrl += `&number=10`; // Request up to 10 results

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayRecipes(data.results); // Spoonacular's complexSearch returns results in an array
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                recipeList.innerHTML = '<p class="error">Failed to fetch recipes from Spoonacular. Please check your API key and try again later.</p>';
                resultsDiv.style.display = 'block';
            });

        resultsDiv.style.display = 'block';
        recipeList.innerHTML = '<p>Searching for recipes from Spoonacular...</p>';
    });

    function displayRecipes(recipes) {
        recipeList.innerHTML = ''; // Clear previous results

        if (recipes && recipes.length > 0) {
            recipes.forEach(recipe => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${recipe.title}</h3>
                    <img src="${recipe.image}" alt="${recipe.title}" width="200">
                    <p><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
                    <p><strong>Servings:</strong> ${recipe.servings}</p>
                    <button class="view-recipe" data-id="${recipe.id}">View Recipe Details</button>
                    <hr>
                `;
                recipeList.appendChild(listItem);
            });

            // Add event listeners to the "View Recipe Details" buttons
            const viewButtons = document.querySelectorAll('.view-recipe');
            viewButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const recipeId = this.getAttribute('data-id');
                    fetchRecipeDetails(recipeId);
                });
            });

        } else {
            recipeList.innerHTML = '<p>No recipes found matching your criteria on Spoonacular.</p>';
        }
    }

    function fetchRecipeDetails(recipeId) {
        const detailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=false`;
        recipeList.innerHTML = '<p>Fetching recipe details...</p>';

        fetch(detailsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(recipeDetails => {
                displayRecipeDetails(recipeDetails);
            })
            .catch(error => {
                console.error('Error fetching recipe details:', error);
                recipeList.innerHTML = '<p class="error">Failed to fetch details for this recipe.</p>';
            });
    }

    function displayRecipeDetails(recipe) {
        recipeList.innerHTML = ''; // Clear the list
        const recipeDetailsDiv = document.createElement('div');
        recipeDetailsDiv.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}" width="300">
            <p><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
            <p><strong>Servings:</strong> ${recipe.servings}</p>
            <h4>Ingredients:</h4>
            <ul>
                ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
            </ul>
            <h4>Instructions:</h4>
            ${recipe.instructions ? `<p>${recipe.instructions}</p>` : (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? `<ol>${recipe.analyzedInstructions[0].steps.map(step => `<li>${step.step}</li>`).join('')}</ol>` : '<p>Instructions not available.</p>')}
            <button onclick="document.getElementById('results').scrollIntoView({ behavior: 'smooth' });">Back to Search Results</button>
        `;
        recipeList.appendChild(recipeDetailsDiv);
    }
});

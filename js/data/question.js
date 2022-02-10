import * as api from './api.js';
import { addOwner, endpoints } from './data.js';


const pageSize = 5;

export async function getRecentRecipes() {
    return api.get(endpoints.recent);
}

export async function getRecipes(page, query) {
    const data = await (() => {
        if (query) {
            query = {
                name: {
                    $text: {
                        $search: {
                            $term: query,
                            $caseSensitive: false
                        }
                    }
                }
            };
            return api.get(endpoints.recipeSearch(page, query, pageSize));
        } else {
            return api.get(endpoints.recipes(page, pageSize));
        }
    })();
    data.pages = Math.ceil(data.count / pageSize);

    return data;
}

export async function getRecipeById(id) {
    return api.get(endpoints.recipeDetails(id));
}

export async function createRecipe(recipe) {
    addOwner(recipe);
    return api.post(endpoints.createRecipe, recipe);
}

export async function updateRecipe(id, recipe) {
    return api.put(endpoints.recipeById + id, recipe);
}

export async function deleteRecipe(id) {
    return api.del(endpoints.recipeById + id);
}
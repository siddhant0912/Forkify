import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchview from './views/searchView';
import * as RecipeView from './views/RecipeView';
import Recipe from './models/Recipe'
/*
Global Object
-Search Object
-Currenr recipe object
-liked recipes
*/
const state = {};

const controlSearch = async() => {
    //1. Get Query from view
    const query = searchview.getInput();

    if (query) {
        //2.New Search object and add to state
        state.search = new Search(query);
    }

    //3.Prepare UI for results
    searchview.clearInput();
    searchview.clearResults();
    renderLoader(elements.searchRes);


    try {
        //4.Search for Recipes
        await state.search.getResults();

        //5.Render results on ui
        clearLoader();
        searchview.renderResults(state.search.result);
    } catch (err) {
        alert(err);
        clearLoader();
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        console.log(btn.dataset.goto);
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchview.clearResults();
        searchview.renderResults(state.search.result, goToPage);
    }

});

//Recipe Controller
const controlRecipe = async() => {

    //get id from url
    const id = window.location.hash.replace('#', '');
    if (id) {
        //prepare ui
        RecipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected seach
        if (state.search) {
            searchview.highlightedSelected(id);
        }
        //create new recipe object
        state.recipe = new Recipe(id);

        ;
        try {
            //get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            RecipeView.renderRecipe(state.recipe);

        } catch (error) {
            alert(error);
        }
    }
};


window.addEventListener('hashchange', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//recipe button click
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            //decrease button is clicked
            state.recipe.updateServings('dec');
            RecipeView.updateServingsIng(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //decrease button is clicked
        state.recipe.updateServings('inc');
        RecipeView.updateServingsIng(state.recipe);
    }

});
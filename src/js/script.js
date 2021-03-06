import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchview from './views/searchView';
import * as RecipeView from './views/RecipeView';
import Recipe from './models/Recipe';
import * as likesView from './views/likesView';
import * as listView from './views/listView';
import List from './models/list';
import Likes from './models/Likes';
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


        try {
            //get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            RecipeView.renderRecipe(state.recipe,
                state.likes.isLiked(id));

        } catch (error) {
            alert(error);
        }
    } else {
        RecipeView.clearRecipe();
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//List Controller

const controlList = () => {
    //create a new list if there in none yet
    if (!state.list) state.list = new List();

    //add each ingredient to list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list item events

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete event
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);

        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = ParseFloat(e.target.value, 10);
        state.list.updateCount(id, val);

    }
});


//Like Controller


const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;


    if (!state.likes.isLiked(currentID)) {
        //add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img

        );
        //toggle like button
        likesView.toggleLikeBtn(true);

        //add like to ui list
        likesView.renderLike(newLike);

    } else {
        //remove like from state
        state.likes.deleteLike(currentID);

        //toggle button
        likesView.toggleLikeBtn(false);

        //remove recipe from list
        likesView.deleteLike(currentID);

    }
    //likesView.toggleLikeMenu(state.likes.getNumberLikes);
};
//restore old data 
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    //likesView.toggleLikeMenu(state.likes.getNumberLikes());
    state.likes.likes.forEach(like => {
        likesView.renderLike(like);
    })
})





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
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }

});
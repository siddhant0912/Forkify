import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchview from './views/searchView';
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



    //4.Search for Recipes
    await state.search.getResults();

    //5.Render results on ui
    clearLoader();
    searchview.renderResults(state.search.result);
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
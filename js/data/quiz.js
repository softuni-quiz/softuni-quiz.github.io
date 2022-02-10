import * as api from './api.js';
import { endpoints } from './data.js';


export async function getCategories() {
    return api.get(endpoints.categories);
}
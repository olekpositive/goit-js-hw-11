import axios from 'axios';

const API_KEY = '32276489-0c8ab20b7135ee0e80075b904';
const BASE_URL = 'https://pixabay.com/api/';

export default class ImagesApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
        this.loadedHits = 0;
    }

    async fetchImages() {
        const searchParams = new URLSearchParams({
            key: API_KEY,
            q: this.searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            page: this.page,
            per_page: 40,
        });

        const url = `${BASE_URL}?${searchParams}`;

        try {
            const response = await axios.get(url);
            this.incrementPage();

            return response.data;
        } catch (error) {
            console.warn(`${error}`);
        }
    }

    incrementLoadedHits(hits) {
        this.loadedHits += hits.length;
    }

    resetLoadedHits() {
        this.loadedHits = 0;
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}
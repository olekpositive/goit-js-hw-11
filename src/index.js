import ImagesApiService from './js/search-images';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const x = {
    searchForm: document.querySelector('.search-form'),
    galleryContainer: document.querySelector('.gallery'),
    wrapper: document.querySelector('.wrapper'),
    toTopBtn: document.querySelector('.top-btn'),
};

const imagesApiService = new ImagesApiService();
const gallery = new SimpleLightbox('.gallery a');

const optionsForObserver = {
    rootMargin: '250px',
};
const observer = new IntersectionObserver(onEntry, optionsForObserver);

x.searchForm.addEventListener('submit', onSearch);
x.toTopBtn.addEventListener('click', onTopScroll);

window.addEventListener('scroll', onScrollToTopBtn);

function onSearch(e) {
    e.preventDefault();

    imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();

    imagesApiService.resetLoadedHits();
    imagesApiService.resetPage();
    clearGelleryContainer();

    if (!imagesApiService.query) {
        return erorrQuery();
    }

    imagesApiService.fetchImages().then(({ hits, totalHits }) => {
        if (!hits.length) {
            return erorrQuery();
        }

        observer.observe(x.wrapper);
        imagesApiService.incrementLoadedHits(hits);
        createGalleryMarkup(hits);
        accessQuery(totalHits);
        gallery.refresh();

        if (hits.length === totalHits) {
            observer.unobserve(x.wrapper);
            endOfSearch();
        }
    });

    observer.unobserve(x.wrapper);
}

function onEntry(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && imagesApiService.query) {
            imagesApiService
                .fetchImages()
                .then(({ hits, totalHits }) => {
                    imagesApiService.incrementLoadedHits(hits);
                    if (totalHits <= imagesApiService.loadedHits) {
                        observer.unobserve(x.wrapper);
                        endOfSearch();
                    }

                    createGalleryMarkup(hits);
                    smoothScrollGallery();
                    gallery.refresh();
                })
                .catch(error => {
                    console.warn(`${error}`);
                });
        }
    });
}

function accessQuery(totalHits) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
}

function endOfSearch() {
    Notify.info("We're sorry, but you've reached the end of search results.");
}

function erorrQuery() {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function clearGelleryContainer() {
    x.galleryContainer.innerHTML = '';
}

function createGalleryMarkup(images) {
    const markup = images
        .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
            return `
    <div class="photo-card">
      <a href="${webformatURL}">
        <img
          class="photo-card__img"
          src="${largeImageURL}" 
          alt="${tags}" 
          loading="lazy" 
          width="320"
          height="212"
        />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          <span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span>${downloads}</span>
        </p>
      </div>
    </div>
    `;
        })
        .join('');

    x.galleryContainer.insertAdjacentHTML('beforeend', markup);
}

function onScrollToTopBtn() {
    const offsetTrigger = 100;
    const pageOffset = window.pageYOffset;

    pageOffset > offsetTrigger
        ? x.toTopBtn.classList.remove('is-hidden')
        : x.toTopBtn.classList.add('is-hidden');
}

function onTopScroll() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

function smoothScrollGallery() {
    const { height } = x.galleryContainer.firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: height * 2,
        behavior: 'smooth',
    });
}
import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const textInput = document.querySelector('[name="searchQuery"]');
const searchButton = document.querySelector('button');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const pixabayKey = '33931117-8e8fb6a7b04df62fca5cb1dd6';

const lightbox = new SimpleLightbox('.gallery a');

let page = 1;
let limit = 40;

searchButton.addEventListener('click', async event => {
  event.preventDefault();
  try {
    page = 1;
    const responseData = await fetchImages();
    if (responseData.totalHits === 0) {
      gallery.innerHTML = '';
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (responseData.totalHits <= limit) {
      gallery.innerHTML = '';
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info(
        `Hooray! We found ${responseData.totalHits} images.`
      );
      renderImages(responseData.hits);
    } else {
      gallery.innerHTML = '';
      Notiflix.Notify.info(
        `Hooray! We found ${responseData.totalHits} images.`
      );
      renderImages(responseData.hits);
      loadMoreButton.style.display = 'block';
      page += 1;
    }
  } catch (error) {
    console.log(error);
  }
});

loadMoreButton.addEventListener('click', async event => {
  event.preventDefault();
  const responseDataMore = await fetchImages();
  renderImages(responseDataMore.hits);
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.7,
    behavior: 'smooth',
  });
  if (responseDataMore.totalHits <= page * limit) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results"
    );
    loadMoreButton.style.display = 'none';
  }
  page += 1;
});

function renderImages(images) {
  const markup = images
    .map(
      image =>
        `<div class="photo-card">
              <a href="${image.largeImageURL}"><img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" width="330" height="270"/></a>
              <div class="info">
                <p class="info-item">
                  <b>Likes</b> ${image.likes}
                </p>
                <p class="info-item">
                  <b>Views</b> ${image.views}
                </p>
                <p class="info-item">
                  <b>Comments</b> ${image.comments}
                </p>
                <p class="info-item">
                  <b>Downloads</b> ${image.downloads}
                </p>
              </div>
            </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

async function fetchImages() {
  const params = new URLSearchParams({
    key: pixabayKey,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: limit,
    page: page,
  });
  const response = await axios.get(
    `https://pixabay.com/api?q=${textInput.value}&${params}`
  );
  return response.data;
}

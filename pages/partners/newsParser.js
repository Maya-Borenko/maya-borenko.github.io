const NEWS_INTERVAL = 7000;
let newsData = [];
let currentNewsIndex = 0;
let newsInterval;
let isAnimating = false;
const cardHeight = 150;

const NEWS_JSON_URL = './news.json';

async function getNews() {
    try {
        const response = await fetch(NEWS_JSON_URL);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (!jsonData.news || !Array.isArray(jsonData.news)) {
            throw new Error('Некорректный формат JSON: отсутствует массив news');
        }
        
        return parseJSONNews(jsonData.news);
        
    } catch (error) {
        console.error('Ошибка при загрузке новостей из JSON:', error);
        return getFallbackNews();
    }
}

function parseJSONNews(newsArray) {
    const news = [];
    
    newsArray.forEach((item, index) => {
        if (item.text) {
            news.push({
                id: index,
                text: item.text,
                date: item.date || '',
                link: item.link || '#',
                img: item.img || null
            });
        }
    });
    
    return news;
}

function displayCurrentNews() {
    if (newsData.length === 0) {
        document.getElementById('newsTitle').textContent = 'Нет новостей для отображения';
        return;
    }
    
    const news = newsData[currentNewsIndex];
    const titleElement = document.getElementById('newsTitle');
    const imgElement = document.getElementById('newsImage');
    
    if (!titleElement || !imgElement) return;
    
    titleElement.textContent = news.text;
    
    if (news.img) {
        imgElement.src = news.img;
        imgElement.alt = 'Картинка к новости';
    } else {
        imgElement.src = './img/test/loading.png';
        imgElement.alt = 'Нет изображения';
    }
    
    updateNewsDots();
}

function createNewsDots() {
    const dotsContainer = document.getElementById('newsSliderDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';

    if (newsData.length <= 1) {
        dotsContainer.style.display = 'none';
        return;
    } else {
        dotsContainer.style.display = 'flex';
    }
    
    for (let i = 0; i < newsData.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'news-slider-dot';
        
        if (i === currentNewsIndex) {
            dot.classList.add('active');
        }
        
        dot.addEventListener('click', () => {
            goToNews(i);
        });
        
        dotsContainer.appendChild(dot);
    }
}

function updateNewsDots() {
    if (newsData.length <= 1) return;
    const dots = document.querySelectorAll('.news-slider-dot');
    dots.forEach((dot, index) => {
        if (index === currentNewsIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function goToNews(index) {
    if (newsData.length <= 1) return;
    if (index < 0 || index >= newsData.length || isAnimating) return;
    
    currentNewsIndex = index;
    displayCurrentNews();
    restartNewsSlider();
}

function nextNews() {
    if (newsData.length <= 1 || isAnimating) return;
    
    isAnimating = true;
    slideNewsDown(() => {
        currentNewsIndex = (currentNewsIndex + 1) % newsData.length;
        updateNewsDots();
        isAnimating = false;
    });
}

function slideNewsDown(callback) {
    if (newsData.length <= 1) {
        if (callback) callback();
        return;
    }
    
    const newsCard = document.getElementById('newsCard');
    const newsContent = newsCard.querySelector('.news-content');
    const titleElement = document.getElementById('newsTitle');
    const imgElement = document.getElementById('newsImage');
    
    if (!newsCard || !newsContent || !titleElement || !imgElement) {
        if (callback) callback();
        return;
    }    
    
    const currentNews = newsData[currentNewsIndex];
    const nextIndex = (currentNewsIndex + 1) % newsData.length;
    const nextNews = newsData[nextIndex];
    const newsCardWidth = newsCard.offsetWidth;
    
    
    const textContainerWidth = newsCardWidth - 190 - 35;
    
    const animationContainer = document.createElement('div');
    animationContainer.className = 'news-content-animation';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = `${newsCardWidth}px`;
    animationContainer.style.height = `${cardHeight}px`;
    animationContainer.style.overflow = 'hidden';
    
    const currentContent = document.createElement('div');
    currentContent.className = 'news-content';
    currentContent.style.position = 'absolute';
    currentContent.style.top = '0';
    currentContent.style.left = '0';
    currentContent.style.width = `${newsCardWidth}px`;
    currentContent.style.height = `${cardHeight}px`;
    currentContent.style.display = 'flex';
    currentContent.style.flexDirection = 'row';
    currentContent.style.justifyContent = 'space-between';
    currentContent.style.alignItems = 'stretch';
    currentContent.style.transform = 'translateY(0)';
    currentContent.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    const currentImg = document.createElement('img');
    currentImg.id = 'newsImageTemp';
    currentImg.src = currentNews.img || './img/test/loading.png';
    currentImg.alt = currentNews.img ? 'Картинка к новости' : 'Нет изображения';
    currentImg.style.borderRadius = '5px 0 0 5px';
    currentImg.style.alignSelf = 'center';
    currentImg.style.height = '100%';
    currentImg.style.width = '190px';
    currentImg.style.objectFit = 'cover';
    currentImg.style.flexShrink = '0';
    
    const currentText = document.createElement('div');
    currentText.className = 'news-text';
    currentText.style.width = `${textContainerWidth}px`;
    currentText.style.height = '150px';
    currentText.style.padding = '15px 18px';
    currentText.style.flex = '1';
    currentText.style.minWidth = '0';
    currentText.style.overflow = 'hidden';
    
    const currentTitle = document.createElement('h3');
    currentTitle.className = 'news-card-title';
    currentTitle.textContent = currentNews.text;
    currentTitle.style.margin = '0';
    currentTitle.style.height = '100%';
    currentTitle.style.fontSize = '22px';
    currentTitle.style.fontWeight = '100';
    currentTitle.style.overflow = 'hidden';
    currentTitle.style.textAlign = 'justify';
    currentTitle.style.display = '-webkit-box';
    currentTitle.style.webkitLineClamp = '5';
    currentTitle.style.webkitBoxOrient = 'vertical';
    
    currentText.appendChild(currentTitle);
    
    const currentDots = document.createElement('div');
    currentDots.className = 'news-slider-dots';
    currentDots.style.display = 'flex';
    currentDots.style.flexDirection = 'column';
    currentDots.style.alignSelf = 'center';
    currentDots.style.alignItems = 'center';
    currentDots.style.justifyContent = 'center';
    currentDots.style.gap = '15px';
    currentDots.style.padding = '20px 20px 20px 0';
    currentDots.style.flexShrink = '0';
    currentDots.style.width = '35px';
    
    currentContent.appendChild(currentImg);
    currentContent.appendChild(currentText);
    currentContent.appendChild(currentDots);
    
    const nextContent = document.createElement('div');
    nextContent.className = 'news-content';
    nextContent.style.position = 'absolute';
    nextContent.style.top = `${cardHeight}px`;
    nextContent.style.left = '0';
    nextContent.style.width = `${newsCardWidth}px`;
    nextContent.style.height = `${cardHeight}px`;
    nextContent.style.display = 'flex';
    nextContent.style.flexDirection = 'row';
    nextContent.style.justifyContent = 'space-between';
    nextContent.style.alignItems = 'stretch';
    nextContent.style.transform = 'translateY(0)';
    nextContent.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    const nextImg = document.createElement('img');
    nextImg.id = 'newsImageTempNext';
    nextImg.src = nextNews.img || './img/test/loading.png';
    nextImg.alt = nextNews.img ? 'Картинка к новости' : 'Нет изображения';
    nextImg.style.borderRadius = '5px 0 0 5px';
    nextImg.style.alignSelf = 'center';
    nextImg.style.height = '100%';
    nextImg.style.width = '190px';
    nextImg.style.objectFit = 'cover';
    nextImg.style.flexShrink = '0';
    
    const nextText = document.createElement('div');
    nextText.className = 'news-text';
    nextText.style.width = `${textContainerWidth}px`;
    nextText.style.height = '150px';
    nextText.style.padding = '15px 18px';
    nextText.style.flex = '1';
    nextText.style.minWidth = '0';
    nextText.style.overflow = 'hidden';
    
    const nextTitle = document.createElement('h3');
    nextTitle.className = 'news-card-title';
    nextTitle.textContent = nextNews.text;
    nextTitle.style.margin = '0';
    nextTitle.style.height = '100%';
    nextTitle.style.fontSize = '22px';
    nextTitle.style.fontWeight = '100';
    nextTitle.style.overflow = 'hidden';
    nextTitle.style.textAlign = 'justify';
    nextTitle.style.display = '-webkit-box';
    nextTitle.style.webkitLineClamp = '5';
    nextTitle.style.webkitBoxOrient = 'vertical';
    
    nextText.appendChild(nextTitle);
    
    const nextDots = document.createElement('div');
    nextDots.className = 'news-slider-dots';
    nextDots.style.display = 'flex';
    nextDots.style.flexDirection = 'column';
    nextDots.style.alignSelf = 'center';
    nextDots.style.alignItems = 'center';
    nextDots.style.justifyContent = 'center';
    nextDots.style.gap = '15px';
    nextDots.style.padding = '20px 20px 20px 0';
    nextDots.style.flexShrink = '0';
    nextDots.style.width = '35px';
    
    nextContent.appendChild(nextImg);
    nextContent.appendChild(nextText);
    nextContent.appendChild(nextDots);
    
    animationContainer.appendChild(currentContent);
    animationContainer.appendChild(nextContent);
    
    newsContent.style.visibility = 'hidden';
    newsCard.appendChild(animationContainer);
    
    setTimeout(() => {
        currentContent.style.transform = `translateY(-${cardHeight}px)`;
        nextContent.style.transform = `translateY(-${cardHeight}px)`;
    }, 50);
    
    setTimeout(() => {
        animationContainer.remove();
        
        titleElement.textContent = nextNews.text;
        if (nextNews.img) {
            imgElement.src = nextNews.img;
            imgElement.alt = 'Картинка к новости';
        } else {
            imgElement.src = './img/test/loading.png';
            imgElement.alt = 'Нет изображения';
        }
        
        newsContent.style.visibility = 'visible';
        
        updateNewsDots();
        
        if (callback) callback();
    }, ANIMATION_DURATION + 50);
}

function startNewsSlider() {
    if (newsData.length <= 1) {
        console.log('Слайдер не запущен: недостаточно новостей');
        return;
    }
    stopNewsSlider();
    newsInterval = setInterval(nextNews, NEWS_INTERVAL);
}

function stopNewsSlider() {
    if (newsInterval) {
        clearInterval(newsInterval);
        newsInterval = null;
    }
}

function restartNewsSlider() {
    if (newsData.length <= 1) return;
    stopNewsSlider();
    setTimeout(startNewsSlider, NEWS_INTERVAL);
}

function getFallbackNews() {
    return [
        {
            id: 1,
            text: 'Ошибка загрузки новостей',
            date: '',
            link: '#',
            img: null
        }
    ];
}

async function initNews() {
    try {
        document.getElementById('newsTitle').textContent = 'Загрузка новостей...';
        
        newsData = await getNews();
        
        if (newsData.length === 0) {
            console.log('Используем тестовые новости');
            newsData = getTestNews();
        }
        
        const newsCard = document.getElementById('newsCard');
        if (newsCard) {
            newsCard.style.height = `${cardHeight}px`;
            newsCard.style.overflow = 'hidden';
            newsCard.style.position = 'relative';
        }
        
        createNewsDots();
        displayCurrentNews();
        if (newsData.length > 1) {
            startNewsSlider();
        }
        
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        newsData = getFallbackNews();
        createNewsDots();
        displayCurrentNews();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initNews();
    
    const newsCard = document.getElementById('newsCard');
    if (newsCard) {
        if (newsData.length > 1) {
            newsCard.addEventListener('mouseenter', stopNewsSlider);
            newsCard.addEventListener('mouseleave', startNewsSlider);
        }
    }
});

setInterval(async () => {
    try {
        const newNews = await getNews();
        if (newNews.length > 0) {
            const hadMultipleNews = newsData.length > 1;
            newsData = newNews;
            createNewsDots();
            displayCurrentNews();
            
            if (hadMultipleNews && newsData.length > 1) {
                startNewsSlider();
            }
        }
    } catch (error) {
        console.log('Не удалось обновить новости:', error);
    }
}, 5 * 60 * 1000);
const NEWS_INTERVAL = 7000;
let newsData = [];
let currentNewsIndex = 0;
let newsInterval;
let isAnimating = false;
const cardHeight = 150;

async function getNews() {
    try {
        const sheetId = '1mmrg6_cJ_TyYcA4uhYoAA6xpjtw_XLhzEdyGarw0csc';
        
        const proxyUrl = 'https://corsproxy.io/?';
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        const url = proxyUrl + encodeURIComponent(sheetUrl);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const csvText = await response.text();
        return parseCSV(csvText);
        
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        return getFallbackNews();
    }
}

async function getNewsAlt() {
    try {
        const proxies = [
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://corsproxy.io/?',
            'https://proxy.cors.sh/'
        ];
        
        const sheetId = '1mmrg6_cJ_TyYcA4uhYoAA6xpjtw_XLhzEdyGarw0csc';
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        for (const proxy of proxies) {
            try {
                const url = proxy + encodeURIComponent(sheetUrl);
                const response = await fetch(url);
                
                if (response.ok) {
                    const csvText = await response.text();
                    const news = parseCSV(csvText);
                    if (news.length > 0) return news;
                }
            } catch (e) {
                console.log(`Прокси ${proxy} не сработал`);
                continue;
            }
        }
        
        throw new Error('Все прокси не сработали');
        
    } catch (error) {
        console.error('Ошибка:', error);
        return getFallbackNews();
    }
}

function parseCSV(csvText) {
    const rows = csvText.split('\n');
    const news = [];
    
    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].trim();
        
        const cleanText = text.replace(/^"|"$/g, '');
        
        if (cleanText) {
            news.push({
                id: i,
                text: cleanText,
                date: '',
                link: '#'
            });
        }
    }
    
    return news;
}

function displayCurrentNews() {
    if (newsData.length === 0) {
        document.getElementById('newsTitle').textContent = 'Нет новостей для отображения';
        return;
    }
    
    const news = newsData[currentNewsIndex];
    document.getElementById('newsTitle').textContent = news.text;
    updateNewsDots();
}

function createNewsDots() {
    const dotsContainer = document.getElementById('newsSliderDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
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
    if (index < 0 || index >= newsData.length || isAnimating) return;
    
    currentNewsIndex = index;
    displayCurrentNews();
    restartNewsSlider();
}

function nextNews() {
    if (newsData.length === 0 || isAnimating) return;
    
    isAnimating = true;
    slideNewsDown(() => {
        currentNewsIndex = (currentNewsIndex + 1) % newsData.length;
        updateNewsDots();
        isAnimating = false;
    });
}

function slideNewsDown(callback) {
    const newsCard = document.getElementById('newsCard');
    const titleElement = document.getElementById('newsTitle');
    
    if (!newsCard || !titleElement) {
        if (callback) callback();
        return;
    }    
    
    const currentText = titleElement.textContent;
    
    const nextIndex = (currentNewsIndex + 1) % newsData.length;
    const nextText = newsData[nextIndex].text;
    
    const animationContainer = document.createElement('div');
    animationContainer.id = 'newsAnimationContainer';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100%';
    animationContainer.style.height = `${cardHeight}px`;
    animationContainer.style.overflow = 'hidden';
    
    const currentDiv = document.createElement('h3');
    currentDiv.className = 'news-card-title current-news';
    currentDiv.textContent = currentText;
    currentDiv.style.position = 'absolute';
    currentDiv.style.top = '0';
    currentDiv.style.left = '0';
    currentDiv.style.width = '100%';
    currentDiv.style.height = `${cardHeight}px`;
    currentDiv.style.margin = '0';
    currentDiv.style.padding = '20px';
    currentDiv.style.boxSizing = 'border-box';
    currentDiv.style.display = 'flex';
    currentDiv.style.alignItems = 'center';
    currentDiv.style.justifyContent = 'center';
    currentDiv.style.transform = 'translateY(0)';
    currentDiv.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    const nextDiv = document.createElement('h3');
    nextDiv.className = 'news-card-title next-news';
    nextDiv.textContent = nextText;
    nextDiv.style.position = 'absolute';
    nextDiv.style.top = `${cardHeight}px`;
    nextDiv.style.left = '0';
    nextDiv.style.width = '100%';
    nextDiv.style.height = `${cardHeight}px`;
    nextDiv.style.margin = '0';
    nextDiv.style.padding = '20px';
    nextDiv.style.boxSizing = 'border-box';
    nextDiv.style.display = 'flex';
    nextDiv.style.alignItems = 'center';
    nextDiv.style.justifyContent = 'center';
    nextDiv.style.transform = 'translateY(0)';
    nextDiv.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    animationContainer.appendChild(currentDiv);
    animationContainer.appendChild(nextDiv);
    
    titleElement.style.visibility = 'hidden';
    const newsContent = newsCard.querySelector('.news-content');
    if (newsContent) {
        newsContent.style.position = 'relative';
        newsContent.appendChild(animationContainer);
    }
    
    setTimeout(() => {
        currentDiv.style.transform = `translateY(-${cardHeight}px)`;
        nextDiv.style.transform = `translateY(-${cardHeight}px)`;
    }, 50);
    
    setTimeout(() => {
        titleElement.textContent = nextText;
        titleElement.style.visibility = 'visible';
        
        animationContainer.remove();
        
        updateNewsDots();
        
        if (callback) callback();
    }, ANIMATION_DURATION + 50);
}

function startNewsSlider() {
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
    stopNewsSlider();
    setTimeout(startNewsSlider, NEWS_INTERVAL);
}

function getFallbackNews() {
    return [
        {
            id: 1,
            text: 'Ошибка загрузки новостей',
            date: '',
            link: '#'
        }
    ];
}


async function initNews() {
    try {
        document.getElementById('newsTitle').textContent = 'Загрузка новостей...';
        
        newsData = await getNewsAlt();
        
        if (newsData.length === 0) {
            console.log('Используем тестовые новости');
            newsData = getTestNews();
        }
        
        setTimeout(() => {
            const newsCard = document.getElementById('newsCard');
            if (newsCard) {
                const titleElement = document.getElementById('newsTitle');
                if (titleElement) {
                    newsCard.style.height = `${cardHeight}px`;
                    newsCard.style.minHeight = `${cardHeight}px`;
                    newsCard.style.overflow = 'hidden';
                }
            }
        }, 100);
        
        createNewsDots();
        displayCurrentNews();
        startNewsSlider();
        
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        newsData = getTestNews();
        createNewsDots();
        displayCurrentNews();
        startNewsSlider();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initNews();
    
    const newsCard = document.getElementById('newsCard');
    if (newsCard) {
        newsCard.addEventListener('mouseenter', stopNewsSlider);
        newsCard.addEventListener('mouseleave', startNewsSlider);
    }
});

setInterval(async () => {
    try {
        const newNews = await getNewsAlt();
        if (newNews.length > 0) {
            newsData = newNews;
            createNewsDots();
            displayCurrentNews();
        }
    } catch (error) {
        console.log('Не удалось обновить новости:', error);
    }
}, 5 * 60 * 1000);
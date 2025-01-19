const searchInput = document.querySelector('#search');
const suggestionsList = document.getElementById('suggestions');

let callLimit = 3;
let currentPage = 1;
let recomandList = [];
let callCount, apiPage, searchTerm, totalPage, isFirstClickNext, isFirstClickPrev, endPageNo, pageList, minPage, maxPage;

const resetPages = () => {
    endPageNo = 1;
    callCount = 0;
    currentPage = 1;
    isFirstClickNext = true;
    isFirstClickPrev = true;
    searchTerm = "";
    apiPage = 1;
    pageList = [0];
    document.querySelector('#page_container').innerHTML = "";
    document.querySelector('.Listbtn').innerHTML = "";
}

// call api when press enter button on keyboard
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        resetPages();
        suggestionsList.style.display = 'none';
        activePage(currentPage++);
    }
});

// APi Key
const apiKey = 'N65LIHu4lbYlIKqEmv1wxmPlDlh-Qc7FMvFfyXMEJ70'//'dFYNbTnC21p4mGHV9CasL-kTnlm53CDdSyuc_OuzQmI';

// pagination
const pagebtnContainer = document.querySelector('.pagebtn_container');

// display div based on selected number
function displayPage(currentPage) {
    if (currentPage) {
        for (index of pageList) {
            if (index) {
                if (index !== currentPage) {
                    document.getElementById(`image_container_${index}`).classList.add('D-none');
                    document.querySelector(`.link${index}`).classList.remove('active');
                } else {
                    document.getElementById(`image_container_${index}`).classList.remove('D-none');
                    document.querySelector(`.link${index}`).classList.add('active');
                }
            }
        }
    }
}

// crete new div while nextbutton or pagination number selected
const activePage = (currentPage = (event.target.value) ? event.target.value : 0) => {
    // console.table(currentPage,pageList);
    this.currentPage = currentPage;
    if (!pageList.includes(currentPage)) {
        pageList.push(currentPage);
        const imageContainerElement = document.createElement('div');
        imageContainerElement.id = `image_container_${currentPage}`;
        imageContainerElement.classList.add("image_container");
        endPageNo++;
        document.querySelector('#page_container').appendChild(imageContainerElement);
        imageContainer = document.getElementById(`image_container_${currentPage}`);
        callCount = 0;
        // pagebtnContainer.style.display = 'none';
        const pageButton = document.createElement('li');
        pageButton.textContent = currentPage;
        pageButton.value = currentPage;
        pageButton.classList.add('page_button');
        pageButton.classList.add(`link${currentPage}`);
        document.querySelector('.Listbtn').appendChild(pageButton);

        if (callCount === 0) {
            searchImage(imageContainer);
            callCount++;
        }
    }
    minPage = currentPage === endPageNo - 1 ? currentPage - 2 : currentPage - 1;
    maxPage = currentPage === 1 ? currentPage + 2 : currentPage + 1;
    updatePaginationButtons();
    displayPage(currentPage);
}


const updatePaginationButtons = () => {
    const pageButtons = document.querySelectorAll('.Listbtn li');
    if (maxPage > endPageNo) maxPage = endPageNo; // Ensure we don't go beyond the last page
    if (minPage < 1) minPage = 1; // Ensure we don't go below page 1
    pageButtons.forEach(button => button.classList.add('hidden'));
    pageButtons.forEach(button => {
        const pageNum = parseInt(button.textContent, 10); // Convert text to number
        if (pageNum >= minPage && pageNum <= maxPage) {
            button.classList.remove('hidden'); // Show buttons within the range
        }
    });
};

//display nextpage when next button clicked 
const nextPage = () => {
    event.preventDefault();
    if (isFirstClickNext && !isFirstClickPrev) {
        currentPage++;
        isFirstClickNext = false;
    }
    if (currentPage < totalPage) {
        activePage(currentPage++);
    }
    if (currentPage > 2) {
        minPage = pageList.includes(currentPage) ? currentPage - 2 : currentPage - 3;
        maxPage = currentPage;
    }
    updatePaginationButtons();
    isFirstClickPrev = true;
}

//display previouspage when previous button clicked 
const previousPage = () => {
    event.preventDefault();
    if (isFirstClickPrev) {
        currentPage--;
        isFirstClickPrev = false;
    }
    if (currentPage > 1) {
        activePage(--currentPage);
    } else if (currentPage == 1) {
        activePage(currentPage);
    }
    if (currentPage >= 1) {
        minPage = currentPage - 1;
        maxPage = currentPage === 1 ? currentPage + 2 : currentPage + 1;
    }
    updatePaginationButtons();
    isFirstClickNext = true;
}

const startPage = () => {
    event.preventDefault();
    currentPage = 1;
    isFirstClickNext = true;
    isFirstClickPrev = false;
    activePage(currentPage);
    minPage = currentPage;
    maxPage = currentPage + 2;
    updatePaginationButtons();
}

const endPage = () => {
    event.preventDefault();
    currentPage = totalPage;
    isFirstClickPrev = false;
    activePage(currentPage);
    minPage = currentPage - 2;
    maxPage = currentPage;
    updatePaginationButtons();
}


const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    if (scrollPosition >= pageHeight - 3 && callCount < callLimit) {
        displayLoading();
        setTimeout(() => { searchImage(imageContainer); }, 1500);
        callCount++;
    } else if (callCount >= callLimit) {
        pagebtnContainer.style.display = 'block';
    }
};


//api call function
const searchImage = (imageContainer) => {
    searchTerm = searchInput.value.trim();
    saveSuggestion(searchTerm); // Save selected suggestion to local storage
    const apiUrl = `https://api.unsplash.com/search/photos?page=${apiPage}&query=${searchTerm}&client_id=${apiKey}&per_page=8`;//api Url
    hideLoading();
    // Using fetch
    fetch(apiUrl).then(response => response.json())
        .then(data => {
            const imageResult = data.results;
            console.table(data);
            totalPage = data.total_pages;
            // document.querySelector('error').style.display = 'none';
            imageResult.map((image) => {
                const imgElement = document.createElement('img');
                imgElement.src = image.urls.small;
                imgElement.alt = image.alt_description;
                imgElement.classList.add('result-image');
                imageContainer.appendChild(imgElement);
            });
            const images = document.querySelectorAll('.result-image');
            // add transition to imgtag using intersection observer
            const observer = new IntersectionObserver((entries) => {
                entries.map((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('loaded')
                        observer.unobserve(entry.target);
                    }
                });
            });
            images.forEach(image => observer.observe(image));
            apiPage++;
            document.querySelector('#error').style.display = 'block';
        })
        .catch(error => {
            document.querySelector('#error').textContent = error;
            document.querySelector('#error').style.display = 'block';
            console.error('Error:', error);
        }
        );
}

window.addEventListener('scroll', handleScroll);// call api while scrolling

// Loading
const loadingIndicator = document.querySelector('#loading');

function displayLoading() {
    document.getElementById('page_container').style.opacity = 0.1;
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    document.getElementById('page_container').style.opacity = 1;
}

// Load saved suggestions from local storage
const loadSuggestions = () => {
    const savedSuggestions = JSON.parse(localStorage.getItem('suggestions')) || [];
    // return savedSuggestions.length > 0 ? savedSuggestions : recomandList; // Use sample data if no saved suggestions
    return savedSuggestions;
};

// Save suggestions to local storage
const saveSuggestion = (suggestion) => {
    // Add new suggestion if it doesn't already exist
    if (!recomandList.includes(suggestion)) {
        recomandList.push(suggestion);
        localStorage.setItem('suggestions', JSON.stringify(recomandList));
    }
};

// Filter suggestions based on user input
const filterSuggestions = (input) => {
    const suggestions = loadSuggestions();

    return suggestions.filter(item =>
        item.toLowerCase().includes(input.toLowerCase())
    );
};

// Show filtered suggestions in the dropdown
const showSuggestions = (suggestions) => {
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
            searchInput.value = suggestion; // Set input value to selected suggestion
            resetPages();
            suggestionsList.style.display = 'none'; // Clear suggestions if input is empty  
            activePage(currentPage++);
        });


        var ul = document.querySelector('#suggestions');
        var liSelected, index = -1;

        document.addEventListener('keydown', function (event) {
            // console.log("I am working");
            var items = ul.getElementsByTagName('li');
            var len = items.length - 1;
            if (items.length === 0) return; // No suggestions, do nothing
            if (event.key === 'ArrowDown') {
                index = (index + 1 > len) ? 0 : index + 1;
            } else if (event.key === 'ArrowUp') {
                index = (index - 1 < 0) ? len : index - 1;
            } else {
                return; // Ignore other keys
            }
            // Remove 'selected' class from previous selection
            if (liSelected) liSelected.classList.remove('selected');
            liSelected = items[index];
            searchInput.value = liSelected.textContent; // Set input value to selected suggestion
            liSelected.classList.add('selected');
        }, false);


        suggestionsList.appendChild(li);
    });
};

// Handle input event
searchInput.addEventListener('input', () => {
    const inputValue = searchInput.value.trim();
    suggestionsList.style.display = 'block'; // Clear suggestions if input is empty
    if (inputValue) {
        const filteredSuggestions = filterSuggestions(inputValue);
        showSuggestions(filteredSuggestions);
    } else {
        suggestionsList.style.display = 'none';
    }
    console.log(loadSuggestions());
});


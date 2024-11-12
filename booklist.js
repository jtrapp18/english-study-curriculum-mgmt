///////////////////////////////////////////////////////
// initialize book class
///////////////////////////////////////////////////////
class Book {
    constructor(title, author, image, description, notes, apiId){
        this.title = title
        this.author = author
        this.image = image
        this.description = description
        this.notes = notes
        this.apiId = apiId
    }
}

///////////////////////////////////////////////////////
// global variables
//////////////////////////////////////////////////////

const bookMenu = document.querySelector("div#all-books")
const searchForm = document.querySelector("form#search")
const addDropZone = document.querySelector("p#add-dropzone")
const baseUrl = "https://openlibrary.org" //search.json?q=javascript&fields=*,availability&limit=1
const coverImgUrl = "https://covers.openlibrary.org"

///////////////////////////////////////////////////////
// endpoint functions
//////////////////////////////////////////////////////

function getJSON(url){
    return fetch(url)
    .then((response) => {
        if(response.ok){
            return response.json()
        } else {
            throw new Error("Request failed")
        }
    })
    .catch((error) => console.log(error)) 
}

function validateAndSave(bookObj){
    getJSONbySearch("books", "apiId", bookObj.apiId)
    .then((data) => {
        if(data.length == 0){
            //console.log("insert")
            alert(`${bookObj.title} saved to curriculum`)
            postJSONToDb("books", bookObj)
            renderCurriculumBook(bookObj)
            switchToTab("curriculum")
        } else {
            //console.log("book already in cur")
            alert(`${bookObj.title} already in the curriculum`)
        }
    })
}

///////////////////////////////////////////////////////
// handler functions 
//////////////////////////////////////////////////////

const handleBookSearch = (e) => {
    e.preventDefault()
    let searchString = ""
    
    const searchQuery = e.target['book-search-query'].value
    const searchTitle = e.target['book-search-title'].value
    const searchAuthor = e.target['book-search-author'].value
    
    if(searchQuery){
        searchString += `q=${searchQuery}&fields=*,availability`
    }
    if(searchTitle){
        searchString += `&title=${searchTitle}`
    }
    if(searchAuthor){
        searchString += `&author=${searchAuthor}`
    }

    renderBookList(searchString)
}

const handleBtnAddCurriculum = (e) => {
    const bookDiv = e.currentTarget.parentNode
    const bookObj = new Book(bookDiv.getAttribute("data-title"), bookDiv.getAttribute("data-author"), bookDiv.getAttribute("data-image"), bookDiv.getAttribute("data-subject"), "", bookDiv.getAttribute("data-api-id"))
    //console.log(bookObj)
    //console.log(`${bookObj.title} saved to curriculum`)
    validateAndSave(bookObj)
}

const dragstartHandler = (ev) => {
    ev.dataTransfer.effectAllowed = "move";
    const bookObj = new Book(ev.target.dataset.title, ev.target.dataset.author, ev.target.dataset.image, ev.target.dataset.subject, "", ev.target.dataset.apiId)
    ev.dataTransfer.setData("text", JSON.stringify(bookObj))
}

const dragendHandler = (ev) => {
    addDropZone.style.backgroundColor = ""
}

const dragoverHandler = (ev) => {
    addDropZone.style.backgroundColor = "grey"
    ev.preventDefault()
    ev.dataTransfer.dropEffect = "move";
}

const dropHandler = (ev) => {
    ev.preventDefault()
    const bookString = ev.dataTransfer.getData("text")
    const bookObj = JSON.parse(bookString)
    validateAndSave(bookObj)
    
    const saveResponse = `${bookObj.title} added to curriculum`
    addDropZone.innerText = saveResponse
}

///////////////////////////////////////////////////////
// render book functions
//////////////////////////////////////////////////////

const renderBook = (book) => {
    //create book object
    const bookObj = new Book(book.title, Array.isArray(book.author_name) ? book.author_name[0] : book.author_name, "", Array.isArray(book.subject) ? book.subject[0] : book.subject, "", book.cover_i)
    
    //create required elements
    const bookListing = document.createElement("div")
    bookListing.classList.add("book-listing")
    bookListing.draggable = true 
    bookListing.addEventListener("dragstart", dragstartHandler)
    bookListing.addEventListener("dragend", dragendHandler)
    
    const bookInfo = document.createElement("div")
    bookInfo.classList.add("book-info")
    
    const bookTitle = document.createElement("h2")
    bookTitle.innerText = bookObj.title
    
    const bookAuthor = document.createElement("p")
    bookAuthor.innerText = bookObj.author
    
    const bookImg = document.createElement("img")

    const bookOverlay = document.createElement("div")
    bookOverlay.classList.add("overlay")
    
    const bookSubject = document.createElement("p")
    bookSubject.innerText = bookObj.description 
    
    const btnAddCurriculum = document.createElement("button")
    btnAddCurriculum.innerText = "add book to curriculum"
    btnAddCurriculum.addEventListener('click', handleBtnAddCurriculum)
    
    //add dataset to book div
    bookListing.dataset.title = bookObj.title
    bookListing.dataset.author = bookObj.author
    bookListing.dataset.subject = bookObj.description
    bookListing.dataset.apiId = bookObj.apiId
    
    //initialize book cover image
    bookImg.alt = `${bookObj.title} cover image`
    bookImg.id = bookObj.apiId
    bookImg.style.height = "150px" //TODO: move to CSS
    bookImg.style.width = "120px" //TODO: move to CSS

    getJSON(`${coverImgUrl}/b/id/${bookObj.apiId}.json`)
    .then((data) => {
        const updatedUrl = data.source_url
        bookImg.src = updatedUrl //update image url
        bookObj.image = updatedUrl //update bookObject
        bookListing.dataset.image = updatedUrl //update book div dataset
    })
    
    //append elements
    bookMenu.append(bookListing)
    bookListing.append(bookInfo, btnAddCurriculum)
    bookInfo.append(bookTitle, bookAuthor, bookImg, bookOverlay)
    bookOverlay.append(bookSubject)    
}

const renderBookList = (searchString) => {
    let query = "q=mystery&fields=*,availability"
    renderMessage("Books Loading", "please wait...")
    console.log("Loading")

    if(searchString){
        query = encodeURI(searchString)
    }
    getJSON(`${baseUrl}/search.json?${query}&limit=20`)
    .then((data) => {
        if(data.numFound < 1){
            renderMessage("No Books Found", "please try another search")
        } else {
            bookMenu.innerText = ""
            data.docs.forEach((book) => renderBook(book))
        }
    })
}

const renderMessage = (mainMessage, subMessage) => {
    bookMenu.innerText = ''
    bookMenu.innerHTML = `
        <div class="book-listing">
            <div class="book-info">
                <h2>${mainMessage}</h2>
                <p>${subMessage}</p>
            </div>
        </div>`
}

///////////////////////////////////////////////////////
// global declarations
//////////////////////////////////////////////////////

addDropZone.addEventListener('drop', dropHandler)
addDropZone.addEventListener('dragover', dragoverHandler)

searchForm.addEventListener('submit', handleBookSearch)

renderBookList()
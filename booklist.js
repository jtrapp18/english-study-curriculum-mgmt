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
const localUrl = "http://localhost:3000/books"

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

function buildRequestObj(method, payloadObj){
    return {
      method: ""+method+"",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(payloadObj),
    }
}

function postJSON(payloadObj){ 
    fetch(localUrl, buildRequestObj("POST",payloadObj))
    .then((response) => response.json())
    .then((data) => console.log("Book saved to curriculum"))
    .catch((error) => console.error(error))
}

///////////////////////////////////////////////////////
// handler functions 
//////////////////////////////////////////////////////

const handleBookSearch = (e) => {
    const searchString = e.target['book-search'].value
    e.preventDefault()
    renderBookList(searchString)
}

const handleBtnAddCurriculum = (e) => {
    const bookDiv = e.currentTarget.parentNode
    const bookObj = new Book(bookDiv.getAttribute("data-title"), bookDiv.getAttribute("data-author"), bookDiv.getAttribute("data-image"), bookDiv.getAttribute("data-subject"), "", bookDiv.getAttribute("data-api-id"))
    console.log(bookObj)
    console.log(`${bookObj.title} saved to curriculum`)
    postJSON(bookObj)
}

const dragstartHandler = (ev) => {
    ev.dataTransfer.effectAllowed = "move";
    const bookObj = new Book(ev.target.dataset.title, ev.target.dataset.author, ev.target.dataset.image, ev.target.dataset.subject, "", ev.target.dataset.apiId)
    ev.dataTransfer.setData("text", JSON.stringify(bookObj))
}

const dragoverHandler = (ev) => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = "move";
}

const dropHandler = (ev) => {
    ev.preventDefault()
    const bookString = ev.dataTransfer.getData("text")
    const bookObj = JSON.parse(bookString)
    postJSON(bookObj)
    
    const saveResponse = `${bookObj.title} added to curriculum`
    addDropZone.innerText = saveResponse
}

///////////////////////////////////////////////////////
// render book functions
//////////////////////////////////////////////////////

const renderBook = (book) => {
    //create book object
    const bookObj = new Book(book.title, book.author_name[0], "", Array.isArray(book.subject) ? book.subject[0] : book.subject, "", book.cover_i)
    
    //create required elements
    const bookListing = document.createElement("div")
    const bookInfo = document.createElement("div")
    const bookTitle = document.createElement("h2")
    const bookAuthor = document.createElement("p")
    const bookImg = document.createElement("img")
    const bookOverlay = document.createElement("div")
    const bookSubject = document.createElement("p")
    const btnAddCurriculum = document.createElement("button")
    
    //enable draggable feature
    bookListing.draggable = true 
    bookListing.addEventListener("dragstart", dragstartHandler)
    
    //add dataset to book div
    bookListing.dataset.title = bookObj.title
    bookListing.dataset.author = bookObj.author
    bookListing.dataset.subject = bookObj.description
    bookListing.dataset.apiId = bookObj.apiId
    
    //set required data
    bookListing.classList.add("book-listing")
    bookInfo.classList.add("book-info")
    bookOverlay.classList.add("overlay")
    bookTitle.innerText = bookObj.title
    bookAuthor.innerText = bookObj.author
    bookSubject.innerText = bookObj.description 
    btnAddCurriculum.innerText = "add book to curriculum"

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
    bookInfo.append(bookTitle)
    bookInfo.append(bookAuthor)
    bookInfo.append(bookImg)
    bookInfo.append(bookOverlay)
    bookOverlay.append(bookSubject)
    bookListing.append(bookInfo)
    bookListing.append(curriculumBtn)
    bookMenu.append(bookListing)
    
    //add event listener to button
    btnAddCurriculum.addEventListener('click', handleBtnAddCurriculum)
}

const renderBookList = (searchString) => {
    let query = "mystery"
    if(searchString){
        query = encodeURI(searchString)
        bookMenu.innerHTML = `
        <div class="book-listing">
            <div class="book-info">
                <h2>Books Loading</h2>
                <p>please wait...</p>
            </div>
        </div>`
        console.log("Loading")
    }
    getJSON(`${baseUrl}/search.json?q=${query}&fields=*,availability&limit=20`)
    .then((data) => {
        bookMenu.innerText = ""
        for(const book of data.docs){
            renderBook(book)
        }
    })
}

///////////////////////////////////////////////////////
// global declarations
//////////////////////////////////////////////////////

addDropZone.addEventListener('drop', dropHandler)
addDropZone.addEventListener('dragover', dragoverHandler)

searchForm.addEventListener('submit', handleBookSearch)

renderBookList()
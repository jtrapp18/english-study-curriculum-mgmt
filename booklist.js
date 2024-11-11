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
    updateImage(url){
        this.image = url
    }
}

///////////////////////////////////////////////////////
// booklist functions
//////////////////////////////////////////////////////

const bookMenu = document.querySelector("div#all-books")
const searchForm = document.querySelector("form#search")
const addDropZone = document.querySelector("p#add-dropzone")
const baseUrl = "https://openlibrary.org" //search.json?q=javascript&fields=*,availability&limit=1
const coverImgUrl = "https://covers.openlibrary.org"
const localUrl = "http://localhost:3000/books"

function getJSON(url){
    return fetch(url)
    .then((response) => {
        //console.log(response)
        if(response.ok){
            return response.json()
        } else {
            throw new Error("Request failed")
        }
    })
    .catch((error) => {
        //debugger;
        console.log(error)
    })    
}

function buildRequestObj(method, payloadObj){
    return {
      method: ""+method+"",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        //"Accept"
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
// rendering book functions
//////////////////////////////////////////////////////
function dragstartHandler(ev){
    ev.dataTransfer.effectAllowed = "move"; //copy, move, link
    const bookObj = new Book(ev.target.dataset.title, ev.target.dataset.author, ev.target.dataset.image, ev.target.dataset.subject, "", ev.target.dataset.apiId)
    ev.dataTransfer.setData("text", JSON.stringify(bookObj))
}
function dragoverHandler(ev){
    ev.preventDefault()
    ev.dataTransfer.dropEffect = "move"; //copy,move,link
}
function dropHandler(ev){
    ev.preventDefault()
    const bookString = ev.dataTransfer.getData("text")
    const bookObj = JSON.parse(bookString)
    postJSON(bookObj)
    
    const saveResponse = `${bookObj.title} added to curriculum`
    addDropZone.innerText = saveResponse
}



const renderBook = (book) => {
    //console.log(book)
    const bookListing = document.createElement("div")
    const bookInfo = document.createElement("div")
    const curriculumBtn = document.createElement("button")
    const bookTitle = document.createElement("h2")
    const bookAuthor = document.createElement("p")
    const bookImg = document.createElement("img")
    const bookOverlay = document.createElement("div")
    const bookSubject = document.createElement("p")

    const bookObj = new Book(
        book.title, book.author_name[0], 
        "",
        Array.isArray(book.subject) ? book.subject[0] : book.subject,
        "",
        book.cover_i
    )
    //console.log(bookObj)
    
    bookListing.draggable = true //allow draggable feature
    bookListing.addEventListener("dragstart",dragstartHandler) //allow draggable feature
    
    curriculumBtn.dataset.apiId = bookObj.apiId
    curriculumBtn.innerText = "add book to curriculum"

    bookListing.classList.add("book-listing")
    bookInfo.classList.add("book-info")
    bookOverlay.classList.add("overlay")
    bookTitle.innerText = bookObj.title
    bookAuthor.innerText = bookObj.author
    bookSubject.innerText = bookObj.description 
    
    bookListing.dataset.title = bookObj.title
    bookListing.dataset.author = bookObj.author
    bookListing.dataset.subject = bookObj.description
    bookListing.dataset.apiId = bookObj.apiId
    
    bookImg.alt = `${bookObj.title} cover image`
    bookImg.id = bookObj.apiId
    bookImg.style.height = "150px" //TODO: move to CSS
    bookImg.style.width = "120px" //TODO: move to CSS

    getJSON(`${coverImgUrl}/b/id/${bookObj.apiId}.json`)
    .then((data) => {
        const updatedUrl = data.source_url
        bookImg.src = updatedUrl
        bookObj.image = updatedUrl
        bookListing.dataset.image = updatedUrl
    })
    
    bookInfo.append(bookTitle)
    bookInfo.append(bookAuthor)
    bookInfo.append(bookImg)
    bookInfo.append(bookOverlay)
    bookOverlay.append(bookSubject)
    bookListing.append(bookInfo)
    bookListing.append(curriculumBtn)
    bookMenu.append(bookListing)

    curriculumBtn.addEventListener('click',handleCurriculumBtn)
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
// handler functions 
//////////////////////////////////////////////////////

const handleSearch = (e) => {
    const searchString = e.target['book-search'].value
    e.preventDefault()
    renderBookList(searchString)
}

const handleCurriculumBtn = (e) => {
    const bookDiv = e.currentTarget.parentNode
    const bookObj = new Book(
        bookDiv.getAttribute("data-title"), 
        bookDiv.getAttribute("data-author"),
        bookDiv.getAttribute("data-image"),
        bookDiv.getAttribute("data-subject"),
        "",
        bookDiv.getAttribute("data-api-id")
    )
    console.log(bookObj)
    console.log(`${bookObj.title} saved to curriculum`)
    postJSON(bookObj)
    
    /*
    const bookId = e.target.dataset.apiId
    
    //const bookNodeList = document.querySelectorAll("div+"+'[data-id="'+bookId+'"]'); //first book not being found
    const bookNodeList = document.querySelectorAll('[data-id="'+bookId+'"]');
    const bookNode = bookNodeList[0]
    if(bookNode){
        const bookDiv = bookNode.childNodes[0]
        const title = bookDiv.childNodes[0].innerText
        const author = bookDiv.childNodes[1].innerText
        const image = bookDiv.childNodes[2].src
        const description = ""
        const notes = ""
        const newBook = new Book(title, author, image, description, notes, bookId)
        console.log("=> newBook")
        console.log(newBook)
        console.log("=> post response")
        const save = postJSON(newBook)
    } else {
        console.error("book node not found")
    }
    */
}



///////////////////////////////////////////////////////
// global declarations
//////////////////////////////////////////////////////

addDropZone.addEventListener('drop',dropHandler)
addDropZone.addEventListener('dragover',dragoverHandler)

searchForm.addEventListener('submit',handleSearch)

renderBookList()
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
// booklist functions
//////////////////////////////////////////////////////

const bookMenu = document.querySelector("div#all-books")
const searchForm = document.querySelector("form#search")
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
    
    curriculumBtn.dataset.id = book.cover_i
    bookListing.dataset.id = book.cover_i
    
    curriculumBtn.innerText = "add book to curriculum"
    bookListing.classList.add("book-listing")
    bookInfo.classList.add("book-info")
    bookOverlay.classList.add("overlay")
    bookTitle.innerText = book.title
    bookAuthor.innerText = book.author_name[0]
    bookSubject.innerText = Array.isArray(book.subject) ? book.subject[0] : book.subject 
    
    bookImg.alt = `${book.title} cover image`
    bookImg.id = book.cover_i
    bookImg.style.height = "150px"
    bookImg.style.width = "120px"

    getJSON(`${coverImgUrl}/b/id/${book.cover_i}.json`)
    .then((data) => {
        //console.log(data.source_url)
        bookImg.src = data.source_url
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
    const searchString = e.target['nook-search'].value
    e.preventDefault()
    renderBookList(searchString)
}

const handleCurriculumBtn = (e) => {
    const bookId = e.target.dataset.id
    console.log(bookId)
    
    const bookNodeList = document.querySelectorAll("div+"+'[data-id="'+bookId+'"]');
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
}



///////////////////////////////////////////////////////
// global declarations
//////////////////////////////////////////////////////

searchForm.addEventListener('submit',handleSearch)

renderBookList()
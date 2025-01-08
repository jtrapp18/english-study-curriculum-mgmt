
# English Study Curriculum Management Dashboard
[Click to Navigate to Deployed Project](https://jtrapp18.github.io/english-study-curriculum-mgmt/)
  
## About this project

This project is a single-page application that allows teachers of English study curriculums to simply and easily manage their book curriculum as well create assignments and track student's progress and grades. This project uses data from the [OpenLibrary API](https://openlibrary.org/developers/api).
  

## Contributors

**Jacqueline Trapp**  
github: [JTrapp18](https://github.com/jtrapp18)  
  
**Elchonon Klafter**  
github: [klaftech](https://github.com/klaftech)
  
  
## Features

- Access & search database of all published books to add to curriculum. 
- Allows easy management of active curriculum and assignments.
- Create and edit assignments for each book.
- Track and analyze student's grades and progress across entire class.
  

## Technical   

- Integrated with OpenLibrary API to load, search and filter published books and retreive cover images. 
- Connects to local database to store and retrieve curriculum, assignments, students and grades. 
- Listens for user events and updates the DOM in response. 
- Allows simple drag and drop adding of books to the curriculum.
- Features highly interactive forms for easy data manipulation.  
  

## Demo
  
See this gif for an example of how the app works.
  
![demo](https://github.com/jtrapp18/english-study-curriculum-mgmt/blob/main/img/demo-gif.gif?raw=true)


## Setup

- Fork and clone this repo to your local machine.

- Run `live-server` to start the frontend in browser

- Launch the app in your brower at the local address indicated by `live-server`.  
  
  
## Endpoints

### Public API:
`https://openlibrary.org/search.json` GET  
`https://covers.openlibrary.org` GET  
  
### Database API:  
Live server endpoint: `https://english-study-curriculum-mgmt-be-production.up.railway.app`  
`/books` GET  
`/assignments` GET  
`/grades` GET  
`/students` GET  
`/books/:id` GET, POST  
`/assignments/:id` GET, POST, PATCH  
`/grades/:id` GET, POST, PATCH  
`/students/:id` GET, POST, PATCH

The live server is managed by the following back-end repository: [english-study-curriculum-mgmt-be](https://github.com/jtrapp18/english-study-curriculum-mgmt-be)

## Files

### JavaScript:
- `./src/booklist.js`: controls for interaction within the "BOOKLIST" tab
- `./src/curriculum.js`: controls for interaction within the "CURRICULUM" tab
- `./src/grading.js`: controls for interaction within the "GRADING" tab
- `./src/helper.js`: json-server functions and re-usable form functionality
- `./src/script.js`: miscellaneous controls
- `./src/students.js`: controls for interaction within the "STUDENTS" tab

### HTML:
- `index.html`: initial 

### CSS:
- `style.css`: controls the styles and layout of the application

### Other:
- `./img`: folder storing images used throughout the application

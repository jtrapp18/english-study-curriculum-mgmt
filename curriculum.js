//****************************************************************************************************
// RENDER information on DOM

function renderCurriculumBook(book) {

    const curriculumBooks = document.querySelector("#curriculum-books");
    
    const newBook = document.createElement("div");
    newBook.classList.add("book-info");
    newBook.dataset.id = book.id;
    
    const bookTitle = document.createElement("h2");
    bookTitle.textContent = book.title

    const bookAuthor = document.createElement("p");
    bookAuthor.textContent = book.author;

    const bookImg = document.createElement("img");
    bookImg.src = book.image;

    const overlay = document.createElement("div");
    overlay.className = "overlay";

    const bookDescr = document.createElement("p");
    bookDescr.textContent = book.description;

    overlay.append(bookDescr);
    newBook.append(bookTitle, bookAuthor, bookImg, overlay);
    curriculumBooks.append(newBook);
}

function renderCurriculumBooks() {

    getEmbeddedJSON("books", "assignments")
    .then(books => {
        books.forEach(renderCurriculumBook);
    })
    .catch(e => console.error(e));
}

function renderAssignmentRow(assignment) {

    const table = document.querySelector("#selected-book-assignments table");

    const row = document.createElement("tr");
    row.dataset.id = assignment.id;

    const assignmentId = document.createElement("td");
    assignmentId.textContent = assignment.id;

    const assignmentName = document.createElement("td");
    assignmentName.textContent = assignment.name;

    const assignmentStart = document.createElement("td");
    assignmentStart.textContent = assignment.startDate;

    const assignmentDue = document.createElement("td");
    assignmentDue.textContent = assignment.dueDate;

    const assignmentEdit = document.createElement("td");
    assignmentEdit.textContent = "edit";
    assignmentEdit.classList.add("edit-column")

    row.append(assignmentId, assignmentName, assignmentStart, assignmentDue, assignmentEdit);
    table.append(row);
}

function renderAssignmentTable(book) {

    document.querySelector("#selected-book-assignments").classList.remove("hidden");

    book.assignments.forEach(renderAssignmentRow);

    const newProjBtn = document.querySelector("#selected-book-assignments button");

    newProjBtn.addEventListener("click", ()=> {
        document.querySelector("#add-assignment").classList.remove("hidden");
        document.querySelector("#edit-assignment").classList.add("hidden");
    })
}

function renderAssignment(assignment) {

    document.querySelector("#edit-assignment").classList.remove("hidden");

    const form = document.querySelector("#edit-assignment form");
    form.dataset.id = assignment.id; // store the current project ID in the form

    const assignmentName = form["edit-assignment-name"];
    assignmentName.value = assignment.name;

    const assignmentDescr = form["edit-assignment-descr"];
    assignmentDescr.value = assignment.description;

    const assignmentStart = form["edit-assignment-start"];
    assignmentStart.value = assignment.startDate;

    const assignmentDue = form["edit-assignment-due"];
    assignmentDue.value = assignment.dueDate;

    disableForm(form); // lock assignment details form by default
}

//****************************************************************************************************
// UPDATE db.json based on user interaction

function submitAssignmentEdits(assignmentId, bookId) { 
    
    const form = document.querySelector("#edit-assignment form");
    
    const updatedAssignment = {
        id: assignmentId,
        name: form["edit-assignment-name"].value,
        description: form["edit-assignment-descr"].value,
        startDate: form["edit-assignment-start"].value,
        dueDate: form["edit-assignment-due"].value,
        bookId: bookId
        }

    patchJSONToDb("assignments", assignmentId, updatedAssignment);
}

function submitNewAssignment() {

    const form = document.querySelector("#add-assignment form");
    const bookId = document.querySelector("#curriculum-books").dataset.id;

    const newAssignment = {
        name: form["new-assignment-name"].value,
        description: form["new-assignment-descr"].value,
        startDate: form["new-assignment-start"].value,
        dueDate: form["new-assignment-due"].value,
        bookId: bookId
        }

    postJSONToDb("assignments", newAssignment)
    .then(assignment => {
        console.log("ADDED", assignment)

        createGradeObjects(assignment.id); // create grade object for each student for new project
        
        newAssignment.id = assignment.id;
        renderAssignmentRow(newAssignment);

        document.querySelector("#add-assignment").classList.add("hidden");
    })
    .catch(e => console.error(e));
}

function createGradeObjects(assignmentId) {

    getJSONByKey("students")
    .then(students => {
        console.log(students)
        students.forEach(student => {

        const newGrade = {
            "points": 0,
            "comments": "",
            "studentId": student.id,
            "assignmentId": assignmentId
          }

        postJSONToDb("grades", newGrade)
        .then(data => console.log("ADDED", data))
        .catch(e => console.error(e));

    })})
    .catch(e => console.error(e));
}

//****************************************************************************************************
// ADD event handlers

function bookSelectListener() {

    const curriculumBooks = document.querySelector("#curriculum-books");

    curriculumBooks.addEventListener("click", (e) => {

        const clickedBook = e.target.closest(".book-info");

        if (clickedBook) {

            const bookId = clickedBook.dataset.id;
            curriculumBooks.dataset.id = bookId;

            getEmbeddedJSONById("books", bookId, "assignments")
            .then(book => {
                selectedBook = document.querySelector("#selected-book");

                selectedBook.classList.remove("hidden");
                selectedBook.innerHTML = clickedBook.innerHTML;
            
                renderAssignmentTable(book);
            })
            .catch(e => console.error(e));
        }
    })
}

function assignmentSelectListener() {

    const table = document.querySelector("#selected-book-assignments table");

    table.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-column")) {

            const row = e.target.closest("tr");
            const assignmentId = row.dataset.id;
            
            getJSONById("assignments", assignmentId)
            .then(assignment => {
                document.querySelector("#add-assignment").classList.add("hidden");
                renderAssignment(assignment);
            })
        }
    });
}

function editAssignmentListener() {

    const form = document.querySelector("#edit-assignment form");

    form.addEventListener("submit", (e)=> {

        e.preventDefault();
        
        const submitBtn = document.querySelector("#submit-edit");
        const bookId = document.querySelector("#curriculum-books").dataset.id;

        // only submit changes if form is in edit mode
        if (submitBtn.value === "SUBMIT CHANGES") {
            submitAssignmentEdits(form.dataset.id, bookId);
            disableForm(form);
        }
        else {
            enableForm(form);
        }
    })
}

function addAssignmentListener() {

    const form = document.querySelector("#add-assignment form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitNewAssignment();
    })
}

//****************************************************************************************************
// LOAD page and call event listeners

function main() {

    // render curriculum book list
    renderCurriculumBooks();

    // add event handlers
    bookSelectListener();
    assignmentSelectListener();
    editAssignmentListener();
    addAssignmentListener();
}

main();
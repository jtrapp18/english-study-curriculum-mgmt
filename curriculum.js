//****************************************************************************************************
// RENDER information on DOM

function renderCurriculumBook(book) {

    const curriculumBooks = document.querySelector("#curriculum-books");

    //create required elements
    const bookListing = document.createElement("div")
    const bookInfo = document.createElement("div")
    const bookTitle = document.createElement("h2");
    const bookAuthor = document.createElement("p");
    const bookImg = document.createElement("img");
    const overlay = document.createElement("div");
    const bookDescr = document.createElement("p");

    //set required data
    bookListing.classList.add("book-listing");
    bookInfo.classList.add("book-info");
    bookInfo.dataset.id = book.id;
    bookTitle.textContent = book.title
    bookAuthor.textContent = book.author;
    bookImg.src = book.image;
    overlay.className = "overlay";
    bookDescr.textContent = book.description;

    //append elements
    overlay.append(bookDescr);
    bookInfo.append(bookTitle, bookAuthor, bookImg, overlay);
    bookListing.append(bookInfo);
    curriculumBooks.append(bookListing);
}

function renderCurriculumBooks() {

    getEmbeddedJSON("books", "assignments")
    .then(books => {
        books.forEach(renderCurriculumBook);
    })
    .catch(e => console.error(e));
}

function createAssignmentRow() {

    const table = document.querySelector("#selected-book-assignments table");
    const row = document.createElement("tr");

    const assignmentId = document.createElement("td");
    const assignmentName = document.createElement("td");
    const assignmentStart = document.createElement("td");
    const assignmentDue = document.createElement("td");
    const assignmentMaxPoints = document.createElement("td");
    const assignmentEdit = document.createElement("td");
    assignmentEdit.textContent = "edit";

    row.append(assignmentId, assignmentName, assignmentStart, assignmentDue, assignmentMaxPoints, assignmentEdit);
    table.append(row);

    return row;
}

function populateAssignmentRow(row, assignment) {

    row.dataset.id = assignment.id;

    row.children[0].textContent = assignment.id;
    row.children[1].textContent = assignment.name;
    row.children[2].textContent = assignment.startDate;
    row.children[3].textContent = assignment.dueDate;
    row.children[4].textContent = assignment.maxPoints;
    row.children[5].textContent = "edit";
    row.children[5].classList.add("edit-column")

}

function renderAssignmentRow(assignment, assignmentId=0) {

    const table = document.querySelector("#selected-book-assignments table");
    const row = (assignmentId === 0) ? createAssignmentRow() : table.querySelector(`tr[data-id="${assignmentId}"]`);

    populateAssignmentRow(row, assignment);
}

function renderAssignmentTable(book) {

    document.querySelector("#selected-book-assignments").classList.remove("hidden");

    const table = document.querySelector("#selected-book-assignments table")
    table.querySelectorAll("td").forEach(r => r.remove());

    book.assignments.forEach(assignment => renderAssignmentRow(assignment));

    const newProjBtn = document.querySelector("#selected-book-assignments button");

    newProjBtn.addEventListener("click", ()=> {
        document.querySelector("#add-assignment").classList.remove("hidden");
        document.querySelector("#edit-assignment").classList.add("hidden");

        table.querySelectorAll("tr").forEach(r => r.classList.remove("active-row"));
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

    const assignmentMaxPoints = form["edit-assignment-max-points"];
    assignmentMaxPoints.value = assignment.maxPoints;

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
        maxPoints: form["edit-assignment-max-points"].value,
        bookId: bookId
        }

    patchJSONToDb("assignments", assignmentId, updatedAssignment);
    renderAssignmentRow(updatedAssignment, assignmentId);
}

function validateForm(newAssignment) {

    for (let key in newAssignment) {

        if (!newAssignment[key]) {
            alert(`Need to enter ${key}`)
            return false
        }
    }
    return true
}

function submitNewAssignment() {

    const form = document.querySelector("#add-assignment form");
    const bookId = document.querySelector("#curriculum-books").dataset.id;

    const newAssignment = {
        name: form["new-assignment-name"].value,
        description: form["new-assignment-descr"].value,
        startDate: form["new-assignment-start"].value,
        dueDate: form["new-assignment-due"].value,
        maxPoints: form["new-assignment-max-points"].value,
        bookId: bookId
        }
    
    if (validateForm(newAssignment)) {

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
            table.querySelectorAll("tr").forEach(r => r.classList.remove("active-row"));
            row.classList.add("active-row");

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
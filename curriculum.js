const objKey = {books: {obj: {}, dropdownName: "book-options", dropdownContent: "title"},
                roster: {obj: {}, dropdownName: "student-select", dropdownContent: "fullName"},
                studentBook: {obj: {}},
                studentProj: {obj: {}, dropdownName: "assignment-options", dropdownContent: "name"}
            };
let projToBookMap;

function populateDropdown(dropdown, options) {

    options.forEach(option => {
        const addOption = document.createElement("option");
        addOption.textContent = option;

        dropdown.append(addOption);
    })
}

function renderProjTblRow(assignment) {

    const table = document.querySelector("#selected-book-assignments table");
    const row = document.createElement("tr");

    const projId = document.createElement("td");
    projId.textContent = assignment.id;

    const projName = document.createElement("td");
    projName.textContent = assignment.name;

    const projStart = document.createElement("td");
    projStart.textContent = assignment.startDate;

    const projDue = document.createElement("td");
    projDue.textContent = assignment.dueDate;

    const projEdit = document.createElement("td");
    projEdit.textContent = "edit";
    projEdit.classList.add("edit-column")

    row.append(projId, projName, projStart, projDue, projEdit);
    table.append(row);

    projEdit.addEventListener("click", () => {
        document.querySelector("#add-assignment").classList.add("hidden");
        renderEditAssignment(assignment);
    })
}

function fetchInfoById(type, Id) {
    return fetch(`http://localhost:3000/${type}/${Id}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function getJSON(type) {
    return fetch(`http://localhost:3000/${type}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function findInfoByDbKey(type) {
    getJSON(type)
    .then(data => {
        const dropdown = document.querySelector(`#${objKey[type].dropdownName}`);
        const dropdownContent = objKey[type].dropdownContent
        const options = data.map(item => `${item[dropdownContent]} [ID: ${item.id}]`);

        populateDropdown(dropdown, options);

        dropdown.addEventListener("change", ()=> {
            addDropdownListener(dropdown, type);
        })
    })
    .catch(e => console.error(e));
}

function addDropdownListener(dropdown, type) {

    const selected = dropdown.value;

    const Id = selected.match(/\[ID: (\d+)\]/)[1];
    fetchInfoById(type, Id)
    .then(data => {objKey[type].obj=data});
}

function renderClassBook(book) {
    const curriculumBooks = document.querySelector("#curriculum-books");
    const newBook = document.createElement("div");
    newBook.classList.add("book-info");
    
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

    newBook.addEventListener("click", () => {
        objKey.books.obj = book;
        selectedBook = document.querySelector("#selected-book");
        selectedBook.classList.remove("hidden");
        selectedBook.innerHTML = newBook.innerHTML;

        findAssignmentsByBook(book);
    })
}

function renderClassBooks() {
    getJSON("books")
    .then(books => {
        books.forEach(renderClassBook);
        projToBookMap = mapProjToBook(books);
    })
    .catch(e => console.error(e));
}

function findAssignmentsByBook(book) {
    document.querySelector("#selected-book-assignments").classList.remove("hidden");

    book.projects.forEach(renderProjTblRow);

    const newProjBtn = document.querySelector("#selected-book-assignments button");

    newProjBtn.addEventListener("click", ()=> {
        document.querySelector("#add-assignment").classList.remove("hidden");
        document.querySelector("#edit-assignment").classList.add("hidden");
    })
}

function renderEditAssignment(assignment) {
    document.querySelector("#edit-assignment").classList.remove("hidden");
    const editProjForm = document.querySelector("#edit-assignment form");

    const assignmentName = editProjForm["edit-assignment-name"];
    assignmentName.value = assignment.name;

    const assignmentDescr = editProjForm["edit-assignment-descr"];
    assignmentDescr.value = assignment.description;

    const assignmentStart = editProjForm["edit-assignment-start"];
    assignmentStart.value = assignment.startDate;

    const assignmentDue = editProjForm["edit-assignment-due"];
    assignmentDue.value = assignment.dueDate;

    // disable form for editing
    enableDisableForm(editProjForm, true);

    editProjForm.addEventListener("submit", (e)=> {
        e.preventDefault();
        
        const submitBtn = document.querySelector("#submit-edit");

        // if form is in edit mode, submit changes
        if (submitBtn.value === "SUBMIT CHANGES") {
            submitProjEdits(assignment.id)
        }

        // if button reads 'EDIT FORM', need to enable form for editing
        enableDisableForm(editProjForm, submitBtn.value !== "EDIT FORM");
    })
}

function submitProjEdits(projID) {
    
    const editProjForm = document.querySelector("#edit-assignment form")
    
    const updatedProj = {
        id: projID,
        name: editProjForm["edit-assignment-name"].value,
        description: editProjForm["edit-assignment-descr"].value,
        startDate: editProjForm["edit-assignment-start"].value,
        dueDate: editProjForm["edit-assignment-due"].value
        }

    const projects = objKey.books.obj.projects
    const projIndex = projects.findIndex(project => project.id == projID); // returns 1
    objKey.books.obj.projects[projIndex] = updatedProj

    patchInfoById("books", objKey.books.obj.id, objKey.books.obj)
}

function renderPerson(student) {
    const studentId = document.querySelector("#student-id");
    studentId.textContent = student.id;

    const studentName = document.querySelector("#student-name");
    studentName.textContent = student.fullName;
}

function renderAssignmentInfo(assignment) {
    const projId = document.querySelector("#proj-detail-id");
    projId.textContent = assignment.id

    const projName = document.querySelector("#proj-detail-name");
    projName.textContent = assignment.name

    const projDescr = document.querySelector("#proj-detail-description");
    projDescr.textContent = assignment.description

    const projStart = document.querySelector("#proj-detail-start");
    projStart.textContent = assignment.startDate

    const projEnd = document.querySelector("#proj-detail-due");
    projEnd.textContent = assignment.dueDate
}

function renderStudentGrade(assignment) {

    const gradingForm = document.querySelector("#grading-form");

    const assignmentGrade = gradingForm["edit-grade"];
    assignmentGrade.value = assignment.grade;

    const assignmentComments = gradingForm["edit-comments"];
    assignmentComments.value = assignment.comments;
}

function listAssignmentsByStudent(student) {
    const assignments = student.projects;
    const studentAssignments = document.querySelector("#student-assigments ul");

    studentAssignments.innerHTML = "";

    assignments.forEach(assignment => {
        const addAssignment = document.createElement("li");
        addAssignment.textContent = `Assignment ID: ${assignment.id}, Grade: ${assignment.grade}`;

        studentAssignments.append(addAssignment);

        addAssignment.addEventListener("click", () => {
            const bookId = projToBookMap[assignment.id]; //find id of book based on mapping

            fetchInfoById("books", bookId)
            .then(book => {
                objKey.studentBook.obj=book
                const bookProjects = objKey.studentBook.obj.projects; //find list of projects for active book
                const projCurr = bookProjects[assignment.id]; //find details for selected project        
                renderAssignmentInfo(projCurr);        
            });

            renderStudentGrade(assignment);
        })
    })
}

function mapProjToBook(books) {
    return books.reduce((bookAccum, book) => {
        const projAccum = book.projects.reduce((projAccum, project) => {
            const newEntry = { [project.id]: book.id };
            return { ...projAccum, ...newEntry };
        }, {});

        return { ...bookAccum, ...projAccum };
    }, {});
}

document.querySelector("#student-select").addEventListener("change", ()=> {
    const student = objKey.roster.obj;

    renderPerson(student);
    listAssignmentsByStudent(student);
})

function addSubmitListener() {

    const newProjForm = document.querySelector("#add-assignment form");

    newProjForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newProj = {
            id: "add ID",
            name: newProjForm["new-assignment-name"].value,
            description: newProjForm["new-assignment-descr"].value,
            startDate: newProjForm["new-assignment-start"].value,
            dueDate: newProjForm["new-assignment-due"].value
            }
        
        objKey.books.obj.projects.push(newProj);

        patchInfoById("books", objKey.books.obj.id, objKey.books.obj);
        renderProjTblRow(newProj);
        document.querySelector("#add-assignment").classList.add("hidden");
    })
}

function patchInfoById(type, Id, jsonObj) {

    // update data in the backend
    fetch(`http://localhost:3000/${type}/${Id}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonObj)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => console.log("EDITED", data))
    .catch(e => console.error(e));
}

function enableDisableForm(form, disable = true) {
    const inputs = form.querySelectorAll('input:not([type="submit"])')
    inputs.forEach(input => input.disabled = disable);

    const submitBtn = form.querySelector('input[type="submit"]');

    if (disable) {
        submitBtn.value = "EDIT FORM"
        form.classList.remove("edit-mode")
    }
    else {
        submitBtn.value = "SUBMIT CHANGES"
        form.classList.add("edit-mode")
    }

}

function main() {
    renderClassBooks();
    // findInfoByDbKey("books");
    addSubmitListener();
    findInfoByDbKey("roster");
}

main();
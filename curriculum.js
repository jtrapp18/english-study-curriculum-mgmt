const objKey = {books: {},
                students: {},
                studentBook: {},
                studentProj: {}
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

function getEmbeddedJSON(base, embedded) {
    return fetch(`http://localhost:3000/${base}?_embed=${embedded}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function renderStudents() {
    getEmbeddedJSON("students", "grades")
    .then(students => {
        const dropdown = document.querySelector(`#student-select`);
        // const dropdownContent = objKey[type].dropdownContent
        // const options = data.map(item => `${item[dropdownContent]} [ID: ${item.id}]`);
        const studentNames = students.map(student => student.fullName)

        console.log(studentNames)
        populateDropdown(dropdown, studentNames);

        dropdown.addEventListener("change", ()=> {

            console.log(dropdown.value);

            const student = students.find(student => student.fullName === dropdown.value)

            renderPerson(student);

            document.querySelector("#student-assignments").classList.remove("hidden")
            student.grades.forEach(renderStudentTblRow);



        })
    })
    .catch(e => console.error(e));
}

function addDropdownListener(dropdown, type) {

    const selected = dropdown.value;

    const Id = selected.match(/\[ID: (\d+)\]/)[1];
    fetchInfoById(type, Id)
    .then(data => {objKey[type]=data});
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
        objKey.books = book;
        selectedBook = document.querySelector("#selected-book");
        selectedBook.classList.remove("hidden");
        selectedBook.innerHTML = newBook.innerHTML;

        findAssignmentsByBook(book);
    })
}

function renderClassBooks() {
    getEmbeddedJSON("books", "projects")
    .then(books => {
        books.forEach(renderClassBook);
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
            submitProjEdits(assignment.id, objKey.books.id)
        }

        // if button reads 'EDIT FORM', need to enable form for editing
        enableDisableForm(editProjForm, submitBtn.value !== "EDIT FORM");
    })
}

function submitProjEdits(projId, bookId) {
    
    const editProjForm = document.querySelector("#edit-assignment form")
    
    const updatedProj = {
        id: projId,
        name: editProjForm["edit-assignment-name"].value,
        description: editProjForm["edit-assignment-descr"].value,
        startDate: editProjForm["edit-assignment-start"].value,
        dueDate: editProjForm["edit-assignment-due"].value,
        bookId: bookId
        }

    const projects = objKey.books.projects
    const projIndex = projects.findIndex(project => project.id == projId); // returns 1
    objKey.books.projects[projIndex] = updatedProj

    patchInfoById("projects", projId, updatedProj)
}

function submitGradeEdits(gradeId, studentId, projectId) {
    // JET note: this is not complete
    const gradingForm = document.querySelector("#edit-grading form")
    
    const updatedGrade = {
        id: gradeId,
        points: gradingForm["edit-grade"].value,
        comments: gradingForm["edit-comments"].value,
        studentId: studentId,
        projectId: projectId
        }
    console.log(updatedGrade)

    // const projects = objKey.books.projects
    // const projIndex = projects.findIndex(project => project.id == projID); // returns 1
    // objKey.books.projects[projIndex] = updatedGrade

    patchInfoById("grades", gradeId, updatedGrade)
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

function renderStudentGrade(grade) {

    const gradingForm = document.querySelector("#edit-grading form");

    const assignmentGrade = gradingForm["edit-grade"];
    assignmentGrade.value = grade.points;

    const assignmentComments = gradingForm["edit-comments"];
    assignmentComments.value = grade.comments;

    enableDisableForm(gradingForm, true);

    gradingForm.addEventListener("submit", (e) => {

        e.preventDefault();
        
        const submitBtn = document.querySelector("#submit-grade");

        // if form is in edit mode, submit changes
        if (submitBtn.value === "SUBMIT CHANGES") {
            submitGradeEdits(grade.id, objKey.students.id, objKey.studentProj.id)
        }

        // if button reads 'EDIT FORM', need to enable form for editing
        enableDisableForm(gradingForm, submitBtn.value !== "EDIT FORM");

    })
}

function renderStudentTblRow(grade) {

    const table = document.querySelector("#student-assignments table");
    const row = document.createElement("tr");

    const projId = document.createElement("td");
    projId.textContent = grade.projectId;

    const projPoints = document.createElement("td");
    projPoints.textContent = grade.points;

    const projComments = document.createElement("td");
    projComments.textContent = grade.comments;

    const editGrade = document.createElement("td");
    editGrade.textContent = "edit";
    editGrade.classList.add("edit-column")

    row.append(projId, projPoints, projComments, editGrade);
    table.append(row);

    editGrade.addEventListener("click", () => {
        document.querySelector("#edit-grading").classList.remove("hidden");
        renderStudentGrade(grade);
    })
}

function addSubmitListener() {

    const newProjForm = document.querySelector("#add-assignment form");

    newProjForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newProj = {
            name: newProjForm["new-assignment-name"].value,
            description: newProjForm["new-assignment-descr"].value,
            startDate: newProjForm["new-assignment-start"].value,
            dueDate: newProjForm["new-assignment-due"].value,
            bookId: objKey.books.id
            }
        
        // JET note to review below push -- may need to remove
        objKey.books.projects.push(newProj);

        postNewRecord("projects", newProj)
        renderProjTblRow(newProj);
        document.querySelector("#add-assignment").classList.add("hidden");
    })
}

function postNewRecord(type, jsonObj) {

    // update data in the backend
    fetch(`http://localhost:3000/${type}`, {
        method: 'POST',
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
        .then(data => console.log("ADDED", data))
        .catch(e => console.error(e));
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
    renderStudents();
    findInfoByDbKey("students");

}

main();
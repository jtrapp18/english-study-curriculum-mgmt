//****************************************************************************************************
// RENDER information on DOM

function renderStudent(assignment) {

    const assignmentId = document.querySelector("#student-id");
    assignmentId.textContent = assignment.id;

    const assignmentName = document.querySelector("#student-name");
    assignmentName.textContent = assignment.name;
}

function populateDropdown() {

    getEmbeddedJSON("assignments", "grades")
    .then(assignments => {
        const dropdown = document.querySelector(`#assignment-select`);

        assignments.forEach(assignment => {
            const assignmentName = document.createElement("option");
            assignmentName.textContent = assignment.name;
            assignmentName.dataset.id = assignment.id;
            assignmentName.dataset.maxPoints = assignment.maxPoints;
    
            dropdown.append(assignmentName);
        })
    })
    .catch(e => console.error(e));
}

function createGradeRow() {

    const table = document.querySelector("#assignment-grades table");
    const row = document.createElement("tr");

    // add rows for individual student

    const studentId = document.createElement("td");
    const studentName = document.createElement("td");

    // add rows for assignment grade

    const gradePoints = document.createElement("td");
    const maxPoints = document.createElement("td");
    const percentage = document.createElement("td");
    const editGrade = document.createElement("td");
    editGrade.textContent = "edit";
    editGrade.classList.add("edit-column");

    row.append(studentId, studentName, gradePoints, maxPoints, percentage, editGrade);
    table.append(row);

    return row;
}

function populateGradeRow(row, grade) {

    row.dataset.id = grade.id;
    row.dataset.studentId = grade.studentId;

    const maxPoints = document.querySelector("#assignment-select").dataset.maxPoints

    getJSONById("students", grade.studentId)
    .then(student => {

        // add details for individual student

        row.children[0].textContent = grade.studentId;
        row.children[1].textContent = student.fullName;

        // add details for assignment grade

        row.children[2].textContent = grade.points;
        row.children[3].textContent = maxPoints;
        row.children[4].textContent = ((grade.points / maxPoints) * 100).toFixed(2) + '%';
        row.children[5].textContent = "edit";
        row.children[5].classList.add("edit-column")
    })
    .catch(e => console.error(e));
}

function renderGradeRow(grade, gradeId=0) {

    const table = document.querySelector("#assignment-grades table");
    const row = (gradeId === 0) ? createGradeRow() : table.querySelector(`tr[data-id="${gradeId}"]`);

    populateGradeRow(row, grade);
}

function renderAssignmentInfo(assignment) {

    document.querySelector("#assignment-detail").dataset.id = assignment.id;

    const assignmentName = document.querySelector("#assignment-detail-name");
    assignmentName.textContent = assignment.name;

    const assignmentDescr = document.querySelector("#assignment-detail-description");
    assignmentDescr.textContent = assignment.description;
}

function renderStudentGrade(grade) {

    const form = document.querySelector("#edit-grading form");
    form.dataset.id = grade.id;

    const assignmentGrade = form["edit-grade"];
    assignmentGrade.value = grade.points;

    const assignmentComments = form["edit-comments"];
    assignmentComments.value = grade.comments;

    disableForm(form);
}

//****************************************************************************************************
// SUBMIT information from forms to db.json

function submitGradeEdits(gradeId, studentId, assignmentId) {

    const gradingForm = document.querySelector("#edit-grading form")
    
    const updatedGrade = {
        id: gradeId,
        points: gradingForm["edit-grade"].value,
        comments: gradingForm["edit-comments"].value,
        studentId: studentId,
        assignmentId: assignmentId
        }

    patchJSONToDb("grades", gradeId, updatedGrade);
    renderGradeRow(updatedGrade, gradeId);
}

//****************************************************************************************************
// ADD event handlers

function studentSelectListener() {

    const dropdown = document.querySelector(`#assignment-select`);

    dropdown.addEventListener("change", (e)=> {

        const selectedOption = dropdown.options[dropdown.selectedIndex];
        assignmentId = selectedOption.dataset.id;
        dropdown.dataset.id = assignmentId;
        dropdown.dataset.maxPoints = selectedOption.dataset.maxPoints;

        getEmbeddedJSONById("assignments", assignmentId, "grades")
        .then(assignment => {
            renderStudent(assignment);

            document.querySelector("#assignment-grades").classList.remove("hidden");

            const table = document.querySelector("#assignment-grades table")
            table.querySelectorAll("td").forEach(r => r.remove());

            assignment.grades.forEach(grade => renderGradeRow(grade));

            document.querySelector("#edit-grading").classList.add("hidden");
        })
        .catch(e => console.error(e));
    })
}

function gradeSelectListener() {

    const table = document.querySelector("#assignment-grades table");

    table.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-column")) {

            const row = e.target.closest("tr");
            table.querySelectorAll("tr").forEach(r => r.classList.remove("active-row"));
            row.classList.add("active-row")

            const assignmentId = document.querySelector(`#assignment-select`).dataset.id;

            const gradeId = row.dataset.id;
            table.dataset.id = gradeId;

            const studentId = row.dataset.studentId;
            table.dataset.studentId = studentId;

            getEmbeddedJSONById("assignments", assignmentId, "grades")
            .then(assignment => {
                document.querySelector("#edit-grading").classList.remove("hidden");

                const grade = assignment.grades.find(grade => grade.id === gradeId);
                renderStudentGrade(grade);

                getJSONById("students", studentId)
                .then(student => {
                    renderAssignmentInfo(student);
                })
                .catch(e => console.error(e));
            })
            .catch(e => console.error(e));
        }
    });
}

function editGradeListener() {

    const form = document.querySelector("#edit-grading form");

    form.addEventListener("submit", (e) => {

        e.preventDefault();
        
        const submitBtn = document.querySelector("#submit-grade");
        const assignmentId = document.querySelector("#student-select").dataset.id;
        const gradeId = document.querySelector("#assignment-grades table").dataset.id;
        const studentId = document.querySelector("#assignment-grades table").dataset.studentId;

        // if form is in edit mode, submit changes
        if (submitBtn.value === "SUBMIT CHANGES") {
            submitGradeEdits(gradeId, studentId, assignmentId);
            disableForm(form);
        }
        else {
            enableForm(form);
        }
    })
}

//****************************************************************************************************
// LOAD page and call event listeners

function main() {

    // render student list
    populateDropdown();

    // add event handlers
    studentSelectListener();
    gradeSelectListener();
    editGradeListener();
}

main();
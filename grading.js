//****************************************************************************************************
// RENDER information on DOM

function renderStudent(student) {

    document.querySelector("#student-select").dataset.id = student.id;

    const studentId = document.querySelector("#student-id");
    studentId.textContent = student.id;

    const studentName = document.querySelector("#student-name");
    studentName.textContent = student.fullName;
}

function renderStudents() {

    getEmbeddedJSON("students", "grades")
    .then(students => {
        const dropdown = document.querySelector(`#student-select`);

        students.forEach(student => {
            const studentName = document.createElement("option");
            studentName.textContent = student.fullName;
            studentName.dataset.id = student.id;
    
            dropdown.append(studentName);
        })
    })
    .catch(e => console.error(e));
}

function renderGradeRow(grade) {

    const table = document.querySelector("#student-assignments table");

    const row = document.createElement("tr");
    row.dataset.id = grade.id;
    row.dataset.assignmentId = grade.assignmentId;

    const assignmentId = document.createElement("td");
    assignmentId.textContent = grade.assignmentId;

    const projPoints = document.createElement("td");
    projPoints.textContent = grade.points;

    const projComments = document.createElement("td");
    projComments.textContent = grade.comments;

    const editGrade = document.createElement("td");
    editGrade.textContent = "edit";
    editGrade.classList.add("edit-column")

    row.append(assignmentId, projPoints, projComments, editGrade);
    table.append(row);
}

function renderAssignmentInfo(assignment) {

    const assignmentId = document.querySelector("#proj-detail-id");
    assignmentId.textContent = assignment.id;

    const projName = document.querySelector("#proj-detail-name");
    projName.textContent = assignment.name;

    const projDescr = document.querySelector("#proj-detail-description");
    projDescr.textContent = assignment.description;

    const projStart = document.querySelector("#proj-detail-start");
    projStart.textContent = assignment.startDate;

    const projEnd = document.querySelector("#proj-detail-due");
    projEnd.textContent = assignment.dueDate;
}

function renderStudentGrade(grade) {

    const form = document.querySelector("#edit-grading form");

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
}

//****************************************************************************************************
// ADD event handlers

function studentSelectListener() {

    const dropdown = document.querySelector(`#student-select`);

    dropdown.addEventListener("change", (e)=> {

        const selectedOption = dropdown.options[dropdown.selectedIndex];
        studentId = selectedOption.dataset.id;
        dropdown.dataset.id = studentId;

        getEmbeddedJSONById("students", studentId, "grades")
        .then(student => {
            renderStudent(student);

            document.querySelector("#student-assignments").classList.remove("hidden");
            student.grades.forEach(renderGradeRow);
        })
        .catch(e => console.error(e));
    })
}

function gradeSelectListener() {

    const table = document.querySelector("#student-assignments table");

    table.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-column")) {

            const row = e.target.closest("tr");

            const gradeId = row.dataset.id;
            table.dataset.id = gradeId;

            const assignmentId = row.dataset.id;
            table.dataset.assignmentId = row.dataset.assignmentId;

            getJSONById("grades", gradeId)
            .then(grade => {
                document.querySelector("#edit-grading").classList.remove("hidden");

                // renderAssignmentInfo(assignment);
                renderStudentGrade(grade);
            })
            .catch(e => console.error(e));
        }
    });
}

function editGradeListener(){

    const form = document.querySelector("#edit-grading form");

    form.addEventListener("submit", (e) => {

        e.preventDefault();
        
        const submitBtn = document.querySelector("#submit-grade");
        const studentId = document.querySelector("#student-select").dataset.id;
        const gradeId = document.querySelector("#student-assignments table").dataset.id;
        const assignmentId = document.querySelector("#student-assignments table").dataset.assignmentId;

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
    renderStudents();

    // add event handlers
    studentSelectListener();
    gradeSelectListener();
    editGradeListener();
}

main();
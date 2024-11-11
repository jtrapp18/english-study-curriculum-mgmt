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

    getJSONById("assignments", grade.assignmentId)
    .then(assignment => {

        // show details for individual assignment

        const assignmentId = document.createElement("td");
        assignmentId.textContent = grade.assignmentId;

        const assignmentName = document.createElement("td");
        assignmentName.textContent = assignment.name;

        const assignmentStart = document.createElement("td");
        assignmentStart.textContent = assignment.startDate;

        const assignmentDue = document.createElement("td");
        assignmentDue.textContent = assignment.dueDate;

        const assignmentMaxPoints = document.createElement("td");
        assignmentMaxPoints.textContent = assignment.maxPoints;

        // show details for assignment grade
    
        const gradePoints = document.createElement("td");
        gradePoints.textContent = grade.points;

        const percentage = document.createElement("td");
        percentage.textContent = grade.points/assignment.maxPoints;
    
        const editGrade = document.createElement("td");
        editGrade.textContent = "edit";
        editGrade.classList.add("edit-column")
    
        row.append(assignmentId, assignmentName, assignmentStart, assignmentDue, assignmentMaxPoints, gradePoints, percentage, editGrade);
        table.append(row);
    })
    .catch(e => console.error(e));
}

function renderAssignmentInfo(assignment) {
    console.log(assignment)

    const assignmentId = document.querySelector("#assignment-detail-id");
    assignmentId.textContent = assignment.id;

    const assignmentName = document.querySelector("#assignment-detail-name");
    assignmentName.textContent = assignment.name;

    const assignmentDescr = document.querySelector("#assignment-detail-description");
    assignmentDescr.textContent = assignment.description;

    const assignmentStart = document.querySelector("#assignment-detail-start");
    assignmentStart.textContent = assignment.startDate;

    const assignmentEnd = document.querySelector("#assignment-detail-due");
    assignmentEnd.textContent = assignment.dueDate;
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

            const assignmentId = row.dataset.assignmentId;
            table.dataset.assignmentId = assignmentId;

            getJSONById("grades", gradeId)
            .then(grade => {
                document.querySelector("#edit-grading").classList.remove("hidden");

                renderStudentGrade(grade);

                getJSONById("assignments", assignmentId)
                .then(assignment => {
                    renderAssignmentInfo(assignment);
                })
                .catch(e => console.error(e));
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
//****************************************************************************************************
// RENDER information on DOM

function renderStudent(student) {

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

function createStudentGradeRow() {

    const table = document.querySelector("#student-assignments table");
    const row = document.createElement("tr");

    // add rows for individual assignment

    const assignmentId = document.createElement("td");
    const assignmentName = document.createElement("td");
    const assignmentStart = document.createElement("td");
    const assignmentDue = document.createElement("td");
    const assignmentMaxPoints = document.createElement("td");

    // add rows for assignment grade

    const gradePoints = document.createElement("td");
    const percentage = document.createElement("td");

    row.append(assignmentId, assignmentName, assignmentStart, assignmentDue, assignmentMaxPoints, gradePoints, percentage);
    table.append(row);

    return row;
}

function populateStudentGradeRow(row, grade) {

    row.dataset.id = grade.id;
    row.dataset.assignmentId = grade.assignmentId;

    getJSONById("assignments", grade.assignmentId)
    .then(assignment => {

        // add details for individual assignment

        row.children[0].textContent = grade.assignmentId;
        row.children[1].textContent = assignment.name;
        row.children[2].textContent = assignment.startDate;
        row.children[3].textContent = assignment.dueDate;
        row.children[4].textContent = assignment.maxPoints;

        // add details for assignment grade

        row.children[5].textContent = grade.points;
        row.children[6].textContent = ((grade.points / assignment.maxPoints) * 100).toFixed(2) + '%';
    })
    .catch(e => console.error(e));
}

function renderStudentGradeRow(grade, gradeId=0) {

    const table = document.querySelector("#student-assignments table");
    const row = (gradeId === 0) ? createStudentGradeRow() : table.querySelector(`tr[data-id="${gradeId}"]`);

    populateStudentGradeRow(row, grade);
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

            const table = document.querySelector("#student-assignments table")
            table.querySelectorAll("td").forEach(r => r.remove());

            student.grades.forEach(grade => renderStudentGradeRow(grade));
        })
        .catch(e => console.error(e));
    })
}

//****************************************************************************************************
// LOAD page and call event listeners

function main() {

    // render student list
    renderStudents();

    // add event handlers
    studentSelectListener();
}

main();
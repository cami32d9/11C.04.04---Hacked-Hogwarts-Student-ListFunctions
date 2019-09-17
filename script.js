"use strict";

document.addEventListener("DOMContentLoaded", getJson);

let originalStudentArray;
let studentArray = [];

async function getJson() {
    /* Loads the JSON */
    let pagesUrl = "http://petlatkea.dk/2019/hogwartsdata/students.json";
    let jsonData = await fetch(pagesUrl);
    originalStudentArray = await jsonData.json();
    start();
}

function start() {
    createStudentArray(originalStudentArray);
    sortFunction("lastName");
    console.log(studentArray);

    document.querySelector(".sort").addEventListener("change", function () {
        let sortBy = this.value;
        console.log(this.value);
        console.log(sortFunction(sortBy));
    });

    document.querySelector(".filter").addEventListener("change", function () {
        let house = this.value;
        console.log(this.value);
        console.log(filterFunction('house', house));
    });
}


// ----- CREATING THE LIST -----

function createStudentArray(originalArray) {
    originalArray.forEach(student => {
        let thisStudent = createStudentObject(student);
        studentArray.push(thisStudent);
    });
}

function createStudentObject(student) {
    const names = student.fullname
        .trim()
        .split(" ")
        .map(name => capitalize(name));

    return {
        firstName: names.shift(),
        lastName: names.pop() || "Unknown",
        middleName: names.join(" "),
        gender: student.gender,
        house: capitalize(student.house.trim())
    };
}

function capitalize(str) {
    const firstLetter = str.substring(0, 1);
    const lastLetters = str.substring(1, str.length);
    return firstLetter.toUpperCase() + lastLetters.toLowerCase();
}


// ----- FILTER AND SORT FUNCTIONS -----

function filterFunction(field, value) {
    if (value === "All") {
        return studentArray;
    }

    return studentArray.filter(function (student) {
        return student[field] === value;
    });
}

function sortFunction(sortBy) {
    studentArray.sort((a,b) => {
        return a[sortBy].localeCompare(b[sortBy]);
    });
    return studentArray;
}

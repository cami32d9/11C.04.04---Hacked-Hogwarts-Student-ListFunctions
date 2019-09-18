"use strict";

document.addEventListener("DOMContentLoaded", getJson);

let originalStudentArray;
let familyBlood;
let studentArray = [];
let sortBy = "lastName";
let house = "All";

const destStudentList = document.querySelector(".student_list");
const studentTemplate = document.querySelector(".student_template");

async function getJson() {
    // Getting student array
    let pagesUrl = "https://petlatkea.dk/2019/hogwartsdata/students.json";
    let jsonData = await fetch(pagesUrl);
    originalStudentArray = await jsonData.json();

    // Getting list of families and blood status
    let pagesUrlFam = "https://petlatkea.dk/2019/hogwartsdata/families.json";
    let jsonDataFam = await fetch(pagesUrlFam);
    familyBlood = await jsonDataFam.json();

    start();
}

function start() {
    createStudentArray(originalStudentArray);
    addMeToList();
    createFinishedList();
    addEventListeners();
    // showStudentList(studentArray);
}


// ----- EVENTLISTENERS -----

function addEventListeners() {
    document.querySelector(".sort").addEventListener("change", function () {
        sortBy = this.value;
        console.log(this.value);
        createFinishedList();
    });

    document.querySelector(".filter").addEventListener("change", function () {
        house = this.value;
        console.log(this.value);
        createFinishedList();
    });
}

// ----- CREATING THE LIST -----

function createStudentArray(originalArray) {
    originalArray.forEach(student => {
        let thisStudent = createStudentObject(student);
        thisStudent = addBloodStatus(thisStudent);
        thisStudent = randomizeBloodStatus(thisStudent);
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
        bloodStatus: null,
        lastName: names.pop() || "Unknown",
        middleName: names.join(" "),
        gender: student.gender,
        house: capitalize(student.house.trim()),
        isPrefect: false,
        isInqSquadMember: false
    };
}

function capitalize(str) {
    const firstLetter = str.substring(0, 1);
    const lastLetters = str.substring(1, str.length);
    return firstLetter.toUpperCase() + lastLetters.toLowerCase();
}

function addBloodStatus(thisStudent) {

    if (familyBlood.half.includes(thisStudent.lastName)) {
        thisStudent.bloodStatus = "Halfblood";
        // console.log("We're half");
    } else if (familyBlood.pure.includes(thisStudent.lastName)) {
        thisStudent.bloodStatus = "Pureblood";
        // console.log("We're pure");
    } else {
        thisStudent.bloodStatus = "Muggleblood";
    }

    return thisStudent;

}


// ----- FILTER AND SORT FUNCTIONS -----

function filterFunction(list, field, value) {
    if (value === "All") {
        return list;
    }

    return list.filter(function (student) {
        return student[field] === value;
    });
}

function sortFunction(list, sortBy) {
    list.sort((a, b) => {
        return a[sortBy].localeCompare(b[sortBy]);
    });
    return list;
}


// ----- CREATING FINISHED LIST -----

function createFinishedList() {
    const currentStudentList = filterFunction(sortFunction(studentArray, sortBy), 'house', house);
    console.log(currentStudentList);
    console.log(`Showing ${currentStudentList.length} students`);

    destStudentList.innerHTML = "";
    showStudentList(currentStudentList);

}


// ----- SHOW IN DOM -----

function showStudentList(list) {
    list.forEach(student => {
        const template = studentTemplate.content.cloneNode(true);

        const studentPortrait = `${student.lastName}_${student.firstName.substring(0, 1)}`.toLowerCase();

        template.querySelector(".student_thumbnail").src = `elements/students/${studentPortrait}.png`;
        template.querySelector(".list_first_names").innerHTML = student.firstName + ' ' + student.middleName;
        template.querySelector(".list_last_name").innerHTML = student.lastName;
        template.querySelector(".list_blood_status").innerHTML = student.firstName;
        template.querySelector(".list_prefect").innerHTML = student.isPrefect ? 'Yes' : 'No';
        template.querySelector(".list_inq_squad").innerHTML = student.isInqSquadMember ? 'Yes' : 'No';
        template.querySelector(".list_house").innerHTML = `
${student.house} 
<img src="elements/${student.house}_crest.png" class="crest" alt="${student.house} House Crest">
`;

        destStudentList.appendChild(template);
    })
}


// ----- HACKING -----

function addMeToList() {
    let thisStudent = createObjectOfMe();
    studentArray.push(thisStudent);
}

function createObjectOfMe() {
    return {
        firstName: "Camilla",
        lastName: "Olsen",
        middleName: "Gejl",
        gender: "girl",
        house: "Hufflepuff",
        bloodStatus: "Pureblood",
        isPrefect: false,
        isInqSquadMember: false
    };
}

function randomizeBloodStatus(thisStudent) {
    if (thisStudent.bloodStatus === "Halfblood" || thisStudent.bloodStatus === "Muggleblood") {
        thisStudent.bloodStatus = "Pureblood";
    } else {
        let bloodArray = ["Pureblood", "Halfblood", "Muggleblood"];
        let randomBlood = Math.floor(Math.random() * Math.floor(3));

        thisStudent.bloodStatus = bloodArray[randomBlood];
    }

    return thisStudent;
}

"use strict";

document.addEventListener("DOMContentLoaded", getJson);

let originalStudentArray;
let familyBlood;
let studentArray = [];
let sortBy = "lastName";
let house = "All";
let isShowingExpelled = false;
let expelClickListener;
let prefectClickListener;
let inqSquadClickListener;

const destStudentList = document.querySelector(".student_list");
const studentTemplate = document.querySelector(".student_template");
const popup = document.querySelector(".popup_container");
const popupDim = document.querySelector(".popup_dim");

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
    createList();
    addEventListeners();
}


// ----- EVENTLISTENERS -----

function addEventListeners() {
    document.querySelector(".sort").addEventListener("change", function () {
        sortBy = this.value;
        createList();
    });

    document.querySelector(".filter").addEventListener("change", function () {
        house = this.value;
        createList();
    });

    document.querySelector(".show_expelled_button").addEventListener("click", function _listener() {
        isShowingExpelled = true;
        destStudentList.setAttribute("showingExpelled", "true");
        this.style.display = "none";
        document.querySelector(".show_students_button").style.display = "inline-block";
        createList();
    });

    document.querySelector(".show_students_button").addEventListener("click", function _listener() {
        isShowingExpelled = false;
        destStudentList.setAttribute("showingExpelled", "false");
        this.style.display = "none";
        document.querySelector(".show_expelled_button").style.display = "inline-block";
        createList();
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
        lastName: names.pop() || "Unknown",
        middleName: names.join(" "),
        gender: student.gender,
        house: capitalize(student.house.trim()),
        isPrefect: false,
        isInqSquadMember: false,
        isExpelled: false,
        bloodStatus: null,
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
    } else if (familyBlood.pure.includes(thisStudent.lastName)) {
        thisStudent.bloodStatus = "Pureblood";
    } else {
        thisStudent.bloodStatus = "Muggleblood";
    }

    return thisStudent;

}


// ----- FILTER AND SORT FUNCTIONS -----


// Filter by house
function filterFunction(list, field, value) {
    if (value === "All") {
        return list;
    }

    return list.filter(function (student) {
        return student[field] === value;
    });
}

// Sort by
function sortFunction(list, sortBy) {
    list.sort((a, b) => {
        return a[sortBy].localeCompare(b[sortBy]);
    });
    return list;
}

// Filter expelled

function showNotExpelled(list) {
    return list.filter(function (student) {
        return student.isExpelled === false;
    });
}

function showExpelled(list) {
    return list.filter(function (student) {
        return student.isExpelled === true;
    });
}


// ----- CREATING FINISHED LIST -----

function createList() {
    if (isShowingExpelled) {
        createExpelledList();
    } else {
        createFinishedList();
    }
}

function createFinishedList() {
    const currentStudentList = showNotExpelled(filterFunction(sortFunction(studentArray, sortBy), 'house', house));
    console.log(currentStudentList);

    destStudentList.innerHTML = "";
    showStudentList(currentStudentList);
}

function createExpelledList() {
    const currentStudentList = showExpelled(filterFunction(sortFunction(studentArray, sortBy), 'house', house));
    console.log(currentStudentList);

    destStudentList.innerHTML = "";
    showStudentList(currentStudentList);
}

// ----- SHOW IN DOM -----

function showStudentList(list) {


    document.querySelector(".student_count_number").textContent = list.length;

    destStudentList.appendChild(document.querySelector(".table_headings_template").content.cloneNode(true));

    if (list.length === 0) {
        destStudentList.innerHTML = `<div style="text-align: center; margin-bottom: 20px;">No students to show</div>`
    }

    list.forEach(student => {
        const template = studentTemplate.content.cloneNode(true);

        let studentPortrait;
        let lastName = student.lastName;

        // If there is a - in the last name, the last part of the name will be used as lastName
        let nameArray = lastName.split("-");
        lastName = nameArray[nameArray.length-1];

        // If-statements for the Patil twins, as the images fall out of the norm
        if (student.firstName === "Parvati") {
            studentPortrait = "patil_parvati";
        }

        else if (student.firstName === "Padma") {
            studentPortrait = "patil_padme";
        }

        else {
        studentPortrait = `${lastName}_${student.firstName.substring(0, 1)}`.toLowerCase();
        }

        let isShowingNotExpelledList = destStudentList.getAttribute("showingExpelled") !== "true";
        if (isShowingNotExpelledList && student.isExpelled) {
            template.querySelector(".list_student_container").style.display = "none";
        }

        template.querySelector(".student_thumbnail").style.borderColor = `var(--${student.house}-main-color)`;
        template.querySelector(".student_thumbnail").src = `elements/students/${studentPortrait}.png`;
        template.querySelector(".list_first_names").innerHTML += `${student.firstName} ${student.middleName}`;
        template.querySelector(".list_last_name").innerHTML += student.lastName;
        template.querySelector(".list_blood_status").innerHTML += student.bloodStatus;
        template.querySelector(".list_prefect").innerHTML = student.isPrefect ? '<img src="elements/prefect_icon.svg" class="icon"> Prefect' : '';
        template.querySelector(".list_inq_squad").innerHTML = student.isInqSquadMember ? '<img src="elements/inq_icon.svg" class="icon"> Member' : '';
        template.querySelector(".list_house").innerHTML = `
${student.house} 
<img src="elements/${student.house}_crest.png" class="crest" alt="${student.house} House Crest">
`;

        destStudentList.appendChild(template);
        destStudentList.lastElementChild.addEventListener("click", openPopup);

        function openPopup() {
            console.log(student);

            popup.querySelector(".is_expelled").style.display = "none";
            popup.querySelector(".expel").setAttribute("data-student-name", student.firstName);
            popup.querySelector("h2").innerHTML = `${student.firstName} ${student.lastName}`;
            popup.querySelector(".student_image").src = `elements/students/${studentPortrait}.png`;
            popup.querySelector(".popup_first_name .popup_info_content").innerHTML = student.firstName + ' ' + student.middleName;
            popup.querySelector(".popup_last_name .popup_info_content").innerHTML = student.lastName;
            popup.querySelector(".popup_blood_status .popup_info_content").innerHTML = student.bloodStatus;
            popup.querySelector(".popup_prefect").innerHTML = student.isPrefect ? '<img src="elements/prefect_icon.svg" class="icon"> Prefect' : '';
            popup.querySelector(".popup_inq_squad").innerHTML = student.isInqSquadMember ? '<img src="elements/inq_icon.svg" class="icon"> Inq. Squad member' : '';
            popup.querySelector(".popup").style.backgroundColor = `var(--${student.house}-main-color)`;

            if (student.isExpelled === true) {
                popup.querySelector(".popup").style.backgroundColor = `grey`;
                popup.querySelector(".is_expelled").style.display = "block";
                popup.querySelector(".popup_option_buttons").style.display = "none";
            }

            else if (student.isExpelled === false) {
                popup.querySelector(".popup_option_buttons").style.display = "flex";
            }

            popup.style.display = "block";
            document.querySelector("body").style.overflow = "hidden";

            popupDim.addEventListener("click", closePopup);
            document.querySelector(".close").addEventListener("click", closePopup);

            addPopupListeners();
        }

        function addPopupListeners() {
            const inqSquadButton = popup.querySelector(".make_inq");
            const prefectButton = popup.querySelector(".make_prefect");
            const expelButton = popup.querySelector(".expel");

            inqSquadClickListener = function() {
                student.isInqSquadMember = !student.isInqSquadMember;
                inqSquadButton.textContent = student.isInqSquadMember ? "Remove inq. squad status" : "Make inq. squad member";
                destStudentList.innerHTML = "";
                createList();
                closePopup();
                openPopup();
            };

            prefectClickListener = function() {
                student.isPrefect = !student.isPrefect;
                destStudentList.innerHTML = "";
                createList();
                closePopup();
                openPopup();
            };

            expelClickListener = function() {
                if (document.querySelector(".popup_first_name .popup_info_content").innerHTML.includes("Camilla")) {
                    console.log("NOPE");
                    document.querySelector("main").style.display = "none";
                    document.querySelector(".dontexpelme").style.display = "flex";
                }

                else {
                    student.isExpelled = true;
                    student.isInqSquadMember = false;
                    student.isPrefect = false;
                    closePopup();
                    openPopup();

                    console.log(this.getAttribute("data-student-name"));
                    let thisStudent = this.getAttribute("data-student-name");

                    document.querySelectorAll(".list_student_container").forEach(student => {
                        if (student.querySelector(".list_first_names").innerHTML.includes(thisStudent)) {
                            student.classList.add("fade_out");
                            student.addEventListener("animationend", function _listener() {
                                destStudentList.innerHTML = "";
                                createList();
                            });
                        }
                    })
                }
            };

            const prefects = list.filter(s => s.isPrefect);
            if (!student.isPrefect && prefects.length >= 2) {
                prefectButton.disabled = true;
                prefectButton.textContent = "No can do";
            } else {
                prefectButton.disabled = false;
                prefectButton.textContent = student.isPrefect ? "Remove prefect status" : "Make prefect";
                prefectButton.addEventListener("click", prefectClickListener);
            }
            inqSquadButton.addEventListener("click", inqSquadClickListener);
            expelButton.addEventListener("click", expelClickListener);
        }
    });
}

function closePopup() {
    popup.style.display = "none";
    document.body.style.overflow = "visible";
    popup.querySelector(".make_inq").removeEventListener("click", inqSquadClickListener);
    popup.querySelector(".make_prefect").removeEventListener("click", prefectClickListener);
    popup.querySelector(".expel").removeEventListener("click", expelClickListener);
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
        isInqSquadMember: false,
        isExpelled: false,
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

// TODO: Add house crest to popup
// TODO: Reduce number of grid columns in student list under 400px
// TODO: Linebreak in sorting options under 550 px
// TODO: Max width of expelling error image
// TODO: Limit inq squad members to pure blood and Slytherin
// TODO: Cry over middle- and nick names

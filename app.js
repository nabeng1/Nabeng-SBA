const supabaseUrl =
"https://ftslcifbzohhgljqcgus.supabase.co";

const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c2xjaWZiem9oaGdsanFjZ3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTQ5NjUsImV4cCI6MjA5NTAzMDk2NX0.O6bGKNOdRDH1u2t-MiK8y0ppO-q-P4gggSeDEGsoUrQ";


var supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

let subjects = [
"English Language","Mathematics","Science","Social Studies","RME",
"History","ICT","Creative Arts","Physical Education (PE)",
"Pre-Technical Skills","Home Economics","Fante","Ga","Ewe","Twi",
"French","Language and literacy","Numeracy","OWOP","Writing"
];
let students = [];
let users = [];
let currentUser = null;
let selectedMediaFile = null;
let filteredStudents = [];
let gradeChartInstance = null;
let topChartInstance = null;
let subjectChartInstance = null;
let passChartInstance = null;
let selectedMessageId = null;
let activeTerm = "term1";
let selectedMarkTerm = "term1";
let selectedUser = null;
let selectedUserType = null;
let chatCache = [];
let chatCacheLoaded = false;
let chatCacheLoading = false;
let chatContacts = [];




// Show signup if no users exist
if(users.length === 0){
    document.getElementById("signupSection").style.display = "block";
    document.getElementById("loginSection").style.display = "none";
}
document.getElementById("roleSelect").addEventListener("change", function(){
    let role = this.value;

    let schoolCodeInput = document.getElementById("schoolCode");

    if(role === "admin"){
        document.getElementById("schoolNameBox").style.display = "block";

        schoolCodeInput.placeholder = "Create School Code";
        schoolCodeInput.value = "SCH_" + Math.floor(Math.random() * 100000); // auto-generate
    } 
    else {
        document.getElementById("schoolNameBox").style.display = "none";

        schoolCodeInput.placeholder = "Enter School Code";
        schoolCodeInput.value = "";
    }
});



async function loadUsers() {

    if (!currentUser) {
        console.error("currentUser is not available");
        users = [];
        return [];
    }

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .order("firstname");

    if (error) {
        console.error("Load Users Error:", error);
        users = [];
        return [];
    }

    users = data || [];

    console.log("Users Loaded:", users);
    console.log("Total Users:", users.length);

    if (currentUser.role === "admin") {
        loadTeachers();
    }

    return users;
}


function calculateSubjectResult(data) {

    let test1 = Number(data.test1 || 0);
    let test2 = Number(data.test2 || 0);
    let project = Number(data.project || 0);
    let group = Number(data.group || 0);
    let exam = Number(data.exam || 0);

    // Continuous Assessment (100 marks)
    let classTotal =
        test1 +
        test2 +
        project +
        group;

    // Convert to 50%
    let classScore =
        Number(((classTotal / 100) * 50).toFixed(2));

    // Convert Exam to 50%
    let examScore =
        Number(((exam / 100) * 50).toFixed(2));

    // Final score out of 100
    let totalScore =
        Number((classScore + examScore).toFixed(2));

    let grade = getGrade(totalScore);

	let remark = getRemark(totalScore);

    return {

        test1,
        test2,
        project,
        group,
        exam,

        classTotal,
        classScore,
        examScore,
        totalScore,

        grade,
        remark

    };

}

function calculateStudentAverage(student, term){

    if(!student.subjects){

        student.average = 0;
        return;

    }

    let total = 0;
    let count = 0;

    Object.keys(student.subjects).forEach(subject=>{

        let result =
        student.subjects[subject]?.[term];

        if(!result) return;

        if(result.totalScore === undefined) return;

        total += Number(result.totalScore);

        count++;

    });

    student.average =
    count
    ? Number((total / count).toFixed(2))
    : 0;

}


async function signup() {

    let firstname =
        document.getElementById("firstname").value.trim();

    let surname =
        document.getElementById("surname").value.trim();

    let username =
        document.getElementById("signupUsername").value.trim();

    let email =
        document.getElementById("signupEmail").value.trim();

    let phone =
        document.getElementById("signupPhone").value.trim();

    let password =
        document.getElementById("signupPassword").value.trim();

    let role =
        document.getElementById("roleSelect").value;

    let schoolname =
        document.getElementById("schoolnamesignup").value.trim();

    let schoolCode =
        document.getElementById("schoolCode").value.trim();

    // =========================
    // VALIDATION
    // =========================

    if (
        !firstname ||
        !surname ||
        !username ||
        !email ||
        !phone ||
        !password
    ) {
        return alert("Please fill all fields");
    }

    // =========================
    // ADMIN VALIDATION
    // =========================

    if (role === "admin") {

        if (!schoolname) {
            return alert("Enter school name");
        }

        if (!schoolCode) {
            return alert("Enter school code");
        }

        // CHECK IF SCHOOL CODE EXISTS
        const { data: existingSchool } =
            await supabaseClient
                .from("schools")
                .select("*")
                .eq("schoolid", schoolCode)
                .maybeSingle();

        if (existingSchool) {
            return alert("School code already exists");
        }
    }

    // =========================
    // TEACHER VALIDATION
    // =========================

    if (role === "teacher") {

        if (!schoolCode) {
            return alert("Enter school code");
        }

        const { data: schoolExists } =
            await supabaseClient
                .from("schools")
                .select("*")
                .eq("schoolid", schoolCode)
                .maybeSingle();

        if (!schoolExists) {
            return alert("Invalid school code");
        }
    }

    // =========================
    // CREATE AUTH ACCOUNT
    // =========================

    const {
        data: authData,
        error: authError
    } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (authError) {
        console.error(authError);
        return alert(authError.message);
    }

    const authUser = authData.user;

    // =========================
    // CREATE SCHOOL (ADMIN)
    // =========================

    if (role === "admin") {

        const { error: schoolError } =
            await supabaseClient
                .from("schools")
                .insert([
                    {
                        schoolname: schoolname,
                        schoolid: schoolCode,
                        adminid: authUser.id
                    }
                ]);

        if (schoolError) {
            console.error(schoolError);
            return alert(schoolError.message);
        }
    }

    // =========================
    // CREATE USER PROFILE
    // =========================

    const { error: userError } =
        await supabaseClient
            .from("users")
            .insert([
                {
                    id: authUser.id,
                    firstname: firstname,
                    surname: surname,
                    username: username,
                    email: email,
                    phone: phone,
                    role: role,
                    schoolid: schoolCode,
                    schoolname:
                        role === "admin"
                            ? schoolname
                            : ""
                }
            ]);

    if (userError) {
        console.error(userError);
        return alert(userError.message);
    }

    alert("Account created successfully!");

    backToLogin();
}
// SHOW SIGNUP
function showSignup(){
	
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("signupSection").style.display = "block";
    document.getElementById("forgotSection").style.display = "none";

    
}



// BACK TO LOGIN
function backToLogin(){
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("signupSection").style.display = "none";
    document.getElementById("forgotSection").style.display = "none";
}


async function login() {

    let email =
        document.getElementById("username").value.trim();

    let password =
        document.getElementById("password").value.trim();

    // =========================
    // LOGIN
    // =========================

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {

        console.error(error);

        document.getElementById("loginMsg").innerText =
            error.message;

        return;
    }
document.body.style.background = "#000";
document.body.classList.add("logged-in");
    // =========================
    // GET AUTH USER
    // =========================

    const authUser = data.user;

    // =========================
    // FETCH PROFILE
    // =========================

    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

    if (profileError || !profile) {

        console.error(profileError);

        document.getElementById("loginMsg").innerText =
            "Profile not found";

        return;
    }

    currentUser = profile;

    // =========================
    // DEFAULT ARRAYS
    // =========================

    currentUser.classes =
        currentUser.classes || [];

    currentUser.subjects =
        currentUser.subjects || [];

    // =========================
    // DEFAULT MAIN CLASS
    // =========================

    if (
        !currentUser.mainClass &&
        currentUser.classes.length > 0
    ) {
        currentUser.mainClass =
            currentUser.classes[0];
    }

    // =========================
    // INIT
    // =========================

    initDefaultClasses();

    // SAVE SESSION
    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(currentUser)
    );

    // SHOW APP
    document.getElementById("loginBox").style.display =
        "none";

    document.getElementById("app").style.display =
        "block";

    document.getElementById("topNav").style.display =
        "flex";

    document.getElementById("subHeader").style.display =
        "flex";

    // WELCOME TEXT
    document.getElementById("welcomeUser").innerText =
        "👋 Welcome, " + currentUser.firstname;

    // LOAD DATA
	
	await initializeSystem();
    await loadStudents();
    updateDashboard();
    populateStudentList();
    showPage("dashboardPage");
    loadLogo();
	await displaySchoolName();
    await loadTheme();
	await loadTermSettings();
activeTerm = await getCurrentTerm();
    updateOnlineStatus();
	await loadNotices();
	
	
}


async function displaySchoolName() {


    if (!currentUser || !currentUser.schoolid) {

        console.warn("No schoolid found for user");

        document.getElementById("schoolNameText").innerText =
            "No School Assigned";

        return;
    }

    try {

        const { data, error } = await supabaseClient
            .from("schools")
            .select("schoolname")
            .eq("schoolid", currentUser.schoolid)
            .single();


        if (error) {

            console.error("School fetch error:", error);

            document.getElementById("schoolNameText").innerText =
    data.schoolname;

            return;
        }

        let schoolName =
            data?.schoolname ||
            currentUser.schoolname ||
            "Your School";

        let displayText = schoolName;

        // Show school code only for admin
        if (currentUser.role === "admin") {
            displayText +=
                " (Code: " + currentUser.schoolid + ")";
        }

        document.getElementById("schoolNameText").innerText =
            displayText;

        // Show edit icon only for admin
        document.getElementById("editSchoolIcon").style.display =
            currentUser.role === "admin"
                ? "inline"
                : "none";

    } catch (err) {

        console.error("Display School Name Error:", err);

        document.getElementById("schoolNameText").innerText =
            "Error Loading School";
    }
}
async function editSchoolName() {

    if (currentUser.role !== "admin") return;

    let newName = prompt(
        "Edit School Name:",
        currentUser.schoolname
    );

    if (newName && newName.trim()) {

        newName = newName.trim();

        // Update current user object
        currentUser.schoolname = newName;

        // Update school table
        const { error: schoolError } = await supabaseClient
            .from("schools")
            .update({
                schoolname: newName
            })
            .eq("schoolid", currentUser.schoolid);

        // Update current admin user
        const { error: userError } = await supabaseClient
            .from("users")
            .update({
                schoolname: newName
            })
            .eq("username", currentUser.username);

        if (schoolError || userError) {

            console.log(
                schoolError || userError
            );

            alert("Failed to update school name");

            return;
        }

        // Save current session locally
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(currentUser)
        );

        displaySchoolName();
    }
}
async function loadTheme() {

    // Fetch theme from Supabase
    const { data, error } = await supabaseClient
        .from("users")
        .select("theme")
        .eq("username", currentUser.username)
        .single();

    let theme = data?.theme || "light";

    if (theme === "light") {

        document.body.classList.add("light-mode");

        document.getElementById("themeBtn").innerText = "";

    } else {

        document.body.classList.remove("light-mode");

        document.getElementById("themeBtn").innerText = "";
    }
}
function showForgot(){
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("forgotSection").style.display = "block";
}


let generatedOTP = "";

async function resetPassword() {

    let u = document.getElementById("fpUsername").value.trim();
    let contact = document.getElementById("fpContact").value.trim();

    if (!u || !contact) {
        return alert("Fill all fields");
    }

    // Check if user exists
    const { data: user, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", u)
        .or(`email.eq.${contact},phone.eq.${contact}`)
        .single();

    if (error || !user) {
        return alert("User not found or incorrect details");
    }

    // Generate OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    alert("Your OTP is: " + generatedOTP);

    // Ask user to enter OTP
    const enteredOTP = prompt("Enter the OTP");

    if (enteredOTP !== generatedOTP) {
        return alert("Incorrect OTP");
    }

    // Ask for new password
    const newPass = prompt("Enter your new password");

    if (!newPass) {
        return alert("Password cannot be empty");
    }

    // Send reset email from Supabase
    const { error: resetError } =
        await supabaseClient.auth.resetPasswordForEmail(user.email);

    if (resetError) {
        console.log(resetError);
        return alert("Failed to send password reset email.");
    }

    alert(
        "OTP verified.\n\nA password reset link has been sent to:\n\n" +
        user.email +
        "\n\nOpen your email and choose a new password."
    );

    backToLogin();
}

function triggerLogoUpload(){
    document.getElementById("schoolLogoPreview").onclick = function(){
        if(currentUser.role !== "admin"){
            alert("Only Admin can change school logo");
            return;
        }
        document.getElementById("schoolLogoInput").click();
    }
}
function uploadLogo(){
    if(currentUser.role !== "admin"){
        alert("Only Admin can change school logo");
        return;
    }

    document.getElementById("schoolLogoInput").click();
}
async function loadLogo() {

    const img = document.getElementById("schoolLogoPreview");

    try {

        const { data, error } = await supabaseClient
            .from("schools")
            .select("schoolLogo")
            .eq("schoolid", currentUser.schoolid)
            .single();

		
       

        img.src = data?.schoolLogo || "default-school-logo.png";

    } catch (err) {

        console.error(err);

        img.src = "default-school-logo.png";
    }
}

function displayLogo(logo){
    let img = document.getElementById("schoolLogoPreview");

    img.src = logo;
    img.style.display = "block";

}

document.getElementById("schoolLogoInput")
.addEventListener("change", async function () {

    let file = this.files[0];

if (!file) return;

const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

if (!allowedTypes.includes(file.type)) {
    alert("Please upload JPG, PNG, or WEBP images only.");
    return;
}

    // Unique filename
    let fileName =
        `${currentUser.schoolid}-${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseClient
        .storage
        .from("school-logos")
        .upload(fileName, file);

    if (error) {

        console.log(error);

        return alert("Logo upload failed");
    }

    // Get public URL
   const { data: urlData } = await supabaseClient
    .storage
    .from("school-logos")
    .getPublicUrl(fileName);

    let logoUrl = urlData.publicUrl;

    // Save URL in database
    const { error: dbError } = await supabaseClient
        .from("schools")
        .update({
            schoolLogo: logoUrl
        })
        .eq("schoolid", currentUser.schoolid);

    if (dbError) {

        console.log(dbError);

        return alert("Failed to save logo");
    }

    // Display logo
    document.getElementById(
        "schoolLogoPreview"
    ).src = logoUrl;

    alert("Logo uploaded successfully");
});

function logout(){
    localStorage.removeItem("loggedInUser"); // clear session
    location.reload();
}

async function loadStudents() {

    let query = supabaseClient
        .from("students")
        .select("*")
        .eq("schoolid", currentUser.schoolid);

    const { data, error } = await query;

    if(error){
        console.log(error);
        students = [];
        return;
    }

    let allStudents = data || [];

    // Teacher only sees assigned classes
    if(currentUser.role === "teacher"){

        students = allStudents.filter(s =>
            (currentUser.classes || [])
            .includes(s.studentclass)
        );

    } else {

        students = allStudents;
    }

    // Sort: Males first, then Females, then alphabetically
    students.sort((a, b) => {

        const genderA = (a.gender || "").toLowerCase();
        const genderB = (b.gender || "").toLowerCase();

        if (genderA !== genderB) {
            if (genderA === "male") return -1;
            if (genderB === "male") return 1;
        }

        const nameA = `${a.firstname || ""} ${a.surname || ""}`.trim();
        const nameB = `${b.firstname || ""} ${b.surname || ""}`.trim();

        return nameA.localeCompare(nameB);
    });

    updateStudentSuggestions();
}

function generatePassword(length = 6) {

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let password="";


    for(let i=0;i<6;i++){


        password += chars.charAt(

            Math.floor(
                Math.random()*chars.length
            )

        );


    }


    return password;


}



async function generateStudentId(){

    let newID;
    let found = false;


    while(!found){

        let randomNumber =
        Math.floor(1000 + Math.random() * 9000);


        newID =
        "SBA26" + randomNumber;



        const {data,error} =
        await supabaseClient
        .from("students")
        .select("studentid")
        .eq("studentid", newID);



        if(error){

            console.log(error);
            return null;

        }


        if(!data || data.length === 0){

            found = true;

        }

    }


    return newID;

}

function copyStudentID() {

    const idElement = document.getElementById("studentIDText");

    if (!idElement) {
        showToast("Student ID not found.");
        return;
    }

    const studentID = idElement.innerText.trim();

    if (!studentID || studentID === "Not Generated") {
        showToast("Student ID is not available.");
        return;
    }

    navigator.clipboard.writeText(studentID)
        .then(() => {
            showToast("Student ID copied.");
        })
        .catch(error => {
            console.error("Copy Student ID error:", error);
            showToast("Failed to copy Student ID.");
        });
}


function copyStudentPassword() {

    const passwordElement =
        document.getElementById("studentPassword");

    if (!passwordElement) {
        showToast("Password not found.");
        return;
    }

    const password = passwordElement.value.trim();

    if (!password) {
        showToast("Student password is not available.");
        return;
    }

    navigator.clipboard.writeText(password)
        .then(() => {
            showToast("Password copied.");
        })
        .catch(error => {
            console.error("Copy Password error:", error);
            showToast("Failed to copy password.");
        });
}

async function saveStudents() {

    if (!students || students.length === 0) {
        return;
    }

    let preparedStudents = await Promise.all(

students.map(async s => {


    let studentID = s.studentid;

    let studentPassword = s.studentpassword;


    // New student account generation
    if(!studentID){

        studentID = await generateStudentId();

        studentPassword = generatePassword();

    }


    return {

        ...s,

        schoolid: currentUser.schoolid,


        teacher:
        currentUser.role === "admin"
        ? s.teacher || null
        : currentUser.username,


        studentid: studentID,

        studentpassword: studentPassword,

        passwordchanged:
        s.passwordchanged || false

    };


})

);

    // Admin saves all
    if (currentUser.role === "admin") {

        const { error } = await supabaseClient
            .from("students")
            .upsert(preparedStudents);

       if (error) {
    console.error("SAVE ERROR:", error);
    alert(error.message);
    return;
}

console.log("Students saved successfully");

        return;
    }

    // Teacher saves only own students
    const { error } = await supabaseClient
        .from("students")
        .upsert(preparedStudents);

    if (error) {
        console.log(error);
    }
}

async function generateStudentPortalAccounts(){


    // Only admin allowed
    if(!currentUser || currentUser.role !== "admin"){

        alert("Only admin can generate student portal accounts");

        return;

    }


    // Get students without accounts
    const { data: students, error } = await supabaseClient

        .from("students")

        .select("*")

        .eq("schoolid", currentUser.schoolid)

        .is("studentid", null);



    if(error){

        console.error(error);

        alert(error.message);

        return;

    }



    if(!students || students.length === 0){

        alert(
            "All students already have portal accounts."
        );

        return;

    }



    let generatedAccounts = [];



    for(let student of students){


        // Generate student ID
        let studentID =
            await generateStudentId();



        // Generate password
        let tempPassword =
            generatePassword();



        // Update student record
        const {error:updateError} =

        await supabaseClient

        .from("students")

        .update({

            studentid: studentID,

            studentpassword: tempPassword,

            passwordchanged: false

        })

        .eq("id", student.id);



       if(updateError){

    console.error(
        "Failed:",
        student.name,
        updateError
    );

    continue;

}


generatedAccounts.push({

    name:
    student.name,

    id:
    studentID,

    password:
    tempPassword

});



    }



    // Display results

    let result = 
    "STUDENT PORTAL ACCOUNTS CREATED\n\n";


    generatedAccounts.forEach(account=>{


        result +=
        "Student: " + account.name +
        "\nStudent ID: " + account.studentid +
        "\nPassword: " + account.password +
        "\n\n";


    });



    alert(result);



    // Reload students list
    await loadStudents();


}

function loadStudentManagement(){

    if(currentUser.role === "admin"){

        document.getElementById(
        "generateAccountsBtn"
        ).style.display="block";

    }

}


async function showPage(id){

    document.querySelectorAll('.page')
    .forEach(p => p.style.display = 'none');

    let page = document.getElementById(id);

    if(page){
        page.style.display = 'block';
    }

    // ACTIVE NAV
    document.querySelectorAll('.nav-item')
    .forEach(item => item.classList.remove('active'));

    if(id === 'dashboardPage')
        document.querySelectorAll('.nav-item')[0]
        ?.classList.add('active');

    if(id === 'studentsPage')
        document.querySelectorAll('.nav-item')[1]
        ?.classList.add('active');

    if(id === 'subjectsPage')
        document.querySelectorAll('.nav-item')[2]
        ?.classList.add('active');

    if(id === 'attendancePage')
        document.querySelectorAll('.nav-item')[3]
        ?.classList.add('active');

    if(id === 'chat')
        document.querySelectorAll('.nav-item')[4]
        ?.classList.add('active');

    if(id === 'reportsPage')
        document.querySelectorAll('.nav-item')[5]
        ?.classList.add('active');

  await loadStudents();

// ATTENDANCE
if(id === "attendancePage"){

    let attendanceDate =
    document.getElementById("attendanceDate");

    if(attendanceDate){
        attendanceDate.valueAsDate =
        new Date();
    }

    document.getElementById(
        "attendanceTerm"
    ).value = activeTerm;

    loadAttendanceTable();
}

// REPORTS
if(id === "reportsPage"){

    let reportTerm =
    document.getElementById("reportTerm");

    if(reportTerm){
        reportTerm.value = activeTerm;
    }
}

if(id === "profilePlanPage"){
    document.getElementById("planTerm").value = activeTerm;
}

if(id === "profileNotePage"){
    document.getElementById("noteTerm").value = activeTerm;
}

    // WELCOME TEXT
    let welcomeText =
    document.getElementById("welcomeText");

    if(welcomeText){

        welcomeText.style.display =
        id === "dashboardPage"
        ? "block"
        : "none";
    }

   // STUDENTS PAGE
if(id === "studentsPage"){

    loadStudentsTable();
    loadClassOptions();

    let addSection =
        document.getElementById("addStudentSection");

    if(addSection){

        addSection.style.display =
            currentUser.role === "admin"
            ? "none"
            : "block";
    }
}

// STUDENTS PAGE
if(id === "studentsPage"){


    loadStudentsTable();
    loadClassOptions();



    // SHOW GENERATE ACCOUNT BUTTON FOR ADMIN

    let generateBtn =
    document.getElementById(
        "generateAccountsBtn"
    );


    if(generateBtn){

        if(
            currentUser.role &&
            currentUser.role.toLowerCase() === "admin"
        ){

            generateBtn.style.display = "block";

        }else{

            generateBtn.style.display = "none";

        }

    }



    // HIDE ADD STUDENT FOR ADMIN

    let addSection =
    document.getElementById(
        "addStudentSection"
    );


    if(addSection){

        addSection.style.display =
        currentUser.role === "admin"
        ? "none"
        : "block";

    }

}

    // CHAT
    if(id === 'chat'){

        let chat =
        document.getElementById('chat');

        if(chat){
            chat.style.display = 'block';
        }
		await loadUsers();
        displayUsers();
        

    } else {

        let chat =
        document.getElementById('chat');

        if(chat){
            chat.style.display = 'none';
        }
    }
	
	let profilepage = document.getElementById(id);

if(page){
    page.style.display = "block";
}

if(id === "userProfilePage"){
    loadProfileData();
loadSignature();
}

// SCHOOL PAGES
if(
    id === "homeworkPage" ||
    id === "feesPage" ||
    id === "noticesPage"
){

    setupSchoolPages();

}
if (id === "noticesPage") {
    await loadNotices();
}
}

function updateDashboard(){

    if(!Array.isArray(students)) return;

    document.getElementById("totalStudents").innerText =
        students.length;

    if(students.length === 0){

        document.getElementById("highestScore").innerText = "0%";
        document.getElementById("avgScore").innerText = "0%";
        document.getElementById("passRate").innerText = "0%";

        return;
    }

    const averages = students.map(s => Number(s.average) || 0);

    const highest = Math.max(...averages);

    const average =
        averages.reduce((sum,x)=>sum+x,0) /
        averages.length;

    const passRate =
        averages.filter(x=>x>=50).length /
        averages.length * 100;

    document.getElementById("highestScore").innerText =
        highest.toFixed(1) + "%";

    document.getElementById("avgScore").innerText =
        average.toFixed(1) + "%";

    document.getElementById("passRate").innerText =
        passRate.toFixed(0) + "%";

    drawCharts();

}

function displayStudents(){
    let html=`<table>
    <tr>
        <th>Name</th>
        <th>class</th>
        <th>Actions</th>
    </tr>`;

    students.forEach((s,i)=>{
        html += `<tr>
           <td onclick="openStudentModal(${i})" style="cursor:pointer; color:#60a5fa;">
    ${s.name}
</td>
        <td>${s.studentclass}</td>
        <td>
            <button class="action-btn edit-btn" onclick="editStudent(${i})">✏️ Edit</button>
			<button class="action-btn delete-btn" onclick="deleteStudent(${i})">🗑 Delete</button>
        </td>
        </tr>`;
    });

    html += `</table>`;
    tableContainer.innerHTML = html;
}


function saveMarksFromModal(){
    saveMarks();  // use your existing function
    closeStudentModal();
    alert("Marks saved successfully ✅");
}

function importStudents(){
    let data = document.getElementById("bulkData").value.trim();

    if(!data) return alert("Paste student data first");

    let lines = data.split("\n");

    lines.forEach(line=>{
        let parts = line.split(",");

        if(parts.length < 2) return;

        let name = parts[0].trim();
        let cls = parts[1].trim();

        if(name && cls){
            students.push({
    name,
    studentclass: cls,
    subjects: {},
    currentTerm: "term1",
    teacher: currentUser.username   // ✅ ADD THIS
});
        }
    });

    saveStudents();
    populateStudentList();
    updateDashboard();

    alert("Students imported successfully!");
    document.getElementById("bulkData").value = "";
	
if(!students.find(s => s.name === name && s.studentclass === cls)){
    students.push({
        name,
        studentclass: cls,
        subjects: {},
        currentTerm: "term1"
    });
}
}

async function handleCSV(event){

    let file = event.target.files[0];
    if(!file) return;

    let reader = new FileReader();

    reader.onload = async function(e){

        let text = e.target.result;
        let lines = text.split("\n");

        if(lines.length < 2){
            return alert("CSV file is empty");
        }

        let importedStudents = [];

        lines.slice(1).forEach(line => {

            if(!line.trim()) return;

            let values = line.split(",");

            let student = {

                name: values[0]?.trim(),
                studentclass: values[1]?.trim(), // <-- change if needed
                gender: values[2]?.trim() || "Male",

                subjects: {},
                currentTerm: "term1",
                teacher: currentUser.username,
                schoolid: currentUser.schoolid

            };

            subjects.forEach(sub => {

                student.subjects[sub] = {};

                student.subjects[sub]["term1"] = {
                    test1: 0,
                    test2: 0,
                    project: 0,
                    group: 0,
                    exam: 0
                };

            });

            if(student.name && student.studentclass){
                importedStudents.push(student);
            }

        });

        if(importedStudents.length === 0){
            return alert("No valid students found in CSV");
        }

        const { error } = await supabaseClient
            .from("students")
            .insert(importedStudents);

        if(error){

            console.log(error);
            return alert("Import failed");

        }

        await loadStudents();


        loadStudentsTable();
        updateDashboard();

        alert(`✅ ${importedStudents.length} students imported successfully`);

    };

    reader.readAsText(file);
}
function populateStudentList() {

    const term =
        activeTerm ||
        document.getElementById("termSelect")?.value ||
        "term1";

    const list =
        (filteredStudents && filteredStudents.length)
            ? filteredStudents
            : students;

    // School subject list (used by Admin)
    const Subjects =
        (subjects || []).map(sub =>
            typeof sub === "string" ? sub : sub.name
        );

    const html = list.map((s, i) => {

        // Teacher sees only assigned subjects
        // Admin sees all school subjects
        const subjectList =
    currentUser.role === "teacher"
        ? [...new Set(currentUser.subjects || [])]
        : [...new Set(schoolSubjects)];

        const totalSubjects = subjectList.length;

        let completed = 0;
        let started = 0;

        subjectList.forEach(subject => {

            const mark = s.subjects?.[subject]?.[term];

            if (!mark) return;

            started++;

            const isCompleted =
                mark.test1 !== undefined &&
                mark.test2 !== undefined &&
                mark.project !== undefined &&
                mark.group !== undefined &&
                mark.exam !== undefined;

            if (isCompleted) {
                completed++;
            }

        });

        const progress =
            totalSubjects > 0
                ? Math.round((completed / totalSubjects) * 100)
                : 0;

        let color = "#ef4444";

        if (progress === 100) {

            color = "#22c55e";

        } else if (progress > 0) {

            color = "#f59e0b";

        }

        return `

        <div class="card ${s.id === currentStudent?.id ? "active-student" : ""}"
             onclick="selectFilteredStudent(${i})">

            <div style="font-weight:bold;">
                ${s.name}
            </div>

            ${
                started > 0
                ? `
                <div style="
                    font-size:12px;
                    margin-top:4px;
                    color:${color};
                    font-weight:bold;
                ">
                    ${progress}% Complete
                </div>
                `
                : `
                <div style="
                    font-size:12px;
                    margin-top:4px;
                    color:#9ca3af;
                ">
                    Not Started
                </div>
                `
            }

        </div>

        `;

    }).join("");

    studentsList.innerHTML = html;

}

async function editStudent(index){

    let s = students[index];

    let newName = prompt("Edit Name:", s.name);
    if(!newName) return;

    let newClass = prompt(
        "Edit Class:",
        s.studentclass
    );

    if(!newClass) return;

    let newGender = prompt(
        "Gender (Male/Female):",
        s.gender || "Male"
    );

    s.name = newName;
    s.studentclass = newClass;
    s.gender = newGender;

    await saveStudents();

    loadStudentsTable();
    populateStudentList();
    updateDashboard();

    alert("Student updated successfully");
}

async function deleteStudent(studentid){

    const { error } = await supabaseClient
        .from("students")
        .delete()
        .eq("id", studentid);
console.log("Deleting:", studentid);
console.log("Delete Result:", error);
    if(error){
        console.log("Delete Error:", error);
        return alert("Failed to delete student");
    }

    await loadStudents();
    loadStudentsTable();

    alert("Student deleted successfully");
}

function drawCharts(){

    let grades = {A:0,B:0,C:0,D:0,F:0};
    let pass = 0, fail = 0;

    students.forEach(s=>{
        let avg = s.average || 0;
        let g = getGrade(avg);

        if(grades[g] !== undefined){
            grades[g]++;
        }

        if(avg >= 50) pass++;
        else fail++;
    });

    // DESTROY OLD CHARTS
    if(gradeChartInstance) gradeChartInstance.destroy();
    if(topChartInstance) topChartInstance.destroy();
    if(subjectChartInstance) subjectChartInstance.destroy();
    if(passChartInstance) passChartInstance.destroy();

    // GRADE PIE
    gradeChartInstance = new Chart(
        document.getElementById("gradeChart"),
        {
            type:'pie',
            data:{
                labels:Object.keys(grades),
                datasets:[{
                    data:Object.values(grades),
                    backgroundColor:[
                        '#f472b6',
                        '#fb7185',
                        '#facc15',
                        '#4ade80',
                        '#f87171'
                    ]
                }]
            }
        }
    );

    // TOP STUDENTS
    let sorted = [...students]
        .sort((a,b)=>(b.average||0)-(a.average||0))
        .slice(0,5);

    topChartInstance = new Chart(
        document.getElementById("topChart"),
        {
            type:'bar',
            data:{
                labels:sorted.map(s=>s.name || "Student"),
                datasets:[{
                    data:sorted.map(s=>s.average || 0),
                    backgroundColor:'#f472b6'
                }]
            }
        }
    );

    // SUBJECT AVERAGE
    subjectChartInstance = new Chart(
        document.getElementById("subjectChart"),
        {
            type:'bar',
            data:{
                labels:["Math","English","Science","ICT"],
                datasets:[{
                    data:[65,70,75,68],
                    backgroundColor:'#fb7185'
                }]
            }
        }
    );

    // PASS FAIL
    passChartInstance = new Chart(
        document.getElementById("passChart"),
        {
            type:'bar',
            data:{
                labels:["Pass","Fail"],
                datasets:[{
                    data:[pass,fail],
                    backgroundColor:['#4ade80','#f87171']
                }]
            }
        }
    );
}

async function addStudentFromPage(){

if(currentUser.role === "admin"){
    return alert("❌ Only teachers can add students");
}
    let name =
        document.getElementById(
            "studentname"
        ).value.trim();

    let cls =
        document.getElementById(
            "studentClass"
        ).value.trim();

    // VALIDATION
    if(!name || !cls){

        return alert(
            "Enter name and class"
        );
    }

    // TEACHER RESTRICTION
   if(currentUser.role === "teacher"){

    let allowedClasses =
        currentUser.classes || [];

    if(!allowedClasses.includes(cls)){

        return alert(
            "❌ You can only add students to your assigned classes"
        );
    }
}

    let gender =
        prompt(
            "Enter Gender (Male/Female)"
        );

    // SAVE TO SUPABASE
    const { error } =
        await supabaseClient
            .from("students")
            .insert([
{
    name: name,
    studentclass: cls,
    gender: gender || "Male",
    teacher: currentUser.username,
    schoolid: currentUser.schoolid,
    subjects: {},
    currentTerm: "term1",
    average: 0
}
])

    if(error){

        console.log(error);

        return alert(
            "Failed to add student"
        );
    }

    // RELOAD
    await loadStudents();

    document.getElementById(
        "studentname"
    ).value = "";

    document.getElementById(
        "studentClass"
    ).value = "";

    loadStudentsTable();
    populateStudentList();
    updateDashboard();

    alert(
        "Student added successfully ✅"
    );
	
	updateStudentSuggestions();
}

function openStudentForm(index){
    showPage('subjectsPage');   // go to subjects page
    setTimeout(()=>{
        selectStudent(index);   // open the form
    }, 100);
}


function loadStudentsTable(){
    let keyword =
        document.getElementById("searchStudent")?.value
        .toLowerCase() || "";

    // FILTER STUDENTS
    let filtered = students.filter(s =>
        s.name.toLowerCase().includes(keyword) ||
        s.studentclass.toLowerCase().includes(keyword)
    );

    // START TABLE
    let html = `
    <table>
        <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Gender</th>
            <th>Actions</th>
        </tr>
    `;

    // LOOP STUDENTS
    filtered.forEach((s)=>{

        // FIND REAL INDEX
        let realIndex = students.findIndex(st =>
            st.name === s.name &&
            st.studentclass === s.studentclass
        );

        html += `
        <tr>

            <!-- CLICK STUDENT NAME -->
            <td onclick="openStudentModal(${realIndex})"
                style="
                    cursor:pointer;
                    color:#60a5fa;
                    font-weight:bold;
                "
            >
                ${s.name}
            </td>

            <!-- CLASS -->
            <td>${s.studentclass}</td>

            <!-- GENDER -->
            <td>
                <select
                    onchange="updateGender(${realIndex}, this.value)"
                >
                    <option value="Male"
                        ${s.gender === "Male" ? "selected" : ""}>
                        Male
                    </option>

                    <option value="Female"
                        ${s.gender === "Female" ? "selected" : ""}>
                        Female
                    </option>
                </select>
            </td>

            <!-- ACTIONS -->
            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editStudent(${realIndex})"
                >
                    ✏️ Edit
                </button>

                <button
    class="action-btn delete-btn"
    onclick="deleteStudent('${s.id}')"
>
    🗑 Delete
</button>

            </td>

        </tr>
        `;
    });

    // NO STUDENTS
    if(filtered.length === 0){
        html += `
        <tr>
            <td colspan="4"
                style="text-align:center; padding:20px;">
                No students found
            </td>
        </tr>
        `;
    }

    // CLOSE TABLE
    html += `</table>`;

    // DISPLAY TABLE
    document.getElementById("studentsTable").innerHTML = html;
}

function updateGender(index, newGender){
    students[index].gender = newGender;
    saveStudents();
}

function searchStudent(){
    loadStudentsTable();
}

// Attendance data stored in localStorage: { date: { studentname: "Present"/"Absent" } }
let attendanceData = {};

function loadAttendanceTable() {

    let date = document.getElementById("attendanceDate").value;
    if(!date) return;

    if(!attendanceData[date]) {
        attendanceData[date] = {};

        students.forEach(s => {
            attendanceData[date][s.name] = "";
        });
    }

    // =========================
    // ADMIN VIEW
    // =========================
    if(currentUser.role === "admin"){

        let grouped = {};

        students.forEach(s => {

            if(!grouped[s.studentclass]){
                grouped[s.studentclass] = {
                    total:0,
                    present:0,
                    absent:0,
                    boys:0,
                    girls:0
                };
            }

            grouped[s.studentclass].total++;

            let status = attendanceData[date][s.name];

            if(status === "Present"){

                grouped[s.studentclass].present++;

                if(s.gender === "Male"){
                    grouped[s.studentclass].boys++;
                }

                if(s.gender === "Female"){
                    grouped[s.studentclass].girls++;
                }

            } else {

                grouped[s.studentclass].absent++;

            }

        });

        let html = `
        <table>
            <tr>
                <th>Class</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Boys</th>
                <th>Girls</th>
                <th>Total</th>
            </tr>
        `;

        Object.keys(grouped).forEach(cls => {

            let g = grouped[cls];

            html += `
            <tr>
                <td>${cls}</td>
                <td>${g.present}</td>
                <td>${g.absent}</td>
                <td>${g.boys}</td>
                <td>${g.girls}</td>
                <td>${g.total}</td>
            </tr>
            `;
        });

        html += `</table>`;

        document.getElementById("attendanceTable").innerHTML = html;

        // Hide mark all button
        document.querySelector("button[onclick='markAllPresent()']").style.display = "none";

        return;
    }

    // =========================
    // TEACHER VIEW
    // =========================
let teacherStudents = students;

if(currentUser.role === "teacher"){

    teacherStudents = students.filter(s =>
        (currentUser.classes || [])
            .includes(s.studentclass)
    );
}
    document.querySelector("button[onclick='markAllPresent()']").style.display = "block";

    let tableHTML = `
    <table>
        <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Present</th>
            <th>Absent</th>
        </tr>
    `;

   teacherStudents.forEach(s => {

        let status = attendanceData[date][s.name] || "";

        tableHTML += `
        <tr>
            <td>${s.name}</td>
            <td>${s.studentclass}</td>

            <td>
                <button class="present-btn ${status === "Present" ? "active" : ""}"
                    onclick="markAttendanceManual('${s.name}', 'Present')">
                    ✔️
                </button>
            </td>

            <td>
                <button class="absent-btn ${status === "Absent" ? "active" : ""}"
                    onclick="markAttendanceManual('${s.name}', 'Absent')">
                    ❌
                </button>
            </td>
        </tr>
        `;
    });

    tableHTML += `</table>`;

    document.getElementById("attendanceTable").innerHTML = tableHTML;

    updateAttendanceStats(date);

    let termData = calculateTermAttendance();

    document.getElementById("termAttendanceSummary").innerText =
        `📊 Term Summary → Days: ${termData.totalDays} |
         Total Present: ${termData.totalPresent} |
         Attendance %: ${termData.percentage}%`;
}


async function getStudentAttendance(studentName, term){

    const { data, error } = await supabaseClient
        .from("attendance")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .eq("studentname", studentName)
        .eq("term", term);

    if(error){
        console.log(error);
        return {
            totalDays: 0,
            daysPresent: 0,
            daysAbsent: 0
        };
    }

    let totalDays = data.length;

    let daysPresent =
        data.filter(r =>
            r.status === "Present"
        ).length;

    let daysAbsent =
        totalDays - daysPresent;

    return {
        totalDays,
        daysPresent,
        daysAbsent
    };
}

async function loadAttendanceData() {

    const { data, error } = await supabaseClient
        .from("attendance")
        .select("*")
        .eq("schoolid", currentUser.schoolid);

    if (error) {
        console.log(error);
        return;
    }

    attendanceData = {};

    data.forEach(record => {

        if (!attendanceData[record.date]) {
            attendanceData[record.date] = {};
        }

        attendanceData[record.date][record.studentname] =
            record.status;
    });

    let selectedDate =
        document.getElementById("attendanceDate")?.value;

    if (selectedDate) {
        loadAttendanceTable();
    }
}

async function markAttendance(
    date,
    studentname,
    status
){

    let term = activeTerm || "term1";

    // Save attendance record
    const { error } = await supabaseClient
        .from("attendance")
        .upsert([
            {
                schoolid: currentUser.schoolid,
                class: currentUser.mainClass,
                date: date,
                term: term,
                studentname: studentname,
                status: status,
                teacher: currentUser.username
            }
        ]);

    if(error){

        console.log(error);

        return alert(
            "Failed to save attendance"
        );
    }

    // Local update
    if(!attendanceData[date]){
        attendanceData[date] = {};
    }

    attendanceData[date][studentname] =
        status;

    // Find student
    let student =
        students.find(
            s => s.name === studentname
        );

    if(student){

        student.totalDays =
            student.totalDays || {};

        student.daysPresent =
            student.daysPresent || {};

        // Count attendance from local records
        let totalDays = 0;
        let daysPresent = 0;

        Object.keys(attendanceData)
            .forEach(d => {

                let attendanceStatus =
                    attendanceData[d][studentname];

                if(attendanceStatus){

                    totalDays++;

                    if(
                        attendanceStatus ===
                        "Present"
                    ){
                        daysPresent++;
                    }
                }
            });

        student.totalDays[term] =
            totalDays;

        student.daysPresent[term] =
            daysPresent;

        await saveStudents();
    }

    loadAttendanceTable();
}

async function getAttendanceSummary(studentName, term){

    const { data, error } = await supabaseClient
        .from("attendance")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .eq("studentname", studentName);

    if(error){
        console.log(error);
        return {
            totalDays: 0,
            daysPresent: 0
        };
    }

    let totalDays = data.length;

    let daysPresent = data.filter(
        r => r.status === "Present"
    ).length;

    return {
        totalDays,
        daysPresent
    };
}

function updateAttendanceStats(date) {
    let data = attendanceData[date];

    let presentCount = 0;
    let absentCount = 0;

    let boysPresent = 0;
    let girlsPresent = 0;

    students.forEach(s => {
        let status = data[s.name];

        if(status === "Present"){
            presentCount++;

            if(s.gender === "Male") boysPresent++;
            if(s.gender === "Female") girlsPresent++;
        } else {
            absentCount++;
        }
    });

    document.getElementById("attendanceStats").innerText = 
        `Present: ${presentCount} | Absent: ${absentCount} | 
         Boys Present: ${boysPresent} | Girls Present: ${girlsPresent} | 
         Total: ${students.length}`;
}

async function markAttendanceManual(
    studentname,
    status
) {

    let date =
        document.getElementById(
            "attendanceDate"
        ).value;

    if (!date) {
        return alert("Select a date first!");
    }

    // Weekend block
    if (isWeekend(date)) {

        return alert(
            "🚫 No attendance on weekends!"
        );
    }

    let term = getTermFromDate(date);

    // Term inactive
    if (!term) {

        return alert(
            "❌ Attendance not allowed.\nTerm has not started or has ended."
        );
    }

    // Save attendance online
    const { error } = await supabaseClient
        .from("attendance")
        .upsert([
            {
                schoolid: currentUser.schoolid,
                teacher: currentUser.username,
                date: date,
                studentname: studentname,
                status: status,
                term: term
            }
        ]);

    if (error) {

        console.log(error);

        return alert(
            "Failed to save attendance"
        );
    }

    // Optional local cache
    if (!attendanceData[date]) {
        attendanceData[date] = {};
    }

    attendanceData[date][studentname] = status;

    syncAttendanceToStudents();

    loadAttendanceTable();
}
function isWeekend(dateStr){
    let d = new Date(dateStr);
    let day = d.getDay(); // 0 = Sunday, 6 = Saturday

    return (day === 0 || day === 6);
}

function calculateTermAttendance() {
    let totalDays = 0;
    let totalPresent = 0;

    for (let date in attendanceData) {

        let dayData = attendanceData[date];

        // ✅ CHECK if teacher actually marked at least one student
        let marked = Object.values(dayData).some(status => status === "Present" || status === "Absent");

        if (!marked) continue; // ❌ skip empty days

        totalDays++; // ✅ count ONLY real school days

        students.forEach(s => {
            if (dayData[s.name] === "Present") {
                totalPresent++;
            }
        });
    }

    let percentage = totalDays === 0 ? 0 :
        ((totalPresent / (students.length * totalDays)) * 100).toFixed(1);

    return {
        totalDays,
        totalPresent,
        percentage
    };
}

let deleteIndex = null;

function syncAttendanceToStudents() {

    students.forEach(s => {

        let termStats = {
            term1: {total:0, present:0},
            term2: {total:0, present:0},
            term3: {total:0, present:0}
        };

        for(let date in attendanceData){

            let term = getTermFromDate(date);
            if(!term) continue;

            let dayData = attendanceData[date];

            let marked = Object.values(dayData).some(v => v);
            if(!marked) continue;

            termStats[term].total++;

            if(dayData[s.name] === "Present"){
                termStats[term].present++;
            }
        }

        s.totalDays = s.totalDays || {};
        s.daysPresent = s.daysPresent || {};

        ["term1","term2","term3"].forEach(t=>{
            s.totalDays[t] = termStats[t].total;
            s.daysPresent[t] = termStats[t].present;
        });
    });

    saveStudents();
}
async function markAllPresent() {

    let date =
        document.getElementById(
            "attendanceDate"
        ).value;

    if (!date) {

        return alert(
            "Select a date first!"
        );
    }

    // Weekend block
    if (isWeekend(date)) {

        return alert(
            "🚫 No attendance on weekends!"
        );
    }

    let term = getTermFromDate(date);

    // Term inactive
    if (!term) {

        return alert(
            "❌ Term not active!"
        );
    }

    if (!attendanceData[date]) {
        attendanceData[date] = {};
    }

    // Prepare attendance records
    let attendanceRecords = students.map(s => {

        attendanceData[date][s.name] = "Present";

      return {
    schoolid: currentUser.schoolid,
    teacher: currentUser.username,
    studentname: s.name,
    status: "Present",
    date: date,
    term: term
};
    });

    // Save all attendance online
    const { error } = await supabaseClient
        .from("attendance")
        .upsert(attendanceRecords);

    if (error) {

        console.log(error);

        return alert(
            "Failed to save attendance"
        );
    }

    syncAttendanceToStudents();

    loadAttendanceTable();
}

function openDeleteModal(index){
    deleteIndex = index;

    let studentname = students[index].name;

    document.getElementById("modalTitle").innerText = "Delete Student";
    document.getElementById("modalMessage").innerText =
        `Delete ${studentname}? This action cannot be undone.`;

    document.getElementById("confirmModal").style.display = "flex";

    // ✅ FIXED: always bind correctly
    document.getElementById("confirmBtn").onclick = function(){
        confirmDelete();
    };
}

function closeModal(){
    document.getElementById("confirmModal").style.display = "none";
    deleteIndex = null;
	document.getElementById("confirmBtn").onclick = null;
}

function confirmDelete(){
    if(deleteIndex !== null){
        students.splice(deleteIndex,1);
        saveStudents();

        loadStudentsTable();
        populateStudentList();
        updateDashboard();
    }

    closeModal();
}


function openStudentModal(index) {

    const s = students[index];

    document.getElementById("studentModalContent").innerHTML = `

<div class="student-profile">

    <!-- Header -->
    <div class="profile-header">

        <button class="modal-close"
            onclick="closeStudentModal()">
            <i class="fas fa-times"></i>
        </button>

        <div class="photo-container">

            <img
                id="studentPhoto"
                src="${s["student-photos"] || ''}"
                class="profile-photo"
                onclick="document.getElementById('photoUpload').click()">

            <div class="photo-hover">

                <i class="fas fa-camera"></i>
                <span>Upload</span>

            </div>

            <input
                id="photoUpload"
                type="file"
                hidden
                accept="image/*"
                onchange="uploadStudentPhoto(${index},this.files[0])">

        </div>

        <h2>${s.name}</h2>

        <p>
            <i class="fas fa-user-graduate"></i>
            Class ${s.studentclass}
        </p>

        <span class="student-status ${
            s.passwordchanged ? "active" : "warning"
        }">

            ${
                s.passwordchanged
                ? '<i class="fas fa-check-circle"></i> Active'
                : '<i class="fas fa-clock"></i> Temporary Password'
            }

        </span>

    </div>

    <!-- Information -->

    <div class="profile-body">

        <!-- Student ID -->

        <div class="info-card">

            <label>
                <i class="fas fa-id-card"></i>
                Student ID
            </label>

            <div class="info-row">

                <span id="studentIDText">

                    ${s.studentid || "Not Generated"}

                </span>

                <button
                    class="icon-btn"
                    onclick="copyStudentID()">

                    <i class="fas fa-copy"></i>

                </button>

            </div>

        </div>

        <!-- Password -->

        <div class="info-card">

            <label>

                <i class="fas fa-lock"></i>

                Password

            </label>

            <div class="info-row">

                <span id="passwordText">

                    ••••••••

                </span>

                <input
                    id="studentPassword"
                    type="hidden"
                    value="${s.studentpassword || ''}">

                <div class="action-icons">

                    <button
                        class="icon-btn"
                        onclick="togglePassword()">

                        <i class="fas fa-eye"></i>

                    </button>

                    <button
                        class="icon-btn"
                        onclick="copyStudentPassword()">

                        <i class="fas fa-copy"></i>

                    </button>

                </div>

            </div>

        </div>

    </div>
	
	

    <!-- Footer -->

    <div class="profile-footer">

        <button
            class="primary-btn"
            onclick="document.getElementById('photoUpload').click()">

            <i class="fas fa-upload"></i>

            Upload Photo

        </button>

        <button
            class="secondary-btn"
            onclick="closeStudentModal()">

            <i class="fas fa-times"></i>

            Close

        </button>

    </div>

</div>

`;
console.log("SELECTED STUDENT:", s);
console.log("STUDENT PHOTO VALUE:", s["student-photos"]);
    document.getElementById("studentModal").style.display = "flex";

}

async function uploadStudentPhoto(index, file) {

    if (!file) return;

    const student = students[index];

    if (!student || !student.id) {
        alert("Student information not found.");
        return;
    }

    // Allow only images
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
    }

    try {

        const extension =
            file.name.split(".").pop().toLowerCase();

        const fileName =
            `${student.id}-${Date.now()}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } =
            await supabaseClient.storage
                .from("student-photos")
                .upload(fileName, file, {
                    upsert: true,
                    contentType: file.type
                });

        if (uploadError) {
            console.error(
                "Student Photo Upload Error:",
                uploadError
            );

            alert(
                "Photo upload failed: " +
                uploadError.message
            );

            return;
        }

        // Get public URL
        const { data: urlData } =
            supabaseClient.storage
                .from("student-photos")
                .getPublicUrl(fileName);

        const photoUrl =
            urlData?.publicUrl;

        if (!photoUrl) {
            alert("Could not get the uploaded photo URL.");
            return;
        }

        // Save photo URL to student record
        const { error: dbError } =
            await supabaseClient
                .from("students")
                .update({
    "student-photos": photoUrl
})
                .eq("id", student.id);

        if (dbError) {

            console.error(
                "Student Photo Database Error:",
                dbError
            );

            alert(
                "Photo uploaded, but could not save it: " +
                dbError.message
            );

            return;
        }

        // Update local student object
        student.photo = photoUrl;

        // Reopen profile with new photo
        openStudentModal(index);

        alert("Student photo updated successfully.");

    } catch (error) {

        console.error(
            "Student Photo Error:",
            error
        );

        alert(
            "An error occurred while uploading the photo."
        );
    }
}


function togglePassword() {

    const hidden = document.getElementById("studentPassword");
    const text = document.getElementById("passwordText");

    if (text.innerText === "••••••••") {
        text.innerText = hidden.value;
    } else {
        text.innerText = "••••••••";
    }

}

function copyStudentID() {

    const id = document.getElementById("studentIDText").innerText;

    navigator.clipboard.writeText(id);

    showToast("Student ID copied.");

}

function copyStudentPassword() {

    const password = document.getElementById("studentPassword").value;

    navigator.clipboard.writeText(password);

    showToast("Password copied.");

}


function closeStudentModal(){
    document.getElementById("studentModal").style.display = "none";
}


let currentStudent = null;
let selectedSubject = null;
let currentSubjectIndex = null;


async function selectStudent(index, studentArray = students) {
    let s = studentArray[index];
	currentStudent = s;
	console.log("OPENING:", s.name, s.id);
	if(!s.currentTerm){
    s.currentTerm = "term1";
}
    let term=s.currentTerm||"term1";
    let html=`<label>Term</label>
    <select id="termSelect" onchange="changeTerm()">
    <option value="term1" ${term=="term1"?"selected":""}>Term 1</option>
    <option value="term2" ${term=="term2"?"selected":""}>Term 2</option>
    <option value="term3" ${term=="term3"?"selected":""}>Term 3</option>
    </select>`;


let sub = selectedSubject;

let d = s.subjects?.[sub]?.[term] || {};

 html += `
    <h4>${sub}</h4>

    <input
        type="number"
        id="${sub}_test1"
        value="${d.test1 > 0 ? d.test1 : ''}"
        placeholder="Test 1"
        min="0"
        max="30"
        oninput="if(this.value > 30) this.value = 30; if(this.value < 0) this.value = 0;">

    <input
        type="number"
        id="${sub}_test2"
        value="${d.test2 > 0 ? d.test2 : ''}"
        placeholder="Test 2"
        min="0"
        max="30"
        oninput="if(this.value > 30) this.value = 30; if(this.value < 0) this.value = 0;">

    <input
        type="number"
        id="${sub}_project"
        value="${d.project > 0 ? d.project : ''}"
        placeholder="Project"
        min="0"
        max="20"
        oninput="if(this.value > 20) this.value = 20; if(this.value < 0) this.value = 0;">

    <input
        type="number"
        id="${sub}_group"
        value="${d.group > 0 ? d.group : ''}"
        placeholder="Group"
        min="0"
        max="20"
        oninput="if(this.value > 20) this.value = 20; if(this.value < 0) this.value = 0;">

    <input
        type="number"
        id="${sub}_exam"
        value="${d.exam > 0 ? d.exam : ''}"
        placeholder="Exam"
        min="0"
        max="100"
        oninput="if(this.value > 100) this.value = 100; if(this.value < 0) this.value = 0;">
    `;
;


 html += `
<hr><h3>Additional Assessment</h3>

<label>Conduct</label>
<select id="conduct">
    <option value="">Select Conduct</option>

    <option value="Very respectful and well-behaved." ${s.conduct?.[term] === "Very respectful and well-behaved." ? "selected" : ""}>Very respectful and well-behaved.</option>

    <option value="Maintains good discipline at all times." ${s.conduct?.[term] === "Maintains good discipline at all times." ? "selected" : ""}>Maintains good discipline at all times.</option>

    <option value="Relates well with teachers and peers." ${s.conduct?.[term] === "Relates well with teachers and peers." ? "selected" : ""}>Relates well with teachers and peers.</option>

    <option value="Obeys school rules and regulations." ${s.conduct?.[term] === "Obeys school rules and regulations." ? "selected" : ""}>Obeys school rules and regulations.</option>

    <option value="Shows good manners and self-control." ${s.conduct?.[term] === "Shows good manners and self-control." ? "selected" : ""}>Shows good manners and self-control.</option>

    <option value="Generally well-behaved and cooperative." ${s.conduct?.[term] === "Generally well-behaved and cooperative." ? "selected" : ""}>Generally well-behaved and cooperative.</option>

    <option value="Accepts correction positively." ${s.conduct?.[term] === "Accepts correction positively." ? "selected" : ""}>Accepts correction positively.</option>

    <option value="Needs improvement in discipline." ${s.conduct?.[term] === "Needs improvement in discipline." ? "selected" : ""}>Needs improvement in discipline.</option>

    <option value="Sometimes disregards classroom rules." ${s.conduct?.[term] === "Sometimes disregards classroom rules." ? "selected" : ""}>Sometimes disregards classroom rules.</option>

    <option value="Requires closer supervision of conduct." ${s.conduct?.[term] === "Requires closer supervision of conduct." ? "selected" : ""}>Requires closer supervision of conduct.</option>
</select>

<label>Attitude</label>
<select id="attitude">
    <option value="">Select Attitude</option>

    <option value="Works hard and completes assignments on time." ${s.attitude?.[term] === "Works hard and completes assignments on time." ? "selected" : ""}>Works hard and completes assignments on time.</option>

    <option value="Shows commitment to academic work." ${s.attitude?.[term] === "Shows commitment to academic work." ? "selected" : ""}>Shows commitment to academic work.</option>

    <option value="Participates actively in class activities." ${s.attitude?.[term] === "Participates actively in class activities." ? "selected" : ""}>Participates actively in class activities.</option>

    <option value="Demonstrates a positive attitude towards learning." ${s.attitude?.[term] === "Demonstrates a positive attitude towards learning." ? "selected" : ""}>Demonstrates a positive attitude towards learning.</option>

    <option value="Is attentive and eager to learn." ${s.attitude?.[term] === "Is attentive and eager to learn." ? "selected" : ""}>Is attentive and eager to learn.</option>

    <option value="Makes good use of instructional time." ${s.attitude?.[term] === "Makes good use of instructional time." ? "selected" : ""}>Makes good use of instructional time.</option>

    <option value="Shows satisfactory effort in class." ${s.attitude?.[term] === "Shows satisfactory effort in class." ? "selected" : ""}>Shows satisfactory effort in class.</option>

    <option value="Needs to put more effort into studies." ${s.attitude?.[term] === "Needs to put more effort into studies." ? "selected" : ""}>Needs to put more effort into studies.</option>

    <option value="Is often reluctant to complete tasks." ${s.attitude?.[term] === "Is often reluctant to complete tasks." ? "selected" : ""}>Is often reluctant to complete tasks.</option>

    <option value="Must develop a more serious approach to work." ${s.attitude?.[term] === "Must develop a more serious approach to work." ? "selected" : ""}>Must develop a more serious approach to work.</option>
</select>

<label>Interest</label>
<select id="interest">
    <option value="">Select Interest</option>

    <option value="Shows keen interest in learning." ${s.interest?.[term] === "Shows keen interest in learning." ? "selected" : ""}>Shows keen interest in learning.</option>

    <option value="Participates actively in lessons." ${s.interest?.[term] === "Participates actively in lessons." ? "selected" : ""}>Participates actively in lessons.</option>

    <option value="Demonstrates enthusiasm for school activities." ${s.interest?.[term] === "Demonstrates enthusiasm for school activities." ? "selected" : ""}>Demonstrates enthusiasm for school activities.</option>

    <option value="Takes interest in class discussions." ${s.interest?.[term] === "Takes interest in class discussions." ? "selected" : ""}>Takes interest in class discussions.</option>

    <option value="Shows a willingness to learn new things." ${s.interest?.[term] === "Shows a willingness to learn new things." ? "selected" : ""}>Shows a willingness to learn new things.</option>

    <option value="Displays good interest in most subjects." ${s.interest?.[term] === "Displays good interest in most subjects." ? "selected" : ""}>Displays good interest in most subjects.</option>

    <option value="Shows satisfactory interest in learning." ${s.interest?.[term] === "Shows satisfactory interest in learning." ? "selected" : ""}>Shows satisfactory interest in learning.</option>

    <option value="Interest is improving steadily." ${s.interest?.[term] === "Interest is improving steadily." ? "selected" : ""}>Interest is improving steadily.</option>

    <option value="Needs encouragement to participate more." ${s.interest?.[term] === "Needs encouragement to participate more." ? "selected" : ""}>Needs encouragement to participate more.</option>

    <option value="Shows limited interest in classroom activities." ${s.interest?.[term] === "Shows limited interest in classroom activities." ? "selected" : ""}>Shows limited interest in classroom activities.</option>
</select>

<label>Teacher's Remark</label>
<select id="teacherRemark">
    <option value="">Select Remark</option>

    <option value="Excellent performance. Keep it up." ${s.teacherRemark?.[term] === "Excellent performance. Keep it up." ? "selected" : ""}>Excellent performance. Keep it up.</option>

    <option value="Very good work. Aim even higher." ${s.teacherRemark?.[term] === "Very good work. Aim even higher." ? "selected" : ""}>Very good work. Aim even higher.</option>

    <option value="A hardworking and promising pupil." ${s.teacherRemark?.[term] === "A hardworking and promising pupil." ? "selected" : ""}>A hardworking and promising pupil.</option>

    <option value="Shows steady academic progress." ${s.teacherRemark?.[term] === "Shows steady academic progress." ? "selected" : ""}>Shows steady academic progress.</option>

    <option value="Continue to work hard for success." ${s.teacherRemark?.[term] === "Continue to work hard for success." ? "selected" : ""}>Continue to work hard for success.</option>

    <option value="Good effort. Maintain the momentum." ${s.teacherRemark?.[term] === "Good effort. Maintain the momentum." ? "selected" : ""}>Good effort. Maintain the momentum.</option>

    <option value="Can perform better with more effort." ${s.teacherRemark?.[term] === "Can perform better with more effort." ? "selected" : ""}>Can perform better with more effort.</option>

    <option value="Needs to pay more attention in class." ${s.teacherRemark?.[term] === "Needs to pay more attention in class." ? "selected" : ""}>Needs to pay more attention in class.</option>

    <option value="Improvement is needed in all areas." ${s.teacherRemark?.[term] === "Improvement is needed in all areas." ? "selected" : ""}>Improvement is needed in all areas.</option>
</select>
`;

const totalDays = s.totalDays?.[term] || 0;
const presentDays = s.daysPresent?.[term] || 0;
const absentDays = totalDays - presentDays;

html += `
<hr>
<h3>Attendance Summary</h3>

<label>Total School Days</label>
<input
type="number"
id="totalDaysInput"
value="${totalDays}"
oninput="previewAttendance()">

<label>Days Present</label>
<input
type="number"
id="daysPresentInput"
value="${presentDays}"
oninput="previewAttendance()">

<label>Days Absent</label>
<input
type="number"
id="daysAbsentInput"
value="${absentDays}"
readonly
style="background:#f3f4f6;font-weight:bold;">

<p style="color:#fbbf24;">
You can edit attendance here if it was not recorded in the Attendance section.
</p>
`;
    
if (term === "term3") {

    const promotionClass = s.promotionClass || "";

    const classOptions =
        await getPromotionClassOptions(promotionClass);

    html += `
    <hr>
    <h3>Promotion</h3>

    <label>Promote Student To</label>

    <select id="promotionClass">
        ${classOptions}
    </select>
    `;
}


//showTeacherSubjects();
//populateStudentList();

html = `
<h3 style="color:#22c55e;">Editing: ${s.name}</h3>
` + html;

document.getElementById("subjectForm").innerHTML = html;

document.getElementById("marksModal").style.display = "flex";
}

async function getPromotionClassOptions(selected = "") {

    let { data: classes, error } = await supabaseClient
        .from("classes")
        .select("classname")
        .eq("schoolid", currentUser.schoolid)
        .order("classname");

    if (error) {
        console.error(error);
        return `<option value="">Select Class</option>`;
    }

    let options = `<option value="">Select Class</option>`;

    classes.forEach(c => {

        options += `
        <option value="${c.classname}"
            ${selected === c.classname ? "selected" : ""}>
            ${c.classname}
        </option>`;

    });

    return options;
}

function closeMarksModal(){

    document.getElementById("marksModal").style.display = "none";

}

function previewAttendance(){

    const total =
        students[currentStudent]
        .totalDays?.[
        students[currentStudent].currentTerm
        ] || 0;

    let present =
        parseInt(
        document.getElementById("daysPresentInput").value
        ) || 0;

    if(present < 0)
        present = 0;

    if(present > total)
        present = total;

    document.getElementById("daysPresentInput").value = present;

    document.getElementById("daysAbsentInput").value =
        total - present;
}


function selectFilteredStudent(index){
    currentStudentIndex = index;
    selectStudent(index, filteredStudents);
}

function showTeacherSubjects() {

    const container = document.getElementById("subjectList");

    container.innerHTML = "";

    let allowedSubjects =
        currentUser.role === "teacher"
        ? currentUser.subjects || []
        : subjects;

    allowedSubjects.forEach(subject => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <h4>${subject}</h4>
        `;

        card.onclick = () => selectSubject(subject, card);

        container.appendChild(card);

    });

}

function selectSubject(subject, card){

    selectedSubject = subject;

    document.querySelectorAll("#subjectList .card")
        .forEach(c => c.classList.remove("active"));

    card.classList.add("active");

    populateStudentList();

}



async function changeTerm() {

    const term = document.getElementById("termSelect").value;

    currentStudent.currentTerm = term;

    await saveStudents();

    selectStudent(
        students.findIndex(s => s.id === currentStudent.id)
    );
}

let termSettings = {};

async function loadTermSettings(){

    const { data, error } = await supabaseClient
        .from("termsettings")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .single();

    if(error){
        console.log(error);
        return;
    }

    termSettings = data || {};

    document.getElementById("t1start").value = data.t1start || "";
    document.getElementById("t1end").value   = data.t1end || "";

    document.getElementById("t2start").value = data.t2start || "";
    document.getElementById("t2end").value   = data.t2end || "";

    document.getElementById("t3start").value = data.t3start || "";
    document.getElementById("t3end").value   = data.t3end || "";
}

async function saveTermSettings() {

    const t1start = document.getElementById("t1start").value;
    const t1end = document.getElementById("t1end").value;

    const t2start = document.getElementById("t2start").value;
    const t2end = document.getElementById("t2end").value;

    const t3start = document.getElementById("t3start").value;
    const t3end = document.getElementById("t3end").value;

    if (!currentUser || !currentUser.schoolid) {
        alert("School information not found.");
        return;
    }

    const settingsData = {
        schoolid: currentUser.schoolid,
        t1start,
        t1end,
        t2start,
        t2end,
        t3start,
        t3end
    };

    const { error } = await supabaseClient
        .from("termsettings")
        .upsert(settingsData, {
            onConflict: "schoolid"
        });

    if (error) {
        console.error("Term settings save error:", error);
        alert("Failed to save term settings");
        return;
    }

    termSettings = settingsData;

    alert("✅ Term settings saved successfully!");
}


function getTermFromDate(dateStr) {

    let date = new Date(dateStr);

    let t1start =
        new Date(termSettings.t1start);

    let t1end =
        new Date(termSettings.t1end);

    let t2start =
        new Date(termSettings.t2start);

    let t2end =
        new Date(termSettings.t2end);

    let t3start =
        new Date(termSettings.t3start);

    let t3end =
        new Date(termSettings.t3end);

    if (
        date >= t1start &&
        date <= t1end
    ) {
        return "term1";
    }

    if (
        date >= t2start &&
        date <= t2end
    ) {
        return "term2";
    }

    if (
        date >= t3start &&
        date <= t3end
    ) {
        return "term3";
    }

    return null;
}

function getTermEnd(term) {

    if (term === "term1") {
        return termSettings.t1end;
    }

    if (term === "term2") {
        return termSettings.t2end;
    }

    if (term === "term3") {
        return termSettings.t3end;
    }

    return null;
}

function getNextTermStart(term) {

    if (term === "term1") {
        return termSettings.t2start;
    }

    if (term === "term2") {
        return termSettings.t3start;
    }

    if (term === "term3") {

        // next academic year
        return termSettings.t1start;
    }

    return null;
}

async function getCurrentTerm(){

    const { data, error } = await supabaseClient
        .from("termsettings")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .single();

    if(error || !data){
        return "term1";
    }

    let today = new Date();

    if(
        today >= new Date(data.t1start) &&
        today <= new Date(data.t1end)
    ){
        return "term1";
    }

    if(
        today >= new Date(data.t2start) &&
        today <= new Date(data.t2end)
    ){
        return "term2";
    }

    if(
        today >= new Date(data.t3start) &&
        today <= new Date(data.t3end)
    ){
        return "term3";
    }

    return "term1";
}

async function initializeSystem(){

    let currentTerm = await getCurrentTerm();

    window.activeTerm = currentTerm;

    console.log(
        "Current Term:",
        currentTerm
    );

}

async function saveMarks() {

    if (currentStudent === null) {
        alert("Please select a student.");
        return;
    }

    if (!selectedSubject) {
        alert("Please select a subject.");
        return;
    }

    let s = currentStudent;

    let term = document.getElementById("termSelect").value;
    let sub = selectedSubject;

    if (!s.subjects) {
        s.subjects = {};
    }

    // ============================
    // READ MARKS
    // ============================

    let test1 =
        Number(document.getElementById(sub + "_test1")?.value || 0);

    let test2 =
        Number(document.getElementById(sub + "_test2")?.value || 0);

    let project =
        Number(document.getElementById(sub + "_project")?.value || 0);

    let group =
        Number(document.getElementById(sub + "_group")?.value || 0);

    let exam =
        Number(document.getElementById(sub + "_exam")?.value || 0);

    // ============================
    // VALIDATION
    // ============================

    if (test1 < 0 || test1 > 30) {
        alert("Test 1 score must be between 0 and 30.");
        return;
    }

    if (test2 < 0 || test2 > 30) {
        alert("Test 2 score must be between 0 and 30.");
        return;
    }

    if (project < 0 || project > 20) {
        alert("Project score must be between 0 and 20.");
        return;
    }

    if (group < 0 || group > 20) {
        alert("Group Work score must be between 0 and 20.");
        return;
    }

    if (exam < 0 || exam > 100) {
        alert("Exam score must be between 0 and 100.");
        return;
    }

    // ============================
    // ENSURE SUBJECT EXISTS
    // ============================

    if (!s.subjects[sub]) {
        s.subjects[sub] = {};
    }

    // ============================
    // CALCULATE RESULT
    // ============================

    const result = calculateSubjectResult({

        test1,
        test2,
        project,
        group,
        exam

    });

    // Save full result
    s.subjects[sub][term] = result;

    // ============================
    // ADDITIONAL ASSESSMENT
    // ============================

    s.conduct = s.conduct || {};
    s.attitude = s.attitude || {};
    s.interest = s.interest || {};
    s.teacherRemark = s.teacherRemark || {};

    s.conduct[term] =
        document.getElementById("conduct")?.value || "";

    s.attitude[term] =
        document.getElementById("attitude")?.value || "";

    s.interest[term] =
        document.getElementById("interest")?.value || "";

    s.teacherRemark[term] =
        document.getElementById("teacherRemark")?.value || "";

    // ============================
    // ATTENDANCE
    // ============================

    s.totalDays = s.totalDays || {};
    s.daysPresent = s.daysPresent || {};

    s.totalDays[term] =
        parseInt(
            document.getElementById("totalDaysInput")?.value
        ) || 0;

    s.daysPresent[term] =
        parseInt(
            document.getElementById("daysPresentInput")?.value
        ) || 0;

    // ============================
    // PROMOTION
    // ============================

    if (term === "term3") {

        s.promotionClass =
            document.getElementById("promotionClass")?.value || "";

    }

    // ============================
    // CALCULATE STUDENT AVERAGE
    // ============================

    calculateStudentAverage(s, term);

    // ============================
    // UPDATE STUDENT ARRAY
    // ============================

    const index =
        students.findIndex(st => st.id === s.id);

    if (index !== -1) {

        students[index] = s;

    }

    // ============================
    // SAVE TO SUPABASE
    // ============================

    await saveStudents();

    // ============================
    // REFRESH UI
    // ============================

    populateStudentList();

    updateDashboard();

    closeMarksModal();

    alert(
        sub + " marks saved successfully ✅"
    );

}

// Grades and Remarks functions
function getGrade(score){
    if(score >= 80) return "A1";
    if(score >= 70) return "B2";
    if(score >= 65) return "B3";
    if(score >= 60) return "C4";
    if(score >= 55) return "C5";
    if(score >= 50) return "C6";
    if(score >= 45) return "D7";
    if(score >= 40) return "E8";
    return "F9";
}

function getRemark(score){
    if(score >= 80) return "Excellent";
    if(score >= 70) return "Very Good";
    if(score >= 65) return "Good";
    if(score >= 60) return "Credit";
    if(score >= 55) return "Fair";
    if(score >= 50) return "Pass";
    if(score >= 45) return "Weak Pass";
    if(score >= 40) return "Very Weak";
    return "Fail";
}
async function confirmReport(){
    let name = document.getElementById("reportSearch").value.trim().toLowerCase();
    let term = document.getElementById("reportTerm").value;

    let s = students.find(x => x.name.toLowerCase() === name);

    if(!s){
        alert("Student not found");
        return;
    }

    let endDate = getTermEnd(term);
    let nextDate = getNextTermStart(term);

    if(!endDate || !nextDate){
        alert("❌ Please set term dates in Profile first!");
        return;
    }

    await generateReportWithTerm(s, term, endDate, nextDate);
}



function formatDate(dateStr){
    let date = new Date(dateStr);

    let day = date.getDate();
    let month = date.toLocaleString('default', { month: 'long' });
    let year = date.getFullYear();

    function getOrdinal(n){
        if(n > 3 && n < 21) return "th";
        switch(n % 10){
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    return day + getOrdinal(day) + " " + month + ", " + year;
}
async function generateAllReports(){

    if(!students || students.length === 0){

        alert("No students available");
        return;

    }


    let term =
        document.getElementById("reportTerm").value;


    let endDate =
        getTermEnd(term);


    let nextDate =
        getNextTermStart(term);



    if(!endDate || !nextDate){

        alert(
            "❌ Set term dates in Profile first!"
        );

        return;

    }



    const { jsPDF } =
        window.jspdf;


    let pdf =
        new jsPDF(
            "p",
            "mm",
            "a4"
        );



    // Calculate all averages first
    students.forEach(s=>{

        calculateStudentAverage(
            s,
            term
        );

    });



    for(let i = 0; i < students.length; i++){


        let s =
            students[i];


        try{


            console.log(
                `Generating report ${i+1}/${students.length}: ${s.name}`
            );



            // Generate report HTML only
            let html =
            await generateReportWithTerm(
                s,
                term,
                endDate,
                nextDate,
                false
            );



            // Create hidden report container
            let element =
            document.createElement("div");


            element.innerHTML = html;


            element.style.width = "794px";
            element.style.position = "absolute";
            element.style.left = "-9999px";
            element.style.top = "0";


            document.body.appendChild(element);



            // Convert to image
            let canvas =
            await html2canvas(
                element,
                {
                    scale:1.5,
                    useCORS:true,
                    logging:false
                }
            );



            // Remove temporary element
            document.body.removeChild(element);



            let imgData =
            canvas.toDataURL(
                "image/jpeg",
                0.85
            );



            let imgWidth = 210;


            let imgHeight =
            (
                canvas.height *
                imgWidth
            )
            /
            canvas.width;



            if(i !== 0){

                pdf.addPage();

            }



            pdf.addImage(

                imgData,

                "JPEG",

                0,

                0,

                imgWidth,

                imgHeight

            );



            // Release memory
            canvas.width = 1;
            canvas.height = 1;



        }
        catch(error){


            console.error(
                "Report generation failed for:",
                s.name,
                error
            );


        }


    }



    pdf.save(
        `All_Student_Reports_${term}.pdf`
    );


    alert(
        "✅ All student reports generated successfully"
    );

}

if(currentUser && currentUser.role === "teacher" && (!currentUser.subjects || currentUser.subjects.length === 0)){
    alert("No subjects assigned to you. Contact admin.");
}
// Report generation remains the same
async function generateReportWithTerm(
    s,
    term,
    endDate,
    nextDate,
    showPreview = true
){


let formattedEnd = formatDate(endDate);

let formattedNext = formatDate(nextDate);

let totalStudents = students.length;

let position = getStudentPosition(s, term);
 const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

// Fetch school info from Supabase
const { data: schoolData, error } = await supabaseClient
    .from("schools")
    .select("schoolLogo, schoolname")
    .eq("schoolid", currentUser.schoolid)
    .single();

let logo =
    schoolData?.schoolLogo || "";

let schoolname =
    schoolData?.schoolname ||
    currentUser.schoolname ||
    "Your School";


    let html = `<div id="printArea" style="
    font-family:'Times New Roman', Times, serif;
	font-size: 13
    color:black;
    width:794px;
    min-height:1000px;
    margin:auto;
    background:white;
    position:relative;
    padding:50px;
    box-sizing:border-box;
">
${logo ? `
<img src="${logo}" style="
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%, -50%);
    width:500px;
    opacity:0.08;
    z-index:0;
">
` : ""}

    <!-- INNER BORDER (DOUBLE LINE EFFECT) -->
    <div style="
        position:absolute;
        top:35px;
        left:35px;
        right:35px;
        bottom:35px;
        border:5px solid #00075D;
    "></div>
	
	
	<!-- INNER BORDER (DOUBLE LINE EFFECT) -->
    <div style="
        position:absolute;
        top:20px;
        left:20px;
        right:20px;
        bottom:20px;
        border:10px solid #00075D;
    "></div>
	

    <!-- CONTENT -->
    <div style="position:relative; z-index:1;">
        <div style="text-align:center; border-bottom:2px solid black; padding:5px;">
    
    <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
    
    ${logo ? `<img src="${logo}" style="width:120px; height:120px; object-fit:cover;">` : ""}

    <div>
        <h2 style="margin:0; color:#00075D; font-size:35px;">
		${schoolname}        </h2>
        <p style="margin:0;">STUDENT TERMINAL REPORT - ${term.toUpperCase()}</p>
    </div>

</div>

</div>


<div style="margin-top:2px; font-size:18px; line-height:1;">

    <div style="display:flex; justify-content:space-between; margin:2px; ">
        <p style="margin:2; padding: 8px;"><b>Name:</b> ${s.name}</p>
        <p style="margin:2; padding: 8px;"><b>Position:</b> ${position}</p>
    </div>

    <div style="display:flex; justify-content:space-between; margin:0px;">
        <p style="margin:2; padding: 8px;"><b>Class:</b> ${s.studentclass}</p>
        <p style="margin:2; padding: 8px;"><b>Total Students:</b> ${totalStudents}</p>
    </div>

    <div style="display:flex; justify-content:space-between; padding: 8px;">
       <p><b>Term Ending:</b> ${formattedEnd}</p>
        <p><b>Next Term Begins:</b> ${formattedNext}</p>
    </div>

</div>


				

        <table style="width:100%; border-collapse:collapse; text-align:center; margin: 2px;">
            <tr style="background:#00075D; color: white;">
                <th style="border:1px ash;">Subject</th>
                <th style="border:1px ash;">Class Score (50%)</th>
                <th style="border:1px ash;">Exams (50%)</th>
                <th style="border:1px ash;">Total (100%)</th>
                <th style="border:1px ash;">Grade</th>
                <th style="border:1px ash;">Remarks</th>
            </tr>`;
    
   let grandTotal = 0;

let allowedSubjects =
    currentUser.role === "teacher"
        ? (currentUser.subjects || [])
        : subjects;

allowedSubjects.forEach(sub => {

    let d = s.subjects?.[sub]?.[term];

    if (!d) return;


   let classTotal =
    Number(d.test1 || 0) +
    Number(d.test2 || 0) +
    Number(d.project || 0) +
    Number(d.group || 0);


let classScore =
    d.classScore !== undefined
    ? Number(d.classScore)
    : (classTotal / 100) * 50;


let examScore =
    d.examScore !== undefined
    ? Number(d.examScore)
    : (Number(d.exam || 0) / 100) * 50;


let totalScore =
    d.totalScore !== undefined
    ? Number(d.totalScore)
    : classScore + examScore;


    let grade =
        d.grade || getGrade(totalScore);


    let remark =
        d.remark || getRemark(totalScore);



    grandTotal += totalScore;



    html += `
    
    <tr style="color: solid back;">
			
        <td style="border:1px solid black;">${sub.toUpperCase()}</td>
        <td style="border:1px solid black;">${Math.round(classScore)}</td>
		<td style="border:1px solid black;">${Math.round(examScore)}</td>
		<td style="border:1px solid black;">${Math.round(totalScore)}</td>
        <td style="border:1px solid black;">${grade}</td>
        <td style="border:1px solid black;">${remark}</td>
			

    </tr>

    `;


});


	
	
	let attendance =
    await getStudentAttendance(s.name, term);

let totalDays = s.totalDays?.[term] || 0;

let daysPresent = s.daysPresent?.[term] || 0;

let daysAbsent = totalDays - daysPresent;

let teacherName = getClassTeacherName(s.studentclass);

// Load teacher signature
let teacherSignature = "";

const { data: teacher } = await supabaseClient
    .from("users")
    .select("signature")
    .eq("fullname", teacherName)      // or username if that's what getClassTeacherName() returns
    .single();

if (teacher) {
    teacherSignature = teacher.signature || "";
}

// Load headteacher signature
let headSignature = "";

const { data: head } = await supabaseClient
    .from("users")
    .select("signature")
    .eq("role", "admin")
    .eq("schoolid", currentUser.schoolid)
    .single();

if (head) {
    headSignature = head.signature || "";
}

html += `</table>

<p>
<b>Total School Days:</b> ${totalDays}
&nbsp;&nbsp;&nbsp;&nbsp;

<b>Days Present:</b> ${daysPresent}
&nbsp;&nbsp;&nbsp;&nbsp;


${
term === "term3"
? `&nbsp;&nbsp;&nbsp;&nbsp;
<b style="
align-items: center;
">Promotion Class:</b> ${s.promotionClass || "Not Set"}`
: ""
}
</p>

    <!-- AFFECTIVE TRAITS -->

<table style="
width:100%;
border-collapse:collapse;
font-size:16px;
">

<tr style="background:#00075D;color:white;">
<th style="padding:8px;border:1px solid #00075D;">
Conduct
</th><td style="border:1px solid #00075D; background: #fff;color:black; padding:5px;">
${s.conduct?.[term]||""}
</td></tr>

<tr style="background:#00075D;color:white;">
<th style="padding:5px;border:1px solid #00075D;">
Attitude
</th><td style="border:1px solid #00075D; background: #fff;color:black; padding:5px;">
${s.attitude?.[term]||""}
</td>
</tr>

<tr style="background:#00075D;color:white;">
<th style="padding:5px;border:1px solid #00075D;">
Interest
</th><td style="border:1px solid #00075D; background: #fff;color:black; padding:8px;">
${s.interest?.[term]||""}
</td>

</tr>


</table>


</table>

<div style="height:5px;"></div>

<!-- REMARKS -->
<table style="
width:100%;
border-collapse:collapse;
font-size:16px;
margin-top:0;
">

<tr style="background:#00075D;color:white;">
<th style="padding:5px;border:1px solid #00075D;">
CLASS TEACHER'S REMARK
</th><td style="border:1px solid #00075D; background: #fff;color:black; padding:8px;">
${s.teacherRemark?.[term]||""}
</td>

</tr>

</table>
<br><br>

<!-- SIGNATURES -->

<div style="
display:flex;
justify-content:space-between;
align-items:flex-end;
margin-top:5px;

">

<div style="width:40%;text-align:center;">

<div class="report-signatures">

    <div>
        <img src="${teacherSignature}"
style="width:180px;height:70px;object-fit:contain;">
        <hr>
        <b>${teacherName}</b><br>

Class Teacher
    </div>
</div>

</div>

<div style="width:40%;text-align:center;">

<div>
        <img src="${headSignature}"
style="width:180px;height:70px;object-fit:contain;">
        <hr>
        <b>Headteacher</b>
    </div>

</div>

</div>

</div>

</div>

</div>
`;
	


    if(showPreview){

    document.getElementById("reportOutput").innerHTML = html;

}

return html;
	
	
}

const promotionMap = {

    "Nursery 1A":"Nursery 2A",
	"Nursery 1B":"Nursery 2B",
	
    "Nursery 2A":"KG1A",
	"Nursery 2B":"KG1B",
	
    "KG1A":"KG2A",
	"KG1B":"KG2B",
	
    "KG2A":"1A",
	"KG2B":"1B",


	
    "1A":"2A",
    "1B":"2B",

    "2A":"3A",
    "2B":"3B",

    "3A":"4A",
    "3B":"4B",

    "4A":"5A",
    "4B":"5B",

    "5A":"6A",
    "5B":"6B",

    "6A":"JHS 1",
    "6B":"JHS 1",

    "JHS 1":"JHS 2",
    "JHS 2":"JHS 3"
};

let currentAcademicYear = "2025/2026";

async function promoteStudents(){

    const confirmed =
        await showPromotionModal();

    if(!confirmed) return;

    try{

        for(const student of students){

            if(student.graduated)
                continue;

            const archiveRecord={

                studentid:student.id,

                academic_year:currentAcademicYear,

                student_name:student.name,

                student_class:student.studentclass,

                subjects:student.subjects||{},

                conduct:student.conduct||{},

                attitude:student.attitude||{},

                interest:student.interest||{},

                teacher_remark:
                    student.teacherRemark||{},

                total_days:
                    student.totalDays||{},

                days_present:
                    student.daysPresent||{},

                average:
                    student.average||0
            };

            const {error}=await supabaseClient

                .from("student_history")

                .insert([archiveRecord]);

            if(error) throw error;

            if(student.studentclass==="JHS 3"){

                student.graduated=true;

                continue;
            }

            student.studentclass=

                promotionMap[
                    student.studentclass
                ]||

                student.studentclass;

            student.subjects={};

            student.conduct={};

            student.attitude={};

            student.interest={};

            student.teacherRemark={};

            student.totalDays={};

            student.daysPresent={};

            student.average=0;

            student.currentTerm="term1";
        }

        await saveStudents();

        alert(
            "Students promoted successfully!"
        );

    }

    catch(err){

        console.log(err);

        alert(
            "Promotion failed."
        );

    }

}

// ==========================================
// CLICK SIGNATURE TO SELECT A FILE
// ==========================================
function uploadSignature() {

    document.getElementById("signatureInput").click();

}


// ==========================================
// HANDLE SELECTED SIGNATURE
// ==========================================
async function handleSignatureUpload(event) {

    const file = event.target.files[0];

    if (!file) return;


    // Only allow images
    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        event.target.value = "";

        return;
    }


    // Optional size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {

        alert("Signature image must be less than 2MB.");

        event.target.value = "";

        return;
    }


    // Make sure user is logged in
    if (!currentUser || !currentUser.id) {

        alert("User information not available.");

        return;
    }


    // ------------------------------------------
    // SHOW PREVIEW IMMEDIATELY
    // ------------------------------------------

    const reader = new FileReader();

    reader.onload = function(e) {

        const preview =
            document.getElementById("signaturePreview");

        const placeholder =
            document.getElementById("signaturePlaceholder");

        preview.src = e.target.result;

        preview.style.display = "block";

        placeholder.style.display = "none";
    };

    reader.readAsDataURL(file);


    // ------------------------------------------
    // UPLOAD TO SUPABASE
    // ------------------------------------------

    const fileName =
        `${currentUser.id}-${Date.now()}.${file.name.split(".").pop()}`;


    const { error: uploadError } =
        await supabaseClient.storage
            .from("signatures")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false
            });


    if (uploadError) {

        console.error(uploadError);

        alert("Signature upload failed: " + uploadError.message);

        return;
    }


    // ------------------------------------------
    // GET PUBLIC URL
    // ------------------------------------------

    const { data } =
        supabaseClient.storage
            .from("signatures")
            .getPublicUrl(fileName);


    const signatureUrl =
        data.publicUrl;


    // ------------------------------------------
    // SAVE URL TO USERS TABLE
    // ------------------------------------------

    const { error: dbError } =
        await supabaseClient
            .from("users")
            .update({
                signature: signatureUrl
            })
            .eq("id", currentUser.id);


    if (dbError) {

        console.error(dbError);

        alert(
            "Signature uploaded, but could not be saved to your profile: " +
            dbError.message
        );

        return;
    }


    // ------------------------------------------
    // DISPLAY ACTUAL SUPABASE SIGNATURE
    // ------------------------------------------

    const preview =
        document.getElementById("signaturePreview");

    const placeholder =
        document.getElementById("signaturePlaceholder");


    preview.src =
        signatureUrl;

    preview.style.display =
        "block";

    placeholder.style.display =
        "none";


    // Reset input so the same file
    // can be selected again if necessary
    event.target.value = "";


    console.log(
        "Signature uploaded:",
        signatureUrl
    );

}


// ==========================================
// LOAD SAVED SIGNATURE
// ==========================================
async function loadSignature() {

    if (!currentUser || !currentUser.id) return;


    const { data, error } =
        await supabaseClient
            .from("users")
            .select("signature")
            .eq("id", currentUser.id)
            .single();


    if (error) {

        console.error(
            "Error loading signature:",
            error
        );

        return;
    }


    const preview =
        document.getElementById("signaturePreview");

    const placeholder =
        document.getElementById("signaturePlaceholder");


    if (data?.signature) {

        preview.src =
            data.signature;

        preview.style.display =
            "block";

        placeholder.style.display =
            "none";

    } else {

        preview.src = "";

        preview.style.display =
            "none";

        placeholder.style.display =
            "flex";
    }
}

function showPromotionModal(){

    const modal =
        document.getElementById(
            "promotionModal"
        );

    let html = "<table style='width:100%;border-collapse:collapse'>";

    html += `
        <tr>
            <th align="left">Current Class</th>
            <th></th>
            <th align="left">Next Class</th>
        </tr>
    `;

    Object.keys(promotionMap).forEach(cls=>{

        html+=`
            <tr>
                <td>${cls}</td>
                <td style="text-align:center;">➜</td>
                <td>${promotionMap[cls]}</td>
            </tr>
        `;
    });

    html+=`
        <tr>
            <td>JHS 3</td>
            <td style="text-align:center;">➜</td>
            <td>Graduated</td>
        </tr>
    `;

    html+="</table>";

    document.getElementById(
        "promotionSummary"
    ).innerHTML=html;

    modal.style.display="flex";

    return new Promise(resolve=>{

        promotionResolve=resolve;

    });

}

function closePromotionModal(){

    document.getElementById(
        "promotionModal"
    ).style.display="none";

    if(promotionResolve){

        promotionResolve(false);

        promotionResolve=null;
    }

}

function confirmPromotion(){

    document.getElementById(
        "promotionModal"
    ).style.display="none";

    if(promotionResolve){

        promotionResolve(true);

        promotionResolve=null;
    }

}

async function restoreFromHistory(
    academicYear = currentAcademicYear
){

    if(
        !confirm(
            `Restore all students from ${academicYear}?\n\nThis will overwrite the current academic records.`
        )
    ) return;

    try{

        const { data: history, error } =
            await supabaseClient
                .from("student_history")
                .select("*")
                .eq("academic_year", academicYear);

        if(error) throw error;

        if(!history.length){

            alert(
                "No archived records found."
            );

            return;
        }

        history.forEach(record=>{

            let student =
                students.find(
                    s=>s.id===record.studentid
                );

            // Fallback if old records have no studentid
            if(!student){

                student = students.find(
                    s=>
                        s.name.trim().toLowerCase() ===
                        record.student_name.trim().toLowerCase()
                );

            }

            if(!student){

                console.log(
                    "Student not found:",
                    record.student_name
                );

                return;
            }

            student.studentclass =
                record.student_class;

            student.subjects =
                record.subjects || {};

            student.conduct =
                record.conduct || {};

            student.attitude =
                record.attitude || {};

            student.interest =
                record.interest || {};

            student.teacherRemark =
                record.teacher_remark || {};

            student.totalDays =
                record.total_days || {};

            student.daysPresent =
                record.days_present || {};

            student.average =
                record.average || 0;

            student.currentTerm = "term3";

            // Student is no longer graduated
            student.graduated = false;

        });

        await saveStudents();

        alert(
            "Students restored successfully!"
        );

    }catch(err){

        console.error(err);

        alert(
            "Failed to restore students."
        );

    }

}
function updateStudentSuggestions() {

    let search =
        document.getElementById("reportSearch")
        .value
        .toLowerCase();

    let suggestionBox =
        document.getElementById("studentSuggestions");

    suggestionBox.innerHTML = "";

    let filteredStudents = students;

    // Teachers see only students in assigned classes
    if (currentUser.role === "teacher") {

        filteredStudents = students.filter(s =>
            (currentUser.classes || [])
            .includes(s.studentclass)
        );
    }

    filteredStudents
        .filter(s =>
            s.name.toLowerCase().includes(search)
        )
        .slice(0, 10)
        .forEach(student => {

            let option =
                document.createElement("option");

            option.value = student.name;

            suggestionBox.appendChild(option);
        });
}

function getReportStudent() {

    let name =
        document.getElementById("reportSearch")
        .value
        .trim()
        .toLowerCase();

    let availableStudents = students;

    if (currentUser.role === "teacher") {

        availableStudents = students.filter(s =>
            (currentUser.classes || [])
            .includes(s.studentclass)
        );
    }

    return availableStudents.find(s =>
        s.name.toLowerCase() === name
    );
}

function printReport(){
    let content = document.getElementById("printArea").outerHTML;

    let win = window.open("");

    win.document.write(`
        <html>
        <head>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }

                body {
                    margin: 0;
                }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);

    win.document.close();
    win.print();
}
function downloadSingleReport(){

    if(!window.singleReportURL){

        alert("Generate the report first");

        return;

    }


    let link =
    document.createElement("a");


    link.href =
    window.singleReportURL;


    link.download =
    window.singleReportName || "Student_Report.pdf";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);

}

async function downloadPDF(){

    let element = document.getElementById("printArea");

    let studentname =
        document.getElementById("reportSearch")
        .value
        .trim()
        .replace(/\s+/g, "_");

    let term =
        document.getElementById("reportTerm").value;

    term =
        term.charAt(0).toUpperCase() +
        term.slice(1);

    let fileName = `${studentname}_${term}.pdf`;

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF(
        "p",
        "mm",
        "a4"
    );

    const imgWidth = 210;
    const imgHeight =
        (canvas.height * imgWidth) /
        canvas.width;

    doc.addImage(
        imgData,
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
    );

    doc.save(fileName);
}
async function downloadStudentReport(){

    // Get student search value
    let name =
        document.getElementById("reportSearch")
        .value
        .trim()
        .toLowerCase();


    let term =
        document.getElementById("reportTerm")
        .value;


    // Find student
    let s =
        students.find(
            x =>
            x.name.toLowerCase() === name
        );


    if(!s){

        alert("Student not found");
        return;

    }


    // Update latest average before report
    calculateStudentAverage(
        s,
        term
    );


    // Get term dates
    let endDate =
        getTermEnd(term);

    let nextDate =
        getNextTermStart(term);


    if(!endDate || !nextDate){

        alert(
            "❌ Please set term dates first!"
        );

        return;

    }



    // Generate report preview
    await generateReportWithTerm(

        s,

        term,

        endDate,

        nextDate

    );



    // Allow HTML to render
    await new Promise(
        resolve =>
        setTimeout(resolve,300)
    );



    let element =
        document.getElementById(
            "printArea"
        );


    if(!element){

        alert(
            "Report area not found!"
        );

        return;

    }



    // Convert report to image

    const canvas =
        await html2canvas(
            element,
            {
                scale:3,
                useCORS:true
            }
        );


    const imgData =
        canvas.toDataURL(
            "image/png",
            1.0
        );



    const { jsPDF } =
        window.jspdf;



    let doc =
        new jsPDF(
            "p",
            "mm",
            "a4"
        );



    let imgWidth = 210;


    let imgHeight =
        (
            canvas.height *
            imgWidth
        )
        /
        canvas.width;



    doc.addImage(

        imgData,

        "PNG",

        0,

        0,

        imgWidth,

        imgHeight

    );



    let fileName =
        `${s.name.replace(/\s+/g,"_")}_${term}_Report.pdf`;



    let pdfBlob = doc.output("blob");

let pdfURL = URL.createObjectURL(pdfBlob);


let downloadArea =
document.getElementById("singleReportDownloadArea");


if(downloadArea){

    downloadArea.innerHTML = `

    <div style="
        margin-top:20px;
        padding:15px;
        background:#f1f5f9;
        border-radius:10px;
        text-align:center;
    ">

    <h4>
    ✅ ${s.name}'s Report Generated
    </h4>


    <button 
    onclick="downloadSingleReport()"
    style="
    background:#2563eb;
    color:white;
    border:none;
    padding:12px 25px;
    border-radius:8px;
    cursor:pointer;
    ">

    <i class="fas fa-download"></i>
    Download Report

    </button>


    </div>

    `;


    window.singleReportURL = pdfURL;

    window.singleReportName = fileName;

}


}

// AUTO LOGIN AFTER REFRESH
window.onload = async function () {


    let savedUser = JSON.parse(
        localStorage.getItem("loggedInUser")
    );


    if (savedUser) {


        // Fetch latest user data from Supabase
        const { data: user, error } = await supabaseClient

            .from("users")

            .select("*")

            .eq("username", savedUser.username)

            .single();



        if (!error && user) {


            currentUser = user;



            // ===============================
            // SHOW / HIDE GENERATE ACCOUNT BUTTON
            // ===============================

            const generateBtn =
            document.getElementById(
                "generateAccountsBtn"
            );


            if(generateBtn){


                if(
    currentUser.role &&
    currentUser.role.toLowerCase() === "admin"
){

                    generateBtn.style.display =
                    "block";

                }else{

                    generateBtn.style.display =
                    "none";

                }


            }



            // Update cached session
            localStorage.setItem(

                "loggedInUser",

                JSON.stringify(user)

            );



            document.getElementById(
                "loginBox"
            ).style.display = "none";



            document.getElementById(
                "app"
            ).style.display = "block";



            document.getElementById(
                "topNav"
            ).style.display = "flex";



            document.getElementById(
                "subHeader"
            ).style.display = "flex";



            document.getElementById(
                "welcomeUser"
            ).innerText =

                "👋 Welcome, " +

                user.firstname +

                " " +

                user.surname;



            // Load system data
			await loadUsers();
			
            await loadTermSettings();

            await loadStudents();

            await loadAttendanceData();

            await loadLogo();

            await displaySchoolName();

            await loadTheme();

			loadClassOptions();

            updateDashboard();


            populateStudentList();


            showPage("dashboardPage");



        } else {


            // Invalid session

            localStorage.removeItem(
                "loggedInUser"
            );


        }



    } else {


        // Load default theme if no user

        loadTheme();


    }


};

async function refreshCurrentUser() {

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", currentUser.username)
        .single();

    if (!error && data) {

        currentUser = data;

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(currentUser)
        );
    }
}

async function showProfile(){

    showPage("userProfilePage");

    await loadUsers();

    loadProfileData();
    loadTermSettings();

    loadSubjectSelection();

    loadTeacherSubjects();
}



function loadProfileData(){

    if(!currentUser){
        console.error("currentUser not found");
        return;
    }

    document.getElementById("pFirstName").value =
        currentUser.firstname || "";

    document.getElementById("pSurname").value =
        currentUser.surname || "";

    document.getElementById("pUsername").value =
        currentUser.username || "";

    document.getElementById("pEmail").value =
        currentUser.email || "";

    document.getElementById("pPhone").value =
        currentUser.phone || "";

    document.getElementById("pRole").value =
        currentUser.role || "";

    const img = document.getElementById("profilePic");

    if(img){
        img.src = currentUser.profilePic ||
                  "assets/default-profile.png";
    }
}


async function saveProfile() {

    // Get form values
    let firstname =
        document.getElementById(
            "pFirstName"
        ).value.trim();

    let surname =
        document.getElementById(
            "pSurname"
        ).value.trim();

    let email =
        document.getElementById(
            "pEmail"
        ).value.trim();

    let phone =
        document.getElementById(
            "pPhone"
        ).value.trim();

    // Update user in Supabase
    const { error } = await supabaseClient
        .from("users")
        .update({
            firstname: firstname,
            surname: surname,
            email: email,
            phone: phone
        })
        .eq("username", currentUser.username);

    if (error) {

        console.log(error);

        return alert(
            "Failed to update profile"
        );
    }

    // Update current user locally
    currentUser.firstname = firstname;
    currentUser.surname = surname;
    currentUser.email = email;
    currentUser.phone = phone;

    // Update session cache
    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(currentUser)
    );

    // Update welcome text instantly
    document.getElementById(
        "welcomeUser"
    ).innerText =
        "👋 Welcome, " +
        currentUser.firstname +
        " " +
        currentUser.surname;

    alert("Profile updated successfully!");
}

function closeProfile(){
    document.getElementById("profileModal").style.display = "none";
}
function loadSubjectSelection(user = currentUser) {

    let container = document.getElementById("subjectCheckboxes");
    container.innerHTML = "";

    let selected = user.subjects || [];

    subjects.forEach(sub => {

        let checked = selected.includes(sub) ? "checked" : "";
        let disabled = currentUser.role === "teacher" ? "disabled" : "";

        container.innerHTML += `
            <label style="display:block; margin:5px 0;">
                <input type="checkbox" value="${sub}" ${checked} ${disabled}>
                ${sub}
            </label>
        `;
    });

    document.getElementById("saveSubjectsBtn").style.display =
        currentUser.role === "teacher" ? "none" : "block";
}


async function saveTeacherSubjects() {

    try {

        // =========================
        // GET SELECTED TEACHER
        // =========================

        const teacherId = document.getElementById("teacherSelect").value;

        if (!teacherId) {
            alert("Please select a teacher.");
            return;
        }

        // =========================
        // GET SELECTED SUBJECTS
        // =========================

        const selectedSubjects = [];

        document.querySelectorAll("#subjectCheckboxes input:checked")
            .forEach(cb => {
                selectedSubjects.push(cb.value);
            });

        if (selectedSubjects.length === 0) {
            alert("Please select at least one subject.");
            return;
        }

        // =========================
        // GET CLASS LIST
        // =========================

        const classInput = document
            .getElementById("teacherClass")
            .value
            .trim();

        if (!classInput) {
            alert("Please enter at least one class.");
            return;
        }

        const classList = classInput
            .split(",")
            .map(c => c.trim())
            .filter(c => c !== "");

        if (classList.length === 0) {
            alert("Please enter a valid class.");
            return;
        }

        // =========================
        // CREATE CLASSES IF NEEDED
        // =========================

        for (const cls of classList) {

            const { data: existingClass, error: checkError } =
                await supabaseClient
                    .from("classes")
                    .select("id")
                    .eq("classname", cls)
                    .eq("schoolid", currentUser.schoolid)
                    .maybeSingle();

            if (checkError) {
                console.error(checkError);
                continue;
            }

            if (!existingClass) {

                const { error: insertError } =
                    await supabaseClient
                        .from("classes")
                        .insert({
                            classname: cls,
                            schoolid: currentUser.schoolid
                        });

                if (insertError) {
                    console.error(insertError);
                    alert(`Failed to create class "${cls}".`);
                    return;
                }
            }
        }

        // =========================
        // UPDATE TEACHER
        // =========================

        const { error: updateError } =
            await supabaseClient
                .from("users")
                .update({
                    mainClass: classList[0],
                    classes: classList,
                    subjects: selectedSubjects
                })
                .eq("id", teacherId);

        if (updateError) {
            console.error(updateError);
            alert("Failed to save teacher settings.");
            return;
        }

        // =========================
        // REFRESH DATA
        // =========================

        await loadUsers();
        await loadTeachers();

        alert("✅ Teacher class and subjects saved successfully.");

    } catch (err) {

        console.error(err);
        alert("An unexpected error occurred.");

    }
}





async function updateProfile() {

    let newFirst =
        document.getElementById(
            "profileFirstName"
        ).value.trim();

    let newSur =
        document.getElementById(
            "profileSurname"
        ).value.trim();

    let newUser =
        document.getElementById(
            "profileUsername"
        ).value.trim();

    let newEmail =
        document.getElementById(
            "profileEmail"
        ).value.trim();

    let newPhone =
        document.getElementById(
            "profilePhone"
        ).value.trim();

    if (
        !newFirst ||
        !newSur ||
        !newUser ||
        !newEmail ||
        !newPhone
    ) {

        return alert("Fill all fields");
    }

    // =========================
    // UPDATE DATABASE
    // =========================

    const { error } =
        await supabaseClient
            .from("users")
            .update({
                firstname: newFirst,
                surname: newSur,
                username: newUser,
                email: newEmail,
                phone: newPhone
            })
            .eq("id", currentUser.id);

    if (error) {
    console.error("Profile Update Error:", error);
    alert(error.message);
    return;
}

    // =========================
    // UPDATE CURRENT USER
    // =========================

    currentUser.firstname =
        newFirst;

    currentUser.surname =
        newSur;

    currentUser.username =
        newUser;

    currentUser.email =
        newEmail;

    currentUser.phone =
        newPhone;

    // =========================
    // SAVE SESSION
    // =========================

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(currentUser)
    );

    // =========================
    // UPDATE WELCOME TEXT
    // =========================

    document.getElementById(
        "welcomeUser"
    ).innerText =
        "👋 Welcome, " +
        currentUser.firstname +
        " " +
        currentUser.surname;

    alert(
        "Profile updated successfully ✅"
    );

    closeProfile();
}


function uploadProfilePic() {

    document.getElementById(
        "profilePicInput"
    ).click();
}

document.getElementById(
    "profilePicInput"
).addEventListener("change", async function () {

    let file = this.files[0];

    if (!file) return;

    // Unique filename
    let fileName =
        `${currentUser.id}-${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseClient
        .storage
        .from("profile-picture")
        .upload(fileName, file);

    if (error) {

        console.log(error);

        return alert(
            "Profile picture upload failed"
        );
    }

    // Get public URL
    const { data: urlData } = supabaseClient
        .storage
        .from("profile-picture")
        .getPublicUrl(fileName);

    let imageUrl = urlData.publicUrl;
	console.log("Image URL:", imageUrl);

    // Save URL to database
    const { error: dbError } = await supabaseClient
        .from("users")
        .update({
            profilePic: imageUrl
        })
        .eq("id", currentUser.id);

    if (dbError) {

        console.log(dbError);

        return alert(
            "Failed to save profile picture"
        );
    }
if (error) {
    console.log("Upload Error:", error);
}

if (dbError) {
    console.log("Database Error:", dbError);
}
    // Update current user locally
    currentUser.profilePic = imageUrl;

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(currentUser)
    );

    // Display image
    document.getElementById(
        "profilePic"
    ).src = imageUrl;

    alert("Profile picture updated ✅");
});

async function loadTeachers() {

    // Only admins can assign teachers
    if (!currentUser || currentUser.role !== "admin") return;

    const select = document.getElementById("teacherSelect");

    if (!select) {
        console.error("teacherSelect element not found.");
        return;
    }

    // Loading message
    select.innerHTML = `<option value="">Loading teachers...</option>`;

    try {

        const { data: teachers, error } = await supabaseClient
            .from("users")
            .select("id, firstname, surname, username, role, schoolid")
            .eq("role", "teacher")
            .eq("schoolid", currentUser.schoolid)
            .order("firstname", { ascending: true });

        if (error) {
            console.error("Error loading teachers:", error);
            select.innerHTML = `<option value="">Failed to load teachers</option>`;
            return;
        }

        console.log("Teachers Loaded:", teachers);

        if (!teachers || teachers.length === 0) {
            select.innerHTML = `<option value="">No teachers found</option>`;
            return;
        }

        // Default option
        select.innerHTML = `<option value="">-- Select Teacher --</option>`;

        teachers.forEach(teacher => {

            const option = document.createElement("option");

            option.value = teacher.id;      // Use ID, not username
            option.textContent =
                `${teacher.firstname} ${teacher.surname}`;

            select.appendChild(option);

        });

        // Automatically load the first teacher's details
        select.selectedIndex = 1;

        await loadSelectedTeacherSubjects();

    } catch (err) {

        console.error("Unexpected error:", err);

        select.innerHTML =
            `<option value="">Unable to load teachers</option>`;

    }
}
async function loadSelectedTeacherSubjects() {

    const teacherId = document.getElementById("teacherSelect").value;

    if (!teacherId) {
        document.getElementById("teacherClass").value = "";
        document.getElementById("subjectCheckboxes").innerHTML = "";
        return;
    }

    const { data: teacher, error } = await supabaseClient
        .from("users")
        .select("classes, subjects")
        .eq("id", teacherId)
        .single();

    if (error) {
        console.error("Error loading teacher:", error);
        return;
    }

    // Load assigned classes
    document.getElementById("teacherClass").value =
        Array.isArray(teacher.classes)
            ? teacher.classes.join(", ")
            : "";

    // Build subject checkboxes
    let html = "";

    subjects.forEach(subject => {

        const checked =
            Array.isArray(teacher.subjects) &&
            teacher.subjects.includes(subject)
                ? "checked"
                : "";

        html += `
            <label style="display:block;margin:5px 0;">
                <input
                    type="checkbox"
                    value="${subject}"
                    ${checked}
                >
                ${subject}
            </label>
        `;
    });

    document.getElementById("subjectCheckboxes").innerHTML = html;

    console.log("Teacher Loaded:", teacher);
}

function calculateStudentAverage(student, term){


    let total = 0;
    let count = 0;


    let studentSubjects =
        Object.keys(student.subjects || {});


    studentSubjects.forEach(sub=>{


        let d =
        student.subjects?.[sub]?.[term];


        if(!d) return;



        let subjectTotal;



        // New saved format
        if(d.totalScore !== undefined){


            subjectTotal =
            Number(d.totalScore);


        }

        // Old saved format
        else{


            let classTotal =
                Number(d.test1 || 0) +
                Number(d.test2 || 0) +
                Number(d.project || 0) +
                Number(d.group || 0);



            let classScore =
                (classTotal / 100) * 50;



            let examScore =
                (Number(d.exam || 0) / 100) * 50;



            subjectTotal =
                classScore + examScore;


        }



        total += subjectTotal;

        count++;


    });



    student.average =
        count
        ? Number(
            (total / count)
            .toFixed(2)
          )
        : 0;



    return student.average;

}

function getStudentPosition(student, term){


    let classStudents =
    students.filter(
        s => s.studentclass === student.studentclass
    );



    let ranked =
    classStudents.map(s=>{


        let totalScore = 0;



        // Every subject contributes maximum 100
        subjects.forEach(sub=>{


            let d =
            s.subjects?.[sub]?.[term];


            if(!d){
                return;
            }



            let classTotal =
                Number(d.test1 || 0) +
                Number(d.test2 || 0) +
                Number(d.project || 0) +
                Number(d.group || 0);



            let classScore =
                (classTotal / 100) * 50;



            let examScore =
                (Number(d.exam || 0) / 100) * 50;



            let subjectTotal =
                classScore + examScore;



            totalScore += subjectTotal;


        });



        return {

            id:s.id,

            totalScore:Number(
                totalScore.toFixed(2)
            )

        };


    });



    // Highest total out of the full subject total
    ranked.sort(
        (a,b)=>
        b.totalScore - a.totalScore
    );



    console.table(ranked);



    let index =
    ranked.findIndex(
        x=>x.id === student.id
    );



    if(index === -1){

        return "-";

    }



    return formatPosition(
        index + 1
    );

}
function formatPosition(pos){
    if(pos === 1) return "1st";
    if(pos === 2) return "2nd";
    if(pos === 3) return "3rd";
    return pos + "th";
}

async function loadClassFilter(){

    let { data: classes, error } = await supabaseClient
        .from("classes")
        .select("*")
        .eq("schoolid", currentUser.schoolid);

    if(error){
        console.error(error);
        return;
    }

    // Convert objects to names ONCE
    classes = classes.map(c => c.classname);

  

    // Only teachers are restricted
    if(currentUser.role === "teacher"){
        classes = classes.filter(c =>
            (currentUser.classes || []).includes(c)
        );
    }

    let html = `<option value="">Select Class</option>`;

    classes.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });

    document.getElementById("classFilter").innerHTML = html;
}


async function initDefaultClasses(){

    const defaultClasses = [
        "1A",
        "1B",
        "2A",
        "2B",
        "3A"
    ];

    const { data: existing, error } = await supabaseClient
        .from("classes")
        .select("classname")
        .eq("schoolid", currentUser.schoolid);

    if(error){
        console.error("Class Load Error:", error);
        return;
    }

    const existingClasses =
        (existing || []).map(c => c.classname);

    const missingClasses =
        defaultClasses.filter(
            cls => !existingClasses.includes(cls)
        );

    if(missingClasses.length === 0){
        console.log("All default classes already exist");
        return;
    }

    const records = missingClasses.map(cls => ({
        classname: cls,
        schoolid: currentUser.schoolid
    }));

    const { error: insertError } = await supabaseClient
        .from("classes")
        .insert(records);

    if(insertError){
        console.error(
            "Default Class Insert Error:",
            insertError
        );
    }else{
        console.log(
            "Missing classes created:",
            missingClasses
        );
    }
}

async function filterStudentsByClass(){

    let selectedClass = document.getElementById("classFilter").value;

    let { data: filtered, error } = await supabaseClient
        .from("students")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .eq("studentclass", selectedClass);

    if(error){
        console.error(error);
        return;
    }

    // Teacher Safety
    if(currentUser.role === "teacher"){
        filtered = filtered.filter(s =>
            (currentUser.classes || []).includes(s.studentclass)
        );
    }

    filteredStudents = filtered;

    // Clear previous data
    studentsList.innerHTML = "";
    subjectForm.innerHTML = "";

    // Show subjects instead of students
    showTeacherSubjects();
}

function selectFilteredStudent(index){

    let student = filteredStudents[index];

    if(!student){
        alert("Student not found");
        return;
    }

    // ADMIN
    if(currentUser.role === "admin"){

        let modal = document.getElementById("studentModal");
        let content = document.getElementById("studentModalContent");

        content.innerHTML = `
            <h2>${student.name}</h2>

            <p><strong>Class:</strong> ${student.studentclass}</p>

            <p><strong>Gender:</strong>
            ${student.gender || "Not Set"}</p>

            <button onclick="closeStudentModal()">
                Close
            </button>
        `;

        modal.style.display = "flex";
        return;
    }

    // TEACHER
    let originalIndex = students.findIndex(
        s => s.id === student.id
    );

    if(originalIndex !== -1){
        selectStudent(originalIndex);
    }
}

window.selectFilteredStudent = selectFilteredStudent;

async function loadClassOptions(){

    let { data: classes, error } = await supabaseClient
    .from("classes")
    .select("*")
    .eq("schoolid", currentUser.schoolid);


    if(error){
        console.error("Class Load Error:", error);
        return;
    }

    classes = classes.map(c => c.classname);


    // Teacher should only see assigned classes
    if(currentUser.role === "teacher"){

        classes.forEach(c => {
            console.log(
                "Checking:",
                c,
                "Match:",
                (currentUser.classes || []).includes(c)
            );
        });

        classes = classes.filter(c =>
            (currentUser.classes || []).includes(c)
        );

        
    }

    let html = `<option value="">Select Class</option>`;

    classes.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });

    document.getElementById("classFilter").innerHTML = html;


        document.getElementById("studentClass").innerHTML
    ;
}

function getClassTeacherName(studentclass){

    let teacher = users.find(u =>
        u.role === "teacher" &&
        (u.classes || []).includes(studentclass)
    );

    if(!teacher){
        return "Not Assigned";
    }

    return `${teacher.firstname} ${teacher.surname}`;
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  document.getElementById("installBtn").style.display = "block";
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    console.log(choice.outcome);

    deferredPrompt = null;
  }
});

async function ensureClassExists(classname){

    if(!classname) return;

    const { data } = await supabaseClient
        .from("classes")
        .select("*")
        .eq("classname", classname)
        .eq("schoolid", currentUser.schoolid)
        .maybeSingle();

    if(data) return;

    const { error } = await supabaseClient
        .from("classes")
        .insert([
            {
                classname: classname,
                schoolid: currentUser.schoolid
            }
        ]);

    if(error){
        console.error(
            "Create Class Error:",
            error
        );
    }
}

function loadTeacherSubjects(){

    let subjectList = currentUser.role === "teacher"
        ? (currentUser.subjects || [])
        : subjects;

    let planSelect = document.getElementById("planSubject");
    let noteSelect = document.getElementById("noteSubject");

    planSelect.innerHTML = "";
    noteSelect.innerHTML = "";

    subjectList.forEach(sub=>{
        planSelect.innerHTML += `<option>${sub}</option>`;
        noteSelect.innerHTML += `<option>${sub}</option>`;
    });
}


function isOnline(){
    return navigator.onLine;
	
	if(!isOnline()){
    document.getElementById("planOutput").innerHTML =
        "❌ No internet connection. Please connect to generate lesson plan.";
    return;
}
}

async function generateLessonPlan(){

    if(!navigator.onLine){
        planOutput.innerHTML = "❌ No internet connection.";
        return;
    }

    let subject = planSubject.value;
    let term = planTerm.value;

    planOutput.innerHTML = "⏳ Generating...";

    try{
        let res = await fetch("http://localhost:3000/generate-plan", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ subject, term })
        });

        if(!res.ok){
            throw new Error("Server error");
        }

        let data = await res.json();

        if(!data.result){
            throw new Error("No result returned");
        }

        planOutput.innerHTML = data.result;

    }catch(err){
        console.error(err);
        planOutput.innerHTML = "❌ Failed to generate lesson plan.";
    }
}
async function generateLessonNote(){

    if(!navigator.onLine){
        document.getElementById("noteOutput").innerHTML =
            "❌ No internet connection.";
        return;
    }

    let subject = document.getElementById("noteSubject").value;
    let week = document.getElementById("noteWeek").value;
    let term = document.getElementById("noteTerm").value;

    document.getElementById("noteOutput").innerHTML = "⏳ Generating note...";

    try{
        let response = await fetch("https://api.openai.com/v1/chat/completions", {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer (sk-proj-f5YWVHONS7wtTzk8gkEXT3BlbkFJ6UGpQ6sHvoUnFZmktxsc)"
            },
            body: JSON.stringify({
                model:"gpt-4o-mini",
                messages:[
                    {
                        role:"user",
                        content:`Prepare a Ghana GES standard lesson note for ${subject}, ${week}, ${term}. Include objectives, materials, procedure, and evaluation.`
                    }
                ]
            })
        });

        let data = await response.json();

        document.getElementById("noteOutput").innerHTML =
            data.choices[0].message.content;

    }catch(err){
        document.getElementById("noteOutput").innerHTML =
            "❌ Failed to generate note.";
    }
}

window.addEventListener("offline", () => {
    alert("❌ You are offline");
});

window.addEventListener("online", () => {
    alert("✅ Back online");
});

function showSection(sectionId){

    // hide all sections
    document.querySelectorAll(".section").forEach(sec=>{
        sec.style.display = "none";
    });

    // show selected section
    document.getElementById(sectionId).style.display = "block";
}

function exportToWord(content){

    const { Document, Packer, Paragraph, TextRun } = window.docx;

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: content,
                            size: 24
                        })
                    ]
                })
            ]
        }]
    });

    Packer.toBlob(doc).then(blob => {
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Lesson_Plan.docx";
        link.click();
    });
}

async function savePlan(){

    let content = document.getElementById("planOutput").innerHTML;

    const { error } = await supabaseClient
        .from("plans")
        .insert([
            {
                schoolid: currentUser.schoolid,
                content: content,
                createdAt: new Date().toISOString()
            }
        ]);

    if(error){
        console.error(error);
        return alert("Failed to save plan");
    }

    alert("✅ Plan saved");
}

async function loadPlans(){

    const { data: plans, error } = await supabaseClient
        .from("plans")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .order("createdAt", { ascending: false });

    if(error){
        console.error(error);
        return;
    }

    let html = "<h3>Saved Plans</h3>";

    plans.forEach(p=>{
        html += `<div style="margin-bottom:10px;">${p.content}</div>`;
    });

    document.getElementById("planOutput").innerHTML = html;
}

/* ============================================================
   CHAT SYSTEM
   ============================================================

   Required existing globals:
   currentUser
   users
   students
   supabaseClient

   Existing chat state:
   selectedUser
   selectedUserType
   selectedMessageId
   selectedMediaFile
   chatCache
   chatCacheLoading
   chatCacheLoaded
   ============================================================ */


/* ============================================================
   1. CHAT CONTACTS
   ============================================================ */


function loadChatContacts() {

    if (!currentUser) return [];

    chatContacts = [];

    // ==========================================
    // STAFF
    // ==========================================

    users
        .filter(user =>
            user.username !== currentUser.username &&
            user.schoolid === currentUser.schoolid
        )
        .forEach(user => {

            chatContacts.push({

                id: user.username,

                type: "user",

                firstname: user.firstname || "",

                surname: user.surname || "",

                name:
                    `${user.firstname || ""} ${user.surname || ""}`.trim(),

                profilePic: user.profilePic || "",

                photo: user.profilePic || "",

                lastSeen: user.lastSeen || 0

            });

        });


    // ==========================================
    // STUDENTS
    // Teachers and Admin
    // ==========================================

    if (
        currentUser.role === "teacher" ||
        currentUser.role === "admin"
    ) {

        students.forEach(student => {

            chatContacts.push({

                id: student.id,

                type: "student",

                firstname:
                    student.name || "",

                surname: "",

                name:
                    student.name || "Student",

                profilePic:
                    student.photo || "",

                photo:
                    student.photo || "",

                studentclass:
                    student.studentclass || "No Class",

                class:
                    student.studentclass || "No Class",

                lastSeen: 0

            });

        });

    }


    return chatContacts;

}


/* ============================================================
   2. CONTACT HELPERS
   ============================================================ */

function getChatContact(id, type) {

    if (type === "user") {

        return users.find(user =>
            String(user.username) === String(id)
        );

    }

    if (type === "student") {

        return students.find(student =>
            String(student.id) === String(id)
        );

    }

    return null;
}


function getContactName(id, type) {

    const person = getChatContact(id, type);

    if (!person) return "Unknown";

    if (type === "student") {
        return person.name || "Student";
    }

    return `${person.firstname || ""} ${person.surname || ""}`.trim();
}


function getContactPhoto(id, type) {

    const person = getChatContact(id, type);

    if (!person) return "";

    return type === "student"
        ? person.photo || ""
        : person.profilePic || "";
}


function isUserOnline(user) {

    return Boolean(
        user &&
        user.lastSeen &&
        Date.now() - user.lastSeen < 60000
    );

}


/* ============================================================
   3. DISPLAY CHAT USERS
   ============================================================ */

function displayUsers() {

    if (!currentUser) return;

    loadChatContacts();

    const userList =
        document.getElementById("userList");

    if (!userList) return;

    let html = "";

    chatContacts.forEach(person => {

        const isStudent =
            person.type === "student";

        const firstname =
            person.firstname || "";

        const surname =
            person.surname || "";

        const displayName =
            isStudent
                ? firstname
                : `${firstname} ${surname}`.trim();

        const initials =
            isStudent
                ? (firstname.charAt(0) || "?").toUpperCase()
                : (
                    (firstname.charAt(0) || "") +
                    (surname.charAt(0) || "")
                ).toUpperCase() || "?";

        const online =
            !isStudent &&
            person.lastSeen &&
            Date.now() - person.lastSeen < 60000;

        const active =
            String(selectedUser) === String(person.id) &&
            selectedUserType === person.type
                ? "active"
                : "";

        const avatar = buildAvatar(
            person.profilePic || person.photo || "",
            initials,
            !isStudent,
            online
        );

        const status =
            isStudent
                ? `🎓 ${person.studentclass || "No Class"}`
                : online
                    ? "🟢 Online"
                    : "⚪ Offline";

        html += `
            <div
                class="chat-user ${active}"
                data-id="${escapeAttribute(person.id)}"
                data-type="${escapeAttribute(person.type)}"
                onclick="selectUser(
                    '${escapeJS(person.id)}',
                    '${escapeJS(person.type)}'
                )"
            >

                ${avatar}

                <div class="user-details">

                    <div class="chat-name">
                        ${escapeHTML(displayName)}
                    </div>

                    <div class="last-seen">
                        ${escapeHTML(status)}
                    </div>

                </div>

            </div>
        `;

    });

    userList.innerHTML = html;

}


/* ============================================================
   4. AVATAR BUILDER
   ============================================================ */

function buildAvatar(photo, initials, showOnline = false, online = false) {

    const onlineDot =
        showOnline
            ? `
                <span class="online-dot ${online ? "online" : "offline"}"></span>
              `
            : "";

    if (photo) {

        return `
            <div class="avatar-wrapper">

                <img
                    src="${escapeAttribute(photo)}"
                    class="chat-avatar-img"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="chat-avatar"
                    style="display:none;"
                >
                    ${escapeHTML(initials)}
                </div>

                ${onlineDot}

            </div>
        `;

    }

    return `
        <div class="avatar-wrapper">

            <div class="chat-avatar">
                ${escapeHTML(initials)}
            </div>

            ${onlineDot}

        </div>
    `;

}


/* ============================================================
   5. OPEN / SELECT CHAT
   ============================================================ */

async function selectUser(id, type) {

    selectedUser = id;
    selectedUserType = type;

    const person = getChatContact(id, type);

    if (!person) {

        console.error("Chat contact not found:", id, type);

        return;

    }

    updateChatHeader(person, type);
    highlightSelectedUser(id, type);
    closeChatMenus();
    updateMobileChatView(true);

    try {

        // Only load the complete cache if it has not been loaded yet.
        await preloadChats();

        refreshCurrentChat();

        await markConversationSeen();

    } catch (error) {

        console.error("Failed to open conversation:", error);

        showChatError();

    }

}


/* ============================================================
   6. UPDATE CHAT HEADER
   ============================================================ */

function updateChatHeader(person, type) {

    const nameEl =
        document.getElementById("chatUserName");

    const statusEl =
        document.getElementById("chatUserStatus");

    const avatarEl =
        document.getElementById("chatUserAvatar");

    if (!nameEl || !statusEl || !avatarEl) return;

    const isStudent = type === "student";

    const name =
        isStudent
            ? person.name || "Student"
            : `${person.firstname || ""} ${person.surname || ""}`.trim();

    const online =
        !isStudent && isUserOnline(person);

    const status =
        isStudent
            ? `🎓 Student • ${person.studentclass || "No Class"}`
            : online
                ? "🟢 Online"
                : "⚪ Offline";

    const image =
        isStudent
            ? person.photo || ""
            : person.profilePic || "";

    nameEl.textContent = name;
    statusEl.textContent = status;

    avatarEl.removeAttribute("src");
    avatarEl.style.display = "none";
    avatarEl.style.background = "#d9d9d9";

    if (image) {

        avatarEl.src = image;
        avatarEl.style.display = "block";
        avatarEl.style.background = "transparent";

        avatarEl.onerror = function () {

            this.removeAttribute("src");
            this.style.background = "#d9d9d9";

        };

    }

}


/* ============================================================
   7. HIGHLIGHT SELECTED CONTACT
   ============================================================ */

function highlightSelectedUser(id, type) {

    document
        .querySelectorAll(".chat-user")
        .forEach(item => {

            item.classList.remove("active");

        });

    const selected = Array.from(
        document.querySelectorAll(".chat-user")
    ).find(item =>
        String(item.dataset.id) === String(id) &&
        item.dataset.type === type
    );

    if (selected) {

        selected.classList.add("active");

    }

}


/* ============================================================
   8. PRELOAD CHAT CACHE
   ============================================================ */

async function preloadChats() {

    if (!currentUser) return [];

    if (chatCacheLoaded) {

        return chatCache;

    }

    if (chatCacheLoading) {

        return waitForChatCache();

    }

    chatCacheLoading = true;

    try {

        const { data, error } = await supabaseClient
            .from("chats")
            .select("*")
            .eq("schoolid", currentUser.schoolid)
            .order("time", {
                ascending: true
            });

        if (error) throw error;

        chatCache = data || [];
        chatCacheLoaded = true;

        console.log(
            "Chat cache loaded:",
            chatCache.length
        );

        return chatCache;

    } catch (error) {

        console.error(
            "Chat cache error:",
            error
        );

        return [];

    } finally {

        chatCacheLoading = false;

    }

}


/* ============================================================
   9. WAIT FOR CACHE
   ============================================================ */

function waitForChatCache() {

    return new Promise(resolve => {

        const check = () => {

            if (!chatCacheLoading) {

                resolve(chatCache || []);

                return;

            }

            setTimeout(check, 50);

        };

        check();

    });

}


/* ============================================================
   10. GET CURRENT CONVERSATION
   ============================================================ */

function getCurrentConversation() {

    if (!selectedUser || !currentUser) {
        return [];
    }

    const myId =
        String(currentUser.username);

    const otherId =
        String(selectedUser);

    return (chatCache || []).filter(message => {

        const from =
            String(message.from_user);

        const to =
            String(message.to_user);

        // I SENT TO SELECTED USER
        const sent =
            from === myId &&
            to === otherId;

        // SELECTED USER SENT TO ME
        const received =
            from === otherId &&
            to === myId;

        return sent || received;

    });

}


/*
   Keep this old function name available in case another
   part of your app already calls loadConversation().
*/

function loadConversation() {

    return getCurrentConversation();

}


/* ============================================================
   11. REFRESH CURRENT CHAT
   ============================================================ */

function refreshCurrentChat(scroll = true) {

    const chatBox =
        document.getElementById("chatBox");

    if (!chatBox) return;

    const messages =
        getCurrentConversation();

    if (!selectedUser) {

        showEmptyConversation();

        return;

    }

    if (!messages.length) {

        showEmptyConversation();

        return;

    }

    chatBox.innerHTML =
        buildConversation(messages);

    if (scroll) {

        scrollChatToBottom();

    }

}


/* ============================================================
   12. DISPLAY CHAT
   ============================================================ */

async function displayChat() {

    if (!selectedUser) {

        showEmptyConversation();

        return;

    }

    await preloadChats();

    refreshCurrentChat();

    await markConversationSeen();

}


/* ============================================================
   13. SEND MESSAGE
   ============================================================ */

/* ============================================================
   SEND MESSAGE
   ============================================================ */

async function sendMessage() {

    if (!currentUser) {
        alert("You are not logged in.");
        return;
    }

    if (!selectedUser) {
        alert("Select a user or student first.");
        return;
    }


    const input =
        document.getElementById("chatInput");

    const text =
        input?.value.trim() || "";

    const file =
        selectedMediaFile || null;


    // Nothing to send
    if (!text && !file) {
        return;
    }


    const sendBtn =
        document.querySelector(".send-btn");


    if (sendBtn) {
        sendBtn.disabled = true;
    }


    let uploadedPath = null;


    try {

        /* =====================================================
           1. UPLOAD MEDIA
           ===================================================== */

        let mediaUrl = null;


        if (file) {

            console.log(
                "Starting media upload:",
                file.name
            );


            const schoolId =
                currentUser.schoolid ||
                "school";


            const cleanName =
                file.name
                    .replace(/\s+/g, "_")
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        ""
                    );


            const fileName =
                `${Date.now()}_${crypto.randomUUID()}_${cleanName}`;


            uploadedPath =
                `${schoolId}/${fileName}`;


            console.log(
                "Uploading to:",
                uploadedPath
            );


            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("chat-media")
                    .upload(
                        uploadedPath,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false,
                            contentType:
                                file.type ||
                                "application/octet-stream"
                        }
                    );


            if (uploadError) {

                console.error(
                    "❌ STORAGE UPLOAD FAILED:",
                    uploadError
                );

                throw new Error(
                    uploadError.message
                );
            }


            console.log(
                "✅ STORAGE UPLOAD SUCCESS:",
                uploadData
            );


            /* =================================================
               2. GET PUBLIC URL
               ================================================= */

            const {
                data: urlData
            } =
                supabaseClient
                    .storage
                    .from("chat-media")
                    .getPublicUrl(
                        uploadedPath
                    );


            mediaUrl =
                urlData?.publicUrl;


            if (!mediaUrl) {

                throw new Error(
                    "Could not generate media URL."
                );

            }


            console.log(
                "✅ MEDIA URL:",
                mediaUrl
            );
        }


        /* =====================================================
           3. CREATE CHAT MESSAGE
           ===================================================== */

        const newMessage = {

            schoolid:
                currentUser.schoolid,

            from_user:
                currentUser.username,

            from_type:
                currentUser.role,

            to_user:
                selectedUser,

            to_type:
                selectedUserType,

            text:
                text || null,

            media:
                mediaUrl

        };


        console.log(
            "Saving chat message:",
            newMessage
        );


        /* =====================================================
           4. INSERT INTO CHATS
           ===================================================== */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("chats")
                .insert(newMessage)
                .select()
                .single();


        if (error) {

            console.error(
                "❌ CHAT INSERT FAILED:",
                error
            );


            // Remove uploaded file if DB insert failed
            if (uploadedPath) {

                await supabaseClient
                    .storage
                    .from("chat-media")
                    .remove([
                        uploadedPath
                    ]);

            }


            throw new Error(
                error.message
            );
        }


        console.log(
            "✅ MESSAGE SAVED:",
            data
        );


        /* =====================================================
           5. ADD TO LOCAL CACHE
           ===================================================== */

        if (data) {

            const exists =
                chatCache.some(
                    msg =>
                        String(msg.id) ===
                        String(data.id)
                );


            if (!exists) {

                chatCache.push(data);

            }
        }


        /* =====================================================
           6. CLEAR MESSAGE INPUT
           ===================================================== */

        if (input) {

            input.value = "";

        }


        /* =====================================================
           7. CLEAR ATTACHMENT
           ===================================================== */

        removePreview();


        /* =====================================================
           8. REFRESH CURRENT CHAT
           ===================================================== */

        refreshCurrentChat(false);


        /* =====================================================
           9. UPDATE USER LIST
           ===================================================== */

        displayUsers();


        console.log(
            "✅ MESSAGE SENT SUCCESSFULLY"
        );

    }

    catch (error) {

        console.error(
            "❌ SEND MESSAGE ERROR:",
            error
        );


        alert(
            "Failed to send message:\n\n" +
            error.message
        );

    }

    finally {

        if (sendBtn) {

            sendBtn.disabled = false;

        }

    }
}


/* ============================================================
   14. CREATE + SAVE MESSAGE
   ============================================================ */

async function createMessage(text, file = null) {

    const message = {

        schoolid: currentUser.schoolid,

        from_user: currentUser.username,
        from_type: currentUser.role,

        to_user: selectedUser,
        to_type: selectedUserType,

        text: text || "",

        type: file ? "media" : "text",

        media: null,
        mediatype: null,
        filename: null,

        time: Date.now()

    };

    // Convert media to Base64 if necessary
    if (file) {

        message.media =
            await readFileAsDataURL(file);

        message.mediatype =
            file.type;

        message.filename =
            file.name;

    }

    /*
       select().single() gives us the database-generated ID.
       This is useful for double-click/context-menu/delete.
    */

    const { data, error } =
        await supabaseClient
            .from("chats")
            .insert([message])
            .select()
            .single();

    if (error) {

        console.error(
            "Message insert error:",
            error
        );

        throw error;

    }

    return data || message;

}


/* ============================================================
   15. READ MEDIA FILE
   ============================================================ */

function readFileAsDataURL(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload =
            event => resolve(event.target.result);

        reader.onerror =
            error => reject(error);

        reader.readAsDataURL(file);

    });

}


/* ============================================================
   16. CLEAR MESSAGE INPUT
   ============================================================ */

function clearMessageInput() {

    const input =
        document.getElementById("chatInput");

    const mediaInput =
        document.getElementById("mediaInput");

    if (input) {

        input.value = "";

    }

    if (mediaInput) {

        mediaInput.value = "";

    }

    selectedMediaFile = null;

    hideMediaPreview();

}


/* ============================================================
   17. BUILD CONVERSATION
   ============================================================ */

function buildConversation(messages) {

    return messages
        .map(renderMessage)
        .join("");

}


/* ============================================================
   18. RENDER MESSAGE
   ============================================================ */

function renderMessage(msg) {

    const mine =
        String(msg.from_user) ===
            String(currentUser.username) &&

        String(msg.from_type) ===
            String(currentUser.role);

    let body = "";

    // DELETED
    if (msg.deleted) {

        body = `
            <div class="deleted-message">
                🚫 This message was deleted
            </div>
        `;

    } else {

        // TEXT
        if (msg.text) {

            body += `
                <div class="message-text">
                    ${escapeHTML(msg.text)}
                </div>
            `;

        }

        // IMAGE
        if (
            msg.media &&
            msg.mediatype?.startsWith("image/")
        ) {

            body += `
                <img
                    src="${escapeAttribute(msg.media)}"
                    class="chat-image"
                    alt="${escapeAttribute(msg.filename || "Image")}"
                >
            `;

        }

        // VIDEO
        else if (
            msg.media &&
            msg.mediatype?.startsWith("video/")
        ) {

            body += `
                <video
                    controls
                    class="chat-video"
                >
                    <source
                        src="${escapeAttribute(msg.media)}"
                        type="${escapeAttribute(msg.mediatype)}"
                    >
                </video>
            `;

        }

        // OTHER FILE
        else if (msg.media) {

            body += `
                <a
                    href="${escapeAttribute(msg.media)}"
                    download="${escapeAttribute(msg.filename || "file")}"
                    class="chat-file"
                >
                    📄 ${escapeHTML(msg.filename || "File")}
                </a>
            `;

        }

    }

    const id =
        msg.id ?? "";

    return `
        <div
            class="message ${mine ? "mine" : "theirs"}"
            ondblclick="selectMessage('${escapeJS(id)}')"
            oncontextmenu="
                showContextMenu(event,'${escapeJS(id)}');
                return false;
            "
        >

            <div class="bubble">

                ${body}

                <div class="message-time">

                    ${formatTime(msg.time)}

                    ${mine ? getTicks(msg) : ""}

                </div>

            </div>

        </div>
    `;

}


/* ============================================================
   19. MESSAGE STATUS / TICKS
   ============================================================ */

function getTicks(msg) {

    if (msg.seen) {

        return `
            <span style="color:#53bdeb">
                ✓✓
            </span>
        `;

    }

    if (msg.delivered) {

        return `
            <span style="color:#8696a0">
                ✓✓
            </span>
        `;

    }

    return `
        <span style="color:#8696a0">
            ✓
        </span>
    `;

}


/* ============================================================
   20. MARK CONVERSATION SEEN
   ============================================================ */

async function markConversationSeen() {

    if (!selectedUser || !currentUser) return;

    try {

        await Promise.all([

            supabaseClient
                .from("chats")
                .update({
                    delivered: true
                })
                .eq("schoolid", currentUser.schoolid)
                .eq("to_user", currentUser.username)
                .eq("from_user", selectedUser)
                .eq("to_type", currentUser.role)
                .eq("from_type", selectedUserType)
                .eq("delivered", false),

            supabaseClient
                .from("chats")
                .update({
                    seen: true
                })
                .eq("schoolid", currentUser.schoolid)
                .eq("to_user", currentUser.username)
                .eq("from_user", selectedUser)
                .eq("to_type", currentUser.role)
                .eq("from_type", selectedUserType)
                .eq("seen", false)

        ]);

        // Keep local cache status synchronized
        chatCache = chatCache.map(msg => {

            const isIncoming =
                String(msg.from_user) ===
                    String(selectedUser) &&

                String(msg.from_type) ===
                    String(selectedUserType) &&

                String(msg.to_user) ===
                    String(currentUser.username) &&

                String(msg.to_type) ===
                    String(currentUser.role);

            if (!isIncoming) return msg;

            return {
                ...msg,
                delivered: true,
                seen: true
            };

        });

        refreshCurrentChat(false);

    } catch (error) {

        console.error(
            "Failed to update message status:",
            error
        );

    }

}


/* ============================================================
   MEDIA PREVIEW
   ============================================================ */
/* ============================================================
   MEDIA PREVIEW
   ============================================================ */

function previewMedia(event) {

    const file = event.target.files?.[0];

    if (!file) return;

    console.log("Selected file:", file);


    // Store file for sendMessage()
    selectedMediaFile = file;


    // Existing HTML IDs
    const container =
        document.getElementById("previewContainer");

    const preview =
        document.getElementById("previewContent");


    if (!container || !preview) {

        console.error(
            "Media preview elements not found."
        );

        return;
    }


    // Remove previous preview URL
    if (window.currentMediaPreviewUrl) {

        URL.revokeObjectURL(
            window.currentMediaPreviewUrl
        );

    }


    // Create temporary browser URL
    const previewUrl =
        URL.createObjectURL(file);

    window.currentMediaPreviewUrl =
        previewUrl;


    let html = "";


    // ========================================================
    // IMAGE
    // ========================================================

    if (file.type.startsWith("image/")) {

        html = `
            <div class="media-preview-item">

                <img
                    src="${escapeAttribute(previewUrl)}"
                    alt="Selected image"
                    class="media-preview-image">

                <div class="media-preview-name">
                    ${escapeHTML(file.name)}
                </div>

            </div>
        `;
    }


    // ========================================================
    // VIDEO
    // ========================================================

    else if (file.type.startsWith("video/")) {

        html = `
            <div class="media-preview-item">

                <video
                    controls
                    class="media-preview-video">

                    <source
                        src="${escapeAttribute(previewUrl)}"
                        type="${escapeAttribute(file.type)}">

                </video>

                <div class="media-preview-name">
                    ${escapeHTML(file.name)}
                </div>

            </div>
        `;
    }


    // ========================================================
    // PDF
    // ========================================================

    else if (
        file.type === "application/pdf"
    ) {

        html = `
            <div class="media-preview-file">

                <i class="fas fa-file-pdf"></i>

                <span>
                    ${escapeHTML(file.name)}
                </span>

            </div>
        `;
    }


    // ========================================================
    // OTHER DOCUMENTS
    // ========================================================

    else {

        html = `
            <div class="media-preview-file">

                <i class="fas fa-file"></i>

                <span>
                    ${escapeHTML(file.name)}
                </span>

            </div>
        `;
    }


    // Put preview into existing container
    preview.innerHTML = html;

    container.style.display = "flex";


    console.log(
        "Media preview displayed successfully."
    );
}


function removePreview() {

    selectedMediaFile = null;


    const mediaInput =
        document.getElementById("mediaInput");

    if (mediaInput) {

        mediaInput.value = "";

    }


    if (window.currentMediaPreviewUrl) {

        URL.revokeObjectURL(
            window.currentMediaPreviewUrl
        );

        window.currentMediaPreviewUrl = null;

    }


    const container =
        document.getElementById("previewContainer");

    const preview =
        document.getElementById("previewContent");


    if (preview) {

        preview.innerHTML = "";

    }


    if (container) {

        container.style.display = "none";

    }

}

/* ============================================================
   HIDE MEDIA PREVIEW
   ============================================================ */

function hideMediaPreview() {

    const container =
        document.getElementById("mediaPreview");

    const preview =
        document.getElementById("previewContent");


    if (preview) {

        preview.innerHTML = "";

    }


    if (container) {

        container.style.display = "none";

        container.classList.remove("active");

    }
}


/* ============================================================
   22. MESSAGE SELECTION / CONTEXT MENU
   ============================================================ */

function selectMessage(messageId) {

    selectedMessageId = messageId;

    const menu =
        document.getElementById("messageActions");

    if (menu) {

        menu.style.display = "block";

    }

}


function showContextMenu(event, messageId) {

    event.preventDefault();

    selectedMessageId = messageId;

    const menu =
        document.getElementById("contextMenu");

    if (!menu) return;

    menu.style.left =
        `${event.pageX}px`;

    menu.style.top =
        `${event.pageY}px`;

    menu.style.display = "block";

}


function clearSelection() {

    selectedMessageId = null;

    const actions =
        document.getElementById("messageActions");

    const context =
        document.getElementById("contextMenu");

    if (actions) {

        actions.style.display = "none";

    }

    if (context) {

        context.style.display = "none";

    }

}


function closeChatMenus() {

    clearSelection();

}


/* ============================================================
   23. DELETE MESSAGE
   ============================================================ */

async function deleteSelectedMessage() {

    if (!selectedMessageId) return;

    if (!confirm("Delete this message?")) {

        return;

    }

    try {

        const {
            data: message,
            error: fetchError
        } = await supabaseClient
            .from("chats")
            .select("*")
            .eq("id", selectedMessageId)
            .single();

        if (fetchError) {

            throw fetchError;

        }

        // SECOND DELETE = PERMANENT
        if (message.deleted) {

            const { error } =
                await supabaseClient
                    .from("chats")
                    .delete()
                    .eq("id", selectedMessageId);

            if (error) throw error;

            chatCache =
                chatCache.filter(msg =>
                    String(msg.id) !==
                    String(selectedMessageId)
                );

        }

        // FIRST DELETE = SOFT DELETE
        else {

            const deletedData = {

                text: "This message was deleted.",

                media: null,

                filename: null,

                mediatype: null,

                deleted: true

            };

            const { error } =
                await supabaseClient
                    .from("chats")
                    .update(deletedData)
                    .eq("id", selectedMessageId);

            if (error) throw error;

            chatCache =
                chatCache.map(msg => {

                    if (
                        String(msg.id) !==
                        String(selectedMessageId)
                    ) {

                        return msg;

                    }

                    return {
                        ...msg,
                        ...deletedData
                    };

                });

        }

        clearSelection();

        refreshCurrentChat();

    } catch (error) {

        console.error(
            "Delete failed:",
            error
        );

        alert(
            "Unable to delete the message."
        );

    }

}


/* ============================================================
   24. ONLINE STATUS
   ============================================================ */

async function updateOnlineStatus() {

    if (!currentUser) return;

    const { error } =
        await supabaseClient
            .from("users")
            .update({
                lastSeen: Date.now()
            })
            .eq(
                "username",
                currentUser.username
            );

    if (error) {

        console.error(
            "Error updating online status:",
            error
        );

    }

}


/* ============================================================
   25. TYPING STATUS
   ============================================================ */

let typingTimeout = null;

async function setTypingStatus(isTyping) {

    if (!currentUser) return;

    const { error } =
        await supabaseClient
            .from("typing_status")
            .upsert({
                username: currentUser.username,
                is_typing: isTyping,
                updated_at: new Date()
            });

    if (error) {

        console.error(
            "Typing status error:",
            error
        );

    }

}


function handleTyping() {

    clearTimeout(typingTimeout);

    setTypingStatus(true);

    typingTimeout =
        setTimeout(() => {

            setTypingStatus(false);

        }, 1500);

}


/* ============================================================
   26. REALTIME CHAT UPDATE
   ============================================================ */

function handleRealtimeChat(payload) {

    const message = payload.new || payload.old;

    if (!message) return;

    console.log("REALTIME CHAT:", message);

    // ==========================================
    // SCHOOL CHECK
    // ==========================================

    if (
        currentUser &&
        message.schoolid &&
        String(message.schoolid) !==
        String(currentUser.schoolid)
    ) {
        return;
    }


    // ==========================================
    // INSERT
    // ==========================================

    if (payload.eventType === "INSERT") {

        // Prevent duplicate
        const exists = chatCache.some(msg =>
            String(msg.id) === String(message.id)
        );

        if (!exists) {
            chatCache.push(message);
        }


        // ======================================
        // IS THIS THE CURRENT CONVERSATION?
        // ======================================

        const isCurrentChat =
            isMessageInCurrentConversation(message);

        console.log("Current chat?", isCurrentChat);

        console.log("Current user:", {
            id: currentUser.username,
            type: currentUser.role
        });

        console.log("Selected user:", {
            id: selectedUser,
            type: selectedUserType
        });

        console.log("Message:", {
            from_user: message.from_user,
            from_type: message.from_type,
            to_user: message.to_user,
            to_type: message.to_type
        });


        if (isCurrentChat) {

            refreshCurrentChat();

        }


        // ======================================
        // UPDATE SIDEBAR
        // ======================================

        displayUsers();

        updateUnreadCounts();

        return;
    }


    // ==========================================
    // UPDATE
    // ==========================================

    if (payload.eventType === "UPDATE") {

        chatCache = chatCache.map(msg =>
            String(msg.id) === String(message.id)
                ? message
                : msg
        );

        if (
            isMessageInCurrentConversation(message)
        ) {

            refreshCurrentChat(false);

        }

        return;
    }


    // ==========================================
    // DELETE
    // ==========================================

    if (payload.eventType === "DELETE") {

        chatCache = chatCache.filter(msg =>
            String(msg.id) !== String(message.id)
        );

        refreshCurrentChat(false);

        displayUsers();

        return;
    }

}


function isMessageInCurrentConversation(message) {

    if (
        !message ||
        !currentUser ||
        !selectedUser
    ) {
        return false;
    }

    const myId =
        String(currentUser.username);

    const otherId =
        String(selectedUser);

    const from =
        String(message.from_user);

    const to =
        String(message.to_user);

    const sent =
        from === myId &&
        to === otherId;

    const received =
        from === otherId &&
        to === myId;

    console.log("CHAT MATCH:", {
        sent,
        received,
        from,
        to,
        myId,
        otherId
    });

    return sent || received;

}


/* ============================================================
   27. TYPING REALTIME
   ============================================================ */

function handleRealtimeTyping(payload) {

    if (!currentUser || !selectedUser) return;

    const typingUser =
        payload.new?.username;

    // Only respond when the selected person
    // is the one who is typing.
    if (
        String(typingUser) !==
        String(selectedUser)
    ) {
        return;
    }

    const indicator =
        document.getElementById("typingIndicator");

    if (!indicator) return;


    // ==========================================
    // FIND THE PERSON
    // ==========================================

    let person =
        getChatContact(
            selectedUser,
            selectedUserType
        );


    // If getChatContact() does not find the
    // person because of type differences,
    // search the users array directly.
    if (!person && typeof users !== "undefined") {

        person = users.find(user =>
            String(user.username) ===
            String(selectedUser)
        );

    }


    // ==========================================
    // GET NAME
    // ==========================================

    let name = "User";

    if (person) {

        name =
            `${person.firstname || ""} ${person.surname || ""}`
                .trim();

    }


    // ==========================================
    // SHOW / HIDE TYPING
    // ==========================================

    if (payload.new?.is_typing) {

        indicator.innerText =
            `${name} is typing...`;

        indicator.style.display = "block";

    } else {

        indicator.innerText = "";

        indicator.style.display = "none";

    }

}


/* ============================================================
   28. MOBILE CHAT
   ============================================================ */

function updateMobileChatView(openConversation) {

    const usersPanel =
        document.getElementById("usersPanel");

    const conversationPanel =
        document.getElementById("conversationPanel");

    if (!usersPanel || !conversationPanel) return;

    if (window.innerWidth <= 768) {

        if (openConversation) {

            usersPanel.style.display = "none";
            conversationPanel.style.display = "flex";

        } else {

            usersPanel.style.display = "block";
            conversationPanel.style.display = "none";

        }

    } else {

        usersPanel.style.display = "flex";
        conversationPanel.style.display = "flex";

    }

}


function setupMobileChat() {

    updateMobileChatView(false);

}


function backToUsers() {

    updateMobileChatView(false);

}


/* ============================================================
   29. CHAT UI HELPERS
   ============================================================ */

function scrollChatToBottom() {

    const chatBox =
        document.getElementById("chatBox");

    if (!chatBox) return;

    requestAnimationFrame(() => {

        chatBox.scrollTop =
            chatBox.scrollHeight;

    });

}


function showChatLoading() {

    const chatBox =
        document.getElementById("chatBox");

    if (!chatBox) return;

    chatBox.innerHTML = `
        <div class="chat-loading">
            Loading conversation...
        </div>
    `;

}


function showEmptyConversation() {

    const chatBox =
        document.getElementById("chatBox");

    if (!chatBox) return;

    chatBox.innerHTML = `
        <div class="empty-chat">
            No messages yet
        </div>
    `;

}


function showChatError() {

    const chatBox =
        document.getElementById("chatBox");

    if (!chatBox) return;

    chatBox.innerHTML = `
        <div class="empty-chat">
            Failed to load conversation.
        </div>
    `;

}


/* ============================================================
   30. GENERAL UTILITIES
   ============================================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


function escapeJS(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");

}


function formatTime(time) {

    return new Date(time)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

}


/* ============================================================
   31. UNREAD COUNTS
   ============================================================ */

function updateUnreadCounts() {

    if (!currentUser) return;

    const unread = {};

    (chatCache || []).forEach(message => {

        const isIncoming =
            String(message.to_user) ===
                String(currentUser.username) &&

            String(message.to_type) ===
                String(currentUser.role) &&

            !message.seen;

        if (!isIncoming) return;

        const key =
            `${message.from_type}_${message.from_user}`;

        unread[key] =
            (unread[key] || 0) + 1;

    });

    document
        .querySelectorAll("[id^='unread_']")
        .forEach(badge => {

            const id =
                badge.id.replace("unread_", "");

            const count =
                unread[`user_${id}`] ||
                unread[`student_${id}`] ||
                0;

            badge.innerText = count;

            badge.style.display =
                count > 0
                    ? "flex"
                    : "none";

        });

}


/* ============================================================
   32. REPLY / FORWARD
   ============================================================ */

function replyMessage() {

    alert(
        "Reply feature coming soon"
    );

}


function forwardMessage() {

    alert(
        "Forward feature coming soon"
    );

}


/* ============================================================
   33. EVENT LISTENERS
   ============================================================ */

const mediaInput =
    document.getElementById("mediaInput");

if (mediaInput) {

    mediaInput.addEventListener(
        "change",
        previewMedia
    );

}


const chatInput =
    document.getElementById("chatInput");

if (chatInput) {

    chatInput.addEventListener(
        "input",
        handleTyping
    );

}


/* ============================================================
   34. REALTIME CHANNELS
   ============================================================ */

/*
   CHAT REALTIME
   ------------------------------------------------------------
   IMPORTANT:
   We no longer call displayChat() every time Supabase
   sends an event.

   The realtime event updates chatCache instead.
*/

if (supabaseClient) {

    supabaseClient
        .channel("chat-room")

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "chats"
            },
            handleRealtimeChat
        )

        .subscribe();


    /*
       TYPING REALTIME
    */

    supabaseClient
        .channel("typing-status")

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "typing_status"
            },
            handleRealtimeTyping
        )

        .subscribe();

}


/* ============================================================
   35. INITIAL CHAT SETUP
   ============================================================ */

async function initializeChat() {

    try {

        await preloadChats();

        loadChatContacts();

        displayUsers();

        updateUnreadCounts();

        setupMobileChat();

    } catch (error) {

        console.error(
            "Chat initialization failed:",
            error
        );

    }

}


/* ============================================================
   END CHAT SYSTEM
   ============================================================ */


function openChatPage(){

   

    showPage("chat");

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel").style.display = "block";
        document.getElementById("conversationPanel").style.display = "none";
    }
}

function toggleAcademicsMenu(){

    let menu =
        document.getElementById("academicsMenu");

    if(menu.style.display === "block"){
        menu.style.display = "none";
    }else{
        menu.style.display = "block";
    }
}

function openAcademicPage(pageId){

    document.getElementById(
        "academicsMenu"
    ).style.display = "none";

    showPage(pageId);
}


document.addEventListener("click", function(e){

    let menu =
        document.getElementById("academicsMenu");

    if(
        !e.target.closest(".academics-menu") &&
        !e.target.closest(".nav-item")
    ){
        menu.style.display = "none";
    }

});


function toggleProfileMenu(){

    let menu =
        document.getElementById("profileMobileMenu");

    if(menu.style.display === "block"){

        menu.style.display = "none";

    }else{

        menu.style.display = "block";
    }
}


function toggleSchoolMenu(){

    let menu =
        document.getElementById("SchoolMenu");

    if(menu.style.display === "block"){

        menu.style.display = "none";

    }else{

        menu.style.display = "block";
    }
}

async function toggleTheme() {

    // Toggle theme visually
    document.body.classList.toggle(
        "light-mode"
    );

    let isLight =
        document.body.classList.contains(
            "light-mode"
        );

    let newTheme =
        isLight ? "light" : "dark";

    // Save theme online
    const { error } = await supabaseClient
        .from("users")
        .update({
            theme: newTheme
        })
        .eq("username", currentUser.username);

    if (error) {

        console.log(error);

        return alert(
            "Failed to save theme"
        );
    }

    // Update icon
    document.getElementById(
        "themeBtn"
    ).className =
        isLight
        ? "fas fa-sun"
        : "fas fa-moon";
}



function openWhatsApp() {
    window.open("https://wa.me/233599581301", "_blank");
}





function setupSchoolPages(){

    const role = currentUser?.role;

    const teacherHomework =
        document.getElementById("teacherHomeworkArea");

    const studentHomework =
        document.getElementById("studentHomeworkArea");

    const adminFees =
        document.getElementById("adminFeesArea");

    const studentFees =
        document.getElementById("studentFeesArea");

    const teacherNotice =
        document.getElementById("teacherNoticeArea");

    const studentNotice =
        document.getElementById("studentNoticeArea");


    // Hide everything first
    [
        teacherHomework,
        studentHomework,
        adminFees,
        studentFees,
        teacherNotice,
        studentNotice
    ].forEach(el => {

        if(el){
            el.style.display = "none";
        }

    });


    // ==============================
    // ADMIN / TEACHER
    // ==============================

    if(
        role === "admin" ||
        role === "teacher"
    ){

        if(teacherHomework)
            teacherHomework.style.display = "block";

        if(adminFees)
            adminFees.style.display = "block";

        if(teacherNotice)
            teacherNotice.style.display = "block";

    }

}




/* Show selected attachment name */
    const homeworkAttachmentInput =
        document.getElementById("homeworkAttachment");

    if (homeworkAttachmentInput) {

        homeworkAttachmentInput.addEventListener("change", function () {

            const file = this.files[0];

            const fileName =
                document.getElementById("homeworkFileName");

            if (!file) {

                fileName.style.display = "none";

                fileName.innerHTML = "";

                return;
            }

            fileName.style.display = "block";

            fileName.innerHTML = `
                <i class="fas fa-paperclip"></i>
                ${file.name}
            `;

        });

    }


    /* Clear homework form */
    function clearHomeworkForm() {

        const fields = [
            "homeworkClass",
            "homeworkSubject",
            "homeworkTitle",
            "homeworkDescription",
            "homeworkDate",
            "homeworkDeadline",
            "homeworkAttachment"
        ];

        fields.forEach(function(id) {

            const element =
                document.getElementById(id);

            if (!element) return;

            if (element.type === "file") {

                element.value = "";

            } else {

                element.value = "";

            }

        });


        const fileName =
            document.getElementById("homeworkFileName");

        if (fileName) {

            fileName.style.display = "none";

            fileName.innerHTML = "";

        }

    }
	
	
	
	
	
	/* =========================================================
   FEES MANAGEMENT
========================================================= */


/* ---------------------------------------------------------
   CALCULATE TOTAL FEE
--------------------------------------------------------- */

function calculateFeeTotal() {

    const tuition =
        parseFloat(
            document.getElementById("feeTuition")?.value
        ) || 0;

    const books =
        parseFloat(
            document.getElementById("feeBooks")?.value
        ) || 0;

    const ict =
        parseFloat(
            document.getElementById("feeICT")?.value
        ) || 0;

    const other =
        parseFloat(
            document.getElementById("feeOther")?.value
        ) || 0;


    const total =
        tuition +
        books +
        ict +
        other;


    const preview =
        document.getElementById("feeTotalPreview");


    if (preview) {

        preview.textContent =
            "GHS " +
            total.toLocaleString(
                "en-GH",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    return total;
}


/* ---------------------------------------------------------
   FEE INPUT LISTENERS
--------------------------------------------------------- */

function initFeeCalculations() {

    const fields = [
        "feeTuition",
        "feeBooks",
        "feeICT",
        "feeOther"
    ];


    fields.forEach(function(id) {

        const input =
            document.getElementById(id);

        if (!input) return;


        input.addEventListener(
            "input",
            calculateFeeTotal
        );

    });

}


/* ---------------------------------------------------------
   CLEAR FEE FORM
--------------------------------------------------------- */

function clearFeeForm() {

    const fields = [
        "feeStudent",
        "feeTerm",
        "feeDueDate",
        "feeTuition",
        "feeBooks",
        "feeICT",
        "feeOther",
        "feeNotes"
    ];


    fields.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (!element) return;


        if (id === "feeTerm") {

            element.value = "term1";

        } else {

            element.value = "";

        }

    });


    calculateFeeTotal();

}


/* ---------------------------------------------------------
   FORMAT GHANA CURRENCY
--------------------------------------------------------- */

function formatGHS(amount) {

    amount =
        parseFloat(amount) || 0;


    return (
        "GHS " +
        amount.toLocaleString(
            "en-GH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


/* ---------------------------------------------------------
   INITIALIZE FEES PAGE
--------------------------------------------------------- */

function initializeFeesPage() {

    initFeeCalculations();

    calculateFeeTotal();

}


/* ---------------------------------------------------------
   FEE PAGE INITIALIZATION
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeFeesPage();

    }
);
















/* =========================================================
   NOTICES MANAGEMENT
========================================================= */


/* ---------------------------------------------------------
   CHARACTER COUNTER
--------------------------------------------------------- */

function initNoticeCharacterCounter() {

    const message =
        document.getElementById("noticeMessage");

    const counter =
        document.getElementById("noticeCharacterCount");

    if (!message || !counter) return;


    function updateCounter() {

        counter.textContent =
            message.value.length;

    }


    message.addEventListener(
        "input",
        updateCounter
    );


    updateCounter();

}


/* ---------------------------------------------------------
   PRIORITY PREVIEW
--------------------------------------------------------- */

function initNoticePriorityPreview() {

    const priority =
        document.getElementById("noticePriority");

    const preview =
        document.getElementById("noticePriorityPreview");

    if (!priority || !preview) return;


    function updatePreview() {

        const value =
            priority.value || "normal";


        preview.className =
            "notice-priority-preview " + value;


        const icon =
            preview.querySelector(
                ".notice-preview-icon i"
            );

        const title =
            preview.querySelector(
                "strong"
            );

        const message =
            preview.querySelector(
                "p"
            );


        if (value === "urgent") {

            if (icon)
                icon.className =
                    "fas fa-triangle-exclamation";

            if (title)
                title.textContent =
                    "Urgent Notice";

            if (message)
                message.textContent =
                    "This announcement will be highlighted as an urgent school notice.";

        }

        else if (value === "important") {

            if (icon)
                icon.className =
                    "fas fa-exclamation";

            if (title)
                title.textContent =
                    "Important Notice";

            if (message)
                message.textContent =
                    "This announcement will be highlighted as an important school notice.";

        }

        else {

            if (icon)
                icon.className =
                    "fas fa-info";

            if (title)
                title.textContent =
                    "Normal Notice";

            if (message)
                message.textContent =
                    "This announcement will be displayed as a regular school notice.";

        }

    }


    priority.addEventListener(
        "change",
        updatePreview
    );


    updatePreview();

}


/* ---------------------------------------------------------
   CLEAR NOTICE FORM
--------------------------------------------------------- */

function clearNoticeForm() {

    const title =
        document.getElementById("noticeTitle");

    const message =
        document.getElementById("noticeMessage");

    const date =
        document.getElementById("noticeDate");

    const priority =
        document.getElementById("noticePriority");


    if (title)
        title.value = "";


    if (message)
        message.value = "";


    if (date)
        date.value = "";


    if (priority)
        priority.value = "normal";


    const counter =
        document.getElementById(
            "noticeCharacterCount"
        );


    if (counter)
        counter.textContent = "0";


    const event =
        new Event(
            "change",
            {
                bubbles: true
            }
        );


    if (priority)
        priority.dispatchEvent(event);

}


/* ---------------------------------------------------------
   FILTER PUBLISHED NOTICES
--------------------------------------------------------- */

function filterNotices() {

    const filter =
        document.getElementById(
            "noticeFilter"
        );


    if (!filter) return;


    const selected =
        filter.value;


    const cards =
        document.querySelectorAll(
            "#adminNoticeList .notice-card"
        );


    cards.forEach(function(card) {

        if (selected === "all") {

            card.style.display = "";

            return;

        }


        if (
            card.classList.contains(
                selected
            )
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


/* ---------------------------------------------------------
   NOTICE STATISTICS
--------------------------------------------------------- */

function updateNoticeStatistics() {

    const cards =
        document.querySelectorAll(
            "#adminNoticeList .notice-card"
        );


    let normal = 0;
    let important = 0;
    let urgent = 0;


    cards.forEach(function(card) {

        if (
            card.classList.contains(
                "normal"
            )
        ) {

            normal++;

        }


        if (
            card.classList.contains(
                "important"
            )
        ) {

            important++;

        }


        if (
            card.classList.contains(
                "urgent"
            )
        ) {

            urgent++;

        }

    });


    const total =
        normal +
        important +
        urgent;


    const totalElement =
        document.getElementById(
            "noticeTotalCount"
        );


    const normalElement =
        document.getElementById(
            "noticeNormalCount"
        );


    const importantElement =
        document.getElementById(
            "noticeImportantCount"
        );


    const urgentElement =
        document.getElementById(
            "noticeUrgentCount"
        );


    if (totalElement)
        totalElement.textContent = total;


    if (normalElement)
        normalElement.textContent = normal;


    if (importantElement)
        importantElement.textContent = important;


    if (urgentElement)
        urgentElement.textContent = urgent;

}



/* =========================================================
   PUBLISH NOTICE
========================================================= */

async function publishNotice() {

    const title =
        document.getElementById("noticeTitle")?.value.trim();

    const message =
        document.getElementById("noticeMessage")?.value.trim();

    const date =
        document.getElementById("noticeDate")?.value;

    const priority =
        document.getElementById("noticePriority")?.value ||
        "normal";


    /* ---------------------------------------------------------
       USER
    --------------------------------------------------------- */

    if (!currentUser) {

        alert(
            "Your session could not be found. Please log in again."
        );

        return;
    }


    const role =
        String(currentUser.role || "").toLowerCase();


    const schoolId =
        currentUser.schoolid ||
        currentUser.schoolId ||
        currentUser.schoolID;


    const teacherClass =
        currentUser.mainClass ||
        currentUser.mainclass ||
        "";


    /* ---------------------------------------------------------
       ADMIN RECIPIENT SELECTION
    --------------------------------------------------------- */

    let recipientType = "school";
    let recipientClass = null;


    if (role === "admin") {

        recipientType =
            document.getElementById(
                "noticeRecipientType"
            )?.value || "school";


        if (recipientType === "class") {

            recipientClass =
                document.getElementById(
                    "noticeRecipientClass"
                )?.value.trim();


            if (!recipientClass) {

                alert(
                    "Please select the class that should receive this notice."
                );

                return;
            }

        }

    }


    /* ---------------------------------------------------------
       TEACHER
    --------------------------------------------------------- */

    if (role === "teacher") {

        if (!teacherClass) {

            alert(
                "Your assigned class has not been set.\n\n" +
                "Please contact the administrator."
            );

            return;
        }


        recipientType =
            "teacher_class";


        recipientClass =
            teacherClass;

    }


    /* ---------------------------------------------------------
       VALIDATION
    --------------------------------------------------------- */

    if (!title) {

        alert(
            "Please enter the notice title."
        );

        return;
    }


    if (!message) {

        alert(
            "Please enter the notice message."
        );

        return;
    }


    if (!date) {

        alert(
            "Please select the notice date."
        );

        return;
    }


    if (!schoolId) {

        alert(
            "Your school ID could not be found."
        );

        return;
    }


    /* ---------------------------------------------------------
       CREATOR NAME
    --------------------------------------------------------- */

    const creatorName =

        [
            currentUser.firstname,
            currentUser.surname
        ]
        .filter(Boolean)
        .join(" ") ||

        currentUser.username ||

        "Unknown";


    /* ---------------------------------------------------------
       NOTICE DATA
    --------------------------------------------------------- */

    const noticeData = {

        schoolid: schoolId,

        title: title,

        message: message,

        date: date,

        priority: priority,

        createdby:
            currentUser.id ||
            currentUser.username ||
            "",

        createdbyname:
            creatorName,

        senderrole:
            role,

        recipienttype:
            recipientType,

        recipientclass:
            recipientClass

    };


    console.log(
        "Publishing notice:",
        noticeData
    );


    /* ---------------------------------------------------------
       BUTTON
    --------------------------------------------------------- */

    const button =
        document.querySelector(
            ".notice-publish-btn"
        );


    const originalHTML =
        button?.innerHTML || "";


    if (button) {

        button.disabled = true;

        button.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Publishing...';

    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("notices")

            .insert([
                noticeData
            ])

            .select();


        if (error) {

            console.error(
                "Notice publish error:",
                error
            );


            alert(
                "Notice could not be published.\n\n" +
                error.message
            );

            return;
        }


        console.log(
            "Notice published:",
            data
        );


        /* -----------------------------------------------------
           CLEAR FORM
        ----------------------------------------------------- */

        document.getElementById(
            "noticeTitle"
        ).value = "";


        document.getElementById(
            "noticeMessage"
        ).value = "";


        document.getElementById(
            "noticeDate"
        ).value = "";


        document.getElementById(
            "noticePriority"
        ).value = "normal";


        /* -----------------------------------------------------
           RELOAD
        ----------------------------------------------------- */

        await loadNotices();


        alert(
            "Notice published successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Publish notice error:",
            error
        );


        alert(
            "Something went wrong.\n\n" +
            error.message
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                originalHTML ||
                '<i class="fas fa-bullhorn"></i> Publish Notice';

        }

    }

}


/* =========================================================
   CLEAR NOTICE FORM
========================================================= */

function clearNoticeForm() {

    const title =
        document.getElementById("noticeTitle");

    const message =
        document.getElementById("noticeMessage");

    const date =
        document.getElementById("noticeDate");

    const priority =
        document.getElementById("noticePriority");


    if (title) {
        title.value = "";
    }

    if (message) {
        message.value = "";
    }

    if (date) {
        date.value = "";
    }

    if (priority) {
        priority.value = "normal";
    }

}

/* =========================================================
   LOAD NOTICES
========================================================= */

/* =========================================================
   LOAD ALL NOTICES FROM SUPABASE
========================================================= */

/* =========================================================
   LOAD ALL NOTICES
========================================================= */

async function loadNotices() {

    const list =
        document.getElementById("adminNoticeList");

    if (!list) return;


    /* ---------------------------------------------------------
       CHECK SUPABASE CLIENT
    --------------------------------------------------------- */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "supabaseClient is not available."
        );

        list.innerHTML = `
            <div class="notices-empty-state">

                <div class="notices-empty-icon">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>

                <h3>Database Connection Error</h3>

                <p>
                    Supabase client is not available.
                </p>

            </div>
        `;

        return;
    }


    /* ---------------------------------------------------------
       CHECK CURRENT USER
    --------------------------------------------------------- */

    if (!currentUser) {

        console.error(
            "currentUser is not available."
        );

        list.innerHTML = `
            <div class="notices-empty-state">

                <div class="notices-empty-icon">
                    <i class="fas fa-user-lock"></i>
                </div>

                <h3>Session Not Found</h3>

                <p>
                    Please log in again to view notices.
                </p>

            </div>
        `;

        return;
    }


    /* ---------------------------------------------------------
       USER INFORMATION
    --------------------------------------------------------- */

    const role =
        String(
            currentUser.role || ""
        ).toLowerCase();


    const schoolid =
        currentUser.schoolid ||
        currentUser.schoolid ||
        currentUser.schoolID;


    /*
     * Teacher assigned class
     */
    const teacherClass =
        currentUser.mainClass ||
        currentUser.mainclass ||
        currentUser.class ||
        "";


    /*
     * Student assigned class
     *
     * We support the common class fields already used
     * by your application.
     */
    const studentClass =
        currentUser.studentclass ||
        currentUser.studentClass ||
        currentUser.class ||
        currentUser.mainClass ||
        "";


    const userId =
        currentUser.id ||
        currentUser.userId ||
        currentUser.userid ||
        currentUser.uid ||
        "";


    console.log(
        "NOTICE USER:",
        {
            role,
            schoolid,
            teacherClass,
            studentClass,
            userId
        }
    );


    /* ---------------------------------------------------------
       SCHOOL ID REQUIRED
    --------------------------------------------------------- */

    if (!schoolid) {

        console.error(
            "No school ID found for current user."
        );

        list.innerHTML = `
            <div class="notices-empty-state">

                <div class="notices-empty-icon">
                    <i class="fas fa-school"></i>
                </div>

                <h3>School Not Found</h3>

                <p>
                    Your school information could not be found.
                </p>

            </div>
        `;

        return;
    }


    /* ---------------------------------------------------------
       LOADING
    --------------------------------------------------------- */

    list.innerHTML = `
        <div class="notices-empty-state">

            <div class="notices-empty-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>

            <h3>Loading Notices...</h3>

            <p>
                Please wait while notices are loaded.
            </p>

        </div>
    `;


    try {

        /* =====================================================
           BUILD BASE QUERY
        ===================================================== */

        let query =
            supabaseClient
                .from("notices")
                .select("*")
                .eq("schoolid", schoolid);


        /* =====================================================
           ADMIN
           
           ADMIN CAN SEE EVERYTHING IN THE SCHOOL
        ===================================================== */

        if (role === "admin") {

            console.log(
                "Notice access: ADMIN - all school notices"
            );

        }


        /* =====================================================
           TEACHER
           
           Teacher sees:
           
           1. Notices sent to everyone
           2. Notices sent to their assigned class
           3. Their own notices
        ===================================================== */

        else if (role === "teacher") {

            if (!teacherClass) {

                console.warn(
                    "Teacher has no assigned class."
                );

            }


            /*
             * We fetch the school's notices first and then
             * apply the visibility rules below.
             *
             * This avoids complicated Supabase OR syntax
             * and makes the rules easier to maintain.
             */

            console.log(
                "Notice access: TEACHER",
                {
                    teacherClass,
                    userId
                }
            );

        }


        /* =====================================================
           STUDENT
           
           Student sees:
           
           1. School-wide notices
           2. Notices for their class
           3. Teacher notices for their class
        ===================================================== */

        else {

            console.log(
                "Notice access: STUDENT",
                {
                    studentClass
                }
            );

        }


        /* -----------------------------------------------------
           LOAD NOTICES
        ----------------------------------------------------- */

        const {
            data,
            error
        } = await query
            .order("date", {
                ascending: false
            });


        /* -----------------------------------------------------
           ERROR
        ----------------------------------------------------- */

        if (error) {

            console.error(
                "Load notices error:",
                error
            );

            list.innerHTML = `
                <div class="notices-empty-state">

                    <div class="notices-empty-icon">
                        <i class="fas fa-triangle-exclamation"></i>
                    </div>

                    <h3>Unable to Load Notices</h3>

                    <p>
                        ${escapeNoticeHTML(
                            error.message
                        )}
                    </p>

                </div>
            `;

            return;
        }


        /* =====================================================
           APPLY VISIBILITY RULES
        ===================================================== */

        let visibleNotices = [];


        /* -----------------------------------------------------
           ADMIN
           
           ADMIN SEES EVERYTHING
        ----------------------------------------------------- */

        if (role === "admin") {

            visibleNotices =
                data || [];

        }


        /* -----------------------------------------------------
           TEACHER
        ----------------------------------------------------- */

        else if (role === "teacher") {

            visibleNotices =
                (data || []).filter(
                    notice => {

                        const recipientType =
                            String(
                                notice.recipienttype ||
                                notice.recipientType ||
                                "school"
                            ).toLowerCase();


                        const recipientClass =
                            String(
                                notice.recipientclass ||
                                notice.recipientClass ||
                                ""
                            ).trim();


                        const createdBy =
                            String(
                                notice.createdby ||
                                notice.createdBy ||
                                ""
                            );


                        /* -----------------------------
                           SCHOOL-WIDE
                        ----------------------------- */

                        if (
                            recipientType ===
                            "school"
                        ) {

                            return true;

                        }


                        /* -----------------------------
                           TEACHER'S CLASS
                        ----------------------------- */

                        if (
                            recipientType ===
                                "class" ||

                            recipientType ===
                                "teacher_class"
                        ) {

                            return (
                                recipientClass &&
                                teacherClass &&
                                recipientClass
                                    .toLowerCase() ===
                                teacherClass
                                    .toLowerCase()
                            );

                        }


                        /* -----------------------------
                           TEACHER'S OWN NOTICE
                        ----------------------------- */

                        if (
                            userId &&
                            createdBy === userId
                        ) {

                            return true;

                        }


                        return false;

                    }
                );

        }


        /* -----------------------------------------------------
           STUDENT
        ----------------------------------------------------- */

        else {

            visibleNotices =
                (data || []).filter(
                    notice => {

                        const recipientType =
                            String(
                                notice.recipienttype ||
                                notice.recipientType ||
                                "school"
                            ).toLowerCase();


                        const recipientClass =
                            String(
                                notice.recipientclass ||
                                notice.recipientClass ||
                                ""
                            ).trim();


                        /* -----------------------------
                           SCHOOL-WIDE NOTICE
                        ----------------------------- */

                        if (
                            recipientType ===
                            "school"
                        ) {

                            return true;

                        }


                        /* -----------------------------
                           CLASS NOTICE
                        ----------------------------- */

                        if (
                            recipientType ===
                                "class" ||

                            recipientType ===
                                "teacher_class"
                        ) {

                            return (
                                recipientClass &&
                                studentClass &&
                                recipientClass
                                    .toLowerCase() ===
                                studentClass
                                    .toLowerCase()
                            );

                        }


                        return false;

                    }
                );

        }


        /* -----------------------------------------------------
           NO DATA AFTER FILTER
        ----------------------------------------------------- */

        if (
            !visibleNotices ||
            visibleNotices.length === 0
        ) {

            list.innerHTML = `
                <div class="notices-empty-state">

                    <div class="notices-empty-icon">
                        <i class="fas fa-bullhorn"></i>
                    </div>

                    <h3>No Notices Available</h3>

                    <p>
                        There are currently no notices
                        available for you.
                    </p>

                </div>
            `;


            if (
                typeof updateNoticeStatistics ===
                "function"
            ) {

                updateNoticeStatistics();

            }

            return;
        }


        /* -----------------------------------------------------
           DISPLAY NOTICES
        ----------------------------------------------------- */

        console.log(
            "All notices:",
            data?.length || 0
        );


        console.log(
            "Visible notices:",
            visibleNotices.length
        );


        list.innerHTML =
            visibleNotices
                .map(
                    notice =>
                        createNoticeCard(notice)
                )
                .join("");


        /* -----------------------------------------------------
           STATISTICS
        ----------------------------------------------------- */

        if (
            typeof updateNoticeStatistics ===
            "function"
        ) {

            updateNoticeStatistics();

        }


        /* -----------------------------------------------------
           FILTER
        ----------------------------------------------------- */

        if (
            typeof filterNotices ===
            "function"
        ) {

            filterNotices();

        }


    } catch (error) {

        console.error(
            "Notice loading error:",
            error
        );


        list.innerHTML = `
            <div class="notices-empty-state">

                <div class="notices-empty-icon">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>

                <h3>Something Went Wrong</h3>

                <p>
                    ${escapeNoticeHTML(
                        error.message ||
                        "Unable to load notices."
                    )}
                </p>

            </div>
        `;

    }

}



function setupNoticeRecipientForUser() {

    const section =
        document.getElementById(
            "noticeRecipientSection"
        );

    const type =
        document.getElementById(
            "noticeRecipientType"
        );

    const classWrapper =
        document.getElementById(
            "noticeClassWrapper"
        );

    const classSelect =
        document.getElementById(
            "noticeRecipientClass"
        );

    const preview =
        document.getElementById(
            "noticeRecipientPreview"
        );


    if (!section || !currentUser) return;


    const role =
        String(
            currentUser.role || ""
        ).toLowerCase();


    /* =====================================================
       ADMIN
    ===================================================== */

    if (role === "admin") {

        section.style.display = "block";

        if (type) {

            type.disabled = false;

            type.value = "school";

        }

        if (classWrapper) {

            classWrapper.style.display =
                "none";

        }

        if (preview) {

            preview.innerHTML = `

                <i class="fas fa-users"></i>

                <span>
                    This notice will be sent to
                    <strong>everyone</strong>
                    in the school.
                </span>

            `;

        }

        return;
    }


    /* =====================================================
       TEACHER
    ===================================================== */

    if (role === "teacher") {

        section.style.display = "block";


        if (type) {

            type.value = "class";

            type.disabled = true;

        }


        if (classWrapper) {

            classWrapper.style.display =
                "block";

        }


        const teacherClass =
            currentUser.mainClass ||
            currentUser.mainclass ||
            "";


        if (classSelect) {

            classSelect.innerHTML = `

                <option value="${escapeNoticeHTML(teacherClass)}">

                    ${escapeNoticeHTML(
                        teacherClass ||
                        "No Class Assigned"
                    )}

                </option>

            `;

            classSelect.value =
                teacherClass;

            classSelect.disabled = true;

        }


        if (preview) {

            preview.innerHTML = `

                <i class="fas fa-lock"></i>

                <span>
                    This notice will be sent only to
                    <strong>
                        ${escapeNoticeHTML(
                            teacherClass ||
                            "your assigned class"
                        )}
                    </strong>
                    students.
                </span>

            `;

        }

        return;
    }


    /* =====================================================
       OTHER USERS
    ===================================================== */

    section.style.display = "none";

}

/* =========================================================
   CREATE NOTICE CARD
========================================================= */

function createNoticeCard(notice) {

    const priority =
        String(notice.priority || "normal").toLowerCase();


    /* ---------------------------------------------------------
       PRIORITY SETTINGS
    --------------------------------------------------------- */

    const priorityConfig = {

        normal: {
            label: "Normal",
            icon: "fas fa-info-circle"
        },

        important: {
            label: "Important",
            icon: "fas fa-exclamation-circle"
        },

        urgent: {
            label: "Urgent",
            icon: "fas fa-triangle-exclamation"
        }

    };


    const config =
        priorityConfig[priority] ||
        priorityConfig.normal;


    /* ---------------------------------------------------------
       DATE
    --------------------------------------------------------- */

    const formattedDate =
        formatNoticeDate(
            notice.date
        );


    /* ---------------------------------------------------------
       CREATED DATE
    --------------------------------------------------------- */

    let createdDate = "";


    if (notice.createdAt) {

        createdDate =
            formatNoticeDateTime(
                notice.createdAt
            );

    }


    /* ---------------------------------------------------------
       NOTICE ID
    --------------------------------------------------------- */

    const noticeId =
        notice.id || "";


    /* ---------------------------------------------------------
       TITLE
    --------------------------------------------------------- */

    const title =
        notice.title ||
        "Untitled Notice";


    /* ---------------------------------------------------------
       MESSAGE
    --------------------------------------------------------- */

    const message =
        notice.message ||
        "No message provided.";


    /* ---------------------------------------------------------
       CHECK ADMIN
    --------------------------------------------------------- */

    const isAdmin =
        currentUser &&
        String(currentUser.role).toLowerCase() === "admin";


    /* ---------------------------------------------------------
       RETURN CARD
    --------------------------------------------------------- */

    return `

        <article
            class="notice-card ${priority}"
            data-notice-id="${escapeNoticeHTML(noticeId)}"
            data-priority="${escapeNoticeHTML(priority)}"
        >

            <!-- ==============================================
                 CARD HEADER
            =============================================== -->

            <div class="notice-card-top">

                <div class="notice-card-title">

                    <div
                        class="notice-card-icon ${priority}"
                        title="${config.label}"
                    >

                        <i class="${config.icon}"></i>

                    </div>


                    <div class="notice-card-heading">

                        <h3>
                            ${escapeNoticeHTML(title)}
                        </h3>


                        <div class="notice-card-meta">

                            <span>

                                <i class="fas fa-calendar-days"></i>

                                ${escapeNoticeHTML(
                                    formattedDate
                                )}

                            </span>


                            ${
                                createdDate
                                    ? `
                                        <span>
                                            <i class="fas fa-clock"></i>
                                            ${escapeNoticeHTML(
                                                createdDate
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    </div>

                </div>


                <!-- PRIORITY -->

                <span
                    class="
                        notice-priority-badge
                        ${priority}
                    "
                >

                    <i class="${config.icon}"></i>

                    ${config.label}

                </span>

            </div>


            <!-- ==============================================
                 MESSAGE
            =============================================== -->

            <div class="notice-card-message">

                ${escapeNoticeHTML(message)}

            </div>


            <!-- ==============================================
                 FOOTER
            =============================================== -->

            <div class="notice-card-footer">

                <div class="notice-published-info">

                    <i class="fas fa-bullhorn"></i>

                    <span>
                        School Announcement
                    </span>

                </div>


                <div class="notice-footer-actions">

                    ${
                        notice.createdBy
                            ? `
                                <div class="notice-created-by">

                                    <i class="fas fa-user"></i>

                                    ${escapeNoticeHTML(
                                        notice.createdBy
                                    )}

                                </div>
                              `
                            : ""
                    }


                    ${
                        isAdmin
                            ? `
                                <button
                                    type="button"
                                    class="notice-delete-btn"
                                    onclick="deleteNotice('${noticeId}')"
                                    title="Delete Notice"
                                >

                                    <i class="fas fa-trash"></i>

                                    Delete

                                </button>
                              `
                            : ""
                    }

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   DELETE NOTICE
========================================================= */


async function deleteNotice(noticeId) {

    if (!noticeId) {

        alert("Unable to identify this notice.");

        return;

    }


    /* CHECK ADMIN */

    if (
        !currentUser ||
        String(currentUser.role).toLowerCase() !== "admin"
    ) {

        alert(
            "Only the administrator can delete notices."
        );

        return;

    }


    /* CONFIRM DELETE */

    const confirmed = confirm(

        "Are you sure you want to delete this notice?\n\n" +
        "This action cannot be undone."

    );


    if (!confirmed) return;


    try {

        const {

            error

        } = await supabaseClient

            .from("notices")

            .delete()

            .eq("id", noticeId);


        if (error) {

            console.error(
                "Delete notice error:",
                error
            );


            alert(

                "Failed to delete notice.\n\n" +
                error.message

            );

            return;

        }


        /* RELOAD NOTICES */

        await loadNotices();


        alert(
            "Notice deleted successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Delete notice JavaScript error:",
            error
        );


        alert(

            "Something went wrong while deleting the notice.\n\n" +
            error.message

        );

    }

}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatNoticeDate(dateString) {

    if (!dateString) {
        return "No date";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}



/* =========================================================
   FORMAT NOTICE DATE & TIME
========================================================= */

function formatNoticeDateTime(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {
        return "";
    }


    return date.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",

            hour12: true
        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeNoticeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
/* ---------------------------------------------------------
   INITIALIZE NOTICES PAGE
--------------------------------------------------------- */

function initializeNoticesPage() {

    initNoticeCharacterCounter();

    initNoticePriorityPreview();

    initializeNoticeRecipient();



    const filter =
        document.getElementById(
            "noticeFilter"
        );


    if (filter) {

        filter.addEventListener(
            "change",
            filterNotices
        );

    }


    updateNoticeStatistics();

}


/* ---------------------------------------------------------
   PAGE LOAD
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeNoticesPage();

    }
);



/* =========================================================
   NOTICE RECIPIENT SYSTEM
========================================================= */

function initializeNoticeRecipient() {

    const recipientType =
        document.getElementById(
            "noticeRecipientType"
        );

    const classWrapper =
        document.getElementById(
            "noticeClassWrapper"
        );

    const classSelect =
        document.getElementById(
            "noticeRecipientClass"
        );

    const recipientPreview =
        document.getElementById(
            "noticeRecipientPreview"
        );


    if (!recipientType) return;


    recipientType.addEventListener(
        "change",
        async function () {

            if (
                this.value ===
                "class"
            ) {

                classWrapper.style.display =
                    "block";

                await loadNoticeClasses();

            } else {

                classWrapper.style.display =
                    "none";

                if (classSelect) {

                    classSelect.value = "";

                }

            }


            updateNoticeRecipientPreview();

        }
    );


    if (classSelect) {

        classSelect.addEventListener(
            "change",
            updateNoticeRecipientPreview
        );

    }


    updateNoticeRecipientPreview();

}


/* =========================================================
   LOAD SCHOOL CLASSES
========================================================= */

async function loadNoticeClasses() {

    const select =
        document.getElementById(
            "noticeRecipientClass"
        );


    if (!select) return;


    const schoolId =
        currentUser?.schoolid ||
        currentUser?.schoolId;


    if (!schoolId) {

        select.innerHTML = `
            <option value="">
                School not found
            </option>
        `;

        return;

    }


    select.innerHTML = `
        <option value="">
            Loading classes...
        </option>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("classes")

            .select("*")

            .eq(
                "schoolid",
                schoolId
            );


        if (error) {

            console.error(
                "Unable to load notice classes:",
                error
            );

            select.innerHTML = `
                <option value="">
                    Unable to load classes
                </option>
            `;

            return;

        }


        select.innerHTML = `
            <option value="">
                Select Class
            </option>
        `;


        /*
         * Support different class-name fields
         * used in your existing database.
         */

        const classes =
            data || [];


        classes.forEach(cls => {

            const className =
                cls.classname ||
                cls.className ||
                cls.name ||
                cls.class;


            if (!className) return;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                className;

            option.textContent =
                className;


            select.appendChild(
                option
            );

        });


    } catch (error) {

        console.error(
            "Notice class error:",
            error
        );

    }

}


/* =========================================================
   RECIPIENT PREVIEW
========================================================= */

function updateNoticeRecipientPreview() {

    const type =
        document.getElementById(
            "noticeRecipientType"
        )?.value;


    const className =
        document.getElementById(
            "noticeRecipientClass"
        )?.value;


    const preview =
        document.getElementById(
            "noticeRecipientPreview"
        );


    if (!preview) return;


    if (
        type === "class" &&
        className
    ) {

        preview.innerHTML = `

            <i class="fas fa-graduation-cap"></i>

            <span>
                This notice will be sent to
                <strong>
                    ${escapeNoticeText(className)}
                </strong>
                students only.
            </span>

        `;

        return;

    }


    if (type === "class") {

        preview.innerHTML = `

            <i class="fas fa-graduation-cap"></i>

            <span>
                Select a class to target this notice.
            </span>

        `;

        return;

    }


    preview.innerHTML = `

        <i class="fas fa-users"></i>

        <span>
            This notice will be sent to all students.
        </span>

    `;

}


/* =========================================================
   ESCAPE
========================================================= */

function escapeNoticeText(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;

}

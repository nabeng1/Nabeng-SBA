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
let selectedUser = null;
let selectedMediaFile = null;
let filteredStudents = [];
let gradeChartInstance = null;
let topChartInstance = null;
let subjectChartInstance = null;
let passChartInstance = null;
let selectedMessageId = null;


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
    const { data, error } =
    await supabaseClient
        .from("users")
        .select("*");

    if (error) {
        console.error("Error loading users:", error);
        return [];
    }

    return data;
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
    await loadStudents();
    updateDashboard();
    populateStudentList();
    showPage("dashboardPage");
    loadLogo();
	await displaySchoolName();
    await loadTheme();
    await loadTermSettings();
    updateOnlineStatus();
	
	
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

console.log("School Data:", data);
console.log("School Error:", error);

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

    let theme = data?.theme || "dark";

    if (theme === "light") {

        document.body.classList.add("light-mode");

        document.getElementById("themeBtn").innerText = "☀️";

    } else {

        document.body.classList.remove("light-mode");

        document.getElementById("themeBtn").innerText = "🌙";
    }
}
function showForgot(){
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("forgotSection").style.display = "block";
}


async function resetPassword() {

    let u =
        document.getElementById("fpUsername")
        .value.trim();

    let contact =
        document.getElementById("fpContact")
        .value.trim();

    let newPass =
        document.getElementById("newPassword")
        .value.trim();

    if (!u || !contact || !newPass) {
        return alert("Fill all fields");
    }

    // Find matching user
    const { data: user, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", u)
        .or(`email.eq.${contact},phone.eq.${contact}`)
        .single();

    if (error || !user) {

        return alert(
            "User not found or incorrect details"
        );
    }

    // Update password
const { error: updateError } =
await supabaseClient.auth.updateUser({
    password: newPass
});

    if (updateError) {

        console.log(updateError);

        return alert(
            "Failed to reset password"
        );
    }

    alert("Password reset successful!");

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

		console.log(data);
		console.log(error);
        if (error) throw error;

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
	updateStudentSuggestions();
}

async function saveStudents() {

    if (!students || students.length === 0) {
        return;
    }

    // Add schoolid to every student
    let preparedStudents = students.map(s => ({
        ...s,
        schoolid: currentUser.schoolid,
        teacher:
            currentUser.role === "admin"
            ? s.teacher || null
            : currentUser.username
    }));

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

        loadAttendanceTable();
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

    // SUBJECTS PAGE
    if(id === "subjectsPage"){

        loadClassFilter();

        let studentsList =
        document.getElementById("studentsList");

        if(studentsList){
            studentsList.innerHTML = "";
        }

        let btn =
        document.getElementById("saveMarksBtn");

        if(btn){

            if(currentUser.role === "admin"){

                btn.disabled = true;
                btn.style.background = "#374151";
                btn.innerText =
                "🔒 Admin cannot edit";

            } else {

                btn.disabled = false;
                btn.style.background = "#2563eb";
                btn.innerText = "Save Marks";
            }
        }
    }

    // CHAT
    if(id === 'chat'){

        let chat =
        document.getElementById('chat');

        if(chat){
            chat.style.display = 'block';
        }

        displayUsers();
        displayChat();

    } else {

        let chat =
        document.getElementById('chat');

        if(chat){
            chat.style.display = 'none';
        }
    }
}

function updateDashboard(){

    totalStudents.innerText = students.length;

    if(students.length === 0) return;

    let averages = students.map(s => s.average || 0);

    let highest = Math.max(...averages);
    let avg = averages.reduce((a,b)=>a+b,0)/students.length;

    let pass = averages.filter(x => x >= 50).length;
    let passRate = (pass / students.length) * 100;

    document.getElementById("highestScore").innerText =
        highest.toFixed(1) + "%";

    document.getElementById("avgScore").innerText =
        avg.toFixed(1) + "%";

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

function handleCSV(event){
    let file = event.target.files[0];
    if(!file) return;

    let reader = new FileReader();

    reader.onload = function(e){
        let text = e.target.result;
        let lines = text.split("\n");

        let headers = lines[0].split(",").map(h => h.trim().toLowerCase());

        lines.slice(1).forEach(line=>{
            if(!line.trim()) return;

            let values = line.split(",");


            let rawGender = values[2]?.trim().toLowerCase();

let gender = "Male"; // default

if(rawGender === "female" || rawGender === "f"){
    gender = "Female";
}

let student = {
    name: values[0]?.trim(),
    class: values[1]?.trim(),
    gender: (values[2]?.trim() || "Male"), // ✅ NEW
    subjects: {},
    currentTerm: "term1",
    teacher: currentUser.username
};

            subjects.forEach(sub=>{
                student.subjects[sub] = {};
                student.subjects[sub]["term1"] = {
                    test1: 0,
                    test2: 0,
                    project: 0,
                    group: 0,
                    exam: 0
                };
            });

            headers.forEach((header, i)=>{
                let val = +values[i] || 0;

                subjects.forEach(sub=>{
                    if(header === sub + "_t1") student.subjects[sub]["term1"].test1 = val;
                    if(header === sub + "_t2") student.subjects[sub]["term1"].test2 = val;
                    if(header === sub + "_project") student.subjects[sub]["term1"].project = val;
                    if(header === sub + "_group") student.subjects[sub]["term1"].group = val;
                    if(header === sub + "_exam") student.subjects[sub]["term1"].exam = val;
                });
            });

if(!student.name || !student.class){
    return; // skip bad rows
}
            students.push(student);
        });
		
        saveStudents();
        populateStudentList();
        updateDashboard();
		

        alert("✅ Students + Marks Imported Successfully!");
    };

    reader.readAsText(file);
}
function populateStudentList(){

   

    let html = students.map((s,i)=>
    `<div class="card ${i === currentStudentIndex ? 'active-student' : ''}"
        onclick="selectStudent(${i})">
        ${s.name}
    </div>`
    ).join('');

    studentsList.innerHTML = html;
}


function editStudent(index){

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

    saveStudents();

    loadStudentsTable();
    populateStudentList();
    updateDashboard();

    alert("Student updated successfully");
}

function deleteStudent(index){

    if(currentUser.role === "admin"){
        return alert("❌ Admin cannot delete students");
    }

    students.splice(index,1);

    saveStudents();
    loadStudentsTable();
    populateStudentList();
    updateDashboard();
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
                    onclick="deleteStudent(${realIndex})"
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
) {

    // SAVE TO SUPABASE
    const { error } =
        await supabaseClient
            .from("attendance")
            .upsert([
                {
                    schoolid:
                        currentUser.schoolid,

                    class:
                        currentUser.mainClass,

                    date:
                        date,

                    studentname:
                        studentname,

                    status:
                        status,

                    teacher:
                        currentUser.username
                }
            ]);

    if (error) {

        console.log(error);

        return alert(
            "Failed to save attendance"
        );
    }

    // LOCAL UPDATE
    if (!attendanceData[date]) {

        attendanceData[date] = {};
    }

    attendanceData[date][studentname] =
        status;

    loadAttendanceTable();
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


function openStudentModal(index){

    let student = students[index];

    if(!student){
        alert("Student not found");
        return;
    }

    let modal = document.getElementById("studentModal");
    let content = document.getElementById("studentModalContent");

    if(!modal || !content){
        alert("Student modal HTML is missing");
        return;
    }

    content.innerHTML = `
        <h2>${student.name}</h2>

        <p><strong>Class:</strong> ${student.studentclass}</p>

        <p><strong>Gender:</strong> ${student.gender || "Not Set"}</p>

        <button onclick="closeStudentModal()">
            Close
        </button>
    `;

    modal.style.display = "flex";
}

function closeStudentModal(){
    document.getElementById("studentModal").style.display = "none";
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
let currentStudentIndex=null;

function selectStudent(index){
    currentStudentIndex=index;
    let s=students[index];
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

   let allowedSubjects = currentUser.role === "teacher"
    ? (currentUser.subjects || [])
    : subjects;

allowedSubjects.forEach(sub=>{
        let d=s.subjects?.[sub]?.[term]||{};
        html+=`<h4>${sub}</h4>
        <input id="${sub}_test1" value="${d.test1||0}">
        <input id="${sub}_test2" value="${d.test2||0}">
        <input id="${sub}_project" value="${d.project||0}">
        <input id="${sub}_group" value="${d.group||0}">
        <input id="${sub}_exam" value="${d.exam||0}">`;
    });


 html += `
    <hr><h3>Additional Assessment</h3>

    <label>Conduct</label>
    <select id="conduct">
        <option value="">Select</option>
        <option value="Excellent" ${s.conduct?.[term] === "Excellent" ? "selected" : ""}>Excellent</option>
        <option value="Very Good" ${s.conduct?.[term] === "Very Good" ? "selected" : ""}>Very Good</option>
        <option value="Good" ${s.conduct?.[term] === "Good" ? "selected" : ""}>Good</option>
        <option value="Needs Improvement" ${s.conduct?.[term] === "Needs Improvement" ? "selected" : ""}>Needs Improvement</option>
    </select>

    <label>Attitude</label>
    <select id="attitude">
        <option value="">Select</option>
        <option value="Respectful" ${s.attitude?.[term] === "Respectful" ? "selected" : ""}>Respectful</option>
        <option value="Hardworking" ${s.attitude?.[term] === "Hardworking" ? "selected" : ""}>Hardworking</option>
        <option value="Cooperative" ${s.attitude?.[term] === "Cooperative" ? "selected" : ""}>Cooperative</option>
        <option value="Disruptive" ${s.attitude?.[term] === "Disruptive" ? "selected" : ""}>Disruptive</option>
    </select>

    <label>Interest</label>
    <select id="interest">
        <option value="">Select</option>
        <option value="Highly Interested" ${s.interest?.[term] === "Highly Interested" ? "selected" : ""}>Highly Interested</option>
        <option value="Average" ${s.interest?.[term] === "Average" ? "selected" : ""}>Average</option>
        <option value="Low" ${s.interest?.[term] === "Low" ? "selected" : ""}>Low</option>
    </select>

    <label>Teacher Remark</label>
    <select id="teacherRemark">
        <option value="">Select</option>
        <option value="Excellent performance" ${s.teacherRemark?.[term] === "Excellent performance" ? "selected" : ""}>Excellent performance</option>
        <option value="Very good work" ${s.teacherRemark?.[term] === "Very good work" ? "selected" : ""}>Very good work</option>
        <option value="Good effort" ${s.teacherRemark?.[term] === "Good effort" ? "selected" : ""}>Good effort</option>
        <option value="Needs improvement" ${s.teacherRemark?.[term] === "Needs improvement" ? "selected" : ""}>Needs improvement</option>
    </select>
`;

html += `
<hr><h3>Attendance Summary</h3>

<p>
📅 Total School Days: <b>${s.totalDays?.[term] || 0}</b><br>
✅ Days Present: <b>${s.daysPresent?.[term] || 0}</b><br>
❌ Days Absent: <b>${(s.totalDays?.[term] || 0) - (s.daysPresent?.[term] || 0)}</b>
</p>

<p style="color:#fbbf24;">
⚠️ Attendance is managed in the Attendance section
</p>
`;
    
subjectForm.innerHTML=html;

populateStudentList(); // 🔥 refresh list to highlight selected student

document.getElementById("subjectForm").insertAdjacentHTML("afterbegin",
`<h3 style="color:#22c55e;">Editing: ${s.name}</h3>`);
}



function changeTerm(){
    let term=termSelect.value;
    students[currentStudentIndex].currentTerm=term;
    selectStudent(currentStudentIndex);
}

async function loadTermSettings() {

    const { data, error } = await supabaseClient
        .from("termsettings")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .maybeSingle();

    if (error) {
        console.error("Load term settings error:", error);
        return;
    }

    termSettings = data || {};

    // Restore values into inputs
    document.getElementById("t1start").value = termSettings.t1start || "";
    document.getElementById("t1end").value = termSettings.t1end || "";

    document.getElementById("t2start").value = termSettings.t2start || "";
    document.getElementById("t2end").value = termSettings.t2end || "";

    document.getElementById("t3start").value = termSettings.t3start || "";
    document.getElementById("t3end").value = termSettings.t3end || "";
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


async function saveMarks(){

    let s = students[currentStudentIndex];
    let term = s.currentTerm || "term1";

    let allowedSubjects = currentUser.role === "teacher"
        ? (currentUser.subjects || [])
        : subjects;

    allowedSubjects.forEach(sub => {

        if(!s.subjects) s.subjects = {};
        if(!s.subjects[sub]) s.subjects[sub] = {};

        s.subjects[sub][term] = {
            test1: +(document.getElementById(sub+"_test1")?.value || 0),
            test2: +(document.getElementById(sub+"_test2")?.value || 0),
            project: +(document.getElementById(sub+"_project")?.value || 0),
            group: +(document.getElementById(sub+"_group")?.value || 0),
            exam: +(document.getElementById(sub+"_exam")?.value || 0)
        };
    });


    s.conduct = s.conduct || {};
    s.attitude = s.attitude || {};
    s.interest = s.interest || {};
    s.teacherRemark = s.teacherRemark || {};

    s.conduct[term] = conduct.value;
    s.attitude[term] = attitude.value;
    s.interest[term] = interest.value;
    s.teacherRemark[term] = teacherRemark.value;

    
    await saveStudents();
    

    let total = 0;

    allowedSubjects.forEach(sub => {

        let d = s.subjects?.[sub]?.[term];
        if(!d) return;

        let classTotal =
            d.test1 + d.test2 + d.project + d.group;

        let classScore = (classTotal / 100) * 50;
        let examScore = (d.exam / 100) * 50;

        total += classScore + examScore;
    });

    s.average = allowedSubjects.length
        ? total / allowedSubjects.length
        : 0;

    
    await saveStudents();
    

    
    updateDashboard();
    

    alert("Marks saved successfully ✅");
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
function confirmReport(){
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

    generateReportWithTerm(s, term, endDate, nextDate);
}

let termSettings = {};


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

    if(students.length === 0){
        alert("No students available");
        return;
    }

    let term = document.getElementById("reportTerm").value;
    let endDate = getTermEnd(term);
    let nextDate = getNextTermStart(term);

    if(!endDate || !nextDate){
        alert("❌ Set term dates in Profile first!");
        return;
    }

    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF("p", "mm", "a4");

    for(let i = 0; i < students.length; i++){

        let s = students[i];

        // ✅ Generate SAME HTML design
        generateReportWithTerm(s, term, endDate, nextDate);

        let element = document.getElementById("printArea");

        // wait for rendering
        await new Promise(resolve => setTimeout(resolve, 300));

        let canvas = await html2canvas(element, { scale: 2 });

        let imgData = canvas.toDataURL("image/png");

        let imgWidth = 210; // A4 width
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        // ✅ Add NEW PAGE except first
        if(i !== 0){
            pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save("All_Student_Reports.pdf");
}

if(currentUser && currentUser.role === "teacher" && (!currentUser.subjects || currentUser.subjects.length === 0)){
    alert("No subjects assigned to you. Contact admin.");
}
// Report generation remains the same
async function generateReportWithTerm(
    s,
    term,
    endDate,
    nextDate
) {

let formattedEnd = formatDate(endDate);

let formattedNext = formatDate(nextDate);

let totalStudents = students.length;

let position = getStudentPosition(s, term);

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
        font-family: 'Times New Roman', Times, serif;
        font-size: 14px;
        color: black;
        margin: 15px auto;
		width: 100%;
		max-width: 820px;
        position: relative;
		padding: 35px 30px;
        border:5px solid blue;
        background: white;
        box-sizing: border-box;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);

    ">;
	
	<!-- INNER BORDER (DOUBLE LINE EFFECT) -->
    <div style="
        position:absolute;
        top:10px;
        left:10px;
        right:10px;
        bottom:10px;
        border:2px solid blue;
    "></div>
	
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

	
	

    
    <div style="text-align:center; margin-bottom:25px;">
        ${logo ? `<img src="${logo}" style="width:100px; height:100px; object-fit:contain; margin-bottom:10px;"><br>` : ''}
        <h1 style="margin:8px 0 5px 0; font-size:26px; letter-spacing:2px;">${schoolname}</h1>
        <p style="margin:0; font-size:18px; font-weight:bold;">STUDENT TERMINAL REPORT - ${term.toUpperCase()}</p>
    </div>

  

    
    <div style="margin:20px 0; line-height:1.8;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div><strong>Name:</strong> ${s.name}</div>
            <div><strong>Position:</strong> ${position}</div>
        </div>
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div><strong>Class:</strong> ${s.studentclass}</div>
            <div><strong>Total Students:</strong> ${totalStudents}</div>
        </div>
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div><strong>Term Ending:</strong> ${formattedEnd}</div>
            <div><strong>Next Term Begins:</strong> ${formattedNext}</div>
        </div>
    </div>;

				
		
        <table style="width:100%; border-collapse:collapse; text-align:center;">
            <tr style="background:#007fff; color: white;">
                <th style="border:1px ash;">Subject</th>
                <th style="border:1px ash;">Class Score (50%)</th>
                <th style="border:1px ash;">Exams (50%)</th>
                <th style="border:1px ash;">Total (100%)</th>
                <th style="border:1px ash;">Grade</th>
                <th style="border:1px ash;">Remarks</th>
            </tr>`;
    
    let grandTotal = 0;

    let allowedSubjects = currentUser.role === "teacher"
    ? (currentUser.subjects || [])
    : subjects;

allowedSubjects.forEach(sub=>{
        let d = s.subjects?.[sub]?.[term] || {test1:0,test2:0,project:0,group:0,exam:0};

        let classTotal = d.test1 + d.test2 + d.project + d.group;
        let classScore = (classTotal/100)*50;
        let examScore = (d.exam/100)*50;
        let total = classScore + examScore;

        grandTotal += total;

        html += `<tr>
            <td style="border:1px solid black;">${sub.toUpperCase()}</td>
            <td style="border:1px solid black;">${classScore.toFixed(2)}</td>
            <td style="border:1px solid black;">${examScore.toFixed(2)}</td>
            <td style="border:1px solid black;">${total.toFixed(2)}</td>
            <td style="border:1px solid black;">${getGrade(total)}</td>
            <td style="border:1px solid black;">${getRemark(total)}</td>
        </tr>`;
    });



	

    // Additional Info
    html += `
    <div style="margin-top:15px; line-height:1.8;">
        <p><strong>Total Attendance:</strong> ${s.totalDays?.[term]||0} &nbsp;&nbsp; <strong>Student Attendance:</strong> ${s.daysPresent?.[term]||0}</p>
        <p><strong>Conduct:</strong> ${s.conduct?.[term] || 'Good'}</p>
        <p><strong>Attitude:</strong> ${s.attitude?.[term] || 'Positive'}</p>
        <p><strong>Interest:</strong> ${s.interest?.[term] || 'Average'}</p>

        <h3 style="margin:20px 0 8px 0;">Teacher's Remark</h3>
        <p style="border:1px solid #000; padding:12px; min-height:60px;">${s.teacherRemark?.[term] || 'Very good work'}</p>
    </div>`;

    // Signature Section
    html += `
    <div style="margin-top:50px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:20px;">
        <div style="text-align:center; width:45%;">
            <div style="border-bottom:1px solid black; height:50px; margin-bottom:8px;"></div>
            <strong>${getClassTeacherName(s.studentclass)}</strong><br>
            (Class Teacher)
        </div>
        <div style="text-align:center; width:45%;">
            <div style="border-bottom:1px solid blue; height:50px; margin-bottom:8px;"></div>
            <strong>Name: ____________________</strong><br>
            Head Teacher
        </div>
    </div>`;

    html += `</div><br><button onclick="downloadPDF()">📥 Download PDF</button>`;

    document.getElementById("reportOutput").innerHTML = html;
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

async function downloadPDF(){

    let element = document.getElementById("printArea");

    html2canvas(document.getElementById("printArea"), {
    scale: 3,
    useCORS: true
	
}).then(canvas => {

    const imgData = canvas.toDataURL('image/png', 1.0);

    const { jsPDF } = window.jspdf;
    let doc = new jsPDF('p', 'mm', 'a4');

    let imgWidth = 210;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    doc.save("report.pdf");

});
    // 🔥 GET STUDENT NAME
    let studentname = document.getElementById("reportSearch").value.trim();



    // 🔥 GET TERM
    let term = document.getElementById("reportTerm").value;

    // Clean name (remove spaces)
    studentname = studentname.replace(/\s+/g, "_");

    // Capitalize term
   term = term.charAt(0).toUpperCase() + term.slice(1);

    // 🔥 FINAL FILE NAME
    let fileName = `${studentname}_${term}.pdf`;

    doc.save(fileName);
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

            // IMPORTANT
            await loadTermSettings();

            await loadStudents();

            await loadAttendanceData();

            await loadLogo();

            await displaySchoolName();

            await loadTheme();

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
    showPage('profilePage');
	 await loadUsers();
	
    loadProfileData();
	loadTermSettings();
	

    if(currentUser.role === "admin"){
      
    } else {
        loadSubjectSelection();
    }
	loadTeacherSubjects();
	
}

function showProfileTab(tab, el){

    document.getElementById("userTab").style.display = "none";
    document.getElementById("subjectsTab").style.display = "none";
	document.getElementById("termTab").style.display = "none";

    document.getElementById(tab).style.display = "block";

    document.querySelectorAll(".menu-item").forEach(m=>m.classList.remove("active"));

    el.classList.add("active"); // ✅ FIXED
	
	// ✅ LOAD TERM DATA
   if(tab === "termTab"){
        loadTermSettings();
    }
}

function loadProfileData(){

    document.getElementById("pFirstName").value = currentUser.firstname;
    document.getElementById("pSurname").value = currentUser.surname;
    document.getElementById("pUsername").value = currentUser.username;
    document.getElementById("pEmail").value = currentUser.email;
    document.getElementById("pPhone").value = currentUser.phone;
    document.getElementById("pRole").value = currentUser.role;

    // ✅ LOAD PROFILE IMAGE
    let img = document.getElementById("profilePic");

    if(currentUser.profilePic){
        img.src = currentUser.profilePic;
    } else {
        img.src = "assets/default-profile.png";
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
function loadSubjectSelection(){

    let container = document.getElementById("subjectCheckboxes");
    container.innerHTML = "";

    let selected = currentUser.subjects || [];

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

    // HIDE SAVE BUTTON FOR TEACHER
    if(currentUser.role === "teacher"){
        document.getElementById("saveSubjectsBtn").style.display = "none";
    } else {
        document.getElementById("saveSubjectsBtn").style.display = "block";
    }
}
async function saveTeacherSubjects(){

    try{

        let teacherUsername =
            document.getElementById(
                "teacherSelect"
            ).value;

        if(!teacherUsername){
            return alert(
                "Please select a teacher"
            );
        }

        // =========================
        // GET TEACHER
        // =========================

        const {
            data: teacher,
            error: teacherError
        } = await supabaseClient
            .from("users")
            .select("*")
            .eq("username", teacherUsername)
            .single();

        if(teacherError || !teacher){

            console.error(teacherError);

            return alert(
                "Teacher not found"
            );
        }

        // =========================
        // GET SUBJECTS
        // =========================

        let selectedSubjects = [];

        document
            .querySelectorAll(
                "#subjectCheckboxes input:checked"
            )
            .forEach(cb => {

                selectedSubjects.push(
                    cb.value
                );

            });

        if(selectedSubjects.length === 0){

            return alert(
                "Select at least one subject"
            );
        }

        // =========================
        // GET CLASSES
        // =========================

        let classInput =
            document.getElementById(
                "teacherClass"
            ).value.trim();

        if(!classInput){

            return alert(
                "Enter class"
            );
        }

        let classList = classInput
            .split(",")
            .map(c => c.trim())
            .filter(c => c);

        if(classList.length === 0){

            return alert(
                "Enter a valid class"
            );
        }

        // =========================
        // AUTO CREATE CLASSES
        // =========================

        for(const cls of classList){

            const {
                data: existingClass
            } = await supabaseClient
                .from("classes")
                .select("*")
                .eq(
                    "classname",
                    cls
                )
                .eq(
                    "schoolid",
                    currentUser.schoolid
                )
                .maybeSingle();

            if(!existingClass){

                const {
                    error: classError
                } = await supabaseClient
                    .from("classes")
                    .insert([
                        {
                            classname: cls,
                            schoolid:
                                currentUser.schoolid
                        }
                    ]);

                if(classError){

                    console.error(
                        classError
                    );

                    return alert(
                        `Failed to create class ${cls}`
                    );
                }
            }
        }

        // =========================
        // MAIN CLASS
        // =========================

        let mainClass =
            classList[0];

        // =========================
        // UPDATE TEACHER
        // =========================

        const {
            error: updateError
        } = await supabaseClient
            .from("users")
            .update({
                mainClass:
                    mainClass,

                classes:
                    classList,

                subjects:
                    selectedSubjects
            })
            .eq(
                "username",
                teacherUsername
            );

        if(updateError){

            console.error(
                updateError
            );

            return alert(
                "Failed to save teacher settings"
            );
        }

        // =========================
        // REFRESH LOCAL DATA
        // =========================

        await loadUsers();

        alert(
            "Teacher settings saved successfully ✅"
        );

    }catch(err){

        console.error(err);

        alert(
            "An unexpected error occurred"
        );
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

        console.log(error);

        return alert(
            "Failed to update profile"
        );
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
        .from("profile-pictures")
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
        .from("profile-pictures")
        .getPublicUrl(fileName);

    let imageUrl = urlData.publicUrl;

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

function loadTeachers(){

    if(currentUser.role !== "admin") return;

    console.log("All Users:", users);

    let teachers = users.filter(u =>
        u.role === "teacher" &&
        u.schoolid === currentUser.schoolid
    );

    console.log("Teachers Found:", teachers);

    let select = document.getElementById("teacherSelect");

    select.innerHTML = "";

    teachers.forEach(t => {
        select.innerHTML += `
            <option value="${t.username}">
                ${t.firstname} ${t.surname}
            </option>
        `;
    });

    loadSelectedTeacherSubjects();
}

function loadSelectedTeacherSubjects(){
    let teacherUsername = document.getElementById("teacherSelect").value;

    let teacher = users.find(u => u.username === teacherUsername);
	
	  if(!teacher) return;

    // ✅ LOAD SUBJECTS
    document.querySelectorAll("#subjectCheckboxes input")
        .forEach(cb => {
            cb.checked = (teacher.subjects || []).includes(cb.value);
        });

    // ✅ LOAD CLASS
    document.getElementById("teacherClass").value =
        (teacher.classes || [])[0] || "";

    let savedSubjects = teacher?.subjects || [];
    

    let html = "";

    subjects.forEach(sub=>{
        let checked = savedSubjects.includes(sub) ? "checked" : "";

        html += `
        <label>
            <input type="checkbox" value="${sub}" ${checked}>
            ${sub}
        </label><br>
        `;
    });

    document.getElementById("subjectCheckboxes").innerHTML = html;
	
}

async function loadUsers(){
	

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("schoolid", currentUser.schoolid);

    if(error){
        console.log("Load Users Error:", error);
        return;
    }

    users = data || [];

    console.log("Users Loaded:", users);

    if(currentUser.role === "admin"){
        loadTeachers();
    }
}


function getStudentPosition(student, term){

    let classStudents = students.filter(
        s => s.studentclass === student.studentclass
    );

    let ranked = classStudents.map(s => {

        let total = 0;
        let count = 0;

        let allowedSubjects =
            currentUser.role === "teacher"
            ? (currentUser.subjects || [])
            : subjects;

        allowedSubjects.forEach(sub => {

            let d = s.subjects?.[sub]?.[term];

            if(!d) return;

            let classTotal =
                Number(d.test1 || 0) +
                Number(d.test2 || 0) +
                Number(d.project || 0) +
                Number(d.group || 0);

            let classScore = (classTotal / 100) * 50;
            let examScore = (Number(d.exam || 0) / 100) * 50;

            total += classScore + examScore;
            count++;

        });

        return {
            name: s.name,
            avg: count ? total / count : 0
        };

    });

    ranked.sort((a,b) => b.avg - a.avg);

    let studentData = ranked.find(
        x => x.name === student.name
    );

    if(!studentData) return "-";

    let position =
        ranked.filter(
            x => x.avg > studentData.avg
        ).length + 1;

    return formatPosition(position);

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

    // TEACHER SAFETY
    if(currentUser.role === "teacher"){
        filtered = filtered.filter(s =>
            (currentUser.classes || []).includes(s.studentclass)
        );
    }
		filteredStudents = filtered;

    studentsList.innerHTML = filtered.map((s,index)=>
    `<div class="card" onclick="selectFilteredStudent(${index})">
        ${s.name}
    </div>`
).join('');
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

        console.log("Filtered Classes:", classes);
    }

    let html = `<option value="">Select Class</option>`;

    classes.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });

    document.getElementById("classFilter").innerHTML = html;

    console.log(
        "Dropdown Updated:",
        document.getElementById("studentClass").innerHTML
    );
}

function getClassTeacherName(studentClass){

    let teacher = users.find(u =>
        u.role === "teacher" &&
        (u.classes || []).includes(studentClass)
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

async function ensureClassExists(className){

    if(!className) return;

    const { data } = await supabaseClient
        .from("classes")
        .select("*")
        .eq("classname", className)
        .eq("schoolid", currentUser.schoolid)
        .maybeSingle();

    if(data) return;

    const { error } = await supabaseClient
        .from("classes")
        .insert([
            {
                classname: className,
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



function displayUsers(){

    let usersList = users.filter(u =>
        u.username !== currentUser.username &&
        u.schoolid === currentUser.schoolid
    );

    let html = "";

    usersList.forEach(user => {

        // USER INITIALS
        let initials =
            user.firstname.charAt(0).toUpperCase() +
            user.surname.charAt(0).toUpperCase();

        // ONLINE STATUS
        let online =
            user.lastSeen &&
            (Date.now() - user.lastSeen < 60000);

        // PROFILE IMAGE OR INITIALS
        let avatar = "";

        if(user.profilePicture){

            avatar = `
            <div class="avatar-wrapper">

                <img src="${user.profilePicture}"
                     class="chat-avatar-img">

                <div class="online-dot
                    ${online ? 'online' : 'offline'}">
                </div>

            </div>
            `;

        } else {

            avatar = `
            <div class="avatar-wrapper">

                <div class="chat-avatar">
                    ${initials}
                </div>

                <div class="online-dot
                    ${online ? 'online' : 'offline'}">
                </div>

            </div>
            `;
        }

        // USER CARD
        html += `
        <div class="chat-user
            ${selectedUser === user.username ? 'active' : ''}"

            onclick="selectUser('${user.username}')">

            ${avatar}

            <div class="user-details">

    <div class="chat-name">
        ${user.firstname} ${user.surname}
    </div>

    <div class="last-seen">
        ${online ? "Online" : "Offline"}
    </div>

</div>

        </div>
        `;
    });

    document.getElementById("userList").innerHTML = html;
}


function selectUser(username){

    let user = users.find(
        u => u.username === username
    );

    document.getElementById("chatUserName")
    .innerText =
    `${user.firstname} ${user.surname}`;

    document.getElementById("chatUserStatus")
    .innerText =
    (Date.now() - user.lastSeen < 60000)
    ? "Online"
    : "Offline";

    if(user.profilePicture){
        document.getElementById(
            "chatUserAvatar"
        ).src = user.profilePicture;
    }

    selectedUser = username;

    displayUsers();

    displayChat();

    // MOBILE ONLY
    if(window.innerWidth <= 768){

        document.getElementById("usersPanel")
            .style.display = "none";

        document.getElementById("conversationPanel")
            .style.display = "flex";
    }

}

async function sendMessage(){

    if(!selectedUser){
        return alert("Select a user first");
    }

    let input = document.getElementById("chatInput");

    let mediaInput = document.getElementById("mediaInput");

    let text = input.value.trim();

    let file = selectedMediaFile;

    if(!text && !file) return;

    // TEXT ONLY
    if(!file){

        const { error } = await supabaseClient
            .from("chats")
            .insert([
                {
                    from_user: currentUser.username,
                    to_user: selectedUser,
                    text: text,
                    type: "text",
                    time: Date.now(),
                    schoolid: currentUser.schoolid
                }
            ]);

if(error){
    console.log(JSON.stringify(error, null, 2));
    console.error(error);
    alert(JSON.stringify(error));
    return;
}

        input.value = "";

        displayChat();

        return;
    }
let recorder;
let chunks=[];

navigator.mediaDevices
.getUserMedia({audio:true})
.then(stream=>{

    recorder =
        new MediaRecorder(stream);

    recorder.ondataavailable =
        e=>chunks.push(e.data);

});
    // MEDIA
    let reader = new FileReader();

    reader.onload = async function(e){

        const { error } = await supabaseClient
    .from("chats")
    .insert([
        {
            from_user: currentUser.username,
            to_user: selectedUser,
            text: text,
            media: e.target.result,
            mediatype: file.type,
            filename: file.name,
            type: "media",
            time: Date.now(),
            schoolid: currentUser.schoolid
        }
    ]);

const { data } = await supabaseClient
    .from("chats")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

console.log(JSON.stringify(data[0], null, 2));

        if(error){
            console.error(error);
            return alert("Failed to send media");
        }

        input.value = "";

        mediaInput.value = "";

        selectedMediaFile = null;
		
		

        displayChat();
    };

    reader.readAsDataURL(file);
}
async function displayChat(){

    if(!selectedUser){

        document.getElementById("chatBox").innerHTML =
            "<p>Select a user to start chatting</p>";

        return;
    }

    const { data: chats, error } = await supabaseClient
        .from("chats")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .order("time", { ascending: true });

    if(error){
        console.error(error);
        return;
    }
	
	await supabaseClient
.from("chats")
.update({
    delivered:true
})
.eq("to_user", currentUser.username)
.eq("from_user", selectedUser)
.eq("delivered", false);


	
await supabaseClient
.from("chats")
.update({
    seen:true
})
.eq("to_user", currentUser.username)
.eq("from_user", selectedUser)
.eq("seen", false);


    let filtered = chats.filter(c =>
        (c.from_user === currentUser.username &&
         c.to_user === selectedUser) ||

        (c.from_user === selectedUser &&
         c.to_user === currentUser.username)
    );

    let html = "";

    filtered.forEach(msg => {

        let mine = msg.from_user === currentUser.username;

        html += `
<div
    <div
    ondblclick="selectMessage(${msg.id})"
    oncontextmenu="
        showContextMenu(event,${msg.id});
        return false;
    "
    style="
        margin:10px 0;
        text-align:${mine ? "right" : "left"};
        cursor:pointer;
    ">


            <div style="
                display:inline-block;
                padding:10px;
                border-radius:8px;
                background:${mine ? "#2563eb" : "#1e293b"};
                color:white;
                max-width:300px;
                overflow:hidden;
                position:relative;
            ">
        `;

        // DELETED MESSAGE
       if(msg.deleted){

    html += `
        <div class="deleted-message">
            🚫 This message was deleted
        </div>
    `;
}
        else{

            // TEXT
            if(msg.text){

                html += `
                    <div style="margin-bottom:8px;">
                        ${msg.text}
                    </div>
                `;
            }

            // IMAGE
            if(msg.mediatype &&
               msg.mediatype.startsWith("image/")){

                html += `
                    <img src="${msg.media}"
                         style="
                            width:100%;
                            border-radius:10px;
                            margin-top:5px;
                         ">
                `;
            }

            // VIDEO
            else if(msg.mediatype &&
                    msg.mediatype.startsWith("video/")){

                html += `
                    <video controls
                           style="
                                width:100%;
                                border-radius:10px;
                                margin-top:5px;
                           ">
                        <source src="${msg.media}">
                    </video>
                `;
            }

            // FILES
            else if(msg.media){

                html += `
                    <a href="${msg.media}"
                       download="${msg.filename}"
                       style="
                            color:#93c5fd;
                            text-decoration:none;
                       ">
                        📄 ${msg.filename}
                    </a>
                `;
            }
        }

        // DELETE BUTTON FOR MY MESSAGES ONLY
        if(mine && !msg.deleted){

            html += `
                <div style="
                    margin-top:5px;
                    text-align:right;
                ">
                </div>
            `;
        }

        html += `
    <div style="
        text-align:right;
        font-size:11px;
        margin-top:5px;
        color:#cbd5e1;
    ">
        ${new Date(msg.time).toLocaleTimeString([],{
            hour:'2-digit',
            minute:'2-digit'
        })}
        ${mine ? getTicks(msg) : ""}
    </div>

    </div>
</div>
`;
		
    });

    document.getElementById("chatBox").innerHTML = html;

    document.getElementById("chatBox").scrollTop =
        document.getElementById("chatBox").scrollHeight;
}

function selectMessage(messageId){

    selectedMessageId = messageId;

    document.getElementById("messageActions")
        .style.display = "block";
}

function clearSelection(){

    selectedMessageId = null;

    document.getElementById("messageActions")
        .style.display = "none";
}

async function deleteSelectedMessage(){

    if(!selectedMessageId) return;

    // Get the message first
    const { data: msg, error: fetchError } =
        await supabaseClient
            .from("chats")
            .select("*")
            .eq("id", selectedMessageId)
            .single();

    if(fetchError){
        console.error(fetchError);
        return;
    }

    // Already deleted → remove permanently
    if(msg.deleted){

        const { error } = await supabaseClient
            .from("chats")
            .delete()
            .eq("id", selectedMessageId);

        if(error){
            console.error(error);
            return;
        }
    }

    // First delete → show "This message was deleted"
    else{

        const { error } = await supabaseClient
            .from("chats")
            .update({
                text: null,
                media: null,
                filename: null,
                mediatype: null,
                deleted: true
            })
            .eq("id", selectedMessageId);

        if(error){
            console.error(error);
            return;
        }
    }

    selectedMessageId = null;

    document.getElementById("messageActions")
        .style.display = "none";

    displayChat();
}
async function updateOnlineStatus(){

    const { error } = await supabaseClient
        .from("users")
        .update({
            lastSeen: Date.now()
        })
        .eq("username", currentUser.username);

    if(error){
        console.error("Error updating online status:", error);
    }
}

document.getElementById("mediaInput")
.addEventListener("change", previewMedia);


function previewMedia(e){

    let file = e.target.files[0];

    if(!file) return;

    selectedMediaFile = file;

    let reader = new FileReader();

    reader.onload = function(event){

        let preview =
            document.getElementById("previewContent");

        let html = "";

        // IMAGE
        if(file.type.startsWith("image/")){

            html = `
                <img src="${event.target.result}">
            `;
        }

        // VIDEO
        else if(file.type.startsWith("video/")){

            html = `
                <video controls>
                    <source src="${event.target.result}">
                </video>
            `;
        }

        // OTHER FILES
        else {

            html = `
                <div class="preview-file">
                    📄 ${file.name}
                </div>
            `;
        }

        preview.innerHTML = html;

        document.getElementById("mediaPreview")
            .style.display = "block";
    };

    reader.readAsDataURL(file);
}

function removePreview(){

    selectedMediaFile = null;

    document.getElementById("mediaInput").value = "";

    document.getElementById("mediaPreview")
        .style.display = "none";

    document.getElementById("previewContent")
        .innerHTML = "";
}

function updateUnreadCounts(){

    users.forEach(u=>{

        let count = messages.filter(m =>
            m.receiver === currentUser.username &&
            m.sender === u.username &&
            !m.seen
        ).length;

        let badge = document.getElementById(
            "unread_" + u.username
        );

        if(badge){

            badge.innerText = count;

            badge.style.display =
                count > 0 ? "flex" : "none";
        }
    });
}


let typingTimeout;

document.getElementById("chatInput")
.addEventListener("input", async () => {

    await supabaseClient
        .from("typing_status")
        .upsert({
            username: currentUser.username,
            is_typing: true,
            updated_at: new Date()
        });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(async () => {

        await supabaseClient
            .from("typing_status")
            .upsert({
                username: currentUser.username,
                is_typing: false,
                updated_at: new Date()
            });

    }, 1500);

});

supabaseClient.channel("typing-status")
.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "typing_status"
    },
    (payload) => {

        if (
            selectedUser &&
            payload.new.username === selectedUser.username
        ) {

            document.getElementById(
                "typingIndicator"
            ).innerText =
                payload.new.is_typing
                ? selectedUser.firstname + " is typing..."
                : "";
        }

    }
)
.subscribe();

function getTicks(msg){

    if(msg.seen){
        return `
            <span style="color:#53bdeb">
                ✓✓
            </span>
        `;
    }

    if(msg.delivered){
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

async function test(){

    const { data } =
    await supabaseClient.from("users").select("*");

}
supabaseClient
.channel("chat-room")
.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "chats"
    },
    () => {

        displayChat();
        displayUsers();

    }
)
.subscribe();

function showContextMenu(e,messageId){

    e.preventDefault();

    selectedMessageId = messageId;

    let menu =
        document.getElementById("contextMenu");

    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";

    menu.style.display = "block";
	
	document.addEventListener("click", () => {

    document.getElementById("contextMenu")
        .style.display = "none";

});
}

function replyMessage(){

    alert("Reply feature coming soon");

}

function forwardMessage(){

    alert("Forward feature coming soon");

}


function setupMobileChat(){

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel")
            .style.display = "block";

        document.getElementById("conversationPanel")
            .style.display = "none";
    }

}

function backToUsers(){
	 

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel")
            .style.display = "block";

        document.getElementById("conversationPanel")
            .style.display = "none";

    }

}


function openChatPage(){

   

    showPage("chat");

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel").style.display = "block";
        document.getElementById("conversationPanel").style.display = "none";
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

async function downloadPDF(){

    let element = document.getElementById("printArea");

    html2canvas(document.getElementById("printArea"), {
    scale: 3,
    useCORS: true
	
}).then(canvas => {

    const imgData = canvas.toDataURL('image/png', 1.0);

    const { jsPDF } = window.jspdf;
    let doc = new jsPDF('p', 'mm', 'a4');

    let imgWidth = 210;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    doc.save("report.pdf");

});
    // 🔥 GET STUDENT NAME
    let studentname = document.getElementById("reportSearch").value.trim();



    // 🔥 GET TERM
    let term = document.getElementById("reportTerm").value;

    // Clean name (remove spaces)
    studentname = studentname.replace(/\s+/g, "_");

    // Capitalize term
   term = term.charAt(0).toUpperCase() + term.slice(1);

    // 🔥 FINAL FILE NAME
    let fileName = `${studentname}_${term}.pdf`;

    doc.save(fileName);
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

            // IMPORTANT
            await loadTermSettings();

            await loadStudents();

            await loadAttendanceData();

            await loadLogo();

            await displaySchoolName();

            await loadTheme();

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
    showPage('profilePage');
	 await loadUsers();
	
    loadProfileData();
	loadTermSettings();
	

    if(currentUser.role === "admin"){
      
    } else {
        loadSubjectSelection();
    }
	loadTeacherSubjects();
	
}

function showProfileTab(tab, el){

    document.getElementById("userTab").style.display = "none";
    document.getElementById("subjectsTab").style.display = "none";
	document.getElementById("termTab").style.display = "none";

    document.getElementById(tab).style.display = "block";

    document.querySelectorAll(".menu-item").forEach(m=>m.classList.remove("active"));

    el.classList.add("active"); // ✅ FIXED
	
	// ✅ LOAD TERM DATA
   if(tab === "termTab"){
        loadTermSettings();
    }
}

function loadProfileData(){

    document.getElementById("pFirstName").value = currentUser.firstname;
    document.getElementById("pSurname").value = currentUser.surname;
    document.getElementById("pUsername").value = currentUser.username;
    document.getElementById("pEmail").value = currentUser.email;
    document.getElementById("pPhone").value = currentUser.phone;
    document.getElementById("pRole").value = currentUser.role;

    // ✅ LOAD PROFILE IMAGE
    let img = document.getElementById("profilePic");

    if(currentUser.profilePic){
        img.src = currentUser.profilePic;
    } else {
        img.src = "assets/default-profile.png";
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
function loadSubjectSelection(){

    let container = document.getElementById("subjectCheckboxes");
    container.innerHTML = "";

    let selected = currentUser.subjects || [];

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

    // HIDE SAVE BUTTON FOR TEACHER
    if(currentUser.role === "teacher"){
        document.getElementById("saveSubjectsBtn").style.display = "none";
    } else {
        document.getElementById("saveSubjectsBtn").style.display = "block";
    }
}
async function saveTeacherSubjects(){

    try{

        let teacherUsername =
            document.getElementById(
                "teacherSelect"
            ).value;

        if(!teacherUsername){
            return alert(
                "Please select a teacher"
            );
        }

        // =========================
        // GET TEACHER
        // =========================

        const {
            data: teacher,
            error: teacherError
        } = await supabaseClient
            .from("users")
            .select("*")
            .eq("username", teacherUsername)
            .single();

        if(teacherError || !teacher){

            console.error(teacherError);

            return alert(
                "Teacher not found"
            );
        }

        // =========================
        // GET SUBJECTS
        // =========================

        let selectedSubjects = [];

        document
            .querySelectorAll(
                "#subjectCheckboxes input:checked"
            )
            .forEach(cb => {

                selectedSubjects.push(
                    cb.value
                );

            });

        if(selectedSubjects.length === 0){

            return alert(
                "Select at least one subject"
            );
        }

        // =========================
        // GET CLASSES
        // =========================

        let classInput =
            document.getElementById(
                "teacherClass"
            ).value.trim();

        if(!classInput){

            return alert(
                "Enter class"
            );
        }

        let classList = classInput
            .split(",")
            .map(c => c.trim())
            .filter(c => c);

        if(classList.length === 0){

            return alert(
                "Enter a valid class"
            );
        }

        // =========================
        // AUTO CREATE CLASSES
        // =========================

        for(const cls of classList){

            const {
                data: existingClass
            } = await supabaseClient
                .from("classes")
                .select("*")
                .eq(
                    "classname",
                    cls
                )
                .eq(
                    "schoolid",
                    currentUser.schoolid
                )
                .maybeSingle();

            if(!existingClass){

                const {
                    error: classError
                } = await supabaseClient
                    .from("classes")
                    .insert([
                        {
                            classname: cls,
                            schoolid:
                                currentUser.schoolid
                        }
                    ]);

                if(classError){

                    console.error(
                        classError
                    );

                    return alert(
                        `Failed to create class ${cls}`
                    );
                }
            }
        }

        // =========================
        // MAIN CLASS
        // =========================

        let mainClass =
            classList[0];

        // =========================
        // UPDATE TEACHER
        // =========================

        const {
            error: updateError
        } = await supabaseClient
            .from("users")
            .update({
                mainClass:
                    mainClass,

                classes:
                    classList,

                subjects:
                    selectedSubjects
            })
            .eq(
                "username",
                teacherUsername
            );

        if(updateError){

            console.error(
                updateError
            );

            return alert(
                "Failed to save teacher settings"
            );
        }

        // =========================
        // REFRESH LOCAL DATA
        // =========================

        await loadUsers();

        alert(
            "Teacher settings saved successfully ✅"
        );

    }catch(err){

        console.error(err);

        alert(
            "An unexpected error occurred"
        );
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

        console.log(error);

        return alert(
            "Failed to update profile"
        );
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
        .from("profile-pictures")
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
        .from("profile-pictures")
        .getPublicUrl(fileName);

    let imageUrl = urlData.publicUrl;

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

function loadTeachers(){

    if(currentUser.role !== "admin") return;

    console.log("All Users:", users);

    let teachers = users.filter(u =>
        u.role === "teacher" &&
        u.schoolid === currentUser.schoolid
    );

    console.log("Teachers Found:", teachers);

    let select = document.getElementById("teacherSelect");

    select.innerHTML = "";

    teachers.forEach(t => {
        select.innerHTML += `
            <option value="${t.username}">
                ${t.firstname} ${t.surname}
            </option>
        `;
    });

    loadSelectedTeacherSubjects();
}

function loadSelectedTeacherSubjects(){
    let teacherUsername = document.getElementById("teacherSelect").value;

    let teacher = users.find(u => u.username === teacherUsername);
	
	  if(!teacher) return;

    // ✅ LOAD SUBJECTS
    document.querySelectorAll("#subjectCheckboxes input")
        .forEach(cb => {
            cb.checked = (teacher.subjects || []).includes(cb.value);
        });

    // ✅ LOAD CLASS
    document.getElementById("teacherClass").value =
        (teacher.classes || [])[0] || "";

    let savedSubjects = teacher?.subjects || [];
    

    let html = "";

    subjects.forEach(sub=>{
        let checked = savedSubjects.includes(sub) ? "checked" : "";

        html += `
        <label>
            <input type="checkbox" value="${sub}" ${checked}>
            ${sub}
        </label><br>
        `;
    });

    document.getElementById("subjectCheckboxes").innerHTML = html;
	
}

async function loadUsers(){
	

    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("schoolid", currentUser.schoolid);

    if(error){
        console.log("Load Users Error:", error);
        return;
    }

    users = data || [];

    console.log("Users Loaded:", users);

    if(currentUser.role === "admin"){
        loadTeachers();
    }
}


function getStudentPosition(student, term){

    let classStudents = students.filter(
        s => s.studentclass === student.studentclass
    );

    let ranked = classStudents.map(s => {

        let total = 0;
        let count = 0;

        let allowedSubjects =
            currentUser.role === "teacher"
            ? (currentUser.subjects || [])
            : subjects;

        allowedSubjects.forEach(sub => {

            let d = s.subjects?.[sub]?.[term];

            if(!d) return;

            let classTotal =
                Number(d.test1 || 0) +
                Number(d.test2 || 0) +
                Number(d.project || 0) +
                Number(d.group || 0);

            let classScore = (classTotal / 100) * 50;
            let examScore = (Number(d.exam || 0) / 100) * 50;

            total += classScore + examScore;
            count++;

        });

        return {
            name: s.name,
            avg: count ? total / count : 0
        };

    });

    ranked.sort((a,b) => b.avg - a.avg);

    let studentData = ranked.find(
        x => x.name === student.name
    );

    if(!studentData) return "-";

    let position =
        ranked.filter(
            x => x.avg > studentData.avg
        ).length + 1;

    return formatPosition(position);

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

    // TEACHER SAFETY
    if(currentUser.role === "teacher"){
        filtered = filtered.filter(s =>
            (currentUser.classes || []).includes(s.studentclass)
        );
    }
		filteredStudents = filtered;

    studentsList.innerHTML = filtered.map((s,index)=>
    `<div class="card" onclick="selectFilteredStudent(${index})">
        ${s.name}
    </div>`
).join('');
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

        console.log("Filtered Classes:", classes);
    }

    let html = `<option value="">Select Class</option>`;

    classes.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });

    document.getElementById("classFilter").innerHTML = html;

    console.log(
        "Dropdown Updated:",
        document.getElementById("studentClass").innerHTML
    );
}

function getClassTeacherName(studentClass){

    let teacher = users.find(u =>
        u.role === "teacher" &&
        (u.classes || []).includes(studentClass)
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

async function ensureClassExists(className){

    if(!className) return;

    const { data } = await supabaseClient
        .from("classes")
        .select("*")
        .eq("classname", className)
        .eq("schoolid", currentUser.schoolid)
        .maybeSingle();

    if(data) return;

    const { error } = await supabaseClient
        .from("classes")
        .insert([
            {
                classname: className,
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



function displayUsers(){

    let usersList = users.filter(u =>
        u.username !== currentUser.username &&
        u.schoolid === currentUser.schoolid
    );

    let html = "";

    usersList.forEach(user => {

        // USER INITIALS
        let initials =
            user.firstname.charAt(0).toUpperCase() +
            user.surname.charAt(0).toUpperCase();

        // ONLINE STATUS
        let online =
            user.lastSeen &&
            (Date.now() - user.lastSeen < 60000);

        // PROFILE IMAGE OR INITIALS
        let avatar = "";

        if(user.profilePicture){

            avatar = `
            <div class="avatar-wrapper">

                <img src="${user.profilePicture}"
                     class="chat-avatar-img">

                <div class="online-dot
                    ${online ? 'online' : 'offline'}">
                </div>

            </div>
            `;

        } else {

            avatar = `
            <div class="avatar-wrapper">

                <div class="chat-avatar">
                    ${initials}
                </div>

                <div class="online-dot
                    ${online ? 'online' : 'offline'}">
                </div>

            </div>
            `;
        }

        // USER CARD
        html += `
        <div class="chat-user
            ${selectedUser === user.username ? 'active' : ''}"

            onclick="selectUser('${user.username}')">

            ${avatar}

            <div class="user-details">

    <div class="chat-name">
        ${user.firstname} ${user.surname}
    </div>

    <div class="last-seen">
        ${online ? "Online" : "Offline"}
    </div>

</div>

        </div>
        `;
    });

    document.getElementById("userList").innerHTML = html;
}


function selectUser(username){

    let user = users.find(
        u => u.username === username
    );

    document.getElementById("chatUserName")
    .innerText =
    `${user.firstname} ${user.surname}`;

    document.getElementById("chatUserStatus")
    .innerText =
    (Date.now() - user.lastSeen < 60000)
    ? "Online"
    : "Offline";

    if(user.profilePicture){
        document.getElementById(
            "chatUserAvatar"
        ).src = user.profilePicture;
    }

    selectedUser = username;

    displayUsers();

    displayChat();

    // MOBILE ONLY
    if(window.innerWidth <= 768){

        document.getElementById("usersPanel")
            .style.display = "none";

        document.getElementById("conversationPanel")
            .style.display = "flex";
    }

}

async function sendMessage(){

    if(!selectedUser){
        return alert("Select a user first");
    }

    let input = document.getElementById("chatInput");

    let mediaInput = document.getElementById("mediaInput");

    let text = input.value.trim();

    let file = selectedMediaFile;

    if(!text && !file) return;

    // TEXT ONLY
    if(!file){

        const { error } = await supabaseClient
            .from("chats")
            .insert([
                {
                    from_user: currentUser.username,
                    to_user: selectedUser,
                    text: text,
                    type: "text",
                    time: Date.now(),
                    schoolid: currentUser.schoolid
                }
            ]);

if(error){
    console.log(JSON.stringify(error, null, 2));
    console.error(error);
    alert(JSON.stringify(error));
    return;
}

        input.value = "";

        displayChat();

        return;
    }
let recorder;
let chunks=[];

navigator.mediaDevices
.getUserMedia({audio:true})
.then(stream=>{

    recorder =
        new MediaRecorder(stream);

    recorder.ondataavailable =
        e=>chunks.push(e.data);

});
    // MEDIA
    let reader = new FileReader();

    reader.onload = async function(e){

        const { error } = await supabaseClient
    .from("chats")
    .insert([
        {
            from_user: currentUser.username,
            to_user: selectedUser,
            text: text,
            media: e.target.result,
            mediatype: file.type,
            filename: file.name,
            type: "media",
            time: Date.now(),
            schoolid: currentUser.schoolid
        }
    ]);

const { data } = await supabaseClient
    .from("chats")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

console.log(JSON.stringify(data[0], null, 2));

        if(error){
            console.error(error);
            return alert("Failed to send media");
        }

        input.value = "";

        mediaInput.value = "";

        selectedMediaFile = null;
		
		

        displayChat();
    };

    reader.readAsDataURL(file);
}
async function displayChat(){

    if(!selectedUser){

        document.getElementById("chatBox").innerHTML =
            "<p>Select a user to start chatting</p>";

        return;
    }

    const { data: chats, error } = await supabaseClient
        .from("chats")
        .select("*")
        .eq("schoolid", currentUser.schoolid)
        .order("time", { ascending: true });

    if(error){
        console.error(error);
        return;
    }
	
	await supabaseClient
.from("chats")
.update({
    delivered:true
})
.eq("to_user", currentUser.username)
.eq("from_user", selectedUser)
.eq("delivered", false);


	
await supabaseClient
.from("chats")
.update({
    seen:true
})
.eq("to_user", currentUser.username)
.eq("from_user", selectedUser)
.eq("seen", false);


    let filtered = chats.filter(c =>
        (c.from_user === currentUser.username &&
         c.to_user === selectedUser) ||

        (c.from_user === selectedUser &&
         c.to_user === currentUser.username)
    );

    let html = "";

    filtered.forEach(msg => {

        let mine = msg.from_user === currentUser.username;

        html += `
<div
    <div
    ondblclick="selectMessage(${msg.id})"
    oncontextmenu="
        showContextMenu(event,${msg.id});
        return false;
    "
    style="
        margin:10px 0;
        text-align:${mine ? "right" : "left"};
        cursor:pointer;
    ">


            <div style="
                display:inline-block;
                padding:10px;
                border-radius:8px;
                background:${mine ? "#2563eb" : "#1e293b"};
                color:white;
                max-width:300px;
                overflow:hidden;
                position:relative;
            ">
        `;

        // DELETED MESSAGE
       if(msg.deleted){

    html += `
        <div class="deleted-message">
            🚫 This message was deleted
        </div>
    `;
}
        else{

            // TEXT
            if(msg.text){

                html += `
                    <div style="margin-bottom:8px;">
                        ${msg.text}
                    </div>
                `;
            }

            // IMAGE
            if(msg.mediatype &&
               msg.mediatype.startsWith("image/")){

                html += `
                    <img src="${msg.media}"
                         style="
                            width:100%;
                            border-radius:10px;
                            margin-top:5px;
                         ">
                `;
            }

            // VIDEO
            else if(msg.mediatype &&
                    msg.mediatype.startsWith("video/")){

                html += `
                    <video controls
                           style="
                                width:100%;
                                border-radius:10px;
                                margin-top:5px;
                           ">
                        <source src="${msg.media}">
                    </video>
                `;
            }

            // FILES
            else if(msg.media){

                html += `
                    <a href="${msg.media}"
                       download="${msg.filename}"
                       style="
                            color:#93c5fd;
                            text-decoration:none;
                       ">
                        📄 ${msg.filename}
                    </a>
                `;
            }
        }

        // DELETE BUTTON FOR MY MESSAGES ONLY
        if(mine && !msg.deleted){

            html += `
                <div style="
                    margin-top:5px;
                    text-align:right;
                ">
                </div>
            `;
        }

        html += `
    <div style="
        text-align:right;
        font-size:11px;
        margin-top:5px;
        color:#cbd5e1;
    ">
        ${new Date(msg.time).toLocaleTimeString([],{
            hour:'2-digit',
            minute:'2-digit'
        })}
        ${mine ? getTicks(msg) : ""}
    </div>

    </div>
</div>
`;
		
    });

    document.getElementById("chatBox").innerHTML = html;

    document.getElementById("chatBox").scrollTop =
        document.getElementById("chatBox").scrollHeight;
}

function selectMessage(messageId){

    selectedMessageId = messageId;

    document.getElementById("messageActions")
        .style.display = "block";
}

function clearSelection(){

    selectedMessageId = null;

    document.getElementById("messageActions")
        .style.display = "none";
}

async function deleteSelectedMessage(){

    if(!selectedMessageId) return;

    // Get the message first
    const { data: msg, error: fetchError } =
        await supabaseClient
            .from("chats")
            .select("*")
            .eq("id", selectedMessageId)
            .single();

    if(fetchError){
        console.error(fetchError);
        return;
    }

    // Already deleted → remove permanently
    if(msg.deleted){

        const { error } = await supabaseClient
            .from("chats")
            .delete()
            .eq("id", selectedMessageId);

        if(error){
            console.error(error);
            return;
        }
    }

    // First delete → show "This message was deleted"
    else{

        const { error } = await supabaseClient
            .from("chats")
            .update({
                text: null,
                media: null,
                filename: null,
                mediatype: null,
                deleted: true
            })
            .eq("id", selectedMessageId);

        if(error){
            console.error(error);
            return;
        }
    }

    selectedMessageId = null;

    document.getElementById("messageActions")
        .style.display = "none";

    displayChat();
}
async function updateOnlineStatus(){

    const { error } = await supabaseClient
        .from("users")
        .update({
            lastSeen: Date.now()
        })
        .eq("username", currentUser.username);

    if(error){
        console.error("Error updating online status:", error);
    }
}

document.getElementById("mediaInput")
.addEventListener("change", previewMedia);


function previewMedia(e){

    let file = e.target.files[0];

    if(!file) return;

    selectedMediaFile = file;

    let reader = new FileReader();

    reader.onload = function(event){

        let preview =
            document.getElementById("previewContent");

        let html = "";

        // IMAGE
        if(file.type.startsWith("image/")){

            html = `
                <img src="${event.target.result}">
            `;
        }

        // VIDEO
        else if(file.type.startsWith("video/")){

            html = `
                <video controls>
                    <source src="${event.target.result}">
                </video>
            `;
        }

        // OTHER FILES
        else {

            html = `
                <div class="preview-file">
                    📄 ${file.name}
                </div>
            `;
        }

        preview.innerHTML = html;

        document.getElementById("mediaPreview")
            .style.display = "block";
    };

    reader.readAsDataURL(file);
}

function removePreview(){

    selectedMediaFile = null;

    document.getElementById("mediaInput").value = "";

    document.getElementById("mediaPreview")
        .style.display = "none";

    document.getElementById("previewContent")
        .innerHTML = "";
}

function updateUnreadCounts(){

    users.forEach(u=>{

        let count = messages.filter(m =>
            m.receiver === currentUser.username &&
            m.sender === u.username &&
            !m.seen
        ).length;

        let badge = document.getElementById(
            "unread_" + u.username
        );

        if(badge){

            badge.innerText = count;

            badge.style.display =
                count > 0 ? "flex" : "none";
        }
    });
}


let typingTimeout;

document.getElementById("chatInput")
.addEventListener("input", async () => {

    await supabaseClient
        .from("typing_status")
        .upsert({
            username: currentUser.username,
            is_typing: true,
            updated_at: new Date()
        });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(async () => {

        await supabaseClient
            .from("typing_status")
            .upsert({
                username: currentUser.username,
                is_typing: false,
                updated_at: new Date()
            });

    }, 1500);

});

supabaseClient.channel("typing-status")
.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "typing_status"
    },
    (payload) => {

        if (
            selectedUser &&
            payload.new.username === selectedUser.username
        ) {

            document.getElementById(
                "typingIndicator"
            ).innerText =
                payload.new.is_typing
                ? selectedUser.firstname + " is typing..."
                : "";
        }

    }
)
.subscribe();

function getTicks(msg){

    if(msg.seen){
        return `
            <span style="color:#53bdeb">
                ✓✓
            </span>
        `;
    }

    if(msg.delivered){
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

async function test(){

    const { data } =
    await supabaseClient.from("users").select("*");

}
supabaseClient
.channel("chat-room")
.on(
    "postgres_changes",
    {
        event: "*",
        schema: "public",
        table: "chats"
    },
    () => {

        displayChat();
        displayUsers();

    }
)
.subscribe();

function showContextMenu(e,messageId){

    e.preventDefault();

    selectedMessageId = messageId;

    let menu =
        document.getElementById("contextMenu");

    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";

    menu.style.display = "block";
	
	document.addEventListener("click", () => {

    document.getElementById("contextMenu")
        .style.display = "none";

});
}

function replyMessage(){

    alert("Reply feature coming soon");

}

function forwardMessage(){

    alert("Forward feature coming soon");

}


function setupMobileChat(){

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel")
            .style.display = "block";

        document.getElementById("conversationPanel")
            .style.display = "none";
    }

}

function backToUsers(){
	 

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel")
            .style.display = "block";

        document.getElementById("conversationPanel")
            .style.display = "none";

    }

}


function openChatPage(){

   

    showPage("chat");

    if(window.innerWidth <= 768){

        document.getElementById("usersPanel").style.display = "block";
        document.getElementById("conversationPanel").style.display = "none";
    }
}

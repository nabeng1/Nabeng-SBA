/* Kanella-style: markup is not in page source — injected at runtime */
(function mountStudentShell() {
  var root = document.getElementById("root");
  if (!root) {
    root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }
  root.innerHTML = "<div id=\"loginPage\">\n\n<div class=\"login-card\">\n\n    <div class=\"logo logo-with-image\">\n        <img\n            id=\"loginSbaLogo\"\n            src=\"/nabeng-sba-logo.png\"\n            alt=\"Nabeng SBA\"\n            onerror=\"this.onerror=null; this.style.display='none'; this.parentElement.classList.add('logo-fallback');\">\n        <i class=\"fas fa-user-graduate logo-fallback-icon\"></i>\n    </div>\n\n    <h2>Nabeng SBA Student Portal</h2>\n\n    <p class=\"subtitle\">Student Login</p>\n\n    <form id=\"loginForm\">\n\n        <div class=\"input-box\">\n\n            <i class=\"fas fa-id-card\"></i>\n\n            <input\n                type=\"text\"\n                id=\"studentid\"\n                placeholder=\"Student ID\"\n                required>\n\n        </div>\n\n        <div class=\"input-box\">\n\n            <i class=\"fas fa-lock\"></i>\n\n            <input\n                type=\"password\"\n                id=\"password\"\n                placeholder=\"Password\"\n                required>\n\n            <i class=\"fas fa-eye toggle\" id=\"togglePassword\"></i>\n\n        </div>\n\n        <div class=\"options\">\n\n            <label>\n\n                <input type=\"checkbox\">\n\n                Remember Me\n\n            </label>\n\n            <a href=\"#\">Forgot Password?</a>\n\n        </div>\n\n        <button type=\"submit\">\n\n            LOGIN\n\n        </button>\n\n    </form>\n\n    <div class=\"footer\" style=\"display:flex;flex-direction:column;align-items:center;gap:12px;\">\n        <button type=\"button\" class=\"login-theme-toggle\" onclick=\"toggleAppTheme()\" title=\"Toggle dark mode\">\n            <i class=\"fas fa-moon\" id=\"loginThemeToggleIcon\"></i>\n            <span id=\"loginThemeToggleLabel\">Dark mode</span>\n        </button>\n        <span>\u00a9 2026 SBA Student Portal</span>\n    </div>\n\n</div>\n</div>\n\n<div id=\"studentPortal\" class=\"app-shell\" style=\"display:none;\">\n\n  <div class=\"app-sidebar-overlay\" onclick=\"closeAppSidebar()\"></div>\n\n  <!-- SIDEBAR -->\n  <aside class=\"app-sidebar\" id=\"appSidebar\">\n    <div class=\"app-sidebar-brand\">\n      <div class=\"brand-icon brand-icon-logo\">\n        <img\n          id=\"sidebarSbaLogo\"\n          src=\"/nabeng-sba-logo.png\"\n          alt=\"Nabeng SBA\"\n          data-logo-step=\"0\">\n        <i class=\"fas fa-graduation-cap\" id=\"sidebarBrandFallbackIcon\" style=\"display:none;\"></i>\n      </div>\n      <div>\n        <h2 id=\"sidebarBrandTitle\">Nabeng SBA</h2>\n        <span id=\"sidebarBrandSubtitle\">Student Portal</span>\n      </div>\n    </div>\n\n    <div class=\"app-sidebar-school\" id=\"sidebarSchoolRow\" style=\"display:none;\">\n      <img id=\"sidebarSchoolLogo\" alt=\"School logo\" onerror=\"this.style.display='none';\">\n      <div class=\"school-meta\">\n        <span>School</span>\n        <strong id=\"sidebarSchoolName\">\u2014</strong>\n      </div>\n    </div>\n\n    <div class=\"app-sidebar-user\">\n      <img id=\"portalStudentPhoto\" src=\"\" alt=\"Student\" onerror=\"this.onerror=null; this.src=getDefaultStudentAvatar();\">\n      <div class=\"user-meta\">\n        <strong id=\"studentName\">Student</strong>\n        <span id=\"studentClass\">Class</span>\n      </div>\n    </div>\n\n    <nav class=\"app-sidebar-nav\">\n      <div class=\"nav-label\">Main</div>\n      <button type=\"button\" class=\"app-nav-item active\" data-nav=\"home\" onclick=\"goHome()\">\n        <i class=\"fas fa-house\"></i> Dashboard\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"profile\" onclick=\"setActiveNav(this); openProfile()\">\n        <i class=\"fas fa-user\"></i> Profile\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"homework\" onclick=\"setActiveNav(this); openHomework()\">\n        <i class=\"fas fa-book\"></i> Homework\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"results\" onclick=\"setActiveNav(this); openResults()\">\n        <i class=\"fas fa-chart-line\"></i> Results\n      </button>\n\n      <div class=\"nav-label\">School</div>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"attendance\" onclick=\"setActiveNav(this); openAttendance()\">\n        <i class=\"fas fa-check-circle\"></i> Attendance\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"timetable\" onclick=\"setActiveNav(this); openStudentTimetable()\">\n        <i class=\"fas fa-calendar-alt\"></i> Timetable\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"subjects\" onclick=\"setActiveNav(this); openSubjects()\">\n        <i class=\"fas fa-book-open\"></i> Subjects\n      </button>\n\n      <div class=\"nav-label\">Communication</div>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"messages\" onclick=\"setActiveNav(this); openMessages()\">\n        <i class=\"fas fa-comments\"></i> Messages\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"notifications\" onclick=\"setActiveNav(this); openStudentNotifications()\">\n        <i class=\"fas fa-bell\"></i> Notifications\n        <span id=\"sidebarNotificationBadge\" class=\"nav-badge\">0</span>\n      </button>\n      <button type=\"button\" class=\"app-nav-item\" data-nav=\"downloads\" onclick=\"setActiveNav(this); openDownloads()\">\n        <i class=\"fas fa-download\"></i> Downloads\n      </button>\n    </nav>\n\n    <div class=\"app-sidebar-footer\">\n      <button type=\"button\" class=\"app-logout-btn\" onclick=\"studentLogout()\">\n        <i class=\"fas fa-right-from-bracket\"></i> Log out\n      </button>\n    </div>\n  </aside>\n\n  <!-- MAIN -->\n  <div class=\"app-main\">\n    <header class=\"app-topbar\">\n      <button type=\"button\" class=\"app-menu-toggle\" onclick=\"toggleAppSidebar()\" aria-label=\"Menu\">\n        <i class=\"fas fa-bars\"></i>\n      </button>\n      <div class=\"app-topbar-title\">\n        <h1 id=\"appPageTitle\">Dashboard</h1>\n        <p id=\"appPageSubtitle\">Welcome back to your student portal</p>\n      </div>\n      <div class=\"app-topbar-actions\">\n        <button type=\"button\" class=\"app-theme-toggle\" id=\"appThemeToggle\" onclick=\"toggleAppTheme()\" title=\"Toggle dark mode\" aria-label=\"Toggle dark mode\">\n          <i class=\"fas fa-moon\" id=\"appThemeToggleIcon\"></i>\n        </button>\n        <div class=\"student-notification-bell\" onclick=\"openStudentNotifications()\" title=\"Notifications\">\n          <i class=\"fas fa-bell\"></i>\n          <span id=\"studentNotificationBadge\" class=\"student-notification-badge\" style=\"display:none;\">0</span>\n        </div>\n      </div>\n    </header>\n\n    <div class=\"app-content\" id=\"dashboardHome\">\n      <section class=\"dash-welcome\">\n        <div class=\"dash-welcome-inner\">\n          <div>\n            <div class=\"dash-welcome-badge\"><i class=\"fas fa-sparkles\"></i> Student Portal</div>\n            <h2 id=\"dashGreeting\">Welcome back</h2>\n            <p id=\"dashWelcomeText\">Track your homework, results, attendance and messages in one place.</p>\n          </div>\n          <div class=\"dash-date-chip\" id=\"dashDateChip\">Today</div>\n        </div>\n      </section>\n\n      <section class=\"dash-stats\">\n        <div class=\"dash-stat-card\">\n          <div class=\"dash-stat-icon indigo\"><i class=\"fas fa-book\"></i></div>\n          <span>Homework</span>\n          <strong id=\"dashHwCount\">\u2014</strong>\n        </div>\n        <div class=\"dash-stat-card\">\n          <div class=\"dash-stat-icon emerald\"><i class=\"fas fa-chart-line\"></i></div>\n          <span>Results</span>\n          <strong id=\"dashResultsLabel\">View</strong>\n        </div>\n        <div class=\"dash-stat-card\">\n          <div class=\"dash-stat-icon amber\"><i class=\"fas fa-calendar-check\"></i></div>\n          <span>Attendance</span>\n          <strong id=\"dashAttendanceLabel\">Records</strong>\n        </div>\n        <div class=\"dash-stat-card\">\n          <div class=\"dash-stat-icon rose\"><i class=\"fas fa-bell\"></i></div>\n          <span>Notifications</span>\n          <strong id=\"dashNotifCount\">0</strong>\n        </div>\n      </section>\n\n      <section class=\"dash-grid\">\n        <div class=\"dash-panel\">\n          <div class=\"dash-panel-head\">\n            <h3>Quick actions</h3>\n          </div>\n          <div class=\"dash-quick\">\n            <button type=\"button\" class=\"dash-quick-btn\" onclick=\"setActiveNavByKey('homework'); openHomework()\">\n              <div class=\"qi\" style=\"background:#eef2ff;color:#4f46e5;\"><i class=\"fas fa-pen\"></i></div>\n              <div><strong>Homework</strong><span>Assignments & submissions</span></div>\n            </button>\n            <button type=\"button\" class=\"dash-quick-btn\" onclick=\"setActiveNavByKey('results'); openResults()\">\n              <div class=\"qi\" style=\"background:#ecfdf5;color:#059669;\"><i class=\"fas fa-trophy\"></i></div>\n              <div><strong>Results</strong><span>Term performance</span></div>\n            </button>\n            <button type=\"button\" class=\"dash-quick-btn\" onclick=\"setActiveNavByKey('timetable'); openStudentTimetable()\">\n              <div class=\"qi\" style=\"background:#fff7ed;color:#ea580c;\"><i class=\"fas fa-clock\"></i></div>\n              <div><strong>Timetable</strong><span>Weekly schedule</span></div>\n            </button>\n            <button type=\"button\" class=\"dash-quick-btn\" onclick=\"setActiveNavByKey('messages'); openMessages()\">\n              <div class=\"qi\" style=\"background:#f5f3ff;color:#7c3aed;\"><i class=\"fas fa-message\"></i></div>\n              <div><strong>Messages</strong><span>Chat with teachers</span></div>\n            </button>\n            <button type=\"button\" class=\"dash-quick-btn\" onclick=\"setActiveNavByKey('attendance'); openAttendance()\">\n              <div class=\"qi\" style=\"background:#eff6ff;color:#2563eb;\"><i class=\"fas fa-user-check\"></i></div>\n              <div><strong>Attendance</strong><span>Daily & monthly</span></div>\n            </button>\n            <button type=\"button\" class=\"dash-quick-btn\" onclick=\"setActiveNavByKey('downloads'); openDownloads()\">\n              <div class=\"qi\" style=\"background:#fff1f2;color:#e11d48;\"><i class=\"fas fa-file-pdf\"></i></div>\n              <div><strong>Downloads</strong><span>Report cards</span></div>\n            </button>\n          </div>\n        </div>\n\n        <div class=\"dash-panel\">\n          <div class=\"dash-panel-head\">\n            <h3>At a glance</h3>\n          </div>\n          <div class=\"dash-activity\">\n            <div class=\"dash-activity-item\">\n              <div class=\"ai\"><i class=\"fas fa-user-graduate\"></i></div>\n              <div>\n                <strong id=\"glanceName\">Your profile</strong>\n                <span id=\"glanceClass\">Class info</span>\n              </div>\n            </div>\n            <div class=\"dash-activity-item\">\n              <div class=\"ai\" style=\"background:#ecfdf5;color:#059669;\"><i class=\"fas fa-book-open\"></i></div>\n              <div>\n                <strong>Subjects & timetable</strong>\n                <span>Open from the sidebar anytime</span>\n              </div>\n            </div>\n            <div class=\"dash-activity-item\">\n              <div class=\"ai\" style=\"background:#fff7ed;color:#ea580c;\"><i class=\"fas fa-download\"></i></div>\n              <div>\n                <strong>Term reports</strong>\n                <span>Generate PDF report cards in Downloads</span>\n              </div>\n            </div>\n            <div class=\"dash-activity-item\">\n              <div class=\"ai\" style=\"background:#fef2f2;color:#dc2626;\"><i class=\"fas fa-bell\"></i></div>\n              <div>\n                <strong>Stay updated</strong>\n                <span>Check notifications for school announcements</span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </section>\n    </div>\n  </div>\n</div>\n\n\n<!-- =========================================================\n     STUDENT NOTIFICATIONS PAGE\n========================================================= -->\n\n<!-- STUDENT TIMETABLE PAGE -->\n<div id=\"studentTimetablePage\" class=\"student-timetable-page\" style=\"display:none;\">\n  <div class=\"student-timetable-container\">\n    <div class=\"student-timetable-topbar\">\n      <div><h2>My Timetable</h2><p id=\"studentTimetableSubtitle\">Weekly class schedule</p></div>\n      <div class=\"student-timetable-term\"><label>Term</label><select id=\"studentTimetableTerm\" onchange=\"loadStudentTimetable()\"><option value=\"term1\">Term 1</option><option value=\"term2\">Term 2</option><option value=\"term3\">Term 3</option></select></div>\n    </div>\n    <div id=\"studentTimetableStatus\" class=\"student-timetable-status\"></div>\n    <div class=\"student-timetable-scroll\">\n      <table class=\"student-timetable-grid\">\n        <thead><tr><th>Time</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr></thead>\n        <tbody id=\"studentTimetableBody\"><tr><td colspan=\"6\" class=\"student-timetable-empty\">Loading timetable...</td></tr></tbody>\n      </table>\n    </div>\n  </div>\n</div>\n\n<div\n    id=\"notificationsPage\"\n    class=\"student-notifications-page\"\n    style=\"display:none;\"\n>\n\n    <div class=\"notifications-container\">\n\n        <!-- TOP BAR -->\n        <div class=\"notifications-topbar\">\n\n            <div class=\"notifications-heading\">\n\n                <div class=\"notifications-heading-icon\">\n                    <i class=\"fas fa-bell\"></i>\n                </div>\n\n                <div>\n                    <h2>Notifications</h2>\n                    <p>Messages and announcements from your school</p>\n                </div>\n\n            </div>\n\n        </div>\n\n\n        <!-- NOTIFICATION FILTER -->\n        <div class=\"notifications-filter\">\n\n            <button\n                class=\"notification-filter-btn active\"\n                onclick=\"filterStudentNotifications('all', this)\"\n            >\n                All\n            </button>\n\n            <button\n                class=\"notification-filter-btn\"\n                onclick=\"filterStudentNotifications('unread', this)\"\n            >\n                Unread\n            </button>\n\n        </div>\n\n\n        <!-- NOTIFICATIONS -->\n        <div id=\"studentNotificationsList\">\n\n            <div class=\"notifications-loading\">\n\n                <i class=\"fas fa-spinner fa-spin\"></i>\n\n                <span>Loading notifications...</span>\n\n            </div>\n\n        </div>\n\n    </div>\n\n</div>\n\n<div id=\"profilePage\" class=\"student-profile-page\" style=\"display:none;\">\n\n    <div class=\"student-profile-container\">\n\n        \n\n        <div class=\"student-profile-heading\">\n            <h2>Student Profile</h2>\n          \n        </div>\n\n        <div id=\"profileDetails\"></div>\n\n    </div>\n\n</div>\n\n\n\n\n\n\n<!-- =========================================================\n     STUDENT HOMEWORK PAGE\n========================================================= -->\n\n<div id=\"studentHomeworkPage\" class=\"student-homework-page\" style=\"display:none;\">\n\n    <div class=\"student-homework-container\">\n\n        <div class=\"student-homework-topbar\">\n            <div class=\"student-homework-title\">\n                <div class=\"student-homework-title-icon\">\n                    <i class=\"fas fa-book-open\"></i>\n                </div>\n                <div>\n                    <span class=\"student-homework-eyebrow\">ACADEMIC WORK</span>\n                    <h1>My Homework</h1>\n                    <p id=\"studentHomeworkSubtitle\">Assignments for your class</p>\n                </div>\n            </div>\n\n            <button type=\"button\" class=\"student-homework-refresh\" onclick=\"loadStudentHomework()\" title=\"Refresh homework\">\n                <i class=\"fas fa-rotate\"></i>\n                <span>Refresh</span>\n            </button>\n        </div>\n\n        <div class=\"student-homework-stats\">\n            <div class=\"student-hw-stat\">\n                <div class=\"student-hw-stat-icon blue\"><i class=\"fas fa-layer-group\"></i></div>\n                <div><span>This week</span><strong id=\"studentHwTotal\">0</strong></div>\n            </div>\n            <div class=\"student-hw-stat\">\n                <div class=\"student-hw-stat-icon\" style=\"background:#eef1ff;color:#3F51B5;\"><i class=\"fas fa-calendar-alt\"></i></div>\n                <div><span id=\"studentHwTermLabel\">Term total</span><strong id=\"studentHwTermTotal\">0</strong></div>\n            </div>\n            <div class=\"student-hw-stat\">\n                <div class=\"student-hw-stat-icon amber\"><i class=\"fas fa-clock\"></i></div>\n                <div><span>Pending</span><strong id=\"studentHwPending\">0</strong></div>\n            </div>\n            <div class=\"student-hw-stat\">\n                <div class=\"student-hw-stat-icon\" style=\"background:#e9f8ef;color:#16834a;\"><i class=\"fas fa-check-circle\"></i></div>\n                <div><span>Submitted</span><strong id=\"studentHwSubmitted\">0</strong></div>\n            </div>\n            <div class=\"student-hw-stat\">\n                <div class=\"student-hw-stat-icon red\"><i class=\"fas fa-calendar-xmark\"></i></div>\n                <div><span>Overdue</span><strong id=\"studentHwOverdue\">0</strong></div>\n            </div>\n        </div>\n\n        <div class=\"student-homework-tools\" style=\"flex-wrap:wrap;gap:10px;\">\n            <select id=\"studentHomeworkTermFilter\" onchange=\"onStudentHomeworkTermChange()\" style=\"min-height:36px;border-radius:9px;padding:6px 10px;font-size:12px;font-weight:600;border:1px solid #e0e3ec;background:#fff;\">\n                <option value=\"term1\">Term 1</option>\n                <option value=\"term2\">Term 2</option>\n                <option value=\"term3\">Term 3</option>\n            </select>\n            <div class=\"stu-hw-week\" style=\"display:flex;align-items:center;gap:6px;background:#eef1ff;border-radius:10px;padding:4px 6px;\">\n                <button type=\"button\" onclick=\"shiftStudentHomeworkWeek(-1)\" style=\"border:0;background:transparent;cursor:pointer;padding:6px 8px;color:#3F51B5;\"><i class=\"fas fa-chevron-left\"></i></button>\n                <span id=\"studentHomeworkWeekLabel\" style=\"font-size:12px;font-weight:700;min-width:150px;text-align:center;color:#303549;\">This week</span>\n                <button type=\"button\" onclick=\"shiftStudentHomeworkWeek(1)\" style=\"border:0;background:transparent;cursor:pointer;padding:6px 8px;color:#3F51B5;\"><i class=\"fas fa-chevron-right\"></i></button>\n                <button type=\"button\" onclick=\"resetStudentHomeworkWeek()\" style=\"border:0;background:#3F51B5;color:#fff;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;\">Today</button>\n            </div>\n            <div class=\"student-hw-search\">\n                <i class=\"fas fa-search\"></i>\n                <input id=\"studentHomeworkSearch\" type=\"search\" placeholder=\"Search homework, subject or title...\" oninput=\"filterStudentHomework()\">\n            </div>\n            <select id=\"studentHomeworkFilter\" onchange=\"filterStudentHomework()\">\n                <option value=\"all\">All this week</option>\n                <option value=\"pending\">Pending</option>\n                <option value=\"submitted\">Submitted</option>\n                <option value=\"overdue\">Overdue</option>\n            </select>\n        </div>\n\n        <div id=\"studentHomeworkList\" class=\"student-homework-list\">\n            <div class=\"hw-loading-card\">\n                <div class=\"hw-loading-spinner\"><i class=\"fas fa-spinner fa-spin\"></i></div>\n                <h3>Loading Homework...</h3>\n                <p>Please wait while your assignments are loaded.</p>\n            </div>\n        </div>\n\n    </div>\n</div>\n\n\n\n<!-- =========================================================\n     STUDENT HOMEWORK ANSWER MODAL\n========================================================= -->\n<div id=\"studentHomeworkAnswerModal\" class=\"hw-answer-modal\" aria-hidden=\"true\">\n    <div class=\"hw-answer-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"studentHomeworkAnswerTitle\">\n        <div class=\"hw-answer-header\">\n            <div>\n                <h2 id=\"studentHomeworkAnswerTitle\">Homework</h2>\n                <p id=\"studentHomeworkAnswerMeta\">Answer and submit your work to your teacher.</p>\n            </div>\n            <button type=\"button\" class=\"hw-answer-close\" onclick=\"closeHomeworkAnswer()\" aria-label=\"Close\">\n                <i class=\"fas fa-times\"></i>\n            </button>\n        </div>\n        <div class=\"hw-answer-body\">\n            <div class=\"hw-question-box\">\n                <span class=\"hw-question-label\">Teacher's Instructions / Questions</span>\n                <p id=\"studentHomeworkQuestion\" class=\"hw-question-text\"></p>\n            </div>\n            <div class=\"hw-answer-field\">\n                <label for=\"studentHomeworkAnswer\">Your Answer</label>\n                <textarea id=\"studentHomeworkAnswer\" placeholder=\"Write your answers here. Number your answers clearly where necessary...\"></textarea>\n            </div>\n        </div>\n        <div class=\"hw-answer-footer\">\n            <span id=\"hwSubmitStatus\" class=\"hw-submit-status\">Your latest answer will be saved for your teacher.</span>\n            <div class=\"hw-answer-actions\">\n                <button type=\"button\" class=\"hw-cancel-btn\" onclick=\"closeHomeworkAnswer()\">Cancel</button>\n                <button type=\"button\" id=\"studentHomeworkSubmitBtn\" class=\"hw-submit-btn\" onclick=\"submitStudentHomework()\">\n                    <i class=\"fas fa-paper-plane\"></i> Submit Homework\n                </button>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div id=\"resultsPage\" class=\"results-page\" style=\"display:none;\">\n\n    <div class=\"results-container\">\n\n        <!-- TOP BAR -->\n        <div class=\"results-topbar\">\n\n            <div class=\"results-title\">\n                <h2>Academic Results</h2>\n                <p>View your academic performance</p>\n            </div>\n\n            <div class=\"term-selector\">\n\n                <label for=\"resultTerm\">\n                    Academic Term\n                </label>\n\n                <select id=\"resultTerm\" onchange=\"changeTerm()\">\n                    <option value=\"term1\">Term 1</option>\n                    <option value=\"term2\">Term 2</option>\n                    <option value=\"term3\">Term 3</option>\n                </select>\n\n            </div>\n\n        </div>\n\n\n        <!-- RESULTS -->\n        <div id=\"resultsList\"></div>\n\n    </div>\n\n</div>\n\n\n\n<div id=\"subjectsPage\" style=\"display:none;padding:20px;\">\n\n<!-- subjects heading handled by modern UI -->\n\n<div id=\"subjectsList\"></div>\n\n</div>\n\n<!-- =========================================================\n     STUDENT MESSAGES\n========================================================= -->\n\n<div\n    id=\"messagesPage\"\n    class=\"portal-page\"\n    style=\"display:none;\"\n>\n\n    <div class=\"student-messages-page\">\n\n        <!-- ================================================\n             TOP BAR\n        ================================================= -->\n\n        <div class=\"messages-topbar\">\n\n            <h2>\n                Messages\n            </h2>\n\n            <div></div>\n\n        </div>\n\n\n        <!-- ================================================\n             CHAT LAYOUT\n        ================================================= -->\n\n        <div class=\"student-chat-layout\">\n\n\n            <!-- ============================================\n                 CONTACTS\n            ============================================= -->\n\n            <aside class=\"student-chat-contacts\">\n\n                <div class=\"student-contacts-header\">\n\n                    <h3>\n                        Conversations\n                    </h3>\n\n                    <span\n                        id=\"studentChatClassName\"\n                    >\n                        Loading...\n                    </span>\n\n                </div>\n\n\n                <div\n                    id=\"studentChatContacts\"\n                    class=\"student-chat-contact-list\"\n                >\n\n                    <div class=\"student-chat-loading\">\n\n                        <i class=\"fas fa-spinner fa-spin\"></i>\n\n                        Loading contacts...\n\n                    </div>\n\n                </div>\n\n            </aside>\n\n\n            <!-- ============================================\n                 CHAT\n            ============================================= -->\n\n            <section class=\"student-conversation\">\n\n\n                <!-- CHAT HEADER -->\n\n                <header\n                    class=\"student-conversation-header\"\n                >\n\n                    <div\n                        id=\"studentConversationAvatar\"\n                        class=\"student-conversation-avatar\"\n                    >\n\n                        <i class=\"fas fa-user\"></i>\n\n                    </div>\n\n\n                    <div>\n\n                        <h3\n                            id=\"studentConversationName\"\n                        >\n                            Select a conversation\n                        </h3>\n\n                        <span\n                            id=\"studentConversationType\"\n                        >\n                            No conversation selected\n                        </span>\n\n                    </div>\n\n                </header>\n\n\n                <!-- MESSAGES -->\n\n                <div\n                    id=\"studentMessages\"\n                    class=\"student-messages\"\n                >\n\n                    <div class=\"student-chat-empty\">\n\n                        <i class=\"far fa-comments\"></i>\n\n                        <h3>\n                            Start a conversation\n                        </h3>\n\n                        <p>\n                            Select your class teacher\n                            or a classmate.\n                        </p>\n\n                    </div>\n\n                </div>\n\n\n                <!-- COMPOSER -->\n\n                <div\n                    class=\"student-message-composer\"\n                >\n\n                    <textarea\n                        id=\"studentReply\"\n                        placeholder=\"Write a message...\"\n                        rows=\"1\"\n                        oninput=\"autoResizeStudentMessage(this)\"\n                        onkeydown=\"handleStudentMessageKey(event)\"\n                    ></textarea>\n\n\n                    <button\n                        class=\"send-message-btn\"\n                        onclick=\"sendStudentReply()\"\n                        title=\"Send message\"\n                    >\n\n                        <i class=\"fas fa-paper-plane\"></i>\n\n                    </button>\n\n                </div>\n\n            </section>\n\n        </div>\n\n    </div>\n\n</div>\n\n\n<div id=\"downloadsPage\" class=\"downloads-page\" style=\"display:none;\">\n\n    <div class=\"downloads-container\">\n\n        <!-- HEADER -->\n\n        <div class=\"downloads-header\">\n\n            <div class=\"downloads-heading\">\n\n                <div class=\"downloads-icon\">\n                    <i class=\"fas fa-download\"></i>\n                </div>\n\n                <div>\n                    <h2>Downloads</h2>\n\n                    <p>\n                        Generate and download your termly report cards\n                    </p>\n                </div>\n\n            </div>\n\n        </div>\n\n\n        <!-- REPORT CARDS -->\n\n        <div class=\"report-download-list\">\n\n\n            <!-- TERM 1 -->\n\n            <div class=\"report-download-card\">\n\n                <div class=\"report-file-icon\">\n                    <i class=\"fas fa-file-pdf\"></i>\n                </div>\n\n                <div class=\"report-file-info\">\n\n                    <h3>Term 1 Report</h3>\n\n                    <p>\n                        Academic performance report\n                    </p>\n\n                    <span>\n                        <i class=\"fas fa-file-pdf\"></i>\n                        PDF Document\n                    </span>\n\n                </div>\n\n                <button\n                    class=\"generate-report-btn\"\n                    onclick=\"generateStudentTermReport('term1')\"\n                >\n                    <i class=\"fas fa-download\"></i>\n                    <span>Download</span>\n                </button>\n\n            </div>\n\n\n\n            <!-- TERM 2 -->\n\n            <div class=\"report-download-card\">\n\n                <div class=\"report-file-icon\">\n                    <i class=\"fas fa-file-pdf\"></i>\n                </div>\n\n                <div class=\"report-file-info\">\n\n                    <h3>Term 2 Report</h3>\n\n                    <p>\n                        Academic performance report\n                    </p>\n\n                    <span>\n                        <i class=\"fas fa-file-pdf\"></i>\n                        PDF Document\n                    </span>\n\n                </div>\n\n                <button\n                    class=\"generate-report-btn\"\n                    onclick=\"generateStudentTermReport('term2')\"\n                >\n                    <i class=\"fas fa-download\"></i>\n                    <span>Download</span>\n                </button>\n\n            </div>\n\n\n\n            <!-- TERM 3 -->\n\n            <div class=\"report-download-card\">\n\n                <div class=\"report-file-icon\">\n                    <i class=\"fas fa-file-pdf\"></i>\n                </div>\n\n                <div class=\"report-file-info\">\n\n                    <h3>Term 3 Report</h3>\n\n                    <p>\n                        Academic performance report\n                    </p>\n\n                    <span>\n                        <i class=\"fas fa-file-pdf\"></i>\n                        PDF Document\n                    </span>\n\n                </div>\n\n                <button\n                    class=\"generate-report-btn\"\n                    onclick=\"generateStudentTermReport('term3')\"\n                >\n                    <i class=\"fas fa-download\"></i>\n                    <span>Download</span>\n                </button>\n\n            </div>\n\n\n        </div>\n\n\n        <div id=\"downloadStatus\"></div>\n\n\n    </div>\n\n</div>\n\n\n\n\n<div id=\"studentNoticeModal\" class=\"student-notice-modal\" aria-hidden=\"true\" onclick=\"if(event.target===this)closeStudentNoticeModal()\">\n  <div class=\"student-notice-dialog\" role=\"dialog\" aria-modal=\"true\">\n    <div class=\"student-notice-modal-header\">\n      <div>\n        <span id=\"studentNoticeModalPriority\" class=\"notification-priority normal\">normal</span>\n        <h2 id=\"studentNoticeModalTitle\">Notice</h2>\n        <p id=\"studentNoticeModalMeta\"></p>\n      </div>\n      <button type=\"button\" class=\"student-notice-modal-close\" onclick=\"closeStudentNoticeModal()\" aria-label=\"Close\">\n        <i class=\"fas fa-times\"></i>\n      </button>\n    </div>\n    <div class=\"student-notice-modal-body\">\n      <p id=\"studentNoticeModalMessage\"></p>\n    </div>\n    <div class=\"student-notice-modal-footer\">\n      <span id=\"studentNoticeModalReadStatus\"></span>\n      <button type=\"button\" class=\"student-notice-modal-done\" onclick=\"closeStudentNoticeModal()\">Done</button>\n    </div>\n  </div>\n</div>";
})();

/* Extracted from student.html — classic (non-module) app logic */

const supabaseUrl =
"https://ftslcifbzohhgljqcgus.supabase.co";

const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c2xjaWZiem9oaGdsanFjZ3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTQ5NjUsImV4cCI6MjA5NTAzMDk2NX0.O6bGKNOdRDH1u2t-MiK8y0ppO-q-P4gggSeDEGsoUrQ";

var supabaseClient =
window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

// Logged-in student used by all student portal pages
let currentStudent = null;



const passwordInput =
document.getElementById("password");

const toggle =
document.getElementById("togglePassword");


function initializeCurrentStudent() {
    try {
        currentStudent =
            JSON.parse(
                localStorage.getItem("loggedStudent")
            );

        return currentStudent;
    } catch (error) {
        console.error(
            "Unable to load current student:",
            error
        );

        currentStudent = null;
        return null;
    }
}

toggle.onclick = function(){

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

        toggle.classList.replace(
            "fa-eye",
            "fa-eye-slash"
        );

    }else{

        passwordInput.type = "password";

        toggle.classList.replace(
            "fa-eye-slash",
            "fa-eye"
        );

    }

};


document.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const studentid =
        document
        .getElementById("studentid")
        .value
        .trim();

    const password =
        document
        .getElementById("password")
        .value
        .trim();


    if(!studentid || !password){

        alert("Enter Student ID and Password");

        return;

    }


    const { data: student, error } =
        await supabaseClient
        .from("students")
        .select("*")
        .eq("studentid", studentid)
        .eq("studentpassword", password)
        .single();


    if(error || !student){

        console.error("Student Login Error:", error);

        alert("Invalid Student ID or Password");

        return;

    }


    // Save logged-in student
    localStorage.setItem(
        "loggedStudent",
        JSON.stringify(student)
    );

    currentStudent = student;


    // Load student name
    document.getElementById("studentName")
        .textContent =
        student.name || "";


    // Load student class
    document.getElementById("studentClass")
        .textContent =
        student.studentclass || "";


    // Load student photo from main system column "student-photos"
    applyStudentPhotoToPortal(student);

    // SBA logo + school logo from schools.schoolLogo
    loadPortalBranding(student);


    // Show modern shell
    document.getElementById("loginPage")
        .style.display = "none";

    const portal = document.getElementById("studentPortal");
    if (portal) {
        portal.style.display = "flex";
    }
    document.body.classList.add("app-logged-in");
    refreshDashboardHome(student);
    if (typeof startStudentChatRealtime === "function") {
        startStudentChatRealtime();
    }

});

/* =========================================================
   STUDENT NOTIFICATIONS
========================================================= */

let studentNotifications = [];
let currentNotificationFilter = "all";


/* =========================================================
   GET LOGGED-IN STUDENT
========================================================= */

function getLoggedStudent() {

    try {

        return JSON.parse(
            localStorage.getItem("loggedStudent")
        );

    } catch (error) {

        console.error(
            "Unable to read logged student:",
            error
        );

        return null;
    }
}


/* =========================================================
   OPEN NOTIFICATIONS
========================================================= */

async function openStudentNotifications() {
    showStudentPage(
        "notificationsPage",
        "Notifications",
        "Messages and announcements from your school"
    );
    setActiveNavByKey("notifications");
    await loadStudentNotifications();
}

async function loadStudentNotifications() {

    const student = getLoggedStudent();

    const container =
        document.getElementById("studentNotificationsList");

    if (!container) return;

    if (!student) {

        container.innerHTML = `
            <div class="notifications-empty">
                <div class="notifications-empty-icon">
                    <i class="fas fa-user-lock"></i>
                </div>

                <h3>Session not found</h3>

                <p>
                    Please log in again to view your notifications.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="notifications-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading notifications...</span>
        </div>
    `;

    try {

        const schoolid =
            student.schoolid ||
            student.schoolid ||
            student.schoolID;

        const studentClass =
            student.studentclass ||
            student.studentClass ||
            student.class ||
            "";

        const studentId =
            student.schoolid ||
            student.studentId ||
            "";

        console.log("STUDENT NOTICE INFO:", {
            schoolid,
            studentClass,
            studentId
        });

        if (!schoolid) {

            throw new Error(
                "Student school ID was not found."
            );

        }

        /*
         * IMPORTANT:
         * Use the SAME column names used by app.js
         */

        const {
            data,
            error
        } = await supabaseClient

            .from("notices")

            .select("*")

            .eq("schoolid", schoolid)

            .order("date", {
                ascending: false
            });


        if (error) {

            console.error(
                "Notification loading error:",
                error
            );

            throw error;
        }


        console.log(
            "All school notices:",
            data
        );


        /*
         * FILTER NOTICES
         */

        studentNotifications =
            (data || []).filter(notice => {

                const recipientType =
                    String(
                        notice.recipienttype ||
                        notice.recipientType ||
                        "school"
                    ).toLowerCase().trim();


                const recipientClass =
                    String(
                        notice.recipientclass ||
                        notice.recipientClass ||
                        ""
                    ).trim();


                /*
                 * SCHOOL-WIDE NOTICE
                 */

                if (
                    recipientType === "school"
                ) {

                    return true;

                }


                /*
                 * CLASS NOTICE
                 */

                if (
                    recipientType === "class" ||
                    recipientType === "teacher_class"
                ) {

                    return (
                        recipientClass &&
                        studentClass &&
                        recipientClass.toLowerCase() ===
                        String(studentClass)
                            .toLowerCase()
                            .trim()
                    );

                }


                /*
                 * INDIVIDUAL STUDENT
                 *
                 * Included for future support.
                 */

                if (
                    recipientType === "student"
                ) {

                    const noticeStudentId =
                        notice.recipientstudentid ||
                        notice.recipientStudentId ||
                        notice.recipient_student_id ||
                        "";

                    return (
                        String(noticeStudentId) ===
                        String(studentId)
                    );

                }


                return false;

            });


        console.log(
            "Student visible notices:",
            studentNotifications
        );


        /*
         * DISPLAY
         */

        renderStudentNotifications();

        updateStudentNotificationBadge();


    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

        container.innerHTML = `
            <div class="notifications-empty">

                <div class="notifications-empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>

                <h3>Unable to load notifications</h3>

                <p>
                    ${escapeNotificationText(
                        error.message ||
                        "Please try again later."
                    )}
                </p>

            </div>
        `;

    }

}

/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderStudentNotifications() {

    const container =
        document.getElementById(
            "studentNotificationsList"
        );

    if (!container) return;


    let notifications =
        [...studentNotifications];


    /* FILTER */

    if (
        currentNotificationFilter ===
        "unread"
    ) {

        notifications =
            notifications.filter(
                notification =>
                    !isNotificationRead(
                        notification
                    )
            );
    }


    /* EMPTY */

    if (
        notifications.length === 0
    ) {

        container.innerHTML = `

            <div class="notifications-empty">

                <div class="notifications-empty-icon">

                    <i class="fas fa-bell-slash"></i>

                </div>

                <h3>
                    No notifications
                </h3>

                <p>
                    You're all caught up.
                </p>

            </div>

        `;

        return;
    }


    let html = "";


    notifications.forEach(
        notification => {

            const read =
                isNotificationRead(
                    notification
                );


            const priority =
                (
                    notification.priority ||
                    "normal"
                ).toLowerCase();


            const sender =
                notification.sender_name ||
                (
                    notification.sender_role ===
                    "admin"
                        ? "School Administration"
                        : "Class Teacher"
                );


            html += `

                <div
                    class="
                        student-notification-card
                        ${read ? "" : "unread"}
                    "
                    data-notice-id="${String(notification.id ?? "").replace(/"/g, "")}"
                    role="button"
                    tabindex="0"
                >

                    <div class="notification-card-icon">

                        <i class="fas fa-bell"></i>

                    </div>


                    <div class="notification-card-content">

                        <div class="notification-card-top">

                            <h3 class="notification-card-title">

                                ${escapeNotificationText(
                                    notification.title ||
                                    "School Notification"
                                )}

                            </h3>


                            <span
                                class="notification-card-date"
                            >

                                ${formatNotificationDate(
                                    notification.created_at ||
                                    notification.date
                                )}

                            </span>

                        </div>


                        <p
                            class="
                                notification-card-message
                            "
                        >

                            ${escapeNotificationText(
                                notification.message ||
                                ""
                            )}

                        </p>


                        <div
                            class="
                                notification-card-sender
                            "
                        >

                            <i class="fas fa-user"></i>

                            <span>
                                ${escapeNotificationText(
                                    sender
                                )}
                            </span>

                            <span
                                class="
                                    notification-priority
                                    ${priority}
                                "
                            >
                                ${priority}
                            </span>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML = html;

}


/* =========================================================
   OPEN ONE NOTIFICATION
========================================================= */


async function openStudentNotification(notificationId) {
    const id = String(notificationId ?? "").trim();
    if (!id) {
        console.warn("openStudentNotification: empty id");
        return;
    }

    const notification = studentNotifications.find(
        n => String(n.id) === id
    );

    if (!notification) {
        console.warn("Notice not found for id:", id, studentNotifications);
        return;
    }

    showStudentNoticeModal(notification);

    try {
        await markStudentNotificationRead(notification);
    } catch (err) {
        console.error("Mark notice read failed:", err);
    }

    const statusEl = document.getElementById("studentNoticeModalReadStatus");
    if (statusEl) statusEl.textContent = "Marked as read";

    updateStudentNotificationBadge();
    renderStudentNotifications();
}

function showStudentNoticeModal(notification) {
    const modal = document.getElementById("studentNoticeModal");
    if (!modal) {
        console.error("studentNoticeModal missing from DOM");
        return;
    }

    const title = document.getElementById("studentNoticeModalTitle");
    const message = document.getElementById("studentNoticeModalMessage");
    const meta = document.getElementById("studentNoticeModalMeta");
    const priorityEl = document.getElementById("studentNoticeModalPriority");
    const statusEl = document.getElementById("studentNoticeModalReadStatus");

    const priority = String(notification.priority || "normal").toLowerCase();
    const sender =
        notification.sender_name ||
        (String(notification.sender_role || "").toLowerCase() === "admin"
            ? "School Administration"
            : "Class Teacher");
    const when = formatNotificationDate(
        notification.created_at || notification.date
    );

    if (title) title.textContent = notification.title || "School Notification";
    if (message) message.textContent = notification.message || "";
    if (meta) meta.textContent = [sender, when].filter(Boolean).join(" · ");
    if (priorityEl) {
        priorityEl.className = "notification-priority " + priority;
        priorityEl.textContent = priority;
    }
    if (statusEl) {
        statusEl.textContent = isNotificationRead(notification)
            ? "Already read"
            : "Marking as read…";
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeStudentNoticeModal() {
    const modal = document.getElementById("studentNoticeModal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/* Click / keyboard open for notice cards (event delegation) */
document.addEventListener("click", function (e) {
    const card = e.target.closest && e.target.closest(".student-notification-card[data-notice-id]");
    if (!card) return;
    const id = card.getAttribute("data-notice-id");
    if (id) openStudentNotification(id);
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeStudentNoticeModal();
    if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest && e.target.closest(".student-notification-card[data-notice-id]");
        if (card) {
            e.preventDefault();
            const id = card.getAttribute("data-notice-id");
            if (id) openStudentNotification(id);
        }
    }
});


/* =========================================================
   CHECK IF READ
========================================================= */

function getStudentNoticeKeys(student) {
    if (!student) return [];
    return [student.studentid, student.studentId, student.id]
        .filter(v => v !== undefined && v !== null && String(v).trim() !== "")
        .map(v => String(v));
}

function isNotificationRead(notification) {
    const student = getLoggedStudent();
    if (!student || !notification) return false;

    let readBy = notification.read_by;
    if (typeof readBy === "string") {
        try { readBy = JSON.parse(readBy); } catch (e) { readBy = []; }
    }
    if (!Array.isArray(readBy)) readBy = [];
    readBy = readBy.map(String);

    const keys = getStudentNoticeKeys(student);
    return keys.some(k => readBy.includes(k));
}


/* =========================================================
   MARK READ
========================================================= */

async function markStudentNotificationRead(notification) {
    const student = getLoggedStudent();
    if (!student || !notification) return;

    let readBy = notification.read_by;
    if (typeof readBy === "string") {
        try { readBy = JSON.parse(readBy); } catch (e) { readBy = []; }
    }
    if (!Array.isArray(readBy)) readBy = [];
    readBy = [...readBy].map(String);

    const keys = getStudentNoticeKeys(student);
    const primaryKey = keys[0];
    if (!primaryKey) return;

    if (keys.some(k => readBy.includes(k))) {
        return;
    }

    readBy.push(primaryKey);

    const { data, error } = await supabaseClient
        .from("notices")
        .update({ read_by: readBy })
        .eq("id", notification.id)
        .select()
        .single();

    if (error) {
        console.error("Unable to mark notification read:", error);
        // Still update local state so UI feels responsive
        notification.read_by = readBy;
        return;
    }

    notification.read_by = data?.read_by || readBy;

    // Keep array in sync
    const idx = studentNotifications.findIndex(n => String(n.id) === String(notification.id));
    if (idx >= 0) {
        studentNotifications[idx].read_by = notification.read_by;
    }
}

/* =========================================================
   NOTIFICATION BADGE
========================================================= */

async function updateStudentNotificationBadge() {

    const badge =
        document.getElementById(
            "studentNotificationBadge"
        );

    if (!badge) return;


    const unreadCount =
        studentNotifications.filter(
            notification =>
                !isNotificationRead(
                    notification
                )
        ).length;


    const sideBadge = document.getElementById("sidebarNotificationBadge");
    const dashNotif = document.getElementById("dashNotifCount");

    if (unreadCount <= 0) {
        badge.style.display = "none";
        badge.textContent = "0";
        if (sideBadge) {
            sideBadge.style.display = "none";
            sideBadge.textContent = "0";
        }
        if (dashNotif) dashNotif.textContent = "0";
        return;
    }

    const label = unreadCount > 99 ? "99+" : String(unreadCount);
    badge.style.display = "flex";
    badge.textContent = label;
    if (sideBadge) {
        sideBadge.style.display = "flex";
        sideBadge.textContent = label;
    }
    if (dashNotif) dashNotif.textContent = label;
}


/* =========================================================
   FILTER
========================================================= */

function filterStudentNotifications(
    filter,
    button
) {

    currentNotificationFilter =
        filter;


    document
        .querySelectorAll(
            ".notification-filter-btn"
        )
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );
    }


    renderStudentNotifications();
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatNotificationDate(
    date
) {

    if (!date) return "";


    const d =
        new Date(date);


    if (isNaN(d.getTime())) {

        return "";
    }


    return d.toLocaleString(
        [],
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   ESCAPE TEXT
========================================================= */

function escapeNotificationText(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;
}





/* =========================================================
   STUDENT PORTAL - OPEN PROFILE
   ---------------------------------------------------------
   Fetches the latest student information from the MAIN
   SYSTEM and displays:

   • Student information
   • School NAME instead of school code
   • Parent / Guardian information
   • Account status

   IMPORTANT:
   - Student data comes directly from "students"
   - Parent fields use the MAIN SYSTEM column names
   - School name is fetched from "schools"
   - School name column is "schoolname"
========================================================= */

async function openProfile() {

    // =====================================================
    // HIDE STUDENT PORTAL
    // SHOW PROFILE PAGE
    // =====================================================

    const studentPortal =
        document.getElementById("studentPortal");

    const profilePage =
        document.getElementById("profilePage");

    if (studentPortal) {
        showStudentPage(
            "profilePage",
            "Profile",
            "Your personal and school information"
        );
        setActiveNavByKey("profile");
    }

    try {

        // =================================================
        // GET LOGGED-IN STUDENT
        // =================================================

        const loggedStudent =
            JSON.parse(
                localStorage.getItem("loggedStudent")
            );

        // =================================================
        // CHECK STUDENT SESSION
        // =================================================

        if (!loggedStudent || !loggedStudent.id) {

            alert(
                "Student session not found. Please login again."
            );

            return;
        }

        console.log(
            "Logged student:",
            loggedStudent
        );


        // =================================================
        // FETCH LATEST STUDENT RECORD
        // =================================================

        const {
            data,
            error
        } = await supabaseClient
            .from("students")
            .select("*")
            .eq("id", loggedStudent.id)
            .single();


        // =================================================
        // HANDLE STUDENT FETCH ERROR
        // =================================================

        if (error) {

            console.error(
                "Student profile fetch error:",
                error
            );

            alert(
                "Unable to load your profile."
            );

            return;
        }


        // =================================================
        // CHECK STUDENT DATA
        // =================================================

        if (!data) {

            alert(
                "Student profile not found."
            );

            return;
        }

        console.log(
            "Latest student record from MAIN SYSTEM:",
            data
        );


        // =================================================
        // STUDENT INFORMATION
        // =================================================

        const studentName =
            data.name ||
            "Student";

        const studentID =
            data.studentid ||
            "No Student ID";

        const studentClass =
            data.studentclass ||
            "Class not assigned";

        const gender =
            data.gender ||
            "Not specified";


        // =================================================
        // SCHOOL ID
        //
        // students.schoolid contains the school ID/code.
        //
        // Example:
        // students.schoolid = SKY-123456
        //
        // This is matched with:
        // schools.schoolid
        //
        // Then we fetch:
        // schools.schoolname
        // =================================================

        const schoolID =
            data.schoolid ||
            null;


        // =================================================
        // STUDENT PHOTO
        // =================================================

        const studentPhoto =
            getStudentPhotoUrl(data);


        // =================================================
        // PARENT / GUARDIAN INFORMATION
        // =================================================

        const parentName =
            data.parent_name ||
            "Not provided";

        const parentNumber =
            data.parent_number ||
            "Not provided";

        const parentOccupation =
            data.parent_occupation ||
            "Not provided";

        const parentAddress =
            data.parent_address ||
            "Not provided";


        // =================================================
        // FETCH SCHOOL NAME FROM SUPABASE
        //
        // students.schoolid
        //        ↓
        // schools.schoolid
        //        ↓
        // schools.schoolname
        // =================================================

        let schoolName =
            "School not assigned";

        if (schoolID) {

            console.log(
                "Looking up school using schoolid:",
                schoolID
            );


            const {
                data: schoolData,
                error: schoolError
            } = await supabaseClient
                .from("schools")
                .select("schoolname")
                .eq("schoolid", schoolID)
                .maybeSingle();


            // =================================================
            // SCHOOL QUERY ERROR
            // =================================================

            if (schoolError) {

                console.error(
                    "School fetch error:",
                    schoolError
                );

            }


            // =================================================
            // SCHOOL FOUND
            // =================================================

            if (
                schoolData &&
                schoolData.schoolname
            ) {

                schoolName =
                    schoolData.schoolname;

            } else {

                console.warn(
                    "No school found for schoolid:",
                    schoolID
                );

            }


            console.log(
                "School Name:",
                schoolName
            );

        } else {

            console.warn(
                "Student does not have a schoolid."
            );

        }


        // =================================================
        // ACCOUNT INFORMATION
        // =================================================

        const passwordChanged =
            data.passwordchanged === true;

        const accountStatus =
            passwordChanged
                ? "Active"
                : "Temporary Password";

        const statusClass =
            passwordChanged
                ? "active"
                : "inactive";


        // =================================================
        // STUDENT STATUS
        // =================================================

        const isActive =
            data.graduated !== true;


        // =================================================
        // FIND PROFILE CONTAINER
        // =================================================

        const profileDetails =
            document.getElementById(
                "profileDetails"
            );

        if (!profileDetails) {

            console.error(
                "profileDetails element not found."
            );

            return;
        }


        // =================================================
        // BUILD PROFILE
        // =================================================

        profileDetails.innerHTML = `

            <div class="portal-profile">

                <!-- ======================================
                     PROFILE HEADER
                ======================================= -->

                <div class="portal-profile-header">

                    <div class="portal-profile-header-inner">

                        <!-- STUDENT PHOTO -->

                        <div class="portal-profile-photo-wrap">

                            <img
                                src="${studentPhoto}"
                                class="portal-profile-photo"
                                onerror="
                                    this.src=getDefaultStudentAvatar();
                                "
                                alt="Student Photo">

                            <span
                                class="portal-profile-photo-status ${
                                    isActive
                                        ? "active"
                                        : "inactive"
                                }"
                            ></span>

                        </div>


                        <!-- STUDENT HEADING -->

                        <div class="portal-profile-heading">

                            <span class="portal-profile-label">
                                STUDENT PROFILE
                            </span>

                            <h1>
                                ${studentName}
                            </h1>

                            <div class="portal-profile-meta">

                                <span>
                                    <i class="fas fa-id-card"></i>
                                    ${studentID}
                                </span>

                                <span>
                                    <i class="fas fa-graduation-cap"></i>
                                    ${studentClass}
                                </span>

                            </div>

                        </div>


                        <!-- STUDENT STATUS -->

                        <div
                            class="portal-profile-status ${
                                isActive
                                    ? "active"
                                    : "inactive"
                            }"
                        >

                            <span
                                class="portal-status-dot"
                            ></span>

                            ${
                                isActive
                                    ? "Active Student"
                                    : "Graduated"
                            }

                        </div>

                    </div>

                </div>


                <!-- ======================================
                     PROFILE BODY
                ======================================= -->

                <div class="portal-profile-body">


                    <!-- ==================================
                         STUDENT INFORMATION
                    =================================== -->

                    <section
                        class="portal-profile-section"
                    >

                        <div
                            class="portal-section-heading"
                        >

                            <div
                                class="portal-section-icon"
                            >

                                <i
                                    class="fas fa-user-graduate"
                                ></i>

                            </div>

                            <div>

                                <h2>
                                    Student Information
                                </h2>

                                <p>
                                    Basic information about your
                                    student account
                                </p>

                            </div>

                        </div>


                        <div
                            class="portal-info-grid"
                        >


                            <!-- STUDENT ID -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-id-card"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Student ID
                                    </span>

                                    <strong>
                                        ${studentID}
                                    </strong>

                                </div>

                            </div>



                            <!-- CLASS -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-users"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Class
                                    </span>

                                    <strong>
                                        ${studentClass}
                                    </strong>

                                </div>

                            </div>



                            <!-- GENDER -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-venus-mars"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Gender
                                    </span>

                                    <strong>
                                        ${gender}
                                    </strong>

                                </div>

                            </div>



                            <!-- SCHOOL NAME -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-school"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        School
                                    </span>

                                    <strong>
                                        ${schoolName}
                                    </strong>

                                </div>

                            </div>


                        </div>

                    </section>



                    <!-- ==================================
                         PARENT / GUARDIAN
                    =================================== -->

                    <section
                        class="portal-profile-section"
                    >

                        <div
                            class="portal-section-heading"
                        >

                            <div
                                class="portal-section-icon parent"
                            >

                                <i
                                    class="fas fa-user-shield"
                                ></i>

                            </div>


                            <div>

                                <h2>
                                    Parent / Guardian
                                </h2>

                                <p>
                                    Parent or guardian information
                                </p>

                            </div>

                        </div>


                        <div
                            class="portal-info-grid"
                        >


                            <!-- PARENT NAME -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-user"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Parent / Guardian Name
                                    </span>

                                    <strong>
                                        ${parentName}
                                    </strong>

                                </div>

                            </div>



                            <!-- PARENT PHONE -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-phone"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Contact Number
                                    </span>

                                    <strong>
                                        ${parentNumber}
                                    </strong>

                                </div>

                            </div>



                            <!-- PARENT OCCUPATION -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-briefcase"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Occupation
                                    </span>

                                    <strong>
                                        ${parentOccupation}
                                    </strong>

                                </div>

                            </div>



                            <!-- PARENT ADDRESS -->

                            <div
                                class="portal-info-card"
                            >

                                <div
                                    class="portal-info-icon"
                                >

                                    <i
                                        class="fas fa-location-dot"
                                    ></i>

                                </div>


                                <div
                                    class="portal-info-content"
                                >

                                    <span
                                        class="portal-info-label"
                                    >
                                        Address
                                    </span>

                                    <strong>
                                        ${parentAddress}
                                    </strong>

                                </div>

                            </div>


                        </div>

                    </section>



                    <!-- ==================================
                         ACCOUNT STATUS
                    =================================== -->

                    <section
                        class="portal-profile-section"
                    >

                        <div
                            class="portal-section-heading"
                        >

                            <div
                                class="portal-section-icon account"
                            >

                                <i
                                    class="fas fa-shield-alt"
                                ></i>

                            </div>


                            <div>

                                <h2>
                                    Account Status
                                </h2>

                                <p>
                                    Information about your
                                    student portal account
                                </p>

                            </div>

                        </div>


                        <div
                            class="portal-account-card"
                        >


                            <!-- ACCOUNT STATUS -->

                            <div
                                class="portal-account-item"
                            >

                                <div
                                    class="portal-account-icon"
                                >

                                    <i
                                        class="fas fa-check-circle"
                                    ></i>

                                </div>


                                <div>

                                    <span>
                                        Account Status
                                    </span>

                                    <strong>
                                        ${
                                            isActive
                                                ? "Active"
                                                : "Graduated"
                                        }
                                    </strong>

                                </div>

                            </div>



                            <div
                                class="portal-account-divider"
                            ></div>



                            <!-- PASSWORD STATUS -->

                            <div
                                class="portal-account-item"
                            >

                                <div
                                    class="portal-account-icon"
                                >

                                    <i
                                        class="fas fa-key"
                                    ></i>

                                </div>


                                <div>

                                    <span>
                                        Password Status
                                    </span>

                                    <strong>
                                        ${
                                            passwordChanged
                                                ? "Password Changed"
                                                : "Default Password"
                                        }
                                    </strong>

                                </div>

                            </div>


                        </div>

                    </section>



                    <!-- ==================================
                         FOOTER
                    =================================== -->

                    <!-- sidebar nav -->

                </div>

            </div>

        `;


        // =================================================
        // DEBUG INFORMATION
        // =================================================

        console.log(
            "=========================================="
        );

        console.log(
            "STUDENT PORTAL PROFILE LOADED"
        );

        console.log(
            "Student Name:",
            studentName
        );

        console.log(
            "Student ID:",
            studentID
        );

        console.log(
            "Class:",
            studentClass
        );

        console.log(
            "School ID:",
            schoolID
        );

        console.log(
            "School Name:",
            schoolName
        );

        console.log(
            "Parent Name:",
            parentName
        );

        console.log(
            "Parent Number:",
            parentNumber
        );

        console.log(
            "Parent Occupation:",
            parentOccupation
        );

        console.log(
            "Parent Address:",
            parentAddress
        );

        console.log(
            "=========================================="
        );


    } catch (err) {

        // =================================================
        // UNEXPECTED ERROR
        // =================================================

        console.error(
            "Unexpected error loading student profile:",
            err
        );

        alert(
            "Something went wrong while loading your profile."
        );

    }

}









/* =========================================================
   STUDENT HOMEWORK
========================================================= */

let studentHomeworkData = [];
let studentHomeworkSubmissions = {};
let activeHomeworkForAnswer = null;
let studentHomeworkWeekOffset = 0;
let studentTermSettings = null;
let studentHomeworkTermSelected = "term1";

function getPortalStudent() {
    if (currentStudent) return currentStudent;

    try {
        currentStudent = JSON.parse(
            localStorage.getItem("loggedStudent") || "null"
        );
    } catch (error) {
        console.error("Unable to read logged student:", error);
        currentStudent = null;
    }

    return currentStudent;
}

function escapeHomeworkText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function homeworkDate(value) {
    if (!value) return "Not set";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function homeworkStatus(homework) {
    if (!homework.deadline) return "pending";
    const deadline = new Date(homework.deadline);
    if (Number.isNaN(deadline.getTime())) return "pending";
    return deadline.getTime() < Date.now() ? "overdue" : "pending";
}

function openHomework() {
    const portal = document.getElementById("studentPortal");
    const page = document.getElementById("studentHomeworkPage");

    showStudentPage(
        "studentHomeworkPage",
        "Homework",
        "Assignments and class work"
    );
    setActiveNavByKey("homework");

    // Ensure session is available for homework load
    const student = (typeof getPortalStudent === "function")
        ? getPortalStudent()
        : null;

    if (!student) {
        alert("Please log in again to view homework.");
        return;
    }

    const subtitle = document.getElementById("studentHomeworkSubtitle");
    if (subtitle) {
        subtitle.textContent = `Assignments for ${student.studentclass || student.class || "your class"}`;
    }

    loadStudentHomework();
}

async function loadStudentHomework() {

    console.log("========== LOAD STUDENT HOMEWORK ==========");

    if (!currentStudent && typeof getPortalStudent === "function") {
        currentStudent = getPortalStudent();
    }

    if (!currentStudent) {
        console.warn("No current student found.");
        const list = document.getElementById("studentHomeworkList");
        if (list) {
            list.innerHTML = `<div class="hw-empty-card"><div class="hw-empty-icon"><i class="fas fa-user-lock"></i></div><h3>Session expired</h3><p>Please log in again to view homework.</p></div>`;
        }
        return;
    }

    try {

        const student = currentStudent;

        const studentClass = String(
            student.studentclass ||
            student.studentClass ||
            student.class ||
            ""
        ).trim();

        const schoolid =
            student.schoolid ||
            student.schoolID ||
            student.schoolId ||
            "";

        if (!studentClass) {
            console.warn("Student class not found.");
            return;
        }

        console.log("Student:", student);
        console.log("Student Class:", studentClass);
        console.log("School ID:", schoolid);


        /* --------------------------------------------------------
           LOAD HOMEWORK
        -------------------------------------------------------- */

        let query = supabaseClient
            .from("homework")
            .select("*")
            .eq("class", studentClass)
            .order("created_at", {
                ascending: false
            });

        if (schoolid) {
            query = query.eq("schoolid", schoolid);
        }

        const {
            data,
            error
        } = await query;

        if (error) {
            console.error(
                "Error loading homework:",
                error
            );
            throw error;
        }

        studentHomeworkData = Array.isArray(data)
            ? data
            : [];

        console.log(
            "Homework loaded:",
            studentHomeworkData.length
        );

        await loadStudentTermSettings(schoolid);

        /* --------------------------------------------------------
           LOAD STUDENT SUBMISSIONS
        -------------------------------------------------------- */

        await loadStudentHomeworkSubmissions(student);


        /* --------------------------------------------------------
           UPDATE UI
        -------------------------------------------------------- */

        updateHomeworkStats();

        if (typeof filterStudentHomework === "function") {
            filterStudentHomework();
        }

    } catch (error) {

        console.error(
            "loadStudentHomework error:",
            error
        );

        studentHomeworkData = [];
        studentHomeworkSubmissions = {};

        if (typeof updateHomeworkStats === "function") {
            updateHomeworkStats();
        }
    }
}


/* ============================================================
   LOAD THIS STUDENT'S HOMEWORK SUBMISSIONS
============================================================ */

async function loadStudentHomeworkSubmissions(student) {

    console.log(
        "========== LOAD STUDENT HOMEWORK SUBMISSIONS =========="
    );

    studentHomeworkSubmissions = {};

    try {

        if (!student || !student.id) {
            console.warn(
                "Student ID is missing. Cannot load submissions."
            );
            return;
        }

        const studentId = String(student.id);

        const schoolid = String(
            student.schoolid ||
            student.schoolID ||
            student.schoolId ||
            ""
        );

        console.log(
            "Loading submissions for student:",
            studentId
        );


        let query = supabaseClient
            .from("homework_submissions")
            .select("*")
            .eq("student_id", studentId);

        if (schoolid) {
            query = query.eq("schoolid", schoolid);
        }

        const {
            data,
            error
        } = await query;

        if (error) {
            console.error(
                "Error loading homework submissions:",
                error
            );

            throw error;
        }


        /* --------------------------------------------------------
           STORE SUBMISSIONS USING HOMEWORK ID
        -------------------------------------------------------- */

        (data || []).forEach(submission => {

            if (!submission.homework_id) {
                return;
            }

            studentHomeworkSubmissions[
                String(submission.homework_id)
            ] = submission;
        });


        console.log(
            "Student submissions loaded:",
            data?.length || 0
        );

        console.log(
            "Student homework submission map:",
            studentHomeworkSubmissions
        );

    } catch (error) {

        console.warn(
            "Homework submissions could not be loaded:",
            error.message || error
        );
    }
}


/* ============================================================
   GET SUBMISSION FOR A PARTICULAR HOMEWORK
============================================================ */

function getHomeworkSubmission(homework) {

    if (!homework || !homework.id) {
        return null;
    }

    return (
        studentHomeworkSubmissions[
            String(homework.id)
        ] || null
    );
}

/* ============================================================
   FORMAT MARK
============================================================ */

function formatHomeworkMark(mark) {

    if (
        mark === null ||
        mark === undefined ||
        mark === ""
    ) {
        return "";
    }

    const number = Number(mark);

    if (!Number.isFinite(number)) {
        return String(mark);
    }

    if (Number.isInteger(number)) {
        return String(number);
    }

    return number.toFixed(2);
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHomeworkHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getStudentHomeworkWeekRange(offset = 0) {
    const now = new Date();
    now.setHours(0,0,0,0);
    const day = now.getDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + toMonday + (offset * 7));
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    return { start, end };
}
function isStudentHomeworkInWeek(homework) {
    const { start, end } = getStudentHomeworkWeekRange(studentHomeworkWeekOffset || 0);
    const raw = homework.date_given || homework.created_at;
    if (!raw) return false;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return false;
    return d >= start && d <= end;
}
function updateStudentHomeworkWeekLabel() {
    const el = document.getElementById("studentHomeworkWeekLabel");
    if (!el) return;
    const { start, end } = getStudentHomeworkWeekRange(studentHomeworkWeekOffset || 0);
    const opts = { day: "numeric", month: "short" };
    const a = start.toLocaleDateString(undefined, opts);
    const b = end.toLocaleDateString(undefined, opts);
    const off = studentHomeworkWeekOffset || 0;
    if (off === 0) el.textContent = `This week (${a} – ${b})`;
    else if (off === -1) el.textContent = `Last week (${a} – ${b})`;
    else if (off === 1) el.textContent = `Next week (${a} – ${b})`;
    else el.textContent = `${a} – ${b}`;
}
function shiftStudentHomeworkWeek(delta) {
    studentHomeworkWeekOffset = (studentHomeworkWeekOffset || 0) + delta;
    updateStudentHomeworkWeekLabel();
    filterStudentHomework();
    updateHomeworkStats();
}
function resetStudentHomeworkWeek() {
    studentHomeworkWeekOffset = 0;
    updateStudentHomeworkWeekLabel();
    filterStudentHomework();
    updateHomeworkStats();
}
function getStudentTermBounds(term) {
    const t = term || studentHomeworkTermSelected || "term1";
    const prefix = t === "term1" ? "t1" : t === "term2" ? "t2" : t === "term3" ? "t3" : null;
    if (!prefix || !studentTermSettings) return { start: null, end: null };
    return {
        start: studentTermSettings[prefix + "start"] || null,
        end: studentTermSettings[prefix + "end"] || null
    };
}
function getStudentHomeworkForTerm(term) {
    const bounds = getStudentTermBounds(term);
    if (!bounds.start || !bounds.end) return (studentHomeworkData || []).slice();
    const start = new Date(bounds.start + "T00:00:00");
    const end = new Date(bounds.end + "T23:59:59");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return (studentHomeworkData || []).slice();
    return (studentHomeworkData || []).filter(h => {
        const raw = h.date_given || h.created_at;
        if (!raw) return false;
        const d = new Date(raw);
        return !Number.isNaN(d.getTime()) && d >= start && d <= end;
    });
}
function onStudentHomeworkTermChange() {
    const sel = document.getElementById("studentHomeworkTermFilter");
    studentHomeworkTermSelected = sel?.value || "term1";
    updateHomeworkStats();
}
async function loadStudentTermSettings(schoolid) {
    if (!schoolid || typeof supabaseClient === "undefined") return;
    try {
        const { data, error } = await supabaseClient
            .from("termsettings")
            .select("*")
            .eq("schoolid", schoolid)
            .single();
        if (!error && data) studentTermSettings = data;
    } catch (e) {
        console.warn("Student term settings:", e);
    }
}

function updateHomeworkStats() {
    const weekItems = (studentHomeworkData || []).filter(h => isStudentHomeworkInWeek(h));
    const total = weekItems.length;
    const submitted = weekItems.filter(h => !!getHomeworkSubmission(h)).length;
    const overdue = weekItems.filter(h => !getHomeworkSubmission(h) && homeworkStatus(h) === "overdue").length;
    const pending = Math.max(0, total - submitted - overdue);
    const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
    set("studentHwTotal", total);
    set("studentHwPending", pending);
    set("studentHwSubmitted", submitted);
    set("studentHwOverdue", overdue);
    const termItems = getStudentHomeworkForTerm(studentHomeworkTermSelected);
    set("studentHwTermTotal", termItems.length);
    const label = document.getElementById("studentHwTermLabel");
    if (label) label.textContent = ((studentHomeworkTermSelected || "term1").replace("term", "Term ")) + " total";
}

function filterStudentHomework() {
    const list = document.getElementById("studentHomeworkList");
    if (!list) return;
    updateStudentHomeworkWeekLabel();
    const search = (document.getElementById("studentHomeworkSearch")?.value || "").trim().toLowerCase();
    const filter = document.getElementById("studentHomeworkFilter")?.value || "all";
    const weekItems = studentHomeworkData.filter(isStudentHomeworkInWeek);
    const filtered = weekItems.filter(homework => {
        const haystack = [homework.title, homework.subject, homework.description, homework.class].join(" ").toLowerCase();
        const submission = getHomeworkSubmission(homework);
        const status = submission ? "submitted" : homeworkStatus(homework);
        return (!search || haystack.includes(search)) && (filter === "all" || status === filter);
    });
    if (!filtered.length) {
        list.innerHTML = `<div class="hw-empty-card"><div class="hw-empty-icon"><i class="fas fa-book-open"></i></div><h3>${weekItems.length ? "No Matching Homework" : "No Homework This Week"}</h3><p>${weekItems.length ? "Try another search or change the filter." : "No homework for this week. Use the arrows to view other weeks."}</p></div>`;
        return;
    }
    list.innerHTML = filtered.map(renderStudentHomeworkCard).join("");
}

/* ============================================================
   RENDER STUDENT HOMEWORK CARD
============================================================ */

function renderStudentHomeworkCard(homework) {

    if (!homework) {
        return "";
    }

    const submission =
        getHomeworkSubmission(homework);


    /* --------------------------------------------------------
       BASIC HOMEWORK INFORMATION
    -------------------------------------------------------- */

    const title =
        homework.title ||
        homework.homework_title ||
        "Homework";

    const subject =
        homework.subject ||
        "General";

    const description =
        homework.description ||
        homework.instructions ||
        "";

    const dueDate =
        homework.due_date ||
        homework.deadline ||
        "";

    const maxMarks =
        homework.max_mark ||
        homework.max_marks ||
        homework.total_marks ||
        100;


    /* --------------------------------------------------------
       SUBMISSION STATUS
    -------------------------------------------------------- */

    const hasSubmission =
        !!submission;

    const hasMark =
        submission &&
        submission.mark !== null &&
        submission.mark !== undefined &&
        submission.mark !== "";


    const isMarked =
        hasMark ||
        (
            submission &&
            String(submission.status || "").toLowerCase() ===
            "marked"
        );


    /* --------------------------------------------------------
       STATUS BADGE
    -------------------------------------------------------- */

    let statusHTML = "";

    if (isMarked) {

        statusHTML = `
            <span class="student-hw-status marked">
                <i class="fas fa-check-circle"></i>
                Marked
            </span>
        `;

    } else if (hasSubmission) {

        statusHTML = `
            <span class="student-hw-status submitted">
                <i class="fas fa-paper-plane"></i>
                Submitted
            </span>
        `;

    } else {

        statusHTML = `
            <span class="student-hw-status pending">
                <i class="fas fa-clock"></i>
                Not Submitted
            </span>
        `;
    }


    /* --------------------------------------------------------
       SUBMISSION DATE
    -------------------------------------------------------- */

    let submissionDateHTML = "";

    if (submission && submission.submitted_at) {

        const date = new Date(
            submission.submitted_at
        );

        if (!Number.isNaN(date.getTime())) {

            submissionDateHTML = `
                <div class="student-hw-submitted-date">
                    <i class="fas fa-calendar-check"></i>
                    Submitted:
                    ${date.toLocaleDateString()}
                </div>
            `;
        }
    }


    /* --------------------------------------------------------
       RESULT / MARK SECTION
    -------------------------------------------------------- */

    let resultHTML = "";

    if (isMarked) {

        const markValue =
            hasMark
                ? formatHomeworkMark(submission.mark)
                : "0";

        const maxMarkValue =
            submission?.max_mark ||
            maxMarks ||
            100;

        const feedback =
            submission?.teacher_feedback ||
            submission?.feedback ||
            "";


        resultHTML = `
            <div class="student-hw-result-box">

                <div class="student-hw-result-header">
                    <i class="fas fa-award"></i>
                    Teacher's Assessment
                </div>

                <div class="student-hw-mark">
                    <span class="student-hw-result-label">
                        Mark:
                    </span>

                    <strong>
                        ${escapeHomeworkHTML(markValue)}/${escapeHomeworkHTML(maxMarkValue)}
                    </strong>
                </div>

                <div class="student-hw-feedback">

                    <div class="student-hw-result-label">
                        <i class="fas fa-comment-alt"></i>
                        Teacher Feedback:
                    </div>

                    <div class="student-hw-feedback-text">
                        ${
                            feedback
                                ? escapeHomeworkHTML(feedback)
                                : "No feedback was provided."
                        }
                    </div>

                </div>

            </div>
        `;

    } else if (hasSubmission) {

        resultHTML = `
            <div class="student-hw-result-box unmarked">

                <div class="student-hw-result-header">
                    <i class="fas fa-hourglass-half"></i>
                    Teacher's Assessment
                </div>

                <div class="student-hw-mark">
                    <span class="student-hw-result-label">
                        Mark:
                    </span>

                    <strong>
                        Not marked yet
                    </strong>
                </div>

                <div class="student-hw-feedback">

                    <div class="student-hw-result-label">
                        <i class="fas fa-comment-alt"></i>
                        Teacher Feedback:
                    </div>

                    <div class="student-hw-feedback-text">
                        Your teacher has not provided feedback yet.
                    </div>

                </div>

            </div>
        `;
    }


    /* --------------------------------------------------------
       ANSWER BUTTON
    -------------------------------------------------------- */

    let actionHTML = "";

    if (hasSubmission) {

        actionHTML = `
            <button
                type="button"
                class="student-hw-action-btn view"
                onclick="openHomeworkAnswer('${homework.id}')"
            >
                <i class="fas fa-eye"></i>
                View Submission
            </button>
        `;

    } else {

        actionHTML = `
            <button
                type="button"
                class="student-hw-action-btn submit"
                onclick="openHomeworkAnswer('${homework.id}')"
            >
                <i class="fas fa-upload"></i>
                Submit Homework
            </button>
        `;
    }


    /* --------------------------------------------------------
       COMPLETE CARD
    -------------------------------------------------------- */

    return `
        <div
            class="student-homework-card"
            data-homework-id="${escapeHomeworkHTML(homework.id)}"
        >

            <div class="student-hw-card-top">

                <div class="student-hw-subject">
                    ${escapeHomeworkHTML(subject)}
                </div>

                ${statusHTML}

            </div>


           <div class="student-hw-card-body">

    <h3 class="student-hw-title">
        ${escapeHomeworkHTML(title)}
    </h3>

    ${
        description
            ? `
                <div class="student-hw-description">
                    ${escapeHomeworkHTML(description)}
                </div>
            `
            : ""
    }

    ${
        dueDate
            ? `
                <div class="student-hw-due-date">
                    <i class="fas fa-calendar-alt"></i>
                    Due:
                    ${escapeHomeworkHTML(dueDate)}
                </div>
            `
            : ""
    }

    ${submissionDateHTML}

    ${resultHTML}

</div>


            <div class="student-hw-card-footer">

                ${actionHTML}

            </div>

        </div>
    `;
}

function openHomeworkAnswer(homeworkId) {
    const homework = studentHomeworkData.find(h => String(h.id) === String(homeworkId));
    if (!homework) return;
    const submission = getHomeworkSubmission(homework);
    if (!submission && homeworkStatus(homework) === "overdue") { alert("The submission deadline has passed."); return; }
    activeHomeworkForAnswer = homework;
    document.getElementById("studentHomeworkAnswerTitle").textContent = homework.title || "Homework";
    document.getElementById("studentHomeworkAnswerMeta").textContent = `${homework.subject || "General"} • Deadline: ${homeworkDate(homework.deadline)}`;
    document.getElementById("studentHomeworkQuestion").textContent = homework.description || "No instructions provided.";
    document.getElementById("studentHomeworkAnswer").value = submission?.answer || "";
    document.getElementById("hwSubmitStatus").textContent = submission ? `Last submitted ${homeworkDate(submission.submitted_at)}. You can update your answer before the deadline.` : "Your answer will be sent directly to your teacher.";
    document.getElementById("studentHomeworkAnswerModal").classList.add("open");
    document.getElementById("studentHomeworkAnswerModal").setAttribute("aria-hidden", "false");
    setTimeout(() => document.getElementById("studentHomeworkAnswer")?.focus(), 50);
}

function closeHomeworkAnswer() {
    const modal = document.getElementById("studentHomeworkAnswerModal");
    if (modal) { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); }
    activeHomeworkForAnswer = null;
}

async function submitStudentHomework() {
    const student = getPortalStudent();
    const homework = activeHomeworkForAnswer;
    const answerEl = document.getElementById("studentHomeworkAnswer");
    const button = document.getElementById("studentHomeworkSubmitBtn");
    const statusEl = document.getElementById("hwSubmitStatus");
    if (!student || !homework || !answerEl || !button) return;
    const answer = answerEl.value.trim();
    if (!answer) { alert("Please write your answer before submitting."); answerEl.focus(); return; }
    if (!homework.id) { alert("This homework does not have a valid ID and cannot be submitted."); return; }
    if (!getHomeworkSubmission(homework) && homeworkStatus(homework) === "overdue") { alert("The submission deadline has passed."); return; }
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;
    try {
        const schoolid = String(student.schoolid || student.schoolID || student.schoolId || "");
        const payload = {
            homework_id: String(homework.id),
            student_id: String(student.id),
            studentid: String(student.studentid || ""),
            student_name: String(student.name || ""),
            schoolid,
            student_class: String(student.studentclass || student.studentClass || student.class || ""),
            homework_title: String(homework.title || ""),
            subject: String(homework.subject || ""),
            answer,
            status: "submitted",
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const {data, error} = await supabaseClient.from("homework_submissions").upsert(payload, {onConflict:"homework_id,student_id"}).select().single();
        if (error) throw error;
        studentHomeworkSubmissions[String(homework.id)] = data || payload;
        closeHomeworkAnswer();
        updateHomeworkStats();
        filterStudentHomework();
        alert("Homework submitted successfully to your teacher.");
    } catch (error) {
        console.error("Homework submission error:", error);
        statusEl.textContent = error.message || "Unable to submit homework.";
        alert(`Unable to submit homework. ${error.message || "Please try again."}`);
    } finally {
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-paper-plane"></i> Submit Homework`;
    }
}

function closeHomework() {
    const page = document.getElementById("studentHomeworkPage");
    if (page) page.style.display = "none";
    goHome();
}


async function openResults(){

    showStudentPage(
        "resultsPage",
        "Results",
        "Academic performance by term"
    );
    setActiveNavByKey("results");

    const loggedStudent =
    JSON.parse(localStorage.getItem("loggedStudent"));

    const { data: student, error } =
    await supabaseClient
    .from("students")
    .select("*")
    .eq("id", loggedStudent.id)
    .single();

    if(error){
        alert("Unable to load results");
        return;
    }

    displayResults(student,"term1");
}

function displayResults(student, term) {

    let total = 0;
    let count = 0;

    const subjects = student.subjects || {};

    let rows = "";


    Object.keys(subjects).forEach(subject => {

        const mark = subjects[subject]?.[term];

        if (!mark) return;


        const classScore =
            Number(mark.classScore || 0);

        const examScore =
            Number(mark.examScore || 0);

        const totalScore =
            Number(mark.totalScore || 0);


        total += totalScore;

        count++;


        const grade =
            mark.grade || "-";


        const remark =
            mark.remark || "-";


        /* -----------------------------
           GRADE COLOR
        ----------------------------- */

        let gradeClass = "grade-c";


        if (["A1"].includes(grade)) {

            gradeClass = "grade-a";

        } else if (["B2", "B3"].includes(grade)) {

            gradeClass = "grade-b";

        } else if (["C4", "C5", "C6"].includes(grade)) {

            gradeClass = "grade-c";

        } else if (["D7"].includes(grade)) {

            gradeClass = "grade-d";

        } else if (["E8", "F9"].includes(grade)) {

            gradeClass = "grade-f";

        }


        rows += `

        <tr>

            <td>
                <span class="subject-name">
                    ${subject}
                </span>
            </td>

            <td>
                ${classScore.toFixed(1)}
            </td>

            <td>
                ${examScore.toFixed(1)}
            </td>

            <td>
                <span class="total-score">
                    ${totalScore.toFixed(1)}
                </span>
            </td>

            <td>

                <span class="grade-badge ${gradeClass}">
                    ${grade}
                </span>

            </td>

            <td>
                <span class="remark">
                    ${remark}
                </span>
            </td>

        </tr>

        `;

    });


    /* -----------------------------
       AVERAGE
    ----------------------------- */

    const average = count
        ? (total / count).toFixed(2)
        : "0.00";


    /* -----------------------------
       NO RESULTS
    ----------------------------- */

    if (!rows) {

        document.getElementById("resultsList").innerHTML = `

            <div class="results-card">

                <div style="
                    padding:60px 20px;
                    text-align:center;
                    color:#888;
                ">

                    <i
                        class="fas fa-chart-line"
                        style="
                            font-size:45px;
                            color:#c8cce0;
                            margin-bottom:15px;
                        "
                    ></i>

                    <h3 style="
                        color:#555;
                        margin-bottom:6px;
                    ">
                        No Results Available
                    </h3>

                    <p style="font-size:13px;">
                        There are no results recorded for this term.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    /* -----------------------------
       BUILD RESULTS
    ----------------------------- */

    const html = `

        <div class="results-card">


            <!-- PERFORMANCE HEADER -->

            <div class="performance-header">

                <div class="performance-info">

                    <h3>
                        Academic Performance
                    </h3>

                    <p>
                        ${student.name || "Student"} 
                        • 
                        ${term.replace("term", "Term ")}
                    </p>

                </div>


                <div class="average-box">

                    <span>
                        Overall Average
                    </span>

                    <strong>
                        ${average}%
                    </strong>

                </div>

            </div>


            <!-- TABLE -->

            <div class="results-table-wrapper">

                <table class="results-table">

                    <thead>

                        <tr>

                            <th>Subject</th>

                            <th>Class Score</th>

                            <th>Exam</th>

                            <th>Total</th>

                            <th>Grade</th>

                            <th>Remark</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>


        </div>

    `;


    document.getElementById("resultsList").innerHTML =
        html;

}


async function changeTerm(){

    const student=
    JSON.parse(localStorage.getItem("loggedStudent"));

    const term=
    document.getElementById("resultTerm").value;

    const {data}=await supabaseClient

    .from("students")

    .select("*")

    .eq("id",student.id)

    .single();

    displayResults(data,term);

}

/* ============================================================
   STUDENT CHAT STATE
============================================================ */

let studentChatContacts = [];

let selectedStudentChatUser = null;

let selectedStudentChatType = null;

let studentChatMessages = [];


/* ============================================================
   GET STUDENT
============================================================ */

function getLoggedStudent() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "loggedStudent"
            )
        );

    } catch (error) {

        console.error(
            "Student session error:",
            error
        );

        return null;

    }

}


/* ============================================================
   OPEN MESSAGES
============================================================ */

async function openMessages() {

    const student =
        getLoggedStudent();

    if (!student) {

        alert(
            "Student session not found."
        );

        return;

    }


    showStudentPage(
        "messagesPage",
        "Messages",
        "Chat with teachers and classmates"
    );
    setActiveNavByKey("messages");


    selectedStudentChatUser = null;

    selectedStudentChatType = null;


    document
        .getElementById(
            "studentMessages"
        )
        .innerHTML = `

            <div class="student-chat-empty">

                <i class="far fa-comments"></i>

                <h3>
                    Start a conversation
                </h3>

                <p>
                    Select your class teacher
                    or a classmate.
                </p>

            </div>
        `;


    document
        .getElementById(
            "studentConversationName"
        )
        .textContent =
        "Select a conversation";


    document
        .getElementById(
            "studentConversationType"
        )
        .textContent =
        "No conversation selected";


    await loadStudentChatContacts();

}

/* ============================================================
   LOAD STUDENT CHAT CONTACTS
============================================================ */

/* ============================================================
   LOAD STUDENT CHAT CONTACTS
   Shows:
   - Administrator
   - All teachers
   - Classmates
============================================================ */

async function loadStudentChatContacts() {

    const student =
        getLoggedStudent();

    if (!student) return;


    const schoolid =
        student.schoolid ||
        student.schoolId;

    const studentClass =
        student.studentclass ||
        student.studentClass ||
        "";


    if (!schoolid) {

        console.error(
            "Student school ID not found."
        );

        return;

    }


    const contacts = [];


    /* ========================================================
       LOAD ALL STAFF
    ======================================================== */

    const {
        data: staff,
        error: staffError
    } =
        await supabaseClient

            .from("users")

            .select(
    "id,firstname,surname,username,profilePic,classes,role,schoolid"
)

            .eq(
                "schoolid",
                schoolid
            );


    if (staffError) {

        console.error(
            "❌ STAFF CONTACT ERROR:",
            staffError
        );

    } else {

        console.log(
            "✅ ALL STAFF FROM USERS:",
            staff
        );


        (staff || []).forEach(user => {

            const role =
                String(
                    user.role || ""
                ).toLowerCase().trim();


            /*
             * Ignore anything that isn't
             * admin or teacher.
             */

            if (
                role !== "admin" &&
                role !== "teacher"
            ) {

                return;

            }


            /*
             * Never add the same person
             * as the logged-in student.
             */

            const name =
                user.fullname ||
                `${user.firstname || ""} ${user.surname || ""}`.trim() ||
                user.username ||
                "User";


            /*
             * Determine class teacher.
             */

            let isClassTeacher = false;


            if (
                role === "teacher" &&
                Array.isArray(user.classes)
            ) {

                isClassTeacher =
                    user.classes.some(
                        assignedClass =>
                            String(
                                assignedClass
                            ).trim().toLowerCase() ===
                            String(
                                studentClass
                            ).trim().toLowerCase()
                    );

            }


            contacts.push({

                id:
                    user.username,

                type:
                    "user",

                role:
                    role,

                name:
                    name,

                photo:
                    user.profilePic ||
                    "",

                isAdmin:
                    role === "admin",

                isTeacher:
                    role === "teacher",

                isClassTeacher:
                    isClassTeacher

            });

        });

    }


    /* ========================================================
       LOAD CLASSMATES
    ======================================================== */

    const {
        data: classmates,
        error: classmatesError
    } =
        await supabaseClient

            .from("students")

            .select(
                'id,name,studentid,studentclass,schoolid,"student-photos"'
            )

            .eq(
                "schoolid",
                schoolid
            )

            .eq(
                "studentclass",
                studentClass
            );


    if (classmatesError) {

        console.error(
            "❌ CLASSMATES ERROR:",
            classmatesError
        );

    } else {

        console.log(
            "✅ CLASSMATES:",
            classmates
        );


        (classmates || []).forEach(
            classmate => {

                if (
                    String(classmate.id) ===
                    String(student.id)
                ) {

                    return;

                }


                contacts.push({

                    id:
                        classmate.id,

                    type:
                        "student",

                    role:
                        "student",

                    name:
                        classmate.name ||
                        "Student",

                    studentid:
                        classmate.studentid,

                    photo:
                        classmate["student-photos"] ||
                        "",

                    isAdmin:
                        false,

                    isTeacher:
                        false,

                    isClassTeacher:
                        false

                });

            }
        );

    }


    /* ========================================================
       SORT
    ======================================================== */

    contacts.sort(
        (a, b) => {

            const priority =
                contact => {

                    if (
                        contact.isAdmin
                    ) return 1;

                    if (
                        contact.isClassTeacher
                    ) return 2;

                    if (
                        contact.isTeacher
                    ) return 3;

                    return 4;

                };


            return (
                priority(a) -
                priority(b)
            );

        }
    );


    studentChatContacts =
        contacts;


    console.log(
        "===================================="
    );

    console.log(
        "FINAL STUDENT CHAT CONTACTS:",
        studentChatContacts
    );

    console.log(
        "TOTAL CONTACTS:",
        studentChatContacts.length
    );

    console.log(
        "===================================="
    );


    const className =
        document.getElementById(
            "studentChatClassName"
        );


    if (className) {

        className.textContent =
            studentClass ||
            "My Class";

    }


    renderStudentChatContacts();

}

/* ============================================================
   RENDER STUDENT CHAT CONTACTS
============================================================ */

function renderStudentChatContacts() {

    const container =
        document.getElementById(
            "studentChatContacts"
        );

    if (!container) return;


    if (
        studentChatContacts.length === 0
    ) {

        container.innerHTML = `

            <div class="student-chat-no-contacts">

                <i class="fas fa-users"></i>

                <p>
                    No classmates, teachers or administrator found.
                </p>

            </div>

        `;

        return;

    }


    let html = "";


    studentChatContacts.forEach(
        contact => {

            const active =
                String(
                    selectedStudentChatUser
                ) ===
                String(contact.id) &&
                selectedStudentChatType ===
                contact.type
                    ? "active"
                    : "";


            const initials =
                contact.name
                    .split(" ")
                    .map(
                        name =>
                            name.charAt(0)
                    )
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();


            const avatar =
                contact.photo

                    ? `
                        <img
                            src="${escapeStudentMessage(contact.photo)}"
                            class="student-contact-avatar"
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='flex';
                            ">

                        <div
                            class="student-contact-initials"
                            style="display:none;"
                        >
                            ${initials}
                        </div>
                    `

                    : `
                        <div
                            class="student-contact-initials"
                        >
                            ${initials}
                        </div>
                    `;


            html += `

                <button
                    type="button"
                    class="
                        student-chat-contact
                        ${active}
                    "
                    onclick="
                        selectStudentChatContact(
                            '${String(contact.id).replace(/'/g, "\\'")}',
                            '${contact.type}'
                        )
                    "
                >

                    <div class="student-contact-avatar">

                        ${avatar}

                    </div>


                    <div
                        class="student-contact-details"
                    >

                        <strong>

                            ${escapeStudentMessage(
                                contact.name
                            )}

                        </strong>


                        <span>

                            ${
                                contact.isAdmin
                                    ? "Administrator"

                                    : contact.isClassTeacher
                                        ? "Class Teacher"

                                        : contact.isTeacher
                                            ? "Teacher"

                                            : "Classmate"
                            }

                        </span>

                    </div>

                </button>

            `;

        }
    );


    container.innerHTML =
        html;

}




/* ============================================================
   SEND STUDENT CHAT MESSAGE
============================================================ */

async function sendStudentReply() {

    const student =
        getLoggedStudent();


    if (!student) {

        alert(
            "Student session not found. Please log in again."
        );

        return;

    }


    if (!selectedStudentChatUser) {

        alert(
            "Please select a person to message."
        );

        return;

    }


    const input =
        document.getElementById(
            "studentReply"
        );


    if (!input) {

        console.error(
            "studentReply input not found."
        );

        return;

    }


    const text =
        input.value.trim();


    if (!text) {

        return;

    }


    /*
     * Determine sender.
     *
     * Students use their database ID.
     */

    const fromUser =
        String(student.id);


    const fromType =
        "student";


    /*
     * selectedStudentChatUser is:
     *
     * - username for staff
     * - id for students
     */

    const toUser =
        String(
            selectedStudentChatUser
        );


    const toType =
        selectedStudentChatType ===
        "user"
            ? "user"
            : "student";


    const newMessage = {

        schoolid:
            student.schoolid,

        from_user:
            fromUser,

        from_type:
            fromType,

        to_user:
            toUser,

        to_type:
            toType,

        text:
            text,

        media:
            null

    };


    console.log(
        "SENDING STUDENT MESSAGE:",
        newMessage
    );


    const button =
        document.querySelector(
            ".send-message-btn"
        );


    if (button) {

        button.disabled = true;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient

                .from("chats")

                .insert(
                    newMessage
                )

                .select()
                .single();


        if (error) {

            console.error(
                "❌ STUDENT CHAT INSERT ERROR:",
                error
            );

            alert(
                "Failed to send message:\n\n" +
                error.message
            );

            return;

        }


        console.log(
            "✅ STUDENT MESSAGE SENT:",
            data
        );


        /*
         * Add message immediately.
         */

        if (data) {

            const exists =
                studentChatMessages.some(
                    msg =>
                        String(msg.id) ===
                        String(data.id)
                );


            if (!exists) {

                studentChatMessages.push(
                    data
                );

            }

        }


        /*
         * Clear input.
         */

        input.value = "";

        input.style.height =
            "auto";


        /*
         * Render immediately.
         */

        renderStudentConversation();


    } catch (error) {

        console.error(
            "❌ STUDENT SEND ERROR:",
            error
        );

        alert(
            "Unable to send message."
        );

    } finally {

        if (button) {

            button.disabled = false;

        }

    }

}


/* ============================================================
   SELECT STUDENT CHAT CONTACT
============================================================ */

async function selectStudentChatContact(
    userId,
    userType
) {

    selectedStudentChatUser =
        userId;

    selectedStudentChatType =
        userType;


    const contact =
        studentChatContacts.find(
            item =>
                String(item.id) ===
                String(userId) &&
                item.type ===
                userType
        );


    if (!contact) return;


    document
        .getElementById(
            "studentConversationName"
        )
        .textContent =
        contact.name;


    document
        .getElementById(
            "studentConversationType"
        )
        .textContent =
        contact.isTeacher
            ? "Class Teacher"
            : "Classmate";


    renderStudentChatContacts();


    await loadStudentConversation();

}


/* ============================================================
   LOAD STUDENT CONVERSATION
============================================================ */

async function loadStudentConversation() {

    const student =
        getLoggedStudent();

    if (
        !student ||
        !selectedStudentChatUser
    ) {

        return;

    }


    const myId =
        String(student.id);

    const otherId =
        String(selectedStudentChatUser);


    console.log(
        "Loading conversation:",
        myId,
        "<->",
        otherId
    );


    const {
        data,
        error
    } =
        await supabaseClient

            .from("chats")

            .select("*")

            .eq(
                "schoolid",
                student.schoolid
            )

            .or(
                `and(from_user.eq.${myId},to_user.eq.${otherId}),and(from_user.eq.${otherId},to_user.eq.${myId})`
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Student chat loading error:",
            error
        );

        document
            .getElementById(
                "studentMessages"
            )
            .innerHTML = `

                <div class="student-chat-empty">

                    <i class="fas fa-exclamation-circle"></i>

                    <h3>
                        Unable to load messages
                    </h3>

                    <p>
                        Please try again.
                    </p>

                </div>
            `;

        return;

    }


    studentChatMessages =
        data || [];


    renderStudentConversation();

}


/* ============================================================
   STUDENT CHAT REALTIME
============================================================ */

let studentChatRealtimeChannel = null;


function startStudentChatRealtime() {

    if (
        studentChatRealtimeChannel
    ) {

        return;

    }


    studentChatRealtimeChannel =
        supabaseClient

            .channel(
                "student-chat-realtime"
            )

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chats"
                },
                async payload => {

                    const student =
                        getLoggedStudent();

                    if (!student) return;


                    const message =
                        payload.new;


                    if (!message) return;


                    /*
                     * Only our school.
                     */

                    if (
                        String(
                            message.schoolid
                        ) !==
                        String(
                            student.schoolid
                        )
                    ) {

                        return;

                    }


                    const myId =
                        String(student.id);


                    const from =
                        String(
                            message.from_user
                        );


                    const to =
                        String(
                            message.to_user
                        );


                    /*
                     * Is this message
                     * related to me?
                     */

                    const belongsToMe =
                        from === myId ||
                        to === myId;


                    if (!belongsToMe) {

                        return;

                    }


                    /*
                     * If this is the currently
                     * opened conversation,
                     * add it immediately.
                     */

                    if (

                        selectedStudentChatUser &&

                        (
                            (
                                from === myId &&
                                to === String(
                                    selectedStudentChatUser
                                )
                            )

                            ||

                            (
                                to === myId &&
                                from === String(
                                    selectedStudentChatUser
                                )
                            )
                        )

                    ) {

                        const exists =
                            studentChatMessages.some(
                                msg =>
                                    String(msg.id) ===
                                    String(message.id)
                            );


                        if (!exists) {

                            studentChatMessages.push(
                                message
                            );

                            renderStudentConversation();

                        }

                    }

                }
            )

            .subscribe(
                status => {

                    console.log(
                        "Student chat realtime:",
                        status
                    );

                }
            );

}

/* ============================================================
   RENDER STUDENT CONVERSATION
============================================================ */

function renderStudentConversation() {

    const container =
        document.getElementById(
            "studentMessages"
        );

    if (!container) return;


    const student =
        getLoggedStudent();

    if (!student) return;


    if (
        studentChatMessages.length === 0
    ) {

        container.innerHTML = `

            <div class="student-chat-empty">

                <i class="far fa-comments"></i>

                <h3>
                    No messages yet
                </h3>

                <p>
                    Start the conversation.
                </p>

            </div>

        `;

        return;

    }


    let html = "";


    studentChatMessages.forEach(
        message => {

            const mine =
                String(
                    message.from_user
                ) ===
                String(student.id);


            const time =
                message.created_at
                    ? new Date(
                        message.created_at
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                    : "";


            html += `

                <div
                    class="
                        student-message
                        ${mine ? "sent" : "received"}
                    "
                >

                    <div
                        class="
                            student-message-bubble
                            ${mine ? "mine" : "theirs"}
                        "
                    >

                        ${
                            message.text
                                ? `
                                    <div>
                                        ${escapeStudentMessage(
                                            message.text
                                        )}
                                    </div>
                                `
                                : ""
                        }


                        ${
                            message.media
                                ? 
								`
                                    <a
                                        href="${escapeStudentMessage(message.media)}"
                                        target="_blank"
                                        class="student-chat-media"
                                    >
                                        <i class="fas fa-paperclip"></i>
                                        Attachment
                                    </a>
                                `
                                : ""
                        }


                        <div class="student-message-time">

                            ${time}

                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;


    container.scrollTop =
        container.scrollHeight;

}

function displayMessages(messages){

    let html="";

    if(messages.length===0){

        html=`
        <div class="card">

            No messages available.

        </div>
        `;

    }

    messages.forEach(msg=>{

        html+=`

        <div class="card" style="margin-bottom:15px;text-align:left;">

            <h3>${msg.title || "Message"}</h3>

            <small>

                From:
                ${msg.sender}

            </small>

            <p style="margin-top:10px;">

                ${msg.message}

            </p>

            <small>

                ${new Date(msg.created_at).toLocaleString()}

            </small>

        </div>

        `;

    });

    document.getElementById("messagesList").innerHTML=html;

}

function autoResizeStudentMessage(textarea) {

    textarea.style.height = "auto";

    textarea.style.height =
        Math.min(
            textarea.scrollHeight,
            130
        ) + "px";

}


function handleStudentMessageKey(event) {

    /*
     * Enter = send
     * Shift + Enter = new line
     */

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendStudentReply();

    }

}

function escapeStudentMessage(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


function formatStudentMessageTime(
    date
) {

    if (!date) {
        return "";
    }

    const d =
        new Date(date);

    return d.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

async function sendReply(){

    const student =
    JSON.parse(localStorage.getItem("loggedStudent"));

    const text =
    document.getElementById("replyMessage").value.trim();

    if(!text){

        return alert("Enter a message");

    }

    const { error } =
    await supabaseClient
    .from("messages")
    .insert([{

        sender: student.studentid,

        receiver: "ADMIN",

        title: "Student Reply",

        message: text,

        schoolid: student.schoolid

    }]);

    if(error){

        console.log(error);

        return alert("Failed to send");

    }

    document.getElementById("replyMessage").value="";

    openMessages();

}



/* ============================================================
   STUDENT PORTAL - ATTENDANCE
   ------------------------------------------------------------
   Shows:
   1. Daily attendance
   2. Weekly attendance summary
   3. Monthly attendance summary

   ATTENDANCE TABLE COLUMNS:
   - schoolid
   - teacher
   - date
   - studentname
   - status
   - term
============================================================ */


/* ============================================================
   GLOBAL ATTENDANCE DATA
============================================================ */

let studentAttendanceRecords = [];

let selectedAttendanceWeek = "";
let selectedAttendanceMonth = "";


/* ============================================================
   OPEN ATTENDANCE
============================================================ */

async function openAttendance() {

    // Ensure attendance page exists before switching
    let attendancePage = document.getElementById("attendancePage");
    if (!attendancePage) {
        attendancePage = document.createElement("div");
        attendancePage.id = "attendancePage";
        document.body.appendChild(attendancePage);
    }

    showStudentPage(
        "attendancePage",
        "Attendance",
        "Daily, weekly and monthly records"
    );
    setActiveNavByKey("attendance");

    // --------------------------------------------------------
    // Get logged-in student
    // --------------------------------------------------------

    let loggedStudent = null;

    try {

        loggedStudent =
            JSON.parse(
                localStorage.getItem(
                    "loggedStudent"
                )
            );

    } catch (error) {

        console.error(
            "Unable to read logged student:",
            error
        );

    }


    if (!loggedStudent || !loggedStudent.id) {

        alert(
            "Student session not found. Please login again."
        );

        return;
    }


    // --------------------------------------------------------
    // Get fresh student information
    // --------------------------------------------------------

    let student = null;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("students")
            .select("*")
            .eq("id", loggedStudent.id)
            .single();


        if (error) {

            console.error(
                "Student fetch error:",
                error
            );

            alert(
                "Unable to load student information."
            );

            return;
        }


        student = data;


    } catch (error) {

        console.error(
            "Student information error:",
            error
        );

        alert(
            "Unable to load student information."
        );

        return;
    }


    if (!student) {

        alert(
            "Student record not found."
        );

        return;
    }


    // --------------------------------------------------------
    // Student details
    // --------------------------------------------------------

    const studentName =
        String(
            student.name || ""
        ).trim();


    const studentID =
        student.studentid ||
        "N/A";


    const studentClass =
        student.studentclass ||
        "N/A";


    const schoolID =
        student.schoolid ||
        "";


    if (!studentName) {

        alert(
            "Student name is missing from your profile."
        );

        return;
    }


    if (!schoolID) {

        alert(
            "School information is missing from your profile."
        );

        return;
    }


    console.log(
        "========== STUDENT ATTENDANCE =========="
    );

    console.log(
        "Student:",
        studentName
    );

    console.log(
        "Student ID:",
        studentID
    );

    console.log(
        "Class:",
        studentClass
    );

    console.log(
        "School ID:",
        schoolID
    );


    // --------------------------------------------------------
    // Attendance page element (already ensured above)
    // --------------------------------------------------------

    attendancePage =
        document.getElementById("attendancePage");

    if (!attendancePage) {
        attendancePage = document.createElement("div");
        attendancePage.id = "attendancePage";
        document.body.appendChild(attendancePage);
        showStudentPage(
            "attendancePage",
            "Attendance",
            "Daily, weekly and monthly records"
        );
    }

    // --------------------------------------------------------
    // Current week / month
    // --------------------------------------------------------

    const today =
        new Date();


    selectedAttendanceWeek =
        formatAttendanceDateInput(
            getMonday(today)
        );


    selectedAttendanceMonth =
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    // --------------------------------------------------------
    // Loading screen
    // --------------------------------------------------------

    attendancePage.innerHTML = `

        <div class="student-attendance-page">

            <div class="student-attendance-container">

                <div class="student-attendance-header">

                    


                    <div class="student-attendance-title">

                        <div class="student-attendance-title-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>

                        <div>

                            <h1>
                                Attendance
                            </h1>

                            <p>
                                Your daily, weekly and monthly
                                attendance record
                            </p>

                        </div>

                    </div>

                </div>


                <div class="student-attendance-loading">

                    <i class="fas fa-spinner fa-spin"></i>

                    <span>
                        Loading attendance...
                    </span>

                </div>

            </div>

        </div>

    `;


    // --------------------------------------------------------
    // Add attendance styles
    // --------------------------------------------------------

    addStudentAttendanceStyles();


    // --------------------------------------------------------
    // Load attendance records
    // --------------------------------------------------------

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("attendance")
            .select("*")
            .eq("schoolid", schoolID)
            .eq("studentname", studentName)
            .order("date", {
                ascending: false
            });


        if (error) {

            console.error(
                "Attendance fetch error:",
                error
            );

            attendancePage.innerHTML = `

                <div class="student-attendance-page">

                    <div class="student-attendance-container">

                        


                        <div class="student-attendance-error">

                            <i class="fas fa-triangle-exclamation"></i>

                            <h3>
                                Unable to load attendance
                            </h3>

                            <p>
                                ${escapeAttendanceText(
                                    error.message ||
                                    "Please try again."
                                )}
                            </p>

                        </div>

                    </div>

                </div>

            `;

            return;
        }


        studentAttendanceRecords =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Attendance records loaded:",
            studentAttendanceRecords
        );


        // ----------------------------------------------------
        // Render dashboard
        // ----------------------------------------------------

        renderStudentAttendanceDashboard(
            studentName,
            studentID,
            studentClass,
            studentAttendanceRecords
        );


    } catch (error) {

        console.error(
            "Unexpected attendance error:",
            error
        );

        attendancePage.innerHTML = `

            <div class="student-attendance-page">

                <div class="student-attendance-container">

                    


                    <div class="student-attendance-error">

                        <i class="fas fa-triangle-exclamation"></i>

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            Unable to load attendance records.
                        </p>

                    </div>

                </div>

            </div>

        `;

    }

}


/* ============================================================
   RENDER ATTENDANCE DASHBOARD
============================================================ */

function renderStudentAttendanceDashboard(
    studentName,
    studentID,
    studentClass,
    records
) {

    const page =
        document.getElementById(
            "attendancePage"
        );

    if (!page) {
        return;
    }


    // --------------------------------------------------------
    // Overall statistics
    // --------------------------------------------------------

    const totalDays =
        records.length;


    const totalPresent =
        records.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Present"
        ).length;


    const totalAbsent =
        records.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Absent"
        ).length;


    const totalLate =
        records.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Late"
        ).length;


    const overallPercentage =
        totalDays > 0
            ? (
                (totalPresent / totalDays) *
                100
            ).toFixed(1)
            : "0.0";


    // --------------------------------------------------------
    // Weekly statistics
    // --------------------------------------------------------

    const weekly =
        calculateStudentAttendanceWeek(
            records,
            selectedAttendanceWeek
        );


    // --------------------------------------------------------
    // Monthly statistics
    // --------------------------------------------------------

    const monthly =
        calculateStudentAttendanceMonth(
            records,
            selectedAttendanceMonth
        );


    // --------------------------------------------------------
    // Daily records
    // --------------------------------------------------------

    let dailyHTML = "";


    if (!records.length) {

        dailyHTML = `

            <div class="student-attendance-empty">

                <i class="fas fa-calendar-xmark"></i>

                <h3>
                    No attendance records yet
                </h3>

                <p>
                    Your attendance will appear here when
                    your teacher records it.
                </p>

            </div>

        `;

    } else {

        dailyHTML = `

            <div class="student-attendance-table-wrap">

                <table class="student-attendance-table">

                    <thead>

                        <tr>

                            <th>
                                Date
                            </th>

                            <th>
                                Day
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Term
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${
                            records
                                .map(
                                    record =>
                                        renderAttendanceRow(
                                            record
                                        )
                                )
                                .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

    }


    // --------------------------------------------------------
    // Build complete page
    // --------------------------------------------------------

    page.innerHTML = `

        <div class="student-attendance-page">

            <div class="student-attendance-container">


                <!-- =========================================
                     HEADER
                ========================================== -->

                <div class="student-attendance-header">

                    


                    <div class="student-attendance-title">

                        <div class="student-attendance-title-icon">

                            <i class="fas fa-calendar-check"></i>

                        </div>


                        <div>

                            <h1>
                                Attendance
                            </h1>

                            <p>
                                Daily and attendance summaries
                            </p>

                        </div>

                    </div>

                </div>



                <!-- =========================================
                     STUDENT INFORMATION
                ========================================== -->

                <div class="student-attendance-student-card">

                    <div class="student-attendance-avatar">

                        <i class="fas fa-user-graduate"></i>

                    </div>


                    <div class="student-attendance-student-info">

                        <span>
                            Student
                        </span>

                        <strong>
                            ${escapeAttendanceText(
                                studentName
                            )}
                        </strong>

                        <small>

                            ID:
                            ${escapeAttendanceText(
                                studentID
                            )}

                            &nbsp; • &nbsp;

                            Class:
                            ${escapeAttendanceText(
                                studentClass
                            )}

                        </small>

                    </div>

                </div>



                <!-- =========================================
                     OVERALL SUMMARY
                ========================================== -->

                <div class="student-attendance-section">

                    <div class="student-attendance-section-title">

                        <div>

                            <h2>
                                Overall Attendance
                            </h2>

                            <p>
                                Attendance recorded for this student
                            </p>

                        </div>

                    </div>


                    <div class="student-attendance-summary-grid">


                        <!-- TOTAL DAYS -->

                        <div class="student-attendance-stat">

                            <div class="student-attendance-stat-icon">

                                <i class="fas fa-calendar-days"></i>

                            </div>

                            <div>

                                <span>
                                    Total Days
                                </span>

                                <strong>
                                    ${totalDays}
                                </strong>

                            </div>

                        </div>



                        <!-- PRESENT -->

                        <div class="student-attendance-stat present">

                            <div class="student-attendance-stat-icon">

                                <i class="fas fa-circle-check"></i>

                            </div>

                            <div>

                                <span>
                                    Present
                                </span>

                                <strong>
                                    ${totalPresent}
                                </strong>

                            </div>

                        </div>



                        <!-- ABSENT -->

                        <div class="student-attendance-stat absent">

                            <div class="student-attendance-stat-icon">

                                <i class="fas fa-circle-xmark"></i>

                            </div>

                            <div>

                                <span>
                                    Absent
                                </span>

                                <strong>
                                    ${totalAbsent}
                                </strong>

                            </div>

                        </div>



                        <!-- LATE -->

                        <div class="student-attendance-stat late">

                            <div class="student-attendance-stat-icon">

                                <i class="fas fa-clock"></i>

                            </div>

                            <div>

                                <span>
                                    Late
                                </span>

                                <strong>
                                    ${totalLate}
                                </strong>

                            </div>

                        </div>



                        <!-- PERCENTAGE -->

                        <div class="student-attendance-stat percentage">

                            <div class="student-attendance-stat-icon">

                                <i class="fas fa-chart-pie"></i>

                            </div>

                            <div>

                                <span>
                                    Attendance Rate
                                </span>

                                <strong>
                                    ${overallPercentage}%
                                </strong>

                            </div>

                        </div>


                    </div>

                </div>



                <!-- =========================================
                     WEEKLY SUMMARY
                ========================================== -->

                <div class="student-attendance-section">

                    <div class="student-attendance-section-title">

                        <div>

                            <h2>
                                Weekly Summary
                            </h2>

                            <p>
                                View your attendance for any week
                            </p>

                        </div>

                    </div>


                    <div class="student-attendance-filter">

                        <label>
                            Select week
                        </label>

                        <input
                            type="date"
                            id="studentAttendanceWeek"
                            value="${selectedAttendanceWeek}"
                            onchange="
                                selectedAttendanceWeek = this.value;

                                renderStudentAttendanceDashboard(
                                    '${escapeAttendanceAttribute(studentName)}',
                                    '${escapeAttendanceAttribute(studentID)}',
                                    '${escapeAttendanceAttribute(studentClass)}',
                                    studentAttendanceRecords
                                );
                            ">

                    </div>


                    <div class="student-attendance-summary-grid weekly-grid">


                        <div class="student-attendance-mini-card">

                            <span>
                                School Days
                            </span>

                            <strong>
                                ${weekly.total}
                            </strong>

                        </div>


                        <div class="student-attendance-mini-card present">

                            <span>
                                Present
                            </span>

                            <strong>
                                ${weekly.present}
                            </strong>

                        </div>


                        <div class="student-attendance-mini-card absent">

                            <span>
                                Absent
                            </span>

                            <strong>
                                ${weekly.absent}
                            </strong>

                        </div>


                        <div class="student-attendance-mini-card">

                            <span>
                                Attendance
                            </span>

                            <strong>
                                ${weekly.percentage}%
                            </strong>

                        </div>


                    </div>


                    <div class="student-attendance-period">

                        <i class="fas fa-calendar-week"></i>

                        <span>
                            ${weekly.label}
                        </span>

                    </div>

                </div>



                <!-- =========================================
                     MONTHLY SUMMARY
                ========================================== -->

                <div class="student-attendance-section">

                    <div class="student-attendance-section-title">

                        <div>

                            <h2>
                                Monthly Summary
                            </h2>

                            <p>
                                View your attendance for any month
                            </p>

                        </div>

                    </div>


                    <div class="student-attendance-filter">

                        <label>
                            Select month
                        </label>

                        <input
                            type="month"
                            id="studentAttendanceMonth"
                            value="${selectedAttendanceMonth}"
                            onchange="
                                selectedAttendanceMonth = this.value;

                                renderStudentAttendanceDashboard(
                                    '${escapeAttendanceAttribute(studentName)}',
                                    '${escapeAttendanceAttribute(studentID)}',
                                    '${escapeAttendanceAttribute(studentClass)}',
                                    studentAttendanceRecords
                                );
                            ">

                    </div>


                    <div class="student-attendance-summary-grid weekly-grid">


                        <div class="student-attendance-mini-card">

                            <span>
                                School Days
                            </span>

                            <strong>
                                ${monthly.total}
                            </strong>

                        </div>


                        <div class="student-attendance-mini-card present">

                            <span>
                                Present
                            </span>

                            <strong>
                                ${monthly.present}
                            </strong>

                        </div>


                        <div class="student-attendance-mini-card absent">

                            <span>
                                Absent
                            </span>

                            <strong>
                                ${monthly.absent}
                            </strong>

                        </div>


                        <div class="student-attendance-mini-card">

                            <span>
                                Attendance
                            </span>

                            <strong>
                                ${monthly.percentage}%
                            </strong>

                        </div>


                    </div>


                    <div class="student-attendance-period">

                        <i class="fas fa-calendar-days"></i>

                        <span>
                            ${monthly.label}
                        </span>

                    </div>

                </div>



                <!-- =========================================
                     DAILY ATTENDANCE
                ========================================== -->

                <div class="student-attendance-section">

                    <div class="student-attendance-section-title">

                        <div>

                            <h2>
                                Daily Attendance
                            </h2>

                            <p>
                                Your attendance record by school day
                            </p>

                        </div>

                    </div>


                    ${dailyHTML}

                </div>



                <!-- =========================================
                     FOOTER
                ========================================== -->

                <div class="student-attendance-footer">

                    

                </div>


            </div>

        </div>

    `;

}


/* ============================================================
   RENDER DAILY ATTENDANCE ROW
============================================================ */

function renderAttendanceRow(record) {

    const status =
        normalizeAttendanceStatus(
            record.status
        );


    const date =
        parseAttendanceDate(
            record.date
        );


    if (!date) {

        return "";

    }


    const formattedDate =
        date.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    const day =
        date.toLocaleDateString(
            [],
            {
                weekday: "long"
            }
        );


    const term =
        formatAttendanceTerm(
            record.term
        );


    let statusClass =
        "not-marked";


    let statusIcon =
        "fa-circle-question";


    if (status === "Present") {

        statusClass =
            "present";

        statusIcon =
            "fa-circle-check";

    }


    if (status === "Absent") {

        statusClass =
            "absent";

        statusIcon =
            "fa-circle-xmark";

    }


    if (status === "Late") {

        statusClass =
            "late";

        statusIcon =
            "fa-clock";

    }


    return `

        <tr>

            <td>

                <strong>
                    ${formattedDate}
                </strong>

            </td>


            <td>
                ${day}
            </td>


            <td>

                <span
                    class="
                        student-attendance-status
                        ${statusClass}
                    "
                >

                    <i
                        class="fas ${statusIcon}"
                    ></i>

                    ${status}

                </span>

            </td>


            <td>
                ${term}
            </td>

        </tr>

    `;

}


/* ============================================================
   WEEKLY CALCULATION
============================================================ */

function calculateStudentAttendanceWeek(
    records,
    weekStartString
) {

    const start =
        parseAttendanceDate(
            weekStartString
        );


    if (!start) {

        return {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            percentage: "0.0",
            label: "No week selected"
        };

    }


    // Make sure week starts Monday
    const monday =
        getMonday(start);


    const sunday =
        new Date(monday);


    sunday.setDate(
        monday.getDate() + 6
    );


    const filtered =
        records.filter(record => {

            const date =
                parseAttendanceDate(
                    record.date
                );


            if (!date) {
                return false;
            }


            return (
                date >= startOfDay(monday) &&
                date <= endOfDay(sunday)
            );

        });


    const present =
        filtered.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Present"
        ).length;


    const absent =
        filtered.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Absent"
        ).length;


    const late =
        filtered.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Late"
        ).length;


    const total =
        filtered.length;


    const percentage =
        total > 0
            ? (
                (present / total) *
                100
            ).toFixed(1)
            : "0.0";


    const label =
        monday.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ) +
        " – " +
        sunday.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    return {
        total,
        present,
        absent,
        late,
        percentage,
        label
    };

}


/* ============================================================
   MONTHLY CALCULATION
============================================================ */

function calculateStudentAttendanceMonth(
    records,
    monthString
) {

    if (!monthString) {

        return {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            percentage: "0.0",
            label: "No month selected"
        };

    }


    const parts =
        monthString.split("-");


    const year =
        Number(parts[0]);


    const month =
        Number(parts[1]);


    const filtered =
        records.filter(record => {

            const date =
                parseAttendanceDate(
                    record.date
                );


            if (!date) {
                return false;
            }


            return (
                date.getFullYear() === year &&
                date.getMonth() + 1 === month
            );

        });


    const present =
        filtered.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Present"
        ).length;


    const absent =
        filtered.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Absent"
        ).length;


    const late =
        filtered.filter(
            record =>
                normalizeAttendanceStatus(
                    record.status
                ) === "Late"
        ).length;


    const total =
        filtered.length;


    const percentage =
        total > 0
            ? (
                (present / total) *
                100
            ).toFixed(1)
            : "0.0";


    const labelDate =
        new Date(
            year,
            month - 1,
            1
        );


    const label =
        labelDate.toLocaleDateString(
            [],
            {
                month: "long",
                year: "numeric"
            }
        );


    return {
        total,
        present,
        absent,
        late,
        percentage,
        label
    };

}


/* ============================================================
   NORMALIZE STATUS
============================================================ */

function normalizeAttendanceStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "present" ||
        value === "p"
    ) {

        return "Present";

    }


    if (
        value === "absent" ||
        value === "a"
    ) {

        return "Absent";

    }


    if (
        value === "late" ||
        value === "l"
    ) {

        return "Late";

    }


    return "Not marked";

}


/* ============================================================
   FORMAT TERM
============================================================ */

function formatAttendanceTerm(
    term
) {

    if (!term) {
        return "Term not specified";
    }


    const value =
        String(term)
            .toLowerCase();


    if (value === "term1") {
        return "Term 1";
    }


    if (value === "term2") {
        return "Term 2";
    }


    if (value === "term3") {
        return "Term 3";
    }


    return term;

}


/* ============================================================
   PARSE DATE
============================================================ */

function parseAttendanceDate(
    value
) {

    if (!value) {
        return null;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* ============================================================
   GET MONDAY
============================================================ */

function getMonday(
    date
) {

    const result =
        new Date(date);


    const day =
        result.getDay();


    const difference =
        day === 0
            ? -6
            : 1 - day;


    result.setDate(
        result.getDate() +
        difference
    );


    return startOfDay(
        result
    );

}


/* ============================================================
   START OF DAY
============================================================ */

function startOfDay(
    date
) {

    const result =
        new Date(date);


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;

}


/* ============================================================
   END OF DAY
============================================================ */

function endOfDay(
    date
) {

    const result =
        new Date(date);


    result.setHours(
        23,
        59,
        59,
        999
    );


    return result;

}


/* ============================================================
   FORMAT DATE INPUT
============================================================ */

function formatAttendanceDateInput(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeAttendanceText(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ============================================================
   ESCAPE HTML ATTRIBUTE
============================================================ */

function escapeAttendanceAttribute(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /"/g,
        "&quot;"
    );

}


/* ============================================================
   ATTENDANCE CSS
============================================================ */

function addStudentAttendanceStyles() {

    if (
        document.getElementById(
            "studentAttendanceStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "studentAttendanceStyles";


    style.textContent = `

        .student-attendance-page {
            min-height: 100vh;
            background: #f5f7fb;
            padding: 24px 18px 50px;
        }


        .student-attendance-container {
            width: 100%;
            max-width: 1050px;
            margin: 0 auto;
        }


        .student-attendance-header {
            margin-bottom: 22px;
        }


        .student-attendance-back {
            border: none;
            background: #ffffff;
            color: #374151;
            padding: 10px 15px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,.05);
            margin-bottom: 20px;
        }


        .student-attendance-title {
            display: flex;
            align-items: center;
            gap: 14px;
        }


        .student-attendance-title-icon {
            width: 52px;
            height: 52px;
            border-radius: 15px;
            background: #eef2ff;
            color: #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
        }


        .student-attendance-title h1 {
            margin: 0 0 4px;
            color: #111827;
            font-size: 25px;
        }


        .student-attendance-title p {
            margin: 0;
            color: #6b7280;
            font-size: 13px;
        }


        .student-attendance-student-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 17px;
            padding: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 22px;
        }


        .student-attendance-avatar {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: #eef2ff;
            color: #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 19px;
        }


        .student-attendance-student-info span {
            display: block;
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: .5px;
            margin-bottom: 3px;
        }


        .student-attendance-student-info strong {
            display: block;
            color: #111827;
            font-size: 16px;
        }


        .student-attendance-student-info small {
            display: block;
            margin-top: 4px;
            color: #6b7280;
            font-size: 12px;
        }


        .student-attendance-section {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 22px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,.035);
        }


        .student-attendance-section-title {
            margin-bottom: 18px;
        }


        .student-attendance-section-title h2 {
            margin: 0 0 4px;
            color: #111827;
            font-size: 18px;
        }


        .student-attendance-section-title p {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
        }


        .student-attendance-summary-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(150px, 1fr)
                );
            gap: 12px;
        }


        .student-attendance-stat {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            background: #fafafa;
        }


        .student-attendance-stat-icon {
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            border-radius: 11px;
            background: #eef2ff;
            color: #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
        }


        .student-attendance-stat.present
        .student-attendance-stat-icon {
            background: #ecfdf5;
            color: #059669;
        }


        .student-attendance-stat.absent
        .student-attendance-stat-icon {
            background: #fef2f2;
            color: #dc2626;
        }


        .student-attendance-stat.late
        .student-attendance-stat-icon {
            background: #fff7ed;
            color: #ea580c;
        }


        .student-attendance-stat.percentage
        .student-attendance-stat-icon {
            background: #eff6ff;
            color: #2563eb;
        }


        .student-attendance-stat span {
            display: block;
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 3px;
        }


        .student-attendance-stat strong {
            display: block;
            color: #111827;
            font-size: 19px;
        }


        .student-attendance-filter {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }


        .student-attendance-filter label {
            color: #4b5563;
            font-size: 13px;
            font-weight: 600;
        }


        .student-attendance-filter input {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 9px 11px;
            background: #ffffff;
            color: #111827;
            font-family: inherit;
            outline: none;
        }


        .student-attendance-filter input:focus {
            border-color: #4f46e5;
        }


        .weekly-grid {
            grid-template-columns:
                repeat(
                    4,
                    minmax(120px, 1fr)
                );
        }


        .student-attendance-mini-card {
            border: 1px solid #e5e7eb;
            border-radius: 13px;
            padding: 15px;
            background: #fafafa;
        }


        .student-attendance-mini-card span {
            display: block;
            color: #6b7280;
            font-size: 11px;
            margin-bottom: 5px;
        }


        .student-attendance-mini-card strong {
            color: #111827;
            font-size: 21px;
        }


        .student-attendance-mini-card.present strong {
            color: #059669;
        }


        .student-attendance-mini-card.absent strong {
            color: #dc2626;
        }


        .student-attendance-period {
            margin-top: 15px;
            padding: 11px 13px;
            border-radius: 10px;
            background: #f8fafc;
            color: #4b5563;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }


        .student-attendance-table-wrap {
            width: 100%;
            overflow-x: auto;
        }


        .student-attendance-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
        }


        .student-attendance-table th {
            text-align: left;
            padding: 13px 12px;
            background: #f8fafc;
            color: #4b5563;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .4px;
            border-bottom: 1px solid #e5e7eb;
        }


        .student-attendance-table td {
            padding: 14px 12px;
            border-bottom: 1px solid #f0f1f3;
            color: #4b5563;
            font-size: 13px;
        }


        .student-attendance-table td strong {
            color: #111827;
        }


        .student-attendance-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
        }


        .student-attendance-status.present {
            background: #ecfdf5;
            color: #047857;
        }


        .student-attendance-status.absent {
            background: #fef2f2;
            color: #b91c1c;
        }


        .student-attendance-status.late {
            background: #fff7ed;
            color: #c2410c;
        }


        .student-attendance-status.not-marked {
            background: #f3f4f6;
            color: #6b7280;
        }


        .student-attendance-empty {
            text-align: center;
            padding: 45px 20px;
            color: #6b7280;
        }


        .student-attendance-empty i {
            font-size: 40px;
            margin-bottom: 12px;
            color: #9ca3af;
        }


        .student-attendance-empty h3 {
            margin: 0 0 6px;
            color: #374151;
        }


        .student-attendance-empty p {
            margin: 0;
            font-size: 13px;
        }


        .student-attendance-loading {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 60px 20px;
            text-align: center;
            color: #6b7280;
        }


        .student-attendance-loading i {
            font-size: 25px;
            margin-right: 8px;
        }


        .student-attendance-error {
            background: #ffffff;
            border: 1px solid #fecaca;
            border-radius: 18px;
            padding: 45px 20px;
            text-align: center;
            color: #6b7280;
        }


        .student-attendance-error i {
            font-size: 38px;
            color: #dc2626;
            margin-bottom: 10px;
        }


        .student-attendance-error h3 {
            color: #991b1b;
            margin: 0 0 8px;
        }


        .student-attendance-error p {
            margin: 0;
            font-size: 13px;
        }


        .student-attendance-footer {
            text-align: center;
            margin-top: 25px;
        }


        .student-attendance-back-main {
            border: none;
            background: #4f46e5;
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 11px;
            cursor: pointer;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }


        @media(max-width:700px) {

            .student-attendance-page {
                padding: 18px 12px 40px;
            }


            .student-attendance-section {
                padding: 17px 14px;
                border-radius: 15px;
            }


            .student-attendance-title h1 {
                font-size: 21px;
            }


            .weekly-grid {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }


            .student-attendance-filter {
                flex-direction: column;
                align-items: stretch;
            }


            .student-attendance-filter input {
                width: 100%;
                box-sizing: border-box;
            }


            .student-attendance-student-card {
                padding: 14px;
            }

        }


        @media(max-width:430px) {

            .student-attendance-summary-grid {
                grid-template-columns: 1fr;
            }


            .weekly-grid {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(0, 1fr)
                    );
            }


            .student-attendance-title {
                align-items: flex-start;
            }


            .student-attendance-title-icon {
                width: 45px;
                height: 45px;
            }

        }


        /* DARK MODE */

        body.dark-mode .student-attendance-page,
        body.dark .student-attendance-page {
            background: #0f172a;
        }


        body.dark-mode .student-attendance-section,
        body.dark .student-attendance-section,
        body.dark-mode .student-attendance-student-card,
        body.dark .student-attendance-student-card,
        body.dark-mode .student-attendance-loading,
        body.dark .student-attendance-loading,
        body.dark-mode .student-attendance-error,
        body.dark .student-attendance-error {
            background: #111827;
            border-color: #374151;
        }


        body.dark-mode .student-attendance-title h1,
        body.dark .student-attendance-title h1,
        body.dark-mode .student-attendance-section-title h2,
        body.dark .student-attendance-section-title h2,
        body.dark-mode .student-attendance-student-info strong,
        body.dark .student-attendance-student-info strong,
        body.dark-mode .student-attendance-stat strong,
        body.dark .student-attendance-stat strong,
        body.dark-mode .student-attendance-mini-card strong,
        body.dark .student-attendance-mini-card strong,
        body.dark-mode .student-attendance-table td strong,
        body.dark .student-attendance-table td strong {
            color: #f9fafb;
        }


        body.dark-mode .student-attendance-title p,
        body.dark .student-attendance-title p,
        body.dark-mode .student-attendance-section-title p,
        body.dark .student-attendance-section-title p,
        body.dark-mode .student-attendance-student-info span,
        body.dark .student-attendance-student-info span,
        body.dark-mode .student-attendance-student-info small,
        body.dark .student-attendance-student-info small,
        body.dark-mode .student-attendance-stat span,
        body.dark .student-attendance-stat span,
        body.dark-mode .student-attendance-mini-card span,
        body.dark .student-attendance-mini-card span {
            color: #9ca3af;
        }


        body.dark-mode .student-attendance-stat,
        body.dark .student-attendance-stat,
        body.dark-mode .student-attendance-mini-card,
        body.dark .student-attendance-mini-card,
        body.dark-mode .student-attendance-period,
        body.dark .student-attendance-period {
            background: #1f2937;
            border-color: #374151;
        }


        body.dark-mode .student-attendance-table th,
        body.dark .student-attendance-table th {
            background: #1f2937;
            color: #d1d5db;
        }


        body.dark-mode .student-attendance-table td,
        body.dark .student-attendance-table td {
            border-color: #374151;
            color: #d1d5db;
        }


        body.dark-mode .student-attendance-back,
        body.dark .student-attendance-back {
            background: #1f2937;
            color: #e5e7eb;
        }

    `;


    document.head.appendChild(
        style
    );

}





/* ============================================================
   STUDENT PORTAL - SUBJECTS
   Modern / Stylish Version
============================================================ */

async function openSubjects() {

    const studentPortal = document.getElementById("studentPortal");
    const subjectsPage = document.getElementById("subjectsPage");
    const subjectsList = document.getElementById("subjectsList");

    /* =========================================================
       SHOW SUBJECTS PAGE
    ========================================================= */

    showStudentPage(
        "subjectsPage",
        "Subjects",
        "Registered subjects for your class"
    );
    setActiveNavByKey("subjects");

    if (!subjectsList) {
        console.error("subjectsList element not found.");
        return;
    }

    /* =========================================================
       LOADING STATE
    ========================================================= */

    subjectsList.innerHTML = `
        <div class="subjects-modern-loading">
            <div class="subjects-loader">
                <i class="fas fa-book-open"></i>
            </div>

            <h3>Loading Your Subjects</h3>
            <p>Please wait while we prepare your subjects...</p>

            <div class="subjects-loading-bar">
                <span></span>
            </div>
        </div>
    `;

    try {

        /* =====================================================
           GET LOGGED-IN STUDENT
        ===================================================== */

        const loggedStudent = JSON.parse(
            localStorage.getItem("loggedStudent")
        );

        if (!loggedStudent || !loggedStudent.id) {

            subjectsList.innerHTML = `
                <div class="subjects-modern-message error">

                    <div class="subjects-message-icon">
                        <i class="fas fa-user-lock"></i>
                    </div>

                    <h3>Student Session Not Found</h3>

                    <p>
                        Your student session could not be found.
                        Please login again to continue.
                    </p>

                    <button
                        class="subjects-action-btn"
                        onclick="location.reload()"
                    >
                        <i class="fas fa-rotate-right"></i>
                        Login Again
                    </button>

                </div>
            `;

            return;
        }


        /* =====================================================
           GET FRESH STUDENT RECORD
        ===================================================== */

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("students")
            .select("*")
            .eq("id", loggedStudent.id)
            .single();


        if (studentError) {

            console.error(
                "Student fetch error:",
                studentError
            );

            subjectsList.innerHTML = `
                <div class="subjects-modern-message error">

                    <div class="subjects-message-icon">
                        <i class="fas fa-triangle-exclamation"></i>
                    </div>

                    <h3>Unable to Load Student Information</h3>

                    <p>
                        We couldn't retrieve your student information.
                        Please refresh the page and try again.
                    </p>

                    <button
                        class="subjects-action-btn"
                        onclick="openSubjects()"
                    >
                        <i class="fas fa-rotate-right"></i>
                        Try Again
                    </button>

                </div>
            `;

            return;
        }


        if (!student) {

            subjectsList.innerHTML = `
                <div class="subjects-modern-message error">

                    <div class="subjects-message-icon">
                        <i class="fas fa-user-slash"></i>
                    </div>

                    <h3>Student Not Found</h3>

                    <p>
                        Your student record could not be found
                        in the school system.
                    </p>

                </div>
            `;

            return;
        }


        /* =====================================================
           STUDENT DETAILS
        ===================================================== */

        const studentName =
            student.name ||
            `${student.firstname || ""} ${student.surname || ""}`.trim() ||
            "Student";

        const studentID =
            student.studentid ||
            student.studentId ||
            "N/A";

        const studentClass =
            student.studentclass ||
            "";

        const schoolID =
            student.schoolid ||
            student.schoolId ||
            "";


        console.log("==========================================");
        console.log("STUDENT SUBJECTS");
        console.log("Student:", studentName);
        console.log("Student ID:", studentID);
        console.log("Student Class:", studentClass);
        console.log("School ID:", schoolID);
        console.log("==========================================");


        /* =====================================================
           CHECK SCHOOL
        ===================================================== */

        if (!schoolID) {

            subjectsList.innerHTML = `
                <div class="subjects-modern-message warning">

                    <div class="subjects-message-icon">
                        <i class="fas fa-school"></i>
                    </div>

                    <h3>School Not Assigned</h3>

                    <p>
                        Your student account has not been assigned
                        to a school yet.
                    </p>

                </div>
            `;

            return;
        }


        /* =====================================================
           CHECK CLASS
        ===================================================== */

        if (!studentClass) {

            subjectsList.innerHTML = `
                <div class="subjects-modern-message warning">

                    <div class="subjects-message-icon">
                        <i class="fas fa-users"></i>
                    </div>

                    <h3>Class Not Assigned</h3>

                    <p>
                        Your class has not been assigned yet.
                        Please contact your school administrator.
                    </p>

                </div>
            `;

            return;
        }


        /* =====================================================
           FIND TEACHERS
        ===================================================== */

        const {
            data: teachers,
            error: teacherError
        } = await supabaseClient
            .from("users")
            .select(
                "id, firstname, surname, username, classes, subjects"
            )
            .eq("schoolid", schoolID)
            .eq("role", "teacher");


        if (teacherError) {

            console.error(
                "Teacher lookup error:",
                teacherError
            );

            subjectsList.innerHTML = `
                <div class="subjects-modern-message error">

                    <div class="subjects-message-icon">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>

                    <h3>Unable to Load Class Teacher</h3>

                    <p>
                        We couldn't retrieve your class teacher
                        information. Please try again later.
                    </p>

                    <button
                        class="subjects-action-btn"
                        onclick="openSubjects()"
                    >
                        <i class="fas fa-rotate-right"></i>
                        Try Again
                    </button>

                </div>
            `;

            return;
        }


        /* =====================================================
           FIND CLASS TEACHER
        ===================================================== */

        const classTeacher = (teachers || []).find(
            teacher => {

                if (!Array.isArray(teacher.classes)) {
                    return false;
                }

                return teacher.classes.some(
                    teacherClass =>
                        String(teacherClass)
                            .trim()
                            .toLowerCase() ===
                        String(studentClass)
                            .trim()
                            .toLowerCase()
                );

            }
        );


        /* =====================================================
           NO CLASS TEACHER
        ===================================================== */

        if (!classTeacher) {

            console.warn(
                "No class teacher found for class:",
                studentClass
            );

            subjectsList.innerHTML = `
                <div class="subjects-modern-message">

                    <div class="subjects-message-icon blue">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>

                    <h3>Class Teacher Not Assigned</h3>

                    <p>
                        No class teacher has been assigned to
                        <strong>
                            ${escapeStudentSubjectHTML(studentClass)}
                        </strong>
                        yet.
                    </p>

                </div>
            `;

            return;
        }


        /* =====================================================
           TEACHER NAME
        ===================================================== */

        const teacherName =
            (
                `${classTeacher.firstname || ""} ` +
                `${classTeacher.surname || ""}`
            ).trim() ||
            classTeacher.username ||
            "Class Teacher";


        /* =====================================================
           GET TEACHER SUBJECTS
        ===================================================== */

        let teacherSubjects =
            Array.isArray(classTeacher.subjects)
                ? classTeacher.subjects
                : [];


        /* =====================================================
           CLEAN SUBJECTS
        ===================================================== */

        teacherSubjects = [
            ...new Set(
                teacherSubjects
                    .map(subject =>
                        String(subject).trim()
                    )
                    .filter(Boolean)
            )
        ];


        /* =====================================================
           SORT SUBJECTS
        ===================================================== */

        teacherSubjects.sort(
            (a, b) =>
                a.localeCompare(b)
        );


        console.log(
            "Class Teacher:",
            teacherName
        );

        console.log(
            "Teacher Classes:",
            classTeacher.classes
        );

        console.log(
            "Teacher Subjects:",
            teacherSubjects
        );


        /* =====================================================
           NO SUBJECTS
        ===================================================== */

        if (teacherSubjects.length === 0) {

            subjectsList.innerHTML = `
                <div class="subjects-modern-message">

                    <div class="subjects-message-icon purple">
                        <i class="fas fa-book-open"></i>
                    </div>

                    <h3>No Subjects Assigned</h3>

                    <p>
                        Your class teacher,
                        <strong>
                            ${escapeStudentSubjectHTML(teacherName)}
                        </strong>,
                        has not been assigned any subjects yet.
                    </p>

                </div>
            `;

            return;
        }


        /* =====================================================
           SUBJECT ICONS
        ===================================================== */

        const subjectIcons = [
            "fa-calculator",
            "fa-book",
            "fa-flask",
            "fa-globe",
            "fa-language",
            "fa-palette",
            "fa-music",
            "fa-computer",
            "fa-person-running",
            "fa-seedling",
            "fa-atom",
            "fa-pen-nib"
        ];


        /* =====================================================
           CREATE SUBJECT CARDS
        ===================================================== */

        let subjectsHTML = "";

        teacherSubjects.forEach(
            (subject, index) => {

                const icon =
                    subjectIcons[
                        index % subjectIcons.length
                    ];

                subjectsHTML += `
                    <div
                        class="student-subject-card-modern"
                        style="--subject-index:${index}"
                    >

                        <div class="subject-card-top">

                            <div class="subject-number">
                                ${String(index + 1).padStart(2, "0")}
                            </div>

                            <div class="subject-status">
                                <i class="fas fa-check"></i>
                            </div>

                        </div>


                        <div class="subject-main-icon">
                            <i class="fas ${icon}"></i>
                        </div>


                        <div class="subject-card-content">

                            <span class="subject-label">
                                SUBJECT ${String(index + 1).padStart(2, "0")}
                            </span>

                            <h3>
                                ${escapeStudentSubjectHTML(subject)}
                            </h3>

                        </div>


                        <div class="subject-card-arrow">
                            <i class="fas fa-arrow-right"></i>
                        </div>

                    </div>
                `;

            }
        );


        /* =====================================================
           DISPLAY SUBJECTS
        ===================================================== */

        subjectsList.innerHTML = `

            <div class="student-subjects-modern-wrapper">


                <!-- ==========================================
                     HERO HEADER
                =========================================== -->

                <div class="subjects-hero">

                    <div class="subjects-hero-content">

                        <div class="subjects-hero-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>

                        <div>

                            <span class="subjects-hero-label">
                                STUDENT PORTAL
                            </span>

                            <h1>
                                My Subjects
                            </h1>

                            <p>
                                Your academic subjects for
                                <strong>
                                    ${escapeStudentSubjectHTML(studentClass)}
                                </strong>
                            </p>

                        </div>

                    </div>


                    <div class="subjects-hero-decoration">
                        <i class="fas fa-book"></i>
                        <i class="fas fa-pencil"></i>
                        <i class="fas fa-award"></i>
                    </div>

                </div>


                <!-- ==========================================
                     STUDENT + TEACHER INFORMATION
                =========================================== -->

                <div class="subjects-info-grid">


                    <!-- STUDENT CARD -->

                    <div class="subjects-profile-card">

                        <div class="subjects-profile-icon student">
                            <i class="fas fa-user-graduate"></i>
                        </div>

                        <div class="subjects-profile-details">

                            <span>
                                STUDENT
                            </span>

                            <h3>
                                ${escapeStudentSubjectHTML(studentName)}
                            </h3>

                            <p>
                                <i class="fas fa-id-card"></i>
                                ${escapeStudentSubjectHTML(studentID)}
                            </p>

                        </div>

                        <div class="subjects-profile-class">
                            <span>CLASS</span>
                            <strong>
                                ${escapeStudentSubjectHTML(studentClass)}
                            </strong>
                        </div>

                    </div>


                    <!-- TEACHER CARD -->

                    <div class="subjects-profile-card teacher">

                        <div class="subjects-profile-icon teacher">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>

                        <div class="subjects-profile-details">

                            <span>
                                CLASS TEACHER
                            </span>

                            <h3>
                                ${escapeStudentSubjectHTML(teacherName)}
                            </h3>

                            <p>
                                <i class="fas fa-user-tie"></i>
                                Your Class Teacher
                            </p>

                        </div>

                        <div class="teacher-online-status">
                            <span></span>
                            Assigned
                        </div>

                    </div>

                </div>


                <!-- ==========================================
                     SUBJECT SUMMARY
                =========================================== -->

                <div class="subjects-summary">

                    <div class="subjects-summary-left">

                        <div class="summary-icon">
                            <i class="fas fa-books"></i>
                        </div>

                        <div>

                            <span>
                                ACADEMIC PROGRAMME
                            </span>

                            <h2>
                                Your Subjects
                            </h2>

                            <p>
                                Subjects assigned to your class
                                by your class teacher.
                            </p>

                        </div>

                    </div>


                    <div class="subjects-total">

                        <strong>
                            ${teacherSubjects.length}
                        </strong>

                        <span>
                            ${
                                teacherSubjects.length === 1
                                    ? "Subject"
                                    : "Subjects"
                            }
                            Assigned
                        </span>

                    </div>

                </div>


                <!-- ==========================================
                     SUBJECT GRID
                =========================================== -->

                <div class="student-subjects-grid-modern">

                    ${subjectsHTML}

                </div>


                <!-- ==========================================
                     FOOTER
                =========================================== -->

                <div class="subjects-footer">

                    <i class="fas fa-circle-info"></i>

                    <span>
                        These subjects are based on the
                        academic assignments for your class.
                    </span>

                </div>

            </div>
        `;


        console.log(
            "Subjects successfully displayed."
        );

        console.log(
            "=========================================="
        );


    } catch (error) {

        console.error(
            "Unexpected error loading student subjects:",
            error
        );


        subjectsList.innerHTML = `
            <div class="subjects-modern-message error">

                <div class="subjects-message-icon">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>

                <h3>Something Went Wrong</h3>

                <p>
                    We were unable to load your subjects.
                    Please refresh the page and try again.
                </p>

                <button
                    class="subjects-action-btn"
                    onclick="openSubjects()"
                >
                    <i class="fas fa-rotate-right"></i>
                    Try Again
                </button>

            </div>
        `;
    }
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeStudentSubjectHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   STUDENT TIMETABLE
============================================================ */
var STUDENT_TIMETABLE_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
function getLoggedStudentForTimetable(){try{return JSON.parse(localStorage.getItem("loggedStudent")||"null");}catch(e){return null;}}
function studentTimetableTime(a,b){return `${a?a.slice(0,5):""}${a||b?" – ":""}${b?b.slice(0,5):""}`;}
function showStudentTimetableStatus(msg,error=false){const b=document.getElementById("studentTimetableStatus");if(!b)return;b.textContent=msg;b.className="student-timetable-status "+(error?"error":"info");}
async function openStudentTimetable(){
  showStudentPage(
    "studentTimetablePage",
    "Timetable",
    "Your weekly class schedule"
  );
  setActiveNavByKey("timetable");
  const s=getLoggedStudentForTimetable();if(!s)return showStudentTimetableStatus("Student session not found. Please log in again.",true);
  document.getElementById("studentTimetableTerm").value=s.currentTerm||"term1";
  await loadStudentTimetable();
}
function closeStudentTimetable(){const p=document.getElementById("studentTimetablePage");if(p)p.style.display="none";goHome();}
async function loadStudentTimetable(){
  const s = getLoggedStudentForTimetable();
  if (!s) return;

  const term = document.getElementById("studentTimetableTerm")?.value || "term1";
  const body = document.getElementById("studentTimetableBody");
  if (!body) return;

  body.innerHTML = '<tr><td colspan="6" class="student-timetable-empty"><i class="fas fa-spinner fa-spin"></i> Loading timetable...</td></tr>';

  const cls = String(s.studentclass || s.studentClass || s.class || "").trim();
  const school = s.schoolid || s.schoolID || s.schoolId || "";

  if (!cls || !school) {
    showStudentTimetableStatus("Your class or school information is missing.", true);
    body.innerHTML = '<tr><td colspan="6" class="student-timetable-empty">Class information missing.</td></tr>';
    return;
  }

  try {
    // Load class timetable directly from timetables table (same source as staff portal)
    let query = supabaseClient
      .from("timetables")
      .select("*")
      .eq("schoolid", school)
      .eq("class", cls)
      .eq("term", term)
      .order("period", { ascending: true })
      .order("start_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Student timetable error:", error);
      showStudentTimetableStatus("Unable to load your class timetable. " + (error.message || ""), true);
      body.innerHTML = '<tr><td colspan="6" class="student-timetable-empty">Timetable could not be loaded.</td></tr>';
      return;
    }

    let list = Array.isArray(data) ? data.slice() : [];

    // Normalize day names (Mon -> Monday etc.)
    const dayMap = {
      mon: "Monday", monday: "Monday",
      tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
      wed: "Wednesday", wednesday: "Wednesday",
      thu: "Thursday", thur: "Thursday", thursday: "Thursday",
      fri: "Friday", friday: "Friday"
    };
    list = list.map(e => {
      const raw = String(e.day || "").trim();
      const key = raw.toLowerCase();
      return { ...e, day: dayMap[key] || raw };
    });

    // Fill missing teacher names from users table when teacher_id is present
    const missingTeacherIds = [...new Set(
      list.filter(e => !e.teacher_name && e.teacher_id).map(e => e.teacher_id)
    )];
    if (missingTeacherIds.length) {
      try {
        const { data: teachers } = await supabaseClient
          .from("users")
          .select("id, firstname, surname, username, name")
          .in("id", missingTeacherIds);
        const map = {};
        (teachers || []).forEach(t => {
          map[String(t.id)] = t.name || (`${t.firstname || ""} ${t.surname || ""}`.trim()) || t.username || "Teacher";
        });
        list = list.map(e => {
          if (!e.teacher_name && e.teacher_id && map[String(e.teacher_id)]) {
            return { ...e, teacher_name: map[String(e.teacher_id)] };
          }
          return e;
        });
      } catch (te) {
        console.warn("Teacher name lookup:", te);
      }
    }

    const sub = document.getElementById("studentTimetableSubtitle");
    if (sub) sub.textContent = `${cls} • ${term.replace("term", "Term ")} • ${list.length} period${list.length === 1 ? "" : "s"}`;

    if (!list.length) {
      showStudentTimetableStatus("No timetable has been published for your class this term yet.");
      body.innerHTML = '<tr><td colspan="6" class="student-timetable-empty">No timetable entries found for this class and term.</td></tr>';
      return;
    }

    showStudentTimetableStatus("Showing your class weekly timetable.");
    const times = [...new Set(list.map(e => `${e.start_time || ""}|${e.end_time || ""}`))].sort();
    body.innerHTML = times.map(k => {
      const [a, b] = k.split("|");
      const days = (typeof STUDENT_TIMETABLE_DAYS !== "undefined" && STUDENT_TIMETABLE_DAYS) ? STUDENT_TIMETABLE_DAYS : ["Monday","Tuesday","Wednesday","Thursday","Friday"];
      const cells = days.map(d => {
        const rows = list.filter(e => e.day === d && (e.start_time || "") === a && (e.end_time || "") === b);
        if (!rows.length) return '<td class="student-timetable-slot empty">—</td>';
        return `<td class="student-timetable-slot">${rows.map(e =>
          `<div class="student-timetable-card"><strong>${String(e.subject || "").replace(/</g, "&lt;")}</strong>` +
          `<span>${String(e.teacher_name || "Teacher").replace(/</g, "&lt;")}</span>` +
          (e.room ? `<small><i class="fas fa-door-open"></i> ${String(e.room).replace(/</g, "&lt;")}</small>` : "") +
          `</div>`
        ).join("")}</td>`;
      }).join("");
      return `<tr><td class="student-timetable-time">${studentTimetableTime(a, b)}</td>${cells}</tr>`;
    }).join("");
  } catch (err) {
    console.error("loadStudentTimetable unexpected:", err);
    showStudentTimetableStatus("Unable to load timetable.", true);
    body.innerHTML = '<tr><td colspan="6" class="student-timetable-empty">Timetable could not be loaded.</td></tr>';
  }
}

async function openFees(){

    let student=
    JSON.parse(localStorage.getItem("loggedStudent"));

    const {data}=await supabaseClient
    .from("fees")
    .select("*")
    .eq("studentid",student.id)
    .single();

    console.log(data);

}




/* ============================================================
   THEME (DARK MODE)
============================================================ */

/* ============================================================
   STUDENT PHOTO + BRANDING (from main SBA system)
   - students."student-photos"  → public URL from storage bucket student-photos
   - schools.schoolLogo         → public URL from storage bucket school-logos
   - /nabeng-sba-logo.png       → app logo (same as main system)
============================================================ */

function getDefaultStudentAvatar() {
    // Inline SVG avatar so it works even if default-user.png is missing
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect fill='%23e2e8f0' width='80' height='80'/%3E%3Ccircle cx='40' cy='30' r='14' fill='%2394a3b8'/%3E%3Cpath d='M12 70c4-16 18-24 28-24s24 8 28 24' fill='%2394a3b8'/%3E%3C/svg%3E";
}

function getStudentPhotoUrl(student) {
    if (!student || typeof student !== "object") {
        return getDefaultStudentAvatar();
    }

    const raw =
        student["student-photos"] ||
        student.student_photos ||
        student.photo ||
        student.studentPhoto ||
        student.studentphoto ||
        "";

    const url = String(raw || "").trim();

    if (!url || url === "null" || url === "undefined") {
        return getDefaultStudentAvatar();
    }

    return url;
}

function applyStudentPhotoToPortal(student) {
    const img = document.getElementById("portalStudentPhoto");
    if (!img) return;

    const url = getStudentPhotoUrl(student);
    img.onerror = function () {
        this.onerror = null;
        this.src = getDefaultStudentAvatar();
    };
    img.src = url;
    img.style.display = "block";
}

function bindSbaLogoImage(img) {
    if (!img || img.dataset.logoBound === "1") return;
    img.dataset.logoBound = "1";

    const candidates = [
        "/nabeng-sba-logo.png",
        "nabeng-sba-logo.png",
        "./nabeng-sba-logo.png",
        "assets/nabeng-sba-logo.png",
        "/assets/nabeng-sba-logo.png"
    ];

    img.dataset.logoStep = "0";
    img.style.display = "block";

    img.onerror = function () {
        const step = Number(this.dataset.logoStep || "0") + 1;
        this.dataset.logoStep = String(step);
        if (step < candidates.length) {
            this.src = candidates[step];
            return;
        }
        // All paths failed — show graduation-cap fallback
        this.style.display = "none";
        const fallback = document.getElementById("sidebarBrandFallbackIcon");
        if (fallback) fallback.style.display = "block";
        const loginParent = this.closest && this.closest(".logo");
        if (loginParent) loginParent.classList.add("logo-fallback");
    };

    img.onload = function () {
        this.style.display = "block";
        const fallback = document.getElementById("sidebarBrandFallbackIcon");
        if (fallback) fallback.style.display = "none";
        const loginParent = this.closest && this.closest(".logo");
        if (loginParent) loginParent.classList.remove("logo-fallback");
    };

    img.src = candidates[0];
}

async function loadPortalBranding(student) {
    // Brand icon = Nabeng SBA app logo (same as main system)
    bindSbaLogoImage(document.getElementById("sidebarSbaLogo"));
    bindSbaLogoImage(document.getElementById("loginSbaLogo"));

    if (!student) return;

    const schoolId =
        student.schoolid ||
        student.schoolID ||
        student.schoolId ||
        "";

    if (!schoolId || typeof supabaseClient === "undefined") {
        return;
    }

    try {
        const { data: school, error } = await supabaseClient
            .from("schools")
            .select("schoolname, schoolLogo")
            .eq("schoolid", schoolId)
            .maybeSingle();

        if (error) {
            console.warn("School branding load:", error);
            return;
        }

        if (!school) return;

        const schoolName = school.schoolname || "";
        const schoolLogo = (school.schoolLogo || "").trim();

        const row = document.getElementById("sidebarSchoolRow");
        const nameEl = document.getElementById("sidebarSchoolName");
        const logoEl = document.getElementById("sidebarSchoolLogo");
        const subtitle = document.getElementById("sidebarBrandSubtitle");

        if (nameEl && schoolName) {
            nameEl.textContent = schoolName;
        }

        // School logo only in the school row — not in the Nabeng SBA brand icon
        if (logoEl && schoolLogo) {
            logoEl.style.display = "block";
            logoEl.onerror = function () {
                this.style.display = "none";
            };
            logoEl.src = schoolLogo;
        }

        if (row && (schoolName || schoolLogo)) {
            row.style.display = "flex";
        }

        if (subtitle && schoolName) {
            subtitle.textContent = schoolName;
        }

    } catch (err) {
        console.warn("loadPortalBranding:", err);
    }
}


function getPreferredTheme() {
    try {
        const saved = localStorage.getItem("studentPortalTheme");
        if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function applyAppTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("dark", isDark);

    try {
        localStorage.setItem("studentPortalTheme", isDark ? "dark" : "light");
    } catch (e) {}

    const icon = document.getElementById("appThemeToggleIcon");
    if (icon) {
        icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    }

    const loginIcon = document.getElementById("loginThemeToggleIcon");
    if (loginIcon) {
        loginIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    }

    const loginLabel = document.getElementById("loginThemeToggleLabel");
    if (loginLabel) {
        loginLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }

    const toggleBtn = document.getElementById("appThemeToggle");
    if (toggleBtn) {
        toggleBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    }
}

function toggleAppTheme() {
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyAppTheme(next);
}

function initAppTheme() {
    applyAppTheme(getPreferredTheme());
}

// Apply as early as possible to reduce flash
initAppTheme();


function showAppShell() {
    const portal = document.getElementById("studentPortal");
    if (portal) portal.style.display = "flex";
    document.body.classList.add("app-logged-in");
    const sb = document.getElementById("appSidebar");
    if (sb) sb.style.display = "flex";
}

function setAppPageHeader(title, subtitle) {
    const t = document.getElementById("appPageTitle");
    const s = document.getElementById("appPageSubtitle");
    if (t && title) t.textContent = title;
    if (s && subtitle !== undefined) s.textContent = subtitle;
}

const STUDENT_FEATURE_PAGES = [
    "profilePage",
    "resultsPage",
    "subjectsPage",
    "messagesPage",
    "downloadsPage",
    "notificationsPage",
    "studentTimetablePage",
    "studentHomeworkPage",
    "attendancePage"
];

function hideAllStudentFeaturePages() {
    STUDENT_FEATURE_PAGES.forEach(id => {
        const page = document.getElementById(id);
        if (page) {
            page.style.display = "none";
            page.setAttribute("aria-hidden", "true");
        }
    });
}

/**
 * Central page switcher — only one feature page (or dashboard) visible.
 * Keeps sidebar + topbar mounted.
 */
function showStudentPage(pageId, title, subtitle) {
    showAppShell();

    const main = document.querySelector("#studentPortal .app-main");
    if (main) main.style.display = "flex";

    // Always clear every feature page first
    hideAllStudentFeaturePages();

    const home = document.getElementById("dashboardHome");

    if (!pageId || pageId === "dashboard" || pageId === "home") {
        if (home) home.style.display = "block";
        setAppPageHeader(
            title || "Dashboard",
            subtitle !== undefined ? subtitle : "Overview of your academic portal"
        );
        closeAppSidebar();
        return;
    }

    if (home) home.style.display = "none";

    const page = document.getElementById(pageId);
    if (page) {
        page.style.display = "block";
        page.setAttribute("aria-hidden", "false");
        // Scroll page content to top
        try { page.scrollTop = 0; } catch (e) {}
        window.scrollTo(0, 0);
    } else {
        console.warn("showStudentPage: missing page", pageId);
    }

    if (title) setAppPageHeader(title, subtitle || "");
    closeAppSidebar();
}

function hideDashboardMainOnly() {
    /* Back-compat: hide dashboard home, keep shell/topbar */
    showAppShell();
    const main = document.querySelector("#studentPortal .app-main");
    if (main) main.style.display = "flex";
    const home = document.getElementById("dashboardHome");
    if (home) home.style.display = "none";
    hideAllStudentFeaturePages();
    closeAppSidebar();
}

function showDashboardMain() {
    showStudentPage("dashboard");
}

function setActiveNav(btn) {
    document.querySelectorAll(".app-nav-item").forEach(el => el.classList.remove("active"));
    if (btn) btn.classList.add("active");
    closeAppSidebar();
}

function setActiveNavByKey(key) {
    const btn = document.querySelector(`.app-nav-item[data-nav="${key}"]`);
    setActiveNav(btn);
}

function toggleAppSidebar() {
    document.body.classList.toggle("sidebar-open");
}

function closeAppSidebar() {
    document.body.classList.remove("sidebar-open");
}

function studentLogout() {
    try {
        localStorage.removeItem("loggedStudent");
    } catch (e) {}
    currentStudent = null;
    document.body.classList.remove("app-logged-in", "sidebar-open");
    const portal = document.getElementById("studentPortal");
    if (portal) portal.style.display = "none";
    if (typeof hideAllStudentFeaturePages === "function") {
        hideAllStudentFeaturePages();
    }
    const login = document.getElementById("loginPage");
    if (login) login.style.display = "flex";
}

function refreshDashboardHome(student) {
    if (!student) {
        try {
            student = JSON.parse(localStorage.getItem("loggedStudent") || "null");
        } catch (e) { student = null; }
    }
    if (!student) return;

    applyStudentPhotoToPortal(student);

    const name = student.name || "Student";
    const cls = student.studentclass || student.studentClass || "";
    const first = String(name).split(" ")[0];

    const greet = document.getElementById("dashGreeting");
    if (greet) greet.textContent = `Welcome back, ${first}`;

    const welcome = document.getElementById("dashWelcomeText");
    if (welcome) {
        welcome.textContent = cls
            ? `You are logged in as ${name} · ${cls}. Use the sidebar to open any section.`
            : `You are logged in as ${name}. Use the sidebar to open any section.`;
    }

    const glanceName = document.getElementById("glanceName");
    if (glanceName) glanceName.textContent = name;
    const glanceClass = document.getElementById("glanceClass");
    if (glanceClass) glanceClass.textContent = cls ? `Class ${cls}` : "Class not set";

    const chip = document.getElementById("dashDateChip");
    if (chip) {
        chip.textContent = new Date().toLocaleDateString([], {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    const title = document.getElementById("appPageTitle");
    if (title) title.textContent = "Dashboard";
    const sub = document.getElementById("appPageSubtitle");
    if (sub) sub.textContent = "Overview of your academic portal";
}

function goHome() {
    showStudentPage("dashboard");
    document.querySelectorAll(".app-nav-item").forEach(el => el.classList.remove("active"));
    const homeBtn = document.querySelector('.app-nav-item[data-nav="home"]');
    if (homeBtn) homeBtn.classList.add("active");
    refreshDashboardHome();
}


async function openDownloads(){
    showStudentPage(
        "downloadsPage",
        "Downloads",
        "Report cards and files"
    );
    setActiveNavByKey("downloads");
    const status = document.getElementById("downloadStatus");
    if (status) status.innerHTML = "";
}

/* ============================================================
   STUDENT PORTAL
   TERM REPORT DOWNLOAD SYSTEM
   ============================================================ */


/* ============================================================
   OPEN DOWNLOADS
   ============================================================ */

async function openDownloads() {
    showStudentPage(
        "downloadsPage",
        "Downloads",
        "Report cards and files"
    );
    setActiveNavByKey("downloads");
    const status = document.getElementById("downloadStatus");
    if (status) status.innerHTML = "";
}


/* ============================================================
   BACK TO STUDENT PORTAL
   ============================================================ */

function closeDownloads() {

    const downloads =
        document.getElementById("downloadsPage");

    if (downloads) {
        downloads.style.display = "none";
    }

    goHome();

}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatStudentReportDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "-";
    }

    const day =
        d.getDate();

    const month =
        d.toLocaleString(
            "default",
            { month: "long" }
        );

    const year =
        d.getFullYear();


    function ordinal(n) {

        if (n > 3 && n < 21) {
            return "th";
        }

        switch (n % 10) {

            case 1:
                return "st";

            case 2:
                return "nd";

            case 3:
                return "rd";

            default:
                return "th";
        }
    }


    return (
        day +
        ordinal(day) +
        " " +
        month +
        ", " +
        year
    );

}


/* ============================================================
   GRADE
   Same grading scale as the main SBA system
   ============================================================ */

function studentReportGrade(score) {

    score = Number(score) || 0;


    if (score >= 80) return "A1";

    if (score >= 70) return "B2";

    if (score >= 65) return "B3";

    if (score >= 60) return "C4";

    if (score >= 55) return "C5";

    if (score >= 50) return "C6";

    if (score >= 45) return "D7";

    if (score >= 40) return "E8";

    return "F9";
}


/* ============================================================
   REMARK
   Same remark scale as main SBA
   ============================================================ */

function studentReportRemark(score) {

    score = Number(score) || 0;


    if (score >= 80) return "Excellent";

    if (score >= 70) return "Very Good";

    if (score >= 65) return "Good";

    if (score >= 60) return "Credit";

    if (score >= 55) return "Fair";

    if (score >= 50) return "Pass";

    if (score >= 45) return "Weak Pass";

    if (score >= 40) return "Very Weak";

    return "Fail";
}


/* ============================================================
   CALCULATE SUBJECT RESULT
   Uses saved values first.
   Falls back to old format if necessary.
   ============================================================ */

function getStudentReportSubjectResult(
    data
) {

    if (!data) {

        return {
            classScore: 0,
            examScore: 0,
            totalScore: 0,
            grade: "F9",
            remark: "Fail"
        };

    }


    /* ------------------------------------------
       NEW SAVED FORMAT
    ------------------------------------------ */

    let classScore;

    let examScore;

    let totalScore;


    if (
        data.classScore !== undefined &&
        data.classScore !== null
    ) {

        classScore =
            Number(data.classScore) || 0;

    }

    else {

        const classTotal =

            Number(data.test1 || 0) +

            Number(data.test2 || 0) +

            Number(data.project || 0) +

            Number(data.group || 0);


        classScore =
            (classTotal / 100) * 50;

    }


    if (
        data.examScore !== undefined &&
        data.examScore !== null
    ) {

        examScore =
            Number(data.examScore) || 0;

    }

    else {

        examScore =
            (Number(data.exam || 0) / 100) * 50;

    }


    if (
        data.totalScore !== undefined &&
        data.totalScore !== null
    ) {

        totalScore =
            Number(data.totalScore) || 0;

    }

    else {

        totalScore =
            classScore + examScore;

    }


    return {

        classScore,

        examScore,

        totalScore,

        grade:
            data.grade ||
            studentReportGrade(totalScore),

        remark:
            data.remark ||
            studentReportRemark(totalScore)

    };

}


/* ============================================================
   CALCULATE STUDENT AVERAGE
   ============================================================ */

function calculatePortalStudentAverage(
    student,
    term
) {

    let total = 0;

    let count = 0;


    const studentSubjects =
        student.subjects || {};


    Object.keys(studentSubjects)
        .forEach(subject => {

            const data =
                studentSubjects[subject]?.[term];


            if (!data) {
                return;
            }


            const result =
                getStudentReportSubjectResult(data);


            total +=
                result.totalScore;

            count++;

        });


    if (!count) {
        return 0;
    }


    return Number(
        (total / count).toFixed(2)
    );

}


/* ============================================================
   GET POSITION
   Uses ALL students in the same class.
   ============================================================ */

function calculatePortalPosition(
    student,
    classmates,
    term,
    subjectList
) {

    const ranked =
        classmates.map(s => {

            let totalScore = 0;


            subjectList.forEach(subject => {

                const data =
                    s.subjects?.[subject]?.[term];


                if (!data) {
                    return;
                }


                const result =
                    getStudentReportSubjectResult(
                        data
                    );


                totalScore +=
                    result.totalScore;

            });


            return {

                id: s.id,

                totalScore:
                    Number(
                        totalScore.toFixed(2)
                    )

            };

        });


    ranked.sort(
        (a, b) =>
            b.totalScore -
            a.totalScore
    );


    const index =
        ranked.findIndex(
            s =>
                String(s.id) ===
                String(student.id)
        );


    if (index === -1) {
        return "-";
    }


    return formatPortalPosition(
        index + 1
    );

}


/* ============================================================
   FORMAT POSITION
   ============================================================ */

function formatPortalPosition(
    position
) {

    if (position === 1) {
        return "1st";
    }

    if (position === 2) {
        return "2nd";
    }

    if (position === 3) {
        return "3rd";
    }


    return (
        position +
        "th"
    );

}


/* ============================================================
   GET CLASS TEACHER
   ============================================================ */

async function getPortalClassTeacher(
    schoolid,
    studentClass
) {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("users")

            .select(
                "firstname,surname,fullname,username,classes,signature"
            )

            .eq(
                "schoolid",
                schoolid
            )

            .eq(
                "role",
                "teacher"
            );


        if (error) {

            console.error(
                "Teacher lookup error:",
                error
            );

            return {
                name: "Class Teacher",
                signature: ""
            };

        }


        const teacher =
            (data || []).find(
                t => {

                    if (
                        !Array.isArray(
                            t.classes
                        )
                    ) {
                        return false;
                    }

                    return t.classes.includes(
                        studentClass
                    );

                }
            );


        if (!teacher) {

            return {
                name: "Class Teacher",
                signature: ""
            };

        }


        const generatedName =

            (
                teacher.firstname ||
                ""
            ) +

            " " +

            (
                teacher.surname ||
                ""
            );


        const name =
            teacher.fullname ||
            generatedName.trim() ||
            teacher.username ||
            "Class Teacher";


        return {

            name,

            signature:
                teacher.signature ||
                ""

        };


    } catch (error) {

        console.error(
            "Class teacher error:",
            error
        );


        return {

            name: "Class Teacher",

            signature: ""

        };

    }

}


/* ============================================================
   GET HEADTEACHER / ADMIN SIGNATURE
   ============================================================ */

async function getPortalHeadteacher(
    schoolid
) {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("users")

            .select(
                "firstname,surname,fullname,username,signature"
            )

            .eq(
                "schoolid",
                schoolid
            )

            .eq(
                "role",
                "admin"
            )

            .limit(1);


        if (error) {

            console.error(
                "Headteacher lookup error:",
                error
            );

            return {
                name: "Headteacher",
                signature: ""
            };

        }


        const admin =
            data?.[0];


        if (!admin) {

            return {
                name: "Headteacher",
                signature: ""
            };

        }


        const generatedName =

            (
                admin.firstname ||
                ""
            ) +

            " " +

            (
                admin.surname ||
                ""
            );


        return {

            name:
                admin.fullname ||
                generatedName.trim() ||
                admin.username ||
                "Headteacher",

            signature:
                admin.signature ||
                ""

        };


    } catch (error) {

        console.error(
            "Headteacher error:",
            error
        );


        return {

            name: "Headteacher",

            signature: ""

        };

    }

}


/* ============================================================
   GET TERM DATES
   ============================================================ */

async function getPortalTermDates(
    schoolid,
    term
) {

    const {
        data,
        error
    } = await supabaseClient

        .from("termsettings")

        .select("*")

        .eq(
            "schoolid",
            schoolid
        )

        .maybeSingle();


    if (error) {

        console.error(
            "Term settings error:",
            error
        );

        return {
            endDate: "",
            nextDate: ""
        };

    }


    if (!data) {

        return {
            endDate: "",
            nextDate: ""
        };

    }


    if (term === "term1") {

        return {

            endDate:
                data.t1end || "",

            nextDate:
                data.t2start || ""

        };

    }


    if (term === "term2") {

        return {

            endDate:
                data.t2end || "",

            nextDate:
                data.t3start || ""

        };

    }


    if (term === "term3") {

        return {

            endDate:
                data.t3end || "",

            nextDate:
                data.t1start || ""

        };

    }


    return {

        endDate: "",

        nextDate: ""

    };

}


/* ============================================================
   GENERATE TERM REPORT
   ============================================================ */

async function generateStudentTermReport(term) {

    const status =
        document.getElementById("downloadStatus");


    try {

        status.innerHTML = `
            <div class="download-loading">
                <i class="fas fa-spinner fa-spin"></i>
                Generating ${term.toUpperCase()} report...
            </div>
        `;


        // ==========================================
        // GET LOGGED-IN STUDENT
        // ==========================================

        const loggedStudent =
            JSON.parse(
                localStorage.getItem("loggedStudent")
            );


        if (!loggedStudent) {

            alert("Student session not found.");

            return;
        }


        // ==========================================
        // GET FRESH STUDENT DATA
        // ==========================================

        const {
            data: student,
            error: studentError
        } = await supabaseClient

            .from("students")

            .select("*")

            .eq("id", loggedStudent.id)

            .single();


        if (studentError || !student) {

            console.error(studentError);

            alert("Unable to load student information.");

            return;
        }


        // ==========================================
        // CHECK WHETHER RESULTS EXIST
        // ==========================================

        const studentSubjects =
            student.subjects || {};

        let hasResults = false;

        Object.keys(studentSubjects).forEach(subject => {

            if (
                studentSubjects[subject]?.[term]
            ) {

                hasResults = true;

            }

        });


        if (!hasResults) {

            status.innerHTML = "";

            alert(
                `${term.toUpperCase()} results are not available yet.`
            );

            return;
        }


        // ==========================================
        // SCHOOL INFORMATION
        // ==========================================

        const {
            data: school
        } = await supabaseClient

            .from("schools")

            .select("schoolname, schoolLogo")

            .eq("schoolid", student.schoolid)

            .single();


        const schoolName =
            school?.schoolname ||
            "Your School";

        const schoolLogo =
            school?.schoolLogo || "";


        // ==========================================
        // TERM SETTINGS
        // ==========================================

        const {
            data: termSettings
        } = await supabaseClient

            .from("termsettings")

            .select("*")

            .eq("schoolid", student.schoolid)

            .single();


        let termEnd = "";
        let nextTerm = "";


        if (term === "term1") {

            termEnd =
                termSettings?.t1end;

            nextTerm =
                termSettings?.t2start;

        }

        if (term === "term2") {

            termEnd =
                termSettings?.t2end;

            nextTerm =
                termSettings?.t3start;

        }

        if (term === "term3") {

            termEnd =
                termSettings?.t3end;

            nextTerm =
                termSettings?.t1start;

        }


        // ==========================================
        // TEACHER
        // ==========================================

        let teacherName =
            "Class Teacher";

        let teacherSignature =
            "";


        const {
            data: teachers
        } = await supabaseClient

            .from("users")

            .select(
                "fullname, username, classes, signature"
            )

            .eq("schoolid", student.schoolid)

            .eq("role", "teacher");


        const classTeacher =
            (teachers || []).find(t =>

                Array.isArray(t.classes) &&
                t.classes.includes(
                    student.studentclass
                )

            );


        if (classTeacher) {

            teacherName =
                classTeacher.fullname ||
                classTeacher.username ||
                "Class Teacher";

            teacherSignature =
                classTeacher.signature || "";

        }


        // ==========================================
        // HEADTEACHER
        // ==========================================

        let headSignature = "";


        const {
            data: head
        } = await supabaseClient

            .from("users")

            .select("signature")

            .eq("schoolid", student.schoolid)

            .eq("role", "admin")

            .maybeSingle();


        if (head) {

            headSignature =
                head.signature || "";

        }


        // ==========================================
        // ATTENDANCE
        // ==========================================

        const totalDays =
            student.totalDays?.[term] || 0;

        const daysPresent =
            student.daysPresent?.[term] || 0;

        const daysAbsent =
            Math.max(
                0,
                totalDays - daysPresent
            );


        // ==========================================
        // GENERATE SUBJECT ROWS
        // ==========================================

        let rows = "";

        let grandTotal = 0;

        let subjectCount = 0;


        Object.keys(studentSubjects)
            .forEach(subject => {

                const d =
                    studentSubjects[subject]?.[term];


                if (!d) return;


                const classTotal =

                    Number(d.test1 || 0) +

                    Number(d.test2 || 0) +

                    Number(d.project || 0) +

                    Number(d.group || 0);


                const classScore =
                    d.classScore !== undefined

                    ? Number(d.classScore)

                    : (classTotal / 100) * 50;


                const examScore =
                    d.examScore !== undefined

                    ? Number(d.examScore)

                    : (Number(d.exam || 0) / 100) * 50;


                const totalScore =
                    d.totalScore !== undefined

                    ? Number(d.totalScore)

                    : classScore + examScore;


                const grade =
                    d.grade ||
                    getStudentGrade(totalScore);


                const remark =
                    d.remark ||
                    getStudentRemark(totalScore);


                grandTotal +=
                    totalScore;

                subjectCount++;


                rows += `

                    <tr>

                        <td>
                            ${subject.toUpperCase()}
                        </td>

                        <td>
                            ${Math.round(classScore)}
                        </td>

                        <td>
                            ${Math.round(examScore)}
                        </td>

                        <td>
                            ${Math.round(totalScore)}
                        </td>

                        <td>
                            ${grade}
                        </td>

                        <td>
                            ${remark}
                        </td>

                    </tr>

                `;

            });


        const average =
            subjectCount

            ? (
                grandTotal /
                subjectCount
            ).toFixed(2)

            : "0.00";


        // ==========================================
        // FORMAT DATES
        // ==========================================

        const formatReportDate =
            date => {

                if (!date) return "-";

                return new Date(date)
                    .toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    );

            };


        // ==========================================
        // BUILD REPORT
        // ==========================================

        const report = document.createElement("div");

        report.id = "studentDownloadReport";


        report.innerHTML = `

        <div style="
            width:794px;
            min-height:1123px;
            padding:45px;
            box-sizing:border-box;
            background:white;
            color:#000;
            font-family:'Times New Roman',serif;
        ">


            <!-- SCHOOL HEADER -->

            <div style="
                text-align:center;
                border-bottom:2px solid #000;
                padding-bottom:10px;
            ">

                ${
                    schoolLogo

                    ? `

                    <img
                        src="${schoolLogo}"
                        style="
                            width:100px;
                            height:100px;
                            object-fit:contain;
                        ">

                    `

                    : ""

                }


                <h1 style="
                    margin:5px 0;
                    color:#00075D;
                    font-size:30px;
                ">

                    ${schoolName}

                </h1>


                <div style="
                    font-size:17px;
                    font-weight:bold;
                ">

                    STUDENT TERMINAL REPORT

                </div>


                <div style="
                    font-size:15px;
                    margin-top:5px;
                ">

                    ${term.toUpperCase()}

                </div>

            </div>



            <!-- STUDENT INFORMATION -->

            <table style="
                width:100%;
                margin-top:15px;
                border-collapse:collapse;
                font-size:15px;
            ">

                <tr>

                    <td style="padding:6px;">
                        <b>Name:</b>
                        ${student.name}
                    </td>

                    <td style="
                        padding:6px;
                        text-align:right;
                    ">
                        <b>Student ID:</b>
                        ${student.studentid || "-"}
                    </td>

                </tr>


                <tr>

                    <td style="padding:6px;">
                        <b>Class:</b>
                        ${student.studentclass}
                    </td>

                    <td style="
                        padding:6px;
                        text-align:right;
                    ">
                        <b>Term Ending:</b>
                        ${formatReportDate(termEnd)}
                    </td>

                </tr>


                <tr>

                    <td style="padding:6px;">
                        <b>Total Students:</b>
                        -
                    </td>

                    <td style="
                        padding:6px;
                        text-align:right;
                    ">
                        <b>Next Term Begins:</b>
                        ${formatReportDate(nextTerm)}
                    </td>

                </tr>

            </table>



            <!-- RESULTS -->

            <table style="
                width:100%;
                border-collapse:collapse;
                text-align:center;
                margin-top:12px;
                font-size:13px;
            ">

                <tr style="
                    background:#00075D;
                    color:white;
                ">

                    <th style="
                        border:1px solid #00075D;
                        padding:7px;
                    ">
                        Subject
                    </th>

                    <th style="
                        border:1px solid #00075D;
                        padding:7px;
                    ">
                        Class Score
                    </th>

                    <th style="
                        border:1px solid #00075D;
                        padding:7px;
                    ">
                        Exam
                    </th>

                    <th style="
                        border:1px solid #00075D;
                        padding:7px;
                    ">
                        Total
                    </th>

                    <th style="
                        border:1px solid #00075D;
                        padding:7px;
                    ">
                        Grade
                    </th>

                    <th style="
                        border:1px solid #00075D;
                        padding:7px;
                    ">
                        Remark
                    </th>

                </tr>

                ${rows}


                <tr>

                    <td
                        colspan="2"
                        style="
                            text-align:left;
                            padding:8px;
                            border:1px solid #000;
                        "
                    >
                        <b>Average</b>
                    </td>

                    <td
                        colspan="4"
                        style="
                            text-align:left;
                            padding:8px;
                            border:1px solid #000;
                        "
                    >
                        <b>${average}%</b>
                    </td>

                </tr>

            </table>



            <!-- ATTENDANCE -->

            <p style="
                margin-top:12px;
                font-size:14px;
            ">

                <b>Total School Days:</b>
                ${totalDays}

                &nbsp;&nbsp;&nbsp;&nbsp;

                <b>Days Present:</b>
                ${daysPresent}

                &nbsp;&nbsp;&nbsp;&nbsp;

                <b>Days Absent:</b>
                ${daysAbsent}

                ${
                    term === "term3"

                    ? `

                    &nbsp;&nbsp;&nbsp;&nbsp;

                    <b>Promotion Class:</b>
                    ${student.promotionClass || "Not Set"}

                    
`
                    : ""

                }

            </p>



            <!-- AFFECTIVE TRAITS -->

            <table style="
                width:100%;
                border-collapse:collapse;
                font-size:14px;
                margin-top:10px;
            ">

                <tr>

                    <th style="
                        background:#00075D;
                        color:white;
                        border:1px solid #00075D;
                        padding:7px;
                        text-align:left;
                    ">
                        Conduct
                    </th>

                    <td style="
                        border:1px solid #000;
                        padding:7px;
                    ">
                        ${student.conduct?.[term] || ""}
                    </td>

                </tr>


                <tr>

                    <th style="
                        background:#00075D;
                        color:white;
                        border:1px solid #00075D;
                        padding:7px;
                        text-align:left;
                    ">
                        Attitude
                    </th>

                    <td style="
                        border:1px solid #000;
                        padding:7px;
                    ">
                        ${student.attitude?.[term] || ""}
                    </td>

                </tr>


                <tr>

                    <th style="
                        background:#00075D;
                        color:white;
                        border:1px solid #00075D;
                        padding:7px;
                        text-align:left;
                    ">
                        Interest
                    </th>

                    <td style="
                        border:1px solid #000;
                        padding:7px;
                    ">
                        ${student.interest?.[term] || ""}
                    </td>

                </tr>

            </table>



            <!-- TEACHER REMARK -->

            <table style="
                width:100%;
                border-collapse:collapse;
                margin-top:10px;
                font-size:14px;
            ">

                <tr>

                    <th style="
                        width:35%;
                        background:#00075D;
                        color:white;
                        border:1px solid #00075D;
                        padding:8px;
                    ">
                        CLASS TEACHER'S REMARK
                    </th>

                    <td style="
                        border:1px solid #000;
                        padding:8px;
                    ">
                        ${student.teacherRemark?.[term] || ""}
                    </td>

                </tr>

            </table>



      

     


            </div>


        

        `;


        /*
         * Keep it outside the visible portal
         * while html2canvas processes it.
         */

        report.style.position =
            "absolute";

        report.style.left =
            "-10000px";

        report.style.top =
            "0";

        document.body.appendChild(report);


        // ==========================================
        // CONVERT TO CANVAS
        // ==========================================

        const canvas =
            await html2canvas(
                report,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff"
                }
            );


        // ==========================================
        // CREATE PDF
        // ==========================================

        const { jsPDF } =
            window.jspdf;


        const pdf =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );


        const imgData =
            canvas.toDataURL(
                "image/png",
                1.0
            );


        const pageWidth =
            210;

        const pageHeight =
            297;


        const imgWidth =
            pageWidth;


        const imgHeight =
            (canvas.height *
             imgWidth) /
            canvas.width;


        /*
         * If report is one A4 page,
         * fit it normally.
         */

        pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            Math.min(
                imgHeight,
                pageHeight
            )
        );


        // ==========================================
        // FILE NAME
        // ==========================================

        const safeName =
            student.name
                .replace(/[^a-z0-9]/gi, "_");


        const fileName =
            `${safeName}_${term}_Report.pdf`;


        // ==========================================
        // DOWNLOAD
        // ==========================================

        pdf.save(fileName);


        // Remove temporary report

        document.body.removeChild(
            report
        );


        status.innerHTML = `

            <div class="download-loading">

                <i class="fas fa-check-circle"
                   style="color:#16a34a;">
                </i>

                ${term.toUpperCase()} report downloaded successfully.

            </div>

        `;


        setTimeout(() => {

            status.innerHTML = "";

        }, 4000);


    } catch(error) {

        console.error(
            "Report generation error:",
            error
        );


        status.innerHTML = "";


        alert(
            "Unable to generate the report. Please try again."
        );

    }

}



// Homework answer modal close handlers (run now — DOM already mounted)
(function setupHomeworkModalHandlers() {
  const homeworkAnswerModal = document.getElementById("studentHomeworkAnswerModal");
  if (homeworkAnswerModal) {
    homeworkAnswerModal.addEventListener("click", function(e) {
      if (e.target === homeworkAnswerModal) closeHomeworkAnswer();
    });
  }
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && typeof closeHomeworkAnswer === "function") {
      try { closeHomeworkAnswer(); } catch (_) {}
    }
  });
})();


function showView(role) {
    // 1. Hide all sections
    const views = document.querySelectorAll('.dashboard-view');
    views.forEach(view => view.classList.remove('active'));

    // 2. Remove active class from all buttons
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Show the requested section
    const activeView = document.getElementById('view-' + role);
    activeView.classList.add('active');

    // 4. Set the clicked button as active
    const activeBtn = document.getElementById('btn-' + role);
    activeBtn.classList.add('active');

    // 5. Trigger special animations
    if (role === 'student') {
        setTimeout(() => {
            document.getElementById('student-progress').style.width = '70%';
        }, 200);
    } else {
        document.getElementById('student-progress').style.width = '0%';
    }
}

// Ensure the page starts at the NGO view
window.onload = () => showView('ngo');
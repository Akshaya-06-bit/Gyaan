const SUPABASE_URL = 'https://xntagxcagezzncqnqxkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudGFneGNhZ2V6em5jcW5xeGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwODIzMTAsImV4cCI6MjA3MzY1ODMxMH0.-BiPqlT23VNLfdeO5SiTeScHiQfdptN7BzoQk6120so';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function switchTab(type) {
    const siBox = document.getElementById('signin-box');
    const suBox = document.getElementById('signup-box');
    const siTab = document.getElementById('tab-signin');
    const suTab = document.getElementById('tab-signup');

    if (type === 'signin') {
        siBox.classList.remove('hidden');
        suBox.classList.add('hidden');
        siTab.classList.add('active');
        suTab.classList.remove('active');
    } else {
        siBox.classList.add('hidden');
        suBox.classList.remove('hidden');
        siTab.classList.remove('active');
        suTab.classList.add('active');
    }
}

// Signup Logic
document.getElementById('signup-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('su-name').value;
    const email = document.getElementById('su-email').value;
    const password = document.getElementById('su-password').value;
    const role = document.getElementById('su-role').value;

    const { data, error } = await sb.auth.signUp({
        email, password, options: { data: { full_name: name } }
    });

    if (error) return showMsg(error.message, 'e');

    if (data.user) {
        const { error: dbErr } = await sb.from('gyaan_users').insert([
            { id: data.user.id, email: email, role: role, full_name: name }
        ]);
        if (dbErr) showMsg("Role Error: " + dbErr.message, 'e');
        else alert("Account created! Check email if required.");
    }
};

// Signin Logic
document.getElementById('signin-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('si-email').value;
    const password = document.getElementById('si-password').value;

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return showMsg(error.message, 'e');

    const { data: profile } = await sb.from('gyaan_users').select('role').eq('id', data.user.id).single();
    if (profile) window.location.href = `blank.html?role=${profile.role}`;
    else showMsg("Profile not found.", 'e');
};

function showMsg(txt, type) {
    document.getElementById('msg-container').innerHTML = `<div class="amsg-${type}">${txt}</div>`;
}
document.addEventListener('DOMContentLoaded', () => {
    // Debugging Step 1: Log when the DOMContentLoaded event fires
    console.log('DOMContentLoaded event fired');

    const login = async (email, password) => {
        try {
            const res = await axios({
                method: 'POST',
                url: 'http://127.0.0.1:3000/api/v1/users/login',
                data: {
                    email,
                    password
                }
            });
            
            if (res.data.status === 'success')
                alert('Logged in successfully!');
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    const form = document.querySelector('.form');
    // Debugging Step 3: Check if the form element is found
    if (form) {
        console.log('Form element found:', form);

        form.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Debugging Step 4: Log the retrieved email and password values
            console.log('Form submitted with:', { email, password });

            login(email, password);
        });
    } else {
        console.error('Form element not found');
    }

    const logOutBtn = document.querySelector('.nav__el--logout');

    const logout = async () => {
        try {
            const res = await axios({
                method: 'GET',
                url: 'http://127.0.0.1:3000/api/v1/users/logout'
            });

            if (res.data.status === 'success') {
                alert('Logged out successfully!');
            }
        } catch (err) {
            alert('Error logging out! Retry!');
        }
    };

    if (logOutBtn) {
        logOutBtn.addEventListener('click', e => {
            e.preventDefault();
            logout();
        });
    } else {
        console.error('Logout button not found');
    }
});

//!

document.addEventListener('DOMContentLoaded', function() {
    const signup = async (name, email, password, passwordConfirm) => {
        try {
            const res = await axios({
                method: 'POST',
                url: 'http://127.0.0.1:3000/api/v1/users/signup',
                data: {
                    name,
                    email,
                    password,
                    passwordConfirm
                }
            });
            
            if (res.data.status === 'success') {
                alert('Signed up successfully!');
                // Redirect to a new page or handle success scenario
            }
        } catch (err) {
            alert(err.response.data.message);
        }
    }

    const form = document.querySelector('.form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        
        await signup(name, email, password, passwordConfirm);
    });
});


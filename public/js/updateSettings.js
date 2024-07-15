//!!

const updateData = async (name, email) => {
    try{
        const res = await axios({
            method: 'PATCH',
            url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
            data: {
                name,
                email
            }
        });

        if(res.data.status === 'success')
            alert('Data updated successfully!');
    } catch (err) {
        alert(err.response.data.message);
    }
};

const userDataForm = document.querySelector('.form-user-data');
if(userDataForm)
{
    userDataForm.addEventListener('submit', e=> {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateData(name, email);
    });
}
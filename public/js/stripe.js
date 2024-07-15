const stripe = stripe('pk_test_51PYqdRBOrNBEiSeAErmaYOLxwjTWvwKO0XkfoFwNGbCxKVmV0wMnCylPjjzrSs9fp54Owpfqvy8NcgicUdBUurqY00MHBJqrF1');

const bookTour = async tourID => {
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourID}`);
    console.log(session);
}

const bookBtn = document.querySelector('#book-tour');

if(bookBtn)
{
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourID} = e.target.dataset;
        bookTour(tourID);
    });
}
/* Define firestore and firebase storage references for easy use in functions */
const db = firebase.firestore();
const storage = firebase.storage()
const storageRef = storage.ref();

/* Write label for the animated logo in the database - from previous project */
function save_label(rating) {
    console.log('rated ' + rating)
    alias = document.getElementById("alias").value;
    db.collection("logo_rating").add({
        filename: get_current_logo(),
        data: get_current_data(),
        rating: rating,
        alias: alias,
        time: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
    load_random_logo()
}
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCh6aR5z94Pv5zdputrUsEnEpThLeVrWHs",
  authDomain: "rate-logos.firebaseapp.com",
  projectId: "rate-logos",
  storageBucket: "rate-logos.appspot.com",
  messagingSenderId: "719928782250",
  appId: "1:719928782250:web:0a54d5a1948bf3a3f3cfd3"
};

// Initialize Firebase
//const app = firebase.initializeApp(firebaseConfig);

/* Define firestore and firebase storage references for easy use in functions */
const db = firebase.firestore()
const storage = firebase.storage()
const storageRef = storage.ref();

console.log(db)
console.log(storage)
console.log(storageRef)

/* Write label for the animated logo in the database - from previous project */
function save_label(rating) {
    
    alias = document.getElementById("alias").value;
    console.log('rated ' + rating);

    const data = {
        filename: get_current_logo(),
        data: get_current_data(),
        rating: rating,
        alias: alias,
        time: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add a new document in collection "cities" with ID 'LA'
    const res = db.collection('labels').doc('animation_ratings').set(data);
    console.log("db added")
    load_random_logo()
}

/* Write label for the animated logo in the database - from previous project */
function save_label2(rating) {
    console.log('rated ' + rating)
    alias = document.getElementById("alias").value;
    db.collection('Rating').add({
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
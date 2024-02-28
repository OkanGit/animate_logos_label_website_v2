let current_id = -1;
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

async function get_current_id(){
    let doc = db.collection('animations_id').doc('id');
    await doc.get().then(function(doc){
        current_id = doc.data().id;
        console.log(current_id);
        set_current_id(current_id + 1);
    });
    return;
}

function set_current_id(id){
    const data = {
        id: id
    };
    const res = db.collection('animations_id').doc('id').set(data)
}

/* Write label for the animated logo in the database - from previous project */
async function save_label(rating) {
    
    current_data = get_current_data()
    alias = document.getElementById("alias").value;
    console.log('rated ' + rating);
    await get_current_id();
    console.log('id: ' + current_id);
    const data = {
        id: current_id,
        filename: get_current_logo(),
        //data: JSON.stringify(current_data),
        data: current_data,
        rating: rating,
        alias: alias,
        time: firebase.firestore.FieldValue.serverTimestamp()
    };
        
    console.log(data)
        // Add a new document in collection "cities" with ID 'LA'
    const res = db.collection('animations_new').doc(String(current_id)).set(data); 
    
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
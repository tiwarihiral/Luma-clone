// Replace the below config with your own from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Google provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
// Facebook provider
const facebookProvider = new firebase.auth.FacebookAuthProvider();

function loginWithGoogle() {
  firebase.auth().signInWithPopup(googleProvider)
    .then((result) => {
      alert('Logged in as: ' + result.user.displayName);
      // You can redirect or handle user info here
    })
    .catch((error) => {
      alert('Google login error: ' + error.message);
    });
}

function loginWithFacebook() {
  firebase.auth().signInWithPopup(facebookProvider)
    .then((result) => {
      alert('Logged in as: ' + result.user.displayName);
      // You can redirect or handle user info here
    })
    .catch((error) => {
      alert('Facebook login error: ' + error.message);
    });
} 
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,signOut } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js';

const firebaseConfig = {
    apiKey: "AIzaSyArECxvGeXh-hJWNuqSQIZW1xTMdq7Q3qw",
    authDomain: "productive-6a479.firebaseapp.com",
    projectId: "productive-6a479",
    storageBucket: "productive-6a479.firebasestorage.app",
    messagingSenderId: "94313586618",
    appId: "1:94313586618:web:8fba2e73577020bbee0783",
    measurementId: "G-ZWZ66KWQLH"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
//   const storage = getStorage(app);
  const analytics = getAnalytics(app);
  
  let currentUser = null;
  let currentNoteId = null;
  let currentNoteFiles = [];
  
  function initApp() {
      document.addEventListener('DOMContentLoaded', function() {
          // Auth event listeners
          document.getElementById('signUpBtn')?.addEventListener('click', signUp);
          document.getElementById('signInBtn')?.addEventListener('click', signIn);
          document.getElementById('googleSignInBtn')?.addEventListener('click', googleSignIn);
          document.getElementById('signOutBtn')?.addEventListener('click', signOutUser);
  
          // Top nav event listeners
          document.getElementById('newNoteBtn')?.addEventListener('click', addEmptyNote);
          document.getElementById('refreshBtn')?.addEventListener('click', refreshNotes);
          document.getElementById('githubBtn')?.addEventListener('click', () => window.open('https://github.com/yourusername/firebase-notes', '_blank'));
          document.getElementById('settingsBtn')?.addEventListener('click', toggleSettings);
  
          // Note event listeners
          document.getElementById('updateNoteBtn')?.addEventListener('click', updateNote);
          document.getElementById('uploadFileBtn')?.addEventListener('click', uploadFile);
          document.getElementById('closeNoteBtn')?.addEventListener('click', closeNote);
          document.getElementById('searchInput')?.addEventListener('input', filterNotes);
          document.getElementById('sortSelect')?.addEventListener('change', sortNotes);
  
          // Auto-save functionality
          let timeout;
          document.getElementById('noteContent')?.addEventListener('input', () => {
              clearTimeout(timeout);
              timeout = setTimeout(autoSave, 2000); // Auto-save after 2 seconds of no typing
          });
  
          // Router
          window.addEventListener('hashchange', router);
          router();
      });
  }
  
  function router() {
      const hash = window.location.hash;
      switch(hash) {
          case '#/':
          case '':
              showAuthSection();
              break;
          case '#/notes':
              showNoteSection();
              break;
          default:
              if (hash.startsWith('#/view/')) {
                  const noteId = hash.split('/')[2];
                  viewNote(noteId);
              } else {
                  showAuthSection();
              }
      }
  }
  
  async function signUp() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          currentUser = userCredential.user;
          logEvent(analytics, 'sign_up', { method: 'email' });
          window.location.hash = '#/notes';
      } catch (error) {
          console.error("Error signing up:", error.message);
          alert(error.message);
      }
  }
  
  async function signIn() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          currentUser = userCredential.user;
          logEvent(analytics, 'login', { method: 'email' });
          window.location.hash = '#/notes';
      } catch (error) {
          console.error("Error signing in:", error.message);
          alert(error.message);
      }
  }
  
  async function googleSignIn() {
      const provider = new GoogleAuthProvider();
      
      try {
          const result = await signInWithPopup(auth, provider);
          currentUser = result.user;
          logEvent(analytics, 'login', { method: 'google' });
          window.location.hash = '#/notes';
      } catch (error) {
          console.error("Error with Google sign-in:", error.message);
          alert(error.message);
      }
  }
  
  async function signOutUser() {
      try {
          await signOut(auth);
          currentUser = null;
          logEvent(analytics, 'sign_out');
          window.location.hash = '#/';
      } catch (error) {
          console.error("Error signing out:", error.message);
          alert(error.message);
      }
  }
  
  async function addEmptyNote() {
      try {
          const docRef = await addDoc(collection(db, "notes"), {
              uid: currentUser.uid,
              title: "Untitled Note",
              content: "",
              fileUrls: [],
              timestamp: serverTimestamp()
          });
          logEvent(analytics, 'empty_note_added');
          refreshNotes()
          viewNote(docRef.id);
      } catch (error) {
          console.error("Error adding empty note:", error);
          alert("Failed to create new note");
      }
  }
  
  async function autoSave() {
      if (!currentNoteId) return;
      
      const title = document.getElementById('noteTitle').value;
      const content = document.getElementById('noteContent').value;
  
      try {
          await updateDoc(doc(db, "notes", currentNoteId), {
              title: title,
              content: content,
              timestamp: serverTimestamp()
          });
          console.log("Auto-saved");
      } catch (error) {
          console.error("Error auto-saving:", error);
      }
      refreshNotes()
  }
  
  async function updateNote() {
      const title = document.getElementById('noteTitle').value;
      const content = document.getElementById('noteContent').value;
  
      try {
          await updateDoc(doc(db, "notes", currentNoteId), {
              title: title,
              content: content,
              fileUrls: currentNoteFiles,
              timestamp: serverTimestamp()
          });
          logEvent(analytics, 'note_updated');
          refreshNotes();
      } catch (error) {
          console.error("Error updating note:", error);
          alert("Failed to update note");
      }
  }
const firebaseConfig2 = {
    apiKey: "AIzaSyDneyhBPRMgl-gP_3xh33MuNiGSz_03YPs",
    authDomain: "mttcode.firebaseapp.com",
    projectId: "mttcode",
    storageBucket: "mttcode.appspot.com",
    messagingSenderId: "630582975513",
    appId: "1:630582975513:web:94625a01b98d9a65281e88"
  };
const app2 = initializeApp(firebaseConfig2,"secondary");
const storage = getStorage(app2);
  async function uploadFile() {
      const files = document.getElementById('fileUpload').files;
      if (!files.length) return;
  
      try {
          for (let file of files) {
              const storageRef = ref(storage, `files/${currentNoteId}/${file.name}`);
              await uploadBytes(storageRef, file);
              const downloadURL = await getDownloadURL(storageRef);
              currentNoteFiles.push({ name: file.name, url: downloadURL });
          }
          updateFileList();
          document.getElementById('fileUpload').value = '';
          await updateNote(); // Save the updated file list
      } catch (error) {
          console.error("Error uploading file:", error);
          alert("Failed to upload file");
      }
  }
  
  function updateFileList() {
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      currentNoteFiles.forEach((file, index) => {
          const fileDiv = document.createElement('div');
          fileDiv.className = 'file-item';
          
          const fileLink = document.createElement('button');
          fileLink.textContent = file.name;
          fileLink.onclick = () => window.open(file.url, '_blank');
          
          const removeBtn = document.createElement('button');
          removeBtn.textContent = '×';
          removeBtn.onclick = () => removeFile(index);
          
          fileDiv.appendChild(fileLink);
          fileDiv.appendChild(removeBtn);
          fileList.appendChild(fileDiv);
      });
  }
  
  async function removeFile(index) {
      const file = currentNoteFiles[index];
      try {
        //   const storageRef = ref(storage, `files/${currentNoteId}/${file.name}`);
        //   await deleteObject(storageRef);
          currentNoteFiles.splice(index, 1);
          updateFileList();
          await updateNote(); // Save the updated file list
      } catch (error) {
          console.error("Error removing file:", error);
          alert("Failed to remove file");
      }
  }
  
  async function deleteNote(noteId) {
      if (!confirm('Are you sure you want to delete this note?')) return;
  
      try {
          await deleteDoc(doc(db, "notes", noteId));
          logEvent(analytics, 'note_deleted');
          closeNote();
          refreshNotes();
      } catch (error) {
          console.error("Error deleting note:", error);
          alert("Failed to delete note");
      }
  }
  
  async function getNotes() {
      try {
          const q = query(
              collection(db, "notes"),
              where("uid", "==", currentUser.uid),
              orderBy("timestamp", "desc")
          );
          
          const querySnapshot = await getDocs(q);
          let notesHtml = '';
          
          querySnapshot.forEach((doc) => {
              const note = doc.data();
              console.log(note.timestamp)
              const date = note.timestamp ? new Date(note.timestamp.seconds*1000).toLocaleString() : 'No date';
              notesHtml += `
                  <div class="note" data-id="${doc.id}" onclick="viewNote('${doc.id}')">
                      <h3>${note.title || 'Untitled'}</h3>
                      <p>${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</p>
                      <small>${date}</small>
                  </div>
              `;
          });
          
          document.getElementById('notesList').innerHTML = notesHtml || '<p>No notes yet</p>';
      } catch (error) {
          console.error("Error getting notes:", error);
          alert("Failed to load notes");
      }
  }
  
  async function viewNote(noteId) {
      currentNoteId = noteId;
      try {
          const docRef = doc(db, "notes", noteId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
              const note = docSnap.data();
              document.getElementById('noteTitle').value = note.title || '';
              document.getElementById('noteContent').value = note.content || '';
              currentNoteFiles = note.fileUrls || [];
              updateFileList();
              document.getElementById('noteForm').style.display = 'block';
              
              // Mark this note as active in the list
              document.querySelectorAll('.note').forEach(note => {
                  note.classList.remove('active');
                  if (note.dataset.id === noteId) {
                      note.classList.add('active');
                  }
              });
          }
      } catch (error) {
          console.error("Error viewing note:", error);
          alert("Failed to load note");
      }
  }
  
  function closeNote() {
      document.getElementById('noteForm').style.display = 'none';
      currentNoteId = null;
      currentNoteFiles = [];
      document.querySelectorAll('.note').forEach(note => note.classList.remove('active'));
  }
  
  function filterNotes() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      document.querySelectorAll('.note').forEach(note => {
          const title = note.querySelector('h3').textContent.toLowerCase();
          const content = note.querySelector('p').textContent.toLowerCase();
          note.style.display = (title.includes(searchTerm) || content.includes(searchTerm)) ? 'block' : 'none';
      });
  }
  
  function sortNotes() {
      const sortBy = document.getElementById('sortSelect').value;
      const notesList = document.getElementById('notesList');
      const notes = Array.from(notesList.children);
      
      notes.sort((a, b) => {
          if (sortBy === 'title') {
              const titleA = a.querySelector('h3').textContent.toLowerCase();
              const titleB = b.querySelector('h3').textContent.toLowerCase();
              return titleA.localeCompare(titleB);
          } else {
              const dateA = new Date(a.querySelector('small').textContent);
              const dateB = new Date(b.querySelector('small').textContent);
              return dateB - dateA;
          }
      });
      
      notesList.innerHTML = '';
      notes.forEach(note => notesList.appendChild(note));
  }
  
  function refreshNotes() {
      getNotes();
  }
  
  function toggleSettings() {
      // Implement settings modal/panel here
      alert('Settings panel coming soon!');
  }
  
  function showAuthSection() {
      document.getElementById('authSection').style.display = 'block';
      document.getElementById('noteSection').style.display = 'none';
  }
  
  function showNoteSection() {
      if (currentUser) {
          document.getElementById('authSection').style.display = 'none';
          document.getElementById('noteSection').style.display = 'flex';
          refreshNotes();
      } else {
          window.location.hash = '#/';
      }
  }
  
  auth.onAuthStateChanged(function(user) {
      if (user) {
          currentUser = user;
          logEvent(analytics, 'session_start');
          window.location.hash = '#/notes';
      } else {
          window.location.hash = '#/';
      }
  });
  
  initApp();
  
  // Make necessary functions available globally
  window.viewNote = viewNote;
  window.deleteNote = deleteNote;
  
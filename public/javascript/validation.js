const uname = document.getElementById('name');
const umobile = document.getElementById('mobile');
const uemail = document.getElementById('email');
const upass = document.getElementById('password');
const uconPass = document.getElementById('confirmPassword');
const passwordError = document.getElementById('passwordError');

const signup_btn = document.getElementById('signup_btn');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const mobileError = document.getElementById('mobileError');
const passError = document.getElementById('passError');
const conpassError = document.getElementById('conpassError');

const nameregx = /^[a-zA-Z]{3,15}$/;
const numregx = /^[6-9]\d{9}$/;
const emailregx = /\b^[^ ][a-z.\-_0-9]+@[a-z0-9]+\.[a-z]{2,3}\b/;
const passregx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~`|{}\[\]:";'<>?,.\/\\-])[a-zA-Z0-9!@#$%^&*()_+~`|{}\[\]:";'<>?,.\/\\-]{8,20}$/;

nameError.innerHTML = 'hello';

let name_correct = false;
let email_correct = false;
let mobile_correct = false;
let pass_correct = false(function () {
  signup_btn.setAttribute('disabled', true);
}());

function namevalidate() {
  if (uname.value.match(nameregx)) {
    nameError.innerHTML = '';
    name_correct = true;
  } else {
    nameError.innerHTML = 'Invalid name';
    name_correct = false;
  }
  finalcheck();
}

// email validation
function emailvalidate() {
  if (uemail.value.match(emailregx)) {
    emailError.innerHTML = '';
    email_correct = true;
  } else {
    emailError.innerHTML = 'Invalid email';
    email_correct = false;
  } finalcheck();
}
// }mobile
function mobilevalidate() {
  if (umobile.value.match(numregx)) {
    mobileError.innerHTML = '';
    mobile_correct = true;
  } else {
    mobileError.innerHTML = 'Invalid mobile number';
    mobile_correct = false;
  } finalcheck();
}

// password
function passvalidate() {
  if (upass.value.match(passregx)) {
    passError.innerHTML = '';
    pass_correct = true;
  } else {
    passError.innerHTML = 'Must contain lowecase,uppercase,digits,special character ';
    pass_correct = false;
  } finalcheck();
}
// confornpass
function conpassvalidate() {
  if (uconPass.value.match(upass.value)) {
    conpassError.innerHTML = '';
    pass_correct = true;
  } else {
    conpassError.innerHTML = 'Password not matching ';
    pass_correct = false;
  } finalcheck();
}

function removedisable() {
  signup_btn.removeAttribute('disabled');
}

function finalcheck() {
  if (name_correct && email_correct && mobile_correct && pass_correct) {
    return removedisable();
  }

  function adddisbale() {
    signup_btn.setAttribute('disabled', true);
  }adddisbale();
}

// Ma86107!

/* === login.js — CONFIG/API helper (REAL) === */
const API_BASE = 'http://localhost:3000'; // navegador/PC
// Emulador Android: 'http://10.0.2.2:3000'  |  Celular: 'http://TU.IP.LOCAL:3000'

const ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register'
};

async function apiRequest(path, method='GET', body=null, token=null) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `${token}` } : {}) // sin 'Bearer'
    },
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.msg || data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}



// Sistema de autenticación completo
class AuthManager {
    constructor() {
        this.init();
        this.bindEvents();
        
        // Anunciar página de login con TalkBack
        setTimeout(() => {
            if (window.talkBack) {
                window.talkBack.announceNavigation('Página de inicio de sesión');
            }
        }, 1000);
    }

    init() {
        // Verificar si ya hay una sesión activa
        this.checkExistingSession();
    }

    bindEvents() {
        // Elementos del DOM
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.showRegisterBtn = document.getElementById('showRegister');
        this.showLoginBtn = document.getElementById('showLogin');
        this.forgotPasswordBtn = document.getElementById('forgotPassword');
        this.termsModal = document.getElementById('terms-modal');
        this.showTermsBtn = document.getElementById('showTerms');
        this.closeTermsBtn = document.getElementById('close-terms');
        this.acceptTermsBtn = document.getElementById('accept-terms-btn');

        // Event listeners
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (this.showRegisterBtn) {
            this.showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        if (this.showLoginBtn) {
            this.showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        if (this.forgotPasswordBtn) {
            this.forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        if (this.showTermsBtn) {
            this.showTermsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTermsModal();
            });
        }

        if (this.closeTermsBtn) {
            this.closeTermsBtn.addEventListener('click', () => this.hideTermsModal());
        }

        if (this.acceptTermsBtn) {
            this.acceptTermsBtn.addEventListener('click', () => this.acceptTerms());
        }

        // Validación en tiempo real
        this.setupRealTimeValidation();

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.termsModal) {
                this.hideTermsModal();
            }
        });
    }

    checkExistingSession() {
        const rememberMe = localStorage.getItem('rememberMe');
        const userSession = localStorage.getItem('userSession');
        
        if (rememberMe === 'true' && userSession) {
            try {
                const session = JSON.parse(userSession);
                if (this.isValidSession(session)) {
                    this.redirectToApp();
                    return;
                }
            } catch (error) {
                console.log('Error al verificar sesión:', error);
                localStorage.removeItem('userSession');
                localStorage.removeItem('rememberMe');
            }
        }
    }

    isValidSession(session) {
        const now = new Date().getTime();
        const sessionExpiry = new Date(session.expiry).getTime();
        return now < sessionExpiry;
    }

    setupRealTimeValidation() {
        // Validación del formulario de login
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');

        if (loginEmail) {
            loginEmail.addEventListener('blur', () => this.validateEmail(loginEmail, 'loginEmailError'));
            loginEmail.addEventListener('input', () => this.clearError('loginEmailError'));
        }

        if (loginPassword) {
            loginPassword.addEventListener('blur', () => this.validatePassword(loginPassword, 'loginPasswordError', false));
            loginPassword.addEventListener('input', () => this.clearError('loginPasswordError'));
        }

        // Validación del formulario de registro
        const registerName = document.getElementById('registerName');
        const registerEmail = document.getElementById('registerEmail');
        const registerPhone = document.getElementById('registerPhone');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (registerName) {
            registerName.addEventListener('blur', () => this.validateName(registerName, 'registerNameError'));
            registerName.addEventListener('input', () => this.clearError('registerNameError'));
        }

        if (registerEmail) {
            registerEmail.addEventListener('blur', () => this.validateEmail(registerEmail, 'registerEmailError'));
            registerEmail.addEventListener('input', () => this.clearError('registerEmailError'));
        }

        if (registerPhone) {
            registerPhone.addEventListener('blur', () => this.validatePhone(registerPhone, 'registerPhoneError'));
            registerPhone.addEventListener('input', () => this.clearError('registerPhoneError'));
        }

        if (registerPassword) {
            registerPassword.addEventListener('blur', () => this.validatePassword(registerPassword, 'registerPasswordError', true));
            registerPassword.addEventListener('input', () => this.clearError('registerPasswordError'));
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => this.validatePasswordConfirmation(registerPassword, confirmPassword, 'confirmPasswordError'));
            confirmPassword.addEventListener('input', () => this.clearError('confirmPasswordError'));
        }
    }

    validateEmail(input, errorId) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError(errorId, 'El correo electrónico es requerido');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError(errorId, 'Ingresa un correo electrónico válido');
            return false;
        }
        
        this.clearError(errorId);
        return true;
    }

    validatePassword(input, errorId, isRegister = false) {
        const password = input.value;
        
        if (!password) {
            this.showError(errorId, 'La contraseña es requerida');
            return false;
        }
        
        if (isRegister) {
            if (password.length < 8) {
                this.showError(errorId, 'La contraseña debe tener al menos 8 caracteres');
                return false;
            }
            
            if (!/(?=.*[a-z])/.test(password)) {
                this.showError(errorId, 'La contraseña debe contener al menos una letra minúscula');
                return false;
            }
            
            if (!/(?=.*[A-Z])/.test(password)) {
                this.showError(errorId, 'La contraseña debe contener al menos una letra mayúscula');
                return false;
            }
            
            if (!/(?=.*\d)/.test(password)) {
                this.showError(errorId, 'La contraseña debe contener al menos un número');
                return false;
            }
        }
        
        this.clearError(errorId);
        return true;
    }

    validatePasswordConfirmation(passwordInput, confirmInput, errorId) {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        
        if (!confirm) {
            this.showError(errorId, 'Confirma tu contraseña');
            return false;
        }
        
        if (password !== confirm) {
            this.showError(errorId, 'Las contraseñas no coinciden');
            return false;
        }
        
        this.clearError(errorId);
        return true;
    }

    validateName(input, errorId) {
        const name = input.value.trim();
        
        if (!name) {
            this.showError(errorId, 'El nombre es requerido');
            return false;
        }
        
        if (name.length < 2) {
            this.showError(errorId, 'El nombre debe tener al menos 2 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            this.showError(errorId, 'El nombre solo puede contener letras y espacios');
            return false;
        }
        
        this.clearError(errorId);
        return true;
    }

    validatePhone(input, errorId) {
        const phone = input.value.trim();
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        if (!phone) {
            this.showError(errorId, 'El teléfono es requerido');
            return false;
        }
        
        if (!phoneRegex.test(phone)) {
            this.showError(errorId, 'Ingresa un número de teléfono válido');
            return false;
        }
        
        this.clearError(errorId);
        return true;
    }

    showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // Anunciar error con TalkBack
            if (window.talkBack) {
                window.talkBack.announceError(message);
            }
        }
    }

    clearError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    async handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  // Validar campos
  const emailValid = this.validateEmail(document.getElementById('loginEmail'), 'loginEmailError');
  const passwordValid = this.validatePassword(document.getElementById('loginPassword'), 'loginPasswordError');
  if (!emailValid || !passwordValid) return;

  this.showLoader();

  try {
    // ✅ Llamada REAL a la API (ya no simulado)
    await this.authenticateUser(email, password);

    // Crear sesión local (tu index.js la usa así)
    const sessionData = {
      email,
      loginTime: new Date().toISOString(),
      expiry: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    localStorage.setItem('rememberMe', rememberMe.toString());

    this.showSuccess();
    setTimeout(() => this.redirectToApp(), 2000);

  } catch (error) {
    this.hideLoader();
    // Muestra el mensaje que venga del servidor (msg/message) o el HTTP
    this.showError('loginEmailError', error.message || 'Credenciales incorrectas.');
  }
}


    async handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const acceptTerms = document.getElementById('acceptTerms').checked;

  // Validaciones
  const nameValid = this.validateName(document.getElementById('registerName'), 'registerNameError');
  const emailValid = this.validateEmail(document.getElementById('registerEmail'), 'registerEmailError');
  const phoneValid = this.validatePhone(document.getElementById('registerPhone'), 'registerPhoneError');
  const passwordValid = this.validatePassword(document.getElementById('registerPassword'), 'registerPasswordError', true);
  const confirmValid = this.validatePasswordConfirmation(document.getElementById('registerPassword'), document.getElementById('confirmPassword'), 'confirmPasswordError');

  if (!acceptTerms) { alert('Debes aceptar los términos y condiciones para continuar'); return; }
  if (!nameValid || !emailValid || !phoneValid || !passwordValid || !confirmValid) return;

  this.showLoader();

  try {
    // ✅ Llamada REAL a la API
    await this.createAccount(name, email, phone, password);

    // Crea la misma sesión local que ya esperaba tu index.js
    const rememberMe = document.getElementById('rememberMe')?.checked ?? false;
    const sessionData = {
      email,
      loginTime: new Date().toISOString(),
      expiry: new Date(Date.now() + (rememberMe ? 30*24*60*60*1000 : 24*60*60*1000)).toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    localStorage.setItem('rememberMe', rememberMe.toString());

    this.showSuccess();
    setTimeout(() => this.redirectToApp(), 2000);

  } catch (error) {
    this.hideLoader();
    // Ej: “El usuario ya existe”
    this.showError('registerEmailError', error.message || 'Error al crear la cuenta.');
  }
}

// --- LOGIN real ---
async authenticateUser(email, password) {
  const data = await apiRequest(ENDPOINTS.login, 'POST', { email, password });
  if (data.token) localStorage.setItem('authToken', data.token);
  return { email };
}

// --- REGISTRO real ---
// Tu modelo exige: nombre, apellido, email, password
async createAccount(name, email, phone, password) {
  const partes = name.trim().split(/\s+/);
  const nombre = partes.shift() || name;
  const apellido = partes.join(' ') || '-';

  const payload = { nombre, apellido, email, password, telefono: phone };
  const data = await apiRequest(ENDPOINTS.register, 'POST', payload);
  if (data.token) localStorage.setItem('authToken', data.token);
  return true;
}



    //getStoredUsers() {
        //try {
        //    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      //  } catch {
     //       return [];
        //}
   // }

    //emailExists(email) {
     //   const users = this.getStoredUsers();
       //return users.some(user => user.email === email);
    //}

    handleForgotPassword() {
        const email = prompt('Ingresa tu correo electrónico para recuperar tu contraseña:');
        
        if (email) {
            if (!this.validateEmailString(email)) {
                alert('Por favor ingresa un correo electrónico válido');
                return;
            }
            
            if (!this.emailExists(email)) {
                alert('No se encontró una cuenta con este correo electrónico');
                return;
            }
            
            alert('Se ha enviado un enlace de recuperación a tu correo electrónico (simulado)');
        }
    }

    validateEmailString(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showRegisterForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerForm.classList.add('slide-in');
    }

    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginForm.classList.add('slide-in');
    }

    showTermsModal() {
        this.termsModal.style.display = 'block';
    }

    hideTermsModal() {
        this.termsModal.style.display = 'none';
    }

    acceptTerms() {
        document.getElementById('acceptTerms').checked = true;
        this.hideTermsModal();
    }

    showLoader() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-loader').style.display = 'block';
    }

    hideLoader() {
        document.getElementById('login-loader').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    }

    showSuccess(message = '¡Inicio de sesión exitoso!') {
        document.getElementById('login-loader').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
        
        const successText = document.querySelector('#success-message p');
        if (successText) {
            successText.textContent = 'Redirigiendo a la aplicación...';
        }
        
        // Anunciar éxito con TalkBack
        if (window.talkBack) {
            window.talkBack.announceSuccess(message + '. Redirigiendo a la aplicación');
        }
    }

    redirectToApp() {
        window.location.href = 'index.html';
    }
}

// Inicializar el sistema de autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

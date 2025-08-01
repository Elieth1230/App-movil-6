// Sistema de TalkBack personalizado para accesibilidad
class TalkBackSystem {
    constructor() {
        this.isEnabled = localStorage.getItem('talkback-enabled') === 'true';
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.isAndroid = /Android/i.test(navigator.userAgent);
        this.setupVoices();
        this.setupTalkBackButton();
        this.initializeAccessibility();
    }

    setupVoices() {
        // Configurar voces disponibles
        const voices = this.speechSynthesis.getVoices();
        
        // Buscar voz en español
        this.currentVoice = voices.find(voice => 
            voice.lang.includes('es') || voice.lang.includes('ES')
        ) || voices[0];

        // Si no hay voces cargadas, esperar a que se carguen
        if (voices.length === 0) {
            this.speechSynthesis.onvoiceschanged = () => {
                const newVoices = this.speechSynthesis.getVoices();
                this.currentVoice = newVoices.find(voice => 
                    voice.lang.includes('es') || voice.lang.includes('ES')
                ) || newVoices[0];
            };
        }
    }

    speak(text, priority = 'normal') {
        if (!this.isEnabled || !text) return;

        // Cancelar speech anterior si es alta prioridad
        if (priority === 'high') {
            this.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.rate = 0.9; // Velocidad un poco más lenta para claridad
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Configuración específica para Android
        if (this.isAndroid) {
            utterance.rate = 0.8;
        }

        this.speechSynthesis.speak(utterance);
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('talkback-enabled', this.isEnabled);
        
        const button = document.getElementById('talkback-toggle');
        if (button) {
            button.textContent = this.isEnabled ? '🔊 TalkBack ON' : '🔇 TalkBack OFF';
            button.style.backgroundColor = this.isEnabled ? '#4CAF50' : '#9E9E9E';
        }

        if (this.isEnabled) {
            this.speak('TalkBack activado', 'high');
            this.setupAccessibilityListeners();
        } else {
            this.speak('TalkBack desactivado', 'high');
            this.removeAccessibilityListeners();
        }
    }

    setupTalkBackButton() {
        // Eliminar botón existente si ya existe
        const existingButton = document.getElementById('talkback-toggle');
        if (existingButton) {
            existingButton.remove();
        }

        // Crear botón flotante de TalkBack
        const button = document.createElement('button');
        button.id = 'talkback-toggle';
        button.textContent = this.isEnabled ? '🔊 TalkBack ON' : '🔇 TalkBack OFF';
        button.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 10000 !important;
            padding: 10px 15px !important;
            border: none !important;
            border-radius: 25px !important;
            background-color: ${this.isEnabled ? '#4CAF50' : '#9E9E9E'} !important;
            color: white !important;
            font-weight: bold !important;
            font-size: 12px !important;
            cursor: pointer !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
            transition: all 0.3s ease !important;
            min-width: 100px !important;
            text-align: center !important;
            display: block !important;
        `;

        button.onclick = () => this.toggle();
        
        // Función para añadir el botón cuando el DOM esté listo
        const addButton = () => {
            if (document.body) {
                document.body.appendChild(button);
                console.log('TalkBack button added to page');
            } else {
                setTimeout(addButton, 100);
            }
        };

        // Intentar añadir inmediatamente o esperar al DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addButton);
        } else {
            addButton();
        }
    }

    initializeAccessibility() {
        if (this.isEnabled) {
            setTimeout(() => {
                this.speak('Aplicación cargada. TalkBack está activado.', 'high');
                this.setupAccessibilityListeners();
            }, 1000);
        }
    }

    setupAccessibilityListeners() {
        if (!this.isEnabled) return;

        // Escuchar clics en botones
        document.addEventListener('click', this.handleClick.bind(this), true);
        
        // Escuchar focus en elementos
        document.addEventListener('focus', this.handleFocus.bind(this), true);
        
        // Escuchar cambios en inputs
        document.addEventListener('input', this.handleInput.bind(this), true);
    }

    removeAccessibilityListeners() {
        document.removeEventListener('click', this.handleClick.bind(this), true);
        document.removeEventListener('focus', this.handleFocus.bind(this), true);
        document.removeEventListener('input', this.handleInput.bind(this), true);
    }

    handleClick(event) {
        const element = event.target;
        let textToSpeak = '';

        // Obtener texto descriptivo del elemento
        if (element.textContent && element.textContent.trim()) {
            textToSpeak = element.textContent.trim();
        } else if (element.alt) {
            textToSpeak = element.alt;
        } else if (element.title) {
            textToSpeak = element.title;
        } else if (element.placeholder) {
            textToSpeak = element.placeholder;
        }

        // Descripción específica por tipo de elemento
        if (element.tagName === 'BUTTON') {
            textToSpeak = `Botón: ${textToSpeak}`;
        } else if (element.tagName === 'A') {
            textToSpeak = `Enlace: ${textToSpeak}`;
        } else if (element.tagName === 'INPUT') {
            if (element.type === 'submit') {
                textToSpeak = `Botón enviar: ${textToSpeak || element.value}`;
            } else {
                textToSpeak = `Campo de texto: ${element.placeholder || textToSpeak}`;
            }
        } else if (element.classList.contains('btn-llamar')) {
            textToSpeak = 'Botón para llamar contacto';
        } else if (element.classList.contains('btn-eliminar')) {
            textToSpeak = 'Botón para eliminar contacto';
        }

        if (textToSpeak) {
            this.speak(textToSpeak);
        }
    }

    handleFocus(event) {
        const element = event.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const label = document.querySelector(`label[for="${element.id}"]`);
            const labelText = label ? label.textContent : element.placeholder || 'Campo de entrada';
            this.speak(`Enfocado en: ${labelText}`);
        }
    }

    handleInput(event) {
        const element = event.target;
        if (element.tagName === 'INPUT' && element.type === 'text') {
            // Solo anunciar cada 3 caracteres para no saturar
            if (element.value.length % 3 === 0 && element.value.length > 0) {
                this.speak(`Texto ingresado: ${element.value}`);
            }
        }
    }

    // Función para que otras partes de la app puedan usar TalkBack
    announceNavigation(pageTitle) {
        if (this.isEnabled) {
            this.speak(`Navegando a: ${pageTitle}`, 'high');
        }
    }

    announceAction(action) {
        if (this.isEnabled) {
            this.speak(action);
        }
    }

    announceError(errorMessage) {
        if (this.isEnabled) {
            this.speak(`Error: ${errorMessage}`, 'high');
        }
    }

    announceSuccess(successMessage) {
        if (this.isEnabled) {
            this.speak(`Éxito: ${successMessage}`);
        }
    }
}

// Crear instancia global
window.talkBack = new TalkBackSystem();

// Debug: Verificar que el botón se cree
setTimeout(() => {
    const button = document.getElementById('talkback-toggle');
    if (button) {
        console.log('✅ TalkBack button created successfully');
    } else {
        console.log('❌ TalkBack button NOT found, recreating...');
        if (window.talkBack) {
            window.talkBack.setupTalkBackButton();
        }
    }
}, 2000);

// Función de acceso rápido para otras páginas
function speakText(text, priority = 'normal') {
    if (window.talkBack) {
        window.talkBack.speak(text, priority);
    }
}

function announceNavigation(pageTitle) {
    if (window.talkBack) {
        window.talkBack.announceNavigation(pageTitle);
    }
}

function announceAction(action) {
    if (window.talkBack) {
        window.talkBack.announceAction(action);
    }
}

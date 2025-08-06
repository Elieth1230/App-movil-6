// Sistema de TalkBack personalizado para accesibilidad
class TalkBackSystem {
    constructor() {
        this.isEnabled = localStorage.getItem('talkback-enabled') === 'true';
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.isAndroid = /Android/i.test(navigator.userAgent);
        
        console.log('TalkBack: Initializing on', this.isAndroid ? 'Android' : 'Web');
        console.log('TalkBack: speechSynthesis available:', !!this.speechSynthesis);
        
        // Asegurar que speechSynthesis esté disponible
        if (!this.speechSynthesis) {
            console.error('TalkBack: speechSynthesis not supported');
            return;
        }

        this.setupVoices();
        this.setupTalkBackButton();
        this.initializeAccessibility();

        // Para Android, asegurar que el sistema esté listo
        if (this.isAndroid) {
            // Pequeña pausa para que el WebView se inicialice completamente
            setTimeout(() => {
                console.log('TalkBack: Android initialization complete');
                if (this.isEnabled) {
                    this.speak('Sistema TalkBack iniciado en Android', 'high');
                }
            }, 2000);
        }
    }

    setupVoices() {
        // Función para configurar voces
        const configureVoices = () => {
            const voices = this.speechSynthesis.getVoices();
            console.log('TalkBack: Available voices:', voices.length);
            
            if (voices.length === 0) {
                console.log('TalkBack: No voices found, will retry');
                return false;
            }

            // Buscar voz en español (prioridad a español mexicano para Android)
            this.currentVoice = voices.find(voice => 
                voice.lang.includes('es-MX') || voice.lang.includes('es-ES') || 
                voice.lang.includes('es') || voice.lang.includes('ES')
            ) || voices[0];

            if (this.currentVoice) {
                console.log('TalkBack: Voice selected:', this.currentVoice.name, this.currentVoice.lang);
            } else {
                console.log('TalkBack: Using default voice');
            }

            return true;
        };

        // Intentar configurar inmediatamente
        if (!configureVoices()) {
            // Si no hay voces, esperar a que se carguen
            let retryCount = 0;
            const maxRetries = 5;

            const retryVoiceSetup = () => {
                retryCount++;
                console.log(`TalkBack: Retry voice setup #${retryCount}`);
                
                if (configureVoices() || retryCount >= maxRetries) {
                    return;
                }
                
                setTimeout(retryVoiceSetup, 500);
            };

            // Listener para cuando las voces se cargan
            this.speechSynthesis.onvoiceschanged = () => {
                console.log('TalkBack: Voices changed event');
                configureVoices();
            };

            // Reintentar después de un momento
            setTimeout(retryVoiceSetup, 500);
        }
    }

    speak(text, priority = 'normal') {
        if (!this.isEnabled || !text) return;

        console.log(`TalkBack: Attempting to speak "${text}" on ${this.isAndroid ? 'Android' : 'Web'}`);

        // Para Android, usar método nativo primero
        if (this.isAndroid) {
            this.speakAndroid(text, priority);
            return;
        }

        // Cancelar speech anterior si es alta prioridad
        if (priority === 'high') {
            this.speechSynthesis.cancel();
        }

        // Asegurar que speechSynthesis esté disponible
        if (!this.speechSynthesis) {
            console.log('TalkBack: speechSynthesis not available');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configuración básica
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'es-ES';

        // Intentar asignar voz si está disponible
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }

        // Eventos para debugging
        utterance.onstart = () => {
            console.log('TalkBack: Speech started');
        };

        utterance.onend = () => {
            console.log('TalkBack: Speech ended');
        };

        utterance.onerror = (event) => {
            console.log('TalkBack: Speech error:', event.error);
        };

        // Ejecutar speech
        try {
            this.speechSynthesis.speak(utterance);
            console.log('TalkBack: Speech command sent');
        } catch (error) {
            console.log('TalkBack: Error sending speech command:', error);
        }
    }

    speakAndroid(text, priority = 'normal') {
        console.log('TalkBack: Using Android-specific speech method');
        
        // Método 1: Intentar usar interfaz nativa de Android
        if (window.Android && window.Android.speak) {
            try {
                window.Android.speak(text);
                console.log('TalkBack: Used native Android interface');
                return;
            } catch (error) {
                console.log('TalkBack: Native Android interface failed:', error);
            }
        }

        // Método 2: Usar speechSynthesis con configuración específica para Android 12+
        if (this.speechSynthesis) {
            // Cancelar speech anterior si es alta prioridad
            if (priority === 'high') {
                this.speechSynthesis.cancel();
            }

            // Esperar un momento para asegurar que el WebView esté listo
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Configuración optimizada para Android 12+
                utterance.rate = 0.7;  // Más lento para Android
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                utterance.lang = 'es-ES';
                
                // No usar voz específica en Android para evitar problemas
                utterance.voice = null;

                // Eventos específicos para Android
                utterance.onstart = () => {
                    console.log('TalkBack: Android speech started');
                };

                utterance.onend = () => {
                    console.log('TalkBack: Android speech ended');
                };

                utterance.onerror = (event) => {
                    console.log('TalkBack: Android speech error:', event.error);
                    // Fallback: intentar con configuración mínima
                    this.fallbackAndroidSpeak(text);
                };

                try {
                    this.speechSynthesis.speak(utterance);
                    console.log('TalkBack: Android speech command sent');
                } catch (error) {
                    console.log('TalkBack: Android speech error:', error);
                    this.fallbackAndroidSpeak(text);
                }
            }, 100);
        } else {
            console.log('TalkBack: speechSynthesis not available on Android');
            this.fallbackAndroidSpeak(text);
        }
    }

    fallbackAndroidSpeak(text) {
        console.log('TalkBack: Using fallback method for Android');
        
        // Método de fallback: crear elemento de audio con síntesis básica
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Usar configuración mínima
            if (window.speechSynthesis) {
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.log('TalkBack: All speech methods failed:', error);
            // Último recurso: mostrar el texto en la consola
            console.log('TalkBack FALLBACK:', text);
        }
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

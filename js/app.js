// Global variables and data
let charts = {};
// Contadores para cada tipo de secuencia (hasta 20 por tipo)
let sequenceCounts = {
    lai: 0,
    lad: 0,
    gl: 0,
    gc: 0,
    gld: 0,
    gli: 0
};
// Contador de vueltas de apnea
let customApneaCount = 0;

// Datos de país (no usados actualmente pero referenciados en el código)
const countryData = {
    "Peru": { altitude: 1555, humidity: 73, oxygen: 18.5, fact: "Hogar de Machu Picchu, una de las 7 maravillas del mundo." },
    "Chile": { altitude: 570, humidity: 71, oxygen: 20.5, fact: "País con más de 4,000 km de costa." },
    "España": { altitude: 650, humidity: 57, oxygen: 20.9, fact: "Segundo país con más sitios declarados Patrimonio de la Humanidad." },
    "Australia": { altitude: 330, humidity: 65, oxygen: 20.9, fact: "Hogar de 17 de las 26 especies más venenosas del mundo." },
    "Mexico": { altitude: 1580, humidity: 60, oxygen: 18.5, fact: "Hogar de la pirámide más grande del mundo por volumen (Cholula)." },
    "Colombia": { altitude: 1200, humidity: 80, oxygen: 19.8, fact: "Segundo país más biodiverso del planeta." },
    "EEUU": { altitude: 760, humidity: 55, oxygen: 20.8, fact: "Hogar del 75% de todos los supercomputadores del mundo." },
    "Italia": { altitude: 538, humidity: 61, oxygen: 20.9, fact: "Posee más obras de arte por kilómetro cuadrado que cualquier otro país." },
    "Uruguay": { altitude: 109, humidity: 75, oxygen: 20.9, fact: "Primer país del mundo en legalizar la marihuana a nivel nacional." },
    "Ecuador": { altitude: 2850, humidity: 80, oxygen: 17.2, fact: "Su capital, Quito, fue la primera ciudad declarada Patrimonio Cultural de la Humanidad." },
    "Argentina": { altitude: 595, humidity: 72, oxygen: 20.8, fact: "Hogar del punto más alto del hemisferio occidental (Aconcagua)." },
    "Costa Rica": { altitude: 1100, humidity: 81, oxygen: 19.5, fact: "Único país del mundo sin ejército desde 1949." },
    "Francia": { altitude: 375, humidity: 77, oxygen: 20.9, fact: "País más visitado del mundo con más de 89 millones de turistas al año." }
};

// Función para inicializar las vueltas de apnea
function initializeApneaTurns(count = 4) {
    const mainApneasContainer = document.getElementById('main-apneas');
    if (!mainApneasContainer) return;
    
    // Limpiar contenedor por si acaso
    mainApneasContainer.innerHTML = '';
    
    // Crear las vueltas iniciales
    for (let i = 1; i <= count; i++) {
        const apneaEntry = document.createElement('div');
        apneaEntry.className = 'apnea-entry';
        apneaEntry.id = `apnea-entry-${i}`;
        apneaEntry.innerHTML = `
            <label for="apnea${i}">Vuelta ${i}:</label>
            <input type="number" id="apnea${i}" min="0" step="1" placeholder="150">
            ${i > 1 ? `<button type="button" class="remove-btn" onclick="removeApnea(${i})">&times;</button>` : ''}
        `;
        
        mainApneasContainer.appendChild(apneaEntry);
    }
    
    customApneaCount = count;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Inicializar las vueltas de apnea
    initializeApneaTurns(4);
    
    // Add event listeners for add buttons in each section
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            addCustomSequenceForType(type);
        });
    });
    
    // Add event listener for add apnea button
    document.getElementById('add-apnea').addEventListener('click', addCustomApnea);
    
    // Add event listeners to limit sequence inputs to 20 characters (O and X only)
    document.querySelectorAll('textarea[id$="-sequence"]').forEach(textarea => {
        textarea.addEventListener('input', function() {
            // Filtrar solo O y X (case insensitive) y limitar a 20 caracteres
            let filtered = this.value.toUpperCase().replace(/[^OX]/g, '');
            if (filtered.length > 20) {
                filtered = filtered.substring(0, 20);
            }
            this.value = filtered;
        });
    });
    
    // Add event listeners to automatically format apnea times
    document.querySelectorAll('input[id^="apnea"]').forEach(input => {
        input.addEventListener('input', function() {
            // Si ya tiene formato MM:SS, no hacemos nada
            if (this.value.includes(':')) return;
            
            const value = this.value;
            // Formato directo para cualquier número entero
            if (/^\d+$/.test(value)) {
                const numValue = parseInt(value);
                const minutes = Math.floor(numValue / 60);
                const seconds = numValue % 60;
                this.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        });
        
        // También activar cuando el campo pierde el foco
        input.addEventListener('blur', function() {
            if (!this.value.includes(':') && this.value) {
                // Convertir cualquier número (incluyendo decimales) a formato MM:SS
                const numValue = parseFloat(this.value) || 0;
                const totalSeconds = Math.round(numValue * 60);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                this.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        });
    });
});

// Tab functionality
function openTab(tabName, skipActions = false) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Hide all tabs
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Reset all buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Mark the selected button as active
    const activeButton = Array.from(tabButtons).find(button => button.textContent.includes(tabName === 'data-entry' ? 'Entrada de datos' : 'Informe'));
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // If opening the report tab, generate the report
    if (tabName === 'report' && !skipActions) {
        generateReport();
    }
}

// Add custom sequence for a specific type (LAI, LAD, GL, GC, GLD, GLI)
function addCustomSequenceForType(type) {
    if (sequenceCounts[type] >= 20) {
        alert(`Has alcanzado el límite máximo de 20 secuencias para ${type.toUpperCase()}.`);
        return;
    }
    
    const container = document.getElementById(`${type}-container`);
    const sequenceId = `${type}-custom-${++sequenceCounts[type]}`;
    
    const sequenceDiv = document.createElement('div');
    sequenceDiv.className = 'custom-sequence';
    sequenceDiv.id = `${sequenceId}-div`;
    
    const sequenceLabel = document.createElement('label');
    sequenceLabel.htmlFor = sequenceId;
    sequenceLabel.textContent = `Secuencia ${sequenceCounts[type]} (O=acierto, X=fallo):`;
    
    const sequenceInput = document.createElement('textarea');
    sequenceInput.id = sequenceId;
    sequenceInput.placeholder = 'Ej: OXOOOXXOOX (máx. 20)';
    
    // Agregar limitación de 20 caracteres a las secuencias personalizadas
    sequenceInput.addEventListener('input', function() {
        // Filtrar solo O y X (case insensitive) y limitar a 20 caracteres
        let filtered = this.value.toUpperCase().replace(/[^OX]/g, '');
        if (filtered.length > 20) {
            filtered = filtered.substring(0, 20);
        }
        this.value = filtered;
    });
    
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-btn';
    removeButton.textContent = 'x';
    removeButton.onclick = function() {
        document.getElementById(`${sequenceId}-div`).remove();
        sequenceCounts[type]--;
    };
    
    sequenceDiv.appendChild(sequenceLabel);
    sequenceDiv.appendChild(sequenceInput);
    sequenceDiv.appendChild(removeButton);
    container.appendChild(sequenceDiv);
}

// Remove custom sequence for specific type
function removeSequenceForType(type, number) {
    const container = document.getElementById(`${type}-container`);
    const element = document.getElementById(`${type}-custom-${number}`)?.closest('.custom-sequence');
    
    if (container && element) {
        container.removeChild(element);
        // No reducimos el contador para mantener los números de secuencia consistentes
    }
}

// Add custom apnea input
function addCustomApnea() {
    if (customApneaCount >= 20) {
        alert('Has alcanzado el límite máximo de vueltas de apnea.');
        return;
    }
    
    // Incrementar el contador para la siguiente vuelta
    customApneaCount++;
    const nextApneaNumber = customApneaCount;
    
    // Creamos una nueva entrada de apnea con el estilo actualizado
    const newApnea = document.createElement('div');
    newApnea.className = 'apnea-entry';
    newApnea.id = `apnea-entry-${nextApneaNumber}`;
    newApnea.innerHTML = `
        <label for="apnea${nextApneaNumber}">Vuelta ${nextApneaNumber}:</label>
        <input type="number" id="apnea${nextApneaNumber}" min="0" step="1" placeholder="150">
        <button type="button" class="remove-btn" onclick="removeApnea(${nextApneaNumber})">&times;</button>
    `;
    
    // Añadimos la nueva entrada al contenedor correcto
    const extraApneas = document.getElementById('extra-apneas');
    if (extraApneas) {
        extraApneas.appendChild(newApnea);
    } else {
        // Fallback si no existe el contenedor de extras
        const apneaContainer = document.querySelector('.apnea-times');
        const buttonsContainer = document.querySelector('.apnea-buttons');
        if (apneaContainer && buttonsContainer) {
            apneaContainer.insertBefore(newApnea, buttonsContainer);
        } else {
            console.error('No se pudo encontrar el contenedor para añadir la nueva vuelta de apnea');
        }
    }
}

// Remove custom apnea
function removeApnea(id) {
    // No permitimos eliminar la primera vuelta
    if (id === 1) return;
    
    const element = document.getElementById(`apnea-entry-${id}`);
    if (element) {
        element.remove();
    }
    
    // Reacomodamos el contador solo si se eliminó la vuelta con el número más alto
    if (id === customApneaCount) {
        customApneaCount--;
    }
}

// Clear form
function clearForm() {
    document.getElementById('student-name').value = '';
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('country').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('testimony').value = '';
    document.getElementById('la-sequence').value = '';
    document.getElementById('gl-sequence').value = '';
    document.getElementById('gc-sequence').value = '';
    document.getElementById('gld-sequence').value = '';
    
    // Clear apnea times
    for (let i = 1; i <= customApneaCount; i++) {
        const element = document.getElementById(`apnea${i}`);
        if (element) element.value = '';
    }
    
    // Remove custom sequences and reset counter
    const customSequences = document.querySelectorAll('.custom-sequence');
    customSequences.forEach(seq => seq.remove());
    customSequenceCount = 0;
    
    // Remove custom apneas (beyond the initial 7) and reset counter
    for (let i = 8; i <= customApneaCount; i++) {
        const element = document.getElementById(`apnea${i}`)?.closest('.form-group');
        if (element) element.remove();
    }
    customApneaCount = 7;
}

// Calculate hits and misses from sequence
function calculateStats(sequence) {
    if (!sequence) return { hits: 0, misses: 0, accuracy: 0 };
    
    const hits = (sequence.match(/O/g) || []).length;
    const misses = (sequence.match(/X/g) || []).length;
    const total = hits + misses;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
    
    return { hits, misses, accuracy };
}

// Get all sequence data including custom ones for all types
function getAllSequenceData() {
    // Get standard sequences (ahora con LAI y LAD en lugar de LA)
    const standard = {
        lai: calculateStats(document.getElementById('lai-sequence').value),
        lad: calculateStats(document.getElementById('lad-sequence').value),
        gl: calculateStats(document.getElementById('gl-sequence').value),
        gc: calculateStats(document.getElementById('gc-sequence').value),
        gld: calculateStats(document.getElementById('gld-sequence').value),
        gli: calculateStats(document.getElementById('gli-sequence').value),
    };
    
    // Get custom sequences for each type
    const custom = {};
    
    // Iterar por cada tipo
    Object.keys(sequenceCounts).forEach(type => {
        custom[type] = [];
        
        // Obtener todas las secuencias personalizadas para este tipo
        for (let i = 1; i <= sequenceCounts[type]; i++) {
            const sequenceElement = document.getElementById(`${type}-custom-${i}`);
            
            if (sequenceElement) {
                const stats = calculateStats(sequenceElement.value);
                custom[type].push({ 
                    name: `${type.toUpperCase()} Secuencia ${i}`, 
                    stats, 
                    id: `${type}-custom-${i}` 
                });
            }
        }
    });
    
    return { standard, custom };
}

// Get the sequence with the highest accuracy
function getBestPerformingArea(allData) {
    const { standard, custom } = allData;
    let best = {
        name: 'Ninguna',
        accuracy: 0,
        type: 'none'
    };
    
    // Check standard sequences
    if (standard.lai.accuracy > best.accuracy) {
        best = { name: 'Lateral Izquierdo (LAI)', accuracy: standard.lai.accuracy, type: 'lai' };
    }
    if (standard.lad.accuracy > best.accuracy) {
        best = { name: 'Lateral Derecho (LAD)', accuracy: standard.lad.accuracy, type: 'lad' };
    }
    if (standard.gl.accuracy > best.accuracy) {
        best = { name: 'Garganta Lateral (GL)', accuracy: standard.gl.accuracy, type: 'gl' };
    }
    if (standard.gc.accuracy > best.accuracy) {
        best = { name: 'Garganta Central (GC)', accuracy: standard.gc.accuracy, type: 'gc' };
    }
    if (standard.gld.accuracy > best.accuracy) {
        best = { name: 'Garganta Lateral Derecha (GLD)', accuracy: standard.gld.accuracy, type: 'gld' };
    }
    if (standard.gli.accuracy > best.accuracy) {
        best = { name: 'Garganta Lateral Izquierda (GLI)', accuracy: standard.gli.accuracy, type: 'gli' };
    }
    
    // Check custom sequences for each type
    Object.entries(custom).forEach(([type, sequences]) => {
        sequences.forEach(seq => {
            if (seq.stats && seq.stats.accuracy > best.accuracy) {
                best = { name: seq.name, accuracy: seq.stats.accuracy, type: type, id: seq.id };
            }
        });
    });
    
    return best;
}

// Function to update stats counters in the DOM
function updateStats(type, hits, misses, accuracy) {
    const hitsElement = document.getElementById(`${type}-hits`);
    const missesElement = document.getElementById(`${type}-misses`);
    const accuracyElement = document.getElementById(`${type}-accuracy`);
    
    if (hitsElement) hitsElement.textContent = hits;
    if (missesElement) missesElement.textContent = misses;
    if (accuracyElement) accuracyElement.textContent = accuracy;
}

// Función para obtener el nombre completo del tipo de secuencia
function getTypeName(type) {
    const typeNames = {
        'lai': 'Lateral Izquierdo (LAI)',
        'lad': 'Lateral Derecho (LAD)',
        'gl': 'Garganta Lateral (GL)',
        'gc': 'Garganta Central (GC)',
        'gld': 'Garganta Lateral Derecha (GLD)',
        'gli': 'Garganta Lateral Izquierda (GLI)',
        'none': 'Ninguno'
    };
    return typeNames[type] || type;
}

// Función para obtener el contenedor del mejor área
function getBestAreaContainer(type) {
    const containerSelectors = {
        'lai': '.vis-image-container.lateralIzq',
        'lad': '.vis-image-container.lateralDer',
        'gl': '.vis-image-container.garganta',
        'gc': '.vis-image-container.central',
        'gld': '.vis-image-container.gargarantaDer',
        'gli': '.vis-image-container.gargantaIzq'
    };
    
    const selector = containerSelectors[type];
    return selector ? document.querySelector(selector) : null;
}

// Update the chart with the given data
function updateChart(chartId, hits, misses) {
    const canvas = document.getElementById(chartId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        // Clear existing chart if any
        if (charts[chartId]) {
            charts[chartId].destroy();
        }
        charts[chartId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aciertos', 'Fallos'],
                datasets: [{
                    data: [hits, misses],
                    backgroundColor: ['#4CAF50', '#F44336']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Formatea un tiempo en segundos a formato MM:SS
function formatTimeToMinutesSeconds(timeInSeconds) {
    if (typeof timeInSeconds === 'string' && timeInSeconds.includes(':')) {
        // Si ya está en formato MM:SS, aseguramos que los segundos tengan 2 dígitos
        const [min, sec] = timeInSeconds.split(':');
        const formattedMin = parseInt(min, 10) || 0;
        const formattedSec = (parseInt(sec, 10) || 0).toString().padStart(2, '0');
        return `${formattedMin}:${formattedSec}`;
    }
    
    // Convertimos de segundos a minutos:segundos
    const totalSeconds = Math.round(parseFloat(timeInSeconds));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Evaluate apnea performance (ahora en segundos)
function evaluateApnea(apneaTimes) {
    const validTimes = apneaTimes.filter(time => time > 0);
    
    if (validTimes.length === 0) {
        return 'No hay datos de apnea para evaluar.';
    }
    
    const maxTime = Math.max(...validTimes);
    const avgTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    
    let evaluation = '';
    
    if (maxTime >= 180) {
        evaluation += '🌟 <strong>Resultado Excelente:</strong> Has alcanzado o superado los 3 minutos de apnea. ';
    } else if (maxTime >= 120) {
        evaluation += '✅ <strong>Resultado Óptimo:</strong> Has alcanzado entre 2 y 3 minutos de apnea. ';
    } else if (maxTime >= 60) {
        evaluation += '⚠️ <strong>Resultado Bajo:</strong> Has alcanzado entre 1 y 2 minutos de apnea. ';
    } else {
        evaluation += '❌ <strong>Resultado Insuficiente:</strong> No has alcanzado 1 minuto de apnea. ';
    }
    
    // Formato MM:SS para tiempos
    const maxTimeFormatted = formatTimeToMinutesSeconds(maxTime);
    const avgTimeFormatted = formatTimeToMinutesSeconds(avgTime);
    
    evaluation += `Tu tiempo máximo fue ${maxTimeFormatted} y tu promedio ${avgTimeFormatted}. `;
    
    // Add improvement suggestions
    if (maxTime < 3) {
        evaluation += 'Recomendamos continuar practicando técnicas de respiración y control mental para mejorar tus tiempos.';
    } else {
        evaluation += 'Excelente trabajo. Mantén tu práctica regular para conservar y mejorar estos resultados.';
    }
    
    // Update stats in the UI
    if (document.getElementById('max-apnea')) {
        document.getElementById('max-apnea').textContent = maxTimeFormatted;
    }
    if (document.getElementById('avg-apnea')) {
        document.getElementById('avg-apnea').textContent = avgTimeFormatted;
    }
    if (document.getElementById('total-apneas')) {
        document.getElementById('total-apneas').textContent = validTimes.length;
    }
    
    return evaluation;
}
function generateReport() {
    try {
        // Información básica del estudiante
        const studentName = document.getElementById('student-name').value || 'Estudiante';
        const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        const country = document.getElementById('country').value || 'No especificado';
        
        // Obtener datos de secuencias principales y personalizadas
        // Secuencias principales
        const lai = document.getElementById('lai-sequence')?.value || '';
        const lad = document.getElementById('lad-sequence')?.value || '';
        const gl = document.getElementById('gl-sequence')?.value || '';
        const gc = document.getElementById('gc-sequence')?.value || '';
        const gld = document.getElementById('gld-sequence')?.value || '';
        const gli = document.getElementById('gli-sequence')?.value || '';
        
        // Obtener secuencias personalizadas
        const laiCustom = [];
        const ladCustom = [];
        const glCustom = [];
        const gcCustom = [];
        const gldCustom = [];
        const gliCustom = [];
        
        // Buscar secuencias personalizadas LAI
        for (let i = 1; i <= 20; i++) {
            const seq = document.getElementById(`lai-custom-${i}`);
            if (seq && seq.value) laiCustom.push(seq.value);
        }
        
        // Buscar secuencias personalizadas LAD
        for (let i = 1; i <= 20; i++) {
            const seq = document.getElementById(`lad-custom-${i}`);
            if (seq && seq.value) ladCustom.push(seq.value);
        }
        
        // Buscar secuencias personalizadas GL
        for (let i = 1; i <= 20; i++) {
            const seq = document.getElementById(`gl-custom-${i}`);
            if (seq && seq.value) glCustom.push(seq.value);
        }
        
        // Buscar secuencias personalizadas GC
        for (let i = 1; i <= 20; i++) {
            const seq = document.getElementById(`gc-custom-${i}`);
            if (seq && seq.value) gcCustom.push(seq.value);
        }
        
        // Buscar secuencias personalizadas GLD
        for (let i = 1; i <= 20; i++) {
            const seq = document.getElementById(`gld-custom-${i}`);
            if (seq && seq.value) gldCustom.push(seq.value);
        }
        
        // Buscar secuencias personalizadas GLI
        for (let i = 1; i <= 20; i++) {
            const seq = document.getElementById(`gli-custom-${i}`);
            if (seq && seq.value) gliCustom.push(seq.value);
        }
        
        // Calcular estadísticas para cada secuencia principal
        const laiStats = calculateStats(lai);
        const ladStats = calculateStats(lad);
        const glStats = calculateStats(gl);
        const gcStats = calculateStats(gc);
        const gldStats = calculateStats(gld);
        const gliStats = calculateStats(gli);
        
        // Calcular estadísticas para cada grupo de secuencias personalizadas
        const laiCustomStats = laiCustom.map(seq => calculateStats(seq));
        const ladCustomStats = ladCustom.map(seq => calculateStats(seq));
        const glCustomStats = glCustom.map(seq => calculateStats(seq));
        const gcCustomStats = gcCustom.map(seq => calculateStats(seq));
        const gldCustomStats = gldCustom.map(seq => calculateStats(seq));
        const gliCustomStats = gliCustom.map(seq => calculateStats(seq));
        
        // Obtener tiempos de apnea - procesar los 8 campos fijos
        const apneaTimes = [];
        const apneaTimesFormatted = [];
        // Procesar siempre los 8 campos fijos de apnea
        for (let i = 1; i <= 8; i++) {
            const elem = document.getElementById(`apnea${i}`);
            if (elem && elem.value) {
                let value = elem.value;
                let time = 0;
                let formatted = "0:00";
                
                if (value.includes(':')) {
                    const [min, sec] = value.split(':').map(n => parseInt(n, 10) || 0);
                    time = min * 60 + sec; // Convertir a segundos
                    formatted = `${min}:${sec.toString().padStart(2, '0')}`;
                } else {
                    time = parseInt(value) || 0; // Ya está en segundos
                    // Convertir a formato MM:SS
                    const min = Math.floor(time / 60);
                    const sec = time % 60;
                    formatted = `${min}:${sec.toString().padStart(2, '0')}`;
                }
                
                apneaTimes.push(time);
                apneaTimesFormatted.push(formatted);
            }
        }
        
        // Calcular estadísticas de apnea
        const validTimes = apneaTimes.filter(time => time > 0);
        let maxTime = 0;
        let avgTime = 0;
        
        if (validTimes.length > 0) {
            maxTime = Math.max(...validTimes);
            avgTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
        }
        
        const maxTimeFormatted = formatTimeToMinutesSeconds(maxTime);
        const avgTimeFormatted = formatTimeToMinutesSeconds(avgTime);
        
        // Función para verificar si una secuencia contiene datos válidos (O/X)
        function hasValidSequenceData(sequence) {
            if (!sequence || sequence.trim() === '') return false;
            
            // Verificar si hay al menos un O o X en la secuencia
            return /[OoXx]/.test(sequence);
        }
        
        // Función para crear visualización de secuencia con imagen del personaje
        function generateSequenceVisual(sequence, imagePath = null) {
            if (!hasValidSequenceData(sequence)) return '';
            
            // Contar aciertos y fallos
            let hits = 0;
            let misses = 0;
            let total = 0;
            
            for (let i = 0; i < sequence.length; i++) {
                const char = sequence[i].toUpperCase();
                if (char === 'O') hits++;
                else if (char === 'X') misses++;
            }
            
            total = hits + misses;
            
            // Si no hay datos válidos (ni O ni X), retornar cadena vacía
            if (total === 0) return '';
            
            const hitPercentage = Math.round((hits / total) * 100);
            const missPercentage = 100 - hitPercentage;
            
            // Determinar la clase de estilo basada en el porcentaje
            let resultClass = 'average-result';
            if (hitPercentage >= 70) {
                resultClass = 'good-result';
            } else if (hitPercentage < 40) {
                resultClass = 'poor-result';
            }
            
            // Crear representación visual con cuadrado y porcentaje en el centro
            const imageHTML = imagePath ? `<img src="${imagePath}" class="result-image" alt="">` : '';
            let visual = `
            <div class="sequence-visual-container">
                <div class="result-box ${resultClass}">
                    ${imageHTML}
                    <div class="percentage-display">${hitPercentage}%</div>
                </div>
                <div class="result-stats">
                    <div class="stat-item">
                        <span class="stat-label">Aciertos:</span>
                        <span class="stat-value">${hits} (${hitPercentage}%)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Fallos:</span>
                        <span class="stat-value">${misses} (${missPercentage}%)</span>
                    </div>
                </div>
            </div>`;
            
            return visual;
        }
        
        // Inyectar HTML del informe
        const reportTab = document.getElementById('report');
        if (reportTab) {
            // Solo seleccionar contenedor después de verificar que 'report' existe
            const reportContent = document.getElementById('report-content');
            
            if (reportContent) {
                reportContent.innerHTML = `
                    <div class="report-header">
                        <img src="img/cortex-logo.svg" alt="Academia Cortex Logo" class="report-logo">
                        <div class="report-title">
                            <h2>Informe de Evaluación</h2>
                            <p>Academia Cortex - Programa de Desarrollo Visual</p>
                        </div>
                    </div>
                    
                    <div class="report-student-info">
                        <p><strong>Alumno:</strong> ${studentName}</p>
                        <p><strong>Fecha:</strong> ${date}</p>
                        <p><strong>País:</strong> ${country}</p>
                    </div>
                    
                    <div class="report-section">
                        <h3>Resumen de Resultados</h3>
                        <p>Rendimiento de secuencias visuales para ${studentName}</p>
                    </div>
                    
                    <div class="report-section">
                        <h3>Detalles de Desempeño por Áreas</h3>
                        <div class="performance-details">
                            ${hasValidSequenceData(lai) ? `
                            <div class="performance-item lateral-item">
                                <div class="lateral-header">
                                    <h4>Lateral Izquierdo (LAI)</h4>
                                </div>
                                <div class="sequence-result">
                                    ${generateSequenceVisual(lai, 'img/cortex-person.jpg')}
                                </div>
                                <p>Aciertos: ${laiStats.hits} / Fallos: ${laiStats.misses}</p>
                                <p>Precisión: ${laiStats.accuracy}%</p>
                                ${laiCustom.length > 0 ? `
                                    <div class="custom-sequences">
                                        <h5>Secuencias adicionales</h5>
                                        ${laiCustom.map((seq, i) => hasValidSequenceData(seq) ? `
                                            <div class="custom-sequence-item">
                                                <h6>Secuencia ${i+1}</h6>
                                                <div class="sequence-result">${generateSequenceVisual(seq)}</div>
                                                <p>Aciertos: ${laiCustomStats[i].hits} / Fallos: ${laiCustomStats[i].misses}</p>
                                                <p>Precisión: ${laiCustomStats[i].accuracy}%</p>
                                            </div>
                                        ` : '').join('')}
                                    </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            ${hasValidSequenceData(lad) ? `
                            <div class="performance-item lateral-item">
                                <div class="lateral-header">
                                    <h4>Lateral Derecho (LAD)</h4>
                                </div>
                                <div class="sequence-result">
                                    ${generateSequenceVisual(lad, 'img/cortex-person.jpg')}
                                </div>
                                <p>Aciertos: ${ladStats.hits} / Fallos: ${ladStats.misses}</p>
                                <p>Precisión: ${ladStats.accuracy}%</p>
                                ${ladCustom.length > 0 ? `
                                    <div class="custom-sequences">
                                        <h5>Secuencias adicionales</h5>
                                        ${ladCustom.map((seq, i) => hasValidSequenceData(seq) ? `
                                            <div class="custom-sequence-item">
                                                <h6>Secuencia ${i+1}</h6>
                                                <div class="sequence-result">${generateSequenceVisual(seq)}</div>
                                                <p>Aciertos: ${ladCustomStats[i].hits} / Fallos: ${ladCustomStats[i].misses}</p>
                                                <p>Precisión: ${ladCustomStats[i].accuracy}%</p>
                                            </div>
                                        ` : '').join('')}
                                    </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            ${hasValidSequenceData(gl) ? `
                            <div class="performance-item">
                                <h4>Garganta Lateral (GL)</h4>
                                <div class="sequence-result">
                                    ${generateSequenceVisual(gl)}
                                </div>
                                <p>Aciertos: ${glStats.hits} / Fallos: ${glStats.misses}</p>
                                <p>Precisión: ${glStats.accuracy}%</p>
                                 ${glCustom.length > 0 ? `
                                    <div class="custom-sequences">
                                        <h5>Secuencias adicionales</h5>
                                        ${glCustom.map((seq, i) => hasValidSequenceData(seq) ? `
                                            <div class="custom-sequence-item">
                                                <h6>Secuencia ${i+1}</h6>
                                                <div class="sequence-result">${generateSequenceVisual(seq)}</div>
                                                <p>Aciertos: ${glCustomStats[i].hits} / Fallos: ${glCustomStats[i].misses}</p>
                                                <p>Precisión: ${glCustomStats[i].accuracy}%</p>
                                            </div>
                                        ` : '').join('')}
                                    </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            ${hasValidSequenceData(gc) ? `
                            <div class="performance-item">
                                <h4>Garganta Central (GC)</h4>
                                <div class="sequence-result">
                                    ${generateSequenceVisual(gc)}
                                </div>
                                <p>Aciertos: ${gcStats.hits} / Fallos: ${gcStats.misses}</p>
                                <p>Precisión: ${gcStats.accuracy}%</p>
                                ${gcCustom.length > 0 ? `
                                    <div class="custom-sequences">
                                        <h5>Secuencias adicionales</h5>
                                        ${gcCustom.map((seq, i) => hasValidSequenceData(seq) ? `
                                            <div class="custom-sequence-item">
                                                <h6>Secuencia ${i+1}</h6>
                                                <div class="sequence-result">${generateSequenceVisual(seq)}</div>
                                                <p>Aciertos: ${gcCustomStats[i].hits} / Fallos: ${gcCustomStats[i].misses}</p>
                                                <p>Precisión: ${gcCustomStats[i].accuracy}%</p>
                                            </div>
                                        ` : '').join('')}
                                    </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            ${hasValidSequenceData(gld) ? `
                            <div class="performance-item">
                                <h4>Garganta Lateral Derecha (GLD)</h4>
                                <div class="sequence-result">
                                    ${generateSequenceVisual(gld)}
                                </div>
                                <p>Aciertos: ${gldStats.hits} / Fallos: ${gldStats.misses}</p>
                                <p>Precisión: ${gldStats.accuracy}%</p>
                                ${gldCustom.length > 0 ? `
                                    <div class="custom-sequences">
                                        <h5>Secuencias adicionales</h5>
                                        ${gldCustom.map((seq, i) => hasValidSequenceData(seq) ? `
                                            <div class="custom-sequence-item">
                                                <h6>Secuencia ${i+1}</h6>
                                                <div class="sequence-result">${generateSequenceVisual(seq)}</div>
                                                <p>Aciertos: ${gldCustomStats[i].hits} / Fallos: ${gldCustomStats[i].misses}</p>
                                                <p>Precisión: ${gldCustomStats[i].accuracy}%</p>
                                            </div>
                                        ` : '').join('')}
                                    </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            ${hasValidSequenceData(gli) ? `
                            <div class="performance-item">
                                <h4>Garganta Lateral Izquierda (GLI)</h4>
                                <div class="sequence-result">
                                    ${generateSequenceVisual(gli)}
                                </div>
                                <p>Aciertos: ${gliStats.hits} / Fallos: ${gliStats.misses}</p>
                                <p>Precisión: ${gliStats.accuracy}%</p>
                                ${gliCustom.length > 0 ? `
                                    <div class="custom-sequences">
                                        <h5>Secuencias adicionales</h5>
                                        ${gliCustom.map((seq, i) => hasValidSequenceData(seq) ? `
                                            <div class="custom-sequence-item">
                                                <h6>Secuencia ${i+1}</h6>
                                                <div class="sequence-result">${generateSequenceVisual(seq)}</div>
                                                <p>Aciertos: ${gliCustomStats[i].hits} / Fallos: ${gliCustomStats[i].misses}</p>
                                                <p>Precisión: ${gliCustomStats[i].accuracy}%</p>
                                            </div>
                                        ` : '').join('')}
                                    </div>
                                ` : ''}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="report-section">
                        <h3>Rendimiento de Apnea</h3>
                        <p><strong>Tiempo máximo:</strong> ${maxTimeFormatted}</p>
                        <p><strong>Tiempo promedio:</strong> ${avgTimeFormatted}</p>
                        <p><strong>Cantidad de apneas:</strong> ${validTimes.length}</p>
                        
                        ${apneaTimesFormatted.length > 0 ? `
                            <div class="apnea-details">
                                <h4>Detalle de tiempos:</h4>
                                <div class="apnea-times-list">
                                    ${apneaTimesFormatted.map((time, i) => `
                                        <div class="apnea-time-item">
                                            <span class="apnea-label">Vuelta ${i+1}:</span> 
                                            <span class="apnea-value">${time}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="report-footer">
                        <p>Academia Cortex © ${new Date().getFullYear()} - Todos los derechos reservados</p>
                    </div>
                `;
                
                // Cambiamos el tab manualmente sin llamar a openTab
                // Esto rompe la recursión entre openTab y generateReport
                const tabContents = document.querySelectorAll('.tab-content');
                const tabButtons = document.querySelectorAll('.tab-btn');
                
                // Ocultar todos los tabs
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Resetear todos los botones
                tabButtons.forEach(button => button.classList.remove('active'));
                
                // Mostrar el tab de reporte
                document.getElementById('report').classList.add('active');
                
                // Marcar el botón correspondiente como activo
                const reportButton = Array.from(tabButtons).find(button => button.textContent.includes('Informe'));
                if (reportButton) {
                    reportButton.classList.add('active');
                }
                
                return true;
            } else {
                throw new Error('No se encontró el contenedor del informe');
            }
        } else {
            throw new Error('No se encontró la pestaña de informe');
        }
        
    } catch (error) {
        console.error('Error al generar el informe:', error);
        alert('Ocurrió un error al generar el informe. Por favor, intenta nuevamente.');
        return false;
    }
}

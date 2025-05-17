// Función para guardar el informe como PDF
function saveToPDF() {
    try {
        // Mostrar un indicador de carga o mensaje
        const saveButton = document.getElementById('save-pdf-btn');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Generando PDF...';
        saveButton.disabled = true;
        
        // Obtener el elemento que contiene el informe
        const reportContent = document.getElementById('report-content');
        if (!reportContent) {
            alert('Error: No se pudo encontrar el contenido del informe.');
            saveButton.textContent = originalText;
            saveButton.disabled = false;
            return;
        }
        
        // Hacer una copia del elemento para no modificar el original
        const reportClone = reportContent.cloneNode(true);
        
        // Crear un contenedor temporal para el informe
        const container = document.createElement('div');
        container.appendChild(reportClone);
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);
        
        // Configuración simplificada para evitar problemas
        const pdfOptions = {
            margin: [10, 10, 10, 10],
            filename: `informe_cortex_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
                scale: 1, 
                useCORS: true,
                allowTaint: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Método alternativo de generación de PDF
        const element = container;
        const opt = pdfOptions;
        const worker = html2pdf().from(element).set(opt);
        
        worker.save().then(() => {
            // Restaurar el botón y limpiar
            saveButton.textContent = originalText;
            saveButton.disabled = false;
            document.body.removeChild(container);
        }).catch(error => {
            console.error('Error específico al generar el PDF:', error);
            alert('Hubo un problema al generar el PDF. Intente de nuevo con menos imágenes.');
            saveButton.textContent = originalText;
            saveButton.disabled = false;
            document.body.removeChild(container);
        });
        
    } catch (error) {
        console.error('Error general en saveToPDF:', error);
        alert('Ocurrió un error al preparar el PDF. Por favor, inténtelo más tarde.');
        document.getElementById('save-pdf-btn').textContent = 'Guardar como PDF';
        document.getElementById('save-pdf-btn').disabled = false;
    }
}

// Solución ultra-simple para exportar a PDF (utilizando la función nativa de impresión)
function exportSimplePDF() {
    try {
        // Cambiar estado del botón
        const saveButton = document.getElementById('save-pdf-btn');
        if (saveButton) {
            saveButton.textContent = 'Imprimiendo...';
            saveButton.disabled = true;
        }

        // Simplemente imprimimos la página actual
        window.print();
        
        // Restaurar el botón después de un breve retardo
        setTimeout(() => {
            if (saveButton) {
                saveButton.textContent = 'Guardar como PDF';
                saveButton.disabled = false;
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error al imprimir:', error);
        alert('No se pudo imprimir la página. Intente nuevamente.');
        
        const saveButton = document.getElementById('save-pdf-btn');
        if (saveButton) {
            saveButton.textContent = 'Guardar como PDF';
            saveButton.disabled = false;
        }
    }
}

# Academia Cortex - Sistema de Análisis de Activación Mental

Esta aplicación web permite analizar y visualizar los resultados de prácticas de activación mental para los estudiantes de Academia Cortex.

## Características principales

- Formulario para ingresar datos del estudiante y resultados de las pruebas
- Visualización gráfica de las áreas de percepción con un diagrama facial interactivo
- Gráficos de aciertos y fallos para cada zona de percepción
- Análisis de tiempos de apnea con evaluación personalizada
- Generación de informes en PDF para compartir con los estudiantes
- Datos geográficos relevantes según el país del estudiante

## Cómo usar la aplicación

1. **Ingreso de datos:**
   - Complete la información del estudiante (nombre, fecha, país, notas, testimonio)
   - Ingrese las secuencias de visualización usando O para aciertos y X para fallos
   - Registre los tiempos de apnea para cada vuelta en segundos

2. **Generación del informe:**
   - Haga clic en "Generar informe" para ver los resultados visualizados
   - Revise los gráficos y estadísticas de rendimiento
   - El diagrama facial resaltará automáticamente la zona con mejor desempeño

3. **Exportación:**
   - Haga clic en "Guardar como PDF" para exportar el informe
   - El archivo se nombrará automáticamente con el nombre del estudiante y la fecha

## Interpretación de zonas

- **LA**: Lateral (izquierdo o derecho)
- **GL**: Garganta Lateral (movimiento desde la garganta hacia un lateral)
- **GC**: Garganta Central (desde la garganta hacia la altura de la nariz/frente)
- **GLD**: Garganta Lateral Derecha

## Evaluación de apneas

- **Resultado Insuficiente**: Menos de 1 minuto
- **Resultado Bajo**: Entre 1 y 2 minutos
- **Resultado Óptimo**: Entre 2 y 3 minutos
- **Resultado Excelente**: 3 minutos o más

## Requisitos técnicos

La aplicación funciona en cualquier navegador web moderno y no requiere instalación. Utiliza las siguientes tecnologías:
- HTML5, CSS3
- JavaScript (ES6+)
- Chart.js para las visualizaciones gráficas
- html2pdf.js para la generación de informes PDF

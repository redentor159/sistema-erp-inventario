import React, { useState } from 'react';
import Modal from './Modal';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <i className={`fas fa-chevron-down transform transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
        style={{ transition: 'max-height 0.5s ease-in-out' }}
      >
        <div className="p-4 bg-gray-50 text-gray-700 space-y-4" dangerouslySetInnerHTML={{ __html: children as string }}>
        </div>
      </div>
    </div>
  );
};


const DocumentationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      title: "Parte 1: Introducción y Primeros Pasos",
      content: `
        <h4 class="text-md font-bold text-gray-900 mb-2">1.1 ¿Qué es esta aplicación?</h4>
        <p>Esta es una herramienta digital de gestión de producción, un Tablero Kanban colaborativo en tiempo real. Su propósito es reemplazar las pizarras físicas o las hojas de cálculo complicadas por un sistema visual, intuitivo y siempre actualizado que todos en la empresa pueden ver y usar al mismo tiempo.</p>
        <ul class="list-disc list-inside space-y-1 pl-4 my-2">
            <li><b>Colaborativo:</b> Si un usuario mueve una tarjeta en su computadora, todos los demás usuarios verán ese cambio al instante en sus pantallas (tablets, computadoras, etc.), sin necesidad de recargar la página.</li>
            <li><b>Visual:</b> Permite ver de un vistazo el estado de todas las órdenes de trabajo, identificando cuellos de botella y prioridades.</li>
            <li><b>Centralizado:</b> Toda la información se guarda de forma segura en la nube, accesible desde cualquier lugar con internet.</li>
        </ul>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">1.2 Inicio de Sesión vs. Modo Simulación</h4>
        <p>Al abrir la aplicación, te encontrarás con dos opciones:</p>
        <div class="mt-2 pl-4 border-l-4 border-indigo-500">
            <p class="font-semibold">Iniciar Sesión (Modo Real):</p>
            <p><b>Función:</b> Esta es la versión principal y real de la aplicación. Utiliza tus credenciales (correo y contraseña) para acceder al tablero de producción compartido de la empresa.</p>
            <p><b>Importante:</b> Cualquier cambio que hagas aquí (crear, mover o eliminar una orden) es permanente y será visible para todos tus compañeros de trabajo. Es el entorno de trabajo diario.</p>
        </div>
        <div class="mt-2 pl-4 border-l-4 border-amber-500">
            <p class="font-semibold">Modo Simulación (Modo de Pruebas/Entrenamiento):</p>
            <p><b>Función:</b> Este es un entorno seguro y aislado, perfecto para aprender a usar la aplicación, hacer pruebas o capacitar a nuevo personal.</p>
            <p><b>¿Cómo funciona?</b> Crea un tablero ficticio con datos de ejemplo que se guarda únicamente en tu navegador. No afecta en absoluto a los datos reales de la empresa. Puedes experimentar libremente sin miedo a cometer errores.</p>
            <p><b>Identificación:</b> Siempre sabrás que estás en modo simulación porque el encabezado lo indicará claramente con el texto "Modo Simulación" y una etiqueta "DEMO". Para volver al modo real, simplemente haz clic en "Salir de Simulación".</p>
        </div>
      `
    },
    {
      title: "Parte 2: La Interfaz Principal - El Tablero",
      content: `
        <p>Una vez dentro, verás el tablero principal, que se divide en tres áreas clave.</p>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">2.1 El Encabezado: Acciones Globales</h4>
        <p>En la parte superior, encontrarás el título con el nombre de tu empresa y una barra de herramientas:</p>
        <ul class="list-none space-y-1 pl-4 my-2">
            <li><i class="fas fa-chart-pie text-indigo-600 mr-2"></i> <b>Estadísticas:</b> Abre el Panel de Estadísticas, una poderosa herramienta para analizar el rendimiento de tu producción (se detalla en la Parte 4).</li>
            <li><i class="fas fa-file-excel text-green-600 mr-2"></i> <b>Exportar:</b> Te permite descargar un archivo de Excel con el historial completo de todas las órdenes de trabajo (se detalla en la Parte 4).</li>
            <li><i class="fas fa-cog text-gray-600 mr-2"></i> <b>Configuración:</b> Permite ajustar parámetros del tablero como el nombre de la empresa y los límites de trabajo (se detalla en la Parte 4).</li>
            <li><i class="fas fa-sign-out-alt text-red-600 mr-2"></i> <b>Cerrar Sesión / Salir de Simulación:</b> Te desconecta de forma segura de la aplicación.</li>
        </ul>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">2.2 La Barra de Búsqueda</h4>
        <p>Debajo del encabezado, tienes una barra para buscar órdenes de trabajo específicas. Es muy inteligente y busca en múltiples campos:</p>
        <ul class="list-disc list-inside space-y-1 pl-4 my-2">
            <li><b>Número de Orden:</b> Si escribes 123, buscará la orden ot-2024-0123.</li>
            <li><b>Texto General:</b> Puedes buscar por nombre del cliente, producto, marca, color, cristal o incluso palabras en la descripción adicional.</li>
            <li><b>Ejemplo:</b> Al escribir "G&M", el tablero filtrará y mostrará únicamente las tarjetas que pertenezcan a "Constructora G&M".</li>
        </ul>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">2.3 Las Columnas: El Flujo de Producción</h4>
        <p>El corazón del sistema. Cada columna representa una etapa del proceso de producción. Una orden de trabajo (representada por una "tarjeta") se mueve de izquierda a derecha a medida que avanza.</p>
        <ol class="list-decimal list-inside space-y-1 pl-4 my-2 font-semibold">
            <li>Pedidos Confirmados</li>
            <li>En Corte</li>
            <li>En Ensamblaje</li>
            <li>Listo para Instalar</li>
            <li>Finalizado</li>
        </ol>
        <p class="mt-2 font-semibold">Interpretando los Límites WIP (Work In Progress):</p>
        <p>Fíjate en el número entre paréntesis en los encabezados de las columnas "En Corte" y "En Ensamblaje", por ejemplo: <b>(4/3)</b>.</p>
        <ul class="list-disc list-inside space-y-1 pl-4 my-2">
            <li>El <b>4</b> es el número actual de tarjetas en la columna.</li>
            <li>El <b>3</b> es el límite máximo que has configurado.</li>
            <li>Si el primer número es mayor que el segundo, la columna se pintará de <b>rojo</b>. Esto es una alerta visual crítica que te indica un <b>cuello de botella</b>. Significa que tienes más trabajo en esa etapa del que puedes manejar eficientemente, y deberías investigar la causa para no retrasar toda la producción.</li>
        </ul>
      `
    },
    {
      title: "Parte 3: Gestión de Órdenes de Trabajo (Las Tarjetas)",
      content: `
        <p>Cada tarjeta en el tablero es una orden de trabajo. Contiene toda la información vital.</p>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">3.1 Anatomía de una Tarjeta</h4>
        <div class="space-y-2">
            <p><b>Encabezado:</b> ID de la Orden (ot-AÑO-####): Un identificador único y autoincremental para cada trabajo.</p>
            <p><b>Cuerpo Principal:</b> Cliente, Producto, Medidas y Descripción adicional.</p>
            <p><b>Detalles Secundarios:</b> Marca, Color, Cristal y la Fecha de Creación de la orden.</p>
            <p><b>Pie de la Tarjeta:</b></p>
            <ul class="list-disc list-inside space-y-1 pl-8">
                <li><b>Contador de Retrabajo (<i class="fas fa-exclamation-triangle text-amber-600"></i>):</b> Si aparece, indica cuántas veces esta orden ha retrocedido en el proceso. Es un indicador clave de problemas de calidad o comunicación.</li>
                <li><b>Fecha de Entrega:</b> Su color cambia para indicar urgencia:
                    <ul class="list-inside pl-6" style="list-style-type: circle;">
                        <li>Normal</li>
                        <li><span class="text-amber-600 font-semibold">Naranja (ámbar):</span> ¡Atención! La fecha está muy próxima (3 días o menos).</li>
                        <li><span class="text-red-600 font-semibold">Rojo:</span> ¡Urgente! La fecha de entrega ya ha pasado.</li>
                    </ul>
                </li>
            </ul>
        </div>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">3.2 Acciones sobre una Tarjeta</h4>
        <p>Al pasar el ratón sobre una tarjeta, aparecen tres iconos en la esquina superior derecha:</p>
        <ul class="list-none space-y-2 pl-4 my-2">
            <li><i class="fas fa-copy text-green-500 mr-2"></i> <b>Copiar:</b> Haz clic, verás "¡Tarjeta copiada!". Luego, en la primera columna, el botón "<i class="fas fa-paste"></i> Pegar Tarjeta" estará habilitado para crear una nueva orden con los mismos datos.</li>
            <li><i class="fas fa-edit text-blue-500 mr-2"></i> <b>Editar:</b> Abre una ventana para modificar cualquier dato.</li>
            <li><i class="fas fa-trash-alt text-red-500 mr-2"></i> <b>Eliminar (o Archivar):</b> Pide confirmación. La tarjeta no se borra permanentemente, sino que se guarda en el historial con un estado específico:
                <ul class="list-inside pl-6" style="list-style-type: circle;">
                    <li>Si se elimina desde la columna 'Finalizado', su estado será <b>'Archivado'</b>. Se considera un proyecto completado que se quita de la vista.</li>
                    <li>Si se elimina desde cualquier otra columna, su estado será <b>'Eliminado'</b>. Se considera un proyecto cancelado.</li>
                    <li>Esta distinción es crucial para la precisión de las estadísticas.</li>
                </ul>
            </li>
        </ul>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">3.3 Crear y Mover Órdenes</h4>
        <p><b>Crear:</b> Haz clic en "+ Nueva Orden de Trabajo" en la primera columna.</p>
        <p><b>Mover (Actualizar Estado):</b> La acción más común. Simplemente haz clic, mantenlo presionado y arrástrala a la siguiente columna. El sistema registra automáticamente la fecha de entrada y salida de cada etapa.</p>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">3.4 Ver el Historial de una Tarjeta</h4>
        <p>Al editar una orden de trabajo existente, verás un nuevo botón: <b>"<i class="fas fa-history"></i> Ver Historial"</b>. Al hacer clic, se abrirá una ventana que te mostrará un registro detallado de esa tarjeta específica, incluyendo:</p>
        <ul class="list-disc list-inside space-y-1 pl-4 my-2">
            <li><b>Historial de Movimientos:</b> Un listado de cada etapa por la que ha pasado, con las fechas exactas de entrada y salida.</li>
            <li><b>Historial de Retrabajos:</b> Si la tarjeta ha retrocedido en el flujo, se registrará aquí.</li>
        </ul>
        <p>Esta característica te da visibilidad completa del recorrido de cada orden, permitiéndote auditar su progreso y entender por qué se encuentra en su estado actual.</p>
      `
    },
    {
      title: "Parte 4: Herramientas Avanzadas",
      content: `
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">4.1 Panel de Estadísticas: Mide y Mejora tu Producción</h4>
        <p>Esta es la sección más poderosa para la toma de decisiones. Te permite entender el rendimiento de tu taller con datos reales.</p>
        <ul class="list-disc list-inside space-y-2 pl-4 my-2">
          <li><b>Filtros de Tiempo:</b> Analiza datos por 7 días, 30 días, el año actual o todo el historial, con comparaciones automáticas.</li>
          <li><b>Indicadores Clave (KPIs):</b> Mide tus <b>Proyectos Finalizados</b>, tu <b>Tiempo Promedio de Entrega (Lead Time)</b> y tu <b>Tasa de Retrabajo</b>. Esta última mide el porcentaje de trabajos que necesitaron ser corregidos, siendo un indicador directo de la calidad del proceso. El objetivo es reducir el tiempo de entrega y la tasa de retrabajo.</li>
          <li><b>Análisis de Puntos de Falla (Retrabajos):</b> Este módulo te muestra exactamente <i>entre qué etapas</i> ocurren los retrabajos con más frecuencia (ej: "De Ensamblaje a Corte"). Es una herramienta de diagnóstico para identificar dónde se originan los errores y poder corregirlos.</li>
          <li><b>Gráfico de Dispersión:</b> Herramienta de predicción. Cada punto es un proyecto. La línea <b>p85</b> es clave: "Podemos prometerle a un cliente con un 85% de certeza que su trabajo estará listo en Y días o menos". Úsala para dar fechas de entrega realistas.</li>
          <li><b>Análisis de Tiempo de Ciclo por Etapa:</b> Un gráfico de barras que muestra el promedio de días que una tarjeta pasa en cada columna. La barra más larga te muestra exactamente dónde está tu mayor cuello de botella.</li>
          <li><b>Distribución de Tiempos de Entrega:</b> Un histograma que muestra la consistencia de tu proceso.</li>
          <li><b>Top 5 Listas:</b> Muestran los productos más fabricados y los clientes con más órdenes.</li>
        </ul>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">4.2 Exportar a Excel</h4>
        <p>Descarga un archivo Excel con dos hojas:</p>
        <ul class="list-disc list-inside space-y-1 pl-4 my-2">
          <li><b>"Todos los Proyectos":</b> Un registro detallado de CADA orden, incluyendo su estado final (Activo, Finalizado, Eliminado, Archivado), historial de retrabajos, etc.</li>
          <li><b>"Proyectos Finalizados":</b> Una vista limpia solo con los trabajos completados, perfecta para informes.</li>
        </ul>
        <h4 class="text-md font-bold text-gray-900 mt-4 mb-2">4.3 Configuración</h4>
        <ul class="list-disc list-inside space-y-1 pl-4 my-2">
          <li><b>Nombre de la Empresa:</b> Cambia el nombre en el encabezado.</li>
          <li><b>Límites WIP:</b> Ajusta los umbrales que activan la alerta de cuello de botella.</li>
          <li><b>Restablecer Tablero (¡CON MUCHO CUIDADO!):</b>
            <ul class="list-inside pl-6" style="list-style-type: circle;">
              <li><b>Borrar Solo Tarjetas:</b> Archiva las tarjetas activas pero conserva el historial y la configuración.</li>
              <li><b>Empezar de 0:</b> ACCIÓN IRREVERSIBLE. Borra absolutamente todo.</li>
            </ul>
          </li>
        </ul>
      `
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Documentación</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
      </div>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <AccordionItem
            key={index}
            title={section.title}
            isOpen={openSection === index}
            onClick={() => toggleSection(index)}
          >
            {section.content}
          </AccordionItem>
        ))}
      </div>
    </Modal>
  );
};

export default DocumentationModal;
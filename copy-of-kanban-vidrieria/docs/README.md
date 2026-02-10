# Kanban de Producción para Vidriería

## Descripción General

Esta es una aplicación de tablero Kanban interactiva, dinámica y **colaborativa en tiempo real**, diseñada específicamente para gestionar el flujo de producción en un taller de vidrios y aluminios. El objetivo es ofrecer una herramienta visual e intuitiva donde múltiples usuarios pueden trabajar simultáneamente, viendo los cambios de los demás al instante.

La aplicación utiliza **Google Firebase** como backend, lo que significa que todos los datos se almacenan de forma segura en la nube y se sincronizan en tiempo real entre todos los dispositivos conectados.

## Características Principales

- **Tablero Kanban Colaborativo:** Múltiples usuarios pueden ver y modificar el tablero al mismo tiempo. Los cambios se reflejan instantáneamente para todos.
- **Flujo de Trabajo Visual:** Dividido en 5 etapas claras: Pedidos Confirmados, En Corte, En Ensamblaje, Listo para Instalar y Finalizado.
- **Persistencia en la Nube:** Todos los datos se guardan en Firebase Firestore. Accede a tu tablero desde cualquier dispositivo con una conexión a internet.
- **Gestión Completa de Órdenes:** Crea, visualiza, actualiza y elimina órdenes de trabajo con campos detallados.
- **Funcionalidad Drag & Drop:** Mueve tarjetas entre columnas de forma fluida para actualizar su estado.
- **Límites de WIP:** Configura límites de "Trabajo en Progreso" para identificar y prevenir cuellos de botella.
- **Copia y Pega de Tarjetas:** Duplica órdenes de trabajo existentes para acelerar la entrada de datos.
- **Historial y Exportación:** Mantiene un registro completo de todos los proyectos y permite la exportación a Excel, con opción de filtrar por fechas.
- **Alta Personalización:** Ajusta el nombre de la empresa y los límites de WIP según tus necesidades.

## Pila Tecnológica (Tech Stack)

- **Framework Frontend:** [React](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/) para una interfaz de usuario robusta y escalable.
- **Backend y Base de Datos:** [Google Firebase](https://firebase.google.com/) (Authentication y Firestore Realtime Database).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) para un diseño rápido y moderno basado en utilidades.
- **Iconos:** [Font Awesome](https://fontawesome.com/).
- **Exportación a Excel:** [SheetJS (xlsx)](https://sheetjs.com/).

## Cómo Empezar

Para desplegar y utilizar la aplicación, consulta nuestra [**Guía de Despliegue**](./SETUP_AND_DEPLOYMENT.md).

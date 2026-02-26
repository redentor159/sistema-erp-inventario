"use client";

import {
  CheckCircle,
  Shield,
  Archive,
  Activity,
  GitCommit,
  GitPullRequest,
  ArrowLeft,
  Download,
  AlertTriangle,
  MonitorPlay,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MantenimientoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Guía de Mantenimiento Asistido
          </h1>
          <p className="text-xl text-gray-500 font-medium">DevOps Enterprise</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 px-3 py-1"
            >
              <AlertTriangle className="w-3 h-3 mr-1 inline" /> Regla de Oro
            </Badge>
            <span className="text-sm text-gray-600 max-w-lg">
              Diseñado para garantizar <strong>Cero Interrupciones</strong> en
              Producción con el menor esfuerzo humano posible. La computadora
              trabaja, tú solo apruebas.
            </span>
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
            </Link>
            <a
              href="/docs/15_GUIA_MANTENIMIENTO_DevOps.md"
              download
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Download className="mr-2 h-4 w-4" /> Descargar Original (MD)
            </a>
          </div>
        </div>

        {/* Secciones */}
        <div className="space-y-8">
          {/* Sección 1 */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-white px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-blue-500" />
                1. La Arquitectura de Mantenimiento ("Lo que el sistema hace
                solo")
              </h2>
            </div>
            <CardContent className="p-0">
              <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600 border-b border-gray-100">
                Tu repositorio de GitHub ha sido transformado en un Centro de
                Operaciones DevOps. Mientras no estés mirando, ocurren las
                siguientes automatizaciones:
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  {
                    icon: Archive,
                    title: "Backup Diario",
                    desc: "Extrae un volcado completo de tu BD (.sql) y lo guarda.",
                    freq: "Cada 24h (2 AM)",
                  },
                  {
                    icon: Activity,
                    title: "Keep-Alive",
                    desc: "Evita que Supabase pause tu base de datos por inactividad.",
                    freq: "Cada 4 días",
                  },
                  {
                    icon: GitCommit,
                    title: "Sincronizador Tipos",
                    desc: "Lee la BD y actualiza TypeScript si detecta nuevas columnas.",
                    freq: "Domingos (4 AM)",
                  },
                  {
                    icon: GitPullRequest,
                    title: "Dependabot",
                    desc: "Revisa si hay nuevas versiones o parches de seguridad de librerías. Agrupa todo (Next.js, React) en un solo paquete.",
                    freq: "Lunes (9 AM)",
                  },
                  {
                    icon: Shield,
                    title: "Guardián de Integridad (CI)",
                    desc: "Cada vez que se intenta subir código, ejecuta: Linter, Verificación TypeScript, Pruebas Unitarias, Pruebas E2E y Compilación Estática.",
                    freq: "Al recibir un PR",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row p-6 gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <div className="sm:self-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.freq}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sección 2 */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-white px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                2. Tu Rutina Mensual de 5 Minutos (El Triaje)
              </h2>
            </div>
            <CardContent className="p-6 text-sm text-gray-600 space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                <p className="text-yellow-800 font-medium">
                  Cuando recibas un correo de GitHub avisando de un{" "}
                  <strong>Pull Request de Dependabot</strong>, NUNCA le des al
                  botón verde de "Merge" directamente en la web.
                </p>
                <p className="text-yellow-700 mt-2">
                  Sigue esta receta exacta e implacable:
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Paso 1: Bajar los cambios a tu PC
                  </h4>
                  <p className="mb-2">
                    Abre Windsurf/VSCode en tu terminal y bájate la rama creada
                    por el bot:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                    <code>
                      git fetch origin{`\n`}git checkout
                      dependabot/npm_and_yarn/next-react-ecosystem
                    </code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Paso 2: Limpieza Quirúrgica
                  </h4>
                  <p className="mb-2">
                    Borra las dependencias viejas e instala las nuevas:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                    <code>
                      # En Windows (PowerShell){`\n`}Remove-Item -Recurse -Force
                      node_modules{`\n`}Remove-Item package-lock.json{`\n\n`}#
                      Instalar{`\n`}npm install
                    </code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Paso 3: La Prueba Corta Local (Sanity Check)
                  </h4>
                  <p className="mb-2">
                    No confíes ciegamente en los bots. Abre la app en vivo:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md mb-2 overflow-x-auto">
                    <code>npm run dev</code>
                  </pre>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Entra a <code>http://localhost:3000</code>.
                    </li>
                    <li>
                      Ve al Módulo de Cotizaciones. Abre una. ¿Se ve bien el
                      total?
                    </li>
                    <li>Ve al Kanban. Mueve una tarjeta. ¿Funcionó?</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Paso 4: Aprobar el Pase a Producción
                  </h4>
                  <p className="mb-2">
                    Si todo funcionó en el Paso 3, aprueba y sube a{" "}
                    <code>main</code>:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                    <code>
                      git checkout main{`\n`}git merge
                      dependabot/npm_and_yarn/next-react-ecosystem{`\n`}git push
                      origin main
                    </code>
                  </pre>
                  <p className="mt-3 text-green-600 font-medium">
                    ¡Vercel detectará el cambio en main, compilará la nueva
                    versión limpia y la distribuirá mundialmente! Mantenimiento
                    terminado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección 3 y 4 en dos columnas si hay espacio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sección 3 */}
            <Card className="border-0 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-white px-6 py-5 border-b border-gray-100 flex-grow-0">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <MonitorPlay className="w-5 h-5 mr-3 text-purple-500" />
                  3. Entornos de Staging
                </h2>
                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                  Configuración obligatoria
                </p>
              </div>
              <CardContent className="p-6 text-sm text-gray-600 flex-grow space-y-4">
                <p>
                  Para habilitar un despliegue seguro antes de producción, debes
                  activar Vercel Previews. Esto hará que Vercel genere una URL
                  temporal de prueba cada vez que haya un Pull Request.
                </p>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">
                    En Vercel (Solo una vez):
                  </h4>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>
                      Entra al dashboard de Vercel y selecciona tu proyecto.
                    </li>
                    <li>
                      Ve a <strong>Settings &gt; Git</strong>.
                    </li>
                    <li>
                      Asegúrate de que la integración con GitHub esté conectada.
                    </li>
                    <li>
                      En <strong>Deployments &gt; Preview Deployments</strong>,
                      actívalo para <em>Pull Requests</em>.
                    </li>
                    <li className="text-purple-700 font-medium">
                      Ve a <strong>Settings &gt; Environment Variables</strong>{" "}
                      y asegúrate de que NEXT_PUBLIC_SUPABASE_URL y ANON_KEY
                      estén marcadas tanto para <em>Production</em> como para{" "}
                      <em>Preview</em>.
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Sección 4 */}
            <Card className="border-0 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-white px-6 py-5 border-b border-gray-100 flex-grow-0">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Lock className="w-5 h-5 mr-3 text-red-500" />
                  4. Bloqueo de Código
                </h2>
                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                  Configuración en github
                </p>
              </div>
              <CardContent className="p-6 text-sm text-gray-600 flex-grow space-y-4">
                <p>
                  Para que el Guardián de Integridad realmente proteja el
                  servidor, debes prohibir legalmente que alguien salte las
                  pruebas.
                </p>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">
                    En GitHub (Solo una vez):
                  </h4>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>
                      Entra a tu repositorio &gt;{" "}
                      <strong>Settings &gt; Branches</strong>.
                    </li>
                    <li>
                      Haz clic en <strong>"Add branch protection rule"</strong>.
                    </li>
                    <li>
                      En <em>Branch name pattern</em> ingresa <code>main</code>.
                    </li>
                    <li>
                      Marca{" "}
                      <strong>"Require a pull request before merging"</strong>.
                    </li>
                    <li>
                      Marca{" "}
                      <strong>
                        "Require status checks to pass before merging"
                      </strong>
                      . Busca "build-and-test" y selecciónalo.
                    </li>
                    <li>Guarda los cambios.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección 5 */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-white px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3 text-orange-500" />
                5. Prevención de Riesgos Extremos del "Mantenimiento Cero"
              </h2>
            </div>
            <CardContent className="p-0 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Si ocurriera esto...
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Solución Oficial Inmediata
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      El ERP muestra pantalla en blanco aleatoriamente.
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Posible problema de navegador estricto bloqueando CORS. Ve
                      a Supabase, sube al plan Pro ($25) y activa{" "}
                      <strong>Custom Domains</strong> (api.tu-erp.com).
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      No deja registrar ni leer nada en la BD. La terminal dice
                      "401" o "Deprecated".
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Supabase v3 mató a la v2. Espera al Pull Request salvador
                      de Dependabot de la semana y ejecuta la "Rutina de 5
                      minutos" del Paso 2.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Sale un cartel rojo de "Vercel Build Failed".
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Alguien introdujo un error en el código y el Guardián
                      abortó el despliegue. Lee los logs de GitHub Actions (npm
                      run lint o vitest falló). Corrige el código localmente.
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="text-center pt-8 pb-4">
            <p className="text-xs text-gray-400">
              Corporación de Vidrio y Aluminio Yahiro SRL &mdash; Última
              actualización: Febrero 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

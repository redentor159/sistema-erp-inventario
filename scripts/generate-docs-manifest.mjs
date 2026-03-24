/**
 * Script: generate-docs-manifest.mjs
 * 
 * Scans /public/docs recursively and generates a manifest.json
 * that the HelpPanel uses to dynamically list all available docs.
 * 
 * Run: node scripts/generate-docs-manifest.mjs
 * Automatically runs via: npm run build (pre-build hook)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DOCS = path.resolve(__dirname, '..', 'public', 'docs');
const OUTPUT = path.join(PUBLIC_DOCS, 'manifest.json');

// Mapping of filename patterns to categories and display info
function classifyDoc(relativePath) {
  const fileName = path.basename(relativePath, '.md');
  const isInTutorials = relativePath.startsWith('tutoriales/');
  const isInManualEntrenamiento = relativePath.startsWith('manual_entrenamiento/');

  // Tutorials: T01, T02, ... T99
  if (isInTutorials && /^T\d{2}_/.test(fileName)) {
    const num = fileName.match(/^T(\d{2})/)[1];
    const title = fileName
      .replace(/^T\d{2}_TUTORIAL_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: `T${num}`,
      title: `T${num} ${title}`,
      category: 'tutorial',
      sort: parseInt(num, 10),
    };
  }

  // Numbered technical docs: 00_, 01_, ... 99_
  if (!isInTutorials && !isInManualEntrenamiento && /^\d{2}_/.test(fileName)) {
    const num = fileName.match(/^(\d{2})/)[1];
    const title = fileName
      .replace(/^\d{2}_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: fileName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: `${num} ${title}`,
      category: 'tecnico',
      sort: parseInt(num, 10),
    };
  }

  // Manual de entrenamiento
  if (isInManualEntrenamiento) {
    const title = fileName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: `man-${fileName}`,
      title: title,
      category: 'entrenamiento',
      sort: 0,
    };
  }

  // Other docs (ops, guides, etc.)
  const title = fileName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return {
    id: fileName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    title: title,
    category: 'ops',
    sort: 0,
  };
}

function scanDocs(dir, base = '') {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      items.push(...scanDocs(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.md')) {
      const classification = classifyDoc(rel);
      items.push({
        ...classification,
        path: `/docs/${rel}`,
      });
    }
  }

  return items;
}

// Generate
const docs = scanDocs(PUBLIC_DOCS);

// Sort within categories
const categoryOrder = ['tutorial', 'tecnico', 'ops', 'entrenamiento'];
docs.sort((a, b) => {
  const catA = categoryOrder.indexOf(a.category);
  const catB = categoryOrder.indexOf(b.category);
  if (catA !== catB) return catA - catB;
  return a.sort - b.sort;
});

// Build structured manifest with headers
const manifest = [];
let lastCategory = null;
const categoryHeaders = {
  tutorial: '📚 Tutoriales para Usuarios',
  tecnico: '🔧 Documentación Técnica',
  ops: '⚙️ Operaciones y Soporte',
  entrenamiento: '📖 Manual de Entrenamiento',
};

for (const doc of docs) {
  if (doc.category !== lastCategory) {
    // Special: put "00 Índice Maestro" before tutorials
    if (doc.title.startsWith('00 ') && doc.category === 'tecnico') {
      manifest.push({ id: 'h-idx', isHeader: true, title: '📋 Índice y Referencia Rápida' });
      manifest.push({ id: doc.id, title: doc.title, path: doc.path, category: 'indice' });
      lastCategory = doc.category; // skip the tecnico header for 00
      continue;
    }
    manifest.push({ id: `h-${doc.category}`, isHeader: true, title: categoryHeaders[doc.category] || doc.category });
    lastCategory = doc.category;
  }
  // Skip 00 if already added
  if (doc.title.startsWith('00 ') && doc.category === 'tecnico') continue;
  manifest.push({ id: doc.id, title: doc.title, path: doc.path, category: doc.category });
}

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`✅ Manifest generated: ${manifest.length} entries (${docs.length} docs) → ${OUTPUT}`);

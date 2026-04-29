#!/usr/bin/env node

/**
 * Bundle Size Monitor
 * Analiza el tamaño del bundle y reporta métricas importantes
 */

const fs = require('fs');
const path = require('path');

const DIST_PATH = path.join(__dirname, '../dist/uniformes-app');
const BUNDLE_LIMITS = {
  initial: 2 * 1024 * 1024, // 2MB
  lazy: 1 * 1024 * 1024,    // 1MB per lazy chunk
  styles: 10 * 1024,        // 10KB per component style
  total: 10 * 1024 * 1024   // 10MB total
};

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundleSize() {
  if (!fs.existsSync(DIST_PATH)) {
    console.error('❌ Dist folder not found. Run `npm run build:prod` first.');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_PATH);
  let totalSize = 0;
  let initialChunks = [];
  let lazyChunks = [];
  let styleFiles = [];

  console.log('📊 Bundle Size Analysis');
  console.log('='.repeat(50));

  files.forEach(file => {
    const filePath = path.join(DIST_PATH, file);
    const size = getFileSize(filePath);
    totalSize += size;

    if (file.includes('.js')) {
      if (file.includes('main-') || file.includes('polyfills-') || file.includes('runtime-')) {
        initialChunks.push({ name: file, size });
      } else if (file.includes('chunk-')) {
        lazyChunks.push({ name: file, size });
      }
    } else if (file.includes('.css')) {
      styleFiles.push({ name: file, size });
    }
  });

  // Análisis de chunks iniciales
  console.log('\n🚀 Initial Chunks:');
  let initialTotal = 0;
  initialChunks.forEach(chunk => {
    initialTotal += chunk.size;
    const status = chunk.size > BUNDLE_LIMITS.initial ? '⚠️' : '✅';
    console.log(`${status} ${chunk.name}: ${formatSize(chunk.size)}`);
  });

  const initialStatus = initialTotal > BUNDLE_LIMITS.initial ? '⚠️' : '✅';
  console.log(`${initialStatus} Initial Total: ${formatSize(initialTotal)} (limit: ${formatSize(BUNDLE_LIMITS.initial)})`);

  // Análisis de chunks lazy
  console.log('\n📦 Lazy Chunks:');
  lazyChunks.forEach(chunk => {
    const status = chunk.size > BUNDLE_LIMITS.lazy ? '⚠️' : '✅';
    console.log(`${status} ${chunk.name}: ${formatSize(chunk.size)}`);
  });

  // Análisis de estilos
  console.log('\n🎨 Style Files:');
  styleFiles.forEach(style => {
    const status = style.size > BUNDLE_LIMITS.styles ? '⚠️' : '✅';
    console.log(`${status} ${style.name}: ${formatSize(style.size)}`);
  });

  // Resumen total
  console.log('\n📈 Summary:');
  console.log(`Total Bundle Size: ${formatSize(totalSize)}`);
  console.log(`Files Count: ${files.length}`);

  const totalStatus = totalSize > BUNDLE_LIMITS.total ? '⚠️' : '✅';
  console.log(`${totalStatus} Within Limits: ${totalStatus === '✅' ? 'YES' : 'NO'}`);

  // Recomendaciones
  if (initialTotal > BUNDLE_LIMITS.initial) {
    console.log('\n💡 Recommendations:');
    console.log('- Enable tree shaking for unused imports');
    console.log('- Use lazy loading for feature modules');
    console.log('- Consider code splitting for large dependencies');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Analysis Complete');
}

analyzeBundleSize();

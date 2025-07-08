// Legacy compatibility wrapper - redirects to TypeScript implementation
import('./dist/index.js')
  .then(() => {
    console.log('✅ TypeScript server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start TypeScript server:', error);
    console.log('🔄 Ensure you have built the TypeScript server: npm run build');
    process.exit(1);
  });

#!/usr/bin/env node
import { rm } from 'fs/promises';
import { globSync } from 'glob';

const dirsToClean = [
  'coverage',
  'coverage-*',
  '.nyc_output',
  'jest-coverage',
  'playwright-report',
  'test-results',
  '.svelte-kit',
  'build',
  '.turbo',
  'logs',
  '*.log',
  'temp',
  'tmp',
  '.DS_Store',
  'Thumbs.db'
];

async function clean(patterns = dirsToClean) {
  console.log('🧹 Cleaning project directories...');

  for (const pattern of patterns) {
    try {
      // Globパターンでマッチするファイル/ディレクトリを検索
      const matches = globSync(pattern, {
        dot: true,
        ignore: ['node_modules/**', '.git/**']
      });

      for (const match of matches) {
        try {
          await rm(match, { recursive: true, force: true });
          console.log(`✓ Cleaned: ${match}`);
        } catch (error) {
          // ファイルが存在しない場合や権限エラーは無視
          if (error.code !== 'ENOENT' && error.code !== 'EACCES') {
            console.error(`✗ Error cleaning ${match}:`, error.message);
          }
        }
      }

      // パターンが直接マッチしない場合も試行
      if (matches.length === 0) {
        try {
          await rm(pattern, { recursive: true, force: true });
          console.log(`✓ Cleaned: ${pattern}`);
        } catch (error) {
          // ファイルが存在しない場合は無視
          if (error.code !== 'ENOENT') {
            console.debug(`No matches for pattern: ${pattern}`);
          }
        }
      }
    } catch (error) {
      console.error(`✗ Error processing pattern ${pattern}:`, error.message);
    }
  }

  console.log('✨ Cleanup complete!');
}

// コマンドライン引数を処理
const args = process.argv.slice(2);
const patternsToClean = args.length > 0 ? args : dirsToClean;

clean(patternsToClean).catch(console.error);

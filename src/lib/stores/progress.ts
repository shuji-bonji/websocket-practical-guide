// Browser detection without SvelteKit dependency
const browser = typeof window !== 'undefined';

export interface LessonProgress {
  id: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent?: number; // minutes
}

export interface PhaseProgress {
  phase: number;
  name: string;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: string;
  lessons: LessonProgress[];
}

export interface OverallProgress {
  totalPhases: number;
  completedPhases: number;
  totalHours: number;
  completedHours: number;
  phases: PhaseProgress[];
}

// デフォルトの学習進捗データ
const defaultProgress: OverallProgress = {
  totalPhases: 4,
  completedPhases: 0,
  totalHours: 60,
  completedHours: 0,
  phases: [
    {
      phase: 1,
      name: '基礎理解',
      totalLessons: 15,
      completedLessons: 0,
      estimatedHours: '18.5-21.5',
      lessons: [
        // 1. WebSocket入門 (4レッスン)
        { id: 'phase1-introduction-what-is-websocket', completed: false },
        { id: 'phase1-introduction-http-limitations', completed: false },
        { id: 'phase1-introduction-use-cases', completed: false },
        { id: 'phase1-introduction-comparison', completed: false },

        // 2. ネットワーク技術 (5レッスン)
        { id: 'phase1-network-tech-http-basics', completed: false },
        { id: 'phase1-network-tech-osi-model', completed: false },
        { id: 'phase1-network-tech-http-versions', completed: false },
        { id: 'phase1-network-tech-tcp-websocket', completed: false },
        { id: 'phase1-network-tech-security-ports', completed: false },

        // 3. API基本構造 (3レッスン)
        { id: 'phase1-api-structure-lifecycle', completed: false },
        { id: 'phase1-api-structure-event-model', completed: false },
        { id: 'phase1-api-structure-roles', completed: false },

        // 4. 基本操作 (4レッスン)
        { id: 'phase1-basic-operations-url-connection', completed: false },
        { id: 'phase1-basic-operations-api-implementation', completed: false },
        { id: 'phase1-basic-operations-reconnection', completed: false }
      ]
    },
    {
      phase: 2,
      name: '実装技術',
      totalLessons: 12,
      completedLessons: 0,
      estimatedHours: '17-20',
      lessons: [
        // 5. データ通信 (3レッスン)
        { id: 'phase2-data-communication-svelte-stores', completed: false },
        { id: 'phase2-data-communication-send-receive', completed: false },
        { id: 'phase2-data-communication-error-handling', completed: false },

        // 6. フレーム・プロトコル (6レッスン)
        { id: 'phase2-frames-protocols-frame-structure', completed: false },
        { id: 'phase2-frames-protocols-binary-data', completed: false },
        { id: 'phase2-frames-protocols-subprotocols', completed: false },
        { id: 'phase2-frames-protocols-graphql-ws', completed: false },
        { id: 'phase2-frames-protocols-mqtt', completed: false },
        { id: 'phase2-frames-protocols-custom', completed: false },

        // 7. 高度なトピック (3レッスン)
        { id: 'phase2-advanced-topics-security', completed: false },
        { id: 'phase2-advanced-topics-pwa-integration', completed: false },
        { id: 'phase2-advanced-topics-scalability', completed: false }
      ]
    },
    {
      phase: 3,
      name: 'テスト・評価',
      totalLessons: 5,
      completedLessons: 0,
      estimatedHours: '8-10',
      lessons: [
        // 8. テスト手法 (3レッスン)
        { id: 'phase3-testing-client-testing', completed: false },
        { id: 'phase3-testing-server-testing', completed: false },
        { id: 'phase3-testing-e2e-testing', completed: false },

        // 9. 技術比較 (2レッスン)
        { id: 'phase3-comparison-alternatives', completed: false },
        { id: 'phase3-comparison-selection-criteria', completed: false }
      ]
    },
    {
      phase: 4,
      name: '実践開発',
      totalLessons: 3,
      completedLessons: 0,
      estimatedHours: '15-20',
      lessons: [
        // 10. 実践プロジェクト (2レッスン)
        { id: 'phase4-projects-chat-app', completed: false },
        { id: 'phase4-projects-collaborative-editor', completed: false },

        // Socket.IO (オプション, 1レッスン)
        { id: 'phase4-socket-io-overview', completed: false }
      ]
    }
  ]
};

// ローカルストレージから進捗を読み込む
function loadProgress(): OverallProgress {
  if (!browser) return defaultProgress;

  try {
    const saved = localStorage.getItem('websocket-learning-progress');
    if (saved) {
      const parsed = JSON.parse(saved);

      // 新しいlessonIdが存在するかチェック
      const hasNewLessonIds = parsed.phases[0]?.lessons?.some((lesson: LessonProgress) =>
        lesson.id.startsWith('phase1-')
      );

      // 古いデータの場合は新しいデフォルトを使用
      if (!hasNewLessonIds) {
        console.log('Old progress data detected, using new default structure');
        localStorage.removeItem('websocket-learning-progress');
        return defaultProgress;
      }

      // 日付の復元
      parsed.phases.forEach((phase: PhaseProgress) => {
        phase.lessons.forEach((lesson: LessonProgress) => {
          if (lesson.completedAt) {
            lesson.completedAt = new Date(lesson.completedAt);
          }
        });
      });
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to load progress from localStorage:', error);
  }

  return defaultProgress;
}

// 進捗を保存
function saveProgress(progress: OverallProgress) {
  if (!browser) return;

  try {
    localStorage.setItem('websocket-learning-progress', JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }
}

// 進捗の再計算
function recalculateProgress(progress: OverallProgress): OverallProgress {
  let totalCompletedLessons = 0;
  let completedPhases = 0;

  progress.phases.forEach((phase) => {
    phase.completedLessons = phase.lessons.filter((lesson) => lesson.completed).length;
    totalCompletedLessons += phase.completedLessons;

    if (phase.completedLessons === phase.totalLessons) {
      completedPhases++;
    }
  });

  progress.completedPhases = completedPhases;

  // 完了時間の概算計算（総学習時間の比例配分）
  const totalLessons = progress.phases.reduce((sum, phase) => sum + phase.totalLessons, 0);
  progress.completedHours = Math.round(
    (totalCompletedLessons / totalLessons) * progress.totalHours
  );

  return progress;
}

import { writable, type Writable } from 'svelte/store';

// Svelteストア
export const progressStore: Writable<OverallProgress> = writable(loadProgress());

// 進捗状態の取得関数（必要に応じて使用）
export function getProgress(): OverallProgress {
  let currentProgress: OverallProgress = loadProgress();
  const unsubscribe = progressStore.subscribe((value) => {
    currentProgress = value;
  });
  unsubscribe(); // メモリリークを防ぐ
  return currentProgress;
}

// 古いIDから新しいIDへのマッピング（互換性のため）
const legacyIdMapping: Record<string, string> = {
  // Phase 1 - Introduction
  '1.1': 'phase1-introduction-what-is-websocket',
  '1.2': 'phase1-introduction-http-limitations',
  '1.3': 'phase1-introduction-use-cases',
  '1.4': 'phase1-introduction-comparison',
  // Phase 1 - Network Tech
  '2.1': 'phase1-network-tech-http-basics',
  '2.2': 'phase1-network-tech-osi-model',
  '2.3': 'phase1-network-tech-http-versions',
  '2.4': 'phase1-network-tech-tcp-websocket',
  '2.5': 'phase1-network-tech-security-ports',
  // Phase 1 - API Structure
  '3.1': 'phase1-api-structure-lifecycle',
  '3.2': 'phase1-api-structure-event-model',
  '3.3': 'phase1-api-structure-roles',
  // Phase 1 - Basic Operations
  '4.1': 'phase1-basic-operations-url-connection',
  '4.2': 'phase1-basic-operations-api-implementation',
  '4.3': 'phase1-basic-operations-reconnection',
  // Phase 2 - Data Communication
  '5.1': 'phase2-data-communication-svelte-stores',
  '5.2': 'phase2-data-communication-send-receive',
  '5.3': 'phase2-data-communication-error-handling',
  // Phase 2 - Frames & Protocols
  '6.1': 'phase2-frames-protocols-frame-structure',
  '6.2': 'phase2-frames-protocols-binary-data',
  '6.3': 'phase2-frames-protocols-subprotocols',
  // Phase 2 - Advanced Topics
  '7.1': 'phase2-advanced-topics-security',
  '7.2': 'phase2-advanced-topics-pwa-integration',
  '7.3': 'phase2-advanced-topics-scalability',
  // Phase 3 - Testing
  '8.1': 'phase3-testing-client-testing',
  '8.2': 'phase3-testing-server-testing',
  '8.3': 'phase3-testing-e2e-testing',
  // Phase 3 - Comparison
  '9.1': 'phase3-comparison-alternatives',
  '9.2': 'phase3-comparison-selection-criteria',
  // Phase 4 - Projects
  '10.1': 'phase4-projects-chat-app',
  '10.2': 'phase4-projects-collaborative-editor'
};

// 進捗更新関数
export const progressActions = {
  // レッスン完了
  completeLesson: (lessonId: string) => {
    progressStore.update((progress) => {
      const updated = { ...progress };

      // 古いIDの場合は新しいIDにマッピング
      const targetId = legacyIdMapping[lessonId] || lessonId;

      let lessonFound = false;
      for (const phase of updated.phases) {
        const lesson = phase.lessons.find((l: LessonProgress) => l.id === targetId);
        if (lesson && !lesson.completed) {
          lesson.completed = true;
          lesson.completedAt = new Date();
          lessonFound = true;
          break;
        }
      }

      // レッスンが見つからない場合、適切なPhaseに動的に追加
      if (!lessonFound) {
        let phaseIndex = 0;
        if (targetId.startsWith('phase2-')) phaseIndex = 1;
        else if (targetId.startsWith('phase3-')) phaseIndex = 2;
        else if (targetId.startsWith('phase4-')) phaseIndex = 3;

        if (phaseIndex < updated.phases.length) {
          updated.phases[phaseIndex].lessons.push({
            id: targetId,
            completed: true,
            completedAt: new Date()
          });
          updated.phases[phaseIndex].totalLessons = updated.phases[phaseIndex].lessons.length;
        }
      }

      const recalculated = recalculateProgress(updated);
      saveProgress(recalculated);
      return JSON.parse(JSON.stringify(recalculated));
    });
  },

  // レッスン未完了に戻す
  uncompleteLesson: (lessonId: string) => {
    progressStore.update((progress) => {
      const updated = { ...progress };

      // 古いIDの場合は新しいIDにマッピング
      const targetId = legacyIdMapping[lessonId] || lessonId;

      for (const phase of updated.phases) {
        const lesson = phase.lessons.find((l: LessonProgress) => l.id === targetId);
        if (lesson && lesson.completed) {
          lesson.completed = false;
          lesson.completedAt = undefined;
          lesson.timeSpent = undefined;
          break;
        }
      }

      const recalculated = recalculateProgress(updated);
      saveProgress(recalculated);
      return JSON.parse(JSON.stringify(recalculated));
    });
  },

  // 学習時間の記録
  recordTime: (lessonId: string, minutes: number) => {
    progressStore.update((progress) => {
      const updated = { ...progress };

      // 古いIDの場合は新しいIDにマッピング
      const targetId = legacyIdMapping[lessonId] || lessonId;

      for (const phase of updated.phases) {
        const lesson = phase.lessons.find((l: LessonProgress) => l.id === targetId);
        if (lesson) {
          lesson.timeSpent = (lesson.timeSpent || 0) + minutes;
          break;
        }
      }

      saveProgress(updated);
      return updated;
    });
  },

  // 進捗リセット
  resetProgress: () => {
    progressStore.set(defaultProgress);
    saveProgress(defaultProgress);
  },

  // デバッグ用：現在の進捗状態をログ出力
  debugProgress: () => {
    if (browser) {
      const current = loadProgress();
      console.log('Current progress state:', current);
      console.log('Phase 1 lessons:', current.phases[0].lessons);
      return current;
    }
  }
};

// 開発・デバッグ用：グローバルにprogressActionsを公開
if (browser && typeof window !== 'undefined') {
  (window as unknown as { debugProgress: () => void; resetProgress: () => void }).debugProgress =
    progressActions.debugProgress;
  (window as unknown as { debugProgress: () => void; resetProgress: () => void }).resetProgress =
    progressActions.resetProgress;
}

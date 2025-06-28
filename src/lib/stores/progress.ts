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
				{ id: 'phase1-introduction-what-is-websocket', completed: false },
				{ id: 'phase1-introduction-http-limitations', completed: false },
				{ id: 'phase1-use-cases', completed: false },
				{ id: 'phase1-introduction-comparison', completed: false },
				{ id: '2.1', completed: false },
				{ id: '2.2', completed: false },
				{ id: '2.3', completed: false },
				{ id: '2.4', completed: false },
				{ id: '2.5', completed: false },
				{ id: '3.1', completed: false },
				{ id: '3.2', completed: false },
				{ id: '3.3', completed: false },
				{ id: '4.1', completed: false },
				{ id: '4.2', completed: false },
				{ id: '4.3', completed: false }
			]
		},
		{
			phase: 2,
			name: '実装技術',
			totalLessons: 9,
			completedLessons: 0,
			estimatedHours: '17-20',
			lessons: [
				{ id: '5.1', completed: false },
				{ id: '5.2', completed: false },
				{ id: '5.3', completed: false },
				{ id: '6.1', completed: false },
				{ id: '6.2', completed: false },
				{ id: '6.3', completed: false },
				{ id: '7.1', completed: false },
				{ id: '7.2', completed: false },
				{ id: '7.3', completed: false }
			]
		},
		{
			phase: 3,
			name: 'テスト・評価',
			totalLessons: 5,
			completedLessons: 0,
			estimatedHours: '8-10',
			lessons: [
				{ id: '8.1', completed: false },
				{ id: '8.2', completed: false },
				{ id: '8.3', completed: false },
				{ id: '9.1', completed: false },
				{ id: '9.2', completed: false }
			]
		},
		{
			phase: 4,
			name: '実践開発',
			totalLessons: 2,
			completedLessons: 0,
			estimatedHours: '15-20',
			lessons: [
				{ id: '10.1', completed: false },
				{ id: '10.2', completed: false }
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
	'1.1': 'phase1-introduction-what-is-websocket',
	'1.2': 'phase1-introduction-http-limitations', 
	'1.3': 'phase1-use-cases',
	'1.4': 'phase1-introduction-comparison'
};

// 進捗更新関数
export const progressActions = {
	// レッスン完了
	completeLesson: (lessonId: string) => {
		console.log('progressActions.completeLesson called with:', lessonId);
		progressStore.update((progress) => {
			console.log('Current progress before update:', progress);
			const updated = { ...progress };

			// 古いIDの場合は新しいIDにマッピング
			const targetId = legacyIdMapping[lessonId] || lessonId;
			console.log('Target lesson ID after mapping:', targetId);

			let lessonFound = false;
			for (const phase of updated.phases) {
				const lesson = phase.lessons.find((l: LessonProgress) => l.id === targetId);
				console.log(`Checking phase ${phase.phase}, found lesson:`, lesson);
				if (lesson && !lesson.completed) {
					lesson.completed = true;
					lesson.completedAt = new Date();
					lessonFound = true;
					console.log('Lesson marked as completed:', lesson);
					break;
				}
			}

			if (!lessonFound) {
				console.error('Lesson not found in progress store:', targetId);
				console.log('Available lesson IDs:', updated.phases.flatMap(p => p.lessons.map(l => l.id)));
				
				// レッスンが見つからない場合、Phase1に動的に追加
				if (targetId.startsWith('phase1-')) {
					console.log('Adding missing lesson to Phase 1:', targetId);
					updated.phases[0].lessons.push({
						id: targetId,
						completed: true,
						completedAt: new Date()
					});
					updated.phases[0].totalLessons = updated.phases[0].lessons.length;
					lessonFound = true;
				}
			}

			const recalculated = recalculateProgress(updated);
			saveProgress(recalculated);
			console.log('Progress after recalculation:', recalculated);
			// 確実にリアクティブ更新をトリガーするため、新しいオブジェクトを返す
			return JSON.parse(JSON.stringify(recalculated));
		});
	},

	// レッスン未完了に戻す
	uncompleteLesson: (lessonId: string) => {
		console.log('progressActions.uncompleteLesson called with:', lessonId);
		progressStore.update((progress) => {
			const updated = { ...progress };

			// 古いIDの場合は新しいIDにマッピング
			const targetId = legacyIdMapping[lessonId] || lessonId;

			let lessonFound = false;
			for (const phase of updated.phases) {
				const lesson = phase.lessons.find((l: LessonProgress) => l.id === targetId);
				if (lesson && lesson.completed) {
					lesson.completed = false;
					lesson.completedAt = undefined;
					lesson.timeSpent = undefined;
					lessonFound = true;
					console.log('Lesson marked as uncompleted:', lesson);
					break;
				}
			}

			if (!lessonFound) {
				console.error('Lesson not found for uncomplete action:', targetId);
			}

			const recalculated = recalculateProgress(updated);
			saveProgress(recalculated);
			// 確実にリアクティブ更新をトリガーするため、新しいオブジェクトを返す
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
	(window as unknown as { debugProgress: () => void; resetProgress: () => void }).debugProgress = progressActions.debugProgress;
	(window as unknown as { debugProgress: () => void; resetProgress: () => void }).resetProgress = progressActions.resetProgress;
};

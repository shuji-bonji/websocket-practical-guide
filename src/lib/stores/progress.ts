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
			totalLessons: 14,
			completedLessons: 0,
			estimatedHours: '18.5-21.5',
			lessons: [
				{ id: '1.1', completed: false },
				{ id: '1.2', completed: false },
				{ id: '1.3', completed: false },
				{ id: '1.4', completed: false },
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

// 進捗更新関数
export const progressActions = {
	// レッスン完了
	completeLesson: (lessonId: string) => {
		progressStore.update((progress) => {
			const updated = { ...progress };

			for (const phase of updated.phases) {
				const lesson = phase.lessons.find((l: LessonProgress) => l.id === lessonId);
				if (lesson && !lesson.completed) {
					lesson.completed = true;
					lesson.completedAt = new Date();
					break;
				}
			}

			const recalculated = recalculateProgress(updated);
			saveProgress(recalculated);
			// 確実にリアクティブ更新をトリガーするため、新しいオブジェクトを返す
			return JSON.parse(JSON.stringify(recalculated));
		});
	},

	// レッスン未完了に戻す
	uncompleteLesson: (lessonId: string) => {
		progressStore.update((progress) => {
			const updated = { ...progress };

			for (const phase of updated.phases) {
				const lesson = phase.lessons.find((l: LessonProgress) => l.id === lessonId);
				if (lesson && lesson.completed) {
					lesson.completed = false;
					lesson.completedAt = undefined;
					lesson.timeSpent = undefined;
					break;
				}
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

			for (const phase of updated.phases) {
				const lesson = phase.lessons.find((l: LessonProgress) => l.id === lessonId);
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
	}
};

import Habit, { HABIT_CATEGORIES } from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import AiInsight from '../models/AiInsight.js';
import { chatCompletion, parseAIJSON } from '../utils/aiService.js';
import {
  WEEKLY_PROMPT,
  SUGGESTION_PROMPT,
  RECOVERY_PROMPT,
  CHAT_PROMPT,
  MORNING_PROMPT,
} from '../utils/aiService.js';
import { todayKey, calcStreak, lastNDays } from '../utils/dateHelpers.js';

const normalizeCategory = (value) => {
  if (!value) return 'Other';
  const normalized = String(value).trim().toLowerCase();
  const match = HABIT_CATEGORIES.find(
    (category) => category.toLowerCase() === normalized
  );
  return match || 'Other';
};

const dayOfWeekFromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

// ==========================================
// HELPER: Build Weekly Context Data
// ==========================================
const buildWeeklyContext = async (userId) => {
  const habits = await Habit.find({ userId, isArchived: false });
  const last7Days = lastNDays(7);
  
  const logs = await HabitLog.find({
    userId,
    completedDate: { $gte: last7Days[0] },
  });

  const habitData = habits.map((habit) => {
    const completedDays = logs
      .filter((l) => l.habitId.toString() === habit._id.toString())
      .map((l) => l.completedDate);

    return {
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      targetDays: habit.targetDays,
      completedDays: completedDays,
    };
  });

  return { habits: habitData, weekDates: last7Days };
};

// ==========================================
// AI ENDPOINTS
// ==========================================

export const weeklyReport = async (req, res) => {
  try {
    const context = await buildWeeklyContext(req.user._id);

    if (context.habits.length === 0) {
      return res.json({ content: "Add some habits and complete them this week to get your personalized report!" });
    }

    // Build a readable string for the AI
    const userMessage = `My weekly habit data: ${JSON.stringify(context.habits)}`;

    const content = await chatCompletion(WEEKLY_PROMPT, userMessage);

    // Save to database
    await AiInsight.create({
      userId: req.user._id,
      type: 'weekly',
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const suggestHabits = async (req, res) => {
  try {
    const { goals, productiveTime, struggles } = req.body;

    if (!goals?.trim() || !productiveTime?.trim() || !struggles?.trim()) {
      return res.status(400).json({
        message: "Goals, productive time, and struggles are required",
      });
    }

    const userMessage = `Goals: ${goals}. Productive time: ${productiveTime}. Past struggles: ${struggles}.`;

    const rawResponse = await chatCompletion(SUGGESTION_PROMPT, userMessage);

    // Attempt to parse JSON, fallback to defaults if AI messes up
    let suggestions;
    try {
      suggestions = parseAIJSON(rawResponse);
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('AI returned invalid suggestions');
      }
    } catch (error) {
      suggestions = [
        { name: "10 Minute Walk", description: "Take a short walk to clear your mind", frequency: "daily", category: "Health", icon: "🚶", reason: "A gentle start to building momentum based on your goals." },
        { name: "Read 5 Pages", description: "Read just 5 pages of a book", frequency: "daily", category: "Learning", icon: "📖", reason: "Small steps overcome the struggle of getting started." },
        { name: "Gratitude Journal", description: "Write down one thing you are grateful for", frequency: "daily", category: "Mindfulness", icon: "✨", reason: "Helps shift focus to positives during productive times." }
      ];
    }

    const normalizedSuggestions = suggestions.slice(0, 3).map((s) => ({
      name: String(s?.name || "New habit").trim(),
      description: String(s?.description || "").trim(),
      frequency: s?.frequency === "weekly" ? "weekly" : "daily",
      category: normalizeCategory(s?.category),
      icon: typeof s?.icon === "string" && s.icon.trim() ? s.icon : "🎯",
      reason: String(s?.reason || "").trim(),
    }));

    await AiInsight.create({
      userId: req.user._id,
      type: 'suggestion',
      content: normalizedSuggestions,
      meta: { goals, productiveTime, struggles },
    });

    res.json({ suggestions: normalizedSuggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const streakRecovery = async (req, res) => {
  try {
    const { habitId } = req.body;
    if (!habitId) {
      return res.status(400).json({ message: 'habitId is required' });
    }

    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const logs = await HabitLog.find({ habitId, userId: req.user._id })
      .sort({ completedDate: -1 });
    const dates = logs.map((l) => l.completedDate);
    const { current, longest } = calcStreak(dates);

    const userMessage = `I broke my streak for "${habit.name}" (Category: ${habit.category}). My current streak is ${current} days, and my longest was ${longest} days. Help me recover.`;

    const content = await chatCompletion(RECOVERY_PROMPT, userMessage);

    await AiInsight.create({
      userId: req.user._id,
      type: 'recovery',
      content,
      meta: { habitId },
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const chatAnalysis = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Fetch rich 30-day context
    const habits = await Habit.find({ userId: req.user._id, isArchived: false });
    if (habits.length === 0) {
      return res.json({ content: "Add a habit first so I have data to analyze." });
    }
    const last30 = lastNDays(30);
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: last30[0] },
    });

    // Build a by-day-of-week breakdown for the AI
    const habitContext = habits.map((habit) => {
      const habitLogs = logs.filter((l) => l.habitId.toString() === habit._id.toString());
      
      const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
      habitLogs.forEach((log) => {
        const dayIndex = dayOfWeekFromKey(log.completedDate);
        dayOfWeekCounts[dayIndex]++;
      });

      return {
        name: habit.name,
        category: habit.category,
        totalCompletions30Days: habitLogs.length,
        completionsByDayOfWeek: dayOfWeekCounts,
      };
    });

    const userMessage = `My 30-day habit data: ${JSON.stringify(habitContext)}. My question: ${question}`;

    const content = await chatCompletion(CHAT_PROMPT, userMessage);

    await AiInsight.create({
      userId: req.user._id,
      type: 'chat',
      content,
      meta: { question },
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const morningMotivation = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isArchived: false });
    
    if (habits.length === 0) {
      return res.json({ content: "Good morning! Start your day by adding a new habit to track." });
    }

    const today = todayKey();
    const todayLogs = await HabitLog.find({ userId: req.user._id, completedDate: today });
    const completedTodayCount = todayLogs.length;

    const habitIds = habits.map((h) => h._id);
    const allLogs = await HabitLog.find({
      userId: req.user._id,
      habitId: { $in: habitIds },
    }).sort({ completedDate: -1 });

    const logsByHabit = {};
    for (const log of allLogs) {
      const key = String(log.habitId);
      if (!logsByHabit[key]) logsByHabit[key] = [];
      logsByHabit[key].push(log.completedDate);
    }

    const habitStreaks = [];
    for (const habit of habits) {
      const dates = logsByHabit[String(habit._id)] || [];
      const { current } = calcStreak(dates);
      if (current > 0) habitStreaks.push(`${habit.name} (${current} days)`);
    }

    const userMessage = `My habits: ${habits.map(h => h.name).join(', ')}. Active streaks: ${habitStreaks.length > 0 ? habitStreaks.join(', ') : 'none currently'}. I have completed ${completedTodayCount} out of ${habits.length} habits today.`;

    // Note: Higher temperature (0.8) for more creative/varied morning messages
    const content = await chatCompletion(MORNING_PROMPT, userMessage, 0.8);

    await AiInsight.create({
      userId: req.user._id,
      type: 'morning',
      content,
    });

    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
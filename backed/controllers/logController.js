import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";
import { toDateKey, todayKey, calcStreak, last90Days, lastNDays } from "../utils/dateHelpers.js";
import { differenceInCalendarDays } from "date-fns";

// ==========================================
// HABIT COMPLETION ACTIONS
// ==========================================

export const markComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();

    // Security: Verify the habit exists AND belongs to the logged-in user
    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Upsert logic: If a log exists for this habit/day, return it. If not, create it.
    // $setOnInsert only applies these fields if the document is being CREATED, not updated.
    const log = await HabitLog.findOneAndUpdate(
      { userId: req.user._id, habitId, completedDate },
      { $setOnInsert: { userId: req.user._id, habitId, completedDate } },
      { upsert: true, new: true }
    );

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unmarkComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();

    await HabitLog.findOneAndDelete({
      userId: req.user._id,
      habitId,
      completedDate,
    });

    res.json({ message: "Log removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// LOG FETCHING (TODAY & RANGES)
// ==========================================

export const getToday = async (req, res) => {
  try {
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: todayKey(),
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    // Because completedDate is stored as 'YYYY-MM-DD' string, 
    // we can safely use string comparison for range queries!
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: start, $lte: end },
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// ANALYTICS & STATS
// ==========================================

export const getHeatmap = async (req, res) => {
  try {
    const days = last90Days();
    
    // Initialize the map with 0 completions for all 90 days
    const map = {};
    days.forEach(d => map[d] = 0);

    // Fetch all logs in the last 90 days
    const startDate = days[0];
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: startDate },
    });

    // Count completions per day
    logs.forEach(log => {
      if (map[log.completedDate] !== undefined) {
        map[log.completedDate]++;
      }
    });

    // Format into array of objects for the frontend Recharts/Heatmap component
    const result = days.map(date => ({ date, count: map[date] }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Fetch all logs for this specific habit, sorted newest first
    const logs = await HabitLog.find({ habitId: habit._id, userId: req.user._id })
      .sort({ completedDate: -1 });

    const dates = logs.map(l => l.completedDate);
    const { current, longest } = calcStreak(dates);

    // Calculate overall completion rate since creation
    const daysSinceCreation = differenceInCalendarDays(new Date(), habit.createdAt) + 1;
    const completionRate = Math.round((dates.length / daysSinceCreation) * 100);

    // Group completions by month (e.g., "2023-10")
    const byMonth = {};
    logs.forEach(log => {
      const month = log.completedDate.substring(0, 7); // grabs "YYYY-MM"
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    res.json({
      habit,
      currentStreak: current,
      longestStreak: longest,
      completionRate,
      totalCompletions: dates.length,
      byMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllStats = async (req, res) => {
  try {
    // Get all active habits for the user
    const habits = await Habit.find({ userId: req.user._id, isArchived: false });
    const last30 = lastNDays(30);

    if (habits.length === 0) {
      return res.json({ perHabit: [] });
    }

    const habitIds = habits.map((h) => h._id);
    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: { $in: habitIds },
      completedDate: { $gte: last30[0] },
    }).sort({ completedDate: -1 });

    const logsByHabit = {};
    for (const log of logs) {
      const key = String(log.habitId);
      if (!logsByHabit[key]) logsByHabit[key] = [];
      logsByHabit[key].push(log.completedDate);
    }

    const perHabit = habits.map((habit) => {
      const dates = logsByHabit[String(habit._id)] || [];
      const { current, longest } = calcStreak(dates);
      return {
        habitId: habit._id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        category: habit.category,
        currentStreak: current,
        longestStreak: longest,
        completions30d: dates.length,
      };
    });

    res.json({ perHabit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
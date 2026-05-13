import Habit, { HABIT_CATEGORIES } from "../models/Habit.js";

const normalizeCategory = (value) => {
  if (!value) return undefined;
  const normalized = String(value).trim().toLowerCase();
  const match = HABIT_CATEGORIES.find(
    (category) => category.toLowerCase() === normalized
  );
  return match || "Other";
};

export const createHabit = async (req, res) => {
  try {
    const { name, description, category, frequency, targetDays, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }

    // 1. ADDED: Count existing habits to determine the new habit's order
    const habitCount = await Habit.countDocuments({ userId: req.user._id });

    const habit = await Habit.create({
      userId: req.user._id, 
      name,
      description,
      category: normalizeCategory(category),
      frequency,
      targetDays,
      color,
      icon,
      order: habitCount,
    });

    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHabits = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";
    
    const filter = { userId: req.user._id };
    if (!includeArchived) {
      filter.isArchived = false;
    }

    const habits = await Habit.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found or not authorized" });
    }

    const allowedFields = ['name', 'description', 'category', 'frequency', 'targetDays', 'color', 'icon'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        habit[field] = field === "category"
          ? normalizeCategory(req.body[field])
          : req.body[field];
      }
    });

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found or not authorized" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const archiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found or not authorized" });
    }

    habit.isArchived = !habit.isArchived;
    await habit.save();

    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reorderHabits = async (req, res) => {
  try {
    const { habitIds } = req.body; 

    if (!habitIds || !Array.isArray(habitIds)) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    const updates = habitIds.map((id, index) =>
      Habit.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { order: index }
      )
    );

    await Promise.all(updates);
    res.json({ message: "Habits reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
package com.selfimprovementtree.backend.service;

import com.selfimprovementtree.backend.model.Habit;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HabitService {
    private final List<Habit> habits = new ArrayList<>();
    private Long idCounter = 1L;

    public List<Habit> getAllHabits() {
        return habits;
    }

    public Habit addHabit(Habit habit) {
        habit.setId(idCounter++);
        habits.add(habit);
        return habit;
    }

    public Optional<Habit> updateHabit(Long id, Habit updatedHabit) {
        for (Habit habit : habits) {
            if (habit.getId().equals(id)) {
                habit.setName(updatedHabit.getName());
                habit.setCompleted(updatedHabit.isCompleted());
                return Optional.of(habit);
            }
        }
        return Optional.empty();
    }
}

package com.selfimprovementtree.backend.controller;

import com.selfimprovementtree.backend.model.Habit;
import com.selfimprovementtree.backend.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "*") // pozwala frontendowi łączyć się z backendem
public class HabitController {

    @Autowired
    private HabitService habitService;

    @GetMapping
    public List<Habit> getHabits() {
        return habitService.getAllHabits();
    }

    @PostMapping
    public Habit addHabit(@RequestBody Habit habit) {
        return habitService.addHabit(habit);
    }

    @PutMapping("/{id}")
    public Habit updateHabit(@PathVariable Long id, @RequestBody Habit habit) {
        return habitService.updateHabit(id, habit).orElse(null);
    }
}

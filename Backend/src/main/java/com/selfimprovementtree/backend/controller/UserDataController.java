package com.selfimprovementtree.backend.controller;

import com.selfimprovementtree.backend.service.UserDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/userdata")
@CrossOrigin(origins = "*")
public class UserDataController {

    private final UserDataService service;

    public UserDataController(UserDataService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> get(@PathVariable String id) {
        return service.get(id)
                .map(e -> ResponseEntity.ok(e.getJson()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> put(@PathVariable String id, @RequestBody String json) {
        service.upsert(id, json);
        return ResponseEntity.ok().build();
    }
}

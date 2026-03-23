package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.SupportedCurrency;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/currencies")
@Tag(name = "Currencies", description = "Devises supportées par BizCore")
public class CurrencyController {

    @GetMapping
    @Operation(summary = "Lister toutes les devises supportées")
    public List<Map<String, String>> findAll() {
        return Arrays.stream(SupportedCurrency.values())
                .map(c -> Map.of(
                        "code", c.name(),
                        "label", c.getLabel(),
                        "region", c.getRegion()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/validate/{code}")
    @Operation(summary = "Vérifier si une devise est supportée")
    public ResponseEntity<Map<String, Object>> validate(@PathVariable String code) {
        boolean supported = SupportedCurrency.isSupported(code);
        return ResponseEntity.ok(Map.of(
                "code", code.toUpperCase(),
                "supported", supported,
                "message", supported
                        ? "Devise " + code.toUpperCase() + " supportée"
                        : "Devise " + code.toUpperCase() + " non supportée"
        ));
    }
}
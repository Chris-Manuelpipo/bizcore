package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.SupportedCurrency;
import com.bizcore.bizcore_backend.dto.SupportedCurrencyDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/currencies")
@Tag(name = "Currencies", description = "Devises supportées par BizCore")
public class CurrencyController {

    @GetMapping
    @Operation(summary = "Lister toutes les devises supportées")
    public List<SupportedCurrencyDTO> findAll() {
        return Arrays.stream(SupportedCurrency.values())
                .map(SupportedCurrencyDTO::fromEnum)
                .collect(Collectors.toList());
    }

    @GetMapping("/validate/{code}")
    @Operation(summary = "Vérifier si une devise est supportée")
    public ResponseEntity<SupportedCurrencyDTO> validate(@PathVariable String code) {
        boolean supported = SupportedCurrency.isSupported(code);
        if (supported) {
            SupportedCurrency currency = SupportedCurrency.valueOf(code.toUpperCase());
            return ResponseEntity.ok(SupportedCurrencyDTO.fromEnum(currency));
        }
        return ResponseEntity.notFound().build();
    }
}
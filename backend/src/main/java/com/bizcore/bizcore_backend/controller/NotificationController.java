package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Notification;
import com.bizcore.bizcore_backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Gestion des notifications utilisateurs")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Récupère les notifications paginées de l'utilisateur connecté",
               description = "Liste toutes les notifications de l'utilisateur authentifié avec pagination")
    public Page<Notification> getMyNotifications(
            Authentication authentication,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(authentication.getName());
        return notificationService.getUserNotifications(userId, page, size);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Retourne le nombre de notifications non lues",
               description = "Retourne le nombre total de notifications non lues pour l'utilisateur connecté")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Marque une notification comme lue",
               description = "Marque une notification spécifique comme lue pour l'utilisateur")
    public ResponseEntity<Notification> markAsRead(@Parameter(description = "ID de la notification") @PathVariable UUID notificationId) {
        Notification notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(notification);
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marque toutes les notifications de l'utilisateur comme lues",
               description = "Marque toutes les notifications de l'utilisateur connecté comme lues")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Supprime une notification",
               description = "Supprime définitivement une notification de l'utilisateur")
    public ResponseEntity<Void> deleteNotification(@Parameter(description = "ID de la notification") @PathVariable UUID notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}
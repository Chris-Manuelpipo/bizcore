package com.bizcore.bizcore_backend.controller;

import com.bizcore.bizcore_backend.domain.Message;
import com.bizcore.bizcore_backend.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-requests/{requestId}/messages")
@Tag(name = "Messages", description = "Chat contextuel attaché aux demandes de service")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    @Operation(summary = "Récupère les messages paginés d'une demande de service",
               description = "Liste tous les messages associés à une demande de service avec pagination")
    public Page<Message> getMessages(
            @Parameter(description = "ID de la demande de service") @PathVariable UUID requestId,
            @Parameter(description = "Numéro de page") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page") @RequestParam(defaultValue = "50") int size) {
        return messageService.getMessagesForServiceRequest(requestId, page, size);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Nombre de messages non lus pour cette demande",
               description = "Retourne le nombre de messages non lus par un acteur donné pour une demande de service")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @Parameter(description = "ID de la demande de service") @PathVariable UUID requestId,
            @Parameter(description = "ID de l'acteur") @RequestParam UUID actorId) {
        long count = messageService.getUnreadCount(requestId, actorId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping
    @Operation(summary = "Envoyer un nouveau message dans une demande de service",
               description = "Crée et envoie un nouveau message dans le contexte d'une demande de service")
    public ResponseEntity<Message> sendMessage(
            @Parameter(description = "ID de la demande de service") @PathVariable UUID requestId,
            @Parameter(description = "ID de l'acteur auteur") @RequestParam UUID actorId,
            @RequestBody String content) {
        Message message = messageService.sendMessage(requestId, actorId, content);
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marquer tous les messages de cette demande comme lus",
               description = "Marque tous les messages d'une demande de service comme lus pour un acteur donné")
    public ResponseEntity<Void> markAllAsRead(
            @Parameter(description = "ID de la demande de service") @PathVariable UUID requestId,
            @Parameter(description = "ID de l'acteur") @RequestParam UUID actorId) {
        messageService.markAllAsRead(requestId, actorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Supprimer un message que tu as envoyé",
               description = "Supprime un message existant, uniquement si l'acteur est l'auteur du message")
    public ResponseEntity<Void> deleteMessage(
            @Parameter(description = "ID de la demande de service") @PathVariable UUID requestId,
            @Parameter(description = "ID du message") @PathVariable UUID messageId,
            @Parameter(description = "ID de l'acteur") @RequestParam UUID actorId) {
        messageService.deleteMessage(messageId, actorId);
        return ResponseEntity.noContent().build();
    }
}
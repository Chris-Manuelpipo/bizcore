package com.bizcore.bizcore_backend.listener;

import com.bizcore.bizcore_backend.domain.Notification;
import com.bizcore.bizcore_backend.service.NotificationService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class NotificationKafkaListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationKafkaListener.class);

    private final NotificationService notificationService;

    public NotificationKafkaListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "bizcore.events", groupId = "notification-service")
    public void handleDomainEvent(ConsumerRecord<String, Map<String, Object>> record) {
        try {
            Map<String, Object> event = record.value();
            String eventType = (String) event.get("type");
            
            logger.info("Received event: {}", eventType);

            switch (eventType) {
                case "SERVICE_REQUEST_CREATED":
                    handleServiceRequestCreated(event);
                    break;
                case "SERVICE_REQUEST_ACCEPTED":
                    handleServiceRequestAccepted(event);
                    break;
                case "SERVICE_REQUEST_FULFILLED":
                    handleServiceRequestFulfilled(event);
                    break;
                case "INVOICE_CREATED":
                    handleInvoiceCreated(event);
                    break;
                case "INVOICE_PAID":
                    handleInvoicePaid(event);
                    break;
            }

        } catch (Exception e) {
            logger.error("Error processing notification event", e);
        }
    }

    private void handleServiceRequestCreated(Map<String, Object> event) {
        UUID providerId = UUID.fromString((String) event.get("providerId"));
        UUID requestId = UUID.fromString((String) event.get("requestId"));
        
        notificationService.createNotification(
            providerId,
            Notification.NotificationType.SERVICE_REQUEST_CREATED,
            "Nouvelle demande de service",
            "Vous avez reçu une nouvelle demande de service",
            requestId
        );
    }

    private void handleServiceRequestAccepted(Map<String, Object> event) {
        UUID consumerId = UUID.fromString((String) event.get("consumerId"));
        UUID requestId = UUID.fromString((String) event.get("requestId"));
        
        notificationService.createNotification(
            consumerId,
            Notification.NotificationType.SERVICE_REQUEST_ACCEPTED,
            "Demande acceptée",
            "Votre demande de service a été acceptée par le prestataire",
            requestId
        );
    }

    private void handleServiceRequestFulfilled(Map<String, Object> event) {
        UUID consumerId = UUID.fromString((String) event.get("consumerId"));
        UUID requestId = UUID.fromString((String) event.get("requestId"));
        
        notificationService.createNotification(
            consumerId,
            Notification.NotificationType.SERVICE_REQUEST_FULFILLED,
            "Demande terminée",
            "Votre demande de service a été réalisée",
            requestId
        );
    }

    private void handleInvoiceCreated(Map<String, Object> event) {
        UUID userId = UUID.fromString((String) event.get("userId"));
        UUID invoiceId = UUID.fromString((String) event.get("invoiceId"));
        
        notificationService.createNotification(
            userId,
            Notification.NotificationType.INVOICE_CREATED,
            "Nouvelle facture",
            "Une nouvelle facture vous a été adressée",
            invoiceId
        );
    }

    private void handleInvoicePaid(Map<String, Object> event) {
        UUID providerId = UUID.fromString((String) event.get("providerId"));
        UUID invoiceId = UUID.fromString((String) event.get("invoiceId"));
        
        notificationService.createNotification(
            providerId,
            Notification.NotificationType.INVOICE_PAID,
            "Facture payée",
            "La facture a été payée par le client",
            invoiceId
        );
    }
}
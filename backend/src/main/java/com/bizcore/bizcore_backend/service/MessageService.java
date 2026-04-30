package com.bizcore.bizcore_backend.service;
import com.bizcore.bizcore_backend.domain.Actor;
import com.bizcore.bizcore_backend.domain.Message;
import com.bizcore.bizcore_backend.domain.ServiceRequest;
import com.bizcore.bizcore_backend.repository.ActorRepository;
import com.bizcore.bizcore_backend.repository.MessageRepository;
import com.bizcore.bizcore_backend.repository.ServiceRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ActorRepository actorRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public MessageService(MessageRepository messageRepository,
                          ServiceRequestRepository serviceRequestRepository,
                          ActorRepository actorRepository,
                          RedisTemplate<String, Object> redisTemplate) {
        this.messageRepository = messageRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.actorRepository = actorRepository;
        this.redisTemplate = redisTemplate;
    }

    public Page<Message> getMessagesForServiceRequest(UUID requestId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        return messageRepository.findByServiceRequestId(requestId, pageable);
    }

    public long getUnreadCount(UUID requestId, UUID actorId) {
        return messageRepository.countUnreadByServiceRequestIdAndActorId(requestId, actorId);
    }

    public Message sendMessage(UUID requestId, UUID senderActorId, String content) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service Request not found"));

        Actor sender = actorRepository.findById(senderActorId)
                .orElseThrow(() -> new RuntimeException("Actor not found"));

        // Verify sender is participant in this request
        if (!request.getConsumer().getId().equals(senderActorId) && !request.getProvider().getId().equals(senderActorId)) {
            throw new RuntimeException("You are not participant of this service request");
        }

        Message message = new Message(request, sender, content);
        Message saved = messageRepository.save(message);

        // Publish message to Redis Pub/Sub for realtime
        redisTemplate.convertAndSend("messages:" + requestId, saved);

        return saved;
    }

    public void markAllAsRead(UUID requestId, UUID actorId) {
        messageRepository.markAllAsReadForServiceRequestAndActor(requestId, actorId);
    }

    public void deleteMessage(UUID messageId, UUID actorId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(actorId)) {
            throw new RuntimeException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }
}
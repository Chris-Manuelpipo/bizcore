package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.domain.Business;
import com.bizcore.bizcore_backend.domain.Media;
import com.bizcore.bizcore_backend.exception.ResourceNotFoundException;
import com.bizcore.bizcore_backend.repository.BusinessRepository;
import com.bizcore.bizcore_backend.repository.MediaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final BusinessRepository businessRepository;

    public MediaService(MediaRepository mediaRepository, BusinessRepository businessRepository) {
        this.mediaRepository = mediaRepository;
        this.businessRepository = businessRepository;
    }

    public List<Media> findAll() {
        return mediaRepository.findAll();
    }

    public Optional<Media> findById(UUID id) {
        return mediaRepository.findById(id);
    }

    public List<Media> findByBusinessId(UUID businessId) {
        return mediaRepository.findByBusinessId(businessId);
    }

    public List<Media> findByType(String type) {
        return mediaRepository.findByType(type);
    }

    public Media save(UUID businessId, Media media) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", businessId.toString()));
        media.setBusiness(business);
        return mediaRepository.save(media);
    }

    public Media update(UUID id, Media updated) {
        Media existing = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media", id.toString()));
        existing.setName(updated.getName());
        existing.setUrl(updated.getUrl());
        existing.setType(updated.getType());
        existing.setDescription(updated.getDescription());
        return mediaRepository.save(existing);
    }

    public void deleteById(UUID id) {
        mediaRepository.deleteById(id);
    }
}

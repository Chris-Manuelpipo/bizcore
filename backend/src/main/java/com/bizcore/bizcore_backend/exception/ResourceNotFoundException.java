package com.bizcore.bizcore_backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String id) {
        super(resource + " non trouvé(e) avec l'id : " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
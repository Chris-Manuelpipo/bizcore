package com.bizcore.bizcore_backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

public final class ApiKeyHasher {

    public static final String KEY_PREFIX = "bcs_live_";

    private static final SecureRandom RANDOM = new SecureRandom();

    private ApiKeyHasher() {}

    public static String generateRawKey() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return KEY_PREFIX + HexFormat.of().formatHex(bytes);
    }

    public static String extractLookupPrefix(String rawKey) {
        if (rawKey == null || rawKey.length() < 16) return rawKey;
        return rawKey.substring(0, 16);
    }

    public static String hash(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }

    public static boolean matches(String rawKey, String storedHash) {
        return hash(rawKey).equals(storedHash);
    }

    public static boolean isApiKey(String value) {
        return value != null && value.startsWith(KEY_PREFIX);
    }
}

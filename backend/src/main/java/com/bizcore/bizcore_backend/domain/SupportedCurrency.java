package com.bizcore.bizcore_backend.domain;

public enum SupportedCurrency {

    XAF("Franc CFA BEAC", "Cameroun, Congo, Gabon..."),
    XOF("Franc CFA BCEAO", "Sénégal, Côte d'Ivoire..."),
    NGN("Naira", "Nigeria"),
    KES("Shilling kenyan", "Kenya"),
    GHS("Cedi", "Ghana"),
    USD("Dollar américain", "International"),
    EUR("Euro", "International"),
    GBP("Livre sterling", "Royaume-Uni");

    private final String label;
    private final String region;

    SupportedCurrency(String label, String region) {
        this.label = label;
        this.region = region;
    }

    public String getLabel() { return label; }
    public String getRegion() { return region; }

    public static boolean isSupported(String code) {
        for (SupportedCurrency c : values()) {
            if (c.name().equalsIgnoreCase(code)) return true;
        }
        return false;
    }
}
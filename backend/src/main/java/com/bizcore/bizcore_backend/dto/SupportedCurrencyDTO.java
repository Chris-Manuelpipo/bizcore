package com.bizcore.bizcore_backend.dto;

import com.bizcore.bizcore_backend.domain.SupportedCurrency;

public class SupportedCurrencyDTO {

    private String code;
    private String name;
    private String symbol;
    private String region;
    private Boolean isActive;

    public SupportedCurrencyDTO() {}

    public static SupportedCurrencyDTO fromEnum(SupportedCurrency currency) {
        SupportedCurrencyDTO dto = new SupportedCurrencyDTO();
        dto.setCode(currency.name());
        dto.setName(currency.getLabel());
        dto.setSymbol(getSymbol(currency));
        dto.setRegion(currency.getRegion());
        dto.setIsActive(true);
        return dto;
    }

    private static String getSymbol(SupportedCurrency currency) {
        return switch (currency) {
            case XAF, XOF -> "FCFA";
            case NGN -> "₦";
            case KES -> "KSh";
            case GHS -> "₵";
            case USD -> "$";
            case EUR -> "€";
            case GBP -> "£";
        };
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
